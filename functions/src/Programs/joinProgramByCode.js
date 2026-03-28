/* eslint-disable */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Timestamp, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');

function parseDateValue(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value?.toDate === 'function') {
    const dateFromTimestamp = value.toDate();
    return Number.isNaN(dateFromTimestamp.getTime()) ? null : dateFromTimestamp;
  }

  if (typeof value === 'number' || typeof value === 'string') {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  if (typeof value === 'object' && value !== null && typeof value._seconds === 'number') {
    const dateFromSeconds = new Date(value._seconds * 1000);
    return Number.isNaN(dateFromSeconds.getTime()) ? null : dateFromSeconds;
  }

  return null;
}

/**
 * Cloud Function: Unirse a un programa por código de invitación
 *
 * Validaciones críticas:
 * 1. Usuario autenticado (context.auth)
 * 2. Código válido, activo y no expirado
 * 3. Usuario es GERENTE del business (rol === "gerente")
 * 4. Business existe en /users/{uid}/businesses/{businessId} con activo === true
 * 5. No está ya afiliado al programa
 *
 * Crea:
 * - /programs/{programId}/memberships/{businessId}
 * - /users/{uid}/programs/{programId} (índice)
 *
 * Actualiza:
 * - Incrementa currentUses del invite
 */
exports.joinProgramByCode = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // ═══════════════════════════════════════════════════════════
    // VALIDACIÓN 1: Usuario autenticado
    // ═══════════════════════════════════════════════════════════
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Debes estar autenticado para unirte a un programa',
      );
    }

    const { code, businessId } = data;
    const uid = context.auth.uid;

    // ═══════════════════════════════════════════════════════════
    // VALIDACIÓN 2: Parámetros requeridos
    // ═══════════════════════════════════════════════════════════
    if (!code || typeof code !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'El código de invitación es requerido',
      );
    }

    if (!businessId || typeof businessId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'El ID del negocio es requerido',
      );
    }

    const db = admin.firestore();

    try {
      console.log(`🔐 [joinProgramByCode] Usuario: ${uid}, Business: ${businessId}, Código: ${code}`);

      // ═══════════════════════════════════════════════════════════
      // VALIDACIÓN 3: Verificar acceso al business
      // ═══════════════════════════════════════════════════════════
      const userBusinessRef = db
        .collection('users')
        .doc(uid)
        .collection('businesses')
        .doc(businessId);

      const userBusinessSnap = await userBusinessRef.get();

      if (!userBusinessSnap.exists) {
        console.warn(`⚠️  Usuario ${uid} no tiene acceso a business ${businessId}`);
        throw new functions.https.HttpsError(
          'permission-denied',
          'No tienes acceso a este negocio. Verifica que el negocio exista en tu cuenta.',
        );
      }

      const userBusinessData = userBusinessSnap.data();

      // Verificar que el negocio esté activo
      if (!userBusinessData.activo) {
        console.warn(`⚠️  Business ${businessId} está inactivo`);
        throw new functions.https.HttpsError(
          'permission-denied',
          'El negocio no está activo',
        );
      }

      // ═══════════════════════════════════════════════════════════
      // VALIDACIÓN 4: Solo GERENTES pueden afiliar negocios
      // ═══════════════════════════════════════════════════════════
      const userRole = userBusinessData.rol;

      if (userRole !== 'gerente') {
        console.warn(`⚠️  Usuario ${uid} no es gerente (rol: ${userRole})`);
        throw new functions.https.HttpsError(
          'permission-denied',
          'Solo los gerentes pueden unir el negocio a programas de acompañamiento',
        );
      }

      console.log(`✅ Usuario ${uid} es gerente del business ${businessId}`);

      // ═══════════════════════════════════════════════════════════
      // VALIDACIÓN 5: Buscar código en programas activos
      // ═══════════════════════════════════════════════════════════
      const codeUppercase = code.toUpperCase().trim();
      const codeHash = crypto.createHash('sha256').update(codeUppercase).digest('hex');

      console.log(`🔍 Buscando código: ${codeUppercase} (hash: ${codeHash})`);

      // Primero intentar código directo del programa (codUser)
      const codUserProgramSnapshot = await db
        .collection('programs')
        .where('codUser', '==', codeUppercase)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      let validInvite = null;
      let validProgramId = null;
      let validProgramData = null;
      let codeSource = null;

      if (!codUserProgramSnapshot.empty) {
        const programDoc = codUserProgramSnapshot.docs[0];
        validProgramId = programDoc.id;
        validProgramData = programDoc.data();
        codeSource = 'codUser';
        console.log(`✅ Código codUser válido para programa: ${validProgramId} (${validProgramData.name})`);
      }

      // Fallback: buscar en invites por hash si no hubo match en codUser
      const programsSnapshot = await db
        .collection('programs')
        .where('isActive', '==', true)
        .get();

      if (programsSnapshot.empty) {
        console.warn(`⚠️  No hay programas activos`);
        throw new functions.https.HttpsError(
          'not-found',
          'No hay programas disponibles en este momento',
        );
      }

      if (!validProgramId) {
        // Iterar sobre cada programa para buscar el código en invites
        for (const programDoc of programsSnapshot.docs) {
          const invitesSnapshot = await db
            .collection('programs')
            .doc(programDoc.id)
            .collection('invites')
            .where('codeHash', '==', codeHash)
            .where('isActive', '==', true)
            .limit(1)
            .get();

          if (!invitesSnapshot.empty) {
            const inviteDoc = invitesSnapshot.docs[0];
            const inviteData = inviteDoc.data();

            // Validar expiración
            if (inviteData.expiresAt) {
              const expiresAt = inviteData.expiresAt.toDate();
              const now = new Date();

              if (expiresAt < now) {
                console.warn(`⚠️  Código expirado: ${expiresAt} < ${now}`);
                throw new functions.https.HttpsError(
                  'failed-precondition',
                  `El código de invitación expiró el ${expiresAt.toLocaleDateString('es-PE')}`,
                );
              }
            }

            // Validar usos máximos
            if (inviteData.maxUses && inviteData.maxUses > 0) {
              if (inviteData.currentUses >= inviteData.maxUses) {
                console.warn(`⚠️  Código sin usos disponibles: ${inviteData.currentUses}/${inviteData.maxUses}`);
                throw new functions.https.HttpsError(
                  'failed-precondition',
                  'El código de invitación ha alcanzado el máximo de usos permitidos',
                );
              }
            }

            validInvite = {
              id: inviteDoc.id,
              ref: inviteDoc.ref,
              data: inviteData,
            };
            validProgramId = programDoc.id;
            validProgramData = programDoc.data();
            codeSource = 'invite';
            break;
          }
        }
      }

      if (!validProgramId) {
        console.warn(`⚠️  Código inválido o inactivo: ${codeUppercase}`);
        throw new functions.https.HttpsError(
          'not-found',
          'Código de invitación inválido o inactivo. Verifica con la organización que te proporcionó el código.',
        );
      }

      console.log(`✅ Código válido para programa: ${validProgramId} (${validProgramData.name}) | fuente=${codeSource || 'unknown'}`);

      // ═══════════════════════════════════════════════════════════
      // VALIDACIÓN 6: metadata.endDate obligatorio para activar premium
      // ═══════════════════════════════════════════════════════════
      const programEndDate = parseDateValue(validProgramData?.metadata?.endDate);

      if (!programEndDate) {
        console.warn(`⚠️  Programa ${validProgramId} sin metadata.endDate válido`);
        throw new functions.https.HttpsError(
          'failed-precondition',
          'El programa no tiene una fecha de culminación válida (metadata.endDate). Contacta al facilitador.',
        );
      }

      const programRef = db.collection('programs').doc(validProgramId);
      const membershipRef = programRef.collection('memberships').doc(businessId);
      const participantRef = programRef.collection('participants').doc(uid);
      const indexRef = db.collection('users').doc(uid).collection('programs').doc(validProgramId);
      const businessRef = db.collection('businesses').doc(businessId);
      let responseSubscription = null;

      await db.runTransaction(async (transaction) => {
        const [programSnapTx, membershipSnap, participantSnap, businessSnap] = await Promise.all([
          transaction.get(programRef),
          transaction.get(membershipRef),
          transaction.get(participantRef),
          transaction.get(businessRef),
        ]);

        if (!programSnapTx.exists) {
          throw new functions.https.HttpsError('not-found', 'El programa no existe');
        }

        if (!businessSnap.exists) {
          throw new functions.https.HttpsError('failed-precondition', 'No se encontró el negocio para aplicar la suscripción');
        }

        const membershipData = membershipSnap.exists ? membershipSnap.data() : null;
        const participantData = participantSnap.exists ? participantSnap.data() : null;

        if (membershipData?.status === 'active' || participantData?.status === 'active') {
          console.warn(`⚠️  Business ${businessId} ya está afiliado al programa ${validProgramId}`);
          throw new functions.https.HttpsError(
            'already-exists',
            `Tu negocio ya está participando en el programa "${validProgramData.name}"`,
          );
        }

        const businessData = businessSnap.data() || {};
        const existingSubscription = businessData.subscription || {};
        const existingEndDate = parseDateValue(existingSubscription.endDate);
        const hasUnlimitedPremium = existingSubscription?.status === 'active' &&
          ['premium', 'pro', 'max'].includes(existingSubscription?.plan) &&
          !existingSubscription?.endDate;

        let finalEndDate = Timestamp.fromDate(programEndDate);

        if (hasUnlimitedPremium) {
          finalEndDate = null;
        } else if (existingEndDate && existingEndDate > programEndDate) {
          finalEndDate = Timestamp.fromDate(existingEndDate);
        }

        const nowTimestamp = FieldValue.serverTimestamp();

        const membershipPayload = {
          userId: uid,
          businessId,
          status: 'active',
          inviteId: validInvite?.id || null,
          inviteCode: codeUppercase,
          leftAt: null,
          metadata: {
            currentPhase: validProgramData?.currentPhase || 'baseline',
            sessionsCompleted: membershipData?.metadata?.sessionsCompleted || 0,
            lastSessionAt: membershipData?.metadata?.lastSessionAt || null,
          },
        };

        if (membershipData) {
          membershipPayload.rejoinedAt = nowTimestamp;
        } else {
          membershipPayload.joinedAt = nowTimestamp;
        }

        const participantPayload = {
          userId: uid,
          userEmail: context.auth.token.email || '',
          userName: context.auth.token.name || 'Usuario',
          businessId,
          businessName: businessData.razonSocial || businessData.nombre || 'Sin nombre',
          role: 'participant',
          status: 'active',
          currentPhase: validProgramData?.currentPhase || 'baseline',
          leftAt: null,
          metadata: {
            totalActivitiesCompleted: participantData?.metadata?.totalActivitiesCompleted || 0,
            lastActivityAt: participantData?.metadata?.lastActivityAt || null,
            progressPercentage: participantData?.metadata?.progressPercentage || 0,
            attendanceRate: participantData?.metadata?.attendanceRate || 0,
          },
        };

        if (participantData) {
          participantPayload.rejoinedAt = nowTimestamp;
        } else {
          participantPayload.joinedAt = nowTimestamp;
        }

        const indexPayload = {
          programId: validProgramId,
          programName: validProgramData.name,
          organizationName: validProgramData.organizationName,
          businessId,
          status: 'active',
          role: 'participant',
          leftAt: null,
        };

        if (membershipData || participantData) {
          indexPayload.rejoinedAt = nowTimestamp;
        } else {
          indexPayload.joinedAt = nowTimestamp;
        }

        const subscriptionPayload = {
          ...existingSubscription,
          plan: 'pro',
          planType: 'pro_monthly',
          planVariant: 'pro_monthly',
          status: 'active',
          endDate: finalEndDate,
          updatedAt: nowTimestamp,
        };

        if (!existingSubscription?.startDate) {
          subscriptionPayload.startDate = nowTimestamp;
        }

        responseSubscription = {
          plan: 'pro',
          status: 'active',
          planType: 'pro_monthly',
          planVariant: 'pro_monthly',
          endDate: finalEndDate ? finalEndDate.toDate().toISOString() : null,
        };

        transaction.set(membershipRef, membershipPayload, { merge: true });
        transaction.set(participantRef, participantPayload, { merge: true });
        transaction.set(indexRef, indexPayload, { merge: true });
        transaction.set(
          businessRef,
          {
            programs: FieldValue.arrayUnion(validProgramId),
            subscription: subscriptionPayload,
            updatedAt: nowTimestamp,
          },
          { merge: true },
        );

        transaction.set(
          programRef,
          {
            metadata: {
              totalParticipants: FieldValue.increment(1),
            },
          },
          { merge: true },
        );

        if (validInvite?.ref) {
          transaction.update(validInvite.ref, {
            currentUses: FieldValue.increment(1),
            lastUsedAt: nowTimestamp,
            lastUsedBy: uid,
          });
        }
      });

      console.log(`✅ Join + subscription aplicados de forma transaccional para business ${businessId}`);

      // ═══════════════════════════════════════════════════════════
      // RESPUESTA EXITOSA
      // ═══════════════════════════════════════════════════════════
      return {
        success: true,
        programId: validProgramId,
        programName: validProgramData.name,
        organizationName: validProgramData.organizationName,
        subscription: responseSubscription,
        message: `¡Bienvenido al programa "${validProgramData.name}"! Tu negocio ahora forma parte de esta iniciativa de ${validProgramData.organizationName}.`,
      };
    } catch (error) {
      console.error('❌ Error en joinProgramByCode:', error);

      // Si es un error de Firebase Functions, re-lanzarlo
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      // Error genérico
      throw new functions.https.HttpsError(
        'internal',
        `Error al unirse al programa: ${error.message}`,
      );
    }
  });
