<script setup>
import { ref, computed, watch } from 'vue';
import { useCostingCalculator } from '@/composables/useCostingCalculator';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  batchSize: {
    type: Number,
    default: 1
  },
  batchUnit: {
    type: String,
    default: 'unidades'
  },
  ingredientToEdit: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['save', 'close']);

const { formatMoney, computeIngredientMath } = useCostingCalculator();

const name = ref('');
const quantityUsed = ref(1);
const unit = ref('kg');
const packageUnitName = ref('bolsa de 1 kg');
const packageUnit = ref('kg');
const quantityInPackage = ref(1);
const packageCost = ref(0);
const selectedPresetId = ref('kg_1');

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilos (kg)' },
  { value: 'gr', label: 'Gramos (gr)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'unidades', label: 'Unidades (u.)' }
];

const PACKAGE_PRESETS = {
  kg: [
    { id: 'kg_1', label: 'Bolsa / Kilo suelto (1 kg)', quantity: 1, packageUnit: 'kg', packageUnitName: 'bolsa de 1 kg' },
    { id: 'kg_5', label: 'Bolsa mediana (5 kg)', quantity: 5, packageUnit: 'kg', packageUnitName: 'bolsa de 5 kg' },
    { id: 'kg_25', label: 'Saco comercial (25 kg)', quantity: 25, packageUnit: 'kg', packageUnitName: 'saco de 25 kg' },
    { id: 'kg_50', label: 'Saco mayorista (50 kg)', quantity: 50, packageUnit: 'kg', packageUnitName: 'saco de 50 kg' },
    { id: 'custom', label: 'Otro peso personalizado...', quantity: null, packageUnit: 'kg', packageUnitName: 'paquete' }
  ],
  gr: [
    { id: 'gr_1000', label: 'Bolsa / Paquete (1 kg = 1,000 gr)', quantity: 1, packageUnit: 'kg', packageUnitName: 'bolsa de 1 kg' },
    { id: 'gr_250', label: 'Bolsita chica (250 gr)', quantity: 250, packageUnit: 'gr', packageUnitName: 'bolsita de 250 gr' },
    { id: 'gr_500', label: 'Paquete mediano (500 gr)', quantity: 500, packageUnit: 'gr', packageUnitName: 'paquete de 500 gr' },
    { id: 'gr_25000', label: 'Saco comercial (25 kg)', quantity: 25, packageUnit: 'kg', packageUnitName: 'saco de 25 kg' },
    { id: 'custom', label: 'Otro peso personalizado...', quantity: null, packageUnit: 'gr', packageUnitName: 'paquete' }
  ],
  L: [
    { id: 'L_1', label: 'Botella estándar (1 L)', quantity: 1, packageUnit: 'L', packageUnitName: 'botella de 1 L' },
    { id: 'L_3', label: 'Botella familiar (3 L)', quantity: 3, packageUnit: 'L', packageUnitName: 'botella de 3 L' },
    { id: 'L_galon', label: 'Galón comercial (3.785 L)', quantity: 3.785, packageUnit: 'L', packageUnitName: 'galón' },
    { id: 'L_bidon', label: 'Bidón / Balde (20 L)', quantity: 20, packageUnit: 'L', packageUnitName: 'bidón de 20 L' },
    { id: 'custom', label: 'Otro volumen personalizado...', quantity: null, packageUnit: 'L', packageUnitName: 'botella' }
  ],
  ml: [
    { id: 'ml_1000', label: 'Botella estándar (1 L = 1,000 ml)', quantity: 1, packageUnit: 'L', packageUnitName: 'botella de 1 L' },
    { id: 'ml_250', label: 'Frasco / Botellita (250 ml)', quantity: 250, packageUnit: 'ml', packageUnitName: 'frasco de 250 ml' },
    { id: 'ml_500', label: 'Botella mediana (500 ml)', quantity: 500, packageUnit: 'ml', packageUnitName: 'botella de 500 ml' },
    { id: 'ml_galon', label: 'Galón (3.785 L = 3,785 ml)', quantity: 3.785, packageUnit: 'L', packageUnitName: 'galón' },
    { id: 'custom', label: 'Otro volumen personalizado...', quantity: null, packageUnit: 'ml', packageUnitName: 'frasco' }
  ],
  unidades: [
    { id: 'u_1', label: 'Unidad suelta (1 u.)', quantity: 1, packageUnit: 'unidades', packageUnitName: 'unidad' },
    { id: 'u_12', label: 'Docena (12 u.)', quantity: 12, packageUnit: 'unidades', packageUnitName: 'docena' },
    { id: 'u_30', label: 'Plancha de huevos (30 u.)', quantity: 30, packageUnit: 'unidades', packageUnitName: 'plancha de 30' },
    { id: 'u_24', label: 'Caja comercial (24 u.)', quantity: 24, packageUnit: 'unidades', packageUnitName: 'caja de 24' },
    { id: 'u_100', label: 'Ciento (100 u.)', quantity: 100, packageUnit: 'unidades', packageUnitName: 'ciento' },
    { id: 'custom', label: 'Otra cantidad personalizada...', quantity: null, packageUnit: 'unidades', packageUnitName: 'paquete' }
  ]
};

