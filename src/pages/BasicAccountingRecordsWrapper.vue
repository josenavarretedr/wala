<!-- src/pages/BasicAccountingRecordsWrapper.vue -->
<template>
  <Suspense>
    <template #default>
      <AddRegister />
    </template>
    <template #fallback>
      <div class="text-center p-6">Cargando formulario de registro...</div>
    </template>
  </Suspense>
</template>

<script setup>
import AddRegister from "@/components/basicAccountingRecordsBook/AddRegister.vue";
</script>
