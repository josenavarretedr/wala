<script setup>
import { ref, computed, watch } from 'vue';
import { useFacilitatorStore } from '@/stores/facilitator';
import { useCostingCalculator } from '@/composables/useCostingCalculator';
import IngredientRow from '@/components/costing/IngredientRow.vue';
import AddIngredientSheet from '@/components/costing/AddIngredientSheet.vue';

const facilitatorStore = useFacilitatorStore();
const calc = useCostingCalculator();
const { formatMoney, formatPercent } = calc;

const products = computed(() => facilitatorStore.selectedCostingData?.products || []);
const activeIndex = computed(() => facilitatorStore.selectedCostingData?.activeProductIndex || 0);
const activeProduct = computed(() => products.value[activeIndex.value] || products.value[0]);
const fieldsList = computed(() => facilitatorStore.selectedSectionData?.fields || []);

// Modal de Insumos (Producción)
const isAddIngredientOpen = ref(false);
const ingredientBeingEdited = ref(null);

// Modal para Agregar Nuevo Producto
const isAddProductOpen = ref(false);
const newProductNameInput = ref('');

// Modal para Ajustar Sueldo y Mano de Obra (Servicios)
const isLaborModalOpen = ref(false);
const localLabor = ref({
  desiredMonthlySalary: 1200,
  daysWorkedPerMonth: 25,
  hoursWorkedPerDay: 8
});

// Modal para Agregar Suministro (Servicios)
const isAddSupplyOpen = ref(false);
const newSupply = ref({
  name: '',
  supplyType: 'single_use',
  packageCost: 20,
  unitsInPackage: 100,
  clientsYield: 30
});

// Campos locales reactivos para edición fluida de la matriz de tanda
const localName = ref('');
const localBatchSize = ref(10);
const localBatchUnit = ref('unidades');
const localFrequency = ref('semanal');
const localSalePrice = ref(0);
const localMonthlyVolume = ref(0);

// Campos locales para Servicios
const localDurationMinutes = ref(30);

// Campos locales para Comercio
const localCommerce = ref({
  purchasePresentation: 'Docena',
  unitsPerPackage: 12,
  packagePurchasePrice: 120,
  freightExpense: 10,
  totalItemsInTrip: 24,
  packagingCostPerUnit: 0.50
});

const BATCH_UNIT_OPTIONS = [
  { value: 'unidades', label: 'Unidades (u.)' },
  { value: 'porciones', label: 'Porciones' },
  { value: 'platos', label: 'Platos' },
  { value: 'paquetes', label: 'Paquetes' },
  { value: 'kilos', label: 'Kilos (kg)' },
  { value: 'litros', label: 'Litros (L)' }
];

const FREQUENCY_OPTIONS = [
  { value: 'diario', label: 'Diaria (24 tandas/mes)' },
  { value: 'interdiario', label: 'Interdiaria (12 tandas/mes)' },
  { value: 'semanal', label: 'Semanal (4 tandas/mes)' },
  { value: 'quincenal', label: 'Quincenal (2 tandas/mes)' },
  { value: 'mensual', label: 'Mensual (1 tanda/mes)' }
];

let lastSyncedKey = null;

// Sincronizar campos locales cuando cambia el producto activo
watch(
  () => activeProduct.value ? `${activeProduct.value.productId}-${activeIndex.value}` : null,
  (newKey) => {
    if (newKey && newKey !== lastSyncedKey) {
      lastSyncedKey = newKey;
      const prod = activeProduct.value;
      if (!prod) return;

      localName.value = prod.productName || '';
      localBatchSize.value = prod.batchConfig?.batchSize ?? 10;
      localBatchUnit.value = prod.batchConfig?.batchUnit || 'unidades';
      localFrequency.value = prod.batchConfig?.productionFrequency || 'semanal';
      localSalePrice.value = prod.commercialization?.currentSalePrice ?? prod.financialSummary?.salePrice ?? 0;
      localMonthlyVolume.value = prod.commercialization?.estimatedMonthlySalesVolume ?? 0;

      // Sincronizar servicio
      localDurationMinutes.value = prod.serviceConfig?.durationMinutes ?? 30;

      // Sincronizar comercio
      if (prod.commerceConfig) {
        localCommerce.value = {
          purchasePresentation: prod.commerceConfig.purchasePresentation || 'Docena',
          unitsPerPackage: prod.commerceConfig.unitsPerPackage ?? 12,
          packagePurchasePrice: prod.commerceConfig.packagePurchasePrice ?? 120,
          freightExpense: prod.commerceConfig.freightExpense ?? 10,
          totalItemsInTrip: prod.commerceConfig.totalItemsInTrip ?? 24,
          packagingCostPerUnit: prod.commerceConfig.packagingCostPerUnit ?? 0.50
        };
      }

      // Sincronizar mano de obra
      const labor = facilitatorStore.selectedCostingData?.serviceLaborSettings;
      if (labor) {
        localLabor.value = {
          desiredMonthlySalary: labor.desiredMonthlySalary ?? 1200,
          daysWorkedPerMonth: labor.daysWorkedPerMonth ?? 25,
          hoursWorkedPerDay: labor.hoursWorkedPerDay ?? 8
        };
      }
    }
  },
  { immediate: true }
);

