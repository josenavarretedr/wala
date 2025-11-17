import { defineStore } from 'pinia';
import { useInventoryStore } from '@/stores/InventoryStore';
import { useTransactionStore } from '@/stores/transaction/transactionStore';

// Importa los componentes de los pasos
import StepIncomeOrExpense from '@/components/transactionFlow/StepIncomeOrExpense.vue';
import StepCashOrBank from '@/components/transactionFlow/StepCashOrBank.vue';
import StepExpenseType from '@/components/transactionFlow/StepExpenseType.vue'
import StepAddIncomeDetails from '@/components/transactionFlow/StepAddIncomeDetails.vue';
import StepAddExpenseDetails from '@/components/transactionFlow/StepAddExpenseDetails.vue';
import StepAddIncomePreview from '@/components/transactionFlow/StepAddIncomePreview.vue';
import StepAddExpensePreview from '@/components/transactionFlow/StepAddExpensePreview.vue';
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

      this.transactionLoading = true;

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

          // ========================================
          // PROCESAR INGRESOS (ventas)
          // ========================================
          if (currentStepConfig?.label === 'Detalles ingreso') {
            const items = transactionStore.transactionToAdd.value.items;
            console.log('📦 Items de venta a procesar:', items);

            if (items && items.length > 0) {
              await inventoryStore.addItemToInventoryFromArryOfItemsNewOrOld(items);
              console.log('✅ Inventario procesado exitosamente (ventas)');
            } else {
              console.warn('⚠️ No hay items para procesar en el inventario (ventas)');
            }
          }

          // ========================================
          // PROCESAR EGRESOS DE TIPO MATERIALS (compras)
          // ========================================
          if (currentStepConfig?.label === 'Detalles egreso') {
            const category = transactionStore.transactionToAdd.value.category;

            if (category === 'materials') {
              const materialItems = transactionStore.transactionToAdd.value.materialItems;
              console.log('🛒 Materiales de compra a procesar:', materialItems);

              if (materialItems && materialItems.length > 0) {
                // Procesar cada material y crear los productos/stockLogs necesarios
                const materialStockLogMap = await inventoryStore.addMaterialItemsToInventoryForPurchase(materialItems);

                console.log('✅ Inventario procesado exitosamente (compra de materiales)');
                console.log('📋 Mapeo de stockLogs:', materialStockLogMap);

                // Actualizar materialItems con sus stockLogIds correspondientes
                if (materialStockLogMap && materialStockLogMap.length > 0) {
                  transactionStore.transactionToAdd.value.materialItemsAndStockLogs = materialStockLogMap;

                  // Actualizar cada material item con su stockLogId
                  materialItems.forEach(material => {
                    const mapping = materialStockLogMap.find(m => m.materialUuid === material.uuid);
                    if (mapping) {
                      material.stockLogId = mapping.stockLogId;
                      console.log(`🔗 Material ${material.description} vinculado a stockLog ${mapping.stockLogId}`);
                    }
                  });
                }
              } else {
                console.warn('⚠️ No hay materiales para procesar en el inventario');
              }
            } else {
              // Para labor/overhead no se procesa inventario
              console.log('ℹ️ Gasto tipo labor/overhead, no requiere procesamiento de inventario');
            }
          }

          this.transactionLoading = false;

        } catch (error) {
          console.error('❌ Error procesando inventario:', error);
          this.transactionLoading = false;
          this.transactionError = error;
          throw error; // Re-lanzar el error para que el componente lo maneje
        }
      } else {
        // Si no es un step de detalles de ingreso/egreso, resetear el loading
        this.transactionLoading = false;
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
      ];
    },
    defineDynamicSteps(transactionType) {
      // Limpia pasos previos dinámicos
      this.steps = [
        { label: 'Tipo de transacción', component: StepIncomeOrExpense },
      ];

      if (transactionType === 'income') {
        this.steps.push({ label: 'Cuenta', component: StepCashOrBank });
        this.steps.push({ label: 'Detalles ingreso', component: StepAddIncomeDetails });
        this.steps.push({ label: 'Preview ingreso', component: StepAddIncomePreview });
      } else if (transactionType === 'expense') {
        this.steps.push({ label: 'Cuenta', component: StepCashOrBank });
        this.steps.push({ label: 'Tipo Egreso', component: StepExpenseType });
        this.steps.push({ label: 'Detalles egreso', component: StepAddExpenseDetails });
        this.steps.push({ label: 'Preview egreso', component: StepAddExpensePreview });
      } else if (transactionType === 'transfer') {
        // Aquí podrías definir pasos específicos para transferencias si es necesario
        this.steps.push({ label: 'Detalles transferencia', component: StepTransferDetails });
        this.steps.push({ label: 'Preview transferencia', component: StepTransferPreview });
      }

      // this.steps.push({ label: 'Resumen', component: StepSummary });
    }
  }
});
