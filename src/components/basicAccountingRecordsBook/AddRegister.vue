<template>
  <div class="w-full max-w-lg mx-auto p-6 my-6 bg-white rounded-lg shadow-lg">
    <div class="flex items-end mt-3 mb-4">
      <router-link
        to="/"
        class="ml-auto text-x"
        @click="transactionStore.resetTransactionToAdd()"
      >
        <Xmark class="cursor-pointer text-red-500 w-10 h-10"></Xmark>
      </router-link>
    </div>
    <div v-if="!finish">
      {{ transactionStore.transactionToAdd.value }}
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
        <div v-if="transactionStore.currentStepOfAddTransaction.value === 1">
          <IncomeOrExpense></IncomeOrExpense>
        </div>
        <div
          v-else-if="transactionStore.currentStepOfAddTransaction.value === 2"
        >
          <CashOrBank></CashOrBank>
        </div>
        <div
          v-else-if="transactionStore.currentStepOfAddTransaction.value === 3"
        >
          <AddIncome
            v-if="transactionStore.transactionToAdd.value.type === 'income'"
          />
          <AddExpense
            v-else-if="
              transactionStore.transactionToAdd.value.type === 'expense'
            "
          />
        </div>
        <div
          v-else-if="transactionStore.currentStepOfAddTransaction.value === 4"
        >
          <PreRegister />
        </div>
      </div>
    </div>

    <div v-else>
      <SummaryOfRegister></SummaryOfRegister>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-6">
      <button
        @click="transactionStore.prevStepToAddTransaction()"
        v-if="finish === false"
        :disabled="transactionStore.currentStepOfAddTransaction.value === 1"
        class="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg disabled:opacity-50 flex items-center"
      >
        <NavArrowLeft />
        <span class="ml-2">Atrás</span>
      </button>

      <button
        @click="saveRegister"
        v-if="
          transactionStore.currentStepOfAddTransaction.value === steps.length &&
          !finish
        "
        class="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
      >
        <CloudUpload />
        <span class="ml-2">Guardar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import AddIncome from "./AddIncome.vue";
import AddExpense from "./AddExpense.vue";
import IncomeOrExpense from "./IncomeOrExpense.vue";
import PreRegister from "./PreRegister.vue";
import SummaryOfRegister from "./SummaryOfRegister.vue";
import CashOrBank from "./CashOrBank.vue";
import { NavArrowLeft, CloudUpload, BinMinusIn, Xmark } from "@iconoir/vue";

import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();

const steps = [
  "IncomeOrExpense",
  "CashOrBank",
  "AddIncomeOrExpense",
  "Summary",
];

const finish = ref(false);

async function saveRegister() {
  try {
    await transactionStore.addTransaction();
    finish.value = true;
  } catch (error) {
    console.error("Error writing register: ", error);
  }
}
</script>

<style scoped>
/* Estilos adicionales opcionales */
</style>
