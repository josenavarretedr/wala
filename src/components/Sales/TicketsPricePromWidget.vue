<template>
  <PremiumLockWrapper
    :is-premium="isPremium"
    :is-locked="isLocked"
    @locked-click="$emit('locked-click')"
  >
    <template #content="{ contentClasses }">
      <div
        class="w-full h-full bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-pointer flex flex-col"
      >
        <!-- Header compacto (sin blur) -->
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

        <!-- Valor (con blur cuando locked) -->
        <div class="flex-1 flex flex-col justify-end" :class="contentClasses">
          <div v-if="isLoading" class="text-blue-500">
            <SpinnerIcon size="lg" />
          </div>
          <template v-else>
            <p class="text-3xl font-bold tabular-nums text-blue-500">
              {{ formattedAverage }}
            </p>
            <p class="text-xs text-gray-500 mt-1">por ticket</p>

            <!-- Comparativo -->
            <div v-if="comparison" class="mt-1 flex items-center gap-1">
              <NavArrowUp
                v-if="comparison.percentage > 0"
                class="w-3 h-3 text-green-500"
              />
              <NavArrowDown
                v-else-if="comparison.percentage < 0"
                class="w-3 h-3 text-red-500"
              />
              <span
                :class="[
                  'text-xs font-medium',
                  comparison.percentage > 0
                    ? 'text-green-600'
                    : comparison.percentage < 0
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
  </PremiumLockWrapper>
</template>

<script setup>
import { defineProps, computed, ref, watch, defineEmits } from "vue";
import { sumTransactions } from "@/utils/mathUtils";
import { StatsReport, NavArrowUp, NavArrowDown } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import PremiumLockWrapper from "@/components/PremiumLockWrapper.vue";

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
  isPremium: {
    type: Boolean,
    default: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["locked-click"]);

const isLoading = ref(true);

const totalSales = computed(() => sumTransactions(props.transactions));

const averageTicket = computed(() => {
  const count = props.transactions.length;
  return count === 0 ? 0 : totalSales.value / count;
});

const formattedAverage = computed(() =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(averageTicket.value)
);

// Calcular comparación con período anterior
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
