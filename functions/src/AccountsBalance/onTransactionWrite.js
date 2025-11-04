/* eslint-disable */

/**
 * @file onTransactionWrite.js
 * @description Trigger que actualiza dailySummary cuando se crea, actualiza o elimina una transacción.
 * 
 * Infraestructura consistente con:
 * - transactionStore.js (estructura de transacciones)
 * - accountsBalanceStore.js (cálculos financieros completos)
 * 
 * @module AccountsBalance/onTransactionWrite
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');




if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const { dayFromTimestamp } = require('../Helpers/time');
const { getDayAggregates, upsertDailySummary } = require('./sharedComputed');
const { updateStreakContextualizada } = require('../Streak/streakManager');

const DEFAULT_TZ = 'America/Lima';

/**
 * Trigger que se ejecuta cuando se escribe (create/update/delete) una transacción.
 * Recalcula todos los agregados financieros del día y actualiza el dailySummary.
 */
module.exports = functions.firestore
  .document('businesses/{businessId}/transactions/{txId}')
  .onWrite(async (change, context) => {
    const { businessId, txId } = context.params;

    console.log(`📝 Transaction write detected: ${txId} in business ${businessId}`);

    // Obtener documento (after si existe, before si fue eliminado)
    const doc = change.after.exists ? change.after.data() : (change.before.exists ? change.before.data() : null);

    if (!doc) {
      console.log('⚠️  No document data found, skipping');
      return null;
    }

    if (!doc.createdAt) {
      console.warn(`⚠️  Transaction ${txId} missing createdAt, skipping aggregation`);
      return null;
    }

    // Obtener timezone del negocio
    const businessDoc = await db.doc(`businesses/${businessId}`).get();
    const tz = (businessDoc.exists && businessDoc.data().timezone) || DEFAULT_TZ;

    // Verificar que el negocio aún existe
    if (!businessDoc.exists) {
      console.log(`⚠️  Business ${businessId} no longer exists, skipping aggregation`);
      return null;
    }

    const day = dayFromTimestamp(doc.createdAt, tz);
    console.log(`📅 Processing day: ${day} (tz: ${tz})`);

    // Calcular agregados completos (estructura de accountsBalanceStore)
    const agg = await getDayAggregates(db, businessId, day, tz);

    console.log(`📊 Day aggregates calculated`);

    // Actualizar dailySummary con estructura completa
    await upsertDailySummary(db, businessId, day, {
      ...agg,
      lastUpdated: FieldValue.serverTimestamp()
    });

    // Actualizar racha contextualizada (pasar como objeto)
    await updateStreakContextualizada({
      db,
      businessId,
      day,
      summary: agg, // Ya tenemos los agregados calculados
      tz
    }).catch(err => {
      console.error('❌ Error updating streak:', err);
    });

    console.log(`✅ Daily summary updated for ${day}`);
    return null;
  });