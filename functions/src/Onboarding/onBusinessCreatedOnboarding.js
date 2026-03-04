/* eslint-disable */
/**
 * onBusinessCreatedOnboarding.js
 * 
 * Trigger: Firestore onCreate en businesses/{businessId} (v2)
 * 
 * Cuando se crea un nuevo negocio:
 * 1. Obtiene el email del owner desde users/{gerenteId} o Firebase Auth
 * 2. Crea el documento de onboarding en onboardingEmails/
 * 3. Envia el email de bienvenida (welcome)
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const { sendOnboardingEmail, getOrCreateOnboardingDoc } = require('./resendService');
const { welcome } = require('./templates/welcome');

/**
 * Obtiene el email y nombre del owner del negocio
 * Intenta Firestore primero, luego Firebase Auth como fallback
 */
async function getOwnerInfo(ownerId) {
  // Intentar desde Firestore (users collection)
  try {
    const userDoc = await db.collection('users').doc(ownerId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.email) {
        return {
          email: userData.email,
          nombre: userData.nombre || '',
          source: 'firestore',
        };
      }
    }
  } catch (err) {
    console.warn('⚠️ [ONBOARDING] Error leyendo users doc:', err.message);
  }

  // Fallback: Firebase Auth
  try {
    const authUser = await admin.auth().getUser(ownerId);
    return {
      email: authUser.email,
      nombre: authUser.displayName || '',
      source: 'auth',
    };
  } catch (err) {
    console.error('❌ [ONBOARDING] No se pudo obtener email del owner:', err.message);
    return null;
  }
}

/**
 * Cloud Function: onBusinessCreatedOnboarding (v2)
 * 
 * Se ejecuta cuando se crea un negocio nuevo.
 * Envía el email de bienvenida al owner.
 */
exports.onBusinessCreatedOnboarding = onDocumentCreated(
  {
    document: 'businesses/{businessId}',
    region: 'southamerica-east1',
  },
  async (event) => {
    const snap = event.data;
    const business = snap.data();
    const { businessId } = event.params;

    console.log(`📧 [ONBOARDING] Nuevo negocio detectado: ${business.businessName || businessId}`);

    // Obtener el owner ID
    const ownerId = business.gerenteId || business.owner;
    if (!ownerId) {
      console.error('❌ [ONBOARDING] No se encontro owner para el negocio', businessId);
      return null;
    }

    // Obtener info del owner (email, nombre)
    const ownerInfo = await getOwnerInfo(ownerId);
    if (!ownerInfo || !ownerInfo.email) {
      console.error('❌ [ONBOARDING] No se pudo obtener email del owner', ownerId);
      return null;
    }

    console.log(`📧 [ONBOARDING] Owner: ${ownerInfo.email} (${ownerInfo.nombre}) via ${ownerInfo.source}`);

    // Crear documento de onboarding
    await getOrCreateOnboardingDoc(ownerId, businessId, {
      email: ownerInfo.email,
      displayName: ownerInfo.nombre,
      businessName: business.businessName || business.nombre || '',
    });

    // Generar email de bienvenida
    const { subject, html } = welcome({
      nombre: ownerInfo.nombre,
      businessId,
    });

    // Enviar
    const result = await sendOnboardingEmail({
      userId: ownerId,
      businessId,
      email: ownerInfo.email,
      emailId: 'welcome',
      subject,
      html,
      userData: {
        displayName: ownerInfo.nombre,
        businessName: business.businessName || business.nombre || '',
      },
    });

    if (result.success) {
      console.log(`✅ [ONBOARDING] Email de bienvenida enviado a ${ownerInfo.email}`);
    } else {
      console.warn(`⚠️ [ONBOARDING] Email de bienvenida no enviado: ${result.reason || result.error}`);
    }

    return null;
  });
