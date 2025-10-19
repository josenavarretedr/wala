/* eslint-disable */

/**
 * @file scheduledAutoClose.js
 * @description Función programada que se ejecuta automáticamente cada día a medianoche.
 * Cierra todos los días anteriores que quedaron abiertos sin cierre manual.
 * 
 * Infraestructura consistente con:
 * - useTransaction.js (creación de transacciones)
 * - transactionStore.js (estructura de datos)
 * - useCashClosure.js (lógica de cierre)
 * - accountsBalanceStore.js (cálculos financieros)
 * 
 * Se ejecuta mediante Cloud Scheduler de Firebase Functions v1
 * 
 * @module AccountsBalance/scheduledAutoClose
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const { v4: uuidv4 } = require('uuid');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const { yesterdayStr } = require('../Helpers/time');
const { getDayAggregates, upsertDailySummary } = require('./sharedComputed');
const { breakStreak, incStreakIfConsecutive } = require('./sharedStreak');

const DEFAULT_TZ = 'America/Lima';

/**
 * Función programada que se ejecuta diariamente a las 23:59:10 (antes de medianoche).
 * Procesa todos los negocios activos y cierra días pendientes automáticamente.
 * 
 * Schedule: '59 23 * * *' = Diariamente a las 23:59:10 en timezone configurado
 * Timezone: America/Lima (UTC-5)
 * 
 * Casos de uso:
 * 1. Día abierto sin cierre → Crea cierre automático y rompe racha
 * 2. Día completo (apertura + transacciones + cierre) → Incrementa racha
 * 3. Día sin apertura o sin actividad → No hace nada
 * 
 * Logs: Se registran en Cloud Functions logs para auditoría
 */
