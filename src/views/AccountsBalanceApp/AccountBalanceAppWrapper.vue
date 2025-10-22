<template>
  <div
    class="space-y-4 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-20"
  >
    <!-- HEADER -->
    <div class="flex justify-end items-center gap-3 mb-3">
      <ProgressIndicator v-bind="progressProps" />

      <CloseBtn v-bind="closeBtnConfig" />
    </div>

    <!-- Paso actual -->
    <component :is="CurrentStepComponent" />

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
// Props para el ProgressIndicator usando el composable
const progressProps = computed(() =>
  getProgressIndicatorProps(flow, FLOW_TYPES.TRANSACTION)
);

const CurrentStepComponent = computed(() => flow.currentStepConfig.component);

// Estado local para evitar el bucle infinito
const hasOpeningTransaction = ref(false);
const isLoading = ref(true);

// Al montar el componente, verificar cierre lazy y cargar transacciones
onMounted(async () => {
  try {
    console.log("🚀 Iniciando verificación de cierres pendientes...");

    // 1. Esperar a que el usuario esté autenticado
    const user = await getCurrentUser();

    if (!user) {
      console.error("❌ Usuario no autenticado");
      return;
    }

    console.log("✅ Usuario autenticado:", user.email);
    console.log("   UID:", user.uid);

    // IMPORTANTE: Pequeño delay para asegurar que el token esté disponible
    // Esto es necesario porque el token ID puede tardar unos milisegundos en generarse
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 2. Llamar a lazyCloseIfNeeded para verificar día anterior
    // await checkLazyClose();

    // 3. Cargar transacciones del día actual
    await transactionStore.getTransactionsToday();

    // 4. Verificar si existe una transacción de tipo "opening"
    hasOpeningTransaction.value =
      transactionStore.transactionsInStore.value.some(
        (transaction) => transaction.type === "opening"
      );

    console.log("✅ Verificación completada", {
      hasOpening: hasOpeningTransaction.value,
      totalTransactions: transactionStore.transactionsInStore.value.length,
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
      auth.currentUser ? auth.currentUser.email : "null"
    );

    // El flujo puede continuar aunque falle el lazy close
    return null;
  }
};

// Manejar cuando se crea una nueva apertura
const onOpeningCreated = () => {
  hasOpeningTransaction.value = true;
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
