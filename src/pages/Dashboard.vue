<template>
  <Suspense>
    <template #default>
      <HistorialRecords />
    </template>

    <template #fallback>
      <div class="flex items-center justify-center h-screen">
        <div
          class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"
        ></div>
      </div>
    </template>
  </Suspense>
</template>

<script setup>
import "@flaticon/flaticon-uicons/css/all/all.css";
import HistorialRecords from "@/components/HistorialRecords/HistorialRecords.vue";
import AddRegister from "@/components/basicAccountingRecordsBook/AddRegister.vue";
import router from "../router";
</script>
