import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebaseInit'
import { useAuthStore } from './authStore'

// ─── Constantes de ciclos ─────────────────────────────────────────────────────

const CONSULTING_CYCLE_KEYS = ['c1', 'c2', 'c3']
const CONSULTING_CYCLE_DEPENDENCIES = {
  c1: ['c2', 'c3'],
  c2: ['c3'],
  c3: [],
}

// ─── Helpers de ciclos ────────────────────────────────────────────────────────

function normalizeCycle(cycle, cycleKey) {
  const key = cycle?.key || cycleKey
  return {
    ...(cycle || {}),
    key,
    planAreas: Array.isArray(cycle?.planAreas) ? cycle.planAreas : [],
    reviewRows: Array.isArray(cycle?.reviewRows) ? cycle.reviewRows : [],
    completedByFacilitator: Boolean(cycle?.completedByFacilitator),
    completedAt: cycle?.completedAt || null,
    completedBy: cycle?.completedBy || null,
  }
}

function normalizeConsultingCycles(cycles) {
  const source = Array.isArray(cycles) ? cycles : []
  const byKey = source.reduce((acc, cycle) => {
    if (typeof cycle?.key !== 'string' || !cycle.key) return acc
    acc[cycle.key] = normalizeCycle(cycle, cycle.key)
    return acc
  }, {})

  return CONSULTING_CYCLE_KEYS.map((cycleKey) => {
    return byKey[cycleKey] || normalizeCycle({ key: cycleKey }, cycleKey)
  })
}

function computeCycleMetadata(cycles) {
  const normalized = normalizeConsultingCycles(cycles)
  const firstPending = normalized.find((c) => !c.completedByFacilitator)

  return {
    currentCycleKey: firstPending?.key || null,
    isFullyCompleted: normalized.every((c) => c.completedByFacilitator),
    cycleOrder: [...CONSULTING_CYCLE_KEYS],
    dependencies: { ...CONSULTING_CYCLE_DEPENDENCIES },
    completedByCycle: normalized.reduce((acc, c) => {
      acc[c.key] = c.completedByFacilitator
      return acc
    }, {}),
  }
}

function countCycleActionsWithoutStatus(cycle) {
  if (!Array.isArray(cycle?.reviewRows)) return 0
  return cycle.reviewRows.filter((row) => {
    const hasAction = typeof row?.action === 'string' && row.action.trim().length > 0
    if (!hasAction) return false
    return !(typeof row?.status === 'string' && row.status.trim().length > 0)
  }).length
}

// ─── Ruta Firestore ───────────────────────────────────────────────────────────
// businesses/{businessId}/consulting/dossier  (doc único por negocio)

function dossierRef(businessId) {
  return doc(db, 'businesses', businessId, 'consulting', 'dossier')
}

