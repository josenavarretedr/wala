<template>
  <div class="min-h-screen bg-white/80 rounded-3xl p-4 sm:p-6">
    <!-- Header con navegación -->
    <div class="max-w-4xl mx-auto mb-6">
      <div class="flex items-center gap-3 mb-4">
        <button
          @click="goBack"
          class="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <svg
            class="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
            Conteo de Inventario
          </h1>
          <p class="text-sm text-gray-600 mt-1">
            {{ productDescription || "Cargando..." }}
          </p>
        </div>
      </div>
    </div>

    <!-- Contenido -->
    <div class="max-w-4xl mx-auto space-y-4">
      <!-- Loading (solo en fallback a BD) -->
      <div
        v-if="loading"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"
      >
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"
        ></div>
        <p class="text-gray-600 mt-4">Cargando producto...</p>
      </div>

      <template v-else>
        <!-- Paso: Conteo de stock físico -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <StepInventoryCountQuantity
            :product-data="productDataForStep"
            :digital-stock="digitalStock"
          />
        </div>

        <!-- Campo: Stock mínimo -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0"
            >
              <svg
                class="w-5 h-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-800">
                Alerta de Stock Mínimo
              </h2>
              <p class="text-xs text-gray-500">
                Define el umbral mínimo para recibir alertas
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-3">
              <label
                for="min-stock-input"
                class="block text-sm font-semibold text-gray-700"
              >
                Stock Mínimo (Punto de reposición)
              </label>
              <div class="relative">
                <input
                  id="min-stock-input"
                  v-model.number="localMinStock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ej: 5"
                  class="w-full text-2xl font-bold py-3 px-5 rounded-xl border-2 transition-all duration-200 tabular-nums focus:outline-none"
                  :class="minStockInputClass"
                  @input="onMinStockChange"
                />
                <div
                  class="absolute right-5 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-gray-400"
                >
                  {{ flow.countData.productData?.unit || "uni" }}
                </div>
              </div>
              <p class="text-xs text-gray-500">
                Alerta cuando el stock sea igual o menor a este valor.
              </p>
            </div>

            <div class="space-y-3">
              <label
                for="safety-stock-input"
                class="block text-sm font-semibold text-gray-700"
              >
                Stock de Seguridad (Colchón extra)
              </label>
              <div class="relative">
                <input
                  id="safety-stock-input"
                  v-model.number="localSafetyStock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ej: 2"
                  class="w-full text-2xl font-bold py-3 px-5 rounded-xl border-2 transition-all duration-200 tabular-nums focus:outline-none"
                  :class="safetyStockInputClass"
                />
                <div
                  class="absolute right-5 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-gray-400"
                >
                  {{ flow.countData.productData?.unit || "uni" }}
                </div>
              </div>
              <p class="text-xs text-gray-500">
                Respaldo ante retrasos del proveedor o picos de demanda.
              </p>
            </div>
          </div>
        </div>

        <!-- Opción de impacto al Estado de Resultados cuando hay faltante físico -->
        <div
          v-if="hasShortageDifference"
          class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
        >
          <input
            id="record-shortage-loss"
            v-model="recordShortageAsLoss"
            type="checkbox"
            class="mt-1 w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
          />
          <label for="record-shortage-loss" class="text-xs sm:text-sm text-amber-900 cursor-pointer">
            <span class="font-bold block">
              Registrar faltante ({{ Math.abs(Number(flow.countData.difference || 0)) }} {{ flow.countData.productData?.unit || "uni" }}) como merma en el Estado de Resultados
            </span>
            <span class="text-xs text-amber-800">
              No altera tus saldos de Caja/Banco, pero refleja la pérdida real en tu Ganancia Neta.
            </span>
          </label>
        </div>

        <!-- Botón Guardar (se activa si hay cambios en stock físico o minStock) -->
        <div
          v-if="hasChanges"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
        >
          <button
            @click="handleSave"
            :disabled="saving"
            class="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
            :class="
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-sm hover:shadow-md'
            "
          >
            <svg
              v-if="saving"
              class="animate-spin h-5 w-5"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ saving ? "Guardando..." : "Guardar cambios" }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import StepInventoryCountQuantity from "@/components/Inventory/StockLogs/StepInventoryCountQuantity.vue";
