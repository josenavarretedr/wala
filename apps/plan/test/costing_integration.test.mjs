import { useCostingCalculator } from '../src/composables/useCostingCalculator.js';
import assert from 'assert';

console.log('--- Iniciando Test de Integración Multimodal de Costeo (con Borrado Automático) ---');

const calc = useCostingCalculator();

function resetProductCostingData(prod, newNature) {
  if (!prod) return;
  const nature = newNature || prod.businessNature || 'produccion';
  prod.businessNature = nature;

  prod.ingredients = [];
  prod.serviceConfig = {
    durationMinutes: 0,
    costPerMinute: 0.18,
    supplies: []
  };
  prod.commerceConfig = {
    purchasePresentation: '',
    unitsPerPackage: 1,
    packagePurchasePrice: 0,
    freightExpense: 0,
    totalItemsInTrip: 0,
    packagingCostPerUnit: 0,
    baseUnitCost: 0,
    unitFreightCost: 0,
    directCostComercial: 0
  };
  prod.batchConfig = {
    batchSize: 1,
    batchUnit: 'unidades',
    productionFrequency: 'semanal'
  };
  prod.commercialization = {
    currentSalePrice: 0,
    estimatedMonthlySalesVolume: 0
  };
  prod.financialSummary = {
    totalBatchDirectCost: 0,
    directCostPerUnit: 0,
    salePrice: 0,
    grossProfitPerUnit: 0,
    grossMarginPercentage: 0,
    monthlyGrossProfitEstimate: 0
  };

  const defaultPlaceholders = [
    'Hamburguesa Royal',
    'Producto Principal',
    'Producto 1',
    'Nuevo Producto',
    'Nuevo Producto Elaborado',
    'Nuevo Servicio',
    'Nuevo Producto Comercial'
  ];
  if (!prod.productName || defaultPlaceholders.includes(prod.productName.trim())) {
    if (nature === 'servicio') {
      prod.productName = 'Nuevo Servicio';
    } else if (nature === 'comercio') {
      prod.productName = 'Nuevo Producto Comercial';
    } else {
      prod.productName = 'Nuevo Producto Elaborado';
    }
  }
}

// 1. Crear producto de prueba en COMERCIO
const prod = {
  productId: 'PROD-TEST',
  productName: 'Polo Estampado',
  businessNature: 'comercio',
  batchConfig: { batchSize: 10, batchUnit: 'unidades', productionFrequency: 'semanal' },
  serviceConfig: { durationMinutes: 45, costPerMinute: 0.18, supplies: [] },
  commerceConfig: {
    purchasePresentation: 'Docena',
    unitsPerPackage: 12,
    packagePurchasePrice: 180.0,
    freightExpense: 30.0,
    totalItemsInTrip: 100,
    packagingCostPerUnit: 0.30,
    baseUnitCost: 15.0,
    unitFreightCost: 0.30,
    directCostComercial: 15.60
  },
  ingredients: [],
  commercialization: {
    currentSalePrice: 25.0,
    estimatedMonthlySalesVolume: 50
  },
  financialSummary: {}
};

// A) Evaluar bajo modalidad COMERCIO
function evalCommerce(p) {
  const commFin = calc.computeCommerceFinancials({
    packagePurchasePrice: p.commerceConfig.packagePurchasePrice,
    unitsPerPackage: p.commerceConfig.unitsPerPackage,
    freightExpense: p.commerceConfig.freightExpense,
    totalItemsInTrip: p.commerceConfig.totalItemsInTrip,
    packagingCostPerUnit: p.commerceConfig.packagingCostPerUnit,
    salePrice: p.commercialization.currentSalePrice,
    estimatedMonthlySalesVolume: p.commercialization.estimatedMonthlySalesVolume
  });
  p.financialSummary = { ...commFin };
}

evalCommerce(prod);
assert.strictEqual(prod.financialSummary.directCostPerUnit, 15.6, 'Comercio: Costo directo debe ser 15.60');
assert.strictEqual(prod.financialSummary.salePrice, 25, 'Comercio: Precio venta debe ser 25.00');
assert.strictEqual(prod.financialSummary.grossProfitPerUnit, 9.4, 'Comercio: Ganancia bruta debe ser 9.40');
assert.strictEqual(prod.financialSummary.grossMarginPercentage, 37.6, 'Comercio: Margen debe ser 37.6%');
console.log('✅ 1. Modo Comercio inicial validado!');

