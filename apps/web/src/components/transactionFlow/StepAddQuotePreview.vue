<template>
  <div class="space-y-6" data-step-quote-preview ref="quotePreviewRef">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center justify-center gap-2 mb-2">
        <div
          class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
        >
          <Bookmark class="w-6 h-6 text-purple-600" />
        </div>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Resumen de Cotización
      </h1>
      <p class="text-sm text-purple-600 font-medium">
        Esta es una cotización, NO una venta confirmada
      </p>
      <p class="text-sm text-gray-500">
        {{ formatDate(new Date()) }}
      </p>
    </div>

    <!-- Preview de la cotización -->
    <div
      class="bg-white rounded-xl shadow-sm border-2 border-purple-200 overflow-hidden"
    >
      <!-- Total destacado con badge de cotización -->
      <div
        v-if="transactionStore.transactionToAdd.value.items.length > 0"
        class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 text-center"
      >
        <div class="flex items-center justify-center gap-2 mb-2">
          <span
            class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold"
          >
            COTIZACIÓN
          </span>
        </div>
        <div class="text-3xl font-bold mb-1">
          S/ {{ getTotal().toFixed(2) }}
        </div>
        <div class="text-sm opacity-90">Valor estimado de la cotización</div>
      </div>

      <!-- Selector de días de expiración -->
      <div class="p-4 bg-purple-50 border-b border-purple-100">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          <span class="flex items-center gap-2">
            <svg
              class="w-4 h-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Validez de la cotización
          </span>
        </label>
        <select
          v-model="expirationDays"
          class="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-700 font-medium"
        >
          <option :value="7">7 días (1 semana)</option>
          <option :value="15">15 días (2 semanas)</option>
          <option :value="30">30 días (1 mes)</option>
          <option :value="60">60 días (2 meses)</option>
          <option :value="90">90 días (3 meses)</option>
        </select>
        <p class="text-xs text-gray-500 mt-2">
          Vence el:
          <span class="font-semibold text-purple-600">{{
            formatExpirationDate(expirationDays)
          }}</span>
        </p>
      </div>

      <!-- Información del cliente (si existe) -->
      <div
        v-if="transactionStore.transactionToAdd.value.client"
        class="p-4 border-b border-gray-100 bg-blue-50"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold"
          >
            {{ getClientInitials() }}
          </div>
          <div>
            <p class="text-sm text-gray-600">Cliente</p>
            <p class="font-semibold text-gray-800">
              {{ transactionStore.transactionToAdd.value.client.name }}
            </p>
          </div>
        </div>
      </div>

      <!-- Lista de productos -->
      <div
        v-if="transactionStore.transactionToAdd.value.items.length > 0"
        class="p-4"
      >
        <h3
          class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
        >
          <Package class="w-5 h-5 text-purple-600" />
          Productos cotizados
        </h3>

        <div class="space-y-2">
          <div
            v-for="(item, index) in transactionStore.transactionToAdd.value
              .items"
            :key="index"
            class="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0"
          >
            <div class="flex-1">
              <p class="font-medium text-gray-800">
                {{ item.name || item.description || "Producto sin nombre" }}
              </p>
              <p class="text-xs text-gray-500">
                {{ item.quantity }} {{ item.unit }} × S/
                {{ item.price.toFixed(2) }}
              </p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-800">
                S/ {{ (item.price * item.quantity).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Resumen final -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex justify-between items-center text-lg font-bold">
            <span class="text-gray-700">Total Cotización</span>
            <span class="text-purple-600">S/ {{ getTotal().toFixed(2) }}</span>
          </div>
          <p class="text-xs text-gray-500 text-right mt-1">
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
          Agrega productos para generar la cotización
        </p>
      </div>
    </div>

    <!-- Nota informativa -->
    <div
      v-if="transactionStore.transactionToAdd.value.items.length > 0"
      class="bg-purple-50 rounded-xl p-4 border border-purple-200"
    >
      <div class="flex items-start gap-3">
        <div
          class="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        >
          <svg
            class="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-purple-900 mb-1">
            Importante sobre las cotizaciones
          </p>
          <ul class="text-xs text-purple-800 space-y-1">
            <li>• Esta cotización NO afectará tu inventario ni cuentas</li>
            <li>
              • Podrás convertirla en venta desde el panel de Cotizaciones
            </li>
            <li>• El cliente recibirá esta información al compartirla</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Package, Bookmark } from "@iconoir/vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useBusinessStore } from "@/stores/businessStore";
import ShareButtonCloud from "@/components/ShareButtonCloud.vue";

const transactionStore = useTransactionStore();
const businessStore = useBusinessStore();

const expirationDays = ref(15); // Valor por defecto: 15 días
const businessId = ref(null);
const quotePreviewRef = ref(null);

onMounted(() => {
  businessId.value = businessStore.currentBusinessId;

  // Guardar expirationDays inicial en transactionStore
  transactionStore.transactionToAdd.value.expirationDays = expirationDays.value;
});

// Watch para actualizar transactionStore cuando cambie expirationDays
watch(expirationDays, (newValue) => {
  transactionStore.transactionToAdd.value.expirationDays = newValue;
  console.log("📅 Días de expiración actualizados:", newValue);
});

const getTotal = () => {
  return transactionStore.transactionToAdd.value.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
};

const getClientInitials = () => {
  const client = transactionStore.transactionToAdd.value.client;
  if (!client || !client.name) return "?";

  const names = client.name.split(" ");
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return client.name.substring(0, 2).toUpperCase();
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

const formatExpirationDate = (days) => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(expirationDate);
};

// Exponer expirationDays para que NavigationBtnBARB pueda acceder a él
defineExpose({
  expirationDays,
});
</script>

<style scoped>
/* Prevent zoom on iOS */
@media screen and (max-width: 480px) {
  input,
  select,
  textarea {
    font-size: 16px;
  }
}

/* Animación suave para el dropdown */
select {
  transition: all 0.2s ease;
}

select:focus {
  transform: scale(1.01);
}
</style>
