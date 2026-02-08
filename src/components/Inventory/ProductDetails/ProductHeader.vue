<template>
  <!-- Product Header - Encabezado Mejorado Mobile First -->
  <div
    class="w-full bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-xl shadow-sm border border-gray-100 p-4 relative overflow-hidden"
  >
    <!-- Patrón decorativo de fondo -->
    <div
      class="absolute inset-0 opacity-[0.03] pointer-events-none"
      style="
        background-image: radial-gradient(
          circle at 1px 1px,
          gray 1px,
          transparent 0
        );
        background-size: 20px 20px;
      "
    ></div>

    <!-- Contenido principal -->
    <div class="relative z-10">
      <!-- Botones de edición flotantes (esquina superior derecha) -->
      <div class="absolute top-0 right-0 flex gap-2">
        <router-link
          :to="editGeneralInfoRoute"
          class="p-2 bg-white hover:bg-blue-50 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:scale-105 group"
          title="Editar información general"
        >
          <svg
            class="w-4 h-4 text-gray-600 group-hover:text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            ></path>
          </svg>
        </router-link>
      </div>

      <!-- Nombre del Producto -->
      <div class="pr-24 mb-3">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {{ description || "Sin descripción" }}
        </h1>
      </div>

      <!-- Subtítulo: Stock actual y Rotación (PRIORITARIO) -->
      <div class="flex flex-wrap items-center gap-2 mb-3 text-sm text-gray-600">
        <!-- Stock actual -->
        <div :key="`stock-${stock}`" class="inline-flex items-center gap-1.5">
          <svg
            class="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span class="font-semibold text-gray-900"
            >{{ stock }} {{ unitLabelShort }}</span
          >
          <span class="text-gray-500">en stock</span>
        </div>

        <!-- Separador -->
        <span class="text-gray-300">•</span>

        <!-- Rotación -->
        <div
          v-if="rotationInfo.hasEnoughData"
          class="inline-flex items-center gap-1.5"
        >
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span class="font-medium text-gray-700"
            >{{ rotationInfo.days }} día(s)</span
          >
          <span class="text-gray-500">de rotación</span>
        </div>
        <div v-else class="inline-flex items-center gap-1.5 text-gray-400">
          <svg
            class="w-4 h-4"
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
          <span class="text-xs">{{ rotationInfo.message }}</span>
        </div>
      </div>

      <!-- Badges de Configuración -->
      <div class="flex flex-wrap gap-2 mb-3">
        <!-- Badge: Tipo de Producto -->
        <div
          :key="`badge-${productType}`"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
          :class="productTypeBadgeClass"
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
              :d="productTypeIcon"
            ></path>
          </svg>
          <span>{{ productTypeLabel }}</span>
        </div>

        <!-- Badge: Unidad de Medida -->
        <div
          :key="`unit-${unit}`"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
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
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            ></path>
          </svg>
          <span>{{ unitLabelShort }}</span>
        </div>

        <!-- Badge: Control de Stock -->
        <div
          v-if="props.trackStock"
          :key="`track-${trackStock}`"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
          :class="trackStockBadgeClass"
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
              :d="trackStockIcon"
            ></path>
          </svg>
          <span>{{ trackStockLabelShort }}</span>
        </div>

        <!-- 🤖 Badge: Clasificación IA -->
        <div
          v-if="classification && classification.category"
          :key="`classification-${classification.category}`"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
          :class="classificationBadgeClass"
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            ></path>
          </svg>
          <span>{{ classificationLabel }}</span>
          <!-- <span
            v-if="classification.confidence"
            class="ml-0.5 opacity-75"
            :title="`Confianza: ${(classification.confidence * 100).toFixed(0)}%`"
          >
            {{ confidenceEmoji }}
          </span> -->
        </div>
      </div>

      <!-- Última actualización -->
      <div
        v-if="lastUpdate.date"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 text-xs text-gray-600"
      >
        <svg
          class="w-3.5 h-3.5 text-gray-500"
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
        <span>
          <span class="font-medium">{{ lastUpdateTypeLabel }}:</span>
          {{ lastUpdate.relativeTime }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { EditPencil } from "@iconoir/vue";
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useProductMetricsStore } from "@/stores/Inventory/productMetricsStore";

// Props
const props = defineProps({
  description: {
    type: String,
    default: "",
  },
  stock: {
    type: Number,
    default: 0,
  },
  productId: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    default: "MERCH",
    validator: (value) =>
      ["MERCH", "PRODUCT", "RAW_MATERIAL", "SERVICE"].includes(value),
  },
  trackStock: {
    type: Boolean,
    default: false,
  },
  unit: {
    type: String,
    default: "uni",
  },
  stockLog: {
    type: Array,
    default: () => [],
  },
  classification: {
    type: Object,
    default: null,
  },
});

// Debug: Observar cambios en props
watch(
  () => [
    props.stock,
    props.stockLog?.length,
    props.trackStock,
    props.productType,
  ],
  ([newStock, newLogLength, newTrackStock, newType]) => {
    console.log("🔄 [ProductHeader] Props actualizados:", {
      stock: newStock,
      stockLogLength: newLogLength,
      trackStock: newTrackStock,
      productType: newType,
    });
  },
  { deep: true },
);

