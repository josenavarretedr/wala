/* eslint-disable */

/**
 * @file deleteSale.js
 * @description Cloud Function (v2 onCall) para eliminar o revertir una venta (`type: 'income'`)
 * de forma atómica con política dual según el estado del día contable:
 *
 * - MODO A (`DIRECT_DELETE`): Si la venta pertenece al día actual y el día sigue abierto
 *   (sin cierre de caja), elimina físicamente la venta, sus cobros (`payment`), gastos de
 *   delivery vinculados (`expense`), registros de `stockLog`, restaura el stock/capital
 *   de productos, variantes, materiales y empaques, y recalcula `dailySummaries` y `clients`.
 *
 * - MODO B (`REFUND_NOTE` — Nota de Devolución): Si la venta pertenece a un día ya cerrado
 *   (`saleDay < today` o `saleDayClosed === true`), exige que el día actual (`today`) tenga
 *   apertura activa y no esté cerrado. Conserva intacta la venta histórica del día cerrado
 *   marcándola como `status: 'refunded'` / `paymentStatus: 'refunded'` (`balance: 0`),
 *   emite una transacción `type: 'refund'` en la caja de HOY por el dinero realmente cobrado
 *   (`cashOut`, `bankOut`, `detractionOut`), restaura el inventario/capital creando `stockLog` con
 *   `type: 'return'` en el día de hoy, y recalcula `dailySummaries/{today}` y `clients`.
 *
 * @module Transaction/deleteSale
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');
const { v4: uuidv4 } = require('uuid');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const { DEFAULT_TZ, todayStr, dayFromTimestamp, dateRangeForDay } = require('../Helpers/time');
const { round2, addMoney, parseMoneyNumber } = require('../Helpers/mathUtils');
const { roundStock } = require('../Helpers/inventoryMath');
const { getDayAggregates, upsertDailySummary } = require('../AccountsBalance/sharedComputed');
const { updateClientMetadata } = require('./processTransactionBackground');
const {
  determineDeletionMode,
  collectStockRefs,
  resolveRestoreQuantity,
  aggregateProductDeltas,
  applyDeltasToProduct,
  summarizeMoney,
} = require('./saleDeletion/planner');

/**
 * Verifica que el usuario autenticado tenga acceso activo al negocio y permiso para crear/eliminar movimientos.
 *
 * @param {string} uid
 * @param {string} businessId
 * @returns {Promise<Object>} Datos de membresía del usuario en el negocio
 */
/**
 * Verifica que el usuario autenticado tenga acceso activo al negocio y permiso para crear/eliminar movimientos.
 * Soporta múltiples ubicaciones de membresía para máxima compatibilidad con esquemas históricos:
 * 1. `users/{uid}/businesses/{businessId}` (ID de documento explícito)
 * 2. Colección `users/{uid}/businesses` donde `businessId == businessId` (auto-ID)
 * 3. Documento principal `businesses/{businessId}` donde `owner === uid`, `gerenteId === uid` o colaboradores
 * 4. Documento de usuario `users/{uid}` con `businessId === businessId`
 *
 * @param {string} uid
 * @param {string} businessId
 * @returns {Promise<Object>} Datos de membresía del usuario en el negocio
 */
