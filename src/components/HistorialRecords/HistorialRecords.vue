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
      <router-link
        :to="{ name: 'BasicAccountingRecordsBook' }"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center text-xl"
      >
        <DatabaseScriptPlus />
        <span class="ml-2">REGISTRAR</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import {
  Safe,
  DatabaseScriptPlus,
  GraphUp,
  Eye,
  EyeClosed,
  DatabaseExport,
  Cash,
} from "@iconoir/vue";
import ResumenDay from "@/components/HistorialRecords/ResumenDay.vue";

import ListRecordByDay from "@/components/HistorialRecords/ListRecordByDay.vue";
import ClashClosureBtn from "@/components/cashClosureApp/ClashClosureBtn.vue";

const showResume = ref(false);
</script>

<style scoped>
/* Estilos adicionales opcionales */
</style>
