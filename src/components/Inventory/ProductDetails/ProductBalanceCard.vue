<template>
  <!-- Product Balance Card - Mobile First -->
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4"
  >
    <!-- Header con Toggle -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg
          class="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span class="text-xs font-medium text-gray-600"
          >Balance de Movimientos</span
        >
      </div>

      <!-- Toggle de Período -->
      <button
        @click="togglePeriod"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-xs font-medium text-gray-700"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        <span>{{ currentPeriodLabel }}</span>
      </button>
    </div>

    <!-- Balance Principal -->
    <div
      class="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100"
    >
      <div class="flex items-center justify-between mb-3">
        <div>
          <p class="text-xs text-gray-600 mb-1">Balance de unidades</p>
          <p class="text-3xl font-bold tabular-nums" :class="balanceColorClass">
            {{ balanceSign }}{{ Math.abs(balanceData.balance.units) }}
            {{ unitLabel }}
          </p>
        </div>
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
          :class="balanceIconBgClass"
        >
          {{ balanceIcon }}
        </div>
      </div>

      <!-- Porcentaje de rotación -->
      <div class="flex items-center gap-2 text-xs text-gray-600">
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <span>
          Vendido: <strong>{{ balanceData.balance.percentage }}%</strong> del
          stock ingresado
        </span>
      </div>
    </div>

    <!-- Grid: Ventas vs Compras -->
    <div class="grid grid-cols-2 gap-3">
      <!-- Total Ventas -->
      <div class="bg-red-50 rounded-lg p-3 border border-red-100 space-y-1">
        <div class="flex items-center gap-1.5 mb-2">
          <svg
            class="w-4 h-4 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          <span class="text-[10px] font-medium text-red-700 uppercase"
            >Salidas</span
          >
        </div>
        <p class="text-xl font-bold text-red-800 tabular-nums">
          {{ balanceData.sales.units }} {{ unitLabel }}
        </p>
        <p class="text-xs text-red-600">
          {{ balanceData.sales.count }} venta(s)
        </p>
        <p
          v-if="balanceData.hasCostData && balanceData.sales.total > 0"
          class="text-xs font-semibold text-red-700 mt-1 pt-1 border-t border-red-200"
        >
          S/ {{ balanceData.sales.total.toFixed(2) }}
        </p>
      </div>

      <!-- Total Compras -->
      <div class="bg-green-50 rounded-lg p-3 border border-green-100 space-y-1">
        <div class="flex items-center gap-1.5 mb-2">
          <svg
            class="w-4 h-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          <span class="text-[10px] font-medium text-green-700 uppercase"
            >Entradas</span
          >
        </div>
        <p class="text-xl font-bold text-green-800 tabular-nums">
          {{ balanceData.purchases.units }} {{ unitLabel }}
        </p>
        <p class="text-xs text-green-600">
          {{ balanceData.purchases.count }} compra(s)
        </p>
        <p
          v-if="balanceData.hasCostData && balanceData.purchases.total > 0"
          class="text-xs font-semibold text-green-700 mt-1 pt-1 border-t border-green-200"
        >
          S/ {{ balanceData.purchases.total.toFixed(2) }}
        </p>
      </div>
    </div>

    <!-- Mensaje si no hay datos monetarios -->
    <div v-if="!balanceData.hasCostData" class="text-center py-2">
      <p class="text-xs text-gray-500 italic">
        💡 Los valores monetarios se calcularán cuando se registren costos y
        precios
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useProductMetricsStore } from "@/stores/Inventory/productMetricsStore";

// Props
const props = defineProps({
  stockLog: {
    type: Array,
    default: () => [],
  },
  unit: {
    type: String,
    default: "uni",
  },
});

const metricsStore = useProductMetricsStore();

// ==========================================
// STATE: Período seleccionado
// ==========================================
const showHistoricTotal = ref(false);

// ==========================================
// COMPUTED: Balance de unidades
// ==========================================
const balanceData = computed(() => {
  const days = showHistoricTotal.value ? null : 30;
  return metricsStore.getUnitBalance(props.stockLog, days);
});

const currentPeriodLabel = computed(() => {
  return showHistoricTotal.value ? "Total Histórico" : "Últimos 30 días";
});

// ==========================================
// COMPUTED: Colores y iconos del balance
// ==========================================
const balanceSign = computed(() => {
  return balanceData.value.balance.units >= 0 ? "+" : "";
});

const balanceColorClass = computed(() => {
  const balance = balanceData.value.balance.units;
  if (balance > 0) return "text-green-700";
  if (balance < 0) return "text-red-700";
  return "text-gray-700";
});

const balanceIcon = computed(() => {
  const balance = balanceData.value.balance.units;
  if (balance > 0) return "📦";
  if (balance < 0) return "📉";
  return "⚖️";
});

const balanceIconBgClass = computed(() => {
  const balance = balanceData.value.balance.units;
  if (balance > 0) return "bg-green-100";
  if (balance < 0) return "bg-red-100";
  return "bg-gray-100";
});

// ==========================================
// COMPUTED: Unit label
// ==========================================
const unitLabel = computed(() => {
  const units = {
    uni: "uni",
    kg: "kg",
    g: "g",
    l: "l",
    ml: "ml",
    m: "m",
    cm: "cm",
    caja: "caja",
    paquete: "paq",
  };
  return units[props.unit] || props.unit;
});

// ==========================================
// METHODS: Toggle período
// ==========================================
const togglePeriod = () => {
  showHistoricTotal.value = !showHistoricTotal.value;
};
</script>

<style scoped>
/* Números tabulares para mejor alineación */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Transiciones suaves */
.transition-colors {
  transition-property: background-color, border-color, color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid-cols-2 {
    gap: 0.75rem;
  }
}
</style>
