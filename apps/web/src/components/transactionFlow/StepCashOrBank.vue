<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        ¿Cómo se realizó el pago?
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Selecciona el método de pago utilizado en esta transacción
      </p>
      <!-- Mostrar monto total para AddStock -->
      <p
        v-if="isAddStockFlow && totalAmount > 0"
        class="text-lg font-semibold text-gray-700 mt-2"
      >
        Monto a pagar:
        <span class="text-green-600">S/ {{ totalAmount.toFixed(2) }}</span>
      </p>
    </div>

    <!-- Opciones de cuenta -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-lg mx-auto"
    >
      <!-- Opción Efectivo -->
      <div class="relative group">
        <button
          @click="handleSelectedAccount('cash')"
          :disabled="isAddStockFlow && !canPayWithCash"
          :class="[
            'w-full p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-4 shadow-sm hover:shadow-md',
            getCurrentAccount() === 'cash'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25'
              : isAddStockFlow && !canPayWithCash
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
              : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200 hover:border-green-200',
          ]"
        >
          <div class="p-3 rounded-full bg-white/20 backdrop-blur-sm">
            <Coins
              :class="[
                'w-8 h-8 transition-colors duration-200',
                getCurrentAccount() === 'cash'
                  ? 'text-white'
                  : isAddStockFlow && !canPayWithCash
                  ? 'text-gray-400'
                  : 'text-green-500',
              ]"
            />
          </div>
          <div class="text-center">
            <span class="text-lg font-semibold block">Efectivo</span>
            <span class="text-xs opacity-80">Dinero físico</span>
            <!-- Mostrar saldo disponible para AddStock -->
            <div
              v-if="isAddStockFlow"
              class="mt-2 pt-2 border-t border-white/20"
            >
              <span
                :class="[
                  'text-xs font-medium block',
                  getCurrentAccount() === 'cash'
                    ? 'text-white'
                    : canPayWithCash
                    ? 'text-green-600'
                    : 'text-red-500',
                ]"
              >
                💰 Disponible: S/ {{ cashBalance.toFixed(2) }}
              </span>
            </div>
          </div>
        </button>

        <!-- Tooltip de ayuda -->
        <div
          class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
        >
          <div class="text-center">
            <strong>Incluye:</strong> Billetes, monedas, dinero en caja
          </div>
        </div>
      </div>

      <!-- Opción Digital -->
      <div class="relative group">
        <button
          @click="handleSelectedAccount('bank')"
          :disabled="isAddStockFlow && !canPayWithBank"
          :class="[
            'w-full p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-4 shadow-sm hover:shadow-md',
            getCurrentAccount() === 'bank'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/25'
              : isAddStockFlow && !canPayWithBank
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
              : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-200',
          ]"
        >
          <div class="p-3 rounded-full bg-white/20 backdrop-blur-sm">
            <SmartphoneDevice
              :class="[
                'w-8 h-8 transition-colors duration-200',
                getCurrentAccount() === 'bank'
                  ? 'text-white'
                  : isAddStockFlow && !canPayWithBank
                  ? 'text-gray-400'
                  : 'text-purple-500',
              ]"
            />
          </div>
          <div class="text-center">
            <span class="text-lg font-semibold block">Yape/Plin</span>
            <span class="text-xs opacity-80">Pago digital</span>
            <!-- Mostrar saldo disponible para AddStock -->
            <div
              v-if="isAddStockFlow"
              class="mt-2 pt-2 border-t border-white/20"
            >
              <span
                :class="[
                  'text-xs font-medium block',
                  getCurrentAccount() === 'bank'
                    ? 'text-white'
                    : canPayWithBank
                    ? 'text-purple-600'
                    : 'text-red-500',
                ]"
              >
                💰 Disponible: S/ {{ bankBalance.toFixed(2) }}
              </span>
            </div>
          </div>
        </button>

        <!-- Tooltip de ayuda -->
        <div
          class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
        >
          <div class="text-center">
            <strong>Incluye:</strong> Yape, Plin, transferencias bancarias
          </div>
        </div>
      </div>
    </div>

    <!-- Indicador de selección -->
    <div v-if="getCurrentAccount()" class="text-center">
      <div
        class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600"
      >
        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        Método seleccionado:
        <span class="font-medium">
          {{ getAccountLabel(getCurrentAccount()) }}
        </span>
      </div>
    </div>

    <!-- Advertencia de fondos insuficientes -->
    <div
      v-if="isAddStockFlow && totalAmount > 0 && !hasAnyValidAccount"
      class="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-4"
    >
      <div class="flex items-start gap-3">
        <WarningTriangle class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-medium text-red-800">
            ⚠️ Fondos insuficientes
          </p>
          <p class="text-xs text-red-600 mt-1">
            No hay suficiente saldo en ninguna cuenta para cubrir esta compra de
            S/ {{ totalAmount.toFixed(2) }}.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { Coins, SmartphoneDevice, WarningTriangle } from "@iconoir/vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { useRemoveStockFlowStore } from "@/stores/Inventory/RemoveStockFlow.js";
