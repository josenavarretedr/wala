<template>
  <div class="space-y-4">
    <!-- Estado de carga -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <SpinnerIcon size="lg" />
      <p class="text-sm text-gray-500 mt-3">Cargando transacciones...</p>
    </div>

    <!-- Estado vacío -->
    <div
      v-else-if="transactions.length === 0"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <div
        class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4"
      >
        <svg
          class="w-8 h-8 text-gray-400"
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
      <h3 class="text-lg font-semibold text-gray-800 mb-1">
        Sin transacciones
      </h3>
      <p class="text-sm text-gray-500">
        Este cliente aún no ha realizado ninguna compra
      </p>
    </div>

    <!-- Lista de transacciones -->
    <div v-else class="space-y-3">
      <div
        v-for="transaction in transactions"
        :key="transaction.uuid"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:border-gray-200"
      >
        <!-- Header con badges y monto -->
        <div class="flex items-start justify-between gap-3 mb-3">
          <!-- Lado izquierdo: Badges -->
          <div class="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            <!-- Badge de tipo de transacción -->
            <div
              :class="[
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0',
                getTransactionTypeClass(transaction.type),
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
                  :d="getTransactionTypeIcon(transaction.type)"
                />
              </svg>
              <span class="hidden sm:inline">{{
                getTransactionTypeLabel(transaction.type)
              }}</span>
            </div>

            <!-- Badge de estado de pago -->
            <div
              v-if="transaction.paymentStatus"
              :class="[
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0',
                getPaymentStatusClass(transaction.paymentStatus),
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
                  :d="getPaymentStatusIcon(transaction.paymentStatus)"
                />
              </svg>
              <span class="hidden sm:inline">{{
                getPaymentStatusLabel(transaction.paymentStatus)
              }}</span>
            </div>

            <!-- Badge de método de pago -->
            <div
              v-if="transaction.account"
              :class="[
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0',
                transaction.account === 'cash'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200',
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
                  :d="
                    transaction.account === 'cash'
                      ? 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      : 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
                  "
                />
              </svg>
              <span class="hidden sm:inline">{{
                transaction.account === "cash" ? "Efectivo" : "Digital"
              }}</span>
            </div>
          </div>

          <!-- Lado derecho: Monto y botón -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Monto -->
            <!-- <div class="text-right">
              <div
                class="text-base sm:text-lg font-bold text-blue-600 tabular-nums"
              >
                S/ {{ getTransactionTotal(transaction).toFixed(2) }}
              </div>
              <div
                v-if="hasPaymentInfo(transaction) && transaction.totalPaid > 0"
                class="text-xs text-gray-500"
              >
                Pagado: S/ {{ transaction.totalPaid.toFixed(2) }}
              </div>
            </div> -->

            <!-- Botón de detalles -->
            <router-link
              :to="{
                name: 'DetailsRecords',
                params: { registerId: transaction.uuid },
              }"
              class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              title="Ver detalles"
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
          </div>
        </div>

        <!-- Fecha -->
        <div class="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
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
          <span class="truncate">{{ formatDate(transaction.createdAt) }}</span>
        </div>

        <!-- Descripción (si existe) -->
        <p
          v-if="transaction.description"
          class="text-sm text-gray-600 mb-3 line-clamp-2"
        >
          {{ transaction.description }}
        </p>

        <!-- Montos detallados (solo si hay info de pagos) -->
        <div
          v-if="hasPaymentInfo(transaction)"
          class="bg-gray-50 rounded-lg p-3 mb-3"
        >
          <div class="grid grid-cols-3 gap-3 text-center">
            <div>
              <div class="text-xs text-gray-500 mb-1">Total</div>
              <div class="text-sm font-bold text-gray-900 tabular-nums">
                S/ {{ getTransactionTotal(transaction).toFixed(2) }}
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Pagado</div>
              <div class="text-sm font-bold text-green-600 tabular-nums">
                S/ {{ (transaction.totalPaid || 0).toFixed(2) }}
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Pendiente</div>
              <div class="text-sm font-bold text-red-600 tabular-nums">
                S/ {{ (transaction.balance || 0).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Productos (si existen) -->
        <div
          v-if="transaction.items && transaction.items.length > 0"
          class="pt-3 border-t border-gray-100"
        >
          <div class="flex items-center gap-1.5 text-xs text-gray-700 mb-2">
            <svg
              class="w-3.5 h-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <span class="font-medium">
              {{ transaction.items.length }} producto{{
                transaction.items.length !== 1 ? "s" : ""
              }}
            </span>
          </div>

          <div class="space-y-2">
            <div
              v-for="(item, index) in transaction.items.slice(0, 3)"
              :key="index"
              class="bg-white rounded-lg p-2 border border-gray-100"
            >
              <div class="flex justify-between items-start gap-2">
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">
                    {{ item.name || item.description || "Sin nombre" }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ item.quantity || 1 }} × S/
                    {{ (item.price || 0).toFixed(2) }}
                  </div>
                </div>
                <div class="text-sm font-semibold text-gray-900 tabular-nums">
                  S/
                  {{ ((item.quantity || 1) * (item.price || 0)).toFixed(2) }}
                </div>
              </div>
            </div>

            <p
              v-if="transaction.items.length > 3"
              class="text-xs text-gray-500 text-center italic"
            >
              +{{ transaction.items.length - 3 }} producto(s) más
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

function formatDate(timestamp) {
  if (!timestamp) return "-";
  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);

  return date.toLocaleString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getTransactionTotal(transaction) {
  return transaction.total || transaction.amount || 0;
}

function hasPaymentInfo(transaction) {
  return (
    transaction.paymentStatus &&
    (transaction.paymentStatus === "partial" ||
      transaction.paymentStatus === "pending" ||
      transaction.paymentStatus === "paid" ||
      transaction.paymentStatus === "completed")
  );
}

function getTransactionTypeLabel(type) {
  const types = {
    SALE: "Venta",
    income: "Venta",
    PURCHASE: "Compra",
    EXPENSE: "Gasto",
    expense: "Gasto",
    INCOME: "Ingreso",
    TRANSFER: "Transferencia",
  };
  return types[type] || type || "Venta";
}

function getTransactionTypeClass(type) {
  const classes = {
    SALE: "bg-blue-50 text-blue-700 border border-blue-200",
    income: "bg-blue-50 text-blue-700 border border-blue-200",
    PURCHASE: "bg-purple-50 text-purple-700 border border-purple-200",
    EXPENSE: "bg-red-50 text-red-700 border border-red-200",
    expense: "bg-red-50 text-red-700 border border-red-200",
    INCOME: "bg-green-50 text-green-700 border border-green-200",
    TRANSFER: "bg-gray-50 text-gray-700 border border-gray-200",
  };
  return classes[type] || "bg-blue-50 text-blue-700 border border-blue-200";
}

function getTransactionTypeIcon(type) {
  const icons = {
    SALE: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    income:
      "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    PURCHASE: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
    EXPENSE:
      "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    expense:
      "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    INCOME:
      "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    TRANSFER: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  };
  return icons[type] || icons.SALE;
}

function getPaymentStatusLabel(status) {
  const statuses = {
    paid: "Pagado",
    completed: "Pagado",
    partial: "Parcial",
    pending: "Pendiente",
  };
  return statuses[status] || status;
}

function getPaymentStatusClass(status) {
  const classes = {
    paid: "bg-green-50 text-green-700 border border-green-200",
    completed: "bg-green-50 text-green-700 border border-green-200",
    partial: "bg-amber-50 text-amber-700 border border-amber-200",
    pending: "bg-red-50 text-red-700 border border-red-200",
  };
  return classes[status] || "bg-red-50 text-red-700 border border-red-200";
}

function getPaymentStatusIcon(status) {
  const icons = {
    paid: "M5 13l4 4L19 7",
    completed: "M5 13l4 4L19 7",
    partial:
      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    pending: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };
  return icons[status] || icons.pending;
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

/* Números tabulares para mejor alineación */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
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
</style>
