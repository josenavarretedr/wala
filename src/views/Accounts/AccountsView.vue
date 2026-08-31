<template>
  <div class="min-h-screen pb-24 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          @click="goBack"
          class="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm"
          title="Volver"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>

        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
              Cuentas y Saldos
            </h1>
            <span
              v-if="hasOpening"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              Día aperturado
            </span>
            <span
              v-else
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
            >
              Sin apertura
            </span>
          </div>
          <p class="text-xs sm:text-sm text-gray-500 mt-0.5">
            Estado de liquidez en tiempo real de tu negocio
          </p>
        </div>
      </div>

      <!-- Botón recargar / indicador de tiempo real -->
      <button
        @click="refreshData"
        :disabled="isRefreshing"
        class="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50"
      >
        <svg
          :class="['w-4 h-4 text-gray-500', isRefreshing && 'animate-spin']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span class="hidden sm:inline">{{ isRefreshing ? "Actualizando..." : "Actualizar" }}</span>
      </button>
    </div>

    <!-- Spinner de carga inicial -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <SpinnerIcon size="xl" class="text-blue-600 mx-auto mb-4" />
        <p class="text-sm text-gray-500">Cargando estado de cuentas...</p>
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- Card Saldo Total Consolidado -->
      <div
        class="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        <!-- Decoración de fondo -->
        <div
          class="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute -left-10 -top-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
        ></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 text-blue-200/80 text-xs sm:text-sm font-medium mb-1">
              <Wallet class="w-4 h-4" />
              <span>Saldo Total Disponible</span>
            </div>
            <div class="text-3xl sm:text-5xl font-extrabold tracking-tight tabular-nums">
              S/ {{ saldoActual.toFixed(2) }}
            </div>
            <p class="text-xs text-blue-200/60 mt-1">
              Saldo inicial (S/ {{ saldoInicial.toFixed(2) }}) + Movimientos del día
            </p>
          </div>

          <!-- Métricas de resumen rápido -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <div>
              <p class="text-[11px] text-blue-200/70">Ingresos hoy</p>
              <p class="text-sm sm:text-base font-bold text-emerald-400 tabular-nums">
                +S/ {{ totalIngresos.toFixed(2) }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-blue-200/70">Salidas hoy</p>
              <p class="text-sm sm:text-base font-bold text-rose-400 tabular-nums">
                -S/ {{ totalEgresos.toFixed(2) }}
              </p>
            </div>
            <div class="col-span-2 sm:col-span-1">
              <p class="text-[11px] text-blue-200/70">Resultado neto</p>
              <p
                :class="[
                  'text-sm sm:text-base font-bold tabular-nums',
                  resultadoOperacional >= 0 ? 'text-emerald-300' : 'text-rose-300',
                ]"
              >
                {{ resultadoOperacional >= 0 ? "+" : "" }}S/ {{ resultadoOperacional.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid de Cards Específicas: Cash, Bank & Detracciones -->
      <div
        :class="[
          'grid gap-4 sm:gap-6',
          showDetractionAccount
            ? 'grid-cols-1 md:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2',
        ]"
      >
        <!-- 💵 Card 1: EFECTIVO (CASH) -->
        <div
          @click="selectedTab = 'cash'"
          :class="[
            'bg-white rounded-2xl border p-5 sm:p-6 transition-all duration-200 cursor-pointer relative overflow-hidden',
            selectedTab === 'cash'
              ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-md',
          ]"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Coins class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900">
                  Efectivo en Caja
                </h3>
                <p class="text-xs text-gray-500">Caja física / Dinero en mano</p>
              </div>
            </div>
            <span
              v-if="selectedTab === 'cash'"
              class="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800"
            >
              Filtrado
            </span>
          </div>

          <div class="mb-4">
            <p class="text-xs text-gray-500 font-medium">Saldo disponible</p>
            <p class="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums">
              S/ {{ saldoActualCash.toFixed(2) }}
            </p>
          </div>

          <!-- Desglose Efectivo -->
          <div class="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p class="text-gray-400 text-[10px]">Apertura</p>
              <p class="font-semibold text-gray-700 tabular-nums">
                S/ {{ openingCash.toFixed(2) }}
              </p>
            </div>
            <div>
              <p class="text-emerald-600 text-[10px]">Entradas</p>
              <p class="font-semibold text-emerald-700 tabular-nums">
                +S/ {{ cashIncomeTotal.toFixed(2) }}
              </p>
            </div>
            <div>
              <p class="text-rose-600 text-[10px]">Salidas</p>
              <p class="font-semibold text-rose-700 tabular-nums">
                -S/ {{ cashExpenseTotal.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 🏦 Card 2: BANCOS / DIGITAL (BANK) -->
        <div
          @click="selectedTab = 'bank'"
          :class="[
            'bg-white rounded-2xl border p-5 sm:p-6 transition-all duration-200 cursor-pointer relative overflow-hidden',
            selectedTab === 'bank'
              ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
              : 'border-gray-100 shadow-sm hover:border-indigo-300 hover:shadow-md',
          ]"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Bank class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900">
                  Bancos y Digital
                </h3>
                <p class="text-xs text-gray-500">Cuentas, Yape, Plin y Tarjetas</p>
              </div>
            </div>
            <span
              v-if="selectedTab === 'bank'"
              class="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800"
            >
              Filtrado
            </span>
          </div>

          <div class="mb-4">
            <p class="text-xs text-gray-500 font-medium">Saldo disponible</p>
            <p class="text-2xl sm:text-3xl font-extrabold text-indigo-700 tabular-nums">
              S/ {{ saldoActualBank.toFixed(2) }}
            </p>
          </div>

          <!-- Desglose Bancos -->
          <div class="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p class="text-gray-400 text-[10px]">Apertura</p>
              <p class="font-semibold text-gray-700 tabular-nums">
                S/ {{ openingBank.toFixed(2) }}
              </p>
            </div>
            <div>
              <p class="text-indigo-600 text-[10px]">Entradas</p>
              <p class="font-semibold text-indigo-700 tabular-nums">
                +S/ {{ bankIncomeTotal.toFixed(2) }}
              </p>
            </div>
            <div>
              <p class="text-rose-600 text-[10px]">Salidas</p>
              <p class="font-semibold text-rose-700 tabular-nums">
                -S/ {{ bankExpenseTotal.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 🌾 Card 3: CUENTA DE DETRACCIONES (DETRACTION) -->
        <div
          v-if="showDetractionAccount"
          @click="selectedTab = 'detraction'"
          :class="[
            'bg-white rounded-2xl border p-5 sm:p-6 transition-all duration-200 cursor-pointer relative overflow-hidden',
            selectedTab === 'detraction'
              ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'border-gray-100 shadow-sm hover:border-amber-300 hover:shadow-md',
          ]"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900">
                  Cuenta Detracciones
                </h3>
                <p class="text-xs text-gray-500">Banco de la Nación / SPOT</p>
              </div>
            </div>
            <span
              v-if="selectedTab === 'detraction'"
              class="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800"
            >
              Filtrado
            </span>
          </div>

          <div class="mb-4">
            <p class="text-xs text-gray-500 font-medium">Saldo disponible</p>
            <p class="text-2xl sm:text-3xl font-extrabold text-amber-700 tabular-nums">
              S/ {{ saldoActualDetraction.toFixed(2) }}
            </p>
          </div>

          <!-- Desglose Detracciones -->
          <div class="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p class="text-gray-400 text-[10px]">Apertura</p>
              <p class="font-semibold text-gray-700 tabular-nums">
                S/ 0.00
              </p>
            </div>
            <div>
              <p class="text-amber-600 text-[10px]">Entradas</p>
              <p class="font-semibold text-amber-700 tabular-nums">
                +S/ {{ detractionIncomeTotal.toFixed(2) }}
              </p>
            </div>
            <div>
              <p class="text-rose-600 text-[10px]">Salidas</p>
              <p class="font-semibold text-rose-700 tabular-nums">
                -S/ {{ detractionExpenseTotal.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Transacciones y Movimientos de Cuenta -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
          <div>
            <h2 class="text-lg font-bold text-gray-900">
              Movimientos de Cuenta
            </h2>
            <p class="text-xs text-gray-500">
              Transacciones que aumentaron o disminuyeron el dinero real en cuentas
            </p>
          </div>

          <!-- Selector de Pestañas / Filtro de Cuentas -->
          <div class="flex bg-gray-100 p-1 rounded-xl gap-1 text-xs font-medium self-start sm:self-auto flex-wrap">
            <button
              @click="selectedTab = 'all'"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all duration-200',
                selectedTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-900',
              ]"
            >
              Todos ({{ filteredTransactions.length }})
            </button>
            <button
              @click="selectedTab = 'cash'"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5',
                selectedTab === 'cash'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-emerald-700',
              ]"
            >
              <Coins class="w-3.5 h-3.5" />
              Efectivo ({{ cashTransactionsCount }})
            </button>
            <button
              @click="selectedTab = 'bank'"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5',
                selectedTab === 'bank'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-indigo-700',
              ]"
            >
              <Bank class="w-3.5 h-3.5" />
              Bancos ({{ bankTransactionsCount }})
            </button>
            <button
              v-if="showDetractionAccount"
              @click="selectedTab = 'detraction'"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5',
                selectedTab === 'detraction'
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-amber-700',
              ]"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Detracciones ({{ detractionTransactionsCount }})
            </button>
          </div>
        </div>

        <!-- Lista de transacciones -->
        <div v-if="filteredTransactions.length > 0" class="space-y-3 pt-2">
          <component
            v-for="(record, index) in filteredTransactions"
            :is="getRecordComponent(record.type)"
            :key="record.uuid || index"
            :record="record"
            class="transition-all duration-200 hover:shadow-md"
          />
        </div>

        <!-- Estado vacío -->
        <div
          v-else
          class="bg-gray-50 rounded-xl p-8 text-center flex flex-col items-center justify-center"
        >
          <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3 text-gray-400">
            <Wallet class="w-6 h-6" />
          </div>
          <h4 class="text-base font-semibold text-gray-800 mb-1">
            No hay movimientos en
            {{
              selectedTab === 'cash'
                ? 'Efectivo'
                : selectedTab === 'bank'
                ? 'Bancos'
                : selectedTab === 'detraction'
                ? 'Detracciones'
                : 'las cuentas'
            }}
          </h4>
          <p class="text-xs sm:text-sm text-gray-500 max-w-sm">
            Las transacciones con cobros, pagos, ventas pagadas o transferencias se mostrarán aquí cuando se registren.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import {
  Wallet,
  Coins,
  Bank,
} from "@iconoir/vue";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useUserStore } from "@/stores/useUserStore";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import CardStandard from "@/components/HistorialRecords/CardStandard.vue";
import CardTransfer from "@/components/HistorialRecords/CardTransfer.vue";
import CardOpening from "@/components/HistorialRecords/CardOpening.vue";
import CardClosure from "@/components/HistorialRecords/CardClosure.vue";
import { calculatePaymentStatus } from "@/utils/paymentCalculator";

