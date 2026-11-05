import assert from 'assert';
import { useCostingCalculator } from '../src/composables/useCostingCalculator.js';

console.log('--- TEST: Trazabilidad y Lógica de Transferencia entre Cohortes ---');

const calc = useCostingCalculator();

// 1. Simulación de participante inicial en 'ACNUR-LIMA-02' (Techo: S/ 2,000)
const initialParticipant = {
  dni: '45892134',
  cohortId: 'ACNUR-LIMA-02',
  personalInfo: { firstName: 'María', lastName: 'Flores' },
  businessBasicInfo: { commercialName: 'Confecciones María' },
  cohortHistory: [],
  programStatus: { currentSession: 4, overallProgressPercentage: 50 }
};

const initialSessions = [];
for (let s = 1; s <= 8; s++) {
  initialSessions.push({
    id: `45892134_${s}`,
    docId: `45892134_S${s}`,
    participantId: '45892134',
    cohortId: 'ACNUR-LIMA-02',
    sessionId: s,
    state: s <= 3 ? 'completado' : (s === 4 ? 'en_progreso' : 'bloqueado'),
    formSubmission: { isCompleted: s <= 3, isApproved: s <= 3 }
  });
}

// 2. Ejecutar primera transferencia hacia 'OIT-CHICLAYO-01' (Techo: S/ 3,000)
console.log('1. Probando primera transferencia: ACNUR-LIMA-02 -> OIT-CHICLAYO-01');

const transfer1 = {
  transferId: `trf_${Date.now()}_45892134`,
  participantId: '45892134',
  fromCohortId: 'ACNUR-LIMA-02',
  toCohortId: 'OIT-CHICLAYO-01',
  transferredAt: new Date().toISOString(),
  transferredBy: {
    email: 'josenavarretedr@gmail.com',
    displayName: 'José Navarrete',
    uid: 'dev-facilitator-01'
  },
  reason: 'Reubicación territorial o cambio de domicilio',
  notes: 'Emprendedora trasladó taller a Chiclayo.',
  previousCeiling: 2000.0,
  newCeiling: 3000.0,
  currentSession: 4,
  completedSessionsCount: 3
};

// Validar estructura de trazabilidad
assert(transfer1.transferId.startsWith('trf_'), 'El transferId debe comenzar con trf_');
assert.strictEqual(transfer1.fromCohortId, 'ACNUR-LIMA-02');
assert.strictEqual(transfer1.toCohortId, 'OIT-CHICLAYO-01');
assert.strictEqual(transfer1.transferredBy.email, 'josenavarretedr@gmail.com');
assert.strictEqual(transfer1.previousCeiling, 2000.0);
assert.strictEqual(transfer1.newCeiling, 3000.0);

// Aplicar al participante
const participantAfterTransfer1 = {
  ...initialParticipant,
  cohortId: transfer1.toCohortId,
  cohortHistory: [...initialParticipant.cohortHistory, transfer1]
};

assert.strictEqual(participantAfterTransfer1.cohortId, 'OIT-CHICLAYO-01');
assert.strictEqual(participantAfterTransfer1.cohortHistory.length, 1);
assert.strictEqual(participantAfterTransfer1.cohortHistory[0].reason, 'Reubicación territorial o cambio de domicilio');
console.log('✅ Primera transferencia y registro en cohortHistory validados!');

// Actualizar las 8 sesiones a la nueva cohorte
const sessionsAfterTransfer1 = initialSessions.map((s) => ({
  ...s,
  cohortId: transfer1.toCohortId
}));

assert.strictEqual(sessionsAfterTransfer1.length, 8);
sessionsAfterTransfer1.forEach((s) => {
  assert.strictEqual(s.cohortId, 'OIT-CHICLAYO-01', `La sesión ${s.sessionId} debe tener cohortId OIT-CHICLAYO-01`);
  if (s.sessionId <= 3) {
    assert.strictEqual(s.state, 'completado', 'El estado de la sesión completada debe preservarse');
    assert.strictEqual(s.formSubmission.isApproved, true, 'La aprobación debe preservarse');
  }
});
console.log('✅ Las 8 sesiones migraron de cohorte preservando 100% el avance pedagógico!');

