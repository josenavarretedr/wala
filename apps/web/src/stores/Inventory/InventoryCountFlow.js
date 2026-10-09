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
      hasVariants: false,
      variantCounts: [],
      hasDiscrepancy: false, // Si hay diferencia entre físico y digital
      difference: 0, // Diferencia calculada (físico - digital)
      hasUserInput: false, // Si el usuario ha ingresado algo
      minStock: null, // Stock mínimo para alertas
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
        hasVariants: false,
        variantCounts: [],
        hasDiscrepancy: false,
        difference: 0,
        hasUserInput: false,
        minStock: null,
      };
    },
    // Actualizar datos del flujo
    setProductData(productId, productData) {
      this.countData.productId = productId;
      this.countData.productData = productData;
      this.countData.digitalStock = productData?.stock || 0;
      this.countData.hasVariants = Boolean(productData?.hasVariants);
      this.countData.variantCounts = this.countData.hasVariants
        ? (Array.isArray(productData?.variantCombos)
          ? productData.variantCombos.map((variant) => ({
            variantId: variant.id,
            label: variant.label,
            sku: variant.sku || null,
            digitalStock: Number(variant.stock || 0),
            physicalStock: Number(variant.stock || 0),
            cost: null,
            price: null,
          }))
          : [])
        : [];
      this.countData.minStock = productData?.minStock ?? null;
      console.log('📦 Producto establecido para conteo:', { productId, productData });
    },
    setMinStock(minStock) {
      this.countData.minStock = minStock;
      console.log('🔔 Stock mínimo establecido:', minStock);
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
    setVariantPhysicalStock(variantId, physicalStock) {
      const index = this.countData.variantCounts.findIndex((variant) => variant.variantId === variantId);
      if (index === -1) return;

      this.countData.variantCounts[index].physicalStock = Number(physicalStock || 0);
      this.recalculateFromVariants();
    },
    setVariantCounts(variantCounts) {
      this.countData.variantCounts = Array.isArray(variantCounts)
        ? variantCounts.map((variant) => ({
          ...variant,
          digitalStock: Number(variant.digitalStock || 0),
          physicalStock: Number(variant.physicalStock || 0),
        }))
        : [];

      this.recalculateFromVariants();
    },
    recalculateFromVariants() {
      const digital = this.countData.variantCounts.reduce(
        (total, variant) => total + Number(variant.digitalStock || 0),
        0,
      );
      const physical = this.countData.variantCounts.reduce(
        (total, variant) => total + Number(variant.physicalStock || 0),
        0,
      );

      this.countData.digitalStock = digital;
      this.countData.physicalStock = physical;
      this.countData.difference = physical - digital;
      this.countData.hasDiscrepancy = Math.abs(this.countData.difference) > 0.01;
      this.countData.hasUserInput = true;
    },
    clearUserInput() {
      this.countData.hasUserInput = false;
    }
  }
});