function businessRef(businessId) {
  return doc(db, 'businesses', businessId)
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAdminBusinessConsultingStoreV2 = defineStore(
  'adminBusinessConsultingV2',
  () => {
    const currentDossier = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // ── loadDossier ─────────────────────────────────────────────────────────

    async function loadDossier(businessId) {
      loading.value = true
      error.value = null

      try {
        const snapshot = await getDoc(dossierRef(businessId))

        if (!snapshot.exists()) {
          // Devuelve un dossier vacío para que la vista pueda hidratar con defaults
          currentDossier.value = {
            businessId,
            stageData: {},
          }
          return currentDossier.value
        }

        currentDossier.value = {
          id: snapshot.id,
          ...snapshot.data(),
        }

        return currentDossier.value
      } catch (err) {
        console.error('[AdminBusinessConsultingV2] Error al cargar dossier:', err)
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    // ── saveProgramConsultingDossier ────────────────────────────────────────
    // Firma compatible con AdminBusinessConsulting.vue

    async function saveProgramConsultingDossier(businessId, payload) {
      const authStore = useAuthStore()
      const updaterId = authStore.user?.uid
      if (!updaterId) throw new Error('Usuario no autenticado')

      loading.value = true
      error.value = null

      try {
        const normalizedCycles = normalizeConsultingCycles(
          payload?.consultingCycles,
        )

        const dossierData = {
          businessId,
          businessName: payload?.general?.businessName || '',
          sector: payload?.general?.sector || '',
          participantName: payload?.general?.entrepreneurName || '',
          contact: payload?.general?.contact || '',
          facilitatorName: payload?.general?.facilitatorName || '',
          programName: payload?.general?.programName || '',
          startDate: payload?.general?.startDate || '',
          stageData: {
            programConsultingDossier: {
              diagnosticScores: payload?.diagnosticScores || {},
              criticalAreas: payload?.criticalAreas || [],
              consultingCycles: normalizedCycles,
              finalEvaluationByArea: payload?.finalEvaluationByArea || {},
              closingSummary: payload?.closingSummary || {},
              cycleMetadata: computeCycleMetadata(normalizedCycles),
            },
          },
          updatedAt: serverTimestamp(),
          updatedBy: updaterId,
        }

        // setDoc con merge para no pisar campos existentes
        await setDoc(dossierRef(businessId), dossierData, { merge: true })

        // Marcar el negocio principal como que tiene consulting
        await updateDoc(businessRef(businessId), {
          hasConsulting: true,
          updatedAt: serverTimestamp(),
        })

        // Actualizar estado local
        currentDossier.value = {
          ...currentDossier.value,
          ...dossierData,
        }

        return currentDossier.value
      } catch (err) {
        console.error('[AdminBusinessConsultingV2] Error al guardar dossier:', err)
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    // ── markCycleCompleted ──────────────────────────────────────────────────

    async function markCycleCompleted(businessId, cycleKey) {
      const authStore = useAuthStore()
      const updaterId = authStore.user?.uid
      if (!updaterId) throw new Error('Usuario no autenticado')

      loading.value = true
      error.value = null

      try {
        // Cargar dossier actual
        const snapshot = await getDoc(dossierRef(businessId))
        if (!snapshot.exists()) throw new Error('Dossier no encontrado')

        const data = snapshot.data()
        const consultingCycles = data?.stageData?.programConsultingDossier?.consultingCycles || []
        const normalized = normalizeConsultingCycles(consultingCycles)

        const cycleIndex = normalized.findIndex((c) => c.key === cycleKey)
        if (cycleIndex === -1) throw new Error(`Ciclo ${cycleKey} no encontrado`)

        const missingStatuses = countCycleActionsWithoutStatus(normalized[cycleIndex])

        normalized[cycleIndex] = {
          ...normalized[cycleIndex],
          completedByFacilitator: true,
          completedAt: new Date().toISOString(),
          completedBy: updaterId,
        }

        const cycleMetadata = computeCycleMetadata(normalized)

        await updateDoc(dossierRef(businessId), {
          'stageData.programConsultingDossier.consultingCycles': normalized,
          'stageData.programConsultingDossier.cycleMetadata': cycleMetadata,
          updatedAt: serverTimestamp(),
          updatedBy: updaterId,
        })

        // Actualizar local
        if (currentDossier.value) {
          if (!currentDossier.value.stageData) currentDossier.value.stageData = {}
          if (!currentDossier.value.stageData.programConsultingDossier)
            currentDossier.value.stageData.programConsultingDossier = {}
          currentDossier.value.stageData.programConsultingDossier.consultingCycles = normalized
          currentDossier.value.stageData.programConsultingDossier.cycleMetadata = cycleMetadata
        }

        return { missingStatuses, cycleMetadata }
      } catch (err) {
        console.error('[AdminBusinessConsultingV2] Error marcando ciclo:', err)
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    // ── reopenCycleWithCascade ──────────────────────────────────────────────

    async function reopenCycleWithCascade(businessId, cycleKey) {
      const authStore = useAuthStore()
      const updaterId = authStore.user?.uid
      if (!updaterId) throw new Error('Usuario no autenticado')

      loading.value = true
      error.value = null

      try {
        const snapshot = await getDoc(dossierRef(businessId))
        if (!snapshot.exists()) throw new Error('Dossier no encontrado')

        const data = snapshot.data()
        const consultingCycles = data?.stageData?.programConsultingDossier?.consultingCycles || []
        const normalized = normalizeConsultingCycles(consultingCycles)

        // Calcular ciclos a reabrir (el actual + dependientes)
        const dependentKeys = CONSULTING_CYCLE_DEPENDENCIES[cycleKey] || []
        const keysToReopen = [cycleKey, ...dependentKeys]

        const reopenedCycleKeys = []

        normalized.forEach((cycle) => {
          if (keysToReopen.includes(cycle.key) && cycle.completedByFacilitator) {
            cycle.completedByFacilitator = false
            cycle.completedAt = null
            cycle.completedBy = null
            reopenedCycleKeys.push(cycle.key)
          }
        })

        const cycleMetadata = computeCycleMetadata(normalized)

        await updateDoc(dossierRef(businessId), {
          'stageData.programConsultingDossier.consultingCycles': normalized,
          'stageData.programConsultingDossier.cycleMetadata': cycleMetadata,
          updatedAt: serverTimestamp(),
          updatedBy: updaterId,
        })

        // Actualizar local
        if (currentDossier.value) {
          if (!currentDossier.value.stageData) currentDossier.value.stageData = {}
          if (!currentDossier.value.stageData.programConsultingDossier)
            currentDossier.value.stageData.programConsultingDossier = {}
          currentDossier.value.stageData.programConsultingDossier.consultingCycles = normalized
          currentDossier.value.stageData.programConsultingDossier.cycleMetadata = cycleMetadata
        }

        return { reopenedCycleKeys, cycleMetadata }
      } catch (err) {
        console.error('[AdminBusinessConsultingV2] Error reabriendo ciclo:', err)
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    return {
      currentDossier,
      loading,
      error,
      loadDossier,
      saveProgramConsultingDossier,
      markCycleCompleted,
      reopenCycleWithCascade,
    }
  },
)
