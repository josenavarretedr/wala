/**
 * @typedef {Object} Supplier
 * @property {string} supplierId - ID único del proveedor
 * @property {string} name - Nombre completo o Razón Social del proveedor
 * @property {string|null} [phone] - Teléfono o número de contacto (opcional)
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * @property {import('firebase/firestore').Timestamp} updatedAt - Última actualización
 * 
 * // METADATA CALCULADA
 * @property {number} totalExpenses - Suma total de todos sus gastos/compras
 * @property {number} pendingBalance - Deuda total pendiente con este proveedor
 * @property {import('firebase/firestore').Timestamp|null} lastExpense - Fecha del último egreso
 * @property {number} transactionCount - Cantidad de transacciones realizadas
 * 
 * // REFERENCIAS
 * @property {string} businessId - Negocio al que pertenece el proveedor
 * @property {boolean} isActive - Proveedor activo o inactivo
 */
