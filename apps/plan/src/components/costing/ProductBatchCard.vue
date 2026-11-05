<script setup>
import { ref, computed, watch } from 'vue';
import { useCostingStore } from '@/stores/costing';
import { useCostingCalculator } from '@/composables/useCostingCalculator';
import CommerceCostingSection from './CommerceCostingSection.vue';
import ServiceCostingSection from './ServiceCostingSection.vue';

const costingStore = useCostingStore();
const { formatMoney } = useCostingCalculator();

const newProductName = ref('');
const showAddModal = ref(false);

const activeProduct = computed(() => costingStore.activeProduct);
const products = computed(() => costingStore.products);
const canAdd = computed(() => costingStore.canAddMoreProducts);

// Campos locales reactivos para edición inmediata fluida en modo producción
const localName = ref('');
const localBatchSize = ref(1);
const localBatchUnit = ref('unidad');
const localFrequency = ref('semanal');
const localSalePrice = ref(0);
const localMonthlyVolume = ref(0);

let currentLoadedKey = null;

watch(
  () => (activeProduct.value ? `${activeProduct.value.productId}-${activeProduct.value.businessNature}` : null),
  (newKey) => {
    if (newKey && newKey !== currentLoadedKey) {
      currentLoadedKey = newKey;
      const prod = activeProduct.value;
      localName.value = prod.productName ?? '';
      localBatchSize.value = prod.batchConfig?.batchSize ?? 10;
      localBatchUnit.value = prod.batchConfig?.batchUnit === 'unidad' ? 'unidades' : (prod.batchConfig?.batchUnit ?? 'unidades');
      localFrequency.value = prod.batchConfig?.productionFrequency ?? 'semanal';
      localSalePrice.value = prod.commercialization?.currentSalePrice ?? 0;

      const batches = costingStore.calc?.calculateBatchesPerMonth
        ? costingStore.calc.calculateBatchesPerMonth(localFrequency.value)
        : (localFrequency.value === 'diario' ? 24 : localFrequency.value === 'interdiario' ? 12 : localFrequency.value === 'quincenal' ? 2 : localFrequency.value === 'mensual' ? 1 : 4);
      const cap = (Number(localBatchSize.value) || 1) * batches;

      const savedVol = prod.commercialization?.estimatedMonthlySalesVolume;
      localMonthlyVolume.value = (savedVol !== undefined && savedVol !== null && savedVol > 0)
        ? savedVol
        : cap;
    }
  },
  { immediate: true }
);

function handleSelectProduct(prodId) {
  costingStore.setActiveProduct(prodId);
}

function handleOpenAddModal() {
  newProductName.value = '';
  showAddModal.value = true;
}

async function handleAddProduct() {
  if (!newProductName.value.trim()) return;
  await costingStore.addProduct(newProductName.value.trim());
  newProductName.value = '';
  showAddModal.value = false;
}

async function handleRemoveCurrentProduct() {
  if (!activeProduct.value) return;
  if (confirm(`¿Eliminar el producto "${activeProduct.value.productName}" y todos sus insumos?`)) {
    await costingStore.removeProduct(activeProduct.value.productId);
  }
}

const monthlyBatchesCount = computed(() => {
  return costingStore.calc?.calculateBatchesPerMonth
    ? costingStore.calc.calculateBatchesPerMonth(localFrequency.value)
    : (localFrequency.value === 'diario' ? 24 : localFrequency.value === 'interdiario' ? 12 : localFrequency.value === 'quincenal' ? 2 : localFrequency.value === 'mensual' ? 1 : 4);
});

const monthlyUnitsCapacity = computed(() => {
  return (Number(localBatchSize.value) || 1) * monthlyBatchesCount.value;
});

function saveBatchConfig() {
  if (!activeProduct.value) return;
  costingStore.updateProductBatch(activeProduct.value.productId, {
    productName: localName.value,
    batchSize: Number(localBatchSize.value) || 1,
    batchUnit: localBatchUnit.value || 'unidades',
    productionFrequency: localFrequency.value,
    batchesPerMonth: monthlyBatchesCount.value,
    currentSalePrice: Number(localSalePrice.value) || 0,
    estimatedMonthlySalesVolume: Number(localMonthlyVolume.value) || 0
  });
}

function handleBatchSizeChange() {
  localMonthlyVolume.value = monthlyUnitsCapacity.value;
  saveBatchConfig();
}

function handleBatchUnitChange() {
  saveBatchConfig();
}

function handleFrequencyChange() {
  localMonthlyVolume.value = monthlyUnitsCapacity.value;
  saveBatchConfig();
}

function handleSalePriceChange() {
  saveBatchConfig();
}

