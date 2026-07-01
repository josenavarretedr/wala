// @/composables/useOrders.js

import { ref, computed } from 'vue';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { ensureBusinessId } from './useBusinessUtils';
import { useTransactionStore } from '@/stores/transaction/transactionStore';
import { useTransactionFlowStore } from '@/stores/transaction/transactionFlowStore';

import appFirebase from '@/firebaseInit';

const db = getFirestore(appFirebase);

export function useOrders() {
  const orders = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Obtiene todos los pedidos del negocio
   * @param {string} status - Filtrar por estado: 'inbox', 'in_progress', 'completed', 'cancelled', 'all'
   */
  const fetchOrders = async (status = 'all') => {
    loading.value = true;
    error.value = null;

    try {
      const businessId = ensureBusinessId();
      const ordersRef = collection(db, 'businesses', businessId, 'orders');

      let q;
      if (status === 'all') {
        q = query(ordersRef, orderBy('createdAt', 'desc'));
      } else {
        q = query(
          ordersRef,
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      orders.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      console.log(`✅ ${orders.value.length} pedidos cargados`);
      return orders.value;

    } catch (err) {
      console.error('❌ Error cargando pedidos:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene un pedido específico por su UUID
   */
  const getOrderById = async (orderId) => {
    try {
      const businessId = ensureBusinessId();
      const orderRef = doc(db, 'businesses', businessId, 'orders', orderId);

      const { getDoc } = await import('firebase/firestore');
      const snapshot = await getDoc(orderRef);

      if (!snapshot.exists()) {
        throw new Error('Pedido no encontrado');
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate()
      };

    } catch (err) {
      console.error('❌ Error obteniendo pedido:', err);
      throw err;
    }
  };

  /**
   * Actualiza el estado (status / columna Kanban) de un pedido
   */
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const businessId = ensureBusinessId();
      const orderRef = doc(db, 'businesses', businessId, 'orders', orderId);

      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Pedido ${orderId} actualizado a estado: ${newStatus}`);
      return true;

    } catch (err) {
      console.error('❌ Error actualizando estado de pedido:', err);
      throw err;
    }
  };

  /**
   * Cancela un pedido
   */
  const cancelOrder = async (orderId) => {
    return await updateOrderStatus(orderId, 'cancelled');
  };

  /**
   * Elimina permanentemente un pedido de la base de datos
   */
  const deleteOrder = async (orderId) => {
    try {
      const businessId = ensureBusinessId();
      const orderRef = doc(db, 'businesses', businessId, 'orders', orderId);

      await deleteDoc(orderRef);

      console.log(`✅ Pedido ${orderId} eliminado permanentemente`);
      return true;

    } catch (err) {
      console.error('❌ Error eliminando pedido:', err);
      throw err;
    }
  };

  /**
   * Convierte un pedido en una venta
   * Pre-carga los datos en el transactionStore y abre el flujo de pago directo
   */
  const convertOrderToSale = async (orderId) => {
    try {
      console.log('🔄 Convirtiendo pedido a venta:', orderId);

      // 1. Obtener el pedido
      const order = await getOrderById(orderId);

      if (order.status === 'completed') {
        throw new Error('El pedido ya ha sido cobrado y finalizado');
      }

      const transactionStore = useTransactionStore();

      // Resetear transaccion actual
      transactionStore.resetTransactionToAdd();

      // 2. Pre-cargar datos del pedido
      transactionStore.transactionToAdd.value.type = 'income';
      transactionStore.transactionToAdd.value.orderId = order.uuid;
      transactionStore.transactionToAdd.value.orderNumber = order.orderNumber;
      transactionStore.transactionToAdd.value.salesChannel = order.salesChannel || 'LOCAL';
      transactionStore.transactionToAdd.value.deliveryAddress = order.deliveryAddress || '';
      transactionStore.transactionToAdd.value.deliveryPlatform = order.deliveryPlatform || null;
      transactionStore.transactionToAdd.value.deliveryPlatformName = order.deliveryPlatformName || null;
      transactionStore.transactionToAdd.value.deliveryCost = order.deliveryCost || 0;
      transactionStore.transactionToAdd.value.platformCommissionPct = order.platformCommissionPct || null;
      transactionStore.transactionToAdd.value.platformCommissionAmount = order.platformCommissionAmount || 0;
      transactionStore.transactionToAdd.value.isDeliveryFree = order.isDeliveryFree || false;
      transactionStore.transactionToAdd.value.packagingCost = order.packagingCost || 0;
      transactionStore.transactionToAdd.value.packagingItems = order.packagingItems || [];
      transactionStore.transactionToAdd.value.paymentDecision = 'paid';

      // Pre-cargar productos verificando si existen en Firestore
      const { getDoc } = await import('firebase/firestore');
      const { useBusinessStore } = await import('@/stores/businessStore');
      const businessStore = useBusinessStore();

      const itemsWithVerifiedStatus = await Promise.all(
        order.items.map(async (item) => {
          try {
            const productRef = doc(db, 'businesses', businessStore.getBusinessId, 'products', item.uuid);
            const productDoc = await getDoc(productRef);

            const exists = productDoc.exists();
            console.log(`🔍 Producto "${item.name}" (${item.uuid}): ${exists ? 'EXISTE' : 'NO EXISTE'}`);

            return {
              uuid: item.uuid,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              price: item.price,
              oldOrNewProduct: exists ? 'old' : 'new',
              selectedProductUuid: item.uuid
            };
          } catch (error) {
            console.warn(`⚠️ Error verificando producto ${item.name}:`, error);
            return {
              uuid: item.uuid,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              price: item.price,
              oldOrNewProduct: 'new',
              selectedProductUuid: item.uuid
            };
          }
        })
      );

      transactionStore.transactionToAdd.value.items = itemsWithVerifiedStatus;

      // Pre-cargar cliente si existe
      if (order.clientId) {
        transactionStore.transactionToAdd.value.clientId = order.clientId;
        transactionStore.transactionToAdd.value.clientName = order.clientName;
        
        // Cargar objeto de cliente completo si es necesario
        try {
          const { useClientStore } = await import('@/stores/clientStore');
          const clientStore = useClientStore();
          const clientObj = clientStore.clients.find(c => c.uuid === order.clientId);
          if (clientObj) {
            transactionStore.transactionToAdd.value.client = clientObj;
          }
        } catch (e) {
          console.warn('⚠️ No se pudo precargar objeto cliente completo:', e);
        }
      }

      // 3. Configurar e inicializar el flujo dinámico de transacciones
      const flowStore = useTransactionFlowStore();
      flowStore.resetFlow();
      flowStore.defineDynamicSteps('income');
      flowStore.insertPaymentSteps('paid'); // Añade Paso 4 (PaymentMethod) y otros

      // Saltar directo al método de pago (paso index 4)
      flowStore.currentStep = 4;

      console.log('✅ Pedido precargado en el flujo de transacciones');
      console.log('📍 Posición actual:', flowStore.currentStep, flowStore.steps[flowStore.currentStep]?.label);

      return {
        success: true,
        order,
        nextStep: 'payment_method'
      };

    } catch (err) {
      console.error('❌ Error convirtiendo pedido:', err);
      throw err;
    }
  };

  // Computeds
  const inboxOrders = computed(() =>
    orders.value.filter(o => o.status === 'inbox')
  );

  const inProgressOrders = computed(() =>
    orders.value.filter(o => o.status === 'in_progress')
  );

  const completedOrders = computed(() =>
    orders.value.filter(o => o.status === 'completed')
  );

  const cancelledOrders = computed(() =>
    orders.value.filter(o => o.status === 'cancelled')
  );

  const totalOrdersValue = computed(() =>
    orders.value
      .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0)
  );

  const ordersCount = computed(() => orders.value.length);
  const inboxOrdersCount = computed(() => inboxOrders.value.length);
  const inProgressOrdersCount = computed(() => inProgressOrders.value.length);
  const completedOrdersCount = computed(() => completedOrders.value.length);

  // Agrupar órdenes por estatus para el Kanban
  const ordersByColumn = computed(() => ({
    inbox: inboxOrders.value,
    in_progress: inProgressOrders.value,
    completed: completedOrders.value
  }));

  return {
    orders,
    loading,
    error,
    inboxOrders,
    inProgressOrders,
    completedOrders,
    cancelledOrders,
    totalOrdersValue,
    ordersCount,
    inboxOrdersCount,
    inProgressOrdersCount,
    completedOrdersCount,
    ordersByColumn,
    fetchOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    convertOrderToSale
  };
}
