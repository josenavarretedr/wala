<script setup>
import { ref, computed } from 'vue';
import { useCostingCalculator } from '@/composables/useCostingCalculator';

const props = defineProps({
  ingredient: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 1
  },
  batchSize: {
    type: Number,
    default: 1
  },
  batchUnit: {
    type: String,
    default: 'unidades'
  }
});

const emit = defineEmits(['update', 'remove', 'edit']);

const { formatMoney } = useCostingCalculator();

const showMathExplanation = ref(false);

const math = computed(() => props.ingredient.automatedMath || {});
const consumption = computed(() => props.ingredient.recipeConsumption || {});
const purchase = computed(() => props.ingredient.marketPurchase || {});

const cleanSingleBatchUnit = computed(() => {
  const raw = (props.batchUnit || 'unidad').toLowerCase().trim();
  if (raw === 'unidades' || raw === 'unidad') return 'unidad';
  if (raw === 'porciones' || raw === 'porcion') return 'porción';
  if (raw === 'platos' || raw === 'plato') return 'plato';
  if (raw === 'paquetes' || raw === 'paquete') return 'paquete';
  if (raw === 'kilos' || raw === 'kilo') return 'kilo';
  if (raw === 'litros' || raw === 'litro') return 'litro';
  return raw.replace(/es$/, '').replace(/s$/, '');
});

const cleanBatchUnitPlural = computed(() => {
  const raw = (props.batchUnit || 'unidades').toLowerCase().trim();
  if (raw === 'unidad' || raw === 'unidades') return 'unidades';
  if (raw === 'porcion' || raw === 'porciones') return 'porciones';
  if (raw === 'plato' || raw === 'platos') return 'platos';
  if (raw === 'paquete' || raw === 'paquetes') return 'paquetes';
  if (raw === 'kilo' || raw === 'kilos') return 'kilos';
  if (raw === 'litro' || raw === 'litros') return 'litros';
  return raw;
});

const costPerUnit = computed(() => {
  const size = Math.max(1, props.batchSize || 1);
  const incurred = Number(math.value.costIncurredInBatch) || 0;
  return incurred / size;
});

