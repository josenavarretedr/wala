<template>
  <div
    class="w-full h-full bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-pointer flex flex-col"
  >
    <!-- Header compacto -->
    <div class="flex items-center gap-2 mb-2">
      <div
        class="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center"
      >
        <Page class="w-4 h-4 text-gray-600" />
      </div>
      <span
        class="text-[10px] text-gray-500 uppercase tracking-wider font-medium"
      >
        {{ title }}
      </span>
    </div>

    <!-- Valor -->
    <div class="flex-1 flex flex-col items-end justify-center">
      <div v-if="isLoading" class="text-blue-500">
        <SpinnerIcon size="lg" />
      </div>
      <template v-else>
        <p class="text-3xl font-bold tabular-nums text-blue-500">
          {{ transactions.length }}
        </p>
        <p class="text-xs text-gray-500 mt-1">{{ label }}</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, ref, watch } from "vue";
import { Page } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    default: "Tickets",
  },
  singularLabel: {
    type: String,
    default: "venta",
  },
  pluralLabel: {
    type: String,
    default: "ventas",
  },
});

const isLoading = ref(true);

const label = computed(() =>
  props.transactions?.length === 1 ? props.singularLabel : props.pluralLabel
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
