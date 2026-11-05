<script setup>
import { ref, computed } from 'vue';
import AppButton from '@/components/common/AppButton.vue';

const props = defineProps({
  microlearning: {
    type: Array,
    required: true,
    default: () => []
  },
  alreadyCompleted: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['complete']);

const activeIndex = ref(0);

const currentSlide = computed(() => {
  return props.microlearning[activeIndex.value] || props.microlearning[0] || {};
});

const isLastSlide = computed(() => {
  return activeIndex.value >= props.microlearning.length - 1;
});

function nextSlide() {
  if (!isLastSlide.value) {
    activeIndex.value++;
  } else {
    emit('complete');
  }
}

function prevSlide() {
  if (activeIndex.value > 0) {
    activeIndex.value--;
  }
}

function selectSlide(idx) {
  activeIndex.value = idx;
}
</script>

<template>
  <div class="space-y-4">
    <!-- Paginador de pestañas/indicadores táctiles -->
    <div class="flex items-center justify-between px-1">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Concepto {{ activeIndex + 1 }} de {{ microlearning.length }}
      </span>
      <div class="flex gap-1.5">
        <button
          v-for="(_, idx) in microlearning"
          :key="idx"
          type="button"
          @click="selectSlide(idx)"
          class="h-2 rounded-full transition-all duration-200 min-w-[20px]"
          :class="[
            activeIndex === idx
              ? 'w-6 bg-blue-600'
              : 'w-2 bg-slate-200 hover:bg-slate-300'
          ]"
          :aria-label="`Ir al concepto ${idx + 1}`"
        />
      </div>
    </div>

    <!-- Tarjeta Principal de Microaprendizaje -->
    <article class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden transition-all">
      <!-- Badge temático -->
      <div class="mb-3">
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
          {{ currentSlide.badge || 'Microaprendizaje' }}
        </span>
      </div>

      <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mb-3">
        {{ currentSlide.title }}
      </h3>

      <p class="text-slate-700 text-base leading-relaxed mb-4">
        {{ currentSlide.content }}
      </p>

      <!-- Tip pedagógico / Consejo práctico -->
      <div v-if="currentSlide.tip" class="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5">
        <span class="text-amber-600 text-lg select-none leading-none mt-0.5">💡</span>
        <div class="text-xs text-amber-900 leading-normal">
          <strong class="font-bold block mb-0.5">Consejo del Facilitador:</strong>
          {{ currentSlide.tip }}
        </div>
      </div>
    </article>

    <!-- Botonera de Acción Inferior -->
    <div class="flex gap-2 pt-2">
      <button
        v-if="activeIndex > 0"
        type="button"
        @click="prevSlide"
        class="px-4 py-3.5 min-h-[48px] rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-base hover:bg-slate-50 transition-colors"
      >
        ← Anterior
      </button>

      <AppButton
        variant="primary"
        @click="nextSlide"
        class="flex-1"
      >
        {{ isLastSlide ? (alreadyCompleted ? 'Repasar Quiz →' : 'Completar y Pasar al Quiz →') : 'Siguiente Concepto →' }}
      </AppButton>
    </div>
  </div>
</template>
