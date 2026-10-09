<template>
  <div class="w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
    <!-- ACTIONS Buttons -->
    <div class="flex justify-between mt-6"></div>

    <!-- Historial -->

    <Suspense>
      <template #default>
        <ListRecordByDay> </ListRecordByDay>
      </template>
      <template #fallback> <Loader /> </template>
    </Suspense>
  </div>
</template>

<script setup>
import ResumenDay from "@/components/HistorialRecords/ResumenDay.vue";

import Loader from "@/components/ui/Loader.vue";

import ListRecordByDay from "@/components/HistorialRecords/ListRecordByDay.vue";
import ClashClosureBtn from "@/components/cashClosureApp/ClashClosureBtn.vue";
import NewRecordBtn from "@/components/basicAccountingRecordsBook/NewRecordBtn.vue";

import { useTransactionStore } from "@/stores/transaction/transactionStore";
const transactionStore = useTransactionStore();
</script>

<style scoped>
/* Estilos adicionales opcionales */
</style>
