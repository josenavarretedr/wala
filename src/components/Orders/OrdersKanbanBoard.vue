<template>
  <div class="space-y-6">
    <!-- Header del Kanban con estadísticas -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
      <div class="space-y-1">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardCheck class="w-6 h-6 text-orange-500" />
          Tablero de Pedidos
        </h2>
        <p class="text-xs sm:text-sm text-gray-500 font-medium">
          Arrastra y suelta tus pedidos para cambiar su estado y cobrarlos.
        </p>
      </div>

      <!-- Métricas destacadas -->
      <div class="flex items-center gap-4">
        <div class="px-4 py-2.5 bg-orange-50 border border-orange-100 rounded-xl">
          <p class="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Pedidos por Cobrar</p>
          <p class="text-base sm:text-lg font-extrabold text-orange-950 mt-0.5">
            S/ {{ totalOrdersValue.toFixed(2) }}
          </p>
        </div>
        <div class="px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Pendientes</p>
          <p class="text-base sm:text-lg font-extrabold text-gray-800 mt-0.5">
            {{ orders.length - completedOrdersCount }} pedidos
          </p>
        </div>
      </div>
    </div>

    <!-- Filtro de pestañas para vista móvil (oculto en pantallas grandes) -->
    <div class="sm:hidden flex border-b border-gray-200 bg-white rounded-xl p-1 shadow-sm">
      <button
        v-for="col in columns"
        :key="col.key"
        @click="activeMobileTab = col.key"
        :class="[
          'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5',
          activeMobileTab === col.key
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
            : 'text-gray-505 hover:bg-gray-50 hover:text-gray-700',
        ]"
      >
        <span>{{ col.icon }}</span>
        <span>{{ col.title }}</span>
        <span
          :class="[
            'px-1.5 py-0.2 rounded-full text-[10px]',
            activeMobileTab === col.key ? 'bg-white/20 text-white font-bold' : 'bg-gray-100 text-gray-500',
          ]"
        >
          {{ getColumnOrdersCount(col.key) }}
        </span>
      </button>
    </div>

    <!-- Tablero de Columnas (Kanban principal) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch">
      <div
        v-for="col in columns"
        :key="col.key"
        :class="[
          'sm:flex flex-col bg-gray-50/50 border border-gray-150 rounded-2xl p-4 min-h-[480px] transition-all duration-200',
          activeMobileTab === col.key ? 'flex' : 'hidden',
          draggedOverColumn === col.key ? 'border-orange-300 bg-orange-50/10 shadow-inner' : '',
        ]"
        @dragover.prevent="onDragOver(col.key)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, col.key)"
      >
        <!-- Título de la columna -->
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-150 shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ col.icon }}</span>
            <span class="text-sm font-extrabold text-gray-800">{{ col.title }}</span>
          </div>
          <span class="px-2 py-0.5 bg-gray-200/60 rounded-full text-xs font-bold text-gray-600 font-mono shadow-sm">
            {{ getColumnOrdersCount(col.key) }}
          </span>
        </div>

        <!-- Lista de tarjetas -->
        <div class="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[600px] scrollbar-thin">
          <template v-if="getColumnOrders(col.key).length > 0">
            <OrderCard
              v-for="order in getColumnOrders(col.key)"
              :key="order.id"
              :order="order"
              @dragstart="activeDraggedOrder = order"
              @click="openOrderDetails(order)"
            />
          </template>

          <!-- Columna Vacía -->
          <div
            v-else
            class="h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-4 text-center"
          >
            <component :is="col.emptyIcon" class="w-8 h-8 text-gray-300 mb-2" />
            <p class="text-xs font-bold text-gray-400">{{ col.emptyText }}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">Arrastra un pedido aquí</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN PARA FINALIZAR/COBRAR -->
    <div
      v-if="showPaymentModal"
      class="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 scale-100 p-6 space-y-6">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600 border border-green-100">
            <Coins class="w-6 h-6 animate-pulse" />
          </div>
          <h3 class="text-lg sm:text-xl font-extrabold text-gray-800">
            ¿Cobrar y finalizar pedido?
          </h3>
          <p class="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
            El pedido <span class="font-mono font-bold text-orange-600">{{ selectedOrderForPayment?.orderNumber }}</span> será transferido al flujo de cobro. Podrás registrar la cuenta y el método de pago del cliente.
          </p>
        </div>

        <!-- Resumen rápido en el modal -->
        <div class="bg-gray-50 rounded-xl p-4 border border-gray-150 text-sm space-y-2">
          <div class="flex justify-between font-semibold text-gray-700">
            <span>Cliente:</span>
            <span class="text-gray-900">{{ selectedOrderForPayment?.clientName }}</span>
          </div>
          <div class="flex justify-between font-extrabold text-lg text-gray-800 pt-2 border-t border-gray-200">
            <span>Total a cobrar:</span>
            <span class="text-orange-600">S/ {{ selectedOrderForPayment?.total?.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="flex items-center gap-3">
          <button
            @click="cancelPaymentModal"
            class="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
          <button
            @click="confirmPaymentModal"
            class="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-xs font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-500/25 flex items-center justify-center gap-1.5"
          >
            <Check class="w-4 h-4" />
            Cobrar Ahora
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ClipboardCheck, Coins, Check, Package, Clock } from "@iconoir/vue";
import { useOrders } from "@/composables/useOrders";
import { useBusinessStore } from "@/stores/businessStore";
import OrderCard from "./OrderCard.vue";

const router = useRouter();
const businessStore = useBusinessStore();
const {
  orders,
  ordersByColumn,
  totalOrdersValue,
  completedOrdersCount,
  fetchOrders,
  updateOrderStatus,
  convertOrderToSale,
} = useOrders();

const draggedOverColumn = ref(null);
const activeMobileTab = ref("inbox");
const activeDraggedOrder = ref(null);

// Modal de cobro
const showPaymentModal = ref(false);
const selectedOrderForPayment = ref(null);

const columns = [
  {
    key: "inbox",
    title: "Nuevo",
    icon: "📥",
    emptyText: "Sin pedidos nuevos",
    emptyIcon: Package,
  },
  {
    key: "in_progress",
    title: "En proceso",
    icon: "🔄",
    emptyText: "Ningún pedido en preparación",
    emptyIcon: Clock,
  },
  {
    key: "completed",
    title: "Finalizado",
    icon: "✅",
    emptyText: "Sin pedidos finalizados hoy",
    emptyIcon: Check,
  },
];

onMounted(async () => {
  await loadOrdersData();
});

const loadOrdersData = async () => {
  try {
    await fetchOrders("all");
  } catch (err) {
    console.error("Error cargando pedidos:", err);
  }
};

const getColumnOrders = (columnKey) => {
  return ordersByColumn.value[columnKey] || [];
};

const getColumnOrdersCount = (columnKey) => {
  return getColumnOrders(columnKey).length;
};

// Drag & Drop Handlers
const onDragOver = (columnKey) => {
  draggedOverColumn.value = columnKey;
};

const onDragLeave = () => {
  draggedOverColumn.value = null;
};

const onDrop = async (event, columnKey) => {
  draggedOverColumn.value = null;
  const orderId = event.dataTransfer.getData("text/plain");
  
  if (!orderId) return;

  const order = orders.value.find((o) => o.id === orderId);
  if (!order) return;

  // Si se arrastra a Finalizado, abrimos modal para cobrar
  if (columnKey === "completed") {
    selectedOrderForPayment.value = order;
    showPaymentModal.value = true;
    return;
  }

  // De lo contrario, actualizamos el estatus directamente
  if (order.status !== columnKey) {
    try {
      await updateOrderStatus(orderId, columnKey);
      order.status = columnKey; // Actualización reactiva optimista local
    } catch (err) {
      console.error("Error al actualizar estado del pedido:", err);
      await loadOrdersData(); // Recargar en caso de error
    }
  }
};

// Acciones del modal de cobro
const cancelPaymentModal = () => {
  showPaymentModal.value = false;
  selectedOrderForPayment.value = null;
};

const confirmPaymentModal = async () => {
  const order = selectedOrderForPayment.value;
  if (!order) return;

  showPaymentModal.value = false;
  try {
    // 1. Convertir el pedido a venta pre-cargando los datos en transactionStore
    await convertOrderToSale(order.id);

    // 2. Redirigir al flujo de registro de transacciones
    const businessId = businessStore.getBusinessId;
    router.push({
      name: "RecordsBook", // Nombre de la ruta del libro contable/flujo
      params: { businessId },
    });
  } catch (err) {
    console.error("Error al iniciar el cobro del pedido:", err);
  } finally {
    selectedOrderForPayment.value = null;
  }
};

// Navegación
const openOrderDetails = (order) => {
  const businessId = businessStore.getBusinessId;
  router.push({
    name: "OrderDetails",
    params: {
      businessId,
      orderId: order.id,
    },
  });
};
</script>

<style scoped>
/* Scrollbar fino y elegante para el Kanban */
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
</style>
