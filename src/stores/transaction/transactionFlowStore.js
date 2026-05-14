import { defineStore } from 'pinia';

// Importa los componentes de los pasos
import StepIncomeOrExpense from '@/components/transactionFlow/StepIncomeOrExpense.vue';
import StepCashOrBank from '@/components/transactionFlow/StepCashOrBank.vue';
import StepPaymentMethod from '@/components/transactionFlow/StepPaymentMethod.vue';
import StepAttachClient from '@/components/transactionFlow/StepAttachClient.vue';
import StepExpenseType from '@/components/transactionFlow/StepExpenseType.vue'
import StepAddIncomeDetails from '@/components/transactionFlow/StepAddIncomeDetails.vue';
import StepSalesChannel from '@/components/transactionFlow/StepSalesChannel.vue';
import StepAddExpenseDetails from '@/components/transactionFlow/StepAddExpenseDetails.vue';
import StepAddIncomePreview from '@/components/transactionFlow/StepAddIncomePreview.vue';
import StepAddExpensePreview from '@/components/transactionFlow/StepAddExpensePreview.vue';
import StepAddQuotePreview from '@/components/transactionFlow/StepAddQuotePreview.vue';
// import StepSummary from '@/components/transactionFlow/StepSummary.vue';

import StepTransferDetails from '@/components/transactionFlow/StepTransferDetails.vue';
import StepTransferPreview from '@/components/transactionFlow/StepTransferPreview.vue';

export const useTransactionFlowStore = defineStore('transactionFlow', {
  state: () => ({
    currentStep: 0,
    steps: [
      { label: 'Tipo de transacción', component: StepIncomeOrExpense },
      { label: 'Cuenta', component: StepCashOrBank },
      // El paso 3 y 4 serán definidos dinámicamente
    ],
    transactionLoading: false,
    transactionError: null,
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
    }
  },
  actions: {
    async nextStep() {
      // Obtener el step actual por su label
      const currentStepConfig = this.steps[this.currentStep];

      console.log('🔄 nextStep - Step actual:', currentStepConfig?.label);
      console.log('🔄 nextStep - Índice actual:', this.currentStep);

      // ⚠️ NO PROCESAR INVENTARIO AQUÍ
      // El inventario se procesa ÚNICAMENTE en transactionStore.addTransaction()
      // Este flujo solo debe validar y navegar entre pasos

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
      // Reestablecer los pasos al estado inicial
      this.steps = [
        { label: 'Tipo de transacción', component: StepIncomeOrExpense },
      ];
    },
    defineDynamicSteps(transactionType) {
      console.log("🔧 defineDynamicSteps - Tipo:", transactionType);

      // Limpia pasos previos dinámicos
      this.steps = [
        { label: 'Tipo de transacción', component: StepIncomeOrExpense },
      ];

      if (transactionType === 'income') {
        // NUEVO FLUJO PARA INGRESOS CON PAGOS PARCIALES Y CLIENTES
        this.steps.push(
          { label: 'Detalles ingreso', component: StepAddIncomeDetails },
          { label: 'Canal de venta', component: StepSalesChannel },
          { label: 'Método de pago', component: StepPaymentMethod },      // NUEVO
          { label: 'Adjuntar cliente', component: StepAttachClient },     // NUEVO
          { label: 'Preview ingreso', component: StepAddIncomePreview }
        );
      } else if (transactionType === 'expense') {
        // MANTENER FLUJO EXISTENTE PARA EGRESOS
        this.steps.push(
          { label: 'Cuenta', component: StepCashOrBank },
          { label: 'Tipo Egreso', component: StepExpenseType },
          { label: 'Detalles egreso', component: StepAddExpenseDetails },
          { label: 'Preview egreso', component: StepAddExpensePreview }
        );
      } else if (transactionType === 'transfer') {
        // Aquí podrías definir pasos específicos para transferencias si es necesario
        this.steps.push(
          { label: 'Detalles transferencia', component: StepTransferDetails },
          { label: 'Preview transferencia', component: StepTransferPreview }
        );
      } else if (transactionType === 'quote') {
        // NUEVO FLUJO PARA COTIZACION
        this.steps.push(
          { label: 'Detalles cotización', component: StepAddIncomeDetails },
          { label: 'Adjuntar cliente', component: StepAttachClient },
          { label: 'Preview cotización', component: StepAddQuotePreview }
        );
      }

      console.log("✅ Pasos definidos:", this.steps.map(s => s.label));
      console.log("📍 Total de pasos:", this.steps.length);

      // this.steps.push({ label: 'Resumen', component: StepSummary });
    }
  }
});
