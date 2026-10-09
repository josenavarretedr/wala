/* eslint-disable */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { FieldValue, Timestamp } = require('firebase-admin/firestore');
const {
  normalizePlan,
  isPaidPlan,
  getFeaturesForPlan,
  buildSubscriptionPayload,
} = require('../Helpers/subscriptionHelper');

const ADMIN_EMAILS = [
  'josenavarretedr@gmail.com',
  'admin@wala.lat'
];

function validateAdmin(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
  }
  const email = request.auth.token.email;
  if (!email || !ADMIN_EMAILS.includes(email)) {
    throw new HttpsError('permission-denied', 'No tienes permisos de administrador.');
  }
}

function toTimestampOrNull(value) {
  if (!value) return null;

  if (typeof value?.toDate === 'function') {
    return Timestamp.fromDate(value.toDate());
  }

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return Timestamp.fromDate(value);
  }

  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return null;
  return Timestamp.fromDate(parsed);
}

// ═══════════════════════════════════════════════════════════
// FUNCIÓN 1: listar todos los negocios (para la tabla)
// ═══════════════════════════════════════════════════════════
exports.adminGetAllBusinesses = onCall(
  { region: 'us-central1', cors: true },
  async (request) => {
    validateAdmin(request);

    const db = admin.firestore();

    try {
      const businessesSnap = await db.collection('businesses').get();
      const businesses = [];

      for (const bDoc of businessesSnap.docs) {
        const bData = bDoc.data();

        // Serializar fechas para el cliente
        const serializeDate = (val) => {
          if (!val) return null;
          if (typeof val.toDate === 'function') return val.toDate().toISOString();
          if (val instanceof Date) return val.toISOString();
          return null;
        };

        businesses.push({
          businessId: bDoc.id,
          businessName: bData.nombre || bData.businessName || 'Sin nombre',
          ownerEmail: bData.ownerEmail || null,
          gerenteId: bData.gerenteId || null,
          activo: bData.activo !== false,
          tipo: bData.tipo || null,
          createdAt: serializeDate(bData.fechaCreacion || bData.createdAt),
          subscription: {
            plan: bData.subscription?.plan || 'free',
            status: bData.subscription?.status || 'active',
            startDate: serializeDate(bData.subscription?.startDate),
            endDate: serializeDate(bData.subscription?.endDate),
            planType: bData.subscription?.planType || null,
            planVariant: bData.subscription?.planVariant || null,
          },
          programs: bData.programs || [],
          features: bData.features || {},
        });
      }

      return { success: true, businesses };
    } catch (err) {
      console.error('Error en adminGetAllBusinesses:', err);
      throw new HttpsError('internal', err.message);
    }
  }
);

// ═══════════════════════════════════════════════════════════
// FUNCIÓN 2: listar programas activos (para el select del modal)
// ═══════════════════════════════════════════════════════════
exports.adminGetAllPrograms = onCall(
  { region: 'us-central1', cors: true },
  async (request) => {
    validateAdmin(request);

    const db = admin.firestore();

    try {
      const programsSnap = await db.collection('programs').where('isActive', '==', true).get();

      const programs = programsSnap.docs.map(pDoc => ({
        programId: pDoc.id,
        name: pDoc.data().name || 'Sin nombre',
        organizationName: pDoc.data().organizationName || '',
        isActive: pDoc.data().isActive,
        codUser: pDoc.data().codUser || null,
        endDate: pDoc.data().metadata?.endDate
          ? (typeof pDoc.data().metadata.endDate.toDate === 'function'
            ? pDoc.data().metadata.endDate.toDate().toISOString()
            : null)
          : null,
      }));

      return { success: true, programs };
    } catch (err) {
      console.error('Error en adminGetAllPrograms:', err);
      throw new HttpsError('internal', err.message);
    }
  }
);

