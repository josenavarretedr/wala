/* eslint-disable */

/**
 * @file autoOpening.js
 * @description Función callable que crea automáticamente la apertura del día copiando
 * los datos del cierre más reciente (generalmente del día anterior).
 * Se ejecuta cuando no hay apertura para el día actual y se necesita automatizar el proceso.
 * 
 * Infraestructura consistente con:
 * - useTransaction.js (creación de transacciones)
 * - transactionStore.js (estructura de datos)
 * - useCashClosure.js (lógica de cierre)
 * - scheduledAutoClose.js (automatización)
 * 
 * @module AccountsBalance/autoOpening
 */

// Firebase Functions v1
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const { v4: uuidv4 } = require('uuid');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const { todayStr, startOfDay } = require('../Helpers/time');
const { getDayAggregates, upsertDailySummary } = require('./sharedComputed');

const DEFAULT_TZ = 'America/Lima';

/**
 * Crea automáticamente la apertura del día copiando datos del cierre más reciente.
 * 
 * Flujo:
 * 1. Verifica que no haya apertura para el día
 * 2. Busca el cierre más reciente (generalmente del día anterior)
 * 3. Copia la información del cierre (saldos finales se convierten en iniciales)
 * 4. Guarda como transacción type = 'opening'
 * 5. Actualiza dailySummary
 * 6. Retorna éxito y deja mensaje para siguiente paso
 * 
 * @param {Object} data - { businessId: string, day?: string }
 * @param {Object} context - Firebase auth context
 * @returns {Object} { success: boolean, openingId?: string, day?: string, message?: string }
 */
