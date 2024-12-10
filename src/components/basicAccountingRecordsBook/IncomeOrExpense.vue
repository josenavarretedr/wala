<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-center">
      ¿Ingresó o salió dinero del negocio?
    </h1>
    <div
      class="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0 justify-center"
    >
      <button
        @click="emitSelectType('Ingreso')"
        :class="{
          'bg-blue-500 text-white': selectedType === 'Ingreso',
          'bg-white text-blue-500 border border-blue-500':
            selectedType !== 'Ingreso',
        }"
        class="flex flex-col items-center align-middle px-10 py-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
      >
        <GraphUp class="w-12 h-12" />

        <span class="text-2xl mt-4">Ingresó</span>
      </button>
      <button
        @click="emitSelectType('Egreso')"
        :class="{
          'bg-red-500 text-white': selectedType === 'Egreso',
          'bg-white text-red-500 border border-red-500':
            selectedType !== 'Egreso',
        }"
        class="flex flex-col items-center align-middle px-10 py-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
      >
        <DatabaseExport class="w-12 h-12" />

        <span class="text-2xl mt-4">Salió</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { PiggyBank, GraphUp, DatabaseExport } from "@iconoir/vue"; // Importar iconos de Iconoir

const selectedType = ref(null);
const emit = defineEmits(["update:selectedType"]);

const props = defineProps({
  selectedType: {
    type: String,
    default: null,
  },
});

watch(
  () => props.selectedType,
  (newVal) => {
    selectedType.value = newVal;
  },
  { immediate: true }
);

const emitSelectType = (type) => {
  selectedType.value = type;
  emit("update:selectedType", type);
};
</script>

<style scoped>
/* Puedes agregar estilos adicionales aquí si es necesario */
</style>
