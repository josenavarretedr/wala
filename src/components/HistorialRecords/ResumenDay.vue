<template>
  <div
    class="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6 text-gray-800"
  >
    <h2 class="text-2xl font-bold text-center mb-2">Resumen del día</h2>

    <!-- Saldo anterior -->
    <div class="flex justify-between items-center text-lg">
      <div class="flex items-center gap-2">
        <Cash class="w-6 h-6 text-gray-600" />
        <span class="font-medium">Saldo anterior:</span>
      </div>
      <span class="font-semibold">S/ 0.00</span>
    </div>

    <!-- Ingresos -->
    <div class="flex justify-between items-center text-lg text-blue-600">
      <div class="flex items-center gap-2">
        <GraphUp class="w-6 h-6" />
        <span class="font-medium">Ventas hoy:</span>
      </div>
      <span class="font-semibold">S/ {{ totalIngresos }}</span>
    </div>

    <!-- Egresos -->
    <div class="flex justify-between items-center text-lg text-red-500">
      <div class="flex items-center gap-2">
        <DatabaseExport class="w-6 h-6" />
        <span class="font-medium">Salidas hoy:</span>
      </div>
      <span class="font-semibold">S/ {{ totalEgresos }}</span>
    </div>

    <!-- Saldo actual -->
    <div
      class="flex justify-between items-center text-2xl font-bold border-t pt-4"
    >
      <div class="flex items-center gap-2">
        <Cash class="w-6 h-6 text-green-600" />
        <span>Saldo actual:</span>
      </div>
      <span>S/ {{ saldoActual }}</span>
    </div>
  </div>
</template>

<script setup>
import { GraphUp, DatabaseExport, Cash } from "@iconoir/vue"; // Importar iconos de Iconoir
import { computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
const transactionStore = useTransactionStore();

const props = defineProps({
  initialDailyData: {
    type: Array,
    default: () => [],
  },
});

const totalIngresos = computed(() => {
  return transactionStore
    .getAllIncomeTransactionsInStore()
    .reduce((sum, record) => sum + record.total, 0)
    .toFixed(2);
});

const totalEgresos = computed(() => {
  return transactionStore
    .getAllExpenseTransactionsInStore()
    .reduce((sum, record) => sum + record.total, 0)
    .toFixed(2);
});

const saldoActual = computed(() => {
  return (totalIngresos.value - totalEgresos.value).toFixed(2);
});
</script>
