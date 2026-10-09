<template>
  <!-- Stock Alert Block -->
  <div
    class="w-full rounded-xl shadow-sm border p-4 sm:p-6 mb-4"
    :class="[bgColorClass, borderClass]"
  >
    <div class="flex items-center justify-between gap-4">
      <!-- Lado izquierdo: Ícono y estado -->
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0"
          :class="iconBgClass"
        >
          <svg
            v-if="stockStatus === 'high'"
            class="w-5 h-5 sm:w-6 sm:h-6"
            :class="iconColorClass"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <svg
            v-else-if="stockStatus === 'medium'"
            class="w-5 h-5 sm:w-6 sm:h-6"
            :class="iconColorClass"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          <svg
            v-else
            class="w-5 h-5 sm:w-6 sm:h-6"
            :class="iconColorClass"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <div>
          <p class="text-xs sm:text-sm text-gray-500 mb-0.5">Stock Actual</p>
          <p class="text-sm font-medium" :class="statusTextClass">
            {{ stockStatusText }}
          </p>
          <!-- Stock mínimo configurado -->
          <p v-if="minStock !== null" class="text-xs text-gray-400 mt-0.5">
            Mín. configurado: {{ minStock }} {{ unit || "uni" }}
          </p>
        </div>
      </div>

      <!-- Lado derecho: Cantidad + botón editar -->
      <div class="flex items-center gap-3">
        <div class="text-right">
          <p class="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">
            {{ stock || 0 }}
          </p>
          <p class="text-xs sm:text-sm text-gray-500 mt-1">{{ unit || "uni" }}</p>
        </div>

        <!-- Botón de edición → InventoryCount -->
        <router-link
          v-if="productId"
          :to="inventoryCountRoute"
          class="p-2.5 bg-white hover:bg-teal-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:scale-105 group shrink-0"
          title="Conteo de inventario / Editar stock"
        >
          <svg
            class="w-5 h-5 text-gray-500 group-hover:text-teal-600"
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
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

// Props
const props = defineProps({
  stock: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
    default: "uni",
  },
  productId: {
    type: String,
    default: null,
  },
  minStock: {
    type: Number,
    default: null,
  },
  // Datos extra para pasar a InventoryCount via state
  description: {
    type: String,
    default: "",
  },
  productType: {
    type: String,
    default: "MERCH",
  },
});

const route = useRoute();

// Ruta hacia InventoryCount con state del producto
const inventoryCountRoute = computed(() => ({
  name: "InventoryCount",
  params: {
    businessId: route.params.businessId,
    productId: props.productId,
  },
  state: {
    description: props.description,
    stock: props.stock,
    unit: props.unit,
    minStock: props.minStock ?? null,
    type: props.productType,
  },
}));

// Computed: Stock Status (usa minStock si está configurado)
const stockStatus = computed(() => {
  const stock = props.stock || 0;
  if (stock === 0) return "empty";
  const min = props.minStock;
  if (min !== null && stock <= min) return "low";
  if (stock <= 5) return "low";
  if (stock <= 20) return "medium";
  return "high";
});

const stockStatusText = computed(() => {
  switch (stockStatus.value) {
    case "empty":
      return "Sin stock disponible";
    case "low":
      return "Stock bajo - Reabastecer pronto";
    case "medium":
      return "Stock moderado";
    case "high":
      return "Stock disponible";
    default:
      return "";
  }
});

// Computed: Clases de estilo dinámicas
const bgColorClass = computed(() => {
  switch (stockStatus.value) {
    case "high":
      return "bg-green-50";
    case "medium":
      return "bg-amber-50";
    case "low":
      return "bg-red-50";
    case "empty":
      return "bg-gray-50";
    default:
      return "bg-white";
  }
});

const borderClass = computed(() => {
  switch (stockStatus.value) {
    case "high":
      return "border-green-200";
    case "medium":
      return "border-amber-200";
    case "low":
      return "border-red-200";
    case "empty":
      return "border-gray-200";
    default:
      return "border-gray-100";
  }
});

const iconBgClass = computed(() => {
  switch (stockStatus.value) {
    case "high":
      return "bg-green-100";
    case "medium":
      return "bg-amber-100";
    case "low":
      return "bg-red-100";
    case "empty":
      return "bg-gray-100";
    default:
      return "bg-gray-100";
  }
});

const iconColorClass = computed(() => {
  switch (stockStatus.value) {
    case "high":
      return "text-green-600";
    case "medium":
      return "text-amber-600";
    case "low":
      return "text-red-600";
    case "empty":
      return "text-gray-600";
    default:
      return "text-gray-600";
  }
});

const statusTextClass = computed(() => {
  switch (stockStatus.value) {
    case "high":
      return "text-green-800";
    case "medium":
      return "text-amber-800";
    case "low":
      return "text-red-800";
    case "empty":
      return "text-gray-800";
    default:
      return "text-gray-800";
  }
});
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

.shrink-0 {
  flex-shrink: 0;
}
</style>
