<template>
  <div class="py-4 px-4">
    <div class="max-w-sm mx-auto">
      <!-- Header -->
      <div class="text-center mb-4">
        <h1 class="text-3xl font-bold text-gray-900 mb-1">Pre-Boleta</h1>
        <p class="text-xs text-gray-500">{{ formatDate(new Date()) }}</p>
      </div>

      <!-- Receipt -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <!-- Total Amount (como SummaryOfRegister) -->
        <div
          v-if="transactionStore.transactionToAdd.value.items.length > 0"
          class="text-white items-center px-4 py-6 rounded-lg shadow-sm text-center mb-4 bg-green-600"
        >
          <span class="text-3xl font-bold">S/ {{ getTotal().toFixed(2) }}</span>
        </div>

        <!-- Type and Account Info (como SummaryOfRegister) -->
        <div
          v-if="transactionStore.transactionToAdd.value.items.length > 0"
          class="flex gap-3 mb-4"
        >
          <div
            class="flex flex-col bg-white text-green-600 border border-green-200 items-center px-4 py-3 rounded-lg shadow-sm flex-1"
          >
            <Page class="w-5 h-5 mb-2" />
            <span class="text-sm font-medium">Venta</span>
          </div>

          <div
            class="flex flex-col items-center bg-white text-blue-600 border border-blue-200 px-4 py-3 rounded-lg shadow-sm flex-1"
          >
            <Page class="w-5 h-5 mb-2" />
            <span class="text-sm font-medium">Efectivo</span>
          </div>
        </div>

        <!-- Items List -->
        <div
          v-if="transactionStore.transactionToAdd.value.items.length > 0"
          class="border-t border-gray-200 pt-4"
        >
          <h3 class="text-lg font-bold text-gray-900 mb-3">Productos:</h3>
          <div class="space-y-2 mb-4">
            <div
              v-for="item in transactionStore.transactionToAdd.value.items"
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
                    S/ {{ (item.quantity * item.price).toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-6">
          <Page class="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-500">No hay productos</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Page } from "@iconoir/vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const transactionStore = useTransactionStore();

const getTotal = () => {
  return transactionStore.transactionToAdd.value.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const goBackToEdit = () => {
  transactionStore.prevStepToAddTransaction();
};

const confirmSale = () => {
  transactionStore.addTransaction();
  transactionStore.nextStepToAddTransaction();
};
</script>

<style scoped>
/* Mobile-first optimizations */
@media (max-width: 375px) {
  .max-w-sm {
    max-width: 100%;
    margin: 0 auto;
  }

  .py-4 {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

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

.bg-white {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>
