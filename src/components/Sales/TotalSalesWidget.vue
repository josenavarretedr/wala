<template>
  <div
    class="w-full h-full bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-pointer flex flex-col"
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
    <div class="flex-1 flex items-center justify-end">
      <div v-if="isLoading" class="text-blue-500">
        <SpinnerIcon size="lg" />
      </div>
      <p v-else class="text-3xl font-bold text-blue-500 tabular-nums">
        {{ formattedTotal }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, ref, watch } from "vue";
import { sumTransactions } from "@/utils/mathUtils";
import { Cash } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

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

const isLoading = ref(true);

const total = computed(() => sumTransactions(props.transactions));

const formattedTotal = computed(() =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(total.value)
);

// Simular carga cuando cambien las transacciones
watch(
  () => props.transactions,
  () => {
    isLoading.value = true;
    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  },
  { immediate: true }
);
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
