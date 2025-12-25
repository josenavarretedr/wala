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
          <span class="text-xs sm:text-sm font-medium">Volver a Programa</span>
        </button>

        <div
          v-if="activity"
          class="flex items-start justify-between gap-3 sm:gap-4"
        >
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <span
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-full',
                  getTypeBadgeClass(activity.type),
                ]"
              >
                {{ getTypeLabel(activity.type) }}
              </span>
              <span
                v-if="activity.isRequired"
                class="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-700"
              >
                Obligatoria
              </span>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              {{ activity.title }}
            </h1>
            <p class="text-gray-600">{{ activity.description }}</p>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              @click="handleEdit"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit class="w-5 h-5" />
              <span class="hidden sm:inline font-medium">Editar</span>
            </button>
            <button
              @click="handleDelete"
              class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash class="w-5 h-5" />
              <span class="hidden sm:inline font-medium">Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"
      ></div>
    </div>

    <!-- Content -->
    <div
      v-else-if="activity"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs sm:text-sm text-gray-500 mb-1">Participantes</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900">
                {{ activity.metadata?.totalParticipants || 0 }}
              </p>
            </div>
            <div
              class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <Community class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          v-if="activity.driveLink"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 mr-4">
              <p class="text-xs sm:text-sm text-gray-500 mb-1">Archivos</p>
              <a
                :href="activity.driveLink"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs sm:text-sm text-green-600 hover:text-green-700 underline break-all"
              >
                Ver en Google Drive
              </a>
            </div>
            <div
              class="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Sesión/Evento: Cards de Asistencia -->
      <div
        v-if="activity.type === 'session' || activity.type === 'event'"
        class="bg-white rounded-lg shadow-sm border border-gray-100 mb-24"
      >
        <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          <h2 class="text-base sm:text-lg font-bold text-gray-900">
            Registro de Asistencia
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Marca la asistencia de los participantes
          </p>
        </div>

        <div class="p-4 sm:p-6">
          <!-- Loading -->
          <div v-if="loadingParticipants" class="text-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"
            ></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!participants.length" class="text-center py-12">
            <p class="text-gray-500">
              No hay participantes inscritos en el programa
            </p>
          </div>

          <!-- Lista de Cards de Asistencia -->
          <div v-else class="space-y-3">
            <AttendanceCard
              v-for="participant in participants"
              :key="participant.userId"
              :participant="participant"
              :attendance="
                attendanceMap[participant.userId] || {
                  attended: false,
                  notes: '',
                }
              "
              @update="handleAttendanceUpdate"
            />
          </div>
        </div>
      </div>

      <!-- Monitoreo: Lista de Monitoreos Realizados -->
      <div
        v-if="activity.type === 'monitoring'"
        class="bg-white rounded-lg shadow-sm border border-gray-100 mb-24"
      >
        <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          <h2 class="text-base sm:text-lg font-bold text-gray-900">
            Monitoreos Realizados
          </h2>
          <p class="text-xs sm:text-sm text-gray-600 mt-1">
            Registro de todos los monitoreos completados para esta actividad
          </p>
        </div>

        <div class="p-4 sm:p-6">
          <div v-if="!participations.length" class="text-center py-12">
            <p class="text-gray-500">No se han realizado monitoreos aún</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="monitoring in participations"
              :key="monitoring.id"
              class="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
            >
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="font-semibold text-gray-900">
                    {{ monitoring.userName }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    {{ monitoring.businessName }}
                  </p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-purple-600">
                    {{
                      monitoring.monitoringData?.overallScore?.toFixed(1) ||
                      "N/A"
                    }}
                  </div>
                  <p class="text-xs text-gray-500">Score General</p>
                </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <p class="text-xs text-gray-500">Modalidad</p>
                  <p class="text-sm font-medium text-gray-900">
                    {{ monitoring.monitoringData?.modality || "N/A" }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Fecha Monitoreo</p>
                  <p class="text-sm font-medium text-gray-900">
                    {{ formatDate(monitoring.monitoringData?.monitoringDate) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Enviado</p>
                  <p class="text-sm font-medium text-gray-900">
                    {{ formatDate(monitoring.submittedAt) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Evidencias</p>
                  <p class="text-sm font-medium text-gray-900">
                    {{ monitoring.monitoringData?.evidenceUrls?.length || 0 }}
                  </p>
                </div>
              </div>

              <!-- Category Scores -->
              <div
                v-if="monitoring.monitoringData?.categoryScores"
                class="mt-3"
              >
                <p class="text-xs text-gray-500 mb-2">Scores por Categoría:</p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div
                    v-for="(score, category) in monitoring.monitoringData
                      .categoryScores"
                    :key="category"
                    class="text-xs"
                  >
                    <span class="text-gray-600"
                      >{{ getCategoryLabel(category) }}:</span
                    >
                    <span class="font-semibold text-gray-900 ml-1">{{
                      score.toFixed(1)
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Comentarios adicionales -->
              <div
                v-if="monitoring.monitoringData?.additionalComments"
                class="mt-3 pt-3 border-t border-gray-100"
              >
                <p class="text-xs text-gray-500 mb-1">Comentarios:</p>
                <p class="text-sm text-gray-700">
                  {{ monitoring.monitoringData.additionalComments }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monitoring Form Modal -->
    <MonitoringForm
      v-if="showMonitoringForm && activity"
      :program-id="programId"
      :activity="activity"
      @close="showMonitoringForm = false"
      @submitted="handleMonitoringSubmitted"
    />

    <!-- Edit Activity Modal -->
    <CreateActivityModal
      v-if="showEditModal"
      :program="{ id: programId }"
      :activities="[]"
      :edit-mode="true"
      :activity-to-edit="activity"
      @close="showEditModal = false"
      @created="handleActivityUpdated"
    />

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6">
        <div class="flex items-center gap-3 mb-3 sm:mb-4">
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <WarningTriangle class="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
            Eliminar Actividad
          </h3>
        </div>
        <p class="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          ¿Estás seguro de que deseas eliminar la actividad "{{
            activity?.title
          }}"? Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-3">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            @click="confirmDelete"
            :disabled="deleting"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="deleting">Eliminando...</span>
            <span v-else>Eliminar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Action Button Fixed Bottom -->
    <ActionBtnActivity
      v-if="activity"
      :type="activity.type"
      :pending-changes="pendingChanges"
      :saving="savingAttendance"
      @save="saveAllAttendances"
      @new-monitoring="showMonitoringForm = true"
    />

    <!-- Toast de Éxito -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="showSuccessToast"
        class="fixed bottom-24 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-sm border border-green-500"
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
              stroke-width="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <span class="font-semibold text-sm"
          >Asistencias guardadas exitosamente</span
        >
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useActivities } from "@/composables/useActivities";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/firebaseInit";
import MonitoringForm from "@/components/activities/MonitoringForm.vue";
import AttendanceCard from "@/components/activities/AttendanceCard.vue";
import ActionBtnActivity from "@/components/activities/ActionBtnActivity.vue";
import CreateActivityModal from "@/components/activities/CreateActivityModal.vue";
import {
  NavArrowLeft,
  Community,
  Edit,
  Trash,
  WarningTriangle,
} from "@iconoir/vue";

const route = useRoute();
const router = useRouter();
const {
  currentActivity: activity,
  loading,
  loadActivity,
  loadActivityParticipations,
  participations,
  markAttendance,
  deleteActivity,
} = useActivities();

const programId = computed(() => route.params.programId);
const activityId = computed(() => route.params.activityId);

const loadingParticipants = ref(false);
const participants = ref([]);
const showMonitoringForm = ref(false);
const attendanceMap = ref({}); // userId -> { attended, notes }
const originalAttendanceMap = ref({}); // Para comparar cambios
const pendingChanges = ref({}); // userId -> { attended, notes }
const savingAttendance = ref(false);
const showSuccessToast = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const deleting = ref(false);

function getTypeBadgeClass(type) {
  const classes = {
    session: "bg-blue-100 text-blue-700",
    monitoring: "bg-purple-100 text-purple-700",
    event: "bg-orange-100 text-orange-700",
  };
  return classes[type] || "bg-gray-100 text-gray-700";
}

function getTypeLabel(type) {
  const labels = {
    session: "Sesión",
    monitoring: "Monitoreo",
    event: "Evento",
  };
  return labels[type] || type;
}

function getCategoryLabel(category) {
  const labels = {
    negocio: "Negocio",
    marketing: "Marketing",
    controlStock: "Control Stock",
    compras: "Compras",
    costeo: "Costeo",
    mantenimientoRegistros: "Registros",
    planificacion: "Planificación",
  };
  return labels[category] || category;
}

function formatDate(timestamp) {
  if (!timestamp) return "N/A";

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

function handleAttendanceUpdate(data) {
  const { userId, attended, notes } = data;

  // Actualizar mapa local
  attendanceMap.value[userId] = { attended, notes };

  // Detectar cambios comparando con el original
  const original = originalAttendanceMap.value[userId] || {
    attended: false,
    notes: "",
  };
  const hasChanged = original.attended !== attended || original.notes !== notes;

  if (hasChanged) {
    // Agregar a cambios pendientes
    pendingChanges.value[userId] = { attended, notes };
  } else {
    // Remover de cambios pendientes si volvió al estado original
    delete pendingChanges.value[userId];
  }
}

async function saveAllAttendances(changes) {
  savingAttendance.value = true;

  try {
    // Guardar todos los cambios en paralelo
    const savePromises = Object.entries(changes).map(([userId, data]) => {
      const participant = participants.value.find((p) => p.userId === userId);
      if (!participant) return Promise.resolve();

      return markAttendance(
        programId.value,
        activityId.value,
        userId,
        participant,
        data.attended,
        data.notes
      );
    });

    await Promise.all(savePromises);

    // Actualizar el mapa original y limpiar cambios pendientes
    originalAttendanceMap.value = { ...attendanceMap.value };
    pendingChanges.value = {};

    // Mostrar toast de éxito
    showSuccessToast.value = true;
    setTimeout(() => {
      showSuccessToast.value = false;
    }, 3000);
  } catch (error) {
    console.error("Error al guardar asistencias:", error);
    alert("Error al guardar las asistencias");
  } finally {
    savingAttendance.value = false;
  }
}

async function loadProgramParticipants() {
  loadingParticipants.value = true;

  try {
    const participantsRef = collection(
      db,
      "programs",
      programId.value,
      "participants"
    );
    const q = query(participantsRef);
    const snapshot = await getDocs(q);

    participants.value = snapshot.docs
      .map((doc) => ({
        userId: doc.id,
        ...doc.data(),
      }))
      .filter((p) => p.status === "active");

    console.log(`✅ ${participants.value.length} participantes cargados`);
  } catch (error) {
    console.error("Error al cargar participantes:", error);
  } finally {
    loadingParticipants.value = false;
  }
}

async function handleMonitoringSubmitted() {
  showMonitoringForm.value = false;
  // Recargar participaciones
  await loadActivityParticipations(programId.value, activityId.value);
}

function goBack() {
  router.push(`/programs/${programId.value}`);
}

function handleEdit() {
  showEditModal.value = true;
}

function handleDelete() {
  showDeleteModal.value = true;
}

async function confirmDelete() {
  deleting.value = true;

  try {
    await deleteActivity(programId.value, activityId.value);

    // Redirigir a la lista de actividades
    router.push(`/programs/${programId.value}/activities`);
  } catch (error) {
    console.error("Error al eliminar actividad:", error);
    alert("Error al eliminar la actividad");
    deleting.value = false;
  }
}

async function handleActivityUpdated() {
  showEditModal.value = false;

  // Recargar la actividad actualizada
  await loadActivity(programId.value, activityId.value);
  await loadActivityParticipations(programId.value, activityId.value);

  // Mostrar toast de éxito
  showSuccessToast.value = true;
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 3000);
}

onMounted(async () => {
  try {
    // Cargar actividad
    await loadActivity(programId.value, activityId.value);

    // Cargar participaciones
    await loadActivityParticipations(programId.value, activityId.value);

    // Si es sesión o evento, cargar participantes del programa
    if (
      activity.value?.type === "session" ||
      activity.value?.type === "event"
    ) {
      await loadProgramParticipants();

      // Construir mapa de asistencia desde participations
      participations.value.forEach((p) => {
        if (p.attendance) {
          attendanceMap.value[p.userId] = {
            attended: p.attendance.attended,
            notes: p.attendance.notes || "",
          };
        }
      });

      // Guardar estado original para detectar cambios
      originalAttendanceMap.value = JSON.parse(
        JSON.stringify(attendanceMap.value)
      );
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
});
</script>
