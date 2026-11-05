<script setup>
import { ref, computed, watch } from 'vue';
import { useCostingStore } from '@/stores/costing';
import { useCostingCalculator } from '@/composables/useCostingCalculator';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const costingStore = useCostingStore();
const { formatMoney, formatPercent, roundDecimals } = useCostingCalculator();

// Campos locales reactivos para Entrada A, B y C
const presentation = ref('');
const unitsPerPackage = ref(1);
const packageCost = ref(0);

const freightExpense = ref(0);
const totalItemsInTrip = ref(0);
const packagingCost = ref(0);

const salePrice = ref(0);
const monthlyVolume = ref(0);

watch(
  () => props.product,
  (prod) => {
    if (prod) {
      const cfg = prod.commerceConfig || {};
      presentation.value = cfg.purchasePresentation ?? '';
      unitsPerPackage.value = cfg.unitsPerPackage ?? 1;
      packageCost.value = cfg.packagePurchasePrice ?? 0;

      freightExpense.value = cfg.freightExpense ?? 0;
      totalItemsInTrip.value = cfg.totalItemsInTrip ?? 0;
      packagingCost.value = cfg.packagingCostPerUnit ?? 0;

      salePrice.value = prod.commercialization?.currentSalePrice ?? 0;
      monthlyVolume.value = prod.commercialization?.estimatedMonthlySalesVolume ?? 0;
    }
  },
  { immediate: true, deep: true }
);

// Cálculos automáticos reactivos en vivo
const baseUnitCost = computed(() => {
  const cost = Number(packageCost.value) || 0;
  const qty = Number(unitsPerPackage.value) || 1;
  if (qty <= 0) return 0;
  return roundDecimals(cost / qty, 3);
});

const unitFreightCost = computed(() => {
  const freight = Number(freightExpense.value) || 0;
  const items = Number(totalItemsInTrip.value) || 0;
  if (items <= 0 || freight <= 0) return 0;
  return roundDecimals(freight / items, 3);
});

const directCostCommercial = computed(() => {
  const base = baseUnitCost.value;
  const freight = unitFreightCost.value;
  const pack = Number(packagingCost.value) || 0;
  return roundDecimals(base + freight + pack, 3);
});

const grossProfitPerUnit = computed(() => {
  const price = Number(salePrice.value) || 0;
  return roundDecimals(price - directCostCommercial.value, 3);
});

const grossMarginPercentage = computed(() => {
  const price = Number(salePrice.value) || 0;
  if (price <= 0) return 0;
  return roundDecimals((grossProfitPerUnit.value / price) * 100, 2);
});

function handleDataChange() {
  costingStore.updateProductCommerce(props.product.productId, {
    purchasePresentation: presentation.value,
    unitsPerPackage: unitsPerPackage.value,
    packagePurchasePrice: packageCost.value,
    freightExpense: freightExpense.value,
    totalItemsInTrip: totalItemsInTrip.value,
    packagingCostPerUnit: packagingCost.value,
    currentSalePrice: salePrice.value,
    estimatedMonthlySalesVolume: monthlyVolume.value
  });
}
</script>

