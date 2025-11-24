<template>
  <!-- CARD PARA TRANSACCIONES TIPO 'PAYMENT' (COBROS) -->
  <div
    v-if="record.type === 'payment'"
    class="bg-emerald-50 rounded-xl shadow-sm border border-emerald-200 p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:border-emerald-300"
  >
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 mb-3">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Badge de Cobro -->
        <div
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0"
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
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <span class="hidden sm:inline">Cobro</span>
        </div>

        <!-- Método de pago -->
        <div
          :class="[
            'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0',
            record.account === 'cash'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-purple-100 text-purple-700 border border-purple-200',
          ]"
        >
          <component
            :is="record.account === 'cash' ? Coins : SmartphoneDevice"
            class="w-3 h-3"
          />
          <span class="hidden sm:inline">{{
            record.account === "cash" ? "Efectivo" : "Digital"
          }}</span>
        </div>
      </div>

      <!-- Monto -->
      <div class="flex items-center gap-2 shrink-0">
        <div
          class="text-base sm:text-lg font-bold text-emerald-700 tabular-nums"
        >
          +S/ {{ formatAmount(record.amount) }}
        </div>
        <router-link
          :to="{ name: 'DetailsRecords', params: { registerId: record.uuid } }"
          class="p-1 text-emerald-400 hover:text-emerald-600 rounded-md transition-colors"
        >
          <InfoCircle class="w-4 h-4" />
        </router-link>
      </div>
    </div>

    <!-- Cliente y referencia -->
    <div class="space-y-1 text-xs">
      <div class="flex items-center gap-1.5 text-emerald-700">
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span class="font-medium truncate">{{ record.clientName }}</span>
      </div>
      <div class="text-emerald-600 flex items-center gap-2">
        <span>Venta #{{ record.relatedTransactionId.slice(0, 8) }}</span>
        <span v-if="record.newBalance > 0" class="text-orange-600">
          • Saldo: S/ {{ record.newBalance.toFixed(2) }}
        </span>
        <span v-else class="text-green-700 font-medium">• Saldado</span>
      </div>
    </div>

    <!-- Fecha -->
    <div
      class="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 pt-2 border-t border-emerald-200"
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
      <span class="truncate">{{ formatedDate(record.createdAt) }}</span>
    </div>
  </div>

  <!-- CARD PARA INGRESOS Y EGRESOS (EXISTENTE CON MEJORAS) -->
  <div
    v-else
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:border-gray-200"
  >
    <!-- Header con información principal -->
    <div class="flex items-center justify-between gap-3 mb-3">
      <!-- Lado izquierdo: Badges -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Badge de tipo de transacción -->
        <div
          :class="[
            'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0',
            record.type === 'income'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-red-50 text-red-700 border border-red-200',
          ]"
        >
          <component
            :is="record.type === 'income' ? GraphUp : DatabaseExport"
            class="w-3 h-3"
          />
          <span class="hidden sm:inline">{{
            record.type === "income" ? "Venta" : "Salida"
          }}</span>
        </div>

        <!-- Badge de método de pago -->
        <div
          :class="[
            'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0',
            record.account === 'cash'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-purple-50 text-purple-700 border border-purple-200',
          ]"
        >
          <component
            :is="record.account === 'cash' ? Coins : SmartphoneDevice"
            class="w-3 h-3"
          />
          <span class="hidden sm:inline">{{
            record.account === "cash" ? "Efectivo" : "Digital"
          }}</span>
        </div>

        <!-- Badge de estado de pago parcial -->
        <div
          v-if="record.type === 'income' && record.paymentStatus === 'partial'"
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 shrink-0"
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span class="hidden sm:inline"
            >Falta: S/ {{ record.balance?.toFixed(2) }}</span
          >
          <span class="sm:hidden">Parcial</span>
        </div>

        <!-- Badge de pago pendiente -->
        <div
          v-if="record.type === 'income' && record.paymentStatus === 'pending'"
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 border border-red-200 shrink-0"
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="hidden sm:inline">Pendiente</span>
        </div>
      </div>

      <!-- Lado derecho: Monto y botón -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Monto con lógica para pagos parciales -->
        <div
          v-if="
            record.type === 'income' &&
            record.paymentStatus &&
            record.paymentStatus !== 'completed'
          "
          class="text-right"
        >
          <div
            class="text-base sm:text-lg font-bold text-blue-600 tabular-nums"
          >
            +S/ {{ formatAmount(record.totalPaid || record.amount) }}
          </div>
          <div class="text-xs text-gray-500">de S/ {{ getTotal(record) }}</div>
        </div>

        <!-- Monto normal para pagos completados o no especificados -->
        <div
          v-else
          :class="[
            'text-base sm:text-lg font-bold tabular-nums',
            record.type === 'income' ? 'text-blue-600' : 'text-red-600',
          ]"
        >
          {{ record.type === "income" ? "+" : "-" }}S/
          {{ formatAmount(record.amount) }}
        </div>

        <!-- Botón de detalles -->
        <router-link
          :to="{
            name: 'DetailsRecords',
            params: { registerId: record.uuid },
          }"
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
          title="Ver detalles"
        >
          <InfoCircle class="w-4 h-4" />
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
      <span class="truncate">{{ formatedDate(record.createdAt) }}</span>
    </div>

    <!-- Cliente (solo para ingresos con cliente no anónimo) -->
    <div
      v-if="
        record.type === 'income' &&
        record.clientId &&
        record.clientId !== 'anonymous-client'
      "
      class="flex items-center gap-1 text-xs text-gray-600 mb-2 px-2 py-1 bg-gray-50 rounded-md"
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
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <span class="truncate font-medium">{{ record.clientName }}</span>
    </div>

    <!-- Información adicional si existe -->
    <div
      v-if="record.description || record.products?.length"
      class="pt-2 border-t border-gray-100 space-y-2"
    >
      <!-- Descripción -->
      <p v-if="record.description" class="text-sm text-gray-600 line-clamp-2">
        {{ record.description }}
      </p>

      <!-- Número de productos -->
      <div
        v-if="record.products?.length"
        class="flex items-center gap-1 text-xs text-gray-500"
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <span
          >{{ record.products.length }} producto{{
            record.products.length !== 1 ? "s" : ""
          }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  GraphUp,
  DatabaseExport,
  Coins,
  SmartphoneDevice,
  InfoCircle,
} from "@iconoir/vue";

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
});

function formatAmount(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "0.00";
  return amount.toFixed(2);
}

function getTotal(record) {
  return (record.total || record.amount || 0).toFixed(2);
}

function formatedDate(date) {
  if (!date) return "-";
  const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  return d.toLocaleString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
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

/* Hover effects para touch devices */
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

/* Responsive adjustments mejorados */
@media (max-width: 640px) {
  /* Asegurar que los badges no se compriman demasiado */
  .inline-flex.gap-1 {
    min-width: fit-content;
  }

  /* Mejor espaciado en móvil */
  .space-y-2 > * + * {
    margin-top: 0.5rem;
  }
}

/* Asegurar que las cifras no se deformen */
@media (max-width: 480px) {
  .tabular-nums {
    font-size: 0.9rem;
    line-height: 1.25rem;
  }
}
</style>
