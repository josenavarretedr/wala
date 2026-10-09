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
            <h1 class="text-xl font-bold text-gray-900">Etapas del Programa</h1>
            <p class="text-sm text-gray-500 truncate">{{ programName }}</p>
          </div>
          <!-- Toggle vista cards / gestión -->
          <button
            @click="showManageMode = !showManageMode"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
            :class="
              showManageMode
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            "
          >
            {{ showManageMode ? "Ver Dashboard" : "Gestionar" }}
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Loading -->
      <div v-if="loadingStages" class="flex items-center justify-center py-12">
        <div
          class="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
        />
      </div>

      <template v-else>
        <!-- ═══ MODO DASHBOARD (Cards) ═══ -->
        <template v-if="!showManageMode">
          <!-- Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div class="flex gap-3">
              <svg
                class="w-5 h-5 text-blue-500 shrink-0 mt-0.5"
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
              <div>
                <p class="text-sm font-medium text-blue-900">
                  Resumen de avance
                </p>
                <p class="text-xs text-blue-700 mt-0.5">
                  Vista general de las etapas y el progreso de los
                  participantes. Haz clic en una etapa para ver el detalle.
                </p>
              </div>
            </div>
          </div>

          <!-- Stage Cards -->
          <div v-if="stages.length" class="space-y-3">
            <StageCard
              v-for="(stage, index) in stages"
              :key="stage.id"
              :stage="stage"
              :order="index + 1"
              user-role="facilitator"
              :metrics="getStageMetrics(stage)"
              :is-first="index === 0"
              :is-last="index === stages.length - 1"
              @move-up="moveStageUp(index)"
              @move-down="moveStageDown(index)"
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
            <p class="text-sm text-gray-400">No hay etapas configuradas.</p>
            <button
              @click="showManageMode = true"
              class="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Crear primera etapa
            </button>
          </div>
        </template>

        <!-- ═══ MODO GESTIÓN (Edición inline) ═══ -->
        <template v-else>
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p class="text-sm font-medium text-amber-900">Modo gestión</p>
                <p class="text-xs text-amber-700 mt-0.5">
                  Crea, edita, reordena y elimina etapas. Configura
                  prerequisitos para controlar el orden de avance.
                </p>
              </div>
            </div>
          </div>

          <!-- Lista editable -->
          <div v-if="stages.length" class="space-y-3">
            <div
              v-for="(stage, index) in stages"
              :key="stage.id"
              class="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
            >
              <div class="flex items-start gap-3">
                <div
                  class="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-lg text-sm font-bold shrink-0"
                >
                  {{ index + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <!-- Nombre (editable) -->
                  <div v-if="editingStageId === stage.id" class="space-y-2">
                    <input
                      v-model="editStageName"
                      type="text"
                      class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      @keydown.enter="confirmEditStage(stage)"
                      @keydown.escape="cancelEditStage"
                    />
                    <div class="flex gap-2">
                      <button
                        @click="confirmEditStage(stage)"
                        class="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                      >
                        Guardar
                      </button>
                      <button
                        @click="cancelEditStage"
                        class="px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                  <template v-else>
                    <p class="text-sm font-semibold text-gray-900">
                      {{ stage.name }}
                    </p>
                  </template>

                  <!-- Prerequisito -->
                  <div class="mt-2">
                    <label class="block text-xs text-gray-500 mb-1"
                      >Prerequisito (etapa previa requerida)</label
                    >
                    <select
                      :value="stage.prerequisiteStageId || ''"
                      @change="
                        handlePrerequisiteChange(stage, $event.target.value)
                      "
                      class="w-full sm:w-64 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Sin prerequisito</option>
                      <option
                        v-for="s in availablePrerequisites(stage)"
                        :key="s.id"
                        :value="s.id"
                      >
                        {{ s.name }}
                      </option>
                    </select>
                  </div>

                  <p class="text-xs text-gray-400 mt-1.5">
                    {{ stageActivityCount(stage.id) }} actividades
                  </p>
                </div>

                <!-- Controles -->
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    @click="moveStageUp(index)"
                    :disabled="index === 0"
                    type="button"
                    class="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Subir"
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
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                  <button
                    @click="moveStageDown(index)"
                    :disabled="index === stages.length - 1"
                    type="button"
                    class="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Bajar"
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <button
                    @click="startEditStage(stage)"
                    type="button"
                    class="p-1.5 text-gray-400 hover:text-blue-600"
                    title="Editar nombre"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="confirmDeleteStage(stage)"
                    type="button"
                    class="p-1.5 text-gray-400 hover:text-red-600"
                    title="Eliminar etapa"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state gestión -->
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
              No hay etapas configuradas. Crea una abajo.
            </p>
          </div>

          <!-- Crear etapa -->
          <div
            class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3"
          >
            <h3 class="text-sm font-semibold text-gray-900">
              Agregar nueva etapa
            </h3>
            <div class="flex gap-2">
              <input
                v-model="newStageName"
                type="text"
                placeholder="Nombre de la etapa..."
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                @keydown.enter="createNewStage"
              />
              <button
                @click="createNewStage"
                :disabled="!newStageName.trim() || creatingStage"
                class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="creatingStage">Creando...</span>
                <span v-else>Agregar</span>
              </button>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- Modal confirmar eliminación -->
    <Teleport to="body">
      <div
        v-if="stageToDelete"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-black/40"
          @click="stageToDelete = null"
        />
        <div
          class="relative bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 space-y-4 z-10"
        >
          <h3 class="text-base font-semibold text-gray-900">Eliminar etapa</h3>
          <p class="text-sm text-gray-600">
            ¿Estás seguro de eliminar la etapa
            <strong>{{ stageToDelete.name }}</strong
            >? Las actividades asignadas a esta etapa no serán eliminadas, pero
            perderán su asignación de etapa.
          </p>
          <div class="flex gap-3">
            <button
              @click="stageToDelete = null"
              class="flex-1 py-2 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              @click="handleDeleteStage"
              :disabled="deletingStage"
              class="flex-1 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {{ deletingStage ? "Eliminando..." : "Eliminar" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useActivities } from "@/composables/useActivities";
import { useProgramStore } from "@/stores/programStore";
import { useToast } from "@/composables/useToast";
import { useStageProgress } from "@/composables/useStageProgress";
import StageCard from "@/components/stages/StageCard.vue";

const route = useRoute();
const router = useRouter();
const { success, error: toastError } = useToast();
const { getFacilitatorStageMetrics } = useStageProgress();
const {
  loadProgramStages,
  saveStage,
  updateStage,
  deleteStage,
  reorderStages,
  programStages,
  loadActivities,
  activities,
} = useActivities();
const programStore = useProgramStore();

const programId = computed(() => route.params.programId);
const programName = ref("");
const loadingStages = ref(true);
const showManageMode = ref(false);
const participantCount = ref(0);

// Stages reactivos (ordenados)
const stages = computed(() =>
  [...programStages.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
);

// ── Métricas para cards ──────────────────────────────
function getStageMetrics(stage) {
  // Por ahora solo contamos actividades; las participaciones globales se cargarán en el detalle
  const activityCount = activities.value.filter(
    (a) => a.stageId === stage.id,
  ).length;
  return {
    activityCount,
    avgCompletion: 0,
    participantsCompleted: 0,
    participantCount: participantCount.value,
  };
}

// ── Navegación al detalle ────────────────────────────
function goToStageDetail(stage) {
  router.push(`/programs/${programId.value}/stages/${stage.id}`);
}

// ── Crear etapa ──────────────────────────────────────
const newStageName = ref("");
const creatingStage = ref(false);

async function createNewStage() {
  const name = newStageName.value.trim();
  if (!name || creatingStage.value) return;
  creatingStage.value = true;
  try {
    await saveStage(programId.value, name);
    newStageName.value = "";
    success("Etapa creada");
  } catch {
    toastError("Error al crear la etapa");
  } finally {
    creatingStage.value = false;
  }
}

// ── Editar nombre ────────────────────────────────────
const editingStageId = ref(null);
const editStageName = ref("");

function startEditStage(stage) {
  editingStageId.value = stage.id;
  editStageName.value = stage.name;
}

function cancelEditStage() {
  editingStageId.value = null;
  editStageName.value = "";
}

async function confirmEditStage(stage) {
  const name = editStageName.value.trim();
  if (!name) return;
  try {
    await updateStage(programId.value, stage.id, { name });
    success("Nombre actualizado");
  } catch {
    toastError("Error al actualizar");
  } finally {
    cancelEditStage();
  }
}

// ── Prerequisito ─────────────────────────────────────
function availablePrerequisites(currentStage) {
  return stages.value.filter(
    (s) => s.id !== currentStage.id && s.order < currentStage.order,
  );
}

async function handlePrerequisiteChange(stage, value) {
  try {
    await updateStage(programId.value, stage.id, {
      prerequisiteStageId: value || null,
    });
    success("Prerequisito actualizado");
  } catch {
    toastError("Error al actualizar prerequisito");
  }
}

// ── Reordenar ────────────────────────────────────────
async function moveStageUp(index) {
  if (index === 0) return;
  const arr = [...stages.value];
  [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
  await applyReorder(arr);
}

async function moveStageDown(index) {
  if (index >= stages.value.length - 1) return;
  const arr = [...stages.value];
  [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
  await applyReorder(arr);
}

async function applyReorder(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].prerequisiteStageId) {
      const prereqIndex = arr.findIndex(
        (s) => s.id === arr[i].prerequisiteStageId,
      );
      if (prereqIndex >= i) {
        toastError(
          `"${arr[i].name}" requiere que "${arr[prereqIndex].name}" esté antes`,
        );
        return;
      }
    }
  }

  const orderedStages = arr.map((s, i) => ({ id: s.id, order: i }));
  try {
    await reorderStages(programId.value, orderedStages);
  } catch {
    toastError("Error al reordenar");
  }
}

// ── Eliminar ─────────────────────────────────────────
const stageToDelete = ref(null);
const deletingStage = ref(false);

function confirmDeleteStage(stage) {
  stageToDelete.value = stage;
}

async function handleDeleteStage() {
  if (!stageToDelete.value) return;
  deletingStage.value = true;
  try {
    await deleteStage(programId.value, stageToDelete.value.id);
    success("Etapa eliminada");
    stageToDelete.value = null;
  } catch {
    toastError("Error al eliminar la etapa");
  } finally {
    deletingStage.value = false;
  }
}

// ── Helpers ──────────────────────────────────────────
function stageActivityCount(stageId) {
  return activities.value.filter((a) => a.stageId === stageId).length;
}

function goBack() {
  router.push(`/programs/${programId.value}`);
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

    // Intentar obtener el conteo de participantes
    try {
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("@/firebaseInit");
      const participantsSnap = await getDocs(
        collection(db, "programs", programId.value, "participants"),
      );
      participantCount.value = participantsSnap.size;
    } catch {
      participantCount.value = 0;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingStages.value = false;
  }
});
</script>
