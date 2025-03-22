<template>
  <div class="w-full max-w-lg mx-auto p-6 my-6 bg-white rounded-lg shadow-lg">
    <div
      class="px-4 py-2 border rounded-lg flex items-center text-xl cursor-pointer"
      @click="showResume = !showResume"
    >
      <component :is="showResume ? EyeClosed : Eye"></component>
      <span class="ml-2">{{
        showResume ? "Ocultar resumen" : "Mostrar resumen"
      }}</span>
    </div>
    <ResumenDay v-if="showResume" />

    <!-- Historial -->

    <Suspense>
      <template #default>
        <ListRecordByDay> </ListRecordByDay>
      </template>
      <template #fallback>
        <div>Cargando ...</div>
      </template>
    </Suspense>

    <!-- ACTIONS Buttons -->
    <div class="flex justify-between mt-6">
      <Suspense>
        <template #default>
          <ClashClosureBtn></ClashClosureBtn>
        </template>
        <template #fallback>
          <div>Cargando ...</div>
        </template>
      </Suspense>

      <Suspense>
        <template #default>
          <NewRecordBtn></NewRecordBtn>
        </template>
        <template #fallback>
          <div>Cargando ...</div>
        </template>
      </Suspense>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Eye, EyeClosed } from "@iconoir/vue";
import ResumenDay from "@/components/HistorialRecords/ResumenDay.vue";

import ListRecordByDay from "@/components/HistorialRecords/ListRecordByDay.vue";
import ClashClosureBtn from "@/components/cashClosureApp/ClashClosureBtn.vue";
import NewRecordBtn from "@/components/basicAccountingRecordsBook/NewRecordBtn.vue";

const showResume = ref(false);
</script>

<style scoped>
/* Estilos adicionales opcionales */
</style>
