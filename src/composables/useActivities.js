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
    consultingActivities,
    monitoringActivities, // Backward compatibility
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
    submitConsulting,
    submitMonitoring, // Backward compatibility alias
    loadUserActivities,
    getUserConsultingCount,
    getUserMonitoringCount, // Backward compatibility alias
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
    consultingActivities,
    monitoringActivities, // Backward compatibility

    userParticipations,

    // Actions
    createActivity,
    loadActivities,
    loadActivity,
    updateActivity,
    deleteActivity,
    loadActivityParticipations,
    markAttendance,
    submitConsulting,
    submitMonitoring, // Backward compatibility alias
    loadUserActivities,
    getUserConsultingCount,
    getUserMonitoringCount, // Backward compatibility alias
    getUserSessionsAttended,
    resetActivities: $reset
  }
}
