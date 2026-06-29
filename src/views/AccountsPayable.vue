<template>
  <div class="min-h-screen pb-20">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
              Cuentas por Pagar
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 mt-1">
              Gestiona los saldos pendientes de pago a tus proveedores
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Spinner de carga -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
        <p class="text-sm text-gray-500">Cargando cuentas por pagar...</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-else>
      <!-- Resumen total -->
      <div class="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all duration-200 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-xs sm:text-sm text-gray-500 mb-1">
                Total por pagar
              </p>
              <p
                class="text-3xl font-extrabold text-purple-600 mb-2 tabular-nums"
              >
                S/ {{ totalPayable.toFixed(2) }}
              </p>
              <p class="text-xs sm:text-sm text-gray-600">
                {{ pendingTransactions.length }} egreso(s) / compra(s) pendiente(s)
              </p>
            </div>
            <div
              class="w-12 h-12 sm:w-16 sm:h-16 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 text-purple-600"
            >
              <svg
                class="w-6 h-6 sm:w-8 sm:h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 8h6m-6 2h6m-6 2h6M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista agrupada por proveedor -->
      <div class="max-w-7xl mx-auto px-4 space-y-3 sm:space-y-4">
        <div
          v-for="group in payablesBySupplier"
          :key="group.supplierId"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <!-- Header del proveedor -->
          <div
            class="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <div
                    class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 text-purple-600"
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5"
                      />
                    </svg>
                  </div>
                  <h3
                    class="text-base sm:text-lg font-semibold text-gray-900 truncate"
                  >
                    {{ group.supplierName }}
                  </h3>
                </div>
                <p class="text-xs sm:text-sm text-gray-500 ml-10">
                  {{ group.transactions.length }} egreso(s) pendiente(s)
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs text-gray-500 mb-0.5">Total pendiente</p>
                <p
                  class="text-lg sm:text-2xl font-bold text-purple-600 tabular-nums"
                >
                  S/ {{ group.totalPending.toFixed(2) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Lista de transacciones -->
          <div class="divide-y divide-gray-100">
            <div
              v-for="transaction in group.transactions"
              :key="transaction.uuid"
              class="p-3 sm:p-4 transition-all duration-200 hover:bg-gray-50"
            >
              <!-- Header de la transacción -->
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                  <!-- Badge de estado -->
                  <div
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border shrink-0',
                      transaction.paymentStatus === 'pending'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200',
                    ]"
                  >
                    <svg
                      class="w-3 h-3 shrink-0"
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
                      transaction.paymentStatus === "pending"
                        ? "Pendiente"
                        : "Parcial"
                    }}</span>
                  </div>

                  <!-- Fecha -->
                  <span class="text-xs text-gray-500 truncate">
                    {{ formatDate(transaction.createdAt) }}
                  </span>
                </div>

                <!-- Botón de registrar pago -->
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    @click="openPaymentModal(transaction)"
                    class="px-2.5 py-1.5 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors text-xs font-medium inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <svg
                      class="w-3.5 h-3.5"
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

              <!-- Descripción (si existe) -->
              <p
                v-if="transaction.description"
                class="text-xs text-gray-600 mb-3 line-clamp-2"
              >
                {{ transaction.description }}
              </p>

              <!-- Grid de montos -->
              <div
                class="grid grid-cols-3 gap-2 sm:gap-3 bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-100"
              >
                <div class="text-center">
                  <div class="text-xs text-gray-500 mb-0.5">Total</div>
                  <div
                    class="text-sm sm:text-base font-semibold text-gray-900 tabular-nums"
                  >
                    S/ {{ (transaction.amount || 0).toFixed(2) }}
                  </div>
                </div>
                <div class="text-center border-x border-gray-200">
                  <div class="text-xs text-gray-500 mb-0.5">Pagado</div>
                  <div
                    class="text-sm sm:text-base font-semibold text-green-600 tabular-nums"
                  >
                    S/ {{ (transaction.totalPaid || 0).toFixed(2) }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-gray-500 mb-0.5">Pendiente</div>
                  <div
                    class="text-sm sm:text-base font-semibold text-red-600 tabular-nums"
                  >
                    S/ {{ (transaction.balance || 0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div
        v-if="payablesBySupplier.length === 0"
        class="max-w-md mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center mt-8"
      >
        <svg
          class="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
        <h3 class="font-bold text-gray-900 text-lg">Sin cuentas por pagar</h3>
        <p class="text-sm text-gray-500 mt-2">
          ¡Felicidades! Estás al día con todos tus proveedores y no tienes deudas pendientes.
        </p>
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
import { ref, onMounted } from "vue";
import { useAccountsPayable } from "@/composables/useAccountsPayable";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import PaymentRegistrationModal from "@/components/AccountsPayable/PaymentRegistrationModal.vue";

const transactionStore = useTransactionStore();
const { pendingTransactions, totalPayable, payablesBySupplier } = useAccountsPayable();

const isLoading = ref(false);
const showPaymentModal = ref(false);
const selectedTransaction = ref(null);

onMounted(async () => {
  isLoading.value = true;
  try {
    await transactionStore.fetchPendingPayables();
  } catch (err) {
    console.error("Error al cargar transacciones:", err);
  } finally {
    isLoading.value = false;
  }
});

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
}

function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
</script>
