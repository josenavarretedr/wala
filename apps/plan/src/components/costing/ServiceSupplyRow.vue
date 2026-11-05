<script setup>
import { computed } from 'vue';
import { useCostingCalculator } from '@/composables/useCostingCalculator';

const props = defineProps({
  supply: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['update', 'remove']);

const { formatMoney } = useCostingCalculator();

const isBottleYield = computed(() => props.supply.supplyType === 'bottle_yield');

function handleFieldChange(fieldName, value) {
  const updated = {
    ...props.supply,
    [fieldName]: value
  };
  emit('update', updated);
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs space-y-2.5 transition-all hover:border-purple-300">
    <!-- Header del Insumo de Servicio -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 flex-1 mr-2">
        <span class="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
          {{ index }}
        </span>
        <input
          :value="supply.name"
          @change="handleFieldChange('name', $event.target.value)"
          type="text"
          placeholder="Nombre del insumo (ej. Tinte, Guantes...)"
          class="font-bold text-slate-900 text-sm bg-transparent border-b border-dashed border-slate-300 focus:border-purple-600 focus:outline-none w-full pb-0.5"
        />
      </div>

      <div class="flex items-center gap-1.5">
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded-full"
          :class="isBottleYield ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'"
        >
          {{ isBottleYield ? '🧴 Frasco Rendidor' : '🧤 Uso Único' }}
        </span>
        <button
          type="button"
          @click="$emit('remove', supply.id)"
          class="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          title="Eliminar insumo"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Inputs según tipo -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
      <!-- Precio pagado -->
      <div>
        <label class="text-[10px] font-semibold text-slate-600 block mb-0.5">
          {{ isBottleYield ? 'Precio del Frasco S/' : 'Precio del Paquete S/' }}
        </label>
        <div class="relative">
          <span class="absolute left-2.5 top-2 text-xs font-bold text-purple-700">S/</span>
          <input
            :value="supply.packageCost"
            @change="handleFieldChange('packageCost', Number($event.target.value))"
            type="number"
            min="0"
            step="any"
            class="w-full rounded-lg border border-purple-200 bg-white pl-7 pr-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[38px]"
          />
        </div>
      </div>

      <!-- Rendimiento / Cantidad -->
      <div>
        <label class="text-[10px] font-semibold text-slate-600 block mb-0.5 truncate">
          {{ isBottleYield ? 'Clientas que rinde' : 'Unidades contenidas' }}
        </label>
        <input
          :value="isBottleYield ? supply.clientsYield : supply.unitsInPackage"
          @change="handleFieldChange(isBottleYield ? 'clientsYield' : 'unitsInPackage', Number($event.target.value))"
          type="number"
          min="1"
          step="1"
          class="w-full rounded-lg border border-purple-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[38px]"
        />
      </div>

      <!-- Costo por Servicio Calculado -->
      <div class="col-span-2 sm:col-span-1 bg-purple-50/80 rounded-lg p-1.5 border border-purple-200 flex flex-col justify-center text-center">
        <span class="text-[9px] font-bold text-purple-800 uppercase tracking-tight">
          Costo por Atención
        </span>
        <span class="text-xs font-black text-purple-950">
          {{ formatMoney(supply.unitCost) }}
        </span>
      </div>
    </div>
  </div>
</template>
