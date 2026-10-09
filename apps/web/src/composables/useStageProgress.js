import { computed } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'

/**
 * Composable para calcular progreso y estado de etapas del programa.
 * Funciona tanto para facilitadores (métricas globales) como participantes (progreso individual).
 */
export function useStageProgress() {
  const activitiesStore = useActivitiesStore()

  /**
   * Calcula el progreso de un participante en una etapa.
   * @param {Object} stage - La etapa { id, name, order, prerequisiteStageId }
   * @param {Array} activities - Todas las actividades del programa
   * @param {Array} participations - Las participaciones del usuario
   * @returns {{ total: number, completed: number, percentage: number }}
   */
  function getParticipantStageProgress(stage, activities, participations) {
    const partArray = Array.isArray(participations) ? participations : []
    const stageActivities = activities.filter(a => a.stageId === stage.id)
    const total = stageActivities.length

    if (total === 0) return { total: 0, completed: 0, percentage: 0 }

    let completed = 0
    for (const activity of stageActivities) {
      const participation = partArray.find(p => p.activityId === activity.id)
      if (participation && activitiesStore.isParticipationComplete(activity, participation)) {
        completed++
      }
    }

    const percentage = Math.round((completed / total) * 100)
    return { total, completed, percentage }
  }

  /**
   * Calcula métricas globales de una etapa para el facilitador.
   * @param {Object} stage - La etapa
   * @param {Array} activities - Todas las actividades del programa
   * @param {Array} allParticipations - Todas las participaciones de todas las actividades
   * @param {number} participantCount - Número total de participantes del programa
   * @returns {{ activityCount: number, avgCompletion: number, participantsCompleted: number, participantCount: number }}
   */
  function getFacilitatorStageMetrics(stage, activities, allParticipations, participantCount) {
    const stageActivities = activities.filter(a => a.stageId === stage.id)
    const activityCount = stageActivities.length

    if (activityCount === 0 || participantCount === 0) {
      return { activityCount, avgCompletion: 0, participantsCompleted: 0, participantCount }
    }

    // Agrupar participaciones por userId
    const participationsByUser = {}
    for (const p of allParticipations) {
      if (!stageActivities.some(a => a.id === p.activityId)) continue
      if (!participationsByUser[p.userId]) participationsByUser[p.userId] = []
      participationsByUser[p.userId].push(p)
    }

    let totalCompletedActivities = 0
    let participantsCompleted = 0

    for (const userId of Object.keys(participationsByUser)) {
      const userParticipations = participationsByUser[userId]
      let userCompleted = 0

      for (const activity of stageActivities) {
        const participation = userParticipations.find(p => p.activityId === activity.id)
        if (participation && activitiesStore.isParticipationComplete(activity, participation)) {
          userCompleted++
        }
      }

      totalCompletedActivities += userCompleted
      if (userCompleted === activityCount) {
        participantsCompleted++
      }
    }

    const totalPossible = participantCount * activityCount
    const avgCompletion = totalPossible > 0
      ? Math.round((totalCompletedActivities / totalPossible) * 100)
      : 0

    return { activityCount, avgCompletion, participantsCompleted, participantCount }
  }

  /**
   * Verifica si una etapa está bloqueada para un usuario basándose en el prerequisito.
   * @param {Object} stage - La etapa a verificar
   * @param {Array} allStages - Todas las etapas del programa (ordenadas)
   * @param {Array} activities - Todas las actividades del programa
   * @param {Array} participations - Las participaciones del usuario
   * @returns {boolean} true si la etapa está bloqueada
   */
  function isStageLockedForUser(stage, allStages, activities, participations) {
    if (!stage.prerequisiteStageId) return false

    const prerequisiteStage = allStages.find(s => s.id === stage.prerequisiteStageId)
    if (!prerequisiteStage) return false

    const partArray = Array.isArray(participations) ? participations : []
    const progress = getParticipantStageProgress(prerequisiteStage, activities, partArray)

    // Bloqueada si el prerequisito no está 100% completado
    return progress.percentage < 100
  }

  /**
   * Obtiene el nombre de la etapa prerequisito.
   */
  function getPrerequisiteStageName(stage, allStages) {
    if (!stage.prerequisiteStageId) return null
    const prereq = allStages.find(s => s.id === stage.prerequisiteStageId)
    return prereq?.name || null
  }

  return {
    getParticipantStageProgress,
    getFacilitatorStageMetrics,
    isStageLockedForUser,
    getPrerequisiteStageName
  }
}
