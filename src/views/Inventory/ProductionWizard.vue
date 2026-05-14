<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <BackBtn :route-name="'InventoryDashboard'" tooltip-text="Volver al Inventario" />
    </div>

    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Producir Lote</h1>
      <p class="text-sm text-gray-500">
        Transforma insumos en un producto procesado o elaborado.
      </p>
    </div>

    <!-- Stepper -->
    <div class="flex justify-between items-center mb-8 relative">
      <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded"></div>
      <div 
        class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-purple-500 rounded transition-all duration-300"
        :style="{ width: progressWidth }"
      ></div>
      
      <!-- Step 1 -->
      <div class="relative z-10 flex flex-col items-center">
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors', step >= 1 ? 'bg-purple-600' : 'bg-gray-300']">1</div>
        <span class="text-xs font-medium mt-2" :class="step >= 1 ? 'text-purple-600' : 'text-gray-400'">Producto</span>
      </div>
      <!-- Step 2 -->
      <div class="relative z-10 flex flex-col items-center">
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors', step >= 2 ? 'bg-purple-600' : 'bg-gray-300']">2</div>
        <span class="text-xs font-medium mt-2" :class="step >= 2 ? 'text-purple-600' : 'text-gray-400'">Cantidad</span>
      </div>
      <!-- Step 3 -->
      <div class="relative z-10 flex flex-col items-center">
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors', step >= 3 ? 'bg-purple-600' : 'bg-gray-300']">3</div>
        <span class="text-xs font-medium mt-2" :class="step >= 3 ? 'text-purple-600' : 'text-gray-400'">Confirmar</span>
      </div>
    </div>

    <!-- Contenido del Wizard -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      
      <!-- STEP 1: Seleccionar Producto -->
      <div v-if="step === 1" class="space-y-6">
        <h2 class="text-xl font-semibold text-gray-800">¿Qué producto vas a preparar?</h2>
        <p class="text-sm text-gray-500">Busca y selecciona el producto o sub-receta que deseas producir en este lote.</p>
        
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

        <div v-if="selectedProduct" class="mt-6 p-4 border-2 border-purple-200 bg-purple-50 rounded-xl flex items-center justify-between">
          <div>
            <p class="font-bold text-gray-800 text-lg">{{ selectedProduct.description }}</p>
            <p class="text-sm text-gray-600">Stock Actual: <span class="font-semibold">{{ selectedProduct.stock }} {{ selectedProduct.unit }}</span></p>
          </div>
          <button @click="nextStep" class="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
            Continuar
          </button>
        </div>
      </div>

      <!-- STEP 2: Indicar Cantidad -->
      <div v-if="step === 2" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-800">Definir Cantidad a Producir</h2>
          <button @click="step = 1" class="text-sm text-gray-500 hover:text-gray-700 underline">Cambiar Producto</button>
        </div>
        
        <div class="p-6 bg-gray-50 rounded-xl border border-gray-200">
          <p class="text-sm font-medium text-gray-700 mb-2">Producto Seleccionado:</p>
          <p class="text-lg font-bold text-purple-700">{{ selectedProduct.description }}</p>
          
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">¿Cuánto vas a producir? (en {{ selectedProduct.unit }})</label>
            <input 
              v-model.number="productionQuantity"
              type="number" 
              min="0.1" 
              step="any"
              class="w-full sm:w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xl font-bold"
              placeholder="Ej: 5"
            />
          </div>
        </div>

        <div v-if="productionQuantity > 0" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-800 border-b pb-2">Materiales Necesarios</h3>
          
          <div v-if="materialsRequired.length === 0" class="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
            Este producto no tiene una receta/composición configurada. No se pueden deducir materiales.
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="mat in materialsRequired" :key="mat.productId" class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border" :class="mat.hasEnoughStock ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
              <div>
                <p class="font-semibold text-gray-800">{{ mat.description }}</p>
                <div class="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
                  <span>Requerido: <strong class="text-gray-700">{{ mat.quantityRequired.toFixed(2) }} {{ mat.unit }}</strong></span>
                  <span>Stock Actual: <strong>{{ mat.currentStock.toFixed(2) }} {{ mat.unit }}</strong></span>
                  <span v-if="mat.yieldFactor < 100" class="text-amber-600 font-medium">Rendimiento: {{ mat.yieldFactor }}%</span>
                </div>
              </div>
              <div class="mt-2 sm:mt-0">
                <span v-if="mat.hasEnoughStock" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Stock Suficiente</span>
                <span v-else class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">Faltan {{ Math.abs(mat.currentStock - mat.quantityRequired).toFixed(2) }} {{ mat.unit }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end pt-4">
            <button 
              @click="nextStep" 
              :disabled="!canProceed"
              :class="['px-6 py-3 font-medium rounded-xl transition-colors', canProceed ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed']"
            >
              Ver Resumen
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 3: Confirmación -->
      <div v-if="step === 3" class="space-y-6">
        <h2 class="text-xl font-semibold text-gray-800">Confirmar Producción</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <h3 class="text-sm font-semibold text-purple-800 uppercase tracking-wide mb-2">A Ingresar (Stock)</h3>
            <p class="text-3xl font-bold text-purple-700">{{ productionQuantity }} <span class="text-lg">{{ selectedProduct.unit }}</span></p>
            <p class="text-sm text-purple-600 mt-1">{{ selectedProduct.description }}</p>
            
            <div class="mt-4 pt-4 border-t border-purple-200">
              <p class="text-xs text-purple-500 uppercase tracking-wide font-semibold">Costo Total de Producción</p>
              <p class="text-xl font-bold text-purple-800">S/ {{ totalProductionCost.toFixed(2) }}</p>
              <p class="text-xs text-purple-600 mt-1">S/ {{ (totalProductionCost / productionQuantity).toFixed(2) }} por unidad</p>
            </div>
          </div>
          
          <div class="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Materiales a Descontar</h3>
            <ul class="space-y-3">
              <li v-for="mat in materialsRequired" :key="mat.productId" class="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                <span class="text-gray-700">{{ mat.description }}</span>
                <span class="font-semibold text-gray-900">-{{ mat.quantityRequired.toFixed(2) }} {{ mat.unit }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="flex items-center justify-between pt-6 border-t border-gray-100">
          <button @click="step = 2" class="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Atrás</button>
          <button 
            @click="confirmProduction" 
            :disabled="isProcessing"
            class="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2 shadow-md shadow-purple-200 disabled:opacity-50"
          >
            <span v-if="isProcessing">Procesando...</span>
            <span v-else>Confirmar y Producir</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { useInventoryStore } from '@/stores/inventoryStore';
import BackBtn from '@/components/ui/BackBtn.vue';
import SearchProductAsync from "@/components/basicAccountingRecordsBook/SearchProductAsync.vue";

const router = useRouter();
const { success, error: showError } = useToast();
const inventoryStore = useInventoryStore();

// State
const step = ref(1);
const selectedProduct = ref(null);
const productionQuantity = ref(null);
const isProcessing = ref(false);

const progressWidth = computed(() => {
  if (step.value === 1) return '0%';
  if (step.value === 2) return '50%';
  return '100%';
});

const materialsRequired = computed(() => {
  if (!selectedProduct.value || !selectedProduct.value.composition || !productionQuantity.value) return [];
  
  return selectedProduct.value.composition.map(mat => {
    // Cálculo cantidad neta
    const netQuantity = (mat.quantity || 0) * productionQuantity.value;
    // Cálculo cantidad bruta aplicando yieldFactor (si es 50%, necesito el doble)
    const yieldFactor = mat.yieldFactor || 100;
    const grossQuantity = netQuantity / (yieldFactor / 100);
    
    const currentStock = mat.stock || 0; 
    const costPerUnit = mat.costPerUnit || mat.cost || 0;
    const totalCost = grossQuantity * costPerUnit;

    return {
      productId: mat.productId,
      description: mat.description,
      unit: mat.unit || 'uni',
      quantityRequired: grossQuantity,
      currentStock: currentStock,
      hasEnoughStock: currentStock >= grossQuantity,
      yieldFactor: yieldFactor,
      cost: costPerUnit,
      totalCost: totalCost,
      trackStock: mat.trackStock !== false // Por defecto true
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

const totalProductionCost = computed(() => {
  return materialsRequired.value.reduce((sum, mat) => sum + mat.totalCost, 0);
});

// Methods
const handleProductSelected = async (product) => {
  try {
    const fullProduct = await inventoryStore.getProductDetails(product.uuid);
    
    if (!fullProduct.composition || fullProduct.composition.length === 0) {
      showError('El producto seleccionado no tiene una receta configurada.');
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
  }
};

const nextStep = () => {
  if (step.value < 3) step.value++;
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
