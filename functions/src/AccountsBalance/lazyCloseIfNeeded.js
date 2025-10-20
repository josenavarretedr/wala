/* eslint-disable */

/**
 * @file lazyCloseIfNeeded.js
 * @description Función callable que cierra automáticamente el día anterior si quedó abierto.
 * Se ejecuta al momento de hacer una apertura nueva (lazy-open).
 * 
 * Infraestructura consistente con:
 * - useTransaction.js (manejo de transacciones)
 * - useCashClosure.js (lógica de cierre)
 * - transactionStore.js (estructura de transacciones)
 * 
 * @module AccountsBalance/lazyCloseIfNeeded
 */

// Firebase Functions v1
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const { yesterdayStr, endOfDay } = require('../Helpers/time');
const { getDayAggregates, upsertDailySummary } = require('./sharedComputed');
const { breakStreak } = require('./sharedStreak');

const DEFAULT_TZ = 'America/Lima';

/**
 * Cierra automáticamente el día anterior si quedó abierto sin cierre manual.
 * Esto permite mantener la integridad de los datos cuando el usuario olvida cerrar.
 * 
 * Flujo (similar a useCashClosure.createClosure):
 * 1. Verifica autenticación y businessId
 * 2. Calcula el día anterior según timezone
 * 3. Verifica si tiene apertura pero no cierre
 * 4. Crea transacción de cierre automático con UUID
 * 5. Actualiza dailySummary
 * 6. Rompe la racha de días consecutivos
 * 
 * @param {Object} data - { businessId: string }
 * @param {Object} context - Firebase auth context
 * @returns {Object} { closed: boolean, mode?: string, day?: string, reason?: string }
 */
