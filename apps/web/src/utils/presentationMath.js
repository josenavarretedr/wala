/**
 * Utilidades matemáticas y lógicas puras para el sistema de presentaciones,
 * conversión de unidades, costo promedio ponderado y evaluación de márgenes.
 */

import { round2, roundStock } from './mathUtils.js';
import { FRACTIONAL_UNITS } from '../constants/presentations.js';

/**
 * Determina si una unidad base admite fracciones / decimales
 * @param {string} unit 
 * @returns {boolean}
 */
export const isFractionalUnit = (unit) => {
  if (!unit) return false;
  return FRACTIONAL_UNITS.includes(String(unit).toLowerCase().trim());
};

/**
 * Obtiene las presentaciones activas de un producto o genera la base virtual si no tiene
 * @param {Object} product 
 * @returns {Array<Object>}
 */
export const getPresentations = (product = {}) => {
  if (!product) return [];

  const rawPresentations = Array.isArray(product.presentations)
    ? product.presentations.filter((p) => p && p.isActive !== false)
    : [];

  if (rawPresentations.length > 0) {
    return rawPresentations;
  }

  // Presentación base virtual retrocompatible
  const unitLabel = product.unit || 'uni';
  return [
    {
      id: 'pres_base',
      name: unitLabel.toUpperCase(),
      factor: 1,
      price: Number(product.price || 0),
      isBase: true,
      isActive: true,
      usage: ['buy', 'sell'],
      minMarginPct: null,
      allowSellByAmount: isFractionalUnit(unitLabel),
    },
  ];
};

/**
 * Obtiene la presentación base (factor 1) de un producto
 * @param {Object} product 
 * @returns {Object|null}
 */
export const getBasePresentation = (product = {}) => {
  const presentations = getPresentations(product);
  return presentations.find((p) => p.isBase || p.factor === 1) || presentations[0] || null;
};

/**
 * Valida si la cantidad es admisible según la presentación y la unidad
 * @param {Object} params
 * @param {number} params.qty
 * @param {Object} params.presentation
 * @param {string} params.unit
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateQuantity = ({ qty, presentation, unit }) => {
  const num = Number(qty);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'La cantidad debe ser mayor a 0' };
  }

  const factor = Number(presentation?.factor || 1);
  const isFractional = isFractionalUnit(unit);

  // Presentaciones con factor > 1 siempre deben ser enteros
  if (factor > 1 && !Number.isInteger(num)) {
    return {
      valid: false,
      error: `La presentación "${presentation?.name || 'múltiple'}" solo se puede gestionar en cantidades enteras`,
    };
  }

  // Presentación base en unidades no fraccionables debe ser entera
  if (factor === 1 && !isFractional && !Number.isInteger(num)) {
    return {
      valid: false,
      error: `La unidad "${unit || 'uni'}" no admite cantidades decimales`,
    };
  }

  return { valid: true };
};

/**
 * Convierte cantidad en presentación a unidades base
 * @param {number} presentationQty 
 * @param {number} factor 
 * @returns {number}
 */
export const toBaseQuantity = (presentationQty, factor = 1) => {
  const qty = Number(presentationQty) || 0;
  const f = Math.max(1, Number(factor) || 1);
  return roundStock(qty * f);
};

/**
 * Convierte unidades base a cantidad en presentación
 * @param {number} baseQty 
 * @param {number} factor 
 * @returns {number}
 */
export const fromBaseQuantity = (baseQty, factor = 1) => {
  const b = Number(baseQty) || 0;
  const f = Math.max(1, Number(factor) || 1);
  return roundStock(b / f);
};

/**
 * Convierte costo por presentación a costo por unidad base
 * @param {number} presentationCost 
 * @param {number} factor 
 * @returns {number}
 */
export const toBaseUnitCost = (presentationCost, factor = 1) => {
  const c = Number(presentationCost) || 0;
  const f = Math.max(1, Number(factor) || 1);
  return round2(c / f);
};