// ═══════════════════════════════════════════════════════════
// FUNCIÓN 3: actualizar suscripción de un negocio
// ═══════════════════════════════════════════════════════════
exports.adminUpdateSubscription = onCall(
  { region: 'us-central1', cors: true },
  async (request) => {
    validateAdmin(request);

    const {
      businessId,
      plan,
      status,
      endDate,
      allowUnlimitedPaidPlan,
    } = request.data || {};

    if (!businessId) throw new HttpsError('invalid-argument', 'businessId requerido.');
    if (!['free', 'pro', 'max', 'premium'].includes(plan)) {
      throw new HttpsError('invalid-argument', 'Plan inválido. Use: free, pro, max, premium.');
    }

    const normalizedPlan = normalizePlan(plan);
    const isPaid = isPaidPlan(normalizedPlan);
    const unlimitedOverride = allowUnlimitedPaidPlan === true;

    if (isPaid && !endDate && !unlimitedOverride) {
      throw new HttpsError(
        'failed-precondition',
        'Los planes pagos requieren fecha de fin. Si deseas ilimitado, envía allowUnlimitedPaidPlan=true explícitamente.'
      );
    }

    const parsedEndDate = endDate ? toTimestampOrNull(endDate) : null;
    if (endDate && !parsedEndDate) {
      throw new HttpsError('invalid-argument', 'endDate inválida.');
    }

    const db = admin.firestore();
    const businessRef = db.collection('businesses').doc(businessId);
    const businessSnap = await businessRef.get();

    if (!businessSnap.exists) {
      throw new HttpsError('not-found', `Negocio ${businessId} no encontrado.`);
    }

    const existingSub = businessSnap.data().subscription || {};
    const nowTs = FieldValue.serverTimestamp();

    const subscriptionUpdate = buildSubscriptionPayload({
      existingSubscription: existingSub,
      targetPlan: normalizedPlan,
      status: status || 'active',
      endDate: normalizedPlan === 'free' ? null : parsedEndDate,
      nowTimestamp: nowTs,
      updatedBy: request.auth.uid,
    });

    if (isPaid && !parsedEndDate && unlimitedOverride) {
      subscriptionUpdate.adminUnlimitedOverride = true;
      subscriptionUpdate.adminUnlimitedOverrideBy = request.auth.uid;
      subscriptionUpdate.adminUnlimitedOverrideAt = nowTs;
    } else {
      subscriptionUpdate.adminUnlimitedOverride = false;
      subscriptionUpdate.adminUnlimitedOverrideBy = null;
      subscriptionUpdate.adminUnlimitedOverrideAt = null;
    }

    try {
      await businessRef.update({
        subscription: { ...existingSub, ...subscriptionUpdate },
        features: getFeaturesForPlan(normalizedPlan),
        updatedAt: nowTs,
      });

      console.log(`✅ Suscripción actualizada: ${businessId} → ${normalizedPlan}`);
      return {
        success: true,
        message: `Plan actualizado a ${normalizedPlan}.`,
        subscription: {
          plan: subscriptionUpdate.plan,
          status: subscriptionUpdate.status,
          endDate: subscriptionUpdate.endDate
            ? (typeof subscriptionUpdate.endDate.toDate === 'function'
              ? subscriptionUpdate.endDate.toDate().toISOString()
              : null)
            : null,
        },
        features: getFeaturesForPlan(normalizedPlan),
      };
    } catch (err) {
      console.error('Error actualizando suscripción:', err);
      throw new HttpsError('internal', err.message);
    }
  }
);

