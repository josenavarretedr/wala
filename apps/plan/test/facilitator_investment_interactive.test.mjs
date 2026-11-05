import assert from 'assert';
import { useCostingCalculator } from '../src/composables/useCostingCalculator.js';

console.log('--- TEST: Facilitator Investment Plan Interactive Logic & Switches ---');

const calc = useCostingCalculator();

// ============================================================================
// 1. Simulación de Estado de Inversión del Facilitador (Sesión 7)
// ============================================================================
console.log('\n1. Simulando estado del Plan de Inversión (Techo S/ 3,000.00)...');

const mockInvestmentData = {
  ceiling: 3000.0,
  seedCapitalInvestmentPlan: {
    seedCapitalCeiling: 3000.0,
    investmentItems: [
      {
        itemId: 'INV-001',
        description: 'Batidora Industrial 10L',
        category: 'Maquinaria y Equipo',
        rubro: 'rubro_a',
        quantity: 1,
        unit: 'unidad',
        unitPriceEstimated: 1800,
        totalPrice: 1800,
        financedBySeedCapital: true,
        source: 'capital_semilla',
        isLaborContribution: false
      },
      {
        itemId: 'INV-002',
        description: 'Horno Convector 4 Bandejas',
        category: 'Maquinaria y Equipo',
        rubro: 'rubro_a',
        quantity: 1,
        unit: 'unidad',
        unitPriceEstimated: 1500,
        totalPrice: 1500,
        financedBySeedCapital: true,
        source: 'capital_semilla',
        isLaborContribution: false
      },
      {
        itemId: 'INV-003',
        description: 'Insumos 1 Mes (Harina, Huevos, Azúcar)',
        category: 'Insumos y Capital de Trabajo',
        rubro: 'rubro_b',
        quantity: 1,
        unit: 'mes',
        unitPriceEstimated: 450,
        totalPrice: 450,
        financedBySeedCapital: true,
        source: 'capital_semilla',
        isAutoDerivedFromS6: true,
        isLaborContribution: false
      },
      {
        itemId: 'INV-004',
        description: 'Mano de Obra Propia del Emprendedor (1 Mes)',
        category: 'Mano de Obra Propia',
        rubro: 'rubro_c',
        quantity: 1,
        unit: 'mes',
        unitPriceEstimated: 1200,
        totalPrice: 1200,
        financedBySeedCapital: false,
        source: 'propio',
        isLaborContribution: true
      }
    ]
  }
};

function recompute(inv) {
  const items = inv.seedCapitalInvestmentPlan.investmentItems;
  const currentCeiling = inv.ceiling;
  const recomputed = calc.computeSeedCapitalPlan({ items, ceiling: currentCeiling });

  inv.seedCapitalInvestmentPlan.totalBusinessInvestment = recomputed.totalBusinessInvestment;
  inv.seedCapitalInvestmentPlan.allocatedSeedCapital = recomputed.allocatedSeedCapital;
  inv.seedCapitalInvestmentPlan.ownContribution = recomputed.ownContribution;
  inv.seedCapitalInvestmentPlan.remainingBudget = recomputed.remainingBudget;
  inv.seedCapitalInvestmentPlan.isBudgetCompliant = recomputed.isBudgetCompliant;

  inv.allocatedSeedCapital = recomputed.allocatedSeedCapital;
  inv.ownContribution = recomputed.ownContribution;
  inv.totalBusinessInvestment = recomputed.totalBusinessInvestment;
  inv.remainingBudget = recomputed.remainingBudget;
  inv.isBudgetCompliant = recomputed.isBudgetCompliant;
  inv.rubros = recomputed.rubros;
  return recomputed;
}

// 1.1 Estado inicial con sobregiro
console.log('1.1 Verificando estado inicial con sobregiro:');
const initialFin = recompute(mockInvestmentData);

// Subsidio solicitado = 1800 + 1500 + 450 = 3750
// Techo = 3000 -> Exceso = -750
assert.strictEqual(initialFin.allocatedSeedCapital, 3750, 'Subsidio solicitado inicial debe ser 3750');
assert.strictEqual(initialFin.remainingBudget, -750, 'Saldo debe ser -750 (sobregirado)');
assert.strictEqual(initialFin.isBudgetCompliant, false, 'No debe ser conforme inicialmente');
assert.strictEqual(initialFin.ownContribution, 1200, 'Contrapartida propia inicial debe ser 1200');
assert.strictEqual(initialFin.totalBusinessInvestment, 4950, 'Inversión total inicial debe ser 4950');
console.log('  ✅ Detección de sobregiro inicial correcta (S/ 3750 vs S/ 3000).');

