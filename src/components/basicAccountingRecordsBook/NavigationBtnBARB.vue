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
        :disabled="!isNextButtonEnabled"
        :class="[
          'w-full py-3 px-4 sm:py-4 sm:px-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm',
          flow.transactionLoading || !isNextButtonEnabled
            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 shadow-gray-400/15 cursor-not-allowed opacity-70'
            : 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-500/25 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/35 hover:scale-[1.02] active:scale-[0.98] opacity-100 cursor-pointer',
        ]"
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
        v-if="!isNextButtonEnabled && !flow.isLastStep"
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

      <!-- Tooltip para botón Finalizar deshabilitado -->
      <div
        v-if="!isNextButtonEnabled && flow.isLastStep"
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

  // Debug: remover después de confirmar que funciona
  console.log("=== DEBUG isNextButtonEnabled ===");
  console.log("currentStepLabel:", currentStepLabel);
  console.log("transactionData:", transactionData);

  let result = false;

  switch (currentStepLabel) {
    case "Tipo de transacción":
      // Verificar que se haya seleccionado un tipo
      result =
        transactionData.type !== null && transactionData.type !== undefined;
      break;

    case "Cuenta":
      // Verificar que se haya seleccionado una cuenta
      result =
        transactionData.account !== null &&
        transactionData.account !== undefined;
      break;

    case "Detalles ingreso":
    case "Detalles egreso":
    case "Detalles transferencia":
      // Para ingresos, verificar que haya items
      if (currentStepLabel === "Detalles ingreso") {
        result = transactionData.items && transactionData.items.length > 0;
      }
      // Para egresos, verificar según la categoría
      else if (currentStepLabel === "Detalles egreso") {
        // Si es materials, verificar que haya materialItems
        if (transactionData.category === "materials") {
          result =
            transactionData.materialItems &&
            transactionData.materialItems.length > 0 &&
            transactionData.amount > 0;
        }
        // Para labor/overhead, verificar descripción, monto y categoría
        else {
          result =
            transactionData.description &&
            transactionData.description.trim() !== "" &&
            transactionData.amount !== null &&
            transactionData.amount !== undefined &&
            transactionData.amount > 0 &&
            transactionData.category !== null &&
            transactionData.category !== undefined;
        }
      }
      // Para transferencias, verificar que haya cuenta origen, destino y monto
      else if (currentStepLabel === "Detalles transferencia") {
        result =
          transactionData.fromAccount &&
          transactionData.toAccount &&
          transactionData.amount !== null &&
          transactionData.amount !== undefined &&
          transactionData.amount > 0 &&
          transactionData.fromAccount !== transactionData.toAccount;
      } else {
        result = true;
      }
      break;

    case "Preview ingreso":
      // Para preview de ingresos, siempre permitir finalizar
      result = true;
      break;

    case "Preview egreso":
      // Para preview de egresos, siempre permitir finalizar
      result = true;
      break;

    case "Preview transferencia":
      // Para preview de transferencias, siempre permitir finalizar
      result = true;
      break;

    default:
      // Para otros pasos, habilitar por defecto
      result = true;
      break;
  }

  console.log("isNextButtonEnabled result:", result);
  console.log("flow.transactionLoading:", flow.transactionLoading);
  console.log("===========================");

  return result;
});

// Función para obtener el mensaje de validación apropiado
const getValidationMessage = () => {
  const currentStepConfig = flow.currentStepConfig;
  const currentStepLabel = currentStepConfig?.label;
  const transactionData = transactionStore.transactionToAdd.value;

  switch (currentStepLabel) {
    case "Tipo de transacción":
      return "Debes seleccionar un tipo de transacción";

    case "Cuenta":
      return "Debes seleccionar un método de pago";

    case "Detalles ingreso":
      return "Debes agregar al menos un producto";

    case "Detalles egreso":
      // Mensaje específico según la categoría
      if (transactionData.category === "materials") {
        return "Debes agregar al menos un material a la compra";
      }
      return "Completa la descripción, monto y categoría del gasto";

    case "Detalles transferencia":
      return "Completa cuenta origen, destino y monto de transferencia";

    case "Preview transferencia":
      return "Los datos de la transferencia están incompletos";

    default:
      return "Completa los campos requeridos";
  }
};

const finalizarRegistro = async () => {
  // Lógica para finalizar el registro de la transacción
  flow.transactionLoading = true;

  try {
    console.log("🔄 Iniciando finalización de registro...");
    console.log("📊 Transacción a guardar:", {
      type: transactionStore.transactionToAdd.value.type,
      clientId: transactionStore.transactionToAdd.value.clientId,
      clientName: transactionStore.transactionToAdd.value.clientName,
      balance: transactionStore.transactionToAdd.value.balance,
      total: transactionStore.transactionToAdd.value.total,
      paymentStatus: transactionStore.transactionToAdd.value.paymentStatus,
    });

    await transactionStore.addTransaction();

    console.log("✅ Transacción guardada exitosamente");

    let businessId = businessStore.getBusinessId;

    // Resetear el flujo y el store
    flow.resetFlow();
    transactionStore.resetTransactionToAdd();

    flow.transactionLoading = false;

    console.log("🏠 Redirigiendo al dashboard...");
    router.push({
      name: "BusinessDashboard",
      params: { businessId },
    });
  } catch (error) {
    console.error("❌ Error en finalizarRegistro:", error);
    flow.transactionLoading = false;
    throw error;
  }
};
</script>
