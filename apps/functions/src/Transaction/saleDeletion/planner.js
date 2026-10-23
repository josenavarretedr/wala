/* eslint-disable */

/**
 * @file planner.js
 * @description Funciones puras de planificación para eliminación directa (DIRECT_DELETE)
 * y emisión de Nota de Devolución (REFUND_NOTE) de ventas.
 *
 * No depende de Firestore para permitir pruebas unitarias rápidas y determinísticas.
 *
 * @module Transaction/saleDeletion/planner
 */

const { round2, addMoney, subtractMoney, parseMoneyNumber } = require('../../Helpers/mathUtils');
const {
  roundStock,
  addStock,
  computeTotalStockFromVariants,
  buildVariantStockSummary
} = require('../../Helpers/inventoryMath');

const DELETION_MODES = {
  DIRECT_DELETE: 'DIRECT_DELETE',
  REFUND_NOTE: 'REFUND_NOTE'
};

const BLOCK_REASONS = {
  ALREADY_REFUNDED: 'ALREADY_REFUNDED',
  TODAY_NOT_OPENED: 'TODAY_NOT_OPENED',
  TODAY_ALREADY_CLOSED: 'TODAY_ALREADY_CLOSED',
  PAYMENTS_IN_CLOSED_DAYS: 'PAYMENTS_IN_CLOSED_DAYS'
};

/**
 * Normaliza una cuenta ('cash' | 'bank' | 'yape' | 'plin' | 'detraction') al bucket de tesorería ('cash' | 'bank' | 'detraction')
 * @param {string} account
 * @returns {'cash' | 'bank' | 'detraction'}
 */
function normalizeTreasuryAccount(account) {
  const normalized = String(account || 'cash').toLowerCase().trim();
  if (normalized === 'detraction') {
    return 'detraction';
  }
  if (normalized === 'bank' || normalized === 'yape' || normalized === 'plin' || normalized === 'digital') {
    return 'bank';
  }
  return 'cash';
}

/**
 * Determina el modo de operación (DIRECT_DELETE vs REFUND_NOTE) y si puede ejecutarse
 * según el estado contable del día de la venta (saleDay) y del día actual (today).
 *
 * Reglas:
 * 1. Si la venta ya tiene status === 'refunded' o paymentStatus === 'refunded', bloquea con ALREADY_REFUNDED.
 * 2. Si saleDay === today y hoy NO tiene cierre (!saleDayClosed && !todayHasClosure):
 *    -> Modo DIRECT_DELETE, canExecute = true.
 * 3. Si el día de la venta ya está cerrado (saleDay < today || saleDayClosed || todayHasClosure):
 *    -> Modo REFUND_NOTE.
 *    Para emitir una Nota de Devolución hoy:
 *    - Hoy NO debe tener cierre (!todayHasClosure); si ya cerró hoy -> TODAY_ALREADY_CLOSED.
 *    - Hoy DEBE tener apertura activa (todayHasOpening); si no abrió hoy -> TODAY_NOT_OPENED.
 *
 * @param {Object} params
 * @param {string} params.saleDay - YYYY-MM-DD del día de la venta
 * @param {string} params.today - YYYY-MM-DD del día actual en la zona horaria del negocio
 * @param {boolean} params.saleDayClosed - Si el día de la venta tiene cierre
 * @param {boolean} params.todayHasOpening - Si el día actual tiene apertura registrada
 * @param {boolean} params.todayHasClosure - Si el día actual ya tiene cierre registrado
 * @param {string} [params.saleStatus] - Estado actual de la venta
 * @param {string} [params.paymentStatus] - Estado de pago actual de la venta
 * @returns {{ mode: 'DIRECT_DELETE'|'REFUND_NOTE', canExecute: boolean, blockReason: string|null }}
 */
