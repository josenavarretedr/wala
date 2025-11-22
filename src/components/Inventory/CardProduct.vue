<template>
  <div class="product-card" @click="handleClick">
    <div
      class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative hover:border-blue-300 hover:shadow-md transition-all duration-200"
    >
      <!-- Header: Descripción, Precio y flecha -->
      <div class="flex items-start justify-between mb-3 gap-3">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <svg
            class="w-5 h-5 text-blue-600 flex-shrink-0"
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
          <h3 class="text-lg font-bold text-gray-900 line-clamp-2">
            {{ product.description }}
          </h3>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Precio de Venta (para todos excepto RAW_MATERIAL) -->
          <p
            v-if="product.type !== 'RAW_MATERIAL'"
            class="text-xl font-bold text-green-600 tabular-nums whitespace-nowrap"
          >
            S/ {{ formatPrice(product.price) }}
          </p>

          <!-- Costo (solo para RAW_MATERIAL) -->
          <p
            v-else
            class="text-xl font-bold text-orange-600 tabular-nums whitespace-nowrap"
          >
            S/ {{ formatPrice(product.cost) }}
          </p>

          <!-- Flecha indicadora -->
          <div class="product-arrow">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Badges de Configuración -->
      <div class="flex flex-wrap gap-2 mb-3">
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

        <!-- Badge: Stock (solo si NO es servicio) -->
        <div
          v-if="props.product.trackStock"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            ></path>
          </svg>
          <span>{{ product.stock || 0 }} {{ unitLabelShort }}</span>
        </div>

        <!-- Badge: Control de Stock (solo si trackStock existe y NO es servicio) -->
        <!-- <div
          v-if="props.product.trackStock"
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
        </div> -->

        <!-- Badge: Unidad de Medida (solo si NO es servicio) -->
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
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        value &&
        typeof value === "object" &&
        "uuid" in value &&
        "description" in value
      );
    },
  },
});

// Emits
const emit = defineEmits(["click"]);

// Computed: Tipo de producto
const productType = computed(() => {
  return props.product.type || "MERCH";
});

const productTypeLabel = computed(() => {
  const labels = {
    MERCH: "Mercadería",
    PRODUCT: "Producto",
    RAW_MATERIAL: "Insumo",
    SERVICE: "Servicio",
  };
  return labels[productType.value] || "Mercadería";
});

const productTypeBadgeClass = computed(() => {
  const classes = {
    MERCH: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    PRODUCT: "bg-purple-100 text-purple-700 border border-purple-200",
    RAW_MATERIAL: "bg-amber-100 text-amber-700 border border-amber-200",
    SERVICE: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return classes[productType.value] || classes.MERCH;
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
  return icons[productType.value] || icons.MERCH;
});

// Computed: TrackStock badge
const trackStockLabelShort = computed(() => {
  return props.product.trackStock ? "Stock Activo" : "Sin Stock";
});

const trackStockBadgeClass = computed(() => {
  return props.product.trackStock
    ? "bg-teal-50 text-teal-700 border border-teal-200"
    : "bg-gray-50 text-gray-600 border border-gray-200";
});

const trackStockIcon = computed(() => {
  return props.product.trackStock
    ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" // Clipboard check
    : "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"; // Clipboard list
});

// Computed: Unit label
const unitLabelShort = computed(() => {
  const unit = props.product.unit || "uni";
  const units = {
    uni: "uni",
    kg: "Kg",
    g: "g",
    l: "L",
    ml: "ml",
    m: "m",
    cm: "cm",
    caja: "Caja",
    paquete: "Paq",
  };
  return units[unit] || unit;
});

// Methods
function handleClick() {
  emit("click", props.product);
}

function formatPrice(price) {
  if (!price && price !== 0) return "0.00";
  return Number(price).toFixed(2);
}
</script>

<style scoped>
.product-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.product-card:active {
  transform: scale(0.98);
}

.product-arrow {
  color: #9ca3af;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.product-card:hover .product-arrow {
  color: #3b82f6;
  transform: translateX(4px);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

/* Tabular nums para precios */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
