/* eslint-disable */
/**
 * Analytics Helper para Firebase Functions
 * 
 * Permite enviar eventos de Google Analytics desde el backend
 * utilizando Firebase Analytics Admin SDK.
 * 
 * IMPORTANTE:
 * - Solo eventos automáticos y de racha
 * - Usar event_id determinístico para evitar duplicados
 * - Validar que el evento no exista antes de enviar
 */

const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

// Detectar si estamos en emuladores
const IS_EMULATOR = process.env.FUNCTIONS_EMULATOR === 'true';

/**
 * Trackear un evento de analytics desde Functions
 * 
 * @param {Object} params - Parámetros del evento
 * @param {string} params.businessId - ID del negocio
 * @param {string} params.eventName - Nombre del evento
 * @param {Object} params.eventParams - Parámetros del evento
 * @param {string} params.source - Origen del evento ('automatic' o 'copilot')
 */
async function trackEvent({ businessId, eventName, eventParams = {}, source = 'automatic' }) {
  // No enviar eventos en emuladores
  if (IS_EMULATOR) {
    console.log('📊 [EMULATOR] Analytics event:', eventName, eventParams);
    return { sent: false, reason: 'emulator' };
  }

  try {
    const db = admin.firestore();

    // Crear event_id determinístico
    const dayId = eventParams.day_id || new Date().toISOString().split('T')[0];
    const eventId = `${businessId}:${dayId}:${eventName}:${source}`;

    // Validar que el evento no exista
    const eventRef = db.doc(`businesses/${businessId}/analyticsEvents/${eventId}`);
    const eventDoc = await eventRef.get();

    if (eventDoc.exists) {
      console.log('⏭️ [ANALYTICS] Evento ya enviado:', eventId);
      return { sent: false, reason: 'duplicate', eventId };
    }

    // Preparar parámetros enriquecidos
    const enrichedParams = {
      ...eventParams,
      business_id: businessId,
      source: source,
      timestamp: new Date().toISOString(),
      environment: 'backend'
    };

    // Guardar registro del evento para evitar duplicados
    await eventRef.set({
      eventName,
      params: enrichedParams,
      sentAt: FieldValue.serverTimestamp(),
      eventId
    });

    // TODO: Aquí se enviará el evento a GA4 cuando se configure Measurement Protocol
    // Por ahora solo registramos el evento en Firestore
    console.log('✅ [ANALYTICS] Evento registrado:', eventName, enrichedParams);

    return { sent: true, eventId, params: enrichedParams };
  } catch (error) {
    console.error('❌ [ANALYTICS] Error al trackear evento:', error);
    return { sent: false, reason: 'error', error: error.message };
  }
}

/**
 * Trackear apertura automática de día
 */
async function trackAutoDayOpened({ businessId, dayId }) {
  return trackEvent({
    businessId,
    eventName: 'day_opened',
    eventParams: {
      day_id: dayId,
    },
    source: 'automatic'
  });
}

/**
 * Trackear cierre automático de día
 */
async function trackAutoDayClosed({ businessId, dayId, transactionsCount, netResult }) {
  return trackEvent({
    businessId,
    eventName: 'day_closed',
    eventParams: {
      day_id: dayId,
      transactions_count: transactionsCount || 0,
      net_result: netResult || 'zero'
    },
    source: 'automatic'
  });
}

/**
 * Trackear extensión de racha
 */
async function trackStreakExtended({ businessId, streakLength, daysSinceLastValidTransaction }) {
  const today = new Date();
  const dayId = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return trackEvent({
    businessId,
    eventName: 'streak_extended',
    eventParams: {
      day_id: dayId,
      streak_length: streakLength,
      days_since_last_valid_transaction: daysSinceLastValidTransaction || 1,
      trigger: 'transaction'
    },
    source: 'automatic'
  });
}

/**
 * Trackear ruptura de racha
 */
async function trackStreakBroken({ businessId, previousStreakLength, daysWithoutTransaction }) {
  const today = new Date();
  const dayId = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return trackEvent({
    businessId,
    eventName: 'streak_broken',
    eventParams: {
      day_id: dayId,
      previous_streak_length: previousStreakLength,
      days_without_transaction: daysWithoutTransaction,
      reason: 'inactivity'
    },
    source: 'automatic'
  });
}

/**
 * Determinar el net_result basado en el total
 */
function getNetResult(total) {
  if (!total || isNaN(total)) return 'zero';
  if (total > 0) return 'positive';
  if (total < 0) return 'negative';
  return 'zero';
}

module.exports = {
  trackEvent,
  trackAutoDayOpened,
  trackAutoDayClosed,
  trackStreakExtended,
  trackStreakBroken,
  getNetResult
};
