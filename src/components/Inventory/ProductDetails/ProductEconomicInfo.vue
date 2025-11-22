<template>
  <!-- Product Economic Information - Mobile First -->
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3"
  >
    <!-- Header del bloque -->
    <div class="flex items-center gap-2 mb-1">
      <svg
        class="w-5 h-5 text-purple-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      <span class="text-xs font-medium text-gray-600"
        >Información Económica</span
      >
    </div>

    <!-- Grid de Información Financiera - Mobile First -->
    <div class="space-y-2">
      <!-- Precio de Venta (NO mostrar para RAW_MATERIAL) -->
      <div
        v-if="productType !== 'RAW_MATERIAL'"
        class="bg-green-50 rounded-lg p-3 border border-green-100"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
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
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              ></path>
            </svg>
            <span class="text-xs font-medium text-green-700"
              >Precio actual de venta</span
            >
          </div>
          <p class="text-lg font-bold text-green-800 tabular-nums">
            S/ {{ formatPrice(price) }}
          </p>
        </div>
      </div>

      <!-- Costo -->
      <div class="bg-orange-50 rounded-lg p-3 border border-orange-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg
              class="w-4 h-4 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
            <span class="text-xs font-medium text-orange-700">
              {{
                productType === "RAW_MATERIAL"
                  ? "Costo de compra"
                  : `Costo por ${unitLabelShort}`
              }}
            </span>
          </div>
          <p v-if="cost" class="text-lg font-bold text-orange-800 tabular-nums">
            S/ {{ formatPrice(cost) }}
          </p>
          <p v-else class="text-sm font-medium text-gray-400">No registrado</p>
        </div>
      </div>

      <!-- Margen de Ganancia + Chip de Rentabilidad (NO mostrar para RAW_MATERIAL) -->
      <div
        v-if="hasCostData && productType !== 'RAW_MATERIAL'"
        class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100"
      >
        <!-- Margen -->
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <svg
              class="w-4 h-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
            <span class="text-xs font-medium text-purple-700">{{
              profitabilityStatus.label
            }}</span>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-purple-800 tabular-nums">
              {{ marginPercentage }}%
            </p>
            <p class="text-xs text-purple-600">
              (S/ {{ marginAmount }} por unidad)
            </p>
          </div>
        </div>

        <!-- Chip de Rentabilidad -->
        <!-- <div
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border"
          :class="profitabilityStatus.bgClass"
        >
          <span>{{ profitabilityStatus.icon }}</span>
          <span>{{ profitabilityStatus.label }}</span>
        </div> -->
      </div>

      <!-- Mensaje cuando no hay costo -->
      <!-- <div
        v-else
        class="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center"
      >
        <svg
          class="w-8 h-8 text-gray-400 mx-auto mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-sm text-gray-600 font-medium mb-1">
          Rentabilidad no disponible
        </p>
        <p class="text-xs text-gray-500">
          Registra el costo del producto para ver el análisis de rentabilidad
        </p>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useProductMetricsStore } from "@/stores/Inventory/productMetricsStore";

// Props
const props = defineProps({
  price: {
    type: Number,
    default: 0,
  },
  cost: {
    type: Number,
    default: null,
  },
  unit: {
    type: String,
    default: "uni",
  },
  productType: {
    type: String,
    default: "MERCH",
    validator: (value) =>
      ["MERCH", "PRODUCT", "RAW_MATERIAL", "SERVICE"].includes(value),
  },
});

const metricsStore = useProductMetricsStore();

// ==========================================
// COMPUTED: Validación de datos
// ==========================================
const hasCostData = computed(() => {
  return props.cost !== null && props.cost !== undefined && props.cost > 0;
});

// ==========================================
// COMPUTED: Cálculos de margen
// ==========================================
const marginAmount = computed(() => {
  if (!hasCostData.value || !props.price) return "0.00";
  const margin = props.price - props.cost;
  return margin.toFixed(2);
});

const marginPercentage = computed(() => {
  if (!hasCostData.value || !props.price) return "0.00";
  const margin = ((props.price - props.cost) / props.cost) * 100;
  return margin.toFixed(2);
});

// ==========================================
// COMPUTED: Estado de rentabilidad (usando store)
// ==========================================
const profitabilityStatus = computed(() => {
  if (!hasCostData.value) {
    return metricsStore.getProfitabilityStatus(null);
  }
  return metricsStore.getProfitabilityStatus(
    parseFloat(marginPercentage.value)
  );
});

// ==========================================
// METHODS: Formateo
// ==========================================
const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  return Number(price).toFixed(2);
};

const unitLabelShort = computed(() => {
  const units = {
    uni: "Unidad",
    kg: "Kg",
    g: "Gramos",
    l: "Litros",
    ml: "Mililitro",
    m: "Metros",
    cm: "Centímetro",
    caja: "Caja",
    paquete: "Paquete",
  };
  return units[props.unit] || props.unit;
});
</script>

<style scoped>
/* Números tabulares para mejor alineación */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .space-y-2 > :not([hidden]) ~ :not([hidden]) {
    margin-top: 0.5rem;
  }
}
</style>