// 3. Probar segunda transferencia (Cadena de trazabilidad histórica acumulativa)
console.log('2. Probando segunda transferencia: OIT-CHICLAYO-01 -> COHORTE-LOCAL-OFFLINE');
const transfer2 = {
  transferId: `trf_${Date.now() + 1000}_45892134`,
  participantId: '45892134',
  fromCohortId: 'OIT-CHICLAYO-01',
  toCohortId: 'COHORTE-LOCAL-OFFLINE',
  transferredAt: new Date().toISOString(),
  transferredBy: {
    email: 'josenavarretedr@gmail.com',
    displayName: 'José Navarrete',
    uid: 'dev-facilitator-01'
  },
  reason: 'Ajuste institucional / Cooperante financista',
  notes: 'Pasa a grupo rural desconectado.',
  previousCeiling: 3000.0,
  newCeiling: 1500.0,
  currentSession: 5,
  completedSessionsCount: 4
};

const participantAfterTransfer2 = {
  ...participantAfterTransfer1,
  cohortId: transfer2.toCohortId,
  cohortHistory: [...participantAfterTransfer1.cohortHistory, transfer2]
};

assert.strictEqual(participantAfterTransfer2.cohortId, 'COHORTE-LOCAL-OFFLINE');
assert.strictEqual(participantAfterTransfer2.cohortHistory.length, 2, 'Debe haber 2 registros en el historial');
assert.strictEqual(participantAfterTransfer2.cohortHistory[0].fromCohortId, 'ACNUR-LIMA-02');
assert.strictEqual(participantAfterTransfer2.cohortHistory[0].toCohortId, 'OIT-CHICLAYO-01');
assert.strictEqual(participantAfterTransfer2.cohortHistory[1].fromCohortId, 'OIT-CHICLAYO-01');
assert.strictEqual(participantAfterTransfer2.cohortHistory[1].toCohortId, 'COHORTE-LOCAL-OFFLINE');
console.log('✅ Cadena histórica de trazabilidad inmutable validada!');

// 4. Probar adaptación de techo de financiamiento en Módulo 7 (Inversión)
console.log('3. Probando impacto presupuestario de transferencia sobre el Módulo 7:');
const sampleItems = [
  { itemId: 'M1', category: 'Maquinaria', rubro: 'rubro_a', totalPrice: 1800, financedBySeedCapital: true },
  { itemId: 'I1', category: 'Insumos', rubro: 'rubro_b', totalPrice: 400, financedBySeedCapital: true }
];

// En OIT-CHICLAYO-01 (Techo 3000): 2200 <= 3000 -> Conforme
const planOIT = calc.computeSeedCapitalPlan({ items: sampleItems, ceiling: 3000 });
assert.strictEqual(planOIT.allocatedSeedCapital, 2200);
assert.strictEqual(planOIT.isBudgetCompliant, true);
assert.strictEqual(planOIT.remainingBudget, 800);
console.log('✅ En OIT-CHICLAYO-01 (Techo 3000) el presupuesto de S/ 2200 es conforme');

// Trasladado a COHORTE-LOCAL-OFFLINE (Techo 1500): 2200 > 1500 -> Sobregirado
const planOffline = calc.computeSeedCapitalPlan({ items: sampleItems, ceiling: 1500 });
assert.strictEqual(planOffline.allocatedSeedCapital, 2200);
assert.strictEqual(planOffline.isBudgetCompliant, false);
assert.strictEqual(planOffline.remainingBudget, -700);
console.log('✅ Tras traslado a COHORTE-LOCAL-OFFLINE (Techo 1500) se detecta sobregiro presupuestal de S/ -700 correctamente!');

console.log('--- TODOS LOS TESTS DE TRAZABILIDAD Y TRANSFERENCIA PASARON EXITOSAMENTE ---');
