<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFacilitatorStore } from '@/stores/facilitator';
import CohortTrafficLight from '@/components/consultant/CohortTrafficLight.vue';
import ReviewDrawer from '@/components/consultant/ReviewDrawer.vue';
import ImportParticipantsModal from '@/components/consultant/ImportParticipantsModal.vue';
import NewParticipantModal from '@/components/consultant/NewParticipantModal.vue';
import ExportConfirmationModal from '@/components/consultant/ExportConfirmationModal.vue';
import ExportProgressModal from '@/components/consultant/ExportProgressModal.vue';
import TransferCohortModal from '@/components/consultant/TransferCohortModal.vue';
import DeleteParticipantModal from '@/components/consultant/DeleteParticipantModal.vue';
import { fetchFullParticipantPlanData } from '@/services/export/participantDataFetcher';
import { downloadBusinessPlanDocx, exportCohortAsZip } from '@/services/export/cohortZipBuilder';

const router = useRouter();
const facilitatorStore = useFacilitatorStore();

const isImportModalOpen = ref(false);
const isNewModalOpen = ref(false);
const isTransferModalOpen = ref(false);
const participantToTransfer = ref(null);
const transferNotification = ref(null);

const isDeleteModalOpen = ref(false);
const participantToDelete = ref(null);
const deleteNotification = ref(null);

const isCreatingCohort = ref(false);
const newCohortNameInput = ref('');
const newCohortCeilingInput = ref(3000);

const isEditingCohortCeiling = ref(false);
const editCeilingInput = ref(3000);

const CEILING_PRESETS = [1500, 2000, 2500, 3000];

// Estado para exportación individual (.docx)
const exportingDnis = ref({});
const isConfirmModalOpen = ref(false);
const currentExportTarget = ref(null);
const isCompilingSingle = ref(false);

// Estado para exportación masiva de cohorte (.zip)
const isZipModalOpen = ref(false);
const zipProgress = ref({
  current: 0,
  total: 0,
  percent: 0,
  currentName: '',
  status: 'starting'
});

onMounted(() => {
  facilitatorStore.initStore();
});

function handleOpenTransferModal(participant) {
  participantToTransfer.value = participant;
  isTransferModalOpen.value = true;
}

function handleParticipantTransferred(eventData) {
  const name = `${eventData.participant?.personalInfo?.firstName || ''} ${eventData.participant?.personalInfo?.lastName || ''}`.trim() || eventData.participant.dni;
  transferNotification.value = {
    message: `Participante ${name} transferido con éxito a ${eventData.targetCohortId}.`,
    targetCohortId: eventData.targetCohortId
  };

  setTimeout(() => {
    transferNotification.value = null;
  }, 8000);
}

function handleSwitchToDestinationCohort(cohortId) {
  facilitatorStore.switchCohort(cohortId);
  transferNotification.value = null;
}

function handleOpenDeleteModal(participant) {
  participantToDelete.value = participant;
  isDeleteModalOpen.value = true;
}

function handleParticipantDeleted(eventData) {
  const name = eventData.name || eventData.dni;
  deleteNotification.value = {
    message: `Participante ${name} (DNI: ${eventData.dni}) eliminado correctamente de la cohorte ${eventData.cohortId || facilitatorStore.activeCohortId}.`
  };

  setTimeout(() => {
    deleteNotification.value = null;
  }, 6000);
}

function openEditCeilingModal() {
  editCeilingInput.value = facilitatorStore.activeCohortCeiling || 3000;
  isEditingCohortCeiling.value = true;
}

async function handleSaveEditedCeiling() {
  await facilitatorStore.updateCohortCeiling(facilitatorStore.activeCohortId, editCeilingInput.value);
  isEditingCohortCeiling.value = false;
}

function handleAddCohortPrompt() {
  isCreatingCohort.value = true;
  newCohortNameInput.value = '';
  newCohortCeilingInput.value = 3000;
}

async function handleSaveNewCohort() {
  if (newCohortNameInput.value.trim()) {
    await facilitatorStore.addCohort(newCohortNameInput.value.trim(), newCohortCeilingInput.value);
    isCreatingCohort.value = false;
  }
}

async function handleLogout() {
  await facilitatorStore.logout();
  router.push('/facilitador/login');
}

/**
 * Disparador de descarga de plan individual (.docx) desde la tabla
 */
