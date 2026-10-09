<template>
  <div class="admin-commercial-dashboard">
    <!-- Header con FAB button -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="page-title">Tablero Comercial</h1>
        <p class="page-subtitle">
          Plan comercial WALA — Gestión de visitas, diagnósticos y cierres
        </p>
      </div>
      <button @click="openQuickEntry" class="btn-fab" title="Registrar nuevo evento">
        <svg
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="commerceStore.loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
    </div>

    <!-- Error State -->
    <div v-if="commerceStore.error" class="error-banner">
      <p>❌ {{ commerceStore.error }}</p>
      <button @click="retryLoad">Reintentar</button>
    </div>

    <!-- Tabs Navigation -->
    <div v-if="!commerceStore.loading" class="tabs-nav">
      <button
        v-for="(tab, key) in tabs"
        :key="key"
        @click="activeTab = key"
        :class="{ active: activeTab === key }"
        class="tab-btn"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div v-if="!commerceStore.loading && !commerceStore.error" class="tabs-content">
      <!-- Tab 1: KPIs -->
      <div v-if="activeTab === 'kpis'" class="tab-panel">
        <CommercialKPIs
          :kpis="commerceStore.kpisWeekly"
          :metas="commerceStore.metasSemanales"
          @update-metas="handleUpdateMetas"
        />
      </div>

      <!-- Tab 2: Pipeline -->
      <div v-if="activeTab === 'pipeline'" class="tab-panel">
        <PipelineLeads
          :records="commerceStore.filteredRecords"
          :zonas="commerceStore.disponibleZones"
          :sectores="commerceStore.disponibleSectors"
          :whatsapp-templates="commerceStore.whatsappTemplates"
          @update-status="handleUpdateStatus"
          @view-details="handleViewDetails"
          @edit="handleEditRecord"
          @associate-business="handleAssociateBusinessRequest"
          @activate-plan="handleActivatePlan"
        />
      </div>

      <!-- Tab 3: Configuración -->
      <div v-if="activeTab === 'config'" class="tab-panel">
        <div class="config-panel">
          <h2 class="section-title">Configuración del Tablero</h2>

          <!-- Zonas -->
          <div class="config-section">
            <h3 class="config-subtitle">Zonas de operación</h3>
            <div class="tags-container">
              <div
                v-for="(zona, idx) in formConfig.activeZones"
                :key="idx"
                class="tag"
              >
                {{ zona }}
                <button @click="removeZona(idx)" class="tag-remove">×</button>
              </div>
              <input
                v-model="newZona"
                type="text"
                placeholder="Nueva zona"
                class="tag-input"
                @keypress.enter="addZona"
              />
              <button @click="addZona" class="btn-add-tag">
                + Agregar zona
              </button>
            </div>
          </div>

          <!-- Sectores -->
          <div class="config-section">
            <h3 class="config-subtitle">Sectores objetivo</h3>
            <div class="tags-container">
              <div
                v-for="(sector, idx) in formConfig.activeSectors"
                :key="idx"
                class="tag"
              >
                {{ sector }}
                <button @click="removeSector(idx)" class="tag-remove">×</button>
              </div>
              <input
                v-model="newSector"
                type="text"
                placeholder="Nuevo sector"
                class="tag-input"
                @keypress.enter="addSector"
              />
              <button @click="addSector" class="btn-add-tag">
                + Agregar sector
              </button>
            </div>
          </div>

          <!-- Campañas -->
          <div class="config-section">
            <h3 class="config-subtitle">Campañas</h3>
            <div class="tags-container">
              <div
                v-for="(campana, idx) in formConfig.campanas"
                :key="idx"
                class="tag tag-purple"
              >
                {{ campana }}
                <button @click="removeCampana(idx)" class="tag-remove">×</button>
              </div>
              <input
                v-model="newCampana"
                type="text"
                placeholder="Nueva campaña"
                class="tag-input"
                @keypress.enter="addCampana"
              />
              <button @click="addCampana" class="btn-add-tag">
                + Agregar campaña
              </button>
            </div>
          </div>

          <!-- Cohortes -->
          <div class="config-section">
            <h3 class="config-subtitle">Cohortes</h3>
            <div class="tags-container">
              <div
                v-for="(cohorte, idx) in formConfig.cohortes"
                :key="idx"
                class="tag tag-orange"
              >
                {{ cohorte }}
                <button @click="removeCohorte(idx)" class="tag-remove">×</button>
              </div>
              <input
                v-model="newCohorte"
                type="text"
                placeholder="Nuevo cohorte"
                class="tag-input"
                @keypress.enter="addCohorte"
              />
              <button @click="addCohorte" class="btn-add-tag">
                + Agregar cohorte
              </button>
            </div>
          </div>

          <!-- Metas Semanales -->
          <div class="config-section">
            <h3 class="config-subtitle">Metas semanales</h3>
            <div class="metas-grid">
              <div class="meta-field">
                <label>Visitas target</label>
                <input
                  v-model.number="formConfig.metasSemanales.visitasTarget"
                  type="number"
                />
              </div>
              <div class="meta-field">
                <label>Pruebas activadas target</label>
                <input
                  v-model.number="formConfig.metasSemanales.pruebasTarget"
                  type="number"
                />
              </div>
              <div class="meta-field">
                <label>Agendados target</label>
                <input
                  v-model.number="formConfig.metasSemanales.agendadosTarget"
                  type="number"
                />
              </div>
              <div class="meta-field">
                <label>Tasa agendamiento mín (%)</label>
                <input
                  v-model.number="formConfig.metasSemanales.tasaAgendamientoMin"
                  type="number"
                />
              </div>
              <div class="meta-field">
                <label>Diag. ejecutados target</label>
                <input
                  v-model.number="formConfig.metasSemanales.diagnosticosEjecutadosTarget"
                  type="number"
                />
              </div>
              <div class="meta-field">
                <label>Cierres Advisory target</label>
                <input
                  v-model.number="formConfig.metasSemanales.cierresTarget"
                  type="number"
                />
              </div>
              <div class="meta-field">
                <label>Cierres WALA target</label>
                <input
                  v-model.number="formConfig.metasSemanales.cierresWalaTarget"
                  type="number"
                />
              </div>
              <div class="meta-field">
                <label>Tasa cierre mín (%)</label>
                <input
                  v-model.number="formConfig.metasSemanales.tasaCierreMin"
                  type="number"
                />
              </div>
              <div class="meta-field">
                <label>Caja target (S/.)</label>
                <input
                  v-model.number="formConfig.metasSemanales.cajaTarget"
                  type="number"
                />
              </div>
            </div>
          </div>

          <!-- Plantillas WhatsApp -->
          <div class="config-section">
            <h3 class="config-subtitle">Plantillas de WhatsApp</h3>
            <div class="template-group" v-for="(val, key) in formConfig.whatsappTemplates" :key="key">
              <label>{{ getTemplateLabel(key) }}</label>
              <textarea
                v-model="formConfig.whatsappTemplates[key]"
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- Save Button -->
          <div class="config-actions">
            <button @click="saveConfig" class="btn-primary">
              💾 Guardar configuración
            </button>
            <button @click="resetConfig" class="btn-secondary">
              ↺ Descartar cambios
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Entry Modal -->
    <QuickEntryModal
      :is-open="showQuickEntry"
      :zonas="commerceStore.disponibleZones"
      :sectores="commerceStore.disponibleSectors"
      @close="closeQuickEntry"
      @submit="handleQuickEntrySubmit"
    />

    <!-- Edit Lead Modal -->
    <EditLeadModal
      :is-open="showEditModal"
      :lead-data="currentEditLead"
      :zonas="commerceStore.disponibleZones"
      :sectores="commerceStore.disponibleSectors"
      @close="closeEditModal"
      @submit="handleEditSubmit"
    />

    <!-- Associate Business Modal -->
    <AssociateBusinessModal
      :is-open="showAssociateModal"
      :lead-id="currentAssociateLead?.id"
      :lead-name="currentAssociateLead?.contactName || currentAssociateLead?.businessName"
      @close="closeAssociateModal"
      @submit="handleAssociateSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCommerceStore } from "@/stores/commerceStore";
