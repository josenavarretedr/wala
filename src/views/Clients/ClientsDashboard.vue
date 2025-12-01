<template>
  <div class="clients-dashboard-wrapper">
    <Suspense>
      <template #default>
        <ListAllClients />
      </template>
      <template #fallback>
        <div class="flex items-center justify-center py-20">
          <div class="text-center">
            <SpinnerIcon size="xl" class="text-blue-600 mx-auto mb-4" />
            <p class="text-sm text-gray-500 mt-3">Cargando clientes...</p>
          </div>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import ListAllClients from "@/components/Clients/ListAllClients.vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
</script>

<style scoped>
.clients-dashboard-wrapper {
  min-height: 100vh;
  background: #f9fafb;
  padding-bottom: 2rem;
}
</style>
