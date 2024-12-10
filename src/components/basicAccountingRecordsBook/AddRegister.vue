<template>
  <div class="w-full max-w-lg mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Agregar Registro</h1>
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
            'bg-blue-500 text-white border-blue-500': currentStep >= index + 1,
            'bg-white text-gray-500 border-gray-300': currentStep < index + 1,
          }"
        >
          {{ index + 1 }}
        </div>
        <div
          v-if="index < steps.length - 1"
          class="flex-1 h-0.5 transition-all duration-300"
          :class="{
            'bg-blue-500': currentStep > index + 1,
            'bg-gray-300': currentStep <= index + 1,
          }"
        ></div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="p-6 border rounded-lg shadow-md bg-white">
      <div v-if="currentStep === 1">
        <IncomeOrExpense
          :selectedType="selectedType"
          @update:selectedType="selectType"
        ></IncomeOrExpense>
      </div>
      <div v-else-if="currentStep === 2">
        <CashOrBank
          :selectedAccount="selectedAccount"
          @update:selectedAccount="selectAccount"
        ></CashOrBank>
      </div>
      <div v-else-if="currentStep === 3">
        <AddIncome
          v-if="selectedType === 'Ingreso'"
          :initialItemsList="itemsList"
          @update:itemsList="handleItemsList"
        />
        <AddExpense
          v-else-if="selectedType === 'Egreso'"
          @update:expenseItem="handleExpenseItem"
        />
      </div>
      <div v-else-if="currentStep === 4">
        <SummaryOfRegister
          :selectedType="selectedType"
          :selectedAccount="selectedAccount"
          :itemsList="itemsList"
        />
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-6">
      <button
        @click="prevStep"
        :disabled="currentStep === 1"
        class="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg disabled:opacity-50"
      >
        Anterior
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import AddIncome from "./AddIncome.vue";
import AddExpense from "./AddExpense.vue";
import IncomeOrExpense from "./IncomeOrExpense.vue";
import SummaryOfRegister from "./SummaryOfRegister.vue";
import CashOrBank from "./CashOrBank.vue";

const currentStep = ref(1);
const steps = [
  "IncomeOrExpense",
  "CashOrBank",
  "AddIncomeOrExpense",
  "Summary",
  "Finish",
];
const selectedType = ref(null);
const selectedAccount = ref(null);
const itemsList = ref([]);
const expenseItem = ref([]);

function nextStep() {
  if (currentStep.value < steps.length) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function selectType(type) {
  selectedType.value = type;
  if (currentStep.value === 1) {
    nextStep();
  }
}

function selectAccount(account) {
  selectedAccount.value = account;
  nextStep();
}

function handleItemsList(newItemsList) {
  itemsList.value = newItemsList;
  nextStep();
}

function handleExpenseItem(newExpenseItem) {
  expenseItem.value = newExpenseItem;
  nextStep();
}
</script>

<style scoped>
/* Estilos adicionales opcionales */
</style>
