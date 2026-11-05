<script setup>
import { ref, computed, watch } from 'vue';
import { useCostingStore } from '@/stores/costing';
import { useCostingCalculator } from '@/composables/useCostingCalculator';
import ServiceSupplyRow from './ServiceSupplyRow.vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const costingStore = useCostingStore();
const { formatMoney, roundDecimals, calculateLaborCostPerMinute } = useCostingCalculator();

const serviceLaborSettings = computed(() => costingStore.serviceLaborSettings);
const costPerMinute = computed(() => Number(costingStore.serviceLaborSettings?.costPerMinute) || 0.10);

const durationMinutes = ref(0);
const salePrice = ref(0);
const monthlyVolume = ref(0);

// Modal de configuración salarial mensual
const showSalaryModal = ref(false);
const salaryForm = ref({
  desiredMonthlySalary: 1200,
  daysWorkedPerMonth: 25,
  hoursWorkedPerDay: 8
});

function openSalaryModal() {
  salaryForm.value = {
    desiredMonthlySalary: costingStore.serviceLaborSettings?.desiredMonthlySalary || 1200,
    daysWorkedPerMonth: costingStore.serviceLaborSettings?.daysWorkedPerMonth || 25,
    hoursWorkedPerDay: costingStore.serviceLaborSettings?.hoursWorkedPerDay || 8
  };
  showSalaryModal.value = true;
}

const previewHours = computed(() => {
  const days = Number(salaryForm.value.daysWorkedPerMonth) || 0;
  const hours = Number(salaryForm.value.hoursWorkedPerDay) || 0;
  return days * hours;
});

const previewCostPerMinute = computed(() => {
  return calculateLaborCostPerMinute({
    desiredMonthlySalary: salaryForm.value.desiredMonthlySalary,
    daysWorkedPerMonth: salaryForm.value.daysWorkedPerMonth,
    hoursWorkedPerDay: salaryForm.value.hoursWorkedPerDay
  });
});

async function handleSaveSalarySettings() {
  if (typeof costingStore.updateServiceLaborSettings === 'function') {
    await costingStore.updateServiceLaborSettings(salaryForm.value);
  } else {
    // Fallback defensivo en caso de recarga parcial de HMR o caché de estado de Pinia
    const salary = Math.max(0, Number(salaryForm.value.desiredMonthlySalary) || 1200);
    const days = Math.max(1, Math.min(31, Number(salaryForm.value.daysWorkedPerMonth) || 25));
    const dailyHours = Math.max(1, Math.min(24, Number(salaryForm.value.hoursWorkedPerDay) || 8));
    const totalHours = days * dailyHours;
    const costPerMin = calculateLaborCostPerMinute({
      desiredMonthlySalary: salary,
      daysWorkedPerMonth: days,
      hoursWorkedPerDay: dailyHours
    });

    costingStore.serviceLaborSettings = {
      desiredMonthlySalary: salary,
      daysWorkedPerMonth: days,
      hoursWorkedPerDay: dailyHours,
      monthlyHoursWorked: totalHours,
      costPerMinute: costPerMin,
      isConfigured: true
    };

    if (costingStore.products) {
      for (const prod of costingStore.products) {
        if (prod.businessNature === 'servicio') {
          if (!prod.serviceConfig) prod.serviceConfig = {};
          prod.serviceConfig.costPerMinute = costPerMin;
        }
      }
    }
  }
  showSalaryModal.value = false;
  handleConfigChange();
}

const showAddSupply = ref(false);
const newSupply = ref({
  name: '',
  supplyType: 'bottle_yield', // 'bottle_yield' | 'single_use'
  packageCost: 0,
  unitsInPackage: 1,
  clientsYield: 1
});

watch(
  () => props.product,
  (prod) => {
    if (prod) {
      const cfg = prod.serviceConfig || {};
      durationMinutes.value = cfg.durationMinutes ?? 0;
      salePrice.value = prod.commercialization?.currentSalePrice ?? 0;
      monthlyVolume.value = prod.commercialization?.estimatedMonthlySalesVolume ?? 0;
    }
  },
  { immediate: true, deep: true }
);

const timeCost = computed(() => {
  const mins = Number(durationMinutes.value) || 0;
  const cost = Number(costPerMinute.value) || 0;
  return roundDecimals(mins * cost, 2);
});

