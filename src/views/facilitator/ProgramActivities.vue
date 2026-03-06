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
            @click="goToNewActivity"
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
      </div>
    </div>

    <!-- Filtro de Etapa (facilitador) -->
    <div
      v-if="programStages.length > 0"
      class="bg-white border-b border-gray-100"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <select
          v-model="activeStageFilter"
          class="py-2 px-3 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        >
          <option value="all">Todas las etapas</option>
          <option
            v-for="stage in programStages"
            :key="stage.id"
            :value="stage.id"
          >
            {{ stage.name }}
          </option>
          <option value="none">Sin etapa</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <SpinnerIcon size="xl" class="text-green-600" />
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
          asesorías
        </p>
        <button
          @click="goToNewActivity"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Crear Actividad
        </button>
      </div>

      <!-- Timeline de Actividades -->
      <ListActivities
        v-else
        :activities="filteredActivities"
        user-role="facilitator"
        @click="goToActivity"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useActivities } from "@/composables/useActivities";
import { useProgramStore } from "@/stores/programStore";
import ListActivities from "@/components/activities/ListActivities.vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

const route = useRoute();
const router = useRouter();
const programStore = useProgramStore();
const {
  activities,
  loading,
  loadActivities,
  loadProgramStages,
  programStages,
} = useActivities();

const programId = computed(() => route.params.programId);
const program = ref(null);
const activeTab = ref("all");
const activeStageFilter = ref("all");

const tabs = [
  { label: "Todas", value: "all" },
  { label: "Actividades", value: "activity" },
  { label: "Asesorías", value: "consulting" },
];

const filteredActivities = computed(() => {
  let filtered = activities.value;

  // Filtrar por tipo (tab)
  if (activeTab.value !== "all") {
    if (activeTab.value === "activity") {
      // Backward compatibility: match both 'activity' and legacy 'form'
      filtered = filtered.filter(
        (a) => a.type === "activity" || a.type === "form",
      );
    } else {
      filtered = filtered.filter((a) => a.type === activeTab.value);
    }
  }

  // Filtrar por etapa
  if (activeStageFilter.value !== "all") {
    if (activeStageFilter.value === "none") {
      filtered = filtered.filter((a) => !a.stageId);
    } else {
      filtered = filtered.filter((a) => a.stageId === activeStageFilter.value);
    }
  }

  return filtered;
});

function goToActivity(activity) {
  const activityId = typeof activity === "string" ? activity : activity.id;
  router.push(`/programs/${programId.value}/activities/${activityId}`);
}

function goToNewActivity() {
  router.push(`/programs/${programId.value}/new-activity`);
}

function goBack() {
  router.push(`/programs/${programId.value}`);
}

function handleEdit(activity) {
  // Para type form → redirigir a edición por ruta (pendiente)
  // Para type consulting → abre modal (pendiente de implementar inline)
}

function handleDelete(activity) {
  // TODO: implementar modal de confirmación y eliminación
}

async function handleActivityCreated(activity) {
  // Recargar actividades tras creación
  await loadActivities(programId.value);
}

onMounted(async () => {
  try {
    // Cargar programa
    await programStore.loadProgram(programId.value);
    program.value = programStore.currentProgram;

    // Cargar actividades y etapas
    await Promise.all([
      loadActivities(programId.value),
      loadProgramStages(programId.value),
    ]);
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
});
</script>
