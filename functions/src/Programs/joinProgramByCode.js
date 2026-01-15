/* eslint-disable */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

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

      if (!userBusinessSnap.exists()) {
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

      // Buscar en todos los programas activos
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

      let validInvite = null;
      let validProgramId = null;
      let validProgramData = null;

      // Iterar sobre cada programa para buscar el código
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
          break;
        }
      }

      if (!validInvite) {
        console.warn(`⚠️  Código inválido o inactivo: ${codeUppercase}`);
        throw new functions.https.HttpsError(
          'not-found',
          'Código de invitación inválido o inactivo. Verifica con la organización que te proporcionó el código.',
        );
      }

      console.log(`✅ Código válido para programa: ${validProgramId} (${validProgramData.name})`);

      // ═══════════════════════════════════════════════════════════
      // VALIDACIÓN 6: Verificar que no esté ya afiliado
      // ═══════════════════════════════════════════════════════════
      const existingMembershipRef = db
        .collection('programs')
        .doc(validProgramId)
        .collection('memberships')
        .doc(businessId);

      const existingMembershipSnap = await existingMembershipRef.get();

      if (existingMembershipSnap.exists()) {
        const membershipData = existingMembershipSnap.data();

        if (membershipData.status === 'active') {
          console.warn(`⚠️  Business ${businessId} ya está afiliado al programa ${validProgramId}`);
          throw new functions.https.HttpsError(
            'already-exists',
            `Tu negocio ya está participando en el programa "${validProgramData.name}"`,
          );
        }

        // Si estaba como 'left', reactivar membership
        console.log(`🔄 Reactivando membership para business ${businessId}`);

        await existingMembershipRef.update({
          status: 'active',
          rejoinedAt: admin.firestore.FieldValue.serverTimestamp(),
          leftAt: null,
        });

        // Actualizar índice en user
        const indexRef = db
          .collection('users')
          .doc(uid)
          .collection('programs')
          .doc(validProgramId);

        await indexRef.update({
          status: 'active',
          rejoinedAt: admin.firestore.FieldValue.serverTimestamp(),
          leftAt: null,
        });

        console.log(`✅ Membership reactivada exitosamente`);

        return {
          success: true,
          programId: validProgramId,
          programName: validProgramData.name,
          organizationName: validProgramData.organizationName,
          message: `Te has vuelto a unir exitosamente al programa "${validProgramData.name}"`,
        };
      }

      // ═══════════════════════════════════════════════════════════
      // CREAR NUEVA MEMBERSHIP
      // ═══════════════════════════════════════════════════════════
      console.log(`📝 Creando nueva membership para business ${businessId}`);

      const newMembership = {
        userId: uid,
        businessId: businessId,
        status: 'active',
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        leftAt: null,
        inviteId: validInvite.id,
        inviteCode: codeUppercase,
        metadata: {
          currentPhase: 'baseline',
          sessionsCompleted: 0,
          lastSessionAt: null,
        },
      };

      await existingMembershipRef.set(newMembership);
      console.log(`✅ Membership creada en /programs/${validProgramId}/memberships/${businessId}`);

      // ═══════════════════════════════════════════════════════════
      // CREAR ÍNDICE EN USER
      // ═══════════════════════════════════════════════════════════
      const indexRef = db
        .collection('users')
        .doc(uid)
        .collection('programs')
        .doc(validProgramId);

      const indexData = {
        programId: validProgramId,
        programName: validProgramData.name,
        organizationName: validProgramData.organizationName,
        businessId: businessId,
        status: 'active',
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        leftAt: null,
        role: 'participant',
      };

      await indexRef.set(indexData);
      console.log(`✅ Índice creado en /users/${uid}/programs/${validProgramId}`);

      // ═══════════════════════════════════════════════════════════
      // INCREMENTAR USO DEL CÓDIGO
      // ═══════════════════════════════════════════════════════════
      await validInvite.ref.update({
        currentUses: admin.firestore.FieldValue.increment(1),
        lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUsedBy: uid,
      });

      console.log(`✅ Uso del código incrementado (${validInvite.data.currentUses + 1}/${validInvite.data.maxUses || '∞'})`);

      // ═══════════════════════════════════════════════════════════
      // RESPUESTA EXITOSA
      // ═══════════════════════════════════════════════════════════
      return {
        success: true,
        programId: validProgramId,
        programName: validProgramData.name,
        organizationName: validProgramData.organizationName,
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
