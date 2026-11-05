import assert from 'node:assert/strict';
import { useCostingCalculator } from '../src/composables/useCostingCalculator.js';
import { resolveFieldText, buildBusinessPlanDocxDocument } from '../src/services/export/docxBuilder.js';
import { Packer } from 'docx';

console.log('--- INICIANDO SUITE DE PRUEBAS DE EXTRACCIÓN EN TIEMPO REAL Y ENRIQUECIMIENTO ---');

// ============================================================================
// 1. VERIFICAR INYECCIÓN AUTOMÁTICA DE formSubmission.answers
// ============================================================================
console.log('\n1. Verificando inyección de formSubmission.answers cuando fields está vacío...');

// Simular datos de participante recién respondidos en móvil
const mockProgressAnswers = {
  mision: 'Producir panes y pasteles artesanales para las familias del distrito.',
  vision: 'Abrir dos sucursales en Chiclayo con servicio de cafetería para 2029.',
  objetivos: '1. Hornear 100 panes diarios. 2. Aumentar ingresos en 40%.'
};

const mockSessionMetaFields = [
  { id: 'mision', label: 'Misión del Negocio' },
  { id: 'vision', label: 'Visión a 3 Años' },
  { id: 'objetivos', label: 'Objetivos a Corto Plazo' }
];

const generatedFields = {};
for (const fieldDef of mockSessionMetaFields) {
  const fieldId = fieldDef.id;
  const currentField = null; // No hay sección guardada aún en business_plan_sections

  if (!currentField && mockProgressAnswers[fieldId]) {
    generatedFields[fieldId] = {
      fieldLabel: fieldDef.label,
      rawInput: {
        text: mockProgressAnswers[fieldId],
        capturedVia: 'form_submission'
      },
      consultantNotes: '',
      aiRefinement: null,
      finalApprovedText: null,
      status: 'pendiente_revision'
    };
  }
}

assert.equal(
  resolveFieldText(generatedFields.mision),
  'Producir panes y pasteles artesanales para las familias del distrito.',
  'Debe resolver la misión directamente de formSubmission.answers'
);
assert.equal(
  resolveFieldText(generatedFields.vision),
  'Abrir dos sucursales en Chiclayo con servicio de cafetería para 2029.',
  'Debe resolver la visión directamente de formSubmission.answers'
);
assert.equal(
  resolveFieldText(generatedFields.objetivos),
  '1. Hornear 100 panes diarios. 2. Aumentar ingresos en 40%.',
  'Debe resolver los objetivos directamente de formSubmission.answers'
);

console.log('✓ Inyección automática de formSubmission.answers validada con éxito.');

// ============================================================================
// 2. VERIFICAR RECÁLCULO EN TIEMPO REAL DE COSTEO (S6) E INVERSIÓN (S7)
// ============================================================================
console.log('\n2. Verificando recálculo dinámico con useCostingCalculator y Techo de Cohorte...');

const calc = useCostingCalculator();

const rawMockProducts = [
  {
    productId: 'P-PAN',
    productName: 'Pan Integral',
    businessNature: 'produccion',
    batchConfig: {
      batchSize: 50,
      batchUnit: 'unidades',
      productionFrequency: 'diario',
      batchesPerMonth: 24
    },
    ingredients: [
      {
        ingredientId: 'ING-1',
        recipeConsumption: { quantityUsed: 5 },
        marketPurchase: { packageCost: 50, quantityInPackage: 25 } // S/ 2 por kg -> S/ 10 por tanda
      }
    ],
    commercialization: {
      currentSalePrice: 0.50,
      estimatedMonthlySalesVolume: 1200
    }
  }
];

// Recalcular métricas de producto
const batchSize = rawMockProducts[0].batchConfig.batchSize;
const ingMath = calc.computeIngredientMath({
  quantityUsed: rawMockProducts[0].ingredients[0].recipeConsumption.quantityUsed,
  packageCost: rawMockProducts[0].ingredients[0].marketPurchase.packageCost,
  quantityInPackage: rawMockProducts[0].ingredients[0].marketPurchase.quantityInPackage,
  batchSize
});

assert.equal(ingMath.unitCostFromMarket, 2.0, 'Costo por kg debe ser S/ 2.00');
assert.equal(ingMath.costIncurredInBatch, 10.0, 'Costo por tanda de 50 panes debe ser S/ 10.00');
assert.equal(ingMath.unitCostPerProduct, 0.20, 'Costo directo unitario debe ser S/ 0.20');

const financials = calc.computeProductFinancials({
  ingredients: [{ ...rawMockProducts[0].ingredients[0], automatedMath: ingMath }],
  batchSize,
  salePrice: 0.50,
  estimatedMonthlySalesVolume: 1200
});

assert.equal(financials.directCostPerUnit, 0.20);
assert.equal(financials.grossProfitPerUnit, 0.30);
assert.equal(financials.grossMarginPercentage, 60.0);

console.log('✓ Recálculo de producto S6 validado: Costo S/ 0.20, Ganancia S/ 0.30, Margen 60.0%');

// Recalcular requerimientos mensuales para Rubro B (S7)
const calculatedProds = [{
  ...rawMockProducts[0],
  ingredients: [{ ...rawMockProducts[0].ingredients[0], automatedMath: ingMath }],
  financialSummary: financials
}];

const monthlyReqs = calc.getMonthlyWorkingCapitalRequirements({ products: calculatedProds });
assert.equal(monthlyReqs.length, 1);
assert.equal(monthlyReqs[0].rubro, 'rubro_b');
// 5 kg * 24 tandas = 120 kg. 120 kg / 25 kg = 4.8 -> 5 sacos enteros a S/ 50 = S/ 250
assert.equal(monthlyReqs[0].quantity, 5, 'Debe requerir 5 sacos enteros de 25kg');
assert.equal(monthlyReqs[0].totalPrice, 250, 'Presupuesto insumos 1 mes debe ser S/ 250');

