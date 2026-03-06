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
          <div>
            <h1 class="text-xl font-bold text-gray-900">Etapas</h1>
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
        <!-- Progreso general -->
        <div
          v-if="stages.length"
          class="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-gray-900">Tu progreso general</p>
            <span
              class="text-sm font-semibold"
              :class="
                globalProgress === 100 ? 'text-green-600' : 'text-gray-600'
              "
            >
              {{ globalProgress }}%
            </span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-500"
              :class="globalProgress === 100 ? 'bg-green-500' : 'bg-green-400'"
              :style="{ width: globalProgress + '%' }"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1.5">
            {{ completedStageCount }}/{{ stages.length }} etapas completadas
          </p>
        </div>

        <!-- Stage Cards -->
        <div v-if="stages.length" class="space-y-3">
          <StageCard
            v-for="(stage, index) in stages"
            :key="stage.id"
            :stage="stage"
            :order="index + 1"
            user-role="participant"
            :progress="getProgress(stage)"
            :is-locked="checkLocked(stage)"
            :is-completed="getProgress(stage).percentage === 100"
            :prerequisite-stage-name="getPrerequisiteName(stage)"
            @go-to-stage="goToStageDetail(stage)"
          />
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="py-12 text-center border-2 border-dashed border-gray-200 rounded-xl"
        >
          <svg
            class="w-10 h-10 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p class="text-sm text-gray-400">
            Este programa aún no tiene etapas configuradas.
          </p>
        </div>
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
import StageCard from "@/components/stages/StageCard.vue";

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
} = useActivities();

const userParticipations = ref([]);
const {
  getParticipantStageProgress,
  isStageLockedForUser,
  getPrerequisiteStageName,
} = useStageProgress();

const programId = computed(() => route.params.programId);
const businessId = computed(() => route.params.businessId);
const programName = ref("");
const loading = ref(true);

const stages = computed(() =>
  [...programStages.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
);

// ── Progreso ─────────────────────────────────────────
function getProgress(stage) {
  return getParticipantStageProgress(
    stage,
    activities.value,
    userParticipations.value,
  );
}

function checkLocked(stage) {
  return isStageLockedForUser(
    stage,
    stages.value,
    activities.value,
    userParticipations.value,
  );
}

function getPrerequisiteName(stage) {
  return getPrerequisiteStageName(stage, stages.value);
}

const completedStageCount = computed(
  () => stages.value.filter((s) => getProgress(s).percentage === 100).length,
);

const globalProgress = computed(() => {
  if (!stages.value.length) return 0;
  const totalPercentage = stages.value.reduce(
    (acc, s) => acc + getProgress(s).percentage,
    0,
  );
  return Math.round(totalPercentage / stages.value.length);
});

// ── Navegación ───────────────────────────────────────
function goToStageDetail(stage) {
  router.push(
    `/business/${businessId.value}/programs/${programId.value}/stages/${stage.id}`,
  );
}

function goBack() {
  router.push(`/business/${businessId.value}/programs/${programId.value}`);
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
    console.error("Error loading participant stages:", err);
  } finally {
    loading.value = false;
  }
});
</script>
