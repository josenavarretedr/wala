<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
        >
          <TrendingUp class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Flujo de Caja</h3>
          <p class="text-sm text-gray-500">Resumen financiero actual</p>
        </div>
      </div>
      <button
        @click="refreshData"
        :disabled="isLoading"
        class="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <Refresh
          class="w-4 h-4 text-gray-600"
          :class="{ 'animate-spin': isLoading }"
        />
      </button>
    </div>

    <!-- Métricas principales -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Saldo inicial -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <Wallet class="w-4 h-4 text-gray-600" />
          <span class="text-sm font-medium text-gray-600">Saldo inicial</span>
        </div>
        <p class="text-xl font-bold text-gray-900">
          S/ {{ formatCurrency(financialData.saldoInicial) }}
        </p>
      </div>

      <!-- Ingresos -->
      <div class="bg-green-50 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <TrendingUp class="w-4 h-4 text-green-600" />
          <span class="text-sm font-medium text-green-700">Ingresos</span>
        </div>
        <p class="text-xl font-bold text-green-800">
          +S/ {{ formatCurrency(financialData.totalIngresos) }}
        </p>
      </div>

      <!-- Egresos -->
      <div class="bg-red-50 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <TrendingDown class="w-4 h-4 text-red-600" />
          <span class="text-sm font-medium text-red-700">Egresos</span>
        </div>
        <p class="text-xl font-bold text-red-800">
          -S/ {{ formatCurrency(financialData.totalEgresos) }}
        </p>
      </div>

      <!-- Saldo actual -->
      <div class="bg-blue-50 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <Cash class="w-4 h-4 text-blue-600" />
          <span class="text-sm font-medium text-blue-700">Saldo actual</span>
        </div>
        <p class="text-xl font-bold text-blue-800">
          S/ {{ formatCurrency(financialData.saldoActual) }}
        </p>
      </div>
    </div>

    <!-- Desglose por cuenta -->
    <div class="space-y-3">
      <h4 class="text-sm font-medium text-gray-700">Desglose por cuenta</h4>

      <!-- Efectivo -->
      <div
        class="flex items-center justify-between p-3 bg-emerald-50 rounded-lg"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center"
          >
            <Coins class="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-emerald-800">Efectivo</p>
            <p class="text-xs text-emerald-600">
              +{{ formatCurrency(financialData.ingresosCash) }} -{{
                formatCurrency(financialData.egresosCash)
              }}
              {{
                financialData.efectoTransferenciasEnCash !== 0
                  ? (financialData.efectoTransferenciasEnCash > 0
                      ? " +"
                      : " ") +
                    formatCurrency(
                      Math.abs(financialData.efectoTransferenciasEnCash)
                    ) +
                    " transf."
                  : ""
              }}
            </p>
          </div>
        </div>
        <p class="text-lg font-bold text-emerald-800">
          S/ {{ formatCurrency(financialData.saldoActualCash) }}
        </p>
      </div>

      <!-- Digital -->
      <div
        class="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"
          >
            <SmartphoneDevice class="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-purple-800">Digital</p>
            <p class="text-xs text-purple-600">
              +{{ formatCurrency(financialData.ingresosBank) }} -{{
                formatCurrency(financialData.egresosBank)
              }}
              {{
                financialData.efectoTransferenciasEnBank !== 0
                  ? (financialData.efectoTransferenciasEnBank > 0
                      ? " +"
                      : " ") +
                    formatCurrency(
                      Math.abs(financialData.efectoTransferenciasEnBank)
                    ) +
                    " transf."
                  : ""
              }}
            </p>
          </div>
        </div>
        <p class="text-lg font-bold text-purple-800">
          S/ {{ formatCurrency(financialData.saldoActualBank) }}
        </p>
      </div>
    </div>

    <!-- Resultado operacional -->
    <div class="border-t border-gray-200 pt-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :class="[
              financialData.resultadoOperacional >= 0
                ? 'bg-green-100'
                : 'bg-red-100',
            ]"
          >
            <component
              :is="
                financialData.resultadoOperacional >= 0
                  ? TrendingUp
                  : TrendingDown
              "
              class="w-5 h-5"
              :class="[
                financialData.resultadoOperacional >= 0
                  ? 'text-green-600'
                  : 'text-red-600',
              ]"
            />
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900">
              Resultado Operacional
            </h4>
            <p class="text-xs text-gray-500">
              Ingresos - Egresos (sin ajustes)
            </p>
          </div>
        </div>
        <div class="text-right">
          <p
            class="text-2xl font-bold"
            :class="[
              financialData.resultadoOperacional >= 0
                ? 'text-green-600'
                : 'text-red-600',
            ]"
          >
            {{ financialData.resultadoOperacional >= 0 ? "+" : "" }}S/
            {{ formatCurrency(Math.abs(financialData.resultadoOperacional)) }}
          </p>
          <p class="text-xs text-gray-500">
            {{
              financialData.resultadoOperacional >= 0 ? "Ganancia" : "Pérdida"
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Transferencias (si las hay) -->
    <div
      v-if="Math.abs(financialData.totalTransferencias) > 0.01"
      class="bg-blue-50 border border-blue-200 rounded-lg p-3"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <svg
            class="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m0-4l4-4"
            ></path>
          </svg>
          <span class="text-sm font-medium text-blue-800"
            >Transferencias del día</span
          >
        </div>
        <p class="text-sm font-bold text-blue-800">
          S/ {{ formatCurrency(financialData.totalTransferencias) }}
        </p>
      </div>
      <div class="text-xs text-blue-700 space-y-1">
        <div
          v-if="financialData.transferenciasSalidaCash > 0"
          class="flex justify-between"
        >
          <span>Efectivo → Digital:</span>
          <span
            >S/
            {{ formatCurrency(financialData.transferenciasSalidaCash) }}</span
          >
        </div>
        <div
          v-if="financialData.transferenciasSalidaBank > 0"
          class="flex justify-between"
        >
          <span>Digital → Efectivo:</span>
          <span
            >S/
            {{ formatCurrency(financialData.transferenciasSalidaBank) }}</span
          >
        </div>
      </div>
    </div>

    <!-- Ajustes (si los hay) -->
    <div
      v-if="Math.abs(financialData.totalAjustes) > 0.01"
      class="bg-amber-50 border border-amber-200 rounded-lg p-3"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <WarningTriangle class="w-4 h-4 text-amber-600" />
          <span class="text-sm font-medium text-amber-800"
            >Ajustes por descuadre</span
          >
        </div>
        <p class="text-sm font-bold text-amber-800">
          {{ financialData.totalAjustes >= 0 ? "+" : "" }}S/
          {{ formatCurrency(Math.abs(financialData.totalAjustes)) }}
        </p>
      </div>
    </div>

    <!-- Estado -->
    <div class="text-center pt-2">
      <div class="flex items-center justify-center gap-2 text-xs text-gray-500">
        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>
          {{ financialData.hasActivity ? "Con actividad" : "Sin actividad" }} •
          {{ financialData.hasOpening ? "Apertura realizada" : "Sin apertura" }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Cash,
  Coins,
  SmartphoneDevice,
  Refresh,
  WarningTriangle,
} from "@iconoir/vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";

// Props
const props = defineProps({
  autoRefresh: {
    type: Boolean,
    default: true,
  },
  refreshInterval: {
    type: Number,
    default: 30000, // 30 segundos
  },
});

// Stores
const transactionStore = useTransactionStore();
const accountsBalanceStore = useAccountsBalanceStore();

// Estado local
const isLoading = ref(false);
let refreshTimer = null;

// Datos financieros reactivos del store
const financialData = computed(() => accountsBalanceStore.financialSummary);

// Cargar datos financieros
const loadFinancialData = async () => {
  try {
    isLoading.value = true;

    // Cargar transacciones del día
    await transactionStore.getTransactionsToday();

    // Configurar el store de balance con las transacciones
    accountsBalanceStore.setTransactions(
      transactionStore.transactionsInStore.value
    );

    console.log("💰 Datos financieros actualizados:", financialData.value);
  } catch (error) {
    console.error("❌ Error cargando datos financieros:", error);
  } finally {
    isLoading.value = false;
  }
};

// Actualizar datos manualmente
const refreshData = async () => {
  await loadFinancialData();
};

// Formatear moneda
const formatCurrency = (amount) => {
  return (amount || 0).toFixed(2);
};

// Configurar auto-refresh
const setupAutoRefresh = () => {
  if (props.autoRefresh && props.refreshInterval > 0) {
    refreshTimer = setInterval(loadFinancialData, props.refreshInterval);
  }
};

// Limpiar auto-refresh
const clearAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// Lifecycle
onMounted(async () => {
  await loadFinancialData();
  setupAutoRefresh();
});

onUnmounted(() => {
  clearAutoRefresh();
});
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid.lg\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid.grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
