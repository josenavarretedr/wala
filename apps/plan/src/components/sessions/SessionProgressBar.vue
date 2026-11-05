<script setup>
defineProps({
  currentStep: {
    type: Number,
    default: 1 // 1: Aprender, 2: Quiz, 3: Formulario
  },
  microlearningCompleted: {
    type: Boolean,
    default: false
  },
  quizPassed: {
    type: Boolean,
    default: false
  },
  formCompleted: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select-step']);

const steps = [
  { id: 1, label: 'Aprender', icon: '📖' },
  { id: 2, label: 'Quiz V/F', icon: '❓' },
  { id: 3, label: 'Formulario', icon: '✍️' }
];

function isStepAccessible(stepId, props) {
  if (stepId === 1) return true;
  if (stepId === 2) return props.microlearningCompleted;
  if (stepId === 3) return props.quizPassed;
  return false;
}
</script>

<template>
  <nav aria-label="Progreso del Módulo" class="bg-white rounded-xl p-2 border border-slate-200 shadow-xs">
    <div class="grid grid-cols-3 gap-1">
      <button
        v-for="step in steps"
        :key="step.id"
        type="button"
        :disabled="!isStepAccessible(step.id, $props)"
        @click="$emit('select-step', step.id)"
        class="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition-all min-h-[44px]"
        :class="[
          currentStep === step.id
            ? 'bg-blue-600 text-white shadow-sm'
            : isStepAccessible(step.id, $props)
              ? 'text-slate-700 hover:bg-slate-100'
              : 'text-slate-300 opacity-60 cursor-not-allowed'
        ]"
      >
        <span class="text-sm select-none">{{ step.icon }}</span>
        <span class="truncate mt-0.5 tracking-tight">{{ step.id }}. {{ step.label }}</span>
      </button>
    </div>
  </nav>
</template>
