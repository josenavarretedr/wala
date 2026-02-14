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
          <span v-else>3</span>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">
            Paso 3: Costo MOD por Unidad
          </h3>
          <p class="text-sm text-gray-600">Cálculo final del costo</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span
          v-if="completed && !expanded && isValid"
          class="text-green-700 font-semibold"
        >
          S/ {{ formatNumber(modPerUnit) }}
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
      <!-- Fórmula y Cálculo -->
      <div
        class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <h4 class="font-semibold text-gray-900 mb-4 text-center">
          📊 Cálculo de Costo MOD por Unidad
        </h4>

        <!-- Fórmula Visual -->
        <div class="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div class="text-center space-y-2">
            <div class="text-sm text-gray-600">Costo MOD =</div>
            <div class="flex items-center justify-center gap-2">
              <div class="bg-blue-100 px-4 py-2 rounded-lg">
                <div class="text-xs text-gray-600">Costo por Hora</div>
                <div class="text-lg font-bold text-blue-700">
                  S/ {{ formatNumber(costPerHour) }}/hr
                </div>
              </div>
              <div class="text-2xl text-gray-400">×</div>
              <div class="bg-green-100 px-4 py-2 rounded-lg">
                <div class="text-xs text-gray-600">Tiempo Requerido</div>
                <div class="text-lg font-bold text-green-700">
                  {{ formatNumber(totalTimeRequired) }} hrs
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resultado -->
        <div
          v-if="!hasError"
          class="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-center shadow-lg"
        >
          <div class="text-white text-sm mb-2">Costo MOD por Unidad</div>
          <div class="text-white text-4xl font-bold">
            S/ {{ formatNumber(modPerUnit) }}
          </div>
          <div class="text-purple-200 text-xs mt-2">por {{ productUnit }}</div>
        </div>

        <!-- Error: Datos inválidos -->
        <div
          v-if="hasError"
          class="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3"
        >
          <span class="text-2xl">❌</span>
          <div>
            <p class="font-medium text-red-900">Error en el cálculo de MOD</p>
            <p class="text-sm text-red-800 mt-1">
              Verifica que el costo por hora y el tiempo requerido sean válidos.
              Revisa los pasos anteriores.
            </p>
          </div>
        </div>

        <!-- Warning: Valor alto -->
        <div
          v-if="showHighValueWarning"
          class="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-start gap-3 mt-4"
        >
          <span class="text-2xl">⚠️</span>
          <div>
            <p class="font-medium text-yellow-900">
              El costo por unidad parece alto (S/
              {{ formatNumber(modPerUnit) }}).
            </p>
            <p class="text-sm text-yellow-800 mt-1">
              ¿Estás seguro de que los datos son correctos?
            </p>
          </div>
        </div>
      </div>

      <!-- Resumen de Datos Usados -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-medium text-gray-900 mb-3">Desglose del Cálculo</h4>

        <!-- Step 1: Costo por Hora -->
        <div class="bg-white rounded-lg p-3 mb-3 border border-gray-200">
          <p class="text-xs font-semibold text-blue-700 mb-2">
            📌 Step 1: Costo por Hora
          </p>
          <div class="space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-600">Total MOD:</span>
              <span class="font-medium text-gray-900"
                >S/ {{ formatNumber(step1Data.totalMOD) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Días laborables:</span>
              <span class="font-medium text-gray-900"
                >{{ step1Data.workingDays }} días</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Horas productivas/día:</span>
              <span class="font-medium text-gray-900"
                >{{ step1Data.productiveHoursPerDay }} hrs</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Expenses seleccionados:</span>
              <span class="font-medium text-gray-900"
                >{{ step1Data.selectedExpenseIds.length }} items</span
              >
            </div>
            <div
              class="border-t border-gray-300 pt-1 mt-1 flex justify-between"
            >
              <span class="text-blue-700 font-semibold">Costo por Hora:</span>
              <span class="font-bold text-blue-700"
                >S/ {{ formatNumber(costPerHour) }}/hr</span
              >
            </div>
          </div>
        </div>

        <!-- Step 2: Tiempo Necesario -->
        <div class="bg-white rounded-lg p-3 mb-3 border border-gray-200">
          <p class="text-xs font-semibold text-green-700 mb-2">
            ⏱️ Step 2: Tiempo Necesario
          </p>
          <div class="space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-600">Tiempo base:</span>
              <span class="font-medium text-gray-900"
                >{{ formatNumber(step2Data.baseTimeRequired) }} hrs</span
              >
            </div>
            <div
              v-if="step2Data.managementTimeAdded"
              class="flex justify-between"
            >
              <span class="text-gray-600">Tiempo gestión:</span>
              <span class="font-medium text-gray-900">+ 0.5 hrs</span>
            </div>
            <div
              class="border-t border-gray-300 pt-1 mt-1 flex justify-between"
            >
              <span class="text-green-700 font-semibold">Tiempo Total:</span>
              <span class="font-bold text-green-700"
                >{{ formatNumber(totalTimeRequired) }} hrs</span
              >
            </div>
          </div>
        </div>

        <!-- Resultado Final -->
        <div
          class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 border-2 border-purple-300"
        >
          <div class="flex justify-between items-center">
            <span class="text-purple-900 font-bold">💰 Costo MOD Final:</span>
            <span class="text-2xl font-bold text-purple-600"
              >S/ {{ formatNumber(modPerUnit) }}</span
            >
          </div>
          <p class="text-xs text-purple-700 mt-1">
            Por {{ productUnit }} • {{ periodSummary }}
          </p>
        </div>
      </div>

      <!-- Botón de Guardar -->
      <button
        @click="saveResult"
        :disabled="!isValid || saving"
        :class="[
          'w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
          isValid && !saving
            ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed',
        ]"
      >
        <svg
          v-if="saving"
          class="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>{{ saving ? "Guardando..." : "Guardar Costo MOD" }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useProductCosting } from "@/composables/useProductCosting";
import { useAuth } from "@/composables/useAuth";
import { multiplyMoney } from "@/utils/mathUtils";

const props = defineProps({
  costPerHour: {
    type: Number,
    required: true,
  },
  totalTimeRequired: {
    type: Number,
    required: true,
  },
  step1Data: {
    type: Object,
    required: true,
  },
  step2Data: {
    type: Object,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  productUnit: {
    type: String,
    default: "uni",
  },
  periodSummary: {
    type: String,
    default: "",
  },
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
});

const emit = defineEmits(["toggle", "save"]);

const { saveModCalculation } = useProductCosting();
const { getCurrentUser } = useAuth();

// State
const saving = ref(false);

// Computed
const modPerUnit = computed(() => {
  if (!props.costPerHour || !props.totalTimeRequired) {
    return 0;
  }
  return multiplyMoney(props.costPerHour, props.totalTimeRequired);
});

const hasError = computed(() => {
  return (
    !props.costPerHour ||
    props.costPerHour <= 0 ||
    !props.totalTimeRequired ||
    props.totalTimeRequired <= 0
  );
});

const showHighValueWarning = computed(() => {
  return !hasError.value && modPerUnit.value > 1000;
});

const isValid = computed(() => {
  return !hasError.value && modPerUnit.value > 0;
});

// Methods
const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "0.00";
  return parseFloat(value).toFixed(2);
};

const toggleExpand = () => {
  emit("toggle");
};

const saveResult = async () => {
  if (!isValid.value || saving.value) return;

  saving.value = true;

  try {
    // Obtener usuario actual
    const currentUser = getCurrentUser();

    // Construir objeto de datos completo
    const modData = {
      costPerUnit: modPerUnit.value,
      calculation: {
        // Step 1: Costo por Hora
        costPerHour: props.step1Data.costPerHour,
        totalMOD: props.step1Data.totalMOD,
        workingDaysInPeriod: props.step1Data.workingDays,
        productiveHoursPerDay: props.step1Data.productiveHoursPerDay,
        selectedExpenseIds: props.step1Data.selectedExpenseIds,

        // Step 2: Tiempo Necesario
        baseTimeRequired: props.step2Data.baseTimeRequired,
        managementTimeAdded: props.step2Data.managementTimeAdded,
        managementTimeExtra: props.step2Data.managementTimeAdded ? 0.5 : 0,
        totalTimeRequired: props.step2Data.totalTimeRequired,

        // Step 3: Resultado
        finalCost: modPerUnit.value,

        // Metadata
        period: {
          type: props.period.period,
          startDate: props.period.startDate,
          endDate: props.period.endDate,
          summary: props.periodSummary,
        },
        calculatedAt: new Date(), // Firebase no permite serverTimestamp() en arrays
        calculatedBy: currentUser?.uid || "unknown",
      },
    };

    // Guardar en Firestore
    await saveModCalculation(props.productId, modData);

    // Emitir evento de éxito
    emit("save", {
      modPerUnit: modPerUnit.value,
      modData,
    });
  } catch (error) {
    console.error("Error guardando cálculo MOD:", error);
    throw error;
  } finally {
    setTimeout(() => {
      saving.value = false;
    }, 500);
  }
};
</script>

<style scoped>
.step-card {
  overflow: hidden;
}

button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
