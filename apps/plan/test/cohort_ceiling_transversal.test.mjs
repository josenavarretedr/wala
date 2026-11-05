import { useCostingCalculator } from '../src/composables/useCostingCalculator.js';
import assert from 'assert';

console.log('--- Probando Techos Dinámicos de Capital Semilla por Cohorte ---');
const calc = useCostingCalculator();

const sampleItems = [
  // Rubro A: Maquinaria
  { itemId: 'A1', category: 'Maquinaria y Equipo', rubro: 'rubro_a', totalPrice: 1000, financedBySeedCapital: true },
  // Rubro B: Capital de Trabajo
  { itemId: 'B1', category: 'Insumos y Capital de Trabajo', rubro: 'rubro_b', totalPrice: 400, financedBySeedCapital: true },
  { itemId: 'B2', category: 'Insumos y Capital de Trabajo', rubro: 'rubro_b', totalPrice: 300, financedBySeedCapital: false },
  // Rubro C: Mano de Obra Propia (Aporte Propio)
  { itemId: 'C1', category: 'Mano de Obra Propia', rubro: 'rubro_c', totalPrice: 1200, financedBySeedCapital: false, isLaborContribution: true }
];

// 1. Caso Cohorte con Techo S/ 1,500.00
console.log('1. Evaluación bajo Techo de S/ 1,500.00:');
const plan1500 = calc.computeSeedCapitalPlan({ items: sampleItems, ceiling: 1500 });
assert.strictEqual(plan1500.allocatedSeedCapital, 1400, 'Subsidio debe ser 1400');
assert.strictEqual(plan1500.isBudgetCompliant, true, 'Debe ser compliant con techo 1500 (1400 <= 1500)');
assert.strictEqual(plan1500.remainingBudget, 100, 'Saldo restante debe ser 100');
assert.strictEqual(plan1500.totalBusinessInvestment, 2900, 'Inversión total debe ser 2900');
assert.strictEqual(plan1500.ownContribution, 1500, 'Aporte propio debe ser 1500');
console.log('✅ Techo S/ 1,500 Conforme validado!');

// 1.b Sobregiro en Techo S/ 1,500.00
const overItems1500 = [
  ...sampleItems,
  { itemId: 'A2', category: 'Herramientas', rubro: 'rubro_a', totalPrice: 200, financedBySeedCapital: true }
];
const plan1500Over = calc.computeSeedCapitalPlan({ items: overItems1500, ceiling: 1500 });
assert.strictEqual(plan1500Over.allocatedSeedCapital, 1600, 'Subsidio debe ser 1600');
assert.strictEqual(plan1500Over.isBudgetCompliant, false, 'Debe estar sobregirado (1600 > 1500)');
assert.strictEqual(plan1500Over.remainingBudget, -100, 'Saldo debe ser negativo (-100)');
console.log('✅ Sobregiro bajo Techo S/ 1,500 detectado correctamente!');

// 2. Caso Cohorte con Techo S/ 2,000.00
console.log('2. Evaluación bajo Techo de S/ 2,000.00:');
const plan2000 = calc.computeSeedCapitalPlan({ items: overItems1500, ceiling: 2000 });
assert.strictEqual(plan2000.allocatedSeedCapital, 1600, 'Subsidio debe ser 1600');
assert.strictEqual(plan2000.isBudgetCompliant, true, 'Debe ser compliant con techo 2000 (1600 <= 2000)');
assert.strictEqual(plan2000.remainingBudget, 400, 'Saldo disponible debe ser 400');
console.log('✅ Techo S/ 2,000 Conforme validado!');

// 2.b Sobregiro en Techo S/ 2,000.00
const overItems2000 = [
  ...overItems1500,
  { itemId: 'A3', category: 'Equipos', rubro: 'rubro_a', totalPrice: 500, financedBySeedCapital: true }
];
const plan2000Over = calc.computeSeedCapitalPlan({ items: overItems2000, ceiling: 2000 });
assert.strictEqual(plan2000Over.allocatedSeedCapital, 2100, 'Subsidio debe ser 2100');
assert.strictEqual(plan2000Over.isBudgetCompliant, false, 'Debe estar sobregirado (2100 > 2000)');
assert.strictEqual(plan2000Over.remainingBudget, -100, 'Saldo debe ser negativo (-100)');
console.log('✅ Sobregiro bajo Techo S/ 2,000 detectado correctamente!');

// 3. Caso Cohorte con Techo S/ 3,000.00
console.log('3. Evaluación bajo Techo de S/ 3,000.00:');
const plan3000 = calc.computeSeedCapitalPlan({ items: overItems2000, ceiling: 3000 });
assert.strictEqual(plan3000.allocatedSeedCapital, 2100, 'Subsidio debe ser 2100');
assert.strictEqual(plan3000.isBudgetCompliant, true, 'Debe ser compliant con techo 3000 (2100 <= 3000)');
assert.strictEqual(plan3000.remainingBudget, 900, 'Saldo disponible debe ser 900');
console.log('✅ Techo S/ 3,000 Conforme validado!');

console.log('--- TODOS LOS TESTS DE TECHOS TRANSVERSALES POR COHORTE PASARON SATISFACTORIAMENTE ---');
