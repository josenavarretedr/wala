import assert from 'node:assert/strict';
import { useCostingCalculator } from '../src/composables/useCostingCalculator.js';
import { buildBusinessPlanDocxDocument } from '../src/services/export/docxBuilder.js';
import { Packer } from 'docx';
import JSZip from 'jszip';

console.log('--- INICIANDO SUITE DE PRUEBAS DE COSTEO POLIMÓRFICO Y MEMORIA DE INSUMOS ---');

const calc = useCostingCalculator();

// ============================================================================
// 1. CONFIGURACIÓN DE PRODUCTOS EN LAS 3 METODOLOGÍAS
// ============================================================================
console.log('\n1. Configurando productos de prueba: Producción, Servicios y Comercio...');

// A. Producción ("La Casera vs. El Plato"): Tanda de 20 porciones, semanal (4 tandas/mes)
const prodProduccion = {
  productId: 'PROD-PLATO-01',
  productName: 'Salchipapa Mixta Especial',
  businessNature: 'produccion',
  batchConfig: {
    batchSize: 20,
    batchUnit: 'porciones',
    productionFrequency: 'semanal',
    batchesPerMonth: 4
  },
  ingredients: [
    {
      ingredientId: 'ING-CARNE',
      name: 'Carne Molida',
      recipeConsumption: { quantityUsed: 2, unit: 'kg' },
      marketPurchase: { packageCost: 15, quantityInPackage: 1, packageUnitName: 'bolsa de 1 kg' }
      // 2 kg/tanda * 4 tandas = 8 kg/mes -> 8 bolsas a S/ 15 = S/ 120
    },
    {
      ingredientId: 'ING-TOMATE',
      name: 'Tomate',
      recipeConsumption: { quantityUsed: 1, unit: 'kg' },
      marketPurchase: { packageCost: 8, quantityInPackage: 1, packageUnitName: 'bolsa de 1 kg' }
      // 1 kg/tanda * 4 tandas = 4 kg/mes -> 4 bolsas a S/ 8 = S/ 32
    },
    {
      ingredientId: 'ING-HOTDOG',
      name: 'Hotdog',
      recipeConsumption: { quantityUsed: 0.5, unit: 'paquete' },
      marketPurchase: { packageCost: 12, quantityInPackage: 1, packageUnitName: 'paquete' }
      // 0.5 paq/tanda * 4 tandas = 2 paq/mes -> 2 paquetes a S/ 12 = S/ 24
    },
    {
      ingredientId: 'ING-AZUCAR',
      name: 'Azúcar',
      recipeConsumption: { quantityUsed: 1.5, unit: 'kg' },
      marketPurchase: { packageCost: 5, quantityInPackage: 1, packageUnitName: 'bolsa de 1 kg' }
      // 1.5 kg/tanda * 4 tandas = 6 kg/mes -> 6 bolsas a S/ 5 = S/ 30
    }
  ],
  commercialization: {
    currentSalePrice: 12.00,
    estimatedMonthlySalesVolume: 80
  }
};

// Enriquecer matemáticas de ingredientes de producción
const batchSize = prodProduccion.batchConfig.batchSize;
prodProduccion.ingredients = prodProduccion.ingredients.map((ing) => {
  const math = calc.computeIngredientMath({
    quantityUsed: ing.recipeConsumption.quantityUsed,
    packageCost: ing.marketPurchase.packageCost,
    quantityInPackage: ing.marketPurchase.quantityInPackage,
    batchSize
  });
  return { ...ing, automatedMath: math };
});
prodProduccion.financialSummary = calc.computeProductFinancials({
  ingredients: prodProduccion.ingredients,
  batchSize,
  salePrice: prodProduccion.commercialization.currentSalePrice,
  estimatedMonthlySalesVolume: 80
});

