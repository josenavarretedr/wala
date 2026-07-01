<template>
  <div
    class="w-full bg-white/80 rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
    ref="resumenDayRef"
  >
    <!-- Toggle section -->
    <div
      class="flex items-center justify-center gap-3 pt-2 border-gray-100 cursor-pointer toggle-container"
      @click="handleToggleResume"
      v-if="!showResume"
    >
      <div
        class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"
      >
        <component
          :is="showResume ? EyeClosed : Eye"
          class="w-3 h-3 text-blue-600"
        />
      </div>

      <div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-900">
          Resumen día
        </h3>
        <p class="text-xs sm:text-sm text-gray-500">
          {{ showResume ? "Ocultar información" : "Mira cómo te fue hoy" }}
        </p>
      </div>
    </div>

    <!-- Contenedor completo para captura -->
    <div v-if="showResume">
      <!-- Estado expandido - información sensible visible -->
      <div class="text-center mb-4" @click="handleToggleResume">
        <!-- Resultado del día -->
        <div
          :class="[
            'rounded-lg p-3 mb-4',
            resultadoOperacional > 0
              ? 'bg-green-50'
              : resultadoOperacional < 0
                ? 'bg-red-50'
                : 'bg-gray-50',
          ]"
        >
          <p class="text-xs text-gray-500 mb-1">Resultado del día</p>
          <p
            :class="[
              'text-lg sm:text-xl font-semibold mb-1',
              resultadoOperacional > 0
                ? 'text-green-600'
                : resultadoOperacional < 0
                  ? 'text-red-600'
                  : 'text-gray-700',
            ]"
          >
            {{
              resultadoOperacional === 0
                ? "Sin ganancias ni pérdidas"
                : resultadoOperacional > 0
                  ? `Ganaste S/ ${resultadoOperacional.toFixed(2)}`
                  : `Perdiste S/ ${Math.abs(resultadoOperacional).toFixed(2)}`
            }}
          </p>
          <p class="text-xs text-gray-400">
            Basado tus movimientos registrados.
          </p>
        </div>

        <p class="text-sm text-gray-500 mb-1">Saldo actual</p>
        <p class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          S/ {{ saldoActual.toFixed(2) }}
        </p>
        <p class="text-xs text-gray-400">Saldo inicial + Resultado del día</p>

        <!-- Chips con desglose por cuenta -->
        <div class="flex items-center justify-center gap-3 mt-3" v-if="opening">
          <div class="bg-gray-100 px-3 py-1 rounded-full">
            <span class="text-xs text-gray-600">
              Efectivo S/
              {{ saldoActualCash.toFixed(2) }}
            </span>
          </div>
          <div class="bg-gray-100 px-3 py-1 rounded-full">
            <span class="text-xs text-gray-600">
              Bancos S/
              {{ saldoActualBank.toFixed(2) }}
            </span>
          </div>
        </div>

        <div></div>
      </div>

      <!-- Contenido expandible -->
      <div v-if="opening" class="mt-6 space-y-4">
        <!-- Grid de métricas -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <!-- Saldo inicial -->
          <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div class="flex items-center gap-2 mb-2">
              <Cash class="w-4 h-4 text-gray-600" />
              <span class="text-xs sm:text-sm font-medium text-gray-600"
                >Saldo inicial</span
              >
            </div>
            <p class="text-base sm:text-lg font-semibold text-gray-900">
              S/ {{ saldoInicial.toFixed(2) }}
            </p>
          </div>

          <!-- Ingresos -->
          <div class="bg-green-50 rounded-lg p-3 sm:p-4">
            <div class="flex items-center gap-2 mb-2">
              <GraphUp class="w-4 h-4 text-green-600" />
              <span class="text-xs sm:text-sm font-medium text-green-700"
                >Ingresos hoy</span
              >
            </div>
            <p class="text-base sm:text-lg font-semibold text-green-800">
              S/ {{ totalIngresos.toFixed(2) }}
            </p>
          </div>

          <!-- Egresos -->
          <div class="bg-red-50 rounded-lg p-3 sm:p-4">
            <div class="flex items-center gap-2 mb-2">
              <DatabaseExport class="w-4 h-4 text-red-600" />
              <span class="text-xs sm:text-sm font-medium text-red-700"
                >Salidas hoy</span
              >
            </div>
            <p class="text-base sm:text-lg font-semibold text-red-800">
              S/ {{ totalEgresos.toFixed(2) }}
            </p>
          </div>
        </div>

        <!-- Resultado operacional -->
        <div class="border-t border-gray-200 pt-4">
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
              >
                <Cash class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-900">
                  Ingresos - Egresos de hoy
                </h4>
                <p class="text-xs text-gray-500">
                  {{
                    resultadoOperacional >= 0
                      ? "Resultado operativo positivo"
                      : "Resultado operativo negativo"
                  }}
                </p>
              </div>
            </div>

            <div class="text-right">
              <p class="text-xs text-gray-500">Diferencia</p>
              <p
                :class="[
                  'text-xl sm:text-2xl font-bold',
                  resultadoOperacional >= 0 ? 'text-green-600' : 'text-red-600',
                ]"
              >
                {{ resultadoOperacional >= 0 ? "+" : "" }}S/
                {{ resultadoOperacional.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tarjeta de ajustes por arqueo (separada) -->
        <div
          class="bg-amber-50 border border-amber-200 rounded-lg p-4"
          v-if="totalAjustesCierre && totalAjustesCierre !== 0"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <h4 class="text-sm font-medium text-amber-900">
                  Correcciones por descuadre
                </h4>
                <p
                  class="text-xs text-amber-700"
                  title="Correcciones por descuadre; no se cuentan como ventas/salidas"
                >
                  No son ventas ni salidas operativas
                </p>
              </div>
            </div>

            <div class="text-right">
              <p class="text-xs text-amber-600">Ajuste neto</p>
              <p class="text-lg font-bold text-amber-800">
                {{ totalAjustesCierre >= 0 ? "+" : "" }}S/
                {{ (totalAjustesCierre || 0).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Botón de Compartir -->
        <div
          class="no-share-item mt-6 pt-4 border-t border-gray-200 flex justify-end"
        >
          <!-- <ShareButton
            :target-ref="resumenDayRef"
            file-name="resumen-dia-wala.png"
            share-title="Resumen del Día"
            component-type="resumen-dia"
            variant="card"
            button-description="Descarga o comparte tu resumen del día"
            :modifications="{
              hideElements: ['.share-button-container', '.toggle-container'],
              styleChanges: {
                '[ref=resumenDayRef]': {
                  padding: '24px',
                  backgroundColor: '#ffffff',
                },
              },
            }"
          /> -->

          <ShareButtonCloud
            :target-ref="resumenDayRef"
            file-name="resumen-dia-wala.png"
            share-title="Resumen del Día"
            component-type="resumen-dia"
            variant="card"
            button-description="Descarga o comparte tu resumen del día (Cloud)"
            :modifications="{
              hideElements: ['.share-button-container', '.toggle-container'],
              styleChanges: {
                '[ref=resumenDayRef]': {
                  padding: '24px',
                  backgroundColor: '#ffffff',
                },
              },
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { GraphUp, DatabaseExport, Cash, Eye, EyeClosed } from "@iconoir/vue";
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { useAccountsBalanceFlowStore } from "@/stores/AccountsBalanceApp/accountsBalanceFlowStore";
import { useToast } from "@/composables/useToast";
import { useSubscription } from "@/composables/useSubscription";
import { useRoute } from "vue-router";
import { BrightCrown } from "@iconoir/vue";
import ShareButton from "@/components/ShareButton.vue";
import ShareButtonCloud from "@/components/ShareButtonCloud.vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const route = useRoute();
const accountsBalanceFlowStore = useAccountsBalanceFlowStore();
const { isPremium } = useSubscription();
const { warning, success, premium } = useToast();

const showResume = ref(false);
const resumenDayRef = ref(null);

const accountsBalanceStore = useAccountsBalanceStore();
const transactionStore = useTransactionStore();

// ===== 🚀 MIGRACIÓN A DAILYSUMMARY =====
// Ahora el store carga datos desde dailySummary automáticamente
// Los computed properties del store ya están configurados para usar
// dailySummary cuando esté disponible (modo híbrido)

const getEffectiveAmount = (tx) => {
  if (tx.type === 'payment') {
    return tx.amount || 0;
  }
  if ((tx.type === 'income' || tx.type === 'expense') && tx.payments) {
    if (tx.payments.length > 0) {
      return tx.payments[0].amount || 0;
    }
    return 0; // Si el array de pagos está definido pero vacío, es 100% crédito y no ha salido dinero
  }
  return tx.amount || 0;
};

// Usar los cálculos del store (ahora híbrido con dailySummary)
const opening = computed(() => accountsBalanceStore.openingTransaction);
const saldoInicial = computed(() => accountsBalanceStore.saldoInicial);

const totalIngresos = computed(() => {
  const txs = transactionStore.transactionsInStore.value || [];
  if (txs.length === 0) {
    return accountsBalanceStore.totalIngresos;
  }
  const incomes = txs
    .filter(tx => tx.type === 'income' && tx.category !== 'adjustment')
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const clientPayments = txs
    .filter(tx => tx.type === 'payment' && (tx.clientId || tx.clientName))
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  return incomes + clientPayments;
});

const totalEgresos = computed(() => {
  const txs = transactionStore.transactionsInStore.value || [];
  if (txs.length === 0) {
    return accountsBalanceStore.totalEgresos;
  }
  const expenses = txs
    .filter(tx => tx.type === 'expense' && tx.category !== 'adjustment')
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const supplierPayments = txs
    .filter(tx => tx.type === 'payment' && (tx.supplierId || tx.supplierName))
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  return expenses + supplierPayments;
});

const totalAjustesCierre = computed(() => {
  return accountsBalanceStore.totalAjustesCierre;
});

const resultadoOperacional = computed(() => {
  const txs = transactionStore.transactionsInStore.value || [];
  if (txs.length === 0) {
    return accountsBalanceStore.resultadoOperacional;
  }
  return totalIngresos.value - totalEgresos.value;
});

const saldoActualCash = computed(() => {
  const txs = transactionStore.transactionsInStore.value || [];
  if (txs.length === 0) {
    return accountsBalanceStore.saldoActualCash;
  }
  const ingresosIn = txs
    .filter(tx => tx.type === 'income' && tx.account === 'cash' && tx.subcategory !== 'opening_adjustment')
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const cobrosIn = txs
    .filter(tx => tx.type === 'payment' && tx.account === 'cash' && (tx.clientId || tx.clientName))
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const ingresos = ingresosIn + cobrosIn;

  const egresosOut = txs
    .filter(tx => tx.type === 'expense' && tx.account === 'cash' && tx.category !== 'adjustment')
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const pagosOut = txs
    .filter(tx => tx.type === 'payment' && tx.account === 'cash' && (tx.supplierId || tx.supplierName))
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const egresos = egresosOut + pagosOut;

  const transfersOut = txs
    .filter(tx => tx.type === 'transfer' && tx.fromAccount === 'cash')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const transfersIn = txs
    .filter(tx => tx.type === 'transfer' && tx.toAccount === 'cash')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const inicial = opening.value ? (opening.value.realCashBalance || 0) : accountsBalanceStore.saldoInicialCash;
  return inicial + ingresos - egresos - transfersOut + transfersIn;
});

const saldoActualBank = computed(() => {
  const txs = transactionStore.transactionsInStore.value || [];
  if (txs.length === 0) {
    return accountsBalanceStore.saldoActualBank;
  }
  const ingresosIn = txs
    .filter(tx => tx.type === 'income' && tx.account === 'bank' && tx.subcategory !== 'opening_adjustment')
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const cobrosIn = txs
    .filter(tx => tx.type === 'payment' && tx.account === 'bank' && (tx.clientId || tx.clientName))
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const ingresos = ingresosIn + cobrosIn;

  const egresosOut = txs
    .filter(tx => tx.type === 'expense' && tx.account === 'bank' && tx.category !== 'adjustment')
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const pagosOut = txs
    .filter(tx => tx.type === 'payment' && tx.account === 'bank' && (tx.supplierId || tx.supplierName))
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const egresos = egresosOut + pagosOut;

  const transfersOut = txs
    .filter(tx => tx.type === 'transfer' && tx.fromAccount === 'bank')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const transfersIn = txs
    .filter(tx => tx.type === 'transfer' && tx.toAccount === 'bank')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const inicial = opening.value ? (opening.value.realBankBalance || 0) : accountsBalanceStore.saldoInicialBank;
  return inicial + ingresos - egresos - transfersOut + transfersIn;
});

const saldoActual = computed(() => {
  const txs = transactionStore.transactionsInStore.value || [];
  if (txs.length === 0) {
    return accountsBalanceStore.saldoActual;
  }
  return saldoActualCash.value + saldoActualBank.value;
});

// 🔄 Watch para detectar cambios en transacciones y recargar automáticamente
watch(
  () => accountsBalanceStore.transactions,
  async (newTransactions) => {
    if (newTransactions && newTransactions.length > 0) {
      console.log(
        "🔄 ResumenDay - Detectados cambios en transacciones, recargando...",
      );
      await accountsBalanceStore.forceReloadSummary();
    }
  },
  { deep: true },
);

// 🔄 Watch para detectar cambios en dailySummary directamente
watch(
  () => accountsBalanceStore.dailySummary,
  (newSummary, oldSummary) => {
    if (newSummary) {
      console.log("✅ ResumenDay - DailySummary actualizado automáticamente");

      // Log de diagnóstico cuando cambia
      if (oldSummary && newSummary !== oldSummary) {
        console.log("📊 Valores actualizados en ResumenDay:");
        console.log("   - Saldo inicial:", saldoInicial.value);
        console.log("   - Total ingresos:", totalIngresos.value);
        console.log("   - Total egresos:", totalEgresos.value);
        console.log("   - Resultado operacional:", resultadoOperacional.value);
        console.log("   - Saldo actual:", saldoActual.value);
      }
    }
  },
  { deep: true },
);

// Inicialización
onMounted(async () => {
  console.log("📊 ResumenDay - Montando componente...");

  // 🔥 NUEVO: Iniciar listener en tiempo real
  console.log("🔥 Iniciando listener en tiempo real de dailySummary...");
  accountsBalanceStore.startDailySummaryListener();

  // OPCIÓN A: Cargar dailySummary inicial
  const loaded = await accountsBalanceStore.loadFromDailySummary();

  if (loaded) {
    console.log("✅ ResumenDay - DailySummary cargado exitosamente");
    console.log("   Fuente de datos: Backend pre-calculado (dailySummary)");
    console.log("   🔥 Listener activo - se actualizará automáticamente");

    // ⚡ OPTIMIZACIÓN: Marcar datos como cargados para AccountBalanceApp
    accountsBalanceFlowStore.markDataAsLoaded();
  } else {
    console.log(
      "ℹ️ ResumenDay - DailySummary no disponible, usando cálculo manual",
    );
    console.log("   Fuente de datos: Transacciones locales (fallback)");
    console.log("   🔥 Listener activo - esperando primera transacción");
  }

  // Log de diagnóstico
  console.log("📈 Valores cargados:");
  console.log("   - Saldo inicial:", saldoInicial.value);
  console.log("   - Total ingresos:", totalIngresos.value);
  console.log("   - Total egresos:", totalEgresos.value);
  console.log("   - Resultado operacional:", resultadoOperacional.value);
  console.log("   - Saldo actual:", saldoActual.value);
});

// 🛑 Detener listener cuando el componente se desmonta
onBeforeUnmount(() => {
  console.log(
    "🛑 ResumenDay - Desmontando componente y deteniendo listener...",
  );
  accountsBalanceStore.stopDailySummaryListener();
});

// Función para manejar el toggle del resumen
const handleToggleResume = () => {
  if (!opening.value) {
    warning("Debes aperturar el día para ver el resumen.");
    return;
  }
  showResume.value = !showResume.value;
};
</script>

<style scoped>
/* Animación de expansión suave */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

/* Animación de pulso para los puntos indicadores */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Hover suave para el header */
.cursor-pointer:hover {
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid-cols-1 {
    gap: 0.75rem;
  }
}
</style>
