<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Cuentas por Pagar</h1>
        <p class="text-sm text-gray-500 mt-1">
          Gestiona los saldos pendientes de pago a tus proveedores
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"
      ></div>
      <p class="text-gray-500 mt-4">Cargando cuentas por pagar...</p>
    </div>

    <!-- Sin cuentas por pagar -->
    <div v-else-if="payablesBySupplier.length === 0" class="text-center py-12">
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
        No tienes cuentas por pagar pendientes con tus proveedores
      </p>
    </div>

    <!-- Lista de proveedores con deudas -->
    <div v-else class="space-y-4">
      <div
        v-for="group in payablesBySupplier"
        :key="group.supplierId"
        class="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
      >
        <!-- Header del proveedor -->
        <div class="bg-gray-50 p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold"
            >
              {{ group.supplierName.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-semibold text-gray-800">
                {{ group.supplierName }}
              </div>
              <div class="text-sm text-gray-500">
                {{ group.transactions.length }} egresos pendientes
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

        <!-- Transacciones del proveedor -->
        <div class="divide-y divide-gray-100">
          <div
            v-for="transaction in group.transactions"
            :key="transaction.uuid"
            class="p-3 sm:p-4 hover:bg-gray-50 transition-all duration-200"
          >
            <!-- Header de la transacción -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex items-center gap-2 flex-wrap">
                <!-- Badge de estado -->
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border shrink-0',
                    transaction.paymentStatus === 'partial'
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : 'bg-red-50 text-red-700 border-red-200',
                  ]"
                >
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{{
                    transaction.paymentStatus === "partial"
                      ? "Pago Parcial"
                      : "Pendiente"
                  }}</span>
                </span>

                <!-- Fecha -->
                <span class="text-xs text-gray-500">
                  {{ formatDate(transaction.createdAt || transaction.date) }}
                </span>
              </div>

              <!-- Botones -->
              <div class="flex items-center gap-2 shrink-0">
                <router-link
                  :to="{
                    name: 'DetailsRecords',
                    params: { registerId: transaction.uuid },
                  }"
                  class="p-1.5 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-200"
                  title="Ver detalles del egreso"
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </router-link>
                <button
                  @click="openPaymentModal(transaction)"
                  class="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium inline-flex items-center gap-1.5"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span class="hidden sm:inline">Registrar Abono</span>
                  <span class="sm:hidden">Abonar</span>
                </button>
              </div>
            </div>

            <!-- Grid de montos -->
            <div
              class="grid grid-cols-3 gap-2 sm:gap-4 mb-3 bg-gray-50 rounded-lg p-2 sm:p-3"
            >
              <div class="text-center">
                <div class="text-xs text-gray-500 mb-0.5">Total</div>
                <div class="text-sm sm:text-base font-semibold text-gray-900">
                  S/ {{ (transaction.amount || 0).toFixed(2) }}
                </div>
              </div>
              <div class="text-center border-x border-gray-200">
                <div class="text-xs text-gray-500 mb-0.5">Pagado</div>
                <div class="text-sm sm:text-base font-semibold text-green-600">
                  S/ {{ (transaction.totalPaid || 0).toFixed(2) }}
                </div>
              </div>
              <div class="text-center">
                <div class="text-xs text-gray-500 mb-0.5">Pendiente</div>
                <div class="text-sm sm:text-base font-semibold text-red-600">
                  S/ {{ (transaction.balance || 0).toFixed(2) }}
                </div>
              </div>
            </div>

            <!-- Historial de pagos -->
            <div
              v-if="transaction.payments && transaction.payments.length > 0"
              class="mt-3 pt-3 border-t border-gray-200"
            >
              <div
                class="flex items-center gap-2 text-xs font-medium text-gray-600 mb-2"
              >
                <svg
                  class="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span
                  >Historial de pagos ({{ transaction.payments.length }})</span
                >
              </div>
              <div class="space-y-2">
                <div
                  v-for="payment in transaction.payments"
                  :key="payment.uuid"
                  class="flex items-center justify-between gap-2 text-xs bg-purple-50 rounded-md p-2 border border-purple-100"
                >
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <svg
                      class="w-4 h-4 text-purple-600 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="font-semibold text-purple-700"
                      >S/ {{ payment.amount.toFixed(2) }}</span
                    >
                    <span class="text-gray-400 hidden sm:inline">•</span>
                    <span class="text-gray-600 truncate">{{
                      formatPaymentMethod(payment.account || payment.method)
                    }}</span>
                  </div>
                  <span class="text-gray-500 shrink-0">{{
                    formatDate(payment.date)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Registro de Pago (Abono) -->
    <PaymentRegistrationModal
      v-if="showPaymentModal"
      :show="showPaymentModal"
      :transaction="selectedTransaction"
      @close="closePaymentModal"
      @payment-registered="onPaymentRegistered"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAccountsPayable } from "@/composables/useAccountsPayable";
import PaymentRegistrationModal from "@/components/AccountsPayable/PaymentRegistrationModal.vue";

const props = defineProps({
  supplierId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["payment-registered"]);

const {
  pendingTransactions,
  totalPayable,
  payablesBySupplier: allPayables,
} = useAccountsPayable();

// Estado local
const loading = ref(false);
const showPaymentModal = ref(false);
const selectedTransaction = ref(null);

const payablesBySupplier = computed(() => {
  if (props.supplierId) {
    return allPayables.value.filter((g) => g.supplierId === props.supplierId);
  }
  return allPayables.value;
});

function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
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
  showPaymentModal.value = true;
}

function closePaymentModal() {
  showPaymentModal.value = false;
  selectedTransaction.value = null;
}

function onPaymentRegistered() {
  closePaymentModal();
  emit("payment-registered");
}

// Lifecycle
onMounted(() => {
  loading.value = false;
});
</script>

<style scoped>
.hover\:shadow-lg {
  transition: box-shadow 0.2s ease-in-out;
}
</style>
