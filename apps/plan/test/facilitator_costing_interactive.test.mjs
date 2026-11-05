import assert from 'assert';
import { useCostingCalculator } from '../src/composables/useCostingCalculator.js';

console.log('--- TEST: Facilitator Costing Interactive Logic & Math Parity ---');

const calc = useCostingCalculator();

// ============================================================================
// 1. Simulación de Estado de Costeo del Facilitador (Producción: "La Casera vs. El Plato")
// ============================================================================
console.log('\n1. Probando interacción del facilitador en Producción ("La Casera vs. El Plato"):');

const mockCostingData = {
  activeProductIndex: 0,
  products: [
    {
      productId: 'PROD-001',
      productName: 'Torta de Chocolate',
      businessNature: 'produccion',
      batchConfig: {
        batchSize: 12,
        batchUnit: 'porciones',
        productionFrequency: 'semanal',
        batchesPerMonth: 4
      },
      ingredients: [],
      commercialization: {
        currentSalePrice: 8.50,
        estimatedMonthlySalesVolume: 48
      },
      financialSummary: {}
    }
  ]
};

// Función de recálculo idéntica a la del facilitator store
function recomputeFacilitatorProduct(prodIndex, costingState) {
  const prod = costingState.products[prodIndex];
  if (!prod) return;

  const nature = prod.businessNature || 'produccion';
  const batchSize = Math.max(1, Number(prod.batchConfig?.batchSize) || 1);
  const salePrice = Number(prod.commercialization?.currentSalePrice) || 0;
  const monthlyVol = Number(prod.commercialization?.estimatedMonthlySalesVolume) || 0;

  if (nature === 'produccion') {
    const ings = (prod.ingredients || []).map((ing) => {
      const math = calc.computeIngredientMath({
        quantityUsed: ing.recipeConsumption?.quantityUsed,
        packageCost: ing.marketPurchase?.packageCost,
        quantityInPackage: ing.marketPurchase?.quantityInPackage,
        batchSize,
        recipeUnit: ing.recipeConsumption?.unit,
        packageUnit: ing.marketPurchase?.packageUnit || ing.recipeConsumption?.unit
      });
      return { ...ing, automatedMath: math };
    });
    prod.ingredients = ings;
    prod.financialSummary = calc.computeProductFinancials({
      ingredients: ings,
      batchSize,
      salePrice,
      estimatedMonthlySalesVolume: monthlyVol
    });
  } else if (nature === 'servicio') {
    const sConf = prod.serviceConfig || {};
    const labor = costingState.serviceLaborSettings || { desiredMonthlySalary: 1200, daysWorkedPerMonth: 25, hoursWorkedPerDay: 8, costPerMinute: 0.10 };
    const costPerMin = labor.costPerMinute || calc.calculateLaborCostPerMinute(labor);
    prod.financialSummary = calc.computeServiceFinancials({
      durationMinutes: sConf.durationMinutes || 30,
      costPerMinute: costPerMin,
      supplies: sConf.supplies || [],
      salePrice,
      estimatedMonthlySalesVolume: monthlyVol
    });
    prod.serviceConfig = { ...sConf, costPerMinute: costPerMin };
  } else {
    // comercio
    const cConf = prod.commerceConfig || {};
    prod.financialSummary = calc.computeCommerceFinancials({
      packagePurchasePrice: cConf.packagePurchasePrice || 0,
      unitsPerPackage: cConf.unitsPerPackage || 1,
      freightExpense: cConf.freightExpense || 0,
      totalItemsInTrip: cConf.totalItemsInTrip || 1,
      packagingCostPerUnit: cConf.packagingCostPerUnit || 0,
      salePrice,
      estimatedMonthlySalesVolume: monthlyVol
    });
  }
}

// 1.1 Agregar Insumo 1: Harina (Saco 50 kg @ S/ 140, usa 2 kg en la tanda de 12 porciones)
console.log('  1.1 Agregando insumo: Harina Sin Preparar...');
const ing1 = {
  ingredientId: 'ING-001',
  name: 'Harina Sin Preparar',
  recipeConsumption: { quantityUsed: 2, unit: 'kg' },
  marketPurchase: {
    packageUnitName: 'Saco 50 kg',
    packageUnit: 'kg',
    quantityInPackage: 50,
    packageCost: 140
  }
};
mockCostingData.products[0].ingredients.push(ing1);
recomputeFacilitatorProduct(0, mockCostingData);

