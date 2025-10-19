<template>
  <!-- Product Information Block - Mobile First -->
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative"
  >
    <!-- Header: Título y Botón de Edición -->
    <div class="flex items-center justify-between mb-3">
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          ></path>
        </svg>
        <span class="text-xs font-medium text-gray-600">Descripción</span>
      </div>
      <router-link
        :to="editProductRoute"
        class="w-8 h-8 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors shrink-0"
        title="Editar producto"
      >
        <Settings class="w-4 h-4 text-gray-400" />
      </router-link>
    </div>

    <!-- Nombre del Producto -->
    <h2 class="text-lg font-bold text-gray-900 mb-3">
      {{ description || "Sin descripción" }}
    </h2>

    <!-- Badges de Configuración -->
    <div class="flex flex-wrap gap-2 mb-4">
      <!-- Badge: Tipo de Producto -->
      <div
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

      <!-- Badge: Control de Stock -->
      <div
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

      <!-- Badge: Unidad de Medida -->
      <div
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
    </div>

    <!-- Grid de Información Financiera - Mobile First -->
    <div class="space-y-2">
      <!-- Precio de Venta -->
      <div class="bg-green-50 rounded-lg p-3 border border-green-100">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span class="text-xs font-medium text-green-700"
              >Precio de Venta</span
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
            <span class="text-xs font-medium text-orange-700">Costo</span>
          </div>
          <p v-if="cost" class="text-lg font-bold text-orange-800 tabular-nums">
            S/ {{ formatPrice(cost) }}
          </p>
          <p v-else class="text-sm font-medium text-gray-400">No registrado</p>
        </div>
      </div>

      <!-- Margen de Ganancia -->
      <div
        v-if="cost && price"
        class="bg-purple-50 rounded-lg p-3 border border-purple-100"
      >
        <div class="flex items-center justify-between">
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
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              ></path>
            </svg>
            <span class="text-xs font-medium text-purple-700">Margen</span>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-purple-800 tabular-nums">
              {{ calculateMarginPercentage }}%
            </p>
            <p class="text-xs text-purple-600">
              (S/ {{ calculateMarginAmount }})
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Settings } from "@iconoir/vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

// Props
const props = defineProps({
  description: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },
  cost: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: [Object, Date, String],
    default: null,
  },
  productId: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    default: "MERCH",
    validator: (value) => ["MERCH", "PRODUCT", "SERVICE"].includes(value),
  },
  trackStock: {
    type: Boolean,
    default: false,
  },
  unit: {
    type: String,
    default: "uni",
  },
});

const route = useRoute();

// Computed: Router link para edición
const editProductRoute = computed(() => {
  return {
    name: "InventoryEditProduct",
    params: {
      businessId: route.params.businessId,
      productId: props.productId,
    },
  };
});

// Computed: Badge del tipo de producto
const productTypeLabel = computed(() => {
  const labels = {
    MERCH: "Mercadería",
    PRODUCT: "Producto",
    SERVICE: "Servicio",
  };
  return labels[props.productType] || "Mercadería";
});

const productTypeBadgeClass = computed(() => {
  const classes = {
    MERCH: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    PRODUCT: "bg-purple-100 text-purple-700 border border-purple-200",
    SERVICE: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return classes[props.productType] || classes.MERCH;
});

const productTypeIcon = computed(() => {
  const icons = {
    MERCH: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", // Shopping bag
    PRODUCT:
      "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", // Flask
    SERVICE:
      "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", // Briefcase
  };
  return icons[props.productType] || icons.MERCH;
});

// Computed: TrackStock badge
const trackStockLabel = computed(() => {
  return props.trackStock ? "Control de Stock: Activo" : "Sin Control de Stock";
});

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

// Computed: Unit label
const unitLabel = computed(() => {
  const units = {
    uni: "Unidad (uni)",
    kg: "Kilogramo (kg)",
    g: "Gramo (g)",
    l: "Litro (l)",
    ml: "Mililitro (ml)",
    m: "Metro (m)",
    cm: "Centímetro (cm)",
    caja: "Caja",
    paquete: "Paquete",
  };
  return units[props.unit] || props.unit;
});

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

// Computed: Margin calculations
const calculateMarginAmount = computed(() => {
  if (!props.price || !props.cost) return "0.00";
  const margin = props.price - props.cost;
  return margin.toFixed(2);
});

const calculateMarginPercentage = computed(() => {
  if (!props.price || !props.cost) return "0.00";
  const margin = ((props.price - props.cost) / props.cost) * 100;
  return margin.toFixed(2);
});

// Methods
const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  return Number(price).toFixed(2);
};

const formatDate = (date) => {
  if (!date) return "Fecha no disponible";

  let dateObj;
  if (date.toDate && typeof date.toDate === "function") {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) return "Fecha inválida";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return dateObj.toLocaleDateString("es-ES", options);
};
</script>

<style scoped>
/* Números tabulares para mejor alineación */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Estabilidad de layout */
.shrink-0 {
  flex-shrink: 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  /* Mejor espaciado en móvil */
  .grid {
    gap: 0.75rem;
  }
}
</style>
