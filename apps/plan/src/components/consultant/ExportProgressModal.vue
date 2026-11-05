<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  cohortId: {
    type: String,
    default: ''
  },
  current: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  percent: {
    type: Number,
    default: 0
  },
  currentName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'starting' // 'starting' | 'compiling' | 'compressing' | 'completed' | 'error'
  }
});

const emit = defineEmits(['close']);
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
  >
    <div
      class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-4 font-sans text-slate-800"
    >
      <!-- Cabecera -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl font-black flex items-center justify-center text-lg shrink-0"
            :class="status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'"
          >
            {{ status === 'completed' ? '✓' : '📦' }}
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 leading-tight">
              Exportando Cohorte (.zip)
            </h3>
            <p class="text-xs text-slate-500 font-medium">
              Cohorte: <span class="font-bold text-slate-800">{{ cohortId }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Barra de Progreso y Métricas -->
      <div class="space-y-3 py-2">
        <!-- Porcentaje y Conteo -->
        <div class="flex items-center justify-between text-xs font-bold">
          <span class="text-slate-600">
            {{ status === 'compressing' ? 'Comprimiendo archivo...' : (status === 'completed' ? '¡Compilación finalizada!' : `Procesando: ${current} de ${total} planes`) }}
          </span>
          <span class="text-blue-700 font-mono text-sm font-black">
            {{ percent }}%
          </span>
        </div>

        <!-- Barra Gráfica -->
        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="status === 'completed' ? 'bg-emerald-600' : 'bg-blue-600 animate-pulse'"
            :style="{ width: `${percent}%` }"
          ></div>
        </div>

        <!-- Detalle de la Tarea Actual -->
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
          <div
            v-if="status !== 'completed'"
            class="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"
          ></div>
          <p class="truncate font-medium">
            {{ currentName || 'Preparando documentos...' }}
          </p>
        </div>
      </div>

      <!-- Pie y Botón de Cierre -->
      <div class="flex items-center justify-end pt-2 border-t border-slate-100">
        <button
          type="button"
          :disabled="status !== 'completed' && status !== 'error'"
          @click="emit('close')"
          class="px-5 py-2.5 rounded-xl text-xs font-black transition-all"
          :class="[
            status === 'completed' || status === 'error'
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          ]"
        >
          {{ status === 'completed' ? 'Listo, cerrar ventana' : (status === 'error' ? 'Cerrar' : 'Procesando en segundo plano...') }}
        </button>
      </div>
    </div>
  </div>
</template>
