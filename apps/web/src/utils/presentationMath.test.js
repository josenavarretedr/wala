import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isFractionalUnit,
  getPresentations,
  getBasePresentation,
  validateQuantity,
  toBaseQuantity,
  fromBaseQuantity,
  toBaseUnitCost,
  quantityFromAmount,
  computeWeightedAverageCost,
  resolveMinMargin,
  computeFloorPrice,
  applyDiscount,
  evaluateMargin,
  describeStockInPresentations,
} from './presentationMath.js';

test('isFractionalUnit identifica correctamente unidades fraccionables', () => {
  assert.equal(isFractionalUnit('kg'), true);
  assert.equal(isFractionalUnit('KG'), true);
  assert.equal(isFractionalUnit('lt'), true);
  assert.equal(isFractionalUnit('m'), true);
  assert.equal(isFractionalUnit('uni'), false);
  assert.equal(isFractionalUnit('porcion'), false);
  assert.equal(isFractionalUnit(null), false);
});

test('getPresentations genera base virtual para producto sin presentaciones', () => {
  const product = { description: 'ARROZ', unit: 'kg', price: 4.5 };
  const presentations = getPresentations(product);

  assert.equal(presentations.length, 1);
  assert.equal(presentations[0].isBase, true);
  assert.equal(presentations[0].factor, 1);
  assert.equal(presentations[0].price, 4.5);
  assert.equal(presentations[0].allowSellByAmount, true);
});

test('validateQuantity restringe enteros en presentaciones múltiples o unidades no fraccionables', () => {
  const presSaco = { name: 'Saco', factor: 50 };
  const presBaseKg = { name: 'Kilo', factor: 1, isBase: true };
  const presBaseUni = { name: 'Unidad', factor: 1, isBase: true };

  // Saco (factor 50) NO admite 2.5
  assert.equal(validateQuantity({ qty: 2.5, presentation: presSaco, unit: 'kg' }).valid, false);
  // Saco (factor 50) SÍ admite 2
  assert.equal(validateQuantity({ qty: 2, presentation: presSaco, unit: 'kg' }).valid, true);

  // Kilo (factor 1 en unit kg) SÍ admite 2.5
  assert.equal(validateQuantity({ qty: 2.5, presentation: presBaseKg, unit: 'kg' }).valid, true);

  // Unidad (factor 1 en unit uni) NO admite 1.5
  assert.equal(validateQuantity({ qty: 1.5, presentation: presBaseUni, unit: 'uni' }).valid, false);
  // Unidad (factor 1 en unit uni) SÍ admite 3
  assert.equal(validateQuantity({ qty: 3, presentation: presBaseUni, unit: 'uni' }).valid, true);
});

test('Conversiones de cantidad y costo entre presentación y base', () => {
  // 3 cajas de 24 -> 72 unidades base
  assert.equal(toBaseQuantity(3, 24), 72);

  // 72 unidades base -> 3 cajas de 24
  assert.equal(fromBaseQuantity(72, 24), 3);

  // Costo de S/ 216 por caja de 24 -> S/ 9.00 por unidad base
  assert.equal(toBaseUnitCost(216, 24), 9);
});

test('computeWeightedAverageCost (CPP) calcula correctamente el costo ponderado', () => {
  // Caso clásico: 10 uni a S/ 8.00 + 24 uni entrantes a S/ 9.00 -> S/ 8.71
  const cpp = computeWeightedAverageCost({
    currentStock: 10,
    currentCost: 8.0,
    inQty: 24,
    inUnitCost: 9.0,
  });
  assert.equal(cpp, 8.71);

  // Si stock actual es 0 o negativo, toma el entrante
  assert.equal(
    computeWeightedAverageCost({
      currentStock: 0,
      currentCost: 8.0,
      inQty: 20,
      inUnitCost: 10.0,
    }),
    10.0
  );
  assert.equal(
    computeWeightedAverageCost({
      currentStock: -5,
      currentCost: 8.0,
      inQty: 20,
      inUnitCost: 11.5,
    }),
    11.5
  );

  // Si no entra cantidad, mantiene el actual
  assert.equal(
    computeWeightedAverageCost({
      currentStock: 10,
      currentCost: 8.0,
      inQty: 0,
      inUnitCost: 15.0,
    }),
    8.0
  );
});

