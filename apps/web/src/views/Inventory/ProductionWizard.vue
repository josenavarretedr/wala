<template>
  <div
    class="space-y-4 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-24 mt-4 relative"
  >
    <!-- HEADER (Indicator & Close) -->
    <div class="flex justify-end items-center gap-3 mb-3">
      <ProgressIndicator 
        :currentStep="step - 1" 
        :steps="['step1', 'step2', 'step3']"
        active-color="bg-blue-600"
        counter-bg-color="bg-blue-50"
        counter-text-color="text-blue-600"
      />

      <!-- Close button that returns to Inventory -->
      <button
        @click="cancelWizard"
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="Cancelar flujo"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Centered Title Section -->
    <div class="text-center mb-8 px-4">
      <h1 v-if="step === 1" class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">¿Qué producto vas a preparar?</h1>
      <h1 v-else-if="step === 2" class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Definir Cantidad a Producir</h1>
      <h1 v-else class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Confirmar Producción</h1>
      
      <p class="text-sm text-gray-500">
        <span v-if="step === 1">Busca y selecciona el producto o sub-receta que deseas producir en este lote.</span>
        <span v-else-if="step === 2">Indica cuánto vas a producir y revisa la disponibilidad de materiales.</span>
        <span v-else>Verifica el resumen final antes de descontar materiales e ingresar el stock.</span>
      </p>
    </div>

    <!-- Contenido del Wizard -->
    <div>
      <!-- Loading State for fetching product/composition details -->
      <div v-if="isProductLoading" class="flex flex-col justify-center items-center py-16 space-y-4 bg-gray-50/50 border border-gray-100 rounded-3xl">
        <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <div class="text-center space-y-1">
          <p class="text-base font-bold text-gray-700">Cargando Receta</p>
          <p class="text-xs text-gray-500 px-6">Obteniendo composición del producto y calculando disponibilidad de materiales...</p>
        </div>
      </div>

      <template v-else>
        <!-- STEP 1: Seleccionar Producto -->
        <div v-if="step === 1" class="space-y-6">
          <Suspense>
            <template #default>
              <SearchProductAsync 
                mode="production"
                placeholder="Buscar producto a producir..."
                @product-selected="handleProductSelected"
              />
            </template>
            <template #fallback>
              <div class="p-4 text-center text-gray-500">
                <div class="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p>Cargando productos...</p>
              </div>
            </template>
          </Suspense>

          <div v-if="selectedProduct" class="mt-6 p-4 border border-purple-100 bg-purple-50/50 rounded-2xl flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-purple-600 uppercase tracking-wider">Seleccionado</span>
              <p class="font-bold text-gray-800 text-lg mt-0.5">{{ selectedProduct.description }}</p>
              <p class="text-sm text-gray-600 mt-0.5">Stock Actual: <span class="font-semibold">{{ selectedProduct.stock }} {{ selectedProduct.unit }}</span></p>
            </div>
            <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- STEP 2: Indicar Cantidad (Optimized Layout - 2 Columns) -->
        <div v-if="step === 2" class="space-y-6">
          <div class="p-6 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-center shadow-sm">
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Producto Seleccionado</p>
              <p class="text-2xl font-black text-purple-700 leading-tight">{{ selectedProduct.description }}</p>
              <div class="flex items-center gap-2 mt-1.5">
                <span class="text-xs text-gray-500">Stock Actual:</span>
                <span class="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {{ selectedProduct.stock || 0 }} {{ selectedProduct.unit }}
                </span>
              </div>
            </div>
            
            <div class="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
              <label class="block text-sm font-bold text-gray-700 mb-2">¿Cuánto vas a producir? (en {{ selectedProduct.unit }})</label>
              <div class="relative">
                <input 
                  v-model.number="productionQuantity"
                  type="number" 
                  min="0.1" 
                  step="any"
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xl font-extrabold text-gray-800 shadow-sm bg-white"
                  placeholder="0.00"
                  autofocus
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <span class="text-gray-400 font-bold text-sm">{{ selectedProduct.unit }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="productionQuantity > 0" class="space-y-4">
            <h3 class="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              Materiales Necesarios
            </h3>
            
            <div v-if="materialsRequired.length === 0" class="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
              Este producto no tiene una receta/composición configurada. No se pueden deducir materiales.
            </div>
            
            <div v-else class="grid grid-cols-1 gap-3">
              <div v-for="mat in materialsRequired" :key="mat.productId" 
                class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border transition-all shadow-sm" 
                :class="!mat.trackStock ? 'border-slate-200 bg-slate-50/50' : (mat.hasEnoughStock ? 'border-green-200 bg-green-50/70' : 'border-red-200 bg-red-50/70')"
              >
                <div>
                  <p class="font-bold text-gray-800">{{ mat.description }}</p>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                    <span>Requerido: <strong class="text-gray-700">{{ mat.quantityRequired.toFixed(2) }} {{ mat.unit }}</strong></span>
                    <span v-if="mat.trackStock">Stock Actual: <strong>{{ mat.currentStock.toFixed(2) }} {{ mat.unit }}</strong></span>
                    <span v-else class="text-slate-400 italic">(Sin control de stock)</span>
                    <span v-if="mat.yieldFactor < 100" class="text-amber-600 font-bold">Rendimiento: {{ mat.yieldFactor }}%</span>
                  </div>
                </div>
                <div class="mt-2 sm:mt-0 flex-shrink-0">
                  <template v-if="mat.trackStock">
                    <span v-if="mat.hasEnoughStock" class="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-xs font-black tracking-wide uppercase border border-green-200">Stock Suficiente</span>
                    <span v-else class="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-xs font-black tracking-wide uppercase border border-red-200">Faltan {{ Math.abs(mat.currentStock - mat.quantityRequired).toFixed(2) }} {{ mat.unit }}</span>
                  </template>
                  <template v-else>
                    <span class="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-black tracking-wide uppercase border border-slate-300">No requiere stock</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 3: Confirmación (Homogeneizado con Step 2) -->
        <div v-if="step === 3" class="space-y-6">
          <div class="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div class="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <p class="text-sm font-medium text-gray-700 mb-1">Producto Seleccionado:</p>
                <p class="text-lg font-bold text-purple-700">{{ selectedProduct.description }}</p>
              </div>
              <div class="sm:text-right">
                <p class="text-sm font-medium text-gray-700 mb-1">Cantidad a Producir:</p>
                <p class="text-xl font-bold text-gray-900">{{ productionQuantity }} {{ selectedProduct.unit }}</p>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Costo Total de Producción</p>
                <p class="text-xl font-bold text-purple-700">S/ {{ totalProductionCost.toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Costo Unitario</p>
                <p class="text-lg font-semibold text-gray-800">S/ {{ (totalProductionCost / productionQuantity).toFixed(2) }} por {{ selectedProduct.unit }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-800 border-b pb-2 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              Resumen de Materiales
            </h3>
            <div class="space-y-3">
              <div v-for="mat in materialsRequired" :key="mat.productId" 
                class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border transition-all shadow-sm"
                :class="!mat.trackStock ? 'border-slate-200 bg-slate-50/50' : (mat.hasEnoughStock ? 'border-green-200 bg-green-50/70' : 'border-red-200 bg-red-50/70')"
              >
                <div>
                  <p class="font-bold text-gray-800">{{ mat.description }}</p>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                    <span>Requerido: <strong class="text-gray-700">{{ mat.quantityRequired.toFixed(2) }} {{ mat.unit }}</strong></span>
                    <span v-if="mat.trackStock">Stock Actual: <strong>{{ mat.currentStock.toFixed(2) }} {{ mat.unit }}</strong></span>
                    <span v-else class="text-slate-400 italic">(Sin control de stock)</span>
                    <span v-if="mat.yieldFactor < 100" class="text-amber-600 font-bold">Rendimiento: {{ mat.yieldFactor }}%</span>
                  </div>
                </div>
                <div class="mt-2 sm:mt-0 flex-shrink-0">
                  <template v-if="mat.trackStock">
                    <span v-if="mat.hasEnoughStock" class="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-xs font-black tracking-wide uppercase border border-green-200">Stock Suficiente</span>
                    <span v-else class="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-xs font-black tracking-wide uppercase border border-red-200">Insuficiente</span>
                  </template>
                  <template v-else>
                    <span class="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-black tracking-wide uppercase border border-slate-300">No requiere stock</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- Botones de Navegación Fijos al Final -->
  <div
    class="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-xl border-t border-gray-100"
  >
    <div class="flex flex-row justify-center items-stretch gap-3 sm:gap-4 max-w-2xl mx-auto">
      <!-- Botón Atrás -->
      <button
        @click="prevStep"
        :disabled="step === 1"
        class="flex-1 py-3 px-4 sm:py-4 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-2 active:scale-[0.98]"
        :class="[
          step === 1
            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 shadow-gray-400/15 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/25 hover:from-gray-600 hover:to-gray-700'
        ]"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        <span>Atrás</span>
      </button>

      <!-- Botón Siguiente / Confirmar -->
      <button
        v-if="step === 3"
        @click="confirmProduction"
        :disabled="isProcessing"
        class="flex-1 py-3 px-4 sm:py-4 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-2 active:scale-[0.98]"
        :class="[
          isProcessing
            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 shadow-gray-400/15 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/25 hover:from-purple-700 hover:to-purple-800 hover:scale-[1.02]'
        ]"
      >
        <div v-if="isProcessing" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        <svg v-else class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>{{ isProcessing ? 'Procesando...' : 'Confirmar y Producir' }}</span>
      </button>
      
      <button
        v-else
        @click="nextStep"
        :disabled="!canProceedNext"
        class="flex-1 py-3 px-4 sm:py-4 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-2 active:scale-[0.98]"
        :class="[
          canProceedNext
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/25 hover:from-purple-700 hover:to-purple-800 hover:scale-[1.02]'
            : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 shadow-gray-400/15 cursor-not-allowed'
        ]"
      >
        <span>Continuar</span>
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { useInventoryStore } from '@/stores/inventoryStore';
import SearchProductAsync from "@/components/basicAccountingRecordsBook/SearchProductAsync.vue";
import ProgressIndicator from "@/components/ui/ProgressIndicator.vue";

const router = useRouter();
const { success, error: showError } = useToast();
const inventoryStore = useInventoryStore();

// State
const step = ref(1);
const selectedProduct = ref(null);
const productionQuantity = ref(null);
const isProcessing = ref(false);
const isProductLoading = ref(false);

const materialsRequired = computed(() => {
  if (!selectedProduct.value || !selectedProduct.value.composition || !productionQuantity.value) return [];
  
  return selectedProduct.value.composition.map(mat => {
    // Cálculo cantidad neta
    const netQuantity = (mat.quantity || 0) * productionQuantity.value;
    // Cálculo cantidad bruta aplicando yieldFactor (si es 50%, necesito el doble)
    const yieldFactor = mat.yieldFactor || 100;
    // Redondear a 2 decimales para evitar problemas de precisión en UI y stock log
    const grossQuantity = Math.round((netQuantity / (yieldFactor / 100) + Number.EPSILON) * 100) / 100;
    
    const currentStock = mat.stock || 0; 
    const costPerUnit = mat.costPerUnit || mat.cost || 0;
    // Redondear totalCost de insumos a 2 decimales
    const totalCost = Math.round((grossQuantity * costPerUnit + Number.EPSILON) * 100) / 100;

    const isTrackStock = mat.trackStock !== false; // Por defecto true
    
    return {
      productId: mat.productId,
      description: mat.description,
      unit: mat.unit || 'uni',
      quantityRequired: grossQuantity,
      currentStock: currentStock,
      hasEnoughStock: !isTrackStock ? true : (currentStock >= grossQuantity),
      yieldFactor: yieldFactor,
      cost: costPerUnit,
      totalCost: totalCost,
      trackStock: isTrackStock
    };
  });
});

const canProceed = computed(() => {
  if (step.value === 2) {
    if (!productionQuantity.value || productionQuantity.value <= 0) return false;
    if (materialsRequired.value.length === 0) return false;
    return true;
  }
  return true;
});

const canProceedNext = computed(() => {
  if (step.value === 1) {
    return !!selectedProduct.value;
  }
  if (step.value === 2) {
    return canProceed.value;
  }
  return true;
});

const totalProductionCost = computed(() => {
  const rawSum = materialsRequired.value.reduce((sum, mat) => sum + mat.totalCost, 0);
  return Math.round((rawSum + Number.EPSILON) * 100) / 100;
});

// Methods
const handleProductSelected = async (product) => {
  isProductLoading.value = true;
  try {
    const fullProduct = await inventoryStore.getProductDetails(product.uuid);
    
    if (!fullProduct.composition || fullProduct.composition.length === 0) {
      showError('El producto seleccionado no tiene una receta configurada.');
      isProductLoading.value = false;
      return;
    }

    // Enriquecer la composición con el stock actual de cada insumo
    const enrichedComposition = await Promise.all(fullProduct.composition.map(async (mat) => {
      const matDetails = await inventoryStore.getProductDetails(mat.productId);
      return {
        ...mat,
        stock: matDetails ? matDetails.stock : 0,
        trackStock: matDetails ? matDetails.trackStock : true
      };
    }));

    selectedProduct.value = {
      ...fullProduct,
      composition: enrichedComposition
    };
    
    step.value = 2;
  } catch (err) {
    showError('Error al cargar los detalles del producto');
  } finally {
    isProductLoading.value = false;
  }
};

const nextStep = () => {
  if (step.value < 3) step.value++;
};

const prevStep = () => {
  if (step.value > 1) step.value--;
};

const cancelWizard = () => {
  router.push({ name: 'InventoryDashboard' });
};

const confirmProduction = async () => {
  isProcessing.value = true;
  try {
    const materialsPayload = materialsRequired.value.map(mat => ({
      productId: mat.productId,
      quantityToDeduct: mat.quantityRequired,
      cost: mat.cost,
      trackStock: mat.trackStock
    }));

    await inventoryStore.produceBatch(
      selectedProduct.value.uuid,
      productionQuantity.value,
      materialsPayload,
      totalProductionCost.value
    );

    success('Lote producido exitosamente');
    router.back();
  } catch (err) {
    showError('Ocurrió un error al producir el lote');
  } finally {
    isProcessing.value = false;
  }
};
</script>

