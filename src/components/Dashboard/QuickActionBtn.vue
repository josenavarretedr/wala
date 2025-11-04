<template>
  <button
    v-if="hasTourForCurrentRoute"
    @click="handleClick"
    data-tour="quick-action"
    class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95 group"
    :class="{ 'animate-pulse-custom': !isActive }"
    :aria-label="isActive ? 'Tour en progreso' : 'Iniciar tour de ayuda'"
    :title="isActive ? 'Tour en progreso...' : 'Ver tour de esta página'"
  >
    <!-- Ícono de Flash/ayuda -->
    <Flash
      v-if="!isActive"
      class="h-4 w-4 transition-transform group-hover:scale-110"
    />

    <!-- Ícono de progreso cuando está activo -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  </button>
</template>

<script setup>
import { Flash } from "@iconoir/vue";
import { useOnboarding } from "@/composables/useOnboarding";

// Usar el composable de onboarding
const { startTour, isActive, hasTourForCurrentRoute } = useOnboarding();

/**
 * Maneja el clic en el botón
 * Inicia el tour de la vista actual (forzando reinicio)
 */
const handleClick = () => {
  if (!isActive.value) {
    startTour(true); // Forzar reinicio del tour
  }
};
</script>

<style scoped>
/* Animación de pulsación personalizada */
@keyframes pulse-custom {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
  }
}

.animate-pulse-custom {
  animation: pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

button:active {
  animation: none;
}

/* Animación del badge */
@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
