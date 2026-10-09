<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm text-gray-500">Cargando información...</p>
    </div>

    <!-- Main Form View -->
    <div v-else class="space-y-6">
      <!-- Sub Header Navigation -->
      <div class="flex items-center justify-between mb-4">
        <BackBtn
          :route-name="'InventoryEditProductEconomicInfo'"
          :route-params="{
            businessId: route.params.businessId,
            productId: route.params.productId,
          }"
          tooltip-text="Volver a info económica"
        />
        <CloseBtn :custom-config="closeBtnConfig" @navigate="handleGoBack" />
      </div>

      <!-- Section Header Info -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl text-3xl mb-3">
          🛵
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
          Costos de Envases (Delivery)
        </h1>
        <p class="text-sm text-gray-500 uppercase tracking-wide font-semibold">
          {{ productName }}
        </p>
        <p class="text-xs text-gray-400 mt-2 max-w-md mx-auto">
          Define el empaque o insumos adicionales necesarios exclusivamente para tus entregas externas (Delivery y Para Llevar).
        </p>
      </div>

      <!-- Cost Summary Box -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-200 p-5 sm:p-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-500 tracking-wider uppercase">Costo Total de Envases</h3>
          <span class="bg-orange-50 text-orange-700 text-xs font-bold px-2 py-1 rounded-md border border-orange-200 flex items-center gap-1">
            💡 Solo Ventas Externas
          </span>
        </div>
        <div class="text-3xl font-extrabold text-orange-600">
          S/ {{ packagingTotal.toFixed(2) }}
        </div>
      </div>

      <!-- Action Card: Config Packaging -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mt-6">
        <!-- Buscador de envases -->
        <div class="mb-8" v-if="!selectedPackaging">
          <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span class="w-1 h-6 bg-orange-500 rounded-full"></span>
            Agregar envase al producto
          </h2>
          <Suspense>
            <template #default>
              <SearchProductAsync
                mode="materials"
                placeholder="Buscar envase en inventario..."
                @material-selected="handlePackagingSelected"
              />
            </template>
            <template #fallback>
              <div class="flex items-center justify-center py-6">
                <div class="text-center">
                  <div class="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p class="text-gray-500 text-sm">Cargando inventario...</p>
                </div>
              </div>
            </template>
          </Suspense>
        </div>

        <!-- Form to configure selected Packaging unit -->
        <Transition name="slide-fade">
          <div v-if="selectedPackaging" class="mb-8">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Envase Seleccionado</h2>
            <div class="bg-orange-50 rounded-2xl border-2 border-orange-200 p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1 min-w-0">
                  <h3 class="text-xl font-bold text-gray-800 mb-1 truncate">
                    {{ selectedPackaging.description }}
                  </h3>
                  <p v-if="selectedPackaging.stock !== undefined" class="text-sm text-gray-600">
                    📦 Stock actual: {{ selectedPackaging.stock }} {{ selectedPackaging.unit || 'uni' }}
                  </p>
                  <div class="text-sm text-orange-700 font-medium mt-1">
                    Costo Unitario: S/ {{ (selectedPackaging.cost || 0).toFixed(2) }}
                  </div>
                </div>
                <button
                  @click="cancelPackagingSelection"
                  class="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors shadow-sm border border-gray-100"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="flex flex-col sm:flex-row items-end gap-4 pt-2 border-t border-orange-100">
                <div class="flex-1 w-full">
                  <label class="block text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">
                    Cantidad requerida por venta
                  </label>
                  <input
                    ref="packagingQtyInput"
                    v-model.number="packagingQuantity"
                    type="number"
                    min="0.01"
                    step="any"
                    placeholder="Ej. 1"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-semibold shadow-sm"
                    @keyup.enter="handleAddPackaging"
                  />
                </div>
                <button
                  type="button"
                  @click="handleAddPackaging"
                  :disabled="!packagingQuantity || packagingQuantity <= 0"
                  class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold transition-all text-white flex items-center justify-center shadow-md active:scale-95"
                  :class="[
                    packagingQuantity && packagingQuantity > 0
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:scale-[1.01]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                  ]"
                >
                  + Agregar Envase
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Current Configured Packaging List -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span class="w-1 h-6 bg-orange-500 rounded-full"></span>
              Envases Configurados
            </h2>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-md">
              {{ packagingList.length }} {{ packagingList.length === 1 ? 'envase' : 'envases' }}
            </span>
          </div>

          <div v-if="packagingList.length > 0" class="space-y-3">
            <div
              v-for="pkg in packagingList"
              :key="pkg.productId"
              class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 group hover:border-orange-300 hover:shadow-sm transition-all duration-200"
            >
              <div class="flex items-center gap-4 flex-1 min-w-0 mb-3 sm:mb-0">
                <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:bg-orange-200 transition-colors flex-shrink-0">
                  📦
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-bold text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                    {{ pkg.description }}
                  </p>
                  <div class="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-0.5">
                    <span>{{ pkg.quantity }} {{ pkg.unit || 'uni' }}</span>
                    <span class="text-gray-300">•</span>
                    <span>Costo: S/ {{ (pkg.costPerUnit || 0).toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                <div class="text-right">
                  <span class="block text-[10px] text-gray-400 font-bold uppercase tracking-wide">Subtotal</span>
                  <span class="font-bold text-gray-900">
                    S/ {{ ((pkg.quantity || 0) * (pkg.costPerUnit || 0)).toFixed(2) }}
                  </span>
                </div>
                <button
                  type="button"
                  @click="handleRemovePackaging(pkg.productId)"
                  class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State Placeholder -->
          <div
            v-else-if="!selectedPackaging"
            class="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-2xl"
          >
            <div class="text-4xl mb-3 filter grayscale opacity-70">📭</div>
            <p class="text-base font-bold text-gray-600">Aún no has configurado envases</p>
            <p class="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Busca y selecciona productos del inventario que sirvan como envoltura o empaque para este artículo.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Persistent Bottom Save Action -->
    <div v-if="!loading" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl p-4 z-50 animate-slide-up">
      <div class="max-w-4xl mx-auto flex gap-3">
        <button
          @click="handleGoBack"
          class="flex-1 sm:flex-none sm:px-8 py-3.5 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          ← Volver
        </button>

        <button
          @click="handleSavePackaging"
          :disabled="savingPackaging || !packagingHasChanges"
          class="flex-1 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md"
          :class="[
            packagingHasChanges && !savingPackaging
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:scale-[1.01] active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none',
          ]"
        >
          <span v-if="!savingPackaging">💾 Guardar Envases</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando cambios...
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useInventory } from "@/composables/useInventory";
import { useToast } from "@/composables/useToast";
import BackBtn from "@/components/ui/BackBtn.vue";
import CloseBtn from "@/components/ui/CloseBtn.vue";
import SearchProductAsync from "@/components/basicAccountingRecordsBook/SearchProductAsync.vue";

