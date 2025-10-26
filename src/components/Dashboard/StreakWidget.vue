<template>
  <!-- Widget minimalista con click para abrir modal -->
  <div
    :class="[
      'w-full h-full transition-shadow duration-200 cursor-pointer',
      compact
        ? 'p-3 sm:p-4 flex flex-col justify-center'
        : 'bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md flex flex-col',
    ]"
    @click="showModal = true"
  >
    <!-- Línea principal: icono + número -->
    <div class="flex items-center justify-center gap-3 sm:gap-4">
      <!-- Icono de fuego -->
      <div class="relative">
        <SnowFlake
          v-if="!isStreakActiveToday"
          class="w-6 h-6 sm:w-8 sm:h-8 text-gray-300"
        />
        <FireFlame
          v-else
          :class="[
            'transition-all duration-300',
            compact ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-10 sm:h-10',
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
            'font-extrabold tabular-nums transition-all duration-300',
            compact ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl',
            isStreakActiveToday ? 'text-red-500' : 'text-gray-300',
          ]"
        >
          {{ streakData?.current || 0 }}
        </p>
        <p class="text-xs text-gray-400 mt-1">
          {{ streakData?.current === 1 ? "día" : "días" }}
        </p>
      </div>

      <!-- Récord personal (pequeño, a la derecha) -->
      <div
        v-if="streakData?.max && streakData?.max > 0 && !compact"
        class="text-right"
      >
        <p class="text-xs text-gray-400">récord</p>
        <p class="text-xl font-bold text-gray-600">
          {{ streakData?.max }}
        </p>
      </div>
    </div>

    <!-- Línea dinámica adicional (contexto motivador) -->
    <div
      v-if="!compact && streakData"
      class="mt-3 pt-3 border-t border-gray-100 text-center"
    >
      <p class="text-xs text-gray-500">💪 {{ motivationalText }}</p>
    </div>
  </div>

  <!-- Modal: Ficha de progreso completa -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        @click.self="showModal = false"
      >
        <div
          class="bg-gradient-to-br from-orange-50 via-white to-purple-50 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all duration-300"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-800">
              📊 Ficha de progreso
            </h3>
            <button
              @click="showModal = false"
              class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Métricas en grid -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Racha actual -->
            <div
              class="bg-white/80 backdrop-blur rounded-xl p-4 border border-orange-100 shadow-sm"
            >
              <p class="text-xs text-gray-500 mb-1">🔥 Racha actual</p>
              <p class="text-3xl font-bold text-red-500">
                {{ streakData?.current || 0 }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ streakData?.current === 1 ? "día" : "días" }}
              </p>
            </div>

            <!-- Máxima -->
            <div
              class="bg-white/80 backdrop-blur rounded-xl p-4 border border-purple-100 shadow-sm"
            >
              <p class="text-xs text-gray-500 mb-1">🏆 Máxima</p>
              <p class="text-3xl font-bold text-purple-600">
                {{ streakData?.max || 0 }}
              </p>
              <p class="text-xs text-gray-400 mt-1">días</p>
            </div>

            <!-- Ritmo -->
            <div
              class="bg-white/80 backdrop-blur rounded-xl p-4 border border-blue-100 shadow-sm"
            >
              <p class="text-xs text-gray-500 mb-1">⏱ Ritmo</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ rhythmText }}
              </p>
              <p class="text-xs text-gray-400 mt-1">promedio</p>
            </div>

            <!-- Asistencias del copiloto -->
            <div
              class="bg-white/80 backdrop-blur rounded-xl p-4 border border-green-100 shadow-sm"
            >
              <p class="text-xs text-gray-500 mb-1">🤖 Asistencias</p>
              <p class="text-3xl font-bold text-green-600">
                {{ streakData?.copilotAssistedSessions || 0 }}
              </p>
              <p class="text-xs text-gray-400 mt-1">sesiones</p>
            </div>
          </div>

          <!-- Info adicional -->
          <div class="mt-6 bg-white/60 rounded-lg p-4 text-sm text-gray-600">
            <p class="mb-2">
              <span class="font-semibold">Modo:</span>
              <span
                class="ml-2 px-2 py-1 rounded-md text-xs font-medium"
                :class="
                  streakData?.mode === 'auto'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                "
              >
                {{ streakData?.mode === "auto" ? "Automático" : "Manual" }}
              </span>
            </p>
            <p v-if="streakData?.lastActiveDay">
              <span class="font-semibold">Última actividad:</span>
              {{ formatDate(streakData.lastActiveDay) }}
            </p>
            <p v-if="streakData?.allowedGap" class="mt-2 text-xs text-gray-500">
              Tolerancia de pausa: {{ streakData.allowedGap }} días
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { FireFlame, SnowFlake } from "@iconoir/vue";

// Props
const props = defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();

// Reactive data
const streakData = ref(null);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);

// Computed properties
const businessId = computed(() => route.params.businessId);

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

  // Comparar lastActiveDay con hoy
  // lastActiveDay puede venir como string directo o como timestamp de Firestore
  let lastActiveDay;

  if (typeof streakData.value.lastActiveDay === "string") {
    console.log("lastActiveDay is a string:", streakData.value.lastActiveDay);
    lastActiveDay = streakData.value.lastActiveDay;
  } else if (streakData.value.lastActiveDay?.toDate) {
    // Es un Timestamp de Firestore - convertir a fecha LOCAL
    const date = streakData.value.lastActiveDay.toDate();
    lastActiveDay = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  } else {
    return false;
  }

  // La racha solo está "encendida" si hay actividad HOY
  console.log("Comparing lastActiveDay:", lastActiveDay, "with today:", today);
  return lastActiveDay === today;
});

// Texto motivacional dinámico
const motivationalText = computed(() => {
  if (!streakData.value) return "";

  const rhythm =
    streakData.value.medianGap > 0
      ? `cada ${streakData.value.medianGap} ${
          streakData.value.medianGap === 1 ? "día" : "días"
        }`
      : "diario";
  const assists = streakData.value.copilotAssistedSessions || 0;

  return `En ritmo: ${rhythm} · ${assists} ${
    assists === 1 ? "asistencia" : "asistencias"
  } del copiloto`;
});

// Texto del ritmo
const rhythmText = computed(() => {
  if (!streakData.value?.medianGap || streakData.value.medianGap === 0) {
    return "Diario";
  }
  const gap = streakData.value.medianGap;
  return gap === 1 ? "cada día" : `cada ${gap} días`;
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

// Load streak data from Firestore
const loadStreakData = () => {
  if (!businessId.value) {
    console.warn("No businessId found");
    loading.value = false;
    return;
  }

  const businessRef = doc(db, "businesses", businessId.value);

  // Escuchar cambios en tiempo real
  const unsubscribe = onSnapshot(
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

  // Cleanup on unmount
  return unsubscribe;
};

// Lifecycle
onMounted(() => {
  const unsubscribe = loadStreakData();

  // Cleanup cuando el componente se desmonte
  return () => {
    if (unsubscribe) unsubscribe();
  };
});

// Watch businessId changes
watch(businessId, () => {
  if (businessId.value) {
    loadStreakData();
  }
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
