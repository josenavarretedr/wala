import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SESSIONS_DATA } from '@/data/sessionsData';
import {
  getSessionProgress,
  saveSessionProgress,
  saveBusinessPlanSection,
  getBusinessPlanSection,
  getParticipant,
  saveParticipant
} from '@/services/db/indexedDB';
import { enqueueMutation } from '@/services/sync/syncQueue';
import { listenParticipantSessionProgress } from '@/services/db/firestore';
import { useAuthStore } from './auth';
import { usePlanStore } from './plan';

export const useSessionStore = defineStore('sessions', () => {
  const progressMap = ref({});
  const formAnswersMap = ref({});
  const isLoading = ref(false);
  const error = ref(null);

  // Progreso general calculado en base a las 8 sesiones
  const overallProgressPercentage = computed(() => {
    let completed = 0;
    for (let i = 1; i <= 8; i++) {
      if (progressMap.value[i]?.state === 'completado') {
        completed++;
      }
    }
    return Math.round((completed / 8) * 100);
  });

  const completedSessionsCount = computed(() => {
    let count = 0;
    for (let i = 1; i <= 8; i++) {
      if (progressMap.value[i]?.state === 'completado') count++;
    }
    return count;
  });

  const currentActiveSessionId = computed(() => {
    for (let i = 1; i <= 8; i++) {
      if (progressMap.value[i]?.state === 'en_progreso') return i;
    }
    for (let i = 8; i >= 1; i--) {
      if (progressMap.value[i]?.state === 'completado') return i;
    }
    return 1;
  });

  /**
   * Carga o inicializa el progreso de las 8 sesiones desde IndexedDB
   */
  async function loadSessionsProgress(participantId) {
    if (!participantId) return;
    isLoading.value = true;
    error.value = null;

    try {
      const newProgressMap = {};
      const newFormAnswersMap = {};

      for (const sessionMeta of SESSIONS_DATA) {
        const sId = sessionMeta.id;
        let prog = await getSessionProgress(participantId, sId);

        if (!prog) {
          // Si no existe, crear registro inicial
          const isFirstSession = sId === 1;
          prog = {
            id: `${participantId}_${sId}`,
            participantId: String(participantId),
            sessionId: sId,
            sessionCode: sessionMeta.sessionCode,
            state: isFirstSession ? 'en_progreso' : 'bloqueado',
            gatekeeping: {
              microlearningCompleted: false,
              microlearningCompletedAt: null,
              quizUnlocked: false,
              formUnlocked: false
            },
            quizAssessment: {
              passed: false,
              maxAttemptsAllowed: null,
              totalAttempts: 0,
              bestScore: 0,
              lastAttemptAt: null,
              attemptsHistory: []
            },
            formSubmission: {
              isCompleted: false,
              submittedAt: null
            }
          };
          await saveSessionProgress(prog);
        }

        newProgressMap[sId] = prog;

        // Cargar respuestas guardadas del formulario si existen
        const savedSection = await getBusinessPlanSection(participantId, sId, sessionMeta.sessionCode.toLowerCase());
        if (savedSection && savedSection.fields) {
          const flatAnswers = {};
          for (const [key, fieldObj] of Object.entries(savedSection.fields)) {
            flatAnswers[key] = fieldObj.rawInput?.text || '';
          }
          newFormAnswersMap[sId] = flatAnswers;
        }
      }

      // Aplicar reglas de Gatekeeping secuencial
      for (let sId = 2; sId <= 8; sId++) {
        const prevProg = newProgressMap[sId - 1];
        const currProg = newProgressMap[sId];

        const prevIsComplete =
          prevProg.state === 'completado' ||
          (prevProg.quizAssessment.passed && prevProg.formSubmission.isCompleted);

        if (prevIsComplete && currProg.state === 'bloqueado') {
          currProg.state = 'en_progreso';
          await saveSessionProgress(currProg);
        }
      }

      progressMap.value = newProgressMap;
      formAnswersMap.value = newFormAnswersMap;
    } catch (err) {
      console.error('[SessionStore] Error al cargar progreso:', err);
      error.value = 'No se pudo cargar el progreso de las sesiones.';
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Completa el microaprendizaje de una sesión y desbloquea el Quiz
   */
  async function completeMicrolearning(participantId, sessionId) {
    const prog = progressMap.value[sessionId];
    if (!prog) return;

    prog.gatekeeping.microlearningCompleted = true;
    prog.gatekeeping.microlearningCompletedAt = new Date().toISOString();
    prog.gatekeeping.quizUnlocked = true;

    await saveSessionProgress(prog);
    await enqueueMutation({
      collection: 'session_progress',
      docId: `${participantId}_S${sessionId}`,
      action: 'SET',
      payload: prog
    });
  }

  /**
   * Registra un intento de Quiz y si logra 100% desbloquea el formulario
   */
  async function recordQuizAttempt(participantId, sessionId, { answers, score, passed }) {
    const prog = progressMap.value[sessionId];
    if (!prog) return;

    const now = new Date().toISOString();
    const attemptNumber = (prog.quizAssessment.totalAttempts || 0) + 1;

    const attemptEntry = {
      attemptNumber,
      score,
      passed,
      attemptAt: now,
      answers
    };

    prog.quizAssessment.totalAttempts = attemptNumber;
    prog.quizAssessment.lastAttemptAt = now;
    prog.quizAssessment.bestScore = Math.max(prog.quizAssessment.bestScore || 0, score);
    prog.quizAssessment.attemptsHistory.push(attemptEntry);

    if (score >= 100) {
      prog.quizAssessment.passed = true;
      prog.gatekeeping.formUnlocked = true;
    }

    await saveSessionProgress(prog);
    await enqueueMutation({
      collection: 'session_progress',
      docId: `${participantId}_S${sessionId}`,
      action: 'SET',
      payload: prog
    });
    return { attemptNumber, passed: prog.quizAssessment.passed, bestScore: prog.quizAssessment.bestScore };
  }

  /**
   * Guarda las respuestas del formulario, marca la sesión como completada y desbloquea la siguiente
   */
  async function submitFormSection(participantId, sessionId, rawFormData) {
    const prog = progressMap.value[sessionId];
    if (!prog) return { success: false, message: 'Sesión no encontrada.' };

    const sessionMeta = SESSIONS_DATA.find((s) => s.id === Number(sessionId));
    if (!sessionMeta) return { success: false, message: 'Metadata no encontrada.' };

    const now = new Date().toISOString();

    // 1. Estructurar sección según schema.json (business_plan_sections)
    const sessionCodeMap = {
      1: 's1_identidad_negocio',
      2: 's2_planeamiento_estrategico',
      3: 's3_cliente_propuesta_valor',
      4: 's4_estrategia_comercial',
      5: 's5_modelo_negocio_canvas',
      6: 's6_costeo_directo_recetas',
      7: 's7_presupuesto_capital_semilla',
      8: 's8_evaluacion_integral_cierre'
    };
    const sectionKey = sessionCodeMap[sessionId] || sessionMeta.sessionCode.toLowerCase();
    const formattedFields = {};
    const existingSection = await getBusinessPlanSection(participantId, sessionId, sectionKey);

    for (const [key, value] of Object.entries(rawFormData)) {
      const fieldDef = sessionMeta.formFields.find((f) => f.id === key);
      const existingField = existingSection?.fields?.[key];

      let consultantNotes = existingField?.consultantNotes || existingField?.consultantReview?.feedbackNotes || '';
      let aiRefinement = existingField?.aiRefinement || null;
      let finalApprovedText = existingField?.consultantReview?.finalApprovedText || null;
      let reviewStatus = existingField?.consultantReview?.status || 'pendiente_revision';

      try {
        const planStore = usePlanStore();
        const storeField = planStore.getDualField(sessionId, key);
        if (storeField?.consultantNotes) {
          consultantNotes = storeField.consultantNotes;
        }
        if (storeField?.aiRefinement) {
          aiRefinement = {
            model: 'gemini-3.6-flash',
            refinedText: storeField.aiRefinement,
            generatedAt: existingField?.aiRefinement?.generatedAt || now
          };
        }
        if (storeField?.finalApprovedText) {
          finalApprovedText = storeField.finalApprovedText;
        }
        if (storeField?.status) {
          reviewStatus = storeField.status;
        }

        // Al enviar el formulario de la sesión, los campos en 'borrador' pasan a 'pendiente_revision'
        if (reviewStatus === 'borrador') {
          reviewStatus = 'pendiente_revision';
          planStore.saveDualField(participantId, sessionId, sectionKey, key, {
            rawInput: String(value || ''),
            consultantNotes,
            aiRefinement: storeField?.aiRefinement || '',
            finalApprovedText,
            status: 'pendiente_revision'
          }, fieldDef?.label || key);
        }
      } catch (e) {
        // Si no está disponible planStore, mantener datos existentes
        if (reviewStatus === 'borrador') {
          reviewStatus = 'pendiente_revision';
        }
      }

      formattedFields[key] = {
        fieldLabel: fieldDef?.label || key,
        rawInput: {
          text: String(value || ''),
          capturedVia: 'text',
          createdAt: existingField?.rawInput?.createdAt || now
        },
        consultantNotes,
        aiRefinement,
        status: reviewStatus,
        finalApprovedText,
        consultantReview: {
          status: reviewStatus,
          finalApprovedText,
          reviewedBy: existingField?.consultantReview?.reviewedBy || null,
          reviewedAt: existingField?.consultantReview?.reviewedAt || null,
          feedbackNotes: consultantNotes || existingField?.consultantReview?.feedbackNotes || null
        }
      };
    }

    const sectionRecord = {
      participantId: String(participantId),
      sessionId: Number(sessionId),
      sectionKey,
      fields: formattedFields
    };

    await saveBusinessPlanSection(sectionRecord);
    formAnswersMap.value[sessionId] = { ...rawFormData };

    // 2. Si es Sesión 1, actualizar los datos base del participante
    const authStore = useAuthStore();
    const currentPart = await getParticipant(participantId);

    if (sessionId === 1 && currentPart) {
      if (rawFormData.firstName) currentPart.personalInfo.firstName = rawFormData.firstName;
      if (rawFormData.lastName) currentPart.personalInfo.lastName = rawFormData.lastName;
      if (rawFormData.address) currentPart.personalInfo.location.address = rawFormData.address;
      if (rawFormData.commercialName) currentPart.businessBasicInfo.commercialName = rawFormData.commercialName;
      if (rawFormData.businessNature) {
        currentPart.businessBasicInfo.businessNature = rawFormData.businessNature;
        try {
          const { useCostingStore } = await import('./costing');
          const costingStore = useCostingStore();
          await costingStore.applyBusinessNatureFromS1(rawFormData.businessNature);
        } catch (e) {
          console.warn('[SessionsStore] Error al sincronizar naturaleza con costingStore:', e);
        }
      }
      if (rawFormData.sector) currentPart.businessBasicInfo.sector = rawFormData.sector;
      if (rawFormData.subSector) currentPart.businessBasicInfo.subSector = rawFormData.subSector;
      if (rawFormData.operatingStatus) currentPart.businessBasicInfo.operatingStatus = rawFormData.operatingStatus;

      await saveParticipant(currentPart);
      authStore.currentParticipant = currentPart;
    }

    // 3. Completar la sesión actual
    prog.formSubmission.isCompleted = true;
    prog.formSubmission.submittedAt = now;
    prog.state = 'completado';
    await saveSessionProgress(prog);
    await enqueueMutation({
      collection: 'session_progress',
      docId: `${participantId}_S${sessionId}`,
      action: 'SET',
      payload: prog
    });

    // 4. Gatekeeping: Desbloquear la sesión siguiente N+1
    const nextSessionId = Number(sessionId) + 1;
    if (nextSessionId <= 8 && progressMap.value[nextSessionId]) {
      const nextProg = progressMap.value[nextSessionId];
      if (nextProg.state === 'bloqueado') {
        nextProg.state = 'en_progreso';
        await saveSessionProgress(nextProg);
        await enqueueMutation({
          collection: 'session_progress',
          docId: `${participantId}_S${nextSessionId}`,
          action: 'SET',
          payload: nextProg
        });
      }
    }

    // 5. Actualizar el porcentaje global y sesión actual en el perfil del participante
    if (currentPart) {
      let completedCount = 0;
      for (let i = 1; i <= 8; i++) {
        if (progressMap.value[i]?.state === 'completado') completedCount++;
      }
      currentPart.programStatus.overallProgressPercentage = Math.round((completedCount / 8) * 100);
      currentPart.programStatus.currentSession = Math.min(nextSessionId, 8);
      await saveParticipant(currentPart);
      authStore.currentParticipant = currentPart;

      await enqueueMutation({
        collection: 'participants',
        docId: String(participantId),
        action: 'SET',
        payload: currentPart
      });
    }

    // 6. Encolar en la cola de sincronización offline (business_plan_sections)
    await enqueueMutation({
      collection: 'business_plan_sections',
      docId: `${participantId}_${sectionKey}`,
      action: 'SET',
      payload: sectionRecord
    });

    return { success: true };
  }

  function getSessionProgressData(sessionId) {
    return progressMap.value[sessionId] || null;
  }

  function getFormAnswers(sessionId) {
    return formAnswersMap.value[sessionId] || {};
  }

  function isSessionUnlocked(sessionId) {
    const prog = progressMap.value[sessionId];
    return prog ? prog.state !== 'bloqueado' : sessionId === 1;
  }

  function isSessionCompleted(sessionId) {
    return progressMap.value[sessionId]?.state === 'completado';
  }

  // Listener en tiempo real de progreso de sesiones para el participante
  const activeSessionListenerDni = ref(null);
  let unsubParticipantSessions = null;

  function startParticipantProgressListener(dni) {
    if (!dni || activeSessionListenerDni.value === dni) return;
    if (unsubParticipantSessions) {
      unsubParticipantSessions();
      unsubParticipantSessions = null;
    }
    activeSessionListenerDni.value = dni;

    unsubParticipantSessions = listenParticipantSessionProgress(
      dni,
      async (progressList) => {
        for (const prog of progressList) {
          const sId = Number(prog.sessionId);
          if (!sId) continue;
          await saveSessionProgress({
            ...prog,
            id: `${dni}_${sId}`,
            participantId: String(dni),
            sessionId: sId
          });
          progressMap.value[sId] = {
            ...(progressMap.value[sId] || {}),
            ...prog
          };
        }
      },
      (err) => {
        console.warn('[SessionStore] Error en listener de progreso de sesiones:', err);
      }
    );
  }

  function stopParticipantProgressListener() {
    if (unsubParticipantSessions) {
      unsubParticipantSessions();
      unsubParticipantSessions = null;
    }
    activeSessionListenerDni.value = null;
  }

  return {
    progressMap,
    formAnswersMap,
    isLoading,
    error,
    overallProgressPercentage,
    completedSessionsCount,
    currentActiveSessionId,
    loadSessionsProgress,
    completeMicrolearning,
    recordQuizAttempt,
    submitFormSection,
    getSessionProgressData,
    getFormAnswers,
    isSessionUnlocked,
    isSessionCompleted,
    startParticipantProgressListener,
    stopParticipantProgressListener
  };
});
