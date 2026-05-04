<template>
  <div class="pipeline-leads">
    <!-- Header -->
    <div class="pipeline-header">
      <h2 class="pipeline-title">Pipeline de Leads</h2>
      <div class="pipeline-filters">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          class="filter-search"
        />
        <select v-model="filterZona" class="filter-select">
          <option value="">Todas las zonas</option>
          <option v-for="zona in zonas" :key="zona" :value="zona">
            {{ zona }}
          </option>
        </select>
        <select v-model="filterSector" class="filter-select">
          <option value="">Todos los sectores</option>
          <option v-for="sector in sectores" :key="sector" :value="sector">
            {{ sector }}
          </option>
        </select>
      </div>
    </div>

    <!-- Kanban Columns -->
    <div class="kanban-container">
      <div
        v-for="(status, statusKey) in statusColumns"
        :key="statusKey"
        class="kanban-column"
      >
        <div class="column-header" :style="{ borderBottomColor: status.color }">
          <h3 class="column-title" :style="{ color: status.color }">{{ status.label }}</h3>
          <span class="column-count">{{ filteredRecordsByStatus[statusKey].length }}</span>
        </div>

        <draggable
          :list="groupedRecordsRef[statusKey]"
          item-key="id"
          group="leads"
          class="column-cards"
          ghost-class="ghost-card"
          animation="200"
          @change="onDragChange($event, statusKey)"
        >
          <template #item="{ element: record }">
            <div class="lead-card">
            <!-- Lead Info -->
            <div class="lead-header">
              <div class="lead-names">
                <p class="lead-name">{{ record.contactName || record.businessName }}</p>
                <a :href="'https://wa.me/' + formatPhone(record.contactPhone)" target="_blank" class="lead-phone">📱 {{ record.contactPhone }}</a>
              </div>
              <button @click="openMenu(record.id)" class="btn-menu">⋮</button>
            </div>

            <!-- Lead Meta -->
            <div class="lead-meta">
              <span class="badge badge-sector">{{ record.sector }}</span>
              <span class="badge badge-zona">{{ record.zona }}</span>
              <span v-if="record.businessName" class="badge badge-biz">{{ record.businessName }}</span>
            </div>

            <!-- Lead Activity (Badges Inteligentes) -->
            <div class="lead-activity">
              <p class="activity-label">
                <span>⏱️ Hace {{ daysSince(record.updatedAt || record.fechaEvento) }}d</span>
                <span v-if="statusKey === 'en_seguimiento'" class="badge-seguimiento">
                  Seguimiento {{ record.followUpCount || 1 }}/4
                </span>
              </p>
            </div>

            <!-- Copy/WhatsApp Buttons Contextuales -->
            <div class="lead-actions">
              <button
                v-if="statusKey === 'en_seguimiento' && (record.followUpCount || 1) < 4"
                @click="incrementFollowUp(record)"
                class="btn-copy outline"
                title="Siguiente Seguimiento"
              >+1 Seg.</button>
              
              <a
                v-if="getPrimaryAction(statusKey, record)"
                :href="getWhatsappLink(statusKey, record)"
                target="_blank"
                class="btn-copy whatsapp-btn"
              >
                {{ getPrimaryAction(statusKey, record).label }}
              </a>
            </div>

            <!-- Menu Flotante -->
            <div v-if="activeMenu === record.id" class="lead-menu">
              <button @click="viewDetails(record)">👁️ Ver detalles</button>
              <button @click="editLead(record)">✏️ Editar</button>
              <button @click="markDescartado(record.id)" class="btn-danger">🗑️ Descartar</button>
            </div>
          </div>
          </template>
        </draggable>

          <!-- Empty State -->
          <div
            v-if="filteredRecordsByStatus[statusKey].length === 0"
            class="empty-column"
          >
            <p>Arrastra un lead aquí</p>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import draggable from "vuedraggable";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
  zonas: {
    type: Array,
    default: () => [],
  },
  sectores: {
    type: Array,
    default: () => [],
  },
  whatsappTemplates: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update-status", "view-details", "edit", "copy"]);

