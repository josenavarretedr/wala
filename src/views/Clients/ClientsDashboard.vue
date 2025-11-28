<template>
  <div class="clients-dashboard-wrapper">
    <Suspense>
      <template #default>
        <ListAllClients />
      </template>
      <template #fallback>
        <div class="loading-state">
          <div
            class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3 animate-spin"
          ></div>
          <p class="text-sm text-gray-500">Cargando clientes...</p>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import ListAllClients from "@/components/Clients/ListAllClients.vue";
</script>

<style scoped>
.clients-dashboard-wrapper {
  min-height: 100vh;
  background: #f9fafb;
  padding-bottom: 2rem;
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
