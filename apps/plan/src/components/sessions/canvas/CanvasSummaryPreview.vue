<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  canvasData: {
    type: Object,
    required: true
  },
  thematicGroups: {
    type: Array,
    required: true
  },
  blockDefinitions: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'selectBlock']);

const totalCompleted = computed(() => {
  let count = 0;
  for (const key of Object.keys(props.blockDefinitions)) {
    const text = props.canvasData[key]?.text || '';
    if (text.trim().length >= 15) count++;
  }
  return count;
});

function handleJumpToBlock(blockKey, groupId) {
  emit('selectBlock', { blockKey, groupId });
  emit('close');
}
</script>

<template>
  <!-- Modal Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn"
    @click.self="emit('close')"
  >
    <!-- Modal Container -->
    <div
      class="bg-white w-full max-w-lg max-h-[90vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-slideUp"
    >
      <!-- Header Superior -->
      <div class="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <div>
          <div class="flex items-center gap-1.5">
            <span class="text-base">📋</span>
            <h3 class="text-sm font-bold text-slate-900">
              Lienzo Canvas Consolidado
            </h3>
          </div>
          <p class="text-[11px] text-slate-500 mt-0.5">
            Previsualización para el Plan de Negocios formal
          </p>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors"
          aria-label="Cerrar modal"
        >
          ✕
        </button>
      </div>

      <!-- Barra de Estado Rápido -->
      <div class="px-5 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs shrink-0">
        <span class="font-semibold text-blue-950">
          Progreso del Lienzo:
        </span>
        <span
          class="font-bold px-2 py-0.5 rounded-full text-[11px]"
          :class="[
            totalCompleted === 9
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-900'
          ]"
        >
          {{ totalCompleted }} de 9 bloques listos
        </span>
      </div>

      <!-- Contenido Scrolleable con los 9 Bloques Agrupados -->
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div
          v-for="group in thematicGroups"
          :key="group.id"
          class="space-y-2.5"
        >
          <!-- Título del Grupo Temático -->
          <div class="flex items-center gap-2 border-b pb-1" :class="group.borderClass">
            <span class="text-base">{{ group.icon }}</span>
            <h4 class="text-xs font-black uppercase tracking-wider" :class="group.accentTextClass">
              {{ group.name }} &bull; <span class="font-medium lowercase text-slate-500">{{ group.subtitle }}</span>
            </h4>
          </div>

          <!-- Bloques del Grupo -->
          <div class="space-y-2.5">
            <div
              v-for="blockKey in group.blockKeys"
              :key="blockKey"
              class="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-1.5 hover:border-slate-300 transition-colors"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs">{{ blockDefinitions[blockKey]?.icon }}</span>
                  <span class="text-xs font-bold text-slate-800">
                    {{ blockDefinitions[blockKey]?.title }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="[
                      (canvasData[blockKey]?.text || '').trim().length >= 15
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    ]"
                  >
                    {{ (canvasData[blockKey]?.text || '').trim().length >= 15 ? 'Completo ✓' : 'Incompleto' }}
                  </span>

                  <button
                    type="button"
                    @click="handleJumpToBlock(blockKey, group.id)"
                    class="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
                  >
                    Editar
                  </button>
                </div>
              </div>

              <p
                class="text-xs leading-relaxed"
                :class="[
                  (canvasData[blockKey]?.text || '').trim()
                    ? 'text-slate-800'
                    : 'text-slate-400 italic'
                ]"
              >
                {{ (canvasData[blockKey]?.text || '').trim() || 'Sin información registrada aún...' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer de Modal -->
      <div class="p-4 border-t border-slate-200 bg-white shrink-0">
        <button
          type="button"
          @click="emit('close')"
          class="w-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs py-3 rounded-xl shadow-sm transition-all min-h-[44px]"
        >
          Volver a la Edición del Lienzo
        </button>
      </div>
    </div>
  </div>
</template>
