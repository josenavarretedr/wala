<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div v-if="program" class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div
              class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex-shrink-0"
            >
              <Community class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div class="flex-1 min-w-0">
              <h1
                class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate"
              >
                {{ program.name }}
              </h1>
              <p class="text-xs sm:text-sm text-gray-500 truncate">
                {{ program.organizationName }}
              </p>
            </div>
          </div>
          <button
            @click="goToInfo"
            class="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            title="Información del programa"
          >
            <InfoCircle
              class="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-gray-600 transition-colors"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <SpinnerIcon size="xl" class="text-green-600" />
    </div>

    <!-- Sección de Actividades -->
    <div v-if="program" class="mt-8">
      <!-- Items del Programa (Micro Apps) -->
      <ItemsProgram
        :program-id="programId"
        v-model:active-tab="activeTab"
        :activities="activities"
        @filter-changed="handleFilterChanged"
      />

      <!-- Loading de Actividades -->
      <div
        v-if="loadingActivities"
        class="flex items-center justify-center py-12"
      >
        <SpinnerIcon size="xl" class="text-green-600" />
      </div>

      <!-- Contenido de Actividades -->
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

    <!-- Action Button Fixed Bottom -->
    <ActionBtnProgram @create-activity="showCreateModal = true" />

    <!-- Modal de Crear Actividad -->
    <CreateActivityModal
      v-if="showCreateModal"
      :program="program"
      :activities="activities"
      @close="showCreateModal = false"
      @created="handleActivityCreated"
    />

    <!-- Toast de Info -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="showToast"
        class="fixed bottom-24 right-4 z-50 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-sm border border-blue-500"
      >
        <div
          class="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span class="font-semibold text-sm">{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useActivities } from "@/composables/useActivities";
import { InfoCircle, Community } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import ListActivities from "@/components/activities/ListActivities.vue";
import ActionBtnProgram from "@/components/programs/ActionBtnProgram.vue";
import CreateActivityModal from "@/components/activities/CreateActivityModal.vue";
import ItemsProgram from "@/components/programs/ItemsProgram.vue";

const route = useRoute();
const router = useRouter();
const {
  activities,
  loading: loadingActivities,
  loadActivities,
} = useActivities();

const program = ref(null);
const loading = ref(false);
const activeTab = ref("all");
const showCreateModal = ref(false);
const showToast = ref(false);
const toastMessage = ref("");

const programId = computed(() => route.params.programId);

const filteredActivities = computed(() => {
  let filtered = activities.value;

  // Filtrar por tipo (tab)
  if (activeTab.value !== "all") {
    filtered = filtered.filter((a) => a.type === activeTab.value);
  }

  return filtered;
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

function goToActivity(activity) {
  const activityId = typeof activity === "string" ? activity : activity.id;
  router.push(`/programs/${programId.value}/activities/${activityId}`);
}

function handleEdit(activity) {
  // TODO: Implementar modal de edición
  console.log("Editar actividad:", activity);
}

function handleDelete(activity) {
  // TODO: Implementar confirmación de eliminación
  console.log("Eliminar actividad:", activity);
}

async function handleActivityCreated(activity) {
  showCreateModal.value = false;
  // Recargar actividades
  await loadActivities(programId.value);
}

function handleFilterChanged(filter) {
  if (filter.type === "all") {
    toastMessage.value = "Estas son TODAS las actividades del programa";
  } else {
    const count = filteredActivities.value.length;
    const plural = count !== 1 ? "s" : "";
    toastMessage.value = `Mostrando ${count} ${filter.name.toLowerCase()}${plural} del programa`;
  }
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
}

function goToInfo() {
  router.push(`/programs/${programId.value}/info`);
}
</script>
