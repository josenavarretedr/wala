<template>
  <div class="min-h-screen bg-gray-50/30 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
    <!-- Botón Volver y Título -->
    <div class="flex items-center gap-3">
      <button
        @click="goBack"
        class="p-2.5 bg-white border border-gray-150 rounded-xl text-gray-500 hover:text-gray-700 hover:shadow-sm transition-all"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Gestión de Órdenes</span>
        <h1 class="text-xl sm:text-2xl font-extrabold text-gray-800 flex items-center gap-2">
          {{ order?.orderNumber || 'Cargando Pedido...' }}
        </h1>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-55 border border-red-200 p-4 rounded-xl text-sm text-red-700">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="text-center py-12 bg-white rounded-2xl border border-gray-150 shadow-sm">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      <p class="text-sm text-gray-500 mt-2 font-medium">Cargando detalles del pedido...</p>
    </div>

    <!-- Contenido Principal -->
    <div v-else-if="order" class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <!-- Columna Izquierda: Información General y Productos (2/3 de ancho) -->
      <div class="md:col-span-2 space-y-6">
        <!-- Tarjeta de Productos -->
        <div class="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Package class="w-4 h-4 text-orange-500" />
              Detalle del Pedido
            </h3>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase',
                getChannelClass(order.salesChannel),
              ]"
            >
              {{ getChannelLabel(order.salesChannel) }}
            </span>
          </div>

          <!-- Items list -->
          <div class="p-6 divide-y divide-gray-100">
            <div
              v-for="(item, index) in order.items"
              :key="index"
              class="py-4 flex justify-between items-start first:pt-0 last:pb-0"
            >
              <div class="space-y-1 pr-4">
                <p class="font-bold text-gray-800 text-sm sm:text-base">
                  {{ item.name || item.description || 'Producto sin nombre' }}
                </p>
                <p class="text-xs text-gray-400 font-medium">
                  {{ item.quantity }} {{ item.unit || 'uni' }} × S/ {{ item.price.toFixed(2) }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <span class="font-extrabold text-gray-800 text-sm sm:text-base">
                  S/ {{ (item.price * item.quantity).toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Totales -->
            <div class="pt-4 mt-4 space-y-2.5">
              <div class="flex justify-between items-center text-sm font-semibold text-gray-550">
                <span>Subtotal ({{ order.itemsCount }} productos)</span>
                <span>S/ {{ (order.total || 0).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between items-center text-lg font-extrabold text-gray-800 pt-2 border-t border-gray-100">
                <span>Total del Pedido</span>
                <span class="text-orange-600">S/ {{ (order.total || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Información del Cliente y Entrega -->
        <div class="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-4">
          <h3 class="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
            <User class="w-4 h-4 text-orange-500" />
            Información del Cliente
          </h3>

          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
              {{ getClientInitials() }}
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium">Nombre de Contacto</p>
              <p class="font-bold text-gray-800 text-sm sm:text-base">
                {{ order.clientName || 'Cliente Anónimo' }}
              </p>
            </div>
          </div>

          <!-- Si es Delivery, dirección de entrega -->
          <div v-if="order.salesChannel === 'DELIVERY'" class="pt-3 border-t border-gray-100 space-y-2">
            <p class="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-orange-500" />
              Dirección de Envío / Indicaciones
            </p>
            <p class="text-sm font-semibold text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-150">
              {{ order.deliveryAddress || 'No especificada' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Estado, Timeline y Cobro (1/3 de ancho) -->
      <div class="space-y-6">
        <!-- Acción de Cobro -->
        <div class="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-4">
          <div class="text-center space-y-1">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Monto por Cobrar</span>
            <div class="text-2xl font-black text-orange-600">S/ {{ (order.total || 0).toFixed(2) }}</div>
          </div>

          <button
            v-if="order.status !== 'completed'"
            @click="triggerCobro"
            class="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-xs font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-md shadow-green-500/25 flex items-center justify-center gap-2 transform active:scale-[0.98]"
          >
            <Coins class="w-4 h-4 shrink-0" />
            Cobrar Pedido
          </button>
          
          <div
            v-else
            class="py-3 px-4 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-100 flex items-center justify-center gap-1.5"
          >
            <Check class="w-4 h-4 shrink-0" />
            PEDIDO COBRADO Y FINALIZADO
          </div>
        </div>

        <!-- Timeline de Estado -->
        <div class="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-5">
          <h3 class="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Clock class="w-4 h-4 text-orange-500" />
            Progreso del Pedido
          </h3>

          <div class="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            <!-- Paso 1: Creado -->
            <div class="flex gap-4 relative">
              <div
                :class="[
                  'w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 border-2 z-10',
                  isStepActive('inbox')
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400',
                ]"
              >
                <ClipboardCheck class="w-4 h-4" />
              </div>
              <div class="pt-0.5">
                <h4 class="text-xs font-bold text-gray-800">Pedido Registrado</h4>
                <p class="text-[10px] text-gray-400 mt-0.5">{{ formatDateTime(order.createdAt) }}</p>
              </div>
            </div>

            <!-- Paso 2: En preparación -->
            <div class="flex gap-4 relative">
              <div
                :class="[
                  'w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 border-2 z-10',
                  isStepActive('in_progress')
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400',
                ]"
              >
                <Clock class="w-4 h-4" />
              </div>
              <div class="pt-0.5">
                <h4 class="text-xs font-bold text-gray-800">En Preparación</h4>
                <p class="text-[10px] text-gray-400 mt-0.5">
                  {{ order.status === 'inbox' ? 'Pendiente' : 'En proceso de preparación' }}
                </p>
              </div>
            </div>

            <!-- Paso 3: Finalizado (Cobrado) -->
            <div class="flex gap-4 relative">
              <div
                :class="[
                  'w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 border-2 z-10',
                  isStepActive('completed')
                    ? 'bg-green-600 border-green-600 text-white animate-pulse'
                    : 'bg-white border-gray-300 text-gray-400',
                ]"
              >
                <Check class="w-4 h-4" />
              </div>
              <div class="pt-0.5">
                <h4 class="text-xs font-bold text-gray-800">Cobrado y Entregado</h4>
                <p class="text-[10px] text-gray-400 mt-0.5">
                  {{ order.status === 'completed' ? 'Finalizado exitosamente' : 'Pendiente de cobro' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Package, User, Clock, MapPin, ArrowLeft, Coins, ClipboardCheck, Check } from "@iconoir/vue";
import { useOrders } from "@/composables/useOrders";
import { useBusinessStore } from "@/stores/businessStore";

const route = useRoute();
const router = useRouter();
const businessStore = useBusinessStore();
const { getOrderById, convertOrderToSale } = useOrders();

const order = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  const orderId = route.params.orderId;
  if (!orderId) {
    error.value = "ID de orden no especificado";
    loading.value = false;
    return;
  }

  try {
    order.value = await getOrderById(orderId);
  } catch (err) {
    error.value = "No se pudo cargar el pedido. Verifica tu conexión.";
    console.error("Error al obtener la orden:", err);
  } finally {
    loading.value = false;
  }
});

const triggerCobro = async () => {
  if (!order.value) return;

  try {
    loading.value = true;
    await convertOrderToSale(order.value.id);

    const businessId = businessStore.getBusinessId;
    router.push({
      name: "BasicAccountingRecordsBook",
      params: { businessId },
    });
  } catch (err) {
    console.error("Error al cobrar pedido:", err);
    error.value = "Error al iniciar el cobro. Reinténtalo.";
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};

const getClientInitials = () => {
  const name = order.value?.clientName;
  if (!name || name === "Cliente Anónimo") return "CA";

  const names = name.split(" ");
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getChannelLabel = (channel) => {
  const labels = {
    LOCAL: "Mesa / Salón",
    TAKEAWAY: "Llevar",
    DELIVERY: "Delivery",
  };
  return labels[channel] || channel || "Mesa";
};

const getChannelClass = (channel) => {
  const classes = {
    LOCAL: "bg-blue-50 text-blue-600 border border-blue-100",
    TAKEAWAY: "bg-purple-50 text-purple-600 border border-purple-100",
    DELIVERY: "bg-orange-50 text-orange-600 border border-orange-100",
  };
  return classes[channel] || "bg-gray-50 text-gray-600 border border-gray-100";
};

const isStepActive = (stepKey) => {
  if (!order.value) return false;

  const currentStatus = order.value.status;

  if (stepKey === "inbox") {
    return true; // Siempre activo ya que el pedido fue creado
  }

  if (stepKey === "in_progress") {
    return currentStatus === "in_progress" || currentStatus === "completed";
  }

  if (stepKey === "completed") {
    return currentStatus === "completed";
  }

  return false;
};

const formatDateTime = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
</script>

<style scoped>
</style>