import CommercialKPIs from "@/components/Admin/CommercialKPIs.vue";
import PipelineLeads from "@/components/Admin/PipelineLeads.vue";
import QuickEntryModal from "@/components/Admin/QuickEntryModal.vue";
import EditLeadModal from "@/components/Admin/EditLeadModal.vue";
import AssociateBusinessModal from "@/components/Admin/AssociateBusinessModal.vue";
import { useToast } from "@/composables/useToast";

// Store
const commerceStore = useCommerceStore();

// UI State
const activeTab = ref("kpis");
const showQuickEntry = ref(false);
const showEditModal = ref(false);
const currentEditLead = ref(null);
const showAssociateModal = ref(false);
const currentAssociateLead = ref(null);

const { showToast } = useToast();

const newZona = ref("");
const newSector = ref("");
const newCampana = ref("");
const newCohorte = ref("");

const tabs = {
  kpis: { icon: "📊", label: "KPIs Semanales" },
  pipeline: { icon: "🔗", label: "Pipeline" },
  config: { icon: "⚙️", label: "Configuración" },
};

const formConfig = ref({
  activeZones: [],
  activeSectors: [],
  campanas: [],
  cohortes: [],
  metasSemanales: {},
  whatsappTemplates: {},
});

// ──────────────────────────────────────────────
// Lifecycle
// ──────────────────────────────────────────────