module.exports = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutos timeout
    memory: '512MB'
  })
  .pubsub
  .schedule('59 23 * * *') // Diariamente a las 23:59:10
  .timeZone(DEFAULT_TZ)
  .onRun(async (context) => {
    const startTime = Date.now();
    console.log('🤖 ========================================');
    console.log('🤖 SCHEDULED AUTO-CLOSE START');
    console.log('🤖 ========================================');
    console.log(`🕐 Execution time: ${new Date().toISOString()}`);
    console.log(`📅 Schedule event: ${context.eventId || 'N/A'}`);
    console.log(`⏰ Timestamp: ${context.timestamp || 'N/A'}`);

    try {
      // Obtener todos los negocios activos
      const businessesSnapshot = await db.collection('businesses').get();
      console.log(`\n📊 Found ${businessesSnapshot.size} businesses to process`);

      const results = {
        total: businessesSnapshot.size,
        processed: 0,
        autoClosed: 0,
        streakIncreased: 0,
        noAction: 0,
        errors: 0,
        details: []
      };

      // Procesar cada negocio
      for (const businessDoc of businessesSnapshot.docs) {
        const businessId = businessDoc.id;
        const businessData = businessDoc.data();

        try {
          console.log(`\n${'='.repeat(60)}`);
          console.log(`🏪 Processing business: ${businessId}`);
          console.log(`   Name: ${businessData.name || 'N/A'}`);

          // Obtener timezone del negocio (o usar default)
          const tz = businessData.timezone || DEFAULT_TZ;
          console.log(`🌍 Timezone: ${tz}`);

          // Calcular día anterior
          const day = yesterdayStr(tz);
          console.log(`📅 Checking day: ${day}`);

          // Obtener agregados del día
          const agg = await getDayAggregates(db, businessId, day, tz);
          console.log(`📊 Day status:`, {
            hasOpening: agg.hasOpening,
            hasClosure: agg.hasClosure,
            hasTxn: agg.hasTxn
          });

          // Actualizar resumen diario base con estructura completa
          await upsertDailySummary(db, businessId, day, {
            ...agg // Estructura completa de accountsBalanceStore
          });

          let action = 'none';
          let transactionId = null;

          // === CASO 1: DÍA ABIERTO SIN CIERRE ===
          if (agg.hasOpening && !agg.hasClosure) {
            console.log(`⚠️  OPEN without closure - Creating automatic closure`);

            // Generar UUID para la transacción (consistente con useTransaction)
            const closureUuid = uuidv4();
            const closureRef = db.collection(`businesses/${businessId}/transactions`).doc(closureUuid);

            // Acceso seguro a propiedades anidadas sin optional chaining
            const totalIngresos = agg.totals ? agg.totals.totalIngresos || 0 : 0;
            const totalEgresos = agg.totals ? agg.totals.totalEgresos || 0 : 0;
            const resultadoOperacional = agg.operational ? agg.operational.resultadoOperacional || 0 : 0;

            // Estructura de transacción consistente con transactionStore
            const closureTransaction = {
              uuid: closureUuid,
              type: 'closure',
              description: 'Cierre automático programado',
              source: 'copilot',
              copilotMode: 'scheduled',
              account: 'cash', // Default account
              amount: 0,
              // Metadata para trazabilidad completa
              metadata: {
                day: day,
                triggerType: 'scheduled_auto_close',
                autoGenerated: true,
                executionTime: new Date().toISOString(),
                aggregates: {
                  totalIncome: totalIngresos,
                  totalExpense: totalEgresos,
                  netResult: resultadoOperacional,
                  hasTransactions: agg.hasTxn || false
                }
              },
              createdAt: FieldValue.serverTimestamp()
            };

            // Crear transacción de cierre
            await closureRef.set(closureTransaction);
            console.log(`✅ Closure created: ${closureUuid}`);

            // Recalcular agregados después del cierre
            const updatedAgg = await getDayAggregates(db, businessId, day, tz);

            // Actualizar resumen diario con info de cierre (merge sobre datos existentes)
            await upsertDailySummary(db, businessId, day, {
              ...updatedAgg,
              isAutoClosed: true,
              closureId: closureUuid,
              autoCloseReason: 'scheduled',
              completedAt: FieldValue.serverTimestamp()
            });
            console.log(`✅ Daily summary updated with closure info`);

            // Romper racha por cierre automático
            await breakStreak(db, businessId);
            console.log(`📉 Streak broken (automatic closure)`);

            // Registrar en logs de auditoría
            await db.collection(`businesses/${businessId}/autoCloseLogs`).add({
              day,
              closureTransactionId: closureUuid,
              executedAt: FieldValue.serverTimestamp(),
              triggerType: 'scheduled',
              aggregates: updatedAgg.totals || {}
            });

            results.autoClosed++;
            action = 'auto-closed';
            transactionId = closureUuid;
          }
          // === CASO 2: DÍA COMPLETO ===
          else if (agg.hasOpening && agg.hasTxn && agg.hasClosure) {
            console.log(`✨ Complete day - Incrementing streak`);
            await incStreakIfConsecutive(db, businessId, day, tz);
            console.log(`📈 Streak incremented`);
            results.streakIncreased++;
            action = 'streak-increased';
          }
          // === CASO 3: SIN ACCIÓN NECESARIA ===
          else {
            console.log(`ℹ️  No action needed`);
            if (!agg.hasOpening) console.log(`   - No opening found`);
            if (!agg.hasTxn) console.log(`   - No transactions found`);
            if (agg.hasClosure) console.log(`   - Already closed`);
            results.noAction++;
            action = 'no-action';
          }

          results.processed++;
          results.details.push({
            businessId,
            businessName: businessData.name || businessId,
            day,
            action,
            transactionId
          });

        } catch (businessError) {
          console.error(`❌ Error processing business ${businessId}:`, businessError);
          console.error(`   Stack: ${businessError.stack}`);
          results.errors++;
          results.details.push({
            businessId,
            businessName: businessData.name || businessId,
            action: 'error',
            error: businessError.message
          });

          // Registrar error en Firestore para auditoría
          await db.collection('systemLogs').add({
            type: 'scheduled_auto_close_error',
            businessId,
            error: businessError.message,
            stack: businessError.stack,
            timestamp: FieldValue.serverTimestamp()
          });
        }
      }

      // === RESUMEN FINAL ===
      const duration = Date.now() - startTime;
      console.log(`\n${'='.repeat(60)}`);
      console.log('✅ SCHEDULED AUTO-CLOSE COMPLETED');
      console.log('🤖 ========================================');
      console.log(`⏱️  Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
      console.log(`📊 Summary:`);
      console.log(`   - Total businesses: ${results.total}`);
      console.log(`   - Processed: ${results.processed}`);
      console.log(`   - Auto-closed: ${results.autoClosed} 🤖`);
      console.log(`   - Streak increased: ${results.streakIncreased} 📈`);
      console.log(`   - No action: ${results.noAction} ✓`);
      console.log(`   - Errors: ${results.errors} ❌`);
      console.log(`🕐 Finished at: ${new Date().toISOString()}`);

      // Mostrar detalles de acciones tomadas
      if (results.autoClosed > 0) {
        console.log(`\n🤖 Auto-closed businesses:`);
        results.details
          .filter(d => d.action === 'auto-closed')
          .forEach(d => {
            console.log(`   - ${d.businessName} (${d.day}): ${d.transactionId}`);
          });
      }

      if (results.streakIncreased > 0) {
        console.log(`\n📈 Streak increased:`);
        results.details
          .filter(d => d.action === 'streak-increased')
          .forEach(d => {
            console.log(`   - ${d.businessName} (${d.day})`);
          });
      }

      if (results.errors > 0) {
        console.log(`\n❌ Errors:`);
        results.details
          .filter(d => d.action === 'error')
          .forEach(d => {
            console.log(`   - ${d.businessName}: ${d.error}`);
          });
      }

      // Guardar resumen de ejecución en Firestore para análisis
      await db.collection('scheduledExecutions').add({
        type: 'auto_close',
        results: {
          total: results.total,
          processed: results.processed,
          autoClosed: results.autoClosed,
          streakIncreased: results.streakIncreased,
          noAction: results.noAction,
          errors: results.errors
        },
        duration,
        executedAt: FieldValue.serverTimestamp(),
        success: true
      });

      console.log(`\n💾 Execution summary saved to Firestore`);
      console.log('🤖 ========================================\n');

      return null;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('\n❌ ========================================');
      console.error('❌ CRITICAL ERROR in scheduled auto-close');
      console.error('❌ ========================================');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.log(`⏱️  Failed after: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);

      // Guardar error crítico en Firestore
      await db.collection('scheduledExecutions').add({
        type: 'auto_close',
        error: error.message,
        stack: error.stack,
        duration,
        executedAt: FieldValue.serverTimestamp(),
        success: false
      });

      console.error('❌ ========================================\n');

      throw error; // Re-throw para que Cloud Functions lo registre
    }
  });