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
        type="number"
        placeholder="Cuánto costó"
        class="px-4 py-2 border rounded-lg shadow-lg text-lg"
      />
      <button
        @click="addExpense"
        class="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg disabled:opacity-50"
      >
        Guardar registro
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { v4 as uuidv4 } from "uuid";

const description = ref("");
const price = ref(null);
const expenseItem = ref([]);

const addExpense = () => {
  itemsList.value.push({
    uuid: uuidv4(),
    description: description.value,
    price: price.value,
  });
  description.value = "";
  price.value = null;
};

const emit = defineEmits(["update:expenseItem"]);

const saveItems = () => {
  emit("update:expenseItem", expenseItem.value);
};
</script>

<style scoped>
/* Estilos adicionales para mejorar la visualización */
.border-dashed {
  border-style: dashed;
}
</style>
