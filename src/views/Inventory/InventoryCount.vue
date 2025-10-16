<template>
  <div class="inventory-count-view min-h-screen bg-gray-50 pb-24">
    <div class="max-w-4xl mx-auto px-4 py-6">
      <!-- Componente del paso actual -->
      <StepInventoryCountQuantity />
    </div>

    <!-- Botón de navegación fijo en la parte inferior -->
    <NavigationBtnInventoryCount />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import StepInventoryCountQuantity from "@/components/Inventory/StockLogs/StepInventoryCountQuantity.vue";
import NavigationBtnInventoryCount from "@/components/Inventory/StockLogs/NavigationBtnInventoryCount.vue";
import { useInventoryCountFlowStore } from "@/stores/Inventory/InventoryCountFlow";

const route = useRoute();
const flow = useInventoryCountFlowStore();

// Inicialización
onMounted(() => {
  console.log("📋 Vista InventoryCount montada");
  console.log("📦 Product ID:", route.params.productId);
});

// Limpieza al desmontar
onBeforeUnmount(() => {
  // Opcional: puedes decidir si resetear el flujo aquí o no
  // flow.resetFlow();
  console.log("📋 Vista InventoryCount desmontada");
});
</script>

<style scoped>
.inventory-count-view {
  min-height: calc(100vh - 64px); /* Ajusta según tu header */
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .inventory-count-view {
    padding-bottom: 6rem;
  }
}
</style>
