<template>
  <div class="relative group w-full">
    <template v-if="!isDisabled">
      <!-- Botón habilitado con estilo mejorado -->
      <router-link
        :to="{ name: 'BasicAccountingRecordsBook' }"
        class="w-full py-3 px-4 sm:py-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/35 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm"
      >
        <DatabaseScriptPlus class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <span class="font-bold tracking-wide text-sm sm:text-base"
          >REGISTRAR</span
        >
      </router-link>
    </template>

    <template v-else>
      <!-- Botón deshabilitado con estilo mejorado -->
      <div
        class="w-full py-3 px-4 sm:py-4 sm:px-6 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg shadow-gray-500/15 cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm relative overflow-hidden"
      >
        <!-- Efecto de deshabilitado -->
        <div class="absolute inset-0 bg-gray-200/20 backdrop-blur-[1px]"></div>

        <DatabaseScriptPlus
          class="w-5 h-5 sm:w-6 sm:h-6 relative z-10 flex-shrink-0"
        />
        <span class="font-bold tracking-wide relative z-10 text-sm sm:text-base"
          >REGISTRAR</span
        >

        <!-- Icono de bloqueo -->
        <div
          class="absolute top-1 right-1 sm:top-2 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <!-- Tooltip mejorado -->
      <div
        class="absolute z-20 w-64 sm:w-72 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-white bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-xl shadow-gray-900/25 opacity-0 group-hover:opacity-100 transition-all duration-300 -top-20 sm:-top-24 left-1/2 transform -translate-x-1/2 border border-gray-700/50 backdrop-blur-sm"
      >
        <!-- Flecha del tooltip -->
        <div
          class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"
        ></div>

        <div class="text-center">
          <div class="flex items-center justify-center gap-2 mb-2">
            <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span class="font-medium text-yellow-200">Para registrar</span>
          </div>
          <p class="text-gray-300 text-xs mb-3">
            {{ messageTooltip.detail }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { DatabaseScriptPlus } from "@iconoir/vue";
import { useCashEventStore } from "@/stores/cashEventStore";

import { useTransactionStore } from "@/stores/transaction/transactionStore";

const transactionStore = useTransactionStore();

// Computed para verificar si existe una transacción de tipo "opening"
const hasOpeningTransaction = computed(() => {
  return transactionStore.transactionsInStore.value.some(
    (transaction) => transaction.type === "opening"
  );
});

const hasClosureTransaction = computed(() => {
  return transactionStore.transactionsInStore.value.some(
    (transaction) => transaction.type === "closure"
  );
});

const hasBothTransactions = computed(() => {
  return hasOpeningTransaction.value && hasClosureTransaction.value;
});

// Computed para determinar si el botón está deshabilitado
const isDisabled = computed(() => {
  if (hasBothTransactions.value) {
    return true;
  } else {
    return !hasOpeningTransaction.value;
  }
});

const messageTooltip = computed(() => {
  if (hasBothTransactions.value) {
    const remainingTime = countdown.value;
    const title = "Para registrar:";
    const detail = `Eliminar tu último cierre o esperar ${remainingTime} para aperturar de nuevo.`;
    return {
      title,
      detail,
    };
  } else {
    const title = "Apertura requerida";
    const detail = "Debes aperturar.";
    return {
      title,
      detail,
    };
  }
});

// Estado del contador
const countdown = ref("00:00:00");
let countdownInterval = null;

// Función para actualizar el contador hasta medianoche
const updateCountdown = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const timeDiff = midnight - now;

  if (timeDiff <= 0) {
    countdown.value = "00:00:00";
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    return;
  }

  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  countdown.value = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// Inicializar el contador
const initializeCountdown = () => {
  updateCountdown();
  if (!countdownInterval) {
    countdownInterval = setInterval(updateCountdown, 1000);
  }
};

// Limpiar el contador
const clearCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
};

// Lifecycle hooks
onMounted(() => {
  initializeCountdown();
});

onBeforeUnmount(() => {
  clearCountdown();
});

// Limpiar interval cuando el componente se desmonte
defineExpose({
  clearCountdown,
  initializeCountdown,
});
</script>
