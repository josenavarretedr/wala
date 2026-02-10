<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"
      ></div>
      <p class="text-sm text-gray-500">Cargando producto...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 mb-4">
        <svg
          class="w-12 h-12 mx-auto"
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
      </div>
      <h3 class="text-lg font-medium text-gray-800 mb-2">{{ error }}</h3>
      <button
        @click="goBack"
        class="mt-4 px-6 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
      >
        Volver
      </button>
    </div>

    <!-- Content -->
    <div v-else-if="product">
      <!-- Header con botón de volver -->
      <div class="flex items-center gap-3 mb-6">
        <BackBtn
          :route-name="'InventoryProductDetails'"
          :route-params="{
            businessId: route.params.businessId,
            productId: route.params.productId,
          }"
          tooltip-text="Volver al producto"
        />
      </div>

      <!-- Título de la sección -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          Costeo del Producto
        </h1>
        <p class="text-sm text-gray-500">
          {{ product.description }}
        </p>
        <p class="text-xs text-gray-400 mt-1">
          Selecciona un tipo de costo para configurar
        </p>
      </div>

      <!-- Grid de Botones de Costeo -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <!-- Botón: Costos de Materiales -->
        <button
          type="button"
          @click="navigateToCost('costs-materials')"
          :class="[
            'relative p-5 rounded-xl border-2 transition-all text-left group',
            hasMaterialsCostStructure
              ? 'border-emerald-500 bg-emerald-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-sm',
          ]"
        >
          <div class="flex items-start gap-4">
            <!-- Icono -->
            <div
              :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                hasMaterialsCostStructure
                  ? 'bg-emerald-500'
                  : 'bg-emerald-100 group-hover:bg-emerald-200',
              ]"
            >
              <svg
                class="w-6 h-6"
                :class="
                  hasMaterialsCostStructure ? 'text-white' : 'text-emerald-600'
                "
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
            </div>

            <!-- Contenido -->
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 mb-1">
                Costos de Materiales
              </div>
              <p class="text-xs text-gray-600">
                Costo de materias primas e insumos por artículo
              </p>
            </div>
          </div>

          <!-- Check verde cuando hay datos -->
          <div
            v-if="hasMaterialsCostStructure"
            class="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          <!-- Número del costo -->
          <div
            v-if="hasMaterialsCostStructure"
            class="mt-3 pt-3 border-t border-emerald-200"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-emerald-700"
                >Costo configurado</span
              >
              <span class="text-lg font-bold text-emerald-600">
                S/ {{ formatNumber(getMaterialsCost) }}
              </span>
            </div>
          </div>
        </button>

        <!-- Botón: Mano de Obra Directa (MOD) -->
        <button
          v-if="showMOD"
          type="button"
          @click="navigateToCost('costs-mod')"
          :class="[
            'relative p-5 rounded-xl border-2 transition-all text-left group',
            costingStore.hasMODCost
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm',
          ]"
        >
          <div class="flex items-start gap-4">
            <!-- Icono -->
            <div
              :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                costingStore.hasMODCost
                  ? 'bg-blue-500'
                  : 'bg-blue-100 group-hover:bg-blue-200',
              ]"
            >
              <svg
                class="w-6 h-6"
                :class="
                  costingStore.hasMODCost ? 'text-white' : 'text-blue-600'
                "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>

            <!-- Contenido -->
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 mb-1">
                Mano de Obra Directa
              </div>
              <p class="text-xs text-gray-600">
                Costo de personal directo por artículo
              </p>
            </div>
          </div>

          <!-- Check verde cuando hay datos -->
          <div
            v-if="costingStore.hasMODCost"
            class="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          <!-- Número del costo -->
          <div
            v-if="costingStore.hasMODCost"
            class="mt-3 pt-3 border-t border-blue-200"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-blue-700"
                >Costo configurado</span
              >
              <span class="text-lg font-bold text-blue-600">
                S/ {{ formatNumber(costingStore.costs.mod) }}
              </span>
            </div>
          </div>
        </button>

        <!-- Botón: Costos Indirectos de Fabricación (CIF) -->
        <button
          v-if="showCIF"
          type="button"
          @click="navigateToCost('costs-cif')"
          :class="[
            'relative p-5 rounded-xl border-2 transition-all text-left group',
            costingStore.hasCIFCost
              ? 'border-purple-500 bg-purple-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-sm',
          ]"
        >
          <div class="flex items-start gap-4">
            <!-- Icono -->
            <div
              :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                costingStore.hasCIFCost
                  ? 'bg-purple-500'
                  : 'bg-purple-100 group-hover:bg-purple-200',
              ]"
            >
              <svg
                class="w-6 h-6"
                :class="
                  costingStore.hasCIFCost ? 'text-white' : 'text-purple-600'
                "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>

            <!-- Contenido -->
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 mb-1">
                Costos Indirectos de Fabricación
              </div>
              <p class="text-xs text-gray-600">
                Costos indirectos de producción por artículo
              </p>
            </div>
          </div>

          <!-- Check verde cuando hay datos -->
          <div
            v-if="costingStore.hasCIFCost"
            class="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          <!-- Número del costo -->
          <div
            v-if="costingStore.hasCIFCost"
            class="mt-3 pt-3 border-t border-purple-200"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-purple-700"
                >Costo configurado</span
              >
              <span class="text-lg font-bold text-purple-600">
                S/ {{ formatNumber(costingStore.costs.cif) }}
              </span>
            </div>
          </div>
        </button>

        <!-- Botón: Gastos Generales -->
        <button
          type="button"
          @click="navigateToCost('costs-overhead')"
          :class="[
            'relative p-5 rounded-xl border-2 transition-all text-left group',
            costingStore.hasOverheadCost
              ? 'border-amber-500 bg-amber-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-sm',
          ]"
        >
          <div class="flex items-start gap-4">
            <!-- Icono -->
            <div
              :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                costingStore.hasOverheadCost
                  ? 'bg-amber-500'
                  : 'bg-amber-100 group-hover:bg-amber-200',
              ]"
            >
              <svg
                class="w-6 h-6"
                :class="
                  costingStore.hasOverheadCost ? 'text-white' : 'text-amber-600'
                "
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
            </div>

            <!-- Contenido -->
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 mb-1">
                Gastos Generales
              </div>
              <p class="text-xs text-gray-600">
                Gastos administrativos y de ventas por artículo
              </p>
            </div>
          </div>

          <!-- Check verde cuando hay datos -->
          <div
            v-if="costingStore.hasOverheadCost"
            class="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          <!-- Número del costo -->
          <div
            v-if="costingStore.hasOverheadCost"
            class="mt-3 pt-3 border-t border-amber-200"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-amber-700"
                >Costo configurado</span
              >
              <span class="text-lg font-bold text-amber-600">
                S/ {{ formatNumber(costingStore.costs.overhead) }}
              </span>
            </div>
          </div>
        </button>
      </div>

      <!-- Resumen Total (si hay costos) -->
      <div
        v-if="costingStore.hasAnyCost"
        class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200"
      >
        <!-- <pre>
          {{ costingStore }}
        </pre> -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Costo Total</h3>
          <span class="text-3xl font-bold text-gray-900">
            S/ {{ formatNumber(costingStore.totalCost) }}
          </span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div
            v-if="costingStore.hasMaterialsCost"
            class="bg-white rounded-lg p-3"
          >
            <div class="text-gray-500 mb-1">Materiales</div>
            <div class="font-semibold text-emerald-600">
              S/ {{ formatNumber(costingStore.costs.materials) }}
            </div>
          </div>
          <div v-if="costingStore.hasMODCost" class="bg-white rounded-lg p-3">
            <div class="text-gray-500 mb-1">MOD</div>
            <div class="font-semibold text-blue-600">
              S/ {{ formatNumber(costingStore.costs.mod) }}
            </div>
          </div>
          <div v-if="costingStore.hasCIFCost" class="bg-white rounded-lg p-3">
            <div class="text-gray-500 mb-1">CIF</div>
            <div class="font-semibold text-purple-600">
              S/ {{ formatNumber(costingStore.costs.cif) }}
            </div>
          </div>
          <div
            v-if="costingStore.hasOverheadCost"
            class="bg-white rounded-lg p-3"
          >
            <div class="text-gray-500 mb-1">Overhead</div>
            <div class="font-semibold text-amber-600">
              S/ {{ formatNumber(costingStore.costs.overhead) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useInventory } from "@/composables/useInventory";
import { useProductCostingStore } from "@/stores/productCostingStore";
import BackBtn from "@/components/ui/BackBtn.vue";

// Router
const route = useRoute();
const router = useRouter();

// Composables
const { getProductById } = useInventory();

// Stores
const costingStore = useProductCostingStore();

// State
const product = ref(null);
const loading = ref(true);
const error = ref(null);

// Computed Properties
const showMOD = computed(() => {
  if (!product.value) return false;
  return ["PRODUCT", "SERVICE"].includes(product.value.type);
});

const showCIF = computed(() => {
  if (!product.value) return false;
  return ["PRODUCT", "SERVICE"].includes(product.value.type);
});

// Computed para detectar si tiene costStructure configurado
const hasMaterialsCostStructure = computed(() => {
  return (
    product.value?.costStructure?.materials !== null &&
    product.value?.costStructure?.materials !== undefined &&
    product.value?.costStructure?.materials > 0
  );
});

const getMaterialsCost = computed(() => {
  return product.value?.costStructure?.materials || 0;
});

// Methods
const loadProduct = async () => {
  loading.value = true;
  error.value = null;

  try {
    const productId = route.params.productId;

    if (!productId) {
      error.value = "ID de producto no válido";
      return;
    }

    const productData = await getProductById(productId);

    if (!productData) {
      error.value = "Producto no encontrado";
      return;
    }

    console.log("📦 Producto cargado en ProductCosting:", {
      productId,
      costStructure: productData.costStructure,
      cost: productData.cost,
    });

    product.value = productData;

    // Inicializar el store con el productId y el producto actual
    costingStore.initializeProduct(productId, productData);
  } catch (err) {
    console.error("Error cargando producto:", err);
    error.value = "Error al cargar el producto";
  } finally {
    loading.value = false;
  }
};

const navigateToCost = (costType) => {
  router.push({
    name: getCostRouteName(costType),
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

const getCostRouteName = (costType) => {
  const routeMap = {
    "costs-materials": "CostsMaterials",
    "costs-mod": "CostsMOD",
    "costs-cif": "CostsCIF",
    "costs-overhead": "CostsOverhead",
  };
  return routeMap[costType];
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "0.00";
  return parseFloat(value).toFixed(2);
};

const goBack = () => {
  router.push({
    name: "InventoryProductDetails",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

// Watchers
watch(
  () => route.params.productId,
  () => {
    if (route.params.productId) {
      loadProduct();
    }
  },
);

// Lifecycle
onMounted(() => {
  loadProduct();
});
</script>

<style scoped>
/* Animaciones suaves */
button {
  transition: all 0.2s ease;
}

/* Estados hover mejorados */
button:hover:not(:disabled) {
  transform: translateY(-2px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* Animación de carga */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
