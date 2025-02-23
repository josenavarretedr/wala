<template>
  <div>
    <!-- Si no está deshabilitado, renderiza el router-link -->
    <template v-if="!isDisabled">
      <router-link
        :to="{ name: 'BasicAccountingRecordsBook' }"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center text-xl"
      >
        <DatabaseScriptPlus />
        <span class="ml-2">REGISTRAR</span>
      </router-link>
    </template>

    <!-- Si está deshabilitado, renderiza un span con los mismos estilos pero con opacidad y sin navegación -->
    <template v-else>
      <span
        class="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center text-xl opacity-50 cursor-not-allowed"
      >
        <DatabaseScriptPlus />
        <span class="ml-2">REGISTRAR</span>
      </span>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { DatabaseScriptPlus } from "@iconoir/vue";

import { useCashClosureStore } from "@/stores/cashClosureStore";
const cashClosureStore = useCashClosureStore();

const isDisabled = computed(
  () => cashClosureStore.cashClosureForToday.value.length > 0
);
</script>
