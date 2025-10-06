<template>
  <div class="relative group w-full">
    <router-link
      :to="{ name: 'AccountBalanceApp' }"
      :class="[
        'w-full py-3 px-4 sm:py-4 sm:px-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm',
        hasOpeningTransaction
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
    </router-link>
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

const currentIcon = computed(() => {
  return hasOpeningTransaction.value ? Safe : SafeOpen;
});

const currentText = computed(() => {
  return hasOpeningTransaction.value ? "CERRAR" : "APERTURAR";
});

// Al montar el componente, cargar las transacciones
onMounted(async () => {
  await transactionStore.getTransactionsToday();
});
</script>
