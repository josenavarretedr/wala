<template>
  <div class="w-full max-w-2xl mx-auto p-6">
    <h1 class="text-3xl lg:text-2xl font-bold mb-8 text-center text-orange-600">
      ¿Qué necesitó el negocio?
    </h1>

    <div class="flex flex-col gap-6">
      <input
        v-model="description"
        type="text"
        placeholder="Describe el gasto"
        class="w-full px-6 py-4 border border-gray-300 rounded-2xl shadow text-2xl lg:text-xl text-gray-700"
      />

      <input
        v-model.number="cost"
        @keyup.enter="addExpenseHandler"
        type="number"
        placeholder="¿Cuánto costó?"
        class="w-full px-6 py-4 border border-gray-300 rounded-2xl shadow text-2xl lg:text-xl text-gray-700"
      />

      <button
        @click="addExpenseHandler"
        class="w-full flex justify-center items-center gap-2 px-6 py-4 bg-orange-500 text-white rounded-2xl shadow-xl disabled:opacity-40"
      >
        <FastArrowRight class="w-10 h-10" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { useExpensesStore } from "@/stores/expensesStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { FastArrowRight } from "@iconoir/vue";
import { ref } from "vue";

const description = ref("");
const cost = ref(0);

const expensesStore = useExpensesStore();
const transactionStore = useTransactionStore();

const addExpenseHandler = async () => {
  transactionStore.modifyTransactionExpenseDescriptionAndCost(
    description.value,
    cost.value
  );

  expensesStore.modifyExpenseToAddDescription(description.value);
  expensesStore.modifyExpenseToAddCost(cost.value);
  expensesStore.modifyExpenseToAddAccount(
    transactionStore.transactionToAdd.value.account
  );

  transactionStore.nextStepToAddTransaction();
};
</script>

<style scoped>
.border-dashed {
  border-style: dashed;
}
</style>
