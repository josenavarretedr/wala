<script setup>
import { computed } from 'vue';
import { useCostingCalculator } from '@/composables/useCostingCalculator';

const props = defineProps({
  allocatedTotal: {
    type: Number,
    default: 0
  },
  allocatedSeedCapital: {
    type: Number,
    default: 0
  },
  totalBusinessInvestment: {
    type: Number,
    default: 0
  },
  seedCapitalCeiling: {
    type: Number,
    default: 3000
  },
  remainingBudget: {
    type: Number,
    required: true
  },
  isBudgetCompliant: {
    type: Boolean,
    default: true
  },
  rubros: {
    type: Object,
    default: () => ({
      rubroA: { seed: 0, own: 0, total: 0 },
      rubroB: { seed: 0, own: 0, total: 0 },
      rubroC: { seed: 0, own: 0, total: 0 }
    })
  }
});

const { formatMoney } = useCostingCalculator();

const hasRubrosData = computed(() => {
  if (!props.rubros) return false;
  const a = props.rubros.rubroA?.total || 0;
  const b = props.rubros.rubroB?.total || 0;
  const c = props.rubros.rubroC?.total || 0;
  return (a + b + c) > 0;
});

const safeAllocatedSeedCapital = computed(() => {
  return props.allocatedSeedCapital || props.allocatedTotal || 0;
});

const safeTotalBusinessInvestment = computed(() => {
  return props.totalBusinessInvestment || safeAllocatedSeedCapital.value;
});

const ownContribution = computed(() => {
  return Math.max(0, safeTotalBusinessInvestment.value - safeAllocatedSeedCapital.value);
});

const progressPercentage = computed(() => {
  if (props.seedCapitalCeiling <= 0) return 0;
  const pct = (safeAllocatedSeedCapital.value / props.seedCapitalCeiling) * 100;
  return Math.min(Math.round(pct), 100);
});

const isOverBudget = computed(() => !props.isBudgetCompliant || props.remainingBudget < 0);
const overAmount = computed(() => Math.abs(props.remainingBudget));
</script>