function determineDeletionMode({
  saleDay,
  today,
  saleDayClosed = false,
  todayHasOpening = false,
  todayHasClosure = false,
  saleStatus = null,
  paymentStatus = null
}) {
  if (saleStatus === 'refunded' || paymentStatus === 'refunded') {
    return {
      mode: DELETION_MODES.REFUND_NOTE,
      canExecute: false,
      blockReason: BLOCK_REASONS.ALREADY_REFUNDED
    };
  }

  const isSameDay = Boolean(saleDay && today && saleDay === today);
  const isSaleDayOpen = isSameDay && !saleDayClosed && !todayHasClosure;

  if (isSaleDayOpen) {
    return {
      mode: DELETION_MODES.DIRECT_DELETE,
      canExecute: true,
      blockReason: null
    };
  }

  // El día de la venta ya está cerrado (o es un día anterior) -> Nota de Devolución hoy
  if (todayHasClosure) {
    return {
      mode: DELETION_MODES.REFUND_NOTE,
      canExecute: false,
      blockReason: BLOCK_REASONS.TODAY_ALREADY_CLOSED
    };
  }

  if (!todayHasOpening) {
    return {
      mode: DELETION_MODES.REFUND_NOTE,
      canExecute: false,
      blockReason: BLOCK_REASONS.TODAY_NOT_OPENED
    };
  }

  return {
    mode: DELETION_MODES.REFUND_NOTE,
    canExecute: true,
    blockReason: null
  };
}

/**
 * Extrae todas las referencias de stock que fueron afectadas por una venta:
 * - Productos vendidos (itemsAndStockLogs o fallback a items)
 * - Insumos de composición/receta (materialStockLogs)
 * - Envases de delivery/takeaway (packagingStockLogs)
 *
 * @param {Object} sale - Documento de la transacción de venta
 * @returns {Array<{
 *   productId: string,
 *   stockLogUuid: string|null,
 *   source: 'item'|'material'|'packaging',
 *   fallbackQuantity: number|null,
 *   variantId: string|null,
 *   variantLabel: string|null,
 *   description: string,
 *   cost: number|null,
 *   price: number|null
 * }>}
 */