/**
 * Calcula la cantidad y el precio unitario ajustado a partir de un monto objetivo (venta a granel por dinero)
 * @param {Object} params
 * @param {number} params.amount - Monto en dinero deseado (ej: 5.00)
 * @param {number} params.unitPrice - Precio de lista por unidad base (ej: 4.50)
 * @returns {{ quantity: number, adjustedPrice: number, targetAmount: number }}
 */
export const quantityFromAmount = ({ amount, unitPrice }) => {
  const target = round2(Number(amount) || 0);
  const price = Number(unitPrice) || 0;

  if (target <= 0 || price <= 0) {
    return { quantity: 0, adjustedPrice: 0, targetAmount: target };
  }

  const rawQty = target / price;
  const quantity = roundStock(rawQty);

  // Ajuste fino del precio unitario para que quantity * adjustedPrice coincida exactamente con target
  const adjustedPrice = quantity > 0 ? round2(target / quantity) : 0;

  return {
    quantity,
    adjustedPrice,
    targetAmount: target,
  };
};

/**
 * Calcula el Costo Promedio Ponderado (CPP)
 * @param {Object} params
 * @param {number} params.currentStock - Stock actual en unidades base
 * @param {number} params.currentCost - Costo actual por unidad base
 * @param {number} params.inQty - Cantidad entrante en unidades base
 * @param {number} params.inUnitCost - Costo unitario entrante por unidad base
 * @returns {number} Nuevo costo unitario promedio ponderado
 */
export const computeWeightedAverageCost = ({ currentStock, currentCost, inQty, inUnitCost }) => {
  const incomingQty = Number(inQty) || 0;
  const incomingUnitCost = round2(Number(inUnitCost) || 0);
  const stock = Number(currentStock) || 0;
  const existingCost = round2(Number(currentCost) || 0);

  // Si no entra cantidad válida, se mantiene el costo existente
  if (incomingQty <= 0) {
    return existingCost;
  }

  // Si no había stock o stock <= 0 o no había costo previo, se adopta el entrante
  if (stock <= 0 || existingCost <= 0) {
    return incomingUnitCost;
  }

  const existingTotalValue = stock * existingCost;
  const incomingTotalValue = incomingQty * incomingUnitCost;
  const totalStock = stock + incomingQty;

  if (totalStock <= 0) {
    return incomingUnitCost;
  }

  return round2((existingTotalValue + incomingTotalValue) / totalStock);
};

/**
 * Resuelve el margen mínimo aplicable (prioridad presentación > política del negocio)
 * @param {Object} presentation 
 * @param {Object} policy 
 * @returns {number}
 */
export const resolveMinMargin = (presentation, policy = {}) => {
  if (
    presentation &&
    presentation.minMarginPct !== null &&
    presentation.minMarginPct !== undefined &&
    !isNaN(Number(presentation.minMarginPct))
  ) {
    return Number(presentation.minMarginPct);
  }

  if (
    policy &&
    policy.minMarginPct !== null &&
    policy.minMarginPct !== undefined &&
    !isNaN(Number(policy.minMarginPct))
  ) {
    return Number(policy.minMarginPct);
  }

  return 20; // Default 20%
};

/**
 * Calcula el precio piso (floor price) a partir del costo base, factor y margen mínimo
 * @param {Object} params
 * @param {number} params.baseCost - Costo por unidad base
 * @param {number} params.factor - Factor de la presentación
 * @param {number} params.minMarginPct - Margen bruto mínimo porcentual (0 - 99)
 * @returns {number}
 */
export const computeFloorPrice = ({ baseCost, factor = 1, minMarginPct = 20 }) => {
  const f = Math.max(1, Number(factor) || 1);
  const presentationCost = (Number(baseCost) || 0) * f;
  const margin = Math.min(Math.max(Number(minMarginPct) || 0, 0), 99);

  return round2(presentationCost / (1 - margin / 100));
};

/**
 * Aplica un descuento sobre un precio de lista
 * @param {Object} params
 * @param {number} params.listPrice - Precio de lista por presentación
 * @param {'percent'|'amount'|null} params.type - Tipo de descuento
 * @param {number} params.value - Valor del descuento (% o monto fijo)
 * @returns {{ netPrice: number, amountPerUnit: number, discountPct: number }}
 */
