import { PaymentStatuses } from '@/types/transaction';

/**
 * Calcula el estado de pago automáticamente basado en los pagos realizados
 * @param {Object} transaction - La transacción a evaluar
 * @param {number} transaction.total - Monto total de la transacción (o amount si no existe total)
 * @param {number} transaction.amount - Monto total alternativo
 * @param {Array} transaction.payments - Array de pagos realizados
 * @returns {{ paymentStatus: string, totalPaid: number, balance: number }}
 */
export function calculatePaymentStatus(transaction) {
  // Usar total si existe, sino usar amount
  const total = transaction.total || transaction.amount || 0;
  const { payments = [] } = transaction;

  // Si no hay payments array o está vacío, el pago está completo
  if (!payments || payments.length === 0) {
    return {
      paymentStatus: PaymentStatuses.COMPLETED,
      totalPaid: total,
      balance: 0
    };
  }

  // Sumar todos los pagos realizados
  const totalPaid = payments.reduce((sum, payment) => {
    return sum + (payment.amount || 0);
  }, 0);

  // Calcular balance pendiente
  const balance = total - totalPaid;

  // Determinar estado basado en el balance
  let paymentStatus;
  if (balance <= 0) {
    paymentStatus = PaymentStatuses.COMPLETED;
  } else if (totalPaid > 0) {
    paymentStatus = PaymentStatuses.PARTIAL;
  } else {
    paymentStatus = PaymentStatuses.PENDING;
  }

  return {
    paymentStatus,
    totalPaid: Math.min(totalPaid, total), // No puede exceder el total
    balance: Math.max(balance, 0) // No puede ser negativo
  };
}

/**
 * Agrupa pagos por método para reportes y cálculos de caja
 * @param {Array} payments - Array de pagos
 * @returns {{ cash: number, bank: number, yape: number, plin: number }}
 */
export function groupPaymentsByMethod(payments = []) {
  return payments.reduce((acc, payment) => {
    const method = payment.method || 'cash';
    if (!acc[method]) {
      acc[method] = 0;
    }
    acc[method] += payment.amount || 0;
    return acc;
  }, {
    cash: 0,
    bank: 0,
    yape: 0,
    plin: 0
  });
}

/**
 * Valida que un nuevo pago no exceda el balance pendiente
 * @param {Object} transaction - La transacción
 * @param {number} newPaymentAmount - Monto del nuevo pago
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateNewPayment(transaction, newPaymentAmount) {
  if (!newPaymentAmount || newPaymentAmount <= 0) {
    return {
      valid: false,
      message: 'El monto del pago debe ser mayor a 0'
    };
  }

  const { balance } = calculatePaymentStatus(transaction);

  if (newPaymentAmount > balance) {
    return {
      valid: false,
      message: `El pago (S/ ${newPaymentAmount}) excede el saldo pendiente (S/ ${balance})`
    };
  }

  return { valid: true };
}

/**
 * Filtra pagos realizados en una fecha específica
 * @param {Array} payments - Array de pagos
 * @param {Date} date - Fecha a filtrar
 * @returns {Array}
 */
export function filterPaymentsByDate(payments = [], date) {
  return payments.filter(payment => {
    if (!payment.date) return false;

    const paymentDate = payment.date.toDate ? payment.date.toDate() : payment.date;
    return isSameDay(paymentDate, date);
  });
}

/**
 * Verifica si dos fechas son el mismo día
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Calcula el total pagado en una fecha específica
 * @param {Array} payments - Array de pagos
 * @param {Date} date - Fecha a calcular
 * @returns {number}
 */
export function calculateTotalPaidOnDate(payments = [], date) {
  const paymentsOnDate = filterPaymentsByDate(payments, date);
  return paymentsOnDate.reduce((sum, payment) => sum + (payment.amount || 0), 0);
}

/**
 * Formatea el estado de pago para mostrar en UI
 * @param {string} paymentStatus
 * @returns {{ label: string, color: string, icon: string }}
 */
