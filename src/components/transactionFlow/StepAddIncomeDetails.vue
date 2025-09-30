<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1
          class="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
        >
          Agregar Productos
        </h1>
        <p class="text-lg text-gray-600 max-w-md mx-auto">
          Selecciona productos y define cantidades para tu transacción
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Left Column: Main Form -->
        <div class="lg:col-span-1">
          <div
            class="bg-white rounded-3xl shadow-2xl shadow-gray-300/50 border border-gray-100 p-8 lg:p-10"
          >
            <!-- Search Product -->
            <div class="mb-10">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">
                Buscar Producto
              </h2>
              <Suspense>
                <template #default>
                  <SearchProductAsync />
                </template>
                <template #fallback>
                  <div
                    class="flex items-center justify-center py-12 bg-gray-50 rounded-2xl"
                  >
                    <div class="text-center">
                      <div
                        class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                      ></div>
                      <p class="text-gray-500 text-lg">Cargando productos...</p>
                    </div>
                  </div>
                </template>
              </Suspense>
            </div>

            <!-- Product Details Form -->
            <div class="space-y-8">
              <!-- Product Name -->
              <div>
                <label class="block text-xl font-bold text-gray-900 mb-4">
                  Producto Seleccionado
                </label>
                <div class="relative">
                  <input
                    v-model="
                      transactionStore.itemToAddInTransaction.value.description
                    "
                    type="text"
                    disabled
                    placeholder="Selecciona un producto arriba"
                    class="w-full px-6 py-5 bg-gray-100 border-2 border-gray-200 rounded-2xl text-xl text-gray-700 placeholder-gray-500 font-medium"
                  />
                  <button
                    v-if="
                      transactionStore.itemToAddInTransaction.value.description
                    "
                    @click="transactionStore.resetItemToAddInTransaction()"
                    class="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                  >
                    <Xmark class="w-6 h-6" />
                  </button>
                </div>
              </div>

              <!-- Quantity and Unit -->
              <div>
                <label class="block text-xl font-bold text-gray-900 mb-4">
                  Cantidad y Unidad
                </label>
                <div class="grid grid-cols-12 gap-4">
                  <div
                    class="col-span-2 flex items-center justify-center bg-blue-100 rounded-2xl py-5"
                  >
                    <span class="text-2xl font-bold text-blue-600">Q</span>
                  </div>
                  <div class="col-span-6">
                    <input
                      v-model="
                        transactionStore.itemToAddInTransaction.value.quantity
                      "
                      type="number"
                      placeholder="0"
                      class="w-full px-6 py-5 bg-gray-100 border-2 border-gray-200 rounded-2xl text-2xl text-center text-gray-700 placeholder-gray-500 font-bold focus:border-blue-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                  <div class="col-span-4">
                    <select
                      v-model="
                        transactionStore.itemToAddInTransaction.value.unit
                      "
                      class="w-full px-4 py-5 bg-gray-100 border-2 border-gray-200 rounded-2xl text-lg font-bold text-gray-700 focus:border-blue-500 focus:bg-white transition-all duration-200"
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
              </div>

              <!-- Price -->
              <div>
                <label class="block text-xl font-bold text-gray-900 mb-4">
                  Precio Unitario
                </label>
                <div class="grid grid-cols-12 gap-4">
                  <div
                    class="col-span-3 flex items-center justify-center bg-green-100 rounded-2xl py-5"
                  >
                    <span class="text-2xl font-bold text-green-600">S/</span>
                  </div>
                  <div class="col-span-9">
                    <input
                      v-model="
                        transactionStore.itemToAddInTransaction.value.price
                      "
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      class="w-full px-6 py-5 bg-gray-100 border-2 border-gray-200 rounded-2xl text-2xl text-center text-gray-700 placeholder-gray-500 font-bold focus:border-green-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <!-- Add Button -->
              <div class="pt-4">
                <button
                  @click="transactionStore.addItemToTransaction()"
                  :disabled="
                    !transactionStore.itemToAddInTransaction.value
                      .description ||
                    !transactionStore.itemToAddInTransaction.value.quantity ||
                    !transactionStore.itemToAddInTransaction.value.price ||
                    !transactionStore.itemToAddInTransaction.value.unit
                  "
                  class="w-full py-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <KeyframePlus class="w-8 h-8" />
                  Agregar Producto
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Items List -->
        <div class="lg:col-span-1">
          <div
            v-if="transactionStore.transactionToAdd.value.items.length > 0"
            class="bg-white rounded-3xl shadow-2xl shadow-gray-300/50 border border-gray-100 p-8 lg:p-10 h-fit sticky top-8"
          >
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                Productos Agregados
              </h2>
              <div
                class="w-20 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto"
              ></div>
            </div>

            <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
              <div
                v-for="item in transactionStore.transactionToAdd.value.items"
                :key="item.uuid"
                class="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-6 flex items-center justify-between gap-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border border-gray-100"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-lg font-bold text-gray-900 truncate mb-2">
                    {{ item.description }}
                  </div>
                  <div class="text-base text-gray-600 font-medium">
                    {{ item.quantity }} {{ item.unit || "uni" }} × S/
                    {{ item.price }}
                  </div>
                </div>

                <div class="text-right mr-2">
                  <div class="text-2xl font-bold text-green-600">
                    S/ {{ (item.quantity * item.price).toFixed(2) }}
                  </div>
                </div>

                <button
                  @click="transactionStore.removeItemToTransaction(item.uuid)"
                  class="p-3 text-gray-500 hover:text-red-500 hover:bg-red-100 rounded-2xl transition-all duration-200 flex-shrink-0"
                >
                  <Xmark class="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="bg-white rounded-3xl shadow-2xl shadow-gray-300/50 border border-gray-100 p-12 text-center"
          >
            <div
              class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <KeyframePlus class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-xl font-bold text-gray-600 mb-2">
              No hay productos
            </h3>
            <p class="text-gray-500">
              Los productos que agregues aparecerán aquí
            </p>
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
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";

const transactionStore = useTransactionStore();
</script>

<style scoped>
/* Enhanced focus states */
input:focus,
select:focus {
  outline: none;
  transform: translateY(-1px);
}

/* Gradient text support */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #7c3aed);
}

/* Prevent zoom on iOS inputs */
@media screen and (max-width: 480px) {
  input[type="number"],
  input[type="text"],
  select {
    font-size: 16px;
  }

  /* Mobile-first adjustments */
  .grid-cols-12 {
    display: flex;
    gap: 1rem;
  }

  .col-span-2 {
    flex: 0 0 60px;
  }

  .col-span-3 {
    flex: 0 0 80px;
  }

  .col-span-4 {
    flex: 1;
  }

  .col-span-6 {
    flex: 2;
  }

  .col-span-9 {
    flex: 1;
  }
}

/* Enhanced animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

/* Item animation */
.space-y-4 > div {
  animation: fadeInUp 0.4s ease-out;
}

/* Button interactions */
button:not(:disabled):active {
  transform: translateY(2px) scale(0.98);
}

/* Sticky positioning for larger screens */
@media (min-width: 1024px) {
  .sticky {
    position: sticky;
  }
}

/* Loading spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Enhanced hover effects for desktop */
@media (min-width: 768px) {
  .hover-scale:hover {
    transform: scale(1.02);
  }

  .hover-shadow:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
}
</style>
