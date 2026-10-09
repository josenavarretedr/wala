import { defineStore } from 'pinia';

// Importa los componentes de los pasos
import StepRemoveStockType from '@/components/Inventory/StockLogs/StepRemoveStockType.vue';
import StepRemoveStockQuantity from '@/components/Inventory/StockLogs/StepRemoveStockQuantity.vue';
import StepCashOrBank from '@/components/transactionFlow/StepCashOrBank.vue';
import StepRemoveStockPreview from '@/components/Inventory/StockLogs/StepRemoveStockPreview.vue';

export const useRemoveStockFlowStore = defineStore('removeStockFlow', {
  state: () => ({
    currentStep: 0,
    steps: [
      { label: 'Tipo de salida', component: StepRemoveStockType },
      { label: 'Cantidad', component: StepRemoveStockQuantity },
      // Los pasos siguientes se definirán dinámicamente según el tipo
    ],
    removeStockLoading: false,
    removeStockError: null,
    // Datos del flujo de remoción
    removeStockData: {
      productId: null,
      productData: null, // Datos completos del producto
      stockLogType: null, // 'sell' o 'waste'
      quantity: 0,
      price: 0, // Precio del producto (puede ser modificado)
      priceConfirmed: false, // Si el precio fue confirmado
      // Para ventas (cuando stockLogType === 'sell')
      account: null, // 'cash' o 'bank'
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
    isLastStep: state => {
      if (state.currentStep === 0 && state.steps.length <= 1) {
        return false;
      }
      return state.currentStep === state.steps.length - 1 && state.steps.length > 1;
    },
    isSaleType: state => state.removeStockData.stockLogType === 'sell',
    isWasteType: state => state.removeStockData.stockLogType === 'waste',
  },
  actions: {
    async nextStep() {
      this.removeStockLoading = true;

      const currentStepConfig = this.steps[this.currentStep];

      console.log('🔄 RemoveStock nextStep - Step actual:', currentStepConfig?.label);
      console.log('🔄 RemoveStock nextStep - Índice actual:', this.currentStep);
      console.log('📦 RemoveStock Data:', this.removeStockData);

      // Avanzar al siguiente step
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        console.log('✅ Avanzado al step:', this.currentStep, this.steps[this.currentStep]?.label);
      } else {
        console.log('⚠️ Ya estás en el último step');
      }

      this.removeStockLoading = false;
    },
    prevStep() {
      if (this.currentStep > 0) this.currentStep--;
    },
    resetFlow() {
      this.currentStep = 0;
      // Reestablecer los pasos al estado inicial
      this.steps = [
        { label: 'Tipo de salida', component: StepRemoveStockType },
        { label: 'Cantidad', component: StepRemoveStockQuantity },
      ];
      // Resetear los datos del flujo
      this.resetRemoveStockData();
    },
    resetRemoveStockData() {
      this.removeStockData = {
        productId: null,
        productData: null,
        stockLogType: null,
        quantity: 0,
        price: 0,
        priceConfirmed: false,
        account: null,
      };
    },
    // Definir pasos dinámicos según el tipo de salida
    defineDynamicSteps(stockLogType) {
      console.log('🎯 Definiendo pasos dinámicos para tipo:', stockLogType);

      // Pasos base
      this.steps = [
        { label: 'Tipo de salida', component: StepRemoveStockType },
        { label: 'Cantidad', component: StepRemoveStockQuantity },
      ];

      // Si es venta, agregar paso de método de pago
      if (stockLogType === 'sell') {
        this.steps.push({ label: 'Método de pago', component: StepCashOrBank });
      }

      // Paso final de preview
      this.steps.push({ label: 'Preview', component: StepRemoveStockPreview });

      console.log('✅ Pasos definidos:', this.steps.map(s => s.label));
    },
    // Actualizar datos del flujo
    setProductData(productId, productData) {
      this.removeStockData.productId = productId;
      this.removeStockData.productData = productData;
      // Establecer el precio inicial del producto
      this.removeStockData.price = productData.price || 0;
      console.log('📦 Producto establecido:', { productId, productData });
    },
    setStockLogType(type) {
      this.removeStockData.stockLogType = type;
      console.log('📝 Tipo de salida establecido:', type);
      // Definir los pasos dinámicos basados en el tipo
      this.defineDynamicSteps(type);
    },
    setQuantity(quantity) {
      this.removeStockData.quantity = quantity;
      console.log('📊 Cantidad establecida:', quantity);
    },
    setPrice(price) {
      this.removeStockData.price = price;
      console.log('💰 Precio establecido:', price);
    },
    setPriceConfirmed(confirmed) {
      this.removeStockData.priceConfirmed = confirmed;
      console.log('✅ Precio confirmado:', confirmed);
    },
    setAccount(account) {
      this.removeStockData.account = account;
      console.log('💳 Método de pago establecido:', account);
    },
    // Validaciones
    canProceedToNextStep() {
      const currentStepConfig = this.steps[this.currentStep];
      const label = currentStepConfig?.label;

      console.log('🔍 Validando paso:', label, this.removeStockData);

      switch (label) {
        case 'Tipo de salida':
          return this.removeStockData.stockLogType !== null;
        case 'Cantidad':
          // Para ventas, validar cantidad Y precio
          if (this.isSaleType) {
            return this.removeStockData.quantity > 0 &&
              this.removeStockData.price > 0 &&
              this.removeStockData.priceConfirmed;
          }
          // Para mermas, solo validar cantidad
          return this.removeStockData.quantity > 0;
        case 'Método de pago':
          return this.removeStockData.account !== null;
        case 'Preview':
          return true;
        default:
          return false;
      }
    }
  }
});
