<template>
  <!-- Botones de navegación -->
  <div
    class="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 max-w-4xl mx-auto bg-white p-2 sm:p-4 rounded-xl"
  >
    <!-- Botón Volver (solo si no es el primer paso) -->
    <div
      v-if="!flow.isFirstStep"
      class="relative group w-full sm:flex-1 max-w-md sm:max-w-xs mx-auto sm:mx-0"
    >
      <button
        @click="handleBack"
        :disabled="isLoading"
        class="w-full py-2 px-3 sm:py-2.5 sm:px-4 bg-white border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <NavArrowLeft class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span class="font-semibold tracking-wide">VOLVER</span>
      </button>
    </div>

    <!-- Botón Continuar o Finalizar -->
    <div
      class="relative group w-full sm:flex-1 max-w-md sm:max-w-xs mx-auto sm:mx-0"
    >
      <button
        @click="handleNext"
        :disabled="!canProceed || isLoading"
        :class="[
          'w-full py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 transform flex items-center justify-center gap-2',
          canProceed && !isLoading
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed',
        ]"
      >
        <component
          :is="
            isLoading ? LoadingSpinner : flow.isLastStep ? Check : NavArrowRight
          "
          :class="[
            'w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0',
            isLoading && 'animate-spin',
          ]"
        />
        <span class="font-semibold tracking-wide">
          {{ flow.isLastStep ? "FINALIZAR" : "CONTINUAR" }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { NavArrowLeft, NavArrowRight, Check } from "@iconoir/vue";
import { useRemoveStockFlowStore } from "@/stores/Inventory/RemoveStockFlow.js";

// Props
const props = defineProps({
  finalizarRegistro: {
    type: Function,
    required: true,
  },
});

// Store
const flow = useRemoveStockFlowStore();

// State
const isLoading = ref(false);

// Icono de loading personalizado
const LoadingSpinner = {
  template: `
    <svg class="animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  `,
};

// Computed para validar si se puede proceder
const canProceed = computed(() => {
  return flow.canProceedToNextStep();
});

// Manejar retroceso
const handleBack = () => {
  if (isLoading.value) return;
  flow.prevStep();
};

// Manejar siguiente paso o finalizar
const handleNext = async () => {
  if (!canProceed.value || isLoading.value) return;

  try {
    isLoading.value = true;

    if (flow.isLastStep) {
      // Finalizar el registro
      console.log("🎯 Finalizando registro de salida...");
      await props.finalizarRegistro();
    } else {
      // Continuar al siguiente paso
      console.log("➡️ Continuando al siguiente paso...");
      await flow.nextStep();
    }
  } catch (error) {
    console.error("❌ Error en navegación:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Animación de spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Animación para los botones */
button {
  position: relative;
  overflow: hidden;
}

button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

button:active::before {
  width: 300px;
  height: 300px;
}
</style>
