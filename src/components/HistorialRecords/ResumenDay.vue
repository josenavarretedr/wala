<template>
  <div class="w-full">
    <!-- Botón tipo acordeón -->
    <div
      @click="showResume = !showResume"
      class="flex items-center justify-center gap-2 text-blue-700 text-xl font-medium cursor-pointer mb-4 transition-all"
    >
      <component :is="showResume ? EyeClosed : Eye" class="w-6 h-6" />
      <span class="underline">
        {{ showResume ? "Ocultar resumen" : "Mostrar resumen" }}
      </span>
    </div>

    <!-- Acordeón del resumen -->
    <Transition name="slide-fade">
      <div
        v-if="showResume"
        class="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6 text-gray-800"
      >
        <h2 class="text-2xl font-bold text-center mb-2">Resumen del día</h2>

        <!-- Saldo inicial -->
        <div class="flex justify-between items-center text-lg">
          <div class="flex items-center gap-2">
            <Cash class="w-6 h-6 text-gray-600" />
            <span class="font-medium">Saldo inicial:</span>
          </div>
          <span class="font-semibold"> S/ {{ saldoInicial.toFixed(2) }} </span>
        </div>

        <!-- Ingresos -->
        <div class="flex justify-between items-center text-lg text-blue-600">
          <div class="flex items-center gap-2">
            <GraphUp class="w-6 h-6" />
            <span class="font-medium">Ventas hoy:</span>
          </div>
          <span class="font-semibold"> S/ {{ totalIngresos.toFixed(2) }} </span>
        </div>

        <!-- Egresos -->
        <div class="flex justify-between items-center text-lg text-red-500">
          <div class="flex items-center gap-2">
            <DatabaseExport class="w-6 h-6" />
            <span class="font-medium">Salidas hoy:</span>
          </div>
          <span class="font-semibold"> S/ {{ totalEgresos.toFixed(2) }} </span>
        </div>

        <!-- Saldo actual -->
        <div
          class="flex justify-between items-center text-2xl font-bold border-t pt-4"
        >
          <div class="flex items-center gap-2">
            <Cash class="w-6 h-6 text-green-600" />
            <span>Saldo actual:</span>
          </div>
          <span>S/ {{ saldoActual.toFixed(2) }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { GraphUp, DatabaseExport, Cash, Eye, EyeClosed } from "@iconoir/vue";
import { ref, computed } from "vue";

const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
});

const showResume = ref(false);

const opening = computed(() =>
  props.transactions.find((tx) => tx.type === "opening")
);

const saldoInicial = computed(() => {
  if (!opening.value) return 0;
  return (opening.value.totalCash || 0) + (opening.value.totalBank || 0);
});

const totalIngresos = computed(() => {
  return props.transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + (tx.total || 0), 0);
});

const totalEgresos = computed(() => {
  return props.transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + (tx.total || 0), 0);
});

const saldoActual = computed(() => {
  return saldoInicial.value + totalIngresos.value - totalEgresos.value;
});
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
