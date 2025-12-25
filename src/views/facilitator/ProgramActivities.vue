<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg
            class="w-5 h-5"
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
          <span class="text-sm font-medium">Volver al Programa</span>
        </button>

        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Actividades del Programa
            </h1>
            <p v-if="program" class="text-gray-600 mt-1">{{ program.name }}</p>
          </div>
          <button
            @click="showCreateModal = true"
            class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span class="font-medium">Crear Actividad</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs y Filtros -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Tabs -->
        <div class="flex gap-1 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
              'px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
              activeTab === tab.value
                ? 'text-green-600 border-green-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Filtro por fase -->
        <div
          v-if="program?.metadata?.phases?.length"
          class="py-4 flex items-center gap-3"
        >
          <label class="text-sm font-medium text-gray-700">Fase:</label>
          <select
            v-model="selectedPhase"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todas las fases</option>
            <option
              v-for="phase in program.metadata.phases"
              :key="phase"
              :value="phase"
            >
              {{ phase }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"
      ></div>
    </div>

    <!-- Lista de Actividades -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Empty State -->
      <div
        v-if="!filteredActivities.length"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
      >
        <div
          class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No hay actividades
        </h3>
        <p class="text-gray-600 mb-6">
          Crea tu primera actividad para comenzar a gestionar sesiones y
          monitoreos
        </p>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Crear Actividad
        </button>
      </div>

      <!-- Grid de Actividades -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="activity in filteredActivities"
          :key="activity.id"
          @click="goToActivity(activity.id)"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all cursor-pointer"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    getTypeBadgeClass(activity.type),
                  ]"
                >
                  {{ getTypeLabel(activity.type) }}
                </span>
                <span
                  v-if="activity.isRequired"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700"
                >
                  Obligatoria
                </span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">
                {{ activity.title }}
              </h3>
              <p class="text-sm text-gray-600 line-clamp-2">
                {{ activity.description }}
              </p>
            </div>
          </div>

          <!-- Metadata -->
          <div class="space-y-2 mb-4">
            <div
              v-if="activity.phase"
              class="flex items-center gap-2 text-sm text-gray-600"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span>{{ activity.phase }}</span>
            </div>

            <div
              v-if="activity.scheduledDate"
              class="flex items-center gap-2 text-sm text-gray-600"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{{ formatDate(activity.scheduledDate) }}</span>
            </div>

            <div
              v-if="
                activity.type === 'session' && activity.sessionConfig?.location
              "
              class="flex items-center gap-2 text-sm text-gray-600"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span class="truncate">{{
                activity.sessionConfig.location
              }}</span>
            </div>
          </div>

          <!-- Stats -->
          <div
            class="flex items-center justify-between pt-4 border-t border-gray-100"
          >
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span
                >{{
                  activity.metadata?.totalParticipants || 0
                }}
                participantes</span
              >
            </div>
            <svg
              class="w-5 h-5 text-gray-400"
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
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Crear Actividad -->
    <CreateActivityModal
      v-if="showCreateModal"
      :program="program"
      :activities="activities"
      @close="showCreateModal = false"
      @created="handleActivityCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useActivities } from "@/composables/useActivities";
import { useProgramStore } from "@/stores/programStore";
import CreateActivityModal from "@/components/activities/CreateActivityModal.vue";

const route = useRoute();
const router = useRouter();
const programStore = useProgramStore();
const { activities, loading, loadActivities } = useActivities();

const programId = computed(() => route.params.programId);
const program = ref(null);
const activeTab = ref("all");
const selectedPhase = ref("all");
const showCreateModal = ref(false);

const tabs = [
  { label: "Todas", value: "all" },
  { label: "Sesiones", value: "session" },
  { label: "Monitoreos", value: "monitoring" },
  { label: "Evaluaciones", value: "assessment" },
];

const filteredActivities = computed(() => {
  let filtered = activities.value;

  // Filtrar por tipo (tab)
  if (activeTab.value !== "all") {
    filtered = filtered.filter((a) => a.type === activeTab.value);
  }

  // Filtrar por fase
  if (selectedPhase.value !== "all") {
    filtered = filtered.filter((a) => a.phase === selectedPhase.value);
  }

  return filtered;
});

function getTypeBadgeClass(type) {
  const classes = {
    session: "bg-blue-100 text-blue-700",
    monitoring: "bg-purple-100 text-purple-700",
    assessment: "bg-orange-100 text-orange-700",
  };
  return classes[type] || "bg-gray-100 text-gray-700";
}

function getTypeLabel(type) {
  const labels = {
    session: "Sesión",
    monitoring: "Monitoreo",
    assessment: "Evaluación",
  };
  return labels[type] || type;
}

function formatDate(timestamp) {
  if (!timestamp) return "";

  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function goToActivity(activityId) {
  router.push(`/programs/${programId.value}/activities/${activityId}`);
}

function goBack() {
  router.push(`/programs/${programId.value}`);
}

async function handleActivityCreated(activity) {
  showCreateModal.value = false;
  // Recargar actividades
  await loadActivities(programId.value);
}

onMounted(async () => {
  try {
    // Cargar programa
    await programStore.loadProgram(programId.value);
    program.value = programStore.currentProgram;

    // Cargar actividades
    await loadActivities(programId.value);
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
});
</script>
