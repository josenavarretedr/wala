/* eslint-disable */
// scheduledAutoClose.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const { v4: uuidv4 } = require('uuid');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const { yesterdayStr, todayStr, dayFromDate } = require('../Helpers/time');
const { upsertDailySummary } = require('./sharedComputed');
const { breakStreak, incStreakIfConsecutive } = require('./sharedStreak');
const { executeAutoOpening } = require('./autoOpening');
const { DateTime } = require('luxon');

const DEFAULT_TZ = 'America/Lima';

/**
 * Obtiene el dailySummary directamente de Firestore.
 * Más eficiente que recalcular con getDayAggregates.
 */
async function getDailySummary(db, businessId, day) {
  const summaryRef = db.doc(`businesses/${businessId}/dailySummaries/${day}`);
  const summarySnap = await summaryRef.get();

  if (!summarySnap.exists) {
    return {
      hasOpening: false,
      hasClosure: false,
      hasTxn: false,
      opening: null,
      closure: null,
      totals: {
        expectedFinalCash: 0,
        expectedFinalBank: 0,
        totalIngresos: 0,
        totalEgresos: 0,
        ingresosCash: 0,
        ingresosBank: 0,
        egresosCash: 0,
        egresosBank: 0
      }
    };
  }

  return summarySnap.data();
}

