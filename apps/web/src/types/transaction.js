/**
 * @typedef {'cash'|'bank'|'yape'|'plin'} PaymentMethod
 */

/**
 * @typedef {'pending'|'partial'|'completed'} PaymentStatus
 */

/**
 * @typedef {Object} Payment
 * @property {string} uuid - ID único del pago generado con crypto.randomUUID()
 * @property {number} amount - Monto del pago
 * @property {import('firebase/firestore').Timestamp} date - Fecha del pago
 * @property {PaymentMethod} method - Método de pago utilizado
 * @property {string} [notes] - Notas opcionales sobre el pago
 * @property {string} registeredBy - UUID del usuario que registró el pago
 */

/**
 * @typedef {Object} Transaction
 * 

 * @property {string} uuid - ID único de la transacción
 * @property {'income'|'expense'|'transfer'|'payment'} type - Tipo de transacción
 * @property {number} total - Monto total de la transacción
 * @property {import('firebase/firestore').Timestamp} date - Fecha de la transacción
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * 
 * // CAMPOS PARA PAGOS PARCIALES (solo para type === 'income')
 * @property {Payment[]} [payments] - Array de pagos realizados (vacío = pago completo)
 * @property {PaymentStatus} [paymentStatus] - Estado calculado automáticamente
 * @property {number} [totalPaid] - Suma de todos los payments (calculado)
 * @property {number} [balance] - Monto pendiente (total - totalPaid)
 * 
 * // RELACIÓN CON CLIENTE
 * @property {string|null} clientId - UUID del cliente o null para anónimo
 * @property {string} clientName - Nombre denormalizado para reportes rápidos
 * 
 * // CAMPOS EXISTENTES
 * @property {string} category - Categoría de la transacción
 * @property {string} description - Descripción
 * @property {Object[]} [items] - Items de la transacción (para ingresos)
 * @property {Object[]} [materialItems] - Materiales (para egresos tipo materials)
 * @property {string} businessId - ID del negocio
 * @property {string} userId - ID del usuario que creó la transacción
 * @property {string} [account] - Cuenta (cash/bank) - usado solo en egresos
 */

/**
 * @typedef {Object} PaymentTransaction
 * Transacción que representa un pago posterior a una venta inicial
 * 
 * @property {string} uuid - ID único de la transacción de pago
 * @property {'payment'} type - Siempre 'payment'
 * @property {number} amount - Monto de ESTE pago específico
 * @property {PaymentMethod} account - Método de pago: 'cash'|'bank'|'yape'|'plin'
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha en que se registró este pago
 * 
 * // REFERENCIA A TRANSACCIÓN ORIGINAL
 * @property {string} relatedTransactionId - UUID de la venta original (type: 'income')
 * @property {number} relatedTransactionTotal - Total de la venta original
 * 
 * // CLIENTE
 * @property {string} clientId - UUID del cliente
 * @property {string} clientName - Nombre denormalizado
 * 
 * // CÁLCULOS
 * @property {number} previousBalance - Saldo antes de este pago
 * @property {number} newBalance - Saldo después de este pago
 * 
 * // METADATA
 * @property {string} [notes] - Notas opcionales del pago
 * @property {string} registeredBy - UUID del usuario que registró
 * @property {string} businessId - UUID del negocio
 * @property {string} userId - UUID del usuario (duplicado de registeredBy para consistencia)
 */

/**
 * Tipos para exportar
 */
export const PaymentMethods = {
  CASH: 'cash',
  BANK: 'bank',
  YAPE: 'yape',
  PLIN: 'plin'
};

export const PaymentStatuses = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  COMPLETED: 'completed'
};

export const TransactionTypes = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
  PAYMENT: 'payment'
};