<template>
  <div
    class="rounded-2xl border p-4 shadow-sm transition-all space-y-3"
    :class="[
      isOverBudget
        ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/20'
        : 'bg-white border-slate-200/90'
    ]"
  >
    <!-- Cabecera de la Barra -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl">💰</span>
        <div>
          <h3 class="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Presupuesto Capital Semilla
          </h3>
          <p class="text-base font-black text-slate-900">
            Tope Máximo: {{ formatMoney(seedCapitalCeiling) }}
          </p>
        </div>
      </div>

      <!-- Badge de Estado de Cumplimiento -->
      <div class="text-right">
        <span
          class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black tracking-tight"
          :class="[
            isOverBudget
              ? 'bg-rose-200 text-rose-900'
              : 'bg-emerald-100 text-emerald-900'
          ]"
        >
          {{ isOverBudget ? '⚠️ SOBREGIRADO' : '✓ EN PRESUPUESTO' }}
        </span>
      </div>
    </div>

    <!-- Desglose Diferenciado: Subsidio vs Inversión Total -->
    <div class="grid grid-cols-2 gap-2 text-xs pt-1">
      <div class="bg-blue-50/70 border border-blue-200/80 rounded-xl p-2.5">
        <span class="text-[10px] font-bold text-blue-800 uppercase block tracking-wider">
          Capital Semilla Asignado
        </span>
        <span
          class="text-sm font-black block mt-0.5 truncate"
          :class="isOverBudget ? 'text-rose-700' : 'text-blue-950'"
        >
          {{ formatMoney(safeAllocatedSeedCapital) }}
        </span>
        <span class="text-[10px] text-blue-600 block">De S/ {{ seedCapitalCeiling.toFixed(2) }} de subsidio</span>
      </div>

      <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
        <span class="text-[10px] font-bold text-slate-600 uppercase block tracking-wider">
          Inversión Total Negocio
        </span>
        <span class="text-sm font-black text-slate-900 block mt-0.5 truncate">
          {{ formatMoney(safeTotalBusinessInvestment) }}
        </span>
        <span class="text-[10px] text-slate-500 block">
          {{ ownContribution > 0 ? `Incluye ${formatMoney(ownContribution)} aporte propio` : '100% cubierto por subsidio' }}
        </span>
      </div>
    </div>

    <!-- Desglose por los 3 Rubros Oficiales del Plan -->
    <div v-if="hasRubrosData" class="grid grid-cols-3 gap-1.5 pt-0.5 text-center text-[10px]">
      <div class="rounded-xl border border-purple-200 bg-purple-50/70 p-2">
        <span class="text-[9px] font-black uppercase tracking-wider text-purple-800 block truncate">
          A: Equipos
        </span>
        <span class="text-xs font-black text-purple-950 block mt-0.5 truncate">
          {{ formatMoney(rubros.rubroA?.total || 0) }}
        </span>
        <span class="text-[9px] text-purple-700 block truncate">
          Fondo: {{ formatMoney(rubros.rubroA?.seed || 0) }}
        </span>
      </div>

      <div class="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2">
        <span class="text-[9px] font-black uppercase tracking-wider text-emerald-800 block truncate">
          B: Insumos S6
        </span>
        <span class="text-xs font-black text-emerald-950 block mt-0.5 truncate">
          {{ formatMoney(rubros.rubroB?.total || 0) }}
        </span>
        <span class="text-[9px] text-emerald-700 block truncate">
          Fondo: {{ formatMoney(rubros.rubroB?.seed || 0) }}
        </span>
      </div>

      <div class="rounded-xl border border-indigo-200 bg-indigo-50/70 p-2">
        <span class="text-[9px] font-black uppercase tracking-wider text-indigo-800 block truncate">
          C: Acondic./MO
        </span>
        <span class="text-xs font-black text-indigo-950 block mt-0.5 truncate">
          {{ formatMoney(rubros.rubroC?.total || 0) }}
        </span>
        <span class="text-[9px] text-indigo-700 block truncate">
          Fondo: {{ formatMoney(rubros.rubroC?.seed || 0) }}
        </span>
      </div>
    </div>

    <!-- Barra Gráfica de Progreso Dinámica (Computa Únicamente contra el Subsidio) -->
    <div>
      <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="[
            isOverBudget
              ? 'bg-rose-600 animate-pulse'
              : progressPercentage > 85
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          ]"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Métricas: Saldo Restante / Excedente -->
    <div class="flex items-center justify-between text-xs pt-0.5">
      <div>
        <span class="text-slate-500">Ejecución del tope:</span>
        <span class="font-bold ml-1 text-slate-800">{{ progressPercentage }}%</span>
      </div>

      <div class="text-right">
        <span class="text-slate-500">
          {{ isOverBudget ? 'Exceso presupuestal:' : 'Saldo disponible:' }}
        </span>
        <span
          class="font-black ml-1 text-sm"
          :class="isOverBudget ? 'text-rose-700 font-extrabold' : 'text-emerald-700'"
        >
          {{ isOverBudget ? `+${formatMoney(overAmount)}` : formatMoney(remainingBudget) }}
        </span>
      </div>
    </div>

    <!-- Alerta de Bloqueo Preventivo si excede -->
    <div
      v-if="isOverBudget"
      class="p-2.5 rounded-xl bg-rose-100/80 border border-rose-300 text-rose-900 text-xs flex items-start gap-2 animate-fadeIn"
    >
      <span class="text-base leading-none">⛔</span>
      <div>
        <strong class="font-bold block">Has superado el tope de financiamiento de S/ {{ seedCapitalCeiling.toFixed(2) }}.</strong>
        Marca algunos ítems como "Aporte propio" o reduce cantidades para poder completar esta sesión.
      </div>
    </div>
  </div>
</template>
