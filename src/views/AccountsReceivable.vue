<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Cuentas por Cobrar</h1>
            <p class="text-sm text-gray-500 mt-1">
              Gestiona los pagos pendientes de tus clientes
            </p>
          </div>
          <router-link
            to="/"
            class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
          </router-link>
        </div>
      </div>
    </div>

    <!-- Resumen total -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div
        class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-100 text-sm">Total por cobrar</p>
            <p class="text-4xl font-bold mt-1">
              S/ {{ totalReceivable.toFixed(2) }}
            </p>
            <p class="text-orange-100 text-sm mt-2">
              {{ pendingTransactions.length }} venta(s) pendiente(s)
            </p>
          </div>
          <div class="p-4 bg-white/20 rounded-full">
            <svg
              class="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="currentFilter = filter.value"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap',
            currentFilter === filter.value
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200',
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Lista agrupada por cliente -->
    <div class="max-w-7xl mx-auto px-4 space-y-4">
      <div
        v-for="group in filteredReceivablesByClient"
        :key="group.clientId"
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- Header del cliente -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">
                {{ group.clientName }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ group.transactions.length }} venta(s) pendiente(s)
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Total pendiente</p>
              <p class="text-2xl font-bold text-orange-600">
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
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Info de la venta -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs text-gray-500">
                    {{ formatDate(transaction.createdAt) }}
                  </span>
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-xs font-medium',
                      transaction.paymentStatus === 'pending'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700',
                    ]"
                  >
                    {{
                      transaction.paymentStatus === "pending"
                        ? "Pendiente"
                        : "Parcial"
                    }}
                  </span>
                </div>

                <p
                  v-if="transaction.description"
                  class="text-sm text-gray-600 mb-2 line-clamp-2"
                >
                  {{ transaction.description }}
                </p>

                <div class="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Total:</span>
                    <span class="font-medium text-gray-800 ml-1">
                      S/ {{ getTransactionTotal(transaction).toFixed(2) }}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-500">Pagado:</span>
                    <span class="font-medium text-green-600 ml-1">
                      S/ {{ transaction.totalPaid.toFixed(2) }}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-500">Saldo:</span>
                    <span class="font-medium text-orange-600 ml-1">
                      S/ {{ transaction.balance.toFixed(2) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex flex-col gap-2">
                <button
                  @click="openPaymentModal(transaction)"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap transition-colors"
                >
                  Registrar Pago
                </button>
                <router-link
                  :to="{
                    name: 'DetailsRecords',
                    params: { registerId: transaction.uuid },
                  }"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium text-center transition-colors"
                >
                  Ver Detalles
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="filteredReceivablesByClient.length === 0"
        class="text-center py-12"
      >
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
        >
          <svg
            class="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">¡Todo al día!</h3>
        <p class="text-gray-500">
          No tienes ventas con pagos pendientes{{
            currentFilter !== "all" ? " en este filtro" : ""
          }}
        </p>
      </div>
    </div>

    <!-- Modal de registro de pago -->
    <PaymentRegistrationModal
      :is-open="showPaymentModal"
      :transaction="selectedTransaction"
      @close="showPaymentModal = false"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAccountsReceivable } from "@/composables/useAccountsReceivable";
import PaymentRegistrationModal from "@/components/AccountsReceivable/PaymentRegistrationModal.vue";

const { pendingTransactions, totalReceivable, receivablesByClient } =
  useAccountsReceivable();

const showPaymentModal = ref(false);
const selectedTransaction = ref(null);
const currentFilter = ref("all");

const filters = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Parciales", value: "partial" },
];

// Computed
const filteredReceivablesByClient = computed(() => {
  if (currentFilter.value === "all") {
    return receivablesByClient.value;
  }

  return receivablesByClient.value
    .map((group) => ({
      ...group,
      transactions: group.transactions.filter(
        (t) => t.paymentStatus === currentFilter.value
      ),
      totalPending: group.transactions
        .filter((t) => t.paymentStatus === currentFilter.value)
        .reduce((sum, t) => sum + (t.balance || 0), 0),
    }))
    .filter((group) => group.transactions.length > 0);
});

// Methods
function openPaymentModal(transaction) {
  selectedTransaction.value = transaction;
  showPaymentModal.value = true;
}

function handlePaymentSuccess() {
  showPaymentModal.value = false;
  selectedTransaction.value = null;
  // La lista se actualiza automáticamente por reactividad
}

function formatDate(timestamp) {
  if (!timestamp) return "-";
  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTransactionTotal(transaction) {
  return transaction.total || transaction.amount || 0;
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
