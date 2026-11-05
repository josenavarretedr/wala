import { useCostingCalculator } from '../src/composables/useCostingCalculator.js';
import assert from 'assert';

console.log('--- Probando Matemáticas de Costeo ---');
const calc = useCostingCalculator();

// 1. Modalidad Comercio / Reventa ("El Mayorista")
console.log('1. Comercio / Reventa:');
const baseUnitCost = calc.calculateBaseUnitCost(180, 12);
assert.strictEqual(baseUnitCost, 15, 'Costo unitario base debe ser 15');

const unitFreightCost = calc.calculateUnitFreightCost(30, 100);
assert.strictEqual(unitFreightCost, 0.3, 'Flete unitario debe ser 0.30');

const directCost = calc.calculateDirectCommercialCost(baseUnitCost, unitFreightCost, 0.3);
assert.strictEqual(directCost, 15.6, 'Costo directo comercial debe ser 15.60');

const commFin = calc.computeCommerceFinancials({
  packagePurchasePrice: 180,
  unitsPerPackage: 12,
  freightExpense: 30,
  totalItemsInTrip: 100,
  packagingCostPerUnit: 0.3,
  salePrice: 25,
  estimatedMonthlySalesVolume: 50
});
assert.strictEqual(commFin.directCostPerUnit, 15.6, 'directCostPerUnit debe ser 15.6');
assert.strictEqual(commFin.salePrice, 25, 'salePrice debe ser 25');
assert.strictEqual(commFin.grossProfitPerUnit, 9.4, 'grossProfitPerUnit debe ser 9.4');
assert.strictEqual(commFin.grossMarginPercentage, 37.6, 'grossMarginPercentage debe ser 37.6%');
assert.strictEqual(commFin.monthlyGrossProfitEstimate, 470, 'Ganancia mensual debe ser 470');
console.log('✅ Comercio / Reventa pasado con éxito!');

// 2. Modalidad Servicios / Estilismo ("El Minutero")
console.log('2. Servicios / Estilismo:');
const timeCost = calc.calculateTimeCost(45, 0.18);
assert.strictEqual(timeCost, 8.1, 'Costo de tiempo debe ser 8.10');

const singleUse = { name: 'Parche', supplyType: 'single_use', packageCost: 20, unitsInPackage: 50 };
const singleCost = calc.calculateSupplyUnitCost(singleUse);
assert.strictEqual(singleCost, 0.4, 'Costo de descartable debe ser 0.40');

const bottle = { name: 'Tinte', supplyType: 'bottle_yield', packageCost: 35, clientsYield: 5 };
const bottleCost = calc.calculateSupplyUnitCost(bottle);
assert.strictEqual(bottleCost, 7, 'Costo de frasco rendidor debe ser 7.00');

const servFin = calc.computeServiceFinancials({
  durationMinutes: 45,
  costPerMinute: 0.18,
  supplies: [
    { ...singleUse, unitCost: singleCost },
    { ...bottle, unitCost: bottleCost }
  ],
  salePrice: 35,
  estimatedMonthlySalesVolume: 40
});
assert.strictEqual(servFin.timeCost, 8.1, 'timeCost debe ser 8.10');
assert.strictEqual(servFin.suppliesCost, 7.4, 'suppliesCost debe ser 7.40');
assert.strictEqual(servFin.directCostPerUnit, 15.5, 'directCostPerUnit debe ser 15.50');
assert.strictEqual(servFin.grossProfitPerUnit, 19.5, 'grossProfitPerUnit debe ser 19.50');
assert.strictEqual(servFin.grossMarginPercentage, 55.71, 'grossMarginPercentage debe ser 55.71%');
assert.strictEqual(servFin.monthlyGrossProfitEstimate, 780, 'Ganancia mensual debe ser 780');
console.log('✅ Servicios / Estilismo pasado con éxito!');

