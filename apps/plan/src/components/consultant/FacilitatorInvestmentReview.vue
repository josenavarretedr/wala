<script setup>
import { ref, computed } from 'vue';
import { useFacilitatorStore } from '@/stores/facilitator';
import { useCostingCalculator } from '@/composables/useCostingCalculator';

const facilitatorStore = useFacilitatorStore();
const { formatMoney, formatPercent, roundDecimals } = useCostingCalculator();

const invData = computed(() => facilitatorStore.selectedInvestmentData || {});
const ceiling = computed(() => Number(invData.value.ceiling || facilitatorStore.activeCohortCeiling || 3000.0));
const allocated = computed(() => Number(invData.value.allocatedSeedCapital || 0));
const own = computed(() => Number(invData.value.ownContribution || 0));
const total = computed(() => Number(invData.value.totalBusinessInvestment || 0));
const remaining = computed(() => Number(invData.value.remainingBudget ?? (ceiling.value - allocated.value)));
const isCompliant = computed(() => invData.value.isBudgetCompliant ?? (remaining.value >= 0));

const percentageUsed = computed(() => {
  if (ceiling.value <= 0) return 0;
  return Math.min(100, Math.round((allocated.value / ceiling.value) * 100));
});

const allItems = computed(() => {
  return invData.value.investmentItems || invData.value.seedCapitalInvestmentPlan?.investmentItems || [];
});

// Filtro de pestaña activa en la tabla
const activeRubroFilter = ref('all'); // 'all' | 'rubro_a' | 'rubro_b' | 'rubro_c'

// Formulario de nuevo ítem colapsable
const isAddingItem = ref(false);
const newItemForm = ref({
  description: '',
  category: 'Maquinaria y Equipo',
  rubro: 'rubro_a',
  quantity: 1,
  unit: 'unidad',
  unitPriceEstimated: 100,
  financedBySeedCapital: true
});

// Ítems por rubro
const rubroA = computed(() => {
  return allItems.value.filter(
    (i) => i.rubro === 'rubro_a' || (!i.rubro && (i.category === 'Maquinaria y Equipo' || i.category === 'Herramientas'))
  );
});

const rubroB = computed(() => {
  return allItems.value.filter(
    (i) => i.rubro === 'rubro_b' || (i.isAutoDerivedFromS6 && !i.isLaborContribution) || (!i.rubro && i.category === 'Insumos y Capital de Trabajo')
  );
});

const rubroC = computed(() => {
  return allItems.value.filter(
    (i) => i.rubro === 'rubro_c' || i.isLaborContribution || (!i.rubro && (i.category === 'Acondicionamiento y Otros' || i.category === 'Mano de Obra Propia'))
  );
});

// Ítems mostrados según la pestaña seleccionada
const filteredItems = computed(() => {
  switch (activeRubroFilter.value) {
    case 'rubro_a':
      return rubroA.value;
    case 'rubro_b':
      return rubroB.value;
    case 'rubro_c':
      return rubroC.value;
    default:
      return allItems.value;
  }
});

const subtotalRubroA = computed(() => computeRubroSubtotals(rubroA.value));
const subtotalRubroB = computed(() => computeRubroSubtotals(rubroB.value));
const subtotalRubroC = computed(() => computeRubroSubtotals(rubroC.value));

function computeRubroSubtotals(items = []) {
  let subSeed = 0;
  let subOwn = 0;
  items.forEach((item) => {
    const cost = Number(item.totalPrice || 0);
    if (item.financedBySeedCapital) {
      subSeed += cost;
    } else {
      subOwn += cost;
    }
  });
  return {
    seed: roundDecimals(subSeed, 2),
    own: roundDecimals(subOwn, 2),
    total: roundDecimals(subSeed + subOwn, 2)
  };
}

