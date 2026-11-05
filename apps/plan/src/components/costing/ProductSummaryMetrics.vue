<script setup>
import { computed } from 'vue';
import { useCostingCalculator } from '@/composables/useCostingCalculator';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const { formatMoney, formatPercent } = useCostingCalculator();

const financials = computed(() => props.product?.financialSummary || {});
const batchConfig = computed(() => props.product?.batchConfig || {});
const commercialization = computed(() => props.product?.commercialization || {});
const businessNature = computed(() => props.product?.businessNature || 'produccion');

// 4 Métricas Estándar Homogéneas
const directCostPerUnit = computed(() => financials.value.directCostPerUnit || 0);
const salePrice = computed(() => commercialization.value.currentSalePrice || financials.value.salePrice || 0);
const grossProfitPerUnit = computed(() => financials.value.grossProfitPerUnit || 0);
const marginPercent = computed(() => financials.value.grossMarginPercentage || 0);
const monthlyProfit = computed(() => financials.value.monthlyGrossProfitEstimate || 0);

// Resumen de tanda para producción
const totalBatchCost = computed(() => financials.value.totalBatchDirectCost || 0);
const batchSize = computed(() => batchConfig.value.batchSize || 1);
const batchRevenue = computed(() => salePrice.value * batchSize.value);
const batchProfit = computed(() => batchRevenue.value - totalBatchCost.value);

// Textos y etiquetas adaptadas al contexto
const costLabel = computed(() => {
  if (businessNature.value === 'servicio') return 'Costo Atención';
  if (businessNature.value === 'comercio') return 'Costo Directo';
  return 'Costo Insumo';
});

const costSubtitle = computed(() => {
  if (businessNature.value === 'servicio') return 'por servicio';
  if (businessNature.value === 'comercio') return 'por artículo';
  return 'por unidad';
});

const priceSubtitle = computed(() => {
  if (businessNature.value === 'servicio') return 'tarifa cliente';
  return 'al cliente';
});

// Indicador visual de salud del margen
const marginStatus = computed(() => {
  if (salePrice.value <= 0) return { label: 'Sin Precio', color: 'text-slate-500 bg-slate-100 border-slate-200' };
  if (grossProfitPerUnit.value < 0) return { label: 'Pérdida ⚠️', color: 'text-red-700 bg-red-100 border-red-300' };
  if (marginPercent.value >= 40) return { label: 'Margen Óptimo', color: 'text-emerald-800 bg-emerald-100 border-emerald-300' };
  if (marginPercent.value >= 20) return { label: 'Margen Aceptable', color: 'text-amber-800 bg-amber-100 border-amber-300' };
  return { label: 'Margen Bajo (< 20%)', color: 'text-rose-800 bg-rose-100 border-rose-300' };
});
</script>

<template>
  <div class="space-y-3">
    <!-- Fila con las 3 Tarjetas Principales Destacadas -->
    <div class="grid grid-cols-3 gap-2">
      <!-- 1. Costo Directo por Unidad / Atención / Artículo -->
      <div class="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between text-center">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-tight line-clamp-1">
          {{ costLabel }}
        </span>
        <div class="my-1">
          <span class="text-base sm:text-lg font-black text-slate-900 block truncate">
            {{ formatMoney(directCostPerUnit) }}
          </span>
          <span class="text-[10px] text-slate-500 block">{{ costSubtitle }}</span>
        </div>
      </div>

      <!-- 2. Precio de Venta al Público -->
      <div class="bg-blue-50/70 rounded-xl p-3 border border-blue-200 shadow-xs flex flex-col justify-between text-center">
        <span class="text-[10px] font-bold text-blue-700 uppercase tracking-tight line-clamp-1">
          Precio Venta
        </span>
        <div class="my-1">
          <span class="text-base sm:text-lg font-black text-blue-950 block truncate">
            {{ formatMoney(salePrice) }}
          </span>
          <span class="text-[10px] text-blue-600 block">{{ priceSubtitle }}</span>
        </div>
      </div>

      <!-- 3. Ganancia Bruta por Unidad (% Margen) -->
      <div
        class="rounded-xl p-3 border shadow-xs flex flex-col justify-between text-center transition-colors"
        :class="grossProfitPerUnit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'"
      >
        <span
          class="text-[10px] font-bold uppercase tracking-tight line-clamp-1"
          :class="grossProfitPerUnit >= 0 ? 'text-emerald-800' : 'text-rose-800'"
        >
          Ganancia Bruta
        </span>
        <div class="my-1">
          <span
            class="text-base sm:text-lg font-black block truncate"
            :class="grossProfitPerUnit >= 0 ? 'text-emerald-950' : 'text-rose-950'"
          >
            {{ formatMoney(grossProfitPerUnit) }}
          </span>
          <span
            class="inline-block text-[11px] font-bold px-1.5 py-0.5 rounded-md mt-0.5"
            :class="grossProfitPerUnit >= 0 ? 'bg-emerald-200/70 text-emerald-900' : 'bg-rose-200 text-rose-900'"
          >
            {{ formatPercent(marginPercent) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Barra de Estado y Resumen Financiero -->
    <div class="bg-white rounded-xl p-3 border border-slate-200/90 flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <span class="text-slate-500 font-medium">Diagnóstico:</span>
        <span
          class="px-2 py-0.5 rounded-full font-bold border text-[11px]"
          :class="marginStatus.color"
        >
          {{ marginStatus.label }}
        </span>
      </div>

      <div class="text-right">
        <template v-if="businessNature === 'produccion'">
          <span class="text-slate-500 text-[11px]">Ganancia por tanda ({{ batchSize }} u.):</span>
          <span class="font-extrabold text-slate-900 ml-1">
            {{ formatMoney(batchProfit) }}
          </span>
        </template>
        <template v-else>
          <span class="text-slate-500 text-[11px]">Proyección mensual:</span>
          <span class="font-extrabold text-slate-900 ml-1">
            {{ formatMoney(monthlyProfit) }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>