// 3. Modalidad Producción ("La Casera vs. El Plato")
console.log('3. Producción:');
const prodFin = calc.computeProductFinancials({
  ingredients: [
    { automatedMath: { costIncurredInBatch: 11.25 } },
    { automatedMath: { costIncurredInBatch: 9.0 } },
    { automatedMath: { costIncurredInBatch: 54.0 } }
  ],
  batchSize: 30,
  salePrice: 7,
  estimatedMonthlySalesVolume: 120
});
assert.strictEqual(prodFin.totalBatchDirectCost, 74.25, 'totalBatchDirectCost debe ser 74.25');
assert.strictEqual(prodFin.directCostPerUnit, 2.475, 'directCostPerUnit debe ser 2.475');
assert.strictEqual(prodFin.grossProfitPerUnit, 4.525, 'grossProfitPerUnit debe ser 4.525');
assert.strictEqual(prodFin.grossMarginPercentage, 64.64, 'grossMarginPercentage debe ser 64.64%');
assert.strictEqual(prodFin.monthlyGrossProfitEstimate, 543, 'Ganancia mensual debe ser 543');
console.log('✅ Producción pasada con éxito!');

// 4. Cálculo Salarial y Costo por Minuto en Servicios
console.log('4. Cálculo Salarial y Costo por Minuto:');
const rate1 = calc.calculateLaborCostPerMinute({
  desiredMonthlySalary: 1200,
  daysWorkedPerMonth: 25,
  hoursWorkedPerDay: 8
});
assert.strictEqual(rate1, 0.1, 'Tarifa con S/1200, 25d, 8h/d debe ser 0.100 S/min');

const rate2 = calc.calculateLaborCostPerMinute({
  desiredMonthlySalary: 1500,
  daysWorkedPerMonth: 26,
  hoursWorkedPerDay: 8
});
assert.strictEqual(rate2, 0.12, 'Tarifa con S/1500, 26d, 8h/d debe ser 0.120 S/min');

const rate3 = calc.calculateLaborCostPerMinute({
  desiredMonthlySalary: 1080,
  daysWorkedPerMonth: 25,
  hoursWorkedPerDay: 4
});
assert.strictEqual(rate3, 0.18, 'Tarifa con S/1080, 25d, 4h/d debe ser 0.180 S/min');
console.log('✅ Cálculo Salarial y Costo por Minuto pasado con éxito!');

