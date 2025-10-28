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
        :disabled="!isNextButtonEnabled2"
        :class="[
          'w-full py-3 px-4 sm:py-4 sm:px-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm',
          flow.transactionLoading || !isNextButtonEnabled2
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
        :disabled="!isNextButtonEnabled2"
        :class="[
          'w-full py-3 px-4 sm:py-4 sm:px-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm',
          isNextButtonEnabled2
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
        v-if="!isNextButtonEnabled2 && !flow.isLastStep"
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
import { useAccountsBalanceFlowStore } from "@/stores/AccountsBalanceApp/accountsBalanceFlowStore";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useRouter } from "vue-router";
import { useBusinessStore } from "@/stores/businessStore";
import { computed, ref } from "vue";
import { generateUUID } from "@/utils/generateUUID";
import { useDailySummary } from "@/composables/useDailySummary";
import { useTransaccion } from "@/composables/useTransaction";

const { getTodayDailySummary } = useDailySummary();
const { getTransactionByID } = useTransaccion();

const flow = useAccountsBalanceFlowStore();
const accountsBalanceStore = useAccountsBalanceStore();
const businessStore = useBusinessStore();
const transactionStore = useTransactionStore();
const router = useRouter();

// Función para validar si el botón "Siguiente" debe estar habilitado
const isNextButtonEnabled = computed(() => {
  const currentStepConfig = flow.currentStepConfig;
  const currentStepLabel = currentStepConfig?.label;
  const stepsData = flow.stepsData;

  console.log("=== DEBUG isNextButtonEnabled ===");
  console.log("currentStepLabel:", currentStepLabel);

  let result = false;

  switch (currentStepLabel) {
    case "Referencia anterior":
      // Siempre permitir avanzar desde la referencia
      result = true;
      break;

    case "Cash Balance":
      // Verificar que se haya seleccionado una opción de efectivo
      result = stepsData.selectedCashOption !== null;
      break;

    case "Bank Balance":
      // Verificar que se haya seleccionado una opción de banco
      result = stepsData.selectedBankOption !== null;
      break;

    default:
      result = true;
      break;
  }

  console.log("isNextButtonEnabled result:", result);
  console.log("===========================");

  return result;
});

const isNextButtonEnabled2 = true;

const dailySummary = ref(null);
// Obtener la apertura del día
const openingData = ref(null);

// Función para obtener el mensaje de validación apropiado
const getValidationMessage = () => {
  const currentStepConfig = flow.currentStepConfig;
  const currentStepLabel = currentStepConfig?.label;

  switch (currentStepLabel) {
    case "Cash Balance":
      return "Debes seleccionar una opción para el efectivo";

    case "Bank Balance":
      return "Debes seleccionar una opción para el banco/digital";

    default:
      return "Completa los campos requeridos";
  }
};

// Determinar si estamos en modo opening o close
const isOpeningMode = computed(() => {
  return dailySummary.value?.hasOpening ? false : true;
});