// B) Alternar a modalidad SERVICIO: DEBE BORRAR DATOS PREVIOS DE COMERCIO
resetProductCostingData(prod, 'servicio');

assert.strictEqual(prod.businessNature, 'servicio', 'Naturaleza actualizada a servicio');
assert.strictEqual(prod.commerceConfig.packagePurchasePrice, 0, 'Datos de comercio borrados (precio compra = 0)');
assert.strictEqual(prod.commerceConfig.unitsPerPackage, 1, 'Unidades paquete reset a 1');
assert.strictEqual(prod.commercialization.currentSalePrice, 0, 'Precio de venta reset a 0');
assert.strictEqual(prod.ingredients.length, 0, 'Ingredientes vacíos');
assert.strictEqual(prod.financialSummary.directCostPerUnit, 0, 'Costo directo reseteado a 0');
console.log('✅ 2. Borrado automático al pasar a Servicio validado!');

// Configurar datos de Servicio y evaluar
prod.serviceConfig.durationMinutes = 60;
prod.serviceConfig.supplies = [
  { id: 'S1', name: 'Crema', supplyType: 'bottle_yield', packageCost: 40, clientsYield: 20, unitCost: 2 }
];
prod.commercialization.currentSalePrice = 30;
prod.commercialization.estimatedMonthlySalesVolume = 40;

function evalService(p) {
  const servFin = calc.computeServiceFinancials({
    durationMinutes: p.serviceConfig.durationMinutes,
    costPerMinute: p.serviceConfig.costPerMinute,
    supplies: p.serviceConfig.supplies,
    salePrice: p.commercialization.currentSalePrice,
    estimatedMonthlySalesVolume: p.commercialization.estimatedMonthlySalesVolume
  });
  p.financialSummary = { ...servFin };
}

evalService(prod);
// 60 min * 0.18 = 10.80 + 2.00 = 12.80
assert.strictEqual(prod.financialSummary.directCostPerUnit, 12.8, 'Servicio: Costo directo debe ser 12.80');
assert.strictEqual(prod.financialSummary.salePrice, 30, 'Servicio: Tarifa cliente debe ser 30.00');
assert.strictEqual(prod.financialSummary.grossProfitPerUnit, 17.2, 'Servicio: Ganancia debe ser 17.20');
assert.strictEqual(prod.financialSummary.grossMarginPercentage, 57.33, 'Servicio: Margen debe ser 57.33%');
console.log('✅ 3. Modo Servicio calculado con éxito!');

// C) Alternar a modalidad PRODUCCIÓN: DEBE BORRAR DATOS PREVIOS DE SERVICIO
resetProductCostingData(prod, 'produccion');

assert.strictEqual(prod.businessNature, 'produccion', 'Naturaleza actualizada a producción');
assert.strictEqual(prod.serviceConfig.supplies.length, 0, 'Insumos de servicio borrados');
assert.strictEqual(prod.serviceConfig.durationMinutes, 0, 'Minutos de servicio reset a 0');
assert.strictEqual(prod.commercialization.currentSalePrice, 0, 'Precio de venta reset a 0');
assert.strictEqual(prod.batchConfig.batchSize, 1, 'Tamaño de tanda reset a 1');
console.log('✅ 4. Borrado automático al pasar a Producción validado!');

// Configurar datos de Producción y evaluar
prod.batchConfig.batchSize = 20;
prod.ingredients = [
  { automatedMath: { costIncurredInBatch: 20 } },
  { automatedMath: { costIncurredInBatch: 30 } }
];
prod.commercialization.currentSalePrice = 5.0;
prod.commercialization.estimatedMonthlySalesVolume = 100;

function evalProduction(p) {
  const prodFin = calc.computeProductFinancials({
    ingredients: p.ingredients,
    batchSize: p.batchConfig.batchSize,
    salePrice: p.commercialization.currentSalePrice,
    estimatedMonthlySalesVolume: p.commercialization.estimatedMonthlySalesVolume
  });
  p.financialSummary = { ...prodFin, salePrice: p.commercialization.currentSalePrice };
}