onMounted(async () => {
  await loadDashboard();
});

const loadDashboard = async () => {
  await commerceStore.initialize();
  if (!commerceStore.error) {
    initializeFormConfig();
  }
};

const retryLoad = async () => {
  await loadDashboard();
};

const initializeFormConfig = () => {
  formConfig.value = {
    activeZones: [...commerceStore.disponibleZones],
    activeSectors: [...commerceStore.disponibleSectors],
    campanas: [...commerceStore.campanas],
    cohortes: [...commerceStore.cohortes],
    metasSemanales: { ...commerceStore.metasSemanales },
    whatsappTemplates: { ...commerceStore.whatsappTemplates },
  };
};

// ──────────────────────────────────────────────
// Zona / Sector / Campaña / Cohorte Management
// ──────────────────────────────────────────────

const addZona = () => {
  if (newZona.value.trim() && !formConfig.value.activeZones.includes(newZona.value.trim())) {
    formConfig.value.activeZones.push(newZona.value.trim());
    newZona.value = "";
  }
};
const removeZona = (idx) => formConfig.value.activeZones.splice(idx, 1);

const addSector = () => {
  if (newSector.value.trim() && !formConfig.value.activeSectors.includes(newSector.value.trim())) {
    formConfig.value.activeSectors.push(newSector.value.trim());
    newSector.value = "";
  }
};
const removeSector = (idx) => formConfig.value.activeSectors.splice(idx, 1);

const addCampana = () => {
  if (newCampana.value.trim() && !formConfig.value.campanas.includes(newCampana.value.trim())) {
    formConfig.value.campanas.push(newCampana.value.trim());
    newCampana.value = "";
  }
};
const removeCampana = (idx) => formConfig.value.campanas.splice(idx, 1);

const addCohorte = () => {
  if (newCohorte.value.trim() && !formConfig.value.cohortes.includes(newCohorte.value.trim())) {
    formConfig.value.cohortes.push(newCohorte.value.trim());
    newCohorte.value = "";
  }
};
const removeCohorte = (idx) => formConfig.value.cohortes.splice(idx, 1);

