<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Cuentas por Cobrar</h1>
        <p class="text-sm text-gray-500 mt-1">
          Gestiona los pagos pendientes de tus clientes
        </p>
      </div>
      <button
        @click="$emit('close')"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <svg
          class="w-6 h-6 text-gray-500"
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

    <!-- Resumen -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        class="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg"
      >
        <div class="text-sm opacity-80">Total por Cobrar</div>
        <div class="text-3xl font-bold mt-2">
          S/ {{ totalReceivable.toFixed(2) }}
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
      >
        <div class="text-sm opacity-80">Transacciones Pendientes</div>
        <div class="text-3xl font-bold mt-2">{{ pendingCount }}</div>
      </div>

      <div
        class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
      >
        <div class="text-sm opacity-80">Clientes con Deuda</div>
        <div class="text-3xl font-bold mt-2">
          {{ receivablesByClient.length }}
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
      <p class="text-gray-500 mt-4">Cargando cuentas por cobrar...</p>
    </div>

    <!-- Sin cuentas por cobrar -->
    <div v-else-if="receivablesByClient.length === 0" class="text-center py-12">
      <svg
        class="w-24 h-24 mx-auto text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-gray-500 mt-4 text-lg font-medium">¡Todo al día!</p>
      <p class="text-gray-400 text-sm mt-1">
        No tienes cuentas por cobrar pendientes
      </p>
    </div>

    <!-- Lista de clientes con deuda -->
    <div v-else class="space-y-4">
      <div
        v-for="group in receivablesByClient"
        :key="group.clientId"
        class="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
      >
        <!-- Header del cliente -->
        <div class="bg-gray-50 p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold"
            >
              {{ group.clientName.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-semibold text-gray-800">
                {{ group.clientName }}
              </div>
              <div class="text-sm text-gray-500">
                {{ group.transactions.length }} transacciones pendientes
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">Total pendiente</div>
            <div class="text-xl font-bold text-red-600">
              S/ {{ group.totalPending.toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Transacciones del cliente -->
        <div class="divide-y divide-gray-200">
          <div
            v-for="transaction in group.transactions"
            :key="transaction.uuid"
            class="p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-800">{{
                    formatDate(transaction.date)
                  }}</span>
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      transaction.paymentStatus === 'partial'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700',
                    ]"
                  >
                    {{
                      transaction.paymentStatus === "partial"
                        ? "Pago Parcial"
                        : "Pendiente"
                    }}
                  </span>
                </div>

                <div class="mt-2 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Total:</span>
                    <span class="font-medium text-gray-700 ml-1"
                      >S/ {{ transaction.total.toFixed(2) }}</span
                    >
                  </div>
                  <div>
                    <span class="text-gray-500">Pagado:</span>
                    <span class="font-medium text-green-600 ml-1"
                      >S/ {{ transaction.totalPaid.toFixed(2) }}</span
                    >
                  </div>
                  <div>
                    <span class="text-gray-500">Pendiente:</span>
                    <span class="font-medium text-red-600 ml-1"
                      >S/ {{ transaction.balance.toFixed(2) }}</span
                    >
                  </div>
                </div>

                <!-- Historial de pagos -->
                <div
                  v-if="transaction.payments && transaction.payments.length > 0"
                  class="mt-3"
                >
                  <div class="text-xs text-gray-500 font-medium mb-2">
                    Historial de pagos:
                  </div>
                  <div class="space-y-1">
                    <div
                      v-for="payment in transaction.payments"
                      :key="payment.uuid"
                      class="flex items-center gap-2 text-xs text-gray-600"
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
                      <span>S/ {{ payment.amount.toFixed(2) }}</span>
                      <span class="text-gray-400">•</span>
                      <span>{{ formatPaymentMethod(payment.method) }}</span>
                      <span class="text-gray-400">•</span>
                      <span>{{ formatDate(payment.date) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                @click="openPaymentModal(transaction)"
                class="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Registro de Pago -->
    <Teleport to="body">
      <div
        v-if="showPaymentModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="closePaymentModal"
      >
        <div
          class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-800">Registrar Pago</h2>
            <button
              @click="closePaymentModal"
              class="text-gray-400 hover:text-gray-600"
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

          <div
            v-if="selectedTransaction"
            class="bg-gray-50 p-4 rounded-lg space-y-2 text-sm"
          >
            <div class="flex justify-between">
              <span class="text-gray-600">Cliente:</span>
              <span class="font-medium">{{
                selectedTransaction.clientName
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Saldo pendiente:</span>
              <span class="font-bold text-red-600"
                >S/ {{ selectedTransaction.balance.toFixed(2) }}</span
              >
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Monto a pagar <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >S/</span
                >
                <input
                  v-model.number="paymentForm.amount"
                  type="number"
                  step="0.01"
                  :max="selectedTransaction?.balance"
                  class="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Método de pago <span class="text-red-500">*</span>
              </label>
              <select
                v-model="paymentForm.method"
                class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="cash">Efectivo</option>
                <option value="bank">Banco</option>
                <option value="yape">Yape</option>
                <option value="plin">Plin</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                v-model="paymentForm.notes"
                rows="3"
                class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Ej: Pago con transferencia bancaria"
              ></textarea>
            </div>
          </div>

          <div v-if="paymentError" class="text-sm text-red-600">
            {{ paymentError }}
          </div>

          <div class="flex gap-3 pt-4">
            <button
              @click="closePaymentModal"
              class="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="registerPayment"
              :disabled="!canRegisterPayment || registering"
              class="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ registering ? "Procesando..." : "Registrar Pago" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAccountsReceivable } from "@/composables/useAccountsReceivable";

const {
  pendingTransactions,
  totalReceivable,
  pendingCount,
  receivablesByClient,
  addPaymentToTransaction,
} = useAccountsReceivable();

// Estado local
const loading = ref(false);
const showPaymentModal = ref(false);
const selectedTransaction = ref(null);
const registering = ref(false);
const paymentError = ref("");

const paymentForm = ref({
  amount: 0,
  method: "cash",
  notes: "",
});

// Computed
const canRegisterPayment = computed(() => {
  return (
    paymentForm.value.amount > 0 &&
    paymentForm.value.amount <= (selectedTransaction.value?.balance || 0) &&
    paymentForm.value.method
  );
});

// Functions
function formatDate(date) {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPaymentMethod(method) {
  const labels = {
    cash: "Efectivo",
    bank: "Banco",
    yape: "Yape",
    plin: "Plin",
  };
  return labels[method] || method;
}

function openPaymentModal(transaction) {
  selectedTransaction.value = transaction;
  paymentForm.value = {
    amount: transaction.balance, // Prellenar con el balance completo
    method: "cash",
    notes: "",
  };
  paymentError.value = "";
  showPaymentModal.value = true;
}

function closePaymentModal() {
  showPaymentModal.value = false;
  selectedTransaction.value = null;
  paymentForm.value = { amount: 0, method: "cash", notes: "" };
  paymentError.value = "";
}

async function registerPayment() {
  if (!canRegisterPayment.value) return;

  registering.value = true;
  paymentError.value = "";

  try {
    await addPaymentToTransaction(
      selectedTransaction.value.uuid,
      paymentForm.value
    );

    // Cerrar modal y mostrar éxito
    closePaymentModal();

    // Aquí podrías mostrar un toast de éxito
    console.log("✅ Pago registrado exitosamente");
  } catch (error) {
    console.error("Error registrando pago:", error);
    paymentError.value = error.message || "Error al registrar el pago";
  } finally {
    registering.value = false;
  }
}

// Lifecycle
onMounted(() => {
  loading.value = false;
});
</script>

<style scoped>
/* Animaciones sutiles */
.hover\:shadow-lg {
  transition: box-shadow 0.2s ease-in-out;
}
</style>