async function assertBusinessPermission(uid, businessId) {
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión para eliminar o anular una venta.');
  }
  if (!businessId || typeof businessId !== 'string') {
    throw new HttpsError('invalid-argument', 'El identificador del negocio (businessId) es obligatorio.');
  }

  let membership = null;

  // 1. Intentar lectura directa por document ID
  const directSnap = await db.doc(`users/${uid}/businesses/${businessId}`).get();
  if (directSnap.exists) {
    membership = directSnap.data() || {};
  }

  // 2. Si no existe, buscar por campo businessId dentro de la subcolección
  if (!membership) {
    const querySnap = await db
      .collection(`users/${uid}/businesses`)
      .where('businessId', '==', businessId)
      .limit(1)
      .get();
    if (!querySnap.empty) {
      membership = querySnap.docs[0].data() || {};
    }
  }

  // 3. Fallback: Verificar si el usuario es el dueño o colaborador en `businesses/{businessId}`
  const bizSnap = await db.doc(`businesses/${businessId}`).get();
  const bizData = bizSnap.exists ? bizSnap.data() || {} : {};
  const isOwner =
    bizData.owner === uid ||
    bizData.gerenteId === uid ||
    bizData.userId === uid ||
    bizData.createdBy === uid;
  const isCollaborator = Array.isArray(bizData.collaborators) && bizData.collaborators.includes(uid);

  // 4. Si aún no hay membresía pero es owner del negocio
  if (!membership && isOwner) {
    membership = {
      businessId,
      rol: 'gerente',
      activo: true,
      permissions: { admin: true, crearMovimientos: true },
    };
  }

  // 5. Fallback adicional: verificar perfil del usuario `users/{uid}`
  if (!membership) {
    const userDocSnap = await db.doc(`users/${uid}`).get();
    if (userDocSnap.exists) {
      const uData = userDocSnap.data() || {};
      if (uData.businessId === businessId || isCollaborator) {
        membership = {
          businessId,
          rol: uData.rol || 'empleado',
          activo: uData.activo !== false,
          permissions: uData.permissions || {},
        };
      }
    }
  }

  if (!membership) {
    throw new HttpsError('permission-denied', 'No tienes acceso a este negocio.');
  }

  if (membership.activo === false) {
    throw new HttpsError('permission-denied', 'Tu acceso a este negocio no se encuentra activo.');
  }

  const roleStr = String(membership.rol || '').toLowerCase();
  const isManager =
    isOwner ||
    roleStr === 'gerente' ||
    roleStr === 'admin' ||
    roleStr === 'owner' ||
    roleStr === 'business_owner' ||
    roleStr === 'dueño' ||
    membership.permissions?.admin === true;

  const canCreateMovements = membership.permissions?.crearMovimientos !== false;

  if (!isManager && !canCreateMovements) {
    throw new HttpsError(
      'permission-denied',
      'No tienes permisos para eliminar o revertir movimientos financieros en este negocio.'
    );
  }

  return membership;
}

/**
 * Obtiene la zona horaria configurada para el negocio o el valor por defecto ('America/Lima').
 *
 * @param {string} businessId
 * @returns {Promise<string>}
 */
async function getBusinessTimezone(businessId) {
  try {
    const bizSnap = await db.doc(`businesses/${businessId}`).get();
    if (!bizSnap.exists) return DEFAULT_TZ;
    const data = bizSnap.data() || {};
    return data.settings?.timezone || data.timezone || DEFAULT_TZ;
  } catch (err) {
    console.warn(`⚠️ [deleteSale] No se pudo leer timezone de business ${businessId}, usando ${DEFAULT_TZ}:`, err.message);
    return DEFAULT_TZ;
  }
}

/**
 * Inspecciona el estado contable de un día (`hasOpening`, `hasClosure`) combinando `dailySummaries`
 * y una consulta directa a `transactions` del día para evitar condiciones de carrera con triggers en background.
 *
 * @param {string} businessId
 * @param {string} day - 'yyyy-LL-dd'
 * @param {string} tz
 * @returns {Promise<{ hasOpening: boolean, hasClosure: boolean, isAutoClosed: boolean, closureId: string|null }>}
 */
async function inspectDayStatus(businessId, day, tz = DEFAULT_TZ) {
  const summaryRef = db.doc(`businesses/${businessId}/dailySummaries/${day}`);
  const { start, end } = dateRangeForDay(day, tz);

  const [summarySnap, txSnap] = await Promise.all([
    summaryRef.get(),
    db
      .collection(`businesses/${businessId}/transactions`)
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get(),
  ]);

  const summary = summarySnap.exists ? summarySnap.data() || {} : {};
  let hasOpeningFromTx = false;
  let hasClosureFromTx = false;
  let closureIdFromTx = null;

  txSnap.forEach((doc) => {
    const data = doc.data() || {};
    if (data.type === 'opening') {
      hasOpeningFromTx = true;
    } else if (data.type === 'closure') {
      hasClosureFromTx = true;
      closureIdFromTx = data.uuid || doc.id;
    }
  });

  const hasOpening = Boolean(summary.hasOpening || hasOpeningFromTx);
  const hasClosure = Boolean(summary.hasClosure || summary.isAutoClosed || summary.closureId || hasClosureFromTx);

  return {
    hasOpening,
    hasClosure,
    isAutoClosed: Boolean(summary.isAutoClosed),
    closureId: summary.closureId || closureIdFromTx || null,
  };
}

