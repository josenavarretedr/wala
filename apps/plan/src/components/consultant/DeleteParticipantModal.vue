<script setup>
import { ref, computed } from 'vue';
import { useFacilitatorStore } from '@/stores/facilitator';
import { deleteParticipantFirestore } from '@/services/db/firestore';
import { deleteParticipantLocal } from '@/services/db/indexedDB';

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

const emit = defineEmits(['close', 'deleted']);

const facilitatorStore = useFacilitatorStore();

const isDeleting = ref(false);
const errorMessage = ref('');

const participantName = computed(() => {
  if (!props.participant?.personalInfo) return props.participant?.dni || '';
  const { firstName = '', lastName = '' } = props.participant.personalInfo;
  return `${firstName} ${lastName}`.trim() || props.participant?.dni || '';
});

const completedCount = computed(() => {
  if (!props.participant?.dni) return 0;
  if (typeof facilitatorStore.getCompletedSessionsCount === 'function') {
    return facilitatorStore.getCompletedSessionsCount(props.participant.dni);
  }
  return 0;
});

function handleClose() {
  if (isDeleting.value) return;
  errorMessage.value = '';
  emit('close');
}

async function handleConfirmDelete() {
  if (!props.participant?.dni) return;

  isDeleting.value = true;
  errorMessage.value = '';

  const dni = String(props.participant.dni).trim();
  const currentCohort = facilitatorStore.activeCohortId || props.participant?.cohortId || '';

  try {
    let result = null;

    if (typeof facilitatorStore.removeParticipantFromCohort === 'function') {
      result = await facilitatorStore.removeParticipantFromCohort(dni);
    } else if (typeof facilitatorStore.deleteParticipant === 'function') {
      result = await facilitatorStore.deleteParticipant(dni);
    } else {
      // Fallback de contingencia si la instancia en memoria del navegador no ha recargado el store
      const fUser = facilitatorStore.facilitatorUser || {
        email: 'facilitador@planseed.org',
        displayName: 'Facilitador',
        uid: 'facilitator-uid'
      };

      try {
        await deleteParticipantFirestore({
          dni,
          cohortId: currentCohort,
          participantName: participantName.value,
          commercialName: props.participant?.businessBasicInfo?.commercialName || '',
          facilitatorUser: fUser
        });
      } catch (fErr) {
        console.warn('[DeleteParticipantModal] Error en Firestore fallback:', fErr);
      }

      try {
        await deleteParticipantLocal(dni);
      } catch (lErr) {
        console.warn('[DeleteParticipantModal] Error en IndexedDB fallback:', lErr);
      }

      // Limpieza en reactividad de Pinia
      if (Array.isArray(facilitatorStore.participants)) {
        facilitatorStore.participants = facilitatorStore.participants.filter(
          (p) => String(p.dni) !== dni
        );
      }
      if (facilitatorStore.progressMap) {
        for (let s = 1; s <= 8; s++) {
          delete facilitatorStore.progressMap[`${dni}_S${s}`];
        }
      }
      if (typeof facilitatorStore.closeReviewDrawer === 'function') {
        if (facilitatorStore.selectedParticipant?.dni === dni) {
          facilitatorStore.closeReviewDrawer();
        }
      }

      result = {
        success: true,
        dni,
        name: participantName.value,
        cohortId: currentCohort
      };
    }

    emit('deleted', {
      dni,
      name: participantName.value,
      cohortId: currentCohort,
      ...result
    });
    handleClose();
  } catch (err) {
    console.error('[DeleteParticipantModal] Error eliminando participante:', err);
    errorMessage.value = err.message || 'Ocurrió un error inesperado al eliminar el participante.';
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    @click.self="handleClose"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 transform transition-all animate-scale-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <!-- ENCABEZADO DE PELIGRO -->
      <div class="px-6 py-5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 text-xl shadow-xs">
            🗑️
          </div>
          <div>
            <h3 id="delete-modal-title" class="text-base font-black text-rose-950">
              Eliminar Participante de la Cohorte
            </h3>
            <p class="text-xs font-semibold text-rose-700">
              Cohorte activa: <span class="font-mono uppercase">{{ facilitatorStore.activeCohortId }}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          :disabled="isDeleting"
          @click="handleClose"
          class="text-rose-400 hover:text-rose-700 p-1.5 rounded-xl hover:bg-rose-100/70 transition-colors disabled:opacity-50 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- CONTENIDO PRINCIPAL -->
      <div class="p-6 space-y-4">
        <!-- FICHA RESUMEN DEL PARTICIPANTE -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Emprendedor(a)</span>
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
              DNI: {{ participant?.dni }}
            </span>
          </div>

          <div class="font-extrabold text-slate-900 text-sm">
            {{ participantName }}
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
            <div>
              <span class="text-slate-400 font-semibold block text-[10px]">Emprendimiento:</span>
              <span class="font-bold text-slate-800 truncate block">
                {{ participant?.businessBasicInfo?.commercialName || 'Sin nombre registrado' }}
              </span>
            </div>
            <div>
              <span class="text-slate-400 font-semibold block text-[10px]">Avance Pedagógico:</span>
              <span class="font-bold text-slate-800 flex items-center gap-1">
                <span :class="completedCount === 8 ? 'text-emerald-700' : 'text-blue-700'">
                  {{ completedCount }} de 8 módulos
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- ALERTA DE ADVERTENCIA CRÍTICA -->
        <div class="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
          <span class="text-lg leading-none">⚠️</span>
          <div class="text-xs text-amber-950 space-y-1">
            <p class="font-black">¿Estás seguro de que deseas retirar este registro?</p>
            <p class="text-amber-800 font-medium leading-relaxed">
              Esta acción eliminará al participante de la cohorte actual junto con sus registros de sesiones, costeo y borradores de plan de negocios.
            </p>
          </div>
        </div>

        <!-- MENSAJE DE ERROR SI OCURRE FALLA -->
        <div
          v-if="errorMessage"
          class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2"
        >
          <span>❌</span>
          <span>{{ errorMessage }}</span>
        </div>
      </div>

      <!-- BOTONES DE ACCIÓN EN EL PIE DEL MODAL -->
      <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
        <button
          type="button"
          :disabled="isDeleting"
          @click="handleClose"
          class="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          Cancelar
        </button>

        <button
          type="button"
          :disabled="isDeleting"
          @click="handleConfirmDelete"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-extrabold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-wait cursor-pointer"
        >
          <span
            v-if="isDeleting"
            class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></span>
          <span v-else>🗑️</span>
          <span>{{ isDeleting ? 'Eliminando...' : 'Sí, eliminar participante' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
