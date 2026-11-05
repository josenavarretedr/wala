<script setup>
import { computed } from 'vue';

const props = defineProps({
  blockKey: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  triggerQuestion: {
    type: String,
    required: true
  },
  tip: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '📝'
  },
  sourceSession: {
    type: String,
    default: null
  },
  modelValue: {
    type: String,
    default: ''
  },
  isAutoFilled: {
    type: Boolean,
    default: false
  },
  minChars: {
    type: Number,
    default: 15
  }
});

const emit = defineEmits(['update:modelValue', 'confirmAutoFill']);

const textLength = computed(() => (props.modelValue || '').trim().length);
const isComplete = computed(() => textLength.value >= props.minChars);

function handleInput(event) {
  emit('update:modelValue', event.target.value);
}

function handleConfirm() {
  emit('confirmAutoFill', props.blockKey);
}
</script>

<template>
  <div
    class="bg-white rounded-2xl border transition-all duration-200 p-4 space-y-3.5 shadow-sm"
    :class="[
      isComplete ? 'border-slate-200 hover:border-slate-300' : 'border-amber-200/80 bg-amber-50/10'
    ]"
  >
    <!-- Encabezado del Bloque -->
    <div class="flex items-start justify-between gap-2">
      <div class="space-y-0.5 flex-1">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-base" role="img" aria-hidden="true">{{ icon }}</span>
          <h4 class="text-xs font-bold text-slate-800 tracking-wide uppercase">
            {{ title }}
          </h4>
        </div>
        <!-- Pregunta Detonante en Lenguaje Sencillo -->
        <p class="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
          {{ triggerQuestion }}
        </p>
      </div>

      <!-- Badge de Estado -->
      <span
        class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors"
        :class="[
          isComplete
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        ]"
      >
        <span v-if="isComplete">Listo ✓</span>
        <span v-else>Pendiente</span>
      </span>
    </div>

    <!-- Banner de Precarga Inteligente -->
    <div
      v-if="isAutoFilled"
      class="bg-blue-50/90 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-2.5 text-xs text-blue-950 animate-fadeIn"
    >
      <div class="flex items-start gap-2 flex-1">
        <span class="text-sm">✨</span>
        <div class="space-y-0.5">
          <p class="font-bold text-[11px] text-blue-900">
            Dato precargado de la {{ sourceSession || 'sesión previa' }}
          </p>
          <p class="text-[11px] text-blue-800/90 leading-tight">
            Puedes conservarlo, editarlo o confirmar con el botón.
          </p>
        </div>
      </div>
      <button
        type="button"
        @click="handleConfirm"
        class="shrink-0 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all min-h-[36px]"
      >
        Confirmar ✓
      </button>
    </div>

    <!-- Consejo o Ejemplo Breve -->
    <p v-if="tip" class="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 leading-relaxed">
      💡 <span class="font-medium">{{ tip }}</span>
    </p>

    <!-- Textarea para Redacción Cómoda en Móvil -->
    <div class="space-y-1.5">
      <div class="relative">
        <textarea
          :value="modelValue"
          @input="handleInput"
          :placeholder="placeholder"
          rows="3"
          class="w-full rounded-xl border bg-white px-3.5 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all min-h-[100px] leading-relaxed resize-y"
          :class="[
            isComplete
              ? 'border-slate-300 focus:border-blue-600 focus:ring-blue-500/20'
              : 'border-amber-300 focus:border-amber-500 focus:ring-amber-500/20'
          ]"
        ></textarea>
      </div>

      <!-- Contador de Caracteres y Progreso -->
      <div class="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span v-if="!isComplete" class="text-amber-700 font-medium">
          Mínimo {{ minChars }} caracteres requeridos
        </span>
        <span v-else class="text-emerald-700 font-bold flex items-center gap-1">
          <span>✓</span> Longitud suficiente
        </span>

        <span
          class="font-mono font-bold"
          :class="[isComplete ? 'text-emerald-700' : 'text-slate-400']"
        >
          {{ textLength }} / {{ minChars }} mín.
        </span>
      </div>
    </div>
  </div>
</template>
