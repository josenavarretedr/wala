<template>
  <div>
    <h1 class="title">Detalle de registro</h1>
    <div class="summary-container">
      <div
        class="text-white items-center align-middle px-5 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform text-4xl text-center w-full"
        :class="selectedType === 'income' ? 'bg-cyan-600' : 'bg-orange-500'"
      >
        <span v-if="selectedType === 'income'"> S/. {{ totalSum }} </span>
        <span v-else> S/. {{ itemsList[0].price }} </span>
      </div>
      <div class="flex justify-between summary-item">
        <div
          v-if="selectedType === 'income'"
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
          v-if="selectedAccount === 'cash'"
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
        v-if="selectedType === 'income'"
        class="mt-6 border-t-4 border-dashed border-gray-300 pt-4 summary-item"
      >
        <h2 class="text-xl font-semibold mb-4">Lista de productos:</h2>
        <Suspense>
          <template #default>
            <TableOfProductInRegister :itemsList="itemsList" />
          </template>
          <template #fallback>
            <div>Cargando ...</div>
          </template>
        </Suspense>
        
      </div>

      <div
        v-else
        class="bg-white border items-center align-middle px-5 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform text-xl text-center w-full"
        :class="
          selectedType === 'income'
            ? 'text-cyan-600 border-cyan-600'
            : 'text-orange-500 border-orange-500'
        "
      >
        {{ itemsList[0].description }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { GraphUp, DatabaseExport, Coins, SmartphoneDevice } from "@iconoir/vue";
import TableOfProductInRegister from "@/components/HistorialRecords/TableOfProductInRegister.vue";

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
  totalSum: {
    type: Number,
    default: 0,
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
