<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  participantName: {
    type: String,
    default: 'Participante'
  },
  dni: {
    type: String,
    default: ''
  },
  commercialName: {
    type: String,
    default: ''
  },
  unapprovedCount: {
    type: Number,
    default: 0
  },
  unapprovedSections: {
    type: Array,
    default: () => []
  },
  isExporting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'confirm']);
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
  >
    <div
      class="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-scaleUp space-y-4 font-sans text-slate-800"
    >
      <!-- Cabecera de Alerta -->
      <div class="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xl shrink-0">
          ⚠️
        </div>
        <div>
          <h3 class="text-base font-black text-slate-900 leading-tight">
            Plan con Secciones Pendientes
          </h3>
          <p class="text-xs text-slate-500 font-medium">
            {{ participantName }} &bull; DNI: <span class="font-mono font-bold">{{ dni }}</span>
          </p>
        </div>
      </div>

      <!-- Cuerpo del Mensaje -->
      <div class="space-y-3">
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 leading-relaxed">
          <p class="font-bold mb-1">
            Este plan tiene {{ unapprovedCount }} {{ unapprovedCount === 1 ? 'sección' : 'secciones' }} sin aprobar formalmente.
          </p>
          <p class="text-amber-800">
            ¿Deseas exportar el documento Word (.docx) incorporando los borradores y propuestas de IA disponibles?
          </p>
        </div>

        <!-- Lista de Módulos sin Visto Bueno -->
        <div v-if="unapprovedSections.length > 0" class="max-h-36 overflow-y-auto space-y-1.5 pr-1">
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Módulos pendientes de visto bueno:
          </span>
          <div
            v-for="sec in unapprovedSections"
            :key="sec.sessionId"
            class="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
          >
            <span class="font-medium text-slate-700">{{ sec.title }}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 capitalize">
              {{ sec.state === 'pendiente_revision' ? 'Por revisar' : (sec.state === 'en_progreso' ? 'En curso' : 'Borrador') }}
            </span>
          </div>
        </div>

        <p class="text-[11px] text-slate-500 italic">
          Nota: El documento se generará aplicando la regla institucional de fallback (aprobado formal &rarr; propuesta IA &rarr; borrador original).
        </p>
      </div>

      <!-- Botones de Acción -->
      <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
        <button
          type="button"
          :disabled="isExporting"
          @click="emit('close')"
          class="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="isExporting"
          @click="emit('confirm')"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition-all disabled:opacity-50"
        >
          <span v-if="isExporting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isExporting ? 'Compilando...' : 'Exportar de todos modos' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
