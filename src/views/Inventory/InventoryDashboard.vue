<template>
  <div class="inventory-dashboard-wrapper">
    <Suspense>
      <template #default>
        <ListAllProducts />
      </template>
      <template #fallback>
        <div class="loading-state">
          <div
            class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3 animate-spin"
          ></div>
          <p class="text-sm text-gray-500">Cargando productos...</p>
        </div>
      </template>
    </Suspense>
    <div
      class="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-xl border-t border-gray-100"
    >
      <NavigationBtnInventory />
    </div>
  </div>
</template>

<script setup>
import ListAllProducts from "@/components/Inventory/ListAllProducts.vue";
import NavigationBtnInventory from "@/components/Inventory/NavigationBtnInventory.vue";
</script>

<style scoped>
.inventory-dashboard-wrapper {
  min-height: 100vh;
  background: #f9fafb;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin: 2rem auto;
  max-width: 600px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
