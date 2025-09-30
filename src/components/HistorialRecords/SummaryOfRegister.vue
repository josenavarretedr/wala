<template>
  <div>
    <!-- Total Amount -->
    <div
      class="text-white items-center px-4 py-6 rounded-lg shadow-sm text-center mb-4"
      :class="
        oneTransactionData.type === 'income' ? 'bg-blue-600' : 'bg-red-600'
      "
    >
      <span class="text-3xl font-bold">S/ {{ oneTransactionData.total }}</span>
    </div>

    <!-- Type and Account Info -->
    <div class="flex gap-3 mb-4">
      <div
        v-if="oneTransactionData.type === 'income'"
        class="flex flex-col bg-white text-blue-600 border border-blue-200 items-center px-4 py-3 rounded-lg shadow-sm flex-1"
      >
        <GraphUp class="w-5 h-5 mb-2" />
        <span class="text-sm font-medium">Venta</span>
      </div>

      <div
        v-else
        class="flex flex-col items-center bg-white text-red-600 border border-red-200 px-4 py-3 rounded-lg shadow-sm flex-1"
      >
        <DatabaseExport class="w-5 h-5 mb-2" />
        <span class="text-sm font-medium">Gasto</span>
      </div>

      <div
        v-if="oneTransactionData.account === 'cash'"
        class="flex flex-col bg-white text-green-600 border border-green-200 items-center px-4 py-3 rounded-lg shadow-sm flex-1"
      >
        <Coins class="w-5 h-5 mb-2" />
        <span class="text-sm font-medium">Efectivo</span>
      </div>

      <div
        v-else
        class="flex flex-col items-center bg-white text-purple-600 border border-purple-200 px-4 py-3 rounded-lg shadow-sm flex-1"
      >
        <SmartphoneDevice class="w-5 h-5 mb-2" />
        <span class="text-sm font-medium">Digital</span>
      </div>
    </div>

    <!-- Products List for Income -->
    <div
      v-if="oneTransactionData.type === 'income'"
      class="border-t border-gray-200 pt-4"
    >
      <div
        v-if="oneTransactionData.items && oneTransactionData.items.length > 0"
      >
        <h3 class="text-lg font-bold text-gray-900 mb-3">Productos:</h3>
        <div class="space-y-2">
          <div
            v-for="item in oneTransactionData.items"
            :key="item.uuid"
            class="py-2 border-b border-gray-100 last:border-b-0"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1 min-w-0 pr-3">
                <h4 class="font-semibold text-gray-900 text-sm truncate">
                  {{ item.description }}
                </h4>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ item.quantity }} {{ item.unit || "uni" }} × S/
                  {{ item.price.toFixed(2) }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold text-gray-900 text-sm">
                  S/ {{ (item.price * item.quantity).toFixed(2) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg text-center"
      >
        <p class="text-sm text-gray-600">
          No hay productos en esta venta
          <br />
          <span class="font-medium">{{ oneTransactionData.description }}</span>
        </p>
      </div>
    </div>

    <!-- Description for Expenses -->
    <div
      v-else
      class="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg text-center"
    >
      <p class="text-sm text-gray-700 font-medium">
        {{ oneTransactionData.description }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { GraphUp, DatabaseExport, Coins, SmartphoneDevice } from "@iconoir/vue";
import TableOfProductInRegister from "@/components/HistorialRecords/TableOfProductInRegister.vue";

import { useRoute } from "vue-router";

const route = useRoute();

import { useTransactionStore } from "@/stores/transaction/transactionStore";

const transactionStore = useTransactionStore();

const oneTransactionData = ref({});

async function getOneTransactionDataByIDCmp() {
  oneTransactionData.value = transactionStore.getOneTransactionDataByID(
    route.params.registerId
  )[0];
}

await getOneTransactionDataByIDCmp();
</script>

<style scoped>
/* Mobile-first optimizations */
@media (max-width: 375px) {
  .text-3xl {
    font-size: 1.75rem;
  }

  .flex {
    gap: 0.5rem;
  }

  .px-4 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
}

/* Typography improvements */
.font-bold {
  letter-spacing: -0.025em;
}

.font-semibold {
  letter-spacing: -0.01em;
}

/* Smooth line height for better readability */
.text-sm {
  line-height: 1.25;
}

/* Subtle card elevation */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>
