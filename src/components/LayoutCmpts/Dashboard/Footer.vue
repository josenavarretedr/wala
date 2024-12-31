<template>
  <!-- ACTIONS Buttons
  <div class="flex justify-between p-6">
    <div
      class="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg flex items-center text-xl"
    >
      <Safe />
      <span class="ml-2">CERRAR DIA</span>
    </div>

    <router-link
      :to="{ name: 'BasicAccountingRecordsBook' }"
      class="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center text-xl"
    >
      <DatabaseScriptPlus />
      <span class="ml-2">REGISTRAR</span>
    </router-link>
  </div> -->
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
</script>
