<template>
  <div
    class="product-details-wrapper space-y-4 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-20"
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
      <div class="text-gray-300 mb-4">
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
        @click="goBack"
        class="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
      >
        Volver al inventario
      </button>
    </div>

    <!-- Product Details -->
    <div v-else-if="product" class="product-content pb-32 sm:pb-24">
      <!-- HEADER -->
      <div class="flex items-center gap-3 mb-6">
        <BackBtn
          :route-name="'InventoryDashboard'"
          :route-params="{ businessId: route.params.businessId }"
          :use-back="!route.params.businessId"
          tooltip-text="Volver al inventario"
        />
      </div>

      <ProductHeader
        :key="`header-${product.uuid}-${product.stock}-${
          product.stockLog?.length || 0
        }`"
        :description="product.description"
        :stock="product.stock"
        :product-id="product.uuid"
        :product-type="product.type"
        :track-stock="product.trackStock"
        :unit="product.unit"
        :stock-log="product.stockLog"
        :classification="product.classification"
        class="mb-6"
      />

      <ProductEconomicInfo
        :price="product.price"
        :cost="product.cost"
        :unit="product.unit"
        :product-type="product.type"
        class="mb-4"
      />

      <!-- Stock Alert Card (Destacado) -->
      <ProductStockAlert
        v-if="product.trackStock"
        :stock="product.stock"
        :unit="product.unit"
      />
      <!-- <ProductoNoStock v-else /> -->
      <!-- Statistics Summary -->
      <ResumenMoves
        :stock-log="product.stockLog"
        :product-unit="product.unit || 'uni'"
        :track-stock="product?.trackStock ?? false"
        class="mb-4"
      />

      <!-- Stock History Section -->
      <ProductMoves
        :stock-log="product.stockLog"
        :product-unit="product.unit || 'uni'"
        :track-stock="product?.trackStock ?? false"
      />
    </div>
    <div
      class="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-xl border-t border-gray-100"
    >
      <NavigationBtnProductDetails
        :track-stock="product?.trackStock ?? false"
        :stock="product?.stock ?? 0"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onActivated, nextTick } from "vue";
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router";
import { useInventory } from "@/composables/useInventory";
import ProductHeader from "@/components/Inventory/ProductDetails/ProductHeader.vue";
import ProductMoves from "@/components/Inventory/ProductDetails/ProductMoves.vue";
import ProductEconomicInfo from "@/components/Inventory/ProductDetails/ProductEconomicInfo.vue";
import ProductStockAlert from "@/components/Inventory/ProductDetails/ProductStockAlert.vue";
import ProductoNoStock from "@/components/Inventory/ProductDetails/ProductoNoStock.vue";
import ResumenMoves from "@/components/Inventory/ProductDetails/ResumenMoves.vue";
import BackBtn from "@/components/ui/BackBtn.vue";

import NavigationBtnProductDetails from "@/components/Inventory/ProductDetails/NavigationBtnProductDetails.vue";

// Router
const route = useRoute();
const router = useRouter();

// Composables
const { getProductById } = useInventory();

// State
const product = ref(null);
const loading = ref(true);
const error = ref(null);

// Methods
const loadProduct = async () => {
  console.log("🔍 [ProductDetails] Iniciando loadProduct...");
  loading.value = true;
  error.value = null;

  try {
    const productId = route.params.productId;
    console.log("🔍 [ProductDetails] ProductId:", productId);

    if (!productId) {
      error.value = "ID de producto no válido";
      return;
    }

    const productData = await getProductById(productId);
    console.log("🔍 [ProductDetails] ProductData recibido:", productData);
    console.log(
      "🔍 [ProductDetails] StockLog count:",
      productData?.stockLog?.length || 0,
    );

    if (productData?.stockLog?.length > 0) {
      console.log(
        "🔍 [ProductDetails] Último stockLog:",
        productData.stockLog[productData.stockLog.length - 1],
      );
    }

    if (!productData) {
      error.value = "Producto no encontrado";
      return;
    }

    product.value = productData;
  } catch (err) {
    console.error("Error cargando producto:", err);
    error.value = "Error al cargar el producto";
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadProduct();
});

// Hook que se ejecuta cuando se navega a esta misma ruta (ej: volver de AddStock)
onBeforeRouteUpdate((to, from) => {
  // Si venimos de AddStock o RemoveStock, recargar
  if (
    from.name === "AddStock" ||
    from.name === "RemoveStock" ||
    from.name === "AddStockFlow" ||
    from.name === "RemoveStockFlow"
  ) {
    nextTick(() => {
      loadProduct();
    });
  }
});

// Watcher para recargar cuando cambia la ruta (por ejemplo, al volver de AddStock/RemoveStock)
watch(
  () => route.params.productId,
  (newProductId, oldProductId) => {
    if (newProductId && newProductId !== oldProductId) {
      loadProduct();
    }
  },
);

// Watcher para detectar el query param 'refresh' que indica una actualización forzada
watch(
  () => route.query.refresh,
  (newRefresh, oldRefresh) => {
    console.log("👀 [ProductDetails] Watch refresh triggered:", {
      newRefresh,
      oldRefresh,
    });
    if (newRefresh && newRefresh !== oldRefresh) {
      console.log("🔄 Refrescando producto por actualización de datos...");
      loadProduct();
    }
  },
);

// También recargar cuando se activa el componente (navegación hacia atrás)
onActivated(() => {
  // Solo recargar si ya existe un producto (evita doble carga inicial)
  if (product.value) {
    loadProduct();
  }
});
</script>

<style scoped>
/* Container */
.product-details-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 100vh;
}

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

/* Page Title */
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
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

/* Responsive */
@media (max-width: 768px) {
  .product-details-wrapper {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.25rem;
  }
}
</style>
