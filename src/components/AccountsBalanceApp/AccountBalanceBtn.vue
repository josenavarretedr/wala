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
        !hasOpeningTransaction
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
      class="absolute z-20 w-64 sm:w-72 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-white bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-xl shadow-gray-900/25 opacity-0 group-hover:opacity-100 transition-all duration-300 -top-20 sm:-top-24 left-1/2 transform -translate-x-1/2 border border-gray-700/50 backdrop-blur-sm"
    >
      <!-- Flecha del tooltip -->
      <div
        class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"
      ></div>

      <div class="text-center">
        <div class="flex items-center justify-center gap-2 mb-2">
          <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span class="font-medium text-yellow-200"
            >Ya realizaste tu cierre</span
          >
        </div>
        <p class="text-gray-300 text-xs mb-3">
          Deberás de esperar hasta el siguiente día para poder aperturar de
          nuevo.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { Safe, SafeOpen } from "@iconoir/vue";

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

const currentIcon = computed(() => {
  if (hasBothTransactions.value) {
    return Safe;
  } else {
    return hasOpeningTransaction.value ? Safe : SafeOpen;
  }
});

const currentText = computed(() => {
  if (hasBothTransactions.value) {
    return "APERTURAR";
  } else {
    return hasOpeningTransaction.value ? "CERRAR" : "APERTURAR";
  }
});

// Al montar el componente, cargar las transacciones
onMounted(async () => {
  await transactionStore.getTransactionsToday();
});
</script>