export const applyDiscount = ({ listPrice, type, value }) => {
  const price = round2(Number(listPrice) || 0);
  const val = Math.max(0, Number(value) || 0);

  if (!type || val <= 0) {
    return { netPrice: price, amountPerUnit: 0, discountPct: 0 };
  }

  if (type === 'percent') {
    const pct = Math.min(100, val);
    const amountPerUnit = round2(price * (pct / 100));
    const netPrice = round2(price - amountPerUnit);
    return { netPrice, amountPerUnit, discountPct: pct };
  }

  if (type === 'amount') {
    const amountPerUnit = round2(Math.min(price, val));
    const netPrice = round2(price - amountPerUnit);
    const discountPct = price > 0 ? round2((amountPerUnit / price) * 100) : 0;
    return { netPrice, amountPerUnit, discountPct };
  }

  return { netPrice: price, amountPerUnit: 0, discountPct: 0 };
};

/**
 * Evalúa el margen de venta de una presentación frente al costo y precio mínimo
 * @param {Object} params
 * @param {number} params.netPrice - Precio neto cobrado por presentación
 * @param {number} params.baseCost - Costo CPP por unidad base
 * @param {number} params.factor - Factor de la presentación
 * @param {number} params.minMarginPct - Margen mínimo aplicable
 * @param {boolean} [params.allowBelowCost=false] - Si se permite vender bajo costo
 * @returns {{ status: 'ok'|'below_floor'|'below_cost', marginPct: number, floorPrice: number, presentationCost: number, isBlocked: boolean }}
 */
export const evaluateMargin = ({
  netPrice,
  baseCost,
  factor = 1,
  minMarginPct = 20,
  allowBelowCost = false,
}) => {
  const f = Math.max(1, Number(factor) || 1);
  const presentationCost = round2((Number(baseCost) || 0) * f);
  const price = round2(Number(netPrice) || 0);
  const floorPrice = computeFloorPrice({ baseCost, factor: f, minMarginPct });

  const marginPct = price > 0 ? round2(((price - presentationCost) / price) * 100) : 0;

  if (price < presentationCost) {
    return {
      status: 'below_cost',
      marginPct,
      floorPrice,
      presentationCost,
      isBlocked: !allowBelowCost,
    };
  }

  if (price < floorPrice) {
    return {
      status: 'below_floor',
      marginPct,
      floorPrice,
      presentationCost,
      isBlocked: false,
    };
  }

  return {
    status: 'ok',
    marginPct,
    floorPrice,
    presentationCost,
    isBlocked: false,
  };
};

/**
 * Desglosa una cantidad base en presentaciones legibles
 * Ejemplo: 112 kg en base con presentación Saco (50) -> "2 Saco + 12 kg"
 * @param {number} baseStock 
 * @param {Array<Object>} presentations 
 * @param {string} baseUnit 
 * @returns {string}
 */
export const describeStockInPresentations = (baseStock, presentations = [], baseUnit = 'uni') => {
  const stock = Number(baseStock) || 0;
  if (stock <= 0) return `0 ${baseUnit}`;

  const nonBasePresentations = presentations
    .filter((p) => p && !p.isBase && Number(p.factor) > 1 && p.isActive !== false)
    .sort((a, b) => Number(b.factor) - Number(a.factor));

  if (nonBasePresentations.length === 0) {
    return `${stock} ${baseUnit}`;
  }

  let remaining = stock;
  const parts = [];

  for (const pres of nonBasePresentations) {
    const factor = Number(pres.factor);
    if (remaining >= factor) {
      const count = Math.floor(remaining / factor);
      parts.push(`${count} ${pres.name}`);
      remaining = roundStock(remaining % factor);
    }
  }

  if (remaining > 0 || parts.length === 0) {
    parts.push(`${remaining} ${baseUnit}`);
  }

  return parts.join(' + ');
};
