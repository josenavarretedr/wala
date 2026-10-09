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
import { ANONYMOUS_CLIENT_ID } from '@/types/client';
import { v4 as uuidv4 } from 'uuid';

const db = getFirestore(appFirebase);

/**
 * Composable para gestionar clientes
 */
export function useClients() {
  const clients = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const searchQuery = ref('');

  /**
   * Obtener todos los clientes activos del negocio
   * Siempre carga datos frescos desde Firestore (sin caché)
   */
  async function fetchAllClients() {
    const currentBusinessId = ensureBusinessId();

    if (!currentBusinessId) {
      error.value = 'No hay negocio activo';
      return [];
    }

    loading.value = true;
    error.value = null;

    try {
      console.log('🔄 Cargando clientes desde Firestore...');
      const clientsRef = collection(
        db,
        'businesses',
        currentBusinessId,
        'clients'
      );

      const q = query(
        clientsRef,
        where('isActive', '==', true),
        orderBy('name', 'asc'),
        limit(200) // Límite razonable
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(doc => ({
          id: doc.id,
          uuid: doc.id,
          ...doc.data()
        }))
        .filter(client => client.uuid !== ANONYMOUS_CLIENT_ID);

      clients.value = results;

      console.log(`✅ ${results.length} clientes cargados (datos frescos)`);
      return results;
    } catch (err) {
      console.error('❌ Error cargando clientes:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Normalizar texto para búsqueda (remover acentos, minúsculas)
   */
  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Clientes filtrados por búsqueda local (solo por nombre)
   */
  const filteredClients = computed(() => {
    if (!searchQuery.value.trim()) {
      return clients.value;
    }

    const search = normalizeText(searchQuery.value);
    return clients.value.filter(client => {
      const clientName = normalizeText(client.name || '');
      return clientName.includes(search);
    });
  });

  /**
   * Estadísticas generales de clientes
   */
  const clientsStats = computed(() => {
    const activeClients = clients.value.length;
    const clientsWithDebt = clients.value.filter(c => (c.pendingBalance || 0) > 0).length;
    const totalReceivable = clients.value.reduce((sum, c) => sum + (c.pendingBalance || 0), 0);
    const totalSales = clients.value.reduce((sum, c) => sum + (c.amount || 0), 0);

    return {
      activeClients,
      clientsWithDebt,
      totalReceivable,
      totalSales
    };
  });

  /**
   * Crear un nuevo cliente
   * @param {Object} clientData - Datos del cliente
   * @returns {Promise<string>} UUID del cliente creado
   */
  async function createClient(clientData) {
    const currentBusinessId = ensureBusinessId();

    if (!currentBusinessId) {
      throw new Error('No hay negocio activo');
    }

    if (!clientData.name || clientData.name.trim() === '') {
      throw new Error('El nombre del cliente es obligatorio');
    }

    loading.value = true;
    error.value = null;

    try {
      const clientId = uuidv4();
      const clientRef = doc(
        db,
        'businesses',
        currentBusinessId,
        'clients',
        clientId
      );

      // Calcular metadata desde transacciones existentes (por si ya hay registros con este clientId)
      let totalPurchases = 0;
      let pendingBalance = 0;
      let transactionCount = 0;
      let lastPurchase = null;

      try {
        const transactionsRef = collection(db, 'businesses', currentBusinessId, 'transactions');
        const transactionsQuery = query(
          transactionsRef,
          where('clientId', '==', clientId),
          where('type', '==', 'income'),
          orderBy('createdAt', 'desc')
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);

        if (!transactionsSnapshot.empty) {
          console.log(`📊 Encontradas ${transactionsSnapshot.size} transacciones existentes para el cliente`);

          transactionsSnapshot.docs.forEach(doc => {
            const transaction = doc.data();
            totalPurchases += transaction.amount || 0;
            pendingBalance += transaction.balance || 0;
            transactionCount += 1;

            // Última compra
            if (!lastPurchase && transaction.createdAt) {
              lastPurchase = transaction.createdAt;
            }
          });
        }
      } catch (err) {
        console.warn('⚠️ No se pudieron calcular estadísticas iniciales:', err);
        // Continuar con valores en 0 si falla
      }

      const newClient = {
        uuid: clientId,
        name: clientData.name.trim(),
        phone: clientData.phone?.trim() || null,
        dni: clientData.dni?.trim() || null,
        businessId: currentBusinessId,
        isActive: true,
        // Metadata calculada desde transacciones existentes
        totalPurchases,
        pendingBalance,
        transactionCount,
        lastPurchase,
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(clientRef, newClient);

      console.log('✅ Cliente creado:', clientId);
      console.log(`   Total compras: S/ ${totalPurchases.toFixed(2)}`);
      console.log(`   Pendiente: S/ ${pendingBalance.toFixed(2)}`);
      console.log(`   Transacciones: ${transactionCount}`);

      // Recargar lista de clientes
      await fetchAllClients();

      return clientId;
    } catch (err) {
      console.error('❌ Error creando cliente:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Actualizar datos de un cliente
   * @param {string} clientId - UUID del cliente
   * @param {Object} updates - Campos a actualizar
   */
  async function updateClient(clientId, updates) {
    const currentBusinessId = ensureBusinessId();

    if (!currentBusinessId) {
      throw new Error('No hay negocio activo');
    }

    if (!clientId) {
      throw new Error('ID de cliente no válido');
    }

    loading.value = true;
    error.value = null;

    try {
      const clientRef = doc(
        db,
        'businesses',
        currentBusinessId,
        'clients',
        clientId
      );

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Limpiar campos undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await updateDoc(clientRef, updateData);

      console.log('✅ Cliente actualizado:', clientId);

      // Recargar lista de clientes
      await fetchAllClients();

      return true;
    } catch (err) {
      console.error('❌ Error actualizando cliente:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Eliminar cliente (lógico - marca como inactivo)
   * @param {string} clientId - UUID del cliente
   */
  async function deleteClient(clientId) {
    const currentBusinessId = ensureBusinessId();

    if (!currentBusinessId) {
      throw new Error('No hay negocio activo');
    }

    if (!clientId) {
      throw new Error('ID de cliente no válido');
    }

    if (clientId === ANONYMOUS_CLIENT_ID) {
      throw new Error('No se puede eliminar el cliente anónimo');
    }

    loading.value = true;
    error.value = null;

    try {
      const clientRef = doc(
        db,
        'businesses',
        currentBusinessId,
        'clients',
        clientId
      );

      await updateDoc(clientRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Cliente eliminado (lógico):', clientId);

      // Recargar lista de clientes
      await fetchAllClients();

      return true;
    } catch (err) {
      console.error('❌ Error eliminando cliente:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    clients,
    loading,
    error,
    searchQuery,
    filteredClients,
    clientsStats,
    fetchAllClients,
    createClient,
    updateClient,
    deleteClient
  };
}

/**
 * Composable para obtener detalles de un cliente específico
 * @param {string} clientId - ID del cliente
 */
export function useClientDetails(clientId) {
  const client = ref(null);
  const transactions = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Obtener datos del cliente
   */
  async function fetchClient() {
    const currentBusinessId = ensureBusinessId();

    if (!currentBusinessId || !clientId) {
      error.value = 'Datos insuficientes';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const clientRef = doc(
        db,
        'businesses',
        currentBusinessId,
        'clients',
        clientId
      );

      const clientDoc = await getDoc(clientRef);

      if (!clientDoc.exists()) {
        throw new Error('Cliente no encontrado');
      }

      client.value = {
        id: clientDoc.id,
        ...clientDoc.data()
      };
    } catch (err) {
      console.error('Error obteniendo cliente:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Obtener todas las transacciones del cliente
   */
  async function fetchClientTransactions() {
    const currentBusinessId = ensureBusinessId();

    if (!currentBusinessId || !clientId) {
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
        where('clientId', '==', clientId),
        where('type', '==', 'income'),
        orderBy('createdAt', 'desc'),
        limit(100) // Límite razonable de transacciones
      );

      const snapshot = await getDocs(q);
      transactions.value = snapshot.docs.map(doc => ({
        id: doc.id,
        uuid: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.error('Error obteniendo transacciones del cliente:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Estadísticas financieras del cliente
   */
  const financialStats = computed(() => {
    const total = client.value?.totalPurchases || 0;
    const pending = client.value?.pendingBalance || 0;
    const paid = total - pending;

    return {
      totalPurchases: total,
      totalPaid: paid,
      pendingBalance: pending,
      transactionCount: client.value?.transactionCount || 0
    };
  });

  /**
   * Productos más comprados por el cliente (Top 5)
   */
  const topProducts = computed(() => {
    const productMap = new Map();

    transactions.value.forEach(transaction => {
      if (transaction.items && Array.isArray(transaction.items)) {
        transaction.items.forEach(item => {
          const key = item.productId || item.name;
          if (productMap.has(key)) {
            const existing = productMap.get(key);
            existing.quantity += item.quantity || 0;
            existing.totalAmount += (item.quantity || 0) * (item.price || 0);
          } else {
            productMap.set(key, {
              name: item.name || 'Sin nombre',
              productId: item.productId,
              quantity: item.quantity || 0,
              totalAmount: (item.quantity || 0) * (item.price || 0)
            });
          }
        });
      }
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  });

  /**
   * Compras por mes (últimos 12 meses)
   */
  const purchasesByMonth = computed(() => {
    const monthsMap = new Map();
    const now = new Date();

    // Inicializar últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsMap.set(key, {
        month: date.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }),
        amount: 0,
        count: 0
      });
    }

    // Agregar transacciones
    transactions.value.forEach(transaction => {
      const date = transaction.createdAt?.toDate?.() || new Date(transaction.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (monthsMap.has(key)) {
        const month = monthsMap.get(key);
        month.amount += transaction.total || 0;
        month.count += 1;
      }
    });

    return Array.from(monthsMap.values());
  });

  /**
   * Generar link de WhatsApp
   */
  function getWhatsAppLink(phone, message = '') {
    if (!phone) return null;

    // Limpiar número
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;
  }

  /**
   * Inicializar datos del cliente
   */
  async function initialize() {
    await fetchClient();
    await fetchClientTransactions();
  }

  return {
    client,
    transactions,
    loading,
    error,
    financialStats,
    topProducts,
    purchasesByMonth,
    fetchClient,
    fetchClientTransactions,
    getWhatsAppLink,
    initialize
  };
}
