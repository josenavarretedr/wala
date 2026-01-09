<template>
  <div class="program-participants">
    <!-- Header con búsqueda -->
    <div class="participants-header">
      <div class="header-content">
        <h2>Participantes del Programa</h2>
        <p class="subtitle">
          {{ filteredParticipants.length }} participante(s) encontrado(s)
        </p>
      </div>

      <div class="header-actions">
        <!-- Búsqueda reactiva -->
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre o email..."
            class="search-input"
          />
        </div>

        <!-- Exportar -->
        <button @click="exportParticipants" class="btn-export">
          📊 Exportar
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando participantes...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>❌ {{ error }}</p>
      <button @click="loadData" class="btn-retry">Reintentar</button>
    </div>

    <!-- Tabla Desktop / Lista Mobile -->
    <div v-else class="participants-container">
      <!-- Desktop: Tabla -->
      <table class="participants-table desktop-only">
        <thead>
          <tr>
            <th @click="sortBy('userName')" class="sortable">
              Participante
              <span v-if="sortKey === 'userName'">
                {{ sortOrder === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th
              @click="sortBy('sessionsCompleted')"
              class="sortable text-center"
            >
              Sesiones
              <span v-if="sortKey === 'sessionsCompleted'">
                {{ sortOrder === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th
              @click="sortBy('consultingsCompleted')"
              class="sortable text-center"
            >
              Asesorías
              <span v-if="sortKey === 'consultingsCompleted'">
                {{ sortOrder === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th @click="sortBy('overallProgress')" class="sortable text-center">
              Progreso Total
              <span v-if="sortKey === 'overallProgress'">
                {{ sortOrder === "asc" ? "▲" : "▼" }}
              </span>
            </th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="participant in sortedParticipants"
            :key="participant.id"
            @click="showDetails(participant)"
            class="participant-row"
          >
            <td class="participant-cell">
              <div class="participant-info">
                <strong>{{ participant.userName || "Sin nombre" }}</strong>
                <small>{{ participant.email }}</small>
              </div>
            </td>
            <td class="text-center">
              <span
                class="activity-badge"
                :class="
                  getActivityBadgeClass(
                    participant.sessionsCompleted,
                    participant.sessionsRequired
                  )
                "
              >
                {{ participant.sessionsCompleted }}/{{
                  participant.sessionsRequired
                }}
              </span>
            </td>
            <td class="text-center">
              <span
                class="activity-badge"
                :class="
                  getActivityBadgeClass(
                    participant.consultingsCompleted,
                    participant.consultingsRequired
                  )
                "
              >
                {{ participant.consultingsCompleted }}/{{
                  participant.consultingsRequired
                }}
              </span>
            </td>
            <td>
              <div class="progress-cell">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: participant.overallProgress + '%' }"
                  ></div>
                </div>
                <span class="progress-text"
                  >{{ participant.overallProgress }}%</span
                >
              </div>
            </td>
            <td class="text-center">
              <span
                class="badge"
                :class="{
                  'badge-active': participant.status === 'active',
                  'badge-inactive': participant.status === 'left',
                }"
              >
                {{ participant.status === "active" ? "Activo" : "Inactivo" }}
              </span>
            </td>
            <td class="text-center">
              <button
                @click.stop="showDetails(participant)"
                class="btn-action"
                title="Ver detalle"
              >
                👁️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile: Lista -->
      <div class="participants-list mobile-only">
        <div
          v-for="participant in sortedParticipants"
          :key="participant.id"
          @click="showDetails(participant)"
          class="participant-card"
        >
          <div class="card-header">
            <h3>{{ participant.userName || "Sin nombre" }}</h3>
            <span
              class="badge"
              :class="{
                'badge-active': participant.status === 'active',
                'badge-inactive': participant.status === 'left',
              }"
            >
              {{ participant.status === "active" ? "Activo" : "Inactivo" }}
            </span>
          </div>

          <div class="card-body">
            <p><strong>Email:</strong> {{ participant.email }}</p>
            <p>
              <strong>Sesiones:</strong>
              <span
                :class="
                  getActivityBadgeClass(
                    participant.sessionsCompleted,
                    participant.sessionsRequired
                  )
                "
              >
                {{ participant.sessionsCompleted }}/{{
                  participant.sessionsRequired
                }}
              </span>
            </p>
            <p>
              <strong>Asesorías:</strong>
              <span
                :class="
                  getActivityBadgeClass(
                    participant.consultingsCompleted,
                    participant.consultingsRequired
                  )
                "
              >
                {{ participant.consultingsCompleted }}/{{
                  participant.consultingsRequired
                }}
              </span>
            </p>

            <div class="progress-mobile">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: participant.overallProgress + '%' }"
                ></div>
              </div>
              <span>{{ participant.overallProgress }}% completado</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredParticipants.length === 0" class="empty-state">
        <p>No se encontraron participantes</p>
        <small v-if="searchQuery">
          Intenta ajustar los filtros de búsqueda
        </small>
      </div>
    </div>

    <!-- Modal de Detalle -->
    <ParticipantDetailModal
      v-if="selectedParticipant"
      :participant="selectedParticipant"
      :program-id="programId"
      @close="selectedParticipant = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseInit";
import ParticipantDetailModal from "@/components/facilitator/ParticipantDetailModal.vue";

const route = useRoute();

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════
const programId = computed(() => route.params.programId);
const participants = ref([]);
const activities = ref([]);
const participations = ref([]);
const searchQuery = ref("");
const selectedParticipant = ref(null);
const sortKey = ref("userName");
const sortOrder = ref("asc");
const loading = ref(false);
const error = ref(null);

// ═══════════════════════════════════════════════════════════
// COMPUTED
// ═══════════════════════════════════════════════════════════

/**
 * Actividades obligatorias por tipo
 */
const requiredActivities = computed(() => {
  return {
    session: activities.value.filter(
      (a) => a.type === "session" && a.isRequired
    ),
    consulting: activities.value.filter(
      (a) =>
        (a.type === "consulting" || a.type === "monitoring") && a.isRequired
    ),
  };
});

/**
 * Participantes enriquecidos con estadísticas de participación
 */
const enrichedParticipants = computed(() => {
  return participants.value.map((participant) => {
    // Filtrar participaciones de este participante
    const userParticipations = participations.value.filter(
      (p) => p.userId === participant.userId
    );

    // Contar sesiones completadas (participaciones en actividades tipo session)
    const sessionsCompleted = userParticipations.filter((p) => {
      const activity = activities.value.find((a) => a.id === p.activityId);
      return activity?.type === "session" && activity?.isRequired;
    }).length;

    // Contar asesorías completadas (participaciones en actividades tipo consulting/monitoring)
    const consultingsCompleted = userParticipations.filter((p) => {
      const activity = activities.value.find((a) => a.id === p.activityId);
      return (
        (activity?.type === "consulting" || activity?.type === "monitoring") &&
        activity?.isRequired
      );
    }).length;

    const sessionsRequired = requiredActivities.value.session.length;
    const consultingsRequired = requiredActivities.value.consulting.length;
    const totalRequired = sessionsRequired + consultingsRequired;
    const totalCompleted = sessionsCompleted + consultingsCompleted;

    // Calcular progreso general
    const overallProgress =
      totalRequired > 0
        ? Math.round((totalCompleted / totalRequired) * 100)
        : 0;

    return {
      ...participant,
      sessionsCompleted,
      sessionsRequired,
      consultingsCompleted,
      consultingsRequired,
      totalCompleted,
      totalRequired,
      overallProgress,
    };
  });
});

/**
 * Filtrado reactivo por búsqueda
 */
const filteredParticipants = computed(() => {
  let result = enrichedParticipants.value;

  // Filtro por búsqueda (reactivo a cada letra)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.userName?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query)
    );
  }

  return result;
});