const router = useRouter();
const accountsBalanceStore = useAccountsBalanceStore();
const transactionStore = useTransactionStore();
const businessStore = useBusinessStore();
const userStore = useUserStore();

const isLoading = ref(true);
const isRefreshing = ref(false);
const selectedTab = ref("all"); // 'all' | 'cash' | 'bank' | 'detraction'

const goBack = () => {
  router.back();
};

// Helper para obtener el monto pagado / cobrado efectivo
const getEffectiveAmount = (tx, targetAccount = null) => {
  if (tx.type === "payment") {
    return tx.amount || 0;
  }
  if ((tx.type === "income" || tx.type === "expense") && tx.payments) {
    if (tx.payments.length > 0) {
      const initial = tx.payments[0].amount || 0;
      if (tx.type === "income" && tx.isSubjectToDetraction && targetAccount !== "detraction") {
        return tx.netAmount ?? Math.max(0, initial - (tx.detractionAmount || 0));
      }
      return initial;
    }
    return 0; // Crédito sin pago aún
  }
  if (tx.type === "income" && tx.isSubjectToDetraction) {
    if (targetAccount === "detraction") {
      return tx.detractionAmount || 0;
    }
    return tx.netAmount ?? (tx.amount - (tx.detractionAmount || 0));
  }
  return tx.amount || 0;
};

