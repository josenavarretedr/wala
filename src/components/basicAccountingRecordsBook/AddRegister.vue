<template>
  <div class="w-full max-w-lg mx-auto p-6 my-6 bg-white rounded-lg shadow-lg">
    <!-- Cerrar pabel de Register transaction -->
    <div class="flex items-end mt-3 mb-4">
      <router-link
        to="/dashboard"
        class="ml-auto text-x"
        @click="transactionStore.resetTransactionToAdd()"
      >
        <Xmark class="cursor-pointer text-red-500 w-10 h-10"></Xmark>
      </router-link>
    </div>
    <div v-if="!finish">
      <!-- Stepper -->
      <div class="flex items-center justify-between mb-8">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex items-center"
        >
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300"
            :class="{
              'bg-blue-500 text-white border-blue-500':
                transactionStore.currentStepOfAddTransaction.value >= index + 1,
              'bg-white text-gray-500 border-gray-300':
                transactionStore.currentStepOfAddTransaction.value < index + 1,
            }"
          >
            {{ index + 1 }}
          </div>
          <div
            v-if="index < steps.length - 1"
            class="flex-1 h-0.5 transition-all duration-300"
            :class="{
              'bg-blue-500':
                transactionStore.currentStepOfAddTransaction.value > index + 1,
              'bg-gray-300':
                transactionStore.currentStepOfAddTransaction.value <= index + 1,
            }"
          ></div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="p-6">
        <component
          v-if="currentStepConfig"
          :is="currentStepConfig.component"
          v-bind="currentStepConfig.props"
        />
      </div>
    </div>

    <div v-else>
      <SummaryOfRegister></SummaryOfRegister>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-6">
      <button
        @click="goBack"
        v-if="!finish"
        :disabled="isFirstStep"
        class="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg disabled:opacity-50 flex items-center"
      >
        <NavArrowLeft />
        <span class="ml-2">Atrás</span>
      </button>

      <button
        @click="saveRegister"
        v-if="isFinalStep && !finish"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
      >
        <CloudUpload />
        <span class="ml-2">Guardar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeMount } from "vue";
import AddIncome from "./AddIncome.vue";
import AddExpense from "./AddExpense.vue";
import IncomeOrExpense from "./IncomeOrExpense.vue";
import PreRegister from "./PreRegister.vue";
import SummaryOfRegister from "./SummaryOfRegister.vue";
import CashOrBank from "./CashOrBank.vue";
import { NavArrowLeft, CloudUpload, BinMinusIn, Xmark } from "@iconoir/vue";

import CajaDiaria from "@/components/cashClosureApp/CajaDiaria.vue";

import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useTransactionFlow } from "@/composables/useTransactionFlow";

const transactionStore = useTransactionStore();

// const steps = computed(() => transactionStore.getSteps());

const finish = ref(false);

// 🚀 microfábrica del flujo
const {
  steps,
  isFirstStep,
  isFinalStep,
  goNext,
  goBack,
  hasCajaDiaria,
  startStep,
} = useTransactionFlow();

async function saveRegister() {
  try {
    await transactionStore.addTransaction();
    finish.value = true;
  } catch (error) {
    console.error("Error writing register: ", error);
  }
}

onMounted(() => {
  transactionStore.resetTransactionToAdd();
  transactionStore.currentStepOfAddTransaction.value = startStep.value;
});

const addIncomeOrExpenseComponent = computed(() => {
  const type = transactionStore.transactionToAdd.value.type;
  if (type === "expense") return AddExpense;
  return AddIncome; // por defecto
});

const stepComponents = computed(() => ({
  CajaDiaria: {
    component: CajaDiaria,
    props: { type: "opening" },
  },
  IncomeOrExpense: { component: IncomeOrExpense },
  CashOrBank: { component: CashOrBank },
  AddIncomeOrExpense: {
    component: addIncomeOrExpenseComponent.value,
  },
  Summary: { component: PreRegister },
}));

const currentStepConfig = computed(
  () => stepComponents.value[currentStepName.value] ?? null
);

const currentStepIndex = computed(
  () => transactionStore.currentStepOfAddTransaction.value
);

const currentStepName = computed(() => {
  const index = currentStepIndex.value - startStep.value;
  return steps.value[index] ?? null;
});

const currentStepComponent = computed(
  () => stepComponents.value[currentStepName.value] ?? null
);
</script>

<style scoped>
/* Estilos adicionales opcionales */
</style>
