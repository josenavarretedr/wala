<template>
  <!-- Botones de acción alineados -->
  <!-- <div
    class="flex justify-center items-center gap-4 max-w-5xl mx-auto bg-white border-t border-gray-200 py-6 mt-10"
  >
    <Suspense>
      <template #default>
        <ClashClosureBtn />
      </template>
      <template #fallback>
        <div class="text-gray-400">Cargando arqueo...</div>
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <NewRecordBtn />
      </template>
      <template #fallback>
        <div class="text-gray-400">Cargando registro...</div>
      </template>
    </Suspense>
  </div> -->
</template>

<script setup>
import ClashClosureBtn from "@/components/cashClosureApp/ClashClosureBtn.vue";
import NewRecordBtn from "@/components/basicAccountingRecordsBook/NewRecordBtn.vue";
</script>