// Estado de apertura
const opening = computed(() => accountsBalanceStore.openingTransaction);
const hasOpening = computed(() => !!opening.value);

const saldoInicial = computed(() => accountsBalanceStore.saldoInicial);
const openingCash = computed(() => {
  if (opening.value) {
    return opening.value.realCashBalance ?? opening.value.expectedCashBalance ?? 0;
  }
  return accountsBalanceStore.saldoInicialCash || 0;
});
const openingBank = computed(() => {
  if (opening.value) {
    return opening.value.realBankBalance ?? opening.value.expectedBankBalance ?? 0;
  }
  return accountsBalanceStore.saldoInicialBank || 0;
});

// Todas las transacciones del store
const allTransactions = computed(() => {
  return transactionStore.transactionsInStore.value || [];
});

// Verificación de rubro Cooperativa Agrícola o existencia de transacciones con detracción
const isCooperativaAgricola = computed(() => {
  const industry = businessStore.business?.industry || userStore.currentBusiness?.industry;
  return industry === "cooperativa_agricola";
});

const hasDetractionTransactions = computed(() => {
  return allTransactions.value.some(
    (tx) =>
      tx.isSubjectToDetraction ||
      tx.account === "detraction" ||
      tx.toAccount === "detraction" ||
      tx.fromAccount === "detraction"
  );
});

