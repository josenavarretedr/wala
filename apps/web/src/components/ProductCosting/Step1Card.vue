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
            Paso 1: Costo por Hora de MOD
          </h3>
          <p class="text-sm text-gray-600">
            Selecciona gastos y configura tiempo productivo
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span
          v-if="completed && !expanded"
          class="text-green-700 font-semibold"
        >
          S/ {{ formatNumber(costPerHour) }}/hr
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
        <!-- Valor hora del dueño configurado en Datos del Negocio -->
        <div
          v-if="ownerProfileHourlyRate > 0"
          class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p class="font-semibold text-emerald-950 text-sm">
                Valor por hora del dueño configurado: S/ {{ formatNumber(ownerProfileHourlyRate) }}/hr
              </p>
              <p class="text-xs text-emerald-800 mt-0.5">
                Puedes usarlo directamente si tú elaboras o prestas el servicio, o elegir tus registros de sueldos de equipo abajo.
              </p>
            </div>
            <button
              type="button"
              @click="toggleUseOwnerProfileRate"
              :class="[
                'px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0',
                useOwnerProfileRate
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100',
              ]"
            >
              {{
                useOwnerProfileRate
                  ? "✓ Usando valor hora del dueño"
                  : "Usar valor hora del dueño"
              }}
            </button>
          </div>
        </div>

        <!-- Sin datos históricos -->
        <div
          v-if="!hasHistoricalData && !useOwnerProfileRate"
          class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3"
        >
          <span class="text-2xl">⚠️</span>
          <div>
            <p class="font-medium text-yellow-900">
              No encontramos gastos de mano de obra directa para este período.
            </p>
            <p class="text-sm text-yellow-800 mt-1">
              {{ HELP_MESSAGES.NO_EXPENSES }}
            </p>
          </div>
        </div>

        <!-- Sin selección -->
        <div
          v-if="hasHistoricalData && selectedExpenseIds.length === 0 && !useOwnerProfileRate"
          class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
        >
          <span class="text-2xl">❌</span>
          <div>
            <p class="font-medium text-red-900">
              {{ HELP_MESSAGES.SELECT_EXPENSES }}
            </p>
          </div>
        </div>

        <!-- Lista de Expenses con Checkboxes -->
        <div v-if="expenses.length > 0" class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-3">
            Selecciona los gastos de mano de obra de {{ productName }}
          </h4>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <label
              v-for="expense in expenses"
              :key="expense.id"
              class="bg-white rounded-lg p-3 flex items-center gap-3 text-sm border-2 cursor-pointer transition-all hover:border-blue-300"
              :class="
                selectedExpenseIds.includes(expense.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              "
            >
              <!-- Checkbox -->
              <input
                type="checkbox"
                :checked="selectedExpenseIds.includes(expense.id)"
                @change="toggleExpenseSelection(expense.id)"
                class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />

              <!-- Info del Expense -->
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

              <!-- Monto -->
              <span class="font-semibold text-gray-900">
                S/ {{ formatNumber(expense.amountInRange) }}
              </span>
            </label>
          </div>

          <!-- Total Seleccionado -->
          <div
            v-if="selectedExpenseIds.length > 0"
            class="mt-3 pt-3 border-t border-gray-300 flex justify-between items-center"
          >
            <span class="text-sm font-medium text-gray-700">
              Total seleccionado ({{ selectedExpenseIds.length }} item{{
                selectedExpenseIds.length !== 1 ? "s" : ""
              }}):
            </span>
            <span class="text-lg font-bold text-blue-600">
              S/ {{ formatNumber(selectedExpensesTotal) }}
            </span>
          </div>
        </div>

        <!-- Configuración de Tiempo Productivo -->
        <div
          v-if="hasHistoricalData && selectedExpenseIds.length > 0"
          class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 space-y-4"
        >
          <h4 class="font-semibold text-gray-900">
            ⚙️ Configuración de Tiempo Productivo
          </h4>

          <!-- Días Laborables (readonly) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Días laborables en el período
            </label>
            <div
              class="w-full px-4 py-3 border-2 border-gray-200 bg-gray-100 rounded-lg text-lg font-semibold text-gray-600"
            >
              {{ workingDays }} días
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Calculado automáticamente (excluye domingos)
            </p>
          </div>

          <!-- Horas Productivas por Día -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Horas productivas por día dedicadas a {{ productName }}
            </label>
            <input
              type="number"
              v-model.number="productiveHoursPerDay"
              step="0.5"
              min="0.5"
              max="24"
              class="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="text-xs text-blue-700 mt-1 font-medium">
              💡 {{ helpText }}
            </p>
            <div
              v-if="showHighHoursWarning"
              class="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2"
            >
              ⚠️ ¿Seguro que dedicas más de 12 horas diarias a este producto?
            </div>
          </div>

          <!-- Costo por Hora Calculado -->
          <div class="bg-white rounded-lg p-4 border-2 border-blue-400">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              💰 Costo por Hora Calculado
            </label>
            <div class="text-3xl font-bold text-blue-600 mb-2">
              S/ {{ formatNumber(costPerHour) }}/hr
            </div>
            <div class="text-xs text-gray-600 bg-gray-50 rounded p-2 font-mono">
              S/ {{ formatNumber(selectedExpensesTotal) }} ÷ ({{
                workingDays
              }}
              días × {{ productiveHoursPerDay }} hrs) = S/
              {{ formatNumber(costPerHour) }}/hr
            </div>
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
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import appFirebase from "@/firebaseInit";
import { useExpenses } from "@/composables/useExpenses";
import { calculateWorkingDays } from "@/utils/dateHelpers";
import { MOD_DEFAULTS, HELP_MESSAGES } from "../ProductCosting/constants";
import { round2 } from "@/utils/mathUtils";
import Loader from "@/components/ui/Loader.vue";

const props = defineProps({
  period: {
    type: Object,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    default: "este producto",
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

const route = useRoute();
const db = getFirestore(appFirebase);
const { getExpensesByBucketAndDateRange } = useExpenses();

// State
const loading = ref(false);
const expenses = ref([]);
const selectedExpenseIds = ref([]);
const workingDays = ref(0);
const productiveHoursPerDay = ref(MOD_DEFAULTS.PRODUCTIVE_HOURS_PER_DAY);
const hasHistoricalData = ref(false);
const ownerProfileHourlyRate = ref(0);
const useOwnerProfileRate = ref(false);

// Computed
const selectedExpensesTotal = computed(() => {
  return expenses.value
    .filter((exp) => selectedExpenseIds.value.includes(exp.id))
    .reduce((sum, exp) => sum + exp.amountInRange, 0);
});

const costPerHour = computed(() => {
  if (useOwnerProfileRate.value && ownerProfileHourlyRate.value > 0) {
    return ownerProfileHourlyRate.value;
  }
  if (workingDays.value === 0 || productiveHoursPerDay.value === 0) {
    return 0;
  }
  const totalHours = workingDays.value * productiveHoursPerDay.value;
  return round2(selectedExpensesTotal.value / totalHours);
});

const helpText = computed(() => {
  return HELP_MESSAGES.PRODUCTIVE_HOURS(
    productiveHoursPerDay.value,
    MOD_DEFAULTS.FULL_WORKDAY_HOURS,
  );
});

const isValid = computed(() => {
  if (useOwnerProfileRate.value && ownerProfileHourlyRate.value > 0) {
    return true;
  }
  return (
    selectedExpenseIds.value.length > 0 &&
    productiveHoursPerDay.value > 0 &&
    costPerHour.value > 0
  );
});

const showHighHoursWarning = computed(() => {
  return (
    productiveHoursPerDay.value > MOD_DEFAULTS.MAX_PRODUCTIVE_HOURS_WARNING
  );
});

// Methods
const formatNumber = (value) => {
  if (value === null || value === undefined) return "0.00";
  return parseFloat(value).toFixed(2);
};

const toggleExpand = () => {
  emit("toggle");
};

const toggleUseOwnerProfileRate = () => {
  useOwnerProfileRate.value = !useOwnerProfileRate.value;
};

const toggleExpenseSelection = (expenseId) => {
  useOwnerProfileRate.value = false;
  const index = selectedExpenseIds.value.indexOf(expenseId);
  if (index > -1) {
    selectedExpenseIds.value.splice(index, 1);
  } else {
    selectedExpenseIds.value.push(expenseId);
  }
};

const confirmStep = () => {
  if (!isValid.value) return;

  if (useOwnerProfileRate.value && ownerProfileHourlyRate.value > 0) {
    const days = workingDays.value || 24;
    const hours = productiveHoursPerDay.value || MOD_DEFAULTS.PRODUCTIVE_HOURS_PER_DAY;
    emit("confirm", {
      costPerHour: ownerProfileHourlyRate.value,
      totalMOD: round2(ownerProfileHourlyRate.value * days * hours),
      workingDays: days,
      productiveHoursPerDay: hours,
      selectedExpenseIds: [],
      selectedExpensesDetails: [
        {
          id: "owner_profile_rate",
          description: "Valor hora del dueño (Datos del Negocio)",
          amount: ownerProfileHourlyRate.value,
        },
      ],
      usedOwnerProfileRate: true,
    });
    return;
  }

  const selectedExpensesDetails = expenses.value
    .filter((exp) => selectedExpenseIds.value.includes(exp.id))
    .map((exp) => ({
      id: exp.id,
      description: exp.description,
      amount: exp.amountInRange,
    }));

  emit("confirm", {
    costPerHour: costPerHour.value,
    totalMOD: selectedExpensesTotal.value,
    workingDays: workingDays.value,
    productiveHoursPerDay: productiveHoursPerDay.value,
    selectedExpenseIds: selectedExpenseIds.value,
    selectedExpensesDetails,
    usedOwnerProfileRate: false,
  });
};

const loadOwnerHourlyProfile = async () => {
  const businessId = route.params.businessId;
  if (!businessId) return;
  try {
    const snap = await getDoc(
      doc(db, "businesses", businessId, "settings", "businessProfile")
    );
    if (snap.exists()) {
      const data = snap.data();
      let rate = Number(data.ownerHourlyRate || 0);
      if (!(rate > 0) && Number(data.ownerSalaryAmount || 0) > 0) {
        const amt = Number(data.ownerSalaryAmount);
        const hrs = Number(data.ownerWeeklyHours || 48);
        let weeklyEq = amt;
        if (data.ownerSalaryFrequency === "biweekly") weeklyEq = amt / 2;
        else if (data.ownerSalaryFrequency === "monthly") weeklyEq = amt / 4.33;
        if (hrs > 0) rate = round2(weeklyEq / hrs);
      }
      ownerProfileHourlyRate.value = rate > 0 ? round2(rate) : 0;
    }
  } catch (err) {
    console.warn("No se pudo cargar ownerHourlyRate del perfil:", err);
  }
};

const loadExpenses = async () => {
  if (!props.period.startDate || !props.period.endDate) {
    console.warn("No se puede cargar expenses sin rango de fechas");
    return;
  }

  loading.value = true;

  try {
    await loadOwnerHourlyProfile();

    // Calcular días laborables
    workingDays.value = calculateWorkingDays(
      props.period.startDate,
      props.period.endDate,
    );

    const result = await getExpensesByBucketAndDateRange(
      "DIRECT_LABOR",
      props.period.startDate,
      props.period.endDate,
    );

    expenses.value = result.expenses;
    hasHistoricalData.value = result.count > 0;

    // Si hay datos iniciales, restaurar la selección
    if (props.initialData?.usedOwnerProfileRate && ownerProfileHourlyRate.value > 0) {
      useOwnerProfileRate.value = true;
      selectedExpenseIds.value = [];
    } else if (props.initialData?.selectedExpenseIds) {
      selectedExpenseIds.value = [...props.initialData.selectedExpenseIds];
      productiveHoursPerDay.value =
        props.initialData.productiveHoursPerDay ||
        MOD_DEFAULTS.PRODUCTIVE_HOURS_PER_DAY;
    } else if (hasHistoricalData.value) {
      // Auto-seleccionar todos los expenses encontrados
      selectedExpenseIds.value = expenses.value.map((exp) => exp.id);
    } else if (ownerProfileHourlyRate.value > 0) {
      useOwnerProfileRate.value = true;
    }

    console.log("✅ Expenses de MOD cargados:", {
      count: result.count,
      total: result.totalAmount,
      workingDays: workingDays.value,
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
