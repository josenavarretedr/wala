/* eslint-disable */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DELETION_MODES,
  BLOCK_REASONS,
  determineDeletionMode,
  collectStockRefs,
  resolveRestoreQuantity,
  aggregateProductDeltas,
  applyDeltasToProduct,
  summarizeMoney
} = require('./planner');

test('determineDeletionMode: same open day -> DIRECT_DELETE allowed', () => {
  const res = determineDeletionMode({
    saleDay: '2026-10-23',
    today: '2026-10-23',
    saleDayClosed: false,
    todayHasOpening: true,
    todayHasClosure: false,
    saleStatus: 'completed'
  });

  assert.equal(res.mode, DELETION_MODES.DIRECT_DELETE);
  assert.equal(res.canExecute, true);
  assert.equal(res.blockReason, null);
});

test('determineDeletionMode: closed past day + today open -> REFUND_NOTE allowed', () => {
  const res = determineDeletionMode({
    saleDay: '2026-10-20',
    today: '2026-10-23',
    saleDayClosed: true,
    todayHasOpening: true,
    todayHasClosure: false,
    saleStatus: 'completed'
  });

  assert.equal(res.mode, DELETION_MODES.REFUND_NOTE);
  assert.equal(res.canExecute, true);
  assert.equal(res.blockReason, null);
});

test('determineDeletionMode: closed past day + today NOT opened -> blocked TODAY_NOT_OPENED', () => {
  const res = determineDeletionMode({
    saleDay: '2026-10-20',
    today: '2026-10-23',
    saleDayClosed: true,
    todayHasOpening: false,
    todayHasClosure: false,
    saleStatus: 'completed'
  });

  assert.equal(res.mode, DELETION_MODES.REFUND_NOTE);
  assert.equal(res.canExecute, false);
  assert.equal(res.blockReason, BLOCK_REASONS.TODAY_NOT_OPENED);
});

test('determineDeletionMode: closed past day + today ALREADY closed -> blocked TODAY_ALREADY_CLOSED', () => {
  const res = determineDeletionMode({
    saleDay: '2026-10-20',
    today: '2026-10-23',
    saleDayClosed: true,
    todayHasOpening: true,
    todayHasClosure: true,
    saleStatus: 'completed'
  });

  assert.equal(res.mode, DELETION_MODES.REFUND_NOTE);
  assert.equal(res.canExecute, false);
  assert.equal(res.blockReason, BLOCK_REASONS.TODAY_ALREADY_CLOSED);
});

test('determineDeletionMode: already refunded sale -> blocked ALREADY_REFUNDED', () => {
  const res = determineDeletionMode({
    saleDay: '2026-10-20',
    today: '2026-10-23',
    saleDayClosed: true,
    todayHasOpening: true,
    todayHasClosure: false,
    saleStatus: 'refunded'
  });

  assert.equal(res.canExecute, false);
  assert.equal(res.blockReason, BLOCK_REASONS.ALREADY_REFUNDED);
});

test('collectStockRefs & resolveRestoreQuantity: handles items, composition materials, packaging, and insufficient stock', () => {
  const sale = {
    items: [
      {
        uuid: 'prod-1',
        description: 'Pollo a la Brasa',
        quantity: 5,
        quantityForStock: 3, // Solo había 3 en stock al vender
        cost: 20,
        price: 60
      }
    ],
    itemsAndStockLogs: [
      {
        itemUuid: 'prod-1',
        stockLogUuid: 'log-prod-1',
        materialStockLogs: [
          { materialId: 'mat-1', stockLogUuid: 'log-mat-1', quantityUsed: 2, description: 'Carbón' }
        ]
      }
    ],
    packagingStockLogs: [
      { materialId: 'pkg-1', stockLogUuid: 'log-pkg-1', quantityUsed: 5, description: 'Caja Delivery' }
    ]
  };

  const refs = collectStockRefs(sale);
  assert.equal(refs.length, 3);
  assert.equal(refs[0].source, 'item');
  assert.equal(refs[0].fallbackQuantity, 3);
  assert.equal(refs[1].source, 'material');
  assert.equal(refs[1].fallbackQuantity, 2);
  assert.equal(refs[2].source, 'packaging');
  assert.equal(refs[2].fallbackQuantity, 5);

  // Si el stockLog nuevo tiene quantityDeducted, se usa con legacyQuantity = false
  const resolvedExact = resolveRestoreQuantity({ quantity: 5, quantityDeducted: 3 }, refs[0]);
  assert.equal(resolvedExact.quantity, 3);
  assert.equal(resolvedExact.legacyQuantity, false);

  // Si es un stockLog antiguo sin quantityDeducted, usa fallbackQuantity (quantityForStock = 3)
  const resolvedLegacy = resolveRestoreQuantity({ quantity: 5 }, refs[0]);
  assert.equal(resolvedLegacy.quantity, 3);
  assert.equal(resolvedLegacy.legacyQuantity, true);
});

