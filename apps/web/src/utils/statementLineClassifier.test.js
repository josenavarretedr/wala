import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyStatementLine,
  isCashAdjustmentTransaction,
  isRefundedIncomeSale,
  isActiveIncomeSale,
  isStatementExpense,
} from './statementLineClassifier.js';

test('Caso reportado: apertura de caja (1000 efectivo + 500 Yape) + venta de 96 soles solo suma 96 en ventas', () => {
  const transactions = [
    {
      uuid: 'open-1',
      type: 'opening',
      description: 'Apertura de caja',
      realCashBalance: 1000,
      realBankBalance: 500,
      amount: 0,
      items: [],
    },
    {
      uuid: 'adj-cash',
      type: 'income',
      account: 'cash',
      description: 'Ajuste de apertura - Efectivo (Sobrante)',
      amount: 1000,
      category: 'adjustment',
      subcategory: 'opening_adjustment',
      isSystemGenerated: true,
      items: [],
    },
    {
      uuid: 'adj-bank',
      type: 'income',
      account: 'bank',
      description: 'Ajuste de apertura - Yape/Plin (Sobrante)',
      amount: 500,
      category: 'adjustment',
      subcategory: 'opening_adjustment',
      isSystemGenerated: true,
      items: [],
    },
    {
      uuid: 'sale-1',
      type: 'income',
      account: 'cash',
      description: 'Venta de productos',
      amount: 96,
      items: [{ productId: 'prod-1', description: 'Producto A', quantity: 12, price: 8 }],
    },
  ];

  const activeSales = transactions.filter(isActiveIncomeSale);
  const totalSalesRevenue = activeSales.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  assert.equal(activeSales.length, 1);
  assert.equal(activeSales[0].uuid, 'sale-1');
  assert.equal(totalSalesRevenue, 96);

  assert.equal(isCashAdjustmentTransaction(transactions[1]), true);
  assert.equal(isCashAdjustmentTransaction(transactions[2]), true);
  assert.equal(classifyStatementLine(transactions[1]), 'other');
  assert.equal(classifyStatementLine(transactions[2]), 'other');
  assert.equal(classifyStatementLine(transactions[3]), 'sales_revenue');
});

test('Ajustes de cierre (closure_adjustment) positivos y negativos son excluidos del P&L', () => {
  const surplusClosureAdj = {
    uuid: 'close-adj-in',
    type: 'income',
    account: 'cash',
    description: 'Ajuste de cierre - Efectivo (Sobrante)',
    amount: 45,
    category: 'adjustment',
    subcategory: 'closure_adjustment',
    isSystemGenerated: true,
    items: [],
  };

  const shortageClosureAdj = {
    uuid: 'close-adj-out',
    type: 'expense',
    account: 'bank',
    description: 'Ajuste de cierre - Yape/Plin (Faltante)',
    amount: 20,
    category: 'adjustment',
    subcategory: 'closure_adjustment',
    isSystemGenerated: true,
    items: [],
  };

  assert.equal(isCashAdjustmentTransaction(surplusClosureAdj), true);
  assert.equal(isCashAdjustmentTransaction(shortageClosureAdj), true);
  assert.equal(isActiveIncomeSale(surplusClosureAdj), false);
  assert.equal(isStatementExpense(shortageClosureAdj), false);
  assert.equal(classifyStatementLine(surplusClosureAdj), 'other');
  assert.equal(classifyStatementLine(shortageClosureAdj), 'other');
});

test('Ajustes heredados sin category/subcategory ni items son detectados y excluidos', () => {
  const legacyClosureSurplus = {
    uuid: 'legacy-close',
    type: 'income',
    account: 'cash',
    description: 'Ajuste de cierre de caja - Sobrante',
    total: 100,
  };
  const legacyOpeningShortage = {
    uuid: 'legacy-open',
    type: 'expense',
    account: 'bank',
    description: 'Ajuste de apertura - Yape/Plin (Faltante)',
    amount: 50,
  };
  const normalSaleWithSimilarText = {
    uuid: 'real-sale-with-items',
    type: 'income',
    account: 'cash',
    description: 'Ajuste de apertura promocional',
    amount: 30,
    items: [{ productId: 'p1', quantity: 1, price: 30 }],
  };

  assert.equal(isCashAdjustmentTransaction(legacyClosureSurplus), true);
  assert.equal(isActiveIncomeSale(legacyClosureSurplus), false);
  assert.equal(classifyStatementLine(legacyClosureSurplus), 'other');

  assert.equal(isCashAdjustmentTransaction(legacyOpeningShortage), true);
  assert.equal(isStatementExpense(legacyOpeningShortage), false);
  assert.equal(classifyStatementLine(legacyOpeningShortage), 'other');

  assert.equal(isCashAdjustmentTransaction(normalSaleWithSimilarText), false);
  assert.equal(isActiveIncomeSale(normalSaleWithSimilarText), true);
});

