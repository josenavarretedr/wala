import { defineStore } from 'pinia';

// Importa los componentes de los pasos
import StepAddStockQuantity from '@/components/Inventory/StockLogs/StepAddStockQuantity.vue';
import StepPaymentMethodExpense from '@/components/transactionFlow/StepPaymentMethodExpense.vue';
import StepAttachSupplier from '@/components/transactionFlow/StepAttachSupplier.vue';
import StepAddStockPreview from '@/components/Inventory/StockLogs/StepAddStockPreview.vue';

export const useAddStockFlowStore = defineStore('addStockFlow', {
  state: () => ({
    currentStep: 0,
    steps: [
      { label: 'Cantidad y Precio', component: StepAddStockQuantity },
      { label: 'Método de pago', component: StepPaymentMethodExpense },
      { label: 'Adjuntar proveedor', component: StepAttachSupplier },
      { label: 'Preview', component: StepAddStockPreview },
    ],
    addStockLoading: false,
    addStockError: null,
    // Datos del flujo de adición
    addStockData: {
      productId: null,
      productData: null, // Datos completos del producto
      quantity: 0,
      cost: 0, // Costo de compra por presentación
      priceConfirmed: false,
      presentationId: null,
      presentationName: null,
      conversionFactor: 1,
      baseQuantity: 0,
      baseUnitCost: 0,
      account: null, // 'cash' o 'bank'
      paymentType: 'complete', // 'complete' o 'partial'
      paidAmount: 0,
      balance: 0,
      isPartial: false,
      supplierId: null,
      supplierName: null,
      supplierPhone: null,
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
  },
  actions: {
    async nextStep() {
      this.addStockLoading = true;

      const currentStepConfig = this.steps[this.currentStep];

      console.log('🔄 AddStock nextStep - Step actual:', currentStepConfig?.label);
      console.log('🔄 AddStock nextStep - Índice actual:', this.currentStep);
      console.log('📦 AddStock Data:', this.addStockData);

      // Avanzar al siguiente step
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        console.log('✅ Avanzado al step:', this.currentStep, this.steps[this.currentStep]?.label);
      } else {
        console.log('⚠️ Ya estás en el último step');
      }

      this.addStockLoading = false;
    },
    prevStep() {
      if (this.currentStep > 0) this.currentStep--;
    },
    resetFlow() {
      this.currentStep = 0;
      // Resetear los datos del flujo
      this.resetAddStockData();
    },
    resetAddStockData() {
      this.addStockData = {
        productId: null,
        productData: null,
        quantity: 0,
        cost: 0,
        priceConfirmed: false,
        presentationId: null,
        presentationName: null,
        conversionFactor: 1,
        baseQuantity: 0,
        baseUnitCost: 0,
        account: null,
        paymentType: 'complete',
        paidAmount: 0,
        balance: 0,
        isPartial: false,
        supplierId: null,
        supplierName: null,
        supplierPhone: null,
      };
    },
    // Actualizar datos del flujo
    setPresentation(pres) {
      if (!pres) return;
      this.addStockData.presentationId = pres.id;
      this.addStockData.presentationName = pres.name;
      this.addStockData.conversionFactor = Number(pres.factor || 1);
      this.computeBaseEquivalents();
    },
    computeBaseEquivalents() {
      const factor = Number(this.addStockData.conversionFactor || 1);
      const qty = Number(this.addStockData.quantity || 0);
      const cost = Number(this.addStockData.cost || 0);
      this.addStockData.baseQuantity = Math.round((qty * factor + Number.EPSILON) * 100) / 100;
      this.addStockData.baseUnitCost = factor > 0 ? Math.round(((cost / factor) + Number.EPSILON) * 100) / 100 : cost;
    },
    setProductData(productId, productData) {
      this.addStockData.productId = productId;
      this.addStockData.productData = productData;
      // Configurar presentación por defecto
      const presentations = Array.isArray(productData?.presentations) ? productData.presentations.filter(p => p && p.isActive !== false) : [];
      const buyPres = presentations.filter(p => !p.usage || p.usage.includes('buy'));
      const defaultPres = buyPres.find(p => p.isBase) || buyPres[0] || (presentations.length > 0 ? presentations[0] : null);
      if (defaultPres) {
        this.addStockData.presentationId = defaultPres.id;
        this.addStockData.presentationName = defaultPres.name;
        this.addStockData.conversionFactor = Number(defaultPres.factor || 1);
      } else {
        this.addStockData.presentationId = 'pres_base';
        this.addStockData.presentationName = (productData?.unit || 'UNIDAD').toUpperCase();
        this.addStockData.conversionFactor = 1;
      }
      this.computeBaseEquivalents();
      console.log('📦 Producto establecido:', { productId, productData });
    },
    setQuantity(quantity) {
      this.addStockData.quantity = quantity;
      this.computeBaseEquivalents();
      console.log('📊 Cantidad establecida:', quantity);
    },
    setCost(cost) {
      this.addStockData.cost = cost;
      this.computeBaseEquivalents();
      console.log('💰 Costo establecido:', cost);
    },
    setPriceConfirmed(confirmed) {
      this.addStockData.priceConfirmed = confirmed;
      console.log('✅ Precio confirmado:', confirmed);
    },
    setAccount(account) {
      this.addStockData.account = account;
      console.log('💳 Método de pago establecido:', account);
    },
    // Validaciones
    canProceedToNextStep() {
      const currentStepConfig = this.steps[this.currentStep];
      const label = currentStepConfig?.label;

      console.log('🔍 Validando paso:', label, this.addStockData);

      switch (label) {
        case 'Cantidad y Precio':
          return this.addStockData.quantity > 0 &&
            this.addStockData.cost > 0 &&
            this.addStockData.priceConfirmed;
        case 'Método de pago':
          return this.addStockData.account !== null;
        case 'Adjuntar proveedor':
          return this.addStockData.supplierId !== null && this.addStockData.supplierId !== undefined;
        case 'Preview':
          return true;
        default:
          return false;
      }
    }
  }
});
