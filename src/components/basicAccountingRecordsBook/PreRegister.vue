<template>
  <div>
    <h1 class="title">Resumen de registro</h1>
    <div class="summary-container">
      <div
        class="text-white items-center align-middle px-5 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform text-4xl text-center w-full"
        :class="
          transactionStore.transactionToAdd.value.type === 'income'
            ? 'bg-cyan-600'
            : 'bg-orange-500'
        "
      >
        <span v-if="transactionStore.transactionToAdd.value.type === 'income'">
          S/. {{ transactionStore.getTransactionToAddTotal() }}
        </span>
        <span v-else>
          S/. {{ transactionStore.transactionToAdd.value.cost }}
        </span>
      </div>
      <div class="flex justify-between summary-item">
        <div
          v-if="transactionStore.transactionToAdd.value.type === 'income'"
          class="flex flex-col bg-white text-blue-500 border border-blue-500 items-center align-middle px-5 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform w-5/12"
        >
          <GraphUp class="w-6 h-6" />

          <span class="text-xl mt-4">Venta</span>
        </div>

        <div
          v-else
          class="flex flex-col items-center bg-white text-red-500 border border-red-500 align-middle px-5 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform w-5/12"
        >
          <DatabaseExport class="w-6 h-6" />

          <span class="text-xl mt-4">Salió</span>
        </div>

        <div
          v-if="transactionStore.transactionToAdd.value.account === 'cash'"
          class="flex flex-col bg-white text-green-500 border border-green-500 items-center align-middle px-5 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform w-5/12"
        >
          <Coins class="w-6 h-6" />

          <span class="text-xl mt-4">Efectivo</span>
        </div>

        <div
          v-else
          class="flex flex-col items-center bg-white text-purple-500 border border-purple-500 align-middle px-5 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform w-5/12"
        >
          <SmartphoneDevice class="w-6 h-6" />

          <span class="text-xl mt-4">Yape/Plin</span>
        </div>
      </div>
      <div
        v-if="transactionStore.transactionToAdd.value.type === 'income'"
        class="mt-6 border-t-4 border-dashed border-gray-300 pt-4 summary-item"
      >
        <h2 class="text-xl font-semibold mb-4">Lista de productos:</h2>
        <table class="min-w-full text-left bg-white">
          <thead>
            <tr>
              <th class="py-2">Producto</th>
              <th class="py-2">Q</th>
              <th class="py-2">Precio uni</th>
              <th class="py-2 text-right">Precio Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in transactionStore.transactionToAdd.value.items"
              :key="item.uuid"
              class="border-b"
            >
              <td class="py-2 text-left">{{ item.description }}</td>
              <td class="py-2 text-left">{{ item.quantity }}</td>
              <td class="py-2 text-left">S/{{ item.price }}</td>
              <td class="py-2 text-right">
                S/{{ item.price * item.quantity }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-else
        class="bg-white border items-center align-middle px-5 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform text-xl text-center w-full"
        :class="
          transactionStore.transactionToAdd.value.type === 'income'
            ? 'text-cyan-600 border-cyan-600'
            : 'text-orange-500 border-orange-500'
        "
      >
        {{ transactionStore.transactionToAdd.value.description }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { GraphUp, DatabaseExport, Coins, SmartphoneDevice } from "@iconoir/vue";

import { useTransactionStore } from "@/stores/transactionStore";
const transactionStore = useTransactionStore();
</script>

<style scoped>
.title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1rem;
}

.summary-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.text {
  font-size: 1.5rem;
  font-weight: bold;
}

@media (min-width: 768px) {
  .summary-container {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .summary-item {
    flex: 1 1 calc(50% - 2rem);
    margin: 1rem;
  }
}
</style>