// 5. Títulos y Descripciones Dinámicas según Naturaleza del Negocio
console.log('5. Títulos Dinámicos de Sesión 6:');
import('../src/data/sessionsData.js').then(({ SESSIONS_DATA, getSessionTitle, getSessionShortDesc }) => {
  const s6 = SESSIONS_DATA.find((s) => s.id === 6);
  const s1 = SESSIONS_DATA.find((s) => s.id === 1);

  assert.strictEqual(getSessionTitle(s6, 'produccion'), 'Costeo Directo: "La Casera vs. El Plato"');
  assert.strictEqual(getSessionTitle(s6, 'servicio'), 'Costeo de Servicios: "El Minutero"');
  assert.strictEqual(getSessionTitle(s6, 'comercio'), 'Costeo Comercial: "El Mayorista"');

  assert.strictEqual(getSessionShortDesc(s6, 'produccion'), 'Insumos directos, compras por volumen y consumo por tanda.');
  assert.strictEqual(getSessionShortDesc(s6, 'servicio'), 'Valor de tu tiempo por minuto, descartables y frascos rendidores.');
  assert.strictEqual(getSessionShortDesc(s6, 'comercio'), 'Compra al por mayor en bultos, flete prorrateado y empaque.');

  // Otras sesiones no deben verse alteradas
  assert.strictEqual(getSessionTitle(s1, 'servicio'), 'Identidad del Negocio');

  console.log('✅ Títulos Dinámicos de Sesión 6 pasados con éxito!');

  // 6. Normalización de Frecuencias de Producción a Base Mensual
  console.log('6. Normalización de Frecuencias:');
  assert.strictEqual(calc.calculateBatchesPerMonth('diario'), 24, 'Diario debe normalizar a 24 tandas/mes');
  assert.strictEqual(calc.calculateBatchesPerMonth('interdiario'), 12, 'Interdiario debe normalizar a 12 tandas/mes');
  assert.strictEqual(calc.calculateBatchesPerMonth('semanal'), 4, 'Semanal debe normalizar a 4 tandas/mes');
  assert.strictEqual(calc.calculateBatchesPerMonth('quincenal'), 2, 'Quincenal debe normalizar a 2 tandas/mes');
  assert.strictEqual(calc.calculateBatchesPerMonth('mensual'), 1, 'Mensual debe normalizar a 1 tanda/mes');
  assert.strictEqual(calc.calculateBatchesPerMonth(null), 4, 'Frecuencia no especificada debe fallback a 4 tandas/mes');
  console.log('✅ Normalización de Frecuencias pasada con éxito!');

  // 7. "La Casera vs. El Plato": Conversión de Consumo Fraccionado a Paquetes Comerciales Enteros
  console.log('7. Requerimientos de Capital de Trabajo ("La Casera vs. El Plato"):');
  const dummyProducts = [
    {
      productId: 'PROD-BURGER',
      productName: 'Hamburguesa Artesanal',
      businessNature: 'produccion',
      batchConfig: {
        batchSize: 10,
        batchUnit: 'unidades',
        productionFrequency: 'diario', // 24 tandas/mes
        batchesPerMonth: 24
      },
      ingredients: [
        {
          name: 'Carne Molida Especial',
          recipeConsumption: { quantityUsed: 1.5, unit: 'kg' }, // 1.5 kg por tanda => 36 kg/mes
          marketPurchase: { quantityInPackage: 5, packageUnitName: 'bolsa de 5kg', packageCost: 110.0 } // 36 / 5 = 7.2 => 8 bolsas
        },
        {
          name: 'Pan de Hamburguesa',
          recipeConsumption: { quantityUsed: 10, unit: 'unidades' }, // 10 un por tanda => 240 un/mes
          marketPurchase: { quantityInPackage: 24, packageUnitName: 'paquete de 24 un', packageCost: 18.0 } // 240 / 24 = 10 paquetes
        }
      ]
    },
    {
      productId: 'PROD-TINTE',
      productName: 'Tinte y Peinado',
      businessNature: 'servicio',
      commercialization: { estimatedMonthlySalesVolume: 28 }, // 28 atenciones al mes
      serviceConfig: {
        durationMinutes: 60,
        costPerMinute: 0.15,
        supplies: [
          {
            name: 'Frasco de Tinte Profesional',
            supplyType: 'bottle_yield',
            clientsYield: 5, // rinde para 5 clientes => ceil(28 / 5) = 6 frascos
            packageCost: 42.0
          }
        ]
      }
    },
    {
      productId: 'PROD-POLOS',
      productName: 'Polos Algodón',
      businessNature: 'comercio',
      commercialization: { estimatedMonthlySalesVolume: 38 }, // 38 polos al mes
      commerceConfig: {
        purchasePresentation: 'Docena',
        unitsPerPackage: 12, // ceil(38 / 12) = 4 docenas
        packagePurchasePrice: 150.0,
        freightExpense: 20.0,
        totalItemsInTrip: 100, // 0.20 flete unitario
        unitFreightCost: 0.20,
        packagingCostPerUnit: 0.50 // costo empaque unitario
        // Total x paquete = 150 + (0.20*12) + (0.50*12) = 150 + 2.40 + 6.00 = 158.40
      }
    }
  ];

  const workingCap = calc.getMonthlyWorkingCapitalRequirements({
    products: dummyProducts,
    serviceLaborSettings: { desiredMonthlySalary: 1400 }
  });

  assert.strictEqual(workingCap.length, 4, 'Deben generarse 4 requerimientos de insumos');

  // Carne molida: 24 tandas * 1.5kg = 36 kg. En bolsas de 5kg => ceil(36/5) = 8 bolsas de S/ 110 = S/ 880
  const carne = workingCap.find((i) => i.description.includes('Carne Molida'));
  assert.strictEqual(carne.quantity, 8, 'Debe requerir 8 bolsas enteras de carne');
  assert.strictEqual(carne.totalPrice, 880, 'Presupuesto requerido de carne debe ser 8 * 110 = S/ 880');
  assert.strictEqual(carne.monthlyQuantityConsumed, 36, 'Consumo mensual en receta debe ser 36 kg');

  // Pan: 24 tandas * 10 = 240 unidades. En paquetes de 24 => ceil(240/24) = 10 paquetes de S/ 18 = S/ 180
  const pan = workingCap.find((i) => i.description.includes('Pan de Hamburguesa'));
  assert.strictEqual(pan.quantity, 10, 'Debe requerir 10 paquetes de pan');
  assert.strictEqual(pan.totalPrice, 180, 'Presupuesto de pan debe ser 10 * 18 = S/ 180');

  // Tinte: 28 clientes / rinde 5 = 6 frascos de S/ 42 = S/ 252
  const tinte = workingCap.find((i) => i.description.includes('Frasco de Tinte'));
  assert.strictEqual(tinte.quantity, 6, 'Debe requerir 6 frascos enteros de tinte');
  assert.strictEqual(tinte.totalPrice, 252, 'Presupuesto de tinte debe ser 6 * 42 = S/ 252');

  // Polos: 38 polos / 12 por docena = 4 docenas de S/ 158.40 = S/ 633.60
  const polos = workingCap.find((i) => i.description.includes('Polos Algodón'));
  assert.strictEqual(polos.quantity, 4, 'Debe requerir 4 docenas enteras de polos');
  assert.strictEqual(polos.totalPrice, 633.6, 'Presupuesto de polos debe ser 4 * 158.40 = S/ 633.60');
  console.log('✅ Requerimientos de Capital de Trabajo ("La Casera vs. El Plato") pasados con éxito!');

  // 8. Valorización de Mano de Obra Propia
  console.log('8. Valorización de Mano de Obra Propia:');
  const valSalario = calc.calculateProjectedMonthlyLaborValue({
    serviceLaborSettings: { desiredMonthlySalary: 1600 }
  });
  assert.strictEqual(valSalario, 1600, 'Debe respetar el sueldo deseado configurado');

  const valReferencial = calc.calculateProjectedMonthlyLaborValue({
    businessNature: 'produccion',
    serviceLaborSettings: null,
    products: []
  });
  assert.strictEqual(valReferencial, 1200, 'Sin sueldo deseado debe usar el referencial de S/ 1200');
  console.log('✅ Valorización de Mano de Obra Propia pasada con éxito!');

  // 9. Desglose en 3 Rubros (A, B, C) y Techo Presupuestal
  console.log('9. Desglose en 3 Rubros y Cumplimiento de Techo:');
  const itemsPresupuesto = [
    // Rubro A: Equipos financiados
    { itemId: 'A1', category: 'Maquinaria y Equipo', rubro: 'rubro_a', totalPrice: 1500, financedBySeedCapital: true },
    { itemId: 'A2', category: 'Herramientas', rubro: 'rubro_a', totalPrice: 300, financedBySeedCapital: true },
    // Rubro B: Insumos financiados + 1 con aporte propio
    { itemId: 'B1', category: 'Insumos y Capital de Trabajo', rubro: 'rubro_b', totalPrice: 800, financedBySeedCapital: true },
    { itemId: 'B2', category: 'Insumos y Capital de Trabajo', rubro: 'rubro_b', totalPrice: 400, financedBySeedCapital: false },
    // Rubro C: Mano de obra propia y acondicionamiento
    { itemId: 'C1', category: 'Mano de Obra Propia', rubro: 'rubro_c', totalPrice: 1200, financedBySeedCapital: false, isLaborContribution: true },
    { itemId: 'C2', category: 'Acondicionamiento y Otros', rubro: 'rubro_c', totalPrice: 300, financedBySeedCapital: true }
  ];

  const evaluacion = calc.computeSeedCapitalPlan({ items: itemsPresupuesto, ceiling: 3000 });

  // Asignado al fondo de Capital Semilla: A1(1500) + A2(300) + B1(800) + C2(300) = S/ 2,900 <= 3,000
  assert.strictEqual(evaluacion.allocatedSeedCapital, 2900, 'Capital semilla asignado debe ser 2,900');
  assert.strictEqual(evaluacion.isBudgetCompliant, true, 'Debe ser compliant (2900 <= 3000)');
  assert.strictEqual(evaluacion.remainingBudget, 100, 'Saldo restante debe ser 100');

  // Inversión total del negocio: 1500 + 300 + 800 + 400 + 1200 + 300 = S/ 4,500
  assert.strictEqual(evaluacion.totalBusinessInvestment, 4500, 'Inversión total del negocio debe ser 4,500');
  assert.strictEqual(evaluacion.ownContribution, 1600, 'Aporte propio debe ser B2(400) + C1(1200) = 1,600');

  // Desglose por Rubros
  assert.strictEqual(evaluacion.rubros.rubroA.seed, 1800, 'Rubro A subsidio: 1500 + 300 = 1800');
  assert.strictEqual(evaluacion.rubros.rubroA.total, 1800, 'Rubro A total: 1800');

  assert.strictEqual(evaluacion.rubros.rubroB.seed, 800, 'Rubro B subsidio: 800');
  assert.strictEqual(evaluacion.rubros.rubroB.own, 400, 'Rubro B propio: 400');
  assert.strictEqual(evaluacion.rubros.rubroB.total, 1200, 'Rubro B total: 1200');

  assert.strictEqual(evaluacion.rubros.rubroC.seed, 300, 'Rubro C subsidio: 300');
  assert.strictEqual(evaluacion.rubros.rubroC.own, 1200, 'Rubro C propio (Mano de obra): 1200');
  assert.strictEqual(evaluacion.rubros.rubroC.total, 1500, 'Rubro C total: 1500');

  // Prueba de sobregiro
  const sobregiroItems = [
    ...itemsPresupuesto,
    { itemId: 'A3', category: 'Maquinaria y Equipo', rubro: 'rubro_a', totalPrice: 200, financedBySeedCapital: true }
  ];
  const evaluacionSobregiro = calc.computeSeedCapitalPlan({ items: sobregiroItems, ceiling: 3000 });
  assert.strictEqual(evaluacionSobregiro.allocatedSeedCapital, 3100, 'Subsidio debe ser 3100');
  assert.strictEqual(evaluacionSobregiro.isBudgetCompliant, false, 'Debe marcarse como no compliant por sobregiro');
  assert.strictEqual(evaluacionSobregiro.remainingBudget, -100, 'Saldo restante debe ser negativo (-100)');
  // 10. Conversión Automática de Unidades (Gramos a Kilos / Mililitros a Litros)
  console.log('10. Conversión Automática de Unidades:');
  const convertedGramIng = calc.computeIngredientMath({
    quantityUsed: 250, // 250 gramos en la receta
    recipeUnit: 'gr',
    quantityInPackage: 1, // 1 kilo en el mercado
    packageUnit: 'kg',
    packageCost: 20.0, // S/ 20 por kilo
    batchSize: 5
  });

  // 250 gr = 0.25 kg. Costo por tanda = 0.25 * 20 = S/ 5.00. Costo por unidad = 5 / 5 = S/ 1.00. Sobrante = 750 gr
  assert.strictEqual(convertedGramIng.costIncurredInBatch, 5.0, '250 gr de S/ 20/kg debe costar S/ 5.00');
  assert.strictEqual(convertedGramIng.unitCostPerProduct, 1.0, 'Para 5 unidades debe ser S/ 1.00 por unidad');
  assert.strictEqual(convertedGramIng.leftoverQuantityInStock, 750, 'Sobrante debe ser 750 gr');

  const convertedMlIng = calc.computeIngredientMath({
    quantityUsed: 500, // 500 ml en la receta
    recipeUnit: 'ml',
    quantityInPackage: 3, // 3 litros en el mercado
    packageUnit: 'L',
    packageCost: 24.0, // S/ 24 por botella de 3L => S/ 8 por L
    batchSize: 4
  });

  // 500 ml = 0.5 L. Costo por tanda = 0.5 * 8 = S/ 4.00. Costo por unidad = 4 / 4 = S/ 1.00. Sobrante = 2500 ml
  assert.strictEqual(convertedMlIng.costIncurredInBatch, 4.0, '500 ml de S/ 24 por 3L debe costar S/ 4.00');
  assert.strictEqual(convertedMlIng.unitCostPerProduct, 1.0, 'Para 4 unidades debe ser S/ 1.00 por unidad');
  assert.strictEqual(convertedMlIng.leftoverQuantityInStock, 2500, 'Sobrante debe ser 2500 ml (2.5 L)');
  console.log('✅ Conversión Automática de Unidades pasada con éxito!');

  console.log('--- TODOS LOS TESTS MATEMÁTICOS Y DE PRESUPUESTO PASARON SATISFACTORIAMENTE ---');
});
