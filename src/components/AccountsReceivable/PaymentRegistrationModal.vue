<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    @click.self="closeModal"
  >
    <div
      class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">Registrar Pago</h2>
          <button
            @click="closeModal"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Información de la venta -->
      <div class="px-6 py-4 bg-blue-50 border-b border-blue-100">
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Cliente:</span>
            <span class="font-medium text-gray-800">{{
              transaction?.clientName || "Sin cliente"
            }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Total de la venta:</span>
            <span class="font-medium text-gray-800"
              >S/ {{ getTotal().toFixed(2) }}</span
            >
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Ya pagado:</span>
            <span class="font-medium text-green-600"
              >S/ {{ transaction?.totalPaid?.toFixed(2) || "0.00" }}</span
            >
          </div>
          <div
            class="flex justify-between text-lg font-bold border-t border-blue-200 pt-2"
          >
            <span class="text-gray-800">Saldo pendiente:</span>
            <span class="text-orange-600"
              >S/ {{ transaction?.balance?.toFixed(2) || "0.00" }}</span
            >
          </div>
        </div>
      </div>

      <!-- Contenido del formulario -->
      <div class="px-6 py-6 space-y-6">
        <!-- Opciones de método de pago (copiado de StepPaymentMethod) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Método de pago
          </label>
          <div class="grid grid-cols-2 gap-4">
            <!-- Efectivo -->
            <button
              @click="selectedMethod = 'cash'"
              :class="[
                'p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex flex-col items-center gap-4 shadow-sm hover:shadow-md',
                selectedMethod === 'cash'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25'
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
                <span class="text-xs opacity-80">Dinero físico</span>
              </div>
            </button>

            <!-- Banco -->
            <button
              @click="selectedMethod = 'bank'"
              :class="[
                'p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex flex-col items-center gap-4 shadow-sm hover:shadow-md',
                selectedMethod === 'bank'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200',
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
                <span class="text-xs opacity-80">Yape/Plin</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Monto a pagar -->
        <div v-if="selectedMethod" class="bg-gray-50 p-4 rounded-lg space-y-3">
          <label class="block text-sm font-medium text-gray-700">
            Monto a pagar
          </label>
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold"
              >S/</span
            >
            <input
              v-model.number="paymentAmount"
              type="number"
              step="0.01"
              min="0.01"
              :max="transaction?.balance || 0"
              class="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-lg font-semibold"
              placeholder="0.00"
              autofocus
            />
          </div>

          <!-- Cálculo de nuevo saldo -->
          <div v-if="paymentAmount > 0" class="space-y-2 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Saldo actual:</span>
              <span class="font-medium"
                >S/ {{ transaction?.balance?.toFixed(2) }}</span
              >
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Pago a registrar:</span>
              <span class="font-medium text-blue-600"
                >S/ {{ paymentAmount.toFixed(2) }}</span
              >
            </div>
            <div
              class="flex justify-between text-gray-800 font-semibold border-t border-gray-300 pt-2"
            >
              <span>Nuevo saldo:</span>
              <span
                :class="[newBalance > 0 ? 'text-orange-600' : 'text-green-600']"
              >
                S/ {{ newBalance.toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Error de validación -->
          <div
            v-if="validationError"
            class="text-sm text-red-600 flex items-center gap-2 bg-red-50 p-3 rounded-lg"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
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

        <!-- Campo de notas opcional -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <textarea
            v-model="notes"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Ej: Segundo abono acordado, pago con transferencia bancaria..."
          ></textarea>
        </div>
      </div>

      <!-- Footer con acciones -->
      <div
        class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl"
      >
        <button
          @click="handleRegisterPayment"
          :disabled="!isValid || isLoading"
          class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
        >
          <span v-if="!isLoading">Registrar Pago</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Registrando...
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useAccountsReceivable } from "@/composables/useAccountsReceivable";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  transaction: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "success"]);

const { addPaymentToTransaction } = useAccountsReceivable();

// Estado local
const selectedMethod = ref(null);
const paymentAmount = ref(0);
const notes = ref("");
const isLoading = ref(false);
const validationError = ref("");

// Computed
const newBalance = computed(() => {
  if (!props.transaction) return 0;
  return Math.max((props.transaction.balance || 0) - paymentAmount.value, 0);
});

const isValid = computed(() => {
  return (
    selectedMethod.value &&
    paymentAmount.value > 0 &&
    paymentAmount.value <= (props.transaction?.balance || 0) &&
    !validationError.value
  );
});

// Watchers
watch(paymentAmount, (newAmount) => {
  validationError.value = "";

  if (newAmount <= 0) {
    validationError.value = "El monto debe ser mayor a 0";
    return;
  }

  if (newAmount > (props.transaction?.balance || 0)) {
    validationError.value = `El monto no puede exceder el saldo pendiente de S/ ${props.transaction?.balance?.toFixed(
      2
    )}`;
    return;
  }
});

// Methods
function getTotal() {
  return props.transaction?.total || props.transaction?.amount || 0;
}

async function handleRegisterPayment() {
  if (!isValid.value) return;

  isLoading.value = true;
  validationError.value = "";

  try {
    await addPaymentToTransaction(props.transaction.uuid, {
      amount: paymentAmount.value,
      account: selectedMethod.value,
      notes: notes.value,
    });

    emit("success");
    resetForm();
  } catch (error) {
    console.error("Error registrando pago:", error);
    validationError.value =
      error.message || "Error al registrar el pago. Inténtalo de nuevo.";
  } finally {
    isLoading.value = false;
  }
}

function closeModal() {
  if (!isLoading.value) {
    resetForm();
    emit("close");
  }
}

function resetForm() {
  selectedMethod.value = null;
  paymentAmount.value = 0;
  notes.value = "";
  validationError.value = "";
}

// Reset form when modal closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      resetForm();
    }
  }
);
</script>

<style scoped>
/* Animaciones suaves */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.rounded-2xl {
  animation: slideUp 0.3s ease-out;
}

/* Ocultar flechas de input number en Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Ocultar flechas de input number en Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