module.exports = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '512MB'
  })
  .pubsub
  .schedule('59 23 * * *')
  .timeZone(DEFAULT_TZ)
  .onRun(async (context) => {
    const startTime = Date.now();

    // === USAR TIMESTAMP DEL SCHEDULER, NO DateTime.now() ===
    const scheduledTime = new Date(context.timestamp);

    console.log('🤖 ========================================');
    console.log('🤖 SCHEDULED AUTO-CLOSE START');
    console.log('🤖 ========================================');
    console.log(`🕐 Execution time: ${new Date().toISOString()}`);
    console.log(`📅 Schedule event: ${context.eventId || 'N/A'}`);
    console.log(`⏰ Scheduled timestamp: ${context.timestamp || 'N/A'}`);
    console.log(`⏰ Scheduled time (parsed): ${scheduledTime.toISOString()}`);

    // Crear helper para obtener el día basado en el timestamp del scheduler
    const getDayFromScheduledTime = (tz) => {
      return DateTime.fromJSDate(scheduledTime).setZone(tz).toFormat('yyyy-LL-dd');
    };


    try {
      const businessesSnapshot = await db.collection('businesses').get();
      console.log(`\n📊 Found ${businessesSnapshot.size} businesses to process`);

      const results = {
        total: businessesSnapshot.size,
        processed: 0,
        autoClosed: 0,
        autoOpened: 0,
        streakIncreased: 0,
        noAction: 0,
        errors: 0,
        details: []
      };

      for (const businessDoc of businessesSnapshot.docs) {
        const businessId = businessDoc.id;
        const businessData = businessDoc.data();

        try {
          console.log(`\n${'='.repeat(60)}`);
          console.log(`🏪 Processing business: ${businessId}`);
          console.log(`   Name: ${businessData.nombre || 'N/A'}`);

          const tz = businessData.timezone || DEFAULT_TZ;
          console.log(`🌍 Timezone: ${tz}`);

          // === FIX PRINCIPAL: Usar timestamp del scheduler ===
          const day = dayFromDate(scheduledTime, tz);
          console.log(`📅 Processing day (from scheduled time): ${day}`);

          // Debug adicional
          const currentDay = todayStr(tz);
          console.log(`📅 Current server day (for comparison): ${currentDay}`);

          if (day !== currentDay) {
            console.log(`⚠️  Note: Processing scheduled day ${day}, current is ${currentDay}`);
          }

          // === PASO 1: Leer dailySummary (más eficiente) ===
          console.log(`\n📋 STEP 1: Reading daily summary from Firestore...`);
          let summary = await getDailySummary(db, businessId, day);

          console.log(`📊 Initial day status:`, {
            hasOpening: summary.hasOpening,
            hasClosure: summary.hasClosure,
            hasTxn: summary.hasTxn
          });

          let action = 'none';
          let transactionId = null;

          // === PASO 2: Auto-apertura si es necesaria ===
          if (!summary.hasOpening) {
            console.log(`\n🔍 STEP 2: No opening found - Attempting auto-opening...`);

            try {
              const autoOpenResult = await executeAutoOpening({
                businessId,
                day,
                timezone: tz
              });

              if (autoOpenResult.success) {
                console.log(`✅ Auto-opening created: ${autoOpenResult.openingId}`);
                results.autoOpened++;

                // Esperar a que onTransactionsWrite actualice el summary
                console.log(`⏳ Waiting for trigger to update summary...`);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Re-leer summary actualizado por el trigger
                summary = await getDailySummary(db, businessId, day);
                console.log(`📊 Updated status: hasOpening=${summary.hasOpening}`);

              } else if (autoOpenResult.data?.noPreviousClosure) {
                console.log(`⚠️  No previous closure found - skipping business`);
                results.noAction++;
                results.processed++;
                results.details.push({
                  businessId,
                  businessName: businessData.nombre || businessId,
                  day,
                  action: 'no-action-no-baseline',
                  reason: 'No previous closure found'
                });
                continue;
              }
            } catch (autoOpenError) {
              console.error(`❌ Error in auto-opening:`, autoOpenError.message);
              console.log(`   Continuing with closure check anyway...`);
            }
          } else {
            console.log(`\n✅ STEP 2: Opening already exists - skipping auto-opening`);
          }

          // === PASO 3: Auto-cierre si es necesario ===
          if (summary.hasOpening && !summary.hasClosure) {
            console.log(`\n⚠️  STEP 3: Day is OPEN without closure - Creating automatic closure`);

            const closureUuid = uuidv4();
            const closureRef = db.collection(`businesses/${businessId}/transactions`).doc(closureUuid);

            const openingData = summary.openingData || {};
            const { byAccount, balances, totals } = summary;

            const closureTransaction = {
              uuid: closureUuid,
              type: 'closure',
              description: 'Cierre automático programado',
              source: 'copilot',
              copilotMode: 'scheduled',
              openingReference: openingData.id || null,

              // Saldos iniciales (de la apertura)
              initialCashBalance: openingData.realCashBalance || 0,
              initialBankBalance: openingData.realBankBalance || 0,

              // Movimientos del día
              totalIngresos: totals.income || 0,
              totalEgresos: totals.expense || 0,
              ingresosCash: byAccount.cash.income || 0,
              ingresosBank: byAccount.bank.income || 0,
              egresosCash: byAccount.cash.expense || 0,
              egresosBank: byAccount.bank.expense || 0,

              // Balances esperados
              expectedCashBalance: balances.expected.cash || 0,
              expectedBankBalance: balances.expected.bank || 0,

              // Balances reales (igual a esperados en cierre automático)
              realCashBalance: balances.actual.cash || 0,
              realBankBalance: balances.actual.bank || 0,

              // Diferencias (0 en cierre automático)
              cashDifference: 0,
              bankDifference: 0,

              items: [],
              itemsAndStockLogs: [],
              amount: 0,

              metadata: {
                day: day,
                triggerType: 'scheduled_auto_close',
                autoGenerated: true,
                executionTime: new Date().toISOString(),
                hasTransactions: summary.hasTxn || false
              },
              createdAt: FieldValue.serverTimestamp()
            };

            // Crear cierre (onTransactionsWrite lo procesará automáticamente)
            await closureRef.set(closureTransaction);
            console.log(`✅ Closure created: ${closureUuid}`);
            console.log(`   onTransactionsWrite will update dailySummary automatically`);

            // Registrar metadata adicional
            await upsertDailySummary(db, businessId, day, {
              isAutoClosed: true,
              autoCloseReason: 'scheduled',
              completedAt: FieldValue.serverTimestamp()
            });

            // Romper racha por cierre automático
            await breakStreak(db, businessId);
            console.log(`📉 Streak broken (automatic closure)`);

            // Traceability log
            await db.collection(`businesses/${businessId}/traceability_logs`).add({
              operationType: 'auto_close',
              entityType: 'transaction',
              entityId: closureUuid,
              operation: 'scheduled_closure',
              day,
              closureTransactionId: closureUuid,
              triggerType: 'scheduled_auto_close',
              autoGenerated: true,
              financialData: {
                totalIngresos: closureTransaction.totalIngresos,
                totalEgresos: closureTransaction.totalEgresos,
                expectedCashBalance: closureTransaction.expectedCashBalance,
                expectedBankBalance: closureTransaction.expectedBankBalance,
                realCashBalance: closureTransaction.realCashBalance,
                realBankBalance: closureTransaction.realBankBalance
              },
              executedAt: FieldValue.serverTimestamp(),
              timestamp: FieldValue.serverTimestamp()
            });

            results.autoClosed++;
            action = 'auto-closed';
            transactionId = closureUuid;
          }
          // === CASO: Día completo ===
          else if (summary.hasOpening && summary.hasTxn && summary.hasClosure) {
            console.log(`\n✨ STEP 3: Complete day - Incrementing streak`);
            await incStreakIfConsecutive(db, businessId, day, tz);
            console.log(`📈 Streak incremented`);
            results.streakIncreased++;
            action = 'streak-increased';
          }
          // === CASO: Sin acción necesaria ===
          else {
            console.log(`\nℹ️  STEP 3: No action needed`);
            if (!summary.hasOpening) console.log(`   - No opening found`);
            if (!summary.hasTxn) console.log(`   - No transactions found`);
            if (summary.hasClosure) console.log(`   - Already closed`);
            results.noAction++;
            action = 'no-action';
          }

          results.processed++;
          results.details.push({
            businessId,
            businessName: businessData.nombre || businessId,
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
            businessName: businessData.nombre || businessId,
            action: 'error',
            error: businessError.message
          });

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
      console.log(`   - Auto-opened: ${results.autoOpened} 🚪`);
      console.log(`   - Auto-closed: ${results.autoClosed} 🤖`);
      console.log(`   - Streak increased: ${results.streakIncreased} 📈`);
      console.log(`   - No action: ${results.noAction} ✓`);
      console.log(`   - Errors: ${results.errors} ❌`);
      console.log(`🕐 Finished at: ${new Date().toISOString()}`);

      if (results.autoOpened > 0) {
        console.log(`\n🚪 Auto-opened businesses:`);
        results.details
          .filter(d => d.action === 'auto-opened')
          .forEach(d => {
            console.log(`   - ${d.businessName} (${d.day}): ${d.transactionId}`);
          });
      }

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

      await db.collection('scheduledExecutions').add({
        type: 'auto_close',
        results: {
          total: results.total,
          processed: results.processed,
          autoOpened: results.autoOpened,
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

      await db.collection('scheduledExecutions').add({
        type: 'auto_close',
        error: error.message,
        stack: error.stack,
        duration,
        executedAt: FieldValue.serverTimestamp(),
        success: false
      });

      console.error('❌ ========================================\n');
      throw error;
    }
  });