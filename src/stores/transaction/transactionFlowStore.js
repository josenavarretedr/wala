import { defineStore } from 'pinia';
import { useInventoryStore } from '@/stores/InventoryStore';
import { useTransactionStore } from '@/stores/transaction/transactionStore';

// Importa los componentes de los pasos
import StepIncomeOrExpense from '@/components/transactionFlow/StepIncomeOrExpense.vue';
import StepCashOrBank from '@/components/transactionFlow/StepCashOrBank.vue';
import StepAddIncomeDetails from '@/components/transactionFlow/StepAddIncomeDetails.vue';
import StepAddExpenseDetails from '@/components/transactionFlow/StepAddExpenseDetails.vue';
import StepAddIncomePreview from '@/components/transactionFlow/StepAddIncomePreview.vue';
import StepAddExpensePreview from '@/components/transactionFlow/StepAddExpensePreview.vue';
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
    async nextStep() {
      // Obtener el step actual por su label
      const currentStepConfig = this.steps[this.currentStep];

      console.log('🔄 nextStep - Step actual:', currentStepConfig?.label);
      console.log('🔄 nextStep - Índice actual:', this.currentStep);

      // Si estamos en el step de detalles, procesar el inventario
      if (currentStepConfig?.label === 'Detalles ingreso' || currentStepConfig?.label === 'Detalles egreso') {
        console.log('📦 Procesando inventario...');

        try {
          const inventoryStore = useInventoryStore();
          const transactionStore = useTransactionStore();

          const items = transactionStore.transactionToAdd.value.items;
          console.log('📦 Items a procesar:', items);

          if (items && items.length > 0) {
            await inventoryStore.addItemToInventoryFromArryOfItemsNewOrOld(items);
            console.log('✅ Inventario procesado exitosamente');
          } else {
            console.warn('⚠️ No hay items para procesar en el inventario');
          }
        } catch (error) {
          console.error('❌ Error procesando inventario:', error);
          throw error; // Re-lanzar el error para que el componente lo maneje
        }
      }

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
        this.steps.push({ label: 'Preview ingreso', component: StepAddIncomePreview });
      } else if (transactionType === 'expense') {
        this.steps.push({ label: 'Detalles egreso', component: StepAddExpenseDetails });
        this.steps.push({ label: 'Preview egreso', component: StepAddExpensePreview });
      }

      // this.steps.push({ label: 'Resumen', component: StepSummary });
    }
  }
});
