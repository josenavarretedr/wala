<template>
  <div class="ciclos-section">
    <button
      type="button"
      class="section-toggle-btn"
      :aria-expanded="isExpanded"
      aria-controls="consulting-cycles-content"
      @click="isExpanded = !isExpanded"
    >
      {{ isExpanded ? "Ocultar contenido" : "Mostrar contenido" }}
    </button>

    <div
      v-show="isExpanded"
      id="consulting-cycles-content"
      class="ciclos-timeline"
    >
      <div v-for="step in steps" :key="step.id" class="tl-step">
        <div class="tl-dot" :class="step.dotClass">{{ step.short }}</div>
        <div class="tl-label" v-html="step.label" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  steps: {
    type: Array,
    required: true,
  },
});

const isExpanded = ref(false);
</script>
