<template>
  <div
    ref="containerRef"
    class="fixed bottom-28 right-4 z-50 flex flex-col items-center gap-3"
  >
    <!-- Botones expandibles (aparecen encima) -->
    <Transition name="slide-up">
      <div v-if="isExpanded" class="flex flex-col items-center gap-3">
        <!-- Botón de Sentry Feedback -->
        <button
          v-if="showReport"
          @click="showFeedbackModal = true"
          class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-red-300 active:scale-95 group"
          aria-label="Reportar problema"
          title="Reportar un problema o dejar tu comentario"
        >
          <Megaphone
            class="h-4 w-4 transition-transform group-hover:scale-110"
          />
        </button>

        <!-- Botón de acciones rápidas (solo si hay tour disponible) -->
        <QuickActionBtn v-if="showQuickAction && hasTourForCurrentRoute" />
      </div>
    </Transition>

    <!-- Botón principal pulsante -->
    <button
      @click="toggleExpanded"
      class="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus:outline-none active:scale-95 group overflow-hidden bg-transparent"
      :class="{ 'animate-pulse-custom': !isExpanded }"
      aria-label="Mostrar acciones rápidas"
      :title="isExpanded ? 'Ocultar acciones' : 'Mostrar acciones'"
    >
      <!-- Logo de Wala cuando está colapsado -->
      <Transition name="icon-fade" mode="out-in">
        <img
          v-if="!isExpanded"
          key="logo"
          src="@/assets/WalaLogoOF.png"
          alt="Wala"
          class="w-full h-full object-contain transition-transform"
        />
        <!-- Flecha cuando está expandido -->
        <div
          v-else
          key="arrow"
          class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white"
        >
          <NavArrowUp class="h-5 w-5" />
        </div>
      </Transition>
    </button>

    <!-- Modal de Feedback -->
    <FeedbackModal v-model="showFeedbackModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { NavArrowUp, Megaphone } from "@iconoir/vue";
import QuickActionBtn from "./QuickActionBtn.vue";
import FeedbackModal from "./FeedbackModal.vue";
import { useOnboarding } from "@/composables/useOnboarding";

// Usar el composable de onboarding para verificar disponibilidad de tour
const { hasTourForCurrentRoute } = useOnboarding();

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

// Estado de expansión
const isExpanded = ref(false);

// Estado del modal de feedback
const showFeedbackModal = ref(false);

// Referencia al contenedor
const containerRef = ref(null);

// Toggle de expansión
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

// Cerrar al hacer click fuera
const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isExpanded.value = false;
  }
};

// Agregar y remover listener
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
/* Animación de pulsación personalizada */
@keyframes pulse-custom {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 rgba(99, 102, 241, 0.7));
  }
  50% {
    transform: scale(1.08);
    filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 rgba(99, 102, 241, 0));
  }
}

.animate-pulse-custom {
  animation: pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

button:active {
  animation: none;
}

/* Transiciones para aparecer/desaparecer */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Transición para el cambio de icono */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.2s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>

<style>
/* Ocultar completamente el widget de Sentry por defecto */
#sentry-feedback {
  display: none !important;
}
</style>