const portionQuantity = computed(() => {
  const size = Math.max(1, props.batchSize || 1);
  const qty = Number(consumption.value.quantityUsed) || 0;
  const perPortion = qty / size;
  return perPortion < 0.01 ? perPortion.toFixed(3) : perPortion < 1 ? perPortion.toFixed(2) : Number(perPortion.toFixed(2));
});
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs space-y-2.5 transition-all hover:border-blue-300">
    <!-- Fila Superior: Nombre del Insumo + Costo unitario destacado en verde -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
          {{ index }}
        </span>
        <h4 class="font-bold text-slate-900 text-sm truncate">
          {{ ingredient.name }}
        </h4>
      </div>

      <!-- Costo Unitario Destacado en Verde con Botón Info -->
      <div class="shrink-0 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/90 text-emerald-900 pl-2.5 pr-1.5 py-1 rounded-xl">
        <div class="text-right">
          <span class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block leading-none">
            Por {{ cleanSingleBatchUnit }}
          </span>
          <span class="text-xs sm:text-sm font-black text-emerald-950 block leading-tight mt-0.5">
            {{ formatMoney(costPerUnit) }}
          </span>
        </div>
        <button
          type="button"
          @click="showMathExplanation = !showMathExplanation"
          class="w-6 h-6 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs font-black transition-colors cursor-pointer"
          :title="showMathExplanation ? 'Ocultar cálculo' : 'Ver cómo se calcula este costo'"
        >
          ℹ️
        </button>
      </div>
    </div>

    <!-- Mini Desglose Orgánico Expandible de Costo Unitario -->
    <div
      v-if="showMathExplanation"
      class="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 space-y-1.5 animate-fadeIn"
    >
      <div class="flex items-center justify-between font-bold text-emerald-900">
        <span class="flex items-center gap-1">
          <span>🧮</span>
          <span>¿Cómo se calcula este costo por {{ cleanSingleBatchUnit }}?</span>
        </span>
        <button
          type="button"
          @click="showMathExplanation = false"
          class="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold px-1 cursor-pointer"
        >
          ✕
        </button>
      </div>
      <div class="bg-white/90 rounded-lg p-2.5 border border-emerald-200/70 text-xs text-emerald-950 space-y-1.5">
        <div class="flex justify-between items-center text-slate-700">
          <span>Costo total en la tanda:</span>
          <strong class="font-bold text-slate-900">{{ formatMoney(math.costIncurredInBatch) }}</strong>
        </div>
        <div class="flex justify-between items-center text-slate-700">
          <span>Preparación de la tanda:</span>
          <strong class="font-bold text-slate-900">÷ {{ batchSize }} {{ cleanBatchUnitPlural }}</strong>
        </div>
        <div class="border-t border-emerald-200 pt-1 flex justify-between items-center font-black text-emerald-950 text-xs sm:text-sm">
          <span>Costo por {{ cleanSingleBatchUnit }}:</span>
          <span class="text-emerald-800">= {{ formatMoney(costPerUnit) }}</span>
        </div>
      </div>
      <div class="text-[11px] text-emerald-800 bg-emerald-100/60 rounded-lg px-2.5 py-1.5 border border-emerald-200/60 leading-tight">
        💡 <strong>Comprobación:</strong> {{ batchSize }} {{ cleanBatchUnitPlural }} × {{ formatMoney(costPerUnit) }} = {{ formatMoney(math.costIncurredInBatch) }} de este insumo en cada preparación.
      </div>
    </div>

    <!-- Fila Media: Badges Semánticos 'Plato vs. Mercado' -->
    <div class="space-y-1.5 pt-0.5">
      <!-- Badge Ámbar: Receta en tanda y por porción -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 border border-amber-200/90 text-amber-950">
          <span class="text-xs">🍽️ Receta:</span>
          <strong class="font-black text-amber-900">{{ consumption.quantityUsed }} {{ consumption.unit }}</strong>
          <span class="text-[11px] text-amber-800/80 font-medium">en tanda</span>
        </span>
        <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100/80 text-amber-900 border border-amber-300/70">
          {{ portionQuantity }} {{ consumption.unit }} / {{ cleanSingleBatchUnit }}
        </span>
      </div>

      <!-- Badge Azul: Compra en el mercado -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 border border-blue-200/90 text-blue-950">
          <span class="text-xs">🛒 Compra:</span>
          <span class="font-semibold text-blue-900">{{ purchase.packageUnitName || 'paquete' }}</span>
          <span class="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded border border-blue-200">
            {{ purchase.quantityInPackage }} {{ purchase.packageUnit || consumption.unit }}
          </span>
          <span class="text-blue-800/75 font-normal">a</span>
          <strong class="font-black text-blue-900">{{ formatMoney(purchase.packageCost) }}</strong>
        </span>
      </div>
    </div>

    <!-- Fila Inferior: Badge sutil de stock remanente + Botón Editar y Botón Eliminar -->
    <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-xs gap-2">
      <!-- Badge de Sobrante / Stock -->
      <div
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
        :class="math.leftoverQuantityInStock > 0 ? 'bg-amber-50/80 border-amber-200 text-amber-800' : 'bg-slate-100 border-slate-200 text-slate-500'"
      >
        <span>📦 Sobrante:</span>
        <span class="font-bold">
          {{ math.leftoverQuantityInStock > 0 ? `${math.leftoverQuantityInStock} ${consumption.unit}` : '0 (justo)' }}
        </span>
      </div>

      <!-- Botones de Acción (Área táctil mínima 44px-48px) -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Botón Editar -->
        <button
          type="button"
          @click="$emit('edit', ingredient)"
          class="h-9 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 text-xs font-bold transition-colors min-h-[44px] cursor-pointer active:scale-95"
          title="Editar este insumo"
        >
          <span>✏️</span>
          <span>Editar</span>
        </button>

        <!-- Botón Eliminar -->
        <button
          type="button"
          @click="$emit('remove', ingredient.ingredientId)"
          class="h-9 w-9 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] cursor-pointer active:scale-95"
          title="Eliminar insumo"
        >
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>
