<template>
  <div
    class="space-y-4 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-20"
  >
    <!-- HEADER -->
    <div class="flex justify-end items-center gap-3 mb-3">
      <ProgressIndicator v-bind="progressProps" />

      <CloseBtn v-bind="closeBtnConfig" />
    </div>
    <!-- Renderiza AccountBalanceAppOpen si no hay transacción de apertura -->
    <AccountBalanceAppOpen
      v-if="!isLoading && !hasOpeningTransaction"
      @opening-created="onOpeningCreated"
    />

    <!-- Renderiza AccountBalanceAppClose si ya hay transacción de apertura -->
    <AccountBalanceAppClose v-else-if="!isLoading && hasOpeningTransaction" />

    <!-- Loading state -->
    <div v-else class="flex justify-center items-center py-8">
      <div class="text-gray-500">Cargando...</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import AccountBalanceAppOpen from "@/components/AccountsBalanceApp/AccountBalanceAppOpen.vue";
import AccountBalanceAppClose from "@/components/AccountsBalanceApp/AccountBalanceAppClose.vue";
import { useAccountBalanceFlowStore } from "@/stores/AccountsBalanceApp/accountBalanceFlowStore.js";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import ProgressIndicator from "@/components/ui/ProgressIndicator.vue";
import CloseBtn from "@/components/ui/CloseBtn.vue";

import {
  getProgressIndicatorProps,
  FLOW_TYPES,
} from "@/composables/useProgressIndicator";

const transactionStore = useTransactionStore();
const flow = useAccountBalanceFlowStore();
// Props para el ProgressIndicator usando el composable
const progressProps = computed(() =>
  getProgressIndicatorProps(flow, FLOW_TYPES.TRANSACTION)
);

// Estado local para evitar el bucle infinito
const hasOpeningTransaction = ref(false);
const isLoading = ref(true);

// Al montar el componente, cargar las transacciones una sola vez
onMounted(async () => {
  try {
    await transactionStore.getTransactionsToday();

    // Verificar si existe una transacción de tipo "opening" una sola vez
    hasOpeningTransaction.value =
      transactionStore.transactionsInStore.value.some(
        (transaction) => transaction.type === "opening"
      );
  } catch (error) {
    console.error("Error cargando transacciones:", error);
  } finally {
    isLoading.value = false;
  }
});

// Manejar cuando se crea una nueva apertura
const onOpeningCreated = () => {
  hasOpeningTransaction.value = true;
};

// Configuración para el CloseBtn
const closeBtnConfig = {
  flowStore: flow,
  additionalStores: {
    transactionStore,
  },
  flowType: FLOW_TYPES.ACCOUNT_BALANCE,
};
</script>
