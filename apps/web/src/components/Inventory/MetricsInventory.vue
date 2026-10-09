<template>
  <div class="metrics-inventory-container mb-6">
    <!-- Encabezado de la sección de métricas -->
    <div class="metrics-header mb-3">
      <h2
        class="text-sm font-bold text-gray-700 tracking-wide uppercase flex items-center gap-1.5"
      >
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Valorización de inventario
      </h2>
    </div>

    <!-- Skeleton loader cuando se está cargando el inventario -->
    <div
      v-if="isLoading"
      class="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="bg-white p-3 md:p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse flex flex-col justify-between h-24 md:h-32"
      >
        <div class="flex justify-between items-start gap-1">
          <div class="space-y-1.5 flex-1">
            <div class="h-3 w-12 sm:w-16 bg-gray-200 rounded"></div>
            <div class="h-5 w-16 sm:w-24 bg-gray-200 rounded mt-1"></div>
          </div>
          <div class="h-7 w-7 sm:h-9 sm:w-9 bg-gray-200 rounded-lg"></div>
        </div>
        <div class="h-3 w-20 bg-gray-100 rounded mt-1"></div>
      </div>
    </div>

    <!-- Panel de métricas real -->
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
      <!-- Card: Insumos -->
      <div
        class="metric-card border-l-4 bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-24 md:h-32 relative overflow-hidden group"
      >
        <div class="flex justify-between items-start gap-1">
          <div class="min-w-0 flex-1">
            <span
              class="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider block truncate"
              >Insumos</span
            >
            <h3
              class="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-gray-900 mt-0.5 md:mt-1 tabular-nums truncate"
            >
              S/ {{ formatValue(metrics.rawMaterial.value) }}
            </h3>
          </div>
          <div
            class="icon-wrapper flex-shrink-0 bg-amber-50 text-amber-600 border border-amber-100 p-1.5 md:p-2.5 rounded-lg md:rounded-xl group-hover:bg-amber-100/70 transition-colors duration-200"
          >
            <svg
              class="w-3.5 h-3.5 md:w-5 h-5"
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
          </div>
        </div>
        <div
          class="flex justify-between items-center text-[9px] md:text-xs text-gray-500 pt-1.5 md:pt-2 border-t border-gray-50 mt-1 md:mt-0"
        >
          <span
            class="font-medium text-amber-700 bg-amber-50/50 px-1 md:px-2 py-0.5 rounded border border-amber-100/50 truncate"
            >{{ metrics.rawMaterial.count }} items</span
          >
        </div>
      </div>

      <!-- Card: Productos -->
      <div
        class="metric-card border-l-4 bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-24 md:h-32 relative overflow-hidden group"
      >
        <div class="flex justify-between items-start gap-1">
          <div class="min-w-0 flex-1">
            <span
              class="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider block truncate"
              >Productos</span
            >
            <h3
              class="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-gray-900 mt-0.5 md:mt-1 tabular-nums truncate"
            >
              S/ {{ formatValue(metrics.product.value) }}
            </h3>
          </div>
          <div
            class="icon-wrapper flex-shrink-0 bg-purple-50 text-purple-600 border border-purple-100 p-1.5 md:p-2.5 rounded-lg md:rounded-xl group-hover:bg-purple-100/70 transition-colors duration-200"
          >
            <svg
              class="w-3.5 h-3.5 md:w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
        </div>
        <div
          class="flex justify-between items-center text-[9px] md:text-xs text-gray-500 pt-1.5 md:pt-2 border-t border-gray-50 mt-1 md:mt-0"
        >
          <span
            class="font-medium text-purple-700 bg-purple-50/50 px-1 md:px-2 py-0.5 rounded border border-purple-100/50 truncate"
            >{{ metrics.product.count }} items</span
          >
        </div>
      </div>

      <!-- Card: Mercaderías -->
      <div
        class="metric-card border-l-4 border-emerald-500 bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-24 md:h-32 relative overflow-hidden group"
      >
        <div class="flex justify-between items-start gap-1">
          <div class="min-w-0 flex-1">
            <span
              class="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider block truncate"
              >Mercaderías</span
            >
            <h3
              class="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-gray-900 mt-0.5 md:mt-1 tabular-nums truncate"
            >
              S/ {{ formatValue(metrics.merch.value) }}
            </h3>
          </div>
          <div
            class="icon-wrapper flex-shrink-0 bg-emerald-50 text-emerald-600 border border-emerald-100 p-1.5 md:p-2.5 rounded-lg md:rounded-xl group-hover:bg-emerald-100/70 transition-colors duration-200"
          >
            <svg
              class="w-3.5 h-3.5 md:w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
        </div>
        <div
          class="flex justify-between items-center text-[9px] md:text-xs text-gray-500 pt-1.5 md:pt-2 border-t border-gray-50 mt-1 md:mt-0"
        >
          <span
            class="font-medium text-emerald-700 bg-emerald-50/50 px-1 md:px-2 py-0.5 rounded border border-emerald-100/50 truncate"
            >{{ metrics.merch.count }} items</span
          >
        </div>
      </div>

      <!-- Card: Servicios -->
      <div
        class="metric-card border-l-4 border-blue-500 bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-24 md:h-32 relative overflow-hidden group"
      >
        <div class="flex justify-between items-start gap-1">
          <div class="min-w-0 flex-1">
            <span
              class="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider block truncate"
              >Servicios</span
            >
            <h3
              class="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-gray-900 mt-0.5 md:mt-1 truncate"
            >
              {{ metrics.service.count }}
            </h3>
          </div>
          <div
            class="icon-wrapper flex-shrink-0 bg-blue-50 text-blue-600 border border-blue-100 p-1.5 md:p-2.5 rounded-lg md:rounded-xl group-hover:bg-blue-100/70 transition-colors duration-200"
          >
            <svg
              class="w-3.5 h-3.5 md:w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <div
          class="flex justify-between items-center text-[9px] md:text-xs text-gray-500 pt-1.5 md:pt-2 border-t border-gray-50 mt-1 md:mt-0"
        >
          <span
            class="font-medium text-blue-700 bg-blue-50/50 px-1 md:px-2 py-0.5 rounded border border-blue-100/50 truncate"
            >Servicios registrados</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useInventoryStore } from "@/stores/inventoryStore";

