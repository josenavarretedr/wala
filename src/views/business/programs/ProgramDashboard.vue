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
        :stages="programStages"
        :show-status-filter="true"
        :user-participations="userParticipations"
        @filter-changed="handleFilterChanged"
        @status-filter-changed="handleStatusFilterChanged"
        @stage-filter-changed="handleStageFilterChanged"
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
        <template v-if="isConsultingTab">
          <div
            v-if="loadingDossier"
            class="flex items-center justify-center py-12"
          >
            <SpinnerIcon size="xl" class="text-purple-600" />
          </div>

          <CardDossier
            v-else-if="activeParticipantDossier"
            :dossier="activeParticipantDossier"
            :progress="activeDossierProgress"
            @click="goToDossierRead"
          />

          <div
            v-else
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <div
              class="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              No tienes expediente asignado
            </h3>
            <p class="text-gray-600">
              Tu facilitador aun no te ha habilitado un expediente de asesoria
              para este programa.
            </p>
          </div>
        </template>

        <template v-else>
          <!-- Empty State -->
          <div
            v-if="!visibleFilteredActivities.length && !stageGate"
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
          <template v-else>
            <ListActivities
              v-if="visibleFilteredActivities.length"
              :activities="visibleFilteredActivities"
              user-role="participant"
              :current-user-id="currentUserId"
              :participations="userParticipations"
              @click="goToActivity"
            />

            <!-- Stage Gate: bloqueo de etapas siguientes -->
            <div
              v-if="stageGate"
              class="flex items-center justify-center py-10"
            >
              <div
                class="bg-white rounded-xl shadow-sm border border-amber-200 p-8 text-center max-w-sm w-full"
              >
                <div
                  class="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg
                    class="w-7 h-7 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 class="text-base font-semibold text-gray-900 mb-2">
                  Contenido bloqueado
                </h3>
                <p class="text-sm text-gray-600">
                  Completa la etapa de
                  <span class="font-semibold text-amber-700">
                    {{ stageGate.name }}
                  </span>
                  antes de continuar con tu proceso.
                </p>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>

    <!-- Toast Notification -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useActivitiesStore } from "@/stores/activitiesStore";
import { useAuthStore } from "@/stores/authStore";
import { useConsultingDossierStore } from "@/stores/consultingDossierStore";
import { useStageProgress } from "@/composables/useStageProgress";
import { InfoCircle, Community } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import ListActivities from "@/components/activities/ListActivities.vue";
import ItemsProgram from "@/components/programs/ItemsProgram.vue";
import CardDossier from "@/components/programs/consulting/CardDossier.vue";
import { useToast } from "@/composables/useToast";

const route = useRoute();
const router = useRouter();
const activitiesStore = useActivitiesStore();
const consultingDossierStore = useConsultingDossierStore();
const authStore = useAuthStore();
const { info } = useToast();

const program = ref(null);
const loading = ref(false);
const activeTab = ref("all");
const activeStatusFilter = ref("all");
const activeStageFilter = ref("all");

const programId = computed(() => route.params.programId);
const businessId = computed(() => route.params.businessId);
const currentUserId = computed(() => authStore.user?.uid);

const activities = computed(() => activitiesStore.activities);
const loadingActivities = computed(() => activitiesStore.loading);
const userParticipations = ref([]);
const programStages = computed(() => activitiesStore.programStages);
const activeParticipantDossier = ref(null);

const isConsultingTab = computed(
  () => activeTab.value === "consulting" || activeTab.value === "monitoring",
);
const loadingDossier = computed(() => consultingDossierStore.loading);
const activeDossierProgress = computed(() =>
  consultingDossierStore.getStepProgress(
    activeParticipantDossier.value?.currentStep,
  ),
);

const { isStageLockedForUser, getPrerequisiteStageName } = useStageProgress();

