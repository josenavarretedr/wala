<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-center">Agregar Productos</h1>
    <div class="flex flex-col space-y-6">
      *********** DEL COMPONENTE:
      <pre>
        {{ itemsList }}
      </pre>
      <!-- Componente de Suspense con estilo de cargando -->
      <Suspense>
        <template #default>
          <SearchProductAsync />
        </template>
        <template #fallback>
          <!-- Mensaje de carga centrado con estilo -->
          <div class="text-center text-lg font-semibold text-gray-600 mt-4">
            Cargando resultados...
          </div>
        </template>
      </Suspense>
      <div class="flex items-center justify-between">
        <input
          v-model="transactionStore.itemToAddInTransaction.value.description"
          type="text"
          disabled
          placeholder="Nombre del producto"
          class="px-4 py-2 border rounded-lg shadow-lg text-lg w-full"
          :class="{
            'w-full':
              transactionStore.itemToAddInTransaction.value.description !== '',
          }"
        />
        <Xmark
          v-if="transactionStore.itemToAddInTransaction.value.description"
          class="cursor-pointer text-red-500 w-5"
          @click="resetItem()"
        ></Xmark>
      </div>

      <div>
        <span class="px-3 text-lg font-semibold">Q:</span>
        <input
          v-model="transactionStore.itemToAddInTransaction.value.quantity"
          type="number"
          placeholder="Cantidad"
          class="px-4 py-2 border rounded-lg shadow-lg text-lg w-1/3"
        />
        <span class="pl-3 font-semibold">uni</span>
      </div>

      <div>
        <span class="px-3 text-lg font-semibold">S/</span>
        <input
          v-model="transactionStore.itemToAddInTransaction.value.price"
          type="number"
          placeholder="Precio"
          class="px-4 py-2 border rounded-lg shadow-lg text-lg w-1/3"
        />
      </div>

      <div class="flex justify-around">
        <button
          @click="addItem"
          :disabled="
            !transactionStore.itemToAddInTransaction.value.description ||
            !transactionStore.itemToAddInTransaction.value.quantity ||
            !transactionStore.itemToAddInTransaction.value.price
          "
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
            <td class="py-2 text-left">{{ item.description }}</td>
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
import { BinMinusIn, FastArrowRight, KeyframePlus, Xmark } from "@iconoir/vue"; // Importar iconos de Iconoir
import SearchProductAsync from "./SearchProductAsync.vue"; // Importar componente asíncrono

import { useTransactionStore } from "@/stores/transactionStore";
const transactionStore = useTransactionStore();

import { v4 as uuidv4 } from "uuid";

import appFirebase from "@/firebaseInit";

import { getFirestore, doc, setDoc } from "firebase/firestore";
const db = getFirestore(appFirebase);

const description = ref("");
const quantity = ref(null);
const price = ref(null);
const oldOrNewProduct = ref(null);
const itemsList = ref([]);
const uuidToAdd = ref(null);

const addItem = () => {
  let productUuid = null;
  if (oldOrNewProduct.value === "new") {
    productUuid = uuidv4();
  }

  itemsList.value.push({
    uuid: productUuid ? productUuid : uuidToAdd.value,
    description: description.value,
    quantity: quantity.value,
    price: price.value,
    oldOrNewProduct: oldOrNewProduct.value,
  });
  description.value = "";
  quantity.value = null;
  price.value = null;
  oldOrNewProduct.value = null;
};

const emit = defineEmits(["update:itemsList"]);

async function saveItems() {
  for (const item of itemsList.value) {
    if (item.oldOrNewProduct === "new") {
      const itemRef = doc(db, "products", item.uuid);
      await setDoc(itemRef, {
        description: item.description,
        price: item.price,
        cost: null,
        stockLog: [],
      });
    }
  }

  emit("update:itemsList", itemsList.value);
}

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

const resetItem = () => {
  description.value = "";
  quantity.value = null;
  price.value = null;
};
</script>

<style scoped>
/* Estilos adicionales para mejorar la visualización */
.border-dashed {
  border-style: dashed;
}
</style>