function collectStockRefs(sale = {}) {
  const refs = [];
  const items = Array.isArray(sale.items) ? sale.items : [];
  const itemsAndLogs = Array.isArray(sale.itemsAndStockLogs) ? sale.itemsAndStockLogs : [];

  // Mapa auxiliar de items por productId/uuid para enriquecer metadata
  const findMatchingItem = (itemUuid, variantId = null) => {
    return (
      items.find(
        it =>
          (it.uuid === itemUuid || it.productId === itemUuid || it.selectedProductUuid === itemUuid) &&
          (!variantId || it.variantId === variantId)
      ) ||
      items.find(
        it => it.uuid === itemUuid || it.productId === itemUuid || it.selectedProductUuid === itemUuid
      ) ||
      null
    );
  };

  if (itemsAndLogs.length > 0) {
    for (const itemLog of itemsAndLogs) {
      const productId = itemLog.itemUuid || itemLog.productId;
      if (productId) {
        const matchedItem = findMatchingItem(productId, itemLog.variantId);
        const fallbackQty = matchedItem
          ? matchedItem.quantityForStock ?? matchedItem.actualQuantity ?? matchedItem.quantity ?? null
          : itemLog.quantity ?? null;

        refs.push({
          productId,
          stockLogUuid: itemLog.stockLogUuid || null,
          source: 'item',
          fallbackQuantity: fallbackQty !== null ? roundStock(fallbackQty) : null,
          variantId: itemLog.variantId || matchedItem?.variantId || null,
          variantLabel: matchedItem?.variantLabel || null,
          description: matchedItem?.description || matchedItem?.name || itemLog.description || '',
          cost: matchedItem?.cost !== undefined ? Number(matchedItem.cost) : null,
          price: matchedItem?.price !== undefined ? Number(matchedItem.price) : null
        });
      }

      // Materiales en composición
      if (Array.isArray(itemLog.materialStockLogs)) {
        for (const matLog of itemLog.materialStockLogs) {
          const materialId = matLog.materialId || matLog.productId;
          if (!materialId) continue;
          const fallbackMatQty =
            matLog.totalQuantity ?? matLog.quantityUsed ?? matLog.quantity ?? null;

          refs.push({
            productId: materialId,
            stockLogUuid: matLog.stockLogUuid || null,
            source: 'material',
            fallbackQuantity: fallbackMatQty !== null ? roundStock(fallbackMatQty) : null,
            variantId: null,
            variantLabel: null,
            description: matLog.description || '',
            cost: matLog.cost !== undefined ? Number(matLog.cost) : null,
            price: null
          });
        }
      }
    }
  } else if (items.length > 0) {
    // Fallback para ventas antiguas sin itemsAndStockLogs
    for (const item of items) {
      const productId = item.uuid || item.productId || item.selectedProductUuid;
      if (!productId || item.trackStock === false) continue;
      const fallbackQty = item.quantityForStock ?? item.actualQuantity ?? item.quantity ?? 0;

      refs.push({
        productId,
        stockLogUuid: item.stockLogUuid || item.stockLogId || null,
        source: 'item',
        fallbackQuantity: roundStock(fallbackQty),
        variantId: item.variantId || null,
        variantLabel: item.variantLabel || null,
        description: item.description || item.name || '',
        cost: item.cost !== undefined ? Number(item.cost) : null,
        price: item.price !== undefined ? Number(item.price) : null
      });
    }
  }

  // Envases de delivery / takeaway
  const packagingLogs = Array.isArray(sale.packagingStockLogs) ? sale.packagingStockLogs : [];
  for (const pkgLog of packagingLogs) {
    const pkgProductId = pkgLog.materialId || pkgLog.productId || pkgLog.uuid;
    if (!pkgProductId) continue;
    const fallbackPkgQty = pkgLog.quantityUsed ?? pkgLog.quantity ?? null;

    refs.push({
      productId: pkgProductId,
      stockLogUuid: pkgLog.stockLogUuid || null,
      source: 'packaging',
      fallbackQuantity: fallbackPkgQty !== null ? roundStock(fallbackPkgQty) : null,
      variantId: null,
      variantLabel: null,
      description: pkgLog.description || '',
      cost: pkgLog.cost !== undefined ? Number(pkgLog.cost) : null,
      price: null
    });
  }

  return refs;
}

/**
 * Resuelve la cantidad exacta a restituir para una referencia de stock y su stockLog leído.
 * Prioriza:
 * 1. stockLog.quantityDeducted (exacto, guardado en ventas nuevas)
 * 2. ref.fallbackQuantity (quantityForStock del item cuando hubo stock insuficiente)
 * 3. stockLog.quantity (cantidad solicitada registrada en el stockLog)
 *
 * @param {Object|null} stockLog - Datos del documento stockLog (subcolección o array legacy)
 * @param {Object} ref - Referencia devuelta por collectStockRefs
 * @returns {{
 *   quantity: number,
 *   legacyQuantity: boolean,
 *   variantId: string|null,
 *   variantLabel: string|null,
 *   cost: number|null,
 *   price: number|null
 * }}
 */
