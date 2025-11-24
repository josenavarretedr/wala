/**
 * Constante para el cliente anónimo
 */
export const ANONYMOUS_CLIENT_ID = 'anonymous-client';

/**
 * @typedef {Object} Client
 * @property {string} uuid - ID único del cliente
 * @property {string} name - Nombre completo del cliente
 * @property {string|null} [phone] - Teléfono opcional
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * @property {import('firebase/firestore').Timestamp} updatedAt - Última actualización
 * 
 * // METADATA CALCULADA
 * @property {number} totalPurchases - Suma total de todas sus compras
 * @property {number} pendingBalance - Deuda total pendiente
 * @property {import('firebase/firestore').Timestamp|null} lastPurchase - Fecha de última compra
 * @property {number} transactionCount - Cantidad de transacciones realizadas
 * 
 * // REFERENCIAS
 * @property {string} businessId - Negocio al que pertenece el cliente
 * @property {boolean} isActive - Cliente activo o inactivo
 */

/**
 * Estructura del cliente anónimo por defecto
 */
export const DEFAULT_ANONYMOUS_CLIENT = {
  uuid: ANONYMOUS_CLIENT_ID,
  name: 'Cliente Anónimo',
  phone: null,
  isActive: true,
  totalPurchases: 0,
  pendingBalance: 0,
  transactionCount: 0,
  lastPurchase: null
};

/**
 * Verifica si un clientId corresponde al cliente anónimo
 * @param {string|null} clientId
 * @returns {boolean}
 */
export function isAnonymousClient(clientId) {
  return clientId === ANONYMOUS_CLIENT_ID || clientId === null;
}

/**
 * Obtiene el ID del cliente o retorna el anónimo si es null
 * @param {string|null} clientId
 * @returns {string}
 */
export function getClientIdOrAnonymous(clientId) {
  return clientId || ANONYMOUS_CLIENT_ID;
}