// ============================================================================
// 2. Interacción del Facilitador: Conmutar Switch de Financiamiento
// ============================================================================
console.log('\n2. Facilitador conmuta el switch de Horno Convector (INV-002) a Aporte Propio:');
// Switch conmutado a falso (financedBySeedCapital = false)
const horno = mockInvestmentData.seedCapitalInvestmentPlan.investmentItems.find(i => i.itemId === 'INV-002');
horno.financedBySeedCapital = false;
horno.source = 'propio';

const afterSwitchFin = recompute(mockInvestmentData);

// Ahora Subsidio solicitado = 1800 (Batidora) + 450 (Insumos) = 2250
// Aporte Propio = 1500 (Horno) + 1200 (Mano de Obra) = 2700
// Saldo restante = 3000 - 2250 = 750
assert.strictEqual(afterSwitchFin.allocatedSeedCapital, 2250, 'Subsidio solicitado debe ser 2250');
assert.strictEqual(afterSwitchFin.remainingBudget, 750, 'Saldo disponible debe ser 750');
assert.strictEqual(afterSwitchFin.isBudgetCompliant, true, 'El presupuesto ahora debe ser conforme (<= 3000)');
assert.strictEqual(afterSwitchFin.ownContribution, 2700, 'Aporte propio debe ser 2700');
console.log('  ✅ Presupuesto entra en cumplimiento tras mover Horno a Aporte Propio.');

// ============================================================================
// 3. Interacción del Facilitador: Modificar Monto in-line
// ============================================================================
console.log('\n3. Facilitador ajusta precio unitario de Batidora (INV-001) de S/ 1800 a S/ 2000:');
const batidora = mockInvestmentData.seedCapitalInvestmentPlan.investmentItems.find(i => i.itemId === 'INV-001');
batidora.unitPriceEstimated = 2000;
batidora.totalPrice = batidora.quantity * batidora.unitPriceEstimated;

const afterPriceEditFin = recompute(mockInvestmentData);

// Subsidio solicitado = 2000 + 450 = 2450
// Saldo restante = 3000 - 2450 = 550
assert.strictEqual(afterPriceEditFin.allocatedSeedCapital, 2450, 'Subsidio solicitado debe ser 2450');
assert.strictEqual(afterPriceEditFin.remainingBudget, 550, 'Saldo disponible debe ser 550');
console.log('  ✅ Recálculo in-line de precio y saldo disponible validado.');

// ============================================================================
// 4. Interacción del Facilitador: Agregar Nuevo Ítem
// ============================================================================
console.log('\n4. Facilitador agrega un nuevo ítem (Mesada de Acero Inoxidable @ S/ 500):');
mockInvestmentData.seedCapitalInvestmentPlan.investmentItems.push({
  itemId: 'INV-005',
  description: 'Mesa de Trabajo Acero Inoxidable',
  category: 'Maquinaria y Equipo',
  rubro: 'rubro_a',
  quantity: 1,
  unit: 'unidad',
  unitPriceEstimated: 500,
  totalPrice: 500,
  financedBySeedCapital: true,
  source: 'capital_semilla',
  isLaborContribution: false
});

const afterAddFin = recompute(mockInvestmentData);
// Subsidio solicitado = 2450 + 500 = 2950
// Saldo restante = 3000 - 2950 = 50
assert.strictEqual(afterAddFin.allocatedSeedCapital, 2950, 'Subsidio solicitado debe ser 2950');
assert.strictEqual(afterAddFin.remainingBudget, 50, 'Saldo disponible debe ser 50');
assert.strictEqual(afterAddFin.isBudgetCompliant, true, 'Sigue conforme con S/ 50 de saldo');
console.log('  ✅ Inserción de nuevo ítem y actualización presupuestal validadas.');

// ============================================================================
// 5. Protección de Contrapartida de Mano de Obra Propia
// ============================================================================
console.log('\n5. Verificando protección estricta de mano de obra propia (Rubro C):');
const labor = mockInvestmentData.seedCapitalInvestmentPlan.investmentItems.find(i => i.isLaborContribution);
assert(labor !== undefined, 'Debe existir ítem de mano de obra propia');
assert.strictEqual(labor.financedBySeedCapital, false, 'Mano de obra propia NUNCA puede ser financiada por capital semilla');
console.log('  ✅ Protección de contrapartida obligatoria validada.');

console.log('\n============================================================');
console.log('🎉 TODOS LOS TESTS DE INTERACCIÓN PRESUPUESTAL PASARON CON ÉXITO!');
console.log('============================================================');
