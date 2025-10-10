<template>
  <div class="relative group w-full">
    <component
      :is="!hasBothTransactions ? 'router-link' : 'div'"
      :to="!hasBothTransactions ? { name: 'AccountBalanceApp' } : undefined"
      :class="[
        'w-full py-3 px-4 sm:py-4 sm:px-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm',
        !hasBothTransactions
          ? 'transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
          : 'cursor-not-allowed opacity-60',
        !hasOpeningToday
          ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-orange-500/25 hover:from-orange-700 hover:to-orange-800 hover:shadow-orange-500/35'
          : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/25 hover:from-purple-700 hover:to-purple-800 hover:shadow-purple-500/35',
      ]"
    >
      <component
        :is="currentIcon"
        class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
      />
      <span class="font-bold tracking-wide text-sm sm:text-base truncate">{{
        currentText
      }}</span>
    </component>

    <!-- Tooltip mejorado -->
    <div
      v-if="hasBothTransactions"
      class="absolute z-20 w-64 sm:w-72 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-white bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-xl shadow-gray-900/25 opacity-0 group-hover:opacity-100 transition-all duration-300 -top-20 sm:-top-24 left-1/2 transform -translate-x-1/2 border border-gray-700/50 backdrop-blur-sm"
    >
      <!-- Flecha del tooltip -->
      <div
        class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"
      ></div>

      <div class="text-center">
        <div class="flex items-center justify-center gap-2 mb-2">
          <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span class="font-medium text-yellow-200">{{
            messageTooltip.title
          }}</span>
        </div>
        <p class="text-gray-300 text-xs mb-3">
          {{ messageTooltip.detail }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, onBeforeUnmount } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { Safe, SafeOpen } from "@iconoir/vue";

const transactionStore = useTransactionStore();

// Computed para verificar si existe una transacción de tipo "opening"
const hasOpeningToday = computed(() => {
  return transactionStore.transactionsInStore.value.some(
    (transaction) => transaction.type === "opening"
  );
});

const hasClosureToday = computed(() => {
  return transactionStore.transactionsInStore.value.some(
    (transaction) => transaction.type === "closure"
  );
});

const hasBothTransactions = computed(() => {
  return hasOpeningToday.value && hasClosureToday.value;
});

const currentIcon = computed(() => {
  if (hasBothTransactions.value) {
    return Safe;
  } else {
    return hasOpeningToday.value ? Safe : SafeOpen;
  }
});

const currentText = computed(() => {
  if (hasBothTransactions.value) {
    return "APERTURAR";
  } else {
    return hasOpeningToday.value ? "CERRAR" : "APERTURAR";
  }
});

const messageTooltip = computed(() => {
  const remainingTime = countdown.value;
  const title = "Apertura requerida";
  const detail = `${remainingTime} para aperturar de nuevo.`;
  return {
    title,
    detail,
  };
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

// Al montar el componente, cargar las transacciones
onMounted(async () => {
  initializeCountdown();
  await transactionStore.getTransactionsToday();
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
