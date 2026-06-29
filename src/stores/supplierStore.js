import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { useBusinessStore } from './businessStore';

export const useSupplierStore = defineStore('supplierStore', () => {
  // State
  const suppliers = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const selectedSupplier = ref(null);
  const unsubscribeSuppliers = ref(null);

  // Getters
  const activeSuppliers = computed(() => {
    return suppliers.value.filter(supplier => supplier.isActive);
  });

  // Actions

  /**
   * Obtiene todos los proveedores del negocio con listener en tiempo real
   */
  async function fetchSuppliers(businessId) {
    if (!businessId) {
      console.warn('⚠️ No se proporcionó businessId');
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const db = getFirestore();
      const suppliersRef = collection(db, 'businesses', businessId, 'suppliers');

      // Configurar listener en tiempo real
      unsubscribeSuppliers.value = onSnapshot(
        suppliersRef,
        (snapshot) => {
          suppliers.value = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          }));
          console.log(`📋 ${suppliers.value.length} proveedores cargados`);
          loading.value = false;
        },
        (err) => {
          console.error('❌ Error en listener de proveedores:', err);
          error.value = err.message;
          loading.value = false;
        }
      );
    } catch (err) {
      console.error('❌ Error obteniendo proveedores:', err);
      error.value = err.message;
      loading.value = false;
    }
  }

  /**
   * Crea un nuevo proveedor
   * @param {Object} supplierData - Datos del proveedor
   * @param {Object} [initialMetadata] - Metadata inicial opcional
   */
  async function createSupplier(supplierData, initialMetadata = {}) {
    const businessStore = useBusinessStore();
    const businessId = businessStore.getBusinessId;

    if (!businessId) {
      throw new Error('No hay negocio activo');
    }

    loading.value = true;
    error.value = null;

    try {
      const db = getFirestore();
      const supplierId = crypto.randomUUID();
      const supplierRef = doc(db, 'businesses', businessId, 'suppliers', supplierId);

      const newSupplier = {
        supplierId: supplierId,
        name: supplierData.name,
        phone: supplierData.phone || null,
        businessId,
        isActive: true,
        totalExpenses: initialMetadata.totalExpenses ?? 0,
        pendingBalance: initialMetadata.pendingBalance ?? 0,
        transactionCount: initialMetadata.transactionCount ?? 0,
        lastExpense: initialMetadata.lastExpense ?? null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(supplierRef, newSupplier);
      console.log('✅ Proveedor creado:', supplierId);

      loading.value = false;
      return newSupplier;
    } catch (err) {
      console.error('❌ Error creando proveedor:', err);
      error.value = err.message;
      loading.value = false;
      throw err;
    }
  }

  /**
   * Actualiza un proveedor existente
   */
  async function updateSupplier(supplierId, updates) {
    const businessStore = useBusinessStore();
    const businessId = businessStore.getBusinessId;

    if (!businessId) {
      throw new Error('No hay negocio activo');
    }

    try {
      const db = getFirestore();
      const supplierRef = doc(db, 'businesses', businessId, 'suppliers', supplierId);

      await updateDoc(supplierRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      console.log('✅ Proveedor actualizado:', supplierId);
    } catch (err) {
      console.error('❌ Error actualizando proveedor:', err);
      error.value = err.message;
      throw err;
    }
  }

  /**
   * Busca proveedores por nombre o teléfono
   */
  function searchSuppliers(query) {
    if (!query || query.trim() === '') {
      return activeSuppliers.value;
    }

    const searchTerm = query.toLowerCase().trim();

    return activeSuppliers.value.filter(supplier => {
      const matchName = supplier.name.toLowerCase().includes(searchTerm);
      const matchPhone = supplier.phone && supplier.phone.includes(searchTerm);

      return matchName || matchPhone;
    });
  }

  /**
   * Actualiza la metadata calculada de un proveedor
   */
  async function updateSupplierMetadata(supplierId) {
    const businessStore = useBusinessStore();
    const businessId = businessStore.getBusinessId;

    if (!businessId) {
      throw new Error('No hay negocio activo');
    }

    try {
      const db = getFirestore();

      console.log(`🔍 Buscando transacciones del proveedor: ${supplierId}`);

      const transactionsRef = collection(db, 'businesses', businessId, 'transactions');
      const q = query(
        transactionsRef,
        where('supplierId', '==', supplierId),
        where('type', '==', 'expense')
      );

      const snapshot = await getDocs(q);

      console.log(`📊 Encontradas ${snapshot.size} transacciones tipo expense para el proveedor`);

      let totalExpenses = 0;
      let pendingBalance = 0;
      let lastExpense = null;
      const transactionCount = snapshot.size;

      snapshot.docs.forEach(doc => {
        const transaction = doc.data();

        totalExpenses += transaction.amount || 0;

        if (transaction.balance) {
          pendingBalance += transaction.balance;
        }

        if (transaction.createdAt) {
          const transactionTime = transaction.createdAt.toMillis ? transaction.createdAt.toMillis() : 0;
          const lastExpenseTime = lastExpense ? (lastExpense.toMillis ? lastExpense.toMillis() : 0) : 0;

          if (transactionTime > lastExpenseTime) {
            lastExpense = transaction.createdAt;
          }
        }
      });

      const supplierRef = doc(db, 'businesses', businessId, 'suppliers', supplierId);
      await updateDoc(supplierRef, {
        totalExpenses,
        pendingBalance,
        transactionCount,
        lastExpense,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Metadata actualizada para proveedor ${supplierId}:`, {
        totalExpenses,
        pendingBalance,
        transactionCount,
        lastExpense: lastExpense ? new Date(lastExpense.toMillis()).toISOString() : 'null'
      });
    } catch (err) {
      console.error('❌ Error actualizando metadata del proveedor:', err);
      throw err;
    }
  }

  function selectSupplier(supplier) {
    selectedSupplier.value = supplier;
  }

  function clearSelectedSupplier() {
    selectedSupplier.value = null;
  }

  async function deactivateSupplier(supplierId) {
    await updateSupplier(supplierId, { isActive: false });
  }

  function cleanup() {
    if (unsubscribeSuppliers.value) {
      unsubscribeSuppliers.value();
      unsubscribeSuppliers.value = null;
    }
  }

  return {
    // State
    suppliers,
    loading,
    error,
    selectedSupplier,

    // Getters
    activeSuppliers,

    // Actions
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    searchSuppliers,
    updateSupplierMetadata,
    selectSupplier,
    clearSelectedSupplier,
    deactivateSupplier,
    cleanup
  };
});
