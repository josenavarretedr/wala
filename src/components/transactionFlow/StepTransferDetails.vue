<template>
  <div class="space-y-6">
    <!-- Título simplificado -->
    <div class="text-center space-y-2">
      <h3 class="text-lg font-semibold text-gray-800">
        Detalles de la Transferencia
      </h3>
      <p class="text-sm text-gray-500">Configura el origen, destino y monto</p>
    </div>

    <!-- Formulario de transferencia -->
    <div class="max-w-lg mx-auto space-y-6">
      <!-- SELECCIÓN DE CUENTAS EN GRID -->
      <div class="space-y-3">
        <label class="text-sm font-medium text-gray-700 block">
          Cuenta Origen
        </label>
        <div class="grid grid-cols-2 gap-3">
          <!-- Efectivo -->
          <button
            @click="fromAccount = 'cash'"
            :class="[
              'p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-2 shadow-sm border',
              fromAccount === 'cash'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25 border-green-500'
                : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border-gray-200 hover:border-green-200',
            ]"
          >
            <div
              :class="[
                'p-2 rounded-full transition-colors duration-200',
                fromAccount === 'cash' ? 'bg-white/20' : 'bg-green-100',
              ]"
            >
              <Coins
                :class="[
                  'w-5 h-5',
                  fromAccount === 'cash' ? 'text-white' : 'text-green-500',
                ]"
              />
            </div>
            <span class="text-sm font-semibold">Efectivo</span>
            <span class="text-xs opacity-80">Dinero físico</span>
          </button>

          <!-- Yape/Plin -->
          <button
            @click="fromAccount = 'bank'"
            :class="[
              'p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-2 shadow-sm border',
              fromAccount === 'bank'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/25 border-purple-500'
                : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border-gray-200 hover:border-purple-200',
            ]"
          >
            <div
              :class="[
                'p-2 rounded-full transition-colors duration-200',
                fromAccount === 'bank' ? 'bg-white/20' : 'bg-purple-100',
              ]"
            >
              <SmartphoneDevice
                :class="[
                  'w-5 h-5',
                  fromAccount === 'bank' ? 'text-white' : 'text-purple-500',
                ]"
              />
            </div>
            <span class="text-sm font-semibold">Yape/Plin</span>
            <span class="text-xs opacity-80">Pago digital</span>
          </button>
        </div>

        <!-- Saldo disponible origen -->
        <div
          v-if="fromAccount"
          class="text-xs text-gray-600 text-center bg-gray-50 rounded-lg py-2 px-3"
        >
          Saldo disponible:
          <span class="font-semibold">S/ {{ maxAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- BOTÓN DE INTERCAMBIO -->
      <div class="flex justify-center">
        <button
          @click="swapAccounts"
          :disabled="!fromAccount || !toAccount"
          :class="[
            'p-3 rounded-full transition-all duration-200',
            fromAccount && toAccount
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-110 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          ]"
          title="Intercambiar cuentas"
        >
          <RefreshDouble
            :class="[
              'w-5 h-5 transition-transform duration-300',
              fromAccount && toAccount ? 'hover:rotate-180' : '',
            ]"
          />
        </button>
      </div>

      <!-- CUENTA DESTINO -->
      <div class="space-y-3">
        <label class="text-sm font-medium text-gray-700 block">
          Cuenta Destino
        </label>
        <div class="grid grid-cols-2 gap-3">
          <!-- Efectivo -->
          <button
            @click="toAccount = 'cash'"
            :disabled="!fromAccount || fromAccount === 'cash'"
            :class="[
              'p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-2 shadow-sm border',
              toAccount === 'cash'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25 border-green-500'
                : fromAccount === 'cash'
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border-gray-200 hover:border-green-200',
            ]"
          >
            <div
              :class="[
                'p-2 rounded-full transition-colors duration-200',
                toAccount === 'cash'
                  ? 'bg-white/20'
                  : fromAccount === 'cash'
                  ? 'bg-gray-200'
                  : 'bg-green-100',
              ]"
            >
              <Coins
                :class="[
                  'w-5 h-5',
                  toAccount === 'cash'
                    ? 'text-white'
                    : fromAccount === 'cash'
                    ? 'text-gray-400'
                    : 'text-green-500',
                ]"
              />
            </div>
            <span class="text-sm font-semibold">Efectivo</span>
            <span class="text-xs opacity-80">
              {{ fromAccount === "cash" ? "No disponible" : "Dinero físico" }}
            </span>
          </button>

          <!-- Yape/Plin -->
          <button
            @click="toAccount = 'bank'"
            :disabled="!fromAccount || fromAccount === 'bank'"
            :class="[
              'p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-2 shadow-sm border',
              toAccount === 'bank'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/25 border-purple-500'
                : fromAccount === 'bank'
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border-gray-200 hover:border-purple-200',
            ]"
          >
            <div
              :class="[
                'p-2 rounded-full transition-colors duration-200',
                toAccount === 'bank'
                  ? 'bg-white/20'
                  : fromAccount === 'bank'
                  ? 'bg-gray-200'
                  : 'bg-purple-100',
              ]"
            >
              <SmartphoneDevice
                :class="[
                  'w-5 h-5',
                  toAccount === 'bank'
                    ? 'text-white'
                    : fromAccount === 'bank'
                    ? 'text-gray-400'
                    : 'text-purple-500',
                ]"
              />
            </div>
            <span class="text-sm font-semibold">Yape/Plin</span>
            <span class="text-xs opacity-80">
              {{ fromAccount === "bank" ? "No disponible" : "Pago digital" }}
            </span>
          </button>
        </div>
      </div>

      <!-- MONTO -->
      <div class="space-y-3">
        <label class="text-sm font-medium text-gray-700 block">
          Monto a Transferir
        </label>
        <div class="relative">
          <input
            v-model.number="amount"
            type="number"
            step="0.01"
            min="0"
            :max="maxAmount"
            placeholder="0.00"
            :disabled="!fromAccount || !toAccount"
            class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
          />
          <div
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold"
          >
            S/
          </div>
        </div>

        <!-- Alerta de saldo insuficiente -->
        <div
          v-if="fromAccount && maxAmount === 0"
          class="text-xs text-amber-600 bg-amber-50 rounded-lg py-2 px-3 border border-amber-200"
        >
          ⚠️ No hay saldo suficiente en {{ fromAccountLabel }}
        </div>
      </div>

      <!-- RESUMEN VISUAL -->
      <div
        v-if="fromAccount && toAccount && amount && amount > 0"
        class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100"
      >
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-gray-600">{{
              getAccountLabel(fromAccount)
            }}</span>
          </div>
          <ArrowRight class="w-4 h-4 text-gray-400" />
          <div class="flex items-center gap-2">
            <span class="text-gray-600">{{ getAccountLabel(toAccount) }}</span>
            <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
          </div>
        </div>
        <div class="mt-3 text-center">
          <span class="text-2xl font-bold text-gray-800">
            S/ {{ formatAmount(amount) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import {
  Coins,
  SmartphoneDevice,
  ArrowRight,
  ArrowDown,
  Calculator,
  Check,
  RefreshDouble,
} from "@iconoir/vue";

const transactionStore = useTransactionStore();
const accountsBalanceStore = useAccountsBalanceStore();

// Variables reactivas locales
const fromAccount = ref("cash"); // Por defecto: Cash
const toAccount = ref("bank"); // Por defecto: Bank
const amount = ref(null);

// ===== VALIDACIÓN DE MONTOS MÁXIMOS =====

// Calcular el monto máximo disponible en la cuenta de origen
const maxAmount = computed(() => {
  if (!fromAccount.value) return 0;

  // Cargar datos del store si aún no están cargados
  if (!accountsBalanceStore.hasDailySummary) {
    return 0;
  }

  if (fromAccount.value === "cash") {
    // El máximo es el saldo esperado en efectivo (antes de esta transferencia)
    return Math.max(0, accountsBalanceStore.expectedFinalCash);
  } else if (fromAccount.value === "bank") {
    // El máximo es el saldo esperado en banco (antes de esta transferencia)
    return Math.max(0, accountsBalanceStore.expectedFinalBank);
  }

  return 0;
});

// Etiqueta de la cuenta de origen
const fromAccountLabel = computed(() => {
  const labels = {
    cash: "efectivo",
    bank: "digital/banco",
  };
  return labels[fromAccount.value] || "cuenta";
});

// Validar que el monto no exceda el máximo disponible
watch(amount, (newAmount) => {
  if (newAmount && newAmount > maxAmount.value) {
    // Limitar automáticamente al máximo disponible
    amount.value = maxAmount.value;
    console.warn(
      `⚠️ Monto limitado a S/ ${maxAmount.value.toFixed(
        2
      )} (saldo disponible en ${fromAccountLabel.value})`
    );
  }
  transactionStore.setExpenseAmount(amount.value);
});

// Configurar valores por defecto al montar el componente
onMounted(async () => {
  // Intentar cargar dailySummary para obtener saldos actuales
  await accountsBalanceStore.loadFromDailySummary();

  // Establecer valores por defecto en el store
  transactionStore.setTransferFromAccount(fromAccount.value);
  transactionStore.setTransferToAccount(toAccount.value);

  // Si ya hay valores en el store, usarlos
  if (transactionStore.transactionToAdd.value?.fromAccount) {
    fromAccount.value = transactionStore.transactionToAdd.value.fromAccount;
  }
  if (transactionStore.transactionToAdd.value?.toAccount) {
    toAccount.value = transactionStore.transactionToAdd.value.toAccount;
  }
  if (transactionStore.transactionToAdd.value?.amount) {
    amount.value = transactionStore.transactionToAdd.value.amount;
  }
});

// Watchers para sincronizar con el store
watch(fromAccount, (newFromAccount) => {
  transactionStore.setTransferFromAccount(newFromAccount);
  // Si el destino es igual al origen, cambiar automáticamente
  if (newFromAccount === toAccount.value) {
    const newToAccount = newFromAccount === "cash" ? "bank" : "cash";
    toAccount.value = newToAccount;
    transactionStore.setTransferToAccount(newToAccount);
  }

  // Validar que el monto actual no exceda el nuevo máximo
  if (amount.value && amount.value > maxAmount.value) {
    amount.value = maxAmount.value;
  }
});

watch(toAccount, (newToAccount) => {
  // Solo actualizar si no es la misma cuenta de origen
  if (newToAccount !== fromAccount.value) {
    transactionStore.setTransferToAccount(newToAccount);
  }
});

// Función para obtener etiquetas de cuentas
const getAccountLabel = (account) => {
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
  };
  return labels[account] || "";
};

// Función para formatear el monto
const formatAmount = (value) => {
  if (!value) return "0.00";
  return parseFloat(value).toFixed(2);
};

// Función para intercambiar las cuentas
const swapAccounts = () => {
  if (!fromAccount.value || !toAccount.value) return;

  // Intercambiar los valores
  const temp = fromAccount.value;
  fromAccount.value = toAccount.value;
  toAccount.value = temp;

  // Los watchers se encargarán de actualizar el store y validar el monto
  console.log(
    `🔄 Cuentas intercambiadas: ${getAccountLabel(
      fromAccount.value
    )} ➡️ ${getAccountLabel(toAccount.value)}`
  );
};
</script>
