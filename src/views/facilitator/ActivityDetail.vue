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
          <span class="text-sm font-medium">Volver a Actividades</span>
        </button>

        <div v-if="activity" class="flex items-start justify-between">
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

          <button
            v-if="activity.type === 'monitoring'"
            @click="showMonitoringForm = true"
            class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
            <span class="font-medium">Nuevo Monitoreo</span>
          </button>
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">Participantes</p>
              <p class="text-3xl font-bold text-gray-900">
                {{ activity.metadata?.totalParticipants || 0 }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          v-if="activity.scheduledDate"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">Fecha Programada</p>
              <p class="text-lg font-bold text-gray-900">
                {{ formatDate(activity.scheduledDate) }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          v-if="activity.phase"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">Fase</p>
              <p class="text-lg font-bold text-gray-900">
                {{ activity.phase }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Sesión: Tabla de Asistencia -->
      <div
        v-if="activity.type === 'session'"
        class="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">
            Registro de Asistencia
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Marca la asistencia de los participantes
          </p>
        </div>

        <div class="p-6">
          <!-- Tabla de participantes del programa -->
          <div v-if="loadingParticipants" class="text-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"
            ></div>
          </div>

          <div v-else-if="!participants.length" class="text-center py-12">
            <p class="text-gray-500">
              No hay participantes inscritos en el programa
            </p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Participante
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Negocio
                  </th>
                  <th
                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Asistencia
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Notas
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="participant in participants"
                  :key="participant.userId"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ participant.userName }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ participant.userEmail }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ participant.businessName }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      :checked="getAttendanceStatus(participant.userId)"
                      @change="toggleAttendance(participant)"
                      class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                  </td>
                  <td class="px-6 py-4">
                    <input
                      type="text"
                      :value="getAttendanceNotes(participant.userId)"
                      @blur="
                        updateAttendanceNotes(participant, $event.target.value)
                      "
                      placeholder="Notas opcionales"
                      class="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Monitoreo: Lista de Monitoreos Realizados -->
      <div
        v-if="activity.type === 'monitoring'"
        class="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Monitoreos Realizados</h2>
          <p class="text-sm text-gray-600 mt-1">
            Registro de todos los monitoreos completados para esta actividad
          </p>
        </div>

        <div class="p-6">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useActivities } from "@/composables/useActivities";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/firebaseInit";
import MonitoringForm from "@/components/activities/MonitoringForm.vue";

const route = useRoute();
const router = useRouter();
const {
  currentActivity: activity,
  loading,
  loadActivity,
  loadActivityParticipations,
  participations,
  markAttendance,
} = useActivities();

const programId = computed(() => route.params.programId);
const activityId = computed(() => route.params.activityId);

const loadingParticipants = ref(false);
const participants = ref([]);
const showMonitoringForm = ref(false);
const attendanceMap = ref({}); // userId -> { attended, notes }

function getTypeBadgeClass(type) {
  const classes = {
    session: "bg-blue-100 text-blue-700",
    monitoring: "bg-purple-100 text-purple-700",
    assessment: "bg-orange-100 text-orange-700",
  };
  return classes[type] || "bg-gray-100 text-gray-700";
}

function getTypeLabel(type) {
  const labels = {
    session: "Sesión",
    monitoring: "Monitoreo",
    assessment: "Evaluación",
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

function getAttendanceStatus(userId) {
  return attendanceMap.value[userId]?.attended || false;
}

function getAttendanceNotes(userId) {
  return attendanceMap.value[userId]?.notes || "";
}

async function toggleAttendance(participant) {
  const userId = participant.userId;
  const currentStatus = attendanceMap.value[userId]?.attended || false;
  const newStatus = !currentStatus;

  try {
    await markAttendance(
      programId.value,
      activityId.value,
      userId,
      participant,
      newStatus,
      attendanceMap.value[userId]?.notes || ""
    );

    // Actualizar mapa local
    attendanceMap.value[userId] = {
      ...attendanceMap.value[userId],
      attended: newStatus,
    };
  } catch (error) {
    console.error("Error al marcar asistencia:", error);
    alert("Error al guardar la asistencia");
  }
}

async function updateAttendanceNotes(participant, notes) {
  const userId = participant.userId;
  const attended = attendanceMap.value[userId]?.attended || false;

  try {
    await markAttendance(
      programId.value,
      activityId.value,
      userId,
      participant,
      attended,
      notes
    );

    // Actualizar mapa local
    attendanceMap.value[userId] = {
      ...attendanceMap.value[userId],
      notes,
    };
  } catch (error) {
    console.error("Error al actualizar notas:", error);
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
  router.push(`/programs/${programId.value}/activities`);
}

onMounted(async () => {
  try {
    // Cargar actividad
    await loadActivity(programId.value, activityId.value);

    // Cargar participaciones
    await loadActivityParticipations(programId.value, activityId.value);

    // Si es sesión, cargar participantes del programa
    if (activity.value?.type === "session") {
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
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
});
</script>