const finalizarRegistro = async () => {
  try {
    flow.accountBalanceLoading = true;
    console.log("🔄 Iniciando finalización de registro...");

    // Asegurarse de tener el dailySummary actualizado
    dailySummary.value = await getTodayDailySummary();

    // 🚀 NOTA: Los valores usados aquí (expectedCashBalance, expectedFinalBank, etc.)
    // ya provienen del accountsBalanceStore híbrido que prioriza dailySummary.
    // No es necesario calcular nada manualmente, el store ya lo hace.

    const stepsData = flow.stepsData;

    // Determinar los valores finales para cash
    const realCashBalance =
      stepsData.selectedCashOption === "expected"
        ? stepsData.expectedCashBalance
        : stepsData.realCashBalance;

    // Determinar los valores finales para bank
    const realBankBalance =
      stepsData.selectedBankOption === "expected"
        ? stepsData.expectedBankBalance
        : stepsData.realBankBalance;

    if (isOpeningMode.value) {
      // ========== MODO APERTURA ==========
      console.log("📂 Modo: APERTURA");

      // Construir transacción de apertura
      const openingTransaction = accountsBalanceStore.buildOpeningTransaction({
        expectedCashBalance: stepsData.expectedCashBalance,
        expectedBankBalance: stepsData.expectedBankBalance,
        realCashBalance,
        realBankBalance,
        lastClosureUuid: stepsData.lastClosureData?.uuid || null,
        generateUUID,
      });

      // ✅ DEBUG DETALLADO: Validar estructura ANTES de guardar
      console.log("=== 🔍 APERTURA CONSTRUIDA (ANTES DE GUARDAR) ===");
      console.log("📋 Campos Básicos:");
      console.log("   - UUID:", openingTransaction.uuid);
      console.log("   - ID:", openingTransaction.id);
      console.log("   - Type:", openingTransaction.type);
      console.log("   - Description:", openingTransaction.description);

      console.log("🎯 Origen:");
      console.log("   - Source:", openingTransaction.source);
      console.log("   - CopilotMode:", openingTransaction.copilotMode);

      console.log("💰 Balances:");
      console.log(
        "   - Expected Cash:",
        openingTransaction.expectedCashBalance
      );
      console.log(
        "   - Expected Bank:",
        openingTransaction.expectedBankBalance
      );
      console.log("   - Real Cash:", openingTransaction.realCashBalance);
      console.log("   - Real Bank:", openingTransaction.realBankBalance);
      console.log("   - Total Balance:", openingTransaction.totalBalance);

      console.log("📊 Diferencias:");
      console.log("   - Cash Diff:", openingTransaction.cashDifference);
      console.log("   - Bank Diff:", openingTransaction.bankDifference);

      console.log("🔄 Transferencias:");
      console.log("   - Total:", openingTransaction.totalTransferencias);
      console.log("   - Cash:", openingTransaction.transferencias?.cash);
      console.log("   - Bank:", openingTransaction.transferencias?.bank);

      console.log("⚙️ Ajustes:");
      console.log("   - Apertura:", openingTransaction.ajustesApertura);
      console.log("   - Cierre:", openingTransaction.ajustesCierre);

      console.log("📈 Operacionales:");
      console.log("   - Resultado:", openingTransaction.resultadoOperacional);
      console.log("   - Flujo Cash:", openingTransaction.flujoNetoCash);
      console.log("   - Flujo Bank:", openingTransaction.flujoNetoBank);

      console.log("🏷️ Metadata:");
      console.log("   - Metadata:", openingTransaction.metadata);

      console.log("🔑 Referencias:");
      console.log(
        "   - Last Closure Ref:",
        openingTransaction.lastClosureReference
      );
      console.log("   - Opening Ref:", openingTransaction.openingReference);

      // Validar campos críticos
      const requiredFields = [
        "uuid",
        "id",
        "type",
        "source",
        "copilotMode",
        "expectedCashBalance",
        "expectedBankBalance",
        "realCashBalance",
        "realBankBalance",
        "transferencias",
        "ajustesApertura",
        "ajustesCierre",
        "totalIngresos",
        "totalEgresos",
        "metadata",
      ];

      const missingFields = requiredFields.filter(
        (field) => !(field in openingTransaction)
      );

      if (missingFields.length > 0) {
        console.error("❌ CAMPOS FALTANTES EN APERTURA:", missingFields);
        throw new Error(
          `Opening transaction is missing fields: ${missingFields.join(", ")}`
        );
      }

      console.log("✅ Validación de estructura completada");
      console.log(
        "📝 Total de campos:",
        Object.keys(openingTransaction).length
      );
      console.log("📄 ESTRUCTURA COMPLETA (JSON):");
      console.log(JSON.stringify(openingTransaction, null, 2));
      console.log("===========================================");

      // Guardar transacción de apertura
      transactionStore.transactionToAdd.value = openingTransaction;

      console.log("💾 Guardando en Firestore...");
      await transactionStore.addTransaction();

      console.log("✅ Transacción de apertura guardada en Firebase");
      console.log("🔍 VERIFICAR EN FIRESTORE CONSOLE:");
      console.log(
        `   Path: businesses/${businessStore.getBusinessId}/transactions/${openingTransaction.uuid}`
      );
      console.log(
        "Campos a verificar: id, source, copilotMode, transferencias, ajustesApertura, metadata"
      );

      // Calcular diferencias
      const cashDiff = accountsBalanceStore.calculateDifference(
        realCashBalance,
        stepsData.expectedCashBalance
      );
      const bankDiff = accountsBalanceStore.calculateDifference(
        realBankBalance,
        stepsData.expectedBankBalance
      );

      // Construir ajustes si hay diferencias
      const adjustments = accountsBalanceStore.buildOpeningAdjustments({
        cashDifference: cashDiff,
        bankDifference: bankDiff,
        generateUUID,
      });

      console.log(`📝 Ajustes de apertura construidos: ${adjustments.length}`);

      // Guardar cada ajuste
      for (const adjustment of adjustments) {
        transactionStore.transactionToAdd.value = adjustment;
        await transactionStore.addTransaction();
        console.log(
          `✅ Ajuste guardado: ${adjustment.description} - S/${adjustment.amount}`
        );
      }

      console.log("✅ Apertura completada exitosamente");
    } else {
      // ========== MODO CIERRE ==========
      console.log("🔒 Modo: CIERRE");

      openingData.value = await getTransactionByID(
        dailySummary.value.openingData.id
      );
      if (!openingData.value) {
        throw new Error("No se encontró la apertura del día");
      }

      console.log("📂 Apertura del día encontrada:", {
        uuid: openingData.value.uuid,
        realCashBalance: openingData.value.realCashBalance,
        realBankBalance: openingData.value.realBankBalance,
      });

      // Construir transacción de cierre
      const closureTransaction = accountsBalanceStore.buildClosureTransaction({
        openingUuid: openingData.value.uuid,
        realCashBalance,
        realBankBalance,
        generateUUID,
      });

      // ✅ DEBUG DETALLADO: Validar estructura ANTES de guardar
      console.log("=== 🔍 CIERRE CONSTRUIDO (ANTES DE GUARDAR) ===");
      console.log("📋 Campos Básicos:");
      console.log("   - UUID:", closureTransaction.uuid);
      console.log("   - ID:", closureTransaction.id);
      console.log("   - Type:", closureTransaction.type);
      console.log("   - Description:", closureTransaction.description);

      console.log("🎯 Origen:");
      console.log("   - Source:", closureTransaction.source);
      console.log("   - CopilotMode:", closureTransaction.copilotMode);

      console.log("💰 Balances:");
      console.log("   - Initial Cash:", closureTransaction.initialCashBalance);
      console.log("   - Initial Bank:", closureTransaction.initialBankBalance);
      console.log(
        "   - Expected Cash:",
        closureTransaction.expectedCashBalance
      );
      console.log(
        "   - Expected Bank:",
        closureTransaction.expectedBankBalance
      );
      console.log("   - Real Cash:", closureTransaction.realCashBalance);
      console.log("   - Real Bank:", closureTransaction.realBankBalance);

      console.log("📊 Diferencias:");
      console.log("   - Cash Diff:", closureTransaction.cashDifference);
      console.log("   - Bank Diff:", closureTransaction.bankDifference);

      console.log("📈 Totales del Día:");
      console.log("   - Total Ingresos:", closureTransaction.totalIngresos);
      console.log("   - Total Egresos:", closureTransaction.totalEgresos);
      console.log("   - Ingresos Cash:", closureTransaction.ingresosCash);
      console.log("   - Ingresos Bank:", closureTransaction.ingresosBank);

      console.log("🔄 Transferencias:");
      console.log("   - Total:", closureTransaction.totalTransferencias);
      console.log("   - Cash:", closureTransaction.transferencias?.cash);
      console.log("   - Bank:", closureTransaction.transferencias?.bank);

      console.log("⚙️ Ajustes:");
      console.log("   - Apertura:", closureTransaction.ajustesApertura);
      console.log("   - Cierre:", closureTransaction.ajustesCierre);

      console.log("📈 Operacionales:");
      console.log("   - Resultado:", closureTransaction.resultadoOperacional);
      console.log(
        "   - Resultado Cash:",
        closureTransaction.resultadoOperacionalCash
      );
      console.log(
        "   - Resultado Bank:",
        closureTransaction.resultadoOperacionalBank
      );
      console.log("   - Flujo Cash:", closureTransaction.flujoNetoCash);
      console.log("   - Flujo Bank:", closureTransaction.flujoNetoBank);

      console.log("🏷️ Metadata:");
      console.log("   - Metadata:", closureTransaction.metadata);

      console.log("🔑 Referencias:");
      console.log("   - Opening Ref:", closureTransaction.openingReference);

      console.log("✅ Validación de estructura completada");
      console.log(
        "📝 Total de campos:",
        Object.keys(closureTransaction).length
      );
      console.log("===========================================");

      // Guardar transacción de cierre
      transactionStore.transactionToAdd.value = closureTransaction;

      console.log("💾 Guardando cierre en Firestore...");
      await transactionStore.addTransaction();

      console.log("✅ Transacción de cierre guardada en Firebase");
      console.log("🔍 VERIFICAR EN FIRESTORE CONSOLE:");
      console.log(
        `   Path: businesses/${businessStore.getBusinessId}/transactions/${closureTransaction.uuid}`
      );
      console.log(
        "   Campos a verificar: id, source, copilotMode, transferencias, ajustesApertura, ajustesCierre, metadata"
      );

      // Construir ajustes si hay diferencias
      const adjustments = accountsBalanceStore.buildClosureAdjustments({
        cashDifference: closureTransaction.cashDifference,
        bankDifference: closureTransaction.bankDifference,
        generateUUID,
      });

      console.log(`📝 Ajustes de cierre construidos: ${adjustments.length}`);

      // Guardar cada ajuste
      for (const adjustment of adjustments) {
        transactionStore.transactionToAdd.value = adjustment;
        await transactionStore.addTransaction();
        console.log(
          `✅ Ajuste guardado: ${adjustment.description} - S/${adjustment.amount}`
        );
      }

      console.log("✅ Cierre completado exitosamente");
    }

    // Resetear el flujo y limpiar datos
    flow.resetFlow();
    transactionStore.resetTransactionToAdd();
    accountsBalanceStore.reset();

    // Redirigir al dashboard
    const businessId = businessStore.getBusinessId;
    flow.accountBalanceLoading = false;
    router.push({
      name: "BusinessDashboard",
      params: { businessId },
    });
  } catch (error) {
    console.error("❌ Error en finalizarRegistro:", error);
    alert(
      `Error al ${
        isOpeningMode.value ? "abrir" : "cerrar"
      } la caja. Por favor, intenta nuevamente.`
    );
    flow.accountBalanceLoading = false;
  }
};
</script>