// ──────────────────────────────────────────────
// Config Management
// ──────────────────────────────────────────────

const saveConfig = async () => {
  try {
    await commerceStore.updateSettings({
      activeZones: formConfig.value.activeZones,
      activeSectors: formConfig.value.activeSectors,
      campanas: formConfig.value.campanas,
      cohortes: formConfig.value.cohortes,
      metasSemanales: formConfig.value.metasSemanales,
      whatsappTemplates: formConfig.value.whatsappTemplates,
    });
    showToastMessage("✓ Configuración guardada", "success");
  } catch (err) {
    showToastMessage("❌ Error al guardar configuración", "error");
    console.error("Config save error:", err);
  }
};

const resetConfig = () => {
  initializeFormConfig();
  showToastMessage("↺ Cambios descartados", "info");
};

const handleUpdateMetas = async (newMetas) => {
  formConfig.value.metasSemanales = newMetas;
  await saveConfig();
};

// ──────────────────────────────────────────────
// Record Management
// ──────────────────────────────────────────────

const handleUpdateStatus = async (payload) => {
  try {
    // payload: { recordId, statusPipeline, ...extraData }
    const { recordId, statusPipeline, ...extraData } = payload;
    await commerceStore.setRecordStatus(recordId, statusPipeline, extraData);
    showToastMessage("Estado actualizado", "success");

    // Si el estado es agendado, abrir automáticamente el modal de edición para fijar la fecha
    if (statusPipeline === 'agendado') {
      const record = commerceStore.records.find(r => r.id === recordId);
      if (record) {
        handleEditRecord(record);
      }
    }
  } catch (err) {
    showToastMessage("Error al actualizar estado", "error");
    console.error("Update status error:", err);
  }
};

const handleViewDetails = (record) => {
  console.log("View details for record:", record);
  // TODO: Implementar modal de detalles
};

const handleEditRecord = (record) => {
  currentEditLead.value = record;
  showEditModal.value = true;
};

const handleAssociateBusinessRequest = (record) => {
  currentAssociateLead.value = record;
  showAssociateModal.value = true;
};

const closeAssociateModal = () => {
  showAssociateModal.value = false;
  currentAssociateLead.value = null;
};

const handleAssociateSubmit = async ({ recordId, businessId, businessName }) => {
  try {
    await commerceStore.associateLeadToBusiness(recordId, businessId, businessName);
    showToastMessage("Negocio vinculado correctamente", "success");
    closeAssociateModal();
  } catch (err) {
    showToastMessage("Error al vincular negocio", "error");
    console.error(err);
  }
};

