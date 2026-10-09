import { reactive, computed } from 'vue'

// Estado global del loader simplificado
const state = reactive({
  isVisible: false,
  isLoading: true,
  showTime: null // Timestamp de cuándo se mostró el loader
})

// Tiempo mínimo que el loader debe estar visible (en ms)
// Mínimo necesario para feedback visual sin bloquear
const MIN_DISPLAY_TIME = 300 // Tiempo mínimo ultrarrápido

export function useAppLoader() {
  /**
   * Muestra el loader
   */
  function show() {
    state.isVisible = true
    state.isLoading = true
    state.showTime = Date.now() // Guardar cuándo se mostró
    console.log('🔄 Loader mostrado en:', state.showTime)
  }

  /**
   * Oculta el loader después de completar la animación
   * Garantiza un tiempo mínimo de visualización
   */
  function hide() {
    const elapsedTime = Date.now() - state.showTime
    const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsedTime)

    console.log('⏱️ Tiempo transcurrido:', elapsedTime, 'ms')
    console.log('⏱️ Tiempo restante para cumplir mínimo:', remainingTime, 'ms')

    // Esperar el tiempo restante para cumplir el mínimo
    // ANTES de cambiar isLoading a false
    setTimeout(() => {
      console.log('✅ Tiempo mínimo cumplido, completando pasos...')
      state.isLoading = false // Esto dispara el watch que completa los pasos

      // Esperar a que la animación de completado termine
      setTimeout(() => {
        console.log('👋 Ocultando loader')
        state.isVisible = false
        state.showTime = null
      }, 500) // Reducido a 500ms - ultrarrápido
    }, remainingTime)
  }

  return {
    // Estado
    isVisible: computed(() => state.isVisible),
    isLoading: computed(() => state.isLoading),

    // Métodos
    show,
    hide
  }
}
