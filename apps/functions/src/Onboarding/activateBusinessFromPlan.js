/* eslint-disable */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Callable HTTPS: activateBusinessFromPlan
 * 
 * Permite a un participante de PlanSeed (o desde plan.wala.lat)
 * activar su negocio formal en el ERP de Wala con 1 solo clic.
 */
exports.activateBusinessFromPlan = onCall(
  {
    region: 'southamerica-east1',
    cors: true,
  },
  async (request) => {
    const { dni, email, password, displayName, userId } = request.data || {};

    if (!dni) {
      throw new HttpsError('invalid-argument', 'El DNI o identificador del participante es requerido.');
    }

    const cleanedDni = String(dni).trim();
    const partRef = db.collection('participants').doc(cleanedDni);
    const partSnap = await partRef.get();

    if (!partSnap.exists) {
      throw new HttpsError('not-found', `No se encontró un plan registrado para el DNI: ${cleanedDni}`);
    }

    const participant = partSnap.data();

    // 1. Resolver el usuario de Wala (request.auth, userId pasado, o crear nuevo)
    let uid = request.auth ? request.auth.uid : (userId || null);

    // Si no hay uid y se proporcionó email + password, crear cuenta en Firebase Auth
    if (!uid && email && password) {
      try {
        const userRecord = await admin.auth().createUser({
          email: String(email).trim().toLowerCase(),
          password: String(password),
          displayName: displayName || `${participant.personalInfo?.firstName || ''} ${participant.personalInfo?.lastName || ''}`.trim() || 'Emprendedor Wala',
        });
        uid = userRecord.uid;
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-exists') {
          const existingUser = await admin.auth().getUserByEmail(email);
          uid = existingUser.uid;
        } else {
          throw new HttpsError('internal', `Error creando credenciales de usuario: ${authErr.message}`);
        }
      }
    }

    if (!uid) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión o ingresar correo y contraseña para activar tu negocio.');
    }

    // 2. Si ya tenía un negocio asociado, devolverlo directamente
    if (participant.businessId) {
      const existingBizSnap = await db.collection('businesses').doc(participant.businessId).get();
      if (existingBizSnap.exists) {
        return {
          success: true,
          businessId: participant.businessId,
          alreadyExisted: true,
          redirectUrl: `https://wala.lat/business/${participant.businessId}/dashboard?from=plan_seed`
        };
      }
    }

    // 3. Generar nuevo ID de negocio
    const businessId = db.collection('businesses').doc().id;
    const now = FieldValue.serverTimestamp();
    const commercialName = participant.businessBasicInfo?.commercialName || `Emprendimiento ${cleanedDni}`;
    const industry = participant.businessBasicInfo?.sector || 'comercio_minorista';

    const newBusinessData = {
      id: businessId,
      name: commercialName,
      commercialName,
      ownerId: uid,
      industry,
      businessNature: participant.businessBasicInfo?.businessNature || 'produccion',
      planId: cleanedDni,
      currency: 'PEN',
      address: participant.personalInfo?.location?.address || '',
      phone: participant.personalInfo?.phone || '',
      origin: 'plan_seed',
      createdAt: now,
      updatedAt: now,
      subscription: {
        plan: 'free',
        status: 'active',
        createdAt: now
      }
    };

    const batch = db.batch();

    // Guardar nuevo documento en businesses/{businessId}
    batch.set(db.collection('businesses').doc(businessId), newBusinessData);

    // Enlazar businessId en users/{uid}
    const userRef = db.collection('users').doc(uid);
    batch.set(userRef, {
      id: uid,
      email: email || participant.personalInfo?.email || '',
      name: displayName || participant.personalInfo?.firstName || '',
      businessesIds: FieldValue.arrayUnion(businessId),
      updatedAt: now
    }, { merge: true });

    // Actualizar participante con su businessId y estado convertido
    batch.update(partRef, {
      businessId,
      userId: uid,
      'programStatus.status': 'convertido_wala',
      'syncMetadata.updatedAt': new Date().toISOString()
    });

    await batch.commit();

    return {
      success: true,
      businessId,
      alreadyExisted: false,
      redirectUrl: `https://wala.lat/business/${businessId}/dashboard?welcome=plan_seed`
    };
  }
);
