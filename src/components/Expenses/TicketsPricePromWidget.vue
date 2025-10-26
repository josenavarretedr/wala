<template>
  <div
    class="w-full h-full bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-pointer flex flex-col"
  >
    <!-- Header compacto -->
    <div class="flex items-center gap-2 mb-2">
      <div
        class="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center"
      >
        <StatsReport class="w-4 h-4 text-gray-600" />
      </div>
      <span
        class="text-[10px] text-gray-500 uppercase tracking-wider font-medium"
      >
        Promedio
      </span>
    </div>

    <!-- Valor -->
    <div class="flex-1 flex flex-col justify-end">
      <div v-if="isLoading" class="text-red-500">
        <SpinnerIcon size="lg" />
      </div>
      <template v-else>
        <p class="text-3xl font-bold tabular-nums text-red-500">
          {{ formattedAverage }}
        </p>
        <p class="text-xs text-gray-500 mt-1">por ticket</p>

        <!-- Comparativo (lógica invertida: menos gastos = verde) -->
        <div v-if="comparison" class="mt-1 flex items-center gap-1">
          <NavArrowUp
            v-if="comparison.percentage < 0"
            class="w-3 h-3 text-green-500"
          />
          <NavArrowDown
            v-else-if="comparison.percentage > 0"
            class="w-3 h-3 text-red-500"
          />
          <span
            :class="[
              'text-xs font-medium',
              comparison.percentage < 0
                ? 'text-green-600'
                : comparison.percentage > 0
                ? 'text-red-600'
                : 'text-gray-500',
            ]"
          >
            {{ comparison.text }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, ref, watch } from "vue";
import { sumTransactions } from "@/utils/mathUtils";
import { StatsReport, NavArrowUp, NavArrowDown } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
  },
  previousTransactions: {
    type: Array,
    default: () => [],
  },
  periodLabel: {
    type: String,
    default: "período anterior",
  },
});

const isLoading = ref(true);

const totalExpenses = computed(() => sumTransactions(props.transactions));

const averageTicket = computed(() => {
  const count = props.transactions.length;
  return count === 0 ? 0 : totalExpenses.value / count;
});

const formattedAverage = computed(() =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(averageTicket.value)
);

// Calcular comparación con período anterior (lógica invertida para gastos)
const comparison = computed(() => {
  if (!props.previousTransactions || props.previousTransactions.length === 0) {
    return { percentage: null, text: "Sin datos previos" };
  }

  const currentValue = averageTicket.value;
  const previousTotal = sumTransactions(props.previousTransactions);
  const previousCount = props.previousTransactions.length;
  const previousValue = previousCount === 0 ? 0 : previousTotal / previousCount;

  if (previousValue === 0) {
    if (currentValue === 0) {
      return { percentage: 0, text: "Sin cambios" };
    }
    return { percentage: 100, text: "Nuevo período" };
  }

  const percentage = ((currentValue - previousValue) / previousValue) * 100;
  const absPercentage = Math.abs(percentage).toFixed(1);

  // Para gastos: menos es mejor
  const direction = percentage > 0 ? "más que" : "menos que";

  return {
    percentage,
    text: `${absPercentage}% ${direction} ${props.periodLabel}`,
  };
});

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
