<template>
  <div class="w-full max-w-2xl mx-auto p-6">
    <h1 class="text-4xl lg:text-3xl font-bold mb-8 text-center text-purple-700">
      Agregar Productos
    </h1>

    <div class="flex flex-col gap-6">
      <Suspense>
        <template #default>
          <SearchProductAsync />
        </template>
        <template #fallback>
          <div
            class="text-center text-xl lg:text-lg font-semibold text-gray-600"
          >
            Cargando resultados...
          </div>
        </template>
      </Suspense>

      <div class="relative">
        <input
          v-model="transactionStore.itemToAddInTransaction.value.description"
          type="text"
          disabled
          placeholder="Nombre del producto"
          class="w-full px-6 py-4 border border-gray-300 rounded-2xl shadow text-2xl lg:text-xl text-gray-700"
        />
        <Xmark
          v-if="transactionStore.itemToAddInTransaction.value.description"
          @click="transactionStore.resetItemToAddInTransaction()"
          class="absolute top-3 right-3 text-red-500 w-6 h-6 cursor-pointer"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xl lg:text-lg font-semibold text-gray-600"
          >Cantidad</label
        >
        <div class="flex items-center gap-2">
          <span class="text-2xl lg:text-xl font-bold text-gray-800">Q:</span>
          <input
            v-model="transactionStore.itemToAddInTransaction.value.quantity"
            type="number"
            placeholder="Cantidad"
            class="px-6 py-3 border rounded-xl shadow text-2xl lg:text-xl flex-1 text-center"
          />
          <select
            v-model="transactionStore.itemToAddInTransaction.value.unit"
            class="px-3 py-3 border rounded-xl shadow text-lg lg:text-base font-semibold bg-white min-w-20"
          >
            <option value="uni">uni</option>
            <option value="docena">docena</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="lt">lt</option>
            <option value="ml">ml</option>
            <option value="m">m</option>
            <option value="cm">cm</option>
            <option value="pza">pza</option>
            <option value="caja">caja</option>
            <option value="pack">pack</option>
            <option value="rollo">rollo</option>
            <option value="botella">botella</option>
            <option value="bolsa">bolsa</option>
          </select>
        </div>
      </div>
      ????

      <div class="flex flex-col gap-2">
        <label class="text-xl lg:text-lg font-semibold text-gray-600"
          >Precios</label
        >
        <div class="flex items-center gap-2">
          <span class="text-2xl lg:text-xl font-bold text-gray-800">S/</span>
          <input
            v-model="transactionStore.itemToAddInTransaction.value.price"
            type="number"
            placeholder="Precio"
            class="px-6 py-3 border rounded-xl shadow text-2xl lg:text-xl w-2/3 text-center"
          />
        </div>
      </div>

      <div class="flex justify-around mt-4">
        <button
          @click="transactionStore.addItemToTransaction()"
          :disabled="
            !transactionStore.itemToAddInTransaction.value.description ||
            !transactionStore.itemToAddInTransaction.value.quantity ||
            !transactionStore.itemToAddInTransaction.value.price
          "
          class="p-4 bg-blue-600 text-white rounded-full shadow-lg disabled:opacity-40"
        >
          <KeyframePlus class="w-10 h-10" />
        </button>
        <button
          @click="handleSaveBtn()"
          :disabled="transactionStore.transactionToAdd.value.items.length === 0"
          class="p-4 bg-green-600 text-white rounded-full shadow-lg disabled:opacity-40"
        >
          <FastArrowRight class="w-10 h-10" />
        </button>
      </div>
    </div>

    <div
      v-if="transactionStore.transactionToAdd.value.items.length > 0"
      class="mt-10 border-t-4 border-dashed border-gray-300 pt-6"
    >
      <h2 class="text-3xl lg:text-2xl font-bold text-gray-800 mb-6 text-center">
        Items agregados
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="item in transactionStore.transactionToAdd.value.items"
          :key="item.uuid"
          class="relative bg-white rounded-xl border shadow-sm px-4 py-3 flex items-center justify-between gap-4 hover:shadow-md"
        >
          <div class="flex-1">
            <div class="text-xl lg:text-lg font-bold text-gray-800 truncate">
              {{ item.description }}
            </div>
            <div class="text-sm text-gray-500">
              {{ item.quantity }} {{ item.unit || "uni" }} × S/ {{ item.price }}
            </div>
          </div>

          <div class="text-green-600 text-xl lg:text-lg font-bold">
            S/ {{ (item.quantity * item.price).toFixed(2) }}
          </div>

          <button
            @click="transactionStore.removeItemToTransaction(item.uuid)"
            class="text-gray-400 hover:text-red-500"
          >
            <Xmark class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BinMinusIn, FastArrowRight, KeyframePlus, Xmark } from "@iconoir/vue";
import SearchProductAsync from "./SearchProductAsync.vue";

import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useInventoryStore } from "@/stores/InventoryStore";
const transactionStore = useTransactionStore();
const inventoryStore = useInventoryStore();

import { useTransactionFlow } from "@/store/transaction/useTransactionFlowStore";

const { nextStep } = useTransactionFlow();

const handleSaveBtn = () => {
  inventoryStore.addItemToInventoryFromArryOfItemsNewOrOld(
    transactionStore.transactionToAdd.value.items
  );
  nextStep();
};
</script>

<style scoped>
.border-dashed {
  border-style: dashed;
}
</style>
