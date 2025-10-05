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
    <div class="relative group flex-1 max-w-xs sm:max-w-sm" id="btn-next">
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
        :disabled="!isNextButtonEnabled"
        :class="[
          'w-full py-3 px-4 sm:py-4 sm:px-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm',
          isNextButtonEnabled
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
            : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 shadow-gray-400/15 cursor-not-allowed',
        ]"
      >
        <span class="font-bold tracking-wide text-sm sm:text-base"
          >Siguiente</span
        >
        <ArrowRight class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
      </button>

      <!-- Tooltip de ayuda cuando el botón está deshabilitado -->
      <div
        v-if="!isNextButtonEnabled"
        class="absolute z-20 w-56 px-3 py-2 text-xs text-white bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
      >
        <div class="text-center">
          <strong>{{ getValidationMessage() }}</strong>
        </div>
        <!-- Flecha del tooltip -->
        <div
          class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-600"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight, Check } from "@iconoir/vue";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useRouter } from "vue-router";
import { useBusinessStore } from "@/stores/businessStore";
import { computed } from "vue";

const flow = useTransactionFlowStore();
const businessStore = useBusinessStore();
const transactionStore = useTransactionStore();
const router = useRouter();

// Función para validar si el botón "Siguiente" debe estar habilitado
const isNextButtonEnabled = computed(() => {
  const currentStepConfig = flow.currentStepConfig;
  const currentStepLabel = currentStepConfig?.label;
  const transactionData = transactionStore.transactionToAdd.value;

  switch (currentStepLabel) {
    case "Tipo de transacción":
      // Verificar que se haya seleccionado un tipo
      return (
        transactionData.type !== null && transactionData.type !== undefined
      );

    case "Cuenta":
      // Verificar que se haya seleccionado una cuenta
      return (
        transactionData.account !== null &&
        transactionData.account !== undefined
      );

    case "Detalles ingreso":
    case "Detalles egreso":
    case "Detalles transferencia":
      // Para ingresos, verificar que haya items
      if (currentStepLabel === "Detalles ingreso") {
        return transactionData.items && transactionData.items.length > 0;
      }
      // Para egresos, verificar que haya descripción, monto y categoría
      if (currentStepLabel === "Detalles egreso") {
        return (
          transactionData.description &&
          transactionData.description.trim() !== "" &&
          transactionData.amount !== null &&
          transactionData.amount !== undefined &&
          transactionData.amount > 0 &&
          transactionData.category !== null &&
          transactionData.category !== undefined
        );
      }
      // Para transferencias, verificar que haya cuentas origen, destino y monto
      if (currentStepLabel === "Detalles transferencia") {
        return (
          transactionData.fromAccount !== null &&
          transactionData.fromAccount !== undefined &&
          transactionData.toAccount !== null &&
          transactionData.toAccount !== undefined &&
          transactionData.fromAccount !== transactionData.toAccount &&
          transactionData.amount !== null &&
          transactionData.amount !== undefined &&
          transactionData.amount > 0
        );
      }
      return true;

    default:
      // Para otros pasos, habilitar por defecto
      return true;
  }
});

// Función para obtener el mensaje de validación apropiado
const getValidationMessage = () => {
  const currentStepConfig = flow.currentStepConfig;
  const currentStepLabel = currentStepConfig?.label;

  switch (currentStepLabel) {
    case "Tipo de transacción":
      return "Debes seleccionar un tipo de transacción";

    case "Cuenta":
      return "Debes seleccionar un método de pago";

    case "Detalles ingreso":
      return "Debes agregar al menos un producto";

    case "Detalles egreso":
      return "Completa la descripción, monto y categoría del gasto";

    case "Detalles transferencia":
      return "Selecciona cuentas origen, destino y monto de transferencia";

    default:
      return "Completa los campos requeridos";
  }
};

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
