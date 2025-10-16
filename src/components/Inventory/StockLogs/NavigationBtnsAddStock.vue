<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-40 shadow-lg"
  >
    <div class="max-w-3xl mx-auto flex gap-3">
      <!-- Botón Atrás -->
      <button
        v-if="flow.currentStep > 0"
        @click="handleBack"
        class="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <NavArrowLeft class="w-5 h-5" />
        <span>Atrás</span>
      </button>

      <!-- Botón Continuar/Finalizar -->
      <button
        @click="handleNext"
        :disabled="!canProceed"
        class="flex-1 px-6 py-3 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="
          isLastStep
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg'
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
        "
      >
        <span>{{ isLastStep ? "Finalizar compra" : "Continuar" }}</span>
        <component :is="isLastStep ? Check : NavArrowRight" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { NavArrowLeft, NavArrowRight, Check } from "@iconoir/vue";
import { useAddStockFlowStore } from "@/stores/Inventory/AddStockFlow.js";

const props = defineProps({
  finalizarRegistro: {
    type: Function,
    required: true,
  },
});

const flow = useAddStockFlowStore();

// Computed
const isLastStep = computed(() => {
  console.log("🔍 Verificando último paso:", {
    currentStep: flow.currentStep,
    totalSteps: flow.steps.length,
    isLast: flow.currentStep === flow.steps.length - 1,
  });
  return flow.currentStep === flow.steps.length - 1;
});

const canProceed = computed(() => {
  const basicValidation = flow.canProceedToNextStep();

  // Si estamos en el paso de selección de cuenta (paso 1)
  // verificar que la cuenta tenga fondos suficientes
  if (flow.currentStep === 1) {
    const hasAccount = flow.addStockData.account !== null;
    console.log("🔍 Validando cuenta seleccionada:", {
      hasAccount,
      account: flow.addStockData.account,
      basicValidation,
    });
    return basicValidation && hasAccount;
  }

  return basicValidation;
});

// Handlers
const handleBack = () => {
  flow.prevStep();
};

const handleNext = () => {
  if (!canProceed.value) {
    console.warn("⚠️ No se puede proceder al siguiente paso");
    return;
  }

  if (isLastStep.value) {
    // Finalizar el registro
    console.log("✅ Finalizando compra...");
    props.finalizarRegistro();
  } else {
    // Ir al siguiente paso
    flow.nextStep();
  }
};
</script>
