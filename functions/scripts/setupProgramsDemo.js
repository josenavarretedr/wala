/* eslint-disable */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCRIPT DE SETUP PARA MÓDULO "JUNTOS"
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Propósito: Poblar Firestore con datos de prueba para testing del módulo
 *            de Programas de Acompañamiento Empresarial
 *
 * Uso:
 *   cd functions
 *   node scripts/setupProgramsDemo.js
 *
 * Requisitos:
 *   - wala-lat-firebase-adminsdk.json debe existir en /functions
 *   - firebase-admin debe estar instalado (npm install firebase-admin)
 *
 * Datos configurados:
 *   - Usuario: d4RY5u8MGA7EOvWfLlWMRzZPBawI (josenavarretedr@gmail.com)
 *   - Business: CAFETERIA-dc64ed74
 *   - Programa: DEMO-CARE-2025
 *   - Códigos: PRUEBA2025, DEMO2025, CARE2025
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const admin = require('firebase-admin');
const crypto = require('crypto');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// COLORES PARA CONSOLA (mejora UX)
// ═══════════════════════════════════════════════════════════════════════════
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZAR FIREBASE ADMIN
// ═══════════════════════════════════════════════════════════════════════════
try {
  const serviceAccount = require('../wala-lat-firebase-adminsdk.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  log('✅', 'Firebase Admin inicializado correctamente', colors.green);
} catch (error) {
  log('❌', 'Error al inicializar Firebase Admin:', colors.red);
  console.error(error.message);
  console.log('\n💡 Asegúrate de que wala-lat-firebase-adminsdk.json existe en /functions');
  process.exit(1);
}

const db = admin.firestore();

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES DE CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════
const CONFIG = {
  uid: 'd4RY5u8MGA7EOvWfLlWMRzZPBawI',
  email: 'josenavarretedr@gmail.com',
  businessId: 'CAFETERIA-dc64ed74',
  programId: 'DEMO-CARE-2025',
};

// ═══════════════════════════════════════════════════════════════════════════
// PASO 1: CREAR PROGRAMA DE PRUEBA
// ═══════════════════════════════════════════════════════════════════════════
async function createDemoProgram() {
  log('📋', 'PASO 1: Creando programa de prueba...', colors.blue);

  const programRef = db.collection('programs').doc(CONFIG.programId);

  // Verificar si ya existe
  const existingProgram = await programRef.get();
  if (existingProgram.exists) {
    log('⚠️', `El programa ${CONFIG.programId} ya existe. Actualizando...`, colors.yellow);
  }

  const programData = {
    name: 'Fortalecimiento Empresarial - Demo',
    organizationName: 'CARE Perú',
    description: 'Programa de acompañamiento de 6 meses para fortalecer capacidades empresariales en gestión financiera, marketing y operaciones.',
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: CONFIG.uid,
    metadata: {
      duration: '6 meses',
      startDate: admin.firestore.Timestamp.fromDate(new Date('2025-01-15')),
      endDate: admin.firestore.Timestamp.fromDate(new Date('2025-07-15')),
      totalParticipants: 0,
      phases: ['baseline', 'training', 'implementation', 'evaluation'],
    },
  };

  await programRef.set(programData, { merge: true });

  log('✅', `Programa creado: ${CONFIG.programId}`, colors.green);
  log('📝', `  Nombre: ${programData.name}`);
  log('🏢', `  Organización: ${programData.organizationName}`);
  log('📅', `  Duración: ${programData.metadata.duration}`);

  return CONFIG.programId;
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 2: CREAR CÓDIGOS DE INVITACIÓN
// ═══════════════════════════════════════════════════════════════════════════
async function createInviteCodes(programId) {
  log('🎫', '\nPASO 2: Creando códigos de invitación...', colors.blue);

  const codes = [
    {
      code: 'PRUEBA2025',
      maxUses: 100,
      expiresAt: new Date('2025-12-31T23:59:59'),
      description: 'Código principal para testing',
    },
    {
      code: 'DEMO2025',
      maxUses: 50,
      expiresAt: new Date('2025-12-31T23:59:59'),
      description: 'Código alternativo',
    },
    {
      code: 'CARE2025',
      maxUses: null,
      expiresAt: null,
      description: 'Código ilimitado para producción',
    },
  ];

  const programRef = db.collection('programs').doc(programId);
  const invitesRef = programRef.collection('invites');

  for (const codeData of codes) {
    const inviteId = `invite-${codeData.code.toLowerCase()}`;
    const inviteRef = invitesRef.doc(inviteId);

    // Generar hash SHA-256 del código
    const codeHash = crypto
      .createHash('sha256')
      .update(codeData.code)
      .digest('hex');

    // Verificar si ya existe
    const existingInvite = await inviteRef.get();
    if (existingInvite.exists) {
      log('⚠️', `  Código ${codeData.code} ya existe. Saltando...`, colors.yellow);
      continue;
    }

    const inviteDoc = {
      code: codeData.code,
      codeHash: codeHash,
      maxUses: codeData.maxUses,
      currentUses: 0,
      expiresAt: codeData.expiresAt ?
        admin.firestore.Timestamp.fromDate(codeData.expiresAt) : null,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: CONFIG.uid,
      description: codeData.description,
    };

    await inviteRef.set(inviteDoc);

    log('✅', `  Código creado: ${codeData.code}`, colors.green);
    log('🔑', `    Hash: ${codeHash.substring(0, 16)}...`);
    log('📊', `    Usos: ${codeData.maxUses || 'Ilimitado'}`);
    log('📅', `    Expira: ${codeData.expiresAt ?
      codeData.expiresAt.toLocaleDateString('es-PE') : 'Nunca'}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 3: AGREGAR USUARIO COMO FACILITADOR
// ═══════════════════════════════════════════════════════════════════════════
async function addFacilitator(programId) {
  log('👤', '\nPASO 3: Agregando facilitador...', colors.blue);

  const programRef = db.collection('programs').doc(programId);
  const staffRef = programRef.collection('staff').doc(CONFIG.uid);

  // Verificar si ya existe
  const existingStaff = await staffRef.get();
  if (existingStaff.exists) {
    log('⚠️', '  Ya eres facilitador de este programa', colors.yellow);
    return;
  }

  const staffData = {
    role: 'facilitator',
    addedAt: admin.firestore.FieldValue.serverTimestamp(),
    addedBy: CONFIG.uid,
    permissions: {
      canCreateAssessments: true,
      canViewAllParticipants: true,
      canGenerateReports: false,
      canManageStaff: false,
    },
    metadata: {
      name: 'José Navarrete',
      email: CONFIG.email,
    },
  };

  await staffRef.set(staffData);

  log('✅', `  Facilitador agregado: ${CONFIG.uid}`, colors.green);
  log('📧', `    Email: ${staffData.metadata.email}`);
  log('🔐', `    Rol: ${staffData.role}`);
  log('✨', `    Puede crear assessments: ${staffData.permissions.canCreateAssessments}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 4: VALIDAR QUE EL BUSINESS EXISTE
// ═══════════════════════════════════════════════════════════════════════════
async function validateUserBusiness() {
  log('🏪', '\nPASO 4: Validando negocio existente...', colors.blue);

  // Validar que el business existe
  const businessRef = db.collection('businesses').doc(CONFIG.businessId);
  const businessSnap = await businessRef.get();

  if (!businessSnap.exists) {
    log('❌', `  Business ${CONFIG.businessId} no existe en Firestore`, colors.red);
    throw new Error('Business no encontrado');
  }

  const businessData = businessSnap.data();
  log('✅', `  Business encontrado: ${CONFIG.businessId}`, colors.green);
  log('🏪', `    Nombre: ${businessData.nombre || 'N/A'}`);
  log('📍', `    Tipo: ${businessData.tipo || 'N/A'}`);

  // Validar relación usuario-business
  const userBusinessRef = db
    .collection('users')
    .doc(CONFIG.uid)
    .collection('businesses')
    .doc(CONFIG.businessId);

  const userBusinessSnap = await userBusinessRef.get();

  if (!userBusinessSnap.exists) {
    log('❌', `  Relación usuario-business no existe`, colors.red);
    throw new Error('Usuario no tiene acceso al business');
  }

  const userBusinessData = userBusinessSnap.data();

  log('✅', `  Relación usuario-business válida`, colors.green);
  log('👔', `    Rol: ${userBusinessData.rol}`);
  log('📍', `    Activo: ${userBusinessData.activo}`);

  // Validar que es gerente
  if (userBusinessData.rol !== 'gerente') {
    log('❌', `  Usuario NO es gerente (rol: ${userBusinessData.rol})`, colors.red);
    throw new Error('Solo gerentes pueden unirse a programas');
  }

  log('✅', `  Usuario es gerente. Puede unirse a programas.`, colors.green);

  return {
    businessId: CONFIG.businessId,
    businessData: businessData,
    userRole: userBusinessData.rol,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n' + '═'.repeat(70));
  log('🚀', 'INICIANDO SETUP DEL MÓDULO JUNTOS', colors.cyan);
  console.log('═'.repeat(70) + '\n');

  try {
    // Ejecutar pasos secuenciales
    const programId = await createDemoProgram();
    await createInviteCodes(programId);
    await addFacilitator(programId);
    const businessInfo = await validateUserBusiness();

    // ═══════════════════════════════════════════════════════════════════════
    // RESUMEN FINAL
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(70));
    log('🎉', 'SETUP COMPLETADO EXITOSAMENTE', colors.green);
    console.log('═'.repeat(70));

    console.log('\n' + colors.cyan + '📋 RESUMEN DE CONFIGURACIÓN:' + colors.reset + '\n');
    console.log(`  ${colors.magenta}Programa ID:${colors.reset} ${programId}`);
    console.log(`  ${colors.magenta}Business ID:${colors.reset} ${businessInfo.businessId}`);
    console.log(`  ${colors.magenta}Business Nombre:${colors.reset} ${businessInfo.businessData.nombre || 'N/A'}`);
    console.log(`  ${colors.magenta}Usuario:${colors.reset} ${CONFIG.email}`);
    console.log(`  ${colors.magenta}Rol:${colors.reset} ${businessInfo.userRole}`);

    console.log('\n' + colors.cyan + '🎫 CÓDIGOS DE INVITACIÓN DISPONIBLES:' + colors.reset + '\n');
    console.log(`  ${colors.green}✅ PRUEBA2025${colors.reset}  (100 usos, expira 31/12/2025)`);
    console.log(`  ${colors.green}✅ DEMO2025${colors.reset}    (50 usos, expira 31/12/2025)`);
    console.log(`  ${colors.green}✅ CARE2025${colors.reset}    (ilimitado, sin expiración)`);

    console.log('\n' + colors.cyan + '🧪 PRÓXIMOS PASOS PARA PROBAR:' + colors.reset + '\n');
    console.log(`  ${colors.yellow}1.${colors.reset} Inicia sesión en la app como ${CONFIG.email}`);
    console.log(`  ${colors.yellow}2.${colors.reset} Asegúrate de estar en el negocio: ${CONFIG.businessId}`);
    console.log(`  ${colors.yellow}3.${colors.reset} Ve al sidebar y haz clic en ${colors.green}"Juntos" 🤝${colors.reset}`);
    console.log(`  ${colors.yellow}4.${colors.reset} Haz clic en ${colors.green}"Unirme a un Programa"${colors.reset}`);
    console.log(`  ${colors.yellow}5.${colors.reset} Ingresa el código: ${colors.green}PRUEBA2025${colors.reset}`);
    console.log(`  ${colors.yellow}6.${colors.reset} Deberías ver el mensaje de éxito y el programa activo`);

    console.log('\n' + colors.cyan + '🔧 COMANDOS ÚTILES:' + colors.reset + '\n');
    console.log(`  ${colors.blue}# Desplegar reglas de Firestore${colors.reset}`);
    console.log(`  firebase deploy --only firestore:rules\n`);
    console.log(`  ${colors.blue}# Ver logs de Cloud Functions${colors.reset}`);
    console.log(`  firebase functions:log --only joinProgramByCode\n`);

    console.log('═'.repeat(70) + '\n');
  } catch (error) {
    console.log('\n' + '═'.repeat(70));
    log('❌', 'ERROR EN SETUP', colors.red);
    console.log('═'.repeat(70) + '\n');
    console.error(error);

    console.log('\n' + colors.yellow + '💡 SOLUCIONES POSIBLES:' + colors.reset + '\n');
    console.log('  • Verifica que wala-lat-firebase-adminsdk.json existe en /functions');
    console.log(`  • Verifica que el business ${CONFIG.businessId} existe`);
    console.log('  • Verifica que eres gerente de ese business');
    console.log('  • Revisa los permisos de Firebase Admin');
    console.log('  • Ejecuta: firebase login\n');

    process.exit(1);
  } finally {
    // Cerrar conexión
    setTimeout(() => process.exit(0), 1000);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EJECUTAR SCRIPT
// ═══════════════════════════════════════════════════════════════════════════
main();
