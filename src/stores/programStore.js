import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '@/firebaseInit'
import { useAuthStore } from './authStore'
import { useUserStore } from './useUserStore'

export const useProgramStore = defineStore('program', () => {
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════
  const activePrograms = ref([])
  const currentProgram = ref(null)
  const currentProgramAssessments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ═══════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════
  const hasActiveProgram = computed(() => activePrograms.value.length > 0)

  const isParticipant = computed(() => {
    if (!currentProgram.value?.membership) return false
    return currentProgram.value.membership.status === 'active'
  })

  const currentProgramName = computed(() => {
    return currentProgram.value?.name || ''
  })

  const currentProgramOrganization = computed(() => {
    return currentProgram.value?.organizationName || ''
  })

  // ═══════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * ✅ ACCIÓN 1: Cargar programas activos del usuario
   * 
   * Busca en businesses/{businessId}.programs para obtener los programIds
   * y luego carga los detalles completos de cada programa
   */
  async function loadActivePrograms() {
    const authStore = useAuthStore()
    const userStore = useUserStore()

    if (!authStore.user?.uid) {
      console.warn('⚠️  Usuario no autenticado')
      activePrograms.value = []
      return
    }

    if (!userStore.currentBusiness?.businessId) {
      console.warn('⚠️  No hay business seleccionado')
      activePrograms.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log(`🔍 Cargando programas activos para business: ${userStore.currentBusiness.businessId}`)

      // 1. Obtener el documento del business para acceder al array programs
      const businessRef = doc(db, 'businesses', userStore.currentBusiness.businessId)
      const businessSnap = await getDoc(businessRef)

      if (!businessSnap.exists()) {
        console.warn('⚠️  Business no encontrado')
        activePrograms.value = []
        return
      }

      const businessData = businessSnap.data()
      const programIds = businessData.programs || []

      console.log(`📋 Business tiene ${programIds.length} programas asociados`)

      if (programIds.length === 0) {
        activePrograms.value = []
        return
      }

      // 2. Cargar datos completos de cada programa
      const programs = []

      for (const programId of programIds) {
        try {
          const programRef = doc(db, 'programs', programId)
          const programSnap = await getDoc(programRef)

          if (programSnap.exists()) {
            const programData = programSnap.data()

            // Verificar que el programa esté activo
            if (programData.isActive !== false) {
              // Buscar la membership info del usuario actual
              const memberInfo = programData.members?.find(
                m => m.userId === authStore.user.uid && m.businessId === userStore.currentBusiness.businessId
              )

              programs.push({
                id: programSnap.id,
                ...programData,
                membership: memberInfo || {
                  status: 'active',
                  joinedAt: programData.createdAt
                }
              })

              console.log(`✅ Programa cargado: ${programData.name}`)
            } else {
              console.warn(`⚠️  Programa ${programId} está inactivo`)
            }
          } else {
            console.warn(`⚠️  Programa ${programId} no existe`)
          }
        } catch (err) {
          console.error(`❌ Error cargando programa ${programId}:`, err)
        }
      }

      activePrograms.value = programs
      console.log(`✅ Total de ${programs.length} programas activos cargados`)

    } catch (err) {
      console.error('❌ Error cargando programas:', err)
      error.value = err.message
      activePrograms.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * ✅ ACCIÓN 2: Cargar detalle de un programa específico
   */
  async function loadProgram(programId) {
    const authStore = useAuthStore()
    const userStore = useUserStore()

    if (!authStore.user?.uid || !userStore.currentBusiness?.businessId) {
      throw new Error('Usuario o business no disponible')
    }

    loading.value = true
    error.value = null

    try {
      console.log(`🔍 Cargando programa: ${programId}`)

      // Cargar datos del programa
      const programRef = doc(db, 'programs', programId)
      const programSnap = await getDoc(programRef)

      if (!programSnap.exists()) {
        throw new Error('Programa no encontrado')
      }

      const programData = {
        id: programSnap.id,
        ...programSnap.data()
      }

      // Cargar membership del business actual
      const membershipRef = doc(
        db,
        'programs',
        programId,
        'memberships',
        userStore.currentBusiness.businessId
      )
      const membershipSnap = await getDoc(membershipRef)

      if (membershipSnap.exists()) {
        programData.membership = {
          id: membershipSnap.id,
          ...membershipSnap.data()
        }
        console.log(`✅ Membership encontrada (status: ${programData.membership.status})`)
      } else {
        console.warn(`⚠️  No se encontró membership para este business`)
      }

      currentProgram.value = programData
      console.log(`✅ Programa cargado: ${programData.name}`)

      return programData

    } catch (err) {
      console.error('❌ Error cargando programa:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * ✅ ACCIÓN 3: Unirse a un programa por código
   */
  async function joinProgramByCode(code) {
    const authStore = useAuthStore()
    const userStore = useUserStore()

    if (!code || !code.trim()) {
      throw new Error('Debes ingresar un código de invitación')
    }

    if (!userStore.currentBusiness) {
      throw new Error('Debes seleccionar un negocio primero')
    }

    loading.value = true
    error.value = null

    try {
      console.log(`🔐 Intentando unirse con código: ${code}`)

      // Verificación local: el business debe existir en userBusinesses
      const businessExists = userStore.userBusinesses.some(
        b => b.businessId === userStore.currentBusiness.businessId && b.activo
      )

      if (!businessExists) {
        throw new Error('No tienes acceso a este negocio')
      }

      // Verificar que sea gerente
      const currentBusiness = userStore.userBusinesses.find(
        b => b.businessId === userStore.currentBusiness.businessId
      )

      if (!currentBusiness) {
        throw new Error('No se encontró el negocio en tu lista de negocios')
      }

      if (currentBusiness.rol !== 'gerente') {
        throw new Error('Solo los gerentes pueden unir el negocio a programas')
      }

      // Llamar a Cloud Function
      const joinFunction = httpsCallable(functions, 'joinProgramByCode')

      const result = await joinFunction({
        code: code.trim().toUpperCase(),
        businessId: userStore.currentBusiness.businessId
      })

      console.log(`✅ Respuesta de Cloud Function:`, result.data)

      // Recargar programas activos
      await loadActivePrograms()

      return result.data

    } catch (err) {
      console.error('❌ Error uniéndose al programa:', err)

      // Extraer mensaje de error legible
      let errorMessage = 'Error al unirse al programa'

      if (err.code === 'functions/unauthenticated') {
        errorMessage = 'Debes iniciar sesión para continuar'
      } else if (err.code === 'functions/permission-denied') {
        errorMessage = err.message || 'No tienes permisos suficientes'
      } else if (err.code === 'functions/not-found') {
        errorMessage = err.message || 'Código inválido'
      } else if (err.code === 'functions/already-exists') {
        errorMessage = err.message || 'Ya estás en este programa'
      } else if (err.message) {
        errorMessage = err.message
      }

      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * ✅ ACCIÓN 4: Salirse de un programa (opt-out)
   */
  async function leaveProgram(programId) {
    const authStore = useAuthStore()
    const userStore = useUserStore()

    if (!userStore.currentBusiness?.businessId) {
      throw new Error('No hay negocio seleccionado')
    }

    loading.value = true
    error.value = null

    try {
      console.log(`👋 Saliendo del programa: ${programId}`)

      const now = Timestamp.now()

      // Actualizar membership
      const membershipRef = doc(
        db,
        'programs',
        programId,
        'memberships',
        userStore.currentBusiness.businessId
      )

      await updateDoc(membershipRef, {
        status: 'left',
        leftAt: now
      })

      console.log(`✅ Membership actualizada`)

      // Actualizar índice en user
      const indexRef = doc(
        db,
        'users',
        authStore.user.uid,
        'programs',
        programId
      )

      await updateDoc(indexRef, {
        status: 'left',
        leftAt: now
      })

      console.log(`✅ Índice actualizado`)

      // Recargar programas activos
      await loadActivePrograms()

      // Limpiar programa actual si es el que se abandonó
      if (currentProgram.value?.id === programId) {
        currentProgram.value = null
        currentProgramAssessments.value = []
      }

      console.log(`✅ Salida exitosa del programa`)

    } catch (err) {
      console.error('❌ Error saliendo del programa:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * ✅ ACCIÓN 5: Cargar evaluaciones (assessments)
   */
  async function loadAssessments(programId) {
    const userStore = useUserStore()

    if (!userStore.currentBusiness?.businessId) {
      throw new Error('No hay negocio seleccionado')
    }

    try {
      console.log(`📋 Cargando evaluaciones para programa: ${programId}`)

      const assessmentsRef = collection(
        db,
        'programs',
        programId,
        'memberships',
        userStore.currentBusiness.businessId,
        'assessments'
      )

      const q = query(assessmentsRef, orderBy('submittedAt', 'desc'))
      const snapshot = await getDocs(q)

      const assessments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      currentProgramAssessments.value = assessments
      console.log(`✅ ${assessments.length} evaluaciones cargadas`)

      return assessments

    } catch (err) {
      console.error('❌ Error cargando evaluaciones:', err)
      throw err
    }
  }

  /**
   * ✅ ACCIÓN 6: Guardar nueva evaluación
   */
  async function submitAssessment(programId, assessmentData) {
    const authStore = useAuthStore()
    const userStore = useUserStore()

    if (!userStore.currentBusiness?.businessId) {
      throw new Error('No hay negocio seleccionado')
    }

    try {
      console.log(`💾 Guardando evaluación para programa: ${programId}`)

      const assessmentsRef = collection(
        db,
        'programs',
        programId,
        'memberships',
        userStore.currentBusiness.businessId,
        'assessments'
      )

      const docRef = await addDoc(assessmentsRef, {
        ...assessmentData,
        submittedBy: authStore.user.uid,
        submittedAt: serverTimestamp()
      })

      console.log(`✅ Evaluación guardada con ID: ${docRef.id}`)

      // Recargar evaluaciones
      await loadAssessments(programId)

      return docRef.id

    } catch (err) {
      console.error('❌ Error guardando evaluación:', err)
      throw err
    }
  }

  /**
   * ✅ ACCIÓN 7: Limpiar estado
   */
  function clearProgramData() {
    activePrograms.value = []
    currentProgram.value = null
    currentProgramAssessments.value = []
    error.value = null
  }

  // ═══════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════
  return {
    // State
    activePrograms,
    currentProgram,
    currentProgramAssessments,
    loading,
    error,

    // Getters
    hasActiveProgram,
    isParticipant,
    currentProgramName,
    currentProgramOrganization,

    // Actions
    loadActivePrograms,
    loadProgram,
    joinProgramByCode,
    leaveProgram,
    loadAssessments,
    submitAssessment,
    clearProgramData
  }
})
