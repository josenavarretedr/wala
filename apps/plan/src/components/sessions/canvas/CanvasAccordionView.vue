<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSessionStore } from '@/stores/sessions';
import {
  usePlanStore,
  CANVAS_BLOCK_DEFINITIONS,
  CANVAS_THEMATIC_GROUPS
} from '@/stores/plan';
import CanvasBlockCard from './CanvasBlockCard.vue';
import CanvasSummaryPreview from './CanvasSummaryPreview.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const sessionStore = useSessionStore();
const planStore = usePlanStore();

const participantId = computed(() => authStore.currentParticipant?.dni);
const progress = computed(() => sessionStore.getSessionProgressData(5));
const isSessionCompleted = computed(() => progress.value?.formSubmission?.isCompleted);

// Estado de acordeón abierto/cerrado para cada una de las 4 secciones
const activeGroups = ref({
  oferta: true,
  mercado: false,
  operaciones: false,
  finanzas: false
});

const showSummaryModal = ref(false);
const isSubmitting = ref(false);
const validationError = ref('');
const showSavedToast = ref(false);

onMounted(async () => {
  if (participantId.value) {
    await planStore.loadCanvas(participantId.value);
    autoExpandFirstIncompleteGroup();
  }
});

function autoExpandFirstIncompleteGroup() {
  const stats = planStore.groupStats;
  for (const group of CANVAS_THEMATIC_GROUPS) {
    if (!stats[group.id]?.isGroupComplete) {
      activeGroups.value = {
        oferta: group.id === 'oferta',
        mercado: group.id === 'mercado',
        operaciones: group.id === 'operaciones',
        finanzas: group.id === 'finanzas'
      };
      return;
    }
  }
}

function toggleGroup(groupId) {
  activeGroups.value[groupId] = !activeGroups.value[groupId];
}

async function handleBlockUpdate(blockKey, text) {
  if (!participantId.value) return;
  await planStore.updateBlock(participantId.value, blockKey, text);
  validationError.value = '';
}

async function handleConfirmAutoFill(blockKey) {
  if (!participantId.value) return;
  await planStore.confirmAutoFill(participantId.value, blockKey);
}

function handleSelectBlockFromSummary({ blockKey, groupId }) {
  // Expandir el grupo seleccionado y hacer scroll hacia el bloque si es necesario
  for (const key of Object.keys(activeGroups.value)) {
    activeGroups.value[key] = key === groupId;
  }
}

async function handleSubmitSession() {
  if (!participantId.value) return;

  validationError.value = '';

  if (!planStore.allBlocksComplete) {
    const missing = 9 - planStore.completedBlocksCount;
    validationError.value = `Aún faltan ${missing} bloque(s) por completar. Cada uno requiere al menos 15 caracteres para asegurar un modelo viable.`;
    autoExpandFirstIncompleteGroup();
    return;
  }

  isSubmitting.value = true;
  try {
    const result = await planStore.submitCanvas(participantId.value);
    if (result.success) {
      showSavedToast.value = true;
      setTimeout(() => {
        showSavedToast.value = false;
      }, 4000);
    } else {
      validationError.value = result.message || 'Error al completar la sesión.';
    }
  } catch (err) {
    console.error('Error enviando Canvas:', err);
    validationError.value = 'Ocurrió un error al guardar. Verifica tu conexión o intenta nuevamente.';
  } finally {
    isSubmitting.value = false;
  }
}

