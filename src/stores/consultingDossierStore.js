import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebaseInit'
import { useAuthStore } from './authStore'

export const CONSULTING_DOSSIER_STEPS = [
  's0_in_progress',
  's0_completed',
  'c1_in_progress',
  's1_completed',
  'c1_completed',
  'c2_in_progress',
  's3_completed',
  'c2_completed',
  'c3_in_progress',
  's5_completed',
  's6_completed',
  'closed',
]

export const CONSULTING_DOSSIER_STEP_LABELS = {
  s0_in_progress: 'S0 en progreso',
  s0_completed: 'S0 completada',
  c1_in_progress: 'Ciclo 1 en progreso',
  s1_completed: 'Sesión 1 completada',
  c1_completed: 'Ciclo 1 completado',
  c2_in_progress: 'Ciclo 2 en progreso',
  s3_completed: 'Sesión 3 completada',
  c2_completed: 'Ciclo 2 completado',
  c3_in_progress: 'Ciclo 3 en progreso',
  s5_completed: 'Sesión 5 completada',
  s6_completed: 'Evaluación final completada',
  closed: 'Expediente cerrado',
}

export const WALA_EVALUATION_TEMPLATE = [
  {
    key: 'negocioFamilia',
    label: 'Negocios y familia',
    indicators: [
      'Se paga un salario',
      'Paga salario a familiares trabajadores',
      'No retira dinero de la empresa sin control',
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    indicators: [
      'Conoce a sus clientes y necesidades',
      'Promueve el negocio y sus productos',
      'Comercializa de forma competitiva',
    ],
  },
  {
    key: 'compras',
    label: 'Compras',
    indicators: [
      'Recolecta cotizaciones de varios proveedores',
      'Verifica bienes en la entrega',
      'Planifica el volumen de compras',
    ],
  },
  {
    key: 'controlStock',
    label: 'Control de stock',
    indicators: [
      'Mantiene registros de stock actualizados',
      'Hace renovación regular de stock',
      'Evita sobre/sub-stock y defectuosos',
    ],
  },
  {
    key: 'costeo',
    label: 'Costeo',
    indicators: [
      'Calcula costos de materiales directos',
      'Calcula costos de mano de obra directa',
      'Calcula costos indirectos',
    ],
  },
  {
    key: 'registros',
    label: 'Mantenimiento de registros',
    indicators: [
      'Mantiene libros de registro actualizados',
      'Mantiene registro de cuentas de clientes',
      'Calcula ganancias y pérdidas regularmente',
    ],
  },
  {
    key: 'planificacion',
    label: 'Planificación',
    indicators: [
      'Proyecta ventas y costos',
      'Planifica el flujo de caja',
      'Sigue y ajusta el plan de negocio',
    ],
  },
]

function createEmptyAssessment() {
  const assessment = {}

  WALA_EVALUATION_TEMPLATE.forEach((area) => {
    assessment[area.key] = {
      indicators: area.indicators.map(() => null),
      total: 0,
      comment: '',
    }
  })

  return assessment
}

export const useConsultingDossierStore = defineStore('consultingDossier', () => {
  const dossiers = ref([])
  const currentDossier = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const activeDossiers = computed(() => {
    return dossiers.value.filter((dossier) => dossier.isActive)
  })

  const dossiersByParticipant = computed(() => {
    const byParticipant = {}
    dossiers.value.forEach((dossier) => {
      if (!byParticipant[dossier.participantId]) {
        byParticipant[dossier.participantId] = dossier
      }
    })
    return byParticipant
  })

  function getStepLabel(step) {
    return CONSULTING_DOSSIER_STEP_LABELS[step] || step || 'Sin estado'
  }

  function getAllowedStepTransitions(step) {
    if (!step) return CONSULTING_DOSSIER_STEPS
    return CONSULTING_DOSSIER_STEPS
  }

  async function loadProgramDossiers(programId) {
    loading.value = true
    error.value = null

    try {
      const dossiersRef = collection(db, 'programs', programId, 'consultingDossiers')
      const q = query(dossiersRef, orderBy('updatedAt', 'desc'))
      const snapshot = await getDocs(q)

      dossiers.value = snapshot.docs.map((dossierDoc) => ({
        id: dossierDoc.id,
        ...dossierDoc.data(),
      }))

      return dossiers.value
    } catch (err) {
      console.error('❌ Error al cargar expedientes de consulting:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadDossier(programId, dossierId) {
    loading.value = true
    error.value = null

    try {
      const dossierRef = doc(db, 'programs', programId, 'consultingDossiers', dossierId)
      const snapshot = await getDoc(dossierRef)

      if (!snapshot.exists()) {
        throw new Error('Expediente no encontrado')
      }

      currentDossier.value = {
        id: snapshot.id,
        ...snapshot.data(),
      }

      return currentDossier.value
    } catch (err) {
      console.error('❌ Error al cargar expediente:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createDossier(programId, participant) {
    const authStore = useAuthStore()
    const creatorId = authStore.user?.uid

    if (!creatorId) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const dossiersRef = collection(db, 'programs', programId, 'consultingDossiers')

      const existingQ = query(
        dossiersRef,
        where('participantId', '==', participant.userId),
        where('isActive', '==', true),
        limit(1),
      )
      const existingSnapshot = await getDocs(existingQ)

      if (!existingSnapshot.empty) {
        return {
          id: existingSnapshot.docs[0].id,
          ...existingSnapshot.docs[0].data(),
        }
      }

      const newDossier = {
        participantId: participant.userId,
        participantName: participant.profileUser?.name || participant.userName || 'Sin nombre',
        businessId: participant.businessId || '',
        businessName: participant.businessProfile?.businessName || participant.businessProfile?.businessName || participant.businessName || '',
        facilitatorId: creatorId,
        createdBy: creatorId,
        isActive: true,
        currentStep: 's0_in_progress',
        riskLevel: 'low',
        timeline: [
          {
            step: 's0_in_progress',
            changedBy: creatorId,
            changedAt: Timestamp.now(),
          },
        ],
        metrics: {
          completionRate: 0,
          scoreDelta: 0,
          stagnation: false,
        },
        stageData: {
          s0: {
            completed: false,
            entrepreneurNotes: '',
            criticalAreas: [],
            preScore: null,
            assessment: createEmptyAssessment(),
          },
          c1: {
            completed: false,
            planActions: [],
            followUp: [],
          },
          c2: {
            completed: false,
            planActions: [],
            followUp: [],
          },
          c3: {
            completed: false,
            planActions: [],
            followUp: [],
          },
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(dossiersRef, newDossier)

      const createdDossier = {
        id: docRef.id,
        ...newDossier,
      }

      dossiers.value = [createdDossier, ...dossiers.value]

      return createdDossier
    } catch (err) {
      console.error('❌ Error al crear expediente:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateDossierStep(programId, dossierId, nextStep) {
    const authStore = useAuthStore()
    const updaterId = authStore.user?.uid

    if (!updaterId) {
      throw new Error('Usuario no autenticado')
    }

    const dossier = dossiers.value.find((item) => item.id === dossierId) || currentDossier.value
    if (!dossier) {
      throw new Error('Expediente no encontrado en memoria')
    }

    loading.value = true
    error.value = null

    try {
      const dossierRef = doc(db, 'programs', programId, 'consultingDossiers', dossierId)

      await updateDoc(dossierRef, {
        currentStep: nextStep,
        isActive: nextStep !== 'closed',
        updatedAt: serverTimestamp(),
        updatedBy: updaterId,
        timeline: arrayUnion({
          step: nextStep,
          changedBy: updaterId,
          changedAt: Timestamp.now(),
        }),
      })

      const updateLocal = (item) => {
        if (item.id !== dossierId) return item
        return {
          ...item,
          currentStep: nextStep,
          isActive: nextStep !== 'closed',
          updatedBy: updaterId,
          updatedAt: Timestamp.now(),
          timeline: [
            ...(item.timeline || []),
            {
              step: nextStep,
              changedBy: updaterId,
              changedAt: Timestamp.now(),
            },
          ],
        }
      }

      dossiers.value = dossiers.value.map(updateLocal)
      if (currentDossier.value?.id === dossierId) {
        currentDossier.value = updateLocal(currentDossier.value)
      }
    } catch (err) {
      console.error('❌ Error al actualizar estado del expediente:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function saveS0Assessment(programId, dossierId, payload) {
    const authStore = useAuthStore()
    const updaterId = authStore.user?.uid

    if (!updaterId) {
      throw new Error('Usuario no autenticado')
    }

    const dossier = dossiers.value.find((item) => item.id === dossierId) || currentDossier.value
    if (!dossier) {
      throw new Error('Expediente no encontrado en memoria')
    }

    const currentStageData = dossier.stageData || {}
    const nextS0 = {
      ...(currentStageData.s0 || {}),
      completed: payload.completed ?? false,
      entrepreneurNotes: payload.entrepreneurNotes || '',
      criticalAreas: payload.criticalAreas || [],
      preScore: payload.preScore ?? null,
      assessment: payload.assessment || createEmptyAssessment(),
      updatedAt: Timestamp.now(),
      updatedBy: updaterId,
    }

    const nextStageData = {
      ...currentStageData,
      s0: nextS0,
    }

    loading.value = true
    error.value = null

    try {
      const dossierRef = doc(db, 'programs', programId, 'consultingDossiers', dossierId)
      await updateDoc(dossierRef, {
        stageData: nextStageData,
        updatedAt: serverTimestamp(),
        updatedBy: updaterId,
      })

      const updateLocal = (item) => {
        if (item.id !== dossierId) return item
        return {
          ...item,
          stageData: nextStageData,
          updatedAt: Timestamp.now(),
          updatedBy: updaterId,
        }
      }

      dossiers.value = dossiers.value.map(updateLocal)
      if (currentDossier.value?.id === dossierId) {
        currentDossier.value = updateLocal(currentDossier.value)
      }
    } catch (err) {
      console.error('❌ Error guardando evaluación S0:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function getDossierByParticipant(participantId) {
    return dossiers.value.find((dossier) => dossier.participantId === participantId && dossier.isActive)
  }

  return {
    dossiers,
    currentDossier,
    loading,
    error,
    activeDossiers,
    dossiersByParticipant,
    getStepLabel,
    getAllowedStepTransitions,
    loadProgramDossiers,
    loadDossier,
    createDossier,
    updateDossierStep,
    saveS0Assessment,
    getDossierByParticipant,
  }
})
