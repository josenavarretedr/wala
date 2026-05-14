/* eslint-disable */
// scheduledAutoClose.js
// OPTIMIZED: Queries only active businesses via collectionGroup instead of scanning all.
// Eliminates auto-opening and sleep(2000) that were the main scalability bottlenecks.

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const { v4: uuidv4 } = require('uuid');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const { todayStr, dayFromDate } = require('../Helpers/time');
const { upsertDailySummary } = require('./sharedComputed');
const { trackAutoDayClosed, getNetResult } = require('../Helpers/analyticsHelper');
const { DateTime } = require('luxon');

const DEFAULT_TZ = 'America/Lima';

/**
 * Extrae el businessId desde la ruta del documento dailySummary.
 * Ruta esperada: businesses/{businessId}/dailySummaries/{day}
 * @param {FirebaseFirestore.DocumentReference} ref
 * @returns {string} businessId
 */
function extractBusinessId(ref) {
  // ref.path = "businesses/ABC123/dailySummaries/2026-05-13"
  const segments = ref.path.split('/');
  return segments[1]; // "ABC123"
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
    console.log('🤖 SCHEDULED AUTO-CLOSE START (OPTIMIZED)');
    console.log('🤖 ========================================');
    console.log(`🕐 Execution time: ${new Date().toISOString()}`);
    console.log(`📅 Schedule event: ${context.eventId || 'N/A'}`);
    console.log(`⏰ Scheduled timestamp: ${context.timestamp || 'N/A'}`);

    try {
      // === OPTIMIZACIÓN PRINCIPAL: Solo consultar negocios que necesitan cierre ===
      // En vez de db.collection('businesses').get() (lee TODOS),
      // usamos collectionGroup para filtrar directamente en Firestore.
      const day = dayFromDate(scheduledTime, DEFAULT_TZ);
      console.log(`📅 Processing day: ${day}`);

      // Query: dailySummaries donde hay apertura pero NO hay cierre para HOY
      const PAGE_SIZE = 100;
      let lastDoc = null;
      let totalFound = 0;

      const results = {
        total: 0,
        processed: 0,
        autoClosed: 0,
        alreadyClosed: 0,
        noAction: 0,
        errors: 0,
        details: []
      };

      // === PROCESAMIENTO PAGINADO ===
      let hasMore = true;

      while (hasMore) {
        let summariesQuery = db.collectionGroup('dailySummaries')
          .where('day', '==', day)
          .where('hasOpening', '==', true)
          .where('hasClosure', '==', false)
          .limit(PAGE_SIZE);

        if (lastDoc) {
          summariesQuery = summariesQuery.startAfter(lastDoc);
        }

        const summariesSnapshot = await summariesQuery.get();
        const pageSize = summariesSnapshot.size;
        totalFound += pageSize;

        console.log(`\n📦 Page: ${pageSize} businesses to process (total so far: ${totalFound})`);

        if (pageSize === 0) {
          hasMore = false;
          break;
        }

        // === PROCESAR CADA NEGOCIO DE ESTA PÁGINA ===
        for (const summaryDoc of summariesSnapshot.docs) {
          const summaryData = summaryDoc.data();
          const businessId = extractBusinessId(summaryDoc.ref);

          try {
            console.log(`\n${'─'.repeat(50)}`);
            console.log(`🏪 Processing business: ${businessId}`);

            // El summary ya tiene toda la data que necesitamos
            // (calculada previamente por onTransactionWrite)
            const { openingData, byAccount, balances, totals, transfers, adjustments, operational } = summaryData;

            if (!openingData) {
              console.log(`⚠️  No opening data in summary - skipping`);
              results.noAction++;
              results.processed++;
              continue;
            }

            // === CREAR TRANSACCIÓN DE CIERRE ===
            const closureUuid = uuidv4();
            const closureRef = db.collection(`businesses/${businessId}/transactions`).doc(closureUuid);

            const closureTransaction = {
              // === IDENTIFICACIÓN ===
              uuid: closureUuid,
              id: closureUuid,
              type: 'closure',
              description: 'Cierre automático programado',
              source: 'copilot',
              copilotMode: 'scheduled',
              openingReference: openingData.uuid || openingData.id,

              // === SALDOS INICIALES (de apertura) ===
              initialCashBalance: openingData.realCashBalance || 0,
              initialBankBalance: openingData.realBankBalance || 0,

              // === TOTALES GENERALES (sin ajustes) ===
              totalIngresos: totals?.income || 0,
              totalEgresos: totals?.expense || 0,
              ingresosCash: byAccount?.cash?.income || 0,
              ingresosBank: byAccount?.bank?.income || 0,
              egresosCash: byAccount?.cash?.expense || 0,
              egresosBank: byAccount?.bank?.expense || 0,

              // === TRANSFERENCIAS ===
              totalTransferencias: transfers?.total || 0,
              transferencias: {
                cash: {
                  in: transfers?.cash?.in || 0,
                  out: transfers?.cash?.out || 0,
                  net: transfers?.cash?.net || 0
                },
                bank: {
                  in: transfers?.bank?.in || 0,
                  out: transfers?.bank?.out || 0,
                  net: transfers?.bank?.net || 0
                }
              },

              // === AJUSTES ===
              ajustesApertura: {
                cash: adjustments?.opening?.cash || 0,
                bank: adjustments?.opening?.bank || 0,
                total: adjustments?.opening?.total || 0
              },
              ajustesCierre: {
                cash: 0,
                bank: 0,
                total: 0
              },

              // === BALANCES ESPERADOS ===
              expectedCashBalance: balances?.expected?.cash || 0,
              expectedBankBalance: balances?.expected?.bank || 0,

              // === BALANCES REALES (igual a esperados en cierre automático) ===
              realCashBalance: balances?.actual?.cash || 0,
              realBankBalance: balances?.actual?.bank || 0,

              // === DIFERENCIAS (0 en cierre automático) ===
              cashDifference: 0,
              bankDifference: 0,

              // === RESULTADOS OPERACIONALES ===
              resultadoOperacional: operational?.result || 0,
              resultadoOperacionalCash: operational?.resultCash || 0,
              resultadoOperacionalBank: operational?.resultBank || 0,
              flujoNetoCash: operational?.flowCash || 0,
              flujoNetoBank: operational?.flowBank || 0,

              // === CAMPOS COMPATIBLES (legacy) ===
              totalCash: balances?.actual?.cash || 0,
              totalBank: balances?.actual?.bank || 0,
              cashAmount: balances?.actual?.cash || 0,
              bankAmount: balances?.actual?.bank || 0,

              // === ESTRUCTURA ESTÁNDAR ===
              items: [],
              itemsAndStockLogs: [],
              amount: 0,

              // === METADATA ===
              metadata: {
                day: day,
                triggerType: 'scheduled_auto_close',
                autoGenerated: true,
                executionTime: new Date().toISOString(),
                hasTransactions: summaryData.hasTxn || false
              },
              createdAt: FieldValue.serverTimestamp()
            };

            // Crear cierre (onTransactionsWrite lo procesará automáticamente)
            await closureRef.set(closureTransaction);
            console.log(`✅ Closure created: ${closureUuid}`);

            // Registrar metadata adicional en dailySummary
            await upsertDailySummary(db, businessId, day, {
              isAutoClosed: true,
              autoCloseReason: 'scheduled',
              completedAt: FieldValue.serverTimestamp()
            });

            // === ANALYTICS: Trackear cierre automático ===
            try {
              const transactionsCount = (totals?.incomeCount || 0) + (totals?.expenseCount || 0);
              const netTotal = operational?.result || 0;
              const netResult = getNetResult(netTotal);

              await trackAutoDayClosed({
                businessId,
                dayId: day,
                transactionsCount,
                netResult
              });
              console.log(`✅ [ANALYTICS] Auto closure tracked`);
            } catch (analyticsError) {
              console.warn(`⚠️ [ANALYTICS] Error:`, analyticsError.message);
            }

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
            results.details.push({
              businessId,
              day,
              action: 'auto-closed',
              transactionId: closureUuid
            });

          } catch (businessError) {
            console.error(`❌ Error processing business ${businessId}:`, businessError);
            results.errors++;
            results.details.push({
              businessId,
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

          results.processed++;
        }

        // Preparar paginación
        lastDoc = summariesSnapshot.docs[summariesSnapshot.docs.length - 1];
        hasMore = pageSize === PAGE_SIZE;
      }

      results.total = totalFound;

      // === RESUMEN FINAL ===
      const duration = Date.now() - startTime;
      console.log(`\n${'='.repeat(60)}`);
      console.log('✅ SCHEDULED AUTO-CLOSE COMPLETED (OPTIMIZED)');
      console.log('🤖 ========================================');
      console.log(`⏱️  Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
      console.log(`📊 Summary:`);
      console.log(`   - Businesses needing closure: ${results.total}`);
      console.log(`   - Processed: ${results.processed}`);
      console.log(`   - Auto-closed: ${results.autoClosed} 🤖`);
      console.log(`   - No action: ${results.noAction} ✓`);
      console.log(`   - Errors: ${results.errors} ❌`);
      console.log(`🕐 Finished at: ${new Date().toISOString()}`);

      if (results.autoClosed > 0) {
        console.log(`\n🤖 Auto-closed businesses:`);
        results.details
          .filter(d => d.action === 'auto-closed')
          .forEach(d => {
            console.log(`   - ${d.businessId} (${d.day}): ${d.transactionId}`);
          });
      }

      if (results.errors > 0) {
        console.log(`\n❌ Errors:`);
        results.details
          .filter(d => d.action === 'error')
          .forEach(d => {
            console.log(`   - ${d.businessId}: ${d.error}`);
          });
      }

      await db.collection('scheduledExecutions').add({
        type: 'auto_close',
        version: 'v2_optimized',
        results: {
          total: results.total,
          processed: results.processed,
          autoClosed: results.autoClosed,
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
        version: 'v2_optimized',
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