function goToSession6() {
  router.push('/sesiones/6');
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header Informativo de Sesión 5 -->
    <div class="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
          Metodología Business Model Canvas
        </span>
        <button
          type="button"
          @click="showSummaryModal = true"
          class="inline-flex items-center gap-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 active:scale-95 text-white px-3 py-1.5 rounded-xl transition-all border border-white/20 min-h-[36px]"
        >
          <span>📋</span>
          <span>Ver Resumen</span>
        </button>
      </div>

      <div>
        <h2 class="text-base font-black">
          Lienzo de Modelo de Negocio Móvil
        </h2>
        <p class="text-xs text-indigo-100/90 mt-1 leading-relaxed">
          Estructura los 9 bloques esenciales organizados en 4 áreas temáticas. Tus datos previos ya están precargados.
        </p>
      </div>

      <!-- Barra de Progreso del Canvas -->
      <div class="pt-1 space-y-1.5">
        <div class="flex items-center justify-between text-xs font-semibold">
          <span class="text-indigo-200 text-[11px]">Avance de Bloques</span>
          <span class="text-white font-bold font-mono text-[11px]">
            {{ planStore.completedBlocksCount }} / {{ planStore.totalBlocksCount }} ({{ planStore.progressPercentage }}%)
          </span>
        </div>
        <div class="w-full bg-black/30 rounded-full h-2 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="[planStore.allBlocksComplete ? 'bg-emerald-400' : 'bg-gradient-to-r from-blue-400 to-indigo-300']"
            :style="{ width: `${planStore.progressPercentage}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Toast de retroalimentación de guardado exitoso -->
    <div
      v-if="showSavedToast"
      class="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm animate-fadeIn"
    >
      <div class="flex items-center gap-2">
        <span class="text-lg">🎉</span>
        <div>
          <p class="text-xs font-bold">¡Lienzo Canvas completado exitosamente!</p>
          <p class="text-[11px] text-emerald-800">La Sesión 6 (Costeo Directo) ha sido desbloqueada.</p>
        </div>
      </div>
      <button
        type="button"
        @click="showSavedToast = false"
        class="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
      >
        ✕
      </button>
    </div>

    <!-- Mensaje de Validación si faltan bloques -->
    <div
      v-if="validationError"
      class="bg-rose-50 border border-rose-300 text-rose-950 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs animate-shake"
    >
      <span class="text-base leading-none">⚠️</span>
      <div class="space-y-0.5 flex-1">
        <p class="font-bold text-rose-900">Bloques incompletos</p>
        <p class="leading-relaxed text-rose-800">{{ validationError }}</p>
      </div>
    </div>

    <!-- Acordeón de las 4 Secciones Temáticas -->
    <div class="space-y-3">
      <div
        v-for="group in CANVAS_THEMATIC_GROUPS"
        :key="group.id"
        class="bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs"
        :class="[
          group.borderClass,
          activeGroups[group.id] ? 'ring-1 ring-slate-200' : 'opacity-95'
        ]"
      >
        <!-- Encabezado de la Sección Plegable (Target táctil mínimo 48px) -->
        <button
          type="button"
          @click="toggleGroup(group.id)"
          class="w-full px-4 py-3.5 flex items-center justify-between transition-colors min-h-[48px] text-left"
          :class="group.headerBgClass"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-lg leading-none">{{ group.icon }}</span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black uppercase tracking-wider text-slate-900">
                  [{{ group.name }}]
                </span>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors"
                  :class="[
                    planStore.groupStats[group.id]?.isGroupComplete
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : group.badgeClass
                  ]"
                >
                  {{ planStore.groupStats[group.id]?.completed }} / {{ planStore.groupStats[group.id]?.total }} listos
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                {{ group.subtitle }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span
              v-if="planStore.groupStats[group.id]?.isGroupComplete"
              class="text-emerald-600 text-sm font-bold"
            >
              ✓
            </span>
            <span
              class="text-slate-400 font-bold transition-transform duration-200 text-sm"
              :class="{ 'rotate-180': activeGroups[group.id] }"
            >
              ▼
            </span>
          </div>
        </button>

        <!-- Cuerpo del Acordeón con sus CanvasBlockCards -->
        <div
          v-show="activeGroups[group.id]"
          class="p-3.5 space-y-3 bg-slate-50/50 border-t border-slate-100 animate-fadeIn"
        >
          <CanvasBlockCard
            v-for="blockKey in group.blockKeys"
            :key="blockKey"
            :block-key="blockKey"
            :title="CANVAS_BLOCK_DEFINITIONS[blockKey].title"
            :trigger-question="CANVAS_BLOCK_DEFINITIONS[blockKey].triggerQuestion"
            :tip="CANVAS_BLOCK_DEFINITIONS[blockKey].tip"
            :placeholder="CANVAS_BLOCK_DEFINITIONS[blockKey].placeholder"
            :icon="CANVAS_BLOCK_DEFINITIONS[blockKey].icon"
            :source-session="CANVAS_BLOCK_DEFINITIONS[blockKey].sourceSession"
            :model-value="planStore.canvas[blockKey]?.text || ''"
            :is-auto-filled="!!planStore.canvas[blockKey]?.isAutoFilled"
            @update:model-value="(val) => handleBlockUpdate(blockKey, val)"
            @confirm-auto-fill="() => handleConfirmAutoFill(blockKey)"
          />
        </div>
      </div>
    </div>

    <!-- Botones de Acción Inferiores -->
    <div class="pt-2 space-y-2">
      <AppButton
        type="button"
        variant="primary"
        :loading="isSubmitting"
        @click="handleSubmitSession"
      >
        <span v-if="isSessionCompleted">Actualizar Lienzo Canvas</span>
        <span v-else-if="planStore.allBlocksComplete">Guardar y Completar Sesión 5</span>
        <span v-else>
          Faltan {{ 9 - planStore.completedBlocksCount }} bloques &bull; Guardar Avance
        </span>
      </AppButton>

      <AppButton
        v-if="isSessionCompleted"
        type="button"
        variant="outline"
        @click="goToSession6"
      >
        Continuar a la Sesión 6 (Costeo Unitario) →
      </AppButton>

      <button
        type="button"
        @click="showSummaryModal = true"
        class="w-full text-center text-xs font-bold text-slate-600 hover:text-blue-700 py-2.5 transition-colors min-h-[44px]"
      >
        Ver Vista Previa Consolidada del Canvas 📋
      </button>
    </div>

    <!-- Modal Resumen Consolidado -->
    <CanvasSummaryPreview
      :is-open="showSummaryModal"
      :canvas-data="planStore.canvas"
      :thematic-groups="CANVAS_THEMATIC_GROUPS"
      :block-definitions="CANVAS_BLOCK_DEFINITIONS"
      @close="showSummaryModal = false"
      @select-block="handleSelectBlockFromSummary"
    />
  </div>
</template>
