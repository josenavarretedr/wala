import { defineStore } from 'pinia';

// Importa los componentes de los pasos
import StepIncomeOrExpense from '@/components/transactionFlow/StepIncomeOrExpense.vue';
import StepCashOrBank from '@/components/transactionFlow/StepCashOrBank.vue';
import StepAddIncomeDetails from '@/components/transactionFlow/StepAddIncomeDetails.vue';
import StepAddExpenseDetails from '@/components/transactionFlow/StepAddExpenseDetails.vue';
// import StepSummary from '@/components/transactionFlow/StepSummary.vue';

export const useTransactionFlowStore = defineStore('transactionFlow', {
  state: () => ({
    currentStep: 0,
    steps: [
      { label: 'Tipo de transacción', component: StepIncomeOrExpense },
      { label: 'Cuenta', component: StepCashOrBank },
      // El paso 3 y 4 serán definidos dinámicamente
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
      if (this.currentStep < this.steps.length - 1) this.currentStep++;
    },
    prevStep() {
      if (this.currentStep > 0) this.currentStep--;
    },
    resetFlow() {
      this.currentStep = 0;
      // Reestablecer los pasos al estado inicial
      this.steps = [
        { label: 'Tipo de transacción', component: StepIncomeOrExpense },
        { label: 'Cuenta', component: StepCashOrBank }
      ];
    },
    defineDynamicSteps(transactionType) {
      // Limpia pasos previos dinámicos
      this.steps = [
        { label: 'Tipo de transacción', component: StepIncomeOrExpense },
        { label: 'Cuenta', component: StepCashOrBank }
      ];

      if (transactionType === 'income') {
        this.steps.push({ label: 'Detalles ingreso', component: StepAddIncomeDetails });
      } else if (transactionType === 'expense') {
        this.steps.push({ label: 'Detalles egreso', component: StepAddExpenseDetails });
      }

      // this.steps.push({ label: 'Resumen', component: StepSummary });
    }
  }
});