// B. Servicios ("El Minutero"): Estilismo y Belleza
const prodServicio = {
  productId: 'SERV-MINUTERO-01',
  productName: 'Corte y Tratamiento Capilar',
  businessNature: 'servicio',
  serviceConfig: {
    durationMinutes: 45,
    costPerMinute: 0.10, // S/ 4.50 mano de obra
    supplies: [
      {
        id: 'SUP-TOALLA',
        name: 'Toalla Descartable',
        supplyType: 'single_use',
        packageCost: 20,
        unitsInPackage: 100, // S/ 0.20 por servicio
        unitCost: 0.20
      },
      {
        id: 'SUP-TINTE',
        name: 'Frasco de Tratamiento Capilar 500ml',
        supplyType: 'bottle_yield',
        packageCost: 60,
        clientsYield: 20, // S/ 3.00 por servicio
        unitCost: 3.00
      }
    ]
  },
  commercialization: {
    currentSalePrice: 25.00,
    estimatedMonthlySalesVolume: 40 // 40 clientes al mes
  }
};
prodServicio.financialSummary = calc.computeServiceFinancials({
  durationMinutes: prodServicio.serviceConfig.durationMinutes,
  costPerMinute: prodServicio.serviceConfig.costPerMinute,
  supplies: prodServicio.serviceConfig.supplies,
  salePrice: prodServicio.commercialization.currentSalePrice,
  estimatedMonthlySalesVolume: 40
});

// C. Comercio ("El Mayorista"): Ropa y Confecciones
const prodComercio = {
  productId: 'COMM-MAYORISTA-01',
  productName: 'Polo Pima Juvenil',
  businessNature: 'comercio',
  commerceConfig: {
    purchasePresentation: 'Docena',
    unitsPerPackage: 12,
    packagePurchasePrice: 120, // S/ 10 base
    freightExpense: 24,
    totalItemsInTrip: 24, // S/ 1 flete
    packagingCostPerUnit: 0.50 // S/ 0.50 bolsa
  },
  commercialization: {
    currentSalePrice: 20.00,
    estimatedMonthlySalesVolume: 60 // 60 polos al mes
  }
};
prodComercio.financialSummary = calc.computeCommerceFinancials({
  packagePurchasePrice: prodComercio.commerceConfig.packagePurchasePrice,
  unitsPerPackage: prodComercio.commerceConfig.unitsPerPackage,
  freightExpense: prodComercio.commerceConfig.freightExpense,
  totalItemsInTrip: prodComercio.commerceConfig.totalItemsInTrip,
  packagingCostPerUnit: prodComercio.commerceConfig.packagingCostPerUnit,
  salePrice: prodComercio.commercialization.currentSalePrice,
  estimatedMonthlySalesVolume: 60
});

const sampleProducts = [prodProduccion, prodServicio, prodComercio];
console.log('✓ Productos de prueba configurados exitosamente en las 3 metodologías.');

// ============================================================================
// 2. VERIFICACIÓN DE computeMonthlyProductionAndSalesProjection
// ============================================================================
console.log('\n2. Verificando computeMonthlyProductionAndSalesProjection...');

const projections = calc.computeMonthlyProductionAndSalesProjection(sampleProducts);

assert.equal(projections.products.length, 3, 'Debe haber 3 proyecciones de producto');

// Producción: 20 porciones * 4 tandas = 80 porciones al mes. Venta: 80 * S/ 12 = S/ 960
const projProd = projections.products.find((p) => p.businessNature === 'produccion');
assert.equal(projProd.monthlyVolume, 80);
assert.equal(projProd.batchesPerMonth, 4);
assert.equal(projProd.monthlySalesEstimate, 960);
assert.ok(projProd.capacityDescription.includes('20 porciones/tanda × 4 tandas/mes'));

// Servicios: 40 clientes al mes * S/ 25 = S/ 1,000
const projServ = projections.products.find((p) => p.businessNature === 'servicio');
assert.equal(projServ.monthlyVolume, 40);
assert.equal(projServ.monthlySalesEstimate, 1000);

// Comercio: 60 unidades al mes * S/ 20 = S/ 1,200
const projComm = projections.products.find((p) => p.businessNature === 'comercio');
assert.equal(projComm.monthlyVolume, 60);
assert.equal(projComm.monthlySalesEstimate, 1200);