// Router & Navigation
const route = useRoute();
const router = useRouter();

// Configuración para CloseBtn
const closeBtnConfig = {
  autoNavigate: false,
  navigationType: "back",
  tooltipText: "Cerrar",
};

// Composables & API
const { getProductById, updateProduct } = useInventory();
const toast = useToast();

// State Management
const productName = ref("Producto");
const loading = ref(true);
const savingPackaging = ref(false);

// Form & Selection State
const selectedPackaging = ref(null);
const packagingQuantity = ref(null);
const packagingQtyInput = ref(null);

// Core Data List
const packagingList = ref([]);
const packagingOriginalData = ref([]);

// Computeds
const packagingTotal = computed(() => {
  return packagingList.value.reduce((sum, pkg) => {
    return sum + (pkg.quantity || 0) * (pkg.costPerUnit || 0);
  }, 0);
});

const packagingHasChanges = computed(() => {
  return JSON.stringify(packagingList.value) !== JSON.stringify(packagingOriginalData.value);
});

// Life Cycle
onMounted(async () => {
  await loadProductData();
});

// Route protection for unsaved changes
onBeforeRouteLeave((to, from, next) => {
  if (packagingHasChanges.value) {
    const confirmLeave = window.confirm(
      "¿Seguro que deseas salir?\n\nTienes cambios pendientes sin guardar en tus envases que se perderán."
    );
    if (confirmLeave) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

// Logic Operations
async function loadProductData() {
  try {
    loading.value = true;
    const productId = route.params.productId;

    if (!productId) {
      toast.error("Error: ID de producto no definido");
      return;
    }

    const product = await getProductById(productId);

    if (product) {
      productName.value = product.description || "Sin nombre";
      
      // Populate existing configuration if saved in the deliveryConfig field
      if (product.deliveryConfig?.packaging && Array.isArray(product.deliveryConfig.packaging)) {
        packagingList.value = JSON.parse(JSON.stringify(product.deliveryConfig.packaging));
        packagingOriginalData.value = JSON.parse(JSON.stringify(product.deliveryConfig.packaging));
      } else {
        packagingList.value = [];
        packagingOriginalData.value = [];
      }
    }
  } catch (error) {
    console.error("❌ Error cargando producto para envases:", error);
    toast.error("No se pudo cargar los datos del producto");
  } finally {
    loading.value = false;
  }
}

const handlePackagingSelected = async (material) => {
  selectedPackaging.value = {
    productId: material.uuid,
    description: material.description,
    cost: material.cost || 0,
    unit: material.unit || "uni",
    stock: material.stock ?? undefined,
  };

  packagingQuantity.value = 1; // Default to 1

  await nextTick();
  if (packagingQtyInput.value) {
    packagingQtyInput.value.focus();
    packagingQtyInput.value.select();
  }
};

const handleAddPackaging = () => {
  if (!selectedPackaging.value || !packagingQuantity.value || packagingQuantity.value <= 0) return;

  // Prevent duplicates in the delivery configuration
  const exists = packagingList.value.some(p => p.productId === selectedPackaging.value.productId);
  if (exists) {
    toast.warning(`${selectedPackaging.value.description} ya se encuentra configurado.`);
    return;
  }

  packagingList.value.push({
    productId: selectedPackaging.value.productId,
    description: selectedPackaging.value.description,
    quantity: parseFloat(packagingQuantity.value),
    unit: selectedPackaging.value.unit,
    costPerUnit: selectedPackaging.value.cost,
  });

  toast.success(`${selectedPackaging.value.description} agregado`);
  cancelPackagingSelection();
};

const cancelPackagingSelection = () => {
  selectedPackaging.value = null;
  packagingQuantity.value = null;
};

const handleRemovePackaging = (productId) => {
  const pkg = packagingList.value.find((item) => item.productId === productId);
  if (!pkg) return;

  if (confirm(`¿Eliminar "${pkg.description}" de la configuración de envío?`)) {
    packagingList.value = packagingList.value.filter(
      (item) => item.productId !== productId
    );
    toast.info("Envase removido de la lista");
  }
};

const handleSavePackaging = async () => {
  if (!packagingHasChanges.value) return;

  savingPackaging.value = true;

  try {
    const productId = route.params.productId;

    const updatePayload = {
      "deliveryConfig.packaging": packagingList.value.map((pkg) => ({
        productId: pkg.productId,
        description: pkg.description,
        quantity: pkg.quantity,
        unit: pkg.unit,
        costPerUnit: pkg.costPerUnit,
      })),
      "deliveryConfig.packagingTotalCost": parseFloat(packagingTotal.value.toFixed(2)),
    };

    await updateProduct(productId, updatePayload);

    // Reset modification detection base
    packagingOriginalData.value = JSON.parse(JSON.stringify(packagingList.value));

    toast.success("✅ Configuración de Envases guardada exitosamente");
  } catch (error) {
    console.error("❌ Error guardando configuración de envases:", error);
    toast.error("Ocurrió un error al guardar los envases");
  } finally {
    savingPackaging.value = false;
  }
};

const handleGoBack = () => {
  router.push({
    name: "InventoryEditProductEconomicInfo",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