const availablePresets = computed(() => {
  return PACKAGE_PRESETS[unit.value] || PACKAGE_PRESETS.unidades;
});

function applyPreset(preset) {
  if (!preset) return;
  selectedPresetId.value = preset.id;
  if (preset.quantity !== null) {
    quantityInPackage.value = preset.quantity;
    packageUnitName.value = preset.packageUnitName;
    packageUnit.value = preset.packageUnit;
  } else {
    packageUnit.value = preset.packageUnit || unit.value;
  }
}

function handlePresetChange(presetId) {
  const found = availablePresets.value.find((p) => p.id === presetId);
  if (found) {
    applyPreset(found);
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.ingredientToEdit) {
        name.value = props.ingredientToEdit.name || '';
        quantityUsed.value = props.ingredientToEdit.recipeConsumption?.quantityUsed ?? 1;
        unit.value = props.ingredientToEdit.recipeConsumption?.unit || 'kg';
        packageUnitName.value = props.ingredientToEdit.marketPurchase?.packageUnitName || 'bolsa de 1 kg';
        packageUnit.value = props.ingredientToEdit.marketPurchase?.packageUnit || unit.value;
        quantityInPackage.value = props.ingredientToEdit.marketPurchase?.quantityInPackage ?? 1;
        packageCost.value = props.ingredientToEdit.marketPurchase?.packageCost ?? 0;

        const presets = availablePresets.value;
        const match = presets.find((p) => p.quantity === quantityInPackage.value && p.packageUnit === packageUnit.value);
        selectedPresetId.value = match ? match.id : 'custom';
      } else {
        name.value = '';
        quantityUsed.value = 1;
        unit.value = 'kg';
        const defaultPreset = PACKAGE_PRESETS.kg[0];
        applyPreset(defaultPreset);
        packageCost.value = 0;
      }
    }
  },
  { immediate: true }
);

watch(unit, (newUnit) => {
  const presets = PACKAGE_PRESETS[newUnit] || PACKAGE_PRESETS.unidades;
  const defaultPreset = presets[0];
  applyPreset(defaultPreset);
});

// Cálculos matemáticos en vivo con soporte de conversión transparente
const mathResult = computed(() => {
  return computeIngredientMath({
    quantityUsed: Number(quantityUsed.value) || 0,
    packageCost: Number(packageCost.value) || 0,
    quantityInPackage: Number(quantityInPackage.value) || 1,
    batchSize: Number(props.batchSize) || 1,
    recipeUnit: unit.value,
    packageUnit: packageUnit.value || unit.value
  });
});

const costIncurredInBatch = computed(() => mathResult.value.costIncurredInBatch);
const costContributionPerUnit = computed(() => mathResult.value.unitCostPerProduct);
const leftoverQuantity = computed(() => mathResult.value.leftoverQuantityInStock);

const isFormValid = computed(() => {
  return (
    name.value.trim().length > 0 &&
    Number(quantityUsed.value) > 0 &&
    Number(quantityInPackage.value) > 0 &&
    Number(packageCost.value) >= 0
  );
});