function handleVolumeInput() {
  saveBatchConfig();
}

function handleProductNameBlur() {
  if (!activeProduct.value) return;
  if (activeProduct.value.businessNature === 'produccion') {
    saveBatchConfig();
  } else if (activeProduct.value.businessNature === 'servicio') {
    costingStore.updateProductService(activeProduct.value.productId, { productName: localName.value });
  } else if (activeProduct.value.businessNature === 'comercio') {
    costingStore.updateProductCommerce(activeProduct.value.productId, { productName: localName.value });
  }
}

const handleBatchConfigChange = saveBatchConfig;
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4">
    <!-- Pestañas de Productos (Hasta 5) -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-[calc(100%-40px)] scrollbar-none">
        <button
          v-for="(prod, idx) in products"
          :key="prod.productId"
          type="button"
          @click="handleSelectProduct(prod.productId)"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 min-h-[36px]',
            activeProduct?.productId === prod.productId
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          ]"
        >
          <span>
            {{ prod.businessNature === 'servicio' ? '✂️' : (prod.businessNature === 'comercio' ? '🏷️' : '🍲') }}
          </span>
          <span class="truncate max-w-[110px]">{{ prod.productName || `Prod. ${idx + 1}` }}</span>
        </button>
      </div>

      <!-- Botón para añadir producto (Máximo 5) -->
      <button
        v-if="canAdd"
        type="button"
        @click="handleOpenAddModal"
        class="h-9 w-9 shrink-0 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-base transition-colors"
        title="Agregar otro producto (máx 5)"
      >
        +
      </button>
    </div>

    <!-- Modal Rápido Agregar Producto -->
    <div
      v-if="showAddModal"
      class="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-3 animate-fadeIn"
    >
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold text-blue-900">
          {{ activeProduct?.businessNature === 'servicio' ? 'Nuevo Servicio (Máx 5)' : 'Nuevo Producto (Máx 5)' }}
        </h4>
        <button
          type="button"
          @click="showAddModal = false"
          class="text-xs text-blue-600 hover:text-blue-900 font-bold px-1"
        >
          ✕
        </button>
      </div>

      <div>
        <label class="text-[11px] font-bold text-slate-700 block mb-1">
          {{ activeProduct?.businessNature === 'servicio' ? 'Nombre del Servicio' : 'Nombre del Producto' }}
        </label>
        <input
          v-model="newProductName"
          type="text"
          :placeholder="activeProduct?.businessNature === 'servicio' ? 'Ej. Manicure Spa, Corte de cabello, Tinte...' : (activeProduct?.businessNature === 'comercio' ? 'Ej. Polo Oversize, Zapatillas deportivas...' : 'Ej. Torta de Chocolate, Hamburguesa Doble...')"
          class="w-full rounded-xl border border-blue-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          @keyup.enter="handleAddProduct"
        />
      </div>

      <button
        type="button"
        @click="handleAddProduct"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors min-h-[44px]"
      >
        {{ activeProduct?.businessNature === 'servicio' ? 'Crear Servicio' : 'Crear Producto' }}
      </button>
    </div>

    <!-- Header del Producto Activo -->
    <div class="flex items-center justify-between">
      <div class="flex-1 mr-2">
        <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
          {{ activeProduct?.businessNature === 'servicio' ? 'Nombre del Servicio' : 'Nombre del Producto' }}
        </label>
        <input
          v-model="localName"
          type="text"
          @blur="handleProductNameBlur"
          :placeholder="activeProduct?.businessNature === 'servicio' ? 'Nombre del servicio' : 'Nombre del producto'"
          class="w-full text-base font-black text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 focus:outline-none pb-0.5"
        />
      </div>

      <button
        v-if="products.length > 1"
        type="button"
        @click="handleRemoveCurrentProduct"
        class="text-red-600 hover:text-red-700 text-xs font-bold p-1.5 rounded-lg hover:bg-red-50 transition-colors"
        title="Eliminar este producto"
      >
        🗑️
      </button>
    </div>

    <!-- BADGE INFORMATIVO INNATO DE LA NATURALEZA DEL NEGOCIO (SESIÓN 1) -->
    <div
      v-if="activeProduct"
      class="flex items-center justify-between p-3 rounded-2xl border text-xs"
      :class="activeProduct.businessNature === 'servicio'
        ? 'bg-purple-50/80 border-purple-200 text-purple-950'
        : (activeProduct.businessNature === 'comercio'
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : 'bg-amber-50/80 border-amber-200 text-amber-950')"
    >
      <div class="flex items-center gap-2.5">
        <span class="text-xl">
          {{ activeProduct.businessNature === 'servicio' ? '✂️' : (activeProduct.businessNature === 'comercio' ? '🏷️' : '🍲') }}
        </span>
        <div>
          <span class="font-extrabold block text-xs">
            {{ activeProduct.businessNature === 'servicio'
              ? 'Modalidad del Negocio: Servicios ("El Minutero")'
              : (activeProduct.businessNature === 'comercio'
                ? 'Modalidad del Negocio: Comercio ("El Mayorista")'
                : 'Modalidad del Negocio: Producción ("La Casera vs. El Plato")') }}
          </span>
          <span class="text-[10px] opacity-75 block">
            Definido desde la Identidad de tu Negocio en Sesión 1
          </span>
        </div>
      </div>
      <span
        class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0"
        :class="activeProduct.businessNature === 'servicio'
          ? 'bg-purple-100 border-purple-300 text-purple-900'
          : (activeProduct.businessNature === 'comercio'
            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
            : 'bg-amber-100 border-amber-300 text-amber-900')"
      >
        Modalidad Innata
      </span>
    </div>

    <!-- SECCIÓN DINÁMICA SEGÚN MODALIDAD ACTIVA -->

    <!-- CASO 1: PRODUCCIÓN / GASTRONOMÍA ("La Casera vs. El Plato") -->
    <div v-if="activeProduct?.businessNature === 'produccion'" class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <!-- Card 1: Cuánto preparas por tanda -->
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700">🍲 ¿Cuánto preparas por tanda?</span>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tu Lote</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model.number="localBatchSize"
              type="number"
              min="1"
              step="1"
              @input="handleBatchSizeChange"
              @change="handleBatchSizeChange"
              class="w-24 text-2xl sm:text-3xl font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2 py-2 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[48px]"
            />
            <select
              v-model="localBatchUnit"
              @change="handleBatchUnitChange"
              class="flex-1 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[48px]"
            >
              <option value="unidades">unidades</option>
              <option value="porciones">porciones</option>
              <option value="platos">platos</option>
              <option value="paquetes">paquetes</option>
              <option value="kilos">kilos</option>
              <option value="litros">litros</option>
            </select>
          </div>
        </div>

        <!-- Card 2: Precio de Venta -->
        <div class="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-900">🏷️ Precio de Venta</span>
            <span class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Por unidad</span>
          </div>
          <div class="relative flex items-center">
            <span class="absolute left-3 text-lg font-bold text-emerald-600">S/</span>
            <input
              v-model.number="localSalePrice"
              type="number"
              min="0"
              step="0.50"
              @input="handleSalePriceChange"
              @change="handleSalePriceChange"
              class="w-full text-2xl sm:text-3xl font-black text-emerald-950 bg-white border border-emerald-300 rounded-xl pl-9 pr-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[48px]"
            />
          </div>
        </div>

        <!-- Card 3: Frecuencia de Preparación -->
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700">⏱️ Frecuencia de Preparación</span>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ritmo</span>
          </div>
          <select
            v-model="localFrequency"
            @change="handleFrequencyChange"
            class="w-full text-sm font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[48px]"
          >
            <option value="diario">⚡ Diaria (24 tandas/mes)</option>
            <option value="interdiario">📅 Interdiaria (12 tandas/mes)</option>
            <option value="semanal">🗓️ Semanal (4 tandas/mes)</option>
            <option value="quincenal">📆 Quincenal (2 tandas/mes)</option>
            <option value="mensual">📦 Mensual (1 tanda/mes)</option>
          </select>
        </div>

        <!-- Card 4: Ventas Estimadas al Mes -->
        <div class="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-blue-900">📈 Ventas Estimadas / Mes</span>
            <span class="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Capacidad: {{ monthlyUnitsCapacity }}
            </span>
          </div>
          <div class="relative flex items-center">
            <input
              v-model.number="localMonthlyVolume"
              type="number"
              min="0"
              @input="handleVolumeInput"
              @change="handleVolumeInput"
              class="w-full text-2xl sm:text-3xl font-black text-blue-700 bg-white border border-blue-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[48px]"
            />
            <span class="absolute right-3 text-xs font-bold text-blue-500 uppercase pointer-events-none">
              {{ localBatchUnit }}/mes
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- CASO 2: SERVICIOS / ESTILISMO ("El Minutero") -->
    <div v-else-if="activeProduct?.businessNature === 'servicio'">
      <ServiceCostingSection :product="activeProduct" />
    </div>

    <!-- CASO 3: COMERCIO / REVENTA ("El Mayorista") -->
    <div v-else-if="activeProduct?.businessNature === 'comercio'">
      <CommerceCostingSection :product="activeProduct" />
    </div>
  </div>
</template>
