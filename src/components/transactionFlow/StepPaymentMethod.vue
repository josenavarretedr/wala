<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Método de Pago
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Selecciona cómo se realizó el pago de esta venta
      </p>
      <p
        v-if="totalAmount > 0"
        class="text-lg font-semibold text-gray-700 mt-2"
      >
        Monto total:
        <span class="text-green-600">S/ {{ totalAmount.toFixed(2) }}</span>
      </p>
    </div>

    <!-- Opciones de método de pago -->
    <div class="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
      <!-- Efectivo -->
      <button
        @click="selectPaymentMethod('cash')"
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
        @click="selectPaymentMethod('bank')"
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

    <!-- Tipo de pago: Completo o Abono -->
    <div v-if="selectedMethod" class="max-w-lg mx-auto space-y-4">
      <div class="bg-gray-50 p-4 rounded-lg">
        <label class="block text-sm font-medium text-gray-700 mb-3">
          ¿El cliente pagó el monto completo?
        </label>

        <div class="space-y-3">
          <!-- Pago Completo -->
          <button
            @click="setPaymentType('complete')"
            :class="[
              'w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between',
              paymentType === 'complete'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300',
            ]"
          >
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  paymentType === 'complete'
                    ? 'border-green-500'
                    : 'border-gray-300',
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
                  El cliente pagó todo ahora
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
                  paymentType === 'partial'
                    ? 'border-orange-500'
                    : 'border-gray-300',
                ]"
              >
                <div
                  v-if="paymentType === 'partial'"
                  class="w-3 h-3 rounded-full bg-orange-500"
                ></div>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-800">
                  Abono / Pago Parcial
                </div>
                <div class="text-xs text-gray-500">
                  El cliente pagará en cuotas
                </div>
              </div>
            </div>
            <span class="text-lg font-semibold text-orange-600">Parcial</span>
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
            ref="partialAmountInput"
            v-model.number="partialAmount"
            type="number"
            step="0.01"
            min="0.01"
            :max="totalAmount"
            class="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:outline-none text-lg font-semibold"
            placeholder="0.00"
            @input="handlePartialAmountInput"
            @keydown.enter="handleEnterKey"
          />
        </div>

        <!-- Validación y cálculo de saldo -->
        <div v-if="partialAmount > 0" class="space-y-2 text-sm">
          <div class="flex justify-between text-gray-600">
            <span>Total de la venta:</span>
            <span class="font-medium">S/ {{ totalAmount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Abono inicial:</span>
            <span class="font-medium text-orange-600"
              >S/ {{ partialAmount.toFixed(2) }}</span
            >
          </div>
          <div
            class="flex justify-between text-gray-800 font-semibold border-t border-gray-300 pt-2"
          >
            <span>Saldo pendiente:</span>
            <span :class="[balance > 0 ? 'text-red-600' : 'text-green-600']">
              S/ {{ balance.toFixed(2) }}
            </span>
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
          {{ paymentType === "complete" ? "Pago completo" : "Abono parcial" }}
          por
          {{ methodLabels[selectedMethod] }}
        </span>
      </div>
    </div>
  </div>

  <!-- Toast de notificación -->
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useToast } from "@/composables/useToast";

const transactionStore = useTransactionStore();
const { warning, success } = useToast();

// Estado local
const selectedMethod = ref(null);
const paymentType = ref("complete"); // 'complete' | 'partial'
const partialAmount = ref(0);
const validationError = ref("");
const partialAmountInput = ref(null);

// Labels para mostrar
const methodLabels = {
  cash: "Efectivo",
  bank: "Banco",
  yape: "Yape",
  plin: "Plin",
};

// Computed
const totalAmount = computed(() => {
  return transactionStore.getTransactionToAddTotal();
});

const balance = computed(() => {
  if (paymentType.value === "partial" && partialAmount.value > 0) {
    return Math.max(totalAmount.value - partialAmount.value, 0);
  }
  return 0;
});

// Funciones
function selectPaymentMethod(method) {
  selectedMethod.value = method;
  validationError.value = "";
}

function setPaymentType(type) {
  paymentType.value = type;
  validationError.value = "";

  // NO resetear partialAmount para mantener el valor si el usuario quiere volver
}

function handlePartialAmountInput() {
  // Limitar automáticamente al máximo permitido
  if (partialAmount.value > totalAmount.value) {
    partialAmount.value = totalAmount.value;

    // Mostrar notificación de límite
    warning(`El máximo posible es S/ ${totalAmount.value.toFixed(2)}`);
  }
}

function handleEnterKey() {
  // Activar el botón "Siguiente" si está habilitado
  const btnNext = document.querySelector("#btn-next button");
  if (btnNext && !btnNext.disabled) {
    btnNext.click();
  }
}

// Validación en tiempo real con auto-cambio a pago completo
watch([partialAmount, paymentType], () => {
  if (paymentType.value === "partial") {
    if (!partialAmount.value || partialAmount.value <= 0) {
      validationError.value = "El monto del abono debe ser mayor a 0";
    } else if (partialAmount.value >= totalAmount.value) {
      // Auto-cambiar a pago completo y ajustar el monto para mejor UX
      paymentType.value = "complete";
      validationError.value = "";

      // Reducir el partialAmount en 1 para que si el usuario vuelve a "Pago Parcial"
      // tenga un valor válido y no se dispare la validación automáticamente
      partialAmount.value = Math.max(0, totalAmount.value - 1);

      // Mostrar toast informativo con delay para asegurar visibilidad
      nextTick(() => {
        success("Cambiado a Pago Completo automáticamente");

        console.log("🔔 Toast mostrado");
      });
    } else {
      validationError.value = "";
    }
  }
});

// Al avanzar, guardar la información en el store
watch(
  [selectedMethod, paymentType, partialAmount],
  () => {
    if (selectedMethod.value && paymentType.value) {
      const isPartial = paymentType.value === "partial";
      const amount = isPartial ? partialAmount.value : null;

      console.log("🔄 StepPaymentMethod watch triggered:", {
        selectedMethod: selectedMethod.value,
        paymentType: paymentType.value,
        isPartial,
        partialAmount: partialAmount.value,
        amount,
        validationError: validationError.value,
      });

      // Solo guardar si la validación es correcta
      if (isPartial && validationError.value) {
        console.log("⚠️ No se guarda por validationError");
        return;
      }

      transactionStore.setPaymentInfo(selectedMethod.value, isPartial, amount);
    }
  },
  { deep: true }
);
</script>

<style scoped>
/* Animaciones sutiles */
button {
  @apply active:scale-95;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
