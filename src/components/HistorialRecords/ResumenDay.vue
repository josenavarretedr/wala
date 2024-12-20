<template>
  <div class="px-4 py-2 mt-4 text-lg font-light">
    <div class="flex justify-between items-center mb-2">
      <div class="flex items-center">
        <Cash class="mr-2" />
        <span>Saldo anterior:</span>
      </div>
      <span>S/ 0.00</span>
    </div>
    <div class="flex justify-between items-center mb-2 text-blue-500">
      <div class="flex items-center">
        <GraphUp class="mr-2" />
        <span>Ventas hoy:</span>
      </div>
      <span>S/ {{ totalIngresos }}</span>
    </div>
    <div class="flex justify-between items-center mb-2 text-red-500">
      <div class="flex items-center">
        <DatabaseExport class="mr-2" />
        <span>Salidas hoy:</span>
      </div>
      <span>S/ {{ totalEgresos }}</span>
    </div>
    <div class="flex justify-between items-center text-xl font-bold">
      <div class="flex items-center">
        <Cash class="mr-2" />
        <span>Saldo actual:</span>
      </div>
      <span>S/ {{ saldoActual }}</span>
    </div>
  </div>
</template>

<script setup>
import { GraphUp, DatabaseExport, Cash } from "@iconoir/vue"; // Importar iconos de Iconoir
import { computed } from "vue";

const props = defineProps({
  initialDailyData: {
    type: Array,
    default: () => [],
  },
});

const totalIngresos = computed(() => {
  return props.initialDailyData
    .filter((record) => record.type === "income")
    .reduce(
      (sum, record) =>
        sum + record.items.reduce((sum, item) => sum + item.price, 0),
      0
    )
    .toFixed(2);
});

const totalEgresos = computed(() => {
  return props.initialDailyData
    .filter((record) => record.type === "expense")
    .reduce(
      (sum, record) =>
        sum + record.items.reduce((sum, item) => sum + item.price, 0),
      0
    )
    .toFixed(2);
});

const saldoActual = computed(() => {
  return (totalIngresos.value - totalEgresos.value).toFixed(2);
});
</script>
