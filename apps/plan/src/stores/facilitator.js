import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import {
  listenCohortParticipants,
  listenCohortSessionProgress,
  getPlanSectionDoc,
  approvePlanSectionAndSession,
  savePlanSectionReview,
  createSingleParticipant,
  getCostingModuleDoc,
  saveCostingModule,
  saveCohortDoc,
  getCohortDoc,
  listenCohortDoc,
  listenAllCohorts,
  transferParticipantCohortFirestore,
  deleteParticipantFirestore
} from '@/services/db/firestore';
import {
  transferParticipantCohortLocal,
  deleteParticipantLocal
} from '@/services/db/indexedDB';
import { refineBusinessText } from '@/services/api/aiService';
import {
  getCurrentFacilitator,
  subscribeToFacilitatorAuth,
  signOutFacilitator
} from '@/services/auth/facilitatorAuth';
import { SESSIONS_DATA } from '@/data/sessionsData';
import { useCostingCalculator } from '@/composables/useCostingCalculator';

const STORED_COHORT_KEY = 'emprendeapp_facilitator_cohort';
const STORED_COHORTS_LIST_KEY = 'emprendeapp_available_cohorts';
const STORED_COHORTS_CONFIG_KEY = 'emprendeapp_cohorts_config';

const DEFAULT_COHORTS = [
  'OIT-CHICLAYO-01',
  'ACNUR-LIMA-02',
  'COHORTE-LOCAL-OFFLINE'
];

const DEFAULT_COHORTS_CONFIG = {
  'OIT-CHICLAYO-01': { cohortId: 'OIT-CHICLAYO-01', name: 'OIT-CHICLAYO-01', seedCapitalCeiling: 3000.0 },
  'ACNUR-LIMA-02': { cohortId: 'ACNUR-LIMA-02', name: 'ACNUR-LIMA-02', seedCapitalCeiling: 2000.0 },
  'COHORTE-LOCAL-OFFLINE': { cohortId: 'COHORTE-LOCAL-OFFLINE', name: 'COHORTE-LOCAL-OFFLINE', seedCapitalCeiling: 1500.0 }
};

const SESSION_SECTION_KEY_MAP = {
  1: { key: 's1_identidad_negocio', field: 'businessStory', title: 'Identidad del Negocio' },
  2: { key: 's2_planeamiento_estrategico', field: 'mision', title: 'Planeamiento Estratégico (Misión/Visión)' },
  3: { key: 's3_cliente_propuesta_valor', field: 'valueProposition', title: 'Propuesta de Valor y Cliente' },
  4: { key: 's4_estrategia_comercial', field: 'promotionStrategy', title: 'Estrategia Comercial (4P)' },
  5: { key: 's5_modelo_negocio_canvas', field: 'valueProposition', title: 'Lienzo de Negocio Canvas' },
  6: { key: 's6_costeo_directo_recetas', field: 'costingSummary', title: 'Costeo Unitario y Márgenes' },
  7: { key: 's7_presupuesto_capital_semilla', field: 'investmentJustification', title: 'Presupuesto de Capital Semilla' },
  8: { key: 's8_evaluacion_integral_cierre', field: 'executiveSummary', title: 'Consolidación y Resumen Ejecutivo' }
};

