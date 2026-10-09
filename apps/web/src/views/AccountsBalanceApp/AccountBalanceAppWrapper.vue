<template>
  <div
    class="space-y-4 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-20"
  >
    <!-- HEADER -->
    <div class="flex justify-end items-center gap-3 mb-3">
      <ProgressIndicator v-bind="progressProps" />

      <CloseBtn v-bind="closeBtnConfig" />
    </div>

    <!-- Loading state inicial -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="text-center space-y-3">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"
        ></div>
        <p class="text-sm text-gray-600">Cargando datos...</p>
      </div>
    </div>

    <!-- Paso actual -->
    <component
      v-else
      :is="CurrentStepComponent"
      :preloadedData="preloadedData"
    />

    <div
      class="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-xl border-t border-gray-100"
    >
      <NavigationBtnsAccountsBalance :finalizarRegistro="finalizarRegistro" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import NavigationBtnsAccountsBalance from "@/components/AccountsBalanceApp/NavigationBtnsAccountsBalance.vue";
import { useAccountsBalanceFlowStore } from "@/stores/AccountsBalanceApp/accountsBalanceFlowStore.js";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore.js";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import ProgressIndicator from "@/components/ui/ProgressIndicator.vue";
import CloseBtn from "@/components/ui/CloseBtn.vue";
import { httpsCallable } from "firebase/functions";
import { ensureBusinessId } from "@/composables/useBusinessUtils";
import { auth, functions } from "@/firebaseInit"; // Usar functions ya configurado
import { useAuth } from "@/composables/useAuth";

import {
  getProgressIndicatorProps,
  FLOW_TYPES,
} from "@/composables/useProgressIndicator";

// Composable de autenticación
const { getCurrentUser } = useAuth();

const transactionStore = useTransactionStore();
const flow = useAccountsBalanceFlowStore();
const accountsBalanceStore = useAccountsBalanceStore();

// Props para el ProgressIndicator usando el composable
const progressProps = computed(() =>
  getProgressIndicatorProps(flow, FLOW_TYPES.TRANSACTION),
);

const CurrentStepComponent = computed(() => flow.currentStepConfig.component);

// Estado local
const isLoading = ref(true);
// ⚡ OPTIMIZACIÓN: Datos precargados para pasar a componentes hijos
const preloadedData = ref(null);

// Al montar el componente, verificar si los datos ya están cargados
onMounted(async () => {
  try {
    console.log("🚀 Iniciando AccountBalanceAppWrapper...");

    const user = await getCurrentUser();
    if (!user) {
      console.error("❌ Usuario no autenticado");
      return;
    }

    // ⚡ OPTIMIZACIÓN: Si los datos ya están cargados desde ResumenDay (Dashboard),
    // NO hacer consultas nuevas - usar dailySummary directamente
    if (flow.dataAlreadyLoaded && accountsBalanceStore.dailySummary) {
      console.log("⚡ MODO RÁPIDO: Datos ya cargados desde Dashboard");
      console.log("   Usando dailySummary precalculado del backend");

      // Usar los datos ya existentes del accountsBalanceStore
      preloadedData.value = {
        dailySummary: accountsBalanceStore.dailySummary,
        transactions: accountsBalanceStore.transactions,
        hasOpening: accountsBalanceStore.dailySummary?.hasOpening || false,
        saldoInicial: accountsBalanceStore.saldoInicial,
        totalIngresos: accountsBalanceStore.totalIngresos,
        totalEgresos: accountsBalanceStore.totalEgresos,
        saldoActual: accountsBalanceStore.saldoActual,
        saldoActualCash: accountsBalanceStore.saldoActualCash,
        saldoActualBank: accountsBalanceStore.saldoActualBank,
        fromCache: true,
      };

      console.log("✅ Datos precargados listos:", {
        hasOpening: preloadedData.value.hasOpening,
        totalTransactions: preloadedData.value.transactions?.length || 0,
        saldoInicial: preloadedData.value.saldoInicial,
        saldoActual: preloadedData.value.saldoActual,
      });

      isLoading.value = false;
      return;
    }

    // Si NO vienen datos cargados, hacer el proceso normal
    console.log("🔄 MODO NORMAL: Cargando datos desde cero...");

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Cargar dailySummary desde el accountsBalanceStore
    const loaded = await accountsBalanceStore.loadFromDailySummary();

    if (loaded) {
      console.log("✅ DailySummary cargado exitosamente");

      preloadedData.value = {
        dailySummary: accountsBalanceStore.dailySummary,
        transactions: accountsBalanceStore.transactions,
        hasOpening: accountsBalanceStore.dailySummary?.hasOpening || false,
        saldoInicial: accountsBalanceStore.saldoInicial,
        totalIngresos: accountsBalanceStore.totalIngresos,
        totalEgresos: accountsBalanceStore.totalEgresos,
        saldoActual: accountsBalanceStore.saldoActual,
        saldoActualCash: accountsBalanceStore.saldoActualCash,
        saldoActualBank: accountsBalanceStore.saldoActualBank,
        fromCache: false,
      };
    } else {
      console.log("⚠️ No se pudo cargar dailySummary, usando fallback");
      // Fallback: cargar transacciones manualmente
      await transactionStore.getTransactionsToday();

      preloadedData.value = {
        transactions: transactionStore.transactionsInStore.value,
        hasOpening: transactionStore.transactionsInStore.value.some(
          (t) => t.type === "opening",
        ),
        fromCache: false,
      };
    }

    console.log("✅ Datos cargados:", {
      hasOpening: preloadedData.value.hasOpening,
      totalTransactions: preloadedData.value.transactions?.length || 0,
      fromCache: preloadedData.value.fromCache,
    });
  } catch (error) {
    console.error("❌ Error en inicialización:", error);
  } finally {
    isLoading.value = false;
  }
});

