<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="bg-blue-50 rounded-lg p-6">
      <div class="flex items-center justify-center gap-2">
        <svg
          class="animate-spin h-5 w-5 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="text-blue-700 font-medium">Cargando producto...</span>
      </div>
    </div>

    <!-- Sección de conteo de inventario -->
    <div v-else class="p-6">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"
        >
          <Package class="w-5 h-5" />
        </div>
        <div class="flex-1">
          <h1 class="text-base font-semibold text-gray-800">Conteo de Inventario</h1>
          <p class="text-xs text-gray-500">
            {{ flow.countData.productData?.description || "Producto" }}
          </p>
        </div>
      </div>

      <!-- Input principal -->
      <div class="space-y-3" v-if="hasVariants">
        <label class="block text-sm font-semibold text-gray-700">
          Stock Físico por Variante
        </label>

        <div class="space-y-2">
          <div
            v-for="variant in variantRows"
            :key="variant.variantId"
            class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 border border-gray-200 rounded-lg"
          >
            <div class="sm:col-span-5">
              <p class="text-sm font-medium text-gray-800">
                {{ variant.label }}
              </p>
              <p class="text-xs text-gray-500">
                SKU: {{ variant.sku || "Sin SKU" }}
              </p>
            </div>
            <div class="sm:col-span-3 text-xs text-gray-600">
              Digital: {{ formatNumber(variant.digitalStock) }}
            </div>
            <div class="sm:col-span-4">
              <input
                v-model.number="variantInputs[variant.variantId]"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                @input="handleVariantInput(variant.variantId)"
              />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div
            class="flex items-center justify-between text-sm text-gray-600"
          >
            <span>Total digital</span>
            <span class="font-semibold text-gray-800"
              >{{ formatNumber(digitalStockValue) }}
              {{ flow.countData.productData?.unit || "uni" }}</span
            >
          </div>
          <div
            class="flex items-center justify-between text-sm text-gray-600 mt-2"
          >
            <span>Total físico</span>
            <span class="font-semibold text-gray-800"
              >{{ formatNumber(flow.countData.physicalStock) }}
              {{ flow.countData.productData?.unit || "uni" }}</span
            >
          </div>
          <div
            class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100"
          >
            <span class="text-sm font-semibold text-gray-800"
              >Diferencia</span
            >
            <span
              class="text-lg font-bold"
              :class="difference >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ difference >= 0 ? "+" : "" }}{{ formatNumber(difference) }}
              <span class="text-xs font-normal text-gray-500 ml-0.5">
                {{ flow.countData.productData?.unit || "uni" }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div class="space-y-3" v-else>
        <label
          for="physical-stock-input"
          class="block text-sm font-semibold text-gray-700"
        >
          Stock Físico Actual
        </label>

        <div class="relative">
          <input
            id="physical-stock-input"
            ref="physicalStockInput"
            v-model.number="physicalStock"
            type="number"
            min="0"
            step="0.01"
            :disabled="isDisabled"
            :class="inputClasses"
            class="w-full text-2xl font-bold py-3 px-5 rounded-xl border-2 transition-all duration-200 tabular-nums focus:outline-none"
            placeholder="0.00"
            @input="handleInputChange"
            @focus="handleFocus"
          />

          <div
            class="absolute right-5 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-gray-400"
          >
            {{ flow.countData.productData?.unit || "uni" }}
          </div>
        </div>

        <!-- Mensaje de estado deshabilitado -->
        <div
          v-if="isDisabled"
          class="text-sm text-gray-500 italic flex items-center gap-2"
        >
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Conteo ya registrado para este producto
        </div>

        <!-- Diferencia calculada -->
        <Transition name="fade">
          <div v-if="hasUserInput" class="mt-4">
            <div
              v-if="hasDiscrepancy"
              class="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                    difference > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600',
                  ]"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      v-if="difference > 0"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                    <path
                      v-else
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-base font-semibold text-gray-800">
                    {{
                      difference > 0
                        ? "Excedente detectado"
                        : "Faltante detectado"
                    }}
                  </h3>
                  <p class="text-xs text-gray-500 mb-4">
                    {{
                      difference > 0
                        ? "El stock físico es mayor al registrado digitalmente"
                        : "El stock físico es menor al registrado digitalmente"
                    }}
                  </p>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                      <div class="text-xs text-gray-500 mb-1">
                        Stock Digital
                      </div>
                      <div class="text-base font-bold text-gray-800">
                        {{ formatNumber(digitalStockValue) }}
                        <span class="text-xs font-normal text-gray-500 ml-0.5">
                          {{ flow.countData.productData?.unit || "uni" }}
                        </span>
                      </div>
                    </div>
                    <div class="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                      <div class="text-xs text-gray-500 mb-1">Stock Físico</div>
                      <div
                        class="text-base font-bold"
                        :class="difference > 0 ? 'text-green-600' : 'text-red-600'"
                      >
                        {{ formatNumber(physicalStock) }}
                        <span class="text-xs font-normal text-gray-500 ml-0.5">
                          {{ flow.countData.productData?.unit || "uni" }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4 pt-3 border-t border-gray-100">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium text-gray-500">
                        Diferencia:
                      </span>
                      <span
                        class="text-lg font-bold"
                        :class="difference > 0 ? 'text-green-600' : 'text-red-600'"
                      >
                        {{ difference > 0 ? "+" : "" }}{{ formatNumber(difference) }}
                        <span class="text-xs font-normal text-gray-500 ml-0.5">
                          {{ flow.countData.productData?.unit || "uni" }}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sin diferencia - Todo cuadra -->
            <div
              v-else
              class="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0"
                >
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-base font-semibold text-gray-800">
                    Inventario cuadrado
                  </h3>
                  <p class="text-xs text-gray-500 mb-4">
                    El stock físico coincide exactamente con el stock digital.
                  </p>
                  <div class="mt-3 flex items-center gap-2">
                    <span class="text-xs font-medium text-gray-500">Stock verificado:</span>
                    <span class="text-base font-bold text-emerald-600">
                      {{ formatNumber(physicalStock) }}
                      <span class="text-xs font-normal text-gray-500 ml-0.5">
                        {{ flow.countData.productData?.unit || "uni" }}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package } from "@iconoir/vue";
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useInventoryCountFlowStore } from "@/stores/Inventory/InventoryCountFlow";
import { useInventoryStore } from "@/stores/inventoryStore";