test('aggregateProductDeltas & applyDeltasToProduct: aggregates shared materials and updates variantCombos accurately', () => {
  const resolvedRestores = [
    {
      productId: 'prod-var',
      stockLogUuid: 'log-v1',
      quantity: 2,
      variantId: 'var-M',
      source: 'item',
      foundInSubcollection: true
    },
    {
      productId: 'mat-shared',
      stockLogUuid: 'log-m1',
      quantity: 1.5,
      variantId: null,
      source: 'material',
      foundInSubcollection: true
    },
    {
      productId: 'mat-shared',
      stockLogUuid: 'log-m2',
      quantity: 0.75,
      variantId: null,
      source: 'material',
      foundInSubcollection: true
    }
  ];

  const deltasMap = aggregateProductDeltas(resolvedRestores);
  assert.equal(deltasMap.size, 2);

  // Material compartido debe sumar 1.5 + 0.75 = 2.25 en una sola escritura
  const matDelta = deltasMap.get('mat-shared');
  assert.equal(matDelta.baseQuantityDelta, 2.25);
  assert.deepEqual(matDelta.subcollectionLogIds, ['log-m1', 'log-m2']);

  // Producto con variantes
  const varProductData = {
    stock: 10,
    variantCombos: [
      { id: 'var-S', stock: 4 },
      { id: 'var-M', stock: 6 }
    ]
  };
  const varResult = applyDeltasToProduct(varProductData, deltasMap.get('prod-var'), {
    mode: DELETION_MODES.REFUND_NOTE,
    isoNow: '2026-10-23T10:00:00.000Z'
  });

  assert.equal(varResult.previousStock, 10);
  assert.equal(varResult.newStock, 12);
  assert.equal(varResult.updateFields.variantCombos[1].stock, 8);
  assert.equal(varResult.updateFields.stockSummary.totalStock, 12);
});

test('summarizeMoney: deduplicates embedded and external payments across cash and bank', () => {
  // Venta de S/ 450 con pago inicial S/ 100 en efectivo y abono posterior S/ 150 en Yape (bank)
  const sale = {
    uuid: 'sale-1',
    amount: 450,
    account: 'cash',
    paymentStatus: 'partial',
    payments: [
      { uuid: 'pay-init', amount: 100, account: 'cash', isInitial: true },
      { uuid: 'pay-sub-1', amount: 150, account: 'yape', isInitial: false }
    ]
  };
  const paymentDocs = [
    { uuid: 'pay-sub-1', amount: 150, account: 'yape' }
  ];

  const summary = summarizeMoney(sale, paymentDocs);
  assert.equal(summary.saleAmount, 450);
  assert.equal(summary.cashOut, 100);
  assert.equal(summary.bankOut, 150);
  assert.equal(summary.totalPaid, 250);
  assert.equal(summary.cancelledDebt, 200);
});

test('summarizeMoney: 100% unpaid credit sale produces 0 cashOut/bankOut and full cancelledDebt', () => {
  const sale = {
    uuid: 'sale-credit',
    amount: 320,
    account: 'cash',
    paymentStatus: 'pending',
    payments: [{ uuid: 'pay-0', amount: 0, account: 'cash', isInitial: true }]
  };

  const summary = summarizeMoney(sale, []);
  assert.equal(summary.cashOut, 0);
  assert.equal(summary.bankOut, 0);
  assert.equal(summary.totalPaid, 0);
  assert.equal(summary.cancelledDebt, 320);
});

test('summarizeMoney: splits detractionOut from initial payment when sale isSubjectToDetraction', () => {
  const sale = {
    uuid: 'sale-detraction',
    amount: 1000,
    account: 'bank',
    paymentStatus: 'completed',
    isSubjectToDetraction: true,
    detractionRate: 1.5,
    detractionAmount: 15,
    netAmount: 985,
    payments: [{ uuid: 'pay-init', amount: 1000, account: 'bank', isInitial: true }]
  };

  const summary = summarizeMoney(sale, []);
  assert.equal(summary.bankOut, 985);
  assert.equal(summary.cashOut, 0);
  assert.equal(summary.detractionOut, 15);
  assert.equal(summary.totalPaid, 1000);
  assert.equal(summary.cancelledBalance, 0);
});