evalProduction(prod);
// 50 / 20 = 2.50
assert.strictEqual(prod.financialSummary.directCostPerUnit, 2.5, 'Producción: Costo directo debe ser 2.50');
assert.strictEqual(prod.financialSummary.salePrice, 5, 'Producción: Precio venta debe ser 5.00');
assert.strictEqual(prod.financialSummary.grossProfitPerUnit, 2.5, 'Producción: Ganancia bruta debe ser 2.50');
assert.strictEqual(prod.financialSummary.grossMarginPercentage, 50, 'Producción: Margen debe ser 50%');
console.log('✅ 5. Modo Producción calculado con éxito!');

// D) Alternar nuevamente a COMERCIO: DEBE BORRAR INGREDIENTES Y DEVOLVER CEROS
resetProductCostingData(prod, 'comercio');

assert.strictEqual(prod.businessNature, 'comercio', 'Naturaleza actualizada a comercio');
assert.strictEqual(prod.ingredients.length, 0, 'Ingredientes de receta borrados');
assert.strictEqual(prod.commercialization.currentSalePrice, 0, 'Precio venta reset a 0');
assert.strictEqual(prod.financialSummary.directCostPerUnit, 0, 'Costo directo en 0');
assert.strictEqual(prod.financialSummary.grossProfitPerUnit, 0, 'Ganancia en 0');
console.log('✅ 6. Retorno a Comercio y borrado de ingredientes validado!');

// E) Normalización métrica homogénea
for (const mode of ['produccion', 'servicio', 'comercio']) {
  prod.businessNature = mode;
  if (mode === 'produccion') evalProduction(prod);
  if (mode === 'servicio') evalService(prod);
  if (mode === 'comercio') evalCommerce(prod);

  assert.ok(typeof prod.financialSummary.directCostPerUnit === 'number', `${mode}: directCostPerUnit es número`);
  assert.ok(typeof prod.financialSummary.salePrice === 'number', `${mode}: salePrice es número`);
  assert.ok(typeof prod.financialSummary.grossProfitPerUnit === 'number', `${mode}: grossProfitPerUnit es número`);
  assert.ok(typeof prod.financialSummary.grossMarginPercentage === 'number', `${mode}: grossMarginPercentage es número`);
  assert.ok(typeof prod.financialSummary.monthlyGrossProfitEstimate === 'number', `${mode}: monthlyGrossProfitEstimate es número`);
}
console.log('✅ 7. Normalización homogénea de métricas financieras validada!');

// 8. Test de Sincronización S6 ↔ S7 con Preservación de Toggles de Financiamiento
console.log('8. Sincronización S6 ↔ S7:');
const prodS6 = {
  productId: 'PROD-PANADERIA',
  productName: 'Pan Integral Artesanal',
  businessNature: 'produccion',
  batchConfig: {
    batchSize: 50,
    batchUnit: 'unidades',
    productionFrequency: 'interdiario', // 12 tandas/mes
    batchesPerMonth: 12
  },
  ingredients: [
    {
      ingredientId: 'ING-HARINA',
      name: 'Harina de Trigo Integral',
      recipeConsumption: { quantityUsed: 5, unit: 'kg' }, // 5kg * 12 = 60 kg/mes
      marketPurchase: { quantityInPackage: 25, packageUnitName: 'saco 25kg', packageCost: 85.0 } // 60/25 = 2.4 => 3 sacos (S/ 255.00)
    },
    {
      ingredientId: 'ING-LEVADURA',
      name: 'Levadura Fresca',
      recipeConsumption: { quantityUsed: 200, unit: 'g' }, // 200g * 12 = 2400 g/mes
      marketPurchase: { quantityInPackage: 500, packageUnitName: 'bloque 500g', packageCost: 12.0 } // 2400/500 = 4.8 => 5 bloques (S/ 60.00)
    }
  ]
};

