<template>
  <div class="space-y-6">
    <!-- Título dinámico -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        {{ isOpening ? "Apertura de Caja" : "Cierre de Caja" }}
      </h1>
      <p class="text-sm text-gray-500">
        {{ formatDate(transactionData.createdAt) }}
      </p>
    </div>

    <!-- Preview de la transacción -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Header con color según tipo -->
      <div
        :class="[
          'p-6 text-center text-white',
          isOpening
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : 'bg-gradient-to-r from-blue-500 to-indigo-600',
        ]"
      >
        <div class="flex items-center justify-center gap-2 mb-2">
          <component :is="isOpening ? OpenInWindow : Cash" class="w-8 h-8" />
          <div class="text-3xl font-bold">
            {{ isOpening ? "Apertura" : "Cierre" }}
          </div>
        </div>
        <div
          :class="isOpening ? 'text-green-100' : 'text-blue-100'"
          class="text-sm"
        >
          {{ isOpening ? "Inicio de operaciones" : "Fin de operaciones" }}
        </div>
      </div>

      <!-- Balances de cuentas -->
      <div class="p-6 space-y-4">
        <h3
          class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
        >
          <Cash class="w-5 h-5 text-gray-600" />
          Balance de Cuentas
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Efectivo -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Coins class="w-4 h-4 text-emerald-600" />
              <p class="text-sm font-medium text-emerald-800">Efectivo</p>
            </div>
            <p class="text-2xl font-bold text-emerald-700 tabular-nums">
              S/ {{ formatAmount(getCashBalance) }}
            </p>
            <p class="text-xs text-emerald-600 mt-1">
              {{ isOpening ? "Balance inicial" : "Balance final" }}
            </p>
          </div>

          <!-- Digital (Yape/Plin) -->
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <SmartphoneDevice class="w-4 h-4 text-purple-600" />
              <p class="text-sm font-medium text-purple-800">Yape/Plin</p>
            </div>
            <p class="text-2xl font-bold text-purple-700 tabular-nums">
              S/ {{ formatAmount(getBankBalance) }}
            </p>
            <p class="text-xs text-purple-600 mt-1">
              {{ isOpening ? "Balance inicial" : "Balance final" }}
            </p>
          </div>
        </div>

        <!-- Total general -->
        <div
          :class="[
            'border-2 rounded-lg p-4 mt-4',
            isOpening
              ? 'bg-green-50 border-green-300'
              : 'bg-blue-50 border-blue-300',
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Wallet
                class="w-5 h-5"
                :class="isOpening ? 'text-green-600' : 'text-blue-600'"
              />
              <p
                class="text-sm font-medium"
                :class="isOpening ? 'text-green-800' : 'text-blue-800'"
              >
                Total General
              </p>
            </div>
            <p
              class="text-2xl font-bold tabular-nums"
              :class="isOpening ? 'text-green-700' : 'text-blue-700'"
            >
              S/ {{ formatAmount(getTotalBalance) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Información adicional para Cierre -->
      <div v-if="!isOpening" class="px-6 pb-4 space-y-4">
        <!-- Desglose de Efectivo -->
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <button
            @click="showCashBreakdown = !showCashBreakdown"
            class="w-full flex items-center justify-between text-left"
          >
            <div class="flex items-center gap-2">
              <Coins class="w-5 h-5 text-emerald-600" />
              <span class="text-sm font-semibold text-emerald-800">
                Desglose del Efectivo
              </span>
            </div>
            <component
              :is="showCashBreakdown ? 'svg' : 'svg'"
              class="w-4 h-4 text-emerald-600 transition-transform"
              :class="{ 'rotate-180': showCashBreakdown }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </component>
          </button>

          <Transition name="expand">
            <div
              v-if="showCashBreakdown"
              class="mt-3 space-y-2 text-xs text-gray-700"
            >
              <div class="flex justify-between">
                <span>Efectivo inicial:</span>
                <span class="font-semibold tabular-nums">
                  S/ {{ formatAmount(transactionData.initialCashBalance || 0) }}
                </span>
              </div>
              <div class="flex justify-between text-green-700">
                <span>+ Ventas en efectivo:</span>
                <span class="font-semibold tabular-nums">
                  S/ {{ formatAmount(transactionData.ingresosCash || 0) }}
                </span>
              </div>
              <div class="flex justify-between text-red-700">
                <span>- Gastos en efectivo:</span>
                <span class="font-semibold tabular-nums">
                  S/ {{ formatAmount(transactionData.egresosCash || 0) }}
                </span>
              </div>
              <div
                v-if="getAjustesCash !== 0"
                class="flex justify-between"
                :class="
                  getAjustesCash > 0 ? 'text-amber-700' : 'text-amber-700'
                "
              >
                <span
                  >{{ getAjustesCash >= 0 ? "+" : "" }} Ajustes de
                  efectivo:</span
                >
                <span class="font-semibold tabular-nums">
                  S/ {{ formatAmount(getAjustesCash) }}
                </span>
              </div>
              <div
                class="pt-2 border-t border-emerald-300 flex justify-between font-bold"
              >
                <span>Balance esperado:</span>
                <span class="tabular-nums text-emerald-700">
                  S/
                  {{ formatAmount(transactionData.totalCash || 0) }}
                </span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Desglose de Digital -->
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <button
            @click="showBankBreakdown = !showBankBreakdown"
            class="w-full flex items-center justify-between text-left"
          >
            <div class="flex items-center gap-2">
              <SmartphoneDevice class="w-5 h-5 text-purple-600" />
              <span class="text-sm font-semibold text-purple-800">
                Desglose Digital (Yape/Plin)
              </span>
            </div>
            <component
              :is="showBankBreakdown ? 'svg' : 'svg'"
              class="w-4 h-4 text-purple-600 transition-transform"
              :class="{ 'rotate-180': showBankBreakdown }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </component>
          </button>

          <Transition name="expand">
            <div
              v-if="showBankBreakdown"
              class="mt-3 space-y-2 text-xs text-gray-700"
            >
              <div class="flex justify-between">
                <span>Digital inicial:</span>
                <span class="font-semibold tabular-nums">
                  S/ {{ formatAmount(transactionData.initialBankBalance || 0) }}
                </span>
              </div>
              <div class="flex justify-between text-green-700">
                <span>+ Ventas digitales:</span>
                <span class="font-semibold tabular-nums">
                  S/ {{ formatAmount(transactionData.ingresosBank || 0) }}
                </span>
              </div>
              <div class="flex justify-between text-red-700">
                <span>- Gastos digitales:</span>
                <span class="font-semibold tabular-nums">
                  S/ {{ formatAmount(transactionData.egresosBank || 0) }}
                </span>
              </div>
              <div
                v-if="getAjustesBank !== 0"
                class="flex justify-between"
                :class="
                  getAjustesBank > 0 ? 'text-amber-700' : 'text-amber-700'
                "
              >
                <span
                  >{{ getAjustesBank >= 0 ? "+" : "" }} Ajustes digitales:</span
                >
                <span class="font-semibold tabular-nums">
                  S/ {{ formatAmount(getAjustesBank) }}
                </span>
              </div>
              <div
                class="pt-2 border-t border-purple-300 flex justify-between font-bold"
              >
                <span>Balance esperado:</span>
                <span class="tabular-nums text-purple-700">
                  S/
                  {{ formatAmount(transactionData.totalBank || 0) }}
                </span>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Notas o comentarios -->
      <div
        v-if="transactionData.notes || transactionData.description"
        class="px-6 pb-6"
      >
        <div class="border-t border-gray-200 pt-4">
          <h3
            class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Notas
          </h3>
          <p class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            {{ transactionData.notes || transactionData.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Cash,
  Coins,
  SmartphoneDevice,
  OpenInWindow,
  Wallet,
  StatsReport,
  GraphUp,
  DatabaseExport,
  WarningCircle,
  InfoCircle,
} from "@iconoir/vue";
import { computed, ref } from "vue";

const props = defineProps({
  transactionData: {
    type: Object,
    required: true,
  },
});

// Estados reactivos para mostrar/ocultar secciones
const showCashBreakdown = ref(false);
const showBankBreakdown = ref(false);
const showDayResume = ref(false);

// Determinar si es apertura o cierre
const isOpening = computed(() => {
  return props.transactionData.type === "opening";
});

// Obtener balance de efectivo
const getCashBalance = computed(() => {
  if (isOpening.value) {
    return props.transactionData.realCashBalance || 0;
  } else {
    return props.transactionData.cashAmount || 0;
  }
});

// Obtener balance digital/banco
const getBankBalance = computed(() => {
  if (isOpening.value) {
    return props.transactionData.realBankBalance || 0;
  } else {
    return props.transactionData.bankAmount || 0;
  }
});

// Calcular total general
const getTotalBalance = computed(() => {
  return getCashBalance.value + getBankBalance.value;
});

// Verificar si hay diferencias (solo para cierres)
const hasDifferences = computed(() => {
  if (isOpening.value) return false;
  return cashDifference.value !== 0 || bankDifference.value !== 0;
});

// Calcular diferencias
const cashDifference = computed(() => {
  if (isOpening.value) return 0;
  const expected = props.transactionData.expectedCashBalance || 0;
  const real = props.transactionData.cashAmount || 0;
  return real - expected;
});

const bankDifference = computed(() => {
  if (isOpening.value) return 0;
  const expected = props.transactionData.expectedBankBalance || 0;
  const real = props.transactionData.bankAmount || 0;
  return real - expected;
});

// Calcular diferencia total
const totalDifference = computed(() => {
  return cashDifference.value + bankDifference.value;
});

// Computed properties para el resumen del día
const getSaldoInicial = computed(() => {
  return (
    (props.transactionData.initialCashBalance || 0) +
    (props.transactionData.initialBankBalance || 0)
  );
});

const getTotalIngresos = computed(() => {
  return (
    (props.transactionData.ingresosCash || 0) +
    (props.transactionData.ingresosBank || 0)
  );
});

const getTotalEgresos = computed(() => {
  return (
    (props.transactionData.egresosCash || 0) +
    (props.transactionData.egresosBank || 0)
  );
});

const getResultadoOperacional = computed(() => {
  return getTotalIngresos.value - getTotalEgresos.value;
});

const getTotalAjustes = computed(() => {
  return (
    (props.transactionData.cashDifference || 0) +
    (props.transactionData.bankDifference || 0)
  );
});

const getAjustesCash = computed(() => {
  return props.transactionData.cashDifference || 0;
});

const getAjustesBank = computed(() => {
  return props.transactionData.bankDifference || 0;
});

// Funciones de formato
function formatAmount(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "0.00";
  return amount.toFixed(2);
}

function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<style scoped>
/* Números tabulares para mejor alineación */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Animación de expansión para secciones colapsables */
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

/* Rotación para el icono de expansión */
.rotate-180 {
  transform: rotate(180deg);
}

/* Estabilidad de layout */
.shrink-0 {
  flex-shrink: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid.grid-cols-2 {
    gap: 0.75rem;
  }
}
</style>
