import { computed } from 'vue';
import { useTransactionStore } from '@/stores/transaction/transactionStore';
import { useClientStore } from '@/stores/clientStore';
import { useBusinessStore } from '@/stores/businessStore';
import { calculatePaymentStatus, validateNewPayment } from '@/utils/paymentCalculator';
import { PaymentStatuses } from '@/types/transaction';
import { Timestamp, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { useAuthStore } from '@/stores/authStore';
import { recordBadDebtTx } from '@/utils/nonCashAccounting';
import { round2 } from '@/utils/mathUtils';

function toJsDate(val) {
  if (!val) return null;
  if (val.toDate) return val.toDate();
  if (val.seconds) return new Date(val.seconds * 1000);
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

function computeAgingInfo(t) {
  const now = Date.now();
  const due = toJsDate(t.promisedPaymentDate);
  const created = toJsDate(t.createdAt || t.date);
  const refDate = due || created;
  if (!refDate) {
    return { daysOverdue: 0, agingBucket: 'current' };
  }
  const diffDays = Math.floor((now - refDate.getTime()) / (1000 * 60 * 60 * 24));
  if (due) {
    if (diffDays <= 0) return { daysOverdue: 0, agingBucket: 'current' };
    if (diffDays > 30) return { daysOverdue: diffDays, agingBucket: 'overdue_over_30' };
    return { daysOverdue: diffDays, agingBucket: 'overdue_under_30' };
  }
  if (diffDays > 30) return { daysOverdue: diffDays, agingBucket: 'overdue_over_30' };
  if (diffDays > 7) return { daysOverdue: diffDays, agingBucket: 'overdue_under_30' };
  return { daysOverdue: Math.max(0, diffDays), agingBucket: 'current' };
}

/**
 * Composable para gestionar cuentas por cobrar
 */
export function useAccountsReceivable() {
  const transactionStore = useTransactionStore();
  const clientStore = useClientStore();
  const businessStore = useBusinessStore();
  const authStore = useAuthStore();

  /**
   * Obtiene todas las transacciones con saldo pendiente (excluye castigadas/written_off)
   */
  const pendingTransactions = computed(() => {
    const transactions = transactionStore.transactionsInStore?.value || [];
    if (!Array.isArray(transactions)) {
      return [];
    }

    return transactions
      .filter(
        t =>
          t.type === 'income' &&
          t.status !== 'refunded' &&
          t.paymentStatus !== PaymentStatuses.REFUNDED &&
          t.paymentStatus !== 'written_off'
      )
      .map(t => ({
        ...t,
        ...calculatePaymentStatus(t),
        ...computeAgingInfo(t),
      }))
      .filter(t => t.paymentStatus !== PaymentStatuses.COMPLETED && t.paymentStatus !== PaymentStatuses.REFUNDED)
      .sort((a, b) => {
        const dateA = a.date?.toMillis ? a.date.toMillis() : (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
        const dateB = b.date?.toMillis ? b.date.toMillis() : (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0);
        return dateB - dateA;
      });
  });

  const writtenOffTransactions = computed(() => {
    const transactions = transactionStore.transactionsInStore?.value || [];
    if (!Array.isArray(transactions)) return [];
    return transactions
      .filter(t => t.type === 'income' && t.paymentStatus === 'written_off')
      .sort((a, b) => {
        const da = a.writtenOffAt?.toMillis ? a.writtenOffAt.toMillis() : 0;
        const dbMs = b.writtenOffAt?.toMillis ? b.writtenOffAt.toMillis() : 0;
        return dbMs - da;
      });
  });

  /**
   * Total de cuentas por cobrar
   */
  const totalReceivable = computed(() => {
    return pendingTransactions.value.reduce((sum, t) => sum + (t.balance || 0), 0);
  });

  /**
   * Cantidad de transacciones pendientes
   */
  const pendingCount = computed(() => {
    return pendingTransactions.value.length;
  });

  /**
   * Cuentas por cobrar agrupadas por cliente
   */
  const receivablesByClient = computed(() => {
    const grouped = {};

    pendingTransactions.value.forEach(transaction => {
      const clientId = transaction.clientId || 'anonymous-client';

      if (!grouped[clientId]) {
        grouped[clientId] = {
          clientId,
          clientName: transaction.clientName || 'Cliente Anónimo',
          transactions: [],
          totalPending: 0
        };
      }

      grouped[clientId].transactions.push(transaction);
      grouped[clientId].totalPending += transaction.balance || 0;
    });

    // Convertir a array y ordenar por monto pendiente (mayor a menor)
    return Object.values(grouped).sort((a, b) => b.totalPending - a.totalPending);
  });

  /**
   * Obtiene cuentas por cobrar de un cliente específico
   */
  function getReceivablesByClientId(clientId) {
    return pendingTransactions.value.filter(t => t.clientId === clientId);
  }

  /**
   * Registra un nuevo pago para una transacción
   * Usa el nuevo sistema de transacciones tipo 'payment'
   */
  async function addPaymentToTransaction(transactionId, paymentData) {
    try {
      // Validar datos básicos
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      if (!paymentData.account) {
        throw new Error('Debe seleccionar un método de pago');
      }

      // Llamar al store para crear la transacción tipo payment
      const result = await transactionStore.createPaymentTransaction({
        relatedTransactionId: transactionId,
        amount: paymentData.amount,
        account: paymentData.account,
        notes: paymentData.notes || ''
      });

      console.log('✅ Pago registrado exitosamente');
      return result;
    } catch (error) {
      console.error('❌ Error registrando pago:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de cuentas por cobrar
   */
  const receivableStats = computed(() => {
    const stats = {
      totalAmount: totalReceivable.value,
      totalTransactions: pendingCount.value,
      byStatus: {
        pending: 0,
        partial: 0
      },
      oldestDate: null,
      averageAmount: 0
    };

    pendingTransactions.value.forEach(t => {
      if (t.paymentStatus === PaymentStatuses.PENDING) {
        stats.byStatus.pending++;
      } else if (t.paymentStatus === PaymentStatuses.PARTIAL) {
        stats.byStatus.partial++;
      }

      // Encontrar la transacción más antigua
      if (t.date) {
        const transactionDate = t.date.toMillis ? t.date.toMillis() : 0;
        if (!stats.oldestDate || transactionDate < stats.oldestDate) {
          stats.oldestDate = transactionDate;
        }
      }
    });

    // Calcular promedio
    if (stats.totalTransactions > 0) {
      stats.averageAmount = stats.totalAmount / stats.totalTransactions;
    }

    return stats;
  });

  /**
   * Filtra transacciones pendientes por rango de fechas
   */
  function filterByDateRange(startDate, endDate) {
    return pendingTransactions.value.filter(t => {
      if (!t.date) return false;

      const transactionDate = t.date.toDate ? t.date.toDate() : t.date;
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  async function updateReceivableMeta(transactionId, { promisedPaymentDate, receivableNote }) {
    const businessId = businessStore.business?.id || authStore.user?.businessId;
    if (!businessId || !transactionId) throw new Error('Faltan datos del negocio o transacción');

    const payload = {
      updatedAt: serverTimestamp(),
    };
    if (promisedPaymentDate !== undefined) {
      payload.promisedPaymentDate = promisedPaymentDate
        ? Timestamp.fromDate(new Date(`${promisedPaymentDate}T23:59:59`))
        : null;
    }
    if (receivableNote !== undefined) {
      payload.receivableNote = receivableNote ? String(receivableNote).trim() : null;
    }

    const txRef = doc(db, 'businesses', businessId, 'transactions', transactionId);
    await updateDoc(txRef, payload);

    const list = transactionStore.transactionsInStore?.value || [];
    const target = list.find(t => t.uuid === transactionId);
    if (target) {
      if (promisedPaymentDate !== undefined) {
        target.promisedPaymentDate = payload.promisedPaymentDate;
      }
      if (receivableNote !== undefined) {
        target.receivableNote = payload.receivableNote;
      }
    }
    return true;
  }

  async function writeOffReceivable(transaction, reason = '') {
    const businessId = businessStore.business?.id || authStore.user?.businessId;
    if (!businessId || !transaction?.uuid) throw new Error('Faltan datos del negocio o transacción');
    if (transaction.paymentStatus === 'written_off') {
      throw new Error('Esta cuenta ya fue castigada previamente.');
    }

    const amountToWriteOff = round2(Number(transaction.balance || 0));
    if (amountToWriteOff <= 0) {
      throw new Error('El saldo pendiente debe ser mayor a 0 para castigar.');
    }

    const badDebtTxId = await recordBadDebtTx({
      businessId,
      relatedTransactionId: transaction.uuid,
      clientId: transaction.clientId || null,
      clientName: transaction.clientName || 'Cliente Anónimo',
      amount: amountToWriteOff,
      reason: reason || 'Cuenta incobrable (>30 días)',
    });

    const txRef = doc(db, 'businesses', businessId, 'transactions', transaction.uuid);
    await updateDoc(txRef, {
      paymentStatus: 'written_off',
      writtenOffAt: serverTimestamp(),
      writtenOffReason: reason || 'Cuenta incobrable',
      writtenOffAmount: amountToWriteOff,
      badDebtTxId,
      updatedAt: serverTimestamp(),
    });

    if (transaction.clientId && transaction.clientId !== 'anonymous-client') {
      try {
        const clientRef = doc(db, 'businesses', businessId, 'clients', transaction.clientId);
        await updateDoc(clientRef, {
          pendingBalance: increment(-amountToWriteOff),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('⚠️ No se pudo actualizar pendingBalance del cliente al castigar:', err);
      }
    }

    const list = transactionStore.transactionsInStore?.value || [];
    const target = list.find(t => t.uuid === transaction.uuid);
    if (target) {
      target.paymentStatus = 'written_off';
      target.writtenOffReason = reason || 'Cuenta incobrable';
      target.writtenOffAmount = amountToWriteOff;
      target.badDebtTxId = badDebtTxId;
    }

    return { badDebtTxId, amountToWriteOff };
  }

  return {
    // Computed properties
    pendingTransactions,
    writtenOffTransactions,
    totalReceivable,
    pendingCount,
    receivablesByClient,
    receivableStats,

    // Methods
    getReceivablesByClientId,
    addPaymentToTransaction,
    updateReceivableMeta,
    writeOffReceivable,
    filterByDateRange
  };
}
