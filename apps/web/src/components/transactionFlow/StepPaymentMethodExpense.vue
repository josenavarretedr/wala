<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Método de Pago
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Selecciona cómo se financiará este gasto
      </p>
      <p
        v-if="totalAmount > 0"
        class="text-lg font-semibold text-gray-700 mt-2"
      >
        Monto total:
        <span class="text-red-600">S/ {{ totalAmount.toFixed(2) }}</span>
      </p>
    </div>

    <!-- Opciones de método de pago -->
    <div class="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
      <!-- Efectivo -->
      <button
        @click="selectPaymentMethod('cash')"
        :disabled="!canSelectCash"
        :class="[
          'p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex flex-col items-center gap-4 shadow-sm hover:shadow-md w-full',
          selectedMethod === 'cash'
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25'
            : !canSelectCash
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 border border-gray-200'
            : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200',
        ]"
      >
        <div class="p-3 rounded-full bg-white/20">
          <svg
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <div class="text-center">
          <span class="text-lg font-semibold block">Efectivo</span>
          <span class="text-xs opacity-80 block">Disponible: S/ {{ cashBalance.toFixed(2) }}</span>
        </div>
      </button>

      <!-- Banco -->
      <button
        @click="selectPaymentMethod('bank')"
        :disabled="!canSelectBank"
        :class="[
          'p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex flex-col items-center gap-4 shadow-sm hover:shadow-md w-full',
          selectedMethod === 'bank'
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/25'
            : !canSelectBank
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 border border-gray-200'
            : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200',
        ]"
      >
        <div class="p-3 rounded-full bg-white/20">
          <svg
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <div class="text-center">
          <span class="text-lg font-semibold block">Banco</span>
          <span class="text-xs opacity-80 block">Disponible: S/ {{ bankBalance.toFixed(2) }}</span>
        </div>
      </button>
    </div>

    <!-- Advertencia de saldo general insuficiente -->
    <div
      v-if="!hasAnyValidAccount"
      class="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-700"
    >
      ⚠️ Fondos insuficientes en ambas cuentas (Efectivo: S/ {{ cashBalance.toFixed(2) }}, Banco: S/ {{ bankBalance.toFixed(2) }}) para realizar este pago.
    </div>

    <!-- Tipo de pago: Completo o Abono -->
    <div v-if="selectedMethod" class="max-w-lg mx-auto space-y-4">
      <div class="bg-gray-50 p-4 rounded-lg">
        <label class="block text-sm font-medium text-gray-700 mb-3">
          ¿Se pagó el monto completo de este gasto?
        </label>

        <div class="space-y-3">
          <!-- Pago Completo -->
          <button
            @click="setPaymentType('complete')"
            :disabled="!canPayComplete"
            :class="[
              'w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between',
              paymentType === 'complete'
                ? 'border-green-500 bg-green-50'
                : !canPayComplete
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 border-gray-200'
                : 'border-gray-200 bg-white hover:border-gray-300',
            ]"
          >
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  paymentType === 'complete' ? 'border-green-500' : 'border-gray-300',
                ]"
              >
                <div
                  v-if="paymentType === 'complete'"
                  class="w-3 h-3 rounded-full bg-green-500"
                ></div>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-800">Pago Completo</div>
                <div class="text-xs text-gray-500">
                  Se paga el total ahora
                </div>
              </div>
            </div>
            <span class="text-lg font-semibold text-green-600"
              >S/ {{ totalAmount.toFixed(2) }}</span
            >
          </button>

          <!-- Abono / Pago Parcial -->
          <button
            @click="setPaymentType('partial')"
            :class="[
              'w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between',
              paymentType === 'partial'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300',
            ]"
          >
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  paymentType === 'partial' ? 'border-orange-500' : 'border-gray-300',
                ]"
              >
                <div
                  v-if="paymentType === 'partial'"
                  class="w-3 h-3 rounded-full bg-orange-500"
                ></div>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-800">
                  Abono / Pago Parcial (A Crédito)
                </div>
                <div class="text-xs text-gray-500">
                  Se hace un abono inicial y el resto a cuenta por pagar
                </div>
              </div>
            </div>
          </button>

          <!-- Crédito Total -->
          <button
            @click="setPaymentType('credit')"
            :class="[
              'w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between',
              paymentType === 'credit'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300',
            ]"
          >
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  paymentType === 'credit' ? 'border-red-500' : 'border-gray-300',
                ]"
              >
                <div
                  v-if="paymentType === 'credit'"
                  class="w-3 h-3 rounded-full bg-red-500"
                ></div>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-800">
                  Crédito Total
                </div>
                <div class="text-xs text-gray-500">
                  Se compra a crédito sin realizar abono inicial (100% por pagar)
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Input de monto parcial -->
      <div
        v-if="paymentType === 'partial'"
        class="bg-orange-50 p-4 rounded-lg space-y-3"
      >
        <label class="block text-sm font-medium text-gray-700">
          Monto del abono inicial
        </label>
        <div class="relative">
          <span
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >S/</span
          >
          <input
            v-model.number="partialAmount"
            type="number"
            step="0.01"
            min="0"
            :max="totalAmount"
            class="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none text-lg font-semibold"
            placeholder="0.00"
            @input="handlePartialAmountInput"
          />
        </div>

        <!-- Validación y cálculo de saldo -->
        <div class="space-y-2 text-sm">
          <div class="flex justify-between text-gray-600">
            <span>Total del gasto:</span>
            <span class="font-medium">S/ {{ totalAmount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Abono inicial:</span>
            <span class="font-medium text-orange-600"
              >S/ {{ (partialAmount || 0).toFixed(2) }}</span
            >
          </div>
          <div
            class="flex justify-between text-gray-800 font-semibold border-t border-gray-300 pt-2"
          >
            <span>Por pagar (Deuda):</span>
            <span class="text-red-600">
              S/ {{ balance.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Resumen de crédito total -->
      <div
        v-if="paymentType === 'credit'"
        class="bg-red-50 p-4 rounded-lg space-y-3 text-sm border border-red-100"
      >
        <div class="flex justify-between text-gray-600">
          <span>Total del gasto:</span>
          <span class="font-medium">S/ {{ totalAmount.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-gray-600">
          <span>Abono inicial:</span>
          <span class="font-medium text-red-600">S/ 0.00 (Crédito Total)</span>
        </div>
        <div
          class="flex justify-between text-gray-800 font-semibold border-t border-red-200 pt-2"
        >
          <span>Por pagar (Deuda):</span>
          <span class="text-red-600">S/ {{ totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Error de validación -->
      <div
        v-if="validationError"
        class="text-sm text-red-600 flex items-center gap-2"
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
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ validationError }}</span>
      </div>
    </div>

    <!-- Indicador de selección -->
    <div v-if="selectedMethod && paymentType" class="text-center">
      <div
        class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600"
      >
        <svg
          class="w-4 h-4 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span>
          {{ paymentType === "complete" ? "Pago completo" : (paymentType === "credit" ? "Crédito total" : "Abono parcial") }}
          por
          {{ methodLabels[selectedMethod] }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useAddStockFlowStore } from "@/stores/Inventory/AddStockFlow";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { useToast } from "@/composables/useToast";
import { useRoute } from "vue-router";
import { round2 } from "@/utils/mathUtils";

const route = useRoute();
const transactionStore = useTransactionStore();
const addStockFlow = useAddStockFlowStore();
const accountsBalanceStore = useAccountsBalanceStore();
const { warning, success } = useToast();

const isAddStockFlow = computed(() => route.name === "AddStock");

// Estado local
const selectedMethod = ref(null);
const paymentType = ref("complete"); // 'complete' | 'partial' | 'credit'
const partialAmount = ref(0);
const validationError = ref("");

const methodLabels = {
  cash: "Efectivo",
  bank: "Banco",
};

// Cargar saldos de cuentas al montar
onMounted(async () => {
  await accountsBalanceStore.loadFromDailySummary();
  
  // Precargar método si ya estaba seleccionado en AddStock
  if (isAddStockFlow.value && addStockFlow.addStockData.account) {
    selectedMethod.value = addStockFlow.addStockData.account;
  } else if (!isAddStockFlow.value && transactionStore.transactionToAdd.value.account) {
    selectedMethod.value = transactionStore.transactionToAdd.value.account;
  }
});

// Balances
const cashBalance = computed(() => accountsBalanceStore.expectedFinalCash || 0);
const bankBalance = computed(() => accountsBalanceStore.expectedFinalBank || 0);

const activeBalance = computed(() => {
  if (selectedMethod.value === "cash") return cashBalance.value;
  if (selectedMethod.value === "bank") return bankBalance.value;
  return 0;
});

// Monto Total
const totalAmount = computed(() => {
  if (isAddStockFlow.value) {
    const qty = Number(addStockFlow.addStockData.quantity) || 0;
    const cost = Number(addStockFlow.addStockData.cost) || 0;
    return round2(qty * cost);
  }

  // Flujo normal de gasto
  const items = transactionStore.transactionToAdd.value.materialItems || [];
  if (items.length > 0) {
    return round2(items.reduce((sum, item) => sum + (Number(item.cost) || 0) * (Number(item.quantity) || 0), 0));
  }
  return round2(transactionStore.transactionToAdd.value.amount || 0);
});

const balance = computed(() => {
  if (paymentType.value === "credit") {
    return totalAmount.value;
  }
  if (paymentType.value === "partial") {
    return Math.max(totalAmount.value - (partialAmount.value || 0), 0);
  }
  return 0;
});

// Validaciones de selección de cuenta
const canSelectCash = computed(() => {
  // Siempre permitir, pero avisar en validación si no cubre el abono
  return true;
});

const canSelectBank = computed(() => {
  return true;
});

const hasAnyValidAccount = computed(() => {
  return cashBalance.value > 0 || bankBalance.value > 0;
});

const canPayComplete = computed(() => {
  if (!selectedMethod.value) return true;
  return activeBalance.value >= totalAmount.value;
});

// Funciones
function selectPaymentMethod(method) {
  selectedMethod.value = method;
  validationError.value = "";
  
  // Si seleccionó un método pero no puede pagar completo, auto-cambiar a parcial
  if (activeBalance.value < totalAmount.value) {
    paymentType.value = "partial";
    partialAmount.value = activeBalance.value;
    warning("Saldo insuficiente para pago completo, cambiado a Pago Parcial");
  } else {
    // Si puede pagar completo y el tipo estaba en complete
    if (paymentType.value === "complete") {
      partialAmount.value = 0;
    } else {
      // Si estaba en parcial, mantener
      partialAmount.value = Math.min(partialAmount.value, totalAmount.value - 0.01);
    }
  }
}

function setPaymentType(type) {
  if (type === "complete" && activeBalance.value < totalAmount.value) {
    warning("No tienes suficiente saldo disponible para realizar un Pago Completo");
    return;
  }
  paymentType.value = type;
  validationError.value = "";
  
  if (type === "credit") {
    partialAmount.value = 0;
  }
}

function handlePartialAmountInput() {
  if (partialAmount.value > totalAmount.value) {
    partialAmount.value = totalAmount.value;
    warning(`El máximo posible es S/ ${totalAmount.value.toFixed(2)}`);
  }
}

// Validaciones en tiempo real
watch([selectedMethod, paymentType, partialAmount, totalAmount], () => {
  validationError.value = "";

  if (!selectedMethod.value) {
    validationError.value = "Debes seleccionar un método de pago";
    return;
  }

  const currentPaid = paymentType.value === "complete" ? totalAmount.value : (partialAmount.value || 0);

  if (paymentType.value === "partial") {
    if (currentPaid <= 0) {
      validationError.value = "El abono inicial debe ser mayor a 0";
    } else if (currentPaid >= totalAmount.value) {
      paymentType.value = "complete";
      partialAmount.value = 0;
      success("Cambiado a Pago Completo automáticamente");
      return;
    }
  } else if (paymentType.value === "credit") {
    // Para crédito total, el pago inicial es 0 y es válido
    return;
  }

  // Validar contra saldo disponible en la cuenta (solo si se desembolsa dinero ahora)
  if (paymentType.value !== "credit" && currentPaid > activeBalance.value) {
    validationError.value = `Saldo insuficiente en ${methodLabels[selectedMethod.value]} (Disponible: S/ ${activeBalance.value.toFixed(2)})`;
  }
});

// Guardar información en stores correspondientes
watch(
  [selectedMethod, paymentType, partialAmount, validationError],
  () => {
    if (validationError.value) {
      // Si hay error de validación, invalidar la selección en el store
      if (isAddStockFlow.value) {
        addStockFlow.addStockData.account = null;
      } else {
        transactionStore.transactionToAdd.value.account = null;
      }
      return;
    }

    if (selectedMethod.value && paymentType.value) {
      const isPartial = paymentType.value === "partial" || paymentType.value === "credit";
      const paid = paymentType.value === "partial" ? partialAmount.value : (paymentType.value === "credit" ? 0 : totalAmount.value);
      const remains = paymentType.value === "partial" ? balance.value : (paymentType.value === "credit" ? totalAmount.value : 0);

      if (isAddStockFlow.value) {
        addStockFlow.addStockData.account = selectedMethod.value;
        addStockFlow.addStockData.paymentType = paymentType.value;
        addStockFlow.addStockData.paidAmount = paid;
        addStockFlow.addStockData.balance = remains;
        addStockFlow.addStockData.isPartial = isPartial;
      } else {
        // Guardar en el transactionStore normal
        transactionStore.setPaymentInfo(selectedMethod.value, isPartial, isPartial ? paid : null);
        transactionStore.transactionToAdd.value.amount = totalAmount.value;
      }
      
      console.log("💰 [StepPaymentMethodExpense] Guardados datos de pago:", {
        isAddStockFlow: isAddStockFlow.value,
        account: selectedMethod.value,
        paymentType: paymentType.value,
        paid,
        remains
      });
    }
  },
  { deep: true }
);
</script>

<style scoped>
button {
  transition: all 0.2s ease;
}
button:active:not(:disabled) {
  transform: scale(0.95);
}
</style>
