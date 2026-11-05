import assert from 'assert';

console.log('--- TEST: Eliminación de Participante de Cohorte con Auditoría y Limpieza ---');

// ============================================================================
// 1. Simulación de Estado de Cohorte en Facilitador
// ============================================================================
console.log('\n1. Simulando estado en memoria del facilitador con participantes y sesiones...');

const mockState = {
  activeCohortId: 'OIT-CHICLAYO-01',
  participants: [
    {
      dni: '12345678',
      cohortId: 'OIT-CHICLAYO-01',
      personalInfo: { firstName: 'Juan', lastName: 'Pérez' },
      businessBasicInfo: { commercialName: 'Panadería Juanito' }
    },
    {
      dni: '87654321',
      cohortId: 'OIT-CHICLAYO-01',
      personalInfo: { firstName: 'Rosa', lastName: 'Mendoza' },
      businessBasicInfo: { commercialName: 'Bazar Rosa' }
    }
  ],
  progressMap: {},
  selectedParticipant: null,
  isDrawerOpen: false
};

// Generar 8 sesiones para cada participante
for (const p of mockState.participants) {
  for (let s = 1; s <= 8; s++) {
    mockState.progressMap[`${p.dni}_S${s}`] = {
      participantId: p.dni,
      sessionId: s,
      cohortId: 'OIT-CHICLAYO-01',
      state: s <= 2 ? 'completado' : (s === 3 ? 'pendiente_revision' : 'bloqueado')
    };
  }
}

assert.strictEqual(mockState.participants.length, 2, 'Debe haber 2 participantes inicialmente');
assert.strictEqual(Object.keys(mockState.progressMap).length, 16, 'Debe haber 16 registros de sesión (2 * 8)');

// Simular que el facilitador tiene abierto el cajón del participante '12345678'
mockState.selectedParticipant = mockState.participants[0];
mockState.isDrawerOpen = true;

// ============================================================================
// 2. Lógica de Eliminación Atómica y Limpieza en Memoria
// ============================================================================
console.log('2. Ejecutando lógica de eliminación de participante (DNI 12345678)...');

function simulateRemoveParticipant(dni, state) {
  const cleanedDni = String(dni).trim();
  if (!cleanedDni) throw new Error('DNI es requerido');

  const part = state.participants.find((p) => String(p.dni) === cleanedDni);
  const participantName = `${part?.personalInfo?.firstName || ''} ${part?.personalInfo?.lastName || ''}`.trim() || cleanedDni;
  const currentCohort = state.activeCohortId;

  // Auditoría
  const deletionAudit = {
    deletionId: `del_${Date.now()}_${cleanedDni}`,
    participantId: cleanedDni,
    cohortId: currentCohort,
    participantName,
    deletedAt: new Date().toISOString(),
    deletedBy: {
      email: 'josenavarretedr@gmail.com',
      displayName: 'José Navarrete'
    }
  };

  // Simular lista de operaciones atómicas en Firestore
  const deletedDocPaths = [];
  deletedDocPaths.push(`participants/${cleanedDni}`);
  for (let s = 1; s <= 8; s++) {
    deletedDocPaths.push(`session_progress/${cleanedDni}_S${s}`);
  }
  deletedDocPaths.push(`costing_module/${cleanedDni}`);
  const sectionKeys = [
    's1_identidad', 's2_planeamiento_estrategico', 's3_propuesta_valor', 's4_estrategia_comercial',
    's5_modelo_canvas', 's6_costeo_fijacion_precios', 's7_plan_inversion_financiamiento', 's8_resumen_ejecutivo'
  ];
  for (const secKey of sectionKeys) {
    deletedDocPaths.push(`business_plan_sections/${cleanedDni}_${secKey}`);
  }

  // Limpieza reactiva en estado
  state.participants = state.participants.filter((p) => String(p.dni) !== cleanedDni);
  for (let s = 1; s <= 8; s++) {
    delete state.progressMap[`${cleanedDni}_S${s}`];
  }

  // Cerrar cajón si pertenecía a este participante
  if (state.selectedParticipant && String(state.selectedParticipant.dni) === cleanedDni) {
    state.selectedParticipant = null;
    state.isDrawerOpen = false;
  }

  return {
    success: true,
    dni: cleanedDni,
    name: participantName,
    cohortId: currentCohort,
    audit: deletionAudit,
    deletedDocPaths
  };
}

const result = simulateRemoveParticipant('12345678', mockState);

// ============================================================================
// 3. Verificaciones y Aserciones
// ============================================================================
console.log('3. Verificando resultados de la eliminación...');

// 3.1 Participantes restantes
assert.strictEqual(mockState.participants.length, 1, 'Debe quedar exactamente 1 participante en la cohorte');
assert.strictEqual(mockState.participants[0].dni, '87654321', 'El participante restante debe ser Rosa Mendoza');
console.log('  ✅ Lista de participantes actualizada en tiempo real.');

// 3.2 Sesiones limpiadas
assert.strictEqual(Object.keys(mockState.progressMap).length, 8, 'Deben quedar solo 8 registros de sesión en el mapa');
for (let s = 1; s <= 8; s++) {
  assert.strictEqual(mockState.progressMap[`12345678_S${s}`], undefined, `Sesión S${s} de 12345678 debe haber sido eliminada`);
  assert(mockState.progressMap[`87654321_S${s}`] !== undefined, `Sesión S${s} de 87654321 debe preservarse intacta`);
}
console.log('  ✅ Registros de sesión del participante eliminados sin dejar huérfanos.');

// 3.3 Cierre automático de ReviewDrawer
assert.strictEqual(mockState.selectedParticipant, null, 'El participante seleccionado debe haberse limpiado');
assert.strictEqual(mockState.isDrawerOpen, false, 'El cajón de auditoría debe cerrarse automáticamente');
console.log('  ✅ Cajón de revisión cerrado al eliminar al participante activo.');

// 3.4 Trazabilidad de Auditoría
assert(result.audit.deletionId.startsWith('del_'), 'El ID de auditoría debe comenzar con del_');
assert.strictEqual(result.audit.participantId, '12345678');
assert.strictEqual(result.audit.cohortId, 'OIT-CHICLAYO-01');
assert.strictEqual(result.audit.deletedBy.email, 'josenavarretedr@gmail.com');
assert.strictEqual(result.deletedDocPaths.length, 18, 'Deben registrarse 18 rutas atómicas de eliminación');
console.log('  ✅ Registro de auditoría y rutas atómicas validadas.');

console.log('\n============================================================');
console.log('🎉 TODOS LOS TESTS DE ELIMINACIÓN DE PARTICIPANTE PASARON CON ÉXITO!');
console.log('============================================================');
