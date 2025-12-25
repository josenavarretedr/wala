<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <div>
          <h2>{{ participant.userName || "Sin nombre" }}</h2>
          <p class="subtitle">{{ participant.email }}</p>
        </div>
        <button @click="$emit('close')" class="btn-close" title="Cerrar">
          ✕
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando detalles...</p>
      </div>

      <!-- Content -->
      <div v-else class="modal-body">
        <!-- Información General -->
        <section class="info-section">
          <h3>📊 Información General</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Nombre Completo</label>
              <strong>{{ participant.userName || "Sin nombre" }}</strong>
            </div>
            <div class="info-item">
              <label>Email</label>
              <strong>{{ participant.email }}</strong>
            </div>
            <div class="info-item">
              <label>Estado</label>
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
            <div class="info-item">
              <label>Fecha de Ingreso</label>
              <strong>{{ formatDate(participant.joinedAt) }}</strong>
            </div>
          </div>
        </section>

        <!-- Progreso -->
        <section class="progress-section">
          <h3>📈 Progreso del Programa</h3>
          <div class="progress-stats">
            <div class="stat-card">
              <div class="stat-value">
                {{ stats.sessionsCompleted }}/{{ stats.sessionsRequired }}
              </div>
              <div class="stat-label">Sesiones Completadas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">
                {{ stats.monitoringsCompleted }}/{{ stats.monitoringsRequired }}
              </div>
              <div class="stat-label">Monitoreos Completados</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.overallProgress }}%</div>
              <div class="stat-label">Progreso Total</div>
            </div>
          </div>

          <div class="progress-bar-container">
            <label>Progreso General</label>
            <div class="progress-bar-large">
              <div
                class="progress-fill"
                :style="{ width: stats.overallProgress + '%' }"
              >
                <span class="progress-label">{{ stats.overallProgress }}%</span>
              </div>
            </div>
          </div>
        </section>
        <section class="assessments-section">
          <h3>📝 Historial de Participaciones</h3>

          <div v-if="userParticipations.length === 0" class="empty-state">
            <p>No hay participaciones registradas aún</p>
          </div>

          <div v-else class="assessments-list">
            <div
              v-for="(participation, index) in userParticipations"
              :key="participation.id"
              class="assessment-card"
            >
              <div class="assessment-header">
                <div class="assessment-number">
                  #{{ userParticipations.length - index }}
                </div>
                <div class="assessment-info">
                  <strong>{{
                    getActivityTitle(participation.activityId)
                  }}</strong>
                  <small>{{
                    formatDateTime(
                      participation.submittedAt || participation.createdAt
                    )
                  }}</small>
                </div>
                <div class="assessment-score">
                  <span
                    class="type-badge"
                    :class="'badge-' + participation.activityType"
                  >
                    {{
                      participation.activityType === "session"
                        ? "📅 Sesión"
                        : "📋 Monitoreo"
                    }}
                  </span>
                </div>
              </div>

              <div v-if="participation.overallScore" class="assessment-details">
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Puntuación Total</label>
                    <span>{{ participation.overallScore }}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">Cerrar</button>
        <button v-if="participant.email" @click="sendEmail" class="btn-primary">
          📧 Enviar Email
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseInit";

