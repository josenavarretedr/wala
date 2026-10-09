// src/stores/employeeStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { collection, collectionGroup, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { useAuthStore } from './authStore';
import { derivePermissions } from '@/config/roles/roleTemplates';

export const useEmployeeStore = defineStore('employee', () => {
  const isLoading = ref(false);
  const error = ref(null);
  const employees = ref([]);

  /**
   * Carga la lista completa de empleados (activos y desactivados)
   * consultando la subcolección 'businesses' de cada usuario.
   */
  async function loadEmployees(businessId) {
    isLoading.value = true;
    error.value = null;
    try {
      const q = query(collectionGroup(db, 'businesses'), where('businessId', '==', businessId));
      const querySnapshot = await getDocs(q);
      const list = [];

      for (const relDoc of querySnapshot.docs) {
        const relData = relDoc.data();
        const uid = relDoc.ref.parent.parent.id;

        // Omitir si es el gerente propietario original (el que crea el negocio)
        if (relData.rol === 'gerente') {
          continue;
        }

        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          list.push({
            uid,
            nombre: userData.nombre || 'Sin nombre',
            apellidos: userData.apellidos || '',
            email: userData.email,
            rol: relData.rol || 'empleado',
            rolNombre: relData.rolNombre || 'Empleado',
            activo: relData.activo !== false,
            permissions: relData.permissions || {},
            modulosAcceso: relData.modulosAcceso || [],
            canCreate: relData.canCreate !== false,
            canEdit: relData.canEdit === true,
            canDelete: relData.canDelete === true,
            fechaIngreso: relData.fechaIngreso?.toDate ? relData.fechaIngreso.toDate() : relData.fechaIngreso,
            desactivadoPor: relData.desactivadoPor || null,
            motivoDesactivacion: relData.motivoDesactivacion || ''
          });
        }
      }

      employees.value = list;
      return list;
    } catch (err) {
      console.error('❌ Error al cargar empleados:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Carga la actividad (últimas transacciones) registradas por un empleado específico
   */
  async function loadEmployeeActivity(businessId, employeeUid) {
    isLoading.value = true;
    error.value = null;
    try {
      const transactionsRef = collection(db, 'businesses', businessId, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', employeeUid)
      );
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
        });
      });
      // Ordenar por fecha descendente
      list.sort((a, b) => b.createdAt - a.createdAt);
      return list.slice(0, 30); // Top 30
    } catch (err) {
      console.error('❌ Error al cargar actividad de empleado:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Desactiva temporalmente a un empleado
   */
  async function disableEmployee(businessId, employeeUid, reason = '') {
    isLoading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      const relationRef = doc(db, 'users', employeeUid, 'businesses', businessId);
      
      const updateData = {
        activo: false,
        desactivadoPor: authStore.user?.uid || 'unknown',
        fechaDesactivacion: new Date(),
        motivoDesactivacion: reason
      };

      await updateDoc(relationRef, updateData);
      console.log('⛔ Empleado desactivado en DB.');

      // Actualizar estado local
      employees.value = employees.value.map((emp) => 
        emp.uid === employeeUid 
          ? { ...emp, activo: false, desactivadoPor: updateData.desactivadoPor, motivoDesactivacion: reason }
          : emp
      );
      return true;
    } catch (err) {
      console.error('❌ Error al desactivar empleado:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Reactiva a un empleado
   */
  async function reactivateEmployee(businessId, employeeUid) {
    isLoading.value = true;
    error.value = null;
    try {
      const relationRef = doc(db, 'users', employeeUid, 'businesses', businessId);
      
      const updateData = {
        activo: true,
        desactivadoPor: null,
        fechaDesactivacion: null,
        motivoDesactivacion: null
      };

      await updateDoc(relationRef, updateData);
      console.log('✅ Empleado reactivado en DB.');

      // Actualizar estado local
      employees.value = employees.value.map((emp) => 
        emp.uid === employeeUid 
          ? { ...emp, activo: true, desactivadoPor: null, motivoDesactivacion: null }
          : emp
      );
      return true;
    } catch (err) {
      console.error('❌ Error al reactivar empleado:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Actualiza el rol y los permisos de un empleado
   */
  async function updateEmployeePermissions(businessId, employeeUid, roleConfig) {
    isLoading.value = true;
    error.value = null;
    try {
      const relationRef = doc(db, 'users', employeeUid, 'businesses', businessId);
      const permissions = derivePermissions(
        roleConfig.modulosAcceso,
        roleConfig.canCreate,
        roleConfig.canEdit,
        roleConfig.canDelete
      );

      const updateData = {
        rolNombre: roleConfig.rolNombre,
        modulosAcceso: roleConfig.modulosAcceso,
        canCreate: roleConfig.canCreate,
        canEdit: roleConfig.canEdit,
        canDelete: roleConfig.canDelete,
        permissions
      };

      await updateDoc(relationRef, updateData);
      console.log('✅ Permisos de empleado actualizados en DB.');

      // Actualizar estado local
      employees.value = employees.value.map((emp) => 
        emp.uid === employeeUid 
          ? { ...emp, ...updateData }
          : emp
      );
      return true;
    } catch (err) {
      console.error('❌ Error al actualizar permisos del empleado:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    error,
    employees,
    loadEmployees,
    loadEmployeeActivity,
    disableEmployee,
    reactivateEmployee,
    updateEmployeePermissions
  };
});