function handleSave() {
  if (!isFormValid.value) return;
  emit('save', {
    ingredientId: props.ingredientToEdit?.ingredientId || null,
    name: name.value.trim(),
    quantityUsed: Number(quantityUsed.value),
    unit: unit.value,
    packageUnitName: packageUnitName.value.trim() || 'paquete',
    packageUnit: packageUnit.value || unit.value,
    quantityInPackage: Number(quantityInPackage.value),
    packageCost: Number(packageCost.value)
  });
}

function handleClose() {
  emit('close');
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    @click.self="handleClose"
  >
    <div
      class="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col font-sans border-t sm:border border-slate-200 animate-slideUp"
      role="dialog"
      aria-modal="true"
    >
      <!-- Tirador táctil móvil -->
      <div class="pt-3 pb-1 sm:hidden shrink-0">
        <div class="w-12 h-1.5 bg-slate-300 rounded-full mx-auto"></div>
      </div>

      <!-- Cabecera del Bottom Sheet -->
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-xl">🥣</span>
          <h3 class="text-base font-black text-slate-900">
            {{ ingredientToEdit ? 'Editar Insumo de la Receta' : 'Agregar Insumo a la Receta' }}
          </h3>
        </div>
        <button
          type="button"
          @click="handleClose"
          class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-base transition-colors min-h-[44px] min-w-[44px] cursor-pointer"
          title="Cerrar ventana"
        >
          ✕
        </button>
      </div>

      <!-- Contenido scrolleable del formulario -->
      <div class="p-5 overflow-y-auto space-y-4">
        <!-- Nombre del Insumo -->
        <div>
          <label class="text-xs font-bold text-slate-800 block mb-1">
            ¿Qué insumo vas a agregar? <span class="text-red-500">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="Ej. Pechuga de pollo, Harina sin preparar, Aceite vegetal..."
            class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none min-h-[48px]"
          />
        </div>

        <!-- PASO 1: LA RECETA (EL PLATO) - CON SELECT INLINE Y RECORDATORIO DE TANDA -->
        <div class="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">🍽️</span>
              <h4 class="text-xs font-black uppercase tracking-wider text-amber-950">
                1. En tu preparación:
              </h4>
            </div>
            <span class="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-200/90 text-amber-950 border border-amber-300">
              Para {{ batchSize }} {{ batchUnit }}
            </span>
          </div>

          <div>
            <label class="text-xs font-bold text-amber-950 block mb-1.5">
              ¿Cuánto usas para preparar estas {{ batchSize }} {{ batchUnit }}?
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="quantityUsed"
                type="number"
                inputmode="decimal"
                step="any"
                min="0.001"
                placeholder="1"
                class="w-32 text-2xl sm:text-3xl font-black text-slate-900 bg-white border border-amber-300 rounded-xl px-3 py-2 text-center focus:border-amber-600 focus:outline-none min-h-[48px]"
              />
              <select
                v-model="unit"
                class="flex-1 text-sm font-bold text-slate-800 bg-white border border-amber-300 rounded-xl px-3 py-2 focus:border-amber-600 focus:outline-none min-h-[48px] cursor-pointer"
              >
                <option v-for="opt in UNIT_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <p class="text-[11px] text-amber-900/80 mt-1">
              Ingresa lo que entra en la olla o preparación completa de {{ batchSize }} {{ batchUnit }}.
            </p>
          </div>
        </div>

        <!-- PASO 2: LA COMPRA (LA CASERA) - SELECTOR INTELIGENTE -->
        <div class="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-4 space-y-3.5">
          <div class="flex items-center gap-2">
            <span class="text-base">🛒</span>
            <h4 class="text-xs font-black uppercase tracking-wider text-blue-950">
              2. En el mercado o proveedor:
            </h4>
          </div>

          <!-- Selector Inteligente de Presentación -->
          <div>
            <label class="text-xs font-bold text-blue-950 block mb-1">
              ¿Cómo compras este insumo en el mercado?
            </label>
            <select
              v-model="selectedPresetId"
              @change="handlePresetChange(selectedPresetId)"
              class="w-full text-sm font-bold text-slate-800 bg-white border border-blue-300 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none min-h-[48px] cursor-pointer"
            >
              <option v-for="preset in availablePresets" :key="preset.id" :value="preset.id">
                {{ preset.label }}
              </option>
            </select>
          </div>

          <!-- Precio Total Pagado -->
          <div>
            <label class="text-xs font-bold text-blue-950 block mb-1">
              ¿Cuánto te cuesta esa compra ({{ packageUnitName || 'paquete' }})?
            </label>
            <div class="relative flex items-center">
              <span class="absolute left-3.5 text-lg font-bold text-blue-700">S/</span>
              <input
                v-model.number="packageCost"
                type="number"
                inputmode="decimal"
                step="any"
                min="0"
                placeholder="0.00"
                class="w-full text-2xl sm:text-3xl font-black text-blue-950 bg-white border border-blue-300 rounded-xl pl-10 pr-3.5 py-2 focus:border-blue-600 focus:outline-none min-h-[48px]"
              />
            </div>
          </div>

          <!-- Cantidad y Nombre del Empaque Personalizado -->
          <div v-if="selectedPresetId === 'custom'" class="pt-1 space-y-2 border-t border-blue-200/60 animate-fadeIn">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[11px] font-bold text-slate-700 block mb-1">
                  Cantidad que contiene
                </label>
                <input
                  v-model.number="quantityInPackage"
                  type="number"
                  inputmode="decimal"
                  step="any"
                  min="0.001"
                  placeholder="Ej. 1, 5, 25..."
                  class="w-full text-lg font-bold text-slate-900 bg-white border border-blue-300 rounded-xl px-3 py-2 focus:border-blue-600 focus:outline-none min-h-[44px]"
                />
              </div>
              <div>
                <label class="text-[11px] font-bold text-slate-700 block mb-1">
                  Nombre (ej. saco, botella)
                </label>
                <input
                  v-model="packageUnitName"
                  type="text"
                  placeholder="paquete, caja..."
                  class="w-full text-sm font-semibold text-slate-800 bg-white border border-blue-300 rounded-xl px-3 py-2 focus:border-blue-600 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>
          </div>
          <div v-else class="flex items-center justify-between text-xs text-blue-900/80 bg-blue-100/50 px-3 py-2 rounded-xl border border-blue-200/60">
            <span>Contenido registrado:</span>
            <strong class="font-black text-blue-950">{{ quantityInPackage }} {{ packageUnit }}</strong>
          </div>
        </div>

        <!-- FEEDBACK MATEMÁTICO INMEDIATO CON RESUMEN INTELIGENTE -->
        <div
          v-if="costIncurredInBatch > 0"
          class="bg-emerald-50 border border-emerald-300/80 rounded-2xl p-4 text-xs text-emerald-950 flex items-center gap-3 shadow-xs"
        >
          <span class="text-2xl shrink-0">💡</span>
          <div class="flex-1">
            <span class="block font-bold text-emerald-900">
              Costo de este insumo para preparar {{ batchSize }} {{ batchUnit }}:
              <strong class="text-base font-black text-emerald-950 ml-1">{{ formatMoney(costIncurredInBatch) }}</strong>
            </span>
            <span class="text-[11px] text-emerald-700 block mt-0.5">
              (Equivale a <strong class="font-bold">{{ formatMoney(costContributionPerUnit) }}</strong> por cada {{ batchUnit.replace(/es$/, '').replace(/s$/, '') }} terminado. Sobran {{ leftoverQuantity }} {{ unit }} en despensa).
            </span>
          </div>
        </div>
      </div>

      <!-- Botón de Acción Principal -->
      <div class="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl sm:rounded-b-2xl shrink-0">
        <button
          type="button"
          :disabled="!isFormValid"
          @click="handleSave"
          class="w-full rounded-xl py-3.5 px-4 font-black text-sm text-white transition-all shadow-sm flex items-center justify-center gap-2 min-h-[48px] cursor-pointer active:scale-[0.99]"
          :class="[
            isFormValid
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          ]"
        >
          <span>✓</span>
          <span>{{ ingredientToEdit ? 'Guardar Cambios en el Insumo' : 'Guardar Insumo en el Plato' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
