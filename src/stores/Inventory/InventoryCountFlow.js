import { defineStore } from 'pinia';

// Importa los componentes de los pasos
import StepInventoryCountQuantity from '@/components/Inventory/StockLogs/StepInventoryCountQuantity.vue';

export const useInventoryCountFlowStore = defineStore('inventoryCountFlow', {
  state: () => ({
    currentStep: 0,
    steps: [
      { label: 'Conteo Físico', component: StepInventoryCountQuantity },
    ],
    countLoading: false,
    countError: null,
    // Datos del flujo de conteo
    countData: {
      productId: null,
      productData: null, // Datos completos del producto
      physicalStock: null, // Stock físico contado
      digitalStock: 0, // Stock digital (en sistema)
      hasDiscrepancy: false, // Si hay diferencia entre físico y digital
      difference: 0, // Diferencia calculada (físico - digital)
      hasUserInput: false, // Si el usuario ha ingresado algo
    }
  }),
  getters: {
    currentStepConfig(state) {
      return {
        ...state.steps[state.currentStep],
        allSteps: state.steps
      };
    },
    isFirstStep: state => state.currentStep === 0,
    isLastStep: state => state.currentStep === state.steps.length - 1,
  },
  actions: {
    async nextStep() {
      this.countLoading = true;

      const currentStepConfig = this.steps[this.currentStep];

      console.log('🔄 InventoryCount nextStep - Step actual:', currentStepConfig?.label);
      console.log('🔄 InventoryCount nextStep - Índice actual:', this.currentStep);
      console.log('📦 Count Data:', this.countData);

      // Avanzar al siguiente step (si hubiera más)
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        console.log('✅ Avanzado al step:', this.currentStep, this.steps[this.currentStep]?.label);
      } else {
        console.log('⚠️ Ya estás en el último step');
      }

      this.countLoading = false;
    },
    prevStep() {
      if (this.currentStep > 0) this.currentStep--;
    },
    resetFlow() {
      this.currentStep = 0;
      this.resetCountData();
    },
    resetCountData() {
      this.countData = {
        productId: null,
        productData: null,
        physicalStock: null,
        digitalStock: 0,
        hasDiscrepancy: false,
        difference: 0,
        hasUserInput: false,
      };
    },
    // Actualizar datos del flujo
    setProductData(productId, productData) {
      this.countData.productId = productId;
      this.countData.productData = productData;
      this.countData.digitalStock = productData?.stock || 0;
      console.log('📦 Producto establecido para conteo:', { productId, productData });
    },
    setPhysicalStock(physicalStock) {
      this.countData.physicalStock = physicalStock;
      this.countData.hasUserInput = true;

      // Calcular diferencia
      const physical = Number(physicalStock) || 0;
      const digital = Number(this.countData.digitalStock) || 0;
      this.countData.difference = physical - digital;
      this.countData.hasDiscrepancy = Math.abs(this.countData.difference) > 0.01;

      console.log('📊 Stock físico establecido:', {
        physical,
        digital,
        difference: this.countData.difference,
        hasDiscrepancy: this.countData.hasDiscrepancy
      });
    },
    clearUserInput() {
      this.countData.hasUserInput = false;
    }
  }
});
