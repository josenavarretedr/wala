import { defineStore } from 'pinia';

import StepLastReference from '@/components/AccountsBalanceApp/StepLastReference.vue';
import StepCashBalance from '@/components/AccountsBalanceApp/StepCashBalance.vue';
import StepBankBalance from '@/components/AccountsBalanceApp/StepBankBalance.vue';
import { useAccountsBalanceStore } from './accountsBalanceStore';

export const useAccountsBalanceFlowStore = defineStore('accountBalanceFlow', {
  state: () => ({
    currentStep: 0,
    steps: [
      { label: 'Referencia anterior', component: StepLastReference },
      { label: 'Cash Balance', component: StepCashBalance },
      { label: 'Bank Balance', component: StepBankBalance },

    ],
    accountBalanceLoading: false,
    accountBalanceError: null,
  }),
  getters: {
    currentStepConfig(state) {
      return {
        ...state.steps[state.currentStep],
        allSteps: state.steps
      };
    },
    isFirstStep: state => state.currentStep === 0,
    isLastStep: state => {
      // Si estamos en el primer paso y hay solo 1 paso, no puede ser el último
      if (state.currentStep === 0 && state.steps.length <= 1) {
        return false;
      }
      // Para ser el último paso, debe cumplir las condiciones normales
      return state.currentStep === state.steps.length - 1 && state.steps.length > 1;
    },
    // Getter para acceder a los stepsData desde el accountsBalanceStore
    stepsData() {
      const accountsBalanceStore = useAccountsBalanceStore();
      return accountsBalanceStore.stepsData;
    }
  },
  actions: {
    async nextStep() {

      this.accountBalanceLoading = true;

      // Obtener el step actual por su label
      const currentStepConfig = this.steps[this.currentStep];

      console.log('🔄 nextStep - Step actual:', currentStepConfig?.label);
      console.log('🔄 nextStep - Índice actual:', this.currentStep);

      // Avanzar al siguiente step
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        console.log('✅ Avanzado al step:', this.currentStep, this.steps[this.currentStep]?.label);
      } else {
        console.log('⚠️ Ya estás en el último step');
      }
    },
    prevStep() {
      if (this.currentStep > 0) this.currentStep--;
    },
    resetFlow() {
      this.currentStep = 0;
      // Reestablecer los pasos al estado inicial (TODOS los 3 pasos)
      this.steps = [
        { label: 'Referencia anterior', component: StepLastReference },
        { label: 'Cash Balance', component: StepCashBalance },
        { label: 'Bank Balance', component: StepBankBalance },
      ];
      // Resetear los datos en el accountsBalanceStore
      const accountsBalanceStore = useAccountsBalanceStore();
      accountsBalanceStore.resetStepsData();
    },
    // Actualizar datos de un step específico (delega al accountsBalanceStore)
    updateStepData(stepLabel, data) {
      const accountsBalanceStore = useAccountsBalanceStore();
      accountsBalanceStore.updateStepData(stepLabel, data);
    },
    // defineDynamicSteps(accountType) {
    //   // Limpia pasos previos dinámicos
    //   this.steps = [
    //     { label: 'Tipo de transacción', component: StepIncomeOrExpense },
    //   ];

    //   if (accountType === 'income') {
    //     this.steps.push({ label: 'Cuenta', component: StepCashOrBank });
    //     this.steps.push({ label: 'Detalles ingreso', component: StepAddIncomeDetails });
    //     this.steps.push({ label: 'Preview ingreso', component: StepAddIncomePreview });
    //   } else if (accountType === 'expense') {
    //     this.steps.push({ label: 'Cuenta', component: StepCashOrBank });
    //     this.steps.push({ label: 'Detalles egreso', component: StepAddExpenseDetails });
    //     this.steps.push({ label: 'Preview egreso', component: StepAddExpensePreview });
    //   } else if (accountType === 'transfer') {
    //     // Aquí podrías definir pasos específicos para transferencias si es necesario
    //     this.steps.push({ label: 'Detalles transferencia', component: StepTransferDetails });
    //     this.steps.push({ label: 'Preview transferencia', component: StepTransferPreview });
    //   }

    //   // this.steps.push({ label: 'Resumen', component: StepSummary });
    // }
  }
});