const showDetractionAccount = computed(() => {
  return isCooperativaAgricola.value || hasDetractionTransactions.value;
});

// Totales de entradas y salidas en Efectivo
const cashIncomeTotal = computed(() => {
  const txs = allTransactions.value;
  const incomes = txs
    .filter(
      (tx) =>
        tx.type === "income" &&
        tx.account === "cash" &&
        tx.subcategory !== "opening_adjustment",
    )
    .reduce((sum, tx) => sum + getEffectiveAmount(tx, "cash"), 0);
  const cobros = txs
    .filter(
      (tx) =>
        tx.type === "payment" &&
        tx.account === "cash" &&
        (tx.clientId || tx.clientName),
    )
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const transfersIn = txs
    .filter((tx) => tx.type === "transfer" && tx.toAccount === "cash")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  return incomes + cobros + transfersIn;
});

const cashExpenseTotal = computed(() => {
  const txs = allTransactions.value;
  const expenses = txs
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.account === "cash" &&
        tx.category !== "adjustment",
    )
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const pagos = txs
    .filter(
      (tx) =>
        tx.type === "payment" &&
        tx.account === "cash" &&
        (tx.supplierId || tx.supplierName),
    )
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const transfersOut = txs
    .filter((tx) => tx.type === "transfer" && tx.fromAccount === "cash")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  return expenses + pagos + transfersOut;
});

// Totales de entradas y salidas en Banco
const bankIncomeTotal = computed(() => {
  const txs = allTransactions.value;
  const incomes = txs
    .filter(
      (tx) =>
        tx.type === "income" &&
        tx.account === "bank" &&
        tx.subcategory !== "opening_adjustment",
    )
    .reduce((sum, tx) => sum + getEffectiveAmount(tx, "bank"), 0);
  const cobros = txs
    .filter(
      (tx) =>
        tx.type === "payment" &&
        tx.account === "bank" &&
        (tx.clientId || tx.clientName),
    )
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const transfersIn = txs
    .filter((tx) => tx.type === "transfer" && tx.toAccount === "bank")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  return incomes + cobros + transfersIn;
});

