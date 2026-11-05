<script setup>
import { ref, computed, watch } from 'vue';
import { useFacilitatorStore } from '@/stores/facilitator';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  participant: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'transferred']);

const facilitatorStore = useFacilitatorStore();

const activeTab = ref('transfer'); // 'transfer' | 'history'
const selectedTargetCohort = ref('');
const selectedReason = ref('Reubicación territorial o cambio de domicilio');
const notes = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

const REASONS = [
  'Reubicación territorial o cambio de domicilio',
  'Cambio de horario o modalidad presencial',
  'Reasignación por cooperante / financista',
  'Alineación de cupo y techo presupuestario',
  'Corrección por registro en cohorte equivocada',
  'Otro motivo técnico justificado'
];

const fromCohortId = computed(() => {
  return props.participant?.cohortId || facilitatorStore.activeCohortId;
});

const availableTargetCohorts = computed(() => {
  return facilitatorStore.availableCohorts.filter((c) => c !== fromCohortId.value);
});

const currentCeiling = computed(() => {
  return facilitatorStore.cohortsConfig[fromCohortId.value]?.seedCapitalCeiling ?? 3000.0;
});

const targetCeiling = computed(() => {
  if (!selectedTargetCohort.value) return 3000.0;
  return facilitatorStore.cohortsConfig[selectedTargetCohort.value]?.seedCapitalCeiling ?? 3000.0;
});

const ceilingDifference = computed(() => {
  return targetCeiling.value - currentCeiling.value;
});

const cohortHistory = computed(() => {
  if (!props.participant?.cohortHistory) return [];
  return [...props.participant.cohortHistory].reverse(); // Más recientes primero
});

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      errorMessage.value = '';
      notes.value = '';
      selectedReason.value = REASONS[0];
      activeTab.value = 'transfer';
      // Seleccionar la primera cohorte destino disponible por defecto
      if (availableTargetCohorts.value.length > 0) {
        selectedTargetCohort.value = availableTargetCohorts.value[0];
      } else {
        selectedTargetCohort.value = '';
      }
    }
  }
);

function handleClose() {
  errorMessage.value = '';
  emit('close');
}

async function handleSubmitTransfer() {
  errorMessage.value = '';

  if (!selectedTargetCohort.value) {
    errorMessage.value = 'Debes seleccionar una cohorte de destino.';
    return;
  }

  if (selectedTargetCohort.value === fromCohortId.value) {
    errorMessage.value = 'La cohorte destino no puede ser la misma cohorte de origen.';
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await facilitatorStore.transferParticipant({
      dni: props.participant.dni,
      toCohortId: selectedTargetCohort.value,
      reason: selectedReason.value,
      notes: notes.value
    });

    emit('transferred', {
      participant: props.participant,
      transferRecord: result,
      targetCohortId: selectedTargetCohort.value
    });

    handleClose();
  } catch (err) {
    console.error('[TransferCohortModal] Error en transferencia:', err);
    errorMessage.value = err.message || 'Error al ejecutar la transferencia.';
  } finally {
    isSubmitting.value = false;
  }
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoStr;
  }
}
</script>

