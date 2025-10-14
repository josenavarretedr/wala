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
