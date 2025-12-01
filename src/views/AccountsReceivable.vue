<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
              Cuentas por Cobrar
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 mt-1">
              Gestiona los pagos pendientes de tus clientes
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Spinner de carga -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <SpinnerIcon size="xl" class="text-orange-600 mx-auto mb-4" />
        <p class="text-sm text-gray-500">Cargando cuentas por cobrar...</p>
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
                Total por cobrar
              </p>
              <p
                class="text-3xl sm:text-4xl font-extrabold text-orange-600 mb-2 tabular-nums"
              >
                S/ {{ totalReceivable.toFixed(2) }}
              </p>
              <p class="text-xs sm:text-sm text-gray-600">
                {{ pendingTransactions.length }} venta(s) pendiente(s)
              </p>
            </div>
            <div
              class="w-12 h-12 sm:w-16 sm:h-16 bg-orange-50 rounded-xl flex items-center justify-center shrink-0"
            >
              <svg
                class="w-6 h-6 sm:w-8 sm:h-8 text-orange-600"
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

      <!-- Lista agrupada por cliente -->
      <div class="max-w-7xl mx-auto px-4 space-y-3 sm:space-y-4">
        <div
          v-for="group in filteredReceivablesByClient"
          :key="group.clientId"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <!-- Header del cliente -->
          <div
            class="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <div
                    class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0"
                  >
                    <svg
                      class="w-4 h-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3
                    class="text-base sm:text-lg font-semibold text-gray-900 truncate"
                  >
                    {{ group.clientName }}
                  </h3>
                </div>
                <p class="text-xs sm:text-sm text-gray-500 ml-10">
                  {{ group.transactions.length }} venta(s) pendiente(s)
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs text-gray-500 mb-0.5">Total pendiente</p>
                <p
                  class="text-lg sm:text-2xl font-bold text-orange-600 tabular-nums"
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

                <!-- Botón de ver detalles y registrar pago -->
                <div class="flex items-center gap-2 shrink-0">
                  <router-link
                    :to="{
                      name: 'DetailsRecords',
                      params: { registerId: transaction.uuid },
                    }"
                    class="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Ver detalles de la venta"
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
                    class="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium inline-flex items-center gap-1.5 shadow-sm hover:shadow"
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
                    <span class="hidden sm:inline">Registrar Pago</span>
                    <span class="sm:hidden">Pagar</span>
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
                    S/ {{ getTransactionTotal(transaction).toFixed(2) }}
                  </div>
                </div>
                <div class="text-center border-x border-gray-200">
                  <div class="text-xs text-gray-500 mb-0.5">Pagado</div>
                  <div
                    class="text-sm sm:text-base font-semibold text-green-600 tabular-nums"
                  >
                    S/ {{ transaction.totalPaid.toFixed(2) }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-gray-500 mb-0.5">Pendiente</div>
                  <div
                    class="text-sm sm:text-base font-semibold text-red-600 tabular-nums"
                  >
                    S/ {{ transaction.balance.toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="filteredReceivablesByClient.length === 0"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center"
        >
          <div
            class="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-xl mb-4"
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
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            ¡Todo al día!
          </h3>
          <p class="text-sm text-gray-500">
            No tienes ventas con pagos pendientes{{
              currentFilter !== "all" ? " en este filtro" : ""
            }}
          </p>
        </div>
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
import { ref, computed, onMounted } from "vue";
import { useAccountsReceivable } from "@/composables/useAccountsReceivable";
import PaymentRegistrationModal from "@/components/AccountsReceivable/PaymentRegistrationModal.vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

const { pendingTransactions, totalReceivable, receivablesByClient } =
  useAccountsReceivable();

const transactionStore = useTransactionStore();
const showPaymentModal = ref(false);
const selectedTransaction = ref(null);
const currentFilter = ref("all");
const isLoading = ref(true);

const filters = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Parciales", value: "partial" },
];

// Cargar transacciones con balance pendiente al montar el componente
onMounted(async () => {
  try {
    console.log("🔄 Cargando cuentas por cobrar...");
    isLoading.value = true;
    await transactionStore.fetchPendingTransactions();
    console.log("✅ Cuentas por cobrar cargadas");
  } catch (error) {
    console.error("❌ Error cargando cuentas por cobrar:", error);
  } finally {
    isLoading.value = false;
  }
});

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
/* Truncate text para descripciones largas */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Números tabulares para mejor alineación de montos */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects para dispositivos con soporte */
@media (hover: hover) {
  .hover\:shadow-md:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
}

/* Estabilidad de layout */
.shrink-0 {
  flex-shrink: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  /* Asegurar que los badges no se compriman demasiado */
  .inline-flex.gap-1 {
    min-width: fit-content;
  }

  /* Mejor espaciado en móvil */
  .space-y-3 > * + * {
    margin-top: 0.75rem;
  }
}

/* Asegurar que las cifras no se deformen en pantallas pequeñas */
@media (max-width: 480px) {
  .tabular-nums {
    font-size: 0.9rem;
    line-height: 1.25rem;
  }
}
</style>
