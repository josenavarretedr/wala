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
          <span v-else>2</span>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">
            Paso 2: Tiempo Necesario del Equipo
          </h3>
          <p class="text-sm text-gray-600">
            ¿Cuánto tiempo del equipo necesita?
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span
          v-if="completed && !expanded && isValid"
          class="text-green-700 font-semibold"
        >
          {{ formatNumber(totalTimeRequired) }} hrs
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
      <!-- Card de Información del Producto -->
      <div
        class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
      >
        <div class="flex items-center gap-3">
          <span class="text-3xl">🎯</span>
          <div>
            <p class="font-semibold text-gray-900">{{ productName }}</p>
            <p class="text-sm text-gray-600">
              Define cuánto tiempo del equipo/personal necesita este producto
            </p>
          </div>
        </div>
      </div>

      <!-- Input: Tiempo Base Requerido -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          ¿Cuántas horas necesita el equipo para este producto?
        </label>
        <div class="relative">
          <input
            type="number"
            v-model.number="baseTimeRequired"
            step="0.25"
            min="0.25"
            placeholder="Ejemplo: 2.5 horas"
            class="w-full px-4 py-3 pr-16 border-2 border-blue-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span
            class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium"
          >
            horas
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          💡 Tiempo promedio que dedica tu equipo a producir/generar
          {{ productName }}
        </p>
      </div>

      <!-- Checkbox: Tiempo de Gestión -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            v-model="addManagementTime"
            class="w-5 h-5 text-blue-600 border-gray-300 rounded mt-0.5 focus:ring-2 focus:ring-blue-500"
          />
          <div class="flex-1">
            <p class="font-medium text-gray-900">
              Agregar 30 minutos adicionales para gestión del producto/servicio
            </p>
            <p class="text-xs text-gray-600 mt-1">
              Incluye coordinación, preparación y supervisión administrativa
            </p>
          </div>
        </label>
      </div>

      <!-- Display: Tiempo Total (calculado) -->
      <div
        v-if="baseTimeRequired && baseTimeRequired > 0"
        class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300"
      >
        <label class="block text-sm font-medium text-gray-700 mb-2">
          ⏱️ Tiempo Total Requerido
        </label>
        <div class="text-3xl font-bold text-green-600 mb-2">
          {{ formatNumber(totalTimeRequired) }} horas
        </div>
        <div
          v-if="addManagementTime"
          class="text-sm text-gray-600 bg-white rounded p-2"
        >
          Base: {{ formatNumber(baseTimeRequired) }} hrs + Gestión:
          {{ MANAGEMENT_TIME_EXTRA }} hrs =
          {{ formatNumber(totalTimeRequired) }} hrs
        </div>

        <!-- Warning: Tiempo alto -->
        <div
          v-if="showHighTimeWarning"
          class="mt-3 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 flex items-start gap-2"
        >
          <span>⚠️</span>
          <span
            >¿Este producto requiere más de 24 horas? Verifica el valor
            ingresado.</span
          >
        </div>
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { MANAGEMENT_TIME_EXTRA } from "../ProductCosting/constants";

const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    default: "Producto",
  },
  productUnit: {
    type: String,
    default: "uni",
  },
  expanded: {
    type: Boolean,
    default: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["toggle", "confirm"]);

// State
const baseTimeRequired = ref(props.initialData?.baseTimeRequired || null);
const addManagementTime = ref(props.initialData?.managementTimeAdded || false);

// Computed
const totalTimeRequired = computed(() => {
  const base = baseTimeRequired.value || 0;
  const extra = addManagementTime.value ? MANAGEMENT_TIME_EXTRA : 0;
  return base + extra;
});

const isValid = computed(() => {
  return baseTimeRequired.value !== null && baseTimeRequired.value > 0;
});

const showHighTimeWarning = computed(() => {
  return totalTimeRequired.value > 24;
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
    baseTimeRequired: baseTimeRequired.value,
    managementTimeAdded: addManagementTime.value,
    totalTimeRequired: totalTimeRequired.value,
  });
};
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