function resolveRestoreQuantity(stockLog, ref = {}) {
  const variantId = (stockLog && stockLog.variantId) || ref.variantId || null;
  const variantLabel = (stockLog && stockLog.variantLabel) || ref.variantLabel || null;
  const cost =
    stockLog && stockLog.cost !== undefined && stockLog.cost !== null
      ? Number(stockLog.cost)
      : ref.cost ?? null;
  const price =
    stockLog && stockLog.price !== undefined && stockLog.price !== null
      ? Number(stockLog.price)
      : ref.price ?? null;

  if (stockLog && stockLog.quantityDeducted !== undefined && stockLog.quantityDeducted !== null) {
    return {
      quantity: roundStock(stockLog.quantityDeducted),
      legacyQuantity: false,
      variantId,
      variantLabel,
      cost,
      price
    };
  }

  if (ref.fallbackQuantity !== undefined && ref.fallbackQuantity !== null) {
    return {
      quantity: roundStock(ref.fallbackQuantity),
      legacyQuantity: true,
      variantId,
      variantLabel,
      cost,
      price
    };
  }

  if (stockLog && stockLog.quantity !== undefined && stockLog.quantity !== null) {
    return {
      quantity: roundStock(stockLog.quantity),
      legacyQuantity: true,
      variantId,
      variantLabel,
      cost,
      price
    };
  }

  return {
    quantity: 0,
    legacyQuantity: true,
    variantId,
    variantLabel,
    cost,
    price
  };
}

/**
 * Agrupa las restituciones resueltas por productId y por variantId para que
 * cada documento de producto se actualice una única vez dentro de runTransaction.
 *
 * @param {Array<{
 *   productId: string,
 *   stockLogUuid: string|null,
 *   quantity: number,
 *   legacyQuantity: boolean,
 *   variantId: string|null,
 *   variantLabel: string|null,
 *   source: 'item'|'material'|'packaging',
 *   description: string,
 *   cost: number|null,
 *   price: number|null,
 *   foundInSubcollection: boolean,
 *   foundInLegacyArray: boolean
 * }>} resolvedRestores
 * @returns {Map<string, {
 *   productId: string,
 *   baseQuantityDelta: number,
 *   variantDeltas: Record<string, number>,
 *   subcollectionLogIds: string[],
 *   legacyArrayLogIds: string[],
 *   entries: Array
 * }>}
 */
function aggregateProductDeltas(resolvedRestores = []) {
  const map = new Map();

  for (const restore of resolvedRestores) {
    if (!restore || !restore.productId) continue;

    if (!map.has(restore.productId)) {
      map.set(restore.productId, {
        productId: restore.productId,
        baseQuantityDelta: 0,
        variantDeltas: {},
        subcollectionLogIds: [],
        legacyArrayLogIds: [],
        entries: []
      });
    }

    const group = map.get(restore.productId);
    const qty = roundStock(restore.quantity || 0);

    if (restore.variantId) {
      group.variantDeltas[restore.variantId] = addStock(
        group.variantDeltas[restore.variantId] || 0,
        qty
      );
    } else {
      group.baseQuantityDelta = addStock(group.baseQuantityDelta, qty);
    }

    if (restore.stockLogUuid && restore.foundInSubcollection) {
      if (!group.subcollectionLogIds.includes(restore.stockLogUuid)) {
        group.subcollectionLogIds.push(restore.stockLogUuid);
      }
    }

    if (restore.stockLogUuid && restore.foundInLegacyArray) {
      if (!group.legacyArrayLogIds.includes(restore.stockLogUuid)) {
        group.legacyArrayLogIds.push(restore.stockLogUuid);
      }
    }

    group.entries.push(restore);
  }

  return map;
}

/**
 * Construye el objeto de actualización para el documento del producto en Firestore.
 *
 * @param {Object} productData - Datos actuales del documento del producto
 * @param {Object} productDelta - Entrada del Map generado por aggregateProductDeltas
 * @param {Object} options
 * @param {'DIRECT_DELETE'|'REFUND_NOTE'} options.mode
 * @param {string} [options.isoNow]
 * @returns {{
 *   updateFields: Object,
 *   previousStock: number,
 *   newStock: number
 * }}
 */
