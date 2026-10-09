<template>
  <div
    class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
  >
    <!-- Header -->
    <div class="px-5 py-4 border-b border-gray-100">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h3 class="text-base font-semibold text-gray-900">Participantes</h3>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ completedCount }} completados / {{ matrix.length }} total
          </p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Search -->
          <div class="relative flex-1 sm:w-64">
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar participante..."
              class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <!-- Export btn (disabled) -->
          <button
            disabled
            class="p-2 border border-gray-200 rounded-lg text-gray-300 cursor-not-allowed"
            title="Exportar (próximamente)"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-8 text-center">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"
      ></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!matrix.length" class="p-10 text-center text-gray-400">
      <svg
        class="w-12 h-12 mx-auto mb-3 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <p class="text-sm">No hay participantes inscritos en el programa</p>
    </div>

    <!-- ═══════════ TABLA (desktop ≥lg) ═══════════ -->
    <div v-else class="hidden lg:block overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="text-left px-5 py-3 font-medium text-gray-500">
              Participante
            </th>
            <th class="text-left px-5 py-3 font-medium text-gray-500">
              Negocio
            </th>
            <th class="text-center px-5 py-3 font-medium text-gray-500">
              Preguntas
            </th>
            <th
              v-if="hasAttendanceField"
              class="text-center px-5 py-3 font-medium text-gray-500"
            >
              Asistencia
            </th>
            <th class="text-center px-5 py-3 font-medium text-gray-500">
              Estado
            </th>
            <th class="text-right px-5 py-3 font-medium text-gray-500">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="row in filteredMatrix"
            :key="row.userId"
            class="hover:bg-gray-50 transition-colors"
          >
            <!-- Participante -->
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-green-700"
                >
                  {{ getInitials(getRowUserName(row)) }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">
                    {{ getRowUserName(row) }}
                  </p>
                  <p class="text-xs text-gray-400 truncate">
                    {{ row.userEmail }}
                  </p>
                </div>
              </div>
            </td>
            <!-- Negocio -->
            <td class="px-5 py-3 text-gray-600 truncate max-w-[200px]">
              {{ getRowBusinessName(row) || "—" }}
            </td>
            <!-- Preguntas -->
            <td class="px-5 py-3 text-center">
              <svg
                v-if="row.hasResponses"
                class="w-5 h-5 text-green-500 mx-auto"
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
                v-else
                class="w-5 h-5 text-gray-300 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </td>
            <!-- Asistencia -->
            <td v-if="hasAttendanceField" class="px-5 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <template v-for="fieldId in attendanceFieldIds" :key="fieldId">
                  <input
                    type="checkbox"
                    :checked="getAttendanceState(row, fieldId)"
                    @change="toggleAttendance(row, fieldId, $event)"
                    :title="getFieldTitle(fieldId)"
                    class="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                  />
                </template>
              </div>
            </td>
            <!-- Estado -->
            <td class="px-5 py-3 text-center">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  row.isComplete
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700',
                ]"
              >
                {{ row.isComplete ? "Completado" : "Pendiente" }}
              </span>
            </td>
            <!-- Acciones -->
            <td class="px-5 py-3 text-right">
              <button
                v-if="row.participation"
                @click="$emit('view-details', row.participation)"
                class="text-sm text-green-600 hover:text-green-700 font-medium hover:underline"
              >
                Ver
              </button>
              <button
                v-else
                @click="$emit('complete-participant', row)"
                class="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Completar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═══════════ CARDS (mobile <lg) ═══════════ -->
    <div
      v-if="!loading && matrix.length"
      class="lg:hidden divide-y divide-gray-100"
    >
      <div
        v-for="row in filteredMatrix"
        :key="row.userId"
        class="p-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start gap-3">
          <!-- Avatar -->
          <div
            class="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold text-green-700"
          >
            {{ getInitials(getRowUserName(row)) }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ getRowUserName(row) }}
              </p>
              <span
                :class="[
                  'shrink-0 ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  row.isComplete
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700',
                ]"
              >
                {{ row.isComplete ? "Completado" : "Pendiente" }}
              </span>
            </div>
            <p class="text-xs text-gray-500 truncate mt-0.5">
              {{ getRowBusinessName(row) || "—" }}
            </p>

            <!-- Indicadores -->
            <div class="flex items-center gap-3 mt-2">
              <div
                class="flex items-center gap-1 text-xs"
                :class="row.hasResponses ? 'text-green-600' : 'text-gray-400'"
              >
                <svg
                  class="w-3.5 h-3.5"
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
                {{ row.hasResponses ? "Respondido" : "Sin respuesta" }}
              </div>

              <!-- Attendance toggle mobile -->
              <div v-if="hasAttendanceField" class="flex items-center gap-1.5">
                <template v-for="fieldId in attendanceFieldIds" :key="fieldId">
                  <input
                    type="checkbox"
                    :checked="getAttendanceState(row, fieldId)"
                    @change="toggleAttendance(row, fieldId, $event)"
                    class="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
                  />
                  <span class="text-xs text-gray-500">{{
                    getFieldTitle(fieldId)
                  }}</span>
                </template>
              </div>
            </div>

            <!-- Ver detalle -->
            <button
              v-if="row.participation"
              @click="$emit('view-details', row.participation)"
              class="mt-2 text-xs text-green-600 hover:text-green-700 font-medium"
            >
              Ver detalle
            </button>
            <button
              v-else
              @click="$emit('complete-participant', row)"
              class="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Completar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón guardar asistencias (solo si hay cambios pendientes) -->
    <div
      v-if="hasAttendanceField && Object.keys(pendingAttendance).length > 0"
      class="sticky bottom-0 p-4 bg-white border-t border-gray-200 flex items-center justify-between"
    >
      <p class="text-sm text-gray-600">
        {{ Object.keys(pendingAttendance).length }} cambio{{
          Object.keys(pendingAttendance).length !== 1 ? "s" : ""
        }}
        pendiente{{ Object.keys(pendingAttendance).length !== 1 ? "s" : "" }}
      </p>
      <button
        @click="saveAllAttendances"
        :disabled="savingAttendance"
        class="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        <span v-if="savingAttendance">Guardando...</span>
        <span v-else>Guardar asistencias</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useActivities } from "@/composables/useActivities";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  programId: { type: String, required: true },
  activityId: { type: String, required: true },
  activity: { type: Object, required: true },
  matrix: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits([
  "view-details",
  "attendance-saved",
  "complete-participant",
]);

