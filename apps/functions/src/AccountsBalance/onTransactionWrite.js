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
    const after = change.after.exists ? change.after.data() : null;
    const before = change.before.exists ? change.before.data() : null;

    console.log(`📝 Transaction write detected: ${txId} in business ${businessId}`);

    // ✅ PROCESAR: Eliminaciones (necesario para recalcular dailySummary)
    if (!after && before) {
      console.log('🗑️ Transaction deleted, recalculating dailySummary...');

      if (!before.createdAt) {
        console.warn(`⚠️  Deleted transaction ${txId} missing createdAt, skipping aggregation`);
        return null;
      }

      // Obtener timezone del negocio
      const businessDoc = await db.doc(`businesses/${businessId}`).get();
      const tz = (businessDoc.exists && businessDoc.data().timezone) || DEFAULT_TZ;

      if (!businessDoc.exists) {
        console.log(`⚠️  Business ${businessId} no longer exists, skipping aggregation`);
        return null;
      }

      const day = dayFromTimestamp(before.createdAt, tz);
      console.log(`📅 Recalculating day: ${day} (tz: ${tz}) after deletion`);

      // Recalcular agregados del día
      const agg = await getDayAggregates(db, businessId, day, tz);
      console.log(`📊 Day aggregates recalculated after deletion`);

      // Actualizar dailySummary
      await upsertDailySummary(db, businessId, day, {
        ...agg,
        lastUpdated: FieldValue.serverTimestamp()
      });

      console.log(`✅ Daily summary updated for ${day} after deletion`);

      // ✅ ACTUALIZAR RACHA después de eliminación
      // Si el día ya no tiene transacciones (solo opening), la racha debe recalcularse
      if (agg.hasOpening) {
        console.log(`🔥 Recalculating streak after deletion...`);
        console.log(`📊 Day state after deletion:`, {
          hasOpening: agg.hasOpening,
          hasTxn: agg.hasTxn,
          hasClosure: agg.hasClosure
        });

        await updateStreakContextualizada({
          db,
          businessId,
          day,
          summary: agg,
          tz,
          autoClosePolicy: 'lenient' // Siempre valorar esfuerzo
        }).catch(err => {
          console.error('❌ Error updating streak after deletion:', err);
        });
      } else {
        console.log(`⏭️ Day has no opening after deletion - Skipping streak update`);
      }

      return null;
    }

    // Si no hay after ni before, es un evento inválido
    if (!after) {
      console.warn('⚠️ Transaction write event without after or before data, skipping');
      return null;
    }

    // ✅ IGNORAR: Actualizaciones que solo agregan pagos al array payments[]
    const isUpdate = before !== null;
    const beforePaymentsCount = before?.payments?.length || 0;
    const afterPaymentsCount = after?.payments?.length || 0;

    const isPaymentArrayUpdate = isUpdate &&
      after.type === 'income' && // Solo para ventas
      afterPaymentsCount !== beforePaymentsCount; // Array de pagos creció

    if (isPaymentArrayUpdate) {
      console.log('⏭️ Payment added to existing transaction, skipping (payment transaction will be processed separately)');
      console.log('📊 Updated transaction:', {
        uuid: after.uuid,
        type: after.type,
        createdAt: after.createdAt,
        paymentsCount: afterPaymentsCount,
        totalPaid: after.totalPaid,
        balance: after.balance
      });
      return null;
    }

    // ✅ IGNORAR: Actualizaciones que marcan una venta/pago histórico como 'refunded'
    // El impacto contable en caja del día actual se procesa al crear la transacción `type: 'refund'`,
    // preservando intacto el cierre histórico y evitando recalcular la racha del día pasado.
    const isRefundStatusUpdate = isUpdate &&
      (after.type === 'income' || after.type === 'payment') &&
      before?.status !== 'refunded' &&
      after.status === 'refunded';

    if (isRefundStatusUpdate) {
      console.log('⏭️ Transaction marked as refunded (historical day preserved), skipping dailySummary & streak recalculation:', {
        uuid: after.uuid || txId,
        type: after.type,
        createdAt: after.createdAt
      });
      return null;
    }

    const doc = after;

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
    console.log(`📝 Transaction details:`, {
      txId,
      type: doc.type,
      createdAt: doc.createdAt,
      calculatedDay: day,
      relatedTransactionId: doc.relatedTransactionId || 'N/A'
    });

    // Calcular agregados completos (estructura de accountsBalanceStore)
    const agg = await getDayAggregates(db, businessId, day, tz);

    console.log(`📊 Day aggregates calculated`);

    // Actualizar dailySummary con estructura completa
    await upsertDailySummary(db, businessId, day, {
      ...agg,
      lastUpdated: FieldValue.serverTimestamp()
    });

    // ✅ ACTUALIZAR RACHA en dos casos:
    // 1. Día está completo (hasOpening + hasTxn + hasClosure): Incrementa la racha
    // 2. Día activo sin cerrar (hasOpening + hasTxn): Solo actualiza lastActiveDay
    if (agg.hasOpening && agg.hasTxn) {
      console.log(`🔥 Day active - Updating streak contextually...`);

      await updateStreakContextualizada({
        db,
        businessId,
        day,
        summary: agg,
        tz,
        autoClosePolicy: 'lenient' // Siempre valorar esfuerzo
      }).catch(err => {
        console.error('❌ Error updating streak:', err);
      });
    } else {
      console.log(`⏭️ Day not active - Skipping streak update`, {
        hasOpening: agg.hasOpening,
        hasTxn: agg.hasTxn,
        hasClosure: agg.hasClosure
      });
    }

    console.log(`✅ Daily summary updated for ${day}`);
    return null;
  });