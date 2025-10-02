<script setup>
import { computed } from "vue";

import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useBusinessStore } from "@/stores/businessStore";
import {
  getProgressIndicatorProps,
  FLOW_TYPES,
} from "@/composables/useProgressIndicator";
import NavigationBtnBARB from "../../components/basicAccountingRecordsBook/NavigationBtnBARB.vue";
import CloseBtn from "@/components/ui/CloseBtn.vue";
import ProgressIndicator from "@/components/ui/ProgressIndicator.vue";

const flow = useTransactionFlowStore();
const transactionStore = useTransactionStore();

const CurrentStepComponent = computed(() => flow.currentStepConfig.component);

// Props para el ProgressIndicator usando el composable
const progressProps = computed(() =>
  getProgressIndicatorProps(flow, FLOW_TYPES.TRANSACTION)
);

// Configuración para el CloseBtn
const closeBtnConfig = {
  flowStore: flow,
  additionalStores: {
    transactionStore,
  },
  flowType: FLOW_TYPES.TRANSACTION,
};
</script>

<template>
  <div
    class="space-y-6 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-8"
  >
    <!-- AQUI VA EL NUEVO COMPONENTE -->
    <div class="flex justify-end items-center gap-3 mb-4">
      <ProgressIndicator v-bind="progressProps" />

      <CloseBtn v-bind="closeBtnConfig" />
    </div>
    <!-- Paso actual -->
    <component :is="CurrentStepComponent" />

    <div
      class="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white rounded-2xl shadow-xl"
    >
      <NavigationBtnBARB :finalizarRegistro="finalizarRegistro" />
    </div>
  </div>
</template>