const sortedStages = computed(() =>
  [...programStages.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
);

// IDs de etapas bloqueadas para el usuario actual (basado en prerequisiteStageId)
const lockedStageIds = computed(() => {
  const locked = new Set();
  for (const stage of sortedStages.value) {
    if (
      isStageLockedForUser(
        stage,
        sortedStages.value,
        activities.value,
        userParticipations.value,
      )
    ) {
      locked.add(stage.id);
    }
  }
  return locked;
});

// Stage gate:
// - Si hay filtro de etapa específica y está bloqueada → muestra el bloqueo
// - Si es "all" → encuentra la primera etapa bloqueada con actividades
const stageGate = computed(() => {
  if (!sortedStages.value.length) return null;

  if (activeStageFilter.value !== "all" && activeStageFilter.value !== "none") {
    const selectedStage = sortedStages.value.find(
      (s) => s.id === activeStageFilter.value,
    );
    if (selectedStage && lockedStageIds.value.has(selectedStage.id)) {
      const prereqName = getPrerequisiteStageName(
        selectedStage,
        sortedStages.value,
      );
      return { name: prereqName ?? selectedStage.name };
    }
    return null;
  }

  // Vista "all": primera etapa bloqueada que tiene actividades
  for (const stage of sortedStages.value) {
    if (!lockedStageIds.value.has(stage.id)) continue;
    const hasActivities = activities.value.some((a) => a.stageId === stage.id);
    if (!hasActivities) continue;
    const prereqName = getPrerequisiteStageName(stage, sortedStages.value);
    return { name: prereqName ?? stage.name };
  }
  return null;
});

// Actividades visibles: excluye las que pertenecen a etapas bloqueadas
const visibleFilteredActivities = computed(() => {
  // Si el filtro apunta a una etapa bloqueada, no hay actividades visibles
  if (activeStageFilter.value !== "all" && activeStageFilter.value !== "none") {
    const selectedStage = sortedStages.value.find(
      (s) => s.id === activeStageFilter.value,
    );
    if (selectedStage && lockedStageIds.value.has(selectedStage.id)) {
      return [];
    }
  }

  if (!lockedStageIds.value.size) return filteredActivities.value;

  // Excluir actividades de etapas bloqueadas; las sin stageId siempre se muestran
  return filteredActivities.value.filter(
    (a) => !a.stageId || !lockedStageIds.value.has(a.stageId),
  );
});

const filteredActivities = computed(() => {
  let filtered = activities.value;

  // Filtrar por tipo (tab)
  if (activeTab.value !== "all") {
    if (activeTab.value === "form" || activeTab.value === "activity") {
      // Compatibilidad: la UI usa "form", pero en BD puede existir "activity".
      filtered = filtered.filter(
        (a) => a.type === "activity" || a.type === "form",
      );
    } else if (
      activeTab.value === "consulting" ||
      activeTab.value === "monitoring"
    ) {
      // Compatibilidad: asesorías históricas guardadas como "monitoring".
      filtered = filtered.filter(
        (a) => a.type === "consulting" || a.type === "monitoring",
      );
    } else {
      filtered = filtered.filter((a) => a.type === activeTab.value);
    }
  }

  // Filtrar por estado de participación
  if (activeStatusFilter.value !== "all") {
    filtered = filtered.filter((activity) => {
      const status = getParticipantActivityStatus(activity);

      if (activeStatusFilter.value === "completed") {
        return status === "completed";
      } else if (activeStatusFilter.value === "pending") {
        return status !== "completed";
      }

      return true;
    });
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

function getParticipantActivityStatus(activity) {
  const participation = userParticipations.value.find(
    (p) => p.activityId === activity.id && p.userId === currentUserId.value,
  );

  if (!participation) return "pending";

  if (activity.type === "activity" || activity.type === "form") {
    return activitiesStore.isParticipationComplete(activity, participation)
      ? "completed"
      : "in_progress";
  }

  if (activity.type === "session" || activity.type === "event") {
    if (participation.attendance?.attended) return "completed";
    if (participation.attendance?.attended === false) return "absent";
    return "pending";
  }

  if (activity.type === "consulting" || activity.type === "monitoring") {
    if (
      participation.consultingData?.overallScore !== undefined ||
      participation.monitoringData?.overallScore !== undefined ||
      participation.overallScore !== undefined
    ) {
      return "completed";
    }
  }

  return "pending";
}

onMounted(async () => {
  await loadProgram();
  if (program.value) {
    await Promise.all([
      activitiesStore.loadActivities(programId.value),
      activitiesStore.loadProgramStages(programId.value),
      loadUserParticipations(),
      loadParticipantDossier(),
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
      currentUserId.value,
    );

    userParticipations.value = participations;
  } catch (error) {
    console.error("Error loading user participations:", error);
  }
}

async function loadParticipantDossier() {
  try {
    if (!currentUserId.value || !businessId.value) {
      activeParticipantDossier.value = null;
      return;
    }

    activeParticipantDossier.value =
      await consultingDossierStore.loadActiveParticipantDossier(
        programId.value,
        currentUserId.value,
        businessId.value,
      );
  } catch (error) {
    console.error("Error loading participant dossier:", error);
    activeParticipantDossier.value = null;
  }
}

function goToActivity(activity) {
  const activityId = typeof activity === "string" ? activity : activity.id;
  const activityType = typeof activity === "string" ? "session" : activity.type;

  // Rutas específicas por tipo de actividad
  const routeMap = {
    activity: "activity-participation",
    form: "activity-participation", // Backward compatibility
    session: "session-participation",
    consulting: "consulting-participation",
    monitoring: "consulting-participation", // Backward compatibility
    event: "event-participation",
  };

  const routeName = routeMap[activityType] || "activity-participation";

  // Para form-participation los params van en orden distinto
  if (activityType === "activity" || activityType === "form") {
    router.push({
      name: routeName,
      params: {
        businessId: businessId.value,
        programId: programId.value,
        activityId: activityId,
      },
    });
    return;
  }

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
    info("Mostrando todas tus actividades");
  } else if (filter.type === "consulting" || filter.type === "monitoring") {
    const count = activeParticipantDossier.value ? 1 : 0;
    info(
      count
        ? "Mostrando tu expediente de asesoria"
        : "No tienes expediente de asesoria asignado",
    );
  } else {
    const count = filteredActivities.value.length;
    const plural = count !== 1 ? "s" : "";
    info(`${count} ${filter.name.toLowerCase()}${plural}`);
  }
}

function handleStatusFilterChanged(statusId) {
  activeStatusFilter.value = statusId;

  const statusMessages = {
    all: "Mostrando todas las actividades",
    completed: "Mostrando actividades completadas",
    pending: "Mostrando actividades pendientes",
  };

  const message = statusMessages[statusId] || "";
  if (message) {
    info(message);
  }
}

function handleStageFilterChanged(stageId) {
  activeStageFilter.value = stageId;
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

function goToDossierRead(dossier) {
  if (!dossier?.id) return;

  router.push({
    name: "program-consulting-dossier-read",
    params: {
      businessId: businessId.value,
      programId: programId.value,
      dossierId: dossier.id,
    },
  });
}
</script>
