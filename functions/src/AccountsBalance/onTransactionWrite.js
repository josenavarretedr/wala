/* eslint-disable */

/**
 * @file onTransactionWrite.js
 * @description Trigger automático que se ejecuta cuando se crea, actualiza o elimina una transacción.
 * Actualiza el resumen diario (dailySummary) con los agregados financieros del día.
 * 
 * Infraestructura consistente con:
 * - useTransaction.js (composable)
 * - transactionStore.js (store)
 * - accountsBalanceStore.js (cálculos financieros)
 * 
 * @module AccountsBalance/onTransactionWrite
 */

// Firebase Functions v2
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { FieldValue } = require('firebase-admin/firestore');

const admin = require('firebase-admin');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const { dayFromTimestamp } = require('../Helpers/time');
const { getDayAggregates, upsertDailySummary } = require('./sharedComputed');

const DEFAULT_TZ = 'America/Lima';

/**
 * Trigger que recalcula el resumen diario cuando cambia una transacción
 * 
 * Flujo:
 * 1. Detecta cambios en cualquier transacción (create/update/delete)
 * 2. Obtiene la timezone del negocio
 * 3. Calcula agregados del día (ingresos, egresos, flags de apertura/cierre)
 * 4. Actualiza el documento dailySummary con los nuevos datos
 * 
 * Similar a como transactionStore.addTransaction() maneja las transacciones
 */
module.exports = onDocumentWritten(
  'businesses/{businessId}/transactions/{txId}',
  async (event) => {
    const { businessId, txId } = event.params;

    console.log(`📝 Transaction write detected: ${txId} in business ${businessId}`);

    // Usa after si existe; si se borró, usa before (para recalcular el día)
    const doc = event.data.after.exists ? event.data.after.data() : (event.data.before.exists ? event.data.before.data() : null);

    if (!doc) {
      console.log('⚠️  No document data found, skipping');
      return null;
    }

    // Validar que tenga createdAt (consistente con useTransaction.createTransaction)
    if (!doc.createdAt) {
      console.warn(`⚠️  Transaction ${txId} missing createdAt, skipping aggregation`);
      return null;
    }

    // Resolver timezone del negocio (default Lima)
    const businessDoc = await db.doc(`businesses/${businessId}`).get();
    const tz = (businessDoc.exists && businessDoc.data().timezone) || DEFAULT_TZ;

    // Determinar el día de la transacción
    const day = dayFromTimestamp(doc.createdAt, tz);
    console.log(`📅 Processing day: ${day} (tz: ${tz})`);

    // Calcular agregados del día
    const agg = await getDayAggregates(db, businessId, day, tz);

    console.log(`📊 Day aggregates:`, {
      hasOpening: agg.hasOpening,
      hasClosure: agg.hasClosure,
      hasTxn: agg.hasTxn,
      totals: agg.totals,
      operational: agg.operational
    });

    // Actualizar resumen diario con ESTRUCTURA COMPLETA (accountsBalanceStore)
    await upsertDailySummary(db, businessId, day, {
      ...agg, // Toda la estructura completa
      lastUpdated: FieldValue.serverTimestamp()
    });

    console.log(`✅ Daily summary updated for ${day} with complete financial data`);
    return null;
  }
);
