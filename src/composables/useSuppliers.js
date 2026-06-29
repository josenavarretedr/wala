import { ref, computed } from 'vue';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import appFirebase from '@/firebaseInit';
import { ensureBusinessId } from '@/composables/useBusinessUtils';
import { v4 as uuidv4 } from 'uuid';

const db = getFirestore(appFirebase);

/**
 * Composable para gestionar proveedores
 */
export function useSuppliers() {
  const suppliers = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const searchQuery = ref('');

  /**
   * Obtener todos los proveedores activos del negocio
   */
  async function fetchAllSuppliers() {
    const currentBusinessId = ensureBusinessId();

    if (!currentBusinessId) {
      error.value = 'No hay negocio activo';
      return [];
    }

    loading.value = true;
    error.value = null;

    try {
      console.log('🔄 Cargando proveedores desde Firestore...');
      const suppliersRef = collection(
        db,
        'businesses',
        currentBusinessId,
        'suppliers'
      );

      const q = query(
        suppliersRef,
        where('isActive', '==', true),
        orderBy('name', 'asc'),
        limit(200)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        supplierId: doc.id,
        ...doc.data()
      }));

      suppliers.value = results;
      console.log(`✅ ${results.length} proveedores cargados`);
      return results;
    } catch (err) {
      console.error('❌ Error cargando proveedores:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  }

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Proveedores filtrados por búsqueda local
   */
  const filteredSuppliers = computed(() => {
    if (!searchQuery.value.trim()) {
      return suppliers.value;
    }

    const term = normalizeText(searchQuery.value);

    return suppliers.value.filter(supplier => {
      const nameMatch = supplier.name && normalizeText(supplier.name).includes(term);
      const phoneMatch = supplier.phone && supplier.phone.includes(term);
      return nameMatch || phoneMatch;
    });
  });

  const suppliersStats = computed(() => {
    const total = suppliers.value.length;
    const withDebt = suppliers.value.filter(s => s.pendingBalance > 0).length;
    const totalDebt = suppliers.value.reduce((sum, s) => sum + (s.pendingBalance || 0), 0);

    return {
      total,
      withDebt,
      totalDebt
    };
  });

  /**
   * Registrar un nuevo proveedor
   */
  async function createSupplier(supplierData) {
    const currentBusinessId = ensureBusinessId();

    if (!currentBusinessId) {
      throw new Error('No hay negocio activo');
    }

    if (!supplierData.name || !supplierData.name.trim()) {
      throw new Error('El nombre del proveedor es obligatorio');
    }

    loading.value = true;
    error.value = null;

    try {
      const supplierId = uuidv4();
      const supplierRef = doc(
        db,
        'businesses',
        currentBusinessId,
        'suppliers',
        supplierId
      );

      const newSupplier = {
        supplierId: supplierId,
        name: supplierData.name.trim(),
        phone: supplierData.phone ? supplierData.phone.trim() : null,
        businessId: currentBusinessId,
        isActive: true,
        totalExpenses: 0,
        pendingBalance: 0,
        transactionCount: 0,
        lastExpense: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(supplierRef, newSupplier);
      console.log('✅ Proveedor creado:', supplierId);

      await fetchAllSuppliers();
      return supplierId;
    } catch (err) {
      console.error('❌ Error creando proveedor:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Actualizar datos de un proveedor
   */
  async function updateSupplier(supplierId, updates) {
    const currentBusinessId = ensureBusinessId();

    if (!currentBusinessId) {
      throw new Error('No hay negocio activo');
    }

    if (!supplierId) {
      throw new Error('ID de proveedor no válido');
    }

    loading.value = true;
    error.value = null;

    try {
      const supplierRef = doc(
        db,
        'businesses',
        currentBusinessId,
        'suppliers',
        supplierId
      );

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await updateDoc(supplierRef, updateData);
      console.log('✅ Proveedor actualizado:', supplierId);

      await fetchAllSuppliers();
      return true;
    } catch (err) {
      console.error('❌ Error actualizando proveedor:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Eliminar proveedor (lógico - marca como inactivo)
   */
  async function deleteSupplier(supplierId) {
    const currentBusinessId = ensureBusinessId();

    if (!currentBusinessId) {
      throw new Error('No hay negocio activo');
    }

    if (!supplierId) {
      throw new Error('ID de proveedor no válido');
    }

    loading.value = true;
    error.value = null;

    try {
      const supplierRef = doc(
        db,
        'businesses',
        currentBusinessId,
        'suppliers',
        supplierId
      );

      await updateDoc(supplierRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Proveedor eliminado (lógico):', supplierId);
      await fetchAllSuppliers();
      return true;
    } catch (err) {
      console.error('❌ Error eliminando proveedor:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    suppliers,
    loading,
    error,
    searchQuery,
    filteredSuppliers,
    suppliersStats,
    fetchAllSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
  };
}

/**
 * Composable para obtener detalles de un proveedor específico
 */
export function useSupplierDetails(supplierId) {
  const supplier = ref(null);
  const transactions = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchSupplier() {
    const currentBusinessId = ensureBusinessId();

    if (!currentBusinessId || !supplierId) {
      error.value = 'Datos insuficientes';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const supplierRef = doc(
        db,
        'businesses',
        currentBusinessId,
        'suppliers',
        supplierId
      );

      const supplierDoc = await getDoc(supplierRef);

      if (!supplierDoc.exists()) {
        throw new Error('Proveedor no encontrado');
      }

      supplier.value = {
        id: supplierDoc.id,
        supplierId: supplierDoc.id,
        ...supplierDoc.data()
      };
    } catch (err) {
      console.error('Error obteniendo proveedor:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSupplierTransactions() {
    const currentBusinessId = ensureBusinessId();

    if (!currentBusinessId || !supplierId) {
      return;
    }

    loading.value = true;

    try {
      const transactionsRef = collection(
        db,
        'businesses',
        currentBusinessId,
        'transactions'
      );

      const q = query(
        transactionsRef,
        where('supplierId', '==', supplierId),
        where('type', '==', 'expense'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      transactions.value = snapshot.docs.map(doc => ({
        id: doc.id,
        uuid: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.error('Error obteniendo transacciones del proveedor:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  const financialStats = computed(() => {
    const total = supplier.value?.totalExpenses || 0;
    const pending = supplier.value?.pendingBalance || 0;
    const paid = total - pending;

    return {
      totalExpenses: total,
      totalPaid: paid,
      pendingBalance: pending,
      transactionCount: supplier.value?.transactionCount || 0
    };
  });

  const topProducts = computed(() => {
    const productMap = new Map();

    transactions.value.forEach(transaction => {
      if (transaction.materialItems && Array.isArray(transaction.materialItems)) {
        transaction.materialItems.forEach(item => {
          const key = item.productId || item.uuid || item.description;
          if (productMap.has(key)) {
            const existing = productMap.get(key);
            existing.quantity += item.quantity || 0;
            existing.totalAmount += (item.quantity || 0) * (item.cost || 0);
          } else {
            productMap.set(key, {
              name: item.description || 'Sin descripción',
              productId: item.productId || item.uuid,
              quantity: item.quantity || 0,
              totalAmount: (item.quantity || 0) * (item.cost || 0)
            });
          }
        });
      }
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  });

  const expensesByMonth = computed(() => {
    const monthsMap = new Map();
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      monthsMap.set(label, 0);
    }

    transactions.value.forEach(transaction => {
      if (transaction.createdAt) {
        const date = transaction.createdAt.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt);
        const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();

        if (diffMonths >= 0 && diffMonths < 12) {
          const label = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
          if (monthsMap.has(label)) {
            monthsMap.set(label, monthsMap.get(label) + (transaction.amount || 0));
          }
        }
      }
    });

    return Array.from(monthsMap.entries()).map(([month, amount]) => ({
      month,
      amount
    }));
  });

  return {
    supplier,
    transactions,
    loading,
    error,
    fetchSupplier,
    fetchSupplierTransactions,
    financialStats,
    topProducts,
    expensesByMonth
  };
}
