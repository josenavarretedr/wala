/* eslint-disable */
/**
 * onStreakUpdated.js — Emails reactivos basados en cambios de racha
 * 
 * Trigger: Firestore onUpdate en businesses/{businessId}
 * 
 * Escucha cambios en el campo `streak` del negocio y dispara emails
 * de onboarding cuando se alcanzan milestones o se pierde la racha.
 * 
 * Emails reactivos:
 * - first-flame: streak.current llega a 1 por primera vez
 * - streak-3: streak.current llega a 3
 * - streak-7: streak.current llega a 7 (North Star!)
 * - streak-lost: streak.current baja a 0 (teniendo >= 2 antes)
 */

const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const {
  sendOnboardingEmail,
  getOnboardingDoc,
  updateOnboardingStatus,
  wasEmailSent,
} = require('./resendService');

const { firstFlame } = require('./templates/firstFlame');
const { streak3 } = require('./templates/streak3');
const { streak7 } = require('./templates/streak7');
const { streakLost } = require('./templates/streakLost');

// ====== HELPERS ======

/**
 * Obtiene la info del owner para enviar el email
 */
async function getOwnerEmailInfo(ownerId) {
  // Firestore users collection
  try {
    const userDoc = await db.collection('users').doc(ownerId).get();
    if (userDoc.exists) {
      const data = userDoc.data();
      if (data.email) {
        return { email: data.email, nombre: data.nombre || '' };
      }
    }
  } catch (err) {
    console.warn('⚠️ [STREAK-EMAIL] Error leyendo user doc:', err.message);
  }

  // Fallback: Firebase Auth
  try {
    const authUser = await admin.auth().getUser(ownerId);
    return { email: authUser.email, nombre: authUser.displayName || '' };
  } catch (err) {
    console.error('❌ [STREAK-EMAIL] No se pudo obtener info del owner:', err.message);
    return null;
  }
}

/**
 * Verifica si el negocio está en ventana de onboarding activa.
 * Si el doc no existe (race condition al crear negocio), retorna true
 * siempre que sea dentro del periodo inicial (primeras 2 horas = primer dia).
 */
async function isInOnboardingWindow(ownerId, businessId) {
  const doc = await getOnboardingDoc(ownerId, businessId);

  if (!doc) {
    // Doc no existe aun: puede ser race condition entre onCreate y onUpdate.
    // Loguear para diagnostico pero no bloquear si el business es muy reciente.
    console.warn(`⚠️ [STREAK-EMAIL] onboardingEmails doc no encontrado para ${ownerId}_${businessId}`);
    // Retornar false - el email se perdera si el doc no existe.
    // La solucion correcta es que onBusinessCreatedOnboarding cree el doc antes
    // de que onStreakUpdated pueda dispararse.
    return false;
  }

  const data = doc.data;

  if (data.status !== 'active') {
    console.log(`⏭️ [STREAK-EMAIL] Status no activo: "${data.status}" para ${ownerId}_${businessId}`);
    return false;
  }

  const windowEnd = data.onboardingWindowEnds?.toDate?.() || new Date(data.onboardingWindowEnds);
  const now = new Date();
  const inWindow = now <= windowEnd;

  if (!inWindow) {
    console.log(`⏭️ [STREAK-EMAIL] Ventana expirada. End: ${windowEnd.toISOString()}, Now: ${now.toISOString()}`);
  }

  return inWindow;
}

// ====== STREAK MILESTONE HANDLERS ======

/**
 * Maneja cuando streak.current llega a 1 por primera vez
 */
async function handleFirstFlame(ownerId, businessId, ownerInfo) {
  // Solo enviar si no se ha enviado antes
  const alreadySent = await wasEmailSent(ownerId, businessId, 'first-flame');
  if (alreadySent) return null;

  const { subject, html } = firstFlame({
    nombre: ownerInfo.nombre,
    businessId,
  });

  // Marcar que ya registro primera transaccion
  await updateOnboardingStatus(ownerId, businessId, {
    hasRegisteredFirstTxn: true,
    firstTxnAt: new Date().toISOString(),
  });

  return sendOnboardingEmail({
    userId: ownerId,
    businessId,
    email: ownerInfo.email,
    emailId: 'first-flame',
    subject,
    html,
  });
}

/**
 * Maneja cuando streak.current llega a 3
 */
async function handleStreak3(ownerId, businessId, ownerInfo) {
  const { subject, html } = streak3({
    nombre: ownerInfo.nombre,
    businessId,
  });

  return sendOnboardingEmail({
    userId: ownerId,
    businessId,
    email: ownerInfo.email,
    emailId: 'streak-3',
    subject,
    html,
  });
}

/**
 * Maneja cuando streak.current llega a 7 (NORTH STAR!)
 */
async function handleStreak7(ownerId, businessId, ownerInfo) {
  const { subject, html } = streak7({
    nombre: ownerInfo.nombre,
    businessId,
  });

  const result = await sendOnboardingEmail({
    userId: ownerId,
    businessId,
    email: ownerInfo.email,
    emailId: 'streak-7',
    subject,
    html,
  });

  // Marcar hito de 7 dias alcanzado
  if (result.success) {
    await updateOnboardingStatus(ownerId, businessId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      completionReason: 'streak-7-reached',
    });
  }

  return result;
}

/**
 * Maneja cuando la racha se pierde (current baja a 0 desde >= 2)
 */
async function handleStreakLost(ownerId, businessId, ownerInfo, previousStreak) {
  // Guardar racha anterior para el template
  await updateOnboardingStatus(ownerId, businessId, {
    previousStreakBeforeReset: previousStreak,
  });

  const { subject, html } = streakLost({
    nombre: ownerInfo.nombre,
    businessId,
    previousStreak,
  });

  return sendOnboardingEmail({
    userId: ownerId,
    businessId,
    email: ownerInfo.email,
    emailId: 'streak-lost',
    subject,
    html,
  });
}

