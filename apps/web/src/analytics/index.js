/**
 * Analytics Wrapper - Firebase Analytics (GA4)
 * 
 * Centraliza el tracking de eventos en WALA.
 * 
 * REGLAS:
 * - NO enviar eventos en desarrollo/emulators
 * - Setear user_id automáticamente (Firebase Auth uid)
 * - Permitir apagado global del tracking
 * - Validar parámetros críticos antes de enviar
 */

import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import appFirebase from '@/firebaseInit';
import { getAuth } from 'firebase/auth';

// Inicializar Analytics
let analytics = null;
let isAnalyticsEnabled = true;

// Detectar si estamos en desarrollo/emulators
const isDevelopment = window.location.hostname === 'localhost' ||
  import.meta.env.MODE === 'development';

// Solo inicializar Analytics en producción
if (!isDevelopment) {
  try {
    analytics = getAnalytics(appFirebase);
    console.log('✅ Firebase Analytics inicializado');
  } catch (error) {
    console.error('❌ Error al inicializar Firebase Analytics:', error);
    analytics = null;
  }
} else {
  console.log('🚫 Analytics deshabilitado en desarrollo');
}

/**
 * Habilitar o deshabilitar el tracking global
 * @param {boolean} enabled 
 */
export function setAnalyticsEnabled(enabled) {
  isAnalyticsEnabled = enabled;
  console.log(`🔧 Analytics ${enabled ? 'habilitado' : 'deshabilitado'}`);
}

/**
 * Configurar el user_id para Analytics
 * Debe llamarse después del login
 */
export function setAnalyticsUserId() {
  if (!analytics || !isAnalyticsEnabled || isDevelopment) return;

  const auth = getAuth(appFirebase);
  const user = auth.currentUser;

  if (user) {
    setUserId(analytics, user.uid);
    console.log('✅ Analytics user_id configurado:', user.uid);
  }
}

/**
 * Configurar propiedades de usuario
 * @param {Object} properties - Propiedades del usuario (ej: businessId, plan, etc.)
 */
export function setAnalyticsUserProperties(properties) {
  if (!analytics || !isAnalyticsEnabled || isDevelopment) return;

  setUserProperties(analytics, properties);
  console.log('✅ Analytics user properties configuradas:', properties);
}

/**
 * Trackear un evento de analytics
 * @param {string} eventName - Nombre del evento
 * @param {Object} params - Parámetros del evento
 */
export function trackEvent(eventName, params = {}) {
  // No enviar eventos en desarrollo pero loguear claramente
  if (isDevelopment) {
    console.log('\n📊 ═══════════════════════════════════════');
    console.log('📊 [FRONTEND ANALYTICS - DEV MODE]');
    console.log('📊 Event:', eventName);
    console.log('📊 Params:', JSON.stringify(params, null, 2));
    console.log('📊 ═══════════════════════════════════════\n');
    return;
  }

  // Validar que Analytics esté habilitado
  if (!analytics || !isAnalyticsEnabled) {
    console.warn('⚠️ Analytics no está disponible o está deshabilitado');
    return;
  }

  // Validar eventName
  if (!eventName || typeof eventName !== 'string') {
    console.error('❌ Event name inválido:', eventName);
    return;
  }

  try {
    // Agregar user_id automáticamente si está disponible
    const auth = getAuth(appFirebase);
    const user = auth.currentUser;

    const enrichedParams = {
      ...params,
      user_id: user?.uid || params.user_id || null,
      timestamp: new Date().toISOString()
    };

    // Enviar evento
    logEvent(analytics, eventName, enrichedParams);

    console.log('✅ Analytics event tracked:', eventName, enrichedParams);
  } catch (error) {
    console.error('❌ Error al trackear evento:', eventName, error);
  }
}

/**
 * Calcular días desde la última transacción válida
 * @param {Object} dailySummary - Resumen diario previo
 * @returns {number} - Días desde última transacción válida
 */
export function calculateDaysSinceLastValidTransaction(dailySummary) {
  if (!dailySummary || !dailySummary.day) return null;

  try {
    const lastDay = new Date(dailySummary.day);
    const today = new Date();
    const diffTime = Math.abs(today - lastDay);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error('❌ Error calculando días desde última transacción:', error);
    return null;
  }
}

/**
 * Determinar el net_result basado en el total
 * @param {number} total - Total neto
 * @returns {string} - 'positive' | 'negative' | 'zero'
 */
export function getNetResult(total) {
  if (total > 0) return 'positive';
  if (total < 0) return 'negative';
  return 'zero';
}

/**
 * Validar si una transacción es válida para racha
 * @param {string} type - Tipo de transacción
 * @returns {boolean}
 */
export function isValidTransactionForStreak(type) {
  return type === 'income' || type === 'expense';
}

// Eventos específicos de negocio

/**
 * Evento: Día abierto (manual)
 */
export function trackDayOpened({ businessId, dayId, daysSinceLastValidTransaction }) {
  trackEvent('day_opened', {
    business_id: businessId,
    day_id: dayId,
    source: 'manual',
    days_since_last_valid_transaction: daysSinceLastValidTransaction
  });
}

/**
 * Evento: Transacción iniciada
 */
export function trackTransactionStarted({ businessId, dayId, uiSurface }) {
  trackEvent('transaction_started', {
    business_id: businessId,
    day_id: dayId,
    ui_surface: uiSurface || 'unknown'
  });
}

/**
 * Evento: Transacción creada (SOLO income/expense)
 */
export function trackTransactionCreated({
  businessId,
  dayId,
  transactionType,
  amount,
  account,
  isFirstTransactionOfDay
}) {
  // Validar que sea income o expense
  if (!isValidTransactionForStreak(transactionType)) {
    console.log('🚫 Transaction type no válido para tracking:', transactionType);
    return;
  }

  trackEvent('transaction_created', {
    business_id: businessId,
    day_id: dayId,
    transaction_type: transactionType,
    amount: amount,
    account: account,
    source: 'manual',
    is_first_transaction_of_day: isFirstTransactionOfDay
  });
}

/**
 * Evento: Transacción abandonada
 */
export function trackTransactionAbandoned({ businessId, dayId, step, reason }) {
  trackEvent('transaction_abandoned', {
    business_id: businessId,
    day_id: dayId,
    step: step || 'unknown',
    reason: reason || null
  });
}

/**
 * Evento: Día cerrado (manual)
 */
export function trackDayClosed({ businessId, dayId, transactionsCount, netResult }) {
  trackEvent('day_closed', {
    business_id: businessId,
    day_id: dayId,
    source: 'manual',
    transactions_count: transactionsCount,
    net_result: netResult
  });
}

/**
 * Evento: Resumen visualizado
 */
export function trackSummaryViewed({
  businessId,
  dayId,
  transactionsCount,
  netResult,
  streakLength
}) {
  trackEvent('summary_viewed', {
    business_id: businessId,
    day_id: dayId,
    transactions_count: transactionsCount,
    net_result: netResult,
    streak_length: streakLength || null
  });
}

export default {
  setAnalyticsEnabled,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
  trackEvent,
  trackDayOpened,
  trackTransactionStarted,
  trackTransactionCreated,
  trackTransactionAbandoned,
  trackDayClosed,
  trackSummaryViewed,
  calculateDaysSinceLastValidTransaction,
  getNetResult,
  isValidTransactionForStreak
};
