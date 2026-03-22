import { computed } from 'vue'
import { useBusinessStore } from '@/stores/businessStore'
import { useRouter } from 'vue-router'

/**
 * 🔐 Composable para gestionar suscripciones y features premium
 * 
 * Este composable centraliza toda la lógica de verificación de planes,
 * acceso a features y límites de uso para el negocio actual.
 * 
 * @example
 * // En un componente:
 * const { isPremium, hasAccess, requireFeature } = useSubscription()
 * 
 * if (!hasAccess('advancedReports')) {
 *   requireFeature('advancedReports') // Muestra modal de upgrade
 * }
 */
export function useSubscription() {
  const businessStore = useBusinessStore()
  const router = useRouter()

  // ==========================================
  // Estado Reactivo de Suscripción
  // ==========================================

  /**
   * Indica si el negocio tiene plan Premium activo (pagado)
   */
  const isPremium = computed(() => businessStore.isPremium)

  /**
   * Indica si el negocio tiene plan Pro activo
   */
  const isPro = computed(() => businessStore.isPro)

  /**
   * Indica si el negocio tiene plan Max activo
   */
  const isMax = computed(() => businessStore.isMax)

  /**
   * Indica si el negocio tiene plan Free
   */
  const isFree = computed(() => businessStore.isFree)

  /**
   * Indica si el negocio está en período de prueba activo
   */
  const isTrialActive = computed(() => businessStore.isTrialActive)

  /**
   * Objeto completo de suscripción del negocio
   */
  const subscription = computed(() => businessStore.subscription)

  /**
   * Límites de uso actuales (empleados, productos, etc.)
   */
  const limits = computed(() => businessStore.limits)

  /**
   * Días restantes de suscripción (null si es plan free)
   */
  const daysRemaining = computed(() => businessStore.subscriptionDaysRemaining)

  // ==========================================
  // Métodos de Verificación de Acceso
  // ==========================================

  /**
   * Verifica si el negocio tiene acceso a una feature específica
   * 
   * @param {string} featureName - Nombre de la feature (ej: 'advancedReports')
   * @returns {boolean} true si tiene acceso, false si no
   * 
   * @example
   * if (hasAccess('aiClassification')) {
   *   // Mostrar panel de clasificación AI
   * }
   */
  const hasAccess = (featureName) => {
    return businessStore.hasFeature(featureName)
  }

  /**
   * Verifica si se puede agregar un recurso según los límites del plan
   * 
   * @param {string} resourceType - Tipo de recurso ('employee' | 'product')
   * @returns {boolean} true si puede agregar, false si alcanzó el límite
   * 
   * @example
   * if (!checkLimit('product')) {
   *   alert('Has alcanzado el límite de productos')
   * }
   */
  const checkLimit = (resourceType) => {
    if (resourceType === 'employee') {
      return businessStore.canAddEmployee
    }
    if (resourceType === 'product') {
      return businessStore.canAddProduct
    }
    return true // Por defecto no hay límite
  }

  /**
   * Verifica si se puede agregar un empleado
   */
  const canAddEmployee = computed(() => businessStore.canAddEmployee)

  /**
   * Verifica si se puede agregar un producto
   */
  const canAddProduct = computed(() => businessStore.canAddProduct)

  // ==========================================
  // Métodos de UI y Navegación
  // ==========================================

  /**
   * Muestra un modal de upgrade cuando se intenta acceder a una feature premium
   * 
   * @param {string} featureName - Nombre de la feature bloqueada
   * @param {string} [customMessage] - Mensaje personalizado (opcional)
   * 
   * @example
   * showUpgradeModal('advancedReports', 'Necesitas Premium para ver reportes avanzados')
   */
  const showUpgradeModal = (featureName, customMessage = null) => {
    const messages = {
      advancedReports: 'Desbloquea reportes avanzados y exportación de datos con el plan Pro o Max.',
      multiLocation: 'Gestiona múltiples ubicaciones con el plan Max.',
      apiAccess: 'Accede a nuestra API para integraciones personalizadas con el plan Max.',
      prioritySupport: 'Obtén soporte prioritario y atención personalizada con el plan Max.',
      customBranding: 'Personaliza la marca de tus reportes y documentos con el plan Pro o Max.',
      aiClassification: 'Usa inteligencia artificial para clasificar productos automáticamente.',
      exportData: 'Exporta tus datos a Excel, PDF y más formatos con el plan Pro o Max.',
      maxEmployees: 'Has alcanzado el límite de empleados. Actualiza a Pro o Max para agregar ilimitados.',
      maxProducts: 'Has alcanzado el límite de productos. Actualiza a Pro o Max para agregar ilimitados.'
    }

    const message = customMessage || messages[featureName] || 'Esta función requiere el plan Pro o Max.'

    console.log('🚀 [useSubscription] Mostrar modal de upgrade')
    console.log('   Feature:', featureName)
    console.log('   Message:', message)

    // TODO: Implementar modal real con UI bonita
    // Por ahora usamos alert como placeholder
    const userChoice = confirm(
      `🔒 FUNCIÓN PRO/MAX\n\n${message}\n\n¿Deseas ver los planes disponibles?`
    )

    if (userChoice) {
      goToPlans()
    }
  }

  /**
   * Navega a la página de planes del negocio actual
   */
  const goToPlans = () => {
    const businessId = businessStore.getBusinessId
    if (businessId) {
      console.log('📍 [useSubscription] Navegando a planes:', businessId)
      router.push(`/business/${businessId}/plans`)
    } else {
      console.error('❌ [useSubscription] No hay businessId disponible')
    }
  }

  /**
   * Verifica acceso a una feature y opcionalmente muestra modal si no tiene acceso
   * 
   * @param {string} featureName - Nombre de la feature
   * @param {boolean} [showModal=true] - Si debe mostrar el modal de upgrade
   * @returns {boolean} true si tiene acceso, false si no
   * 
   * @example
   * // Verificar y bloquear acción
   * const handleExport = () => {
   *   if (!requireFeature('exportData')) return
   *   // Continuar con exportación...
   * }
   */
  const requireFeature = (featureName, showModal = true) => {
    const access = hasAccess(featureName)

    if (!access) {
      console.log('⛔ [useSubscription] Feature bloqueada:', featureName)
      
      if (showModal) {
        showUpgradeModal(featureName)
      }
    }

    return access
  }

  /**
   * Verifica límite antes de agregar recurso y muestra modal si es necesario
   * 
   * @param {string} resourceType - Tipo de recurso ('employee' | 'product')
   * @param {boolean} [showModal=true] - Si debe mostrar modal
   * @returns {boolean} true si puede agregar, false si no
   * 
   * @example
   * const handleAddProduct = () => {
   *   if (!requireLimit('product')) return
   *   // Continuar agregando producto...
   * }
   */
  const requireLimit = (resourceType, showModal = true) => {
    const canAdd = checkLimit(resourceType)

    if (!canAdd && showModal) {
      const featureMap = {
        employee: 'maxEmployees',
        product: 'maxProducts'
      }
      showUpgradeModal(featureMap[resourceType])
    }

    return canAdd
  }

  // ==========================================
  // Información de Plan
  // ==========================================

  /**
   * Obtiene información legible del plan actual
   */
  const planInfo = computed(() => {
    const sub = subscription.value

    let name = 'Free'
    let badge = '🆓'
    let color = 'gray'

    if (isMax.value || sub?.plan === 'premium') {
      name = 'Max'
      badge = '👑'
      color = 'amber'
    } else if (isPro.value) {
      name = 'Pro'
      badge = '⚡'
      color = 'indigo'
    }

    return {
      name,
      status: sub?.status || 'active',
      badge,
      color,
      startDate: sub?.startDate,
      endDate: sub?.endDate,
      daysLeft: daysRemaining.value
    }
  })

  /**
   * Indica si debe mostrar advertencia de expiración próxima
   */
  const shouldShowExpirationWarning = computed(() => {
    if (!isPremium.value && !isTrialActive.value) return false
    
    const days = daysRemaining.value
    return days !== null && days <= 7 && days > 0
  })

  // ==========================================
  // Return Public API
  // ==========================================

  return {
    // Estado
    isPremium,
    isPro,
    isMax,
    isFree,
    isTrialActive,
    subscription,
    limits,
    daysRemaining,
    planInfo,
    shouldShowExpirationWarning,

    // Verificación de acceso
    hasAccess,
    checkLimit,
    canAddEmployee,
    canAddProduct,

    // Acciones
    requireFeature,
    requireLimit,
    showUpgradeModal,
    goToPlans
  }
}
