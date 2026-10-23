/* eslint-disable */

/**
 * @file processTransactionBackground.js
 * @description Cloud Function que procesa operaciones secundarias de transacciones en background
 * 
 * Se dispara cuando se crea una nueva transacción y ejecuta:
 * - Actualización de metadata del cliente
 * - Conversión de cotizaciones
 * - Tracking de analytics
 * 
 * Este procesamiento en background reduce significativamente el tiempo de respuesta
 * en el frontend (de ~500ms a <100ms percibido).
 * 
 * @module Transaction/processTransactionBackground
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const { FieldValue, Timestamp } = require('firebase-admin/firestore');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const ANONYMOUS_CLIENT_ID = 'anonymous';

/**
 * Actualiza la metadata agregada de un cliente basándose en todas sus transacciones activas
 * (excluyendo ventas que fueron devueltas mediante Nota de Devolución: status === 'refunded').
 * @param {string} businessId - ID del negocio
 * @param {string} clientId - ID del cliente
 */
async function updateClientMetadata(businessId, clientId) {
  if (!clientId || clientId === ANONYMOUS_CLIENT_ID) {
    console.log('⏭️ Cliente anónimo, saltando actualización de metadata');
    return;
  }

  try {
    console.log(`🔍 Actualizando metadata del cliente: ${clientId}`);

    // Obtener todas las transacciones de tipo income del cliente
    const transactionsRef = db.collection(`businesses/${businessId}/transactions`);
    const snapshot = await transactionsRef
      .where('clientId', '==', clientId)
      .where('type', '==', 'income')
      .get();

    console.log(`📊 Encontradas ${snapshot.size} transacciones para el cliente`);

    let totalPurchases = 0;
    let pendingBalance = 0;
    let lastPurchase = null;
    let transactionCount = 0;

    snapshot.docs.forEach(doc => {
      const transaction = doc.data();

      // Ignorar ventas que fueron devueltas / anuladas mediante Nota de Devolución
      if (transaction.status === 'refunded' || transaction.paymentStatus === 'refunded') {
        return;
      }

      transactionCount += 1;

      // Sumar total de compras
      totalPurchases += transaction.amount || 0;

      // Sumar balance pendiente
      if (transaction.balance) {
        pendingBalance += transaction.balance;
      }

      // Encontrar la última compra
      if (transaction.createdAt) {
        const transactionTime = transaction.createdAt.toMillis ? transaction.createdAt.toMillis() : 0;
        const lastPurchaseTime = lastPurchase ? (lastPurchase.toMillis ? lastPurchase.toMillis() : 0) : 0;

        if (transactionTime > lastPurchaseTime) {
          lastPurchase = transaction.createdAt;
        }
      }
    });

    // Actualizar cliente
    const clientRef = db.doc(`businesses/${businessId}/clients/${clientId}`);
    await clientRef.update({
      totalPurchases,
      pendingBalance,
      transactionCount,
      lastPurchase,
      updatedAt: Timestamp.now()
    });

    console.log(`✅ Metadata actualizada para cliente ${clientId}:`, {
      totalPurchases: totalPurchases.toFixed(2),
      pendingBalance: pendingBalance.toFixed(2),
      transactionCount,
      lastPurchase: lastPurchase ? new Date(lastPurchase.toMillis()).toISOString() : null
    });

  } catch (error) {
    console.error(`❌ Error actualizando metadata del cliente ${clientId}:`, error);
    throw error;
  }
}

/**
 * Marca una cotización como convertida a transacción
 * @param {string} businessId - ID del negocio
 * @param {string} quoteId - ID de la cotización
 * @param {string} transactionId - ID de la transacción creada
 */
