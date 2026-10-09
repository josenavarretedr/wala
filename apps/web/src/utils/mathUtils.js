/**
 * Utilidades matemáticas para operaciones con moneda
 * Todas las funciones redondean a 2 decimales para evitar problemas de precisión de punto flotante
 */

/**
 * Redondea un número a 2 decimales
 * @param {number} value - Valor a redondear
 * @returns {number} - Valor redondeado a 2 decimales
 */
export const round2 = (value) => {
  // Validar que value sea un número válido
  if (value === undefined || value === null || isNaN(value)) {
    return 0;
  }
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

/**
 * Suma dos o más valores y redondea el resultado a 2 decimales
 * @param  {...number} values - Valores a sumar
 * @returns {number} - Suma redondeada a 2 decimales
 */
export const addMoney = (...values) => {
  const sum = values.reduce((acc, val) => acc + (val || 0), 0);
  return round2(sum);
};

/**
 * Resta dos valores y redondea el resultado a 2 decimales
 * @param {number} a - Minuendo
 * @param {number} b - Sustraendo
 * @returns {number} - Diferencia redondeada a 2 decimales
 */
export const subtractMoney = (a, b) => {
  return round2((a || 0) - (b || 0));
};

/**
 * Multiplica dos valores y redondea el resultado a 2 decimales
 * @param {number} a - Primer factor
 * @param {number} b - Segundo factor
 * @returns {number} - Producto redondeado a 2 decimales
 */
export const multiplyMoney = (a, b) => {
  return round2((a || 0) * (b || 0));
};

/**
 * Parsea un string o número a float y redondea a 2 decimales
 * @param {string|number} value - Valor a parsear
 * @returns {number} - Número parseado y redondeado a 2 decimales
 */
export const parseMoneyFloat = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : round2(parsed);
};

/**
 * Calcula el total de un array de transacciones
 * @param {Array} transactions - Array de transacciones con propiedad amount
 * @returns {number} - Total redondeado a 2 decimales
 */
export const sumTransactions = (transactions) => {
  const sum = transactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);
  return round2(sum);
};

/**
 * Redondea un número a N decimales, eliminando imprecisiones de punto flotante
 * ÚTIL PARA STOCK: Evita valores como 12.600000000000009
 * @param {number} value - Valor a redondear
 * @param {number} decimals - Número de decimales (default: 2)
 * @returns {number} - Valor redondeado
 */
export const roundToDecimals = (value, decimals = 2) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }

  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

/**
 * Redondea cantidades de stock a 2 decimales
 * Evita problemas como 12.600000000000009 en operaciones de inventario
 * @param {number} value - Cantidad de stock
 * @returns {number} - Stock redondeado a 2 decimales
 */
export const roundStock = (value) => roundToDecimals(value, 2);

/**
 * Suma cantidades de stock y redondea el resultado
 * @param  {...number} values - Cantidades a sumar
 * @returns {number} - Suma redondeada a 2 decimales
 */
export const addStock = (...values) => {
  const sum = values.reduce((acc, val) => acc + (val || 0), 0);
  return roundStock(sum);
};

/**
 * Resta cantidades de stock y redondea el resultado
 * @param {number} a - Cantidad inicial
 * @param {number} b - Cantidad a restar
 * @returns {number} - Diferencia redondeada a 2 decimales
 */
export const subtractStock = (a, b) => {
  return roundStock((a || 0) - (b || 0));
};
