<template>
  <button
    @click="handleReportClick"
    data-tour="report-bug"
    class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-red-300 active:scale-95 group"
    :class="{ 'animate-pulse-custom': true }"
    aria-label="Reportar problema"
    title="Reportar un problema"
  >
    <!-- Ícono de WarningCircle -->
    <WarningCircle class="h-4 w-4 transition-transform group-hover:scale-110" />
  </button>
</template>

<script setup>
import { WarningCircle } from "@iconoir/vue";

const handleReportClick = () => {
  alert(
    "🐛 Sistema de reportes en desarrollo\n\nPronto podrás reportar problemas directamente desde aquí."
  );
};
</script>

<style scoped>
/* Animación de pulsación personalizada (igual que QuickActionBtn) */
@keyframes pulse-custom {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.animate-pulse-custom {
  animation: pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

button:active {
  animation: none;
}
</style>
