<template>
  <div class="min-h-screen bg-gray-50 py-4 sm:py-6 sm:px-4 lg:py-8 lg:px-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6 sm:mb-8">
        <h1
          class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2"
        >
          Agregar Productos
        </h1>
        <p class="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
          Selecciona productos y define cantidades para tu transacción
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <!-- Left Column: Main Form -->
        <div class="order-1">
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
          >
            <!-- Search Product -->
            <div class="mb-6">
              <h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Buscar Producto
              </h2>
              <Suspense>
                <template #default>
                  <SearchProductAsync />
                </template>
                <template #fallback>
                  <div
                    class="flex items-center justify-center py-8 bg-gray-50 rounded-lg"
                  >
                    <div class="text-center">
                      <div
                        class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"
                      ></div>
                      <p class="text-gray-500 text-sm">Cargando productos...</p>
                    </div>
                  </div>
                </template>
              </Suspense>
            </div>

            <!-- Product Details Form -->
            <div class="space-y-6">
              <!-- Product Name -->
              <div>
                <label
                  class="block text-base sm:text-lg font-semibold text-gray-900 mb-3"
                >
                  Producto Seleccionado
                </label>
                <div class="relative">
                  <!-- Badge de estado -->
                  <div
                    v-if="
                      transactionStore.itemToAddInTransaction.value
                        .oldOrNewProduct
                    "
                    class="absolute -top-2 -right-2 px-2 py-1 rounded-lg text-xs font-medium shadow-sm z-10"
                    :class="{
                      'bg-blue-50 text-blue-700 border border-blue-200':
                        transactionStore.itemToAddInTransaction.value
                          .oldOrNewProduct === 'old',
                      'bg-green-50 text-green-700 border border-green-200':
                        transactionStore.itemToAddInTransaction.value
                          .oldOrNewProduct === 'new',
                    }"
                  >
                    {{
                      transactionStore.itemToAddInTransaction.value
                        .oldOrNewProduct === "old"
                        ? "Existente"
                        : "Nuevo"
                    }}
                  </div>
                  <input
                    v-model="
                      transactionStore.itemToAddInTransaction.value.description
                    "
                    type="text"
                    disabled
                    placeholder="Selecciona un producto arriba"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base text-gray-700 placeholder-gray-500"
                  />
                  <button
                    v-if="
                      transactionStore.itemToAddInTransaction.value.description
                    "
                    @click="transactionStore.resetItemToAddInTransaction()"
                    class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                  >
                    <Xmark class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Quantity and Unit -->
              <div>
                <label
                  class="block text-base sm:text-lg font-semibold text-gray-900 mb-3"
                >
                  Cantidad y Unidad
                </label>
                <div class="flex gap-2">
                  <!-- Q Icon -->
                  <div
                    class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0"
                  >
                    <span class="text-lg font-bold text-blue-600">Q</span>
                  </div>
                  <!-- Quantity Input -->
                  <input
                    v-model="
                      transactionStore.itemToAddInTransaction.value.quantity
                    "
                    type="number"
                    placeholder="0"
                    min="0"
                    class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base text-center text-gray-700 placeholder-gray-500 font-medium focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <!-- Unit Select -->
                  <select
                    v-model="transactionStore.itemToAddInTransaction.value.unit"
                    :disabled="
                      transactionStore.itemToAddInTransaction.value
                        .oldOrNewProduct === 'old'
                    "
                    class="w-20 sm:w-24 px-2 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
                  >
                    <option value="uni">uni</option>
                    <option value="docena">doc</option>
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
                    <option value="botella">bot</option>
                    <option value="bolsa">bolsa</option>
                  </select>
                </div>
              </div>

              <!-- Price -->
              <div>
                <label
                  class="block text-base sm:text-lg font-semibold text-gray-900 mb-3"
                >
                  Precio Unitario
                </label>
                <div class="flex gap-2">
                  <!-- S/ Icon -->
                  <div
                    class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center shrink-0"
                  >
                    <span class="text-lg font-bold text-green-600">S/</span>
                  </div>
                  <!-- Price Input -->
                  <input
                    v-model="
                      transactionStore.itemToAddInTransaction.value.price
                    "
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base text-center text-gray-700 placeholder-gray-500 font-medium focus:border-green-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <!-- Add Button -->
              <button
                @click="transactionStore.addItemToTransaction()"
                :disabled="
                  !transactionStore.itemToAddInTransaction.value.description ||
                  !transactionStore.itemToAddInTransaction.value.quantity ||
                  !transactionStore.itemToAddInTransaction.value.price ||
                  !transactionStore.itemToAddInTransaction.value.unit
                "
                class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:hover:bg-blue-600 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <KeyframePlus class="w-5 h-5" />
                Agregar Producto
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column: Items List -->
        <div class="order-2">
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 sticky top-4"
          >
            <div class="text-center mb-6">
              <h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Productos Agregados
              </h2>
              <div class="w-12 h-1 bg-blue-500 rounded-full mx-auto"></div>
            </div>

            <!-- Items List -->
            <div
              v-if="transactionStore.transactionToAdd.value.items.length > 0"
              class="space-y-3 max-h-80 overflow-y-auto"
            >
              <div
                v-for="item in transactionStore.transactionToAdd.value.items"
                :key="item.uuid"
                class="bg-gray-50 rounded-lg p-4 flex items-center justify-between gap-3"
              >
                <div class="flex-1 min-w-0">
                  <div
                    class="text-sm sm:text-base font-semibold text-gray-900 truncate mb-1"
                  >
                    {{ item.description }}
                  </div>
                  <div class="text-xs sm:text-sm text-gray-600">
                    {{ item.quantity }} {{ item.unit || "uni" }} × S/
                    {{ item.price }}
                  </div>
                </div>

                <div class="text-right mr-2">
                  <div class="text-base sm:text-lg font-bold text-blue-600">
                    S/ {{ (item.quantity * item.price).toFixed(2) }}
                  </div>
                </div>

                <button
                  @click="transactionStore.removeItemToTransaction(item.uuid)"
                  class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <Xmark class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-8">
              <div
                class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4"
              >
                <KeyframePlus class="w-6 h-6 text-gray-400" />
              </div>
              <h3 class="text-base font-semibold text-gray-600 mb-1">
                No hay productos
              </h3>
              <p class="text-sm text-gray-500">Los productos aparecerán aquí</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BinMinusIn, FastArrowRight, KeyframePlus, Xmark } from "@iconoir/vue";
import SearchProductAsync from "@/components/basicAccountingRecordsBook/SearchProductAsync.vue";

import { useTransactionStore } from "@/stores/transaction/transactionStore";

const transactionStore = useTransactionStore();
</script>

<style scoped>
/* Mobile-first input sizing */
input:focus,
select:focus {
  outline: none;
  border-color: currentColor;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

/* Enhanced button interactions */
button:not(:disabled):active {
  transform: translateY(1px) scale(0.99);
}

/* Prevent zoom on iOS inputs */
@media screen and (max-width: 480px) {
  input[type="number"],
  input[type="text"],
  select {
    font-size: 16px;
  }
}

/* Sticky positioning optimization */
@media (min-width: 1024px) {
  .sticky {
    position: sticky;
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

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Enhanced focus states for accessibility */
input:focus-visible,
select:focus-visible,
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
