<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <span>Presentaciones de Venta y Compra</span>
          <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-normal">
            Multi-empaque
          </span>
        </h4>
        <p class="text-xs text-gray-500 mt-0.5">
          Define cómo compras o vendes este producto (unidades, six-packs, cajas, sacos). La unidad base es
          <span class="font-semibold text-gray-700">"{{ baseUnit || 'uni' }}"</span>.
        </p>
      </div>

      <button
        type="button"
        @click="addPresentation"
        :disabled="disabled"
        class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Agregar Presentación
      </button>
    </div>

    <!-- Lista de Presentaciones -->
    <div class="space-y-3">
      <div
        v-for="(pres, idx) in localPresentations"
        :key="pres.id || idx"
        class="p-4 rounded-2xl border transition-all"
        :class="[
          pres.isBase
            ? 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-100'
            : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
        ]"
      >
        <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div class="flex items-center gap-2">
            <span
              v-if="pres.isBase"
              class="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white rounded-md"
            >
              Base (x1)
            </span>
            <span
              v-else
              class="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 rounded-md"
            >
              x{{ pres.factor }} {{ baseUnit }}
            </span>

            <span class="text-xs font-medium text-gray-500">
              ID: {{ pres.id }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Semáforo de Margen -->
            <span
              v-if="getMarginStatus(pres)"
              :class="getMarginBadgeClasses(pres)"
              class="px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 border"
            >
              <span>{{ getMarginStatus(pres).icon }}</span>
              <span>{{ getMarginStatus(pres).label }}</span>
            </span>

            <!-- Botón Eliminar (no para la base) -->
            <button
              v-if="!pres.isBase"
              type="button"
              @click="removePresentation(idx)"
              class="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors"
              title="Eliminar presentación"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Campos de la presentación -->
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <!-- Nombre -->
          <div class="sm:col-span-4">
            <label class="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
            <input
              v-model="pres.name"
              @input="emitUpdate"
              type="text"
              placeholder="Ej: Caja x 24, Saco"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <!-- Factor multiplicador -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-gray-600 mb-1">
              Contenido ({{ baseUnit }})
            </label>
            <input
              v-model.number="pres.factor"
              @input="onFactorChange(pres)"
              type="number"
              min="1"
              step="1"
              :disabled="pres.isBase"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-center font-semibold"
              :class="{ 'bg-gray-100 text-gray-500 cursor-not-allowed': pres.isBase }"
            />
          </div>

          <!-- Precio de Venta -->
          <div class="sm:col-span-3">
            <label class="block text-xs font-medium text-gray-600 mb-1">
              Precio Venta (S/)
            </label>
            <input
              v-model.number="pres.price"
              @input="onPriceChange(pres)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-gray-800"
            />
          </div>

          <!-- Margen Mínimo Específico (Opcional) -->
          <div class="sm:col-span-3">
            <label class="block text-xs font-medium text-gray-600 mb-1">
              Margen Mín. % <span class="text-gray-400 font-normal">(Opc.)</span>
            </label>
            <input
              v-model.number="pres.minMarginPct"
              @input="emitUpdate"
              type="number"
              step="1"
              min="0"
              max="99"
              placeholder="Heredar"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
            />
          </div>
        </div>

        <!-- Barra inferior informativa y asistente de descuento -->
        <div class="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <!-- Desglose de precio unitario equivalente -->
          <div class="text-gray-600 flex items-center gap-3">
            <span>
              Equivale a:
              <strong class="text-gray-800">
                S/ {{ getUnitEquivalentPrice(pres) }}
              </strong>
              / {{ baseUnit }}
            </span>

            <span
              v-if="!pres.isBase && getVolumeDiscountPct(pres) !== null"
              class="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md"
            >
              {{ getVolumeDiscountPct(pres) }}% vs unidad
            </span>

            <span v-if="pres.isBase && isFractional" class="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              Venta a granel habilitada
            </span>
          </div>

          <!-- Asistente de sugerencia de precio con descuento (para presentaciones no-base) -->
          <div v-if="!pres.isBase && basePrice > 0" class="flex items-center gap-1">
            <span class="text-gray-400 mr-1">Sugerir:</span>
            <button
              v-for="pct in [5, 10, 15, 20]"
              :key="pct"
              type="button"
              @click="suggestPrice(pres, pct)"
              class="px-2 py-0.5 text-[11px] bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600 rounded transition-colors"
              title="Aplicar descuento de volumen sobre precio unitario"
            >
              -{{ pct }}%
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { round2, roundStock } from '@/utils/mathUtils';
import {
  isFractionalUnit,
  evaluateMargin,
  computeFloorPrice,
  applyDiscount,
} from '@/utils/presentationMath';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  baseUnit: {
    type: String,
    default: 'uni',
  },
  basePrice: {
    type: Number,
    default: 0,
  },
  baseCost: {
    type: Number,
    default: 0,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'update:basePrice']);

const localPresentations = ref([]);

const isFractional = computed(() => isFractionalUnit(props.baseUnit));