export function formatPaymentStatus(paymentStatus) {
  const statusMap = {
    [PaymentStatuses.COMPLETED]: {
      label: 'Pagado',
      color: 'green',
      icon: '✓'
    },
    [PaymentStatuses.PARTIAL]: {
      label: 'Pago Parcial',
      color: 'orange',
      icon: '⚠'
    },
    [PaymentStatuses.PENDING]: {
      label: 'Pendiente',
      color: 'red',
      icon: '⏳'
    }
  };

  return statusMap[paymentStatus] || statusMap[PaymentStatuses.PENDING];
}

/**
 * Calcula el porcentaje pagado de una transacción
 * @param {Object} transaction
 * @returns {number} Porcentaje entre 0 y 100
 */
export function calculatePaymentPercentage(transaction) {
  const { total, totalPaid } = calculatePaymentStatus(transaction);
  if (total === 0) return 100;
  return Math.min(Math.round((totalPaid / total) * 100), 100);
}

/**
 * Calcula el efectivo realmente recibido en un día específico
 * Incluye: payments de ingresos creados ese día + transacciones tipo 'payment'
 * @param {Array} transactions - Todas las transacciones
 * @param {Date} date - Fecha objetivo
 * @returns {{ totalReceived: number, byMethod: {cash: number, bank: number, yape: number, plin: number}, details: {fromIncomesToday: number, fromPaymentsToday: number} }}
 */
export function calculateDailyReceivedAmount(transactions, date) {
  // Filtrar ingresos creados ese día
  const incomesToday = transactions.filter(t => {
    if (t.type !== 'income') return false;
    const createdDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
    return isSameDay(createdDate, date);
  });

  // Sumar totalPaid de cada ingreso (lo que realmente se recibió al crear la venta)
  const fromIncomesToday = incomesToday.reduce((sum, t) => {
    return sum + (t.totalPaid || t.total || t.amount || 0);
  }, 0);

  // Filtrar payments registrados ese día (pagos posteriores)
  const paymentsToday = transactions.filter(t => {
    if (t.type !== 'payment') return false;
    const createdDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
    return isSameDay(createdDate, date);
  });

  // Sumar amount de cada payment
  const fromPaymentsToday = paymentsToday.reduce((sum, t) => {
    return sum + (t.amount || 0);
  }, 0);

  // Agrupar por método de pago
  const byMethod = groupTransactionsByMethod([...incomesToday, ...paymentsToday]);

  return {
    totalReceived: fromIncomesToday + fromPaymentsToday,
    byMethod,
    details: {
      fromIncomesToday,
      fromPaymentsToday
    }
  };
}

/**
 * Agrupa montos por método de pago considerando ambos tipos de transacciones
 * Para ingresos: usa payments array si existe, sino usa el account
 * Para payments: usa account directamente
 * @param {Array} transactions - Transacciones a agrupar
 * @returns {{ cash: number, bank: number, yape: number, plin: number }}
 */
function groupTransactionsByMethod(transactions) {
  const result = { cash: 0, bank: 0, yape: 0, plin: 0 };

  transactions.forEach(t => {
    if (t.type === 'income') {
      // Si tiene payments array, sumar cada uno por su método
      if (t.payments && t.payments.length > 0) {
        t.payments.forEach(p => {
          const method = p.method || 'cash';
          result[method] = (result[method] || 0) + (p.amount || 0);
        });
      } else {
        // Si no tiene payments, es pago completo - usar account o totalPaid
        const method = t.account || 'cash';
        const amount = t.totalPaid || t.total || t.amount || 0;
        result[method] = (result[method] || 0) + amount;
      }
    } else if (t.type === 'payment') {
      // Para payments, usar account directamente
      const method = t.account || 'cash';
      result[method] = (result[method] || 0) + (t.amount || 0);
    }
  });

  return result;
}
