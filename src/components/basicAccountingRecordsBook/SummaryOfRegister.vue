<template>
  <div>
    <h1 class="title">Summary of Register</h1>
    <div class="summary-container">
      <div class="flex justify-around">
        <div class="summary-item">
          <div
            v-if="selectedType === 'Ingreso'"
            class="flex flex-col bg-white text-blue-500 border border-blue-500 items-center align-middle px-10 py-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
          >
            <GraphUp class="w-12 h-12" />

            <span class="text-2xl mt-4">Venta</span>
          </div>

          <div
            v-else
            class="flex flex-col items-center bg-white text-red-500 border border-red-500 align-middle px-10 py-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
          >
            <DatabaseExport class="w-12 h-12" />

            <span class="text-2xl mt-4">Salió</span>
          </div>
        </div>
        <div class="summary-item">
          <Coins v-if="selectedAccount === 'Cash'" class="icon" />
          <SmartphoneDevice
            v-else-if="selectedAccount === 'Bank'"
            class="icon"
          />
          <span class="text">{{ selectedAccount }}</span>
        </div>
      </div>
      <div
        v-if="itemsList.length > 0"
        class="mt-6 border-t-4 border-dashed border-gray-300 pt-4"
      >
        <h2 class="text-2xl font-semibold mb-4">Lista de productos:</h2>
        <table class="min-w-full text-left bg-white">
          <thead>
            <tr>
              <th class="py-2">Producto</th>
              <th class="py-2">Cantidad</th>
              <th class="py-2">Precio</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in itemsList" :key="item.uuid" class="border-b">
              <td class="py-2 text-left">{{ item.product }}</td>
              <td class="py-2 text-left">{{ item.quantity }}</td>
              <td class="py-2 text-left">S/{{ item.price }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from "vue";
import { GraphUp, DatabaseExport, Coins, SmartphoneDevice } from "@iconoir/vue";

const props = defineProps({
  itemsList: {
    type: Array,
    default: () => [],
  },
  selectedType: {
    type: String,
    default: null,
  },
  selectedAccount: {
    type: String,
    default: null,
  },
});
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

.summary-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