const bankExpenseTotal = computed(() => {
  const txs = allTransactions.value;
  const expenses = txs
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.account === "bank" &&
        tx.category !== "adjustment",
    )
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const pagos = txs
    .filter(
      (tx) =>
        tx.type === "payment" &&
        tx.account === "bank" &&
        (tx.supplierId || tx.supplierName),
    )
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const transfersOut = txs
    .filter((tx) => tx.type === "transfer" && tx.fromAccount === "bank")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  return expenses + pagos + transfersOut;
});

// Totales de entradas y salidas en Cuenta de Detracciones
const detractionIncomeTotal = computed(() => {
  const txs = allTransactions.value;
  const incomes = txs
    .filter((tx) => tx.type === "income" && tx.isSubjectToDetraction)
    .reduce((sum, tx) => sum + (tx.detractionAmount || 0), 0);
  const directIncomes = txs
    .filter((tx) => tx.type === "income" && tx.account === "detraction" && !tx.isSubjectToDetraction)
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const transfersIn = txs
    .filter((tx) => tx.type === "transfer" && tx.toAccount === "detraction")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  return incomes + directIncomes + transfersIn;
});

const detractionExpenseTotal = computed(() => {
  const txs = allTransactions.value;
  const expenses = txs
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.account === "detraction" &&
        tx.category !== "adjustment",
    )
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const transfersOut = txs
    .filter((tx) => tx.type === "transfer" && tx.fromAccount === "detraction")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  return expenses + transfersOut;
});

// Saldos actuales
const saldoActualCash = computed(() => {
  if (allTransactions.value.length === 0 && accountsBalanceStore.dailySummary) {
    return accountsBalanceStore.saldoActualCash;
  }
  return openingCash.value + cashIncomeTotal.value - cashExpenseTotal.value;
});

const saldoActualBank = computed(() => {
  if (allTransactions.value.length === 0 && accountsBalanceStore.dailySummary) {
    return accountsBalanceStore.saldoActualBank;
  }
  return openingBank.value + bankIncomeTotal.value - bankExpenseTotal.value;
});

const saldoActualDetraction = computed(() => {
  return detractionIncomeTotal.value - detractionExpenseTotal.value;
});

const saldoActual = computed(() => {
  return (
    saldoActualCash.value +
    saldoActualBank.value +
    (showDetractionAccount.value ? saldoActualDetraction.value : 0)
  );
});

const totalIngresos = computed(() => {
  const txs = allTransactions.value;
  if (txs.length === 0 && accountsBalanceStore.dailySummary) {
    return accountsBalanceStore.totalIngresos;
  }
  const incomes = txs
    .filter((tx) => tx.type === "income" && tx.category !== "adjustment")
    .reduce((sum, tx) => sum + (tx.isSubjectToDetraction ? (tx.amount || 0) : getEffectiveAmount(tx)), 0);
  const cobros = txs
    .filter((tx) => tx.type === "payment" && (tx.clientId || tx.clientName))
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  return incomes + cobros;
});

const totalEgresos = computed(() => {
  const txs = allTransactions.value;
  if (txs.length === 0 && accountsBalanceStore.dailySummary) {
    return accountsBalanceStore.totalEgresos;
  }
  const expenses = txs
    .filter((tx) => tx.type === "expense" && tx.category !== "adjustment")
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  const pagos = txs
    .filter((tx) => tx.type === "payment" && (tx.supplierId || tx.supplierName))
    .reduce((sum, tx) => sum + getEffectiveAmount(tx), 0);
  return expenses + pagos;
});

const resultadoOperacional = computed(() => {
  return totalIngresos.value - totalEgresos.value;
});

