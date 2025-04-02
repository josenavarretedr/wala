<template>
  <div class="w-full max-w-3xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-center mb-8 text-purple-700">
      Resumen de registro
    </h1>

    <!-- Monto principal -->
    <div
      class="text-white text-5xl font-extrabold px-6 py-6 rounded-2xl shadow-xl text-center mb-6"
      :class="selectedType === 'income' ? 'bg-cyan-600' : 'bg-orange-500'"
    >
      <span v-if="selectedType === 'income'"> S/. {{ totalSum }} </span>
      <span v-else> S/. {{ itemsList[0].price }} </span>
    </div>

    <!-- Tipo y cuenta -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div
        :class="
          selectedType === 'income'
            ? 'border-blue-500 text-blue-500'
            : 'border-red-500 text-red-500'
        "
        class="bg-white border rounded-xl p-5 shadow flex flex-col items-center gap-2"
      >
        <component
          :is="selectedType === 'income' ? GraphUp : DatabaseExport"
          class="w-8 h-8"
        />
        <span class="text-xl font-semibold">
          {{ selectedType === "income" ? "Venta" : "Salió" }}
        </span>
      </div>

      <div
        :class="
          selectedAccount === 'cash'
            ? 'border-green-500 text-green-500'
            : 'border-purple-500 text-purple-500'
        "
        class="bg-white border rounded-xl p-5 shadow flex flex-col items-center gap-2"
      >
        <component
          :is="selectedAccount === 'cash' ? Coins : SmartphoneDevice"
          class="w-8 h-8"
        />
        <span class="text-xl font-semibold">
          {{ selectedAccount === "cash" ? "Efectivo" : "Yape/Plin" }}
        </span>
      </div>
    </div>

    <!-- Lista de productos (si es income) -->
    <div v-if="selectedType === 'income'" class="mt-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Productos agregados</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in itemsList"
          :key="item.uuid"
          class="bg-white border rounded-xl shadow-md px-4 py-3 flex flex-col justify-between"
        >
          <div class="text-lg font-bold text-gray-700 mb-1 truncate">
            {{ item.description }}
          </div>

          <div class="text-gray-600 flex justify-between text-sm">
            <span>{{ item.quantity }} uni × S/ {{ item.price }}</span>
            <span class="text-green-600 font-bold">
              S/ {{ (item.quantity * item.price).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Descripción libre (si es expense) -->
    <div
      v-else
      class="bg-white border rounded-xl shadow p-6 text-xl text-center mt-6"
      :class="
        selectedType === 'income'
          ? 'text-cyan-600 border-cyan-600'
          : 'text-orange-500 border-orange-500'
      "
    >
      {{ itemsList[0].description }}
    </div>
  </div>
</template>

<script setup>
import { GraphUp, DatabaseExport, Coins, SmartphoneDevice } from "@iconoir/vue";
import { computed } from "vue";

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

const totalSum = computed(() => {
  return props.itemsList.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
});
</script>

<style scoped>
.summary-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  .summary-container {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
