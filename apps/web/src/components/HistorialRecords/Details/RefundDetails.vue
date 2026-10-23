<template>
  <div class="space-y-6">
    <!-- Encabezado -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
        <span>↩ Nota de Devolución</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Detalle de Devolución
      </h1>
      <p class="text-sm text-gray-500">
        {{ formatDate(transactionData.createdAt) }}
      </p>
    </div>

    <!-- Tarjeta principal -->
    <div class="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden">
      <!-- Cabecera de monto devuelto -->
      <div class="bg-gradient-to-r from-rose-500 to-rose-600 text-white p-6 text-center">
        <div class="text-3xl font-bold mb-1">
          -S/ {{ formatAmount(transactionData.amount) }}
        </div>
        <div class="text-sm text-rose-100">
          Dinero devuelto de caja en este día
        </div>

        <!-- Desglose Efectivo / Banco / Crédito anulado -->
        <div class="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span
            v-if="(transactionData.cashOut || 0) > 0"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20"
          >
            Efectivo: -S/ {{ formatAmount(transactionData.cashOut) }}
          </span>
          <span
            v-if="(transactionData.bankOut || 0) > 0"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20"
          >
            Banco/Digital: -S/ {{ formatAmount(transactionData.bankOut) }}
          </span>
          <span
            v-if="(transactionData.detractionOut || 0) > 0"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/30 text-white border border-amber-200/40"
          >
            Detracción: -S/ {{ formatAmount(transactionData.detractionOut) }}
          </span>
          <span
            v-if="(transactionData.cancelledBalance || 0) > 0"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/30 text-white border border-amber-200/40"
          >
            Deuda anulada: S/ {{ formatAmount(transactionData.cancelledBalance) }}
          </span>
        </div>
      </div>

      <!-- Referencia a la venta original -->
      <div class="p-4 border-b border-gray-100 bg-rose-50/40">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div class="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Venta Original Anulada
            </div>
            <div class="text-sm text-gray-800 font-medium mt-0.5">
              Venta #{{ transactionData.relatedTransactionNumber || (transactionData.relatedTransactionId || '').slice(0, 8) }}
              <span v-if="transactionData.originalSaleDay" class="text-gray-500">
                (del {{ transactionData.originalSaleDay }})
              </span>
            </div>
            <div v-if="transactionData.reason" class="text-xs text-gray-600 mt-1">
              Motivo: {{ transactionData.reason }}
            </div>
          </div>

          <router-link
            v-if="transactionData.relatedTransactionId"
            :to="{
              name: 'DetailsRecords',
              params: { registerId: transactionData.relatedTransactionId },
            }"
            class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 transition-colors"
          >
            <span>Ver venta original</span>
          </router-link>
        </div>
      </div>

      <!-- Cliente si aplica -->
      <div
        v-if="transactionData.clientId && transactionData.clientId !== 'anonymous-client'"
        class="p-4 border-b border-gray-100"
      >
        <h3 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <User class="w-4 h-4 text-gray-500" />
          Cliente
        </h3>
        <div class="bg-purple-50 rounded-xl p-3 text-sm font-medium text-purple-800">
          {{ transactionData.clientName || 'Cliente' }}
        </div>
      </div>

      <!-- Productos reincorporados a inventario -->
      <div
        v-if="transactionData.items && transactionData.items.length > 0"
        class="p-4"
      >
        <h3 class="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Package class="w-4 h-4 text-gray-600" />
          Productos reincorporados al inventario
        </h3>
        <div class="space-y-2">
          <div
            v-for="(item, idx) in transactionData.items"
            :key="item.uuid || idx"
            class="bg-gray-50 rounded-xl p-3 flex justify-between items-center"
          >
            <div class="min-w-0 pr-3">
              <div class="text-sm font-semibold text-gray-900 truncate">
                {{ (item.description || item.name || 'Producto').toUpperCase() }}
              </div>
              <div v-if="item.variantLabel" class="text-xs text-violet-700 font-medium">
                Variante: {{ item.variantLabel }}
              </div>
              <div class="text-xs text-gray-500">
                +{{ item.quantity }} {{ item.unit || 'uni' }} devuelto(s) a stock
              </div>
            </div>
            <div class="text-right text-sm font-bold text-gray-700">
              S/ {{ formatAmount((item.quantity || 0) * (item.price || 0)) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package, User } from '@iconoir/vue';

defineProps({
  transactionData: {
    type: Object,
    required: true,
  },
  targetRef: {
    type: Object,
    default: null,
  },
});

function formatAmount(val) {
  return Number(val || 0).toFixed(2);
}

function formatDate(date) {
  if (!date) return '';
  let dateObj = date;
  if (typeof date?.toDate === 'function') {
    dateObj = date.toDate();
  } else if (date?.seconds !== undefined) {
    dateObj = new Date(date.seconds * 1000);
  } else if (!(date instanceof Date)) {
    dateObj = new Date(date);
  }
  if (isNaN(dateObj.getTime())) return '';
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}
</script>
