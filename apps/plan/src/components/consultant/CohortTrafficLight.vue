<script setup>
import { computed } from 'vue';
import { useFacilitatorStore } from '@/stores/facilitator';

const facilitatorStore = useFacilitatorStore();

const sessionsList = [
  { id: 1, label: 'S1', title: 'Identidad' },
  { id: 2, label: 'S2', title: 'Estrategia' },
  { id: 3, label: 'S3', title: 'Propuesta' },
  { id: 4, label: 'S4', title: 'Comercial' },
  { id: 5, label: 'S5', title: 'Canvas' },
  { id: 6, label: 'S6', title: 'Costeo' },
  { id: 7, label: 'S7', title: 'Inversión' },
  { id: 8, label: 'S8', title: 'Cierre' }
];

const visibleSessions = computed(() => {
  if (facilitatorStore.focusedSession) {
    return sessionsList.filter((s) => s.id === facilitatorStore.focusedSession);
  }
  return sessionsList;
});

function handleCellClick(participant, sessionId) {
  const status = facilitatorStore.getCellStatus(participant.dni, sessionId);
  // Permitir inspeccionar cualquier sesión salvo si está bloqueada sin datos
  if (status !== 'bloqueado' || facilitatorStore.getSessionProgress(participant.dni, sessionId)) {
    facilitatorStore.openReviewDrawer(participant, sessionId);
  }
}

function getNatureBadgeClass(nature) {
  switch (nature) {
    case 'produccion':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'servicio':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'comercio':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }
}

const emit = defineEmits(['export-plan', 'transfer-cohort', 'delete-participant']);

defineProps({
  exportingDnis: {
    type: Object,
    default: () => ({})
  }
});

function handleExportClick(participant) {
  emit('export-plan', participant);
}

function handleTransferClick(participant) {
  emit('transfer-cohort', participant);
}

function handleDeleteClick(participant) {
  emit('delete-participant', participant);
}
</script>

