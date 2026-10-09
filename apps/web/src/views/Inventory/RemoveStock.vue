<template>
  <div
    class="space-y-4 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-20"
  >
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div
        class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3 animate-spin"
      ></div>
      <p class="text-sm text-gray-500">Cargando producto...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="text-red-300 mb-4">
        <svg
          class="w-12 h-12 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          ></path>
        </svg>
      </div>
      <h3 class="text-base font-medium text-gray-800 mb-2">
        {{ error }}
      </h3>
      <button
        @click="goBackToProduct"
        class="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
      >
        Volver al producto
      </button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- HEADER -->
      <div class="flex justify-between items-center gap-3 mb-6">
        <BackBtn
          :route-name="'InventoryProductDetails'"
          :route-params="{
            businessId: route.params.businessId,
            productId: route.params.productId,
          }"
          tooltip-text="Volver al producto"
        />

        <ProgressIndicator v-bind="progressProps" />

        <!-- <CloseBtn v-bind="closeBtnConfig" /> -->
      </div>

      <!-- Paso actual -->
      <component :is="CurrentStepComponent" />

      <!-- Botones de navegación -->
      <div
        class="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-xl border-t border-gray-100"
      >
        <NavigationBtnsRemoveStock :finalizar-registro="finalizarRegistro" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Package } from "@iconoir/vue";
import { useRemoveStockFlowStore } from "@/stores/Inventory/RemoveStockFlow.js";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import NavigationBtnsRemoveStock from "@/components/Inventory/StockLogs/NavigationBtnsRemoveStock.vue";
import ProgressIndicator from "@/components/ui/ProgressIndicator.vue";
import CloseBtn from "@/components/ui/CloseBtn.vue";
import BackBtn from "@/components/ui/BackBtn.vue";

import {
  getProgressIndicatorProps,
  FLOW_TYPES,
} from "@/composables/useProgressIndicator";

// Router
const route = useRoute();
const router = useRouter();

// Stores
const flow = useRemoveStockFlowStore();
const transactionStore = useTransactionStore();
const inventoryStore = useInventoryStore();

// State
const loading = ref(true);
const error = ref(null);
const productData = ref(null);

// Props para el ProgressIndicator
const progressProps = computed(() =>
  getProgressIndicatorProps(flow, FLOW_TYPES.REMOVE_STOCK)
);

// Componente actual
const CurrentStepComponent = computed(() => flow.currentStepConfig.component);

// Configuración para el CloseBtn
const closeBtnConfig = {
  flowStore: flow,
  additionalStores: {
    transactionStore,
  },
  flowType: FLOW_TYPES.REMOVE_STOCK,
};

// Cargar datos del producto
const loadProductData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const productId = route.params.productId;

    if (!productId) {
      error.value = "ID de producto no válido";
      return;
    }

    // Obtener datos del producto
    const product = await inventoryStore.getProductDetails(productId);

    if (!product) {
      error.value = "Producto no encontrado";
      return;
    }

    productData.value = product;

    // Establecer datos en el flow store
    flow.setProductData(productId, product);

    console.log("✅ Producto cargado para remoción:", product);
  } catch (err) {
    console.error("Error cargando producto:", err);
    error.value = "Error al cargar el producto";
  } finally {
    loading.value = false;
  }
};

// Finalizar el registro de salida
const finalizarRegistro = async () => {
  try {
    loading.value = true;

    const { productId, stockLogType, quantity, price, account } =
      flow.removeStockData;

    console.log("🔴 Finalizando registro de salida:", flow.removeStockData);

    // Si es venta, preparar transactionToAdd
    if (stockLogType === "sell") {
      // Preparar el item para la transacción
      const item = {
        uuid: productId,
        description: productData.value.description,
        quantity: quantity,
        price: price,
        cost: productData.value.cost || 0, // ✅ Incluir el cost del producto
        unit: productData.value.unit || "uni",
      };

      // Establecer type como income
      transactionStore.modifyTransactionToAddType("income");

      // Establecer la cuenta (cash o bank)
      transactionStore.modifyTransactionToAddAccount(account);

      // Agregar el item a la transacción
      transactionStore.transactionToAdd.value.items = [item];

      console.log(
        "💰 Transacción preparada:",
        transactionStore.transactionToAdd.value
      );

      // Crear la transacción (esto también creará el stock log)
      await transactionStore.addTransaction();

      console.log("✅ Venta registrada exitosamente");
    } else if (stockLogType === "waste") {
      // Si es merma/desperdicio, solo crear el stock log
      const stockLog = {
        uuid: productId,
        quantity: quantity,
        price: price, // Registrar el precio del producto (referencia)
        cost: productData.value.cost || 0, // ✅ Registrar el cost (para valorización)
      };

      await inventoryStore.addStockLogInInventory(stockLog, "waste");

      console.log("✅ Merma registrada exitosamente");
    }

    // Resetear el flujo
    flow.resetFlow();
    transactionStore.resetTransactionToAdd();

    // Volver a los detalles del producto con timestamp para forzar recarga
    await router.push({
      name: "InventoryProductDetails",
      params: {
        businessId: route.params.businessId,
        productId: route.params.productId,
      },
      query: {
        refresh: Date.now(), // Timestamp único para forzar recarga
      },
    });
  } catch (err) {
    console.error("❌ Error finalizando registro:", err);
    error.value = "Error al finalizar el registro";
  } finally {
    loading.value = false;
  }
};

// Volver al producto
const goBackToProduct = () => {
  router.push({
    name: "InventoryProductDetails",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

// Lifecycle
onMounted(() => {
  loadProductData();
});
</script>

<style scoped>
/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  margin: 2rem 0;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