// Total mensual: S/ 960 + S/ 1,000 + S/ 1,200 = S/ 3,160
assert.equal(projections.totalMonthlySalesEstimate, 3160.0);
console.log(`✓ Proyección mensual validada: Facturación mensual total estimada = S/ ${projections.totalMonthlySalesEstimate}`);

// ============================================================================
// 3. VERIFICACIÓN DE getWorkingCapitalBreakdownMemory Y getMonthlyWorkingCapitalRequirements
// ============================================================================
console.log('\n3. Verificando getWorkingCapitalBreakdownMemory...');

const memoryItems = calc.getWorkingCapitalBreakdownMemory({ products: sampleProducts });

// Insumos de Producción:
const carneItem = memoryItems.find((i) => i.ingredientName === 'Carne Molida');
assert.ok(carneItem, 'Debe contener Carne Molida');
assert.equal(carneItem.quantity, 8, 'Debe requerir 8 bolsas de carne');
assert.equal(carneItem.unitPriceEstimated, 15);
assert.equal(carneItem.totalPrice, 120);
assert.ok(carneItem.description.includes('8 bolsa de 1 kg para 4 tandas/mes'));
assert.ok(carneItem.consumptionText.includes('2 kg/tanda × 4 tandas = 8 kg/mes'));

const tomateItem = memoryItems.find((i) => i.ingredientName === 'Tomate');
assert.ok(tomateItem, 'Debe contener Tomate');
assert.equal(tomateItem.quantity, 4, 'Debe requerir 4 bolsas de tomate');
assert.equal(tomateItem.unitPriceEstimated, 8);
assert.equal(tomateItem.totalPrice, 32);

const hotdogItem = memoryItems.find((i) => i.ingredientName === 'Hotdog');
assert.ok(hotdogItem, 'Debe contener Hotdog');
assert.equal(hotdogItem.quantity, 2, 'Debe requerir 2 paquetes de hotdog');
assert.equal(hotdogItem.totalPrice, 24);

const azucarItem = memoryItems.find((i) => i.ingredientName === 'Azúcar');
assert.ok(azucarItem, 'Debe contener Azúcar');
assert.equal(azucarItem.quantity, 6, 'Debe requerir 6 bolsas de azúcar');
assert.equal(azucarItem.totalPrice, 30);

// Suministros de Servicios:
const tinteItem = memoryItems.find((i) => i.supplyName?.includes('Tratamiento Capilar'));
assert.ok(tinteItem, 'Debe contener Frasco de Tratamiento Capilar');
// 40 clientes / 20 rendimiento = 2 frascos a S/ 60 = S/ 120
assert.equal(tinteItem.quantity, 2, 'Debe requerir 2 frascos');
assert.equal(tinteItem.totalPrice, 120);

// Mercadería de Comercio:
const poloItem = memoryItems.find((i) => i.productName?.includes('Polo Pima'));
assert.ok(poloItem, 'Debe contener Polos');
// 60 unidades / 12 un./docena = 5 docenas
assert.equal(poloItem.quantity, 5, 'Debe requerir 5 docenas');

console.log('✓ Memoria de cálculo de insumos (Rubro B) validada con total exactitud matemática.');

// ============================================================================
// 4. VERIFICACIÓN DE COMPILACIÓN DOCX Y CONTENIDO XML
// ============================================================================
console.log('\n4. Verificando compilación DOCX con las tablas 6.1, 6.2, 7.2, 7.3 y 7.4...');

const mockParticipant = {
  dni: '12345678',
  cohortId: 'COHORTE-TEST-01',
  personalInfo: { firstName: 'Juan', lastName: 'Pérez' },
  businessBasicInfo: { commercialName: 'Emprendimiento Integral' }
};

const workingCapItems = memoryItems.map((m) => ({
  ...m,
  financedBySeedCapital: true
}));

const computedSeed = calc.computeSeedCapitalPlan({
  items: workingCapItems,
  ceiling: 3000
});