<template>
  <div class="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
    <!-- CONTENEDOR CON DESPLAZAMIENTO HORIZONTAL PARA LA TABLA DENSA -->
    <div class="overflow-x-auto min-h-[400px]">
      <table class="w-full text-left border-collapse text-xs">
        <!-- ENCABEZADO TIPO HOJA DE CÁLCULO -->
        <thead class="bg-slate-100 border-b border-slate-200 text-slate-700 sticky top-0 z-20">
          <tr>
            <!-- COLUMNAS FIJAS / STICKY -->
            <th class="py-3 px-3.5 font-bold uppercase tracking-wider text-[11px] sticky left-0 bg-slate-100 z-30 shadow-xs w-28">
              DNI
            </th>
            <th class="py-3 px-3.5 font-bold uppercase tracking-wider text-[11px] sticky left-28 bg-slate-100 z-30 shadow-xs min-w-[200px]">
              Emprendedor(a)
            </th>
            <th class="py-3 px-3 font-bold uppercase tracking-wider text-[11px] min-w-[200px]">
              Negocio / Emprendimiento
            </th>
            <th class="py-3 px-3 font-bold uppercase tracking-wider text-[11px] w-28 text-center">
              Naturaleza
            </th>

            <!-- COLUMNAS S1 A S8 (O ENFOCADA) -->
            <th
              v-for="session in visibleSessions"
              :key="session.id"
              class="py-3 px-2 font-black uppercase text-center border-l border-slate-200"
              :class="[
                facilitatorStore.focusedSession === session.id
                  ? 'bg-blue-100 text-blue-900 min-w-[140px]'
                  : 'w-16 min-w-[64px]'
              ]"
            >
              <div class="flex flex-col items-center">
                <span class="text-xs">{{ session.label }}</span>
                <span class="text-[9px] font-semibold text-slate-500 truncate max-w-[80px]">
                  {{ session.title }}
                </span>
              </div>
            </th>

            <!-- AVANCE TOTAL -->
            <th class="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-center w-24 border-l border-slate-200">
              Avance
            </th>

            <!-- ACCIONES -->
            <th class="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-center min-w-[240px] border-l border-slate-200 sticky right-0 bg-slate-100 z-30 shadow-xs">
              Acciones
            </th>
          </tr>
        </thead>

        <!-- CUERPO DE LA TABLA -->
        <tbody class="divide-y divide-slate-200/80 font-medium text-slate-800">
          <!-- ESTADO DE CARGA -->
          <tr v-if="facilitatorStore.isLoadingCohort">
            <td :colspan="6 + visibleSessions.length" class="py-16 text-center text-slate-400">
              <div class="flex flex-col items-center justify-center gap-2">
                <div class="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-xs font-semibold">Sincronizando semáforo en tiempo real con Firestore...</p>
              </div>
            </td>
          </tr>

          <!-- ESTADO VACÍO -->
          <tr v-else-if="facilitatorStore.filteredParticipants.length === 0">
            <td :colspan="6 + visibleSessions.length" class="py-16 text-center text-slate-400">
              <div class="flex flex-col items-center justify-center gap-2">
                <span class="text-3xl">📋</span>
                <p class="text-sm font-bold text-slate-700">No se encontraron participantes</p>
                <p class="text-xs text-slate-500">
                  {{
                    facilitatorStore.participants.length === 0
                      ? 'Esta cohorte aún no tiene participantes. Utiliza [📥 Importar Excel] o [+ Nuevo Participante].'
                      : 'Ningún participante coincide con los filtros o el texto de búsqueda.'
                  }}
                </p>
              </div>
            </td>
          </tr>

          <!-- FILAS DE PARTICIPANTES -->
          <tr
            v-else
            v-for="(p, index) in facilitatorStore.filteredParticipants"
            :key="p.dni"
            class="hover:bg-slate-50/90 transition-colors group"
          >
            <!-- CELDA 1: DNI (STICKY) -->
            <td class="py-2.5 px-3.5 font-mono text-xs font-semibold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-xs">
              {{ p.dni }}
            </td>

            <!-- CELDA 2: NOMBRES Y APELLIDOS (STICKY) -->
            <td class="py-2.5 px-3.5 sticky left-28 bg-white group-hover:bg-slate-50 z-10 shadow-xs">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-bold text-slate-900 leading-tight">
                  {{ p.personalInfo?.firstName }} {{ p.personalInfo?.lastName }}
                </span>
                <span
                  v-if="p.cohortHistory?.length > 0"
                  @click.stop="handleTransferClick(p)"
                  class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 cursor-pointer transition-colors"
                  :title="`Participante transferido ${p.cohortHistory.length} vez/veces. Clic para ver historial de auditoría.`"
                >
                  <span>⇄</span>
                  <span>Trasladado</span>
                </span>
              </div>
              <div v-if="p.personalInfo?.phone" class="text-[10px] text-slate-400">
                📞 {{ p.personalInfo?.phone }}
              </div>
            </td>

            <!-- CELDA 3: NEGOCIO Y RUBRO -->
            <td class="py-2.5 px-3">
              <div class="font-semibold text-slate-800 truncate max-w-[220px]" :title="p.businessBasicInfo?.commercialName">
                {{ p.businessBasicInfo?.commercialName || 'Sin nombre registrado' }}
              </div>
              <div class="text-[10px] text-slate-400 truncate max-w-[220px]">
                {{ p.businessBasicInfo?.sector || 'Rubro general' }}
              </div>
            </td>

            <!-- CELDA 4: NATURALEZA DEL NEGOCIO -->
            <td class="py-2.5 px-3 text-center">
              <span
                class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border capitalize"
                :class="getNatureBadgeClass(p.businessBasicInfo?.businessNature)"
              >
                {{ p.businessBasicInfo?.businessNature || 'produccion' }}
              </span>
            </td>

            <!-- CELDAS S1 A S8: CÓDIGO DE COLOR SEMÁFORO -->
            <td
              v-for="session in visibleSessions"
              :key="session.id"
              class="py-2 px-1 text-center border-l border-slate-100"
            >
              <!-- CELDA VERDE (COMPLETADA Y APROBADA) -->
              <button
                v-if="facilitatorStore.getCellStatus(p.dni, session.id) === 'completado'"
                type="button"
                @click="handleCellClick(p, session.id)"
                class="w-full py-2 px-1 rounded-lg bg-emerald-100/80 border border-emerald-300 text-emerald-800 hover:bg-emerald-200 transition-all flex items-center justify-center gap-1 font-bold shadow-2xs"
                title="Sesión completada y aprobada. Clic para auditar."
              >
                <span class="text-xs">✓</span>
                <span v-if="facilitatorStore.focusedSession" class="text-[10px]">Aprobada</span>
              </button>

              <!-- CELDA AMARILLA (REQUIERE REVISIÓN) -->
              <button
                v-else-if="facilitatorStore.getCellStatus(p.dni, session.id) === 'pendiente_revision'"
                type="button"
                @click="handleCellClick(p, session.id)"
                class="w-full py-2 px-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200 ring-2 ring-amber-400/70 animate-pulse transition-all flex items-center justify-center gap-1 font-bold shadow-2xs cursor-pointer"
                title="¡Requiere revisión! Propuesta IA pendiente de visto bueno. Clic para abrir auditoría."
              >
                <span class="text-xs">⚠️</span>
                <span v-if="facilitatorStore.focusedSession" class="text-[10px] font-black">Por Revisar</span>
              </button>

              <!-- CELDA AZUL (EN CURSO) -->
              <button
                v-else-if="facilitatorStore.getCellStatus(p.dni, session.id) === 'en_progreso'"
                type="button"
                @click="handleCellClick(p, session.id)"
                class="w-full py-2 px-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-all flex items-center justify-center gap-1 font-semibold"
                title="Sesión en curso por el emprendedor."
              >
                <span class="text-xs">✏️</span>
                <span v-if="facilitatorStore.focusedSession" class="text-[10px]">En curso</span>
              </button>

              <!-- CELDA GRIS (BLOQUEADA) -->
              <div
                v-else
                class="w-full py-2 px-1 rounded-lg bg-slate-100/60 border border-slate-200 text-slate-400 flex items-center justify-center cursor-not-allowed text-[11px]"
                title="Sesión bloqueada por gatekeeping pedagógico."
              >
                <span>🔒</span>
                <span v-if="facilitatorStore.focusedSession" class="text-[10px] ml-1">Bloqueada</span>
              </div>
            </td>

            <!-- CELDA 6: AVANCE PORCENTUAL TOTAL -->
            <td class="py-2.5 px-3 text-center border-l border-slate-100">
              <div class="flex items-center justify-center gap-1.5">
                <span class="font-bold text-xs font-mono text-slate-700">
                  {{ facilitatorStore.getCompletedSessionsCount(p.dni) }}/8
                </span>
                <div class="w-10 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    class="bg-emerald-500 h-1.5 rounded-full transition-all"
                    :style="{ width: `${(facilitatorStore.getCompletedSessionsCount(p.dni) / 8) * 100}%` }"
                  ></div>
                </div>
              </div>
            </td>

            <!-- CELDA 7: ACCIONES (DESCARGAR PLAN DOCX Y MOVER COHORTE) -->
            <td class="py-2 px-2 text-center border-l border-slate-100 sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-xs">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  :disabled="exportingDnis[p.dni]"
                  @click.stop="handleExportClick(p)"
                  class="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  :class="[
                    exportingDnis[p.dni]
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-wait'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 border-blue-200'
                  ]"
                  title="Descargar Plan de Negocios en formato Microsoft Word (.docx)"
                >
                  <span v-if="exportingDnis[p.dni]" class="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                  <span v-else>📥</span>
                  <span class="hidden sm:inline">Plan</span>
                </button>

                <button
                  type="button"
                  @click.stop="handleTransferClick(p)"
                  class="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-300 transition-all shadow-2xs cursor-pointer"
                  title="Transferir participante a otra cohorte con trazabilidad"
                >
                  <span>🔄</span>
                  <span class="hidden sm:inline">Mover</span>
                </button>

                <button
                  type="button"
                  @click.stop="handleDeleteClick(p)"
                  class="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border-rose-200 transition-all shadow-2xs cursor-pointer"
                  title="Eliminar participante de esta cohorte"
                >
                  <span>🗑️</span>
                  <span class="hidden sm:inline">Eliminar</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- LEYENDA DEL SEMÁFORO EN EL PIE DE LA TABLA -->
    <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
      <div class="flex items-center gap-4 flex-wrap">
        <span class="font-bold text-slate-700">Leyenda Semáforo:</span>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span>🟩 Verde: Completada y aprobada</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
          <span>🟨 Amarillo: Requiere revisión</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>🟦 Azul: En curso</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-slate-300"></span>
          <span>⬜ Gris: Bloqueada</span>
        </div>
      </div>

      <div class="text-[11px] text-slate-400 font-medium">
        Mostrando {{ facilitatorStore.filteredParticipants.length }} de {{ facilitatorStore.participants.length }} participantes
      </div>
    </div>
  </div>
</template>
