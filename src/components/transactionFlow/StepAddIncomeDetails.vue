<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Agregar Productos
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Selecciona productos y define cantidades para tu transacción
      </p>
    </div>

    <!-- Buscador de productos -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-800">Buscar Producto</h2>
      <Suspense>
        <template #default>
          <SearchProductAsync />
        </template>
        <template #fallback>
          <div class="flex items-center justify-center py-6">
            <div class="text-center">
              <div
                class="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
              ></div>
              <p class="text-gray-500 text-sm">Cargando productos...</p>
            </div>
          </div>
        </template>
      </Suspense>
    </div>

    <!-- Producto seleccionado -->
    <div class="space-y-3">
      <label class="text-lg font-semibold text-gray-800"
        >Producto Seleccionado</label
      >
      <div class="relative">
        <!-- Badge de estado -->
        <div
          v-if="transactionStore.itemToAddInTransaction.value.oldOrNewProduct"
          class="absolute -top-2 -right-2 px-2 py-1 rounded-lg text-xs font-medium shadow-sm z-10"
          :class="{
            'bg-blue-50 text-blue-700 border border-blue-200':
              transactionStore.itemToAddInTransaction.value.oldOrNewProduct ===
              'old',
            'bg-green-50 text-green-700 border border-green-200':
              transactionStore.itemToAddInTransaction.value.oldOrNewProduct ===
              'new',
          }"
        >
          {{
            transactionStore.itemToAddInTransaction.value.oldOrNewProduct ===
            "old"
              ? "Existente"
              : "Nuevo"
          }}
        </div>

        <input
          v-model="transactionStore.itemToAddInTransaction.value.description"
          type="text"
          disabled
          placeholder="Selecciona un producto arriba"
          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-500"
        />

        <button
          v-if="transactionStore.itemToAddInTransaction.value.description"
          @click="transactionStore.resetItemToAddInTransaction()"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
        >
          <Xmark class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Cantidad, Unidad y Precio - Layout optimizado -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Cantidad -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Cantidad</label>
        <div class="relative">
          <input
            v-model="transactionStore.itemToAddInTransaction.value.quantity"
            type="number"
            placeholder="0"
            min="0"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-medium focus:border-blue-500 focus:outline-none transition-colors"
          />
          <div
            class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"
          ></div>
        </div>
      </div>

      <!-- Unidad -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Unidad</label>
        <select
          v-model="transactionStore.itemToAddInTransaction.value.unit"
          :disabled="
            transactionStore.itemToAddInTransaction.value.oldOrNewProduct ===
            'old'
          "
          class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50 disabled:bg-gray-50"
        >
          <option value="uni">Unidad</option>
          <option value="docena">Docena</option>
          <option value="kg">Kilogramo</option>
          <option value="g">Gramo</option>
          <option value="lt">Litro</option>
          <option value="ml">Mililitro</option>
          <option value="m">Metro</option>
          <option value="cm">Centímetro</option>
          <option value="pza">Pieza</option>
          <option value="caja">Caja</option>
          <option value="pack">Pack</option>
          <option value="rollo">Rollo</option>
          <option value="botella">Botella</option>
          <option value="bolsa">Bolsa</option>
        </select>
      </div>

      <!-- Precio -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Precio (S/)</label>
        <div class="relative">
          <input
            v-model="transactionStore.itemToAddInTransaction.value.price"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-medium focus:border-green-500 focus:outline-none transition-colors"
          />
          <div
            class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full"
          ></div>
        </div>
      </div>
    </div>

    <!-- Botón Agregar -->
    <button
      @click="transactionStore.addItemToTransaction()"
      :disabled="
        !transactionStore.itemToAddInTransaction.value.description ||
        !transactionStore.itemToAddInTransaction.value.quantity ||
        !transactionStore.itemToAddInTransaction.value.price ||
        !transactionStore.itemToAddInTransaction.value.unit
      "
      class="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
    >
      <KeyframePlus class="w-5 h-5" />
      Agregar Producto
    </button>

    <!-- Lista de productos agregados -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">Productos Agregados</h3>
        <div
          v-if="transactionStore.transactionToAdd.value.items.length > 0"
          class="text-sm text-gray-500"
        >
          {{ transactionStore.transactionToAdd.value.items.length }} producto{{
            transactionStore.transactionToAdd.value.items.length !== 1
              ? "s"
              : ""
          }}
        </div>
      </div>

      <!-- Lista de items -->
      <div
        v-if="transactionStore.transactionToAdd.value.items.length > 0"
        class="space-y-3"
      >
        <div
          v-for="item in transactionStore.transactionToAdd.value.items"
          :key="item.uuid"
          class="bg-gray-50 rounded-xl p-4 flex items-center gap-3"
        >
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-900 truncate mb-1">
              {{ item.description }}
            </div>
            <div class="text-sm text-gray-600">
              {{ item.quantity }} {{ item.unit || "uni" }} × S/ {{ item.price }}
            </div>
          </div>

          <div class="text-right">
            <div class="text-lg font-bold text-blue-600">
              S/ {{ (item.quantity * item.price).toFixed(2) }}
            </div>
          </div>

          <button
            @click="transactionStore.removeItemToTransaction(item.uuid)"
            class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Xmark class="w-4 h-4" />
          </button>
        </div>

        <!-- Total -->
        <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-gray-800">Total</span>
            <span class="text-xl font-bold text-blue-600">
              S/
              {{
                transactionStore.transactionToAdd.value.items
                  .reduce(
                    (total, item) => total + item.quantity * item.price,
                    0
                  )
                  .toFixed(2)
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-8">
        <div
          class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"
        >
          <KeyframePlus class="w-6 h-6 text-gray-400" />
        </div>
        <h3 class="font-semibold text-gray-600 mb-1">No hay productos</h3>
        <p class="text-sm text-gray-500">Los productos aparecerán aquí</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { KeyframePlus, Xmark } from "@iconoir/vue";
import SearchProductAsync from "@/components/basicAccountingRecordsBook/SearchProductAsync.vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const transactionStore = useTransactionStore();
</script>

<style scoped>
/* Prevent zoom on iOS inputs */
@media screen and (max-width: 480px) {
  input[type="number"],
  input[type="text"],
  select {
    font-size: 16px;
  }
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