// Props — permiten que el padre pase datos directamente sin llamar a BD
const props = defineProps({
  productData: {
    type: Object,
    default: null,
  },
  digitalStock: {
    type: Number,
    default: null,
  },
});

const route = useRoute();
const flow = useInventoryCountFlowStore();
const inventoryStore = useInventoryStore();

// Estados reactivos
const isLoading = ref(false);
const physicalStock = ref(null);
const physicalStockInput = ref(null);
const variantInputs = ref({});

const hasVariants = computed(() => {
  return (
    Boolean(flow.countData.productData?.hasVariants) &&
    Array.isArray(flow.countData.productData?.variantCombos) &&
    flow.countData.productData.variantCombos.length > 0
  );
});

const variantRows = computed(() => {
  return (flow.countData.variantCounts || []).map((variant) => ({
    variantId: variant.variantId,
    label: variant.label,
    sku: variant.sku,
    digitalStock: Number(variant.digitalStock || 0),
    physicalStock: Number(variant.physicalStock || 0),
  }));
});

// Computed
const digitalStockValue = computed(() => {
  // Si el padre pasó digitalStock como prop, usarlo
  if (props.digitalStock !== null) return props.digitalStock;
  return flow.countData.digitalStock || 0;
});

const hasUserInput = computed(() => {
  if (hasVariants.value) {
    return variantRows.value.some(
      (variant) =>
        Number(variant.digitalStock || 0) !==
        Number(
          variantInputs.value[variant.variantId] ?? variant.digitalStock ?? 0,
        ),
    );
  }

  return (
    physicalStock.value !== null &&
    physicalStock.value !== digitalStockValue.value
  );
});

