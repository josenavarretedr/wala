<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <h3 class="text-lg font-bold text-gray-900">Ficha del costo real</h3>

    <div class="mt-4 space-y-2 text-sm">
      <div
        class="flex items-center justify-between border-b border-gray-100 pb-2"
      >
        <span class="text-gray-600">Materiales directos</span>
        <span class="font-semibold text-gray-900">{{
          toCurrency(totals.materiales)
        }}</span>
      </div>
      <div
        class="flex items-center justify-between border-b border-gray-100 pb-2"
      >
        <span class="text-gray-600">Trabajo / mano de obra</span>
        <span class="font-semibold text-gray-900">{{
          toCurrency(totals.trabajo)
        }}</span>
      </div>
      <div
        class="flex items-center justify-between border-b border-gray-100 pb-2"
      >
        <span class="text-gray-600">Costos invisibles</span>
        <span class="font-semibold text-gray-900">{{
          toCurrency(totals.invisibles)
        }}</span>
      </div>
      <div
        class="flex items-center justify-between border-b border-gray-100 pb-2"
      >
        <span class="text-gray-600">Gastos fijos por unidad</span>
        <span class="font-semibold text-gray-900">{{
          toCurrency(totals.gastoFijoUnidad)
        }}</span>
      </div>
      <div
        class="flex items-center justify-between border-b border-gray-100 pb-2 text-base"
      >
        <span class="font-semibold text-gray-800">Costo total real</span>
        <span class="font-bold text-gray-900">{{
          toCurrency(totals.costoTotal)
        }}</span>
      </div>
      <div
        class="flex items-center justify-between border-b border-gray-100 pb-2"
      >
        <span class="text-gray-600">Precio actual de venta</span>
        <span class="font-semibold text-gray-900">{{
          toCurrency(totals.precioActual)
        }}</span>
      </div>
      <div class="flex items-center justify-between pb-2 text-base">
        <span class="font-semibold text-gray-800">Diferencia</span>
        <span :class="differenceClass" class="font-bold">{{
          toCurrency(totals.diferencia)
        }}</span>
      </div>
    </div>

    <div class="mt-4 rounded-xl p-3 text-sm" :class="stateClass">
      <p class="font-semibold">{{ stateText }}</p>
      <p class="mt-1">
        Precio minimo sugerido con tu margen:
        {{ toCurrency(totals.precioMinimo) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  totals: {
    type: Object,
    required: true,
  },
});

const toCurrency = (value) => {
  const amount = Number.isFinite(value) ? value : 0;
  return `S/ ${amount.toFixed(2)}`;
};

const differenceClass = computed(() => {
  if (props.totals.diferencia > 0) return "text-green-700";
  if (props.totals.diferencia < 0) return "text-red-700";
  return "text-gray-700";
});

const stateText = computed(() => {
  if (props.totals.diferencia > 0) return "Resultado: estas dejando ganancia.";
  if (props.totals.diferencia < 0) return "Resultado: estas dejando perdida.";
  return "Resultado: estas en empate.";
});

const stateClass = computed(() => {
  if (props.totals.diferencia > 0)
    return "bg-green-50 border border-green-200 text-green-800";
  if (props.totals.diferencia < 0)
    return "bg-red-50 border border-red-200 text-red-800";
  return "bg-gray-50 border border-gray-200 text-gray-800";
});
</script>
