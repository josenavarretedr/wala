// Ejemplo de cómo se vería un cashFlowStore para usar con ProgressIndicator
import { defineStore } from 'pinia';

// Componentes hipotéticos para cash flow
import StepCashAmount from '@/components/cashFlow/StepCashAmount.vue';
import StepCashReason from '@/components/cashFlow/StepCashReason.vue';
import StepCashPreview from '@/components/cashFlow/StepCashPreview.vue';

export const useCashFlowStore = defineStore('cashFlow', {
  state: () => ({
    currentStep: 0,
    steps: [
      { label: 'Monto', component: StepCashAmount },
      { label: 'Motivo', component: StepCashReason },
      { label: 'Confirmar', component: StepCashPreview }
    ]
  }),
  getters: {
    currentStepConfig(state) {
      return {
        ...state.steps[state.currentStep],
        allSteps: state.steps
      };
    },
    isFirstStep: state => state.currentStep === 0,
    isLastStep: state => state.currentStep === state.steps.length - 1
  },
  actions: {
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
      }
    },
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },
    resetFlow() {
      this.currentStep = 0;
    }
  }
});

/* 
EJEMPLO DE USO EN UN COMPONENTE:

<template>
  <div class="cash-flow-wrapper">
    <ProgressIndicator v-bind="progressProps" />
    <component :is="CurrentStepComponent" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ProgressIndicator from '@/components/ui/ProgressIndicator.vue';
import { useCashFlowStore } from '@/stores/cashFlowStore';
import { getProgressIndicatorProps, FLOW_TYPES } from '@/composables/useProgressIndicator';

const cashFlow = useCashFlowStore();

const CurrentStepComponent = computed(() => cashFlow.currentStepConfig.component);

// ¡Así de simple! Automáticamente usará colores verdes para cash flow
const progressProps = computed(() => 
  getProgressIndicatorProps(cashFlow, FLOW_TYPES.CASH)
);
</script>
*/