const handleActivatePlan = async ({ businessId, planType }) => {
  try {
    await commerceStore.activatePlanFromCRM(businessId, planType);
    showToastMessage(`Plan ${planType === 'trial' ? 'Prueba 5d' : 'Premium'} activado con éxito`, "success");
  } catch (err) {
    showToastMessage("Error al activar plan para el negocio", "error");
    console.error(err);
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  currentEditLead.value = null;
};

const handleEditSubmit = async (data) => {
  try {
    const { recordId, ...updateData } = data;
    await commerceStore.editRecord(recordId, updateData);
    showToastMessage("Lead actualizado", "success");
  } catch (err) {
    showToastMessage("Error al actualizar lead", "error");
    console.error("Update lead error:", err);
  }
};

// ──────────────────────────────────────────────
// Quick Entry
// ──────────────────────────────────────────────

const openQuickEntry = () => {
  showQuickEntry.value = true;
};

const closeQuickEntry = () => {
  showQuickEntry.value = false;
};

const handleQuickEntrySubmit = async (data) => {
  try {
    // data ya viene mapeado al schema de record desde QuickEntryModal
    await commerceStore.addRecord(data);
    showToastMessage("Registro guardado exitosamente", "success");
    closeQuickEntry();
  } catch (err) {
    showToastMessage("Error al guardar registro", "error");
    console.error("Quick entry submit error:", err);
  }
};

// ──────────────────────────────────────────────
// Toast Helper
// ──────────────────────────────────────────────

const getTemplateLabel = (key) => {
  const map = {
    tarjeta_entregada: 'Pitch Inicial (Visita en Frío - Enlace de Registro 5d)',
    agendado: 'Recordatorio de Diagnóstico Agendado',
    diagnosticado: 'Resumen de Diagnóstico (3 Áreas Críticas)',
    seguimiento_trial_1: 'Prueba Gratis - Seguimiento Día 2 (Ingreso y Valor)',
    seguimiento_trial_2: 'Prueba Gratis - Seguimiento Día 5 (Expira Mañana)',
    seguimiento_trial_3: 'Prueba Gratis - Seguimiento Expirado (Último Contacto)',
    seguimiento_advisory_1: 'Advisory - Seguimiento Día 2 (Recordatorio de Áreas)',
    seguimiento_advisory_2: 'Advisory - Seguimiento Día 4 (Pensar en Programa)',
    seguimiento_advisory_3: 'Advisory - Seguimiento Día 6 (Último Contacto)',
    cierre_advisory: 'Mensaje de Cierre - Advisory (S/. 450)',
    cierre_wala: 'Mensaje de Cierre - WALA (S/. 49/mes)'
  };
  return map[key] || key;
};

const showToastMessage = (message, type = "success") => {
  showToast({ message, type });
};
</script>

<style scoped>
.admin-commercial-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #fafbfc;
  min-height: 100vh;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
  color: #fff;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0.5rem 0 0 0;
}

.btn-fab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: #fff;
  border: none;
  color: #667eea;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.btn-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 1rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 0.75rem;
  color: #991b1b;
}

.error-banner p { margin: 0; }

.error-banner button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #fca5a5;
  background: #fff;
  color: #991b1b;
  cursor: pointer;
  transition: all 0.15s;
}

.error-banner button:hover { background: #fef2f2; }

/* Tabs */
.tabs-nav {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  background: #fff;
  border-radius: 1rem 1rem 0 0;
  padding: 0 1.5rem;
}

.tab-btn {
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 3px solid transparent;
  transition: all 0.15s;
  white-space: nowrap;
}

.tab-btn:hover { color: #374151; }

.tab-btn.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

/* Tab Content */
.tabs-content {
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
}

.tab-panel {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Config Panel */
.config-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.config-subtitle {
  font-size: 0.95rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
}

/* Tags */
.tags-container {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.tag-purple {
  background: #ede9fe;
  color: #5b21b6;
}

.tag-orange {
  background: #ffedd5;
  color: #9a3412;
}

.tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0;
  transition: opacity 0.15s;
}

.tag-remove:hover { opacity: 0.6; }

.tag-input {
  flex: 1;
  min-width: 150px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
}

.tag-input:focus { border-color: #4f46e5; }

.btn-add-tag {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-add-tag:hover {
  border-color: #4f46e5;
  color: #4f46e5;
  background: #f0f4ff;
}

/* Metas Grid */
.metas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.meta-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.meta-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
}

.meta-field input {
  padding: 0.6rem 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.65rem;
  font-size: 0.875rem;
  outline: none;
}

.meta-field input:focus { border-color: #4f46e5; }

/* Templates */
.template-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.template-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
}

.template-group textarea {
  padding: 0.6rem 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.65rem;
  font-size: 0.875rem;
  outline: none;
  resize: vertical;
}

.template-group textarea:focus { border-color: #4f46e5; }

/* Config Actions */
.config-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  background: #4f46e5;
  border: none;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-primary:hover { background: #4338ca; }

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover { background: #f3f4f6; }

/* Toast */
.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.12);
  z-index: 100;
  animation: fadeInUp 0.25s ease;
}

.toast.success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.toast.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.toast.info {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

@keyframes fadeInUp {
  from {
    transform: translateX(-50%) translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}
</style>
