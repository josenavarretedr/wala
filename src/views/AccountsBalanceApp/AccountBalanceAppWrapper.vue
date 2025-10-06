<template>
  <div
    class="space-y-4 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-20"
  >
    <!-- HEADER -->
    <div class="flex justify-end items-center gap-3 mb-3">
      <!-- <ProgressIndicator v-bind="progressProps" /> -->

      <CloseBtn v-bind="closeBtnConfig" />
    </div>
    <!-- Renderiza AccountBalanceAppOpen si no hay transacción de apertura -->
    <AccountBalanceAppOpen v-if="!hasOpeningTransaction" />

    <!-- Renderiza AccountBalanceAppClose si ya hay transacción de apertura -->
    <AccountBalanceAppClose v-else />
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import AccountBalanceAppOpen from "@/components/AccountsBalanceApp/AccountBalanceAppOpen.vue";
import AccountBalanceAppClose from "@/components/AccountsBalanceApp/AccountBalanceAppClose.vue";
import ProgressIndicator from "@/components/ui/ProgressIndicator.vue";
import CloseBtn from "@/components/ui/CloseBtn.vue";

const transactionStore = useTransactionStore();

// Computed para verificar si existe una transacción de tipo "opening"
const hasOpeningTransaction = computed(() => {
  return transactionStore.transactionsInStore.value.some(
    (transaction) => transaction.type === "opening"
  );
});

// Al montar el componente, cargar las transacciones
onMounted(async () => {
  await transactionStore.getTransactionsToday();
});
</script>
