import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  addDoc,
  updateDoc,
  arrayUnion,
  increment,
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebaseInit'
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

    if (!authStore.user?.uid) {
      throw new Error('Usuario no disponible')
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

      // Cargar membership del business actual (solo si hay business seleccionado)
      if (userStore.currentBusiness?.businessId) {
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
      } else {
        console.log('ℹ️  No hay business seleccionado (modo facilitador)')
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
   * ✅ ACCIÓN 3: Unirse a un programa por código (NUEVA ESTRUCTURA centrada en USUARIO)
   * 
   * Crea documento en programs/{programId}/participants/{userId}
   * Ya NO usa array members[]
   */
  async function joinProgramByCode(code) {
    const authStore = useAuthStore()
    const userStore = useUserStore()

    if (!code || !code.trim()) {
      throw new Error('Debes ingresar un código de invitación')
    }

    if (!authStore.user?.uid) {
      throw new Error('Debes iniciar sesión para continuar')
    }

    if (!userStore.currentBusiness) {
      throw new Error('Debes seleccionar un negocio primero')
    }

    loading.value = true
    error.value = null

    try {
      console.log(`🔐 Intentando unirse con código: ${code}`)

      // 1. Verificar que sea gerente
      const currentBusiness = userStore.userBusinesses.find(
        b => b.businessId === userStore.currentBusiness.businessId
      )

      if (!currentBusiness) {
        throw new Error('No se encontró el negocio en tu lista de negocios')
      }

      if (currentBusiness.rol !== 'gerente') {
        throw new Error('Solo los gerentes pueden unir el negocio a programas')
      }

      const codeUpper = code.trim().toUpperCase()

      // 2. Buscar programa por código (codUser para participantes)
      const programsRef = collection(db, 'programs')
      const q = query(
        programsRef,
        where('codUser', '==', codeUpper),
        where('isActive', '==', true)
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        throw new Error('Código no válido o programa inactivo')
      }

      const programDoc = querySnapshot.docs[0]
      const programId = programDoc.id
      const programData = programDoc.data()

      console.log(`✅ Programa encontrado: ${programData.name}`)

      const userId = authStore.user.uid
      const businessId = userStore.currentBusiness.businessId

      // 3. 🆕 Verificar si ya está inscrito (en la nueva estructura)
      const participantRef = doc(db, 'programs', programId, 'participants', userId)
      const participantSnap = await getDoc(participantRef)

      if (participantSnap.exists()) {
        const existingData = participantSnap.data()
        if (existingData.status === 'active') {
          throw new Error('Ya estás inscrito en este programa')
        }
        // Si había salido antes, se puede reactivar
        console.log('⚠️ Usuario existía previamente, reactivando...')
      }

      // 4. 🆕 Crear documento en participants/{userId}
      const participantData = {
        userId,
        userEmail: authStore.user.email || '',
        userName: userStore.userProfile?.nombre || authStore.user.displayName || 'Usuario',
        businessId,
        businessName: userStore.currentBusiness.razonSocial || 'Sin nombre',
        role: 'participant',
        status: 'active',
        joinedAt: serverTimestamp(),
        currentPhase: programData.currentPhase || 'baseline',
        metadata: {
          totalActivitiesCompleted: 0,
          lastActivityAt: null,
          progressPercentage: 0,
          attendanceRate: 0
        }
      }

      await setDoc(participantRef, participantData, { merge: true })

      console.log(`✅ Participante creado en programs/${programId}/participants/${userId}`)

      // 5. Actualizar metadata del programa
      const programRef = doc(db, 'programs', programId)
      await updateDoc(programRef, {
        'metadata.totalParticipants': increment(1)
      })

      // 6. Actualizar documento del business con el programId
      const businessRef = doc(db, 'businesses', businessId)
      const businessSnap = await getDoc(businessRef)

      if (businessSnap.exists()) {
        const currentPrograms = businessSnap.data().programs || []
        if (!currentPrograms.includes(programId)) {
          await updateDoc(businessRef, {
            programs: arrayUnion(programId)
          })
          console.log(`✅ ProgramId agregado a businesses/${businessId}.programs`)
        }
      }

      console.log(`🎉 Te has unido exitosamente a "${programData.name}"`)

      // Recargar programas activos
      await loadActivePrograms()

      return {
        success: true,
        programId,
        programName: programData.name,
        organizationName: programData.organizationName
      }

    } catch (err) {
      console.error('❌ Error uniéndose al programa:', err)

      // Extraer mensaje de error legible
      let errorMessage = err.message || 'Error al unirse al programa'

      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * ✅ ACCIÓN 3B: Unirse a un programa como FACILITADOR (NUEVA ESTRUCTURA)
   * 
   * Crea documento en programs/{programId}/facilitators/{userId}
   */
  async function joinProgramAsFacilitator(code) {
    const authStore = useAuthStore()
    const userStore = useUserStore()

    if (!code || !code.trim()) {
      throw new Error('Debes ingresar un código de facilitador')
    }

    if (!authStore.user?.uid) {
      throw new Error('Debes iniciar sesión para continuar')
    }

    loading.value = true
    error.value = null

    try {
      console.log(`🔐 Intentando unirse como facilitador con código: ${code}`)

      const codeUpper = code.trim().toUpperCase()

      // 1. Buscar programa por código (codTeam para facilitadores)
      const programsRef = collection(db, 'programs')
      const q = query(
        programsRef,
        where('codTeam', '==', codeUpper),
        where('isActive', '==', true)
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        throw new Error('Código de facilitador no válido o programa inactivo')
      }

      const programDoc = querySnapshot.docs[0]
      const programId = programDoc.id
      const programData = programDoc.data()

      console.log(`✅ Programa encontrado: ${programData.name}`)

      const userId = authStore.user.uid

      // 2. 🆕 Verificar si ya está inscrito como facilitador
      const facilitatorRef = doc(db, 'programs', programId, 'facilitators', userId)
      const facilitatorSnap = await getDoc(facilitatorRef)

      if (facilitatorSnap.exists()) {
        const existingData = facilitatorSnap.data()
        if (existingData.status === 'active') {
          throw new Error('Ya estás inscrito como facilitador en este programa')
        }
        console.log('⚠️ Facilitador existía previamente, reactivando...')
      }

      // 3. 🆕 Crear documento en facilitators/{userId}
      const facilitatorData = {
        userId,
        userEmail: authStore.user.email || '',
        userName: userStore.userProfile?.nombre || authStore.user.displayName || 'Facilitador',
        role: 'facilitator',
        status: 'active',
        joinedAt: serverTimestamp(),
        permissions: {
          canCreateActivities: true,
          canGradeActivities: true,
          canManageParticipants: true
        }
      }

      await setDoc(facilitatorRef, facilitatorData, { merge: true })

      console.log(`✅ Facilitador creado en programs/${programId}/facilitators/${userId}`)

      // 4. Actualizar metadata del programa
      const programRef = doc(db, 'programs', programId)
      await updateDoc(programRef, {
        'metadata.totalFacilitators': increment(1)
      })

      console.log(`🎉 Te has unido como facilitador a "${programData.name}"`)

      // Recargar programas (si aplica para facilitadores)
      await loadFacilitatorPrograms()

      return {
        success: true,
        programId,
        programName: programData.name,
        organizationName: programData.organizationName
      }

    } catch (err) {
      console.error('❌ Error uniéndose como facilitador:', err)

      let errorMessage = err.message || 'Error al unirse como facilitador'

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
   * ✅ ACCIÓN 8: Cargar programas donde el usuario es facilitador (NUEVA ESTRUCTURA)
   * 
   * Busca en programs/{programId}/facilitators/{userId}
   */
  async function loadFacilitatorPrograms() {
    const authStore = useAuthStore()

    if (!authStore.user?.uid) {
      console.warn('⚠️  Usuario no autenticado')
      activePrograms.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const userId = authStore.user.uid
      console.log(`🔍 Cargando programas donde soy facilitador (userId: ${userId})`)

      // 1. Obtener todos los programas activos
      const programsRef = collection(db, 'programs')
      const q = query(programsRef, where('isActive', '!=', false))

      const querySnapshot = await getDocs(q)
      const programs = []

      // 2. Para cada programa, verificar si el usuario está en facilitators/
      for (const programDoc of querySnapshot.docs) {
        const programId = programDoc.id
        const programData = programDoc.data()

        try {
          // 🆕 Verificar en la nueva estructura facilitators/{userId}
          const facilitatorRef = doc(db, 'programs', programId, 'facilitators', userId)
          const facilitatorSnap = await getDoc(facilitatorRef)

          if (facilitatorSnap.exists()) {
            const facilitatorData = facilitatorSnap.data()

            // Solo incluir si está activo
            if (facilitatorData.status === 'active') {
              programs.push({
                id: programId,
                ...programData,
                facilitatorInfo: facilitatorData // Incluir info del facilitador
              })
              console.log(`✅ Programa encontrado: ${programData.name || programData.organizationName}`)
            }
          }
        } catch (err) {
          console.warn(`⚠️ Error verificando facilitador en programa ${programId}:`, err)
        }
      }

      activePrograms.value = programs
      console.log(`✅ Total de ${programs.length} programas como facilitador`)

    } catch (err) {
      console.error('❌ Error cargando programas del facilitador:', err)
      error.value = err.message
      activePrograms.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * ✅ ACCIÓN 9: Cargar programa actual (usado por FacilitatorLayout)
   */
  async function loadCurrentProgram(programId) {
    if (!programId) {
      currentProgram.value = null
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log(`🔍 Cargando programa actual: ${programId}`)

      const programRef = doc(db, 'programs', programId)
      const programSnap = await getDoc(programRef)

      if (!programSnap.exists()) {
        throw new Error('Programa no encontrado')
      }

      currentProgram.value = {
        id: programSnap.id,
        ...programSnap.data()
      }

      console.log(`✅ Programa actual cargado: ${currentProgram.value.name || currentProgram.value.organizationName}`)

    } catch (err) {
      console.error('❌ Error cargando programa actual:', err)
      error.value = err.message
      currentProgram.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * ✅ ACCIÓN 10: Cargar participantes de un programa (para facilitadores)
   * 
   * Obtiene la lista de negocios participantes con información enriquecida
   */
  async function loadProgramParticipants(programId) {
    loading.value = true
    error.value = null

    try {
      console.log(`👥 Cargando participantes del programa: ${programId}`)

      // 1. Obtener el programa para ver el array de members
      const programRef = doc(db, 'programs', programId)
      const programSnap = await getDoc(programRef)

      if (!programSnap.exists()) {
        throw new Error('Programa no encontrado')
      }

      const programData = programSnap.data()
      const members = programData.members || []

      // 2. Filtrar solo participantes (role: "participant")
      const participantMembers = members.filter(m => m.role === 'participant')

      console.log(`📋 Encontrados ${participantMembers.length} participantes`)

      // 3. Para cada participante, cargar datos enriquecidos
      const participants = []

      for (const member of participantMembers) {
        const businessId = member.businessId

        if (!businessId) {
          console.warn('⚠️ Participante sin businessId:', member)
          continue
        }

        // Obtener datos completos del negocio
        const businessRef = doc(db, 'businesses', businessId)
        const businessSnap = await getDoc(businessRef)

        let businessData = {}
        if (businessSnap.exists()) {
          businessData = businessSnap.data()
        }

        // Contar evaluaciones (usando memberships subcollection)
        let totalAssessments = 0
        let assessmentsData = []

        try {
          const membershipRef = doc(db, 'programs', programId, 'memberships', businessId)
          const membershipSnap = await getDoc(membershipRef)

          if (membershipSnap.exists()) {
            const assessmentsRef = collection(db, 'programs', programId, 'memberships', businessId, 'assessments')
            const assessmentsSnap = await getDocs(assessmentsRef)
            totalAssessments = assessmentsSnap.size
            assessmentsData = assessmentsSnap.docs.map(doc => doc.data())
          }
        } catch (err) {
          console.warn('⚠️ Error contando evaluaciones:', err)
        }

        // Calcular progreso y score
        let progress = 0
        let score = 0

        if (totalAssessments > 0) {
          // Calcular score promedio si existe
          const scores = assessmentsData
            .map(a => a.score)
            .filter(s => s !== undefined && s !== null)

          if (scores.length > 0) {
            score = Math.round(
              scores.reduce((a, b) => a + b, 0) / scores.length
            )
          }

          // Progreso: (evaluaciones completadas / total esperado) * 100
          const expectedAssessments = programData.expectedAssessments || 4
          progress = Math.min(
            Math.round((totalAssessments / expectedAssessments) * 100),
            100
          )
        }

        // Obtener nombre del gerente
        let managerName = member.businessName || 'No especificado'

        if (member.userId) {
          try {
            const userRef = doc(db, 'users', member.userId)
            const userSnap = await getDoc(userRef)
            if (userSnap.exists()) {
              const userData = userSnap.data()
              managerName = userData.nombre || userData.displayName || managerName
            }
          } catch (err) {
            console.warn('⚠️ Error obteniendo datos del gerente:', err)
          }
        }

        participants.push({
          id: businessId,
          businessId: businessId,
          businessName: businessData.nombreNegocio || member.businessName || 'Sin nombre',
          businessType: businessData.tipo || 'No especificado',
          managerName: managerName,
          managerEmail: member.userEmail || '',
          managerId: member.userId || '',
          status: member.status || 'active',
          joinedAt: member.joinedAt,
          leftAt: member.leftAt,
          currentPhase: member.currentPhase || 'baseline',
          totalAssessments,
          score,
          progress
        })
      }

      console.log(`✅ ${participants.length} participantes cargados con datos completos`)
      return participants

    } catch (err) {
      console.error('❌ Error cargando participantes:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * ✅ ACCIÓN 11: Cargar detalle completo de un participante
   * 
   * Obtiene información detallada incluyendo historial de evaluaciones
   */
  async function loadParticipantDetail(programId, businessId) {
    loading.value = true
    error.value = null

    try {
      console.log(`🔍 Cargando detalle del participante: ${businessId}`)

      // 1. Obtener datos del programa
      const programRef = doc(db, 'programs', programId)
      const programSnap = await getDoc(programRef)

      if (!programSnap.exists()) {
        throw new Error('Programa no encontrado')
      }

      const programData = programSnap.data()
      const members = programData.members || []
      const memberData = members.find(m => m.businessId === businessId)

      if (!memberData) {
        throw new Error('Participante no encontrado en el programa')
      }

      // 2. Obtener datos completos del negocio
      const businessRef = doc(db, 'businesses', businessId)
      const businessSnap = await getDoc(businessRef)

      let businessDetails = {}
      if (businessSnap.exists()) {
        businessDetails = businessSnap.data()
      }

      // 3. Obtener evaluaciones completas con ordenamiento
      let assessments = []

      try {
        const assessmentsRef = collection(
          db,
          'programs',
          programId,
          'memberships',
          businessId,
          'assessments'
        )
        const assessmentsQ = query(assessmentsRef, orderBy('submittedAt', 'desc'))
        const assessmentsSnap = await getDocs(assessmentsQ)

        assessments = assessmentsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (err) {
        console.warn('⚠️ Error cargando evaluaciones:', err)
      }

      // 4. Obtener datos del gerente
      let managerDetails = {}
      if (memberData.userId) {
        try {
          const userRef = doc(db, 'users', memberData.userId)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            managerDetails = userSnap.data()
          }
        } catch (err) {
          console.warn('⚠️ Error obteniendo datos del gerente:', err)
        }
      }

      console.log(`✅ Detalle del participante cargado (${assessments.length} evaluaciones)`)

      return {
        membership: {
          id: businessId,
          ...memberData
        },
        business: {
          id: businessId,
          ...businessDetails
        },
        manager: {
          id: memberData.userId,
          ...managerDetails
        },
        assessments
      }

    } catch (err) {
      console.error('❌ Error cargando detalle del participante:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * ✅ ACCIÓN 12: Limpiar estado
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
    loadFacilitatorPrograms,
    loadProgram,
    loadCurrentProgram,
    joinProgramByCode,
    joinProgramAsFacilitator,
    leaveProgram,
    loadAssessments,
    submitAssessment,
    loadProgramParticipants,
    loadParticipantDetail,
    clearProgramData
  }
})