test('deleteSale pipeline: buildResolvedRestores + buildImpactSummary handles variants, legacy logs, and detractions without throwing', () => {
  const { buildResolvedRestores, buildImpactSummary } = require('../deleteSale');

  const sale = {
    uuid: 'sale-full',
    transactionNumber: 42,
    amount: 450,
    account: 'bank',
    clientId: 'client-1',
    clientName: 'María Gómez',
    isSubjectToDetraction: true,
    detractionAmount: 6.75,
    netAmount: 443.25,
    payments: [{ uuid: 'p1', amount: 450, account: 'bank', isInitial: true }],
    items: [
      {
        uuid: 'prod-1',
        description: 'Café Exportación',
        quantity: 3,
        cost: 50,
        price: 150,
        variantId: 'var-1kg',
        variantLabel: 'Bolsa 1kg'
      }
    ],
    itemsAndStockLogs: [
      {
        itemUuid: 'prod-1',
        stockLogUuid: 'log-1'
      }
    ]
  };

  const refs = collectStockRefs(sale);
  const fakeSubSnaps = [
    {
      exists: true,
      ref: { path: 'businesses/b1/products/prod-1/stockLog/log-1' },
      data: () => ({
        uuid: 'log-1',
        quantity: 3,
        quantityDeducted: 3,
        variantId: 'var-1kg',
        variantLabel: 'Bolsa 1kg',
        cost: 50,
        price: 150
      })
    }
  ];

  const productSnapshotsMap = new Map([
    [
      'prod-1',
      {
        exists: true,
        data: () => ({
          description: 'Café Exportación',
          unit: 'bolsa',
          stock: 7,
          cost: 50,
          variantCombos: [{ id: 'var-1kg', label: 'Bolsa 1kg', stock: 7 }]
        })
      }
    ]
  ]);

  const resolvedRestores = buildResolvedRestores(refs, fakeSubSnaps, productSnapshotsMap);
  const deltasMap = aggregateProductDeltas(resolvedRestores);
  const moneySummary = summarizeMoney(sale, []);
  const modeResult = determineDeletionMode({
    saleDay: '2026-10-20',
    today: '2026-10-23',
    saleDayClosed: true,
    todayHasOpening: true,
    todayHasClosure: false
  });

  const impact = buildImpactSummary({
    sale,
    saleDay: '2026-10-20',
    today: '2026-10-23',
    modeResult,
    moneySummary,
    productDeltasMap: deltasMap,
    productSnapshotsMap,
    linkedPayments: [],
    linkedExpenses: [],
    clientName: 'María Gómez'
  });

  assert.equal(impact.mode, 'REFUND_NOTE');
  assert.equal(impact.money.bankOut, 443.25);
  assert.equal(impact.money.detractionOut, 6.75);
  assert.equal(impact.money.totalPaidOut, 450);
  assert.equal(impact.inventory.itemsCount, 1);
  assert.equal(impact.inventory.totalCapitalRestored, 150);
  assert.equal(impact.inventory.items[0].quantityToRestore, 3);
  assert.equal(impact.inventory.items[0].resultingStock, 10);
  assert.equal(impact.inventory.items[0].variants[0].variantId, 'var-1kg');
});

test('Preview flow handles sale with null elements, missing fields, and sparse data without throwing', () => {
  const sale = {
    uuid: 'sale-null-test',
    transactionNumber: 'V-SPARSE',
    type: 'income',
    amount: 100,
    items: [
      {
        uuid: 'prod-sparse-1',
        description: 'Item Simple',
        quantity: 1,
        cost: 20,
      },
      null, // null element guard
    ],
    itemsAndStockLogs: [
      null,
      {
        itemUuid: 'prod-sparse-1',
        stockLogUuid: 'log-sparse-1',
        quantity: 1,
      }
    ],
    packagingStockLogs: [
      null,
      {
        productId: 'pkg-mat-1',
        stockLogUuid: 'log-pkg-1',
        quantityUsed: 2,
      }
    ]
  };

  const refs = collectStockRefs(sale);
  assert.equal(refs.length, 2);
  assert.equal(refs[0].productId, 'prod-sparse-1');
  assert.equal(refs[1].productId, 'pkg-mat-1');
});
