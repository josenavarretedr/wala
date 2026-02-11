<template>
  <div
    :class="[
      'step-card rounded-xl border-2 transition-all duration-300',
      expanded ? 'shadow-lg' : 'shadow-md',
      completed
        ? 'border-green-500 bg-green-50'
        : expanded
          ? 'border-blue-500 bg-white'
          : 'border-gray-300 bg-gray-50',
    ]"
  >
    <!-- Header -->
    <div
      @click="toggleExpand"
      class="flex items-center justify-between p-4 cursor-pointer hover:bg-opacity-80 transition-colors"
    >
      <div class="flex items-center gap-3">
        <div
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold',
            completed
              ? 'bg-green-500 text-white'
              : expanded
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-600',
          ]"
        >
          <span v-if="completed">✓</span>
          <span v-else>1</span>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">
            Paso 1: Mano de Obra Directa Total
          </h3>
          <p class="text-sm text-gray-600">Gastos de MOD del período</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span
          v-if="completed && !expanded"
          class="text-green-700 font-semibold"
        >
          S/ {{ formatNumber(localTotalMOD) }}
        </span>
        <svg
          :class="[
            'w-5 h-5 text-gray-500 transition-transform',
            expanded ? 'rotate-180' : '',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <!-- Body -->
    <div v-if="expanded" class="p-4 pt-0 space-y-4">
      <!-- Loading State -->
      <div v-if="loading" class="py-8">
        <Loader />
        <p class="text-center text-gray-600 text-sm mt-2">
          Calculando gastos de MOD...
        </p>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Sin datos históricos -->
        <div
          v-if="!hasHistoricalData"
          class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3"
        >
          <span class="text-2xl">⚠️</span>
          <div>
            <p class="font-medium text-yellow-900">
              No encontramos datos históricos para este período.
            </p>
            <p class="text-sm text-yellow-800 mt-1">
              Por favor, ingresa un valor estimado para continuar.
            </p>
          </div>
        </div>

        <!-- Tabla de Expenses -->
        <div v-if="expenses.length > 0" class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-3">
            Gastos de Mano de Obra Directa
          </h4>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="expense in expenses"
              :key="expense.id"
              class="bg-white rounded-lg p-3 flex justify-between items-start text-sm border border-gray-200"
            >
              <div class="flex-1">
                <p class="font-medium text-gray-900">
                  {{ expense.description }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ expense.logsInRange.length }} registro{{
                    expense.logsInRange.length !== 1 ? "s" : ""
                  }}
                  en el período
                </p>
              </div>
              <span class="font-semibold text-gray-900 ml-3">
                S/ {{ formatNumber(expense.amountInRange) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Input de Total MOD -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Total Mano de Obra Directa (S/)
          </label>
          <input
            type="number"
            v-model.number="localTotalMOD"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-500 mt-1">
            Puedes editar este valor si lo consideras necesario
          </p>
        </div>

        <!-- Botón de Confirmar -->
        <button
          @click="confirmStep"
          :disabled="!isValid"
          :class="[
            'w-full py-3 rounded-lg font-semibold transition-all',
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed',
          ]"
        >
          {{ completed ? "Actualizar y Continuar" : "Confirmar y Continuar" }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useExpenses } from "@/composables/useExpenses";
import Loader from "@/components/ui/Loader.vue";

const props = defineProps({
  period: {
    type: Object,
    required: true,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  initialValue: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["toggle", "confirm"]);

const { getExpensesByBucketAndDateRange } = useExpenses();

// State
const loading = ref(false);
const expenses = ref([]);
const localTotalMOD = ref(props.initialValue || 0);
const hasHistoricalData = ref(false);

// Computed
const isValid = computed(() => {
  return localTotalMOD.value !== null && localTotalMOD.value >= 0;
});

// Methods
const formatNumber = (value) => {
  if (value === null || value === undefined) return "0.00";
  return parseFloat(value).toFixed(2);
};

const toggleExpand = () => {
  emit("toggle");
};

const confirmStep = () => {
  if (!isValid.value) return;

  emit("confirm", {
    totalMOD: localTotalMOD.value,
    hasHistoricalData: hasHistoricalData.value,
  });
};

const loadExpenses = async () => {
  if (!props.period.startDate || !props.period.endDate) {
    console.warn("No se puede cargar expenses sin rango de fechas");
    return;
  }

  loading.value = true;

  try {
    const result = await getExpensesByBucketAndDateRange(
      "DIRECT_LABOR",
      props.period.startDate,
      props.period.endDate,
    );

    expenses.value = result.expenses;
    hasHistoricalData.value = result.count > 0;

    // Actualizar el total con los datos encontrados
    if (hasHistoricalData.value) {
      localTotalMOD.value = result.totalAmount;
    } else {
      // Si no hay datos históricos, mantener el valor anterior o 0
      localTotalMOD.value = props.initialValue || 0;
    }

    console.log("✅ Expenses de MOD cargados:", {
      count: result.count,
      total: result.totalAmount,
    });
  } catch (error) {
    console.error("Error cargando expenses:", error);
    hasHistoricalData.value = false;
    expenses.value = [];
  } finally {
    loading.value = false;
  }
};

// Watchers
watch(
  () => props.period,
  (newPeriod) => {
    if (newPeriod.startDate && newPeriod.endDate && props.expanded) {
      loadExpenses();
    }
  },
  { deep: true },
);

watch(
  () => props.expanded,
  (isExpanded) => {
    if (isExpanded && props.period.startDate && props.period.endDate) {
      loadExpenses();
    }
  },
);

// Cargar al montar si está expandido
if (props.expanded && props.period.startDate && props.period.endDate) {
  loadExpenses();
}
</script>

<style scoped>
.step-card {
  overflow: hidden;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
}

button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
