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
          Fórmula de Cálculo
        </h4>

        <!-- Fórmula Visual -->
        <div class="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div class="text-center space-y-2">
            <div class="text-sm text-gray-600">MOD por Unidad =</div>
            <div class="flex items-center justify-center gap-2">
              <div class="bg-blue-100 px-4 py-2 rounded-lg">
                <div class="text-xs text-gray-600">Total MOD</div>
                <div class="text-lg font-bold text-blue-700">
                  S/ {{ formatNumber(totalMOD) }}
                </div>
              </div>
              <div class="text-2xl text-gray-400">÷</div>
              <div class="bg-green-100 px-4 py-2 rounded-lg">
                <div class="text-xs text-gray-600">Cantidad Vendida</div>
                <div class="text-lg font-bold text-green-700">
                  {{ formatNumber(totalQuantity) }}
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

        <!-- Error: División por 0 -->
        <div
          v-if="hasError"
          class="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3"
        >
          <span class="text-2xl">❌</span>
          <div>
            <p class="font-medium text-red-900">
              No se puede calcular el costo por unidad.
            </p>
            <p class="text-sm text-red-800 mt-1">
              La cantidad vendida debe ser mayor a 0.
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
        <h4 class="font-medium text-gray-900 mb-3">Resumen del Cálculo</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Período de análisis:</span>
            <span class="font-medium text-gray-900">{{ periodSummary }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Total gastos MOD:</span>
            <span class="font-medium text-gray-900"
              >S/ {{ formatNumber(totalMOD) }}</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Cantidad vendida:</span>
            <span class="font-medium text-gray-900"
              >{{ formatNumber(totalQuantity) }} {{ productUnit }}</span
            >
          </div>
          <div class="border-t border-gray-300 pt-2 mt-2 flex justify-between">
            <span class="text-gray-900 font-semibold"
              >Costo MOD por unidad:</span
            >
            <span class="font-bold text-blue-600"
              >S/ {{ formatNumber(modPerUnit) }}</span
            >
          </div>
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

const props = defineProps({
  totalMOD: {
    type: Number,
    required: true,
  },
  totalQuantity: {
    type: Number,
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

// State
const saving = ref(false);

// Computed
const modPerUnit = computed(() => {
  if (props.totalQuantity === 0 || props.totalQuantity === null) {
    return 0;
  }
  return props.totalMOD / props.totalQuantity;
});

const hasError = computed(() => {
  return (
    props.totalQuantity === 0 ||
    props.totalQuantity === null ||
    props.totalQuantity < 0
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
    emit("save", {
      modPerUnit: modPerUnit.value,
    });
  } finally {
    // El parent manejará el estado de saving
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
