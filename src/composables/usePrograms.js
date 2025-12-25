import { computed } from 'vue'
import { useProgramStore } from '@/stores/programStore'
import { useUserStore } from '@/stores/useUserStore'

/**
 * Composable para interactuar con el módulo de programas
 * 
 * Uso:
 * const { activePrograms, joinByCode, leaveProgram } = usePrograms()
 */
export function usePrograms() {
  const programStore = useProgramStore()
  const userStore = useUserStore()

  // ═══════════════════════════════════════════════════════════
  // COMPUTED
  // ═══════════════════════════════════════════════════════════
  const activePrograms = computed(() => programStore.activePrograms)
  const hasActiveProgram = computed(() => programStore.hasActiveProgram)
  const currentProgram = computed(() => programStore.currentProgram)
  const currentProgramAssessments = computed(() => programStore.currentProgramAssessments)
  const loading = computed(() => programStore.loading)
  const error = computed(() => programStore.error)
  const isParticipant = computed(() => programStore.isParticipant)

  // ═══════════════════════════════════════════════════════════
  // METHODS
  // ═══════════════════════════════════════════════════════════

  /**
   * Cargar programas activos del usuario
   */
  async function loadPrograms() {
    await programStore.loadActivePrograms()
  }

  /**
   * Cargar detalle de un programa
   */
  async function loadProgram(programId) {
    return await programStore.loadProgram(programId)
  }

  /**
   * Unirse a un programa por código
   */
  async function joinByCode(code) {
    return await programStore.joinProgramByCode(code)
  }

  /**
   * Unirse a un programa como facilitador
   */
  async function joinAsFacilitator(code) {
    console.log('🔍 DEBUG: programStore.joinProgramAsFacilitator existe?', typeof programStore.joinProgramAsFacilitator)
    console.log('🔍 DEBUG: Métodos disponibles en programStore:', Object.keys(programStore))

    if (typeof programStore.joinProgramAsFacilitator !== 'function') {
      throw new Error('La función joinProgramAsFacilitator no está disponible. Recarga la página (Ctrl+Shift+R).')
    }

    return await programStore.joinProgramAsFacilitator(code)
  }

  /**
   * Salirse de un programa (con confirmación)
   */
  async function leaveProgram(programId) {
    const confirmed = confirm(
      '¿Estás seguro de que deseas salir de este programa?\n\n' +
      'Perderás acceso al acompañamiento y tus evaluaciones quedarán inactivas.'
    )

    if (!confirmed) {
      return false
    }

    await programStore.leaveProgram(programId)
    return true
  }

  /**
   * Cargar evaluaciones de un programa
   */
  async function loadAssessments(programId) {
    return await programStore.loadAssessments(programId)
  }

  /**
   * Guardar una evaluación
   */
  async function submitAssessment(programId, data) {
    return await programStore.submitAssessment(programId, data)
  }

  /**
   * Cargar participantes del programa (para facilitadores)
   */
  async function loadParticipants(programId) {
    return await programStore.loadProgramParticipants(programId)
  }

  /**
   * Cargar detalle completo de un participante
   */
  async function loadParticipantDetail(programId, businessId) {
    return await programStore.loadParticipantDetail(programId, businessId)
  }

  /**
   * Verificar si el usuario puede acceder a programas
   */
  const canAccessPrograms = computed(() => {
    return !!userStore.currentBusinessId
  })

  /**
   * Verificar si el usuario es gerente (puede unirse a programas)
   */
  const canJoinPrograms = computed(() => {
    if (!userStore.currentBusiness) return false

    const currentBusiness = userStore.currentBusiness

    return currentBusiness?.rol === 'gerente'
  })

  // ═══════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════
  return {
    // State
    activePrograms,
    hasActiveProgram,
    currentProgram,
    currentProgramAssessments,
    loading,
    error,
    isParticipant,
    canAccessPrograms,
    canJoinPrograms,

    // Methods
    loadPrograms,
    loadProgram,
    joinByCode,
    joinAsFacilitator,
    leaveProgram,
    loadAssessments,
    submitAssessment,
    loadParticipants,
    loadParticipantDetail
  }
}
