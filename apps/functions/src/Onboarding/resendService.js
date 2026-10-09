/* eslint-disable */
/**
 * resendService.js — Wrapper de Resend para emails de onboarding WALA
 * 
 * Responsabilidades:
 * - Inicializar Resend SDK con RESEND_API_KEY
 * - Enviar emails de onboarding con templates
 * - Guards anti-spam (max 1/día, max 8 en ventana, no duplicados)
 * - Logging a Firestore (onboardingEmails collection)
 */

const { Resend } = require('resend');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

// Inicializar admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ====== CONFIG ======
const FROM_EMAIL = 'WALA <copiloto@wala.lat>';
// Welcome no cuenta para el límite diario (es el email de arranque)
// Permite: welcome + 1 email de racha el mismo día de registro
const MAX_EMAILS_PER_DAY = 2;
const MAX_EMAILS_IN_WINDOW = 8;
const ONBOARDING_WINDOW_DAYS = 14;
// Emails que NO cuentan para el límite diario
const EXEMPT_FROM_DAILY_LIMIT = ['welcome'];

// ====== RESEND INSTANCE (lazy init) ======
let resendInstance = null;

function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('[ONBOARDING] RESEND_API_KEY no configurada en variables de entorno');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

// ====== HELPERS ======

/**
 * Genera el ID del documento de onboarding
 */
function getOnboardingDocId(userId, businessId) {
  return `${userId}_${businessId}`;
}

/**
 * Obtiene o crea el documento de onboarding para un usuario/negocio
 */
async function getOrCreateOnboardingDoc(userId, businessId, userData = {}) {
  const docId = getOnboardingDocId(userId, businessId);
  const docRef = db.collection('onboardingEmails').doc(docId);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    return { ref: docRef, data: docSnap.data(), isNew: false };
  }

  // Crear nuevo documento
  const now = new Date();
  const windowEnd = new Date(now.getTime() + ONBOARDING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const newDoc = {
    userId,
    businessId,
    email: userData.email || null,
    displayName: userData.displayName || userData.nombre || null,
    businessName: userData.businessName || null,

    status: 'active', // active | completed | paused | churned
    startedAt: FieldValue.serverTimestamp(),
    startedAtDate: now.toISOString(),

    emailsSent: [],

    lastEvaluatedAt: null,
    streakAtLastEval: null,

    hasRegisteredFirstTxn: false,
    firstTxnAt: null,
    highestStreakDuringOnboarding: 0,
    previousStreakBeforeReset: 0,

    onboardingWindowEnds: windowEnd,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(newDoc);
  console.log(`📧 [ONBOARDING] Doc creado: ${docId}`);

  return { ref: docRef, data: newDoc, isNew: true };
}

/**
 * Verifica si se puede enviar un email (anti-spam guards)
 * 
 * Reglas:
 * 1. Max 1 email por día
 * 2. Max 8 emails en toda la ventana de 14 días
 * 3. No enviar duplicados del mismo emailId
 * 4. No enviar si la ventana de onboarding ya terminó
 * 5. No enviar si el status no es "active"
 */
async function canSendEmail(userId, businessId, emailId) {
  const docId = getOnboardingDocId(userId, businessId);
  const docRef = db.collection('onboardingEmails').doc(docId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    // Si no existe doc, solo permitir 'welcome'
    return { allowed: emailId === 'welcome', reason: emailId === 'welcome' ? 'new-user' : 'no-onboarding-doc' };
  }

  const data = docSnap.data();

  // Status check
  if (data.status !== 'active') {
    return { allowed: false, reason: `status-${data.status}` };
  }

  // Window check (excepto para welcome que crea la ventana)
  if (emailId !== 'welcome') {
    const windowEnd = data.onboardingWindowEnds?.toDate?.() || new Date(data.onboardingWindowEnds);
    if (new Date() > windowEnd) {
      return { allowed: false, reason: 'window-expired' };
    }
  }

  const emailsSent = data.emailsSent || [];

  // Duplicate check
  const alreadySent = emailsSent.some(e => e.emailId === emailId);
  if (alreadySent) {
    return { allowed: false, reason: 'already-sent' };
  }

  // Daily limit (los emails en EXEMPT_FROM_DAILY_LIMIT no cuentan)
  if (!EXEMPT_FROM_DAILY_LIMIT.includes(emailId)) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const emailsToday = emailsSent.filter(e => {
      if (EXEMPT_FROM_DAILY_LIMIT.includes(e.emailId)) return false;
      const sentDate = e.sentAt?.toDate?.() || new Date(e.sentAt);
      return sentDate >= todayStart;
    });

    if (emailsToday.length >= MAX_EMAILS_PER_DAY) {
      console.log(`⏭️ [ONBOARDING] Daily limit reached (${emailsToday.length}/${MAX_EMAILS_PER_DAY}) for ${emailId}`);
      return { allowed: false, reason: 'daily-limit' };
    }
  }

  // Window limit
  if (emailsSent.length >= MAX_EMAILS_IN_WINDOW) {
    return { allowed: false, reason: 'window-limit' };
  }

  return { allowed: true, reason: 'ok' };
}