/**
 * Resuelve cada referencia de stock (`collectStockRefs`) combinando los datos del documento
 * `stockLog` en la subcolección (o en el array legacy `productData.stockLog`) con `resolveRestoreQuantity`.
 *
 * @param {Array<Object>} stockRefDescriptors
 * @param {Array<Object|null>} subcollectionLogSnaps
 * @param {Map<string, Object>} productSnapshotsMap
 * @returns {Array<Object>}
 */
function buildResolvedRestores(stockRefDescriptors = [], subcollectionLogSnaps = [], productSnapshotsMap = new Map()) {
  const safeDescriptors = Array.isArray(stockRefDescriptors) ? stockRefDescriptors.filter(Boolean) : [];
  const safeLogSnaps = Array.isArray(subcollectionLogSnaps) ? subcollectionLogSnaps : [];

  return safeDescriptors.map((desc, idx) => {
    const subSnap = safeLogSnaps[idx];
    const foundInSubcollection = Boolean(subSnap && subSnap.exists);
    let stockLogDoc = foundInSubcollection ? subSnap.data() : null;
    let foundInLegacyArray = false;

    if (!stockLogDoc && desc.stockLogUuid) {
      const prodSnap = productSnapshotsMap.get(desc.productId);
      const prodData = prodSnap && prodSnap.exists ? prodSnap.data() || {} : {};
      if (Array.isArray(prodData.stockLog)) {
        const legacyMatch = prodData.stockLog.find((l) => l && l.uuid === desc.stockLogUuid);
        if (legacyMatch) {
          stockLogDoc = legacyMatch;
          foundInLegacyArray = true;
        }
      }
    }

    const resolvedQtyInfo = resolveRestoreQuantity(stockLogDoc, desc);

    return {
      ...desc,
      stockLogDoc,
      stockLogRef: subSnap ? subSnap.ref : null,
      foundInSubcollection,
      foundInLegacyArray,
      quantity: resolvedQtyInfo.quantity,
      legacyQuantity: resolvedQtyInfo.legacyQuantity,
      variantId: resolvedQtyInfo.variantId,
      variantLabel: resolvedQtyInfo.variantLabel,
      cost: resolvedQtyInfo.cost,
      price: resolvedQtyInfo.price,
    };
  });
}

/**
 * Construye el resumen de impacto (financiero, inventario y cliente) para el preview (`dryRun`)
 * y para la respuesta final de ejecución.
 */
