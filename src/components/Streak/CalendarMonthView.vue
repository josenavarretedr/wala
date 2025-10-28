<template>
  <div
    class="w-full max-w-sm lg:max-w-lg mx-auto bg-white rounded-xl lg:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-5"
  >
    <!-- Header con navegación -->
    <div class="flex items-center justify-between mb-3 lg:mb-4">
      <button
        @click="previousMonth"
        :disabled="!canGoPrevious"
        class="p-1.5 lg:p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
        title="Mes anterior"
      >
        <svg
          class="w-5 h-5 lg:w-6 lg:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <h2 class="text-lg sm:text-xl lg:text-xl font-bold text-gray-800">
        {{ currentMonthName }} {{ currentYear }}
      </h2>

      <button
        @click="nextMonth"
        :disabled="!canGoNext"
        class="p-1.5 lg:p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
        title="Mes siguiente"
      >
        <svg
          class="w-5 h-5 lg:w-6 lg:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>

    <!-- Días de la semana -->
    <div class="grid grid-cols-7 gap-1 mb-1 lg:mb-1.5">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-[10px] sm:text-xs font-semibold text-gray-500 uppercase py-1"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendario -->
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="day in calendarDays"
        :key="day.key"
        :class="[
          'aspect-square flex items-center justify-center rounded-md transition-all duration-200',
          getDayClasses(day),
        ]"
        @click="day.isCurrentMonth && handleDayClick(day)"
      >
        <span
          :class="[
            'text-xs sm:text-sm lg:text-sm font-semibold transition-colors',
            getDayColor(day),
          ]"
        >
          {{ day.date.getDate() }}
        </span>
      </div>
    </div>

    <!-- Leyenda -->
    <div
      class="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-200 flex flex-wrap items-center justify-center gap-3 text-[10px] sm:text-xs text-gray-600"
    >
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-md bg-red-500"></div>
        <span>Con apertura y txn</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-md bg-gray-200"></div>
        <span>Sin actividad</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-md border-2 border-blue-400"></div>
        <span>Hoy</span>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="mt-4 flex items-center justify-center">
      <div
        class="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"
      ></div>
      <span class="ml-2 text-xs lg:text-sm text-gray-600"
        >Cargando datos...</span
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useDailySummary } from "@/composables/useDailySummary";

// Composable
const { getDailySummary, hasOpening, hasTxn } = useDailySummary();

const route = useRoute();

// Emits
const emit = defineEmits(["day-selected"]);

// Reactive data
const currentDate = ref(new Date());
const dailySummaries = ref({});
const loading = ref(false);

// Computed properties
const businessId = computed(() => route.params.businessId);

// === CALENDARIO ===

const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonthName = computed(() => monthNames[currentMonth.value]);

// Fecha mínima permitida (3 meses atrás)
const minDate = computed(() => {
  const now = new Date();
  now.setMonth(now.getMonth() - 3);
  return new Date(now.getFullYear(), now.getMonth(), 1);
});

// Fecha máxima permitida (hoy)
const maxDate = computed(() => new Date());

const canGoPrevious = computed(() => {
  const firstDayOfCurrentMonth = new Date(
    currentYear.value,
    currentMonth.value,
    1
  );
  return firstDayOfCurrentMonth > minDate.value;
});

const canGoNext = computed(() => {
  const firstDayOfNextMonth = new Date(
    currentYear.value,
    currentMonth.value + 1,
    1
  );
  return firstDayOfNextMonth <= maxDate.value;
});

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  // Primer día del mes
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay();

  // Último día del mes
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const days = [];

  // Días del mes anterior (para completar la primera semana)
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date,
      key: `prev-${date.getTime()}`,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Días del mes actual
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    days.push({
      date,
      key: `current-${date.getTime()}`,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
    });
  }

  // Días del mes siguiente (para completar la última semana)
  const remainingDays = 42 - days.length; // 6 semanas * 7 días
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      key: `next-${date.getTime()}`,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return days;
});

// Navegar entre meses
const previousMonth = () => {
  if (!canGoPrevious.value) return;
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
  loadMonthSummaries();
};

const nextMonth = () => {
  if (!canGoNext.value) return;
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
  loadMonthSummaries();
};

// Obtener clases del día (fondo, cursor, etc)
const getDayClasses = (day) => {
  if (!day.isCurrentMonth) {
    return "text-gray-300 cursor-not-allowed bg-gray-50/50";
  }

  const dayString = formatDateToString(day.date);
  const summary = dailySummaries.value[dayString];

  const hasOpen = summary ? hasOpening(summary) : false;
  const hasTx = summary ? hasTxn(summary) : false;
  const isActive = hasOpen && hasTx;

  let classes = "cursor-pointer active:scale-95 ";

  // Fondo rojo para días activos
  if (isActive) {
    classes += "bg-red-500 hover:bg-red-600 ";
  } else {
    classes += "bg-gray-100 hover:bg-gray-200 ";
  }

  // Ring para el día actual
  if (day.isToday) {
    classes += "ring-2 ring-blue-400 ring-offset-1 ";
  }

  return classes;
};

// Obtener color del día según su summary
const getDayColor = (day) => {
  if (!day.isCurrentMonth) return "text-gray-300";

  const dayString = formatDateToString(day.date);
  const summary = dailySummaries.value[dayString];

  if (!summary) return "text-gray-400";

  const hasOpen = hasOpening(summary);
  const hasTx = hasTxn(summary);

  if (hasOpen && hasTx) {
    return "text-white font-bold";
  }

  return "text-gray-400";
};

// Manejar click en un día
const handleDayClick = async (day) => {
  const dayString = formatDateToString(day.date);
  const summary = dailySummaries.value[dayString];

  if (!summary) {
    // No hay datos, no emitir nada
    return;
  }

  const hasOpen = hasOpening(summary);
  const hasTx = hasTxn(summary);

  // Emitir evento con toda la información del día
  emit("day-selected", {
    date: day.date,
    dayString: dayString,
    summary: summary,
    hasOpening: hasOpen,
    hasTxn: hasTx,
    hasClosure: summary.hasClosure || false,
    dateReadable: formatDateReadable(day.date),
  });
};

// Formatear fecha a string yyyy-MM-dd
const formatDateToString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Formatear fecha legible
const formatDateReadable = (date) => {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Cargar summaries del mes actual
const loadMonthSummaries = async () => {
  if (!businessId.value) {
    console.warn("No businessId available");
    return;
  }

  loading.value = true;

  const year = currentYear.value;
  const month = currentMonth.value;

  // Limpiar summaries previos
  dailySummaries.value = {};

  // Cargar cada día del mes
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const promises = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayString = formatDateToString(date);

    promises.push(
      getDailySummary(dayString)
        .then((summary) => {
          if (summary) {
            dailySummaries.value[dayString] = summary;
          }
        })
        .catch((err) => {
          console.error(`Error cargando summary de ${dayString}:`, err);
        })
    );
  }

  await Promise.all(promises);

  loading.value = false;

  console.log(
    `📅 Cargados ${Object.keys(dailySummaries.value).length} summaries para ${
      currentMonthName.value
    }`
  );
};

// Lifecycle
onMounted(() => {
  loadMonthSummaries();
});

// Watch businessId changes
watch(businessId, () => {
  if (businessId.value) {
    loadMonthSummaries();
  }
});

// Watch cuando cambia el mes
watch([currentMonth, currentYear], () => {
  loadMonthSummaries();
});
</script>

<style scoped>
/* Animación de carga */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