/**
 * Verifica y cierra automáticamente el día anterior si quedó abierto
 * Llama a la Cloud Function lazyCloseIfNeeded
 */
const checkLazyClose = async () => {
  try {
    const businessId = ensureBusinessId();

    if (!businessId) {
      console.warn("⚠️ No hay businessId disponible para lazy close");
      return;
    }

    console.log(`🔍 Verificando cierre lazy para negocio: ${businessId}`);

    // CRÍTICO: Verificar que el usuario actual existe
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("❌ auth.currentUser es null - usuario no autenticado");
      return;
    }

    console.log("✅ auth.currentUser existe:", currentUser.email);
    console.log("   UID:", currentUser.uid);

    // CRÍTICO: Forzar refresh del token antes de llamar
    try {
      await currentUser.getIdToken(true); // force refresh
      console.log("🔑 Token ID refrescado exitosamente");
    } catch (tokenError) {
      console.error("❌ Error refrescando token ID:", tokenError);
      return;
    }

    // Usar la instancia de functions ya configurada en firebaseInit
    // (ya tiene emulador conectado si es localhost)
    console.log("🔧 Usando instancia de functions desde firebaseInit");

    // Crear la referencia a la función callable
    const lazyCloseIfNeeded = httpsCallable(functions, "lazyCloseIfNeeded");

    console.log("🔐 Llamando a lazyCloseIfNeeded...");
    console.log("   businessId:", businessId);
    console.log("   user:", currentUser.email);

    // Llamar a la función con el businessId
    const result = await lazyCloseIfNeeded({ businessId });

    console.log("📦 Respuesta recibida:", result);

    // Procesar respuesta
    const { data } = result;

    if (data.closed) {
      console.log("🤖 Cierre automático ejecutado:", {
        mode: data.mode,
        day: data.day,
        closureId: data.closureId,
      });

      console.info(`✅ Se cerró automáticamente el día ${data.day}`);

      // Recargar transacciones para incluir el cierre automático
      await transactionStore.getTransactionsToday();
    } else {
      console.log("ℹ️ No se requiere cierre automático:", {
        reason: data.reason,
        day: data.day,
      });
    }

    return data;
  } catch (error) {
    // No lanzar el error para no bloquear el flujo
    console.error("❌ Error en lazy close:", error);
    console.error("   Código:", error.code);
    console.error("   Mensaje:", error.message);
    console.error("   Details:", error.details);

    // Debug adicional
    console.warn(
      "🔍 auth.currentUser:",
      auth.currentUser ? auth.currentUser.email : "null",
    );

    // El flujo puede continuar aunque falle el lazy close
    return null;
  }
};

// Configuración para el CloseBtn
const closeBtnConfig = {
  flowStore: flow,
  additionalStores: {
    transactionStore,
  },
  flowType: FLOW_TYPES.ACCOUNT_BALANCE,
};
</script>