// Filtro de si una transacción afecta a Cash
const affectsCash = (tx) => {
  if (tx.type === "opening") return (tx.realCashBalance || 0) > 0;
  if (tx.type === "transfer") return tx.fromAccount === "cash" || tx.toAccount === "cash";
  if (tx.type === "payment") return tx.account === "cash" && (tx.amount || 0) > 0;
  if (tx.type === "income" || tx.type === "expense") {
    return tx.account === "cash" && getEffectiveAmount(tx, "cash") > 0;
  }
  return false;
};

// Filtro de si una transacción afecta a Bank
const affectsBank = (tx) => {
  if (tx.type === "opening") return (tx.realBankBalance || 0) > 0;
  if (tx.type === "transfer") return tx.fromAccount === "bank" || tx.toAccount === "bank";
  if (tx.type === "payment") return tx.account === "bank" && (tx.amount || 0) > 0;
  if (tx.type === "income" || tx.type === "expense") {
    return tx.account === "bank" && getEffectiveAmount(tx, "bank") > 0;
  }
  return false;
};

// Filtro de si una transacción afecta a Detracción
const affectsDetraction = (tx) => {
  if (tx.isSubjectToDetraction && (tx.detractionAmount || 0) > 0) return true;
  if (tx.account === "detraction" && getEffectiveAmount(tx) > 0) return true;
  if (tx.type === "transfer" && (tx.fromAccount === "detraction" || tx.toAccount === "detraction")) return true;
  return false;
};

// Conteo de transacciones por cuenta
const cashTransactionsCount = computed(() => {
  return allTransactions.value.filter(affectsCash).length;
});

const bankTransactionsCount = computed(() => {
  return allTransactions.value.filter(affectsBank).length;
});

const detractionTransactionsCount = computed(() => {
  return allTransactions.value.filter(affectsDetraction).length;
});

// Transacciones filtradas según la pestaña seleccionada
const filteredTransactions = computed(() => {
  const all = allTransactions.value;
  const closure = all.find((tx) => tx.type === "closure");
  const openingTx = all.find((tx) => tx.type === "opening");

  const middle = all
    .filter((tx) => tx.type !== "closure" && tx.type !== "opening" && tx.category !== "adjustment")
    .filter((tx) => {
      if (selectedTab.value === "cash") return affectsCash(tx);
      if (selectedTab.value === "bank") return affectsBank(tx);
      if (selectedTab.value === "detraction") return affectsDetraction(tx);
      return affectsCash(tx) || affectsBank(tx) || affectsDetraction(tx);
    })
    .map((tx) => {
      if (tx.type === "income") {
        return {
          ...tx,
          ...calculatePaymentStatus(tx),
        };
      }
      return tx;
    })
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

  const result = [];
  if (closure && (selectedTab.value === "all" || affectsCash(closure) || affectsBank(closure))) {
    result.push(closure);
  }
  result.push(...middle);
  if (openingTx && (selectedTab.value === "all" || (selectedTab.value === "cash" && affectsCash(openingTx)) || (selectedTab.value === "bank" && affectsBank(openingTx)))) {
    result.push(openingTx);
  }

  return result;
});

function getRecordComponent(type) {
  switch (type) {
    case "closure":
      return CardClosure;
    case "opening":
      return CardOpening;
    case "transfer":
      return CardTransfer;
    default:
      return CardStandard;
  }
}

const loadData = async () => {
  try {
    await accountsBalanceStore.loadFromDailySummary();
    await transactionStore.getTransactionsToday();
  } catch (error) {
    console.error("Error cargando datos de cuentas:", error);
  } finally {
    isLoading.value = false;
  }
};

const refreshData = async () => {
  isRefreshing.value = true;
  try {
    await accountsBalanceStore.forceReloadSummary();
    await transactionStore.getTransactionsToday();
  } catch (error) {
    console.error("Error refrescando datos:", error);
  } finally {
    isRefreshing.value = false;
  }
};

onMounted(async () => {
  accountsBalanceStore.startDailySummaryListener();
  await loadData();
});

onBeforeUnmount(() => {
  accountsBalanceStore.stopDailySummaryListener();
});
</script>

<style scoped>
/* Transiciones suaves */
</style>