const statusColumns = {
  tarjeta_entregada: { label: "Tarjeta Entregada", color: "#6b7280" },
  agendado: { label: "Agendado", color: "#3b82f6" },
  diagnosticado: { label: "Diagnosticado", color: "#8b5cf6" },
  en_seguimiento: { label: "En Seguimiento", color: "#f59e0b" },
  cerrado_advisory: { label: "Cierre Advisory", color: "#10b981" },
  cerrado_wala: { label: "Cierre WALA", color: "#059669" },
  descartado: { label: "Descartado", color: "#ef4444" },
};

const searchQuery = ref("");
const filterZona = ref("");
const filterSector = ref("");
const activeMenu = ref(null);
const { showToast } = useToast();

const filteredRecordsByStatus = computed(() => {
  const grouped = {
    tarjeta_entregada: [],
    agendado: [],
    diagnosticado: [],
    en_seguimiento: [],
    cerrado_advisory: [],
    cerrado_wala: [],
    descartado: [],
  };

  props.records
    .filter((r) => {
      const name = (r.contactName || r.businessName || "").toLowerCase();
      const phone = r.contactPhone || "";
      const matchSearch =
        !searchQuery.value ||
        name.includes(searchQuery.value.toLowerCase()) ||
        phone.includes(searchQuery.value);

      const matchZona = !filterZona.value || r.zona === filterZona.value;
      const matchSector = !filterSector.value || r.sector === filterSector.value;

      return matchSearch && matchZona && matchSector;
    })
    .forEach((r) => {
      const key = r.statusPipeline || "tarjeta_entregada";
      if (grouped[key]) grouped[key].push(r);
      else grouped["tarjeta_entregada"].push(r); // fallback
    });

  return grouped;
});

const daysSince = (date) => {
  if (!date) return 0;
  const d = new Date(date.toDate ? date.toDate() : date);
  const days = Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
  return days;
};

const formatPhone = (phone) => {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.length === 9) clean = "51" + clean;
  return clean;
};

const groupedRecordsRef = computed(() => {
  return filteredRecordsByStatus.value;
});

// Drag and Drop Logic con VueDraggable
const onDragChange = (evt, targetStatus) => {
  if (evt.added) {
    const record = evt.added.element;
    const updateData = { recordId: record.id, statusPipeline: targetStatus };
    
    // Si entra a seguimiento, iniciar contador si no tiene
    if (targetStatus === 'en_seguimiento') {
      if (!record.followUpCount) {
        updateData.followUpCount = 1;
      }
    }
    emit("update-status", updateData);
  }
};

const incrementFollowUp = (record) => {
  const current = record.followUpCount || 1;
  if (current < 4) {
    emit("update-status", {
      recordId: record.id,
      followUpCount: current + 1
    });
  }
};

const getPrimaryAction = (statusKey, record) => {
  const map = {
    tarjeta_entregada: { label: "🟢 Enviar Pitch", templateKey: "tarjeta_entregada" },
    agendado: { label: "📅 Recordatorio", templateKey: "agendado" },
    diagnosticado: { label: "📋 Enviar Resumen", templateKey: "diagnosticado" },
    en_seguimiento: { label: `💬 Seguimiento ${record.followUpCount || 1}`, templateKey: `seguimiento_${record.followUpCount || 1}` },
    cerrado_advisory: { label: "🎉 Conf. Advisory", templateKey: "cierre_advisory" },
    cerrado_wala: { label: "🎉 Conf. WALA", templateKey: "cierre_wala" }
  };
  return map[statusKey] || null;
};