function selectProduct(index) {
  facilitatorStore.setActiveCostingProductIndex(index);
}

function handleBatchInputsChange() {
  if (!activeProduct.value) return;
  facilitatorStore.updateFacilitatorProductBatch(activeIndex.value, {
    productName: localName.value,
    batchSize: Number(localBatchSize.value) || 1,
    batchUnit: localBatchUnit.value || 'unidades',
    productionFrequency: localFrequency.value,
    currentSalePrice: Number(localSalePrice.value) || 0,
    estimatedMonthlySalesVolume: Number(localMonthlyVolume.value) || 0
  });
}

function handleAutoSyncVolume() {
  const batches = calc.calculateBatchesPerMonth ? calc.calculateBatchesPerMonth(localFrequency.value) : 4;
  const capacity = (Number(localBatchSize.value) || 1) * batches;
  localMonthlyVolume.value = capacity;
  handleBatchInputsChange();
}

function openAddIngredientModal() {
  ingredientBeingEdited.value = null;
  isAddIngredientOpen.value = true;
}

function handleEditIngredient(ing) {
  ingredientBeingEdited.value = ing;
  isAddIngredientOpen.value = true;
}

function handleSaveIngredient(data) {
  if (ingredientBeingEdited.value) {
    facilitatorStore.updateFacilitatorCostingIngredient(activeIndex.value, data.ingredientId, data);
  } else {
    facilitatorStore.addFacilitatorCostingIngredient(activeIndex.value, data);
  }
  isAddIngredientOpen.value = false;
  ingredientBeingEdited.value = null;
}

function handleRemoveIngredient(ingId) {
  facilitatorStore.removeFacilitatorCostingIngredient(activeIndex.value, ingId);
}

// Gestión de productos (Agregar / Eliminar)
function handleOpenAddProductModal() {
  newProductNameInput.value = '';
  isAddProductOpen.value = true;
}

function handleConfirmAddProduct() {
  if (!newProductNameInput.value.trim()) return;
  facilitatorStore.addFacilitatorProduct(newProductNameInput.value.trim());
  isAddProductOpen.value = false;
  newProductNameInput.value = '';
}

function handleRemoveCurrentProduct() {
  if (!activeProduct.value) return;
  if (confirm(`¿Eliminar el producto "${activeProduct.value.productName}" de la propuesta del participante?`)) {
    facilitatorStore.removeFacilitatorProduct(activeIndex.value);
  }
}

// Métodos de Servicios
function handleServiceDurationChange() {
  if (!activeProduct.value) return;
  if (!activeProduct.value.serviceConfig) activeProduct.value.serviceConfig = {};
  activeProduct.value.serviceConfig.durationMinutes = Number(localDurationMinutes.value) || 1;
  facilitatorStore.recomputeFacilitatorProduct(activeIndex.value);
}

function handleSaveLaborSettings() {
  facilitatorStore.updateFacilitatorServiceLaborSettings(localLabor.value);
  isLaborModalOpen.value = false;
}

function handleOpenAddSupplyModal() {
  newSupply.value = {
    name: '',
    supplyType: 'single_use',
    packageCost: 20,
    unitsInPackage: 100,
    clientsYield: 30
  };
  isAddSupplyOpen.value = true;
}

function handleConfirmAddSupply() {
  if (!newSupply.value.name.trim()) return;
  facilitatorStore.addFacilitatorServiceSupply(activeIndex.value, newSupply.value);
  isAddSupplyOpen.value = false;
}

function handleRemoveSupply(supplyId) {
  facilitatorStore.removeFacilitatorServiceSupply(activeIndex.value, supplyId);
}

// Métodos de Comercio
function handleCommerceInputChange() {
  facilitatorStore.updateFacilitatorCommerceConfig(activeIndex.value, {
    purchasePresentation: localCommerce.value.purchasePresentation,
    unitsPerPackage: Number(localCommerce.value.unitsPerPackage) || 1,
    packagePurchasePrice: Number(localCommerce.value.packagePurchasePrice) || 0,
    freightExpense: Number(localCommerce.value.freightExpense) || 0,
    totalItemsInTrip: Number(localCommerce.value.totalItemsInTrip) || 1,
    packagingCostPerUnit: Number(localCommerce.value.packagingCostPerUnit) || 0
  });
}

