<template>
  <div class="period-selector bg-white rounded-lg p-4 border border-gray-200">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Período de Análisis
    </label>

    <div class="space-y-3">
      <!-- Opciones de Período Predefinido -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in periodOptions"
          :key="option.value"
          @click="selectPeriod(option.value)"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            selectedPeriod === option.value
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          {{ option.label }}
        </button>
      </div>

      <!-- Rango Personalizado -->
      <div
        v-if="allowCustomRange && selectedPeriod === 'custom'"
        class="grid grid-cols-2 gap-3 pt-2"
      >
        <div>
          <label class="block text-xs text-gray-600 mb-1">Fecha Inicio</label>
          <input
            type="date"
            v-model="customStartDate"
            @change="updateCustomRange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">Fecha Fin</label>
          <input
            type="date"
            v-model="customEndDate"
            @change="updateCustomRange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Resumen del Período -->
      <div
        v-if="periodSummary"
        class="bg-blue-50 rounded-lg p-3 text-sm text-blue-800"
      >
        <span class="font-medium">📅 {{ periodSummary }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Timestamp } from "firebase/firestore";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      period: "current_month",
      startDate: null,
      endDate: null,
    }),
  },
  allowCustomRange: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

// State
const selectedPeriod = ref(props.modelValue.period || "current_month");
const customStartDate = ref("");
const customEndDate = ref("");

// Opciones de período
const periodOptions = computed(() => {
  const options = [
    { value: "current_month", label: "Mes Actual" },
    { value: "last_3_months", label: "Últimos 3 Meses" },
  ];

  if (props.allowCustomRange) {
    options.push({ value: "custom", label: "Personalizado" });
  }

  return options;
});

// Calcular fechas según el período seleccionado
const calculateDates = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case "current_month":
      // Primer día del mes actual
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);

      // Último día del mes actual
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "last_3_months":
      // Hace 3 meses
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      startDate.setHours(0, 0, 0, 0);

      // Último día del mes actual
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "custom":
      // Usar fechas personalizadas
      if (customStartDate.value && customEndDate.value) {
        startDate = new Date(customStartDate.value);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(customEndDate.value);
        endDate.setHours(23, 59, 59, 999);
      } else {
        return null;
      }
      break;

    default:
      return null;
  }

  return {
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
  };
};

// Resumen del período en texto
const periodSummary = computed(() => {
  if (!props.modelValue.startDate || !props.modelValue.endDate) {
    return null;
  }

  const start = props.modelValue.startDate.toDate();
  const end = props.modelValue.endDate.toDate();

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return `${formatDate(start)} - ${formatDate(end)}`;
});

// Seleccionar período
const selectPeriod = (period) => {
  selectedPeriod.value = period;

  if (period !== "custom") {
    const dates = calculateDates(period);
    if (dates) {
      emit("update:modelValue", {
        period,
        startDate: dates.startDate,
        endDate: dates.endDate,
      });
    }
  } else {
    // Para custom, esperar a que el usuario ingrese fechas
    emit("update:modelValue", {
      period: "custom",
      startDate: null,
      endDate: null,
    });
  }
};

// Actualizar rango personalizado
const updateCustomRange = () => {
  if (customStartDate.value && customEndDate.value) {
    const dates = calculateDates("custom");
    if (dates) {
      emit("update:modelValue", {
        period: "custom",
        startDate: dates.startDate,
        endDate: dates.endDate,
      });
    }
  }
};

// Inicializar con el período actual
if (!props.modelValue.startDate || !props.modelValue.endDate) {
  selectPeriod(selectedPeriod.value);
}

// Watch para cambios externos
watch(
  () => props.modelValue.period,
  (newPeriod) => {
    if (newPeriod && newPeriod !== selectedPeriod.value) {
      selectedPeriod.value = newPeriod;
    }
  },
);
</script>

<style scoped>
.period-selector {
  transition: all 0.2s ease;
}

button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
}
</style>
