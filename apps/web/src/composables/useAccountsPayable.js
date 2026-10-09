import { computed } from 'vue';
import { useTransactionStore } from '@/stores/transaction/transactionStore';
import { useSupplierStore } from '@/stores/supplierStore';
import { calculatePaymentStatus } from '@/utils/paymentCalculator';
import { PaymentStatuses } from '@/types/transaction';

/**
 * Composable para gestionar cuentas por pagar
 */
export function useAccountsPayable() {
  const transactionStore = useTransactionStore();
  const supplierStore = useSupplierStore();

  /**
   * Obtiene todas las transacciones de egreso con saldo pendiente
   */
  const pendingTransactions = computed(() => {
    const transactions = transactionStore.transactionsInStore?.value || [];
    if (!Array.isArray(transactions)) {
      return [];
    }

    return transactions
      .filter(t => t.type === 'expense')
      .map(t => ({
        ...t,
        ...calculatePaymentStatus(t)
      }))
      .filter(t => t.paymentStatus !== PaymentStatuses.COMPLETED)
      .sort((a, b) => {
        const dateA = a.date?.toMillis ? a.date.toMillis() : (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
        const dateB = b.date?.toMillis ? b.date.toMillis() : (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0);
        return dateB - dateA;
      });
  });

  /**
   * Total de cuentas por pagar
   */
  const totalPayable = computed(() => {
    return pendingTransactions.value.reduce((sum, t) => sum + (t.balance || 0), 0);
  });

  /**
   * Cantidad de transacciones pendientes
   */
  const pendingCount = computed(() => {
    return pendingTransactions.value.length;
  });

  /**
   * Cuentas por pagar agrupadas por proveedor
   */
  const payablesBySupplier = computed(() => {
    const grouped = {};

    pendingTransactions.value.forEach(transaction => {
      const supplierId = transaction.supplierId || 'anonymous-supplier';

      if (!grouped[supplierId]) {
        grouped[supplierId] = {
          supplierId,
          supplierName: transaction.supplierName || 'Proveedor Anónimo',
          transactions: [],
          totalPending: 0
        };
      }

      grouped[supplierId].transactions.push(transaction);
      grouped[supplierId].totalPending += transaction.balance || 0;
    });

    return Object.values(grouped).sort((a, b) => b.totalPending - a.totalPending);
  });

  /**
   * Obtiene cuentas por pagar de un proveedor específico
   */
  function getPayablesBySupplierId(supplierId) {
    return pendingTransactions.value.filter(t => t.supplierId === supplierId);
  }

  /**
   * Registra un nuevo pago para una transacción de egreso
   */
  async function addPaymentToExpenseTransaction(transactionId, paymentData) {
    try {
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      if (!paymentData.account) {
        throw new Error('Debe seleccionar un método de pago');
      }

      // Llamar al store para crear la transacción tipo payment para el egreso
      const result = await transactionStore.createPaymentTransaction({
        relatedTransactionId: transactionId,
        amount: paymentData.amount,
        account: paymentData.account,
        notes: paymentData.notes || ''
      });

      console.log('✅ Pago de cuenta por pagar registrado exitosamente');
      return result;
    } catch (error) {
      console.error('❌ Error registrando pago de cuenta por pagar:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de cuentas por pagar
   */
  const payableStats = computed(() => {
    const stats = {
      totalAmount: totalPayable.value,
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

      const tDate = t.date || t.createdAt;
      if (tDate) {
        const transactionDate = tDate.toMillis ? tDate.toMillis() : 0;
        if (!stats.oldestDate || transactionDate < stats.oldestDate) {
          stats.oldestDate = transactionDate;
        }
      }
    });

    if (stats.totalTransactions > 0) {
      stats.averageAmount = stats.totalAmount / stats.totalTransactions;
    }

    return stats;
  });

  return {
    pendingTransactions,
    totalPayable,
    pendingCount,
    payablesBySupplier,
    payableStats,
    getPayablesBySupplierId,
    addPaymentToExpenseTransaction
  };
}
