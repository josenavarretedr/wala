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
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { ANONYMOUS_CLIENT_ID, DEFAULT_ANONYMOUS_CLIENT } from '@/types/client';
import { useBusinessStore } from './businessStore';

export const useClientStore = defineStore('clientStore', () => {
  // State
  const clients = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const selectedClient = ref(null);
  const unsubscribeClients = ref(null);

  // Getters
  const activeClients = computed(() => {
    return clients.value.filter(client => client.isActive);
  });

  const anonymousClient = computed(() => {
    return clients.value.find(c => c.uuid === ANONYMOUS_CLIENT_ID);
  });

  // Actions

  /**
   * Inicializa el cliente anónimo si no existe
   */
  async function initializeAnonymousClient(businessId) {
    try {
      const db = getFirestore();
      const anonymousClientRef = doc(db, 'businesses', businessId, 'clients', ANONYMOUS_CLIENT_ID);

      const snapshot = await getDoc(anonymousClientRef);

      if (!snapshot.exists()) {
        console.log('🆕 Creando cliente anónimo...');
        await setDoc(anonymousClientRef, {
          ...DEFAULT_ANONYMOUS_CLIENT,
          businessId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        console.log('✅ Cliente anónimo creado');
      }
    } catch (err) {
      console.error('❌ Error inicializando cliente anónimo:', err);
      error.value = err.message;
    }
  }

  /**
   * Obtiene todos los clientes del negocio con listener en tiempo real
   */
  async function fetchClients(businessId) {
    if (!businessId) {
      console.warn('⚠️ No se proporcionó businessId');
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const db = getFirestore();
      const clientsRef = collection(db, 'businesses', businessId, 'clients');

      // Configurar listener en tiempo real
      unsubscribeClients.value = onSnapshot(
        clientsRef,
        (snapshot) => {
          clients.value = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          }));
          console.log(`📋 ${clients.value.length} clientes cargados`);
          loading.value = false;
        },
        (err) => {
          console.error('❌ Error en listener de clientes:', err);
          error.value = err.message;
          loading.value = false;
        }
      );

      // Asegurar que existe el cliente anónimo
      await initializeAnonymousClient(businessId);
    } catch (err) {
      console.error('❌ Error obteniendo clientes:', err);
      error.value = err.message;
      loading.value = false;
    }
  }

  /**
   * Crea un nuevo cliente
   * @param {Object} clientData - Datos del cliente
   * @param {Object} [initialMetadata] - Metadata inicial opcional (si se conoce de antemano)
   */
  async function createClient(clientData, initialMetadata = {}) {
    const businessStore = useBusinessStore();
    const businessId = businessStore.getBusinessId;

    console.log('🔍 Debug createClient:', {
      hasBusinessStore: !!businessStore,
      business: businessStore.business,
      businessId,
      hasInitialMetadata: !!Object.keys(initialMetadata).length
    });

    if (!businessId) {
      throw new Error('No hay negocio activo');
    }

    loading.value = true;
    error.value = null;

    try {
      const db = getFirestore();
      const clientId = crypto.randomUUID();
      const clientRef = doc(db, 'businesses', businessId, 'clients', clientId);

      const newClient = {
        uuid: clientId,
        name: clientData.name,
        phone: clientData.phone || null,
        businessId,
        isActive: true,
        // Usar metadata inicial si se proporciona, sino inicializar en 0
        totalPurchases: initialMetadata.totalPurchases ?? 0,
        pendingBalance: initialMetadata.pendingBalance ?? 0,
        transactionCount: initialMetadata.transactionCount ?? 0,
        lastPurchase: initialMetadata.lastPurchase ?? null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(clientRef, newClient);

      if (Object.keys(initialMetadata).length > 0) {
        console.log('✅ Cliente creado con metadata inicial:', clientId, initialMetadata);
      } else {
        console.log('✅ Cliente creado:', clientId);
      }

      loading.value = false;
      return newClient;
    } catch (err) {
      console.error('❌ Error creando cliente:', err);
      error.value = err.message;
      loading.value = false;
      throw err;
    }
  }

  /**
   * Actualiza un cliente existente
   */
  async function updateClient(clientId, updates) {
    const businessStore = useBusinessStore();
    const businessId = businessStore.getBusinessId;

    if (!businessId) {
      throw new Error('No hay negocio activo');
    }

    try {
      const db = getFirestore();
      const clientRef = doc(db, 'businesses', businessId, 'clients', clientId);

      await updateDoc(clientRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      console.log('✅ Cliente actualizado:', clientId);
    } catch (err) {
      console.error('❌ Error actualizando cliente:', err);
      error.value = err.message;
      throw err;
    }
  }

  /**
   * Busca clientes por nombre o teléfono
   */
  function searchClients(query) {
    if (!query || query.trim() === '') {
      return activeClients.value;
    }

    const searchTerm = query.toLowerCase().trim();

    return activeClients.value.filter(client => {
      const matchName = client.name.toLowerCase().includes(searchTerm);
      const matchPhone = client.phone && client.phone.includes(searchTerm);

      return matchName || matchPhone;
    });
  }

  /**
   * Actualiza la metadata calculada de un cliente
   */
  async function updateClientMetadata(clientId) {
    const businessStore = useBusinessStore();
    const businessId = businessStore.getBusinessId;

    if (!businessId) {
      throw new Error('No hay negocio activo');
    }

    try {
      const db = getFirestore();

      console.log(`🔍 Buscando transacciones del cliente: ${clientId}`);

      // Obtener todas las transacciones del cliente
      const transactionsRef = collection(db, 'businesses', businessId, 'transactions');
      const q = query(
        transactionsRef,
        where('clientId', '==', clientId),
        where('type', '==', 'income')
      );

      const snapshot = await getDocs(q);

      console.log(`📊 Encontradas ${snapshot.size} transacciones tipo income para el cliente`);

      let totalPurchases = 0;
      let pendingBalance = 0;
      let lastPurchase = null;
      const transactionCount = snapshot.size;

      snapshot.docs.forEach(doc => {
        const transaction = doc.data();

        console.log(`  📝 Transacción ${doc.id}:`, {
          amount: transaction.amount,
          balance: transaction.balance,
          createdAt: transaction.createdAt?.toDate?.()?.toISOString?.() || 'no date'
        });

        // Sumar total de compras (usar amount que es el campo correcto)
        totalPurchases += transaction.amount || 0;

        // Sumar balance pendiente
        if (transaction.balance) {
          pendingBalance += transaction.balance;
        }

        // Encontrar la última compra (usando createdAt en lugar de date)
        if (transaction.createdAt) {
          const transactionTime = transaction.createdAt.toMillis ? transaction.createdAt.toMillis() : 0;
          const lastPurchaseTime = lastPurchase ? (lastPurchase.toMillis ? lastPurchase.toMillis() : 0) : 0;

          if (transactionTime > lastPurchaseTime) {
            lastPurchase = transaction.createdAt;
          }
        }
      });

      // Actualizar cliente
      const clientRef = doc(db, 'businesses', businessId, 'clients', clientId);
      await updateDoc(clientRef, {
        totalPurchases,
        pendingBalance,
        transactionCount,
        lastPurchase,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Metadata actualizada para cliente ${clientId}:`, {
        totalPurchases: `S/ ${totalPurchases.toFixed(2)}`,
        pendingBalance: `S/ ${pendingBalance.toFixed(2)}`,
        transactionCount,
        lastPurchase: lastPurchase ? new Date(lastPurchase.toMillis()).toISOString() : 'null'
      });
    } catch (err) {
      console.error('❌ Error actualizando metadata del cliente:', err);
      throw err;
    }
  }

  /**
   * Selecciona un cliente para el flujo de transacción
   */
  function selectClient(client) {
    selectedClient.value = client;
  }

  /**
   * Limpia el cliente seleccionado
   */
  function clearSelectedClient() {
    selectedClient.value = null;
  }

  /**
   * Desactiva un cliente
   */
  async function deactivateClient(clientId) {
    await updateClient(clientId, { isActive: false });
  }

  /**
   * Limpia el listener cuando se destruye el store
   */
  function cleanup() {
    if (unsubscribeClients.value) {
      unsubscribeClients.value();
      unsubscribeClients.value = null;
    }
  }

  return {
    // State
    clients,
    loading,
    error,
    selectedClient,

    // Getters
    activeClients,
    anonymousClient,

    // Actions
    initializeAnonymousClient,
    fetchClients,
    createClient,
    updateClient,
    searchClients,
    updateClientMetadata,
    selectClient,
    clearSelectedClient,
    deactivateClient,
    cleanup
  };
});
