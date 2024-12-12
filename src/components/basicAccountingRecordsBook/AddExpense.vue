<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-center">
      ¿Qué necesitó el negocio?
    </h1>
    <div class="flex flex-col space-y-6">
      <input
        v-model="description"
        type="text"
        placeholder="Describe el gasto"
        class="px-4 py-2 border rounded-lg shadow-lg text-lg"
      />
      <input
        v-model="price"
        @keyup.enter="addExpense"
        type="number"
        placeholder="Cuánto costó"
        class="px-4 py-2 border rounded-lg shadow-lg text-lg"
      />
      <button
        @click="addExpense"
        class="px-4 py-2 bg-orange-500 text-white rounded-lg shadow-lg disabled:opacity-50 flex justify-center items-center"
      >
        <FastArrowRight class="w-12 h-12"></FastArrowRight>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import { FastArrowRight } from "@iconoir/vue"; // Importar iconos de Iconoir

const description = ref("");
const price = ref(0);
const expenseItem = ref([]);

const addExpense = () => {
  expenseItem.value.push({
    uuid: uuidv4(),
    description: description.value,
    price: price.value,
  });
  description.value = "";
  price.value = null;
  emit("update:itemsList", expenseItem.value);
};

const emit = defineEmits(["update:itemsList"]);

const props = defineProps({
  initialExpense: {
    type: Array,
    default: () => [],
  },
});

onMounted(() => {
  // if (props.initialExpense) {
  //   description.value = props.initialExpense.description || "";
  //   price.value = props.initialExpense.price || 0;
  // }
  console.log(props.initialExpense[0]);
});
</script>

<style scoped>
/* Estilos adicionales para mejorar la visualización */
.border-dashed {
  border-style: dashed;
}
</style>
