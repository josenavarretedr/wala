import * as Sentry from '@sentry/vue'

/**
 * 🛡️ Utilidades para integración con Sentry
 */

/**
 * Envuelve llamadas asíncronas para capturar errores automáticamente en Sentry
 * @param {Function} apiCall - Función que realiza la llamada (debe retornar una promesa)
 * @param {string} operationName - Nombre descriptivo de la operación (e.g., 'auth.login', 'products.fetch')
 * @returns {Promise} El resultado de la llamada
 */
export const withSentryCapture = async (apiCall, operationName = 'API Call') => {
  try {
    const result = await apiCall()

    // Verificar si el resultado contiene un error (patrón común en Supabase/Firebase)
    if (result && result.error) {
      Sentry.captureException(result.error, {
        tags: {
          operation: operationName,
          type: 'api_error',
        },
        contexts: {
          api: {
            operation: operationName,
            error_code: result.error.code || 'unknown',
            error_message: result.error.message || 'Unknown error',
          },
        },
      })
    }

    return result
  } catch (error) {
    // Capturar errores de red, timeouts, etc.
    Sentry.captureException(error, {
      tags: {
        operation: operationName,
        type: 'network_error',
      },
      contexts: {
        api: {
          operation: operationName,
          error_type: error.name || 'Error',
          error_message: error.message || 'Unknown error',
        },
      },
    })
    throw error
  }
}

/**
 * Establece la información del usuario actual en Sentry
 * Útil para identificar quién experimentó el error
 * @param {Object} user - Objeto con datos del usuario
 * @param {string} user.uid - ID único del usuario
 * @param {string} user.email - Email del usuario
 * @param {string} user.displayName - Nombre para mostrar
 */
export const setSentryUser = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.uid,
      email: user.email,
      username: user.displayName || user.email,
    })

    console.log('🛡️ Usuario establecido en Sentry:', user.uid)
  } else {
    Sentry.setUser(null)
    console.log('🛡️ Usuario removido de Sentry')
  }
}

/**
 * Establece el negocio actual como contexto en Sentry
 * @param {Object} business - Objeto con datos del negocio
 */
export const setSentryBusiness = (business) => {
  if (business) {
    Sentry.setContext('business', {
      id: business.id,
      name: business.name,
      type: business.type,
    })

    Sentry.setTag('business_id', business.id)
    console.log('🛡️ Negocio establecido en Sentry:', business.id)
  } else {
    Sentry.setContext('business', null)
    Sentry.setTag('business_id', null)
  }
}

/**
 * Agrega breadcrumb (rastro) de una acción del usuario
 * Útil para entender qué hizo el usuario antes de un error
 * @param {string} message - Descripción de la acción
 * @param {string} category - Categoría (e.g., 'auth', 'navigation', 'transaction')
 * @param {Object} data - Datos adicionales
 */
export const addBreadcrumb = (message, category = 'user-action', data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
    timestamp: Date.now(),
  })
}

/**
 * Captura un mensaje informativo (no un error)
 * @param {string} message - Mensaje a enviar
 * @param {string} level - Nivel: 'info', 'warning', 'error'
 */
export const captureMessage = (message, level = 'info') => {
  return Sentry.captureMessage(message, level)
}

/**
 * Captura un error manualmente con contexto adicional
 * @param {Error} error - Error a capturar
 * @param {Object} context - Contexto adicional
 */
export const captureError = (error, context = {}) => {
  return Sentry.captureException(error, {
    tags: context.tags || {},
    extra: context.extra || {},
    level: context.level || 'error',
  })
}