const ing1Math = mockCostingData.products[0].ingredients[0].automatedMath;
assert.strictEqual(ing1Math.unitCostFromMarket, 2.8, 'Costo unitario por kg en mercado debe ser 140/50 = S/ 2.80');
assert.strictEqual(ing1Math.costIncurredInBatch, 5.6, 'Costo en tanda debe ser 2 * 2.80 = S/ 5.60');
assert.strictEqual(ing1Math.unitCostPerProduct, 0.467, 'Costo por porción (12) debe ser 5.60/12 = S/ 0.467');
assert.strictEqual(ing1Math.leftoverQuantityInStock, 48, 'Remanente en stock debe ser 48 kg');
console.log('  ✅ Insumo 1 calculado y verificado correctamente.');

// 1.2 Agregar Insumo 2: Huevos (Caja 30 unidades @ S/ 18, usa 6 unidades)
console.log('  1.2 Agregando insumo: Huevos frescos...');
const ing2 = {
  ingredientId: 'ING-002',
  name: 'Huevos frescos',
  recipeConsumption: { quantityUsed: 6, unit: 'unidades' },
  marketPurchase: {
    packageUnitName: 'Plancha 30 u',
    packageUnit: 'unidades',
    quantityInPackage: 30,
    packageCost: 18
  }
};
mockCostingData.products[0].ingredients.push(ing2);
recomputeFacilitatorProduct(0, mockCostingData);

const ing2Math = mockCostingData.products[0].ingredients[1].automatedMath;
assert.strictEqual(ing2Math.unitCostFromMarket, 0.6, 'Costo unitario por huevo debe ser 18/30 = S/ 0.60');
assert.strictEqual(ing2Math.costIncurredInBatch, 3.6, 'Costo en tanda debe ser 6 * 0.60 = S/ 3.60');
assert.strictEqual(ing2Math.unitCostPerProduct, 0.3, 'Costo por porción (12) debe ser 3.60/12 = S/ 0.30');

// Verificar resumen financiero del lote
const finProd1 = mockCostingData.products[0].financialSummary;
assert.strictEqual(finProd1.totalBatchDirectCost, 9.2, 'Costo directo de la tanda debe ser 5.60 + 3.60 = S/ 9.20');
assert.strictEqual(finProd1.directCostPerUnit, 0.767, 'Costo directo unitario debe ser 9.20 / 12 = 0.767');
assert.strictEqual(finProd1.grossProfitPerUnit, 7.733, 'Ganancia bruta unitaria: 8.50 - 0.767 = 7.733');
assert.strictEqual(finProd1.grossMarginPercentage, 90.98, 'Margen bruto %: (7.733 / 8.50) * 100 = 90.98%');
console.log('  ✅ Totales financieros de tanda y márgenes validados.');

// 1.3 Edición interactiva del facilitador: Modificar tamaño de tanda a 24 porciones y precio a S/ 9.00
console.log('  1.3 Facilitador ajusta tamaño de tanda a 24 porciones y precio a S/ 9.00...');
mockCostingData.products[0].batchConfig.batchSize = 24;
mockCostingData.products[0].commercialization.currentSalePrice = 9.00;
mockCostingData.products[0].commercialization.estimatedMonthlySalesVolume = 96;
recomputeFacilitatorProduct(0, mockCostingData);

const finUpdated = mockCostingData.products[0].financialSummary;
assert.strictEqual(finUpdated.directCostPerUnit, 0.383, 'Nuevo costo directo unitario (9.20 / 24) = 0.383');
assert.strictEqual(finUpdated.grossProfitPerUnit, 8.617, 'Nueva ganancia unitaria: 9.00 - 0.383 = 8.617');
assert.strictEqual(finUpdated.monthlyGrossProfitEstimate, 827.23, 'Ganancia mensual est.: 96 * 8.617 = 827.23');
console.log('  ✅ Recálculo tras cambio de batchSize y salePrice verificado.');

// ============================================================================
// 2. Simulación de Interacción del Facilitador en Servicios ("El Minutero")
// ============================================================================
console.log('\n2. Probando interacción del facilitador en Servicios ("El Minutero"):');

mockCostingData.serviceLaborSettings = {
  desiredMonthlySalary: 1500,
  daysWorkedPerMonth: 20,
  hoursWorkedPerDay: 6
};

const laborCostPerMin = calc.calculateLaborCostPerMinute(mockCostingData.serviceLaborSettings);
// 1500 / (20 * 6 * 60) = 1500 / 7200 = 0.208
assert.strictEqual(laborCostPerMin, 0.208, 'Costo por minuto de mano de obra debe ser 0.208');

