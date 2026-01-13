<template>
  <div class="w-full">
    <component
      :is="!hasBothTransactions ? 'router-link' : 'button'"
      :to="!hasBothTransactions ? { name: 'AccountBalanceApp' } : undefined"
      @click="handleClick"
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref, onBeforeUnmount } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { Safe, SafeOpen } from "@iconoir/vue";
import { useToast } from "@/composables/useToast";

const transactionStore = useTransactionStore();
const { warning } = useToast();

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

// Manejar clic en el botón
const handleClick = () => {
  if (hasBothTransactions.value) {
    const remainingTime = countdown.value;
    warning(
      `Ya cerraste hoy. Espera ${remainingTime} para aperturar de nuevo.`,
      {
        duration: 4000,
      }
    );
  }
};

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
