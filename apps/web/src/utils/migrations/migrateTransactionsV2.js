import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
  query,
  where,
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import appFirebase from '@/firebaseInit';
import { ANONYMOUS_CLIENT_ID, DEFAULT_ANONYMOUS_CLIENT } from '@/types/client';
import { PaymentStatuses } from '@/types/transaction';

/**
 * Asegura que existe el cliente anónimo para el negocio
 * @param {string} businessId - ID del negocio
 * @returns {Promise<boolean>} - True si se creó o ya existía
 */
export async function ensureAnonymousClient(businessId) {
  try {
    const db = getFirestore(appFirebase);
    const anonymousClientRef = doc(db, 'businesses', businessId, 'clients', ANONYMOUS_CLIENT_ID);

    const snapshot = await getDoc(anonymousClientRef);

    if (!snapshot.exists()) {
      console.log(`🆕 Creando cliente anónimo para negocio ${businessId}...`);

      await setDoc(anonymousClientRef, {
        ...DEFAULT_ANONYMOUS_CLIENT,
        businessId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      console.log('✅ Cliente anónimo creado exitosamente');
      return true;
    }

    console.log('ℹ️ Cliente anónimo ya existe');
    return true;
  } catch (error) {
    console.error('❌ Error creando cliente anónimo:', error);
    throw error;
  }
}

/**
 * Migra las transacciones existentes al nuevo formato con payments y clientId
 * @param {string} businessId - ID del negocio
 * @param {Object} options - Opciones de migración
 * @param {boolean} options.dryRun - Si es true, solo simula la migración sin guardar
 * @param {number} options.batchSize - Tamaño del batch (máximo 500)
 * @returns {Promise<Object>} - Estadísticas de la migración
 */
export async function migrateTransactionsToV2(businessId, options = {}) {
  const { dryRun = false, batchSize = 500 } = options;

  console.log(`🔄 Iniciando migración de transacciones para negocio: ${businessId}`);
  console.log(`   Modo: ${dryRun ? 'SIMULACIÓN (Dry Run)' : 'PRODUCCIÓN'}`);

  const db = getFirestore(appFirebase);
  const transactionsRef = collection(db, 'businesses', businessId, 'transactions');

  try {
    // Asegurar que existe el cliente anónimo
    await ensureAnonymousClient(businessId);

    // Obtener todas las transacciones que NO tienen el campo 'payments'
    // (esto indica que son transacciones antiguas sin migrar)
    const snapshot = await getDocs(transactionsRef);

    const stats = {
      total: snapshot.size,
      toMigrate: 0,
      migrated: 0,
      skipped: 0,
      errors: 0,
      errorDetails: []
    };

    let batch = writeBatch(db);
    let operationsInBatch = 0;

    for (const docSnapshot of snapshot.docs) {
      const transaction = docSnapshot.data();
      const transactionId = docSnapshot.id;

      // Verificar si ya tiene el nuevo formato
      if (transaction.hasOwnProperty('payments') &&
        transaction.hasOwnProperty('paymentStatus') &&
        transaction.hasOwnProperty('clientId')) {
        stats.skipped++;
        continue;
      }

      stats.toMigrate++;

      try {
        // Preparar actualización
        const updates = buildMigrationUpdates(transaction);

        if (!dryRun) {
          const docRef = doc(db, 'businesses', businessId, 'transactions', transactionId);
          batch.update(docRef, updates);
          operationsInBatch++;

          // Ejecutar batch si alcanza el límite
          if (operationsInBatch >= batchSize) {
            await batch.commit();
            console.log(`   ✅ Batch de ${operationsInBatch} transacciones guardado`);
            batch = writeBatch(db);
            operationsInBatch = 0;
          }
        }

        stats.migrated++;

        // Log cada 100 transacciones
        if (stats.migrated % 100 === 0) {
          console.log(`   📊 Progreso: ${stats.migrated}/${stats.toMigrate} transacciones procesadas`);
        }
      } catch (error) {
        console.error(`❌ Error migrando transacción ${transactionId}:`, error);
        stats.errors++;
        stats.errorDetails.push({
          transactionId,
          error: error.message
        });
      }
    }

    // Ejecutar batch final
    if (!dryRun && operationsInBatch > 0) {
      await batch.commit();
      console.log(`   ✅ Batch final de ${operationsInBatch} transacciones guardado`);
    }

    // Resumen de migración
    console.log('\n📊 RESUMEN DE MIGRACIÓN');
    console.log('========================');
    console.log(`Total de transacciones: ${stats.total}`);
    console.log(`Para migrar: ${stats.toMigrate}`);
    console.log(`Migradas: ${stats.migrated}`);
    console.log(`Ya migradas (omitidas): ${stats.skipped}`);
    console.log(`Errores: ${stats.errors}`);

    if (dryRun) {
      console.log('\n⚠️ SIMULACIÓN COMPLETADA - No se guardaron cambios');
    } else {
      console.log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    }

    return stats;
  } catch (error) {
    console.error('❌ Error general en migración:', error);
    throw error;
  }
}

/**
 * Construye el objeto de actualización para una transacción
 * @param {Object} transaction - Transacción original
 * @returns {Object} - Objeto con campos a actualizar
 */
function buildMigrationUpdates(transaction) {
  const updates = {
    // Campos de pagos parciales
    payments: [],
    paymentStatus: PaymentStatuses.COMPLETED,
    totalPaid: 0,
    balance: 0,

    // Campos de cliente
    clientId: ANONYMOUS_CLIENT_ID,
    clientName: 'Cliente Anónimo'
  };

  // Solo procesar ingresos
  if (transaction.type === 'income') {
    const totalAmount = transaction.total || transaction.amount || 0;

    // Si tiene account y total, crear payment inicial
    if (transaction.account && totalAmount > 0) {
      updates.payments = [{
        uuid: crypto.randomUUID(),
        amount: totalAmount,
        date: transaction.date || transaction.createdAt || Timestamp.now(),
        method: transaction.account, // cash/bank
        notes: 'Migrado automáticamente desde transacción antigua',
        registeredBy: transaction.userId || 'migration-system'
      }];

      updates.totalPaid = totalAmount;
      updates.balance = 0;
      updates.paymentStatus = PaymentStatuses.COMPLETED;
    }
  }

  // Para egresos y transferencias, solo agregar los campos básicos
  // (no usan payments)
  if (transaction.type === 'expense' || transaction.type === 'transfer') {
    // Solo agregar campos mínimos para consistencia
    delete updates.payments;
    delete updates.totalPaid;
    delete updates.balance;
    delete updates.paymentStatus;
  }

  return updates;
}

/**
 * Verifica el estado de migración de un negocio
 * @param {string} businessId - ID del negocio
 * @returns {Promise<Object>} - Estado de migración
 */
export async function checkMigrationStatus(businessId) {
  const db = getFirestore(appFirebase);
  const transactionsRef = collection(db, 'businesses', businessId, 'transactions');

  try {
    const snapshot = await getDocs(transactionsRef);

    let migrated = 0;
    let pending = 0;

    snapshot.docs.forEach(doc => {
      const transaction = doc.data();

      if (transaction.type === 'income') {
        if (transaction.hasOwnProperty('payments') &&
          transaction.hasOwnProperty('paymentStatus')) {
          migrated++;
        } else {
          pending++;
        }
      }
    });

    const total = migrated + pending;
    const percentage = total > 0 ? Math.round((migrated / total) * 100) : 100;

    return {
      total,
      migrated,
      pending,
      percentage,
      isComplete: pending === 0
    };
  } catch (error) {
    console.error('Error verificando estado de migración:', error);
    throw error;
  }
}

/**
 * Hook de inicialización para ejecutar migración automáticamente
 * Usar en App.vue o layout principal
 * @param {string} businessId - ID del negocio actual
 */
export async function initializeMigration(businessId) {
  if (!businessId) {
    console.warn('⚠️ No se puede ejecutar migración sin businessId');
    return;
  }

  // Verificar si ya se ejecutó la migración (usar localStorage)
  const migrationKey = `migration_v2_${businessId}`;
  const migrationCompleted = localStorage.getItem(migrationKey);

  if (migrationCompleted === 'true') {
    console.log('ℹ️ Migración ya ejecutada para este negocio');
    return;
  }

  try {
    console.log('🔄 Verificando necesidad de migración...');

    const status = await checkMigrationStatus(businessId);

    if (status.isComplete) {
      console.log('✅ Todas las transacciones ya están migradas');
      localStorage.setItem(migrationKey, 'true');
      return;
    }

    console.log(`⚠️ ${status.pending} transacciones pendientes de migración`);
    console.log('🚀 Ejecutando migración automática...');

    await migrateTransactionsToV2(businessId, { dryRun: false });

    // Marcar como completada
    localStorage.setItem(migrationKey, 'true');

    console.log('✅ Migración automática completada');
  } catch (error) {
    console.error('❌ Error en migración automática:', error);
    // No bloquear la app, solo loguear el error
  }
}
