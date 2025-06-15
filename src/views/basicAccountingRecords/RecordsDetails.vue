<template>
  <div class="w-full max-w-lg mx-auto p-6 my-6 bg-white rounded-lg shadow-lg">
    <div class="flex items-end mt-3 mb-4">
      <router-link to="/dashboard" class="ml-auto text-x">
        <Xmark class="cursor-pointer text-red-500 w-10 h-10"></Xmark>
      </router-link>
    </div>

    <Suspense>
      <template #default>
        <SummaryOfRegister></SummaryOfRegister>
      </template>
      <template #fallback>
        <!-- Mensaje de carga centrado con estilo -->
        <div class="text-center text-lg font-semibold text-gray-600 mt-4">
          Cargando detalles...
        </div>
      </template>
    </Suspense>

    <!-- ACtions Buttons -->
    <div class="flex justify-between mt-6">
      <button
        @click="saludar"
        :disabled="isDisabled"
        class="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg disabled:opacity-50 flex items-center"
      >
        <Edit />
        <span class="ml-2">Edtar</span>
      </button>

      <button
        @click="deleteRegister()"
        :disabled="isDisabled"
        class="px-4 py-2 border border-red-500 text-red-500 rounded-lg flex items-center disabled:opacity-50 hover:bg-red-500 hover:text-white"
      >
        <Trash />
        <span class="ml-2">Eliminar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import SummaryOfRegister from "@/components/HistorialRecords/SummaryOfRegister.vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useCashClosureStore } from "@/stores/cashClosureStore";
import { Edit, Trash, Xmark } from "@iconoir/vue";
import { useRoute, useRouter } from "vue-router";

import { useCashEventStore } from "@/stores/cashEventStore";
const cashEventStore = useCashEventStore();
const dayClosure = cashEventStore.hasClosureForToday;

const isDisabled = computed(() => dayClosure.value);

const route = useRoute();
const router = useRouter();

const transactionStore = useTransactionStore();
const cashClosureStore = useCashClosureStore();

async function deleteRegister() {
  try {
    // console.log(route.params.registerId);
    await transactionStore.deleteOneTransactionByID(route.params.registerId);
    router.push("/");
  } catch (error) {
    console.error("Error adding transaction: ", error);
  }
}
</script>
