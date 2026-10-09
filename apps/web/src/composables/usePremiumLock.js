import { computed } from 'vue'

/**
 * 🔒 Composable para gestionar el bloqueo de contenido Premium
 * 
 * Proporciona clases CSS y estado para aplicar blur, bloqueo visual y badge
 * a contenido que requiere suscripción Premium.
 * 
 * @param {Ref<boolean>|boolean} isPremium - Si el usuario tiene plan Premium
 * @param {Ref<boolean>|boolean} isLocked - Si el contenido debe estar bloqueado
 * 
 * @returns {Object} Objeto con clases y estado para aplicar el bloqueo
 * 
 * @example
 * // Uso básico en un widget
 * const { isLocked, contentClasses, containerClasses, showBadge } = usePremiumLock(
 *   isPremium,
 *   !isPremium && selectedTimeRange !== 'today'
 * )
 * 
 * // En el template
 * <div :class="containerClasses">
 *   <div :class="contentClasses">Contenido bloqueado</div>
 * </div>
 */
export function usePremiumLock(isPremium, condition = false) {

  /**
   * Determina si el contenido está bloqueado
   * Si isPremium es true, nunca estará bloqueado
   * Si isPremium es false, depende de la condición
   */
  const isLocked = computed(() => {
    const premium = typeof isPremium === 'object' ? isPremium.value : isPremium
    const cond = typeof condition === 'object' ? condition.value : condition

    return !premium && cond
  })

  /**
   * Clases CSS para el contenedor principal
   * Siempre incluye relative y overflow-hidden para el badge overlay
   */
  const containerClasses = computed(() => {
    return 'relative overflow-hidden'
  })

  /**
   * Clases CSS para el contenido que puede tener blur
   * Aplica blur-sm y select-none cuando está bloqueado
   */
  const contentClasses = computed(() => {
    return isLocked.value ? 'blur-sm select-none' : ''
  })

  /**
   * Indica si debe mostrarse el badge Premium
   */
  const showBadge = computed(() => isLocked.value)

  /**
   * Clases para el overlay del badge
   */
  const badgeOverlayClasses = computed(() => {
    return 'absolute inset-0 flex items-center justify-center pointer-events-none'
  })

  /**
   * Clases para el badge Premium
   */
  const badgeClasses = computed(() => {
    return 'flex items-center gap-1.5 px-3 py-1.5 bg-white text-orange-600 text-xs font-semibold rounded-full shadow-lg'
  })

  return {
    isLocked,
    containerClasses,
    contentClasses,
    showBadge,
    badgeOverlayClasses,
    badgeClasses,
  }
}