async function markQuoteAsConverted(businessId, quoteId, transactionId) {
  try {
    console.log(`🔄 Marcando cotización ${quoteId} como convertida`);

    const quoteRef = db.doc(`businesses/${businessId}/quotes/${quoteId}`);

    await quoteRef.update({
      status: 'converted',
      convertedToTransactionId: transactionId,
      convertedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log(`✅ Cotización ${quoteId} marcada como convertida`);

  } catch (error) {
    console.error(`❌ Error marcando cotización ${quoteId} como convertida:`, error);
    throw error;
  }
}

/**
 * Registra evento de analytics para tracking de transacciones
 * @param {string} businessId - ID del negocio
 * @param {Object} transactionData - Datos de la transacción
 */
async function trackTransactionAnalytics(businessId, transactionData) {
  try {
    // Por ahora solo log, pero se puede extender para enviar a analytics externos
    console.log(`📊 Analytics tracking for transaction ${transactionData.uuid}:`, {
      businessId,
      type: transactionData.type,
      amount: transactionData.amount,
      account: transactionData.account
    });

    // Aquí se podría integrar con Google Analytics, Mixpanel, etc.
    // Ejemplo: await analytics.track('transaction_created', { ... });

  } catch (error) {
    console.error(`❌ Error en analytics tracking:`, error);
    // No lanzar error, analytics no debe bloquear el procesamiento
  }
}

/**
 * Cloud Function trigger que procesa transacciones en background
 * Se ejecuta cuando se CREA una nueva transacción
 * Gen2 - Optimizado para región Sudamérica
 */
exports.processTransactionBackground = onDocumentCreated({
  document: 'businesses/{businessId}/transactions/{transactionId}',
  region: 'southamerica-east1',
  memory: '256MiB',
  timeoutSeconds: 60,
  maxInstances: 10
}, async (event) => {
  const { businessId, transactionId } = event.params;
  const snap = event.data;
  const transaction = snap.data();

  console.log(`🔔 Nueva transacción creada: ${transactionId} (tipo: ${transaction.type})`);

  // Array para tracking de operaciones
  const operations = [];
  const errors = [];

  try {
    // 1️⃣ ACTUALIZAR METADATA DEL CLIENTE (si aplica)
    if (
      transaction.clientId &&
      transaction.clientId !== ANONYMOUS_CLIENT_ID &&
      (transaction.type === 'income' || transaction.type === 'refund')
    ) {
      operations.push(
        updateClientMetadata(businessId, transaction.clientId)
          .then(() => ({ operation: 'updateClientMetadata', status: 'success' }))
          .catch(err => {
            errors.push({ operation: 'updateClientMetadata', error: err.message });
            return { operation: 'updateClientMetadata', status: 'failed', error: err.message };
          })
      );
    }

    // 2️⃣ MARCAR COTIZACIÓN COMO CONVERTIDA (si aplica)
    if (transaction.quoteId) {
      operations.push(
        markQuoteAsConverted(businessId, transaction.quoteId, transactionId)
          .then(() => ({ operation: 'markQuoteAsConverted', status: 'success' }))
          .catch(err => {
            errors.push({ operation: 'markQuoteAsConverted', error: err.message });
            return { operation: 'markQuoteAsConverted', status: 'failed', error: err.message };
          })
      );
    }

    // 3️⃣ TRACKING DE ANALYTICS
    operations.push(
      trackTransactionAnalytics(businessId, transaction)
        .then(() => ({ operation: 'trackAnalytics', status: 'success' }))
        .catch(err => {
          errors.push({ operation: 'trackAnalytics', error: err.message });
          return { operation: 'trackAnalytics', status: 'failed', error: err.message };
        })
    );

    // Ejecutar todas las operaciones en paralelo
    const results = await Promise.allSettled(operations);

    // Preparar resumen de resultados
    const summary = {
      totalOperations: operations.length,
      successful: results.filter(r => r.status === 'fulfilled' && r.value?.status === 'success').length,
      failed: results.filter(r => r.status === 'rejected' || r.value?.status === 'failed').length,
      errors: errors
    };

    console.log(`📊 Procesamiento completado:`, summary);

    // Actualizar estado de procesamiento en la transacción
    const processingStatus = errors.length === 0 ? 'completed' : 'partial_success';

    await snap.ref.update({
      processingStatus,
      processingCompletedAt: Timestamp.now(),
      ...(errors.length > 0 && { processingErrors: errors })
    });

    console.log(`✅ Transacción ${transactionId} procesada exitosamente (status: ${processingStatus})`);

    return { success: true, summary };

  } catch (error) {
    console.error(`❌ Error crítico procesando transacción ${transactionId}:`, error);

    // Marcar transacción con error
    await snap.ref.update({
      processingStatus: 'failed',
      processingCompletedAt: Timestamp.now(),
      processingErrors: [{
        operation: 'critical_error',
        error: error.message,
        stack: error.stack
      }]
    }).catch(updateErr => {
      console.error(`❌ Error actualizando estado de procesamiento:`, updateErr);
    });

    // No lanzar error para evitar retries innecesarios
    return { success: false, error: error.message };
  }
});

exports.updateClientMetadata = updateClientMetadata;
