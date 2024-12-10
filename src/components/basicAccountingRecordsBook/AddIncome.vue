<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-center">Agregar Productos</h1>
    <div class="flex flex-col space-y-6">
      <input
        v-model="product"
        type="text"
        placeholder="Nombre del producto"
        class="px-4 py-2 border rounded-lg shadow-lg text-lg"
      />
      <input
        v-model="quantity"
        type="number"
        placeholder="Cantidad"
        class="px-4 py-2 border rounded-lg shadow-lg text-lg"
      />
      <input
        v-model="price"
        type="number"
        placeholder="Precio"
        class="px-4 py-2 border rounded-lg shadow-lg text-lg"
      />
      <div class="flex justify-around">
        <button
          @click="addItem"
          :disabled="!product || !quantity || !price"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg disabled:opacity-50"
        >
          <KeyframePlus class="w-12 h-12"></KeyframePlus>
        </button>
        <button
          @click="saveItems"
          :disabled="itemsList.length === 0"
          class="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg disabled:opacity-50"
        >
          <FastArrowRight class="w-12 h-12"></FastArrowRight>
        </button>
      </div>
    </div>
    <div
      v-if="itemsList.length > 0"
      class="mt-6 border-t-4 border-dashed border-gray-300 pt-4"
    >
      <h2 class="text-2xl font-semibold mb-4">Items agregados:</h2>
      <table class="min-w-full text-left bg-white">
        <thead>
          <tr>
            <th class="py-2">Acción</th>
            <th class="py-2">Producto</th>
            <th class="py-2">Cantidad</th>
            <th class="py-2">Precio</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in itemsList" :key="item.uuid" class="border-b">
            <td class="py-2 text-center">
              <BinMinusIn
                @click="removeItem(item.uuid)"
                class="cursor-pointer text-red-500 shadow-lg"
              ></BinMinusIn>
            </td>
            <td class="py-2 text-left">{{ item.product }}</td>
            <td class="py-2 text-left">{{ item.quantity }}</td>
            <td class="py-2 text-left">S/{{ item.price }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { BinMinusIn, FastArrowRight, KeyframePlus } from "@iconoir/vue"; // Importar iconos de Iconoir

import { v4 as uuidv4 } from "uuid";

const product = ref("");
const quantity = ref(null);
const price = ref(null);
const itemsList = ref([]);

const addItem = () => {
  itemsList.value.push({
    uuid: uuidv4(),
    product: product.value,
    quantity: quantity.value,
    price: price.value,
  });
  product.value = "";
  quantity.value = null;
  price.value = null;
};

const emit = defineEmits(["update:itemsList"]);

const saveItems = () => {
  emit("update:itemsList", itemsList.value);
};

const props = defineProps({
  initialItemsList: {
    type: Array,
    default: () => [],
  },
});

watch(
  () => props.initialItemsList,
  (newVal) => {
    itemsList.value = newVal;
  },
  { immediate: true }
);

const removeItem = (uuid) => {
  itemsList.value = itemsList.value.filter((item) => item.uuid !== uuid);
};
</script>

<style scoped>
/* Estilos adicionales para mejorar la visualización */
.border-dashed {
  border-style: dashed;
}
</style>
