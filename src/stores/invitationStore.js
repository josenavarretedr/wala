// src/stores/invitationStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { collection, doc, getDoc, setDoc, query, where, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { useAuthStore } from './authStore';
import { derivePermissions } from '@/config/roles/roleTemplates';

export const useInvitationStore = defineStore('invitation', () => {
  const isLoading = ref(false);
  const error = ref(null);
  const invitations = ref([]);

  // Generar un token aleatorio simple de 10 caracteres
  function generateToken() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 10; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Crea una invitación en Firestore
   */
  async function createInvitation(businessId, businessName, roleConfig) {
    isLoading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      const token = generateToken();
      const invitationId = doc(collection(db, 'businesses', businessId, 'invitations')).id;
      
      const permissions = derivePermissions(
        roleConfig.modulosAcceso,
        roleConfig.canCreate,
        roleConfig.canEdit,
        roleConfig.canDelete
      );

      const invitationData = {
        id: invitationId,
        token,
        rolNombre: roleConfig.rolNombre,
        rolSistema: 'empleado',
        permissions,
        modulosAcceso: roleConfig.modulosAcceso,
        canCreate: roleConfig.canCreate,
        canEdit: roleConfig.canEdit,
        canDelete: roleConfig.canDelete,
        createdBy: authStore.user?.uid || 'unknown',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días de expiración
        status: 'active',
        usedBy: null,
        usedAt: null,
        businessName,
        businessId
      };

      const docRef = doc(db, 'businesses', businessId, 'invitations', invitationId);
      await setDoc(docRef, invitationData);

      console.log('✅ Invitación creada exitosamente:', invitationData);
      return invitationData;
    } catch (err) {
      console.error('❌ Error al crear invitación:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Carga todas las invitaciones de un negocio
   */
  async function loadInvitations(businessId) {
    isLoading.value = true;
    error.value = null;
    try {
      const q = query(collection(db, 'businesses', businessId, 'invitations'));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Convertir timestamps si existen
        items.push({
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : data.expiresAt,
        });
      });
      
      // Auto-limpiar expiradas
      const now = new Date();
      items.forEach(async (inv) => {
        if (inv.status === 'active' && inv.expiresAt < now) {
          inv.status = 'expired';
          const docRef = doc(db, 'businesses', businessId, 'invitations', inv.id);
          await updateDoc(docRef, { status: 'expired' });
        }
      });

      invitations.value = items;
      return items;
    } catch (err) {
      console.error('❌ Error al cargar invitaciones:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Busca una invitación activa por su token (usa Collection Group Query)
   */
  async function getInvitationByToken(token) {
    isLoading.value = true;
    error.value = null;
    try {
      // Nota: En Firestore, para un collection group query de subcolecciones 'invitations',
      // necesitamos buscar en toda la base de datos de subcolecciones 'invitations' con el token
      // Para simplificar y evitar problemas si no hay índices definidos de antemano para Collection Groups,
      // usaremos getDocs con una búsqueda en las invitaciones si tenemos el token.
      // Firebase soporta collectionGroup(db, 'invitations') pero requiere habilitar el índice en la consola
      // de Firebase. Para mayor robustez en desarrollo, buscaremos con collectionGroup.
      const { collectionGroup } = await import('firebase/firestore');
      const invitationsRef = collectionGroup(db, 'invitations');
      const q = query(invitationsRef, where('token', '==', token), where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      let invitation = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        invitation = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : data.expiresAt,
        };
      });

      // Verificar expiración
      if (invitation && invitation.expiresAt < new Date()) {
        const docRef = doc(db, 'businesses', invitation.businessId, 'invitations', invitation.id);
        await updateDoc(docRef, { status: 'expired' });
        return null;
      }

      return invitation;
    } catch (err) {
      console.error('❌ Error al buscar invitación por token:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Acepta y usa una invitación vinculando al trabajador al negocio
   */
  async function useInvitation(token, userProfile) {
    isLoading.value = true;
    error.value = null;
    try {
      const inv = await getInvitationByToken(token);
      if (!inv) {
        throw new Error('La invitación no existe, ya fue usada o ha expirado.');
      }

      const uid = userProfile.uid;
      const batch = writeBatch(db);

      // 1. Vincular negocio en users/{uid}/businesses/{businessId}
      const relationRef = doc(db, 'users', uid, 'businesses', inv.businessId);
      const relationData = {
        businessId: inv.businessId,
        businessName: inv.businessName,
        rol: 'empleado',
        rolNombre: inv.rolNombre,
        permissions: inv.permissions,
        modulosAcceso: inv.modulosAcceso,
        canCreate: inv.canCreate,
        canEdit: inv.canEdit,
        canDelete: inv.canDelete,
        fechaIngreso: new Date(),
        activo: true,
        esPrincipal: false, // Por defecto no es el principal a menos que sea el único
        estadoInvitacion: 'aceptada',
        invitadoPor: inv.createdBy
      };
      batch.set(relationRef, relationData);

      // 2. Marcar invitación como usada
      const invitationRef = doc(db, 'businesses', inv.businessId, 'invitations', inv.id);
      batch.update(invitationRef, {
        status: 'used',
        usedBy: uid,
        usedAt: new Date()
      });

      // 3. Registrar al empleado en la colección users si es necesario actualizar su negocio principal
      // Pero no cambiamos el businessId principal del usuario a menos que él lo seleccione
      
      await batch.commit();
      console.log('✅ Invitación aceptada exitosamente. Relación creada.');
      return inv;
    } catch (err) {
      console.error('❌ Error al aceptar invitación:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Cancela una invitación activa
   */
  async function cancelInvitation(businessId, invitationId) {
    isLoading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'businesses', businessId, 'invitations', invitationId);
      await updateDoc(docRef, { status: 'cancelled' });
      console.log('✅ Invitación cancelada exitosamente.');
      
      // Actualizar estado local
      invitations.value = invitations.value.map(inv => 
        inv.id === invitationId ? { ...inv, status: 'cancelled' } : inv
      );
    } catch (err) {
      console.error('❌ Error al cancelar invitación:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    error,
    invitations,
    createInvitation,
    loadInvitations,
    getInvitationByToken,
    useInvitation,
    cancelInvitation
  };
});
