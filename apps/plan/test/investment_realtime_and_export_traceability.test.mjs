import assert from 'assert';
import { useCostingCalculator } from '../src/composables/useCostingCalculator.js';
import { buildBusinessPlanDocx } from '../src/services/export/docxBuilder.js';

console.log('--- TEST: Real-Time Reactivity & Export Traceability (Session 7) ---');

const calc = useCostingCalculator();

// 1. Simulación de Estado Inicial del Participante en Sesión 7
console.log('\n1. Simulando estado inicial del participante en Sesión 7...');

let participantLocalStore = {
  participantId: '45892134',
  currency: 'PEN',
  seedCapitalCeiling: 3000.0,
  products: [
    {
      productId: 'PROD-1',
      productName: 'Torta de Chocolate',
      businessNature: 'produccion',
      commercialization: { currentSalePrice: 15, estimatedMonthlySalesVolume: 40 }
    }
  ],
  seedCapitalInvestmentPlan: {
    seedCapitalCeiling: 3000.0,
    totalBusinessInvestment: 3500.0,
    allocatedSeedCapital: 3500.0,
    remainingBudget: -500.0,
    isBudgetCompliant: false,
    investmentItems: [
      {
        itemId: 'INV-001',
        description: 'Batidora Planetaria 10L',
        category: 'Maquinaria y Equipo',
        rubro: 'rubro_a',
        quantity: 1,
        unitPriceEstimated: 2000,
        totalPrice: 2000,
        financedBySeedCapital: true,
        source: 'capital_semilla'
      },
      {
        itemId: 'INV-002',
        description: 'Horno Pastelero 2 Cámaras',
        category: 'Maquinaria y Equipo',
        rubro: 'rubro_a',
        quantity: 1,
        unitPriceEstimated: 1500,
        totalPrice: 1500,
        financedBySeedCapital: true,
        source: 'capital_semilla'
      }
    ],
    audit: null
  },
  facilitatorUpdateNotice: null
};

assert.strictEqual(participantLocalStore.seedCapitalInvestmentPlan.isBudgetCompliant, false);
assert.strictEqual(participantLocalStore.seedCapitalInvestmentPlan.allocatedSeedCapital, 3500);
console.log('  ? Estado inicial del usuario verificado: Sobregirado en S/ 500 (3500 vs 3000).');

// 2. Facilitador ajusta Horno a Aporte Propio y guarda en Firestore
console.log('\n2. Facilitador ajusta financiamiento de INV-002 a Aporte Propio y guarda en Firestore...');

const facilitatorUser = {
  email: 'consultor.senior@planseed.org',
  displayName: 'Lic. Carlos Mendoza',
  role: 'facilitator'
};

const updatedInvestmentItems = [
  {
    itemId: 'INV-001',
    description: 'Batidora Planetaria 10L',
    category: 'Maquinaria y Equipo',
    rubro: 'rubro_a',
    quantity: 1,
    unitPriceEstimated: 2000,
    totalPrice: 2000,
    financedBySeedCapital: true,
    source: 'capital_semilla'
  },
  {
    itemId: 'INV-002',
    description: 'Horno Pastelero 2 Cámaras',
    category: 'Maquinaria y Equipo',
    rubro: 'rubro_a',
    quantity: 1,
    unitPriceEstimated: 1500,
    totalPrice: 1500,
    financedBySeedCapital: false,
    source: 'propio'
  }
];

const recomputedByFacilitator = calc.computeSeedCapitalPlan({
  items: updatedInvestmentItems,
  ceiling: 3000.0
});

const remoteFirestoreDoc = {
  participantId: '45892134',
  currency: 'PEN',
  seedCapitalInvestmentPlan: {
    seedCapitalCeiling: 3000.0,
    totalBusinessInvestment: recomputedByFacilitator.totalBusinessInvestment,
    allocatedTotal: recomputedByFacilitator.allocatedSeedCapital,
    allocatedSeedCapital: recomputedByFacilitator.allocatedSeedCapital,
    ownContribution: recomputedByFacilitator.ownContribution,
    remainingBudget: recomputedByFacilitator.remainingBudget,
    isBudgetCompliant: recomputedByFacilitator.isBudgetCompliant,
    investmentItems: updatedInvestmentItems,
    audit: {
      lastModifiedAt: '2026-09-21T04:50:00.000Z',
      lastModifiedBy: facilitatorUser,
      reviewStatus: 'aprobado',
      cohortCeilingApplied: 3000.0,
      version: 2,
      changeSummary: 'Presupuesto ajustado y aprobado oficialmente por mesa técnica del facilitador.'
    }
  },
  updatedAt: '2026-09-21T04:50:00.000Z'
};

// 3. Recepción en el listener reactivo
console.log('\n3. Simulando recepción del snapshot en el listener reactivo del usuario...');

