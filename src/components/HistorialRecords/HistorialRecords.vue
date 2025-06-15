<template>
  <div class="w-full max-w-lg mx-auto p-6 my-6 bg-white rounded-lg shadow-lg">
    <!-- Botón toggle resumen -->
    <Suspense>
      <template #default>
        <ResumenDay
          :transactions="transactionStore.transactionsInStore.value"
        />
      </template>
      <template #fallback>
        <Loader />
      </template>
    </Suspense>

    <!-- ACTIONS Buttons -->
    <div class="flex justify-between mt-6">
      <Suspense>
        <template #default>
          <ClashClosureBtn></ClashClosureBtn>
        </template>
        <template #fallback>
          <Loader />
        </template>
      </Suspense>

      <Suspense>
        <template #default>
          <NewRecordBtn></NewRecordBtn>
        </template>
        <template #fallback>
          <Loader />
        </template>
      </Suspense>
    </div>

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