test('Ajustes con statementLine erróneo preexistente siguen clasificándose como other', () => {
  const pollutedIncomeAdjustment = {
    uuid: 'polluted-in',
    type: 'income',
    category: 'adjustment',
    subcategory: 'opening_adjustment',
    statementLine: 'sales_revenue',
    amount: 1000,
    items: [],
  };

  const pollutedExpenseAdjustment = {
    uuid: 'polluted-out',
    type: 'expense',
    category: 'adjustment',
    subcategory: 'closure_adjustment',
    statementLine: 'opex_fixed',
    amount: 150,
    items: [],
  };

  assert.equal(classifyStatementLine(pollutedIncomeAdjustment), 'other');
  assert.equal(classifyStatementLine(pollutedExpenseAdjustment), 'other');
  assert.equal(isActiveIncomeSale(pollutedIncomeAdjustment), false);
  assert.equal(isStatementExpense(pollutedExpenseAdjustment), false);
});

test('Ventas reembolsadas o anuladas no pasan isActiveIncomeSale y sí pasan isRefundedIncomeSale', () => {
  const refundedByStatus = {
    uuid: 'ref-1',
    type: 'income',
    status: 'refunded',
    amount: 120,
    items: [{ productId: 'p1', quantity: 1, price: 120 }],
  };
  const refundedByPaymentStatus = {
    uuid: 'ref-2',
    type: 'income',
    paymentStatus: 'refunded',
    amount: 80,
    items: [],
  };

  assert.equal(isRefundedIncomeSale(refundedByStatus), true);
  assert.equal(isActiveIncomeSale(refundedByStatus), false);
  assert.equal(isRefundedIncomeSale(refundedByPaymentStatus), true);
  assert.equal(isActiveIncomeSale(refundedByPaymentStatus), false);
});

test('Ventas normales (catálogo y rápidas) y egresos reales mantienen su comportamiento', () => {
  const catalogSale = {
    uuid: 'sale-cat',
    type: 'income',
    amount: 150,
    items: [{ productId: 'p1', quantity: 3, price: 50 }],
  };
  const quickSale = {
    uuid: 'sale-quick',
    type: 'income',
    description: 'Venta rápida',
    amount: 45,
    items: [],
  };
  const materialsExpense = {
    uuid: 'exp-mat',
    type: 'expense',
    category: 'materials',
    amount: 200,
  };
  const overheadExpense = {
    uuid: 'exp-ovh',
    type: 'expense',
    category: 'overhead',
    subcategory: 'Alquileres',
    amount: 800,
  };
  const ownerDraw = {
    uuid: 'exp-draw',
    type: 'expense',
    category: 'owner_draw',
    amount: 300,
  };
  const inventoryLoss = {
    uuid: 'exp-loss',
    type: 'expense',
    category: 'inventory_loss',
    amount: 60,
  };
  const badDebt = {
    uuid: 'exp-debt',
    type: 'expense',
    category: 'bad_debt',
    amount: 90,
  };

  assert.equal(isActiveIncomeSale(catalogSale), true);
  assert.equal(classifyStatementLine(catalogSale), 'sales_revenue');
  assert.equal(isActiveIncomeSale(quickSale), true);
  assert.equal(classifyStatementLine(quickSale), 'sales_revenue');

  assert.equal(isStatementExpense(materialsExpense), true);
  assert.equal(classifyStatementLine(materialsExpense), 'cogs_materials');

  assert.equal(isStatementExpense(overheadExpense), true);
  assert.equal(classifyStatementLine(overheadExpense), 'opex_fixed');

  assert.equal(isStatementExpense(ownerDraw), true);
  assert.equal(classifyStatementLine(ownerDraw), 'owner_draw');

  assert.equal(isStatementExpense(inventoryLoss), true);
  assert.equal(classifyStatementLine(inventoryLoss), 'inventory_shrinkage');

  assert.equal(isStatementExpense(badDebt), true);
  assert.equal(classifyStatementLine(badDebt), 'opex_bad_debt');
});
