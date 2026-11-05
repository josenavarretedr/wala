import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getParticipant,
  saveParticipant,
  getSessionProgress,
  saveSessionProgress,
  getBusinessPlanSection,
  saveBusinessPlanSection,
  getCostingModule,
  saveCostingModule
} from '@/services/db/indexedDB';
import { enqueueMutation, processQueue } from '@/services/sync/syncQueue';
import {
  getRemoteParticipantData,
  getCohortDoc,
  getBusinessDoc,
  getParticipantByBusinessId
} from '@/services/db/firestore';

const ACTIVE_DNI_KEY = 'emprendeapp_active_dni';

export const useAuthStore = defineStore('auth', () => {
  const currentParticipant = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const isHydrated = ref(false);

  const isAuthenticated = computed(() => !!currentParticipant.value);
  const participantName = computed(() => {
    if (!currentParticipant.value) return '';
    const personal = currentParticipant.value.personalInfo;
    if (personal?.firstName) {
      return `${personal.firstName} ${personal.lastName || ''}`.trim();
    }
    return `Participante ${currentParticipant.value.dni}`;
  });
  const businessName = computed(() => {
    return currentParticipant.value?.businessBasicInfo?.commercialName || 'Mi Emprendimiento';
  });

  /**
   * Hidrata la sesión activa desde IndexedDB al arrancar la aplicación
   */
  async function hydrateSession() {
    if (isHydrated.value) return;
    isLoading.value = true;
    try {
      const activeDni = localStorage.getItem(ACTIVE_DNI_KEY);
      if (activeDni) {
        const participant = await getParticipant(activeDni);
        if (participant) {
          currentParticipant.value = participant;
        } else {
          localStorage.removeItem(ACTIVE_DNI_KEY);
        }
      }
    } catch (err) {
      console.error('[AuthStore] Error al hidratar sesión:', err);
    } finally {
      isLoading.value = false;
      isHydrated.value = true;
    }
  }

  /**
   * Reconcilia datos locales con Firestore/Emulador basándose en marcas de tiempo (updatedAt)
   */
  async function reconcileWithRemote(dni) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    try {
      console.info(`[AuthStore] Iniciando reconciliación remota para DNI ${dni}...`);
      const remote = await getRemoteParticipantData(dni);

      if (!remote?.participant) {
        console.info('[AuthStore] No se encontró árbol remoto previo. Los datos locales prevalecen.');
        // Despachar mutaciones pendientes locales si las hay
        processQueue();
        return;
      }

      // 1. Reconciliación del Participante
      const localPart = currentParticipant.value || (await getParticipant(dni));
      const remoteUpdated = new Date(remote.participant.syncMetadata?.updatedAt || 0).getTime();
      const localUpdated = new Date(localPart?.syncMetadata?.updatedAt || 0).getTime();

      if (!localPart || remoteUpdated > localUpdated) {
        console.info('[AuthStore] Perfil remoto es más reciente. Actualizando IndexedDB y Pinia...');
        await saveParticipant(remote.participant);
        currentParticipant.value = remote.participant;
      }

      // 2. Reconciliación de Progreso de Sesiones (session_progress)
      if (Array.isArray(remote.sessionProgress)) {
        for (const remSession of remote.sessionProgress) {
          const sId = remSession.sessionId;
          const locSession = await getSessionProgress(dni, sId);

          const remTime = new Date(
            remSession.formSubmission?.submittedAt ||
              remSession.quizAssessment?.lastAttemptAt ||
              remSession.gatekeeping?.microlearningCompletedAt ||
              0
          ).getTime();

          const locTime = new Date(
            locSession?.formSubmission?.submittedAt ||
              locSession?.quizAssessment?.lastAttemptAt ||
              locSession?.gatekeeping?.microlearningCompletedAt ||
              0
          ).getTime();

          if (!locSession || remTime > locTime) {
            await saveSessionProgress(remSession);
          }
        }
      }

      // 3. Reconciliación de Secciones de Plan (business_plan_sections)
      if (Array.isArray(remote.planSections)) {
        for (const remSection of remote.planSections) {
          const locSection = await getBusinessPlanSection(dni, remSection.sessionId, remSection.sectionKey);
          const remTime = new Date(remSection.updatedAt || 0).getTime();
          const locTime = new Date(locSection?.updatedAt || 0).getTime();

          if (!locSection || remTime > locTime) {
            await saveBusinessPlanSection(remSection);
          }
        }
      }

      // 4. Reconciliación del Módulo de Costeo (costing_module)
      if (remote.costingModule) {
        const locCosting = await getCostingModule(dni);
        const remTime = new Date(remote.costingModule.updatedAt || 0).getTime();
        const locTime = new Date(locCosting?.updatedAt || 0).getTime();

        if (!locCosting || remTime > locTime) {
          await saveCostingModule(remote.costingModule);
        }
      }

      // Procesar cualquier cola pendiente tras reconciliar
      processQueue();
    } catch (err) {
      console.warn('[AuthStore] Reconciliación remota no completada (continuando offline):', err.message || err);
    }
  }

  /**
   * Valida e inicia sesión por DNI o Cédula (8 a 12 caracteres alfanuméricos)
   */
  async function loginWithDni(rawDni) {
    isLoading.value = true;
    error.value = null;

    try {
      const cleanedDni = String(rawDni || '').trim();
      const regex = /^[a-zA-Z0-9]{8,12}$/;

      if (!regex.test(cleanedDni)) {
        error.value = 'El DNI o Cédula debe contener entre 8 y 12 caracteres numéricos o alfanuméricos.';
        return { success: false, message: error.value };
      }

      // 1. Buscar primero en la base local de IndexedDB
      let participant = await getParticipant(cleanedDni);

      // 2. Si no está en IndexedDB y hay conexión, buscar el participante pre-registrado en Firestore
      if (!participant && typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          console.info(`[AuthStore] Buscando participante pre-registrado en Firestore para DNI ${cleanedDni}...`);
          const remote = await getRemoteParticipantData(cleanedDni);
          if (remote?.participant) {
            participant = remote.participant;
            await saveParticipant(participant);

            // Cargar en IndexedDB el progreso de sesiones pre-registrado si existe
            if (Array.isArray(remote.sessionProgress)) {
              for (const remSession of remote.sessionProgress) {
                await saveSessionProgress(remSession);
              }
            }
            if (Array.isArray(remote.planSections)) {
              for (const remSection of remote.planSections) {
                await saveBusinessPlanSection(remSection);
              }
            }
            if (remote.costingModule) {
              await saveCostingModule(remote.costingModule);
            }
          }
        } catch (remoteErr) {
          console.warn('[AuthStore] Error buscando datos remotos en Firestore (continuando offline):', remoteErr);
        }
      }

      // 3. Si aún no existe en IndexedDB ni en Firestore, crear un nuevo registro local offline vinculado al dispositivo
      if (!participant) {
        const now = new Date().toISOString();
        participant = {
          dni: cleanedDni,
          documentType: cleanedDni.length === 8 && /^\d+$/.test(cleanedDni) ? 'DNI' : 'Cédula',
          cohortId: 'COHORTE-LOCAL-OFFLINE',
          organizationId: 'ONG-LOCAL',
          personalInfo: {
            firstName: '',
            lastName: '',
            phone: '',
            gender: '',
            location: {
              department: '',
              province: '',
              district: '',
              address: ''
            }
          },
          businessBasicInfo: {
            commercialName: '',
            businessNature: 'produccion',
            sector: '',
            subSector: '',
            operatingStatus: 'idea',
            monthsInOperation: 0
          },
          programStatus: {
            currentSession: 1,
            overallProgressPercentage: 0,
            isFlaggedForReview: false,
            status: 'activo'
          },
          syncMetadata: {
            createdAt: now,
            updatedAt: now,
            lastSyncAt: null,
            localSyncStatus: 'pending'
          }
        };

        // Guardar inmediatamente en IndexedDB (Offline-First)
        await saveParticipant(participant);

        // Encolar mutación en cola de sincronización solo si fue creado desde cero
        await enqueueMutation({
          collection: 'participants',
          docId: cleanedDni,
          action: 'SET',
          payload: participant
        });
      }

      // Establecer sesión activa
      currentParticipant.value = participant;
      localStorage.setItem(ACTIVE_DNI_KEY, cleanedDni);

      // Reconciliar con Firestore remoto si hay conexión
      reconcileWithRemote(cleanedDni).catch((recErr) => {
        console.warn('[AuthStore] Error en background reconciliation:', recErr);
      });

      return { success: true, participant };
    } catch (err) {
      console.error('[AuthStore] Error en loginWithDni:', err);
      error.value = 'Ocurrió un error inesperado al acceder. Inténtalo nuevamente.';
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Resuelve el techo de capital semilla de la cohorte del participante
   * desde Firestore o la caché local offline
   */
  async function resolveParticipantCohortCeiling(cohortId) {
    const cId = String(cohortId || currentParticipant.value?.cohortId || '').trim().toUpperCase();
    if (!cId) return 3000.0;

    // 1. Intentar leer de localStorage cache
    const cacheKey = `emprendeapp_cohort_ceiling_${cId}`;
    const cached = localStorage.getItem(cacheKey);
    let ceiling = cached ? Number(cached) : null;

    // 2. Si hay conexión, intentar consultar a Firestore para actualizar cache
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const doc = await getCohortDoc(cId);
        if (doc?.seedCapitalCeiling) {
          ceiling = Number(doc.seedCapitalCeiling);
          localStorage.setItem(cacheKey, String(ceiling));
        }
      } catch (err) {
        console.warn(`[AuthStore] Error obteniendo cohorte ${cId} desde Firestore:`, err);
      }
    }

    return ceiling || 3000.0;
  }

  /**
   * Inicia sesión o asocia un plan contextualizado desde Wala ERP (MicroApps)
   */
  async function loginWithBusinessContext(businessId, userId) {
    if (!businessId) return { success: false };
    isLoading.value = true;
    error.value = null;

    try {
      const cleanBusinessId = String(businessId).trim();

      // 1. Verificar si ya existe un participante vinculado a este businessId
      let participant = await getParticipantByBusinessId(cleanBusinessId);

      // 2. Si no existe, consultar los datos del negocio en Wala
      if (!participant && typeof navigator !== 'undefined' && navigator.onLine) {
        const businessDoc = await getBusinessDoc(cleanBusinessId);
        const dniKey = `WALA_${cleanBusinessId.slice(0, 8)}`;
        const now = new Date().toISOString();

        participant = {
          dni: dniKey,
          documentType: 'DNI',
          businessId: cleanBusinessId,
          userId: userId || businessDoc?.ownerId || null,
          cohortId: 'WALA-DIRECT',
          organizationId: 'WALA-LAT',
          origin: 'wala_app',
          personalInfo: {
            firstName: businessDoc?.ownerName || '',
            lastName: '',
            phone: businessDoc?.phone || '',
            gender: '',
            location: {
              department: '',
              province: '',
              district: '',
              address: businessDoc?.address || ''
            }
          },
          businessBasicInfo: {
            commercialName: businessDoc?.commercialName || businessDoc?.name || 'Mi Negocio en Wala',
            businessNature: businessDoc?.businessNature || 'produccion',
            sector: businessDoc?.industry || 'General',
            subSector: '',
            operatingStatus: 'operando',
            monthsInOperation: 6
          },
          programStatus: {
            currentSession: 1,
            overallProgressPercentage: 0,
            isFlaggedForReview: false,
            status: 'activo'
          },
          syncMetadata: {
            createdAt: now,
            updatedAt: now,
            lastSyncAt: now,
            localSyncStatus: 'synced'
          }
        };

        await saveParticipant(participant);
        await enqueueMutation({
          collection: 'participants',
          docId: dniKey,
          action: 'SET',
          payload: participant
        });
      }

      if (participant) {
        await saveParticipant(participant);
        currentParticipant.value = participant;
        localStorage.setItem(ACTIVE_DNI_KEY, participant.dni);
        reconcileWithRemote(participant.dni).catch(() => {});
        return { success: true, participant };
      }

      return { success: false, message: 'No se pudo cargar el negocio de Wala.' };
    } catch (err) {
      console.error('[AuthStore] Error en loginWithBusinessContext:', err);
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Cierra la sesión activa en el dispositivo
   */
  function logout() {
    currentParticipant.value = null;
    localStorage.removeItem(ACTIVE_DNI_KEY);
  }

  return {
    currentParticipant,
    isAuthenticated,
    isLoading,
    isHydrated,
    error,
    participantName,
    businessName,
    hydrateSession,
    reconcileWithRemote,
    loginWithDni,
    loginWithBusinessContext,
    resolveParticipantCohortCeiling,
    logout
  };
});
