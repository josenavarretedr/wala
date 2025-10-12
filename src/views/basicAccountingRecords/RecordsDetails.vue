<template>
  <div
    class="space-y-4 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-20"
  >
    <!-- HEADER -->
    <div class="flex justify-end items-center gap-3 mb-3">
      <CloseBtn v-bind="closeBtnConfig" />
    </div>

    <!-- Content Card -->
    <div>
      <Suspense>
        <template #default>
          <component
            :is="dynamicComponent"
            v-if="transactionData"
            :transactionData="transactionData"
          />
          <div v-else class="text-center py-6">
            <p class="text-sm text-gray-500">No se encontró la transacción</p>
          </div>
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
        @click="deleteRegister()"
        :disabled="isDisabled"
        class="flex-1 py-4 bg-red-600 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-red-500/30 hover:bg-red-700 hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
      >
        <Trash class="w-5 h-5" />
        Eliminar
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useCashClosureStore } from "@/stores/cashClosureStore";
import { Edit, Trash, Xmark } from "@iconoir/vue";
import { useRoute, useRouter } from "vue-router";
import { useFlowClose } from "@/composables/useCloseBtn";

// Importación dinámica de componentes
import IncomeDetails from "@/components/HistorialRecords/Details/IncomeDetails.vue";
import ExpenseDetails from "@/components/HistorialRecords/Details/ExpenseDetails.vue";
import TransferDetails from "@/components/HistorialRecords/Details/TransferDetails.vue";
import AccountsBalanceDetails from "@/components/HistorialRecords/Details/AccountsBalanceDetails.vue";

import CloseBtn from "@/components/ui/CloseBtn.vue";

import { useCashEventStore } from "@/stores/cashEventStore";

const cashEventStore = useCashEventStore();

const hasClosureToday = computed(() => {
  return transactionStore.hasClosureToday();
});

const isDisabled = computed(() => {
  // Deshabilitar si es apertura o cierre
  if (transactionData.value) {
    if (transactionData.value.type === "opening") {
      return true;
    }
    if (transactionData.value.type === "closure") {
      return false;
    }
  }
  // Deshabilitar si ya hay cierre hoy (para otros tipos de transacción)
  return hasClosureToday.value;
});

const route = useRoute();
const { navigateToDashboard } = useFlowClose();

const transactionStore = useTransactionStore();
const transactionData = ref(null);
const dynamicComponent = ref(null);

// Mapeo de tipos de transacción a componentes
const componentMap = {
  income: IncomeDetails,
  expense: ExpenseDetails,
  transfer: TransferDetails,
  opening: AccountsBalanceDetails,
  closure: AccountsBalanceDetails,
};

// Configuración del botón cerrar
const closeBtnConfig = computed(() => ({
  // Agregar configuración si es necesaria
}));

onMounted(async () => {
  try {
    // Obtener los datos de la transacción por ID
    const transaccionAConsulta = transactionStore.getOneTransactionDataByID(
      route.params.registerId
    );

    if (transaccionAConsulta && transaccionAConsulta.length > 0) {
      transactionData.value = transaccionAConsulta[0]; // getOneTransactionDataByID retorna un array

      // Determinar el componente dinámico basado en el tipo de transacción
      if (
        transactionData.value.type &&
        componentMap[transactionData.value.type]
      ) {
        console.log(
          `Cargando componente para tipo: ${transactionData.value.type}`
        );
        dynamicComponent.value = componentMap[transactionData.value.type];
      } else {
        console.warn(
          `Tipo de transacción no reconocido: ${transactionData.value.type}`
        );
        // Componente por defecto si el tipo no es reconocido
        dynamicComponent.value = IncomeDetails;
      }
    } else {
      console.error(
        "No se encontró la transacción con ID:",
        route.params.registerId
      );
    }
  } catch (error) {
    console.error("Error al obtener la transacción:", error);
  }
});

async function deleteRegister() {
  try {
    await transactionStore.deleteOneTransactionByID(route.params.registerId);
    navigateToDashboard();
  } catch (error) {
    console.error("Error eliminando transacción: ", error);
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
