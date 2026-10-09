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
  deleteDoc,
  increment,
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebaseInit'
import { useAuthStore } from './authStore'

function getParticipantUserName(participant) {
  return (
    participant?.profileUser?.name ||
    participant?.profileUser?.nombre ||
    participant?.userName ||
    participant?.name ||
    'Usuario'
  )
}

function getParticipantBusinessName(participant) {
  return (
    participant?.businessProfile?.businessName ||
    participant?.businessProfile?.razonSocial ||
    participant?.businessProfile?.nombreNegocio ||
    participant?.businessProfile?.businessName ||
    participant?.businessProfile?.razonSocial ||
    participant?.businessProfile?.nombreNegocio ||
    participant?.businessName ||
    ''
  )
}

export const useActivitiesStore = defineStore('activities', () => {
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════
  const activities = ref([])
  const currentActivity = ref(null)
  const participations = ref([])
  const currentParticipation = ref(null)
  const participationMatrix = ref([])
  const programStages = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ═══════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════
  const activitiesByType = computed(() => (type) => {
    return activities.value.filter(a => a.type === type)
  })

  const formActivities = computed(() => {
    return activities.value.filter(a => a.type === 'activity' || a.type === 'form')
  })

  const activitiesByStage = computed(() => (stageId) => {
    if (!stageId) return activities.value.filter(a => !a.stageId)
    return activities.value.filter(a => a.stageId === stageId)
  })

  const consultingActivities = computed(() => {
    return activities.value.filter(a => a.type === 'consulting' || a.type === 'monitoring')
  })

  // Backward compatibility alias
  const monitoringActivities = consultingActivities
  const sessionActivities = formActivities

  const userParticipations = computed(() => (userId) => {
    return participations.value.filter(p => p.userId === userId)
  })

  // ═══════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Crear una nueva actividad
   * Soporta type: 'activity' (con fields[]) | 'consulting'
   */
  async function createActivity(programId, activityData) {
    const authStore = useAuthStore()

    if (!authStore.user?.uid) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const activitiesRef = collection(db, 'programs', programId, 'activities')

      const newActivity = {
        ...activityData,
        createdBy: authStore.user.uid,
        createdAt: serverTimestamp(),
        metadata: {
          totalParticipants: 0,
          completionRate: 0
        }
      }

      // Si es activity, asegurar que traiga fields[]
      if (activityData.type === 'activity') {
        newActivity.fields = activityData.fields || []
      }

      // Si es asesoría, agregar configuración por defecto
      if (activityData.type === 'consulting' || activityData.type === 'monitoring') {
        if (!activityData.consultingConfig && !activityData.monitoringConfig) {
          newActivity.consultingConfig = {
            formTemplate: 'standard',
            categories: [
              'negocio',
              'marketing',
              'controlStock',
              'compras',
              'costeo',
              'mantenimientoRegistros',
              'planificacion'
            ],
            totalQuestions: 21,
            requiredEvidence: activityData.requiredEvidence || false
          }
          // Backward compatibility
          newActivity.monitoringConfig = newActivity.consultingConfig
        }
      }

      const docRef = await addDoc(activitiesRef, newActivity)

      console.log('✅ Actividad creada:', docRef.id)

      return {
        id: docRef.id,
        ...newActivity
      }
    } catch (err) {
      console.error('❌ Error al crear actividad:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cargar todas las actividades de un programa
   */
  async function loadActivities(programId, filters = {}) {
    loading.value = true
    error.value = null

    try {
      const activitiesRef = collection(db, 'programs', programId, 'activities')
      let q = query(activitiesRef, orderBy('createdAt', 'desc'))

      // Aplicar filtros
      if (filters.type) {
        q = query(activitiesRef, where('type', '==', filters.type), orderBy('createdAt', 'desc'))
      }

      const snapshot = await getDocs(q)

      activities.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log(`✅ ${activities.value.length} actividades cargadas`)

      return activities.value
    } catch (err) {
      console.error('❌ Error al cargar actividades:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cargar una actividad específica
   */
  async function loadActivity(programId, activityId) {
    loading.value = true
    error.value = null

    try {
      const activityRef = doc(db, 'programs', programId, 'activities', activityId)
      const snapshot = await getDoc(activityRef)

      if (!snapshot.exists()) {
        throw new Error('Actividad no encontrada')
      }

      currentActivity.value = {
        id: snapshot.id,
        ...snapshot.data()
      }

      console.log('✅ Actividad cargada:', currentActivity.value.title)

      return currentActivity.value
    } catch (err) {
      console.error('❌ Error al cargar actividad:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar una actividad
   */
  async function updateActivity(programId, activityId, updates) {
    loading.value = true
    error.value = null

    try {
      const activityRef = doc(db, 'programs', programId, 'activities', activityId)

      await updateDoc(activityRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })

      console.log('✅ Actividad actualizada')

      // Actualizar en el store local
      if (currentActivity.value?.id === activityId) {
        currentActivity.value = {
          ...currentActivity.value,
          ...updates
        }
      }

      const index = activities.value.findIndex(a => a.id === activityId)
      if (index !== -1) {
        activities.value[index] = {
          ...activities.value[index],
          ...updates
        }
      }

      return true
    } catch (err) {
      console.error('❌ Error al actualizar actividad:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar una actividad
   */
  async function deleteActivity(programId, activityId) {
    loading.value = true
    error.value = null

    try {
      const activityRef = doc(db, 'programs', programId, 'activities', activityId)
      await deleteDoc(activityRef)

      console.log('✅ Actividad eliminada')

      // Remover del store local
      activities.value = activities.value.filter(a => a.id !== activityId)
      if (currentActivity.value?.id === activityId) {
        currentActivity.value = null
      }

      return true
    } catch (err) {
      console.error('❌ Error al eliminar actividad:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cargar participaciones de una actividad
   */
  async function loadActivityParticipations(programId, activityId) {
    loading.value = true
    error.value = null

    try {
      const participationsRef = collection(db, 'programs', programId, 'participations')
      const q = query(
        participationsRef,
        where('activityId', '==', activityId),
        orderBy('submittedAt', 'desc')
      )

      const snapshot = await getDocs(q)

      participations.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log(`✅ ${participations.value.length} participaciones cargadas`)

      return participations.value
    } catch (err) {
      console.error('❌ Error al cargar participaciones:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Enviar participación de actividad (type: 'activity')
   * Una participación por usuario por actividad.
   */
  async function submitActivityParticipation(programId, activityId, responses) {
    const authStore = useAuthStore()

    if (!authStore.user?.uid) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const participationsRef = collection(db, 'programs', programId, 'participations')

      // Verificar que no exista ya una participación de este usuario para esta actividad
      const existing = query(
        participationsRef,
        where('activityId', '==', activityId),
        where('userId', '==', authStore.user.uid)
      )
      const existingSnap = await getDocs(existing)

      if (!existingSnap.empty) {
        throw new Error('Ya completaste esta actividad anteriormente.')
      }

      const { useBusinessStore } = await import('./businessStore')
      const businessStore = useBusinessStore()

      const newParticipation = {
        activityId,
        activityType: 'activity',
        userId: authStore.user.uid,
        userName: authStore.user.displayName || authStore.user.email || 'Usuario',
        businessId: businessStore.business?.id || '',
        businessName: businessStore.business?.name || '',
        status: 'completed',
        submittedAt: serverTimestamp(),
        completedBy: authStore.user.uid,
        responses: responses || {}
      }

      const docRef = await addDoc(participationsRef, newParticipation)

      // Actualizar metadata de la actividad
      const activityRef = doc(db, 'programs', programId, 'activities', activityId)
      await updateDoc(activityRef, {
        'metadata.totalParticipants': increment(1),
        updatedAt: serverTimestamp()
      })

      currentParticipation.value = { id: docRef.id, ...newParticipation }

      console.log('✅ Participación enviada:', docRef.id)

      return currentParticipation.value
    } catch (err) {
      console.error('❌ Error al enviar participación:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cargar la participación del usuario actual para una actividad específica
   */
  async function loadUserParticipation(programId, activityId) {
    const authStore = useAuthStore()

    if (!authStore.user?.uid) return null

    loading.value = true
    error.value = null

    try {
      const participationsRef = collection(db, 'programs', programId, 'participations')
      const q = query(
        participationsRef,
        where('activityId', '==', activityId),
        where('userId', '==', authStore.user.uid)
      )

      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        currentParticipation.value = null
        return null
      }

      currentParticipation.value = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      }

      console.log('✅ Participación del usuario cargada')

      return currentParticipation.value
    } catch (err) {
      console.error('❌ Error al cargar participación del usuario:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar respuestas de una participación (puede hacerlo el facilitador)
   */
  async function updateParticipationResponse(programId, participationId, responses) {
    loading.value = true
    error.value = null

    try {
      const participationRef = doc(db, 'programs', programId, 'participations', participationId)

      await updateDoc(participationRef, {
        responses,
        updatedAt: serverTimestamp()
      })

      // Actualizar local
      const index = participations.value.findIndex(p => p.id === participationId)
      if (index !== -1) {
        participations.value[index] = { ...participations.value[index], responses }
      }
      if (currentParticipation.value?.id === participationId) {
        currentParticipation.value = { ...currentParticipation.value, responses }
      }

      console.log('✅ Respuestas actualizadas')
      return true
    } catch (err) {
      console.error('❌ Error al actualizar respuestas:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Marcar el campo de asistencia (attendance) dentro de una participación de formulario
   * Solo puede ejecutarlo el facilitador.
   */
  async function markAttendanceField(programId, participationId, fieldId, attended, notes = '') {
    const authStore = useAuthStore()

    if (!authStore.user?.uid) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const participationRef = doc(db, 'programs', programId, 'participations', participationId)

      const fieldUpdate = {
        [`responses.${fieldId}`]: {
          attended,
          markedBy: authStore.user.uid,
          markedAt: serverTimestamp(),
          notes: notes || ''
        },
        updatedAt: serverTimestamp()
      }

      await updateDoc(participationRef, fieldUpdate)

      // Actualizar local
      const updateLocal = (p) => {
        if (!p.responses) p.responses = {}
        p.responses[fieldId] = { attended, markedBy: authStore.user.uid, notes: notes || '' }
        return p
      }

      const index = participations.value.findIndex(p => p.id === participationId)
      if (index !== -1) {
        participations.value[index] = updateLocal({ ...participations.value[index] })
      }
      if (currentParticipation.value?.id === participationId) {
        currentParticipation.value = updateLocal({ ...currentParticipation.value })
      }

      // Actualizar matriz local para refresco inmediato de UI/Stats
      const matrixIndex = participationMatrix.value.findIndex(
        row => row.participation?.id === participationId
      )

      if (matrixIndex !== -1) {
        const matrixRow = participationMatrix.value[matrixIndex]
        const localParticipation = {
          ...matrixRow.participation,
          responses: {
            ...(matrixRow.participation?.responses || {}),
            [fieldId]: {
              attended,
              markedBy: authStore.user.uid,
              notes: notes || ''
            }
          }
        }

        const attendanceFieldIds = (currentActivity.value?.fields || [])
          .filter(f => f.type === 'attendance')
          .map(f => f.id)

        const hasAttendance = attendanceFieldIds.length > 0
          ? attendanceFieldIds.every(id => localParticipation.responses?.[id]?.attended === true)
          : false

        const updatedRow = {
          ...matrixRow,
          participation: localParticipation,
          hasAttendance,
          isComplete: currentActivity.value
            ? isParticipationComplete(currentActivity.value, localParticipation)
            : matrixRow.isComplete
        }

        participationMatrix.value = participationMatrix.value.map((row, idx) =>
          idx === matrixIndex ? updatedRow : row
        )
      }

      console.log('✅ Asistencia marcada en campo:', fieldId)
      return true
    } catch (err) {
      console.error('❌ Error al marcar asistencia en campo:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Marcar campo de asistencia para un usuario sin importar si tiene participación.
   * Upsert: crea una participación mínima (solo asistencia) si no existe.
   * Ideal para que el facilitador marque asistencias en bulk sin generar drafts.
   */
  async function markAttendanceFieldForUser(programId, activityId, userId, participantData, fieldId, attended, notes = '') {
    const authStore = useAuthStore()

    if (!authStore.user?.uid) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const participationsRef = collection(db, 'programs', programId, 'participations')

      // Buscar participación existente
      const q = query(
        participationsRef,
        where('activityId', '==', activityId),
        where('userId', '==', userId)
      )
      const snapshot = await getDocs(q)

      const attendanceFieldData = {
        attended,
        markedBy: authStore.user.uid,
        markedAt: serverTimestamp(),
        notes: notes || ''
      }

      let participationId
      let participationData

      if (!snapshot.empty) {
        // Actualizar existente
        participationId = snapshot.docs[0].id
        const participationRef = doc(db, 'programs', programId, 'participations', participationId)
        await updateDoc(participationRef, {
          [`responses.${fieldId}`]: attendanceFieldData,
          updatedAt: serverTimestamp()
        })
        participationData = { id: participationId, ...snapshot.docs[0].data() }
      } else {
        // Crear participación mínima — solo asistencia, sin draft de campos
        const newParticipation = {
          activityId,
          activityType: 'activity',
          userId,
          userName: getParticipantUserName(participantData),
          businessId: participantData.businessId || '',
          businessName: getParticipantBusinessName(participantData),
          status: 'attendance_marked',
          createdBy: authStore.user.uid,
          submittedAt: serverTimestamp(),
          responses: {
            [fieldId]: { attended, markedBy: authStore.user.uid, notes: notes || '' }
          }
        }
        const docRef = await addDoc(participationsRef, newParticipation)
        participationId = docRef.id
        participationData = { id: participationId, ...newParticipation }
      }

      // Actualizar matriz local
      const matrixIndex = participationMatrix.value.findIndex(row => row.userId === userId)
      if (matrixIndex !== -1) {
        const matrixRow = participationMatrix.value[matrixIndex]
        const existingResponses = matrixRow.participation?.responses || {}
        const localParticipation = {
          ...(matrixRow.participation || participationData),
          id: participationId,
          responses: {
            ...existingResponses,
            [fieldId]: { attended, markedBy: authStore.user.uid, notes: notes || '' }
          }
        }

        const allAttendanceFieldIds = (currentActivity.value?.fields || [])
          .filter(f => f.type === 'attendance')
          .map(f => f.id)

        const hasAttendance = allAttendanceFieldIds.length > 0
          ? allAttendanceFieldIds.every(id => localParticipation.responses?.[id]?.attended === true)
          : false

        const updatedRow = {
          ...matrixRow,
          participation: localParticipation,
          hasAttendance,
          isComplete: currentActivity.value
            ? isParticipationComplete(currentActivity.value, localParticipation)
            : matrixRow.isComplete
        }

        participationMatrix.value = participationMatrix.value.map((row, idx) =>
          idx === matrixIndex ? updatedRow : row
        )
      }

      console.log('✅ Asistencia upsert marcada para usuario:', userId)
      return participationId
    } catch (err) {
      console.error('❌ Error al marcar asistencia para usuario:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Marcar asistencia en una sesión (legacy — se mantiene por compatibilidad)
   */
  async function markAttendance(programId, activityId, userId, userData, attended = true, notes = '') {
    const authStore = useAuthStore()

    if (!authStore.user?.uid) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const participationsRef = collection(db, 'programs', programId, 'participations')

      // Buscar si ya existe una participación
      const q = query(
        participationsRef,
        where('activityId', '==', activityId),
        where('userId', '==', userId)
      )

      const snapshot = await getDocs(q)

      const attendanceData = {
        attended,
        markedAt: serverTimestamp(),
        markedBy: authStore.user.uid,
        notes: notes || ''
      }

      let participationId

      if (snapshot.empty) {
        // Crear nueva participación
        const newParticipation = {
          activityId,
          activityType: 'session',
          userId,
          userName: getParticipantUserName(userData),
          businessId: userData.businessId || '',
          businessName: getParticipantBusinessName(userData),
          attendance: attendanceData,
          status: attended ? 'completed' : 'absent',
          submittedAt: serverTimestamp()
        }

        const docRef = await addDoc(participationsRef, newParticipation)
        participationId = docRef.id
      } else {
        // Actualizar participación existente
        const docRef = snapshot.docs[0].ref
        participationId = snapshot.docs[0].id

        await updateDoc(docRef, {
          attendance: attendanceData,
          status: attended ? 'completed' : 'absent',
          submittedAt: serverTimestamp()
        })
      }

      // Actualizar metadata de la actividad
      const activityRef = doc(db, 'programs', programId, 'activities', activityId)
      await updateDoc(activityRef, {
        'metadata.totalParticipants': increment(snapshot.empty ? 1 : 0),
        updatedAt: serverTimestamp()
      })

      console.log('✅ Asistencia marcada')

      return participationId
    } catch (err) {
      console.error('❌ Error al marcar asistencia:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Enviar asesoría (consulting)
   */
  async function submitConsulting(programId, activityId, consultingData) {
    const authStore = useAuthStore()

    if (!authStore.user?.uid) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const participationsRef = collection(db, 'programs', programId, 'participations')

      // Calcular scores por categoría (sumatoria de las 3 preguntas)
      const categoryScores = {}
      Object.keys(consultingData.responses).forEach(category => {
        const responses = consultingData.responses[category]
        const total = Object.values(responses).reduce((sum, val) => sum + val, 0)
        categoryScores[category] = total // Sumatoria directa, no promedio
      })

      // Calcular score general (sumatoria de todas las categorías)
      const overallScore = Object.values(categoryScores).reduce((sum, val) => sum + val, 0)

      const newParticipation = {
        activityId,
        activityType: 'consulting',
        userId: consultingData.userId,
        userName: getParticipantUserName(consultingData),
        businessId: consultingData.businessId || '',
        businessName: getParticipantBusinessName(consultingData),
        consultingData: {
          modality: consultingData.modality,
          consultingDate: consultingData.consultingDate || consultingData.monitoringDate, // Backward compatibility
          facilitatorId: authStore.user.uid,
          responses: consultingData.responses,
          categoryComments: consultingData.categoryComments || {},
          categoryScores,
          overallScore,
          evidenceUrls: consultingData.evidenceUrls || [],
          additionalComments: consultingData.additionalComments || ''
        },
        // Backward compatibility - duplicar en monitoringData
        monitoringData: {
          modality: consultingData.modality,
          monitoringDate: consultingData.consultingDate || consultingData.monitoringDate,
          facilitatorId: authStore.user.uid,
          responses: consultingData.responses,
          categoryComments: consultingData.categoryComments || {},
          categoryScores,
          overallScore,
          evidenceUrls: consultingData.evidenceUrls || [],
          additionalComments: consultingData.additionalComments || ''
        },
        status: 'completed',
        submittedAt: serverTimestamp()
      }

      const docRef = await addDoc(participationsRef, newParticipation)

      // Actualizar metadata de la actividad
      const activityRef = doc(db, 'programs', programId, 'activities', activityId)
      await updateDoc(activityRef, {
        'metadata.totalParticipants': increment(1),
        updatedAt: serverTimestamp()
      })

      console.log('✅ Monitoreo enviado:', docRef.id)

      return {
        id: docRef.id,
        ...newParticipation
      }
    } catch (err) {
      console.error('❌ Error al enviar monitoreo:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear una participación vacía (draft) para que el facilitador pueda completar
   * la participación de un participante que aún no ha respondido.
   */
  async function createEmptyParticipation(programId, activityId, participantData) {
    const authStore = useAuthStore()

    if (!authStore.user?.uid) {
      throw new Error('Usuario no autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const participationsRef = collection(db, 'programs', programId, 'participations')

      // Verificar que no exista ya una participación de este usuario
      const existing = query(
        participationsRef,
        where('activityId', '==', activityId),
        where('userId', '==', participantData.userId)
      )
      const existingSnap = await getDocs(existing)

      if (!existingSnap.empty) {
        // Ya existe — devolver existente
        return { id: existingSnap.docs[0].id, ...existingSnap.docs[0].data() }
      }

      // Construir respuestas vacías basándose en los campos de la actividad
      let activity = currentActivity.value
      if (!activity || activity.id !== activityId) {
        activity = await loadActivity(programId, activityId)
      }

      const emptyResponses = {}
        ; (activity.fields || []).forEach(field => {
          if (field.type === 'attendance') {
            emptyResponses[field.id] = { attended: false, markedBy: '', notes: '' }
          } else {
            emptyResponses[field.id] = ''
          }
        })

      const newParticipation = {
        activityId,
        activityType: 'activity',
        userId: participantData.userId,
        userName: getParticipantUserName(participantData),
        businessId: participantData.businessId || '',
        businessName: getParticipantBusinessName(participantData),
        status: 'draft',
        createdBy: authStore.user.uid,
        createdAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
        responses: emptyResponses
      }

      const docRef = await addDoc(participationsRef, newParticipation)

      console.log('✅ Participación draft creada:', docRef.id)

      return { id: docRef.id, ...newParticipation }
    } catch (err) {
      console.error('❌ Error al crear participación vacía:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ═══════════════════════════════════════════════════════════
  // STAGES (Etapas)
  // ═══════════════════════════════════════════════════════════

  /**
   * Cargar las etapas de un programa
   */
  async function loadProgramStages(programId) {
    try {
      const stagesRef = collection(db, 'programs', programId, 'stages')
      const q = query(stagesRef, orderBy('order', 'asc'))
      const snapshot = await getDocs(q)

      programStages.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log(`✅ ${programStages.value.length} etapas cargadas`)
      return programStages.value
    } catch (err) {
      console.error('❌ Error al cargar etapas:', err)
      return []
    }
  }

  /**
   * Guardar (crear) una nueva etapa en el programa
   */
  async function saveStage(programId, stageName) {
    try {
      const stagesRef = collection(db, 'programs', programId, 'stages')

      // Verificar si ya existe una etapa con ese nombre
      const existing = programStages.value.find(
        s => s.name.toLowerCase().trim() === stageName.toLowerCase().trim()
      )
      if (existing) return existing

      const newStage = {
        name: stageName.trim(),
        order: programStages.value.length,
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(stagesRef, newStage)
      const stage = { id: docRef.id, ...newStage }

      programStages.value.push(stage)

      console.log('✅ Etapa creada:', stage.name)
      return stage
    } catch (err) {
      console.error('❌ Error al crear etapa:', err)
      throw err
    }
  }

  /**
   * Actualizar una etapa existente (nombre, prerequisiteStageId, etc.)
   */
  async function updateStage(programId, stageId, data) {
    try {
      const stageRef = doc(db, 'programs', programId, 'stages', stageId)
      await updateDoc(stageRef, data)

      // Actualizar en local
      const idx = programStages.value.findIndex(s => s.id === stageId)
      if (idx !== -1) {
        programStages.value[idx] = { ...programStages.value[idx], ...data }
      }

      console.log('✅ Etapa actualizada:', stageId)
      return programStages.value[idx]
    } catch (err) {
      console.error('❌ Error al actualizar etapa:', err)
      throw err
    }
  }

  /**
   * Eliminar una etapa
   */
  async function deleteStage(programId, stageId) {
    try {
      const stageRef = doc(db, 'programs', programId, 'stages', stageId)
      await deleteDoc(stageRef)

      programStages.value = programStages.value.filter(s => s.id !== stageId)

      console.log('✅ Etapa eliminada:', stageId)
    } catch (err) {
      console.error('❌ Error al eliminar etapa:', err)
      throw err
    }
  }

  /**
   * Reordenar etapas (batch update de order)
   * @param {string} programId
   * @param {Array<{id: string, order: number}>} orderedStages
   */
  async function reorderStages(programId, orderedStages) {
    try {
      const updates = orderedStages.map(({ id, order }) => {
        const ref = doc(db, 'programs', programId, 'stages', id)
        return updateDoc(ref, { order })
      })
      await Promise.all(updates)

      // Actualizar local
      for (const { id, order } of orderedStages) {
        const stage = programStages.value.find(s => s.id === id)
        if (stage) stage.order = order
      }
      programStages.value.sort((a, b) => a.order - b.order)

      console.log('✅ Etapas reordenadas')
    } catch (err) {
      console.error('❌ Error al reordenar etapas:', err)
      throw err
    }
  }

  /**
   * Cargar actividades de un usuario específico
   */
  async function loadUserActivities(programId, userId) {
    loading.value = true
    error.value = null

    try {
      const participationsRef = collection(db, 'programs', programId, 'participations')
      const q = query(
        participationsRef,
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc')
      )

      const snapshot = await getDocs(q)

      const userActivities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log(`✅ ${userActivities.length} actividades del usuario cargadas`)

      return userActivities
    } catch (err) {
      console.error('❌ Error al cargar actividades del usuario:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener número de asesorías realizadas por un usuario
   */
  async function getUserConsultingCount(programId, userId) {
    try {
      const participationsRef = collection(db, 'programs', programId, 'participations')

      // Consultar ambos tipos para backward compatibility
      const qConsulting = query(
        participationsRef,
        where('userId', '==', userId),
        where('activityType', '==', 'consulting'),
        where('status', '==', 'completed')
      )

      const qMonitoring = query(
        participationsRef,
        where('userId', '==', userId),
        where('activityType', '==', 'monitoring'),
        where('status', '==', 'completed')
      )

      const [consultingSnapshot, monitoringSnapshot] = await Promise.all([
        getDocs(qConsulting),
        getDocs(qMonitoring)
      ])

      return consultingSnapshot.size + monitoringSnapshot.size
    } catch (err) {
      console.error('❌ Error al obtener conteo de asesorías:', err)
      return 0
    }
  }

  // Backward compatibility alias
  const getUserMonitoringCount = getUserConsultingCount

  /**
   * Obtener número de sesiones a las que asistió un usuario
   */
  async function getUserSessionsAttended(programId, userId) {
    try {
      const participationsRef = collection(db, 'programs', programId, 'participations')
      const q = query(
        participationsRef,
        where('userId', '==', userId),
        where('activityType', '==', 'session'),
        where('attendance.attended', '==', true)
      )

      const snapshot = await getDocs(q)

      return snapshot.size
    } catch (err) {
      console.error('❌ Error al obtener sesiones asistidas:', err)
      return 0
    }
  }

  /**
   * Determinar si una participación está completa.
   * Completado = todos los campos required respondidos + attendance.attended si hay campo attendance.
   */
  function isParticipationComplete(activity, participation) {
    if (!activity?.fields || !participation?.responses) return false

    const fields = activity.fields || []

    for (const field of fields) {
      if (field.type === 'attendance') {
        // Campo attendance: requiere que el facilitador haya marcado attended = true
        const resp = participation.responses[field.id]
        if (!resp || resp.attended !== true) return false
      } else if (field.required) {
        // Campo required: necesita un valor no vacío
        const val = participation.responses[field.id]
        if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) return false
      }
    }

    return true
  }

  /**
   * Construir la matriz de participantes × participaciones para una actividad.
   * Combina todos los participantes del programa con las participaciones ya enviadas.
   * Devuelve array de { userId, userName, userEmail, businessId, businessName, participation | null, isComplete, hasResponses, hasAttendance }
   */
  async function buildParticipationMatrix(programId, activityId) {
    error.value = null

    try {
      // 1. Cargar la actividad actual si no está cargada
      let activity = currentActivity.value
      if (!activity || activity.id !== activityId) {
        activity = await loadActivity(programId, activityId)
      }

      // 2. Cargar participantes del programa
      const participantsRef = collection(db, 'programs', programId, 'participants')
      const participantsSnap = await getDocs(query(participantsRef))
      const programParticipants = participantsSnap.docs
        .map(d => ({ odocId: d.id, ...d.data() }))
        .filter(p => p.status === 'active')

      // 3. Cargar participaciones de la actividad
      await loadActivityParticipations(programId, activityId)

      // 4. Mapear participaciones por userId
      const participationsByUser = {}
      participations.value.forEach(p => {
        participationsByUser[p.userId] = p
      })

      // 5. Detectar si hay campos attendance
      const attendanceFieldIds = (activity.fields || [])
        .filter(f => f.type === 'attendance')
        .map(f => f.id)
      const hasAttendanceFields = attendanceFieldIds.length > 0

      // 6. Construir matriz
      participationMatrix.value = programParticipants.map(participant => {
        const userId = participant.userId || participant.odocId
        const p = participationsByUser[userId] || null

        let hasResponses = false
        let hasAttendance = false

        if (p && activity.fields) {
          // Verificar si tiene al menos una respuesta no-attendance
          hasResponses = activity.fields
            .filter(f => f.type !== 'attendance' && f.required)
            .some(f => {
              const val = p.responses?.[f.id]
              return val !== undefined && val !== null && (typeof val !== 'string' || val.trim())
            })

          // Verificar si todas las attendances están marcadas
          if (hasAttendanceFields) {
            hasAttendance = attendanceFieldIds.every(fId => {
              return p.responses?.[fId]?.attended === true
            })
          }
        }

        return {
          odocId: participant.odocId,
          odocDate: participant.joinedAt || null,
          userId,
          userName: getParticipantUserName(participant),
          userEmail: participant.userEmail || participant.email || '',
          businessId: participant.businessId || '',
          businessName: getParticipantBusinessName(participant),
          participation: p,
          isComplete: p ? isParticipationComplete(activity, p) : false,
          hasResponses,
          hasAttendance,
        }
      })

      console.log(`✅ Matriz construida: ${participationMatrix.value.length} participantes`)

      return participationMatrix.value
    } catch (err) {
      console.error('❌ Error al construir matriz de participación:', err)
      error.value = err.message
      throw err
    }
  }

  /**
   * Reset del store
   */
  function $reset() {
    activities.value = []
    currentActivity.value = null
    participations.value = []
    currentParticipation.value = null
    participationMatrix.value = []
    programStages.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    activities,
    currentActivity,
    participations,
    currentParticipation,
    participationMatrix,
    programStages,
    loading,
    error,

    // Getters
    activitiesByType,
    activitiesByStage,
    formActivities,
    sessionActivities,    // alias de formActivities
    consultingActivities,
    monitoringActivities, // alias de consultingActivities
    userParticipations,

    // Actions
    createActivity,
    loadActivities,
    loadActivity,
    updateActivity,
    deleteActivity,
    loadActivityParticipations,
    // Nuevas acciones para type: 'activity'
    submitActivityParticipation,
    submitFormParticipation: submitActivityParticipation, // Backward compatibility alias
    loadUserParticipation,
    updateParticipationResponse,
    markAttendanceField,
    markAttendanceFieldForUser,
    // Utilidades
    isParticipationComplete,
    buildParticipationMatrix,
    createEmptyParticipation,
    // Stages
    loadProgramStages,
    saveStage,
    updateStage,
    deleteStage,
    reorderStages,
    // Legacy
    markAttendance,
    submitConsulting,
    submitMonitoring: submitConsulting, // Backward compatibility alias
    loadUserActivities,
    getUserConsultingCount,
    getUserMonitoringCount, // Backward compatibility alias
    getUserSessionsAttended,
    $reset
  }
})
