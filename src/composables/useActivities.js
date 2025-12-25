import { storeToRefs } from 'pinia'
import { useActivitiesStore } from '@/stores/activitiesStore'

/**
 * Composable para gestión de actividades del programa
 * Wrapper del store de actividades con funcionalidades adicionales
 */
export function useActivities() {
  const store = useActivitiesStore()

  // Extraer state reactivo
  const {
    activities,
    currentActivity,
    participations,
    loading,
    error,
    activitiesByType,
    sessionActivities,
    monitoringActivities,
    userParticipations
  } = storeToRefs(store)

  // Métodos del store
  const {
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
  } = store

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
    resetActivities: $reset
  }
}