const inventoryStore = useInventoryStore();

// Usamos el listado de productos de forma reactiva de la store
const products = computed(() => inventoryStore.allItemsInInventory.value || []);
const isLoading = computed(() => inventoryStore.isLoading.value);

// Función de ayuda para calcular la valorización de stock de un producto de forma robusta
const getProductValue = (product) => {
  // Si tiene variantes y sus variantes están cargadas
  if (
    product.hasVariants &&
    Array.isArray(product.variantCombos) &&
    product.variantCombos.length > 0
  ) {
    let totalValue = 0;
    product.variantCombos.forEach((variant) => {
      const vStock = Number(variant.stock || 0);
      const vCost = Number(
        variant.cost !== undefined && variant.cost !== null
          ? variant.cost
          : product.cost || 0,
      );
      if (vStock > 0 && vCost > 0) {
        totalValue += vStock * vCost;
      }
    });
    return totalValue;
  } else {
    // Si no tiene variantes
    const stock = Number(product.stock || 0);
    const cost = Number(product.cost || 0);
    if (stock > 0 && cost > 0) {
      return stock * cost;
    }
  }
  return 0;
};

// Computamos las métricas agregando los productos reactivamente
const metrics = computed(() => {
  let rawMaterialValue = 0;
  let rawMaterialCount = 0;
  let rawMaterialStock = 0;

  let productValue = 0;
  let productCount = 0;
  let productStock = 0;

  let merchValue = 0;
  let merchCount = 0;
  let merchStock = 0;

  let serviceCount = 0;

  products.value.forEach((p) => {
    const type = p.type || "MERCH";

    if (type === "RAW_MATERIAL") {
      rawMaterialCount++;
      const val = getProductValue(p);
      rawMaterialValue += val;
      const stock =
        p.hasVariants && p.stockSummary
          ? Number(p.stockSummary.totalStock || 0)
          : Number(p.stock || 0);
      rawMaterialStock += stock;
    } else if (type === "PRODUCT") {
      productCount++;
      const val = getProductValue(p);
      productValue += val;
      const stock =
        p.hasVariants && p.stockSummary
          ? Number(p.stockSummary.totalStock || 0)
          : Number(p.stock || 0);
      productStock += stock;
    } else if (type === "MERCH") {
      merchCount++;
      const val = getProductValue(p);
      merchValue += val;
      const stock =
        p.hasVariants && p.stockSummary
          ? Number(p.stockSummary.totalStock || 0)
          : Number(p.stock || 0);
      merchStock += stock;
    } else if (type === "SERVICE") {
      serviceCount++;
    }
  });

  return {
    rawMaterial: {
      value: rawMaterialValue,
      count: rawMaterialCount,
      stock: rawMaterialStock,
    },
    product: {
      value: productValue,
      count: productCount,
      stock: productStock,
    },
    merch: {
      value: merchValue,
      count: merchCount,
      stock: merchStock,
    },
    service: {
      count: serviceCount,
    },
  };
});

// Formatear precios
function formatValue(value) {
  if (!value && value !== 0) return "0.00";
  return Number(value).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>

<style scoped>
.metric-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Evitar desbordes de texto largos */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