function applyDeltasToProduct(productData = {}, productDelta, options = {}) {
  const { mode = DELETION_MODES.DIRECT_DELETE, isoNow = new Date().toISOString() } = options;
  const previousStock = roundStock(Number(productData.stock || 0));
  const updateFields = {};

  const variantIds = Object.keys(productDelta.variantDeltas || {});
  const hasVariantCombos =
    variantIds.length > 0 && Array.isArray(productData.variantCombos) && productData.variantCombos.length > 0;

  let newStock = previousStock;

  if (hasVariantCombos) {
    const updatedVariants = productData.variantCombos.map(variant => {
      const delta = productDelta.variantDeltas[variant.id];
      if (!delta) return variant;
      return {
        ...variant,
        stock: addStock(Number(variant.stock || 0), delta),
        updatedAt: isoNow
      };
    });

    const totalFromVariants = computeTotalStockFromVariants(updatedVariants);
    newStock = addStock(totalFromVariants, productDelta.baseQuantityDelta || 0);

    updateFields.variantCombos = updatedVariants;
    updateFields.stock = newStock;
    updateFields.stockSummary = buildVariantStockSummary(updatedVariants, isoNow);
  } else {
    // Sumar tanto baseQuantityDelta como posibles variantDeltas huérfanos si el producto ya no tiene variantCombos
    const orphanVariantSum = variantIds.reduce(
      (acc, vId) => addStock(acc, productDelta.variantDeltas[vId] || 0),
      0
    );
    const totalDelta = addStock(productDelta.baseQuantityDelta || 0, orphanVariantSum);
    newStock = addStock(previousStock, totalDelta);
    updateFields.stock = newStock;
  }

  // En DIRECT_DELETE, limpiar también el array legacy stockLog si contenía el registro
  if (
    mode === DELETION_MODES.DIRECT_DELETE &&
    productDelta.legacyArrayLogIds.length > 0 &&
    Array.isArray(productData.stockLog)
  ) {
    updateFields.stockLog = productData.stockLog.filter(
      log => !productDelta.legacyArrayLogIds.includes(log.uuid)
    );
  }

  return {
    updateFields,
    previousStock,
    newStock
  };
}

/**
 * Calcula el resumen monetario exacto de una venta y sus abonos relacionados:
 * - cuánto dinero entró realmente a Caja (cashOut al revertir)
 * - cuánto dinero entró realmente a Banco (bankOut al revertir)
 * - cuánto saldo pendiente a crédito queda anulado (cancelledDebt)
 *
 * Deduplica pagos entre `sale.payments[]` y documentos `type === 'payment'` por `uuid`.
 *
 * @param {Object} sale - Documento de la venta (type === 'income')
 * @param {Array<Object>} [paymentDocs=[]] - Documentos de transacciones type === 'payment' relacionados
 * @returns {{
 *   saleAmount: number,
 *   totalPaid: number,
 *   cashOut: number,
 *   bankOut: number,
 *   cancelledDebt: number,
 *   paymentsBreakdown: Array<{ uuid: string, amount: number, account: 'cash'|'bank', rawAccount: string, isInitial: boolean }>
 * }}
 */