const mockCostingData = {
  currency: 'PEN',
  products: sampleProducts,
  monthlyProductionAndSales: projections,
  workingCapitalMemory: memoryItems,
  seedCapitalInvestmentPlan: {
    seedCapitalCeiling: 3000,
    totalBusinessInvestment: computedSeed.totalBusinessInvestment,
    allocatedTotal: computedSeed.allocatedSeedCapital,
    allocatedSeedCapital: computedSeed.allocatedSeedCapital,
    ownContribution: computedSeed.ownContribution,
    remainingBudget: computedSeed.remainingBudget,
    isBudgetCompliant: computedSeed.isBudgetCompliant,
    investmentItems: workingCapItems,
    rubros: computedSeed.rubros
  }
};

const mockPlanSections = {
  s1_identidad_negocio: { fields: { commercialName: { rawInput: { text: 'Emprendimiento Integral' } } } },
  s2_planeamiento_estrategico: { fields: {} },
  s3_cliente_propuesta_valor: { fields: {} },
  s4_estrategia_comercial: { fields: {} },
  s5_modelo_negocio_canvas: { canvasModel: {} },
  s6_costeo_directo_recetas: { fields: {} },
  s7_presupuesto_capital_semilla: { fields: { investmentRationale: { rawInput: { text: 'Inversión inicial' } } } },
  s8_evaluacion_integral_cierre: { fields: {} }
};

const doc = buildBusinessPlanDocxDocument(mockParticipant, mockCostingData, mockPlanSections);
const docBuffer = await Packer.toBuffer(doc);

assert.ok(docBuffer.length > 5000, 'El DOCX debe generarse con tamaño sustancial');

// Inspeccionar el contenido del XML empaquetado dentro del DOCX (vía JSZip)
const zip = await JSZip.loadAsync(docBuffer);
const documentXml = await zip.file('word/document.xml')?.async('string');

assert.ok(documentXml, 'El archivo word/document.xml debe existir en el paquete DOCX');

// Validar presencia de títulos y contenidos clave
assert.ok(documentXml.includes('6. Análisis Financiero y Ficha de Costeo Directo'), 'Debe contener Sección 6');
assert.ok(documentXml.includes('6.1. Resumen Consolidado de Márgenes'), 'Debe contener Subsección 6.1');
assert.ok(documentXml.includes('6.2. Fichas Técnicas de Costeo Directo'), 'Debe contener Subsección 6.2');
assert.ok(documentXml.includes('La Casera vs. El Plato'), 'Debe contener metodología La Casera vs. El Plato');
assert.ok(documentXml.includes('El Minutero'), 'Debe contener metodología El Minutero');
assert.ok(documentXml.includes('El Mayorista'), 'Debe contener metodología El Mayorista');

assert.ok(documentXml.includes('7. Plan de Producción, Inversión y Capital Semilla'), 'Debe contener Sección 7');
assert.ok(documentXml.includes('7.2. Capacidad Operativa y Ventas Mensuales Estimadas'), 'Debe contener Subsección 7.2');
assert.ok(documentXml.includes('7.3. Memoria de Cálculo del Requerimiento Mensual de Insumos'), 'Debe contener Subsección 7.3');
assert.ok(documentXml.includes('7.4. Presupuesto Detallado por Rubros Oficiales'), 'Debe contener Subsección 7.4');

// Validar que los insumos y descripciones requeridas por el usuario están presentes en el documento XML
assert.ok(documentXml.includes('Carne Molida'), 'Debe contener Carne Molida');
assert.ok(documentXml.includes('Tomate'), 'Debe contener Tomate');
assert.ok(documentXml.includes('Hotdog'), 'Debe contener Hotdog');
assert.ok(documentXml.includes('Azúcar'), 'Debe contener Azúcar');

console.log(`✓ Archivo DOCX compilado exitosamente (${docBuffer.length} bytes).`);
console.log('✓ Estructura XML interna validada con todas las secciones, metodologías e insumos requeridos.');

console.log('\n========================================================================');
console.log('🎉 TODAS LAS PRUEBAS DE COSTEO POLIMÓRFICO Y MEMORIA DE INSUMOS PASARON (4/4)');
console.log('========================================================================\n');
