<template>
  <div
    class="w-full h-full bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-pointer"
  >
    <!-- Header compacto -->
    <div class="flex items-center gap-2 mb-2">
      <div
        class="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center"
      >
        <Cash class="w-4 h-4 text-gray-600" />
      </div>
      <span
        class="text-[10px] text-gray-500 uppercase tracking-wider font-medium"
      >
        {{ title }}
      </span>
    </div>

    <!-- Valor -->
    <p class="text-3xl font-bold text-gray-900 tabular-nums">
      {{ formattedTotal }}
    </p>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
import { sumTransactions } from "@/utils/mathUtils";
import { Cash } from "@iconoir/vue";

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    default: "Ventas totales",
  },
});

const total = computed(() => sumTransactions(props.transactions));

const formattedTotal = computed(() =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(total.value)
);
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
