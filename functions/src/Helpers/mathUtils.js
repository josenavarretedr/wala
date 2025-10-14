/* eslint-disable */

/**
 * @file mathUtils.js
 * @description Utilidades matemáticas para operaciones con moneda en Firebase Functions
 * Todas las funciones redondean a 2 decimales para evitar problemas de precisión de punto flotante
 * 
 * Equivalente a src/utils/mathUtils.js pero para el backend (Node.js/Firebase Functions)
 * 
 * @module Helpers/mathUtils
 */

/**
 * Redondea un número a 2 decimales
 * @param {number} value - Valor a redondear
 * @returns {number} - Valor redondeado a 2 decimales
 */
function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Suma dos o más valores y redondea el resultado a 2 decimales
 * @param  {...number} values - Valores a sumar
 * @returns {number} - Suma redondeada a 2 decimales
 */
function addMoney(...values) {
  const sum = values.reduce((acc, val) => acc + (val || 0), 0);
  return round2(sum);
}

/**
 * Resta dos valores y redondea el resultado a 2 decimales
 * @param {number} a - Minuendo
 * @param {number} b - Sustraendo
 * @returns {number} - Diferencia redondeada a 2 decimales
 */
function subtractMoney(a, b) {
  return round2((a || 0) - (b || 0));
}

/**
 * Multiplica dos valores y redondea el resultado a 2 decimales
 * @param {number} a - Primer factor
 * @param {number} b - Segundo factor
 * @returns {number} - Producto redondeado a 2 decimales
 */
function multiplyMoney(a, b) {
  return round2((a || 0) * (b || 0));
}

/**
 * Parsea un string o número a float y redondea a 2 decimales
 * @param {string|number} value - Valor a parsear
 * @returns {number} - Número parseado y redondeado a 2 decimales
 */
function parseMoneyFloat(value) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : round2(parsed);
}

/**
 * Parsea Number() con redondeo a 2 decimales
 * @param {any} value - Valor a parsear
 * @returns {number} - Número parseado y redondeado a 2 decimales
 */
function parseMoneyNumber(value) {
  const parsed = Number(value || 0);
  return isNaN(parsed) ? 0 : round2(parsed);
}

module.exports = {
  round2,
  addMoney,
  subtractMoney,
  multiplyMoney,
  parseMoneyFloat,
  parseMoneyNumber
};
