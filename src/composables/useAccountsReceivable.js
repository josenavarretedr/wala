import { computed } from 'vue';
import { useTransactionStore } from '@/stores/transaction/transactionStore';
import { useClientStore } from '@/stores/clientStore';
import { calculatePaymentStatus, validateNewPayment } from '@/utils/paymentCalculator';
import { PaymentStatuses } from '@/types/transaction';
import { Timestamp } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';

/**
 * Composable para gestionar cuentas por cobrar
 */
export function useAccountsReceivable() {
  const transactionStore = useTransactionStore();
  const clientStore = useClientStore();
  const authStore = useAuthStore();

  /**
   * Obtiene todas las transacciones con saldo pendiente
   */
  const pendingTransactions = computed(() => {
    // Validar que transactionsInStore existe y es un array
    const transactions = transactionStore.transactionsInStore?.value || [];
    if (!Array.isArray(transactions)) {
      return [];
    }

    return transactions
      .filter(t => t.type === 'income')
      .map(t => ({
        ...t,
        ...calculatePaymentStatus(t)
      }))
      .filter(t => t.paymentStatus !== PaymentStatuses.COMPLETED)
      .sort((a, b) => {
        // Ordenar por fecha descendente (más recientes primero)
        const dateA = a.date?.toMillis ? a.date.toMillis() : 0;
        const dateB = b.date?.toMillis ? b.date.toMillis() : 0;
        return dateB - dateA;
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

  return {
    // Computed properties
    pendingTransactions,
    totalReceivable,
    pendingCount,
    receivablesByClient,
    receivableStats,

    // Methods
    getReceivablesByClientId,
    addPaymentToTransaction,
    filterByDateRange
  };
}