import { useAddStockFlowStore } from "@/stores/Inventory/AddStockFlow.js";
import { useDailySummary } from "@/composables/useDailySummary";
import { useRoute } from "vue-router";

const route = useRoute();
const flow = useTransactionFlowStore();
const transactionStore = useTransactionStore();
const removeStockFlow = useRemoveStockFlowStore();
const addStockFlow = useAddStockFlowStore();
const { getTodayDailySummary } = useDailySummary();

// Determinar el tipo de flow actual
const isRemoveStockFlow = route.name === "RemoveStock";
const isAddStockFlow = route.name === "AddStock";

// Estado para el dailySummary
const dailySummary = ref(null);

// Cargar dailySummary al montar (para AddStock)
onMounted(async () => {
  if (isAddStockFlow) {
    dailySummary.value = await getTodayDailySummary();
    console.log("📊 DailySummary cargado para AddStock:", dailySummary.value);
  }
});

// Computed: Calcular balance disponible por cuenta desde dailySummary
const cashBalance = computed(() => {
  if (!isAddStockFlow || !dailySummary.value) return 0;

  // Usar el balance esperado (antes de ajustes de cierre)
  const balance = dailySummary.value?.balances?.expected?.cash || 0;

  console.log("💰 Cash Balance desde dailySummary:", balance);
  return balance;
});

const bankBalance = computed(() => {
  if (!isAddStockFlow || !dailySummary.value) return 0;

  // Usar el balance esperado (antes de ajustes de cierre)
  const balance = dailySummary.value?.balances?.expected?.bank || 0;

  console.log("🏦 Bank Balance desde dailySummary:", balance);
  return balance;
});

// Computed: Obtener el monto total de la compra (para AddStock)
const totalAmount = computed(() => {
  if (!isAddStockFlow) return 0;
  const quantity = Number(addStockFlow.addStockData.quantity) || 0;
  const cost = Number(addStockFlow.addStockData.cost) || 0;
  return quantity * cost;
});

// Computed: Validar si se puede pagar con cada cuenta
const canPayWithCash = computed(() => {
  if (!isAddStockFlow) return true;
  return cashBalance.value >= totalAmount.value;
});

const canPayWithBank = computed(() => {
  if (!isAddStockFlow) return true;
  return bankBalance.value >= totalAmount.value;
});

// Computed: Verificar si hay al menos una cuenta válida
const hasAnyValidAccount = computed(() => {
  if (!isAddStockFlow) return true;
  return canPayWithCash.value || canPayWithBank.value;
});

const handleSelectedAccount = (account) => {
  // Para AddStock, validar fondos antes de continuar
  if (isAddStockFlow) {
    const hasEnoughFunds =
      account === "cash" ? canPayWithCash.value : canPayWithBank.value;

    if (!hasEnoughFunds) {
      console.warn(
        `⚠️ No hay fondos suficientes en ${account} para cubrir S/ ${totalAmount.value.toFixed(
          2
        )}`
      );
      return;
    }
  }

  if (isRemoveStockFlow) {
    // Si estamos en RemoveStock, usar el removeStockFlow
    removeStockFlow.setAccount(account);
    removeStockFlow.nextStep();
  } else if (isAddStockFlow) {
    // Si estamos en AddStock, usar el addStockFlow
    addStockFlow.setAccount(account);
    addStockFlow.nextStep();
  } else {
    // Si estamos en Transaction normal, usar transactionStore
    transactionStore.modifyTransactionToAddAccount(account);
    flow.nextStep();
  }
};

const getAccountLabel = (account) => {
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
  };
  return labels[account] || account;
};

// Obtener el account actual según el flow
const getCurrentAccount = () => {
  if (isRemoveStockFlow) {
    return removeStockFlow.removeStockData.account;
  } else if (isAddStockFlow) {
    return addStockFlow.addStockData.account;
  }
  return transactionStore.transactionToAdd.value.account;
};
</script>
