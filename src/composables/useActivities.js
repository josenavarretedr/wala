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
    currentParticipation,
    participationMatrix,
    programStages,
    loading,
    error,
    activitiesByType,
    formActivities,
    sessionActivities,
    consultingActivities,
    monitoringActivities, // Backward compatibility
    userParticipations,
    activitiesByStage
  } = storeToRefs(store)

  // Métodos del store
  const {
    createActivity,
    loadActivities,
    loadActivity,
    updateActivity,
    deleteActivity,
    loadActivityParticipations,
    submitFormParticipation, // Backward compatibility alias
    submitActivityParticipation,
    loadUserParticipation,
    updateParticipationResponse,
    markAttendanceField,
    isParticipationComplete,
    buildParticipationMatrix,
    createEmptyParticipation,
    // Stages
    loadProgramStages,
    saveStage,
    updateStage,
    deleteStage,
    reorderStages,
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
    currentParticipation,
    participationMatrix,
    programStages,
    loading,
    error,

    // Getters
    activitiesByType,
    formActivities,
    sessionActivities,
    consultingActivities,
    monitoringActivities, // Backward compatibility
    userParticipations,
    activitiesByStage,

    // Actions — activity
    submitActivityParticipation,
    submitFormParticipation, // Backward compatibility alias
    loadUserParticipation,
    updateParticipationResponse,
    markAttendanceField,

    // Utilities
    isParticipationComplete,
    buildParticipationMatrix,
    createEmptyParticipation,

    // Stages
    loadProgramStages,
    saveStage,
    updateStage,
    deleteStage,
    reorderStages,

    // Actions — general
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
