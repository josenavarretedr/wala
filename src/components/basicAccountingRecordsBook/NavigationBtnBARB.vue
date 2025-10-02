<template>
  <!-- Navegación -->
  <div
    class="flex flex-row justify-center items-stretch gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto bg-white p-2"
  >
    <!-- Botón Atrás -->
    <div class="relative group flex-1 max-w-xs sm:max-w-sm">
      <button
        @click="flow.prevStep"
        :disabled="flow.isFirstStep"
        :class="[
          'w-full py-3 px-4 sm:py-4 sm:px-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm',
          flow.isFirstStep
            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 shadow-gray-400/15 cursor-not-allowed'
            : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/25 hover:from-gray-600 hover:to-gray-700 hover:shadow-gray-500/35',
        ]"
      >
        <ArrowLeft class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <span class="font-bold tracking-wide text-sm sm:text-base">Atrás</span>
      </button>
    </div>

    <!-- Botón Siguiente/Finalizar -->
    <div class="relative group flex-1 max-w-xs sm:max-w-sm">
      <button
        v-if="flow.isLastStep"
        @click="finalizarRegistro"
        class="w-full py-3 px-4 sm:py-4 sm:px-6 bg-gradient-to-r from-green-600 to-green-700 text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/35 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm"
      >
        <Check class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <span class="font-bold tracking-wide text-sm sm:text-base"
          >Finalizar</span
        >
      </button>

      <button
        v-else
        @click="flow.nextStep"
        class="w-full py-3 px-4 sm:py-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/35 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm"
      >
        <span class="font-bold tracking-wide text-sm sm:text-base"
          >Siguiente</span
        >
        <ArrowRight class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight, Check } from "@iconoir/vue";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useRouter } from "vue-router";
import { useBusinessStore } from "@/stores/businessStore";

const flow = useTransactionFlowStore();
const businessStore = useBusinessStore();
const transactionStore = useTransactionStore();
const router = useRouter();

const finalizarRegistro = async () => {
  await transactionStore.addTransaction();

  let businessId = businessStore.getBusinessId;
  // Verifica si la operación fue exitosa (puedes definir un status si lo deseas)
  flow.resetFlow();
  // TODO: Resetear el store tambien del transactionStore
  transactionStore.resetTransactionToAdd();
  router.push({
    name: "BusinessDashboard",
    params: { businessId },
  });
};
</script>