/**
 * Envía un email de onboarding
 * 
 * @param {Object} params
 * @param {string} params.userId - UID del usuario
 * @param {string} params.businessId - ID del negocio
 * @param {string} params.email - Email del destinatario
 * @param {string} params.emailId - ID del template (welcome, first-flame, etc.)
 * @param {string} params.subject - Asunto del email
 * @param {string} params.html - HTML del email
 * @param {Object} params.userData - Datos adicionales del usuario (para crear doc si no existe)
 * @returns {Object} { success, resendId?, error? }
 */
async function sendOnboardingEmail({ userId, businessId, email, emailId, subject, html, userData = {} }) {
  console.log(`📧 [ONBOARDING] Intentando enviar "${emailId}" a ${email}`);

  try {
    // Guard: verificar si se puede enviar
    const canSend = await canSendEmail(userId, businessId, emailId);
    if (!canSend.allowed) {
      console.log(`⏭️ [ONBOARDING] Email "${emailId}" bloqueado: ${canSend.reason}`);
      return { success: false, reason: canSend.reason };
    }

    // Enviar via Resend
    const resend = getResend();
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject,
      html,
    });

    if (resendError) {
      console.error(`❌ [ONBOARDING] Error Resend:`, resendError);
      return { success: false, error: resendError.message };
    }

    console.log(`✅ [ONBOARDING] Email "${emailId}" enviado. Resend ID: ${resendData.id}`);

    // Registrar en Firestore
    const { ref } = await getOrCreateOnboardingDoc(userId, businessId, {
      email,
      ...userData,
    });

    await ref.update({
      emailsSent: FieldValue.arrayUnion({
        emailId,
        sentAt: new Date().toISOString(),
        resendId: resendData.id,
      }),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, resendId: resendData.id };

  } catch (error) {
    console.error(`❌ [ONBOARDING] Error enviando "${emailId}":`, error.message);

    // Retry una vez después de 5 segundos
    try {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const resend = getResend();
      const { data: retryData, error: retryError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject,
        html,
      });

      if (retryError) {
        console.error(`❌ [ONBOARDING] Retry fallido:`, retryError);
        return { success: false, error: retryError.message };
      }

      console.log(`✅ [ONBOARDING] Email "${emailId}" enviado (retry). Resend ID: ${retryData.id}`);

      const { ref } = await getOrCreateOnboardingDoc(userId, businessId, {
        email,
        ...userData,
      });

      await ref.update({
        emailsSent: FieldValue.arrayUnion({
          emailId,
          sentAt: new Date().toISOString(),
          resendId: retryData.id,
          wasRetry: true,
        }),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return { success: true, resendId: retryData.id };

    } catch (retryErr) {
      console.error(`❌ [ONBOARDING] Retry final fallido:`, retryErr.message);
      return { success: false, error: retryErr.message };
    }
  }
}

/**
 * Actualiza el estado del documento de onboarding
 */
async function updateOnboardingStatus(userId, businessId, updates) {
  const docId = getOnboardingDocId(userId, businessId);
  const docRef = db.collection('onboardingEmails').doc(docId);

  try {
    await docRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error(`❌ [ONBOARDING] Error actualizando status:`, error.message);
    return false;
  }
}

/**
 * Obtiene el documento de onboarding (si existe)
 */
async function getOnboardingDoc(userId, businessId) {
  const docId = getOnboardingDocId(userId, businessId);
  const docRef = db.collection('onboardingEmails').doc(docId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) return null;
  return { ref: docRef, data: docSnap.data() };
}

/**
 * Verifica si un email específico ya fue enviado
 */
async function wasEmailSent(userId, businessId, emailId) {
  const doc = await getOnboardingDoc(userId, businessId);
  if (!doc) return false;
  return (doc.data.emailsSent || []).some(e => e.emailId === emailId);
}

module.exports = {
  sendOnboardingEmail,
  canSendEmail,
  getOrCreateOnboardingDoc,
  updateOnboardingStatus,
  getOnboardingDoc,
  getOnboardingDocId,
  wasEmailSent,
  FROM_EMAIL,
  ONBOARDING_WINDOW_DAYS,
};
