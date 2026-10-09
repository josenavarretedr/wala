<template>
  <!-- Product Metrics Card - Mobile First -->
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3"
  >
    <!-- Header del bloque -->
    <div class="flex items-center gap-2 mb-2">
      <svg
        class="w-5 h-5 text-indigo-600"
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
        >Análisis de Inventario</span
      >
    </div>

    <!-- Grid de Métricas -->
    <div class="space-y-3">
      <!-- Rotación de Inventario -->
      <div
        class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 border"
        :class="rotationBorderClass"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <svg
              class="w-4 h-4"
              :class="rotationIconColor"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span class="text-xs font-medium text-gray-700"
              >Rotación de Inventario</span
            >
          </div>
        </div>

        <!-- Días de rotación o mensaje -->
        <div v-if="rotationInfo.hasEnoughData">
          <p class="text-2xl font-bold text-indigo-800 tabular-nums mb-1">
            {{ rotationInfo.days }} día(s)
          </p>
          <p class="text-xs text-indigo-600 mb-2">
            {{ rotationInfo.message }}
          </p>
          <!-- Badge de estado -->
          <div
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
            :class="rotationStatusBadgeClass"
          >
            <span>{{ rotationStatusIcon }}</span>
            <span>{{ rotationInfo.status }}</span>
          </div>
        </div>
        <div v-else class="text-center py-2">
          <svg
            class="w-8 h-8 text-gray-300 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p class="text-sm font-medium text-gray-600 mb-1">
            {{ rotationInfo.status }}
          </p>
          <p class="text-xs text-gray-500">
            {{ rotationInfo.message }}
          </p>
        </div>
      </div>

      <!-- Valor Total en Stock -->
      <div
        class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 flex-1">
            <svg
              class="w-4 h-4 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <div class="flex-1">
              <p class="text-xs font-medium text-emerald-700 mb-1">
                Valor en Stock
              </p>
              <p v-if="stockValue.hasData" class="text-xs text-emerald-600">
                {{ stockValue.message }}
              </p>
            </div>
          </div>
          <div v-if="stockValue.hasData" class="text-right">
            <p class="text-xl font-bold text-emerald-800 tabular-nums">
              S/ {{ stockValue.value.toFixed(2) }}
            </p>
          </div>
          <div v-else>
            <p class="text-sm font-medium text-gray-400">
              {{ stockValue.message }}
            </p>
          </div>
        </div>
      </div>

      <!-- Indicadores adicionales -->
      <div class="grid grid-cols-2 gap-2">
        <!-- Total de movimientos -->
        <div class="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
          <div class="flex items-center gap-1.5 mb-1">
            <svg
              class="w-3.5 h-3.5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            <span class="text-[10px] font-medium text-blue-700 uppercase"
              >Movimientos</span
            >
          </div>
          <p class="text-lg font-bold text-blue-800 tabular-nums">
            {{ totalMovements }}
          </p>
        </div>

        <!-- Días desde última venta -->
        <div class="bg-purple-50 rounded-lg p-2.5 border border-purple-100">
          <div class="flex items-center gap-1.5 mb-1">
            <svg
              class="w-3.5 h-3.5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-[10px] font-medium text-purple-700 uppercase"
              >Última venta</span
            >
          </div>
          <p class="text-lg font-bold text-purple-800 tabular-nums">
            {{ daysSinceLastSale }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useProductMetricsStore } from "@/stores/Inventory/productMetricsStore";

// Props
const props = defineProps({
  stock: {
    type: Number,
    default: 0,
  },
  cost: {
    type: Number,
    default: null,
  },
  stockLog: {
    type: Array,
    default: () => [],
  },
});

const metricsStore = useProductMetricsStore();

// ==========================================
// COMPUTED: Métricas del producto
// ==========================================
const rotationInfo = computed(() => {
  return metricsStore.getRotationDays(props.stockLog);
});

const stockValue = computed(() => {
  return metricsStore.getStockValue(props.stock, props.cost);
});

const lastUpdate = computed(() => {
  return metricsStore.getLastUpdate(props.stockLog);
});

// ==========================================
// COMPUTED: Indicadores adicionales
// ==========================================
const totalMovements = computed(() => {
  return props.stockLog?.length || 0;
});

const daysSinceLastSale = computed(() => {
  if (!props.stockLog || props.stockLog.length === 0) return "N/A";

  const lastSale = props.stockLog.find((log) => log.type === "sell");
  if (!lastSale) return "N/A";

  const saleDate = getDateFromLog(lastSale);
  const now = new Date();
  const diffInMs = now - saleDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Hoy";
  if (diffInDays === 1) return "Ayer";
  return `${diffInDays}d`;
});

// ==========================================
// COMPUTED: Estilos de rotación
// ==========================================
const rotationBorderClass = computed(() => {
  if (!rotationInfo.value.hasEnoughData) return "border-gray-200";

  const days = rotationInfo.value.days;
  if (days <= 3) return "border-green-200";
  if (days <= 7) return "border-blue-200";
  if (days <= 15) return "border-yellow-200";
  return "border-red-200";
});

const rotationIconColor = computed(() => {
  if (!rotationInfo.value.hasEnoughData) return "text-gray-400";

  const days = rotationInfo.value.days;
  if (days <= 3) return "text-green-600";
  if (days <= 7) return "text-blue-600";
  if (days <= 15) return "text-yellow-600";
  return "text-red-600";
});

const rotationStatusBadgeClass = computed(() => {
  if (!rotationInfo.value.hasEnoughData)
    return "bg-gray-100 text-gray-700 border border-gray-200";

  const days = rotationInfo.value.days;
  if (days <= 3) return "bg-green-100 text-green-800 border border-green-200";
  if (days <= 7) return "bg-blue-100 text-blue-800 border border-blue-200";
  if (days <= 15)
    return "bg-yellow-100 text-yellow-800 border border-yellow-200";
  return "bg-red-100 text-red-800 border border-red-200";
});

const rotationStatusIcon = computed(() => {
  if (!rotationInfo.value.hasEnoughData) return "❔";

  const days = rotationInfo.value.days;
  if (days <= 3) return "🚀";
  if (days <= 7) return "✅";
  if (days <= 15) return "⚠️";
  return "🐌";
});

// ==========================================
// HELPERS
// ==========================================
const getDateFromLog = (log) => {
  if (!log.createdAt) return new Date(0);

  if (log.createdAt.seconds) {
    return new Date(log.createdAt.seconds * 1000);
  } else if (log.createdAt instanceof Date) {
    return log.createdAt;
  } else {
    return new Date(log.createdAt);
  }
};
</script>

<style scoped>
/* Números tabulares para mejor alineación */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid-cols-2 {
    gap: 0.5rem;
  }
}
</style>
