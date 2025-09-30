<template>
  <div class="bg-gray-50 py-4 px-4">
    <div class="max-w-sm mx-auto">
      <!-- Header -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-1">
          <h1 class="text-3xl font-bold text-gray-900">
            Detalles del Registro
          </h1>
          <router-link
            :to="
              currentBusinessId
                ? {
                    name: 'BusinessDashboard',
                    params: { businessId: currentBusinessId },
                  }
                : undefined
            "
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Xmark class="w-6 h-6" />
          </router-link>
        </div>
      </div>

      <!-- Content Card -->
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
      >
        <Suspense>
          <template #default>
            <SummaryOfRegister />
          </template>
          <template #fallback>
            <div class="text-center py-6">
              <div
                class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2 animate-spin"
              ></div>
              <p class="text-sm text-gray-500">Cargando detalles...</p>
            </div>
          </template>
        </Suspense>
      </div>

      <!-- Actions -->
      <div class="flex gap-4 mt-6">
        <button
          @click="saludar"
          :disabled="isDisabled"
          class="flex-1 py-4 bg-gray-100 text-gray-700 text-lg font-bold rounded-2xl border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
        >
          <Edit class="w-5 h-5" />
          Editar
        </button>

        <button
          @click="deleteRegister()"
          :disabled="isDisabled"
          class="flex-1 py-4 bg-red-600 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-red-500/30 hover:bg-red-700 hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <Trash class="w-5 h-5" />
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import SummaryOfRegister from "@/components/HistorialRecords/SummaryOfRegister.vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useCashClosureStore } from "@/stores/cashClosureStore";
import { Edit, Trash, Xmark } from "@iconoir/vue";
import { useRoute, useRouter } from "vue-router";

import { useCashEventStore } from "@/stores/cashEventStore";
const cashEventStore = useCashEventStore();
const dayClosure = cashEventStore.hasClosureForToday;

const isDisabled = computed(() => dayClosure.value);

const route = useRoute();
const router = useRouter();

const transactionStore = useTransactionStore();
const cashClosureStore = useCashClosureStore();

const currentBusinessId = computed(() => route.params.businessId || null);

async function deleteRegister() {
  try {
    // console.log(route.params.registerId);
    await transactionStore.deleteOneTransactionByID(route.params.registerId);
    router.push("/");
  } catch (error) {
    console.error("Error adding transaction: ", error);
  }
}
function saludar() {
  console.log("Saludar function called");
}
</script>

<style scoped>
.transition-colors {
  transition: all 0.2s ease;
}

button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

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
}

/* Enhanced shadow effects */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Subtle card elevation */
.bg-white {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* Button press effect */
button:active {
  transform: translateY(1px);
}

/* Typography improvements */
.font-bold {
  letter-spacing: -0.025em;
}

.font-semibold {
  letter-spacing: -0.01em;
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
</style>