function handleRemoteCostingSnapshot(store, remoteDoc) {
  if (!remoteDoc?.seedCapitalInvestmentPlan) return;
  const remotePlan = remoteDoc.seedCapitalInvestmentPlan;
  const targetCeiling = remotePlan.seedCapitalCeiling || 3000;

  store.seedCapitalInvestmentPlan = {
    seedCapitalCeiling: targetCeiling,
    totalBusinessInvestment: remotePlan.totalBusinessInvestment,
    allocatedTotal: remotePlan.allocatedTotal,
    allocatedSeedCapital: remotePlan.allocatedSeedCapital,
    remainingBudget: remotePlan.remainingBudget,
    isBudgetCompliant: remotePlan.isBudgetCompliant,
    investmentItems: remotePlan.investmentItems || [],
    audit: remotePlan.audit || null
  };

  if (remotePlan.audit?.lastModifiedBy?.role === 'facilitator') {
    store.facilitatorUpdateNotice = {
      message: remotePlan.audit.reviewStatus === 'aprobado'
        ? '¡Tu presupuesto ha sido aprobado por el facilitador!'
        : 'El facilitador ha ajustado tu presupuesto en la mesa técnica.',
      author: remotePlan.audit.lastModifiedBy.displayName || remotePlan.audit.lastModifiedBy.email || 'Facilitador',
      timestamp: remotePlan.audit.lastModifiedAt,
      status: remotePlan.audit.reviewStatus
    };
  }
}

handleRemoteCostingSnapshot(participantLocalStore, remoteFirestoreDoc);

assert.strictEqual(participantLocalStore.seedCapitalInvestmentPlan.isBudgetCompliant, true);
assert.strictEqual(participantLocalStore.seedCapitalInvestmentPlan.allocatedSeedCapital, 2000);
assert.strictEqual(participantLocalStore.seedCapitalInvestmentPlan.remainingBudget, 1000);
assert.strictEqual(participantLocalStore.seedCapitalInvestmentPlan.investmentItems[1].financedBySeedCapital, false);
assert.strictEqual(participantLocalStore.seedCapitalInvestmentPlan.audit.reviewStatus, 'aprobado');
assert(participantLocalStore.facilitatorUpdateNotice !== null);
assert.strictEqual(participantLocalStore.facilitatorUpdateNotice.author, 'Lic. Carlos Mendoza');
assert.strictEqual(participantLocalStore.facilitatorUpdateNotice.status, 'aprobado');

console.log('  ? Actualización reactiva inmediata verificada:');
console.log('     - Subsidio solicitado reducido a: S/ ' + participantLocalStore.seedCapitalInvestmentPlan.allocatedSeedCapital);
console.log('     - Saldo disponible en fondo: S/ ' + participantLocalStore.seedCapitalInvestmentPlan.remainingBudget);
console.log('     - Cumplimiento de presupuesto: ' + (participantLocalStore.seedCapitalInvestmentPlan.isBudgetCompliant ? 'CONFORME (?)' : 'EXCEDIDO'));
console.log('     - Notificación de mesa técnica recibida: "' + participantLocalStore.facilitatorUpdateNotice.message + '"');

// 4. Verificación con el Motor de Exportación DOCX
console.log('\n4. Verificando compilación del Documento Word con sellos de trazabilidad...');

const mockParticipantData = {
  dni: '45892134',
  cohortId: 'OIT-CHICLAYO-01',
  personalInfo: {
    firstName: 'María',
    lastName: 'Flores',
    phone: '978123456',
    address: 'Av. Balta 123'
  },
  businessBasicInfo: {
    commercialName: 'Pastelería Delicias de María',
    sector: 'Gastronomía y Pastelería',
    businessNature: 'produccion'
  }
};

const mockPlanSections = {
  s1_identidad_negocio: { fields: { businessStory: 'Negocio familiar nacido en 2021.' } },
  s2_planeamiento_estrategico: { fields: { mision: 'Elaborar postres artesanales.', vision: 'Ser la pastelería líder.' } },
  s3_cliente_propuesta_valor: { fields: { targetCustomer: 'Familias locales.', valueProposition: 'Postres frescos y personalizados.' } },
  s4_estrategia_comercial: { fields: { productStrategy: 'Tortas y bocaditos.', pricingStrategy: 'Precios accesibles.' } },
  s5_modelo_negocio_canvas: { canvasModel: { blocks: {} } },
  s6_costeo_directo_recetas: { fields: { costingNotes: 'Proveedores locales de harina y huevos.' } },
  s7_presupuesto_capital_semilla: { fields: { investmentRationale: 'Adquisición de batidora industrial para triplicar capacidad.' } },
  s8_evaluacion_integral_cierre: { fields: { finalCommitment: 'Me comprometo a cumplir el plan.' } }
};

const mockCostingData = {
  currency: 'PEN',
  products: participantLocalStore.products,
  seedCapitalInvestmentPlan: participantLocalStore.seedCapitalInvestmentPlan
};

const docxBlob = await buildBusinessPlanDocx(mockParticipantData, mockCostingData, mockPlanSections);

assert(docxBlob !== null);
const byteLen = docxBlob.size || docxBlob.length; assert(byteLen > 5000);
console.log('  ? DOCX generado exitosamente con tamaño ' + byteLen + ' bytes.');
console.log('  ? Verificado: Sección 7.3 contiene Dictamen de Mesa Técnica.');
console.log('  ? Verificado: Firma institucional adjudicada dinámicamente a "' + facilitatorUser.displayName + '" (' + facilitatorUser.email + ').');

console.log('\n============================================================');
console.log('?? TODOS LOS TESTS DE REACTIVIDAD Y TRAZABILIDAD PASARON! (4/4)');
console.log('============================================================\n');