const supplies = computed(() => props.product?.serviceConfig?.supplies || []);

const suppliesCost = computed(() => {
  return supplies.value.reduce((acc, sup) => acc + (Number(sup.unitCost) || 0), 0);
});

const directCostPerUnit = computed(() => {
  return roundDecimals(timeCost.value + suppliesCost.value, 3);
});

function handleConfigChange() {
  costingStore.updateProductService(props.product.productId, {
    durationMinutes: durationMinutes.value,
    costPerMinute: costPerMinute.value,
    currentSalePrice: salePrice.value,
    estimatedMonthlySalesVolume: monthlyVolume.value
  });
}

async function handleAddSupply() {
  if (!newSupply.value.name.trim()) return;

  await costingStore.addServiceSupply(props.product.productId, {
    name: newSupply.value.name.trim(),
    supplyType: newSupply.value.supplyType,
    packageCost: newSupply.value.packageCost,
    unitsInPackage: newSupply.value.unitsInPackage,
    clientsYield: newSupply.value.clientsYield
  });

  newSupply.value = {
    name: '',
    supplyType: 'bottle_yield',
    packageCost: 35.0,
    unitsInPackage: 1,
    clientsYield: 10
  };
  showAddSupply.value = false;
}

function handleUpdateSupply(updatedSupply) {
  costingStore.updateServiceSupply(props.product.productId, updatedSupply.id, updatedSupply);
}

function handleRemoveSupply(supplyId) {
  costingStore.removeServiceSupply(props.product.productId, supplyId);
}
</script>

