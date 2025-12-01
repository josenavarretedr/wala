<template>
  <!-- Widget minimalista con click para abrir modal -->
  <div
    :class="[
      'w-full h-full transition-shadow duration-200 cursor-pointer flex flex-col justify-center',
      compact
        ? 'p-3 sm:p-4 lg:p-4'
        : 'bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md',
    ]"
    @click="goToStreakView"
  >
    <!-- Grid de 2 columnas: [Icono+Número] | [Estados] -->
    <div class="grid grid-cols-[auto_1fr] gap-3 lg:gap-4 items-center">
      <!-- Columna 1: Icono + Número -->
      <div
        class="flex flex-row justify-center items-center gap-2 lg:gap-3 min-w-[90px] lg:min-w-[110px]"
      >
        <!-- Icono de fuego -->
        <div class="relative">
          <SnowFlake
            v-if="!isStreakActiveToday"
            class="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-gray-300"
          />
          <FireFlame
            v-else
            :class="[
              'transition-all duration-300 w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10',
              isStreakActiveToday
                ? 'text-red-500 animate-flame'
                : 'text-gray-300',
            ]"
          />

          <!-- Pulso sutil cuando está activa -->
          <div
            v-if="isStreakActiveToday"
            class="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping-slow"
          ></div>
        </div>

        <!-- Número de días -->
        <div class="text-center">
          <p
            :class="[
              'font-extrabold tabular-nums transition-all duration-300 text-2xl sm:text-3xl lg:text-4xl',
              isStreakActiveToday ? 'text-red-500' : 'text-gray-300',
            ]"
          >
            {{ streakData?.current || 0 }}
          </p>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ (streakData?.current || 0) === 1 ? "día" : "días" }}
          </p>
        </div>
      </div>

      <!-- Columna 2: Estados del día -->
      <div class="space-y-1.5 lg:space-y-2">
        <!-- Apertura -->
        <div class="flex items-center gap-2">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              hasOpeningToday ? 'bg-red-500' : 'bg-gray-300',
            ]"
          ></div>
          <span
            :class="[
              'text-sm',
              hasOpeningToday ? 'text-gray-800 font-medium' : 'text-gray-400',
            ]"
          >
            {{ hasOpeningToday ? "Día aperturado." : "Día aún no aperturado." }}
          </span>
        </div>

        <!-- Transacciones -->
        <div class="flex items-center gap-2">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              hasTxnToday ? 'bg-red-500' : 'bg-gray-300',
            ]"
          ></div>
          <span
            :class="[
              'text-sm',
              hasTxnToday ? 'text-gray-800 font-medium' : 'text-gray-400',
            ]"
          >
            {{
              hasTxnToday ? "Transacción hecha." : "Registra algún movimiento."
            }}
          </span>
        </div>

        <!-- Cierre -->
        <div class="flex items-center gap-2">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              hasClosureToday ? 'bg-red-500' : 'bg-gray-300',
            ]"
          ></div>
          <span
            :class="[
              'text-sm',
              hasClosureToday ? 'text-gray-800 font-medium' : 'text-gray-400',
            ]"
          >
            {{ hasClosureToday ? "Cierre completado." : "Día aún no cerrado." }}
          </span>
        </div>
      </div>
    </div>

    <!-- ✨ NUEVO: Línea de Copilot Assistance -->
    <div
      v-if="!compact && streakData && streakData.copilotAssistedSessions > 0"
      class="mt-3 pt-3 border-t border-gray-100"
    >
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-500"> 🤖 Copilot te ayudó </span>
        <span class="font-medium text-blue-600">
          {{ streakData.copilotAssistedSessions }}
          {{ streakData.copilotAssistedSessions === 1 ? "vez" : "veces" }}
        </span>
      </div>
    </div>

    <!-- Línea dinámica adicional (contexto motivador) -->
    <div v-if="!compact && streakData" class="mt-2 text-center">
      <p class="text-xs text-gray-500">💪 {{ motivationalText }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { FireFlame, SnowFlake } from "@iconoir/vue";
import { useDailySummary } from "@/composables/useDailySummary";

// Props
const props = defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const router = useRouter();

// Composable para dailySummary
const dailySummaryComposable = useDailySummary();

// Reactive data
const streakData = ref(null);
const dailySummary = ref(null);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
let unsubscribeDailySummary = null;

// Computed properties
const businessId = computed(() => route.params.businessId);

// Obtener flags de apertura, cierre y transacciones del dailySummary
const hasOpeningToday = computed(() => {
  if (!dailySummary.value) return false;
  return dailySummaryComposable.hasOpening(dailySummary.value);
});

const hasClosureToday = computed(() => {
  if (!dailySummary.value) return false;
  return dailySummaryComposable.hasClosure(dailySummary.value);
});

const hasTxnToday = computed(() => {
  if (!dailySummary.value) return false;
  return dailySummaryComposable.hasTxn(dailySummary.value);
});

// Verificar si la racha está activa HOY (con transacciones hoy)
const isStreakActiveToday = computed(() => {
  if (!streakData.value || streakData.value.current === 0) {
    console.log("Streak not active today: no streak data or current is 0");
    return false;
  }

  // Si no hay lastActiveDay, la racha no está activa hoy
  if (!streakData.value.lastActiveDay) {
    console.log("Streak not active today: no lastActiveDay");
    return false;
  }

  // Obtener el día actual en formato yyyy-MM-dd usando fecha LOCAL
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;

  // lastActiveDay SIEMPRE es un string en formato yyyy-MM-dd
  // (setteado por streakManager.js en el backend)
  const lastActiveDay = streakData.value.lastActiveDay;

  // La racha solo está "encendida" si hay actividad HOY
  console.log(
    "🔥 [STREAK] Comparing lastActiveDay:",
    lastActiveDay,
    "with today:",
    today
  );
  console.log("🔥 [STREAK] Current streak:", streakData.value.current);

  return lastActiveDay === today;
});

// Formatear fecha
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Navigate to StreakView
const goToStreakView = () => {
  if (businessId.value) {
    router.push({
      name: "StreakView",
      params: { businessId: businessId.value },
    });
  }
};

// Load streak data from Firestore
const loadStreakData = () => {
  if (!businessId.value) {
    console.warn("No businessId found");
    loading.value = false;
    return;
  }

  const businessRef = doc(db, "businesses", businessId.value);

  // Escuchar cambios en tiempo real del streak
  const unsubscribeStreak = onSnapshot(
    businessRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const businessData = docSnap.data();
        streakData.value = businessData.streak || {
          mode: "auto",
          current: 0,
          max: 0,
          lastActiveDay: null,
          medianGap: 0,
          allowedGap: 5,
          copilotAssistedSessions: 0,
        };

        console.log("📊 Streak data loaded:", streakData.value);
      } else {
        console.warn("Business document not found");
        streakData.value = null;
      }
      loading.value = false;
      error.value = null;
    },
    (err) => {
      console.error("Error loading streak data:", err);
      error.value = err.message;
      loading.value = false;
    }
  );

  // Escuchar cambios en tiempo real del dailySummary de hoy
  unsubscribeDailySummary = dailySummaryComposable.watchTodayDailySummary(
    (summary) => {
      dailySummary.value = summary;
      console.log("📊 DailySummary actualizado:", summary);
    }
  );

  // Cleanup on unmount
  return () => {
    if (unsubscribeStreak) unsubscribeStreak();
    if (unsubscribeDailySummary) unsubscribeDailySummary();
  };
};

