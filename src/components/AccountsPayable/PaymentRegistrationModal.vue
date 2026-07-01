<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h3 class="font-bold text-gray-900 text-lg">Registrar Abono</h3>
        <button
          @click="close"
          class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body (Scrollable) -->
      <div class="p-6 overflow-y-auto space-y-5 flex-1">
        <div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <p class="text-xs text-purple-700 uppercase tracking-wider font-semibold mb-1">Total Pendiente</p>
          <p class="text-3xl font-extrabold text-purple-900 tabular-nums">S/ {{ remaining.toFixed(2) }}</p>
          <p class="text-xs text-purple-600 mt-1">Gasto: {{ transaction.description || 'Gasto' }}</p>
        </div>

        <!-- Ajustar Precio Pactado (solo si es Acopio) -->
        <div v-if="transaction.acopioId" class="bg-teal-50 p-4 rounded-xl border border-teal-100 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs text-teal-700 uppercase tracking-wider font-semibold">Gasto por Acopio</span>
            <button type="button" @click="toggleAdjustPrice" class="text-xs font-bold text-teal-600 underline">
              {{ isAdjustingPrice ? 'Cancelar Ajuste' : 'Ajustar Precio Pactado' }}
            </button>
          </div>
          <p class="text-xs text-teal-600">
            Cantidad acopiada: <span class="font-semibold">{{ acopioQuantity.toFixed(2) }} {{ acopioUnit }}</span>
          </p>

          <div v-if="isAdjustingPrice" class="space-y-2 pt-2 border-t border-teal-200">
            <label class="block text-xs font-semibold text-gray-600">Nuevo Precio Unitario Pactado</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">S/</span>
              <input
                v-model.number="adjustedUnitPrice"
                type="number"
                step="0.01"
                min="0"
                class="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-sm font-bold"
                placeholder="0.00"
              />
            </div>
            <div class="flex justify-between text-xs text-gray-500 pt-1">
              <span>Nuevo total de deuda:</span>
              <span class="font-bold text-teal-700">S/ {{ adjustedTotalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Método de pago -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Método de Pago</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="selectedAccount = 'cash'"
              :class="[
                'py-3 px-4 rounded-lg font-semibold border-2 transition-all flex items-center justify-center gap-2 text-sm',
                selectedAccount === 'cash'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              ]"
            >
              💵 Efectivo
            </button>
            <button
              @click="selectedAccount = 'bank'"
              :class="[
                'py-3 px-4 rounded-lg font-semibold border-2 transition-all flex items-center justify-center gap-2 text-sm',
                selectedAccount === 'bank'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              ]"
            >
              🏦 Banco (Yape/Plin)
            </button>
          </div>
        </div>

        <!-- Tipo de abono -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto del abono</label>
          <div class="space-y-2">
            <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input
                v-model="paymentType"
                type="radio"
                value="complete"
                class="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
              />
              <div class="flex-1">
                <span class="text-sm font-semibold text-gray-800">Liquidar deuda total</span>
                <span class="text-xs text-gray-500 block">Pagar los S/ {{ remaining.toFixed(2) }} ahora</span>
              </div>
            </label>

            <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input
                v-model="paymentType"
                type="radio"
                value="partial"
                class="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
              />
              <div class="flex-1">
                <span class="text-sm font-semibold text-gray-800">Abono parcial</span>
                <span class="text-xs text-gray-500 block">Pagar una parte del saldo</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Input Monto Parcial -->
        <div v-if="paymentType === 'partial'" class="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label class="block text-xs font-semibold text-gray-600">Monto a abonar</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">S/</span>
            <input
              v-model.number="paymentAmount"
              type="number"
              step="0.01"
              min="0.01"
              :max="remaining"
              class="w-full pl-8 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-base font-bold tabular-nums"
              placeholder="0.00"
              @input="validateAmount"
            />
          </div>
          <div class="flex justify-between text-xs text-gray-500 pt-1">
            <span>Nuevo saldo pendiente:</span>
            <span class="font-bold text-red-600">S/ {{ newBalance.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Notas -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notas / Descripción (Opcional)</label>
          <textarea
            v-model="notes"
            rows="2"
            placeholder="Ej: Pago de cuota de fin de mes..."
            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
          ></textarea>
        </div>

        <!-- Error -->
        <p v-if="validationError" class="text-xs text-red-600 flex items-center gap-1.5">
          <span>⚠️</span> {{ validationError }}
        </p>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
        <button
          @click="close"
          class="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
        >
          Cancelar
        </button>
        <button
          @click="submitPayment"
          :disabled="isSubmitting || !!validationError || !selectedAccount"
          class="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
        >
          <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <span>Registrar Pago</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useAccountsPayable } from "@/composables/useAccountsPayable";
import { useToast } from "@/composables/useToast";
import { useAcopioStore } from "@/stores/acopioStore";

const props = defineProps({
  show: Boolean,
  transaction: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "payment-registered"]);

const { addPaymentToExpenseTransaction } = useAccountsPayable();
const acopioStore = useAcopioStore();
const { success, error } = useToast();

const isSubmitting = ref(false);
const selectedAccount = ref("cash"); // 'cash' | 'bank'
const paymentType = ref("complete"); // 'complete' | 'partial'
const paymentAmount = ref(0);
const notes = ref("");
const validationError = ref("");

// Estado para ajuste de precio de acopios
const isAdjustingPrice = ref(false);
const adjustedUnitPrice = ref(0);

const acopioQuantity = computed(() => {
  return props.transaction.materialItems?.[0]?.quantity || 0;
});

const acopioUnit = computed(() => {
  return props.transaction.materialItems?.[0]?.unit || 'uni';
});

const acopioCurrentPrice = computed(() => {
  return props.transaction.materialItems?.[0]?.cost || 0;
});

const adjustedTotalAmount = computed(() => {
  return acopioQuantity.value * (adjustedUnitPrice.value || 0);
});

function toggleAdjustPrice() {
  isAdjustingPrice.value = !isAdjustingPrice.value;
  if (isAdjustingPrice.value) {
    adjustedUnitPrice.value = acopioCurrentPrice.value;
  }
}

watch(() => props.transaction, (newVal) => {
  isAdjustingPrice.value = false;
  adjustedUnitPrice.value = newVal?.materialItems?.[0]?.cost || 0;
}, { immediate: true });

const remaining = computed(() => {
  if (isAdjustingPrice.value) {
    const totalPaid = props.transaction.totalPaid || 0;
    return Math.max(adjustedTotalAmount.value - totalPaid, 0);
  }
  return props.transaction.balance || 0;
});

const newBalance = computed(() => {
  const amt = paymentType.value === "complete" ? remaining.value : (paymentAmount.value || 0);
  return Math.max(remaining.value - amt, 0);
});

// Validación en tiempo real
watch([paymentType, paymentAmount, selectedAccount, remaining], () => {
  validationError.value = "";
  
  if (!selectedAccount.value) {
    validationError.value = "Debes seleccionar una cuenta (Efectivo/Banco)";
    return;
  }

  if (paymentType.value === "partial") {
    if (!paymentAmount.value || paymentAmount.value <= 0) {
      validationError.value = "El monto del abono debe ser mayor a 0";
    } else if (paymentAmount.value > remaining.value) {
      validationError.value = `El abono no puede superar el saldo pendiente (S/ ${remaining.value.toFixed(2)})`;
    }
  }
});

function validateAmount() {
  if (paymentAmount.value > remaining.value) {
    paymentAmount.value = remaining.value;
  }
}

async function submitPayment() {
  if (validationError.value || !selectedAccount.value) return;

  isSubmitting.value = true;

  // 1. Si está ajustando el precio, actualizar el acopio primero
  if (isAdjustingPrice.value && props.transaction.acopioId) {
    try {
      await acopioStore.updateAcopioPrice(props.transaction.acopioId, adjustedUnitPrice.value);
    } catch (err) {
      error("Error al ajustar precio acordado del acopio: " + err.message);
      isSubmitting.value = false;
      return;
    }
  }

  const amountToPay = paymentType.value === "complete" ? remaining.value : paymentAmount.value;

  try {
    await addPaymentToExpenseTransaction(props.transaction.uuid, {
      amount: amountToPay,
      account: selectedAccount.value,
      notes: notes.value.trim() || `Abono de S/ ${amountToPay.toFixed(2)} registrado`,
    });

    success("Abono registrado con éxito");
    emit("payment-registered");
    close();
  } catch (err) {
    error("Error al registrar pago: " + err.message);
  } finally {
    isSubmitting.value = false;
  }
}

function close() {
  emit("close");
  paymentType.value = "complete";
  paymentAmount.value = 0;
  notes.value = "";
  validationError.value = "";
  isAdjustingPrice.value = false;
}
</script>