function getRubroBadgeInfo(item) {
  if (item.rubro === 'rubro_a' || item.category === 'Maquinaria y Equipo' || item.category === 'Herramientas') {
    return { label: 'Rubro A', desc: 'Equipos', color: 'bg-purple-100 text-purple-900 border-purple-200' };
  }
  if (item.rubro === 'rubro_b' || item.isAutoDerivedFromS6 || item.category === 'Insumos y Capital de Trabajo') {
    return { label: 'Rubro B', desc: 'Insumos S6', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
  }
  if (item.rubro === 'rubro_c' || item.isLaborContribution || item.category === 'Acondicionamiento y Otros' || item.category === 'Mano de Obra Propia') {
    return { label: 'Rubro C', desc: 'Contrapartida', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' };
  }
  return { label: 'General', desc: 'Inversión', color: 'bg-slate-100 text-slate-800 border-slate-200' };
}

// Conmutar financiamiento (Switch)
function handleToggleFinancing(itemId) {
  if (typeof facilitatorStore.toggleInvestmentItemFinancing === 'function') {
    facilitatorStore.toggleInvestmentItemFinancing(itemId);
  } else {
    const item = allItems.value.find((i) => i.itemId === itemId);
    if (!item || item.isLaborContribution) return;
    item.financedBySeedCapital = !item.financedBySeedCapital;
    item.source = item.financedBySeedCapital ? 'capital_semilla' : 'propio';
    if (typeof facilitatorStore.recomputeSelectedInvestmentData === 'function') {
      facilitatorStore.recomputeSelectedInvestmentData();
    }
  }
}

// Modificar campos in-line
function handleUpdateField(itemId, field, value) {
  if (typeof facilitatorStore.updateFacilitatorInvestmentItem === 'function') {
    facilitatorStore.updateFacilitatorInvestmentItem(itemId, { [field]: value });
  } else {
    const item = allItems.value.find((i) => i.itemId === itemId);
    if (!item) return;
    if (field === 'quantity') item.quantity = Math.max(0.01, Number(value) || 1);
    else if (field === 'unitPriceEstimated') item.unitPriceEstimated = Math.max(0, Number(value) || 0);
    else item[field] = value;

    if (field === 'quantity' || field === 'unitPriceEstimated') {
      item.totalPrice = roundDecimals((item.quantity || 1) * (item.unitPriceEstimated || 0), 2);
    }
    if (typeof facilitatorStore.recomputeSelectedInvestmentData === 'function') {
      facilitatorStore.recomputeSelectedInvestmentData();
    }
  }
}

// Eliminar ítem
function handleRemoveItem(itemId) {
  if (typeof facilitatorStore.removeFacilitatorInvestmentItem === 'function') {
    facilitatorStore.removeFacilitatorInvestmentItem(itemId);
  } else {
    if (!invData.value?.seedCapitalInvestmentPlan) return;
    invData.value.seedCapitalInvestmentPlan.investmentItems = allItems.value.filter(
      (i) => i.itemId !== itemId || i.isLaborContribution
    );
    if (typeof facilitatorStore.recomputeSelectedInvestmentData === 'function') {
      facilitatorStore.recomputeSelectedInvestmentData();
    }
  }
}

// Agregar nuevo ítem
function handleSaveNewItem() {
  if (!newItemForm.value.description.trim()) return;

  const itemPayload = {
    description: newItemForm.value.description.trim(),
    category: newItemForm.value.category,
    rubro: newItemForm.value.rubro,
    quantity: Number(newItemForm.value.quantity) || 1,
    unit: newItemForm.value.unit || 'unidad',
    unitPriceEstimated: Number(newItemForm.value.unitPriceEstimated) || 0,
    financedBySeedCapital: newItemForm.value.financedBySeedCapital
  };

  if (typeof facilitatorStore.addFacilitatorInvestmentItem === 'function') {
    facilitatorStore.addFacilitatorInvestmentItem(itemPayload);
  }

  // Resetear form
  newItemForm.value = {
    description: '',
    category: 'Maquinaria y Equipo',
    rubro: 'rubro_a',
    quantity: 1,
    unit: 'unidad',
    unitPriceEstimated: 100,
    financedBySeedCapital: true
  };
  isAddingItem.value = false;
}

const fieldsList = computed(() => facilitatorStore.selectedSectionData?.fields || []);
</script>

<template>
  <div class="space-y-6">
    <!-- 1. DASHBOARD DEL TECHO Y EVALUACIÓN PRESUPUESTAL -->
    <div
      class="border rounded-2xl p-5 shadow-sm space-y-4 transition-all"
      :class="[
        isCompliant
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white border-slate-700'
          : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-900 text-white border-rose-600/80 shadow-rose-950/30'
      ]"
    >
      <!-- Cabecera de Estado -->
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-inner">
            🌱
          </div>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span>Plan de Inversión y Capital Semilla</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-slate-200">
                Sesión 7
              </span>
            </h3>
            <span class="text-xs text-slate-300 font-medium">
              Techo de Capital Semilla asignado a la cohorte: <strong>{{ formatMoney(ceiling) }}</strong>
            </span>
          </div>
        </div>

        <!-- Badge de Conformidad / Sobregiro -->
        <div>
          <span
            v-if="isCompliant"
            class="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs"
          >
            <span>✓</span>
            <span>Presupuesto Conforme</span>
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/60 animate-pulse shadow-xs"
          >
            <span>⚠️</span>
            <span>Sobregirado en {{ formatMoney(Math.abs(remaining)) }}</span>
          </span>
        </div>
      </div>

      <!-- Barra de Progreso del Subsidio -->
      <div class="space-y-1.5 pt-1">
        <div class="flex justify-between text-xs font-bold">
          <span class="text-slate-300">
            Subsidio Solicitado: <strong class="text-white">{{ formatMoney(allocated) }}</strong> ({{ percentageUsed }}% del techo)
          </span>
          <span :class="remaining >= 0 ? 'text-emerald-400' : 'text-rose-400 font-black'">
            {{ remaining >= 0 ? `Saldo disponible: ${formatMoney(remaining)}` : `Exceso no financiable: ${formatMoney(Math.abs(remaining))}` }}
          </span>
        </div>
        <div class="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="[
              !isCompliant
                ? 'bg-rose-500'
                : (percentageUsed > 90 ? 'bg-amber-400' : 'bg-emerald-400')
            ]"
            :style="{ width: `${percentageUsed}%` }"
          ></div>
        </div>
      </div>

      <!-- Grilla de KPIs Financieros -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10">
        <div class="bg-white/5 border border-white/10 rounded-xl p-3">
          <span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Subsidio Semilla</span>
          <span class="text-base font-black text-emerald-300 font-mono block mt-0.5">{{ formatMoney(allocated) }}</span>
          <span class="text-[10px] text-slate-400 block">Fondo concursable</span>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-3">
          <span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Aporte Propio</span>
          <span class="text-base font-black text-amber-300 font-mono block mt-0.5">{{ formatMoney(own) }}</span>
          <span class="text-[10px] text-slate-400 block">Contrapartida total</span>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-3">
          <span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Inversión Total</span>
          <span class="text-base font-black text-blue-300 font-mono block mt-0.5">{{ formatMoney(total) }}</span>
          <span class="text-[10px] text-slate-400 block">Proyecto integral</span>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-3">
          <span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Saldo Fondo</span>
          <span
            class="text-base font-black font-mono block mt-0.5"
            :class="remaining >= 0 ? 'text-emerald-300' : 'text-rose-400'"
          >
            {{ formatMoney(remaining) }}
          </span>
          <span class="text-[10px] text-slate-400 block">Disponible</span>
        </div>
      </div>
    </div>

    <!-- 2. BARRA DE CONTROL DE TABLA DENSA: FILTROS POR RUBRO Y ALTA RÁPIDA -->
    <div class="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      <!-- Selector de Pestañas de Rubro -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          @click="activeRubroFilter = 'all'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="[
            activeRubroFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          ]"
        >
          <span>Todos los Rubros</span>
          <span class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px]" :class="activeRubroFilter === 'all' ? 'bg-white/20' : 'bg-slate-200'">
            {{ allItems.length }}
          </span>
        </button>

        <button
          type="button"
          @click="activeRubroFilter = 'rubro_a'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="[
            activeRubroFilter === 'rubro_a'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
          ]"
        >
          <span>Rubro A: Equipos</span>
          <span class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px]" :class="activeRubroFilter === 'rubro_a' ? 'bg-white/20' : 'bg-purple-200'">
            {{ rubroA.length }}
          </span>
        </button>

        <button
          type="button"
          @click="activeRubroFilter = 'rubro_b'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="[
            activeRubroFilter === 'rubro_b'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
          ]"
        >
          <span>Rubro B: Insumos (S6)</span>
          <span class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px]" :class="activeRubroFilter === 'rubro_b' ? 'bg-white/20' : 'bg-emerald-200'">
            {{ rubroB.length }}
          </span>
        </button>

        <button
          type="button"
          @click="activeRubroFilter = 'rubro_c'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="[
            activeRubroFilter === 'rubro_c'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
          ]"
        >
          <span>Rubro C: Contrapartida</span>
          <span class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px]" :class="activeRubroFilter === 'rubro_c' ? 'bg-white/20' : 'bg-indigo-200'">
            {{ rubroC.length }}
          </span>
        </button>
      </div>

      <!-- Botón Agregar Ítem -->
      <button
        type="button"
        @click="isAddingItem = !isAddingItem"
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
      >
        <span>{{ isAddingItem ? '✕ Cancelar' : '+ Agregar Ítem de Inversión' }}</span>
      </button>
    </div>

    <!-- 3. FORMULARIO COLAPSABLE PARA ALTA RÁPIDA DE ÍTEM -->
    <div
      v-if="isAddingItem"
      class="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 shadow-sm space-y-3 animate-fadeIn"
    >
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-black text-blue-950 uppercase flex items-center gap-1.5">
          <span>➕</span>
          <span>Registrar Nuevo Ítem en el Plan de Inversión</span>
        </h4>
        <span class="text-[10px] text-blue-700 font-semibold">Agregado por el facilitador</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-6 gap-2.5">
        <!-- Descripción -->
        <div class="sm:col-span-2">
          <label class="text-[10px] font-bold text-slate-600 block mb-1">Descripción del Ítem</label>
          <input
            v-model="newItemForm.description"
            type="text"
            placeholder="Ej. Batidora Industrial 10L, Mostrador..."
            class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Rubro / Categoría -->
        <div>
          <label class="text-[10px] font-bold text-slate-600 block mb-1">Rubro Oficial</label>
          <select
            v-model="newItemForm.rubro"
            @change="newItemForm.category = newItemForm.rubro === 'rubro_a' ? 'Maquinaria y Equipo' : 'Acondicionamiento y Otros'"
            class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rubro_a">Rubro A: Equipos</option>
            <option value="rubro_c">Rubro C: Acondicionamiento</option>
          </select>
        </div>

        <!-- Cantidad y Unidad -->
        <div class="grid grid-cols-2 gap-1.5">
          <div>
            <label class="text-[10px] font-bold text-slate-600 block mb-1">Cant.</label>
            <input
              v-model.number="newItemForm.quantity"
              type="number"
              min="0.1"
              step="any"
              class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-600 block mb-1">Unidad</label>
            <input
              v-model="newItemForm.unit"
              type="text"
              placeholder="u, kg..."
              class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
          </div>
        </div>

        <!-- Precio Unitario Estimado -->
        <div>
          <label class="text-[10px] font-bold text-slate-600 block mb-1">Precio Unit. (S/)</label>
          <input
            v-model.number="newItemForm.unitPriceEstimated"
            type="number"
            min="0"
            step="any"
            class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
          />
        </div>

        <!-- Switch Financiamiento & Botón Guardar -->
        <div class="flex flex-col justify-end">
          <button
            type="button"
            @click="handleSaveNewItem"
            :disabled="!newItemForm.description.trim()"
            class="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            ✓ Agregar (S/ {{ formatMoney((newItemForm.quantity || 1) * (newItemForm.unitPriceEstimated || 0)) }})
          </button>
        </div>
      </div>
    </div>

    <!-- Banner Informativo de Rubro B para el Facilitador -->
    <div
      v-if="activeRubroFilter === 'rubro_b'"
      class="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 flex items-start gap-2.5"
    >
      <span class="text-base">📦</span>
      <div>
        <strong class="font-bold block text-emerald-900">Capital de Trabajo e Insumos de Arranque (1 Mes):</strong>
        Estos insumos y paquetes comerciales son calculados automáticamente a partir de las recetas de tandas (producción), suministros (servicios) o mercadería mayorista (comercio) configurados en la Sesión 6 para cubrir 1 mes de operación.
      </div>
    </div>

    <!-- 4. TABLA DENSA INTERACTIVA PARA EL FACILITADOR -->
    <div class="border border-slate-200 rounded-2xl bg-white shadow-2xs overflow-hidden">
      <div v-if="filteredItems.length === 0" class="p-8 text-center text-xs text-slate-400">
        No hay ítems registrados en este rubro. Utiliza el botón [+ Agregar Ítem de Inversión].
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
            <tr>
              <th class="py-3 px-3 w-10 text-center">#</th>
              <th class="py-3 px-3 w-28 text-center">Rubro</th>
              <th class="py-3 px-3 min-w-[220px]">Descripción del Bien o Insumo</th>
              <th class="py-3 px-2 w-28 text-center">Cant. / Medida</th>
              <th class="py-3 px-2 w-32 text-right">P. Unitario (S/)</th>
              <th class="py-3 px-2 w-32 text-right">Total (S/)</th>
              <th class="py-3 px-3 w-48 text-center">Fuente Financiamiento (Switch)</th>
              <th class="py-3 px-2 w-12 text-center">Acción</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 font-medium">
            <tr
              v-for="(item, idx) in filteredItems"
              :key="item.itemId"
              class="hover:bg-slate-50/80 transition-colors group"
              :class="item.isLaborContribution ? 'bg-indigo-50/20' : ''"
            >
              <!-- ÍNDICE -->
              <td class="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                {{ idx + 1 }}
              </td>

              <!-- BADGE DE RUBRO -->
              <td class="py-2.5 px-2 text-center">
                <span
                  class="inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-2xs"
                  :class="getRubroBadgeInfo(item).color"
                >
                  {{ getRubroBadgeInfo(item).label }}
                </span>
                <span
                  v-if="item.isAutoDerivedFromS6"
                  class="block text-[9px] text-emerald-700 font-bold mt-0.5"
                >
                  🔄 Auto S6
                </span>
              </td>

              <!-- DESCRIPCIÓN DEL ÍTEM (INPUT EDITABLE) -->
              <td class="py-2.5 px-3">
                <input
                  v-if="!item.isLaborContribution"
                  :value="item.description"
                  @change="handleUpdateField(item.itemId, 'description', $event.target.value)"
                  type="text"
                  placeholder="Descripción del ítem..."
                  class="w-full px-2 py-1 rounded-md border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold text-slate-900 bg-transparent text-xs"
                />
                <div v-else class="space-y-0.5">
                  <span class="font-extrabold text-indigo-950 block">
                    {{ item.description }}
                  </span>
                  <span class="text-[10px] text-indigo-700 block">
                    💼 Contrapartida calculada automáticamente en Sesión 6 según tarifa horaria.
                  </span>
                </div>
              </td>

              <!-- CANTIDAD Y UNIDAD (INPUT EDITABLE) -->
              <td class="py-2.5 px-2 text-center">
                <div v-if="!item.isLaborContribution" class="flex items-center justify-center gap-1">
                  <input
                    :value="item.quantity"
                    @change="handleUpdateField(item.itemId, 'quantity', $event.target.value)"
                    type="number"
                    min="0.01"
                    step="any"
                    class="w-16 px-1.5 py-1 rounded-md border border-slate-200 text-center font-bold text-slate-900 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    :value="item.unit || 'u'"
                    @change="handleUpdateField(item.itemId, 'unit', $event.target.value)"
                    type="text"
                    class="w-10 px-1 py-1 rounded-md border border-slate-200 text-center text-[11px] text-slate-600 focus:border-blue-500"
                  />
                </div>
                <div v-else class="font-mono font-bold text-indigo-900 text-center">
                  {{ item.quantity }} {{ item.unit || 'mes' }}
                </div>
              </td>

              <!-- PRECIO UNITARIO (INPUT EDITABLE) -->
              <td class="py-2.5 px-2 text-right">
                <div v-if="!item.isLaborContribution" class="relative inline-block w-28">
                  <span class="absolute left-2 top-1.5 text-slate-400 font-bold text-[10px]">S/</span>
                  <input
                    :value="item.unitPriceEstimated"
                    @change="handleUpdateField(item.itemId, 'unitPriceEstimated', $event.target.value)"
                    type="number"
                    min="0"
                    step="any"
                    class="w-full pl-6 pr-2 py-1 rounded-md border border-slate-200 text-right font-mono font-bold text-slate-900 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div v-else class="font-mono font-bold text-indigo-900 text-right">
                  {{ formatMoney(item.unitPriceEstimated || 0) }}
                </div>
              </td>

              <!-- TOTAL CALCULADO -->
              <td class="py-2.5 px-2 text-right font-black font-mono text-slate-900 text-xs">
                {{ formatMoney(item.totalPrice || 0) }}
              </td>

              <!-- SWITCH INTERACTIVO DE FINANCIAMIENTO -->
              <td class="py-2.5 px-3 text-center">
                <!-- CASO MANO DE OBRA: FIJADO OBLIGATORIO -->
                <div
                  v-if="item.isLaborContribution"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-200 select-none"
                  title="La mano de obra propia es contrapartida obligatoria (no puede solicitarse con Capital Semilla)"
                >
                  <span>🔒</span>
                  <span>Aporte Propio (Fijado)</span>
                </div>

                <!-- CASO INTERACTIVO: SWITCH ACCESIBLE -->
                <button
                  v-else
                  type="button"
                  role="switch"
                  :aria-checked="item.financedBySeedCapital"
                  @click="handleToggleFinancing(item.itemId)"
                  class="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all cursor-pointer select-none text-xs font-extrabold shadow-2xs"
                  :class="[
                    item.financedBySeedCapital
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100 ring-1 ring-emerald-400/40'
                      : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
                  ]"
                  title="Haz clic para conmutar entre Capital Semilla y Aporte Propio"
                >
                  <!-- Track del Switch -->
                  <span
                    class="relative inline-flex h-4.5 w-8 shrink-0 rounded-full transition-colors duration-200 ease-in-out"
                    :class="item.financedBySeedCapital ? 'bg-emerald-600' : 'bg-slate-300'"
                  >
                    <!-- Perilla del Switch -->
                    <span
                      class="pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5"
                      :class="item.financedBySeedCapital ? 'translate-x-4' : 'translate-x-0.5'"
                    ></span>
                  </span>

                  <!-- Etiqueta Visual -->
                  <span class="text-[11px] whitespace-nowrap font-bold">
                    {{ item.financedBySeedCapital ? '🌱 Semilla' : '👤 Propio' }}
                  </span>
                </button>
              </td>

              <!-- ACCIONES (ELIMINAR) -->
              <td class="py-2.5 px-2 text-center">
                <button
                  v-if="!item.isLaborContribution"
                  type="button"
                  @click="handleRemoveItem(item.itemId)"
                  class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Eliminar este ítem del presupuesto"
                >
                  🗑️
                </button>
                <span v-else class="text-slate-300 text-xs" title="Ítem obligatorio">🔒</span>
              </td>
            </tr>
          </tbody>

          <!-- PIE DE TABLA: RESUMEN DE TOTALES Y BALANCES -->
          <tfoot class="bg-slate-50 border-t-2 border-slate-300 font-bold text-xs text-slate-800 divide-y divide-slate-200">
            <!-- Fila Subtotales por Rubro -->
            <tr class="text-[11px]">
              <td colspan="3" class="py-2.5 px-3 text-slate-500 font-semibold">
                Subtotales por Rubro:
              </td>
              <td colspan="5" class="py-2.5 px-3">
                <div class="flex items-center justify-end gap-4 flex-wrap text-right font-mono">
                  <span>
                    <strong class="text-purple-900">Rubro A (Equipos):</strong>
                    Semilla: <span class="text-purple-700 font-black">{{ formatMoney(subtotalRubroA.seed) }}</span> |
                    Propio: <span class="text-amber-800">{{ formatMoney(subtotalRubroA.own) }}</span>
                  </span>
                  <span>
                    <strong class="text-emerald-900">Rubro B (Insumos S6):</strong>
                    Semilla: <span class="text-emerald-700 font-black">{{ formatMoney(subtotalRubroB.seed) }}</span> |
                    Propio: <span class="text-amber-800">{{ formatMoney(subtotalRubroB.own) }}</span>
                  </span>
                  <span>
                    <strong class="text-indigo-900">Rubro C (Contrapartida):</strong>
                    Propio: <span class="text-indigo-800 font-black">{{ formatMoney(subtotalRubroC.own) }}</span>
                  </span>
                </div>
              </td>
            </tr>

            <!-- Fila Gran Total Consolidado -->
            <tr class="bg-slate-100/80 text-xs">
              <td colspan="4" class="py-3 px-3 text-slate-900 font-black uppercase">
                Consolidado de Inversión y Capital Semilla:
              </td>
              <td colspan="4" class="py-3 px-3 text-right">
                <div class="flex items-center justify-end gap-5 font-mono">
                  <div>
                    <span class="text-[10px] text-slate-500 block">Subsidio Solicitado</span>
                    <span class="font-black text-sm text-emerald-700">{{ formatMoney(allocated) }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-500 block">Aporte Propio</span>
                    <span class="font-black text-sm text-amber-800">{{ formatMoney(own) }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-500 block">Inversión Total</span>
                    <span class="font-black text-base text-slate-950">{{ formatMoney(total) }}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- 5. JUSTIFICACIÓN TÉCNICA CUALITATIVA Y FORMALIZACIÓN IA -->
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
            {{ field.label || 'Justificación Técnica de Inversión y Capital Semilla' }}
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
            <span>Evaluación Técnica y Viabilidad de la Inversión:</span>
          </span>
          <span class="text-[10px] text-blue-600 font-medium">Contexto para IA</span>
        </div>
        <textarea
          v-model="field.consultantNotes"
          rows="2"
          placeholder="Evalúa la coherencia de las compras, justificación del equipamiento frente a la capacidad instalada..."
          class="w-full rounded-xl border border-blue-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all leading-relaxed shadow-xs"
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
            class="animate-spin h-4 w-4 text-violet-600"
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
                ? 'Formalizando justificación con asistente...'
                : '✨ Formalizar Justificación de Inversión con Asistente (Grok)'
            }}
          </span>
        </button>
      </div>

      <!-- Propuesta Formal Consolidada para el Plan de Negocios -->
      <div class="space-y-1.5 pt-0.5">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-violet-950 uppercase flex items-center gap-1.5">
            <span>🏛️</span>
            <span>Justificación Formal Consolidada para el Plan de Negocios:</span>
          </span>
          <span class="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
            Editable por Facilitador
          </span>
        </div>
        <textarea
          v-model="field.finalApprovedText"
          rows="4"
          placeholder="Redacción formal de la justificación técnica del uso del Capital Semilla y contrapartida del participante..."
          class="w-full rounded-xl border border-violet-300 bg-violet-50/20 p-3.5 text-xs text-slate-900 focus:bg-white focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all leading-relaxed shadow-xs"
        ></textarea>
      </div>
    </div>
  </div>
</template>
