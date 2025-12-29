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
      <!-- Items del Programa (Filtros) -->
      <ItemsProgram
        :program-id="programId"
        v-model:active-tab="activeTab"
        :activities="activities"
        :show-status-filter="true"
        :user-participations="userParticipations"
        @filter-changed="handleFilterChanged"
        @status-filter-changed="handleStatusFilterChanged"
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
          <p class="text-gray-600">
            {{ getEmptyMessage() }}
          </p>
        </div>

        <!-- Timeline de Actividades -->
        <ListActivities
          v-else
          :activities="filteredActivities"
          user-role="participant"
          :current-user-id="currentUserId"
          :participations="userParticipations"
          @click="goToActivity"
        />
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification
      v-model:show="showToast"
      :message="toastMessage"
      :type="toastType"
      :duration="3000"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useActivitiesStore } from "@/stores/activitiesStore";
import { useAuthStore } from "@/stores/authStore";
import { InfoCircle, Community } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import ListActivities from "@/components/activities/ListActivities.vue";
import ItemsProgram from "@/components/programs/ItemsProgram.vue";
import ToastNotification from "@/components/ui/ToastNotification.vue";

const route = useRoute();
const router = useRouter();
const activitiesStore = useActivitiesStore();
const authStore = useAuthStore();

const program = ref(null);
const loading = ref(false);
const activeTab = ref("all");
const activeStatusFilter = ref("all");
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("info");

const programId = computed(() => route.params.programId);
const businessId = computed(() => route.params.businessId);
const currentUserId = computed(() => authStore.user?.uid);

const activities = computed(() => activitiesStore.activities);
const loadingActivities = computed(() => activitiesStore.loading);
const userParticipations = ref([]);

const filteredActivities = computed(() => {
  let filtered = activities.value;

  // Filtrar por tipo (tab)
  if (activeTab.value !== "all") {
    filtered = filtered.filter((a) => a.type === activeTab.value);
  }

  // Filtrar por estado de participación
  if (activeStatusFilter.value !== "all") {
    filtered = filtered.filter((activity) => {
      const hasParticipation = userParticipations.value.some(
        (p) => p.activityId === activity.id
      );

      if (activeStatusFilter.value === "completed") {
        return hasParticipation;
      } else if (activeStatusFilter.value === "pending") {
        return !hasParticipation;
      }

      return true;
    });
  }

  return filtered;
});

onMounted(async () => {
  await loadProgram();
  if (program.value) {
    await Promise.all([
      activitiesStore.loadActivities(programId.value),
      loadUserParticipations(),
    ]);
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

async function loadUserParticipations() {
  try {
    if (!currentUserId.value) return;

    const participations = await activitiesStore.loadUserActivities(
      programId.value,
      currentUserId.value
    );

    userParticipations.value = participations;
  } catch (error) {
    console.error("Error loading user participations:", error);
  }
}

function goToActivity(activity) {
  const activityId = typeof activity === "string" ? activity : activity.id;
  const activityType = typeof activity === "string" ? "session" : activity.type;

  // Rutas específicas por tipo de actividad
  const routeMap = {
    session: "session-participation",
    monitoring: "monitoring-participation",
    event: "event-participation",
  };

  const routeName = routeMap[activityType] || "session-participation";

  router.push({
    name: routeName,
    params: {
      businessId: businessId.value,
      programId: programId.value,
      activityId: activityId,
    },
  });
}

function handleFilterChanged(filter) {
  // Reset status filter cuando cambia el tipo
  activeStatusFilter.value = "all";

  if (filter.type === "all") {
    toastMessage.value = "Mostrando todas tus actividades";
    toastType.value = "info";
  } else {
    const count = filteredActivities.value.length;
    const plural = count !== 1 ? "s" : "";
    toastMessage.value = `${count} ${filter.name.toLowerCase()}${plural}`;
    toastType.value = "info";
  }

  showToast.value = true;
}

function handleStatusFilterChanged(statusId) {
  activeStatusFilter.value = statusId;

  const statusMessages = {
    all: "Mostrando todas las actividades",
    completed: "Mostrando actividades completadas",
    pending: "Mostrando actividades pendientes",
  };

  toastMessage.value = statusMessages[statusId] || "";
  toastType.value = "info";
  showToast.value = true;
}

function getEmptyMessage() {
  if (activeStatusFilter.value === "completed") {
    return "No tienes actividades completadas aún";
  } else if (activeStatusFilter.value === "pending") {
    return "¡Todas tus actividades están completadas!";
  }

  return "No hay actividades disponibles en este momento";
}

function goToInfo() {
  router.push(`/business/${businessId.value}/programs/${programId.value}/info`);
}
</script>
