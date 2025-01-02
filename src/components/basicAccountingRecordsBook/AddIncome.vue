<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-center">Agregar Productos</h1>
    <div class="flex flex-col space-y-6">
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
          @click="transactionStore.resetItemToAddInTransaction()"
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
          @click="transactionStore.addItemToTransaction()"
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
          @click="handleSaveBtn()"
          :disabled="transactionStore.transactionToAdd.value.items.length === 0"
          class="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg disabled:opacity-50"
        >
          <FastArrowRight class="w-12 h-12"></FastArrowRight>
        </button>
      </div>
    </div>

    <div
      v-if="transactionStore.transactionToAdd.value.items.length > 0"
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
          <tr
            v-for="item in transactionStore.transactionToAdd.value.items"
            :key="item.uuid"
            class="border-b"
          >
            <td class="py-2 text-center">
              <BinMinusIn
                @click="transactionStore.removeItemToTransaction(item.uuid)"
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
import { BinMinusIn, FastArrowRight, KeyframePlus, Xmark } from "@iconoir/vue"; // Importar iconos de Iconoir
import SearchProductAsync from "./SearchProductAsync.vue"; // Importar componente asíncrono

import { useTransactionStore } from "@/stores/transactionStore";
import { useInventoryStore } from "@/stores/InventoryStore";
const transactionStore = useTransactionStore();
const inventoryStore = useInventoryStore();

const handleSaveBtn = () => {
  inventoryStore.addItemToInventoryFromArryOfItemsNewOrOld(
    transactionStore.transactionToAdd.value.items
  );
  transactionStore.nextStepToAddTransaction();
};
</script>

<style scoped>
/* Estilos adicionales para mejorar la visualización */
.border-dashed {
  border-style: dashed;
}
</style>