// Simulador de la función syncWorkingCapitalToInvestmentPlan del store
function simulateSync(existingInvestmentItems, productsList, laborSalary = 1350) {
  const requirements = calc.getMonthlyWorkingCapitalRequirements({
    products: productsList,
    serviceLaborSettings: { desiredMonthlySalary: laborSalary }
  });

  const manualItems = existingInvestmentItems.filter((i) => !i.isAutoDerivedFromS6 && !i.isLaborContribution);
  const prevMap = new Map();
  for (const it of existingInvestmentItems) {
    if (it.isAutoDerivedFromS6 && it.itemId) {
      prevMap.set(it.itemId, it.financedBySeedCapital);
    }
  }

  const updatedRubroB = requirements.map((req) => {
    const prev = prevMap.get(req.itemId);
    const financed = prev !== undefined ? prev : req.financedBySeedCapital;
    return {
      ...req,
      financedBySeedCapital: financed,
      source: financed ? 'capital_semilla' : 'propio'
    };
  });

  const laborItem = {
    itemId: 'LABOR-CONTRIB-SIM',
    category: 'Mano de Obra Propia',
    rubro: 'rubro_c',
    description: 'Mano de obra y dedicación del emprendedor (1 mes de arranque)',
    quantity: 1,
    unitPriceEstimated: laborSalary,
    totalPrice: laborSalary,
    financedBySeedCapital: false,
    source: 'propio',
    isAutoDerivedFromS6: true,
    isLaborContribution: true
  };

  const allItems = [...manualItems, ...updatedRubroB, laborItem];
  const evalPlan = calc.computeSeedCapitalPlan({ items: allItems, ceiling: 3000 });

  return { items: allItems, plan: evalPlan };
}

// Primera sincronización
const manualEquip = [
  { itemId: 'EQ-1', category: 'Maquinaria y Equipo', rubro: 'rubro_a', totalPrice: 1800, financedBySeedCapital: true }
];

const sync1 = simulateSync(manualEquip, [prodS6]);
assert.strictEqual(sync1.items.length, 4, '1 equipo manual + 2 insumos de S6 + 1 mano de obra = 4 ítems');

const harinaItem = sync1.items.find((i) => i.itemId.includes('ING-HARINA'));
assert.strictEqual(harinaItem.quantity, 3, 'Harina: 60kg en sacos de 25kg = 3 sacos');
assert.strictEqual(harinaItem.totalPrice, 255, 'Harina: 3 * 85 = S/ 255');
assert.strictEqual(harinaItem.financedBySeedCapital, true, 'Por defecto Rubro B viene financiado');

// Conmutar decisión de financiamiento: El usuario decide pagar la harina con aporte propio
harinaItem.financedBySeedCapital = false;
harinaItem.source = 'propio';

// Segunda sincronización: Por ejemplo, cambia el costo de la levadura en S6
prodS6.ingredients[1].marketPurchase.packageCost = 15.0; // Levadura sube a 15.00

const sync2 = simulateSync(sync1.items, [prodS6]);
const harinaSync2 = sync2.items.find((i) => i.itemId.includes('ING-HARINA'));
assert.strictEqual(harinaSync2.financedBySeedCapital, false, 'Preferencia del usuario (aporte propio) PRESERVADA');
assert.strictEqual(harinaSync2.source, 'propio', 'Fuente propia preservada tras re-sync');

const levaduraSync2 = sync2.items.find((i) => i.itemId.includes('ING-LEVADURA'));
assert.strictEqual(levaduraSync2.totalPrice, 75, 'Levadura actualizada a 5 * 15 = S/ 75');
assert.strictEqual(levaduraSync2.financedBySeedCapital, true, 'Levadura sigue financiada');

// Verificar que la mano de obra propia no se descuente del subsidio de capital semilla
const laborSync2 = sync2.items.find((i) => i.isLaborContribution);
assert.strictEqual(laborSync2.financedBySeedCapital, false, 'Mano de obra NO financiable por capital semilla');
assert.strictEqual(sync2.plan.allocatedSeedCapital, 1800 + 75, 'Subsidio solo consume equipo (1800) + levadura (75) = 1,875');
assert.strictEqual(sync2.plan.ownContribution, 255 + 1350, 'Aporte propio suma harina (255) + mano de obra (1350) = 1,605');
assert.strictEqual(sync2.plan.totalBusinessInvestment, 1875 + 1605, 'Inversión total suma subsidio + aporte propio = 3,480');
assert.strictEqual(sync2.plan.isBudgetCompliant, true, 'Presupuesto conforme (1875 <= 3000)');

console.log('✅ 8. Sincronización S6 ↔ S7 y preservación de preferencias validada exitosamente!');
console.log('--- TODOS LOS TESTS DE INTEGRACIÓN PASARON EXITOSAMENTE ---');

