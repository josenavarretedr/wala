<template>
  <div class="space-y-6" data-step-order-preview>
    <!-- Título y Subtítulo elegantes -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center justify-center gap-2 mb-2">
        <div
          class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center"
        >
          <ClipboardCheck class="w-6 h-6 text-orange-600" />
        </div>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Resumen del Pedido
      </h1>
      <p class="text-sm text-orange-600 font-medium">
        Este pedido se registrará como pendiente de cobro
      </p>
      <p class="text-sm text-gray-500">
        {{ formatDate(new Date()) }}
      </p>
    </div>

    <!-- Preview del Pedido -->
    <div
      class="bg-white rounded-2xl shadow-sm border-2 border-orange-100 overflow-hidden max-w-xl mx-auto"
    >
      <!-- Total destacado con badge de pedido -->
      <div
        v-if="transactionStore.transactionToAdd.value.items.length > 0"
        class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 text-center"
      >
        <div class="flex items-center justify-center gap-2 mb-2">
          <span
            class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold tracking-wide"
          >
            PEDIDO
          </span>
        </div>
        <div class="text-3xl font-bold mb-1">
          S/ {{ getTotal().toFixed(2) }}
        </div>
        <div class="text-sm opacity-95">Valor total del pedido a cobrar</div>
      </div>

      <!-- Información del cliente y canal de venta -->
      <div class="p-5 border-b border-gray-100 bg-gray-50/50 space-y-4">
        <!-- Cliente -->
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
          >
            {{ getClientInitials() }}
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium">Cliente</p>
            <p class="font-bold text-gray-800 text-sm">
              {{ transactionStore.transactionToAdd.value.clientName || 'Cliente Anónimo' }}
            </p>
          </div>
        </div>

        <!-- Canal de venta y Delivery -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <p class="text-xs text-gray-400 font-medium">Canal de Venta</p>
            <span
              class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold mt-1 bg-orange-50 text-orange-600 border border-orange-100"
            >
              {{ getSalesChannelLabel(transactionStore.transactionToAdd.value.salesChannel) }}
            </span>
          </div>
          <div v-if="transactionStore.transactionToAdd.value.salesChannel === 'DELIVERY'">
            <p class="text-xs text-gray-400 font-medium flex items-center gap-1">
              <MapPin class="w-3.5 h-3.5 text-orange-500" />
              Dirección de Envío
            </p>
            <p class="text-xs font-semibold text-gray-700 mt-1 truncate max-w-[200px]" :title="transactionStore.transactionToAdd.value.deliveryAddress">
              {{ transactionStore.transactionToAdd.value.deliveryAddress || 'No especificada' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Lista de productos -->
      <div
        v-if="transactionStore.transactionToAdd.value.items.length > 0"
        class="p-5"
      >
        <h3
          class="text-sm font-bold text-gray-850 mb-3 flex items-center gap-2"
        >
          <Package class="w-4 h-4 text-orange-500" />
          Detalle de Productos
        </h3>

        <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
          <div
            v-for="(item, index) in transactionStore.transactionToAdd.value.items"
            :key="index"
            class="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0"
          >
            <div class="flex-1 pr-4">
              <p class="font-semibold text-gray-850 text-xs sm:text-sm">
                {{ item.name || item.description || "Producto sin nombre" }}
              </p>
              <p class="text-xs text-gray-400 font-medium mt-0.5">
                {{ item.quantity }} {{ item.unit || 'uni' }} × S/ {{ item.price.toFixed(2) }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="font-bold text-gray-800 text-xs sm:text-sm">
                S/ {{ (item.price * item.quantity).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Resumen final -->
        <div class="mt-4 pt-4 border-t border-gray-100">
          <div class="flex justify-between items-center text-lg font-extrabold">
            <span class="text-gray-700">Total Pedido</span>
            <span class="text-orange-600">S/ {{ getTotal().toFixed(2) }}</span>
          </div>
          <p class="text-xs text-gray-400 text-right mt-1 font-medium">
            {{ transactionStore.transactionToAdd.value.items.length }}
            {{
              transactionStore.transactionToAdd.value.items.length === 1
                ? "producto"
                : "productos"
            }}
          </p>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="p-8 text-center">
        <div
          class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"
        >
          <Package class="w-6 h-6 text-gray-400" />
        </div>
        <h3 class="font-semibold text-gray-600 mb-1">No hay productos</h3>
        <p class="text-sm text-gray-500">
          Agrega productos para generar el pedido
        </p>
      </div>
    </div>

    <!-- Nota informativa premium -->
    <div
      v-if="transactionStore.transactionToAdd.value.items.length > 0"
      class="bg-orange-50 rounded-2xl p-4 border border-orange-100 max-w-xl mx-auto"
    >
      <div class="flex items-start gap-3">
        <div
          class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        >
          <InfoCircle class="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p class="text-xs sm:text-sm font-bold text-orange-950 mb-1">
            Información importante sobre los pedidos
          </p>
          <ul class="text-xs text-orange-900/90 space-y-1 font-medium">
            <li>• Este pedido NO afectará tu inventario ni cuentas hasta que sea cobrado.</li>
            <li>• Se registrará en la pestaña de Órdenes como 'Nuevo' para que puedas hacer seguimiento.</li>
            <li>• Podrás cobrar este pedido directamente arrastrándolo a la columna 'Finalizado' en el Kanban.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package, ClipboardCheck, MapPin, InfoCircle } from "@iconoir/vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const transactionStore = useTransactionStore();

const getTotal = () => {
  return transactionStore.transactionToAdd.value.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
};

const getClientInitials = () => {
  const name = transactionStore.transactionToAdd.value.clientName;
  if (!name || name === "Cliente Anónimo") return "CA";

  const names = name.split(" ");
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getSalesChannelLabel = (channel) => {
  const channels = {
    LOCAL: "Local / Consumo en mesa",
    TAKEAWAY: "Para llevar",
    DELIVERY: "Envío a domicilio (Delivery)"
  };
  return channels[channel] || channel || "Local";
};

const formatDate = (date) => {
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
/* Evitar zoom en iOS */
@media screen and (max-width: 480px) {
  select {
    font-size: 16px;
  }
}
</style>
