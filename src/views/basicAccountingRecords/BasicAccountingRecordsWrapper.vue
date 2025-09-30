<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { ensureBusinessId } from "../../composables/useBusinessUtils";

const flow = useTransactionFlowStore();
const transactionStore = useTransactionStore();
const router = useRouter();

const CurrentStepComponent = computed(() => flow.currentStepConfig.component);

const finalizarRegistro = async () => {
  await transactionStore.addTransaction();

  // Verifica si la operación fue exitosa (puedes definir un status si lo deseas)
  flow.resetFlow();
  // TODO: Resetear el store tambien del transactionStore
  transactionStore.resetTransactionToAdd();
  router.push({
    name: "BusinessDashboard",
    params: { businessId: ensureBusinessId() },
  });
  // FIXME: Redirigir al listado de transacciones
  // router.push({ name: "TransactionList" }); // Ruta que corresponda al listado
};
</script>

<template>
  <div class="bg-gray-50 py-6 px-4">
    <div
      class="max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-8 space-y-8"
    >
      <!-- Paso actual -->
      <component :is="CurrentStepComponent" />

      <!-- Navegación -->
      <div class="flex justify-between items-center mt-10 gap-4">
        <button
          @click="flow.prevStep"
          :disabled="flow.isFirstStep"
          class="flex-1 py-4 bg-gray-100 text-gray-700 text-lg font-bold rounded-2xl border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
        >
          Atrás
        </button>

        <button
          v-if="flow.isLastStep"
          @click="finalizarRegistro"
          class="flex-1 py-5 bg-green-600 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-green-500/30 hover:bg-green-700 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
        >
          Finalizar y Registrar
        </button>

        <button
          v-else
          @click="flow.nextStep"
          class="flex-1 py-5 bg-blue-600 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>
