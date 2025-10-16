<template>
  <div>
    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="bg-blue-50 border border-blue-200 rounded-lg p-6"
    >
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
    <div
      v-else
      class="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0"
        >
          <Package class="w-6 h-6 text-white" />
        </div>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-800">Conteo de Inventario</h1>
          <p class="text-sm text-gray-500">
            {{ flow.countData.productData?.description || "Producto" }}
          </p>
        </div>
      </div>

      <!-- Información contextual -->
      <div class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <div
            class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0"
          >
            <span class="text-white text-sm font-bold">ℹ️</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-blue-900 mb-2">
              ¿Cuántas unidades tienes físicamente?
            </h3>
            <p class="text-sm text-blue-700 leading-relaxed">
              Ingresa la cantidad exacta que tienes en tu inventario físico. El
              sistema comparará con el stock digital y te mostrará si hay
              diferencias.
            </p>
            <div class="mt-3 pt-3 border-t border-blue-300">
              <div class="text-sm">
                <span class="font-semibold text-blue-900"
                  >Stock digital actual:</span
                >
                <span class="ml-2 font-bold text-blue-600">
                  {{ digitalStock }}
                  {{ flow.countData.productData?.unit || "uni" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input principal -->
      <div class="space-y-3">
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
            class="w-full text-4xl font-bold py-4 px-6 rounded-xl transition-all duration-200 tabular-nums focus:outline-none"
            placeholder="0.00"
            @input="handleInputChange"
            @focus="handleFocus"
          />

          <div
            class="absolute right-6 top-1/2 transform -translate-y-1/2 text-2xl font-semibold"
            :class="{
              'text-gray-400': isDisabled,
              'text-gray-600': !isDisabled,
            }"
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
              :class="[
                'rounded-xl p-4 border-2',
                difference > 0
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300',
              ]"
            >
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                    difference > 0 ? 'bg-green-500' : 'bg-red-500',
                  ]"
                >
                  <svg
                    class="w-5 h-5 text-white"
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
                  <h3
                    :class="[
                      'font-bold text-lg mb-1',
                      difference > 0 ? 'text-green-900' : 'text-red-900',
                    ]"
                  >
                    {{
                      difference > 0
                        ? "⬆️ Excedente detectado"
                        : "⬇️ Faltante detectado"
                    }}
                  </h3>
                  <p
                    :class="[
                      'text-sm mb-3',
                      difference > 0 ? 'text-green-700' : 'text-red-700',
                    ]"
                  >
                    {{
                      difference > 0
                        ? "Tienes más stock del registrado"
                        : "Tienes menos stock del registrado"
                    }}
                  </p>

                  <div class="grid grid-cols-2 gap-3">
                    <div
                      class="bg-white rounded-lg p-3 border"
                      :class="
                        difference > 0 ? 'border-green-200' : 'border-red-200'
                      "
                    >
                      <div class="text-xs text-gray-500 mb-1">
                        Stock Digital
                      </div>
                      <div class="text-xl font-bold text-gray-800">
                        {{ formatNumber(digitalStock) }}
                        <span class="text-sm font-normal text-gray-500">
                          {{ flow.countData.productData?.unit || "uni" }}
                        </span>
                      </div>
                    </div>
                    <div
                      class="bg-white rounded-lg p-3 border"
                      :class="
                        difference > 0 ? 'border-green-200' : 'border-red-200'
                      "
                    >
                      <div class="text-xs text-gray-500 mb-1">Stock Físico</div>
                      <div
                        class="text-xl font-bold"
                        :class="
                          difference > 0 ? 'text-green-600' : 'text-red-600'
                        "
                      >
                        {{ formatNumber(physicalStock) }}
                        <span class="text-sm font-normal text-gray-500">
                          {{ flow.countData.productData?.unit || "uni" }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    class="mt-3 pt-3 border-t"
                    :class="
                      difference > 0 ? 'border-green-200' : 'border-red-200'
                    "
                  >
                    <div class="flex items-center justify-between">
                      <span
                        class="text-sm font-medium"
                        :class="
                          difference > 0 ? 'text-green-800' : 'text-red-800'
                        "
                      >
                        Diferencia:
                      </span>
                      <span
                        class="text-2xl font-bold"
                        :class="
                          difference > 0 ? 'text-green-600' : 'text-red-600'
                        "
                      >
                        {{ difference > 0 ? "+" : ""
                        }}{{ formatNumber(difference) }}
                        <span class="text-base font-normal">
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
              class="rounded-xl p-4 border-2 bg-emerald-50 border-emerald-300"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shrink-0"
                >
                  <svg
                    class="w-6 h-6 text-white"
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
                  <h3 class="font-bold text-lg text-emerald-900 mb-1">
                    ✅ Inventario cuadrado
                  </h3>
                  <p class="text-sm text-emerald-700">
                    El stock físico coincide con el stock digital. No hay
                    discrepancias.
                  </p>
                  <div class="mt-3 flex items-center gap-2 text-emerald-800">
                    <span class="text-sm font-medium">Stock verificado:</span>
                    <span class="text-xl font-bold">
                      {{ formatNumber(physicalStock) }}
                      {{ flow.countData.productData?.unit || "uni" }}
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

const route = useRoute();
const flow = useInventoryCountFlowStore();
const inventoryStore = useInventoryStore();

// Estados reactivos
const isLoading = ref(true);
const physicalStock = ref(null);
const physicalStockInput = ref(null);

// Computed
const digitalStock = computed(() => flow.countData.digitalStock || 0);

const hasUserInput = computed(() => {
  return (
    physicalStock.value !== null && physicalStock.value !== digitalStock.value
  );
});

const difference = computed(() => flow.countData.difference || 0);

const hasDiscrepancy = computed(() => flow.countData.hasDiscrepancy || false);

const isDisabled = computed(() => {
  // Aquí puedes agregar lógica para deshabilitar si ya existe un conteo registrado
  // Por ahora lo dejamos siempre habilitado
  return false;
});

// Clases dinámicas para el input
const inputClasses = computed(() => {
  if (isDisabled.value) {
    return "border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed";
  }

  if (!hasUserInput.value) {
    return "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200";
  }

  if (!hasDiscrepancy.value) {
    return "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200";
  }

  if (difference.value > 0) {
    return "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200";
  }

  return "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200";
});

// Manejadores
const handleInputChange = () => {
  flow.setPhysicalStock(physicalStock.value);
};

const handleFocus = (e) => {
  // Seleccionar todo el texto al hacer foco para facilitar la edición
  e.target.select();
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "0.00";
  return Number(value).toFixed(2);
};

// Observar cambios en el stock físico
watch(physicalStock, (newValue) => {
  if (newValue !== null && newValue !== undefined) {
    console.log("🔍 Watch detectó cambio en physicalStock:", newValue);
    flow.setPhysicalStock(newValue);
  }
});

// Inicialización
onMounted(async () => {
  try {
    isLoading.value = true;

    const productId = route.params.productId;

    if (!productId) {
      console.error("No se encontró el ID del producto");
      return;
    }

    // Obtener datos del producto
    const productData = await inventoryStore.getProductDetails(productId);

    if (!productData) {
      console.error("No se pudo cargar el producto");
      return;
    }

    // Establecer datos en el store
    flow.setProductData(productId, productData);

    // Inicializar el input con el stock digital actual
    // IMPORTANTE: No llamar a setPhysicalStock aquí para evitar que hasUserInput sea true
    physicalStock.value = productData.stock || 0;

    console.log("🎬 Componente inicializado:", {
      productId,
      digitalStock: productData.stock,
      physicalStockInitial: physicalStock.value,
    });
  } catch (error) {
    console.error(
      "Error en inicialización de StepInventoryCountQuantity:",
      error
    );
  } finally {
    isLoading.value = false;
  }
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

/* Animación fade para indicadores de estado */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
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

/* Responsive adjustments */
@media (max-width: 640px) {
  input[type="number"] {
    font-size: 1.875rem; /* 30px */
  }
}
</style>
