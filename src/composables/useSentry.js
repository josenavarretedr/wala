import { withSentryCapture, setSentryUser, setSentryBusiness, addBreadcrumb, captureMessage, captureError } from '@/utils/sentryHelpers'
import * as Sentry from '@sentry/vue'

/**
 * Composable para usar Sentry fácilmente en componentes Vue
 * @example
 * const { trackError, trackEvent } = useSentry()
 * trackError(error, 'Error en formulario')
 */
export const useSentry = () => {

  /**
   * Captura un error con contexto personalizado
   * @param {Error} error - Error a capturar
   * @param {string} message - Mensaje descriptivo
   * @param {Object} context - Contexto adicional
   */
  const trackError = (error, message = '', context = {}) => {
    if (message) {
      addBreadcrumb(message, 'error', context)
    }

    return captureError(error, context)
  }

  /**
   * Registra un evento o acción del usuario
   * @param {string} message - Descripción del evento
   * @param {string} category - Categoría del evento
   * @param {Object} data - Datos adicionales
   */
  const trackEvent = (message, category = 'user-action', data = {}) => {
    addBreadcrumb(message, category, data)
  }

  /**
   * Envía un mensaje informativo a Sentry
   * @param {string} message - Mensaje a enviar
   * @param {string} level - Nivel: 'info', 'warning', 'error'
   */
  const sendMessage = (message, level = 'info') => {
    return captureMessage(message, level)
  }

  /**
   * Envuelve una llamada API para capturar errores automáticamente
   * @param {Function} apiCall - Función que hace la llamada
   * @param {string} operationName - Nombre de la operación
   */
  const wrapApiCall = (apiCall, operationName) => {
    return withSentryCapture(apiCall, operationName)
  }

  /**
   * Establece el usuario actual en Sentry
   * @param {Object} user - Datos del usuario
   */
  const setUser = (user) => {
    setSentryUser(user)
  }

  /**
   * Establece el negocio actual en Sentry
   * @param {Object} business - Datos del negocio
   */
  const setBusiness = (business) => {
    setSentryBusiness(business)
  }

  /**
   * Envía feedback del usuario a Sentry
   * @param {Object} feedback - Datos del feedback
   */
  const sendFeedback = (feedback) => {
    return Sentry.captureFeedback(feedback)
  }

  return {
    trackError,
    trackEvent,
    sendMessage,
    wrapApiCall,
    setUser,
    setBusiness,
    sendFeedback,
  }
}