function buildImpactSummary({
  sale,
  saleDay,
  today,
  modeResult,
  moneySummary,
  productDeltasMap,
  productSnapshotsMap,
  linkedPayments,
  linkedExpenses,
  clientName,
}) {
  const stockItems = [];
  let totalCapitalRestored = 0;

  const safeDeltasMap = productDeltasMap || new Map();
  const safeProductSnapshotsMap = productSnapshotsMap || new Map();

  for (const [productId, deltaEntry] of safeDeltasMap.entries()) {
    if (!productId || !deltaEntry) continue;
    const productSnap = safeProductSnapshotsMap.get(productId);
    if (!productSnap || !productSnap.exists) continue;

    const productData = (productSnap && typeof productSnap.data === 'function' ? productSnap.data() : null) || {};
    const unitCost = parseMoneyNumber(productData.cost || 0);
    const variantDeltasObj = deltaEntry.variantDeltas || {};
    const variantDeltaSum = Object.values(variantDeltasObj).reduce(
      (sum, v) => sum + Number(v || 0),
      0
    );

    const totalProductQtyRestored = roundStock(
      Number(deltaEntry.baseQuantityDelta || 0) + variantDeltaSum
    );
    const capitalRestored = round2(totalProductQtyRestored * unitCost);
    totalCapitalRestored = addMoney(totalCapitalRestored, capitalRestored);

    const variantBreakdown = [];
    for (const [variantId, vDelta] of Object.entries(variantDeltasObj)) {
      const combosList = Array.isArray(productData.variantCombos)
        ? productData.variantCombos
        : Array.isArray(productData.variants)
        ? productData.variants
        : [];
      const variantObj = combosList.find((v) => v && v.id === variantId);
      variantBreakdown.push({
        variantId,
        label: variantObj?.label || variantObj?.sku || variantId,
        quantityToRestore: roundStock(vDelta),
      });
    }

    stockItems.push({
      productId,
      description: productData.description || deltaEntry.entries?.[0]?.description || 'Producto',
      unit: productData.unit || 'uni',
      reason: deltaEntry.entries?.[0]?.source || 'item',
      currentStock: roundStock(productData.stock || 0),
      quantityToRestore: totalProductQtyRestored,
      resultingStock: roundStock(Number(productData.stock || 0) + totalProductQtyRestored),
      unitCost,
      capitalRestored,
      variants: variantBreakdown,
    });
  }

  const cancelledBalance = round2(
    moneySummary.cancelledBalance ?? moneySummary.cancelledDebt ?? 0
  );

  return {
    saleUuid: sale.uuid,
    saleNumber: sale.transactionNumber || null,
    saleAmount: round2(parseMoneyNumber(sale.amount ?? sale.total ?? 0)),
    saleDay,
    today,
    mode: modeResult.mode,
    canExecute: modeResult.canExecute,
    blockReason: modeResult.blockReason,
    money: {
      cashOut: moneySummary.cashOut || 0,
      bankOut: moneySummary.bankOut || 0,
      detractionOut: moneySummary.detractionOut || 0,
      totalPaidOut: moneySummary.totalPaid || 0,
      cancelledBalance,
      linkedPaymentsCount: linkedPayments.length,
      linkedDeliveryExpensesCount: linkedExpenses.length,
    },
    inventory: {
      itemsCount: stockItems.length,
      totalCapitalRestored,
      items: stockItems,
    },
    client:
      sale.clientId && sale.clientId !== 'anonymous-client'
        ? {
            clientId: sale.clientId,
            clientName: clientName || sale.clientName || 'Cliente',
            cancelledReceivable: cancelledBalance,
            purchaseAmountReversed: round2(parseMoneyNumber(sale.amount ?? sale.total ?? 0)),
          }
        : null,
  };
}

/**
 * Cloud Function `deleteSale`
 */