// ═══════════════════════════════════════════════════════════
// FUNCIÓN 4: inscribir un negocio a un programa (bypass admin)
// ═══════════════════════════════════════════════════════════
exports.adminEnrollBusinessInProgram = onCall(
  { region: 'us-central1', cors: true },
  async (request) => {
    validateAdmin(request);

    const { businessId, programId } = request.data || {};

    if (!businessId) throw new HttpsError('invalid-argument', 'businessId requerido.');
    if (!programId) throw new HttpsError('invalid-argument', 'programId requerido.');

    const db = admin.firestore();
    const businessRef = db.collection('businesses').doc(businessId);
    const programRef = db.collection('programs').doc(programId);
    const membershipRef = programRef.collection('memberships').doc(businessId);

    const [businessSnap, programSnap] = await Promise.all([
      businessRef.get(),
      programRef.get(),
    ]);

    if (!businessSnap.exists) throw new HttpsError('not-found', 'Negocio no encontrado.');
    if (!programSnap.exists) throw new HttpsError('not-found', 'Programa no encontrado.');

    const programData = programSnap.data();
    const businessData = businessSnap.data();
    const existingSub = businessData.subscription || {};

    const managerUid = businessData.gerenteId;
    if (!managerUid || typeof managerUid !== 'string') {
      throw new HttpsError(
        'failed-precondition',
        'El negocio no tiene un gerente válido (gerenteId).'
      );
    }

    const userProgramRef = db.collection('users').doc(managerUid).collection('programs').doc(programId);
    const participantRef = programRef.collection('participants').doc(managerUid);
    const userRef = db.collection('users').doc(managerUid);

    const existingPlan = normalizePlan(existingSub.plan || 'free');
    const shouldUpgradeFromFree = existingPlan === 'free';
    const programEndTimestamp = toTimestampOrNull(programData?.metadata?.endDate);

    if (shouldUpgradeFromFree && !programEndTimestamp) {
      throw new HttpsError(
        'failed-precondition',
        'No se puede inscribir: el programa no tiene metadata.endDate válida para definir el fin del premium.'
      );
    }

    const resolvedPlan = shouldUpgradeFromFree ? 'pro' : existingPlan;
    const resolvedFeatures = getFeaturesForPlan(resolvedPlan);

    const nowTs = FieldValue.serverTimestamp();
    let subscriptionUpdate = null;

    if (shouldUpgradeFromFree) {
      subscriptionUpdate = buildSubscriptionPayload({
        existingSubscription: existingSub,
        targetPlan: 'pro',
        status: 'active',
        endDate: programEndTimestamp,
        nowTimestamp: nowTs,
        updatedBy: request.auth.uid,
      });
    }

    try {
      await db.runTransaction(async (tx) => {
        const [membershipSnap, participantSnap, userSnap] = await Promise.all([
          tx.get(membershipRef),
          tx.get(participantRef),
          tx.get(userRef),
        ]);

        const membershipData = membershipSnap.exists ? membershipSnap.data() : null;
        const participantData = participantSnap.exists ? participantSnap.data() : null;
        const userData = userSnap.exists ? userSnap.data() : null;

        if (membershipData?.status === 'active' || participantData?.status === 'active') {
          throw new HttpsError('already-exists', 'El negocio ya está inscrito en este programa.');
        }

        const profile = userData?.profile || {};
        const hasMinimumProfile = Boolean(
          profile.name || profile.displayName || userData?.email || profile.email
        );

        if (!userSnap.exists || !hasMinimumProfile) {
          throw new HttpsError(
            'failed-precondition',
            'El gerente del negocio no tiene perfil mínimo para enrolar en programa.'
          );
        }

        const userDisplayName = profile.name || profile.displayName || userData?.email || 'Sin nombre';
        const userEmail = userData?.email || profile.email || null;

        tx.set(membershipRef, {
          businessId,
          userId: managerUid,
          status: 'active',
          joinedAt: membershipData?.joinedAt || nowTs,
          rejoinedAt: membershipData ? nowTs : null,
          leftAt: null,
          enrolledByAdmin: true,
          adminUid: request.auth.uid,
          metadata: {
            currentPhase: programData.currentPhase || 'baseline',
            source: 'admin',
          }
        }, { merge: true });

        tx.set(participantRef, {
          userId: managerUid,
          businessId,
          businessName: businessData.nombre || businessData.businessName || 'Sin nombre',
          participantName: userDisplayName,
          participantEmail: userEmail,
          status: 'active',
          joinedAt: participantData?.joinedAt || nowTs,
          rejoinedAt: participantData ? nowTs : null,
          leftAt: null,
          userRole: 'facilitator',
          enrolledByAdmin: true,
          adminUid: request.auth.uid,
        }, { merge: true });

        tx.set(userProgramRef, {
          programId,
          businessId,
          businessName: businessData.nombre || businessData.businessName || 'Sin nombre',
          programName: programData.name || 'Sin nombre',
          status: 'active',
          joinedAt: nowTs,
          source: 'admin',
          enrolledByAdmin: true,
        }, { merge: true });

        const updatePayload = {
          programs: FieldValue.arrayUnion(programId),
          features: resolvedFeatures,
          updatedAt: nowTs,
        };

        if (subscriptionUpdate) {
          updatePayload.subscription = subscriptionUpdate;
        }

        tx.set(businessRef, updatePayload, { merge: true });

        tx.set(programRef, {
          metadata: { totalParticipants: FieldValue.increment(1) }
        }, { merge: true });
      });

      console.log(`✅ Negocio ${businessId} inscrito en programa ${programId} por admin.`);
      return {
        success: true,
        message: `Negocio inscrito en "${programData.name}" exitosamente.`,
        subscriptionUpdated: !!subscriptionUpdate,
        subscription: subscriptionUpdate
          ? {
            plan: subscriptionUpdate.plan,
            status: subscriptionUpdate.status,
            endDate: subscriptionUpdate.endDate
              ? (typeof subscriptionUpdate.endDate.toDate === 'function'
                ? subscriptionUpdate.endDate.toDate().toISOString()
                : null)
              : null,
          }
          : {
            plan: resolvedPlan,
            status: existingSub.status || 'active',
            endDate: existingSub.endDate
              ? (typeof existingSub.endDate.toDate === 'function'
                ? existingSub.endDate.toDate().toISOString()
                : null)
              : null,
          },
        features: resolvedFeatures,
      };
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.error('Error inscribiendo negocio:', err);
      throw new HttpsError('internal', err.message);
    }
  }
);