const difference = computed(() => flow.countData.difference || 0);
const hasDiscrepancy = computed(() => flow.countData.hasDiscrepancy || false);

const isDisabled = computed(() => false);

// Clases dinámicas para el input
const inputClasses = computed(() => {
  if (isDisabled.value) {
    return "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed";
  }
  if (!hasUserInput.value) {
    return "border-gray-200 bg-white text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
  }
  if (!hasDiscrepancy.value) {
    return "border-emerald-300 bg-emerald-50/20 text-emerald-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";
  }
  if (difference.value > 0) {
    return "border-green-300 bg-green-50/20 text-green-700 focus:border-green-500 focus:ring-4 focus:ring-green-100";
  }
  return "border-red-300 bg-red-50/20 text-red-700 focus:border-red-500 focus:ring-4 focus:ring-red-100";
});

// Manejadores
const handleInputChange = () => {
  flow.setPhysicalStock(physicalStock.value);
};

const handleFocus = (e) => {
  e.target.select();
};

const handleVariantInput = (variantId) => {
  flow.setVariantPhysicalStock(
    variantId,
    Number(variantInputs.value[variantId] || 0),
  );
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "0.00";
  return Number(value).toFixed(2);
};

// Observar cambios en el stock físico
watch(physicalStock, (newValue) => {
  if (newValue !== null && newValue !== undefined) {
    flow.setPhysicalStock(newValue);
  }
});

// Inicialización
onMounted(async () => {
  try {
    // Si el padre pasó productData como prop, usarlos sin fetch
    if (props.productData) {
      flow.setProductData(route.params.productId, props.productData);
      physicalStock.value = props.productData.stock || 0;

      if (hasVariants.value) {
        const initialInputs = {};
        (flow.countData.variantCounts || []).forEach((variant) => {
          initialInputs[variant.variantId] = Number(variant.digitalStock || 0);
        });
        variantInputs.value = initialInputs;
      }

      console.log(
        "⚡ StepInventoryCountQuantity inicializado desde props:",
        props.productData,
      );
      return;
    }

    // Fallback: cargar desde BD
    isLoading.value = true;
    const productId = route.params.productId;
    if (!productId) {
      console.error("No se encontró el ID del producto");
      return;
    }

    const productData = await inventoryStore.getProductDetails(productId);
    if (!productData) {
      console.error("No se pudo cargar el producto");
      return;
    }

    flow.setProductData(productId, productData);
    physicalStock.value = productData.stock || 0;

    if (hasVariants.value) {
      const initialInputs = {};
      (flow.countData.variantCounts || []).forEach((variant) => {
        initialInputs[variant.variantId] = Number(variant.digitalStock || 0);
      });
      variantInputs.value = initialInputs;
    }

    console.log("✅ StepInventoryCountQuantity inicializado desde BD:", {
      productId,
      digitalStock: productData.stock,
    });
  } catch (error) {
    console.error("Error en StepInventoryCountQuantity:", error);
  } finally {
    isLoading.value = false;
  }
});

watch(
  () => flow.countData.variantCounts,
  (variantCounts) => {
    if (!hasVariants.value || !Array.isArray(variantCounts)) return;

    const next = { ...variantInputs.value };
    variantCounts.forEach((variant) => {
      if (next[variant.variantId] === undefined) {
        next[variant.variantId] = Number(variant.digitalStock || 0);
      }
    });

    variantInputs.value = next;
  },
  { deep: true },
);
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

/* Animación fade para indicadores de estado */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Estilos del input */
input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Focus states mejorados */
input:focus {
  outline: none;
}

input:focus:not(:disabled) {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* Estados disabled */
input:disabled {
  cursor: not-allowed;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Mejora de accesibilidad */
button:focus-visible,
input:focus-visible {
  outline: 2px solid rgb(59 130 246);
  outline-offset: 2px;
}

/* Animación de spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

</style>