import { useInventoryCountFlowStore } from "@/stores/Inventory/InventoryCountFlow";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useToast } from "@/composables/useToast";
import { recordInventoryLossTx } from "@/utils/nonCashAccounting";

const route = useRoute();
const router = useRouter();
const flow = useInventoryCountFlowStore();
const inventoryStore = useInventoryStore();
const { success, warning: toastWarning, error: showError } = useToast();

const loading = ref(false);
const saving = ref(false);
const localMinStock = ref(null);
const originalMinStock = ref(null);
const localSafetyStock = ref(null);
const originalSafetyStock = ref(null);
const recordShortageAsLoss = ref(true);

const hasShortageDifference = computed(() => {
  return (
    flow.countData.hasUserInput &&
    flow.countData.physicalStock !== null &&
    Number(flow.countData.difference || 0) < -0.0001
  );
});

// Descripción del producto para el header
const productDescription = computed(
  () => flow.countData.productData?.description || "",
);

// Stock digital para pasar al paso de conteo
const digitalStock = computed(() => flow.countData.digitalStock || 0);

// Datos del producto para pasar como prop al componente hijo
const productDataForStep = computed(() => flow.countData.productData);

// Detectar si hay cambios para activar el botón Guardar
const variantStockChanged = computed(() => {
  if (!flow.countData.hasVariants) return false;

  return (flow.countData.variantCounts || []).some((variant) => {
    return (
      Math.abs(
        Number(variant.physicalStock || 0) - Number(variant.digitalStock || 0),
      ) > 0.0001
    );
  });
});

const hasChanges = computed(() => {
  const stockChanged =
    flow.countData.hasUserInput &&
    flow.countData.physicalStock !== null &&
    (Math.abs(Number(flow.countData.difference || 0)) > 0.0001 ||
      variantStockChanged.value);

  const minStockChanged = localMinStock.value !== originalMinStock.value;
  const safetyStockChanged = localSafetyStock.value !== originalSafetyStock.value;

  return stockChanged || minStockChanged || safetyStockChanged;
});

// Clases del input de minStock
const minStockInputClass = computed(() => {
  if (localMinStock.value !== originalMinStock.value) {
    return "border-orange-400 bg-orange-50 text-orange-700 ring-2 ring-orange-200";
  }
  return "border-gray-300 bg-gray-50 text-gray-700";
});

const safetyStockInputClass = computed(() => {
  if (localSafetyStock.value !== originalSafetyStock.value) {
    return "border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-200";
  }
  return "border-gray-300 bg-gray-50 text-gray-700";
});

// Al cambiar minStock actualizar el store también
const onMinStockChange = () => {
  flow.setMinStock(localMinStock.value);
};

// Cargar datos del producto — desde state de ruta o fallback a BD
const loadProductData = async () => {
  const state = history.state;

  if (
    (state?.stock !== undefined || state?.description !== undefined) &&
    state?.hasVariants !== undefined
  ) {
    // Datos disponibles desde route state
    const productData = {
      description: state.description || "",
      stock: state.stock ?? 0,
      unit: state.unit || "uni",
      minStock: state.minStock ?? null,
      type: state.type || "MERCH",
      hasVariants: Boolean(state.hasVariants),
      variantSchema: state.variantSchema || { attributes: [] },
      variantCombos: Array.isArray(state.variantCombos)
        ? state.variantCombos
        : [],
    };
    flow.setProductData(route.params.productId, productData);
    localMinStock.value = productData.minStock;
    originalMinStock.value = productData.minStock;
    localSafetyStock.value = state.safetyStock ?? null;
    originalSafetyStock.value = state.safetyStock ?? null;
    console.log("⚡ Datos de conteo cargados desde route state:", productData);
    return;
  }

  // Fallback: fetch de BD
  console.log("🔄 Sin state, cargando desde BD...");
  try {
    loading.value = true;
    const productId = route.params.productId;
    if (!productId) return;

    const productData = await inventoryStore.getProductDetails(productId);
    if (!productData) {
      console.error("No se pudo cargar el producto");
      return;
    }

    flow.setProductData(productId, productData);
    localMinStock.value = productData.minStock ?? null;
    originalMinStock.value = productData.minStock ?? null;
    localSafetyStock.value = productData.safetyStock ?? null;
    originalSafetyStock.value = productData.safetyStock ?? null;
    console.log("✅ Producto cargado desde BD:", productData);
  } catch (err) {
    console.error("❌ Error cargando producto:", err);
    showError("Error al cargar el producto");
  } finally {
    loading.value = false;
  }
};

