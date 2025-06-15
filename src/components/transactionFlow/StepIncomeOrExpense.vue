<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-center">
      ¿Ingresó o salió dinero del negocio?
    </h1>
    <div
      class="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0 justify-center"
    >
      <button
        @click="handleSelectedType('income')"
        :class="{
          'bg-blue-500 text-white':
            transactionStore.transactionToAdd.value.type === 'income',
          'bg-white text-blue-500 border border-blue-500':
            transactionStore.transactionToAdd.value.type !== 'income',
        }"
        class="flex flex-col items-center align-middle px-10 py-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
      >
        <GraphUp class="w-12 h-12" />

        <span class="text-2xl mt-4">Ingresó</span>
      </button>
      <button
        @click="handleSelectedType('expense')"
        :class="{
          'bg-red-500 text-white':
            transactionStore.transactionToAdd.value.type === 'expense',
          'bg-white text-red-500 border border-red-500':
            transactionStore.transactionToAdd.value.type !== 'expense',
        }"
        class="flex flex-col items-center align-middle px-10 py-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
      >
        <DatabaseExport class="w-12 h-12" />

        <span class="text-2xl mt-4">Salió</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { GraphUp, DatabaseExport } from "@iconoir/vue"; // Importar iconos de Iconoir
import { useTransactionStore } from "@/stores/transaction/transactionStore";

import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
const flow = useTransactionFlowStore();

const transactionStore = useTransactionStore();

const handleSelectedType = (type) => {
  transactionStore.modifyTransactionToAddType(type);
  flow.defineDynamicSteps(type);
  flow.nextStep();
};
</script>

<style scoped>
/* Puedes agregar estilos adicionales aquí si es necesario */
</style>
