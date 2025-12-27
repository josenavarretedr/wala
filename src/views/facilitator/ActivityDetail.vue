<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <ActivityDetailHeader
      v-if="activity"
      :activity="activity"
      @back="goBack"
      @edit="handleEdit"
      @delete="handleDelete"
    />

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
      <!-- Stats según tipo de actividad -->
      <SessionStats
        v-if="activity.type === 'session'"
        :total-participants="activity.metadata?.totalParticipants || 0"
        :drive-link="activity.driveLink"
      />
      <EventStats
        v-if="activity.type === 'event'"
        :total-participants="activity.metadata?.totalParticipants || 0"
        :drive-link="activity.driveLink"
      />
      <MonitoringStats
        v-if="activity.type === 'monitoring'"
        :total-monitoreos="participations.length"
        :average-score="calculateAverageScore()"
      />

      <!-- Listas según tipo de actividad -->
      <AttendanceList
        v-if="activity.type === 'session' || activity.type === 'event'"
        :participants="participants"
        :attendance-map="attendanceMap"
        :loading="loadingParticipants"
        @update="handleAttendanceUpdate"
      />

      <MonitoringList
        v-if="activity.type === 'monitoring'"
        :participations="participations"
        @view-details="handleViewMonitoringDetails"
        @delete="handleDeleteMonitoring"
      />
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
    <DeleteActivityModal
      v-if="showDeleteModal"
      :activity-title="activity?.title"
      :deleting="deleting"
      @cancel="showDeleteModal = false"
      @confirm="confirmDelete"
    />

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
        <span class="font-semibold text-sm">{{ toastMessage }}</span>
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
import ActivityDetailHeader from "@/components/activities/detail/ActivityDetailHeader.vue";
import SessionStats from "@/components/activities/detail/SessionStats.vue";
import EventStats from "@/components/activities/detail/EventStats.vue";
import MonitoringStats from "@/components/activities/detail/MonitoringStats.vue";
import AttendanceList from "@/components/activities/detail/AttendanceList.vue";
import MonitoringList from "@/components/activities/detail/MonitoringList.vue";
import DeleteActivityModal from "@/components/activities/detail/DeleteActivityModal.vue";
import MonitoringForm from "@/components/activities/MonitoringForm.vue";
import ActionBtnActivity from "@/components/activities/ActionBtnActivity.vue";
import CreateActivityModal from "@/components/activities/CreateActivityModal.vue";

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
const toastMessage = ref("");
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const deleting = ref(false);

function calculateAverageScore() {
  if (!participations.value.length) return null;

  const scores = participations.value
    .map((p) => p.monitoringData?.overallScore)
    .filter((score) => score != null);

  if (!scores.length) return null;

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
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
    toastMessage.value = "Asistencias guardadas exitosamente";
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

function handleViewMonitoringDetails(monitoring) {
  console.log("Ver detalles de monitoreo:", monitoring);
  // TODO: Implementar modal o navegación a vista de detalles
}

function handleDeleteMonitoring(monitoring) {
  console.log("Eliminar monitoreo:", monitoring);
  // TODO: Implementar confirmación y eliminación
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
    router.push(`/programs/${programId.value}`);
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
  toastMessage.value = "Actividad actualizada exitosamente";
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
