<template>
  <h1>Hola desde ADD INCOMEs</h1>
  <button
    @click="newDataGen"
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
  >
    <i class="flaticon-income mr-2"></i>
    Agregar Ingreso
  </button>

  <pre>
    {{ newData }}
  </pre>
</template>

<script setup>
import { ref, watch } from "vue";
import { newDataFn } from "@/composables/newData";
import { dataFromJS } from "@/assets/registroJS.js";

const newData = ref(null);

const getUniqueDetails = (data) => {
  const detailsSet = new Set();
  data.forEach((item) => {
    detailsSet.add(item.details);
  });
  return Array.from(detailsSet);
};

const uniqueDetails = ref([]);

watch(newData, (newVal) => {
  if (newVal) {
    uniqueDetails.value = getUniqueDetails(newVal);
    console.log(uniqueDetails.value);
  }
});

const newDataGen = () => {
  newData.value = newDataFn(dataFromJS);
};
</script>