const { markAttendanceField, markAttendanceFieldForUser } = useActivities();
const { success, error: toastError } = useToast();

const searchQuery = ref("");
const pendingAttendance = ref({}); // { `${participationId}_${fieldId}`: { participationId, fieldId, attended } }
const savingAttendance = ref(false);

// Campos attendance
const attendanceFieldIds = computed(() =>
  (props.activity.fields || [])
    .filter((f) => f.type === "attendance")
    .map((f) => f.id),
);

const hasAttendanceField = computed(() => attendanceFieldIds.value.length > 0);

const completedCount = computed(
  () => props.matrix.filter((r) => r.isComplete).length,
);

const filteredMatrix = computed(() => {
  if (!searchQuery.value.trim()) return props.matrix;
  const q = searchQuery.value.toLowerCase();
  return props.matrix.filter(
    (r) =>
      getRowUserName(r).toLowerCase().includes(q) ||
      getRowBusinessName(r).toLowerCase().includes(q),
  );
});

function getRowUserName(row) {
  return (
    row?.profileUser?.name ||
    row?.profileUser?.nombre ||
    row?.userName ||
    row?.name ||
    "Usuario"
  );
}

function getRowBusinessName(row) {
  return (
    row?.businessProfile?.businessName ||
    row?.businessProfile?.razonSocial ||
    row?.businessProfile?.nombreNegocio ||
    row?.businessProfile?.nombre ||
    row?.businessProfile?.businessName ||
    row?.businessProfile?.razonSocial ||
    row?.businessProfile?.nombreNegocio ||
    row?.businessProfile?.nombre ||
    row?.businessName ||
    ""
  );
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getFieldTitle(fieldId) {
  return (
    (props.activity.fields || []).find((f) => f.id === fieldId)?.title ??
    "Asistencia"
  );
}

// Genera la clave para pendingAttendance. Si el participante no tiene
// participación, usa el userId como identificador (prefijo "u:").
function getPendingKey(row, fieldId) {
  return row.participation?.id
    ? `${row.participation.id}_${fieldId}`
    : `u:${row.userId}_${fieldId}`;
}

function getAttendanceState(row, fieldId) {
  // Verificar cambios pendientes primero
  const key = getPendingKey(row, fieldId);
  if (pendingAttendance.value[key] !== undefined) {
    return pendingAttendance.value[key].attended;
  }
  return row.participation?.responses?.[fieldId]?.attended === true;
}

function toggleAttendance(row, fieldId, event) {
  const key = getPendingKey(row, fieldId);
  const attended = event.target.checked;

  // Comparar con el valor original para evitar cambios redundantes
  const originalAttended =
    row.participation?.responses?.[fieldId]?.attended === true;
  if (attended === originalAttended) {
    delete pendingAttendance.value[key];
  } else {
    pendingAttendance.value[key] = {
      participationId: row.participation?.id || null,
      userId: row.userId,
      userName: getRowUserName(row),
      businessId: row.businessId,
      businessName: getRowBusinessName(row),
      fieldId,
      attended,
    };
  }
  // Forzar reactividad
  pendingAttendance.value = { ...pendingAttendance.value };
}

async function saveAllAttendances() {
  savingAttendance.value = true;
  try {
    const promises = Object.values(pendingAttendance.value).map((change) => {
      if (change.participationId) {
        // Participación existente → update directo del campo
        return markAttendanceField(
          props.programId,
          change.participationId,
          change.fieldId,
          change.attended,
          "",
        );
      } else {
        // Sin participación → upsert (crea registro mínimo de asistencia)
        return markAttendanceFieldForUser(
          props.programId,
          props.activityId,
          change.userId,
          {
            userName: change.userName,
            businessId: change.businessId,
            businessName: change.businessName,
          },
          change.fieldId,
          change.attended,
          "",
        );
      }
    });
    await Promise.all(promises);
    pendingAttendance.value = {};
    success("Asistencias guardadas exitosamente");
    emit("attendance-saved");
  } catch (err) {
    console.error("Error guardando asistencias:", err);
    toastError("Error al guardar asistencias");
  } finally {
    savingAttendance.value = false;
  }
}
</script>