function getNatureLabel(nature) {
  if (nature === 'servicio') return 'Servicios / Estilismo ("El Minutero")';
  if (nature === 'comercio') return 'Comercio / Reventa ("El Mayorista")';
  return 'Producción / Gastronomía ("La Casera vs. El Plato")';
}

function getNatureBadgeClass(nature) {
  if (nature === 'servicio') return 'bg-purple-100 text-purple-800 border-purple-200';
  if (nature === 'comercio') return 'bg-teal-100 text-teal-800 border-teal-200';
  return 'bg-amber-100 text-amber-800 border-amber-200';
}
</script>

<template>
  <div class="space-y-6">
    <!-- PESTAÑAS DE PRODUCTOS + BOTÓN AGREGAR PRODUCTO -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
      <div class="flex items-center gap-2 overflow-x-auto">
        <button
          v-for="(prod, idx) in products"
          :key="prod.productId || idx"
          type="button"
          @click="selectProduct(idx)"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border"
          :class="[
            activeIndex === idx
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          ]"
        >
          <span class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
            {{ idx + 1 }}
          </span>
          <span>{{ prod.productName || `Producto ${idx + 1}` }}</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="products.length < 5"
          type="button"
          @click="handleOpenAddProductModal"
          class="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          title="Agregar otro producto o plato a la propuesta"
        >
          <span>+</span>
          <span>Agregar Producto</span>
        </button>

        <button
          v-if="products.length > 1"
          type="button"
          @click="handleRemoveCurrentProduct"
          class="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
          title="Eliminar el producto seleccionado"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>

    <!-- SI NO HAY PRODUCTOS REGISTRADOS -->
    <div v-if="!activeProduct" class="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
      No se encontraron productos registrados en el módulo de costeo.
    </div>

    <!-- CONTENIDO DEL PRODUCTO ACTIVO -->
    <div v-else class="space-y-5">
      <!-- 1. IDENTIDAD Y NOMBRE DEL PRODUCTO -->
      <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span
              class="text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border font-mono"
              :class="getNatureBadgeClass(activeProduct.businessNature)"
            >
              {{ activeProduct.businessNature || 'produccion' }}
            </span>
            <span class="text-xs text-slate-300 font-medium hidden sm:inline">
              {{ getNatureLabel(activeProduct.businessNature) }}
            </span>
          </div>

          <div class="text-[11px] text-slate-400 font-medium">
            Producto {{ activeIndex + 1 }} de {{ products.length }}
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Nombre del Producto / Plato / Servicio:
          </label>
          <input
            v-model="localName"
            @input="handleBatchInputsChange"
            type="text"
            placeholder="Ej. Torta de Chocolate, Menú del Día, Corte de Cabello..."
            class="w-full text-base sm:text-lg font-black bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- 2. MATRIZ CUÁDRUPLE DE OPERACIÓN (INPUTS EDITABLES DE PANTALLA ANCHA) -->
      <div class="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>⚙️</span>
            <span>Parámetros Operativos de Producción y Venta</span>
          </h4>
          <span class="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Edición en Vivo
          </span>
        </div>

        <!-- REJILLA ADAPTADA A PANTALLA ANCHA (4 COLUMNAS EN DESKTOP) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          <!-- Columna 1: ¿Cuánto preparas por tanda? (Producción) o Duración (Servicio) -->
          <div v-if="activeProduct.businessNature === 'produccion' || !activeProduct.businessNature" class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <label class="text-[10px] uppercase font-bold text-slate-600 tracking-wider block">
              1. Tamaño de Tanda / Olla:
            </label>
            <div class="flex items-center gap-1.5">
              <input
                v-model.number="localBatchSize"
                @input="handleBatchInputsChange"
                type="number"
                min="1"
                class="w-20 px-2.5 py-2 text-sm font-black font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <select
                v-model="localBatchUnit"
                @change="handleBatchInputsChange"
                class="flex-1 px-2 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option v-for="opt in BATCH_UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <span class="text-[10px] text-slate-400 block">¿Cuántos platos salen en 1 tanda?</span>
          </div>

          <div v-else-if="activeProduct.businessNature === 'servicio'" class="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1.5">
            <label class="text-[10px] uppercase font-bold text-purple-900 tracking-wider block">
              1. Duración del Servicio:
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="localDurationMinutes"
                @input="handleServiceDurationChange"
                type="number"
                min="5"
                step="5"
                class="w-24 px-2.5 py-2 text-sm font-black font-mono text-purple-950 bg-white border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <span class="text-xs font-bold text-purple-900">minutos</span>
            </div>
            <span class="text-[10px] text-purple-700 block">Tiempo estimado por atención</span>
          </div>

          <div v-else class="p-3 bg-teal-50/60 border border-teal-200 rounded-xl space-y-1.5">
            <label class="text-[10px] uppercase font-bold text-teal-900 tracking-wider block">
              1. Unidades por Bulto / Paquete:
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="localCommerce.unitsPerPackage"
                @input="handleCommerceInputChange"
                type="number"
                min="1"
                class="w-24 px-2.5 py-2 text-sm font-black font-mono text-teal-950 bg-white border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <span class="text-xs font-bold text-teal-900">unidades</span>
            </div>
            <span class="text-[10px] text-teal-700 block">Prendas o piezas por bulto</span>
          </div>

          <!-- Columna 2: Precio de Venta Unitario -->
          <div class="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
            <label class="text-[10px] uppercase font-bold text-emerald-900 tracking-wider block">
              2. Precio de Venta al Público:
            </label>
            <div class="relative">
              <span class="absolute left-2.5 top-2 text-xs font-black text-emerald-700 font-mono">S/</span>
              <input
                v-model.number="localSalePrice"
                @input="handleBatchInputsChange"
                type="number"
                step="0.10"
                min="0"
                class="w-full pl-7 pr-3 py-2 text-sm font-black font-mono text-emerald-950 bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <span class="text-[10px] text-emerald-700 block">Precio cobrado al cliente final</span>
          </div>

          <!-- Columna 3: Frecuencia de Preparación -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <label class="text-[10px] uppercase font-bold text-slate-600 tracking-wider block">
              3. Frecuencia de Trabajo:
            </label>
            <select
              v-model="localFrequency"
              @change="handleBatchInputsChange"
              class="w-full px-2.5 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option v-for="freq in FREQUENCY_OPTIONS" :key="freq.value" :value="freq.value">
                {{ freq.label }}
              </option>
            </select>
            <span class="text-[10px] text-slate-400 block">Normalización mensual</span>
          </div>

          <!-- Columna 4: Ventas Estimadas / Mes con Auto-sincronización -->
          <div class="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[10px] uppercase font-bold text-blue-900 tracking-wider block">
                4. Ventas Est. / Mes:
              </label>
              <button
                type="button"
                @click="handleAutoSyncVolume"
                class="text-[10px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                title="Sincronizar automáticamente con la capacidad mensual"
              >
                Auto-sincronizar
              </button>
            </div>
            <input
              v-model.number="localMonthlyVolume"
              @input="handleBatchInputsChange"
              type="number"
              min="0"
              class="w-full px-2.5 py-2 text-sm font-black font-mono text-blue-950 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span class="text-[10px] text-blue-700 block font-semibold">
              Capacidad: {{ (Number(localBatchSize) || 1) * (calc.calculateBatchesPerMonth ? calc.calculateBatchesPerMonth(localFrequency) : 4) }} un/mes
            </span>
          </div>
        </div>
      </div>

      <!-- 3. TARJETAS DE KPIS FINANCIEROS CLAVE (GRANDES NÚMEROS SIN MIEDO) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <!-- KPI 1: Costo Directo Unitario -->
        <div class="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span class="text-[11px] font-bold text-slate-500 block">Costo Directo Unit.</span>
          <span class="text-lg sm:text-xl font-black text-slate-900 font-mono">
            {{ formatMoney(activeProduct.financialSummary?.directCostPerUnit || 0) }}
          </span>
          <span class="text-[10px] text-slate-400 block mt-0.5">Por plato, unidad o atención</span>
        </div>

        <!-- KPI 2: Precio de Venta -->
        <div class="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span class="text-[11px] font-bold text-slate-500 block">Precio de Venta</span>
          <span class="text-lg sm:text-xl font-black text-blue-700 font-mono">
            {{ formatMoney(activeProduct.commercialization?.currentSalePrice || activeProduct.financialSummary?.salePrice || 0) }}
          </span>
          <span class="text-[10px] text-slate-400 block mt-0.5">Al cliente final</span>
        </div>

        <!-- KPI 3: Margen Bruto % -->
        <div class="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span class="text-[11px] font-bold text-slate-500 block">Margen Bruto</span>
          <div class="flex items-baseline gap-1">
            <span
              class="text-lg sm:text-xl font-black font-mono"
              :class="(activeProduct.financialSummary?.grossMarginPercentage || 0) >= 40 ? 'text-emerald-600' : 'text-amber-600'"
            >
              {{ formatPercent(activeProduct.financialSummary?.grossMarginPercentage || 0) }}
            </span>
            <span class="text-xs text-slate-500 font-mono font-bold">
              ({{ formatMoney(activeProduct.financialSummary?.grossProfitPerUnit || 0) }})
            </span>
          </div>
          <span class="text-[10px] text-slate-400 block mt-0.5">Rentabilidad por unidad</span>
        </div>

        <!-- KPI 4: Ganancia Mensual Proyectada -->
        <div class="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span class="text-[11px] font-bold text-slate-500 block">Ganancia Bruta Mensual</span>
          <span class="text-lg sm:text-xl font-black text-emerald-700 font-mono">
            {{ formatMoney(activeProduct.financialSummary?.monthlyGrossProfitEstimate || 0) }}
          </span>
          <span class="text-[10px] text-slate-400 block mt-0.5">
            Volumen: {{ activeProduct.commercialization?.estimatedMonthlySalesVolume || 0 }} unid/mes
          </span>
        </div>
      </div>

      <!-- 4. DESGLOSE INTERACTIVO SEGÚN LA MODALIDAD -->

      <!-- CASO 1: PRODUCCIÓN / GASTRONOMÍA ("La Casera vs. El Plato") -->
      <div v-if="activeProduct.businessNature === 'produccion' || !activeProduct.businessNature" class="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs space-y-4">
        <!-- Banner de Tanda -->
        <div class="flex items-center justify-between bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">🥣</span>
            <div>
              <span class="font-bold text-amber-950 block">Configuración de Tanda Actual:</span>
              <span class="text-amber-900 font-medium">
                Tanda de <strong>{{ activeProduct.batchConfig?.batchSize || 1 }} {{ activeProduct.batchConfig?.batchUnit || 'unidades' }}</strong>
                &bull; Frecuencia: <strong>{{ activeProduct.batchConfig?.productionFrequency || 'semanal' }}</strong>
                (<strong>{{ activeProduct.batchConfig?.batchesPerMonth || 4 }} tandas/mes</strong>)
              </span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[11px] text-amber-900 font-bold block">Costo Directo por Tanda:</span>
            <span class="text-base font-black text-amber-950 font-mono">
              {{ formatMoney(activeProduct.financialSummary?.totalBatchDirectCost || 0) }}
            </span>
          </div>
        </div>

        <!-- LISTA DE INSUMOS CON BADGES SEMÁNTICOS IDÉNTICOS AL USUARIO -->
        <div class="space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🛒</span>
                <span>Insumos de Receta ("La Casera vs. El Plato")</span>
              </h4>
              <p class="text-[11px] text-slate-400">
                Badges de 2 niveles: Receta en Tanda (Ámbar) vs. Compra Casera (Azul) y Costo Unitario (Verde ℹ️)
              </p>
            </div>

            <button
              type="button"
              @click="openAddIngredientModal"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <span>+</span>
              <span>Agregar Insumo a la Receta</span>
            </button>
          </div>

          <!-- Estado Vacío -->
          <div v-if="!activeProduct.ingredients?.length" class="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
            <span class="text-3xl block">🍲</span>
            <p class="text-xs font-bold text-slate-700">No hay ingredientes registrados en esta tanda</p>
            <p class="text-[11px] text-slate-400 max-w-sm mx-auto">
              Pulsa en "Agregar Insumo a la Receta" para incorporar ingredientes con conversión automática de unidades.
            </p>
          </div>

          <!-- Filas de Insumos Renderizadas con IngredientRow -->
          <div v-else class="space-y-2.5">
            <IngredientRow
              v-for="(ing, idx) in activeProduct.ingredients"
              :key="ing.ingredientId || idx"
              :ingredient="ing"
              :index="idx + 1"
              :batch-size="Number(activeProduct.batchConfig?.batchSize) || 1"
              :batch-unit="activeProduct.batchConfig?.batchUnit || 'unidades'"
              @edit="handleEditIngredient"
              @remove="handleRemoveIngredient"
            />
          </div>
        </div>
      </div>

      <!-- CASO 2: SERVICIOS / ESTILISMO ("El Minutero") -->
      <div v-else-if="activeProduct.businessNature === 'servicio'" class="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs space-y-4">
        <!-- Parámetros de Mano de Obra y Tiempo -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3.5 text-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-purple-950 uppercase block">⏱️ Tarifa de Mano de Obra:</span>
              <button
                type="button"
                @click="isLaborModalOpen = true"
                class="text-[10px] text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
              >
                ✏️ Ajustar Sueldo
              </button>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-purple-900">Costo por Minuto:</span>
              <span class="font-black text-purple-950 font-mono text-sm">
                {{ formatMoney(activeProduct.serviceConfig?.costPerMinute || 0.10) }} / min
              </span>
            </div>
            <p class="text-[10px] text-purple-700">
              Sueldo deseado: S/ {{ localLabor.desiredMonthlySalary }} ({{ localLabor.daysWorkedPerMonth }} días x {{ localLabor.hoursWorkedPerDay }}h/día).
            </p>
          </div>

          <div class="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3.5 text-xs space-y-2">
            <span class="text-[11px] font-bold text-purple-950 uppercase block">✂️ Duración de Atención:</span>
            <div class="flex items-baseline justify-between">
              <span class="text-purple-900">Tiempo estimado:</span>
              <span class="font-black text-purple-950 font-mono text-sm">
                {{ activeProduct.serviceConfig?.durationMinutes || 0 }} minutos
              </span>
            </div>
            <div class="flex items-baseline justify-between pt-1 border-t border-purple-200">
              <span class="text-purple-900 font-bold">Costo de Tiempo en Servicio:</span>
              <span class="font-black text-purple-950 font-mono text-sm">
                {{ formatMoney(activeProduct.financialSummary?.timeCost || 0) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tabla de Suministros del Servicio -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🧴</span>
              <span>Suministros y Descartables ("El Minutero")</span>
            </h4>
            <button
              type="button"
              @click="handleOpenAddSupplyModal"
              class="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              + Agregar Suministro
            </button>
          </div>

          <div v-if="!activeProduct.serviceConfig?.supplies?.length" class="p-6 text-center text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
            No se han registrado suministros específicos para este servicio.
          </div>

          <div v-else class="overflow-x-auto border border-slate-200 rounded-xl">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <tr>
                  <th class="py-2.5 px-3">Suministro</th>
                  <th class="py-2.5 px-2">Tipo</th>
                  <th class="py-2.5 px-2 text-right">Precio Paquete</th>
                  <th class="py-2.5 px-2 text-right">Rendimiento</th>
                  <th class="py-2.5 px-3 text-right">Costo / Atención</th>
                  <th class="py-2.5 px-2 text-center w-12">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(sup, idx) in activeProduct.serviceConfig.supplies" :key="sup.supplyId || idx" class="hover:bg-slate-50/80">
                  <td class="py-2 px-3 font-semibold text-slate-900">{{ sup.name }}</td>
                  <td class="py-2 px-2 text-slate-600 text-[11px]">
                    {{ sup.supplyType === 'bottle_yield' ? 'Frasco Rendidor' : 'Descartable' }}
                  </td>
                  <td class="py-2 px-2 text-right text-slate-700 font-mono">{{ formatMoney(sup.packageCost || 0) }}</td>
                  <td class="py-2 px-2 text-right text-slate-600 font-mono">
                    {{ sup.supplyType === 'bottle_yield' ? `${sup.clientsYield} clientes` : `${sup.unitsInPackage} unid.` }}
                  </td>
                  <td class="py-2 px-3 text-right text-purple-950 font-black font-mono">
                    {{ formatMoney(sup.unitCost || 0) }}
                  </td>
                  <td class="py-2 px-2 text-center">
                    <button
                      type="button"
                      @click="handleRemoveSupply(sup.supplyId)"
                      class="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      title="Eliminar suministro"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-slate-50/90 font-bold border-t border-slate-200 text-slate-800">
                <tr>
                  <td colspan="4" class="py-2.5 px-3 text-right text-[11px] uppercase tracking-wider text-slate-500">
                    Costo Total Directo del Servicio:
                  </td>
                  <td colspan="2" class="py-2.5 px-3 text-right text-sm text-purple-900 font-black font-mono">
                    {{ formatMoney(activeProduct.financialSummary?.directCostPerUnit || 0) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- CASO 3: COMERCIO / REVENTA ("El Mayorista") -->
      <div v-else-if="activeProduct.businessNature === 'comercio'" class="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs space-y-4">
        <div class="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3.5 text-xs space-y-3">
          <span class="text-[11px] font-bold text-teal-950 uppercase block">📦 Estructura de Compra al por Mayor (Editable):</span>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="bg-white p-3 rounded-xl border border-teal-200 space-y-1.5">
              <span class="text-[10px] text-slate-500 block font-bold uppercase">1. Compra Mayorista:</span>
              <div class="space-y-1">
                <input
                  v-model="localCommerce.purchasePresentation"
                  @input="handleCommerceInputChange"
                  type="text"
                  placeholder="Bulto, Docena..."
                  class="w-full text-xs font-bold text-slate-800 border border-slate-300 rounded px-2 py-1"
                />
                <div class="flex items-center gap-1 text-xs">
                  <span>Precio:</span>
                  <input
                    v-model.number="localCommerce.packagePurchasePrice"
                    @input="handleCommerceInputChange"
                    type="number"
                    step="0.5"
                    class="w-20 text-xs font-mono font-bold border border-slate-300 rounded px-1 py-0.5"
                  />
                </div>
              </div>
              <span class="text-xs font-black text-teal-900 font-mono block pt-1 border-t border-slate-100">
                Base: {{ formatMoney(activeProduct.financialSummary?.baseUnitCost || 0) }}/u
              </span>
            </div>

            <div class="bg-white p-3 rounded-xl border border-teal-200 space-y-1.5">
              <span class="text-[10px] text-slate-500 block font-bold uppercase">2. Flete Prorrateado:</span>
              <div class="space-y-1 text-xs">
                <div class="flex items-center gap-1">
                  <span>Gasto Flete:</span>
                  <input
                    v-model.number="localCommerce.freightExpense"
                    @input="handleCommerceInputChange"
                    type="number"
                    step="1"
                    class="w-16 text-xs font-mono font-bold border border-slate-300 rounded px-1 py-0.5"
                  />
                </div>
                <div class="flex items-center gap-1">
                  <span>Prendas Viaje:</span>
                  <input
                    v-model.number="localCommerce.totalItemsInTrip"
                    @input="handleCommerceInputChange"
                    type="number"
                    min="1"
                    class="w-16 text-xs font-mono font-bold border border-slate-300 rounded px-1 py-0.5"
                  />
                </div>
              </div>
              <span class="text-xs font-black text-teal-900 font-mono block pt-1 border-t border-slate-100">
                + {{ formatMoney(activeProduct.financialSummary?.unitFreightCost || 0) }}/u
              </span>
            </div>

            <div class="bg-white p-3 rounded-xl border border-teal-200 space-y-1.5">
              <span class="text-[10px] text-slate-500 block font-bold uppercase">3. Empaque Unitario:</span>
              <div class="flex items-center gap-1 text-xs">
                <span>Bolsa/caja:</span>
                <input
                  v-model.number="localCommerce.packagingCostPerUnit"
                  @input="handleCommerceInputChange"
                  type="number"
                  step="0.1"
                  class="w-20 text-xs font-mono font-bold border border-slate-300 rounded px-1 py-0.5"
                />
              </div>
              <span class="text-xs font-black text-teal-900 font-mono block pt-1 border-t border-slate-100">
                + {{ formatMoney(activeProduct.commerceConfig?.packagingCostPerUnit || 0) }}/u
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-teal-200">
            <span class="text-xs font-bold text-teal-950">Costo Directo Comercial Unitario:</span>
            <span class="text-base font-black text-teal-950 font-mono">
              {{ formatMoney(activeProduct.financialSummary?.directCostPerUnit || 0) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 5. SECCIÓN DE FORMALIZACIÓN IA Y PROPUESTA TÉCNICA -->
      <div
        v-for="(field, index) in fieldsList"
        :key="field.fieldId"
        class="border border-blue-200 rounded-2xl p-5 bg-gradient-to-b from-white to-blue-50/20 shadow-2xs space-y-4"
      >
        <div class="flex items-center justify-between border-b border-blue-100 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">
              ★
            </span>
            <h3 class="text-xs font-black text-slate-900 uppercase tracking-wide">
              {{ field.label || 'Estructura de Costeo y Márgenes' }}
            </h3>
          </div>
          <span
            v-if="field.status === 'aprobado'"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"
          >
            ✓ Aprobado
          </span>
          <span
            v-else
            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900"
          >
            ⏳ Pendiente
          </span>
        </div>

        <!-- Notas del Facilitador -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-blue-900 uppercase flex items-center gap-1.5">
              <span>📝</span>
              <span>Notas / Observaciones Técnicas del Facilitador:</span>
            </span>
            <span class="text-[10px] text-blue-600 font-medium">Contexto para IA</span>
          </div>
          <textarea
            v-model="field.consultantNotes"
            rows="2"
            placeholder="Añade precisiones sobre precios de mercado, mermas o viabilidad de márgenes..."
            class="w-full rounded-xl border border-blue-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all leading-relaxed shadow-xs font-medium"
          ></textarea>
        </div>

        <!-- Botón de Síntesis IA -->
        <div>
          <button
            type="button"
            :disabled="facilitatorStore.refiningFields[field.fieldId]"
            @click="facilitatorStore.refineFieldWithAI(index)"
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border"
            :class="[
              facilitatorStore.refiningFields[field.fieldId]
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-transparent hover:shadow-md active:scale-99'
            ]"
          >
            <svg
              v-if="facilitatorStore.refiningFields[field.fieldId]"
              class="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span v-else>✨</span>
            <span>
              {{
                facilitatorStore.refiningFields[field.fieldId]
                  ? 'Generando resumen técnico de costeo...'
                  : '✨ Formalizar Resumen de Costeo con Asistente (Grok)'
              }}
            </span>
          </button>
        </div>

        <!-- Propuesta Formal Aprobada para el Plan de Negocios -->
        <div class="space-y-1.5 pt-0.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-violet-950 uppercase flex items-center gap-1.5">
              <span>🏛️</span>
              <span>Propuesta Formal para el Plan de Negocios:</span>
            </span>
            <span class="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
              Editable por Facilitador
            </span>
          </div>
          <textarea
            v-model="field.finalApprovedText"
            rows="4"
            placeholder="Redacción formal de la estructura de costeo, estrategia de precios y sostenibilidad financiera..."
            class="w-full rounded-xl border border-violet-300 bg-violet-50/20 p-3.5 text-xs text-slate-900 focus:bg-white focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all leading-relaxed shadow-xs font-medium"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- MODAL PARA AGREGAR / EDITAR INSUMO (PRODUCCIÓN) -->
    <AddIngredientSheet
      :is-open="isAddIngredientOpen"
      :batch-size="Number(activeProduct?.batchConfig?.batchSize) || 1"
      :batch-unit="activeProduct?.batchConfig?.batchUnit || 'unidades'"
      :ingredient-to-edit="ingredientBeingEdited"
      @save="handleSaveIngredient"
      @close="isAddIngredientOpen = false"
    />

    <!-- MODAL PARA AGREGAR NUEVO PRODUCTO -->
    <div
      v-if="isAddProductOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      @click.self="isAddProductOpen = false"
    >
      <div class="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-black text-slate-900">Agregar Nuevo Producto</h3>
          <button type="button" @click="isAddProductOpen = false" class="text-slate-400 hover:text-slate-700 text-sm">✕</button>
        </div>
        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-700 block">Nombre del Producto / Plato:</label>
          <input
            v-model="newProductNameInput"
            type="text"
            placeholder="Ej. Alfajores de Maicena..."
            class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            @keyup.enter="handleConfirmAddProduct"
          />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="isAddProductOpen = false"
            class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleConfirmAddProduct"
            :disabled="!newProductNameInput.trim()"
            class="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL PARA AJUSTAR MANO DE OBRA (SERVICIOS) -->
    <div
      v-if="isLaborModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      @click.self="isLaborModalOpen = false"
    >
      <div class="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-black text-slate-900">Ajustar Meta Salarial</h3>
          <button type="button" @click="isLaborModalOpen = false" class="text-slate-400 hover:text-slate-700 text-sm">✕</button>
        </div>
        <div class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Sueldo Mensual Deseado (S/):</label>
            <input
              v-model.number="localLabor.desiredMonthlySalary"
              type="number"
              step="50"
              class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Días Trabajados al Mes:</label>
            <input
              v-model.number="localLabor.daysWorkedPerMonth"
              type="number"
              min="1"
              max="31"
              class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Horas Trabajadas por Día:</label>
            <input
              v-model.number="localLabor.hoursWorkedPerDay"
              type="number"
              min="1"
              max="24"
              class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>
          <div class="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 font-bold flex justify-between items-center">
            <span>Nueva tarifa por minuto:</span>
            <span class="font-mono text-sm">
              S/ {{ (localLabor.desiredMonthlySalary / (localLabor.daysWorkedPerMonth * localLabor.hoursWorkedPerDay * 60)).toFixed(3) }}
            </span>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="isLaborModalOpen = false"
            class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleSaveLaborSettings"
            class="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
          >
            Guardar Tarifa
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL PARA AGREGAR SUMINISTRO (SERVICIOS) -->
    <div
      v-if="isAddSupplyOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      @click.self="isAddSupplyOpen = false"
    >
      <div class="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-black text-slate-900">Agregar Suministro al Servicio</h3>
          <button type="button" @click="isAddSupplyOpen = false" class="text-slate-400 hover:text-slate-700 text-sm">✕</button>
        </div>
        <div class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Nombre del Suministro:</label>
            <input
              v-model="newSupply.name"
              type="text"
              placeholder="Ej. Guantes de látex, Tinte, Crema..."
              class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
            />
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Tipo de Suministro:</label>
            <select
              v-model="newSupply.supplyType"
              class="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
            >
              <option value="single_use">Descartable (1 solo uso)</option>
              <option value="bottle_yield">Frasco Rendidor (rinde varios clientes)</option>
            </select>
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Precio del Paquete / Frasco (S/):</label>
            <input
              v-model.number="newSupply.packageCost"
              type="number"
              step="0.5"
              class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>
          <div v-if="newSupply.supplyType === 'bottle_yield'">
            <label class="font-bold text-slate-700 block mb-1">¿Para cuántos clientes rinde?</label>
            <input
              v-model.number="newSupply.clientsYield"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>
          <div v-else>
            <label class="font-bold text-slate-700 block mb-1">¿Cuántas piezas vienen en el paquete?</label>
            <input
              v-model.number="newSupply.unitsInPackage"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="isAddSupplyOpen = false"
            class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleConfirmAddSupply"
            :disabled="!newSupply.name.trim()"
            class="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold disabled:opacity-50"
          >
            Agregar Suministro
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