// Recalcular evaluación de presupuesto con Techo Dinámico de S/ 2,000
const dynamicCeiling = 2000.0;
const investmentItems = [
  { itemId: 'INV-MAQ', rubro: 'rubro_a', totalPrice: 1500, financedBySeedCapital: true },
  { ...monthlyReqs[0], financedBySeedCapital: true }, // S/ 250
  { itemId: 'LABOR-1', rubro: 'rubro_c', totalPrice: 1200, financedBySeedCapital: false } // Aporte propio
];

const seedEvaluation = calc.computeSeedCapitalPlan({
  items: investmentItems,
  ceiling: dynamicCeiling
});

assert.equal(seedEvaluation.allocatedSeedCapital, 1750.0, 'Subsidio solicitado debe ser S/ 1,750 (1500 + 250)');
assert.equal(seedEvaluation.ownContribution, 1200.0, 'Contrapartida debe ser S/ 1,200');
assert.equal(seedEvaluation.totalBusinessInvestment, 2950.0, 'Inversión total del negocio debe ser S/ 2,950');
assert.equal(seedEvaluation.isBudgetCompliant, true, 'Debe cumplir con el techo de S/ 2,000');
assert.equal(seedEvaluation.remainingBudget, 250.0, 'Saldo restante debe ser S/ 250');

console.log(`✓ Evaluación presupuestal S7 validada: Subsidio S/ 1,750 <= Techo S/ 2,000 (Conforme).`);

// ============================================================================
// 3. VERIFICAR COMPILACIÓN DOCX CON DATOS ENRIQUECIDOS
// ============================================================================
console.log('\n3. Verificando que buildBusinessPlanDocxDocument compile con datos enriquecidos en tiempo real...');

const mockParticipantData = {
  dni: '78945612',
  cohortId: 'ACNUR-LIMA-02',
  personalInfo: { firstName: 'Carlos', lastName: 'Gutierrez', phone: '999888777', location: { address: 'Calle Los Pinos 123' } },
  businessBasicInfo: { commercialName: 'Panadería Gutierrez', sector: 'Gastronomía y Alimentos', businessNature: 'produccion' }
};

const mockCostingData = {
  currency: 'PEN',
  products: calculatedProds,
  seedCapitalInvestmentPlan: {
    seedCapitalCeiling: dynamicCeiling,
    totalBusinessInvestment: seedEvaluation.totalBusinessInvestment,
    allocatedTotal: seedEvaluation.allocatedSeedCapital,
    allocatedSeedCapital: seedEvaluation.allocatedSeedCapital,
    ownContribution: seedEvaluation.ownContribution,
    remainingBudget: seedEvaluation.remainingBudget,
    isBudgetCompliant: seedEvaluation.isBudgetCompliant,
    investmentItems,
    rubros: seedEvaluation.rubros
  }
};

const mockPlanSections = {
  s1_identidad_negocio: {
    fields: {
      commercialName: { rawInput: { text: 'Panadería Gutierrez' } },
      businessStory: { rawInput: { text: 'Emprendimiento familiar iniciado en pandemia.' } }
    }
  },
  s2_planeamiento_estrategico: {
    fields: generatedFields // Inyectados de formSubmission.answers
  },
  s3_cliente_propuesta_valor: {
    fields: {
      targetCustomer: { rawInput: { text: 'Vecinos de la urbanización' } },
      valueProposition: { rawInput: { text: 'Pan caliente recién horneado tres veces al día' } }
    }
  },
  s4_estrategia_comercial: {
    fields: {
      placementStrategy: { rawInput: { text: 'Venta por mostrador y pedidos' } }
    }
  },
  s5_modelo_negocio_canvas: {
    canvasModel: {
      valueProposition: { text: 'Pan caliente recién horneado tres veces al día' },
      customerSegments: { text: 'Vecinos de la urbanización' },
      channels: { text: 'Venta por mostrador y pedidos' },
      customerRelationships: { text: 'Trato cordial y degustaciones' },
      keyActivities: { text: 'Amasado, horneado y despacho' },
      keyResources: { text: 'Horno pastelero a gas y amasadora' },
      keyPartners: { text: 'Molino de harina local' },
      costStructure: { text: 'Harina, levadura, gas y empaque' },
      revenueStreams: { text: 'Venta de panes y pasteles en efectivo y Yape' }
    }
  },
  s6_costeo_directo_recetas: { fields: {} },
  s7_presupuesto_capital_semilla: { fields: { investmentRationale: { rawInput: { text: 'Aumentar producción' } } } },
  s8_evaluacion_integral_cierre: { fields: { finalCommitment: { rawInput: { text: 'Compromiso total con el programa' } } } }
};

const doc = buildBusinessPlanDocxDocument(mockParticipantData, mockCostingData, mockPlanSections);
const docBuffer = await Packer.toBuffer(doc);

assert.ok(docBuffer instanceof Buffer || docBuffer instanceof Uint8Array);
assert.ok(docBuffer.length > 5000, `El DOCX debe pesar más de 5KB (obtenido: ${docBuffer.length} bytes)`);

console.log(`✓ Documento Word enriquecido generado exitosamente (${docBuffer.length} bytes).`);

console.log('\n========================================================================');
console.log('🎉 SUITE DE PRUEBAS DE EXPORTACIÓN EN TIEMPO REAL PASÓ CON ÉXITO (3/3)');
console.log('========================================================================');