// Lifecycle
onMounted(() => {
  const cleanup = loadStreakData();

  // Guardar cleanup para usar en onUnmounted
  onUnmounted(() => {
    if (cleanup) cleanup();
  });
});

// Watch businessId changes
watch(businessId, () => {
  if (businessId.value) {
    // Limpiar listeners anteriores
    if (unsubscribeDailySummary) {
      unsubscribeDailySummary();
      unsubscribeDailySummary = null;
    }
    loadStreakData();
  }
});

// Agregar computed para el texto motivacional (que estaba faltando)
const motivationalText = computed(() => {
  if (!streakData.value) return "";

  const current = streakData.value.current || 0;

  if (current === 0) return "¡Comienza tu racha hoy!";
  if (current < 7) return "¡Sigue así!";
  if (current < 30) return "¡Excelente progreso!";
  if (current < 90) return "¡Imparable!";
  return "¡Leyenda absoluta!";
});
</script>

<style scoped>
/* Animación de llama (sutil movimiento) */
@keyframes flame {
  0%,
  100% {
    transform: scale(1) translateY(0);
  }
  25% {
    transform: scale(1.05) translateY(-2px);
  }
  50% {
    transform: scale(1.1) translateY(-3px);
  }
  75% {
    transform: scale(1.05) translateY(-2px);
  }
}

.animate-flame {
  animation: flame 2s ease-in-out infinite;
}

/* Animación de ping más lenta y sutil */
@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  75%,
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Fuentes tabulares para números */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Transición del modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active > div,
.modal-fade-leave-active > div {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from > div,
.modal-fade-leave-to > div {
  transform: scale(0.9);
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .text-4xl {
    font-size: 2.5rem;
  }
}
</style>