const deleteSale = onCall(
  {
    region: 'southamerica-east1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    try {
      const uid = request.auth?.uid;
      const {
        businessId,
        saleUuid,
        reason = '',
        dryRun = false,
      } = request.data || {};

      console.log(`🔍 [deleteSale] Invocación: businessId="${businessId}", saleUuid="${saleUuid}", dryRun=${dryRun}, uid="${uid}"`);

      if (!saleUuid || typeof saleUuid !== 'string') {
        throw new HttpsError('invalid-argument', 'El identificador de la venta (saleUuid) es obligatorio.');
      }

    // 1. Validar autenticación y permisos en el negocio
    await assertBusinessPermission(uid, businessId);

    // 2. Obtener timezone y cargar la venta objetivo
    const tz = await getBusinessTimezone(businessId);
    const saleRef = db.doc(`businesses/${businessId}/transactions/${saleUuid}`);
    const saleSnap = await saleRef.get();

    if (!saleSnap.exists) {
      throw new HttpsError('not-found', `La venta ${saleUuid} no existe o ya fue eliminada.`);
    }

    const sale = {
      ...saleSnap.data(),
      uuid: saleSnap.data()?.uuid || saleSnap.id,
      id: saleSnap.data()?.uuid || saleSnap.id,
    };

    if (sale.type !== 'income') {
      throw new HttpsError(
        'failed-precondition',
        `Esta función solo procesa ventas (type='income'). Tipo recibido: '${sale.type}'.`
      );
    }

    if (sale.status === 'refunded' || sale.paymentStatus === 'refunded') {
      throw new HttpsError(
        'already-exists',
        'Esta venta ya fue anulada mediante una Nota de Devolución anteriormente.'
      );
    }

    // 3. Determinar el día de la venta, el día actual y el estado de apertura/cierre
    const saleDay = dayFromTimestamp(sale.createdAt || sale.date, tz);
    const today = todayStr(tz);

    const [saleDayStatus, todayStatus] = await Promise.all([
      inspectDayStatus(businessId, saleDay, tz),
      saleDay === today
        ? Promise.resolve(null)
        : inspectDayStatus(businessId, today, tz),
    ]);

    const effectiveTodayStatus = todayStatus || saleDayStatus;

    const modeResult = determineDeletionMode({
      saleDay,
      today,
      saleDayClosed: saleDayStatus.hasClosure,
      todayHasOpening: effectiveTodayStatus.hasOpening,
      todayHasClosure: effectiveTodayStatus.hasClosure,
      saleStatus: sale.status,
      paymentStatus: sale.paymentStatus,
    });

    // 4. Buscar transacciones vinculadas (pagos posteriores y gastos de delivery) en Firestore
    const relatedTxSnap = await db
      .collection(`businesses/${businessId}/transactions`)
      .where('relatedTransactionId', '==', saleUuid)
      .get();

    const linkedPayments = [];
    const linkedExpenses = [];

    relatedTxSnap.forEach((doc) => {
      const data = {
        ...doc.data(),
        uuid: doc.data()?.uuid || doc.id,
        id: doc.data()?.uuid || doc.id,
      };
      if (data.type === 'payment') {
        linkedPayments.push(data);
      } else if (
        data.type === 'expense' &&
        (data.isDeliveryCommission === true || data.isDeliveryCostExpense === true)
      ) {
        linkedExpenses.push(data);
      }
    });

    // 5. Planificar referencias de stock y calcular montos de dinero
    const stockRefDescriptors = collectStockRefs(sale);
    const uniqueProductIds = Array.from(
      new Set(stockRefDescriptors.map((d) => d.productId).filter(Boolean))
    );
    const moneySummary = summarizeMoney(sale, linkedPayments);

    // Cargar cliente si aplica (para nombre en el preview / nota de devolución)
    let clientName = sale.clientName || null;
    if (sale.clientId && sale.clientId !== 'anonymous-client' && !clientName) {
      const clientSnap = await db.doc(`businesses/${businessId}/clients/${sale.clientId}`).get();
      if (clientSnap.exists) {
        clientName = clientSnap.data()?.name || null;
      }
    }

    // 6. Si es dryRun o si no se puede ejecutar (bloqueo por caja no aperturada o ya cerrada hoy),
    // leemos los productos/stockLogs fuera de transacción para devolver el preview completo al modal UI
    if (dryRun || !modeResult.canExecute) {
      const [stockLogSnaps, productSnaps] = await Promise.all([
        Promise.all(
          stockRefDescriptors.map((desc) =>
            desc.productId && desc.stockLogUuid
              ? db
                  .doc(`businesses/${businessId}/products/${desc.productId}/stockLog/${desc.stockLogUuid}`)
                  .get()
              : Promise.resolve(null)
          )
        ),
        Promise.all(
          uniqueProductIds.map((pid) => db.doc(`businesses/${businessId}/products/${pid}`).get())
        ),
      ]);

      const productSnapshotsMap = new Map();
      uniqueProductIds.forEach((pid, idx) => {
        productSnapshotsMap.set(pid, productSnaps[idx]);
      });

      const resolvedRestores = buildResolvedRestores(
        stockRefDescriptors,
        stockLogSnaps,
        productSnapshotsMap
      );
      const productDeltasMap = aggregateProductDeltas(resolvedRestores);

      const impact = buildImpactSummary({
        sale,
        saleDay,
        today,
        modeResult,
        moneySummary,
        productDeltasMap,
        productSnapshotsMap,
        linkedPayments,
        linkedExpenses,
        clientName,
      });

      if (dryRun) {
        return {
          ok: true,
          dryRun: true,
          mode: modeResult.mode,
          canExecute: modeResult.canExecute,
          blockReason: modeResult.blockReason,
          saleDay,
          today,
          impact,
        };
      }

      // Si no era dryRun pero está bloqueado, lanzamos error estructurado con detalles
      const messageByReason = {
        TODAY_NOT_OPENED:
          'Esta venta pertenece a un día ya cerrado. Para emitir la Nota de Devolución hoy, primero debes aperturar la caja del día actual.',
        TODAY_ALREADY_CLOSED:
          'La caja del día de hoy ya fue cerrada. Podrás emitir la Nota de Devolución cuando apertures el siguiente día operativo.',
      };

      throw new HttpsError(
        'failed-precondition',
        messageByReason[modeResult.blockReason] || 'No se puede procesar la anulación en el estado actual de caja.',
        {
          blockReason: modeResult.blockReason,
          mode: modeResult.mode,
          saleDay,
          today,
          impact,
        }
      );
    }

    // 7. Ejecución Atómica dentro de `db.runTransaction`
    const nowTimestamp = Timestamp.now();
    const isoNow = new Date().toISOString();
    const refundUuid = modeResult.mode === 'REFUND_NOTE' ? uuidv4() : null;
    const traceabilityId = uuidv4();

    const txResult = await db.runTransaction(async (transaction) => {
      // === FASE DE LECTURA (todas las lecturas antes de cualquier escritura) ===
      const freshSaleSnap = await transaction.get(saleRef);
      if (!freshSaleSnap.exists) {
        throw new HttpsError('not-found', 'La venta ya no existe.');
      }

      const freshSale = {
        ...freshSaleSnap.data(),
        uuid: freshSaleSnap.data()?.uuid || freshSaleSnap.id,
        id: freshSaleSnap.data()?.uuid || freshSaleSnap.id,
      };

      if (freshSale.status === 'refunded' || freshSale.paymentStatus === 'refunded') {
        throw new HttpsError('already-exists', 'Esta venta ya fue devuelta.');
      }

      // Leer stockLogs referenciados (solo aquellos que tienen stockLogUuid válido)
      const stockLogSnaps = await Promise.all(
        stockRefDescriptors.map((desc) => {
          if (!desc.productId || !desc.stockLogUuid) return Promise.resolve(null);
          const ref = db.doc(
            `businesses/${businessId}/products/${desc.productId}/stockLog/${desc.stockLogUuid}`
          );
          return transaction.get(ref);
        })
      );

      // Leer documentos de productos únicos
      const productRefs = uniqueProductIds.map((pid) => db.doc(`businesses/${businessId}/products/${pid}`));
      const productSnaps = await Promise.all(productRefs.map((ref) => transaction.get(ref)));

      const productSnapshotsMap = new Map();
      uniqueProductIds.forEach((pid, idx) => {
        productSnapshotsMap.set(pid, productSnaps[idx]);
      });

      const resolvedRestores = buildResolvedRestores(
        stockRefDescriptors,
        stockLogSnaps,
        productSnapshotsMap
      );
      const productDeltasMap = aggregateProductDeltas(resolvedRestores);

      // === FASE DE ESCRITURA ===
      const productMutationsAudit = [];
      const returnStockLogsCreated = [];

      // A. Actualizar stock de cada producto único
      for (let i = 0; i < uniqueProductIds.length; i++) {
        const productId = uniqueProductIds[i];
        const productSnap = productSnaps[i];
        const productRef = productRefs[i];
        const deltaEntry = productDeltasMap.get(productId);

        if (!productSnap.exists || !deltaEntry) {
          console.warn(`⚠️ [deleteSale] Producto ${productId} no existe, omitiendo restauración de stock.`);
          continue;
        }

        const productData = productSnap.data() || {};
        const patch = applyDeltasToProduct(productData, deltaEntry, {
          mode: modeResult.mode,
          isoNow,
        });

        transaction.update(productRef, {
          ...patch.updateFields,
          updatedAt: nowTimestamp,
        });

        productMutationsAudit.push({
          productId,
          description: productData.description || 'Producto',
          previousStock: patch.previousStock,
          newStock: patch.newStock,
          cost: parseMoneyNumber(productData.cost || 0),
        });
      }

      // B. Procesar stockLogs en subcolección según el modo
      if (modeResult.mode === 'DIRECT_DELETE') {
        // En DIRECT_DELETE eliminamos los stockLogs originales de la venta del día abierto
        for (const entry of resolvedRestores) {
          if (entry.foundInSubcollection && entry.stockLogRef) {
            transaction.delete(entry.stockLogRef);
          }
        }
      } else {
        // En REFUND_NOTE conservamos el stockLog histórico y creamos un nuevo stockLog `type: 'return'` HOY
        for (const entry of resolvedRestores) {
          const productSnap = productSnapshotsMap.get(entry.productId);
          if (!productSnap || !productSnap.exists) continue;
          const productData = productSnap.data() || {};

          const quantityToRestore = roundStock(entry.quantity || 0);
          if (quantityToRestore <= 0) continue;

          const returnLogUuid = uuidv4();
          const returnLogRef = db.doc(
            `businesses/${businessId}/products/${entry.productId}/stockLog/${returnLogUuid}`
          );

          const returnLogDoc = {
            uuid: returnLogUuid,
            type: 'return',
            quantity: quantityToRestore,
            quantityDeducted: quantityToRestore,
            cost: parseMoneyNumber(productData.cost ?? entry.cost ?? 0),
            price: parseMoneyNumber(productData.price ?? entry.price ?? 0),
            transactionId: refundUuid,
            relatedSaleId: saleUuid,
            reason: reason || `Devolución de venta #${freshSale.transactionNumber || saleUuid.slice(0, 8)}`,
            stockLogReason: entry.source || 'item',
            createdAt: nowTimestamp,
          };

          if (entry.variantId) {
            returnLogDoc.variantId = entry.variantId;
            if (entry.variantLabel) {
              returnLogDoc.variantLabel = entry.variantLabel;
            }
            if (entry.stockLogDoc?.variantSku) {
              returnLogDoc.variantSku = entry.stockLogDoc.variantSku;
            }
          }

          transaction.set(returnLogRef, returnLogDoc);
          returnStockLogsCreated.push({
            productId: entry.productId,
            stockLogId: returnLogUuid,
            quantity: quantityToRestore,
            variantId: returnLogDoc.variantId || null,
          });
        }
      }

      // C. Procesar transacciones financieras según el modo
      let refundTransactionDoc = null;

      if (modeResult.mode === 'DIRECT_DELETE') {
        // Eliminar pagos posteriores asociados
        for (const payment of linkedPayments) {
          const paymentRef = db.doc(`businesses/${businessId}/transactions/${payment.uuid}`);
          transaction.delete(paymentRef);
        }

        // Eliminar gastos de delivery asociados
        for (const expense of linkedExpenses) {
          const expenseRef = db.doc(`businesses/${businessId}/transactions/${expense.uuid}`);
          transaction.delete(expenseRef);
        }

        // Eliminar la venta principal
        transaction.delete(saleRef);
      } else {
        // MODO B: REFUND_NOTE (Nota de Devolución en la caja de HOY)
        const activeBuckets = [
          moneySummary.cashOut > 0 ? 'cash' : null,
          moneySummary.bankOut > 0 ? 'bank' : null,
          moneySummary.detractionOut > 0 ? 'detraction' : null,
        ].filter(Boolean);

        const primaryAccount =
          activeBuckets.length > 1
            ? 'mixed'
            : activeBuckets[0] || 'cash';

        const cancelledBalance = round2(
          moneySummary.cancelledBalance ?? moneySummary.cancelledDebt ?? 0
        );

        refundTransactionDoc = {
          uuid: refundUuid,
          id: refundUuid,
          type: 'refund',
          category: 'sale_refund',
          subcategory: 'closed_day_reversal',
          description:
            reason && reason.trim()
              ? `Nota de devolución (Venta #${freshSale.transactionNumber || saleUuid.slice(0, 8)}): ${reason.trim()}`
              : `Nota de devolución por anulación de venta #${freshSale.transactionNumber || saleUuid.slice(0, 8)} (${saleDay})`,
          relatedTransactionId: saleUuid,
          relatedTransactionNumber: freshSale.transactionNumber || null,
          originalSaleDay: saleDay,
          originalSaleAmount: round2(parseMoneyNumber(freshSale.amount ?? freshSale.total ?? 0)),
          amount: moneySummary.totalPaid,
          cashOut: moneySummary.cashOut || 0,
          bankOut: moneySummary.bankOut || 0,
          detractionOut: moneySummary.detractionOut || 0,
          isSubjectToDetraction: Boolean((moneySummary.detractionOut || 0) > 0),
          cancelledBalance,
          account: primaryAccount,
          clientId: freshSale.clientId || null,
          clientName: clientName || freshSale.clientName || null,
          items: Array.isArray(freshSale.items) ? freshSale.items : [],
          returnStockLogs: returnStockLogsCreated,
          reason: reason || 'Anulación de venta de día cerrado',
          createdBy: uid,
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp,
        };

        const refundRef = db.doc(`businesses/${businessId}/transactions/${refundUuid}`);
        transaction.set(refundRef, refundTransactionDoc);

        // Marcar la venta original del día cerrado como 'refunded' (sin alterar su monto histórico de ese día)
        transaction.update(saleRef, {
          status: 'refunded',
          paymentStatus: 'refunded',
          balance: 0,
          refundTransactionId: refundUuid,
          refundedAt: nowTimestamp,
          refundedBy: uid,
          refundReason: reason || 'Anulación de venta en día posterior',
          updatedAt: nowTimestamp,
        });
      }

      // D. Escribir registro inmutable de auditoría en `businesses/{businessId}/traceability/{traceabilityId}`
      const traceRef = db.doc(`businesses/${businessId}/traceability/${traceabilityId}`);
      transaction.set(traceRef, {
        id: traceabilityId,
        operation: modeResult.mode === 'DIRECT_DELETE' ? 'sale_direct_delete' : 'sale_refund_note',
        mode: modeResult.mode,
        entityType: 'transaction',
        entityId: saleUuid,
        refundTransactionId: refundUuid,
        userId: uid,
        businessId,
        saleDay,
        executedDay: today,
        reason: reason || 'user_request',
        moneySummary,
        productMutations: productMutationsAudit,
        returnStockLogsCreated,
        deletedPaymentIds: modeResult.mode === 'DIRECT_DELETE' ? linkedPayments.map((p) => p.uuid) : [],
        deletedExpenseIds: modeResult.mode === 'DIRECT_DELETE' ? linkedExpenses.map((e) => e.uuid) : [],
        originalSaleSnapshot: freshSale,
        timestamp: nowTimestamp,
      });

      const impact = buildImpactSummary({
        sale: freshSale,
        saleDay,
        today,
        modeResult,
        moneySummary,
        productDeltasMap,
        productSnapshotsMap,
        linkedPayments,
        linkedExpenses,
        clientName,
      });

      return {
        impact,
        refundTransactionDoc,
      };
    });

    // 8. Post-transacción: Recalcular `dailySummary` del día afectado (y de hoy) y metadata del cliente
    const affectedDayForSummary = modeResult.mode === 'DIRECT_DELETE' ? saleDay : today;
    try {
      const updatedAggregates = await getDayAggregates(db, businessId, affectedDayForSummary, tz);
      await upsertDailySummary(db, businessId, affectedDayForSummary, {
        ...updatedAggregates,
        lastUpdated: Timestamp.now(),
      });
    } catch (summaryErr) {
      console.error(`⚠️ [deleteSale] Error recalculando dailySummary para ${affectedDayForSummary}:`, summaryErr);
    }

    if (sale.clientId && sale.clientId !== 'anonymous-client') {
      try {
        await updateClientMetadata(businessId, sale.clientId);
      } catch (clientErr) {
        console.error(`⚠️ [deleteSale] Error recalculando metadata del cliente ${sale.clientId}:`, clientErr);
      }
    }

    return {
      ok: true,
      dryRun: false,
      mode: modeResult.mode,
      canExecute: true,
      blockReason: null,
      saleUuid,
      refundTransactionId: refundUuid,
      refundTransaction: txResult.refundTransactionDoc,
      traceabilityId,
      saleDay,
      today,
      impact: txResult.impact,
    };
  } catch (err) {
    console.error('❌ [deleteSale] Error no controlado en Cloud Function:', err);
    if (err instanceof HttpsError) {
      throw err;
    }
    throw new HttpsError('internal', `[deleteSale Error]: ${err.message || err}`, {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });
  }
}
);

module.exports = {
  deleteSale,
  inspectDayStatus,
  buildResolvedRestores,
  buildImpactSummary,
};