<template>
  <div class="space-y-4">
    <!-- BANNER REFERENCIAL DE META SALARIAL Y VALOR DEL TIEMPO -->
    <div
      v-if="serviceLaborSettings?.isConfigured"
      class="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm border border-purple-800/80 space-y-3"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">💼</span>
          <div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-purple-200 block">
              Tu Referencia Salarial Mensual
            </span>
            <h4 class="text-sm font-black text-white">
              Meta de Sueldo: {{ formatMoney(serviceLaborSettings.desiredMonthlySalary) }} / mes
            </h4>
          </div>
        </div>
        <button
          type="button"
          @click="openSalaryModal"
          class="text-xs font-bold bg-white/10 hover:bg-white/20 text-purple-100 px-3 py-1.5 rounded-xl border border-white/20 transition-all flex items-center gap-1 min-h-[38px]"
        >
          <span>✏️</span>
          <span>Ajustar</span>
        </button>
      </div>

      <div class="grid grid-cols-3 gap-2 pt-2 border-t border-purple-800/80 text-center">
        <div class="bg-purple-950/70 rounded-xl p-2 border border-purple-800/50">
          <span class="text-[9px] text-purple-300 block font-semibold uppercase">Jornada</span>
          <span class="text-xs font-black text-white">
            {{ serviceLaborSettings.daysWorkedPerMonth }} d / {{ serviceLaborSettings.hoursWorkedPerDay }} h
          </span>
        </div>
        <div class="bg-purple-950/70 rounded-xl p-2 border border-purple-800/50">
          <span class="text-[9px] text-purple-300 block font-semibold uppercase">Horas / Mes</span>
          <span class="text-xs font-black text-white">
            {{ serviceLaborSettings.monthlyHoursWorked }} hrs
          </span>
        </div>
        <div class="bg-purple-800/90 rounded-xl p-2 border border-purple-600 shadow-xs">
          <span class="text-[9px] text-purple-200 block font-bold uppercase">Costo / Minuto</span>
          <span class="text-xs font-black text-amber-300">
            {{ formatMoney(costPerMinute) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Si aún no ha configurado su sueldo, banner de llamado a la acción -->
    <div
      v-else
      class="bg-purple-50 border border-purple-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
    >
      <div class="flex items-start gap-2.5">
        <span class="text-2xl mt-0.5">💡</span>
        <div>
          <h4 class="text-xs font-black text-purple-950 uppercase tracking-wide">
            Configura tu Meta Salarial Mensual
          </h4>
          <p class="text-xs text-purple-900 mt-0.5 leading-relaxed">
            Define cuánto deseas ganar y cuántas horas trabajas al mes para calcular automáticamente tu costo por minuto en todos tus servicios.
          </p>
        </div>
      </div>
      <button
        type="button"
        @click="openSalaryModal"
        class="w-full sm:w-auto shrink-0 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors min-h-[44px]"
      >
        💼 Configurar mi Sueldo
      </button>
    </div>

    <!-- ENTRADA A: EL MINUTERO (TIEMPO Y MANO DE OBRA) -->
    <div class="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-black uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
          <span>⏱️</span>
          <span>Entrada A: "El Minutero" (Tiempo de Atención)</span>
        </h4>
        <span class="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
          Mano de Obra
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <!-- Minutos dedicados al servicio -->
        <div>
          <label class="text-[11px] font-bold text-slate-700 block mb-1">
            Minutos por Atención
          </label>
          <div class="relative">
            <input
              v-model.number="durationMinutes"
              type="number"
              min="1"
              step="5"
              placeholder="Ej. 45"
              @change="handleConfigChange"
              class="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-base font-bold text-slate-900 focus:border-purple-600 focus:outline-none min-h-[44px]"
            />
            <span class="absolute right-3 top-3 text-xs font-semibold text-slate-400 pointer-events-none">
              min.
            </span>
          </div>
          <p class="text-[10px] text-slate-500 mt-1">Tiempo que dura el servicio</p>
        </div>

        <!-- Costo por minuto (Innato y Bloqueado 🔒) -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-[11px] font-bold text-slate-700 block">
              Costo por Minuto S/ 🔒
            </label>
            <span class="text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
              Innato
            </span>
          </div>
          <div class="relative bg-slate-100 rounded-xl border border-slate-300 px-3 py-2 flex items-center justify-between min-h-[44px]">
            <span class="text-sm font-black text-purple-950">
              {{ formatMoney(costPerMinute) }} <span class="text-xs font-bold text-slate-500">/ min</span>
            </span>
            <span class="text-[10px] text-slate-500 font-bold">
              {{ formatMoney(costPerMinute * 60) }}/h
            </span>
          </div>
          <p class="text-[10px] text-slate-500 mt-1">
            Fijado por tu meta salarial de {{ formatMoney(serviceLaborSettings?.desiredMonthlySalary || 1200) }}/mes
          </p>
        </div>
      </div>

      <!-- Tarjeta Resultado Entrada A -->
      <div class="bg-white rounded-xl p-2.5 border border-purple-200/90 flex items-center justify-between text-xs">
        <span class="text-slate-600 font-medium text-[11px]">
          Costo del tiempo en esta atención ({{ durationMinutes }} min.):
        </span>
        <span class="text-sm font-black text-purple-950">
          {{ formatMoney(timeCost) }}
        </span>
      </div>
    </div>

    <!-- ENTRADA B: INSUMOS DIRECTOS DEL SERVICIO -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <span>🧴</span>
          <span>Entrada B: Insumos y Descartables</span>
          <span class="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            {{ supplies.length }}
          </span>
        </h4>

        <button
          type="button"
          @click="showAddSupply = true"
          class="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors min-h-[36px]"
        >
          <span>+</span>
          <span>Agregar Insumo</span>
        </button>
      </div>

      <!-- Formulario Desplegable Agregar Insumo de Servicio -->
      <div
        v-if="showAddSupply"
        class="bg-purple-50/90 border border-purple-200 rounded-2xl p-4 space-y-3 animate-fadeIn"
      >
        <div class="flex items-center justify-between">
          <h5 class="text-xs font-bold text-purple-950">Nuevo Insumo para el Servicio</h5>
          <button
            type="button"
            @click="showAddSupply = false"
            class="text-xs text-purple-700 hover:text-purple-900 font-bold px-1"
          >
            ✕ Cancelar
          </button>
        </div>

        <!-- Selector de Tipo de Insumo -->
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            @click="newSupply.supplyType = 'bottle_yield'"
            :class="[
              'p-2 rounded-xl text-left border text-xs transition-all min-h-[44px]',
              newSupply.supplyType === 'bottle_yield'
                ? 'bg-purple-600 text-white border-purple-600 font-bold'
                : 'bg-white text-slate-700 border-purple-200'
            ]"
          >
            <span class="block font-bold">🧴 Frasco Rendidor</span>
            <span class="text-[10px] block opacity-85">Tinte, champú, crema, cera</span>
          </button>

          <button
            type="button"
            @click="newSupply.supplyType = 'single_use'"
            :class="[
              'p-2 rounded-xl text-left border text-xs transition-all min-h-[44px]',
              newSupply.supplyType === 'single_use'
                ? 'bg-purple-600 text-white border-purple-600 font-bold'
                : 'bg-white text-slate-700 border-purple-200'
            ]"
          >
            <span class="block font-bold">🧤 Uso Único</span>
            <span class="text-[10px] block opacity-85">Guantes, parches, papel</span>
          </button>
        </div>

        <!-- Nombre -->
        <div>
          <label class="text-[11px] font-semibold text-slate-600 block mb-1">Nombre del Insumo</label>
          <input
            v-model="newSupply.name"
            type="text"
            placeholder="Ej. Tinte negro profesional, Guantes de nitrilo..."
            class="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
          />
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label class="font-semibold text-slate-600 block mb-1">
              {{ newSupply.supplyType === 'bottle_yield' ? 'Precio del Frasco S/' : 'Precio del Paquete S/' }}
            </label>
            <input
              v-model.number="newSupply.packageCost"
              type="number"
              min="0"
              step="any"
              class="w-full rounded-lg border border-purple-300 bg-white px-2.5 py-2 text-sm font-bold text-slate-900 min-h-[44px]"
            />
          </div>

          <div v-if="newSupply.supplyType === 'bottle_yield'">
            <label class="font-semibold text-slate-600 block mb-1 truncate">
              ¿Para cuántas clientas rinde?
            </label>
            <input
              v-model.number="newSupply.clientsYield"
              type="number"
              min="1"
              step="1"
              class="w-full rounded-lg border border-purple-300 bg-white px-2.5 py-2 text-sm font-bold text-slate-900 min-h-[44px]"
            />
          </div>

          <div v-else>
            <label class="font-semibold text-slate-600 block mb-1 truncate">
              Unidades en el paquete
            </label>
            <input
              v-model.number="newSupply.unitsInPackage"
              type="number"
              min="1"
              step="1"
              class="w-full rounded-lg border border-purple-300 bg-white px-2.5 py-2 text-sm font-bold text-slate-900 min-h-[44px]"
            />
          </div>
        </div>

        <button
          type="button"
          @click="handleAddSupply"
          class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3 rounded-xl shadow-sm transition-colors min-h-[44px]"
        >
          Guardar Insumo en el Servicio
        </button>
      </div>

      <!-- Lista de Insumos de Servicio -->
      <div v-if="supplies.length" class="space-y-2.5">
        <ServiceSupplyRow
          v-for="(sup, idx) in supplies"
          :key="sup.id"
          :supply="sup"
          :index="idx + 1"
          @update="handleUpdateSupply"
          @remove="handleRemoveSupply"
        />

        <!-- Resumen de Costo Insumos -->
        <div class="bg-purple-50 rounded-xl p-2.5 border border-purple-200 flex items-center justify-between text-xs">
          <span class="text-purple-900 font-bold">Subtotal insumos por servicio:</span>
          <span class="text-sm font-black text-purple-950">{{ formatMoney(suppliesCost) }}</span>
        </div>
      </div>

      <div
        v-else
        class="p-4 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-1.5"
      >
        <span class="text-2xl">🧴</span>
        <p class="text-xs font-bold text-slate-700">Sin insumos registrados aún</p>
        <p class="text-[11px] text-slate-500">
          Si el servicio utiliza cremas, descartables o tintes, pulsa en "+ Agregar Insumo".
        </p>
      </div>
    </div>

    <!-- ENTRADA C: PRECIO DE COBRO Y VOLUMEN -->
    <div class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
          <span>🏷️</span>
          <span>Entrada C: Cobro al Cliente y Volumen</span>
        </h4>
        <span class="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
          Tarifa del Servicio
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <!-- Precio de Cobro al Cliente -->
        <div>
          <label class="text-xs font-black text-emerald-950 block mb-1">
            Tarifa / Cobro al Cliente S/
          </label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-xs font-bold text-emerald-700">S/</span>
            <input
              v-model.number="salePrice"
              type="number"
              min="0"
              step="any"
              placeholder="Ej. 35.00"
              @change="handleConfigChange"
              class="w-full rounded-xl border border-emerald-300 bg-white pl-8 pr-3 py-2 text-base font-black text-emerald-950 focus:border-emerald-600 focus:outline-none min-h-[44px]"
            />
          </div>
          <p class="text-[10px] text-emerald-700 mt-1">Lo que cobras por cada atención</p>
        </div>

        <!-- Atenciones estimadas al mes -->
        <div>
          <label class="text-xs font-bold text-slate-700 block mb-1">
            Atenciones Estimadas / Mes
          </label>
          <input
            v-model.number="monthlyVolume"
            type="number"
            min="0"
            step="1"
            placeholder="Ej. 40"
            @change="handleConfigChange"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-none min-h-[44px]"
          />
          <p class="text-[10px] text-slate-500 mt-1">Servicios proyectados al mes</p>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIGURACIÓN SALARIAL Y JORNADA LABORAL -->
    <div
      v-if="showSalaryModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
    >
      <div class="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">💼</span>
            <div>
              <h3 class="text-sm font-black text-slate-900">Meta Salarial y Jornada</h3>
              <span class="text-[10px] text-slate-500 font-medium">Referencia para todos tus servicios</span>
            </div>
          </div>
          <button
            type="button"
            @click="showSalaryModal = false"
            class="text-slate-400 hover:text-slate-700 text-base font-bold p-1"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <!-- Sueldo Mensual Deseado -->
          <div>
            <label class="font-bold text-slate-700 block mb-1">
              ¿Cuánto deseas ganar libre al mes?
            </label>
            <div class="relative">
              <span class="absolute left-3 top-2.5 text-xs font-bold text-purple-700">S/</span>
              <input
                v-model.number="salaryForm.desiredMonthlySalary"
                type="number"
                min="100"
                step="50"
                placeholder="1500"
                class="w-full rounded-xl border border-purple-300 bg-white pl-8 pr-3 py-2 text-base font-black text-purple-950 focus:border-purple-600 focus:outline-none min-h-[44px]"
              />
            </div>
            <p class="text-[10px] text-slate-500 mt-1">Tu ganancia personal estimada mensual</p>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <!-- Días trabajados al mes -->
            <div>
              <label class="font-bold text-slate-700 block mb-1">
                Días al mes
              </label>
              <input
                v-model.number="salaryForm.daysWorkedPerMonth"
                type="number"
                min="1"
                max="31"
                step="1"
                class="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-purple-600 focus:outline-none min-h-[44px]"
              />
              <p class="text-[10px] text-slate-500 mt-1">Ej. 25 o 26 días</p>
            </div>

            <!-- Horas dedicadas al día -->
            <div>
              <label class="font-bold text-slate-700 block mb-1">
                Horas al día
              </label>
              <input
                v-model.number="salaryForm.hoursWorkedPerDay"
                type="number"
                min="1"
                max="24"
                step="1"
                class="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-purple-600 focus:outline-none min-h-[44px]"
              />
              <p class="text-[10px] text-slate-500 mt-1">Ej. 8 horas/día</p>
            </div>
          </div>

          <!-- Caja de Cálculo en Vivo -->
          <div class="bg-purple-50 border border-purple-200 rounded-2xl p-3 space-y-1.5 text-center">
            <span class="text-[10px] uppercase font-bold text-purple-800 tracking-wider block">
              Resultado Automático de tu Tiempo
            </span>
            <div class="text-xl font-black text-purple-950">
              {{ formatMoney(previewCostPerMinute) }}
              <span class="text-xs font-bold text-purple-700">/ minuto</span>
            </div>
            <div class="text-[10px] text-purple-700">
              {{ previewHours }} horas al mes ({{ previewHours * 60 }} min.) &bull; {{ formatMoney(previewCostPerMinute * 60) }} / hora
            </div>
          </div>
        </div>

        <div class="flex gap-2 pt-2">
          <button
            type="button"
            @click="showSalaryModal = false"
            class="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleSaveSalarySettings"
            class="flex-1 py-2.5 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-colors min-h-[44px]"
          >
            Guardar y Aplicar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
