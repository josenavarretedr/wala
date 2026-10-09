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
        <!-- Stage info card -->
        <div
          class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-gray-900">
              Detalle de la etapa
            </h2>
            <span
              class="px-2.5 py-1 text-xs font-medium rounded-full"
              :class="
                stageMetrics.avgCompletion === 100
                  ? 'bg-green-100 text-green-700'
                  : stageMetrics.avgCompletion > 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
              "
            >
              {{ stageMetrics.avgCompletion }}% promedio
            </span>
          </div>

          <!-- Prerequisito -->
          <div v-if="currentStage" class="space-y-3">
            <!-- Editar nombre -->
            <div>
              <label class="block text-xs text-gray-500 mb-1"
                >Nombre de la etapa</label
              >
              <input
                v-model="editName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-xs text-gray-500 mb-1"
                >Descripción</label
              >
              <textarea
                v-model="editDescription"
                rows="3"
                placeholder="Describe el propósito de esta etapa..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <!-- Botón guardar nombre + descripción -->
            <div class="flex justify-end">
              <button
                @click="saveStageInfo"
                :disabled="!hasStageInfoChanges"
                class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Guardar cambios
              </button>
            </div>

            <!-- Prerequisito selector -->
            <div>
              <label class="block text-xs text-gray-500 mb-1"
                >Prerequisito</label
              >
              <select
                :value="currentStage.prerequisiteStageId || ''"
                @change="handlePrerequisiteChange($event.target.value)"
                class="w-full sm:w-64 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Sin prerequisito</option>
                <option
                  v-for="s in availablePrerequisites"
                  :key="s.id"
                  :value="s.id"
                >
                  {{ s.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Métricas -->
          <div class="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
            <div class="text-center">
              <p class="text-lg font-bold text-gray-900">
                {{ stageActivities.length }}
              </p>
              <p class="text-xs text-gray-500">Actividades</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-gray-900">
                {{ stageMetrics.participantsCompleted }}
              </p>
              <p class="text-xs text-gray-500">Completaron</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-green-600">
                {{ stageMetrics.avgCompletion }}%
              </p>
              <p class="text-xs text-gray-500">Promedio</p>
            </div>
          </div>
        </div>

        <!-- Actividades de la etapa -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-3">
            Actividades ({{ stageActivities.length }})
          </h3>

          <div v-if="stageActivities.length" class="space-y-2">
            <div
              v-for="activity in stageActivities"
              :key="activity.id"
              @click="goToActivity(activity)"
              class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 cursor-pointer hover:border-green-300 hover:shadow-md transition-all"
            >
              <div class="flex items-center gap-3">
                <!-- Type badge -->
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  :class="getActivityTypeBadge(activity.type)"
                >
                  {{ getActivityTypeInitial(activity.type) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ activity.title }}
                  </p>
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span>{{ activity.fields?.length || 0 }} datos</span>
                    <span v-if="activityResponseCount[activity.id]">
                      &middot;
                      {{ activityResponseCount[activity.id] }} respuestas
                    </span>
                    <span
                      v-if="participantCount > 0"
                      class="font-medium"
                      :class="getCompletionColor(activity)"
                    >
                      &middot;
                      {{ getActivityCompletionPct(activity) }}% completado
                    </span>
                  </div>
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
              No hay actividades asignadas a esta etapa.
            </p>
            <button
              @click="goToNewActivity"
              class="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Crear actividad
            </button>
          </div>
        </div>

        <!-- Botón exportar (placeholder) -->
        <div class="pt-4 border-t border-gray-200">
          <button
            disabled
            class="w-full py-2.5 border border-gray-200 text-gray-400 text-sm rounded-lg cursor-not-allowed"
          >
            Exportar datos (próximamente)
          </button>
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
import { useToast } from "@/composables/useToast";
import { useStageProgress } from "@/composables/useStageProgress";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseInit";

const route = useRoute();
const router = useRouter();
const programStore = useProgramStore();
const { success, error: toastError } = useToast();
const { getFacilitatorStageMetrics } = useStageProgress();
const {
  loadProgramStages,
  loadActivities,
  loadActivityParticipations,
  updateStage,
  isParticipationComplete,
  programStages,
  activities,
} = useActivities();

const programId = computed(() => route.params.programId);
const stageId = computed(() => route.params.stageId);
const programName = ref("");
const loading = ref(true);
const editName = ref("");
const editDescription = ref("");
const participantCount = ref(0);
const allParticipations = ref([]);
const activityResponseCount = ref({});
const activityCompletedCount = ref({});

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

const availablePrerequisites = computed(() => {
  if (!currentStage.value) return [];
  return stages.value.filter(
    (s) => s.id !== currentStage.value.id && s.order < currentStage.value.order,
  );
});

const stageMetrics = computed(() => {
  if (!currentStage.value)
    return {
      activityCount: 0,
      avgCompletion: 0,
      participantsCompleted: 0,
      participantCount: 0,
    };
  return getFacilitatorStageMetrics(
    currentStage.value,
    activities.value,
    allParticipations.value,
    participantCount.value,
  );
});

// ── Actions ──────────────────────────────────────────
const hasStageInfoChanges = computed(() => {
  if (!currentStage.value) return false;
  const nameChanged =
    editName.value.trim() && editName.value.trim() !== currentStage.value.name;
  const descChanged =
    (editDescription.value || "").trim() !==
    (currentStage.value.description || "").trim();
  return nameChanged || descChanged;
});

async function saveStageInfo() {
  if (!currentStage.value || !hasStageInfoChanges.value) return;
  const updates = {};
  const name = editName.value.trim();
  const description = editDescription.value.trim();
  if (name && name !== currentStage.value.name) updates.name = name;
  if (description !== (currentStage.value.description || "").trim())
    updates.description = description;
  if (Object.keys(updates).length === 0) return;
  try {
    await updateStage(programId.value, stageId.value, updates);
    success("Etapa actualizada");
  } catch {
    toastError("Error al actualizar la etapa");
  }
}

async function handlePrerequisiteChange(value) {
  try {
    await updateStage(programId.value, stageId.value, {
      prerequisiteStageId: value || null,
    });
    success("Prerequisito actualizado");
  } catch {
    toastError("Error al actualizar prerequisito");
  }
}

function goToActivity(activity) {
  router.push(`/programs/${programId.value}/activities/${activity.id}`);
}

function goToNewActivity() {
  router.push(`/programs/${programId.value}/new-activity`);
}

function goBack() {
  router.push(`/programs/${programId.value}/stages`);
}

// ── Helpers ──────────────────────────────────────────
function getActivityTypeBadge(type) {
  const badges = {
    activity: "bg-blue-100 text-blue-700",
    form: "bg-blue-100 text-blue-700", // Backward compatibility
    consulting: "bg-purple-100 text-purple-700",
    session: "bg-blue-100 text-blue-700",
  };
  return badges[type] || "bg-gray-100 text-gray-700";
}

function getActivityTypeInitial(type) {
  const initials = {
    activity: "A",
    form: "A", // Backward compatibility
    consulting: "C",
    session: "S",
  };
  return initials[type] || "A";
}

function getActivityCompletionPct(activity) {
  const completed = activityCompletedCount.value[activity.id] || 0;
  if (participantCount.value === 0) return 0;
  return Math.round((completed / participantCount.value) * 100);
}

function getCompletionColor(activity) {
  const pct = getActivityCompletionPct(activity);
  if (pct === 100) return "text-green-600";
  if (pct > 0) return "text-yellow-600";
  return "text-gray-400";
}

// ── Init ─────────────────────────────────────────────
onMounted(async () => {
  try {
    await programStore.loadProgram(programId.value);
    programName.value = programStore.currentProgram?.name ?? "";
    await Promise.all([
      loadProgramStages(programId.value),
      loadActivities(programId.value),
    ]);

    editName.value = currentStage.value?.name ?? "";
    editDescription.value = currentStage.value?.description ?? "";

    // Cargar participantes count
    try {
      const participantsSnap = await getDocs(
        collection(db, "programs", programId.value, "participants"),
      );
      participantCount.value = participantsSnap.size;
    } catch {
      /* ignore */
    }

    // Cargar participaciones por actividad de esta etapa
    const stageActs = activities.value.filter(
      (a) => a.stageId === stageId.value,
    );
    const allParts = [];
    for (const act of stageActs) {
      try {
        const partsRef = collection(
          db,
          "programs",
          programId.value,
          "activities",
          act.id,
          "participations",
        );
        const snap = await getDocs(partsRef);
        const parts = snap.docs.map((d) => ({
          id: d.id,
          activityId: act.id,
          ...d.data(),
        }));
        allParts.push(...parts);
        activityResponseCount.value[act.id] = snap.size;

        // Calcular participaciones completadas usando isParticipationComplete
        let completed = 0;
        for (const p of parts) {
          if (isParticipationComplete(act, p)) completed++;
        }
        activityCompletedCount.value[act.id] = completed;
      } catch {
        /* ignore */
      }
    }
    allParticipations.value = allParts;
  } catch (err) {
    console.error("Error loading stage detail:", err);
  } finally {
    loading.value = false;
  }
});
</script>