export const useFacilitatorStore = defineStore('facilitator', () => {
  const calc = useCostingCalculator();

  // Facilitador autenticado
  const facilitatorUser = ref(getCurrentFacilitator());
  const isAuthReady = ref(false);

  // Cohorte activa, listado y configuraciones
  const activeCohortId = ref(localStorage.getItem(STORED_COHORT_KEY) || 'OIT-CHICLAYO-01');
  const availableCohorts = ref(loadStoredCohorts());
  const cohortsConfig = ref(loadStoredCohortsConfig());

  // Techo dinámico de capital semilla de la cohorte activa
  const activeCohortCeiling = computed(() => {
    return cohortsConfig.value[activeCohortId.value]?.seedCapitalCeiling ?? 3000.0;
  });

  // Datos en tiempo real de la cohorte
  const participants = ref([]);
  const progressMap = ref({}); // Indexado por `${dni}_S${sessionId}`
  const isLoadingCohort = ref(false);
  const cohortError = ref(null);

  // Desuscriptores de Firestore
  let unsubParticipants = null;
  let unsubProgress = null;
  let unsubCohortDoc = null;
  let unsubAllCohorts = null;
  let unsubAuth = null;

  // Filtros de la tabla
  const searchQuery = ref('');
  const focusedSession = ref(null); // null = todas (S1 a S8), o 1..8
  const statusFilter = ref('all'); // 'all' | 'pending_review' | 'behind' | 'completed'

  // Estado del Cajón de Auditoría Rápida (ReviewDrawer)
  const isDrawerOpen = ref(false);
  const selectedParticipant = ref(null);
  const selectedSessionId = ref(null);
  const selectedSectionData = ref({
    rawInput: '',
    aiRefinement: '',
    finalApprovedText: '',
    status: 'pendiente_revision',
    fieldKey: '',
    sectionKey: '',
    sectionTitle: '',
    fields: []
  });
  const isLoadingSectionData = ref(false);
  const isSavingApproval = ref(false);
  const isSavingDraft = ref(false);
  const refiningFields = ref({}); // { [fieldId]: boolean }
  const drawerNotification = ref(null);

  // Estado especializado para revisión de Costeo (S6) e Inversión (S7)
  const selectedCostingData = ref({
    products: [],
    serviceLaborSettings: null,
    activeProductIndex: 0
  });

  const selectedInvestmentData = ref({
    seedCapitalInvestmentPlan: null,
    rubros: { rubro_a: [], rubro_b: [], rubro_c: [] },
    ceiling: 3000,
    allocatedSeedCapital: 0,
    ownContribution: 0,
    totalBusinessInvestment: 0,
    remainingBudget: 3000,
    isBudgetCompliant: true
  });

  function loadStoredCohorts() {
    try {
      const stored = localStorage.getItem(STORED_COHORTS_LIST_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error leyendo cohortes almacenadas:', e);
    }
    return DEFAULT_COHORTS;
  }

  function saveStoredCohorts() {
    try {
      localStorage.setItem(STORED_COHORTS_LIST_KEY, JSON.stringify(availableCohorts.value));
    } catch (e) {
      console.warn('Error guardando cohortes:', e);
    }
  }

  function loadStoredCohortsConfig() {
    try {
      const stored = localStorage.getItem(STORED_COHORTS_CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_COHORTS_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error leyendo configuración de cohortes:', e);
    }
    return { ...DEFAULT_COHORTS_CONFIG };
  }

  function saveStoredCohortsConfig() {
    try {
      localStorage.setItem(STORED_COHORTS_CONFIG_KEY, JSON.stringify(cohortsConfig.value));
    } catch (e) {
      console.warn('Error guardando configuración de cohortes:', e);
    }
  }

  // ==========================================================================
  // COMPUTED: ESTADO DE CELDAS Y SEMÁFORO
  // ==========================================================================

  /**
   * Obtiene el progreso de una sesión para un DNI dado
   */
  function getSessionProgress(dni, sessionId) {
    const key = `${dni}_S${sessionId}`;
    return progressMap.value[key] || null;
  }

  /**
   * Evalúa el color y estado del semáforo para una celda (DNI y Sesión)
   * Estados retornados: 'completado' (🟩), 'pendiente_revision' (🟨), 'en_progreso' (🟦), 'bloqueado' (⬜)
   */
  function getCellStatus(dni, sessionId) {
    const prog = getSessionProgress(dni, sessionId);
    if (!prog) {
      return sessionId === 1 ? 'en_progreso' : 'bloqueado';
    }

    // 1. Si está explícitamente completado y aprobado
    if (prog.formSubmission?.isApproved || (prog.state === 'completado' && !prog.isFlaggedForReview)) {
      return 'completado';
    }

    // 2. Si completó el formulario o aprobó el quiz pero está pendiente de revisión del consultor
    if (
      prog.formSubmission?.isCompleted ||
      (prog.quizAssessment?.passed && prog.state === 'en_progreso') ||
      prog.state === 'pendiente_revision'
    ) {
      return 'pendiente_revision';
    }

    // 3. Si la sesión está en progreso
    if (prog.state === 'en_progreso') {
      return 'en_progreso';
    }

    return 'bloqueado';
  }

  /**
   * Cuenta cuántas sesiones tiene completadas un participante
   */
  function getCompletedSessionsCount(dni) {
    let count = 0;
    for (let s = 1; s <= 8; s++) {
      if (getCellStatus(dni, s) === 'completado') count++;
    }
    return count;
  }

  /**
   * Indica si un participante tiene al menos una sesión pendiente de revisión
   */
  function hasPendingReview(dni) {
    for (let s = 1; s <= 8; s++) {
      if (getCellStatus(dni, s) === 'pendiente_revision') return true;
    }
    return false;
  }

  // Lista filtrada de participantes según búsqueda, filtro de estado y foco de sesión
  const filteredParticipants = computed(() => {
    let list = [...participants.value];

    // Filtro por texto de búsqueda (DNI, nombres, apellidos o negocio)
    const queryStr = searchQuery.value.trim().toLowerCase();
    if (queryStr) {
      list = list.filter((p) => {
        const dni = String(p.dni || '').toLowerCase();
        const firstName = String(p.personalInfo?.firstName || '').toLowerCase();
        const lastName = String(p.personalInfo?.lastName || '').toLowerCase();
        const business = String(p.businessBasicInfo?.commercialName || '').toLowerCase();
        const nature = String(p.businessBasicInfo?.businessNature || '').toLowerCase();
        const sector = String(p.businessBasicInfo?.sector || '').toLowerCase();

        return (
          dni.includes(queryStr) ||
          firstName.includes(queryStr) ||
          lastName.includes(queryStr) ||
          business.includes(queryStr) ||
          nature.includes(queryStr) ||
          sector.includes(queryStr)
        );
      });
    }

    // Filtro por estado
    if (statusFilter.value === 'pending_review') {
      list = list.filter((p) => {
        if (focusedSession.value) {
          return getCellStatus(p.dni, focusedSession.value) === 'pendiente_revision';
        }
        return hasPendingReview(p.dni);
      });
    } else if (statusFilter.value === 'behind') {
      // Rezagados: están en sesión 1 o 2 con 0 o 1 sesión completada
      list = list.filter((p) => {
        const completed = getCompletedSessionsCount(p.dni);
        return completed <= 1;
      });
    } else if (statusFilter.value === 'completed') {
      // Completados: tienen las 8 sesiones completadas
      list = list.filter((p) => getCompletedSessionsCount(p.dni) === 8);
    }

    return list;
  });

  // Métricas generales de la cohorte
  const cohortMetrics = computed(() => {
    const total = participants.value.length;
    if (total === 0) {
      return {
        totalParticipants: 0,
        pendingReviewsCount: 0,
        completedPlansCount: 0,
        averageProgress: 0
      };
    }

    let totalPending = 0;
    let completedPlans = 0;
    let totalCompletedSessions = 0;

    participants.value.forEach((p) => {
      let partCompleted = 0;
      for (let s = 1; s <= 8; s++) {
        const status = getCellStatus(p.dni, s);
        if (status === 'completado') partCompleted++;
        if (status === 'pendiente_revision') totalPending++;
      }
      totalCompletedSessions += partCompleted;
      if (partCompleted === 8) completedPlans++;
    });

    const averageProgress = Math.round((totalCompletedSessions / (total * 8)) * 100);

    return {
      totalParticipants: total,
      pendingReviewsCount: totalPending,
      completedPlansCount: completedPlans,
      averageProgress
    };
  });

  // ==========================================================================
  // MÉTODOS DE COHORTE Y TIEMPO REAL
  // ==========================================================================

  /**
   * Inicia los observadores en tiempo real para la cohorte activa
   */
  function startCohortRealtimeListeners() {
    // Cancelar listeners previos si existen
    if (unsubParticipants) unsubParticipants();
    if (unsubProgress) unsubProgress();
    if (unsubCohortDoc) unsubCohortDoc();
    if (unsubAllCohorts) unsubAllCohorts();

    isLoadingCohort.value = true;
    cohortError.value = null;

    // 1. Escuchar participantes de la cohorte activa
    unsubParticipants = listenCohortParticipants(
      activeCohortId.value,
      (newList) => {
        participants.value = newList;
        isLoadingCohort.value = false;
      },
      (err) => {
        cohortError.value = 'Error al sincronizar participantes en tiempo real.';
        isLoadingCohort.value = false;
      }
    );

    // 2. Escuchar progreso de sesiones
    unsubProgress = listenCohortSessionProgress(
      activeCohortId.value,
      (newProgress) => {
        const map = {};
        newProgress.forEach((item) => {
          const key = `${item.participantId}_S${item.sessionId}`;
          map[key] = item;
        });
        progressMap.value = map;
      },
      (err) => {
        console.warn('Error al sincronizar progreso de sesiones:', err);
      }
    );

    // 3. Escuchar la configuración del documento de la cohorte activa en Firestore
    unsubCohortDoc = listenCohortDoc(
      activeCohortId.value,
      (cohortDoc) => {
        if (cohortDoc) {
          const cId = activeCohortId.value;
          cohortsConfig.value[cId] = {
            ...(cohortsConfig.value[cId] || {}),
            ...cohortDoc,
            cohortId: cId,
            seedCapitalCeiling: Number(cohortDoc.seedCapitalCeiling) || 3000.0
          };
          saveStoredCohortsConfig();
        }
      },
      (err) => {
        console.warn('Error escuchando configuración de cohorte activa:', err);
      }
    );

    // 4. Escuchar todas las cohortes para mantener actualizado el selector
    unsubAllCohorts = listenAllCohorts(
      (allCohortsList) => {
        if (Array.isArray(allCohortsList) && allCohortsList.length > 0) {
          allCohortsList.forEach((cDoc) => {
            const cId = String(cDoc.cohortId || cDoc.id).trim().toUpperCase();
            if (!availableCohorts.value.includes(cId)) {
              availableCohorts.value.push(cId);
            }
            cohortsConfig.value[cId] = {
              ...(cohortsConfig.value[cId] || {}),
              ...cDoc,
              cohortId: cId,
              seedCapitalCeiling: Number(cDoc.seedCapitalCeiling) || 3000.0
            };
          });
          saveStoredCohorts();
          saveStoredCohortsConfig();
        }
      },
      (err) => {
        console.warn('Error escuchando lista general de cohortes:', err);
      }
    );
  }

  /**
   * Cambia la cohorte activa y reanuda la sincronización reactiva
   */
  function switchCohort(newCohortId) {
    if (!newCohortId || newCohortId === activeCohortId.value) return;
    activeCohortId.value = newCohortId;
    localStorage.setItem(STORED_COHORT_KEY, newCohortId);
    startCohortRealtimeListeners();
  }

  /**
   * Actualiza dinámicamente el techo de capital semilla de una cohorte
   * Persiste en Firestore y en almacenamiento local offline
   */
  async function updateCohortCeiling(cohortId, newCeiling) {
    const cleanId = String(cohortId || activeCohortId.value).trim().toUpperCase();
    const ceilingVal = Math.max(0, Number(newCeiling) || 3000.0);

    if (!cohortsConfig.value[cleanId]) {
      cohortsConfig.value[cleanId] = { cohortId: cleanId, name: cleanId, seedCapitalCeiling: ceilingVal };
    } else {
      cohortsConfig.value[cleanId].seedCapitalCeiling = ceilingVal;
    }
    saveStoredCohortsConfig();

    try {
      await saveCohortDoc(cleanId, {
        name: cleanId,
        seedCapitalCeiling: ceilingVal
      });
    } catch (err) {
      console.warn('[FacilitatorStore] Error persistiendo techo de cohorte en Firestore:', err);
    }

    // Si el drawer de auditoría para S7 está abierto para un participante de esta cohorte, recalcular
    if (isDrawerOpen.value && Number(selectedSessionId.value) === 7 && selectedInvestmentData.value) {
      selectedInvestmentData.value.ceiling = ceilingVal;
      recomputeSelectedInvestmentData();
    }
  }

  /**
   * Agrega una nueva cohorte con su techo de capital semilla y la selecciona automáticamente
   */
  async function addCohort(newCohortName, seedCapitalCeiling = 3000) {
    const clean = String(newCohortName || '').trim().toUpperCase().replace(/\s+/g, '-');
    if (!clean) return;
    const ceilingVal = Math.max(0, Number(seedCapitalCeiling) || 3000.0);

    if (!availableCohorts.value.includes(clean)) {
      availableCohorts.value.push(clean);
      saveStoredCohorts();
    }

    cohortsConfig.value[clean] = {
      cohortId: clean,
      name: clean,
      seedCapitalCeiling: ceilingVal
    };
    saveStoredCohortsConfig();

    try {
      await saveCohortDoc(clean, {
        name: clean,
        seedCapitalCeiling: ceilingVal
      });
    } catch (err) {
      console.warn('[FacilitatorStore] Error guardando nueva cohorte en Firestore:', err);
    }

    switchCohort(clean);
  }

  /**
   * Registra manualmente un nuevo participante en la cohorte actual
   */
  async function registerSingleParticipant(formData) {
    const result = await createSingleParticipant(formData, activeCohortId.value);
    return result;
  }

  /**
   * Transfiere un participante de la cohorte activa hacia una cohorte destino
   * dejando trazabilidad completa en auditoría y sincronizando progreso.
   *
   * @param {object} params
   * @param {string} params.dni - DNI del participante
   * @param {string} params.toCohortId - Cohorte destino seleccionada
   * @param {string} params.reason - Motivo de la transferencia
   * @param {string} [params.notes=''] - Notas / justificación del facilitador
   * @returns {Promise<object>} Registro de transferencia
   */
  async function transferParticipant({ dni, toCohortId, reason, notes = '' }) {
    const cleanedDni = String(dni).trim();
    const fromCohortId = activeCohortId.value;
    const cleanTo = String(toCohortId || '').trim().toUpperCase();

    if (!cleanedDni) throw new Error('DNI del participante es requerido');
    if (!cleanTo) throw new Error('Debes seleccionar una cohorte destino');
    if (fromCohortId === cleanTo) throw new Error('La cohorte destino no puede ser la misma cohorte actual');

    const participant = participants.value.find((p) => String(p.dni) === cleanedDni);
    const completedSessionsCount = getCompletedSessionsCount(cleanedDni);
    const currentSession = participant?.programStatus?.currentSession || 1;

    const previousCeiling = cohortsConfig.value[fromCohortId]?.seedCapitalCeiling ?? 3000.0;
    const newCeiling = cohortsConfig.value[cleanTo]?.seedCapitalCeiling ?? 3000.0;

    const fUser = facilitatorUser.value || getCurrentFacilitator() || {
      email: 'facilitador@planseed.org',
      displayName: 'Facilitador',
      uid: 'facilitator-uid'
    };

    let transferResult = null;

    try {
      // 1. Ejecutar actualización atómica en Firestore
      transferResult = await transferParticipantCohortFirestore({
        dni: cleanedDni,
        fromCohortId,
        toCohortId: cleanTo,
        reason,
        notes,
        facilitatorUser: fUser,
        previousCeiling,
        newCeiling,
        currentSession,
        completedSessionsCount
      });
    } catch (err) {
      console.warn('[FacilitatorStore] Falló transferencia online a Firestore, procesando offline:', err);
      // Si falla la red, armar el registro para IndexedDB
      const now = new Date().toISOString();
      transferResult = {
        transferId: `trf_${Date.now()}_${cleanedDni}`,
        participantId: cleanedDni,
        fromCohortId,
        toCohortId: cleanTo,
        transferredAt: now,
        transferredBy: {
          email: fUser.email,
          displayName: fUser.displayName,
          uid: fUser.uid
        },
        reason,
        notes,
        previousCeiling,
        newCeiling,
        currentSession,
        completedSessionsCount,
        participantName: `${participant?.personalInfo?.firstName || ''} ${participant?.personalInfo?.lastName || ''}`.trim() || cleanedDni,
        commercialName: participant?.businessBasicInfo?.commercialName || ''
      };
    }

    // 2. Persistir localmente en IndexedDB
    try {
      await transferParticipantCohortLocal(cleanedDni, cleanTo, transferResult);
    } catch (localErr) {
      console.warn('[FacilitatorStore] Error persistiendo transferencia en IndexedDB:', localErr);
    }

    // 3. Actualización reactiva inmediata en la vista:
    // Retirar de participants de la cohorte actual para reflejo instantáneo
    participants.value = participants.value.filter((p) => String(p.dni) !== cleanedDni);

    return transferResult;
  }

  /**
   * Elimina un participante de la cohorte activa y limpia sus sesiones asociadas
   * tanto en Firestore como en IndexedDB con optimismo reactivo y trazabilidad.
   *
   * @param {string} dni - DNI del participante a eliminar
   * @returns {Promise<object>} Resultado de la eliminación
   */
  async function removeParticipantFromCohort(dni) {
    const cleanedDni = String(dni).trim();
    if (!cleanedDni) throw new Error('DNI del participante es requerido para eliminar');

    const participant = participants.value.find((p) => String(p.dni) === cleanedDni);
    const participantName = `${participant?.personalInfo?.firstName || ''} ${participant?.personalInfo?.lastName || ''}`.trim() || cleanedDni;
    const commercialName = participant?.businessBasicInfo?.commercialName || '';
    const currentCohort = activeCohortId.value;

    const fUser = facilitatorUser.value || getCurrentFacilitator() || {
      email: 'facilitador@planseed.org',
      displayName: 'Facilitador',
      uid: 'facilitator-uid'
    };

    let deletionResult = null;

    // 1. Eliminar en Firestore con auditoría
    try {
      deletionResult = await deleteParticipantFirestore({
        dni: cleanedDni,
        cohortId: currentCohort,
        participantName,
        commercialName,
        facilitatorUser: fUser
      });
    } catch (err) {
      console.warn('[FacilitatorStore] Error al eliminar en Firestore, procesando offline:', err);
      deletionResult = {
        deletionId: `del_${Date.now()}_${cleanedDni}`,
        participantId: cleanedDni,
        deletedAt: new Date().toISOString()
      };
    }

    // 2. Eliminar en IndexedDB local
    try {
      await deleteParticipantLocal(cleanedDni);
    } catch (localErr) {
      console.warn('[FacilitatorStore] Error al eliminar en IndexedDB local:', localErr);
    }

    // 3. Limpieza reactiva optimista en el estado de Pinia
    participants.value = participants.value.filter((p) => String(p.dni) !== cleanedDni);

    for (let s = 1; s <= 8; s++) {
      const key = `${cleanedDni}_S${s}`;
      delete progressMap.value[key];
    }

    // 4. Si el cajón de revisión estaba abierto para este participante, cerrarlo
    if (selectedParticipant.value && String(selectedParticipant.value.dni) === cleanedDni) {
      closeReviewDrawer();
    }

    return {
      success: true,
      dni: cleanedDni,
      name: participantName,
      commercialName,
      cohortId: currentCohort,
      ...deletionResult
    };
  }


  // ==========================================================================
  // CAJÓN DE AUDITORÍA RÁPIDA (ReviewDrawer)
  // ==========================================================================

  /**
   * Abre el cajón de auditoría para un participante y sesión específicos
   * Cargando de forma exhaustiva TODOS los campos de esa sesión (ej: Misión, Visión, Objetivos para S2,
   * estructura polimórfica de costeo para S6, o presupuesto de los 3 rubros para S7).
   */
  async function openReviewDrawer(participant, sessionId) {
    selectedParticipant.value = participant;
    selectedSessionId.value = sessionId;
    isDrawerOpen.value = true;
    isLoadingSectionData.value = true;
    drawerNotification.value = null;

    const sId = Number(sessionId);
    const sessionMeta = SESSIONS_DATA.find((s) => s.id === sId);
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

    const sectionKey = sessionCodeMap[sId] || `s${sId}`;
    const sectionTitle = sessionMeta?.title || `Sesión ${sId}`;

    // 1. Obtener la sección guardada en Firestore
    let secDoc = await getPlanSectionDoc(participant.dni, sectionKey);
    if (!secDoc) {
      const altKeys = [`s${sId}`, `session_${sId}`, `s${sId}_identificacion_perfil`];
      for (const altKey of altKeys) {
        secDoc = await getPlanSectionDoc(participant.dni, altKey);
        if (secDoc) break;
      }
    }

    // 2. Obtener progreso de sesión para consultar respuestas del formulario si secDoc no existía
    const prog = getSessionProgress(participant.dni, sId);
    const answers = prog?.formSubmission?.answers || {};

    // 3. Hidratación especializada para Sesión 6 (Costeo) y Sesión 7 (Inversión)
    if (sId === 6 || sId === 7) {
      try {
        const costDoc = await getCostingModuleDoc(participant.dni);
        const nature = participant.businessBasicInfo?.businessNature || 'produccion';

        // --- SESIÓN 6: PRODUCTOS Y COSTEO ---
        let rawProds = costDoc?.products || [];
        if (rawProds.length === 0) {
          rawProds = [{
            productId: 'PROD-1',
            productName: nature === 'servicio' ? 'Servicio Principal' : (nature === 'comercio' ? 'Producto Principal' : 'Plato / Producto Principal'),
            businessNature: nature,
            batchConfig: {
              batchSize: 10,
              batchUnit: 'unidades',
              productionFrequency: 'semanal',
              batchesPerMonth: 4
            },
            ingredients: [],
            serviceConfig: {
              durationMinutes: 45,
              costPerMinute: costDoc?.serviceLaborSettings?.costPerMinute || 0.10,
              supplies: []
            },
            commerceConfig: {
              purchasePresentation: 'Docena',
              unitsPerPackage: 12,
              packagePurchasePrice: 120,
              freightExpense: 10,
              totalItemsInTrip: 24,
              packagingCostPerUnit: 0.50,
              baseUnitCost: 10,
              unitFreightCost: 0.42,
              directCostComercial: 10.92
            },
            commercialization: {
              currentSalePrice: 15,
              estimatedMonthlySalesVolume: 40
            },
            financialSummary: {
              totalBatchDirectCost: 0,
              directCostPerUnit: 0,
              salePrice: 15,
              grossProfitPerUnit: 15,
              grossMarginPercentage: 100,
              monthlyGrossProfitEstimate: 600
            }
          }];
        }

        // Recalcular métricas de cada producto con useCostingCalculator
        const calculatedProducts = rawProds.map((prod) => {
          const pNature = prod.businessNature || nature;
          const salePrice = Number(prod.commercialization?.currentSalePrice || prod.financialSummary?.salePrice || 0);
          const monthlyVol = Number(prod.commercialization?.estimatedMonthlySalesVolume || 0);

          if (pNature === 'produccion') {
            const batchSize = Math.max(1, Number(prod.batchConfig?.batchSize || 1));
            const ings = (prod.ingredients || []).map((ing) => {
              const math = calc.computeIngredientMath({
                quantityUsed: ing.recipeConsumption?.quantityUsed,
                packageCost: ing.marketPurchase?.packageCost,
                quantityInPackage: ing.marketPurchase?.quantityInPackage,
                batchSize
              });
              return { ...ing, automatedMath: math };
            });
            const financials = calc.computeProductFinancials({
              ingredients: ings,
              batchSize,
              salePrice,
              estimatedMonthlySalesVolume: monthlyVol
            });
            return {
              ...prod,
              businessNature: 'produccion',
              ingredients: ings,
              financialSummary: financials
            };
          } else if (pNature === 'servicio') {
            const sConf = prod.serviceConfig || {};
            const labor = costDoc?.serviceLaborSettings || { desiredMonthlySalary: 1200, daysWorkedPerMonth: 25, hoursWorkedPerDay: 8, costPerMinute: 0.10 };
            const costPerMin = labor.costPerMinute || calc.calculateLaborCostPerMinute(labor);
            const financials = calc.computeServiceFinancials({
              durationMinutes: sConf.durationMinutes || 30,
              costPerMinute: costPerMin,
              supplies: sConf.supplies || [],
              salePrice,
              estimatedMonthlySalesVolume: monthlyVol
            });
            return {
              ...prod,
              businessNature: 'servicio',
              serviceConfig: { ...sConf, costPerMinute: costPerMin },
              financialSummary: financials
            };
          } else {
            // comercio
            const cConf = prod.commerceConfig || {};
            const financials = calc.computeCommerceFinancials({
              packagePurchasePrice: cConf.packagePurchasePrice || 0,
              unitsPerPackage: cConf.unitsPerPackage || 1,
              freightExpense: cConf.freightExpense || 0,
              totalItemsInTrip: cConf.totalItemsInTrip || 1,
              packagingCostPerUnit: cConf.packagingCostPerUnit || 0,
              salePrice,
              estimatedMonthlySalesVolume: monthlyVol
            });
            return {
              ...prod,
              businessNature: 'comercio',
              financialSummary: financials
            };
          }
        });

        selectedCostingData.value = {
          products: calculatedProducts,
          serviceLaborSettings: costDoc?.serviceLaborSettings || null,
          activeProductIndex: 0
        };

        // --- SESIÓN 7: PLAN DE INVERSIÓN (3 RUBROS) ---
        const participantCohortId = participant.cohortId || activeCohortId.value;
        const resolvedCeiling = Number(
          cohortsConfig.value[participantCohortId]?.seedCapitalCeiling ||
          costDoc?.seedCapitalInvestmentPlan?.seedCapitalCeiling ||
          activeCohortCeiling.value ||
          3000.0
        );

        const seedPlan = costDoc?.seedCapitalInvestmentPlan || {
          seedCapitalCeiling: resolvedCeiling,
          investmentItems: []
        };
        seedPlan.seedCapitalCeiling = resolvedCeiling;

        const existingItems = seedPlan.investmentItems || [];
        const manualItems = existingItems.filter((i) => 
          !i.isLaborContribution && 
          i.rubro !== 'rubro_b' && 
          !i.isAutoDerivedFromS6 && 
          i.category !== 'Insumos y Capital de Trabajo' && 
          i.category !== 'Mano de Obra Propia'
        );
        const existingLaborItem = existingItems.find((i) => i.isLaborContribution);

        // Sincronizar insumos requeridos de S6 para 1 mes
        const derivedWorkingCap = calc.getMonthlyWorkingCapitalRequirements({ products: calculatedProducts });
        let workingCapItemsToUse = derivedWorkingCap.map((req) => {
          const prev = existingItems.find((i) => i.itemId === req.itemId || (i.productId === req.productId && (i.ingredientId === req.ingredientId || i.supplyId === req.supplyId)));
          const isFinanced = prev ? prev.financedBySeedCapital : true;
          return {
            ...req,
            financedBySeedCapital: isFinanced,
            source: isFinanced ? 'capital_semilla' : 'propio'
          };
        });

        // Si no se derivaron insumos automáticos de S6 pero existían insumos en el plan previo, preservarlos
        if (workingCapItemsToUse.length === 0) {
          workingCapItemsToUse = existingItems.filter((i) => 
            i.rubro === 'rubro_b' || 
            (i.isAutoDerivedFromS6 && !i.isLaborContribution) || 
            (!i.rubro && i.category === 'Insumos y Capital de Trabajo')
          );
        }

        // Dedicación y mano de obra propia (Rubro C) fijada en Aporte Propio
        let laborItems = [];
        if (existingLaborItem) {
          laborItems = [{ ...existingLaborItem, financedBySeedCapital: false, source: 'propio' }];
        } else {
          const laborVal = calc.calculateProjectedMonthlyLaborValue({
            businessNature: nature,
            serviceLaborSettings: costDoc?.serviceLaborSettings,
            products: calculatedProducts
          }) || 1200;

          laborItems = [{
            itemId: 'LABOR-OWN-CONTRIBUTION',
            category: 'Mano de Obra Propia',
            rubro: 'rubro_c',
            description: 'Dedicación y Mano de Obra Propia del Emprendedor (1 Mes)',
            quantity: 1,
            unit: 'mes',
            unitPriceEstimated: laborVal,
            totalPrice: laborVal,
            financedBySeedCapital: false,
            source: 'propio',
            isLaborContribution: true,
            isAutoDerivedFromS6: true,
            priority: 'alta'
          }];
        }

        const allInvestmentItems = [...manualItems, ...workingCapItemsToUse, ...laborItems];
        const computedSeed = calc.computeSeedCapitalPlan({
          items: allInvestmentItems,
          ceiling: resolvedCeiling
        });

        selectedInvestmentData.value = {
          seedCapitalInvestmentPlan: {
            seedCapitalCeiling: resolvedCeiling,
            totalBusinessInvestment: computedSeed.totalBusinessInvestment,
            allocatedTotal: computedSeed.allocatedSeedCapital,
            allocatedSeedCapital: computedSeed.allocatedSeedCapital,
            ownContribution: computedSeed.ownContribution,
            remainingBudget: computedSeed.remainingBudget,
            isBudgetCompliant: computedSeed.isBudgetCompliant,
            investmentItems: allInvestmentItems,
            audit: seedPlan.audit || null
          },
          investmentItems: allInvestmentItems,
          rubros: computedSeed.rubros,
          ceiling: resolvedCeiling,
          allocatedSeedCapital: computedSeed.allocatedSeedCapital,
          ownContribution: computedSeed.ownContribution,
          totalBusinessInvestment: computedSeed.totalBusinessInvestment,
          remainingBudget: computedSeed.remainingBudget,
          isBudgetCompliant: computedSeed.isBudgetCompliant
        };
      } catch (e) {
        console.warn('Error cargando módulo de costeo en facilitador:', e);
      }
    }

    // 4. Construir la lista de campos cualitativos de la sesión
    const formFieldsDef = sessionMeta?.formFields || [];
    const extractedFields = [];
    refiningFields.value = {};

    if (formFieldsDef.length > 0) {
      for (const fieldDef of formFieldsDef) {
        const fieldId = fieldDef.id;
        const secField = secDoc?.fields?.[fieldId];

        let rawText = '';
        let consultantNotes = '';
        let aiText = '';
        let approvedText = '';
        let reviewStatus = 'pendiente_revision';

        if (secField) {
          if (typeof secField.rawInput === 'string') {
            rawText = secField.rawInput;
          } else if (secField.rawInput?.text) {
            rawText = secField.rawInput.text;
          }

          consultantNotes = secField.consultantNotes || secField.consultantReview?.feedbackNotes || '';

          if (typeof secField.aiRefinement === 'string') {
            aiText = secField.aiRefinement;
          } else if (secField.aiRefinement?.refinedText) {
            aiText = secField.aiRefinement.refinedText;
          }

          if (secField.consultantReview?.finalApprovedText) {
            approvedText = secField.consultantReview.finalApprovedText;
          } else if (typeof secField.finalApprovedText === 'string') {
            approvedText = secField.finalApprovedText;
          }

          if (secField.consultantReview?.status) {
            reviewStatus = secField.consultantReview.status;
          }
        }

        // Fallback a formSubmission.answers
        if (!rawText && answers[fieldId] !== undefined) {
          rawText = String(answers[fieldId]);
        }

        // Fallbacks especiales para Sesión 1 si aún no hay texto
        if (!rawText && sId === 1) {
          if (fieldId === 'firstName') rawText = participant.personalInfo?.firstName || '';
          if (fieldId === 'lastName') rawText = participant.personalInfo?.lastName || '';
          if (fieldId === 'commercialName') rawText = participant.businessBasicInfo?.commercialName || '';
          if (fieldId === 'businessNature') rawText = participant.businessBasicInfo?.businessNature || '';
          if (fieldId === 'sector') rawText = participant.businessBasicInfo?.sector || '';
          if (fieldId === 'businessStory') rawText = participant.businessBasicInfo?.businessStory || '';
        }

        // Fallbacks para Sesión 6 y 7 si el participante completó los asistentes numéricos
        if (!rawText && sId === 6) {
          const prods = selectedCostingData.value.products || [];
          if (prods.length > 0) {
            rawText = prods.map((p) => {
              const cost = Number(p.financialSummary?.directCostPerUnit || 0).toFixed(2);
              const price = Number(p.commercialization?.currentSalePrice || p.financialSummary?.salePrice || 0).toFixed(2);
              const marginPct = Number(p.financialSummary?.grossMarginPercentage || 0).toFixed(1);
              const profitUnit = Number(p.financialSummary?.grossProfitPerUnit || 0).toFixed(2);
              return `${p.productName}: Costo Directo Unitario = S/ ${cost}, Precio Venta = S/ ${price}, Margen Bruto = ${marginPct}% (S/ ${profitUnit}).`;
            }).join('\n');
          }
        } else if (!rawText && sId === 7) {
          const inv = selectedInvestmentData.value;
          if (inv && inv.totalBusinessInvestment > 0) {
            rawText = `Inversión Total = S/ ${inv.totalBusinessInvestment}. Capital Semilla Solicitado = S/ ${inv.allocatedSeedCapital}. Aporte Propio = S/ ${inv.ownContribution}. Cumplimiento: ${inv.isBudgetCompliant ? 'Conforme' : 'Sobregirado'}.`;
          }
        }

        if (!approvedText) {
          approvedText = aiText || rawText || '';
        }

        extractedFields.push({
          fieldId,
          label: fieldDef.label || fieldId,
          type: fieldDef.type || 'text',
          rawInput: rawText || '(Sin respuesta aún)',
          consultantNotes: consultantNotes || '',
          aiRefinement: aiText,
          finalApprovedText: approvedText,
          status: reviewStatus
        });
      }
    }

    // Si secDoc tiene campos dinámicos adicionales no cubiertos en SESSIONS_DATA (ej. Canvas en S5)
    if (secDoc?.fields) {
      for (const [fId, fVal] of Object.entries(secDoc.fields)) {
        if (!extractedFields.some((ef) => ef.fieldId === fId)) {
          const raw = typeof fVal.rawInput === 'string' ? fVal.rawInput : fVal.rawInput?.text || '';
          const notes = fVal.consultantNotes || fVal.consultantReview?.feedbackNotes || '';
          const ai = typeof fVal.aiRefinement === 'string' ? fVal.aiRefinement : fVal.aiRefinement?.refinedText || '';
          const app = fVal.consultantReview?.finalApprovedText || fVal.finalApprovedText || ai || raw;
          extractedFields.push({
            fieldId: fId,
            label: fVal.fieldLabel || fId,
            type: 'textarea',
            rawInput: raw || '(Sin respuesta aún)',
            consultantNotes: notes || '',
            aiRefinement: ai,
            finalApprovedText: app,
            status: fVal.consultantReview?.status || 'pendiente_revision'
          });
        }
      }
    }

    const isSessionApproved =
      prog?.formSubmission?.isApproved ||
      (extractedFields.length > 0 && extractedFields.every((f) => f.status === 'aprobado'));

    selectedSectionData.value = {
      sectionKey,
      sectionTitle,
      fields: extractedFields,
      isApproved: isSessionApproved
    };

    isLoadingSectionData.value = false;
  }

  /**
   * Recalcula reactivamente el plan de inversión de la Sesión 7 usando el techo configurado
   */
  function recomputeSelectedInvestmentData() {
    if (!selectedInvestmentData.value?.seedCapitalInvestmentPlan) return;
    const items = selectedInvestmentData.value.seedCapitalInvestmentPlan.investmentItems || [];
    const currentCeiling = Number(selectedInvestmentData.value.ceiling || activeCohortCeiling.value || 3000.0);

    const recomputed = calc.computeSeedCapitalPlan({
      items,
      ceiling: currentCeiling
    });

    selectedInvestmentData.value.seedCapitalInvestmentPlan.totalBusinessInvestment = recomputed.totalBusinessInvestment;
    selectedInvestmentData.value.seedCapitalInvestmentPlan.allocatedSeedCapital = recomputed.allocatedSeedCapital;
    selectedInvestmentData.value.seedCapitalInvestmentPlan.allocatedTotal = recomputed.allocatedSeedCapital;
    selectedInvestmentData.value.seedCapitalInvestmentPlan.ownContribution = recomputed.ownContribution;
    selectedInvestmentData.value.seedCapitalInvestmentPlan.remainingBudget = recomputed.remainingBudget;
    selectedInvestmentData.value.seedCapitalInvestmentPlan.isBudgetCompliant = recomputed.isBudgetCompliant;
    selectedInvestmentData.value.seedCapitalInvestmentPlan.seedCapitalCeiling = currentCeiling;

    selectedInvestmentData.value.rubros = recomputed.rubros;
    selectedInvestmentData.value.ceiling = currentCeiling;
    selectedInvestmentData.value.allocatedSeedCapital = recomputed.allocatedSeedCapital;
    selectedInvestmentData.value.ownContribution = recomputed.ownContribution;
    selectedInvestmentData.value.totalBusinessInvestment = recomputed.totalBusinessInvestment;
    selectedInvestmentData.value.remainingBudget = recomputed.remainingBudget;
    selectedInvestmentData.value.isBudgetCompliant = recomputed.isBudgetCompliant;
  }

  /**
   * Conmuta la fuente de financiamiento de un ítem de inversión (Sesión 7)
   * entre Capital Semilla y Aporte Propio (con recalculo reactivo inmediato del presupuesto)
   */
  function toggleInvestmentItemFinancing(itemId) {
    if (!selectedInvestmentData.value?.seedCapitalInvestmentPlan) return;
    const items = selectedInvestmentData.value.seedCapitalInvestmentPlan.investmentItems || [];
    const target = items.find((i) => i.itemId === itemId);
    if (!target || target.isLaborContribution) return; // Mano de obra propia está protegida

    target.financedBySeedCapital = !target.financedBySeedCapital;
    target.source = target.financedBySeedCapital ? 'capital_semilla' : 'propio';

    recomputeSelectedInvestmentData();
  }

  /**
   * Actualiza un ítem de inversión en la Sesión 7 (descripción, cantidad, precio unitario o financiamiento)
   * y recalcula automáticamente los totales del presupuesto y cumplimiento de techo.
   */
  function updateFacilitatorInvestmentItem(itemId, patch = {}) {
    if (!selectedInvestmentData.value?.seedCapitalInvestmentPlan) return;
    const items = selectedInvestmentData.value.seedCapitalInvestmentPlan.investmentItems || [];
    const target = items.find((i) => i.itemId === itemId);
    if (!target) return;

    if (patch.description !== undefined) {
      target.description = String(patch.description);
    }
    if (patch.category !== undefined) {
      target.category = patch.category;
    }
    if (patch.rubro !== undefined) {
      target.rubro = patch.rubro;
    }
    if (patch.unit !== undefined) {
      target.unit = patch.unit;
    }
    if (patch.quantity !== undefined && !target.isLaborContribution) {
      target.quantity = Math.max(0.01, Number(patch.quantity) || 1);
    }
    if (patch.unitPriceEstimated !== undefined && !target.isLaborContribution) {
      target.unitPriceEstimated = Math.max(0, Number(patch.unitPriceEstimated) || 0);
    }
    if (patch.totalPrice !== undefined && !target.isLaborContribution) {
      target.totalPrice = Math.max(0, Number(patch.totalPrice) || 0);
    } else if (!target.isLaborContribution) {
      target.totalPrice = calc.roundDecimals((Number(target.quantity) || 1) * (Number(target.unitPriceEstimated) || 0), 2);
    }

    if (patch.financedBySeedCapital !== undefined && !target.isLaborContribution) {
      target.financedBySeedCapital = !!patch.financedBySeedCapital;
      target.source = target.financedBySeedCapital ? 'capital_semilla' : 'propio';
    }

    recomputeSelectedInvestmentData();
  }

  /**
   * Agrega un nuevo ítem de inversión (Rubro A o C) en la Sesión 7
   */
  function addFacilitatorInvestmentItem(itemData = {}) {
    if (!selectedInvestmentData.value) selectedInvestmentData.value = {};
    if (!selectedInvestmentData.value.seedCapitalInvestmentPlan) {
      selectedInvestmentData.value.seedCapitalInvestmentPlan = {
        investmentItems: [],
        seedCapitalCeiling: Number(activeCohortCeiling.value || 3000)
      };
    }
    if (!Array.isArray(selectedInvestmentData.value.seedCapitalInvestmentPlan.investmentItems)) {
      selectedInvestmentData.value.seedCapitalInvestmentPlan.investmentItems = [];
    }

    const qty = Math.max(0.01, Number(itemData.quantity) || 1);
    const unitPrice = Math.max(0, Number(itemData.unitPriceEstimated) || 0);
    const total = calc.roundDecimals(qty * unitPrice, 2);
    const isFinanced = itemData.financedBySeedCapital !== false;

    const newItem = {
      itemId: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      description: itemData.description || 'Nuevo Equipo / Insumo',
      category: itemData.category || 'Maquinaria y Equipo',
      rubro: itemData.rubro || 'rubro_a',
      quantity: qty,
      unit: itemData.unit || 'unidad',
      unitPriceEstimated: unitPrice,
      totalPrice: total,
      financedBySeedCapital: isFinanced,
      source: isFinanced ? 'capital_semilla' : 'propio',
      isAutoDerivedFromS6: false,
      isLaborContribution: false
    };

    selectedInvestmentData.value.seedCapitalInvestmentPlan.investmentItems.push(newItem);
    recomputeSelectedInvestmentData();
  }

  /**
   * Elimina un ítem de inversión en la Sesión 7 (excepto si es mano de obra fija)
   */
  function removeFacilitatorInvestmentItem(itemId) {
    if (!selectedInvestmentData.value?.seedCapitalInvestmentPlan) return;
    const items = selectedInvestmentData.value.seedCapitalInvestmentPlan.investmentItems || [];
    selectedInvestmentData.value.seedCapitalInvestmentPlan.investmentItems = items.filter(
      (i) => i.itemId !== itemId || i.isLaborContribution
    );
    recomputeSelectedInvestmentData();
  }

  /**
   * Cambia la pestaña de producto activo en la revisión de Costeo (Sesión 6)
   */
  function setActiveCostingProductIndex(index) {
    if (selectedCostingData.value) {
      selectedCostingData.value.activeProductIndex = index;
    }
  }

  /**
   * Recalcula las métricas financieras de un producto en selectedCostingData
   */
  function recomputeFacilitatorProduct(productIndex) {
    if (!selectedCostingData.value?.products?.[productIndex]) return;
    const prod = selectedCostingData.value.products[productIndex];
    const nature = prod.businessNature || selectedParticipant.value?.businessBasicInfo?.businessNature || 'produccion';
    const salePrice = Number(prod.commercialization?.currentSalePrice || prod.financialSummary?.salePrice || 0);
    const monthlyVol = Number(prod.commercialization?.estimatedMonthlySalesVolume || 0);

    if (nature === 'produccion') {
      const batchSize = Math.max(1, Number(prod.batchConfig?.batchSize || 1));
      const ings = (prod.ingredients || []).map((ing) => {
        const math = calc.computeIngredientMath({
          quantityUsed: ing.recipeConsumption?.quantityUsed,
          packageCost: ing.marketPurchase?.packageCost,
          quantityInPackage: ing.marketPurchase?.quantityInPackage,
          batchSize,
          recipeUnit: ing.recipeConsumption?.unit,
          packageUnit: ing.marketPurchase?.packageUnit || ing.recipeConsumption?.unit
        });
        return { ...ing, automatedMath: math };
      });
      prod.ingredients = ings;
      prod.financialSummary = calc.computeProductFinancials({
        ingredients: ings,
        batchSize,
        salePrice,
        estimatedMonthlySalesVolume: monthlyVol
      });
    } else if (nature === 'servicio') {
      const sConf = prod.serviceConfig || {};
      const labor = selectedCostingData.value.serviceLaborSettings || { desiredMonthlySalary: 1200, daysWorkedPerMonth: 25, hoursWorkedPerDay: 8, costPerMinute: 0.10 };
      const costPerMin = labor.costPerMinute || calc.calculateLaborCostPerMinute(labor);
      prod.financialSummary = calc.computeServiceFinancials({
        durationMinutes: sConf.durationMinutes || 30,
        costPerMinute: costPerMin,
        supplies: sConf.supplies || [],
        salePrice,
        estimatedMonthlySalesVolume: monthlyVol
      });
      prod.serviceConfig = { ...sConf, costPerMinute: costPerMin };
    } else {
      // comercio
      const cConf = prod.commerceConfig || {};
      prod.financialSummary = calc.computeCommerceFinancials({
        packagePurchasePrice: cConf.packagePurchasePrice || 0,
        unitsPerPackage: cConf.unitsPerPackage || 1,
        freightExpense: cConf.freightExpense || 0,
        totalItemsInTrip: cConf.totalItemsInTrip || 1,
        packagingCostPerUnit: cConf.packagingCostPerUnit || 0,
        salePrice,
        estimatedMonthlySalesVolume: monthlyVol
      });
    }
  }

  function updateFacilitatorProductBatch(productIndex, patch) {
    if (!selectedCostingData.value?.products?.[productIndex]) return;
    const prod = selectedCostingData.value.products[productIndex];
    if (patch.productName !== undefined) prod.productName = patch.productName;
    if (!prod.batchConfig) prod.batchConfig = {};
    if (patch.batchSize !== undefined) prod.batchConfig.batchSize = Number(patch.batchSize) || 1;
    if (patch.batchUnit !== undefined) prod.batchConfig.batchUnit = patch.batchUnit;
    if (patch.productionFrequency !== undefined) {
      prod.batchConfig.productionFrequency = patch.productionFrequency;
      prod.batchConfig.batchesPerMonth = calc.calculateBatchesPerMonth ? calc.calculateBatchesPerMonth(patch.productionFrequency) : (patch.productionFrequency === 'diario' ? 24 : patch.productionFrequency === 'interdiario' ? 12 : patch.productionFrequency === 'quincenal' ? 2 : patch.productionFrequency === 'mensual' ? 1 : 4);
    }
    if (patch.batchesPerMonth !== undefined) prod.batchConfig.batchesPerMonth = patch.batchesPerMonth;

    if (!prod.commercialization) prod.commercialization = {};
    if (patch.currentSalePrice !== undefined) prod.commercialization.currentSalePrice = Number(patch.currentSalePrice) || 0;
    if (patch.estimatedMonthlySalesVolume !== undefined) prod.commercialization.estimatedMonthlySalesVolume = Number(patch.estimatedMonthlySalesVolume) || 0;

    recomputeFacilitatorProduct(productIndex);
  }

  function addFacilitatorCostingIngredient(productIndex, ingredientData) {
    if (!selectedCostingData.value?.products?.[productIndex]) return;
    const prod = selectedCostingData.value.products[productIndex];
    if (!Array.isArray(prod.ingredients)) prod.ingredients = [];

    const newIng = {
      ingredientId: `ING-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: ingredientData.name || 'Nuevo Insumo',
      recipeConsumption: {
        quantityUsed: Number(ingredientData.quantityUsed) || 1,
        unit: ingredientData.unit || 'kg'
      },
      marketPurchase: {
        packageUnitName: ingredientData.packageUnitName || 'bolsa de 1 kg',
        packageUnit: ingredientData.packageUnit || ingredientData.unit || 'kg',
        quantityInPackage: Number(ingredientData.quantityInPackage) || 1,
        packageCost: Number(ingredientData.packageCost) || 0
      }
    };

    prod.ingredients.push(newIng);
    recomputeFacilitatorProduct(productIndex);
  }

  function updateFacilitatorCostingIngredient(productIndex, ingredientId, updatedData) {
    if (!selectedCostingData.value?.products?.[productIndex]) return;
    const prod = selectedCostingData.value.products[productIndex];
    const ing = (prod.ingredients || []).find((i) => i.ingredientId === ingredientId);
    if (!ing) return;

    if (updatedData.name !== undefined) ing.name = updatedData.name;
    if (!ing.recipeConsumption) ing.recipeConsumption = {};
    if (updatedData.quantityUsed !== undefined) ing.recipeConsumption.quantityUsed = Number(updatedData.quantityUsed) || 1;
    if (updatedData.unit !== undefined) ing.recipeConsumption.unit = updatedData.unit;

    if (!ing.marketPurchase) ing.marketPurchase = {};
    if (updatedData.packageUnitName !== undefined) ing.marketPurchase.packageUnitName = updatedData.packageUnitName;
    if (updatedData.packageUnit !== undefined) ing.marketPurchase.packageUnit = updatedData.packageUnit;
    if (updatedData.quantityInPackage !== undefined) ing.marketPurchase.quantityInPackage = Number(updatedData.quantityInPackage) || 1;
    if (updatedData.packageCost !== undefined) ing.marketPurchase.packageCost = Number(updatedData.packageCost) || 0;

    recomputeFacilitatorProduct(productIndex);
  }

  function removeFacilitatorCostingIngredient(productIndex, ingredientId) {
    if (!selectedCostingData.value?.products?.[productIndex]) return;
    const prod = selectedCostingData.value.products[productIndex];
    prod.ingredients = (prod.ingredients || []).filter((i) => i.ingredientId !== ingredientId);
    recomputeFacilitatorProduct(productIndex);
  }

  function addFacilitatorProduct(productName) {
    if (!selectedCostingData.value) return;
    if (!Array.isArray(selectedCostingData.value.products)) selectedCostingData.value.products = [];
    if (selectedCostingData.value.products.length >= 5) return;

    const nature = selectedParticipant.value?.businessBasicInfo?.businessNature || 'produccion';
    const newIdx = selectedCostingData.value.products.length + 1;
    const cleanName = (productName || '').trim() || (nature === 'servicio' ? `Servicio ${newIdx}` : (nature === 'comercio' ? `Producto Comercial ${newIdx}` : `Plato / Producto ${newIdx}`));

    const newProd = {
      productId: `PROD-${Date.now()}`,
      productName: cleanName,
      businessNature: nature,
      batchConfig: {
        batchSize: 10,
        batchUnit: 'unidades',
        productionFrequency: 'semanal',
        batchesPerMonth: 4
      },
      ingredients: [],
      serviceConfig: {
        durationMinutes: 45,
        costPerMinute: selectedCostingData.value.serviceLaborSettings?.costPerMinute || 0.10,
        supplies: []
      },
      commerceConfig: {
        purchasePresentation: 'Docena',
        unitsPerPackage: 12,
        packagePurchasePrice: 120,
        freightExpense: 10,
        totalItemsInTrip: 24,
        packagingCostPerUnit: 0.50,
        baseUnitCost: 10,
        unitFreightCost: 0.42,
        directCostComercial: 10.92
      },
      commercialization: {
        currentSalePrice: 15,
        estimatedMonthlySalesVolume: 40
      },
      financialSummary: {
        totalBatchDirectCost: 0,
        directCostPerUnit: 0,
        salePrice: 15,
        grossProfitPerUnit: 15,
        grossMarginPercentage: 100,
        monthlyGrossProfitEstimate: 600
      }
    };

    selectedCostingData.value.products.push(newProd);
    selectedCostingData.value.activeProductIndex = selectedCostingData.value.products.length - 1;
    recomputeFacilitatorProduct(selectedCostingData.value.activeProductIndex);
  }

  function removeFacilitatorProduct(productIndex) {
    if (!selectedCostingData.value?.products?.length) return;
    if (selectedCostingData.value.products.length <= 1) return;
    selectedCostingData.value.products.splice(productIndex, 1);
    selectedCostingData.value.activeProductIndex = Math.max(0, productIndex - 1);
  }

  function updateFacilitatorServiceLaborSettings(laborSettings) {
    if (!selectedCostingData.value) return;
    const costPerMin = calc.calculateLaborCostPerMinute(laborSettings);
    selectedCostingData.value.serviceLaborSettings = {
      ...laborSettings,
      costPerMinute: costPerMin
    };
    (selectedCostingData.value.products || []).forEach((p, idx) => {
      if (p.businessNature === 'servicio') {
        if (!p.serviceConfig) p.serviceConfig = {};
        p.serviceConfig.costPerMinute = costPerMin;
        recomputeFacilitatorProduct(idx);
      }
    });
  }

  function updateFacilitatorCommerceConfig(productIndex, configPatch) {
    if (!selectedCostingData.value?.products?.[productIndex]) return;
    const prod = selectedCostingData.value.products[productIndex];
    if (!prod.commerceConfig) prod.commerceConfig = {};
    Object.assign(prod.commerceConfig, configPatch);
    recomputeFacilitatorProduct(productIndex);
  }

  function addFacilitatorServiceSupply(productIndex, supplyData) {
    if (!selectedCostingData.value?.products?.[productIndex]) return;
    const prod = selectedCostingData.value.products[productIndex];
    if (!prod.serviceConfig) prod.serviceConfig = { durationMinutes: 30, costPerMinute: 0.10, supplies: [] };
    if (!Array.isArray(prod.serviceConfig.supplies)) prod.serviceConfig.supplies = [];

    const supplyType = supplyData.supplyType || 'single_use';
    const pkgCost = Number(supplyData.packageCost) || 0;
    let unitCost = 0;
    if (supplyType === 'bottle_yield') {
      const yieldClients = Math.max(1, Number(supplyData.clientsYield) || 1);
      unitCost = Number((pkgCost / yieldClients).toFixed(2));
    } else {
      const unitsInPkg = Math.max(1, Number(supplyData.unitsInPackage) || 1);
      unitCost = Number((pkgCost / unitsInPkg).toFixed(2));
    }

    prod.serviceConfig.supplies.push({
      supplyId: `SUP-${Date.now()}`,
      name: supplyData.name || 'Suministro',
      supplyType,
      packageCost: pkgCost,
      unitsInPackage: Number(supplyData.unitsInPackage) || 1,
      clientsYield: Number(supplyData.clientsYield) || 1,
      unitCost
    });

    recomputeFacilitatorProduct(productIndex);
  }

  function removeFacilitatorServiceSupply(productIndex, supplyId) {
    if (!selectedCostingData.value?.products?.[productIndex]) return;
    const prod = selectedCostingData.value.products[productIndex];
    if (!prod.serviceConfig?.supplies) return;
    prod.serviceConfig.supplies = prod.serviceConfig.supplies.filter((s) => s.supplyId !== supplyId);
    recomputeFacilitatorProduct(productIndex);
  }

  /**
   * Cierra el cajón de auditoría
   */
  function closeReviewDrawer() {
    isDrawerOpen.value = false;
    selectedParticipant.value = null;
    selectedSessionId.value = null;
    drawerNotification.value = null;
  }

  /**
   * Invoca a Gemini exclusivamente desde el panel del facilitador
   * para formalizar un campo combinando el texto original y las notas técnicas,
   * inyectando contexto enriquecido para costeo (S6) e inversión (S7).
   */
  async function refineFieldWithAI(fieldIndex) {
    const field = selectedSectionData.value.fields?.[fieldIndex];
    if (!field) return;

    const fieldId = field.fieldId;
    refiningFields.value[fieldId] = true;
    drawerNotification.value = null;

    try {
      const part = selectedParticipant.value;
      const sId = Number(selectedSessionId.value);
      let contextEnrichedRaw = field.rawInput || '';

      // Enriquecimiento para S6 (Costeo)
      if (sId === 6 && selectedCostingData.value?.products?.length) {
        const prodSummary = selectedCostingData.value.products.map((p) => {
          const cost = Number(p.financialSummary?.directCostPerUnit || 0).toFixed(2);
          const price = Number(p.commercialization?.currentSalePrice || p.financialSummary?.salePrice || 0).toFixed(2);
          const margin = Number(p.financialSummary?.grossMarginPercentage || 0).toFixed(1);
          const profitUnit = Number(p.financialSummary?.grossProfitPerUnit || 0).toFixed(2);
          const monthlyProfit = Number(p.financialSummary?.monthlyGrossProfitEstimate || 0).toFixed(2);
          return `Producto '${p.productName}' (${p.businessNature}): Costo Directo Unitario = S/ ${cost}, Precio Venta = S/ ${price}, Margen Bruto = ${margin}% (S/ ${profitUnit} por unidad), Ganancia Bruta Mensual Est. = S/ ${monthlyProfit}.`;
        }).join(' ');
        contextEnrichedRaw = `${contextEnrichedRaw}. Resumen numérico: ${prodSummary}`;
      } else if (sId === 7 && selectedInvestmentData.value) {
        const inv = selectedInvestmentData.value;
        const formattedCeiling = calc.formatMoney(inv.ceiling || activeCohortCeiling.value || 3000.0);
        const invSummary = `Inversión Total del Negocio = S/ ${inv.totalBusinessInvestment}, Subsidio Capital Semilla Solicitado = S/ ${inv.allocatedSeedCapital} (Tope ${formattedCeiling}), Aporte Propio Contrapartida = S/ ${inv.ownContribution}, Saldo Disponible = S/ ${inv.remainingBudget}. Rubro A (Equipos): ${inv.rubros?.rubro_a?.length || 0} ítems. Rubro B (Capital de Trabajo S6): ${inv.rubros?.rubro_b?.length || 0} ítems. Rubro C (Mano de Obra y Adecuaciones): ${inv.rubros?.rubro_c?.length || 0} ítems. Cumplimiento Presupuestal: ${inv.isBudgetCompliant ? 'Conforme' : 'Sobregirado'}.`;
        contextEnrichedRaw = `${contextEnrichedRaw}. Datos presupuestales: ${invSummary}`;
      }

      const result = await refineBusinessText({
        rawInput: contextEnrichedRaw,
        consultantNotes: field.consultantNotes || '',
        fieldKey: field.fieldId,
        businessName: part?.businessBasicInfo?.commercialName || '',
        sector: part?.businessBasicInfo?.sector || '',
        businessNature: part?.businessBasicInfo?.businessNature || ''
      });

      if (result.error) {
        drawerNotification.value = {
          type: 'error',
          message: result.message || 'Error al formalizar con el asistente.'
        };
      } else {
        field.aiRefinement = result.refinedText;
        field.finalApprovedText = result.refinedText;
        const providerName = result.provider ? `el asistente (${result.provider})` : 'el asistente';
        drawerNotification.value = {
          type: 'success',
          message: `✨ Propuesta formal generada con ${providerName} para "${field.label}". Puedes retocarla antes de aprobar.`
        };
      }
    } catch (err) {
      drawerNotification.value = {
        type: 'error',
        message: err.message || 'Error al conectar con el asistente de IA.'
      };
    } finally {
      refiningFields.value[fieldId] = false;
    }
  }

  /**
   * Guarda y aprueba de forma masiva todos los campos de la sesión en Firestore
   * Sincronizando además el módulo de costeo e inversión si corresponde (S6 y S7).
   */
  async function saveAndApproveSection(updatedFieldsOrText) {
    if (!selectedParticipant.value || !selectedSessionId.value) return;

    isSavingApproval.value = true;
    drawerNotification.value = null;

    try {
      const dni = selectedParticipant.value.dni;
      const sId = Number(selectedSessionId.value);
      const secKey = selectedSectionData.value.sectionKey;
      const reviewer = facilitatorUser.value?.email || 'facilitador@planseed.org';

      const fieldsToSave = Array.isArray(updatedFieldsOrText)
        ? updatedFieldsOrText
        : selectedSectionData.value.fields || [];

      // 1. Si es Sesión 6, guardar estructura de costeo en Firestore
      if (sId === 6 && selectedCostingData.value?.products?.length) {
        await saveCostingModule(dni, {
          products: selectedCostingData.value.products,
          serviceLaborSettings: selectedCostingData.value.serviceLaborSettings
        });
      }

      // 2. Si es Sesión 7, guardar plan de inversión en Firestore con trazabilidad de auditoría
      if (sId === 7 && selectedInvestmentData.value?.seedCapitalInvestmentPlan) {
        const currentPlan = selectedInvestmentData.value.seedCapitalInvestmentPlan;
        const previousVersion = Number(currentPlan.audit?.version || 0);
        const resolvedCeiling = Number(selectedInvestmentData.value.ceiling || activeCohortCeiling.value || 3000.0);

        currentPlan.audit = {
          lastModifiedAt: new Date().toISOString(),
          lastModifiedBy: {
            email: reviewer,
            displayName: facilitatorUser.value?.displayName || reviewer,
            uid: facilitatorUser.value?.uid || 'facilitator-uid',
            role: 'facilitator'
          },
          reviewStatus: 'aprobado',
          cohortCeilingApplied: resolvedCeiling,
          version: previousVersion + 1,
          changeSummary: 'Presupuesto aprobado y validado oficialmente por mesa técnica del facilitador.'
        };

        await saveCostingModule(dni, {
          seedCapitalInvestmentPlan: currentPlan
        });
      }

      // 3. Guardar sección de plan y aprobar sesión
      await savePlanSectionReview(dni, sId, secKey, fieldsToSave, reviewer, true);

      for (const f of fieldsToSave) {
        f.status = 'aprobado';
      }

      selectedSectionData.value.isApproved = true;

      // Actualizar mapa reactivo local para feedback visual inmediato en la tabla
      const progressKey = `${dni}_S${sId}`;
      if (progressMap.value[progressKey]) {
        progressMap.value[progressKey].state = 'completado';
        progressMap.value[progressKey].formSubmission = {
          ...(progressMap.value[progressKey].formSubmission || {}),
          isApproved: true,
          isCompleted: true
        };
      }

      drawerNotification.value = {
        type: 'success',
        message: '¡Aprobado con éxito! El módulo y sus datos financieros han sido guardados y el semáforo se ha actualizado a verde.'
      };
    } catch (err) {
      console.error('Error aprobando módulo:', err);
      drawerNotification.value = {
        type: 'error',
        message: 'No fue posible guardar y aprobar la sesión en Firestore.'
      };
    } finally {
      isSavingApproval.value = false;
    }
  }

  /**
   * Guarda borrador de notas técnicas, propuesta IA o texto editado sin aprobar la sesión
   */
  async function saveDraftSection(updatedFieldsOrText) {
    if (!selectedParticipant.value || !selectedSessionId.value) return;

    isSavingDraft.value = true;
    drawerNotification.value = null;

    try {
      const dni = selectedParticipant.value.dni;
      const sId = Number(selectedSessionId.value);
      const secKey = selectedSectionData.value.sectionKey;
      const reviewer = facilitatorUser.value?.email || 'facilitador@planseed.org';

      const fieldsToSave = Array.isArray(updatedFieldsOrText)
        ? updatedFieldsOrText
        : selectedSectionData.value.fields || [];

      // 1. Si es Sesión 6, guardar costeo
      if (sId === 6 && selectedCostingData.value?.products?.length) {
        await saveCostingModule(dni, {
          products: selectedCostingData.value.products,
          serviceLaborSettings: selectedCostingData.value.serviceLaborSettings
        });
      }

      // 2. Si es Sesión 7, guardar plan de inversión con trazabilidad de borrador
      if (sId === 7 && selectedInvestmentData.value?.seedCapitalInvestmentPlan) {
        const currentPlan = selectedInvestmentData.value.seedCapitalInvestmentPlan;
        const previousVersion = Number(currentPlan.audit?.version || 0);
        const resolvedCeiling = Number(selectedInvestmentData.value.ceiling || activeCohortCeiling.value || 3000.0);

        currentPlan.audit = {
          lastModifiedAt: new Date().toISOString(),
          lastModifiedBy: {
            email: reviewer,
            displayName: facilitatorUser.value?.displayName || reviewer,
            uid: facilitatorUser.value?.uid || 'facilitator-uid',
            role: 'facilitator'
          },
          reviewStatus: 'pendiente_revision',
          cohortCeilingApplied: resolvedCeiling,
          version: previousVersion + 1,
          changeSummary: 'Ajuste de borrador de ítems y financiamiento en mesa técnica.'
        };

        await saveCostingModule(dni, {
          seedCapitalInvestmentPlan: currentPlan
        });
      }

      // 3. Guardar borrador de la sección
      await savePlanSectionReview(dni, sId, secKey, fieldsToSave, reviewer, false);

      for (const f of fieldsToSave) {
        if (f.status !== 'aprobado') {
          f.status = 'pendiente_revision';
        }
      }

      const progressKey = `${dni}_S${sId}`;
      if (progressMap.value[progressKey] && progressMap.value[progressKey].state !== 'completado') {
        progressMap.value[progressKey].state = 'pendiente_revision';
      }

      drawerNotification.value = {
        type: 'success',
        message: 'Borrador guardado. La sesión permanece pendiente de visto bueno en el semáforo.'
      };
    } catch (err) {
      console.error('Error guardando borrador:', err);
      drawerNotification.value = {
        type: 'error',
        message: 'No fue posible guardar el borrador en Firestore.'
      };
    } finally {
      isSavingDraft.value = false;
    }
  }

  /**
   * Navega hacia el participante anterior o siguiente en la lista actual
   */
  function navigateSiblingParticipant(direction = 'next') {
    if (!selectedParticipant.value) return;

    const list = filteredParticipants.value;
    const currentIndex = list.findIndex((p) => p.dni === selectedParticipant.value.dni);
    if (currentIndex === -1) return;

    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0) targetIndex = list.length - 1;
    if (targetIndex >= list.length) targetIndex = 0;

    const nextParticipant = list[targetIndex];
    if (nextParticipant) {
      openReviewDrawer(nextParticipant, selectedSessionId.value);
    }
  }

  // ==========================================================================
  // INICIALIZACIÓN
  // ==========================================================================

  function initStore() {
    if (unsubAuth) unsubAuth();

    // Sincronizar inmediatamente con el usuario actual o en caché
    facilitatorUser.value = getCurrentFacilitator();

    // Escuchar cambios de autenticación reactivamente
    unsubAuth = subscribeToFacilitatorAuth((user) => {
      facilitatorUser.value = user;
      isAuthReady.value = true;
    });

    // Iniciar listeners de la cohorte
    startCohortRealtimeListeners();
  }

  async function logout() {
    await signOutFacilitator();
    facilitatorUser.value = null;
  }

  return {
    facilitatorUser,
    isAuthReady,
    activeCohortId,
    activeCohortCeiling,
    availableCohorts,
    cohortsConfig,
    participants,
    progressMap,
    isLoadingCohort,
    cohortError,
    searchQuery,
    focusedSession,
    statusFilter,
    isDrawerOpen,
    selectedParticipant,
    selectedSessionId,
    selectedSectionData,
    selectedCostingData,
    selectedInvestmentData,
    isLoadingSectionData,
    isSavingApproval,
    isSavingDraft,
    refiningFields,
    drawerNotification,
    filteredParticipants,
    cohortMetrics,
    initStore,
    switchCohort,
    addCohort,
    updateCohortCeiling,
    registerSingleParticipant,
    transferParticipant,
    removeParticipantFromCohort,
    deleteParticipant: removeParticipantFromCohort,
    openReviewDrawer,
    closeReviewDrawer,
    toggleInvestmentItemFinancing,
    updateFacilitatorInvestmentItem,
    addFacilitatorInvestmentItem,
    removeFacilitatorInvestmentItem,
    recomputeSelectedInvestmentData,
    setActiveCostingProductIndex,
    recomputeFacilitatorProduct,
    updateFacilitatorProductBatch,
    addFacilitatorCostingIngredient,
    updateFacilitatorCostingIngredient,
    removeFacilitatorCostingIngredient,
    addFacilitatorProduct,
    removeFacilitatorProduct,
    updateFacilitatorServiceLaborSettings,
    updateFacilitatorCommerceConfig,
    addFacilitatorServiceSupply,
    removeFacilitatorServiceSupply,
    refineFieldWithAI,
    saveAndApproveSection,
    saveDraftSection,
    navigateSiblingParticipant,
    getCellStatus,
    getSessionProgress,
    getCompletedSessionsCount,
    logout
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFacilitatorStore, import.meta.hot));
}

