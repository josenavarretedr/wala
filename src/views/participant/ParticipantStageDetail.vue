<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              class="w-5 h-5 text-gray-600"
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
          <div class="flex-1 min-w-0">
            <h1 class="text-xl font-bold text-gray-900 truncate">
              {{ stageName }}
            </h1>
            <p class="text-sm text-gray-500 truncate">{{ programName }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div
          class="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
        />
      </div>

      <template v-else>
        <!-- Bloqueo -->
        <div
          v-if="isLocked"
          class="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <div class="flex gap-3">
            <svg
              class="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
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
            <div>
              <p class="text-sm font-medium text-amber-900">Etapa bloqueada</p>
              <p class="text-xs text-amber-700 mt-0.5">
                Debes completar la etapa "{{ prerequisiteName }}" antes de
                acceder a esta etapa.
              </p>
            </div>
          </div>
        </div>

        <template v-else>
          <!-- Progreso -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-medium text-gray-900">Tu progreso</p>
              <span
                class="text-sm font-semibold"
                :class="
                  progress.percentage === 100
                    ? 'text-green-600'
                    : 'text-gray-600'
                "
              >
                {{ progress.percentage }}%
              </span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :class="
                  progress.percentage === 100 ? 'bg-green-500' : 'bg-green-400'
                "
                :style="{ width: progress.percentage + '%' }"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1.5">
              {{ progress.completed }}/{{ progress.total }} actividades
              completadas
            </p>
          </div>

          <!-- Lista de actividades -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-3">
              Actividades ({{ stageActivities.length }})
            </h3>

            <div v-if="stageActivities.length" class="space-y-2">
              <div
                v-for="activity in stageActivities"
                :key="activity.id"
                @click="goToActivity(activity)"
                class="bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all"
                :class="
                  isActivityComplete(activity)
                    ? 'border-green-200 hover:border-green-300'
                    : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                "
              >
                <div class="flex items-center gap-3">
                  <!-- Status icon -->
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    :class="
                      isActivityComplete(activity)
                        ? 'bg-green-100 text-green-600'
                        : hasParticipation(activity)
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-400'
                    "
                  >
                    <svg
                      v-if="isActivityComplete(activity)"
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <svg
                      v-else-if="hasParticipation(activity)"
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>

                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ activity.title }}
                    </p>
                    <p class="text-xs text-gray-500">
                      <template v-if="isActivityComplete(activity)">
                        <span class="text-green-600">Completada</span>
                      </template>
                      <template v-else-if="hasParticipation(activity)">
                        <span class="text-yellow-600">En progreso</span>
                      </template>
                      <template v-else> Pendiente </template>
                    </p>
                  </div>

                  <svg
                    class="w-4 h-4 text-gray-400 shrink-0"
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

            <div
              v-else
              class="py-8 text-center border-2 border-dashed border-gray-200 rounded-xl"
            >
              <p class="text-sm text-gray-400">
                No hay actividades en esta etapa.
              </p>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useActivities } from "@/composables/useActivities";
import { useProgramStore } from "@/stores/programStore";
import { useAuthStore } from "@/stores/authStore";
import { useStageProgress } from "@/composables/useStageProgress";

const route = useRoute();
const router = useRouter();
const programStore = useProgramStore();
const authStore = useAuthStore();
const {
  loadProgramStages,
  loadActivities,
  loadUserActivities,
  programStages,
  activities,
  isParticipationComplete,
} = useActivities();

const userParticipations = ref([]);
const {
  getParticipantStageProgress,
  isStageLockedForUser,
  getPrerequisiteStageName,
} = useStageProgress();

const programId = computed(() => route.params.programId);
const businessId = computed(() => route.params.businessId);
const stageId = computed(() => route.params.stageId);
const programName = ref("");
const loading = ref(true);

const stages = computed(() =>
  [...programStages.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
);

const currentStage = computed(() =>
  stages.value.find((s) => s.id === stageId.value),
);

const stageName = computed(() => currentStage.value?.name || "Etapa");

const stageActivities = computed(() =>
  activities.value.filter((a) => a.stageId === stageId.value),
);

const progress = computed(() => {
  if (!currentStage.value) return { total: 0, completed: 0, percentage: 0 };
  return getParticipantStageProgress(
    currentStage.value,
    activities.value,
    userParticipations.value,
  );
});

const isLocked = computed(() => {
  if (!currentStage.value) return false;
  return isStageLockedForUser(
    currentStage.value,
    stages.value,
    activities.value,
    userParticipations.value,
  );
});

const prerequisiteName = computed(() => {
  if (!currentStage.value) return null;
  return getPrerequisiteStageName(currentStage.value, stages.value);
});

// ── Activity status helpers ──────────────────────────
function getParticipation(activity) {
  return userParticipations.value.find((p) => p.activityId === activity.id);
}

function isActivityComplete(activity) {
  const participation = getParticipation(activity);
  if (!participation) return false;
  return isParticipationComplete(activity, participation);
}

function hasParticipation(activity) {
  return !!getParticipation(activity);
}

// ── Navegación ───────────────────────────────────────
function goToActivity(activity) {
  const type = activity.type || "form";
  if (type === "activity" || type === "form") {
    router.push(
      `/business/${businessId.value}/programs/${programId.value}/${activity.id}/activity`,
    );
  } else if (type === "consulting") {
    router.push(
      `/business/${businessId.value}/programs/${programId.value}/consulting-participation/${activity.id}`,
    );
  } else {
    router.push(
      `/business/${businessId.value}/programs/${programId.value}/session-participation/${activity.id}`,
    );
  }
}

function goBack() {
  router.push(
    `/business/${businessId.value}/programs/${programId.value}/stages`,
  );
}

// ── Cargar participaciones del usuario ──────────────
async function loadMyParticipations() {
  const userId = authStore.user?.uid;
  if (!userId) return;
  try {
    const parts = await loadUserActivities(programId.value, userId);
    userParticipations.value = parts ?? [];
  } catch (err) {
    console.error("Error al cargar participaciones:", err);
    userParticipations.value = [];
  }
}

// ── Init ─────────────────────────────────────────────
onMounted(async () => {
  try {
    await programStore.loadProgram(programId.value);
    programName.value = programStore.currentProgram?.name ?? "";
    await Promise.all([
      loadProgramStages(programId.value),
      loadActivities(programId.value),
      loadMyParticipations(),
    ]);
  } catch (err) {
    console.error("Error loading participant stage detail:", err);
  } finally {
    loading.value = false;
  }
});
</script>
