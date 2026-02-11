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
            Paso 2: Cantidad Vendida del Producto
          </h3>
          <p class="text-sm text-gray-600">Historial de ventas del período</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span
          v-if="completed && !expanded"
          class="text-green-700 font-semibold"
        >
          {{ formatNumber(localQuantity) }} {{ productUnit }}
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
          Calculando ventas del período...
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
              No encontramos ventas para este producto en el período.
            </p>
            <p class="text-sm text-yellow-800 mt-1">
              Por favor, ingresa una cantidad estimada para continuar.
            </p>
          </div>
        </div>

        <!-- Información del Producto -->
        <div
          v-if="productName"
          class="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <p class="text-sm text-blue-800">
            <span class="font-medium">Producto:</span> {{ productName }}
          </p>
          <p class="text-xs text-blue-700 mt-1">
            Analizando ventas del período seleccionado
          </p>
        </div>

        <!-- Resumen de Ventas -->
        <div v-if="stockLogs.length > 0" class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-3">Historial de Ventas</h4>
          <div class="grid grid-cols-2 gap-4 mb-3">
            <div class="bg-white rounded-lg p-3 border border-gray-200">
              <p class="text-xs text-gray-600">Total Transacciones</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ stockLogs.length }}
              </p>
            </div>
            <div class="bg-white rounded-lg p-3 border border-gray-200">
              <p class="text-xs text-gray-600">Cantidad Total</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ formatNumber(calculatedQuantity) }}
              </p>
            </div>
          </div>

          <!-- Lista de ventas (últimas 5) -->
          <div
            v-if="stockLogs.length > 0"
            class="space-y-2 max-h-40 overflow-y-auto"
          >
            <p class="text-xs text-gray-600 mb-2">Últimas transacciones:</p>
            <div
              v-for="(log, index) in stockLogs.slice(0, 5)"
              :key="log.id"
              class="bg-white rounded-lg p-2 flex justify-between items-center text-sm border border-gray-200"
            >
              <div>
                <p class="font-medium text-gray-700">
                  {{ formatDate(log.createdAt) }}
                </p>
              </div>
              <span class="font-semibold text-gray-900">
                {{ formatNumber(log.quantity) }} {{ productUnit }}
              </span>
            </div>
            <p
              v-if="stockLogs.length > 5"
              class="text-xs text-gray-500 text-center pt-2"
            >
              + {{ stockLogs.length - 5 }} transacciones más
            </p>
          </div>
        </div>

        <!-- Input de Cantidad -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Cantidad Total Vendida ({{ productUnit }})
          </label>
          <input
            type="number"
            v-model.number="localQuantity"
            step="0.01"
            min="0.01"
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
import { useInventory } from "@/composables/useInventory";
import Loader from "@/components/ui/Loader.vue";

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

const { getStockLogsByDateRange } = useInventory();

// State
const loading = ref(false);
const stockLogs = ref([]);
const localQuantity = ref(props.initialValue || 0);
const hasHistoricalData = ref(false);

// Computed
const isValid = computed(() => {
  return localQuantity.value !== null && localQuantity.value > 0;
});

const calculatedQuantity = computed(() => {
  return stockLogs.value.reduce((sum, log) => sum + (log.quantity || 0), 0);
});

// Methods
const formatNumber = (value) => {
  if (value === null || value === undefined) return "0.00";
  return parseFloat(value).toFixed(2);
};

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const toggleExpand = () => {
  emit("toggle");
};

const confirmStep = () => {
  if (!isValid.value) return;

  emit("confirm", {
    totalQuantity: localQuantity.value,
    hasHistoricalData: hasHistoricalData.value,
  });
};

const loadStockLogs = async () => {
  if (!props.period.startDate || !props.period.endDate) {
    console.warn("No se puede cargar stockLogs sin rango de fechas");
    return;
  }

  loading.value = true;

  try {
    const logs = await getStockLogsByDateRange(
      props.productId,
      props.period.startDate,
      props.period.endDate,
      "sell",
    );

    stockLogs.value = logs;
    hasHistoricalData.value = logs.length > 0;

    // Actualizar la cantidad con los datos encontrados
    if (hasHistoricalData.value) {
      localQuantity.value = calculatedQuantity.value;
    } else {
      // Si no hay datos históricos, mantener el valor anterior o 0
      localQuantity.value = props.initialValue || 0;
    }

    console.log("✅ StockLogs de ventas cargados:", {
      count: logs.length,
      totalQuantity: calculatedQuantity.value,
    });
  } catch (error) {
    console.error("Error cargando stockLogs:", error);
    hasHistoricalData.value = false;
    stockLogs.value = [];
  } finally {
    loading.value = false;
  }
};

// Watchers
watch(
  () => props.period,
  (newPeriod) => {
    if (newPeriod.startDate && newPeriod.endDate && props.expanded) {
      loadStockLogs();
    }
  },
  { deep: true },
);

watch(
  () => props.expanded,
  (isExpanded) => {
    if (isExpanded && props.period.startDate && props.period.endDate) {
      loadStockLogs();
    }
  },
);

// Cargar al montar si está expandido
if (props.expanded && props.period.startDate && props.period.endDate) {
  loadStockLogs();
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