async function handleTriggerExportPlan(participant) {
  const dni = String(participant.dni).trim();
  exportingDnis.value[dni] = true;

  try {
    const fullData = await fetchFullParticipantPlanData(dni, {
      ceiling: facilitatorStore.activeCohortCeiling,
      forceServer: true
    });

    // Si tiene secciones pendientes o vacías, abrir modal de confirmación
    if (fullData.unapprovedCount > 0) {
      currentExportTarget.value = fullData;
      isConfirmModalOpen.value = true;
    } else {
      // Descarga directa si todas las secciones están aprobadas
      await downloadBusinessPlanDocx(
        fullData.participantData,
        fullData.costingData,
        fullData.planSections
      );
    }
  } catch (err) {
    console.error(`[CohortTableView] Error al exportar plan de ${dni}:`, err);
  } finally {
    exportingDnis.value[dni] = false;
  }
}

/**
 * Confirmación de exportación de plan individual con borradores
 */
async function handleConfirmExportAnyway() {
  if (!currentExportTarget.value) return;

  isCompilingSingle.value = true;
  try {
    await downloadBusinessPlanDocx(
      currentExportTarget.value.participantData,
      currentExportTarget.value.costingData,
      currentExportTarget.value.planSections
    );
    isConfirmModalOpen.value = false;
    currentExportTarget.value = null;
  } catch (err) {
    console.error('[CohortTableView] Error al compilar documento tras confirmación:', err);
  } finally {
    isCompilingSingle.value = false;
  }
}

/**
 * Exportación de la cohorte completa en formato .zip
 */
