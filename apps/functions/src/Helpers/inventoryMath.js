/* eslint-disable */

/**
 * @file inventoryMath.js
 * @description Utilidades matemáticas para stock y variantes en Firebase Functions.
 * Mantiene paridad exacta con apps/web/src/utils/mathUtils.js y apps/web/src/composables/useInventory.js
 *
 * @module Helpers/inventoryMath
 */

const { round2 } = require('./mathUtils');

/**
 * Redondea una cantidad de stock a 2 decimales
 * @param {number} value
 * @returns {number}
 */
function roundStock(value) {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return 0;
  return round2(num);
}

/**
 * Suma valores de stock con redondeo a 2 decimales
 * @param  {...number} values
 * @returns {number}
 */
function addStock(...values) {
  const sum = values.reduce((acc, val) => acc + (Number(val) || 0), 0);
  return roundStock(sum);
}

/**
 * Resta dos valores de stock con redondeo a 2 decimales
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function subtractStock(a, b) {
  return roundStock((Number(a) || 0) - (Number(b) || 0));
}

/**
 * Calcula el stock total a partir de las combinaciones de variantes
 * @param {Array} variantCombos
 * @returns {number}
 */
function computeTotalStockFromVariants(variantCombos = []) {
  if (!Array.isArray(variantCombos)) return 0;
  return roundStock(
    variantCombos.reduce((total, variant) => total + Number(variant?.stock || 0), 0)
  );
}

/**
 * Construye el resumen de stock de variantes
 * @param {Array} variantCombos
 * @param {string} [isoDate]
 * @returns {{ totalVariants: number, totalStock: number, lastAggregatedAt: string }}
 */
function buildVariantStockSummary(variantCombos = [], isoDate = new Date().toISOString()) {
  const safeCombos = Array.isArray(variantCombos) ? variantCombos : [];
  return {
    totalVariants: safeCombos.length,
    totalStock: computeTotalStockFromVariants(safeCombos),
    lastAggregatedAt: isoDate
  };
}

module.exports = {
  roundStock,
  addStock,
  subtractStock,
  computeTotalStockFromVariants,
  buildVariantStockSummary
};
