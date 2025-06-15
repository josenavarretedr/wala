<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const flow = useTransactionFlowStore();
const transactionStore = useTransactionStore();
const router = useRouter();

const CurrentStepComponent = computed(() => flow.currentStepConfig.component);

const finalizarRegistro = async () => {
  await transactionStore.addTransaction();

  // Verifica si la operación fue exitosa (puedes definir un status si lo deseas)
  flow.resetFlow();
  // FIXME: Redirigir al listado de transacciones
  // router.push({ name: "TransactionList" }); // Ruta que corresponda al listado
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6 space-y-6">
      <!-- Paso actual -->
      <component :is="CurrentStepComponent" />

      <!-- Navegación -->
      <div class="flex justify-between items-center mt-10">
        <button
          @click="flow.prevStep"
          :disabled="flow.isFirstStep"
          class="bg-gray-300 text-gray-700 px-5 py-2 rounded disabled:opacity-50"
        >
          Atrás
        </button>

        <button
          v-if="flow.isLastStep"
          @click="finalizarRegistro"
          class="bg-green-600 text-white font-semibold px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Finalizar y Registrar
        </button>

        <button
          v-else
          @click="flow.nextStep"
          class="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>