module.exports = functions.https.onCall(async (data, context) => {
  // === VALIDACIÓN DE AUTENTICACIÓN ===
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Autenticación requerida');
  }

  // === VALIDACIÓN DE PARÁMETROS ===
  const businessId = data && data.businessId;
  if (!businessId) {
    throw new functions.https.HttpsError('invalid-argument', 'businessId es requerido');
  }

  console.log(`🔍 Lazy close check for business: ${businessId}`);

  // === OBTENER TIMEZONE DEL NEGOCIO ===
  const businessDoc = await db.doc(`businesses/${businessId}`).get();

  if (!businessDoc.exists) {
    throw new functions.https.HttpsError('not-found', `Negocio ${businessId} no encontrado`);
  }

  const businessData = businessDoc.data();
  const tz = (businessData && businessData.timezone) || DEFAULT_TZ;

  // === CALCULAR DÍA ANTERIOR ===
  const day = yesterdayStr(tz);
  console.log(`📅 Checking day: ${day} (tz: ${tz})`);

  // === OBTENER AGREGADOS DEL DÍA ===
  const agg = await getDayAggregates(db, businessId, day, tz);

  console.log(`📊 Day status:`, {
    hasOpening: agg.hasOpening,
    hasClosure: agg.hasClosure,
    hasTxn: agg.hasTxn
  });

  // === VERIFICAR SI NECESITA CIERRE AUTOMÁTICO ===
  if (agg.hasOpening && !agg.hasClosure) {
    console.log(`🔒 Creating automatic closure for ${day}`);

    // Generar UUID para la transacción (consistente con useTransaction)
    const closureUuid = uuidv4();
    const closureRef = db.collection(`businesses/${businessId}/transactions`).doc(closureUuid);

    // Acceso seguro a propiedades anidadas
    const openingData = agg.opening || {};
    const totals = agg.totals || {};

    // Calcular el timestamp del final del día anterior (23:59:59.999)
    // Esto es importante porque el cierre pertenece al día anterior, no al momento actual
    const closureTimestamp = admin.firestore.Timestamp.fromDate(endOfDay(day, tz));

    // Estructura completa de cierre (consistente con buildClosureTransaction)
    const closureTransaction = {
      uuid: closureUuid,
      type: 'closure',
      description: 'Cierre automático (lazy-open)',
      source: 'copilot',
      copilotMode: 'lazyOpen',
      openingReference: openingData.uuid || null,

      // Saldos iniciales (de la apertura)
      initialCashBalance: openingData.realCashBalance || 0,
      initialBankBalance: openingData.realBankBalance || 0,

      // Movimientos del día
      totalIngresos: totals.totalIngresos || 0,
      totalEgresos: totals.totalEgresos || 0,
      ingresosCash: totals.ingresosCash || 0,
      ingresosBank: totals.ingresosBank || 0,
      egresosCash: totals.egresosCash || 0,
      egresosBank: totals.egresosBank || 0,

      // Balances esperados
      expectedCashBalance: totals.expectedFinalCash || 0,
      expectedBankBalance: totals.expectedFinalBank || 0,

      // Balances reales (igual a esperados en cierre automático)
      realCashBalance: totals.expectedFinalCash || 0,
      realBankBalance: totals.expectedFinalBank || 0,

      // Campos compatibles
      totalCash: totals.expectedFinalCash || 0,
      totalBank: totals.expectedFinalBank || 0,
      cashAmount: totals.expectedFinalCash || 0,
      bankAmount: totals.expectedFinalBank || 0,

      // Diferencias (0 en cierre automático sin conteo real)
      cashDifference: 0,
      bankDifference: 0,

      items: [],
      itemsAndStockLogs: [],
      amount: 0,

      // Metadata para trazabilidad
      metadata: {
        closedDay: day, // El día que se está cerrando (día anterior)
        triggerType: 'lazy_open',
        autoGenerated: true,
        actualExecutionTime: new Date().toISOString(), // Cuándo se ejecutó realmente
        closureTimestamp: closureTimestamp.toDate().toISOString() // Timestamp lógico del cierre
      },
      // IMPORTANTE: createdAt debe ser el final del día anterior (23:59:59.999)
      // para que el cierre pertenezca cronológicamente al día correcto
      createdAt: closureTimestamp
    };

    // Crear transacción de cierre
    await closureRef.set(closureTransaction);
    console.log(`✅ Closure transaction created xd: ${closureUuid}`);
    // Recalcular agregados después del cierre
    const updatedAgg = await getDayAggregates(db, businessId, day, tz);

    // Actualizar resumen diario con estructura completa + flags de cierre automático
    await upsertDailySummary(db, businessId, day, {
      ...updatedAgg, // Toda la estructura completa de accountsBalanceStore
      hasClosure: true,
      isAutoClosed: true,
      closureId: closureUuid,
      autoCloseReason: 'lazyOpen',
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ Daily summary updated with complete financial data`);

    // Romper racha de días consecutivos
    await breakStreak(db, businessId);
    console.log(`📉 Streak broken due to automatic closure`);

    // Registrar en traceability_logs para trazabilidad completa
    await db.collection(`businesses/${businessId}/traceability_logs`).add({
      operationType: 'auto_close',
      entityType: 'transaction',
      entityId: closureUuid,
      operation: 'lazy_open_closure',
      day, // Día que se cerró (día anterior)
      closureTransactionId: closureUuid,
      triggerType: 'lazy_open',
      autoGenerated: true,
      financialData: {
        totalIngresos: closureTransaction.totalIngresos,
        totalEgresos: closureTransaction.totalEgresos,
        expectedCashBalance: closureTransaction.expectedCashBalance,
        expectedBankBalance: closureTransaction.expectedBankBalance,
        realCashBalance: closureTransaction.realCashBalance,
        realBankBalance: closureTransaction.realBankBalance
      },
      // Timestamps explicativos
      closureTimestamp: closureTimestamp, // Timestamp lógico del cierre (23:59:59 del día anterior)
      executedAt: admin.firestore.FieldValue.serverTimestamp(), // Cuándo se ejecutó realmente
      timestamp: admin.firestore.FieldValue.serverTimestamp() // Timestamp del log
    });
    console.log(`✅ Traceability log created`);

    return {
      closed: true,
      mode: 'lazyOpen',
      day,
      closureId: closureUuid
    };
  }

  // No necesita cierre automático
  console.log(`ℹ️  No automatic closure needed`);
  return {
    closed: false,
    reason: 'no_missing_closure',
    day
  };
});
