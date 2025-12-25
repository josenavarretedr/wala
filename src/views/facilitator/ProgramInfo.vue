<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
        >
          <NavArrowLeft class="w-4 h-4 sm:w-5 sm:h-5" />
          <span class="text-xs sm:text-sm font-medium">Volver al Programa</span>
        </button>

        <div v-if="program" class="flex items-center gap-3 sm:gap-4">
          <div
            class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex-shrink-0"
          >
            <InfoCircle class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              Información del Programa
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 truncate">
              {{ program.name }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <SpinnerIcon size="xl" class="text-green-600" />
    </div>

    <!-- Contenido -->
    <div
      v-else-if="program"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <!-- Información básica -->
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 mb-6"
      >
        <h2 class="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Datos del Programa
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label class="text-xs sm:text-sm font-medium text-gray-500"
              >Nombre del Programa</label
            >
            <p class="mt-1 text-sm sm:text-base text-gray-900">
              {{ program.name }}
            </p>
          </div>

          <div>
            <label class="text-xs sm:text-sm font-medium text-gray-500"
              >Organización</label
            >
            <p class="mt-1 text-sm sm:text-base text-gray-900">
              {{ program.organizationName }}
            </p>
          </div>

          <div v-if="program.description">
            <label class="text-xs sm:text-sm font-medium text-gray-500"
              >Descripción</label
            >
            <p class="mt-1 text-sm sm:text-base text-gray-900">
              {{ program.description }}
            </p>
          </div>

          <div v-if="program.startDate">
            <label class="text-xs sm:text-sm font-medium text-gray-500"
              >Fecha de Inicio</label
            >
            <p class="mt-1 text-sm sm:text-base text-gray-900">
              {{ formatDate(program.startDate) }}
            </p>
          </div>

          <div v-if="program.endDate">
            <label class="text-xs sm:text-sm font-medium text-gray-500"
              >Fecha de Fin</label
            >
            <p class="mt-1 text-sm sm:text-base text-gray-900">
              {{ formatDate(program.endDate) }}
            </p>
          </div>

          <div v-if="program.status">
            <label class="text-xs sm:text-sm font-medium text-gray-500"
              >Estado</label
            >
            <p class="mt-1">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium',
                  program.status === 'active' && 'bg-green-100 text-green-800',
                  program.status === 'completed' && 'bg-blue-100 text-blue-800',
                  program.status === 'draft' && 'bg-gray-100 text-gray-800',
                ]"
              >
                {{ getStatusLabel(program.status) }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs sm:text-sm font-medium text-gray-500">
              Total Actividades
            </p>
            <Calendar class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </div>
          <p class="text-xl sm:text-2xl font-bold text-gray-900">
            {{ stats.totalActivities }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs sm:text-sm font-medium text-gray-500">Sesiones</p>
            <Book class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <p class="text-xl sm:text-2xl font-bold text-gray-900">
            {{ stats.sessions }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs sm:text-sm font-medium text-gray-500">
              Monitoreos
            </p>
            <GraphUp class="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          </div>
          <p class="text-xl sm:text-2xl font-bold text-gray-900">
            {{ stats.monitorings }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs sm:text-sm font-medium text-gray-500">Eventos</p>
            <Calendar class="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          </div>
          <p class="text-xl sm:text-2xl font-bold text-gray-900">
            {{ stats.events }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useActivities } from "@/composables/useActivities";
import {
  NavArrowLeft,
  InfoCircle,
  Calendar,
  Book,
  GraphUp,
} from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

const route = useRoute();
const router = useRouter();
const { activities, loadActivities } = useActivities();

const program = ref(null);
const loading = ref(false);

const programId = computed(() => route.params.programId);

const stats = computed(() => {
  const total = activities.value.length;
  const sessions = activities.value.filter((a) => a.type === "session").length;
  const monitorings = activities.value.filter(
    (a) => a.type === "monitoring"
  ).length;
  const events = activities.value.filter((a) => a.type === "event").length;

  return {
    totalActivities: total,
    sessions,
    monitorings,
    events,
  };
});

onMounted(async () => {
  await loadProgram();
  if (program.value) {
    await loadActivities(programId.value);
  }
});

async function loadProgram() {
  loading.value = true;

  try {
    const programRef = doc(db, "programs", programId.value);
    const programSnap = await getDoc(programRef);

    if (programSnap.exists()) {
      program.value = {
        id: programSnap.id,
        ...programSnap.data(),
      };
    }
  } catch (error) {
    console.error("Error loading program:", error);
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push(`/programs/${programId.value}`);
}

function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status) {
  const labels = {
    active: "Activo",
    completed: "Completado",
    draft: "Borrador",
  };
  return labels[status] || status;
}
</script>