const serviceProduct = {
  productId: 'PROD-002',
  productName: 'Corte y Cepillado de Cabello',
  businessNature: 'servicio',
  serviceConfig: {
    durationMinutes: 40,
    costPerMinute: laborCostPerMin,
    supplies: [
      {
        supplyId: 'SUP-01',
        name: 'Shampoo Profesional (Frasco)',
        supplyType: 'bottle_yield',
        packageCost: 45,
        clientsYield: 15,
        unitCost: 3.0 // 45 / 15
      },
      {
        supplyId: 'SUP-02',
        name: 'Toalla Descartable',
        supplyType: 'single_use',
        packageCost: 25,
        unitsInPackage: 50,
        unitCost: 0.5 // 25 / 50
      }
    ]
  },
  commercialization: {
    currentSalePrice: 35.0,
    estimatedMonthlySalesVolume: 60
  },
  financialSummary: {}
};

mockCostingData.products.push(serviceProduct);
recomputeFacilitatorProduct(1, mockCostingData);

const servFin = mockCostingData.products[1].financialSummary;
// Tiempo: 40 * 0.208 = 8.32
// Insumos: 3.0 + 0.5 = 3.50
// Costo Directo: 8.32 + 3.50 = 11.82
// Ganancia Unitaria: 35.0 - 11.82 = 23.18
// Margen: (23.18 / 35.0) * 100 = 66.2%
// Ganancia Mensual: 60 * 23.18 = 1390.80
assert.strictEqual(servFin.timeCost, 8.32, 'Costo de tiempo debe ser 8.32');
assert.strictEqual(servFin.suppliesCost, 3.50, 'Costo de insumos debe ser 3.50');
assert.strictEqual(servFin.directCostPerUnit, 11.82, 'Costo unitario directo debe ser 11.82');
assert.strictEqual(servFin.grossProfitPerUnit, 23.18, 'Ganancia bruta unitaria debe ser 23.18');
assert.strictEqual(servFin.grossMarginPercentage, 66.23, 'Margen bruto debe ser 66.23%');
assert.strictEqual(servFin.monthlyGrossProfitEstimate, 1390.80, 'Ganancia bruta mensual debe ser 1390.80');
console.log('  ✅ Servicios ("El Minutero") verificado con éxito.');

// ============================================================================
// 3. Simulación de Interacción del Facilitador en Comercio ("El Mayorista")
// ============================================================================
console.log('\n3. Probando interacción del facilitador en Comercio ("El Mayorista"):');

const commerceProduct = {
  productId: 'PROD-003',
  productName: 'Polos de Algodón Reactivo',
  businessNature: 'comercio',
  commerceConfig: {
    purchasePresentation: 'Docena',
    unitsPerPackage: 12,
    packagePurchasePrice: 180, // S/ 15 por polo
    freightExpense: 20,
    totalItemsInTrip: 50,      // S/ 0.40 flete unitario
    packagingCostPerUnit: 0.50 // bolsa y etiqueta
  },
  commercialization: {
    currentSalePrice: 30.0,
    estimatedMonthlySalesVolume: 80
  },
  financialSummary: {}
};

mockCostingData.products.push(commerceProduct);
recomputeFacilitatorProduct(2, mockCostingData);

const commFin = mockCostingData.products[2].financialSummary;
// Base: 180 / 12 = 15.00
// Flete: 20 / 50 = 0.40
// Directo: 15.00 + 0.40 + 0.50 = 15.90
// Ganancia: 30.00 - 15.90 = 14.10
// Margen: (14.10 / 30.00) * 100 = 47.0%
// Ganancia Mensual: 80 * 14.10 = 1128.00
assert.strictEqual(commFin.directCostPerUnit, 15.9, 'Costo directo comercial unitario debe ser 15.90');
assert.strictEqual(commFin.grossProfitPerUnit, 14.1, 'Ganancia bruta unitaria debe ser 14.10');
assert.strictEqual(commFin.grossMarginPercentage, 47, 'Margen bruto % debe ser 47.0%');
assert.strictEqual(commFin.monthlyGrossProfitEstimate, 1128, 'Ganancia mensual est. debe ser 1128.00');
console.log('  ✅ Comercio ("El Mayorista") verificado con éxito.');

console.log('\n============================================================');
console.log('🎉 TODOS LOS TESTS DE COSTEO INTERACTIVO DEL FACILITADOR PASARON CON ÉXITO!');
console.log('============================================================');