const getWhatsappLink = (statusKey, record) => {
  const action = getPrimaryAction(statusKey, record);
  if (!action) return "#";
  
  let template = props.whatsappTemplates[action.templateKey] || "";
  
  // Reemplazar variables
  const name = record.contactName || record.businessName || "Emprendedor";
  template = template.replace(/\[Nombre\]/gi, name);
  template = template.replace(/\[AREAS\]/gi, (record.areasCriticas || []).join(', ') || 'tus áreas');
  template = template.replace(/\[AREA_PRINCIPAL\]/gi, (record.areasCriticas || [])[0] || 'tu área crítica');

  const phone = formatPhone(record.contactPhone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(template)}`;
};

const openMenu = (leadId) => {
  activeMenu.value = activeMenu.value === leadId ? null : leadId;
};

const viewDetails = (record) => {
  activeMenu.value = null;
  emit("view-details", record);
};

const editLead = (record) => {
  activeMenu.value = null;
  emit("edit", record);
};

const markDescartado = (recordId) => {
  activeMenu.value = null;
  emit("update-status", {
    recordId,
    statusPipeline: "descartado",
  });
  showToast({ message: "Registro descartado", type: "success" });
};
</script>

<style scoped>
.pipeline-leads {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pipeline-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pipeline-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.pipeline-filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-search {
  flex: 1;
  min-width: 200px;
  padding: 0.55rem 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
}

.filter-search:focus {
  border-color: #6366f1;
}

.filter-select {
  padding: 0.55rem 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  background: #fff;
  cursor: pointer;
  outline: none;
}

/* Kanban */
.kanban-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scroll-snap-type: x mandatory;
}

.kanban-column {
  background: #f9fafb;
  border-radius: 1rem;
  border: 1px dashed #e5e7eb;
  display: flex;
  flex-direction: column;
  min-width: 280px;
  max-width: 320px;
  flex: 1 0 auto;
  height: calc(100vh - 300px);
  min-height: 500px;
  scroll-snap-align: start;
  transition: background 0.2s;
}

.kanban-column:hover {
  background: #f3f4f6;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 3px solid #e5e7eb;
  background: #fff;
  border-radius: 1rem 1rem 0 0;
}

.column-title {
  font-size: 0.95rem;
  font-weight: 800;
  margin: 0;
}

.column-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 0.85rem;
  font-weight: 700;
}

.column-cards {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-column {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #9ca3af;
  font-size: 0.875rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
}

/* Drag and Drop Ghost */
.ghost-card {
  opacity: 0.5;
  background: #f9fafb;
}

.lead-card {
  background: #fff;
  border-radius: 0.75rem;
  border: 1.5px solid #e5e7eb;
  padding: 0.85rem;
  cursor: grab;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.lead-card:active {
  cursor: grabbing;
}

.lead-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.lead-names {
  flex: 1;
}

.lead-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.lead-phone {
  font-size: 0.8rem;
  color: #25D366;
  margin: 0.2rem 0 0 0;
  font-family: monospace;
  text-decoration: none;
  font-weight: 600;
}
.lead-phone:hover {
  text-decoration: underline;
}

.btn-menu {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 0 0.2rem;
}

.btn-menu:hover {
  color: #4b5563;
}

/* Lead Meta */
.lead-meta {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  padding: 0.25rem 0.5rem;
  border-radius: 0.35rem;
  font-size: 0.7rem;
  font-weight: 700;
}

.badge-sector {
  background: #dbeafe;
  color: #1e40af;
}

.badge-zona {
  background: #dcfce7;
  color: #15803d;
}

.badge-biz {
  background: #fce7f3;
  color: #9d174d;
}

.badge-seguimiento {
  background: #fef3c7;
  color: #b45309;
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
  font-weight: 700;
  font-size: 0.7rem;
}

/* Lead Activity */
.lead-activity {
  margin-bottom: 0.85rem;
}

.activity-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

/* Actions */
.lead-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: nowrap;
}

.btn-copy {
  flex: 1;
  text-align: center;
  padding: 0.45rem 0;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  border: none;
}

.whatsapp-btn {
  background: #25D366;
  color: #fff;
}
.whatsapp-btn:hover {
  background: #1da851;
  box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3);
}

.btn-copy.outline {
  background: #fff;
  border: 1.5px solid #d1d5db;
  color: #4b5563;
  flex: 0 0 60px;
}
.btn-copy.outline:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

/* Menu */
.lead-menu {
  position: absolute;
  top: 2.5rem;
  right: 0.5rem;
  background: #fff;
  border-radius: 0.65rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  overflow: hidden;
  z-index: 10;
  min-width: 140px;
}

.lead-menu button {
  width: 100%;
  padding: 0.6rem 1rem;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}

.lead-menu button:last-child {
  border-bottom: none;
}

.lead-menu button:hover {
  background: #f9fafb;
}

.btn-danger {
  color: #dc2626 !important;
}
.btn-danger:hover {
  background: #fef2f2 !important;
}


/* Scrollbar para el Kanban horizontal */
.kanban-container::-webkit-scrollbar {
  height: 8px;
}
.kanban-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.kanban-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.kanban-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .pipeline-filters {
    flex-direction: column;
  }

  .filter-search {
    min-width: unset;
  }
}
</style>