const props = defineProps({
  participant: {
    type: Object,
    required: true,
  },
  programId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const loading = ref(false);
const activities = ref([]);
const participations = ref([]);

// ═══════════════════════════════════════════════════════════
// COMPUTED
// ═══════════════════════════════════════════════════════════

const requiredActivities = computed(() => {
  return {
    session: activities.value.filter(
      (a) => a.type === "session" && a.isRequired
    ),
    monitoring: activities.value.filter(
      (a) => a.type === "monitoring" && a.isRequired
    ),
  };
});

const userParticipations = computed(() => {
  return participations.value.filter(
    (p) => p.userId === props.participant.userId
  );
});

const sessionsCompleted = computed(() => {
  return userParticipations.value.filter((p) => {
    const activity = activities.value.find((a) => a.id === p.activityId);
    return activity?.type === "session" && activity?.isRequired;
  }).length;
});

const monitoringsCompleted = computed(() => {
  return userParticipations.value.filter((p) => {
    const activity = activities.value.find((a) => a.id === p.activityId);
    return activity?.type === "monitoring" && activity?.isRequired;
  }).length;
});

const stats = computed(() => {
  const sessionsReq = requiredActivities.value.session.length;
  const monitoringsReq = requiredActivities.value.monitoring.length;
  const totalReq = sessionsReq + monitoringsReq;
  const totalComp = sessionsCompleted.value + monitoringsCompleted.value;

  return {
    sessionsCompleted: sessionsCompleted.value,
    sessionsRequired: sessionsReq,
    monitoringsCompleted: monitoringsCompleted.value,
    monitoringsRequired: monitoringsReq,
    overallProgress:
      totalReq > 0 ? Math.round((totalComp / totalReq) * 100) : 0,
  };
});

// ═══════════════════════════════════════════════════════════
// METHODS
// ═══════════════════════════════════════════════════════════

async function loadDetails() {
  loading.value = true;
  try {
    const pid = props.programId;

    // Cargar actividades del programa
    const activitiesRef = collection(db, "programs", pid, "activities");
    const activitiesSnap = await getDocs(activitiesRef);
    activities.value = activitiesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Cargar participaciones del usuario
    const participationsRef = collection(db, "programs", pid, "participations");
    const q = query(
      participationsRef,
      where("userId", "==", props.participant.userId)
    );
    const participationsSnap = await getDocs(q);
    participations.value = participationsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("✅ Detalle cargado:", {
      activities: activities.value.length,
      participations: participations.value.length,
    });
  } catch (err) {
    console.error("Error cargando detalle:", err);
  } finally {
    loading.value = false;
  }
}

function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(timestamp) {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function getActivityTitle(activityId) {
  const activity = activities.value.find((a) => a.id === activityId);
  return activity?.title || "Actividad";
}

function sendEmail() {
  if (!props.participant.email) return;

  const subject = encodeURIComponent(
    `Seguimiento - Programa ${props.programId}`
  );
  const body = encodeURIComponent(
    `Hola ${props.participant.userName || "participante"},\n\n` +
      `Me comunico contigo respecto al programa en el que participas.\n\n` +
      `Saludos cordiales.`
  );

  window.location.href = `mailto:${props.participant.email}?subject=${subject}&body=${body}`;
}

// ═══════════════════════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════════════════════
onMounted(() => {
  loadDetails();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #111827;
}

.subtitle {
  margin: 0.25rem 0 0 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
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

/* Secciones */
section {
  margin-bottom: 2rem;
}

section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: #111827;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.info-item strong {
  color: #111827;
}

/* Progress Stats */
.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-bar-container {
  margin-top: 1rem;
}

.progress-bar-container label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.progress-bar-large {
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.5rem;
  transition: width 0.3s;
}

.progress-label {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Assessments List */
.assessments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assessment-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #f9fafb;
}

.assessment-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.assessment-number {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.assessment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.assessment-info strong {
  color: #111827;
}

.assessment-info small {
  color: #6b7280;
  font-size: 0.875rem;
}

.score-badge {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.assessment-details {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: capitalize;
}

.detail-item span {
  font-size: 0.875rem;
  color: #111827;
}

/* Contact Section */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  .type-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .badge-session {
    background: #dbeafe;
    color: #1e40af;
  }

  .badge-monitoring {
    background: #ede9fe;
    color: #5b21b6;
  }
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
}

.contact-icon {
  font-size: 1.25rem;
}

.contact-item a {
  color: #3b82f6;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

/* Badges */
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

.badge-type {
  background: #dbeafe;
  color: #1e40af;
}

.badge-phase {
  background: #fef3c7;
  color: #92400e;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

/* Modal Footer */
.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-content {
    max-height: 95vh;
    margin: 0;
  }

  .info-grid,
  .progress-stats,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-header h2 {
    font-size: 1.25rem;
  }

  .assessment-header {
    flex-wrap: wrap;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
