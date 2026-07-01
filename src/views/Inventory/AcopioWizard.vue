<template>
  <div
    class="space-y-4 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-24 mt-4 relative"
  >
    <!-- HEADER (Indicator & Close) -->
    <div class="flex justify-end items-center gap-3 mb-3">
      <ProgressIndicator 
        :currentStep="step - 1" 
        :steps="['step1', 'step2', 'step3', 'step4']"
        active-color="bg-teal-600"
        counter-bg-color="bg-teal-50"
        counter-text-color="text-teal-600"
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
      <h1 v-if="step === 1" class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">¿Qué producto vas a acopiar?</h1>
      <h1 v-else-if="step === 2" class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Definir Cantidad y Precio</h1>
      <h1 v-else-if="step === 3" class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Asignar Socio / Proveedor</h1>
      <h1 v-else class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Confirmar Acopio</h1>
      
      <p class="text-sm text-gray-500">
        <span v-if="step === 1">Busca y selecciona el insumo o mercadería que vas a acopiar.</span>
        <span v-else-if="step === 2">Indica cuánto vas a acopiar y el precio acordado (estimado).</span>
        <span v-else-if="step === 3">Selecciona el socio a cargo de este acopio o registra uno nuevo.</span>
        <span v-else>Verifica el resumen final antes de ingresar el stock y generar la deuda.</span>
      </p>
    </div>

    <!-- Contenido del Wizard -->
    <div>
      <!-- STEP 1: Seleccionar Producto -->
      <div v-if="step === 1" class="space-y-6">
        <Suspense>
          <template #default>
            <SearchProductAsync 
              mode="acopio"
              placeholder="Buscar insumo o mercadería..."
              @product-selected="handleProductSelected"
            />
          </template>
          <template #fallback>
            <div class="p-4 text-center text-gray-500">
              <div class="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p>Cargando productos...</p>
            </div>
          </template>
        </Suspense>

        <div v-if="selectedProduct" class="mt-6 p-4 border border-teal-100 bg-teal-50/50 rounded-2xl flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-teal-600 uppercase tracking-wider">Seleccionado</span>
            <p class="font-bold text-gray-800 text-lg mt-0.5">{{ selectedProduct.description }}</p>
            <p class="text-sm text-gray-600 mt-0.5">Stock Actual: <span class="font-semibold">{{ selectedProduct.stock }} {{ selectedProduct.unit }}</span></p>
          </div>
          <div class="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- STEP 2: Cantidad y Precio acordado -->
      <div v-if="step === 2" class="space-y-6">
        <div class="p-6 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-center shadow-sm">
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Producto Seleccionado</p>
            <p class="text-2xl font-black text-teal-700 leading-tight">{{ selectedProduct.description }}</p>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="text-xs text-gray-500">Stock Actual:</span>
              <span class="text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                {{ selectedProduct.stock || 0 }} {{ selectedProduct.unit }}
              </span>
            </div>
          </div>
          
          <div class="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">¿Cuánto vas a acopiar? (en {{ selectedProduct.unit }})</label>
              <div class="relative">
                <input 
                  v-model.number="quantity"
                  type="number" 
                  min="0.01" 
                  step="any"
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xl font-extrabold text-gray-800 shadow-sm bg-white"
                  placeholder="0.00"
                  autofocus
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <span class="text-gray-400 font-bold text-sm">{{ selectedProduct.unit }}</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Precio acordado por unidad (estimado, opcional)</label>
              <div class="relative">
                <input 
                  v-model.number="agreedPrice"
                  type="number" 
                  min="0" 
                  step="any"
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xl font-extrabold text-gray-800 shadow-sm bg-white"
                  placeholder="0.00"
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <span class="text-gray-400 font-bold text-sm">S/</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="quantity > 0" class="p-4 bg-teal-50 rounded-xl border border-teal-100 flex justify-between items-center text-teal-900 font-semibold">
          <span>Monto Total Estimado:</span>
          <span class="text-2xl font-black">S/ {{ totalEstimatedAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- STEP 3: Seleccionar Socio / Proveedor -->
      <div v-if="step === 3" class="space-y-6">
        <!-- Socio Seleccionado -->
        <div v-if="selectedSupplier" class="max-w-lg mx-auto">
          <div class="p-4 rounded-xl border-2 border-teal-500 bg-teal-50 flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
                </svg>
              </div>
              <div class="text-left">
                <div class="font-bold text-gray-800">{{ selectedSupplier.name }}</div>
                <div v-if="selectedSupplier.phone" class="text-xs text-gray-500">📞 {{ selectedSupplier.phone }}</div>
                <div v-if="selectedSupplier.pendingBalance > 0" class="text-xs text-red-600 font-medium mt-0.5">Deuda acumulada: S/ {{ selectedSupplier.pendingBalance.toFixed(2) }}</div>
              </div>
            </div>
            <button @click="clearSupplier" class="text-teal-600 hover:text-teal-800 font-bold text-sm px-3 py-1 bg-white border border-teal-200 rounded-lg hover:shadow-sm transition-all">
              Cambiar
            </button>
          </div>
        </div>

        <!-- Búsqueda o Formulario de Registro -->
        <div v-else class="max-w-lg mx-auto space-y-4">
          <div v-if="!showCreateForm" class="space-y-4">
            <!-- Buscador -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="supplierSearchQuery"
                type="text"
                placeholder="Buscar socio por nombre o teléfono..."
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-all"
              />
            </div>

            <!-- Listado de socios filtrados -->
            <div v-if="filteredSuppliers.length > 0" class="space-y-2 max-h-60 overflow-y-auto pr-1">
              <button
                v-for="sup in filteredSuppliers"
                :key="sup.supplierId"
                @click="selectSupplier(sup)"
                class="w-full p-4 rounded-xl border border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 transition-all flex items-center justify-between text-left shadow-sm"
              >
                <div>
                  <div class="font-bold text-gray-800">{{ sup.name }}</div>
                  <div v-if="sup.phone" class="text-xs text-gray-500 mt-0.5">📞 {{ sup.phone }}</div>
                </div>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div v-else class="text-center py-6 text-gray-500 text-sm">
              No se encontraron socios/proveedores registrados.
            </div>

            <button
              @click="showCreateForm = true"
              class="w-full py-3 px-4 bg-teal-50 hover:bg-teal-100/70 text-teal-700 rounded-xl font-bold border border-dashed border-teal-300 transition-all flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Registrar nuevo socio (proveedor)
            </button>
          </div>

          <!-- Crear Socio -->
          <div v-else class="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 class="text-lg font-bold text-gray-800">Registrar Socio</h3>
            
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre / Razón Social *</label>
                <input
                  v-model="newSupplier.name"
                  type="text"
                  placeholder="Ej: Juan Perez (Socio)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Teléfono</label>
                <input
                  v-model="newSupplier.phone"
                  type="tel"
                  placeholder="Ej: 999888777"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button @click="showCreateForm = false" class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button 
                @click="registerNewSupplier" 
                :disabled="!newSupplier.name.trim() || isSubmitting"
                class="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ isSubmitting ? 'Registrando...' : 'Guardar y Seleccionar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 4: Confirmación -->
      <div v-if="step === 4" class="space-y-6">
        <div class="p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
          <div class="border-b border-gray-200 pb-3 flex justify-between items-center">
            <div>
              <p class="text-xs text-gray-500 uppercase font-semibold">Producto</p>
              <p class="text-xl font-bold text-teal-700">{{ selectedProduct.description }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 uppercase font-semibold">Cantidad</p>
              <p class="text-xl font-bold text-gray-900">{{ quantity }} {{ selectedProduct.unit }}</p>
            </div>
          </div>

          <div class="border-b border-gray-200 pb-3 flex justify-between items-center">
            <div>
              <p class="text-xs text-gray-500 uppercase font-semibold">Socio a cargo</p>
              <p class="text-lg font-bold text-gray-800">{{ selectedSupplier.name }}</p>
              <p v-if="selectedSupplier.phone" class="text-xs text-gray-500">Tel: {{ selectedSupplier.phone }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 uppercase font-semibold">Precio Pactado Unitario</p>
              <p class="text-lg font-bold text-gray-800">S/ {{ (agreedPrice || 0).toFixed(2) }}</p>
            </div>
          </div>

          <div class="flex justify-between items-center pt-2">
            <div>
              <span class="text-sm font-bold text-gray-700">Deuda por Liquidar:</span>
              <span v-if="agreedPrice === 0" class="text-xs bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded ml-2">Precio por definir</span>
            </div>
            <span class="text-2xl font-black text-teal-700">S/ {{ totalEstimatedAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
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
        v-if="step === 4"
        @click="confirmAcopio"
        :disabled="isProcessing"
        class="flex-1 py-3 px-4 sm:py-4 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-2 active:scale-[0.98]"
        :class="[
          isProcessing
            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 shadow-gray-400/15 cursor-not-allowed'
            : 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-teal-500/25 hover:from-teal-700 hover:to-teal-800 hover:scale-[1.02]'
        ]"
      >
        <div v-if="isProcessing" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        <svg v-else class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>{{ isProcessing ? 'Registrando...' : 'Confirmar y Acopiar' }}</span>
      </button>
      
      <button
        v-else
        @click="nextStep"
        :disabled="!canProceedNext"
        class="flex-1 py-3 px-4 sm:py-4 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-2 active:scale-[0.98]"
        :class="[
          canProceedNext
            ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-teal-500/25 hover:from-teal-700 hover:to-teal-800 hover:scale-[1.02]'
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
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useSupplierStore } from '@/stores/supplierStore';
import { useAcopioStore } from '@/stores/acopioStore';
import SearchProductAsync from "@/components/basicAccountingRecordsBook/SearchProductAsync.vue";
import ProgressIndicator from "@/components/ui/ProgressIndicator.vue";

const router = useRouter();
const route = useRoute();
const { success, error: showError } = useToast();

const inventoryStore = useInventoryStore();
const supplierStore = useSupplierStore();
const acopioStore = useAcopioStore();

// State
const step = ref(1);
const selectedProduct = ref(null);
const quantity = ref(null);
const agreedPrice = ref(null);
const selectedSupplier = ref(null);

const supplierSearchQuery = ref('');
const showCreateForm = ref(false);
const isSubmitting = ref(false);
const isProcessing = ref(false);

const newSupplier = ref({
  name: '',
  phone: ''
});

// Cargar proveedores al inicio
onMounted(async () => {
  const businessId = route.params.businessId;
  if (businessId) {
    await supplierStore.fetchSuppliers(businessId);
  }
});

const totalEstimatedAmount = computed(() => {
  return (Number(quantity.value) || 0) * (Number(agreedPrice.value) || 0);
});

const filteredSuppliers = computed(() => {
  const query = supplierSearchQuery.value.toLowerCase().trim();
  return supplierStore.suppliers.filter(s => 
    s.isActive && 
    s.isPartner === true && 
    (s.name.toLowerCase().includes(query) || (s.phone && s.phone.includes(query)))
  );
});

// Logic
const handleProductSelected = async (product) => {
  try {
    selectedProduct.value = await inventoryStore.getProductDetails(product.uuid);
    step.value = 2;
  } catch (err) {
    showError('Error al cargar detalles del producto');
  }
};

const selectSupplier = (supplier) => {
  selectedSupplier.value = supplier;
  supplierSearchQuery.value = '';
};

const clearSupplier = () => {
  selectedSupplier.value = null;
};

const registerNewSupplier = async () => {
  if (!newSupplier.value.name.trim()) return;

  isSubmitting.value = true;
  try {
    const created = await supplierStore.createSupplier({
      name: newSupplier.value.name,
      phone: newSupplier.value.phone,
      isPartner: true
    });
    success('Socio registrado y seleccionado con éxito');
    selectedSupplier.value = created;
    showCreateForm.value = false;
    newSupplier.value = { name: '', phone: '' };
  } catch (err) {
    showError('Error al registrar socio: ' + err.message);
  } finally {
    isSubmitting.value = false;
  }
};

const nextStep = () => {
  if (step.value < 4) step.value++;
};

const prevStep = () => {
  if (step.value > 1) step.value--;
};

const cancelWizard = () => {
  router.push({ name: 'InventoryDashboard' });
};

const canProceedNext = computed(() => {
  if (step.value === 1) {
    return !!selectedProduct.value;
  }
  if (step.value === 2) {
    return !!quantity.value && quantity.value > 0;
  }
  if (step.value === 3) {
    return !!selectedSupplier.value;
  }
  return true;
});

const confirmAcopio = async () => {
  isProcessing.value = true;
  try {
    const acopioPayload = {
      productId: selectedProduct.value.uuid,
      productDescription: selectedProduct.value.description,
      unit: selectedProduct.value.unit || 'uni',
      quantity: Number(quantity.value),
      agreedPrice: agreedPrice.value !== null && agreedPrice.value !== undefined ? Number(agreedPrice.value) : 0,
      supplierId: selectedSupplier.value.supplierId,
      supplierName: selectedSupplier.value.name
    };

    await acopioStore.registerNewAcopio(acopioPayload);
    success('Acopio registrado exitosamente');
    
    // Refrescar inventario local
    await inventoryStore.getItemsInInventory();
    
    // Redirigir al listado de acopios
    router.push({
      name: 'InventoryAcopioDashboard',
      params: { businessId: route.params.businessId }
    });
  } catch (err) {
    console.error(err);
    showError('Ocurrió un error al registrar el acopio');
  } finally {
    isProcessing.value = false;
  }
};
</script>
