<template>
  <div class="transactions-list-wrapper">
    <div v-if="loading" class="loading-state">
      <SpinnerIcon size="lg" />
      <p class="text-sm text-gray-500 mt-3">Cargando transacciones...</p>
    </div>

    <div v-else-if="transactions.length === 0" class="empty-state">
      <svg
        class="w-16 h-16 text-gray-300"
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
      <h3 class="empty-title">Sin transacciones</h3>
      <p class="empty-description">
        Este cliente aún no ha realizado ninguna compra
      </p>
    </div>

    <div v-else class="transactions-list">
      <div
        v-for="transaction in transactions"
        :key="transaction.uuid"
        class="transaction-card"
      >
        <!-- Header -->
        <div class="transaction-header">
          <div class="transaction-info">
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Badge de tipo -->
              <span
                :class="[
                  'transaction-badge',
                  getTransactionTypeClass(transaction.type),
                ]"
              >
                {{ getTransactionTypeLabel(transaction.type) }}
              </span>

              <!-- Badge de estado de pago -->
              <span
                v-if="transaction.paymentStatus"
                :class="[
                  'payment-badge',
                  getPaymentStatusClass(transaction.paymentStatus),
                ]"
              >
                {{ getPaymentStatusLabel(transaction.paymentStatus) }}
              </span>
            </div>

            <p class="transaction-date">
              {{ formatDate(transaction.createdAt) }}
            </p>
          </div>

          <router-link
            :to="{
              name: 'DetailsRecords',
              params: { registerId: transaction.uuid },
            }"
            class="view-details-link"
            title="Ver detalles"
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </router-link>
        </div>

        <!-- Descripción -->
        <p v-if="transaction.description" class="transaction-description">
          {{ transaction.description }}
        </p>

        <!-- Montos -->
        <div class="transaction-amounts">
          <div class="amount-item">
            <span class="amount-label">Total</span>
            <span class="amount-value text-gray-900">
              S/ {{ getTransactionTotal(transaction).toFixed(2) }}
            </span>
          </div>

          <div v-if="hasPaymentInfo(transaction)" class="amount-item">
            <span class="amount-label">Pagado</span>
            <span class="amount-value text-green-600">
              S/ {{ (transaction.totalPaid || 0).toFixed(2) }}
            </span>
          </div>

          <div
            v-if="hasPaymentInfo(transaction) && transaction.balance > 0"
            class="amount-item"
          >
            <span class="amount-label">Pendiente</span>
            <span class="amount-value text-red-600">
              S/ {{ transaction.balance.toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Items (si existen) -->
        <div
          v-if="transaction.items && transaction.items.length > 0"
          class="transaction-items"
        >
          <p class="items-title">Productos ({{ transaction.items.length }})</p>
          <div class="items-list">
            <div
              v-for="(item, index) in transaction.items.slice(0, 3)"
              :key="index"
              class="item-row"
            >
              <span class="item-name">{{ item.name || "Sin nombre" }}</span>
              <span class="item-quantity">x{{ item.quantity || 1 }}</span>
              <span class="item-price">
                S/ {{ ((item.quantity || 1) * (item.price || 0)).toFixed(2) }}
              </span>
            </div>
            <p v-if="transaction.items.length > 3" class="items-more">
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

  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
      transaction.paymentStatus === "paid")
  );
}

function getTransactionTypeLabel(type) {
  const types = {
    SALE: "Venta",
    PURCHASE: "Compra",
    EXPENSE: "Gasto",
    INCOME: "Ingreso",
    TRANSFER: "Transferencia",
  };
  return types[type] || type || "Venta";
}

function getTransactionTypeClass(type) {
  const classes = {
    SALE: "badge-sale",
    PURCHASE: "badge-purchase",
    EXPENSE: "badge-expense",
    INCOME: "badge-income",
    TRANSFER: "badge-transfer",
  };
  return classes[type] || "badge-sale";
}

function getPaymentStatusLabel(status) {
  const statuses = {
    paid: "Pagado",
    partial: "Parcial",
    pending: "Pendiente",
  };
  return statuses[status] || status;
}

function getPaymentStatusClass(status) {
  const classes = {
    paid: "status-paid",
    partial: "status-partial",
    pending: "status-pending",
  };
  return classes[status] || "status-pending";
}
</script>

<style scoped>
.transactions-list-wrapper {
  min-height: 300px;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Transactions List */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s;
}

.transaction-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

/* Transaction Header */
.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.transaction-info {
  flex: 1;
}

.transaction-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid;
}

.badge-sale {
  background: #dbeafe;
  color: #1e40af;
  border-color: #93c5fd;
}

.badge-purchase {
  background: #e0e7ff;
  color: #4338ca;
  border-color: #a5b4fc;
}

.badge-expense {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.badge-income {
  background: #dcfce7;
  color: #166534;
  border-color: #86efac;
}

.badge-transfer {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.payment-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid;
}

.status-paid {
  background: #dcfce7;
  color: #166534;
  border-color: #86efac;
}

.status-partial {
  background: #fef3c7;
  color: #92400e;
  border-color: #fcd34d;
}

.status-pending {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fca5a5;
}

.transaction-date {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.view-details-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  color: #3b82f6;
  background: #eff6ff;
  border-radius: 8px;
  transition: all 0.2s;
  text-decoration: none;
}

.view-details-link:hover {
  background: #dbeafe;
  color: #1e40af;
}

/* Transaction Description */
.transaction-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

/* Transaction Amounts */
.transaction-amounts {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.amount-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.amount-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.amount-value {
  font-size: 1rem;
  font-weight: 700;
}

/* Transaction Items */
.transaction-items {
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.items-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.item-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.8rem;
  padding: 0.375rem 0.5rem;
  background: white;
  border-radius: 6px;
}

.item-name {
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-quantity {
  color: #6b7280;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.item-price {
  color: #059669;
  font-weight: 600;
  min-width: 80px;
  text-align: right;
}

.items-more {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
  margin-top: 0.25rem;
  text-align: center;
}

/* Responsive */
@media (max-width: 640px) {
  .transaction-amounts {
    flex-direction: column;
    gap: 0.75rem;
  }

  .amount-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .item-row {
    grid-template-columns: 1fr auto;
    font-size: 0.75rem;
  }

  .item-quantity {
    grid-column: 2;
    grid-row: 1;
  }

  .item-price {
    grid-column: 2;
    grid-row: 2;
  }
}
</style>