// Inicialización y sincronización
const initializePresentations = () => {
  const incoming = Array.isArray(props.modelValue) ? props.modelValue : [];

  if (incoming.length === 0) {
    // Crear presentación base por defecto
    localPresentations.value = [
      {
        id: 'pres_base',
        name: (props.baseUnit || 'Unidad').toUpperCase(),
        factor: 1,
        price: Number(props.basePrice || 0),
        minMarginPct: null,
        usage: ['buy', 'sell'],
        isBase: true,
        isActive: true,
        allowSellByAmount: isFractional.value,
      },
    ];
  } else {
    localPresentations.value = incoming.map((p) => ({
      ...p,
      factor: Number(p.factor || 1),
      price: Number(p.price || 0),
      minMarginPct: p.minMarginPct !== null && p.minMarginPct !== undefined ? Number(p.minMarginPct) : null,
      usage: Array.isArray(p.usage) ? p.usage : ['buy', 'sell'],
      isBase: Boolean(p.isBase) || p.factor === 1,
      isActive: p.isActive !== false,
      allowSellByAmount: Boolean(p.allowSellByAmount),
    }));

    // Asegurar que exista base
    const hasBase = localPresentations.value.some((p) => p.isBase || p.factor === 1);
    if (!hasBase) {
      localPresentations.value.unshift({
        id: 'pres_base',
        name: (props.baseUnit || 'Unidad').toUpperCase(),
        factor: 1,
        price: Number(props.basePrice || 0),
        minMarginPct: null,
        usage: ['buy', 'sell'],
        isBase: true,
        isActive: true,
        allowSellByAmount: isFractional.value,
      });
    }
  }
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (
      Array.isArray(newVal) &&
      localPresentations.value.length > 0 &&
      JSON.stringify(newVal) === JSON.stringify(localPresentations.value)
    ) {
      return;
    }
    initializePresentations();
  },
  { immediate: true, deep: true }
);

// Sincronizar precio base cuando cambia externamente
watch(
  () => props.basePrice,
  (newPrice) => {
    const base = localPresentations.value.find((p) => p.isBase);
    if (base && base.price !== newPrice) {
      base.price = Number(newPrice || 0);
    }
  }
);

// Sincronizar nombre de base cuando cambia baseUnit
watch(
  () => props.baseUnit,
  (newUnit) => {
    const base = localPresentations.value.find((p) => p.isBase);
    if (base) {
      base.allowSellByAmount = isFractionalUnit(newUnit);
      emitUpdate();
    }
  }
);

const emitUpdate = () => {
  emit('update:modelValue', localPresentations.value);
};

const onPriceChange = (pres) => {
  if (pres.isBase) {
    emit('update:basePrice', Number(pres.price || 0));
  }
  emitUpdate();
};

const onFactorChange = (pres) => {
  pres.factor = Math.max(1, Math.round(Number(pres.factor) || 1));
  emitUpdate();
};

const addPresentation = () => {
  const nextNumber = localPresentations.value.length + 1;
  localPresentations.value.push({
    id: `pres_${Date.now().toString(36)}`,
    name: `Presentación ${nextNumber}`,
    factor: 6,
    price: 0,
    minMarginPct: null,
    usage: ['buy', 'sell'],
    isBase: false,
    isActive: true,
    sku: null,
    allowSellByAmount: false,
  });
  emitUpdate();
};

const removePresentation = (index) => {
  localPresentations.value.splice(index, 1);
  emitUpdate();
};

const getUnitEquivalentPrice = (pres) => {
  const factor = Number(pres.factor) || 1;
  const price = Number(pres.price) || 0;
  return round2(price / factor).toFixed(2);
};

const getVolumeDiscountPct = (pres) => {
  const baseP = Number(props.basePrice) || 0;
  if (baseP <= 0) return null;

  const unitEquivalent = Number(pres.price || 0) / (Number(pres.factor) || 1);
  const diff = baseP - unitEquivalent;
  if (diff <= 0) return null;

  return round2((diff / baseP) * 100);
};

const suggestPrice = (pres, discountPercent) => {
  const baseP = Number(props.basePrice) || 0;
  const factor = Number(pres.factor) || 1;
  const nominal = baseP * factor;
  const discounted = applyDiscount({ listPrice: nominal, type: 'percent', value: discountPercent });
  pres.price = discounted.netPrice;
  emitUpdate();
};

const getMarginStatus = (pres) => {
  if (!props.baseCost || props.baseCost <= 0) return null;
  const result = evaluateMargin({
    netPrice: pres.price,
    baseCost: props.baseCost,
    factor: pres.factor,
    minMarginPct: pres.minMarginPct ?? 20,
    allowBelowCost: false,
  });

  if (result.status === 'below_cost') {
    return {
      status: 'below_cost',
      label: `Bajo costo (${result.marginPct}%)`,
      icon: '🔴',
    };
  }
  if (result.status === 'below_floor') {
    return {
      status: 'below_floor',
      label: `Bajo piso (${result.marginPct}%)`,
      icon: '🟡',
    };
  }
  return {
    status: 'ok',
    label: `Margen ${result.marginPct}%`,
    icon: '🟢',
  };
};

const getMarginBadgeClasses = (pres) => {
  const status = getMarginStatus(pres);
  if (!status) return '';
  if (status.status === 'below_cost') return 'bg-red-50 text-red-700 border-red-200';
  if (status.status === 'below_floor') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
};
</script>