test('quantityFromAmount (venta a granel por dinero) calcula cantidad y cuadre exacto', () => {
  // "S/ 5 de arroz a S/ 4.50 el kg"
  const res = quantityFromAmount({ amount: 5.0, unitPrice: 4.5 });

  // 5 / 4.5 = 1.1111... -> 1.11 kg
  assert.equal(res.quantity, 1.11);
  assert.equal(res.targetAmount, 5.0);

  // Verificamos que quantity * adjustedPrice de el total redondeado exacto
  const totalCobrado = Math.round(res.quantity * res.adjustedPrice * 100) / 100;
  assert.equal(totalCobrado, 5.0);
});

test('applyDiscount calcula descuento porcentual y en monto fijo correctamente', () => {
  // 5% sobre S/ 200 -> S/ 10 de descuento, neto S/ 190
  const discPct = applyDiscount({ listPrice: 200, type: 'percent', value: 5 });
  assert.equal(discPct.netPrice, 190);
  assert.equal(discPct.amountPerUnit, 10);
  assert.equal(discPct.discountPct, 5);

  // S/ 8 de descuento fijo sobre S/ 200 -> neto S/ 192
  const discAmt = applyDiscount({ listPrice: 200, type: 'amount', value: 8 });
  assert.equal(discAmt.netPrice, 192);
  assert.equal(discAmt.amountPerUnit, 8);
  assert.equal(discAmt.discountPct, 4);

  // Descuento mayor al precio queda en 0 y no en negativo
  const discOver = applyDiscount({ listPrice: 50, type: 'amount', value: 100 });
  assert.equal(discOver.netPrice, 0);
  assert.equal(discOver.amountPerUnit, 50);
});

test('evaluateMargin y computeFloorPrice con margen por presentación vs general', () => {
  const baseCost = 3.6; // Costo por kg
  const factor = 50; // Saco de 50 kg -> costo saco = 180.00
  const policy = { minMarginPct: 20 };

  // El saco tiene minMarginPct de 5% específico
  const presSaco = { factor: 50, minMarginPct: 5 };
  const minMargin = resolveMinMargin(presSaco, policy);
  assert.equal(minMargin, 5);

  // Precio piso para saco con 5% de margen: 180 / 0.95 = 189.47
  const floorPrice = computeFloorPrice({ baseCost, factor: 50, minMarginPct: minMargin });
  assert.equal(floorPrice, 189.47);

  // Caso 1: Saco vendido a S/ 192 -> Superior a 189.47 -> status 'ok'
  const evalOk = evaluateMargin({
    netPrice: 192,
    baseCost,
    factor: 50,
    minMarginPct: minMargin,
  });
  assert.equal(evalOk.status, 'ok');
  assert.equal(evalOk.isBlocked, false);

  // Caso 2: Saco vendido a S/ 185 -> Entre costo (180) y piso (189.47) -> 'below_floor'
  const evalFloor = evaluateMargin({
    netPrice: 185,
    baseCost,
    factor: 50,
    minMarginPct: minMargin,
  });
  assert.equal(evalFloor.status, 'below_floor');
  assert.equal(evalFloor.isBlocked, false);

  // Caso 3: Saco vendido a S/ 175 -> Por debajo del costo (180) -> 'below_cost' y bloqueado
  const evalCost = evaluateMargin({
    netPrice: 175,
    baseCost,
    factor: 50,
    minMarginPct: minMargin,
    allowBelowCost: false,
  });
  assert.equal(evalCost.status, 'below_cost');
  assert.equal(evalCost.isBlocked, true);
});

test('describeStockInPresentations formatea desglose amigable', () => {
  const presentations = [
    { id: 'pres_kg', name: 'Kilo', factor: 1, isBase: true },
    { id: 'pres_saco', name: 'Saco', factor: 50, isBase: false },
  ];

  // 112.5 kg -> 2 Saco + 12.5 kg
  const desc = describeStockInPresentations(112.5, presentations, 'kg');
  assert.equal(desc, '2 Saco + 12.5 kg');

  // 0 kg -> 0 kg
  assert.equal(describeStockInPresentations(0, presentations, 'kg'), '0 kg');
});
