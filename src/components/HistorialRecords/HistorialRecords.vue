<template>
  <div class="w-full max-w-lg mx-auto p-6 my-6 bg-white rounded-lg shadow-lg">
    <!-- Botón toggle resumen -->
    <div
      @click="showResume = !showResume"
      class="flex items-center justify-center gap-3 hover:bg-blue-200 text-blue-700 text-xl font-medium px-6 py-4 rounded-xl shadow-md cursor-pointer transition-all duration-200"
    >
      <component :is="showResume ? EyeClosed : Eye" class="w-6 h-6" />
      <span>{{ showResume ? "Ocultar resumen" : "Mostrar resumen" }}</span>
    </div>

    <!-- Resumen del día -->
    <ResumenDay v-if="showResume" class="mt-6" />

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

    <!-- Historial -->

    <Suspense>
      <template #default>
        <ListRecordByDay> </ListRecordByDay>
      </template>
      <template #fallback>
        <div>Cargando ...</div>
      </template>
    </Suspense>
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
