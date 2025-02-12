<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-center">
      ¿Qué necesitó el negocio?
    </h1>
    {{ expensesStore.expenseToAdd.description }}
    {{ expensesStore.expenseToAdd.cost }}
    <div class="flex flex-col space-y-6">
      <input
        v-model="description"
        type="text"
        placeholder="Describe el gasto"
        class="px-4 py-2 border rounded-lg shadow-lg text-lg"
      />
      <input
        v-model.number="cost"
        @keyup.enter="addExpenseHandler"
        type="number"
        placeholder="Cuánto costó"
        class="px-4 py-2 border rounded-lg shadow-lg text-lg"
      />
      <button
        @click="addExpenseHandler"
        class="px-4 py-2 bg-orange-500 text-white rounded-lg shadow-lg disabled:opacity-50 flex justify-center items-center"
      >
        <FastArrowRight class="w-12 h-12"></FastArrowRight>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useExpensesStore } from "@/stores/expensesStore"; // Importa el store de expenses
import { useTransactionStore } from "@/stores/transactionStore";
import { FastArrowRight } from "@iconoir/vue"; // Importar iconos de Iconoir

import { ref } from "vue";

const description = ref("");
const cost = ref(0);

const expensesStore = useExpensesStore(); // Usa el store
const transactionStore = useTransactionStore();

const addExpenseHandler = async () => {
  transactionStore.modifyTransactionExpenseDescriptionAndCost(
    description.value,
    cost.value
  ); // Modifica la descripción y el costo del gasto en el store de transacciones

  expensesStore.modifyExpenseToAddDescription(description.value);
  expensesStore.modifyExpenseToAddCost(cost.value);
  expensesStore.modifyExpenseToAddAccount(
    transactionStore.transactionToAdd.value.account
  );
  // Modifica la descripción y el costo del gasto en el store de expenses

  transactionStore.nextStepToAddTransaction();
  // await expensesStore.addExpense();
  // Llama a la acción para agregar el gasto desde el store
  // expensesStore.resetExpenseToAdd();
  // Limpia el formulario después de agregar
};
</script>

<style scoped>
/* Estilos adicionales para mejorar la visualización */
.border-dashed {
  border-style: dashed;
}
</style>
