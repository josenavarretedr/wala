<template>
  <div class="fixed bottom-28 right-4 z-50 flex flex-col gap-3">
    <!-- Botón de reportar problemas -->
    <CallReport v-if="showReport" />

    <!-- Botón de acciones rápidas -->
    <QuickActionBtn v-if="showQuickAction" />
  </div>
</template>

<script setup>
import CallReport from "./CallReport.vue";
import QuickActionBtn from "./QuickActionBtn.vue";

// Props para controlar qué botones mostrar
defineProps({
  showReport: {
    type: Boolean,
    default: true,
  },
  showQuickAction: {
    type: Boolean,
    default: true,
  },
});
</script>