function summarizeMoney(sale = {}, paymentDocs = []) {
  const saleAmount = parseMoneyNumber(sale.amount ?? sale.total ?? 0);
  const embeddedPayments = Array.isArray(sale.payments) ? sale.payments : [];
  const externalPayments = Array.isArray(paymentDocs) ? paymentDocs : [];

  const paymentsMap = new Map();

  // 1. Registrar pagos embebidos en el array sale.payments
  embeddedPayments.forEach((p, idx) => {
    if (!p) return;
    const key = p.uuid || `embedded_${idx}`;
    const rawAccount = p.account || p.method || sale.account || 'cash';
    paymentsMap.set(key, {
      uuid: key,
      amount: parseMoneyNumber(p.amount || 0),
      account: normalizeTreasuryAccount(rawAccount),
      rawAccount,
      isInitial: idx === 0 || Boolean(p.isInitial),
      createdAt: p.date || p.createdAt || sale.createdAt || null
    });
  });

  // 2. Registrar documentos type === 'payment' enlazados (deduplicados por uuid)
  externalPayments.forEach((pDoc, idx) => {
    if (!pDoc) return;
    const key = pDoc.uuid || pDoc.id || `doc_${idx}`;
    const rawAccount = pDoc.account || pDoc.method || sale.account || 'cash';
    if (!paymentsMap.has(key)) {
      paymentsMap.set(key, {
        uuid: key,
        amount: parseMoneyNumber(pDoc.amount || 0),
        account: normalizeTreasuryAccount(rawAccount),
        rawAccount,
        isInitial: false,
        createdAt: pDoc.createdAt || pDoc.date || null
      });
    }
  });

  let cashOut = 0;
  let bankOut = 0;
  let detractionOut = 0;
  const paymentsBreakdown = [];

  const isSubjectToDetraction = Boolean(
    sale.isSubjectToDetraction && parseMoneyNumber(sale.detractionAmount || 0) > 0
  );
  const configuredDetractionAmount = isSubjectToDetraction
    ? parseMoneyNumber(sale.detractionAmount || 0)
    : 0;
  let remainingDetractionToAllocate = configuredDetractionAmount;

  if (paymentsMap.size > 0) {
    for (const entry of paymentsMap.values()) {
      if (entry.amount > 0) {
        if (entry.account === 'detraction') {
          detractionOut = addMoney(detractionOut, entry.amount);
        } else if (remainingDetractionToAllocate > 0 && entry.isInitial) {
          // Cuando una venta tiene detracción SPOT, el pago inicial contiene el monto bruto,
          // del cual detractionAmount ingresó a la cuenta de detracciones y el resto (netAmount) a caja/banco
          const detractionSlice = round2(Math.min(entry.amount, remainingDetractionToAllocate));
          const netSlice = Math.max(0, subtractMoney(entry.amount, detractionSlice));
          detractionOut = addMoney(detractionOut, detractionSlice);
          remainingDetractionToAllocate = Math.max(
            0,
            subtractMoney(remainingDetractionToAllocate, detractionSlice)
          );

          if (entry.account === 'bank') {
            bankOut = addMoney(bankOut, netSlice);
          } else {
            cashOut = addMoney(cashOut, netSlice);
          }
        } else if (entry.account === 'bank') {
          bankOut = addMoney(bankOut, entry.amount);
        } else {
          cashOut = addMoney(cashOut, entry.amount);
        }
      }
      paymentsBreakdown.push(entry);
    }
  } else if (sale.paymentStatus !== 'pending') {
    // Venta pagada al contado directamente sin array payments[]
    const bucket = normalizeTreasuryAccount(sale.account || 'cash');
    if (bucket === 'detraction' && !isSubjectToDetraction) {
      detractionOut = saleAmount;
    } else if (isSubjectToDetraction) {
      const detractionSlice = round2(Math.min(saleAmount, configuredDetractionAmount));
      const effectiveAmount = parseMoneyNumber(
        sale.netAmount ?? Math.max(0, subtractMoney(saleAmount, detractionSlice))
      );
      detractionOut = detractionSlice;
      if (bucket === 'bank') {
        bankOut = effectiveAmount;
      } else {
        cashOut = effectiveAmount;
      }
    } else if (bucket === 'bank') {
      bankOut = saleAmount;
    } else {
      cashOut = saleAmount;
    }
  }

  const totalPaid = addMoney(cashOut, bankOut, detractionOut);
  const cancelledDebt = Math.max(0, subtractMoney(saleAmount, totalPaid));

  return {
    saleAmount: round2(saleAmount),
    totalPaid,
    cashOut,
    bankOut,
    detractionOut,
    cancelledDebt,
    cancelledBalance: cancelledDebt,
    paymentsBreakdown
  };
}

module.exports = {
  DELETION_MODES,
  BLOCK_REASONS,
  normalizeTreasuryAccount,
  determineDeletionMode,
  collectStockRefs,
  resolveRestoreQuantity,
  aggregateProductDeltas,
  applyDeltasToProduct,
  summarizeMoney
};
