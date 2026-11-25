<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import {
  getProgressIndicatorProps,
  FLOW_TYPES,
} from "@/composables/useProgressIndicator";
import NavigationBtnBARB from "../../components/basicAccountingRecordsBook/NavigationBtnBARB.vue";
import CloseBtn from "@/components/ui/CloseBtn.vue";
import ProgressIndicator from "@/components/ui/ProgressIndicator.vue";

const route = useRoute();
const flow = useTransactionFlowStore();
const transactionStore = useTransactionStore();

onMounted(() => {
  const qType = route.query.type;
  const qCategory = route.query.category;
  const qPreset = route.query.preset;
  if (qType === "expense" || qType === "income" || qType === "transfer") {
    transactionStore.resetTransactionToAdd();
    transactionStore.modifyTransactionToAddType(qType);
    flow.defineDynamicSteps(qType);
    if (qType === "expense") {
      if (qPreset === "owner_salary" || qPreset === "family_salary") {
        transactionStore.setExpenseCategory("labor");
        transactionStore.setExpenseSubcategory(String(qPreset));
        transactionStore.transactionToAdd.value.expensePreset = String(qPreset);
        transactionStore.transactionToAdd.value.statementLine = null;
        flow.currentStep = 2;
      } else if (qPreset === "owner_draw" || qCategory === "owner_draw") {
        transactionStore.setExpenseCategory("owner_draw");
        transactionStore.setExpenseSubcategory("personal_withdrawal");
        transactionStore.transactionToAdd.value.expensePreset = "owner_draw";
        transactionStore.transactionToAdd.value.statementLine = "owner_draw";
        flow.currentStep = 2;
      } else if (qCategory) {
        transactionStore.setExpenseCategory(String(qCategory));
        flow.currentStep = 2; // Ir directo a Detalles egreso
      } else {
        flow.currentStep = 1;
      }
    } else {
      flow.currentStep = 1;
    }
  }
});

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
    id="basicAccountingRecordsWrapper"
    class="space-y-4 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-20"
  >
    <!-- HEADER -->
    <div class="flex justify-end items-center gap-3 mb-3">
      <ProgressIndicator v-bind="progressProps" />

      <CloseBtn v-bind="closeBtnConfig" />
    </div>
    <!-- Paso actual -->
    <component :is="CurrentStepComponent" />

    <div
      class="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-xl border-t border-gray-100"
    >
      <NavigationBtnBARB />
    </div>
  </div>
</template>