/**
 * Ordenamiento dinámico
 */
const sortedParticipants = computed(() => {
  const sorted = [...filteredParticipants.value];

  sorted.sort((a, b) => {
    let aVal = a[sortKey.value];
    let bVal = b[sortKey.value];

    // Strings
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortOrder.value === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return sorted;
});

// ═══════════════════════════════════════════════════════════
// METHODS
// ═══════════════════════════════════════════════════════════

async function loadData() {
  loading.value = true;
  error.value = null;

  try {
    const pid = programId.value;

    // 1. Cargar participantes desde participants subcollection
    const participantsRef = collection(db, "programs", pid, "participants");
    const participantsSnap = await getDocs(participantsRef);
    participants.value = participantsSnap.docs.map((doc) => ({
      id: doc.id,
      userId: doc.id, // El ID del documento es el userId
      ...doc.data(),
    }));

    // 2. Cargar actividades del programa
    const activitiesRef = collection(db, "programs", pid, "activities");
    const activitiesSnap = await getDocs(activitiesRef);
    activities.value = activitiesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 3. Cargar todas las participaciones del programa
    const participationsRef = collection(db, "programs", pid, "participations");
    const participationsSnap = await getDocs(participationsRef);
    participations.value = participationsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("✅ Datos cargados:", {
      participants: participants.value.length,
      activities: activities.value.length,
      participations: participations.value.length,
    });
  } catch (err) {
    console.error("❌ Error cargando datos:", err);
    error.value = "Error al cargar los datos del programa";
  } finally {
    loading.value = false;
  }
}

function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
}

function showDetails(participant) {
  selectedParticipant.value = participant;
}

function getActivityBadgeClass(completed, required) {
  if (required === 0) return "activity-badge-neutral";
  const percentage = (completed / required) * 100;
  if (percentage === 100) return "activity-badge-complete";
  if (percentage >= 50) return "activity-badge-progress";
  return "activity-badge-low";
}

function exportParticipants() {
  // CSV simple
  const headers = [
    "Nombre",
    "Email",
    "Sesiones Completadas",
    "Sesiones Requeridas",
    "Asesorías Completadas",
    "Asesorías Requeridas",
    "Progreso Total",
    "Estado",
  ];
  const rows = filteredParticipants.value.map((p) => [
    p.userName || "Sin nombre",
    p.email || "",
    p.sessionsCompleted,
    p.sessionsRequired,
    p.consultingsCompleted,
    p.consultingsRequired,
    p.overallProgress + "%",
    p.status === "active" ? "Activo" : "Inactivo",
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
    "\n"
  );

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `participantes_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
}

// ═══════════════════════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════════════════════
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.program-participants {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.participants-header {
  margin-bottom: 2rem;
}

.header-content h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
}

.subtitle {
  color: #666;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.btn-export {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-export:hover {
  background: #059669;
}

/* Tabla Desktop */
.participants-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.participants-table thead {
  background: #f9fafb;
}

.participants-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.participants-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.participants-table th.sortable:hover {
  background: #f3f4f6;
}

.participant-row {
  cursor: pointer;
  transition: background 0.2s;
}

.participant-row:hover {
  background: #f9fafb;
}

.participants-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.participant-cell {
  padding: 1rem;
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.participant-info strong {
  font-weight: 600;
  color: #111827;
}

.participant-info small {
  color: #6b7280;
  font-size: 0.875rem;
}

.activity-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
}

.activity-badge-complete {
  background: #d1fae5;
  color: #065f46;
}

.activity-badge-progress {
  background: #fef3c7;
  color: #92400e;
}

.activity-badge-low {
  background: #fee2e2;
  color: #991b1b;
}

.activity-badge-neutral {
  background: #e5e7eb;
  color: #6b7280;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 45px;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-active {
  background: #d1fae5;
  color: #065f46;
}

.badge-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.btn-action {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-action:hover {
  background: #f3f4f6;
}

/* Lista Mobile */
.participants-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.participant-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.participant-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.card-body p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.progress-mobile {
  margin-top: 1rem;
}

.progress-mobile span {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

/* Estados */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-retry:hover {
  background: #2563eb;
}

/* Responsive */
.desktop-only {
  display: table;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .program-participants {
    padding: 1rem;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
  }

  .header-actions {
    flex-direction: column;
  }

  .search-box,
  .btn-export {
    width: 100%;
  }
}

.text-center {
  text-align: center;
}
</style>