async function handleExportCohortZip() {
  const participantsToExport = facilitatorStore.filteredParticipants.length > 0
    ? facilitatorStore.filteredParticipants
    : facilitatorStore.participants;

  if (!participantsToExport || participantsToExport.length === 0) return;

  isZipModalOpen.value = true;
  zipProgress.value = {
    current: 0,
    total: participantsToExport.length,
    percent: 0,
    currentName: 'Preparando compilación...',
    status: 'starting'
  };

  try {
    await exportCohortAsZip({
      cohortId: facilitatorStore.activeCohortId,
      participants: participantsToExport,
      ceiling: facilitatorStore.activeCohortCeiling,
      onProgress: (prog) => {
        zipProgress.value = prog;
      }
    });
  } catch (err) {
    console.error('[CohortTableView] Error al exportar cohorte en ZIP:', err);
    zipProgress.value = {
      ...zipProgress.value,
      currentName: `Error: ${err.message}`,
      status: 'error'
    };
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex flex-col font-sans">
    <!-- BARRA SUPERIOR INSTITUCIONAL -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div class="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logotipo e Identidad -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-lg shadow-sm">
            🌱
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-slate-900 tracking-tight text-base">PlanSeed</span>
              <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                Facilitador
              </span>
            </div>
            <p class="text-[11px] text-slate-500 font-medium hidden sm:block">
              Gestión de Cohortes y Semáforo de Aula en Tiempo Real
            </p>
          </div>
        </div>

        <!-- Selector de Cohorte, Techo Dinámico y Perfil -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Selector de Cohorte -->
          <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span class="text-xs font-bold text-slate-500 hidden md:inline">Cohorte:</span>
            <select
              :value="facilitatorStore.activeCohortId"
              @change="facilitatorStore.switchCohort($event.target.value)"
              class="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer pr-2"
            >
              <option v-for="c in facilitatorStore.availableCohorts" :key="c" :value="c">
                {{ c }}
              </option>
            </select>
            <button
              type="button"
              @click="handleAddCohortPrompt"
              class="text-blue-600 hover:text-blue-800 font-black text-xs px-1 hover:bg-blue-50 rounded transition-colors"
              title="Crear o agregar nueva cohorte"
            >
              +
            </button>
          </div>

          <!-- Techo Dinámico de Capital Semilla de la Cohorte -->
          <button
            type="button"
            @click="openEditCeilingModal"
            class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold text-xs transition-colors shadow-2xs cursor-pointer"
            title="Modificar Techo de Capital Semilla de esta cohorte"
          >
            <span class="text-xs">🌱</span>
            <span class="text-slate-600 font-semibold hidden lg:inline">Fondo:</span>
            <span class="font-black text-emerald-950">
              S/ {{ Number(facilitatorStore.activeCohortCeiling || 3000).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </span>
            <span class="text-[11px] text-emerald-700 ml-0.5">✏️</span>
          </button>

          <!-- Perfil / Logout -->
          <div class="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
            <div class="hidden sm:block text-right">
              <p class="text-xs font-bold text-slate-800 leading-tight">
                {{ facilitatorStore.facilitatorUser?.displayName || 'Consultor' }}
              </p>
              <p class="text-[10px] text-slate-400 truncate max-w-[140px]">
                {{ facilitatorStore.facilitatorUser?.email }}
              </p>
            </div>
            <button
              type="button"
              @click="handleLogout"
              class="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Cerrar sesión de facilitador"
            >
              🚪
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- MODAL: EDITAR TECHO DE COHORTE -->
    <div
      v-if="isEditingCohortCeiling"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-base">
              🌱
            </div>
            <div>
              <h4 class="text-sm font-black text-slate-900 leading-tight">Techo de Capital Semilla</h4>
              <p class="text-[11px] text-slate-500 font-medium">Cohorte: <span class="font-bold text-slate-800">{{ facilitatorStore.activeCohortId }}</span></p>
            </div>
          </div>
          <button
            type="button"
            @click="isEditingCohortCeiling = false"
            class="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        <p class="text-xs text-slate-600 leading-relaxed">
          Define el monto máximo no reembolsable asignado por plan de negocio para esta cohorte. Los participantes y la auditoría calcularán el presupuesto y las alertas respecto a este fondo.
        </p>

        <!-- Presets Rápidos -->
        <div>
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Montos Frecuentes:</span>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="preset in CEILING_PRESETS"
              :key="preset"
              type="button"
              @click="editCeilingInput = preset"
              class="py-1.5 px-2 rounded-xl text-xs font-black border transition-all text-center cursor-pointer"
              :class="[
                editCeilingInput === preset
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              ]"
            >
              S/ {{ preset.toLocaleString('es-PE') }}
            </button>
          </div>
        </div>

        <!-- Input Personalizado -->
        <div>
          <label class="text-xs font-bold text-slate-700 block mb-1">Monto Máximo del Fondo (S/):</label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-xs font-black text-slate-400">S/</span>
            <input
              v-model.number="editCeilingInput"
              type="number"
              min="100"
              step="50"
              class="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              @keydown.enter="handleSaveEditedCeiling"
            />
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            @click="isEditingCohortCeiling = false"
            class="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleSaveEditedCeiling"
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-colors"
          >
            Guardar Techo
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL PEQUEÑO: NUEVA COHORTE -->
    <div
      v-if="isCreatingCohort"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-scaleUp">
        <h4 class="text-sm font-bold text-slate-900 mb-2">Crear Nueva Cohorte</h4>
        <p class="text-xs text-slate-500 mb-3">
          Ingresa el código identificador de la cohorte (ej. OIT-TRUJILLO-03, ACNUR-PIURA-01):
        </p>
        <input
          v-model="newCohortNameInput"
          type="text"
          placeholder="EJ: ONG-LIMA-04"
          class="w-full px-3 py-2 rounded-xl border border-slate-300 uppercase text-xs font-mono mb-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          @keydown.enter="handleSaveNewCohort"
        />

        <!-- Presets y Techo de Capital Semilla para la nueva cohorte -->
        <div class="mb-4">
          <label class="text-[11px] font-bold text-slate-600 block mb-1">Techo de Capital Semilla:</label>
          <div class="grid grid-cols-4 gap-1.5 mb-2">
            <button
              v-for="preset in CEILING_PRESETS"
              :key="preset"
              type="button"
              @click="newCohortCeilingInput = preset"
              class="py-1 px-1 rounded-lg text-[11px] font-black border transition-all text-center cursor-pointer"
              :class="[
                newCohortCeilingInput === preset
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              ]"
            >
              S/ {{ preset.toLocaleString('es-PE') }}
            </button>
          </div>
          <div class="relative">
            <span class="absolute left-2.5 top-2 text-xs font-bold text-slate-400">S/</span>
            <input
              v-model.number="newCohortCeilingInput"
              type="number"
              min="100"
              step="50"
              class="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs font-black text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button
            type="button"
            @click="isCreatingCohort = false"
            class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleSaveNewCohort"
            class="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
          >
            Crear y Seleccionar
          </button>
        </div>
      </div>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- 1. TARJETAS DE MÉTRICAS RÁPIDAS DEL AULA -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <!-- Métrica 1: Total Participantes -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div class="flex items-center justify-between text-slate-400 mb-1">
            <span class="text-xs font-bold text-slate-500">Participantes Activos</span>
            <span class="text-base">👥</span>
          </div>
          <div class="text-2xl font-black text-slate-900">
            {{ facilitatorStore.cohortMetrics.totalParticipants }}
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">En cohorte {{ facilitatorStore.activeCohortId }}</p>
        </div>

        <!-- Métrica 2: Pendientes de Revisión (Destacado) -->
        <div
          class="p-4 rounded-2xl border shadow-2xs transition-colors"
          :class="[
            facilitatorStore.cohortMetrics.pendingReviewsCount > 0
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white border-slate-200/80'
          ]"
        >
          <div class="flex items-center justify-between text-slate-400 mb-1">
            <span class="text-xs font-bold text-amber-900">Por Revisar (IA)</span>
            <span class="text-base">⏳</span>
          </div>
          <div class="text-2xl font-black text-amber-950 flex items-center gap-2">
            <span>{{ facilitatorStore.cohortMetrics.pendingReviewsCount }}</span>
            <span
              v-if="facilitatorStore.cohortMetrics.pendingReviewsCount > 0"
              class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase animate-pulse"
            >
              Auditar
            </span>
          </div>
          <p class="text-[10px] text-amber-800 mt-0.5">Módulos listos para visto bueno</p>
        </div>

        <!-- Métrica 3: Planes Concluidos -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div class="flex items-center justify-between text-slate-400 mb-1">
            <span class="text-xs font-bold text-slate-500">Planes Concluidos</span>
            <span class="text-base">🏆</span>
          </div>
          <div class="text-2xl font-black text-emerald-700">
            {{ facilitatorStore.cohortMetrics.completedPlansCount }}
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">8 de 8 módulos aprobados</p>
        </div>

        <!-- Métrica 4: Avance Promedio del Aula -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div class="flex items-center justify-between text-slate-400 mb-1">
            <span class="text-xs font-bold text-slate-500">Avance del Aula</span>
            <span class="text-base">📈</span>
          </div>
          <div class="text-2xl font-black text-blue-700">
            {{ facilitatorStore.cohortMetrics.averageProgress }}%
          </div>
          <!-- Barra de progreso grupal -->
          <div class="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              class="bg-blue-600 h-1.5 rounded-full transition-all"
              :style="{ width: `${facilitatorStore.cohortMetrics.averageProgress}%` }"
            ></div>
          </div>
        </div>
      </section>

      <!-- 2. BARRA DE HERRAMIENTAS, FILTROS Y BOTONES DE ACCIÓN -->
      <section class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <!-- Filtros y Búsqueda -->
        <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <!-- Campo de Búsqueda -->
          <div class="relative min-w-[200px] flex-1 sm:flex-initial">
            <input
              v-model="facilitatorStore.searchQuery"
              type="text"
              placeholder="Buscar por DNI, nombre o negocio..."
              class="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
            />
            <span class="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>

          <!-- Selector de Foco de Sesión -->
          <div class="flex items-center gap-1 text-xs">
            <label class="text-slate-500 font-bold hidden sm:inline">Sesión:</label>
            <select
              :value="facilitatorStore.focusedSession || ''"
              @change="facilitatorStore.focusedSession = $event.target.value ? Number($event.target.value) : null"
              class="px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Todas (S1 a S8)</option>
              <option value="1">Solo S1: Identidad</option>
              <option value="2">Solo S2: Estrategia</option>
              <option value="3">Solo S3: Propuesta</option>
              <option value="4">Solo S4: Comercial</option>
              <option value="5">Solo S5: Canvas</option>
              <option value="6">Solo S6: Costeo</option>
              <option value="7">Solo S7: Inversión</option>
              <option value="8">Solo S8: Cierre</option>
            </select>
          </div>

          <!-- Filtro por Estado -->
          <div class="flex items-center gap-1 text-xs">
            <label class="text-slate-500 font-bold hidden sm:inline">Estado:</label>
            <select
              v-model="facilitatorStore.statusFilter"
              class="px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Todos los participantes</option>
              <option value="pending_review">🟨 Pendientes de revisión</option>
              <option value="behind">⏳ Rezagados (≤ 1 módulo)</option>
              <option value="completed">🟩 Concluidos (8/8)</option>
            </select>
          </div>
        </div>

        <!-- Botones de Acción: Exportar ZIP, Importar Masivo y Alta Rápida -->
        <div class="flex items-center gap-2">
          <!-- Botón Exportar Cohorte (.zip) -->
          <button
            type="button"
            @click="handleExportCohortZip"
            :disabled="facilitatorStore.participants.length === 0"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs transition-colors shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Compilar y descargar todos los planes de la cohorte en un archivo .zip"
          >
            <span>📦</span>
            <span>Exportar Cohorte (.zip)</span>
          </button>

          <button
            type="button"
            @click="isImportModalOpen = true"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs transition-colors shadow-2xs"
          >
            <span>📥</span>
            <span>Importar Excel / CSV</span>
          </button>

          <button
            type="button"
            @click="isNewModalOpen = true"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm"
          >
            <span>+</span>
            <span>Nuevo Participante</span>
          </button>
        </div>
      </section>

      <!-- 3. TABLERO SEMÁFORO DENSO -->
      <section>
        <CohortTrafficLight
          :exporting-dnis="exportingDnis"
          @export-plan="handleTriggerExportPlan"
          @transfer-cohort="handleOpenTransferModal"
          @delete-participant="handleOpenDeleteModal"
        />
      </section>
    </main>

    <!-- CAJÓN DE AUDITORÍA RÁPIDA (REVIEW DRAWER) -->
    <ReviewDrawer />

    <!-- MODALES DE IMPORTACIÓN Y ALTA -->
    <ImportParticipantsModal
      :is-open="isImportModalOpen"
      @close="isImportModalOpen = false"
    />

    <NewParticipantModal
      :is-open="isNewModalOpen"
      @close="isNewModalOpen = false"
    />

    <!-- MODAL DE TRANSFERENCIA ENTRE COHORTES -->
    <TransferCohortModal
      :is-open="isTransferModalOpen"
      :participant="participantToTransfer"
      @close="isTransferModalOpen = false"
      @transferred="handleParticipantTransferred"
    />

    <!-- MODAL DE ELIMINACIÓN DE PARTICIPANTE DE LA COHORTE -->
    <DeleteParticipantModal
      :is-open="isDeleteModalOpen"
      :participant="participantToDelete"
      @close="isDeleteModalOpen = false"
      @deleted="handleParticipantDeleted"
    />

    <!-- MODAL DE ADVERTENCIA / CONFIRMACIÓN DE PLAN CON BORRADORES -->
    <ExportConfirmationModal
      :is-open="isConfirmModalOpen"
      :participant-name="`${currentExportTarget?.participantData?.personalInfo?.firstName || ''} ${currentExportTarget?.participantData?.personalInfo?.lastName || ''}`"
      :dni="currentExportTarget?.participantData?.dni || ''"
      :commercial-name="currentExportTarget?.participantData?.businessBasicInfo?.commercialName || ''"
      :unapproved-count="currentExportTarget?.unapprovedCount || 0"
      :unapproved-sections="currentExportTarget?.unapprovedSections || []"
      :is-exporting="isCompilingSingle"
      @close="isConfirmModalOpen = false"
      @confirm="handleConfirmExportAnyway"
    />

    <!-- MODAL DE PROGRESO DE EXPORTACIÓN MASIVA (ZIP) -->
    <ExportProgressModal
      :is-open="isZipModalOpen"
      :cohort-id="facilitatorStore.activeCohortId"
      :current="zipProgress.current"
      :total="zipProgress.total"
      :percent="zipProgress.percent"
      :current-name="zipProgress.currentName"
      :status="zipProgress.status"
      @close="isZipModalOpen = false"
    />

    <!-- NOTIFICACIÓN FLOTANTE TRAS TRANSFERENCIA -->
    <div
      v-if="transferNotification"
      class="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in max-w-md"
    >
      <span class="text-xl">✅</span>
      <div class="text-xs space-y-1">
        <p class="font-bold text-slate-100">{{ transferNotification.message }}</p>
        <button
          type="button"
          @click="handleSwitchToDestinationCohort(transferNotification.targetCohortId)"
          class="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
        >
          Cambiar a la cohorte {{ transferNotification.targetCohortId }} →
        </button>
      </div>
      <button
        type="button"
        @click="transferNotification = null"
        class="text-slate-400 hover:text-white ml-2 text-sm cursor-pointer"
      >
        ✕
      </button>
    </div>

    <!-- NOTIFICACIÓN FLOTANTE TRAS ELIMINACIÓN -->
    <div
      v-if="deleteNotification"
      class="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-rose-500/50 flex items-center gap-3 animate-fade-in max-w-md"
    >
      <span class="text-xl">🗑️</span>
      <div class="text-xs space-y-1">
        <p class="font-bold text-rose-200">Participante Eliminado</p>
        <p class="text-slate-300">{{ deleteNotification.message }}</p>
      </div>
      <button
        type="button"
        @click="deleteNotification = null"
        class="text-slate-400 hover:text-white ml-2 text-sm cursor-pointer"
      >
        ✕
      </button>
    </div>
  </div>
</template>