// Guardar los cambios (stock físico y/o minStock)
const handleSave = async () => {
  try {
    saving.value = true;
    const productId = route.params.productId;
    const updates = {};

    // Si hay cambio de stock físico, guardar el conteo
    if (
      flow.countData.hasUserInput &&
      flow.countData.physicalStock !== null &&
      (Math.abs(Number(flow.countData.difference || 0)) > 0.0001 ||
        variantStockChanged.value)
    ) {
      await inventoryStore.saveInventoryCount({
        productId,
        productData: flow.countData.productData,
        physicalStock: Number(flow.countData.physicalStock || 0),
        digitalStock: Number(flow.countData.digitalStock || 0),
        difference: Number(flow.countData.difference || 0),
        hasVariants: Boolean(flow.countData.hasVariants),
        variantCounts: flow.countData.variantCounts || [],
      });

      // Si hubo faltante físico y está activo el registro como merma en P&L
      const diff = Number(flow.countData.difference || 0);
      if (diff < -0.0001 && recordShortageAsLoss.value) {
        let prodDetails = flow.countData.productData;
        if (prodDetails?.cost === undefined && prodDetails?.costStructure === undefined) {
          prodDetails = (await inventoryStore.getProductDetails(productId)) || prodDetails;
        }
        const unitCost = Number(
          prodDetails?.costStructure?.total || prodDetails?.cost || 0
        );
        const shortageQty = Math.abs(diff);
        if (unitCost > 0) {
          const lossRes = await recordInventoryLossTx({
            businessId: route.params.businessId,
            productId,
            productDescription: prodDetails?.description || "Producto",
            quantity: shortageQty,
            unit: prodDetails?.unit || "uni",
            unitCost,
            wasteReason: "count_shortage",
            notes: "Faltante detectado en conteo físico de inventario",
          });
          if (lossRes?.amount > 0) {
            toastWarning(
              `Faltante de S/ ${lossRes.amount.toFixed(2)} cargado a Mermas en P&L. Ver Estado de Resultados`,
              {
                duration: 4500,
                actionLink: {
                  text: "Ver Estado de Resultados",
                  route: `/business/${route.params.businessId}/income-statement`,
                },
              }
            );
          }
        }
      }
    }

    // Si hay cambio en minStock o safetyStock
    if (localMinStock.value !== originalMinStock.value) {
      updates.minStock = localMinStock.value;
    }
    if (localSafetyStock.value !== originalSafetyStock.value) {
      updates.safetyStock = localSafetyStock.value;
    }

    if (Object.keys(updates).length > 0) {
      await inventoryStore.updateProduct(productId, updates);
    }
    console.log("✅ Guardado:", updates);
    success("Cambios guardados correctamente");

    // Actualizar original para resetear el estado de "con cambios"
    if (updates.minStock !== undefined) {
      originalMinStock.value = localMinStock.value;
    }
    if (updates.safetyStock !== undefined) {
      originalSafetyStock.value = localSafetyStock.value;
    }

    setTimeout(() => {
      router.push({
        name: "InventoryProductDetails",
        params: {
          businessId: route.params.businessId,
          productId,
        },
        query: { refresh: Date.now() },
      });
    }, 1000);
  } catch (err) {
    console.error("❌ Error guardando:", err);
    showError("Error al guardar los cambios");
  } finally {
    saving.value = false;
  }
};

// Volver atrás
const goBack = () => {
  router.push({
    name: "InventoryProductDetails",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

onMounted(() => {
  console.log("📋 Vista InventoryCount montada");
  loadProductData();
});

onBeforeUnmount(() => {
  console.log("📋 Vista InventoryCount desmontada");
});
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