module.exports = functions.https.onCall(async (data, context) => {
  console.log('🤖 ========================================');
  console.log('🤖 AUTO OPENING START');
  console.log('🤖 ========================================');

  // === VALIDACIÓN DE AUTENTICACIÓN ===
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Autenticación requerida');
  }

  // === VALIDACIÓN DE PARÁMETROS ===
  const businessId = data && data.businessId;
  if (!businessId) {
    throw new functions.https.HttpsError('invalid-argument', 'businessId es requerido');
  }

  console.log(`🏪 Processing business: ${businessId}`);

  try {
    // === OBTENER TIMEZONE DEL NEGOCIO ===
    const businessDoc = await db.doc(`businesses/${businessId}`).get();

    if (!businessDoc.exists) {
      throw new functions.https.HttpsError('not-found', `Negocio ${businessId} no encontrado`);
    }

    const businessData = businessDoc.data();
    const tz = (businessData && businessData.timezone) || DEFAULT_TZ;
    console.log(`🌍 Timezone: ${tz}`);

    // === CALCULAR DÍA (usar parámetro o día actual) ===
    const day = (data && data.day) || todayStr(tz);
    console.log(`📅 Target day: ${day}`);

    // === PASO 1: VERIFICAR QUE NO HAYA APERTURA ===
    console.log('\n📍 PASO 1: Verificando que no haya apertura...');
    const agg = await getDayAggregates(db, businessId, day, tz);

    if (agg.hasOpening) {
      console.log(`⚠️  Opening already exists for ${day} - No action needed`);
      return {
        success: false,
        reason: 'opening_already_exists',
        day,
        message: `Ya existe una apertura para el día ${day}`
      };
    }
    console.log(`✅ No opening found - proceeding with auto-opening`);

    // === PASO 2: BUSCAR EL CIERRE MÁS RECIENTE ===
    console.log('\n📍 PASO 2: Buscando el cierre más reciente...');
    
    // Buscar transacciones de tipo 'closure' anteriores al día actual, ordenadas por fecha descendente
    const dayStart = startOfDay(day, tz);
    const closuresSnapshot = await db.collection(`businesses/${businessId}/transactions`)
      .where('type', '==', 'closure')
      .where('createdAt', '<', dayStart)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (closuresSnapshot.empty) {
      console.log(`⚠️  No previous closure found - Cannot auto-open`);
      return {
        success: false,
        reason: 'no_previous_closure',
        day,
        message: 'No se encontró un cierre previo para copiar los datos'
      };
    }

    const mostRecentClosure = closuresSnapshot.docs[0].data();
    const mostRecentClosureId = closuresSnapshot.docs[0].id;
    console.log(`✅ Found most recent closure: ${mostRecentClosureId}`);
    console.log(`   📅 Closure date: ${mostRecentClosure.createdAt?.toDate().toISOString()}`);
    console.log(`   💰 Cash balance: ${mostRecentClosure.realCashBalance || 0}`);
    console.log(`   🏦 Bank balance: ${mostRecentClosure.realBankBalance || 0}`);

    // === PASO 3: COPIAR INFORMACIÓN DEL CIERRE ===
    console.log('\n📍 PASO 3: Copiando información del cierre...');
    
    // Los saldos finales del cierre se convierten en saldos iniciales de la apertura
    const initialCashBalance = mostRecentClosure.realCashBalance || mostRecentClosure.totalCash || 0;
    const initialBankBalance = mostRecentClosure.realBankBalance || mostRecentClosure.totalBank || 0;
    
    console.log(`   💰 Initial cash balance: ${initialCashBalance}`);
    console.log(`   🏦 Initial bank balance: ${initialBankBalance}`);

    // === PASO 4: GUARDAR COMO TRANSACTION TYPE = OPENING ===
    console.log('\n📍 PASO 4: Guardando como transacción de apertura...');
    
    // Generar UUID para la transacción (consistente con useTransaction)
    const openingUuid = uuidv4();
    const openingRef = db.collection(`businesses/${businessId}/transactions`).doc(openingUuid);

    // Estructura completa de apertura (consistente con buildOpeningTransaction)
    const openingTransaction = {
      uuid: openingUuid,
      type: 'opening',
      description: 'Apertura automática',
      source: 'copilot',
      copilotMode: 'autoOpening',
      
      // Saldos iniciales (copiados del cierre anterior)
      realCashBalance: initialCashBalance,
      realBankBalance: initialBankBalance,
      
      // Campos compatibles
      totalCash: initialCashBalance,
      totalBank: initialBankBalance,
      cashAmount: initialCashBalance,
      bankAmount: initialBankBalance,
      
      // Total combinado
      totalBalance: initialCashBalance + initialBankBalance,
      
      // Referencia al cierre del cual se copió
      previousClosureReference: mostRecentClosureId,
      
      // Items vacíos (no hay ajustes en apertura automática)
      items: [],
      itemsAndStockLogs: [],
      amount: 0,
      
      // Metadata para trazabilidad
      metadata: {
        day: day,
        triggerType: 'auto_opening',
        autoGenerated: true,
        copiedFrom: mostRecentClosureId,
        executionTime: new Date().toISOString()
      },
      createdAt: FieldValue.serverTimestamp()
    };

    // Crear transacción de apertura
    await openingRef.set(openingTransaction);
    console.log(`✅ Opening transaction created: ${openingUuid}`);

    // Recalcular agregados después de la apertura
    const updatedAgg = await getDayAggregates(db, businessId, day, tz);

    // Actualizar resumen diario con estructura completa
    await upsertDailySummary(db, businessId, day, {
      ...updatedAgg,
      isAutoOpened: true,
      openingId: openingUuid,
      autoOpenReason: 'auto_opening',
      openedAt: FieldValue.serverTimestamp()
    });
    console.log(`✅ Daily summary updated with opening info`);

    // Registrar en traceability_logs para trazabilidad completa
    await db.collection(`businesses/${businessId}/traceability_logs`).add({
      operationType: 'auto_open',
      entityType: 'transaction',
      entityId: openingUuid,
      operation: 'auto_opening',
      day,
      openingTransactionId: openingUuid,
      copiedFromClosure: mostRecentClosureId,
      triggerType: 'auto_opening',
      autoGenerated: true,
      financialData: {
        initialCashBalance: initialCashBalance,
        initialBankBalance: initialBankBalance,
        totalBalance: initialCashBalance + initialBankBalance
      },
      executedAt: FieldValue.serverTimestamp(),
      timestamp: FieldValue.serverTimestamp()
    });
    console.log(`✅ Traceability log created`);

    // === PASO 5: MENSAJE PARA SIGUIENTE PASO ===
    console.log('\n📍 PASO 5: Completado');
    console.log('🔔 PROXIMO PASO AQUÍ para que se vuelva a llamar a SEGUNDA PARTE DE LA FUNCION');
    console.log('🤖 ========================================');
    console.log('✅ AUTO OPENING COMPLETED SUCCESSFULLY');
    console.log('🤖 ========================================\n');

    return {
      success: true,
      openingId: openingUuid,
      day,
      copiedFromClosure: mostRecentClosureId,
      initialBalances: {
        cash: initialCashBalance,
        bank: initialBankBalance,
        total: initialCashBalance + initialBankBalance
      },
      message: 'Apertura automática creada exitosamente'
    };

  } catch (error) {
    console.error('\n❌ ========================================');
    console.error('❌ ERROR in auto-opening');
    console.error('❌ ========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('❌ ========================================\n');

    // Registrar error en Firestore para auditoría
    await db.collection('systemLogs').add({
      type: 'auto_opening_error',
      businessId: data.businessId,
      day: data.day || 'unknown',
      error: error.message,
      stack: error.stack,
      timestamp: FieldValue.serverTimestamp()
    });

    throw new functions.https.HttpsError('internal', `Error al crear apertura automática: ${error.message}`);
  }
});
