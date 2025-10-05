<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Resumen de la Transferencia
      </h1>
      <p class="text-sm text-gray-500">
        {{ formatDate(new Date()) }}
      </p>
    </div>

    <!-- Preview de la transferencia -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Total destacado -->
      <div
        v-if="isTransferValid"
        class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 text-center"
      >
        <div class="text-3xl font-bold mb-1">
          S/ {{ formatAmount(props.transactionData.amount) }}
        </div>
        <div class="text-blue-100 text-sm">Monto a transferir</div>
      </div>

      <!-- Información de tipo y cuentas -->
      <div v-if="isTransferValid" class="p-4 border-b border-gray-100">
        <div class="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-3">
          <!-- Cuenta origen -->
          <div class="bg-green-50 rounded-xl p-4 text-center">
            <div
              class="w-12 h-12 sm:w-8 sm:h-8 bg-green-500 rounded-full mx-auto mb-3 sm:mb-2 flex items-center justify-center"
            >
              <component
                :is="getFromAccountIcon"
                class="w-6 h-6 sm:w-4 sm:h-4 text-white"
              />
            </div>
            <div class="text-base sm:text-sm font-medium text-green-700">
              {{ getFromAccountLabel }}
            </div>
            <div class="text-xs text-green-600 mt-1">Cuenta origen</div>
          </div>

          <!-- Tipo de transacción -->
          <div class="bg-blue-50 rounded-xl p-4 text-center">
            <div
              class="w-12 h-12 sm:w-8 sm:h-8 bg-blue-500 rounded-full mx-auto mb-3 sm:mb-2 flex items-center justify-center"
            >
              <Repeat class="w-6 h-6 sm:w-4 sm:h-4 text-white" />
            </div>
            <div class="text-base sm:text-sm font-medium text-blue-700">
              Transferencia
            </div>
          </div>

          <!-- Cuenta destino -->
          <div class="bg-purple-50 rounded-xl p-4 text-center">
            <div
              class="w-12 h-12 sm:w-8 sm:h-8 bg-purple-500 rounded-full mx-auto mb-3 sm:mb-2 flex items-center justify-center"
            >
              <component
                :is="getToAccountIcon"
                class="w-6 h-6 sm:w-4 sm:h-4 text-white"
              />
            </div>
            <div class="text-base sm:text-sm font-medium text-purple-700">
              {{ getToAccountLabel }}
            </div>
            <div class="text-xs text-purple-600 mt-1">Cuenta destino</div>
          </div>
        </div>
      </div>

      <!-- Estado de error si faltan datos -->
      <div v-if="!isTransferValid" class="p-6 text-center">
        <div class="text-red-500 mb-4">
          <ShieldAlert class="w-12 h-12 mx-auto" />
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          Información Incompleta
        </h3>
        <p class="text-gray-600 mb-4">
          Faltan algunos datos para completar la transferencia
        </p>
        <div class="text-sm text-gray-500">
          Vuelve al paso anterior para completar la configuración
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import {
  Repeat,
  ArrowRight,
  Coins,
  SmartphoneDevice,
  Wallet,
  Clock,
  ShieldAlert,
  InfoCircle,
} from "@iconoir/vue";

const props = defineProps({
  transactionData: {
    type: Object,
    required: true,
  },
});

const transactionStore = useTransactionStore();

// Computed properties para validar datos
const isTransferValid = computed(() => {
  const transfer = props.transactionData;
  return (
    transfer.fromAccount &&
    transfer.toAccount &&
    transfer.amount &&
    transfer.amount > 0 &&
    transfer.fromAccount !== transfer.toAccount
  );
});

// Computed properties para iconos y etiquetas
const getFromAccountIcon = computed(() => {
  return props.transactionData.fromAccount === "cash"
    ? Coins
    : SmartphoneDevice;
});

const getToAccountIcon = computed(() => {
  return props.transactionData.toAccount === "cash" ? Coins : SmartphoneDevice;
});

const getFromAccountLabel = computed(() => {
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
  };
  return labels[props.transactionData.fromAccount] || "";
});

const getToAccountLabel = computed(() => {
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
  };
  return labels[props.transactionData.toAccount] || "";
});

// Funciones de formato
const formatAmount = (value) => {
  if (!value) return "0.00";
  return parseFloat(value).toFixed(2);
};

const formatDate = (date) => {
  return date.toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (date) => {
  return date.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