<template>
  <div
    v-if="isOpen && participant"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
    @click.self="handleClose"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
      role="dialog"
      aria-modal="true"
    >
      <!-- CABECERA DEL MODAL -->
      <header class="px-6 py-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xl">🔄</span>
            <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 border border-blue-400/30">
              Gestión de Cohorte
            </span>
          </div>
          <h2 class="text-lg font-black tracking-tight">
            Transferir Participante de Cohorte
          </h2>
          <p class="text-xs text-blue-200/80 mt-0.5">
            {{ participant.personalInfo?.firstName }} {{ participant.personalInfo?.lastName }} &bull; DNI: {{ participant.dni }}
          </p>
        </div>

        <button
          type="button"
          @click="handleClose"
          class="text-blue-200 hover:text-white hover:bg-white/10 rounded-xl p-1.5 transition-colors text-base cursor-pointer"
          title="Cerrar modal"
        >
          ✕
        </button>
      </header>

      <!-- PESTAÑAS (TRANSFERIR vs HISTORIAL DE MOVIMIENTOS) -->
      <div class="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
        <button
          type="button"
          @click="activeTab = 'transfer'"
          class="px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5"
          :class="[
            activeTab === 'transfer'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          ]"
        >
          <span>⇄</span>
          <span>Realizar Traslado</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'history'"
          class="px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5"
          :class="[
            activeTab === 'history'
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          ]"
        >
          <span>📜</span>
          <span>Historial de Trazabilidad</span>
          <span
            v-if="cohortHistory.length > 0"
            class="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800"
          >
            {{ cohortHistory.length }}
          </span>
        </button>
      </div>

      <!-- CONTENIDO DEL MODAL -->
      <div class="p-6 overflow-y-auto space-y-5 flex-1">
        <!-- ERROR BANNER -->
        <div
          v-if="errorMessage"
          class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2"
        >
          <span class="text-sm">⚠️</span>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- PESTAÑA 1: FORMULARIO DE TRANSFERENCIA -->
        <form v-if="activeTab === 'transfer'" @submit.prevent="handleSubmitTransfer" class="space-y-4">
          <!-- FICHA RESUMEN DEL PARTICIPANTE -->
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 font-semibold">Emprendimiento:</span>
              <span class="font-bold text-slate-900 truncate max-w-[240px]">
                {{ participant.businessBasicInfo?.commercialName || 'Sin registrar' }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 font-semibold">Módulos Aprobados:</span>
              <span class="font-bold text-emerald-700">
                {{ facilitatorStore.getCompletedSessionsCount(participant.dni) }} de 8 módulos
              </span>
            </div>
          </div>

          <!-- COMPARATIVA DE COHORTES (ORIGEN ➔ DESTINO) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- COHORTE ORIGEN (FIJA) -->
            <div class="p-3 bg-slate-100 border border-slate-200 rounded-xl space-y-1">
              <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cohorte Actual</span>
              <p class="text-xs font-black text-slate-800 truncate">{{ fromCohortId }}</p>
              <div class="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 pt-1">
                <span>Techo:</span>
                <span class="font-bold">S/ {{ Number(currentCeiling).toFixed(2) }}</span>
              </div>
            </div>

            <!-- COHORTE DESTINO (SELECTOR) -->
            <div class="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
              <label class="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
                Cohorte Destino *
              </label>
              <select
                v-model="selectedTargetCohort"
                class="w-full text-xs font-bold text-slate-900 bg-white border border-blue-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option v-for="c in availableTargetCohorts" :key="c" :value="c">
                  {{ c }}
                </option>
              </select>
              <div class="flex items-center gap-1 text-[11px] font-semibold text-blue-900 pt-1">
                <span>Nuevo Techo:</span>
                <span class="font-bold">S/ {{ Number(targetCeiling).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- ALERTA DE IMPACTO EN CAPITAL SEMILLA SI EL TECHO CAMBIA -->
          <div
            v-if="ceilingDifference !== 0 && selectedTargetCohort"
            class="p-3 rounded-xl border text-xs leading-relaxed space-y-1"
            :class="[
              ceilingDifference > 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            ]"
          >
            <div class="font-bold flex items-center gap-1.5">
              <span>{{ ceilingDifference > 0 ? '📈 Aumento de Techo Presupuestal' : '⚠️ Reducción de Techo Presupuestal' }}</span>
            </div>
            <p class="text-[11px]">
              El techo de capital semilla pasará de
              <strong>S/ {{ currentCeiling.toFixed(2) }}</strong> a
              <strong>S/ {{ targetCeiling.toFixed(2) }}</strong>.
              El plan de inversión (Módulo 7) adaptará este nuevo límite para validar cumplimiento financiero.
            </p>
          </div>

          <!-- MOTIVO DE LA TRANSFERENCIA (OBLIGATORIO) -->
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-700 block">
              Motivo Técnico del Traslado *
            </label>
            <select
              v-model="selectedReason"
              class="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option v-for="r in REASONS" :key="r" :value="r">
                {{ r }}
              </option>
            </select>
          </div>

          <!-- OBSERVACIONES Y NOTAS DE AUDITORÍA -->
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Observaciones / Justificación de Auditoría</span>
              <span class="text-[10px] text-slate-400 font-normal">Opcional</span>
            </label>
            <textarea
              v-model="notes"
              rows="3"
              placeholder="Detalla cualquier antecedente relevante sobre el traslado del participante..."
              class="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 resize-none font-medium"
            ></textarea>
          </div>
        </form>

        <!-- PESTAÑA 2: HISTORIAL DE TRAZABILIDAD (LINEA DE TIEMPO) -->
        <div v-else class="space-y-3">
          <div v-if="cohortHistory.length === 0" class="py-12 text-center text-slate-400 space-y-2">
            <span class="text-3xl block">📋</span>
            <p class="text-xs font-semibold text-slate-600">Sin traslados previos registrados</p>
            <p class="text-[11px] text-slate-400 max-w-xs mx-auto">
              Este participante se ha mantenido en su cohorte de registro original ({{ fromCohortId }}).
            </p>
          </div>

          <div v-else class="space-y-3">
            <p class="text-xs text-slate-500 font-semibold mb-2">
              Se han registrado {{ cohortHistory.length }} movimiento(s) de cohorte:
            </p>

            <div class="relative border-l-2 border-blue-200 ml-3 space-y-4 py-1">
              <div
                v-for="(hist, idx) in cohortHistory"
                :key="hist.transferId || idx"
                class="relative pl-5 space-y-1 text-xs"
              >
                <!-- Punto en la línea de tiempo -->
                <div class="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs"></div>

                <div class="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>{{ formatDate(hist.transferredAt) }}</span>
                  <span class="text-slate-600 font-bold">Por: {{ hist.transferredBy?.displayName || hist.transferredBy?.email }}</span>
                </div>

                <div class="flex items-center gap-1.5 font-black text-slate-900 text-xs">
                  <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-[11px]">{{ hist.fromCohortId }}</span>
                  <span>➔</span>
                  <span class="px-2 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-900 text-[11px]">{{ hist.toCohortId }}</span>
                </div>

                <p class="text-slate-700 font-semibold text-[11px]">
                  <strong>Motivo:</strong> {{ hist.reason }}
                </p>

                <p v-if="hist.notes" class="text-slate-500 italic text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                  "{{ hist.notes }}"
                </p>

                <div class="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                  <span>Techo anterior: S/ {{ Number(hist.previousCeiling || 0).toFixed(2) }}</span>
                  <span>&bull;</span>
                  <span>Nuevo techo: S/ {{ Number(hist.newCeiling || 0).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PIE DEL MODAL (BOTONES DE ACCIÓN) -->
      <footer class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <button
          type="button"
          @click="handleClose"
          :disabled="isSubmitting"
          class="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          v-if="activeTab === 'transfer'"
          type="button"
          @click="handleSubmitTransfer"
          :disabled="isSubmitting || !selectedTargetCohort || availableTargetCohorts.length === 0"
          class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span v-else>🔄</span>
          <span>{{ isSubmitting ? 'Transfiriendo...' : 'Confirmar Traslado' }}</span>
        </button>

        <button
          v-else
          type="button"
          @click="activeTab = 'transfer'"
          class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
        >
          Ir a Trasladar Participante
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.15s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