// ====== MAIN TRIGGER ======

exports.onStreakUpdated = onDocumentUpdated(
  {
    document: 'businesses/{businessId}',
    region: 'southamerica-east1',
  },
  async (event) => {
    const { businessId } = event.params;
    const before = event.data.before.data();
    const after = event.data.after.data();

    // Solo procesar si cambió el streak
    const streakBefore = before.streak || {};
    const streakAfter = after.streak || {};

    const currentBefore = Number(streakBefore.current || 0);
    const currentAfter = Number(streakAfter.current || 0);

    // Si no cambió streak.current, no hacer nada
    if (currentBefore === currentAfter) {
      return null;
    }

    console.log(`🔥 [STREAK-EMAIL] Streak cambio: ${currentBefore} → ${currentAfter} (Business: ${businessId})`);

    // Obtener owner ID
    const ownerId = after.gerenteId || after.owner;
    if (!ownerId) {
      console.warn('⚠️ [STREAK-EMAIL] No se encontro owner para', businessId);
      return null;
    }

    console.log(`👤 [STREAK-EMAIL] Owner ID: ${ownerId}`);

    // Verificar si está en ventana de onboarding
    const inWindow = await isInOnboardingWindow(ownerId, businessId);
    if (!inWindow) {
      console.log(`⏭️ [STREAK-EMAIL] Negocio ${businessId} fuera de ventana de onboarding`);
      return null;
    }

    // Obtener info del owner
    const ownerInfo = await getOwnerEmailInfo(ownerId);
    if (!ownerInfo || !ownerInfo.email) {
      console.error('❌ [STREAK-EMAIL] No se pudo obtener email del owner', ownerId);
      return null;
    }

    console.log(`📧 [STREAK-EMAIL] Procesando para: ${ownerInfo.email}, streak: ${currentBefore} → ${currentAfter}`);

    // Actualizar highestStreak si corresponde
    const onboardingDoc = await getOnboardingDoc(ownerId, businessId);
    if (onboardingDoc) {
      const currentHighest = onboardingDoc.data.highestStreakDuringOnboarding || 0;
      if (currentAfter > currentHighest) {
        await updateOnboardingStatus(ownerId, businessId, {
          highestStreakDuringOnboarding: currentAfter,
          streakAtLastEval: {
            current: currentAfter,
            lastActiveDay: streakAfter.lastActiveDay || null,
            isActiveToday: true,
          },
          lastEvaluatedAt: new Date().toISOString(),
        });
      }
    }

    // ====== DETERMINAR QUE EMAIL ENVIAR ======

    try {
      // CASO 1: Racha llega a 1 por primera vez (primera transaccion!)
      if (currentAfter === 1 && currentBefore === 0) {
        console.log('🔥 [STREAK-EMAIL] Primera llama encendida!');
        const result = await handleFirstFlame(ownerId, businessId, ownerInfo);
        if (result) {
          console.log(`📧 [STREAK-EMAIL] first-flame: ${result.success ? '✅ enviado' : '⏭️ ' + result.reason}`);
        }
      }

      // CASO 2: Racha llega a 3
      if (currentAfter === 3 && currentBefore < 3) {
        console.log('🔥🔥🔥 [STREAK-EMAIL] Racha de 3!');
        const result = await handleStreak3(ownerId, businessId, ownerInfo);
        console.log(`📧 [STREAK-EMAIL] streak-3: ${result.success ? '✅ enviado' : '⏭️ ' + result.reason}`);
      }

      // CASO 3: Racha llega a 7 (NORTH STAR!)
      if (currentAfter === 7 && currentBefore < 7) {
        console.log('🏆 [STREAK-EMAIL] RACHA DE 7! North Star alcanzado!');
        const result = await handleStreak7(ownerId, businessId, ownerInfo);
        console.log(`📧 [STREAK-EMAIL] streak-7: ${result.success ? '✅ enviado' : '⏭️ ' + result.reason}`);
      }

      // CASO 4: Racha se perdio (current baja a 0 desde >= 2)
      // NOTA: cuando streak se resetea a 1 (no a 0), no cuenta como "perdida"
      // Solo cuando baja explicitamente a 0 (por reversion de transaccion eliminada)
      if (currentAfter === 0 && currentBefore >= 2) {
        console.log(`❄️ [STREAK-EMAIL] Racha perdida: ${currentBefore} → 0`);
        const result = await handleStreakLost(ownerId, businessId, ownerInfo, currentBefore);
        console.log(`📧 [STREAK-EMAIL] streak-lost: ${result.success ? '✅ enviado' : '⏭️ ' + result.reason}`);
      }

      // CASO 5: Racha se rompio y reseteo a 1 (gap excedido)
      // El streakManager resetea a 1 (no a 0) cuando el gap excede allowedGap
      // Detectar: currentAfter === 1 Y currentBefore >= 3 (era una racha real que se rompio)
      if (currentAfter === 1 && currentBefore >= 3) {
        console.log(`❄️ [STREAK-EMAIL] Racha rota por gap: ${currentBefore} → 1`);
        const result = await handleStreakLost(ownerId, businessId, ownerInfo, currentBefore);
        console.log(`📧 [STREAK-EMAIL] streak-lost (gap): ${result.success ? '✅ enviado' : '⏭️ ' + result.reason}`);
      }

    } catch (error) {
      console.error('❌ [STREAK-EMAIL] Error procesando email:', error.message);
      // No lanzar error para no interrumpir el update del business doc
    }

    return null;
  });