// Debug específico para productType
watch(
  () => props.productType,
  (newType, oldType) => {
    console.log("🎨 [ProductHeader] ProductType cambió:", {
      anterior: oldType,
      nuevo: newType,
      badgeClass: productTypeBadgeClass.value,
    });
  },
);

const route = useRoute();
const metricsStore = useProductMetricsStore();

// ==========================================
// COMPUTED: Router links para edición
// ==========================================
const editGeneralInfoRoute = computed(() => {
  return {
    name: "InventoryEditProductGeneralInfo",
    params: {
      businessId: route.params.businessId,
      productId: props.productId,
    },
  };
});

const editEconomicInfoRoute = computed(() => {
  return {
    name: "InventoryEditProductEconomicInfo",
    params: {
      businessId: route.params.businessId,
      productId: props.productId,
    },
  };
});

// ==========================================
// COMPUTED: Métricas del producto
// ==========================================
const lastUpdate = computed(() => {
  return metricsStore.getLastUpdate(props.stockLog);
});

const rotationInfo = computed(() => {
  return metricsStore.getRotationDays(props.stockLog);
});

const lastUpdateTypeLabel = computed(() => {
  const types = {
    sell: "Última venta",
    buy: "Última compra",
    adjust: "Último ajuste",
    count: "Último conteo",
    return: "Última devolución",
    none: "Sin movimientos",
  };
  return types[lastUpdate.value.type] || "Última actualización";
});

// ==========================================
// COMPUTED: Badges del tipo de producto
// ==========================================
const productTypeLabel = computed(() => {
  const labels = {
    MERCH: "Mercadería",
    PRODUCT: "Producto",
    RAW_MATERIAL: "Insumo",
    SERVICE: "Servicio",
  };
  return labels[props.productType] || "Mercadería";
});

const productTypeBadgeClass = computed(() => {
  const classes = {
    MERCH: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    PRODUCT: "bg-purple-100 text-purple-700 border border-purple-200",
    RAW_MATERIAL: "bg-amber-100 text-amber-700 border border-amber-200",
    SERVICE: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return classes[props.productType] || classes.MERCH;
});

const productTypeIcon = computed(() => {
  const icons = {
    MERCH: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", // Shopping bag
    PRODUCT:
      "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", // Flask
    RAW_MATERIAL:
      "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", // Cube (material/ingredient)
    SERVICE:
      "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", // Briefcase
  };
  return icons[props.productType] || icons.MERCH;
});

// ==========================================
// COMPUTED: TrackStock badge
// ==========================================
const trackStockLabelShort = computed(() => {
  return props.trackStock ? "Stock Activo" : "Sin Stock";
});

const trackStockBadgeClass = computed(() => {
  return props.trackStock
    ? "bg-teal-50 text-teal-700 border border-teal-200"
    : "bg-gray-50 text-gray-600 border border-gray-200";
});

const trackStockIcon = computed(() => {
  return props.trackStock
    ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" // Clipboard check
    : "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"; // Clipboard list
});

// ==========================================
// COMPUTED: Unit label
// ==========================================
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

// ==========================================
// COMPUTED: Classification badge (🤖 IA)
// ==========================================
const classificationLabel = computed(() => {
  if (!props.classification) return "";

  const parts = [];
  if (props.classification.category) parts.push(props.classification.category);
  if (props.classification.subcategory)
    parts.push(props.classification.subcategory);

  return parts.join(" › ");
});

const classificationBadgeClass = computed(() => {
  if (!props.classification) return "";

  const source = props.classification.source;
  const confidence = props.classification.confidence || 0;

  // Color según fuente
  if (source === "rules" || source === "local_match") {
    // Match local - verde
    return "bg-green-50 text-green-700 border border-green-200";
  } else if (source === "llm") {
    // IA - color según confianza
    if (confidence >= 0.9) {
      return "bg-blue-50 text-blue-700 border border-blue-200";
    } else if (confidence >= 0.7) {
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    } else {
      return "bg-orange-50 text-orange-700 border border-orange-200";
    }
  } else if (source === "manual") {
    return "bg-purple-50 text-purple-700 border border-purple-200";
  }

  return "bg-gray-50 text-gray-600 border border-gray-200";
});

const confidenceEmoji = computed(() => {
  if (!props.classification || !props.classification.confidence) return "";

  const confidence = props.classification.confidence;
  const source = props.classification.source;

  if (source === "rules" || source === "local_match") {
    return "🎯"; // Match exacto
  } else if (confidence >= 0.9) {
    return "✨"; // Alta confianza
  } else if (confidence >= 0.7) {
    return "💡"; // Media confianza
  } else {
    return "⚠️"; // Baja confianza
  }
});
</script>

<style scoped>
/* Estabilidad de layout */
.shrink-0 {
  flex-shrink: 0;
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  h1 {
    font-size: 1.5rem; /* 24px */
  }
}
</style>
