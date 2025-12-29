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

export const useActivitiesStore = defineStore('activities', () => {
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════
  const activities = ref([])
  const currentActivity = ref(null)
  const participations = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ═══════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════
  const activitiesByType = computed(() => (type) => {
    return activities.value.filter(a => a.type === type)
  })

  const sessionActivities = computed(() => {
    return activities.value.filter(a => a.type === 'session')
  })

  const monitoringActivities = computed(() => {
    return activities.value.filter(a => a.type === 'monitoring')
  })

  const userParticipations = computed(() => (userId) => {
    return participations.value.filter(p => p.userId === userId)
  })

  // ═══════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Crear una nueva actividad
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

      // Si es monitoreo, agregar configuración por defecto
      if (activityData.type === 'monitoring' && !activityData.monitoringConfig) {
        newActivity.monitoringConfig = {
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
   * Marcar asistencia en una sesión
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
          userName: userData.userName || userData.name || 'Usuario',
          businessId: userData.businessId || '',
          businessName: userData.businessName || '',
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
   * Enviar monitoreo
   */
  async function submitMonitoring(programId, activityId, monitoringData) {
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
      Object.keys(monitoringData.responses).forEach(category => {
        const responses = monitoringData.responses[category]
        const total = Object.values(responses).reduce((sum, val) => sum + val, 0)
        categoryScores[category] = total // Sumatoria directa, no promedio
      })

      // Calcular score general (sumatoria de todas las categorías)
      const overallScore = Object.values(categoryScores).reduce((sum, val) => sum + val, 0)

      const newParticipation = {
        activityId,
        activityType: 'monitoring',
        userId: monitoringData.userId,
        userName: monitoringData.userName || 'Usuario',
        businessId: monitoringData.businessId || '',
        businessName: monitoringData.businessName || '',
        monitoringData: {
          modality: monitoringData.modality,
          monitoringDate: monitoringData.monitoringDate,
          facilitatorId: authStore.user.uid,
          responses: monitoringData.responses,
          categoryComments: monitoringData.categoryComments || {},
          categoryScores,
          overallScore,
          evidenceUrls: monitoringData.evidenceUrls || [],
          additionalComments: monitoringData.additionalComments || ''
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
   * Obtener número de monitoreos realizados por un usuario
   */
  async function getUserMonitoringCount(programId, userId) {
    try {
      const participationsRef = collection(db, 'programs', programId, 'participations')
      const q = query(
        participationsRef,
        where('userId', '==', userId),
        where('activityType', '==', 'monitoring'),
        where('status', '==', 'completed')
      )

      const snapshot = await getDocs(q)

      return snapshot.size
    } catch (err) {
      console.error('❌ Error al obtener conteo de monitoreos:', err)
      return 0
    }
  }

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
   * Reset del store
   */
  function $reset() {
    activities.value = []
    currentActivity.value = null
    participations.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    activities,
    currentActivity,
    participations,
    loading,
    error,

    // Getters
    activitiesByType,
    sessionActivities,
    monitoringActivities,
    userParticipations,

    // Actions
    createActivity,
    loadActivities,
    loadActivity,
    updateActivity,
    deleteActivity,
    loadActivityParticipations,
    markAttendance,
    submitMonitoring,
    loadUserActivities,
    getUserMonitoringCount,
    getUserSessionsAttended,
    $reset
  }
})
