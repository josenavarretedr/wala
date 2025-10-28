<template>
  <div class="min-h-screenp-3 sm:p-4 lg:p-6">
    <!-- Header -->
    <div class="max-w-sm lg:max-w-lg mx-auto mb-4 lg:mb-5">
      <div class="flex items-center gap-3 mb-2">
        <button
          @click="goBack"
          class="p-1.5 lg:p-2 rounded-lg hover:bg-white/80 transition-colors"
          title="Volver"
        >
          <svg
            class="w-5 h-5 lg:w-6 lg:h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <FireFlame class="text-red-500 text-bold" />
        <h1 class="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-800">
          Racha de actividad
        </h1>
      </div>
      <p class="text-xs sm:text-sm text-gray-600 ml-11 lg:ml-12">
        Vista del calendario con tus días activos
      </p>
    </div>

    <!-- Componente de calendario -->
    <CalendarMonthView @day-selected="handleDaySelected" />

    <!-- Componente de detalles del día -->
    <StreakDetails
      ref="streakDetailsRef"
      :selectedDay="selectedDay"
      @clear-selection="handleClearSelection"
    />
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import CalendarMonthView from "@/components/Streak/CalendarMonthView.vue";
import StreakDetails from "@/components/Streak/StreakDetails.vue";
import { FireFlame } from "@iconoir/vue";
import { useDailySummary } from "@/composables/useDailySummary";

const router = useRouter();
const route = useRoute();
const selectedDay = ref(null);
const streakDetailsRef = ref(null);

const { getDailySummary, hasOpening, hasTxn } = useDailySummary();

const goBack = () => {
  router.back();
};

const handleDaySelected = async (dayData) => {
  console.log("📅 Día seleccionado:", dayData);
  selectedDay.value = dayData;

  // Esperar a que el DOM se actualice
  await nextTick();

  // Hacer scroll suave hacia StreakDetails
  if (streakDetailsRef.value && streakDetailsRef.value.$el) {
    streakDetailsRef.value.$el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

const handleClearSelection = () => {
  console.log("🔄 Limpiando selección de día");
  selectedDay.value = null;
};

// Cargar datos del día actual al montar
const loadTodayData = async () => {
  try {
    const today = new Date();
    const dayString = formatDateToString(today);

    console.log("📅 Cargando datos del día actual:", dayString);

    const summary = await getDailySummary(dayString);

    if (summary) {
      const hasOpen = hasOpening(summary);
      const hasTx = hasTxn(summary);

      // Si tiene apertura o transacciones, cargar automáticamente
      if (hasOpen || hasTx) {
        selectedDay.value = {
          date: today,
          dayString: dayString,
          summary: summary,
          hasOpening: hasOpen,
          hasTxn: hasTx,
          hasClosure: summary.hasClosure || false,
          dateReadable: formatDateReadable(today),
        };

        console.log("✅ Día actual cargado automáticamente con datos");
      } else {
        console.log("ℹ️ Día actual sin actividad, esperando selección manual");
      }
    }
  } catch (error) {
    console.error("❌ Error cargando datos del día actual:", error);
  }
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

// Cargar al montar el componente
onMounted(() => {
  loadTodayData();
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
