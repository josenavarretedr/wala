<template>
  <div class="ciclos-timeline">
    <div v-for="step in steps" :key="step.id" class="tl-step">
      <div class="tl-dot" :class="step.dotClass">{{ step.short }}</div>
      <div class="tl-label" v-html="step.label" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  steps: {
    type: Array,
    required: true,
  },
});
</script>
