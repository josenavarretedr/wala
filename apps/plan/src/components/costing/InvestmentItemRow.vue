<script setup>
import { computed } from 'vue';
import { useCostingCalculator } from '@/composables/useCostingCalculator';

const props = defineProps({
  item: {
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

const isLabor = computed(() => !!props.item.isLaborContribution);
const isAutoDerived = computed(() => !!props.item.isAutoDerivedFromS6 && !isLabor.value);

const isFinanced = computed(() => {
  if (isLabor.value) return false;
  return props.item.financedBySeedCapital !== false;
});

const rubroBadge = computed(() => {
  if (props.item.rubro === 'rubro_a' || props.item.category === 'Maquinaria y Equipo' || props.item.category === 'Herramientas') {
    return { label: 'Rubro A', color: 'bg-purple-100 text-purple-900 border-purple-200' };
  }
  if (props.item.rubro === 'rubro_b' || isAutoDerived.value || props.item.category === 'Insumos y Capital de Trabajo') {
    return { label: 'Rubro B', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
  }
  if (props.item.rubro === 'rubro_c' || isLabor.value || props.item.category === 'Acondicionamiento y Otros' || props.item.category === 'Mano de Obra Propia') {
    return { label: 'Rubro C', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' };
  }
  return null;
});

const categoryColor = computed(() => {
  if (isLabor.value) {
    return 'bg-indigo-100 text-indigo-900 border-indigo-200';
  }
  switch (props.item.category) {
    case 'Maquinaria y Equipo':
      return 'bg-purple-100 text-purple-900 border-purple-200';
    case 'Herramientas':
      return 'bg-blue-100 text-blue-900 border-blue-200';
    case 'Insumos y Capital de Trabajo':
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    default:
      return 'bg-amber-100 text-amber-900 border-amber-200';
  }
});

const categoryIcon = computed(() => {
  if (isLabor.value) return '💼';
  switch (props.item.category) {
    case 'Maquinaria y Equipo':
      return '⚙️';
    case 'Herramientas':
      return '🔧';
    case 'Insumos y Capital de Trabajo':
      return '📦';
    default:
      return '💡';
  }
});

function handleFieldChange(field, value) {
  if (isLabor.value) return;
  const updated = { ...props.item, [field]: value };
  emit('update', updated);
}

function toggleFinancing() {
  if (isLabor.value) return;
  const nextFinanced = !isFinanced.value;
  const updated = {
    ...props.item,
    financedBySeedCapital: nextFinanced,
    source: nextFinanced ? 'capital_semilla' : 'propio'
  };
  emit('update', updated);
}
</script>

<template>
  <div
    class="rounded-2xl border p-4 shadow-xs space-y-3 transition-all"
    :class="[
      isLabor
        ? 'bg-indigo-50/50 border-indigo-200/90'
        : isFinanced
        ? 'bg-white border-slate-200/90 hover:border-blue-300'
        : 'bg-slate-50/80 border-slate-300/80 hover:border-slate-400'
    ]"
  >
    <!-- Cabecera del Ítem -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 flex-1 mr-2 flex-wrap">
        <span
          class="w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0"
          :class="isFinanced ? 'bg-slate-100 text-slate-700' : 'bg-slate-200 text-slate-500'"
        >
          {{ index }}
        </span>

        <!-- Badge de Rubro -->
        <span
          v-if="rubroBadge"
          class="inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 uppercase tracking-wider"
          :class="rubroBadge.color"
        >
          {{ rubroBadge.label }}
        </span>

        <!-- Badge de Categoría -->
        <span
          class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0"
          :class="categoryColor"
        >
          <span>{{ categoryIcon }}</span>
          <span>{{ item.category }}</span>
        </span>

        <!-- Badge sutil si es Aporte Propio -->
        <span
          v-if="!isFinanced && !isLabor"
          class="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 shrink-0"
        >
          🏠 Aporte Propio &bull; S/ 0 al subsidio
        </span>

        <!-- Badge específico para Mano de Obra Propia -->
        <span
          v-if="isLabor"
          class="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 shrink-0"
        >
          💼 Contrapartida del Emprendedor
        </span>
      </div>

      <!-- Botón Eliminar (Desactivado para mano de obra propia obligatoria) -->
      <button
        v-if="!isLabor"
        type="button"
        @click="$emit('remove', item.itemId)"
        class="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
        title="Eliminar este ítem"
      >
        ✕
      </button>
      <span
        v-else
        class="text-indigo-400 text-xs px-2 py-1 font-bold"
        title="La contrapartida de mano de obra propia es obligatoria"
      >
        🔒 Fijo
      </span>
    </div>

    <!-- Descripción del Ítem -->
    <div>
      <input
        :value="item.description"
        :readonly="isLabor"
        @change="handleFieldChange('description', $event.target.value)"
        type="text"
        placeholder="Descripción del bien o insumo..."
        class="w-full text-sm font-bold bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 focus:outline-none pb-1"
        :class="[
          isLabor ? 'text-indigo-950 cursor-default' : isFinanced ? 'text-slate-900' : 'text-slate-700'
        ]"
      />
      <p v-if="isLabor" class="text-[10px] text-indigo-700 mt-1">
        Valorización mensual calculada según tu tiempo y tarifa horaria proyectada en la Sesión 6.
      </p>
    </div>

    <!-- Fila de Cálculo: Cantidad x Precio Unitario = Total -->
    <div class="grid grid-cols-3 gap-2 items-center pt-1 text-xs">
      <!-- Cantidad -->
      <div>
        <label class="text-[11px] font-semibold text-slate-500 block mb-0.5">Cantidad</label>
        <input
          :value="item.quantity"
          :readonly="isLabor"
          @change="handleFieldChange('quantity', Number($event.target.value))"
          type="number"
          min="1"
          step="1"
          class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none min-h-[44px]"
          :class="{ 'bg-slate-100 text-slate-600 cursor-not-allowed': isLabor }"
        />
      </div>

      <!-- Precio Unitario Estimado -->
      <div>
        <label class="text-[11px] font-semibold text-slate-500 block mb-0.5">Precio Unit. S/</label>
        <input
          :value="item.unitPriceEstimated"
          :readonly="isLabor"
          @change="handleFieldChange('unitPriceEstimated', Number($event.target.value))"
          type="number"
          min="0"
          step="any"
          class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none min-h-[44px]"
          :class="{ 'bg-slate-100 text-slate-600 cursor-not-allowed': isLabor }"
        />
      </div>

      <!-- Total Calculado -->
      <div
        class="rounded-xl p-2 border text-center transition-colors"
        :class="[
          isLabor
            ? 'bg-indigo-100/70 border-indigo-300'
            : isFinanced
            ? 'bg-blue-50/80 border-blue-200'
            : 'bg-slate-100 border-slate-200'
        ]"
      >
        <span
          class="text-[10px] font-bold uppercase block tracking-wider"
          :class="isLabor ? 'text-indigo-900' : isFinanced ? 'text-blue-800' : 'text-slate-600'"
        >
          Total
        </span>
        <span
          class="text-sm sm:text-base font-black block truncate"
          :class="isLabor ? 'text-indigo-950' : isFinanced ? 'text-blue-950' : 'text-slate-800'"
        >
          {{ formatMoney(item.totalPrice) }}
        </span>
      </div>
    </div>

    <!-- Switch / Toggle Accesible de Financiamiento (Mínimo 44px de área táctil) -->
    <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
      <!-- CASO MANO DE OBRA PROPIA: BLOQUEADO ESTRICTO COMO APORTE PROPIO -->
      <div
        v-if="isLabor"
        class="w-full flex items-center justify-between p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/80 text-indigo-950 min-h-[48px]"
      >
        <div class="flex items-center gap-2 text-left">
          <span class="text-base">💼</span>
          <div>
            <span class="text-xs font-bold block">Aporte Propio (No financiable con donación)</span>
            <span class="text-[10px] block text-indigo-700">
              Suma a la inversión total del negocio, pero no descuenta del fondo de capital semilla.
            </span>
          </div>
        </div>
        <span class="text-xs font-black text-indigo-900 bg-indigo-200/80 px-2 py-1 rounded-md shrink-0 ml-2">
          S/ 0 Subsidio
        </span>
      </div>

      <!-- CASO REGULAR: TOGGLE INTERACTIVO -->
      <button
        v-else
        type="button"
        role="switch"
        :aria-checked="isFinanced"
        @click="toggleFinancing"
        class="w-full flex items-center justify-between p-2 rounded-xl transition-all min-h-[48px] cursor-pointer active:scale-[0.99] border"
        :class="[
          isFinanced
            ? 'bg-emerald-50/90 border-emerald-300 hover:bg-emerald-100/80'
            : 'bg-slate-100/90 border-slate-300 hover:bg-slate-200/80'
        ]"
      >
        <div class="flex items-center gap-2 text-left">
          <span class="text-base">{{ isFinanced ? '🎁' : '🏠' }}</span>
          <div>
            <span
              class="text-xs font-bold block"
              :class="isFinanced ? 'text-emerald-950' : 'text-slate-700'"
            >
              {{ isFinanced ? 'Solicitar con Capital Semilla' : 'Ya lo tengo / Aporte propio' }}
            </span>
            <span
              class="text-[10px] block font-medium"
              :class="isFinanced ? 'text-emerald-700' : 'text-slate-500'"
            >
              {{ isFinanced ? 'Suma al tope del subsidio financiado' : 'No descuenta del presupuesto del fondo' }}
            </span>
          </div>
        </div>

        <!-- Indicador gráfico de Switch -->
        <div
          class="w-11 h-6 rounded-full transition-colors relative shrink-0 ml-2"
          :class="isFinanced ? 'bg-emerald-500' : 'bg-slate-300'"
        >
          <div
            class="w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-0.5"
            :class="isFinanced ? 'translate-x-5' : 'translate-x-0.5'"
          ></div>
        </div>
      </button>
    </div>
  </div>
</template>