<template>
  <div class="space-y-4">
    <!-- ENTRADA A: COMPRA MAYORISTA / PROVEEDOR -->
    <div class="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
          <span>📦</span>
          <span>Entrada A: Compra Mayorista (Proveedor)</span>
        </h4>
        <span class="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
          El Bulto / Paquete
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <!-- Presentación de compra -->
        <div>
          <label class="text-[11px] font-bold text-slate-700 block mb-1">
            Presentación de Compra
          </label>
          <select
            v-model="presentation"
            @change="handleDataChange"
            class="w-full rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none min-h-[44px]"
          >
            <option value="Docena">Docena (12 u.)</option>
            <option value="Caja">Caja cerrada</option>
            <option value="Fardo">Fardo / Bulto</option>
            <option value="Ciento">Ciento (100 u.)</option>
            <option value="Paquete">Paquete</option>
            <option value="Unidad">Unidad individual</option>
            <option value="Otro">Otra presentación</option>
          </select>
        </div>

        <!-- Unidades contenidas en el paquete -->
        <div>
          <label class="text-[11px] font-bold text-slate-700 block mb-1">
            Unidades por Paquete
          </label>
          <input
            v-model.number="unitsPerPackage"
            type="number"
            min="1"
            step="1"
            placeholder="Ej. 12"
            @change="handleDataChange"
            class="w-full rounded-xl border border-blue-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-none min-h-[44px]"
          />
        </div>

        <!-- Precio pagado por paquete cerrado -->
        <div>
          <label class="text-[11px] font-bold text-slate-700 block mb-1">
            Precio Total Pagado S/
          </label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-xs font-bold text-blue-700">S/</span>
            <input
              v-model.number="packageCost"
              type="number"
              min="0"
              step="any"
              placeholder="Ej. 180.00"
              @change="handleDataChange"
              class="w-full rounded-xl border border-blue-300 bg-white pl-8 pr-3 py-2 text-sm font-black text-blue-950 focus:border-blue-600 focus:outline-none min-h-[44px]"
            />
          </div>
        </div>
      </div>

      <!-- Tarjeta Resultado Automático Entrada A -->
      <div class="bg-white rounded-xl p-2.5 border border-blue-200/90 flex items-center justify-between text-xs">
        <span class="text-slate-600 font-medium text-[11px]">
          Costo base de compra por artículo:
        </span>
        <span class="text-sm font-black text-blue-900">
          {{ formatMoney(baseUnitCost) }} / u.
        </span>
      </div>
    </div>

    <!-- ENTRADA B: GASTOS ADICIONALES (FLETE Y EMPAQUE) -->
    <div class="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
          <span>🚚</span>
          <span>Entrada B: Gastos de Adquisición y Empaque</span>
        </h4>
        <span class="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
          Prorrateo Opcional
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <!-- Gasto de flete o pasaje -->
        <div>
          <label class="text-[11px] font-bold text-slate-700 block mb-0.5">
            Flete / Pasaje del Viaje S/
          </label>
          <span class="text-[10px] text-slate-500 block mb-1">Para traer mercadería</span>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-xs font-bold text-amber-700">S/</span>
            <input
              v-model.number="freightExpense"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              @change="handleDataChange"
              class="w-full rounded-xl border border-amber-300 bg-white pl-8 pr-3 py-2 text-sm font-bold text-slate-900 focus:border-amber-600 focus:outline-none min-h-[44px]"
            />
          </div>
        </div>

        <!-- Total de artículos traídos en el viaje -->
        <div>
          <label class="text-[11px] font-bold text-slate-700 block mb-0.5">
            Total Artículos Traídos
          </label>
          <span class="text-[10px] text-slate-500 block mb-1">En el mismo viaje</span>
          <input
            v-model.number="totalItemsInTrip"
            type="number"
            min="0"
            step="1"
            placeholder="Ej. 100"
            @change="handleDataChange"
            class="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-amber-600 focus:outline-none min-h-[44px]"
          />
        </div>

        <!-- Costo de empaque o bolsa por entrega -->
        <div>
          <label class="text-[11px] font-bold text-slate-700 block mb-0.5">
            Empaque / Bolsa por Venta S/
          </label>
          <span class="text-[10px] text-slate-500 block mb-1">Bolsa, caja o plástico</span>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-xs font-bold text-amber-700">S/</span>
            <input
              v-model.number="packagingCost"
              type="number"
              min="0"
              step="0.05"
              placeholder="Ej. 0.30"
              @change="handleDataChange"
              class="w-full rounded-xl border border-amber-300 bg-white pl-8 pr-3 py-2 text-sm font-bold text-slate-900 focus:border-amber-600 focus:outline-none min-h-[44px]"
            />
          </div>
        </div>
      </div>

      <!-- Tarjeta Resumen Entrada B -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="bg-white rounded-xl p-2 border border-amber-200 flex items-center justify-between">
          <span class="text-[11px] text-slate-500">Flete prorrateado:</span>
          <span class="font-bold text-slate-800">{{ formatMoney(unitFreightCost) }}</span>
        </div>
        <div class="bg-white rounded-xl p-2 border border-amber-200 flex items-center justify-between">
          <span class="text-[11px] text-amber-900 font-bold">Costo directo comercial:</span>
          <span class="font-black text-amber-950">{{ formatMoney(directCostCommercial) }}</span>
        </div>
      </div>
    </div>

    <!-- ENTRADA C: VENTA Y MARGEN COMERCIAL -->
    <div class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
          <span>🏷️</span>
          <span>Entrada C: Venta y Margen Comercial</span>
        </h4>
        <span class="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
          Al Cliente
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <!-- Precio de venta al público -->
        <div>
          <label class="text-xs font-black text-emerald-950 block mb-1">
            Precio de Venta al Público S/
          </label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-xs font-bold text-emerald-700">S/</span>
            <input
              v-model.number="salePrice"
              type="number"
              min="0"
              step="any"
              placeholder="Ej. 25.00"
              @change="handleDataChange"
              class="w-full rounded-xl border border-emerald-300 bg-white pl-8 pr-3 py-2 text-base font-black text-emerald-950 focus:border-emerald-600 focus:outline-none min-h-[44px]"
            />
          </div>
          <p class="text-[10px] text-emerald-700 mt-1">Precio final que cobras por artículo</p>
        </div>

        <!-- Ventas estimadas al mes -->
        <div>
          <label class="text-xs font-bold text-slate-700 block mb-1">
            Ventas Estimadas / Mes
          </label>
          <input
            v-model.number="monthlyVolume"
            type="number"
            min="0"
            step="1"
            placeholder="Ej. 50"
            @change="handleDataChange"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-none min-h-[44px]"
          />
          <p class="text-[10px] text-slate-500 mt-1">Artículos proyectados al mes</p>
        </div>
      </div>
    </div>
  </div>
</template>
