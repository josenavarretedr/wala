<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:border-gray-200"
  >
    <!-- Header con información principal -->
    <div class="flex items-center justify-between gap-3 mb-3">
      <!-- Lado izquierdo: Badge de transferencia -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Badge de tipo de transacción -->
        <div
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0 bg-indigo-50 text-indigo-700 border border-indigo-200"
        >
          <Repeat class="w-3 h-3" />
          <span class="hidden sm:inline">Transferencia</span>
        </div>

        <!-- Badge de flujo de cuentas -->
        <div
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0 bg-blue-50 text-blue-700 border border-blue-200"
        >
          <component :is="getFromAccountIcon" class="w-3 h-3" />
          <ArrowRight class="w-2 h-2" />
          <component :is="getToAccountIcon" class="w-3 h-3" />
          <span class="hidden sm:inline">{{ getAccountsLabel }}</span>
        </div>
      </div>

      <!-- Lado derecho: Monto -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Monto -->
        <div
          class="text-base sm:text-lg font-bold tabular-nums text-indigo-600"
        >
          S/ {{ formatAmount(record.amount) }}
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
  </div>
</template>

<script setup>
import {
  Repeat,
  ArrowRight,
  Coins,
  SmartphoneDevice,
  InfoCircle,
} from "@iconoir/vue";
import { computed } from "vue";

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
});

// Computed properties para iconos y etiquetas
const getFromAccountIcon = computed(() => {
  return props.record.fromAccount === "cash" ? Coins : SmartphoneDevice;
});

const getToAccountIcon = computed(() => {
  return props.record.toAccount === "cash" ? Coins : SmartphoneDevice;
});

const getFromAccountLabel = computed(() => {
  const labels = { cash: "Efectivo", bank: "Yape/Plin" };
  return labels[props.record.fromAccount] || props.record.fromAccount;
});

const getToAccountLabel = computed(() => {
  const labels = { cash: "Efectivo", bank: "Yape/Plin" };
  return labels[props.record.toAccount] || props.record.toAccount;
});

const getAccountsLabel = computed(() => {
  const from = props.record.fromAccount === "cash" ? "Efectivo" : "Digital";
  const to = props.record.toAccount === "cash" ? "Efectivo" : "Digital";
  return `${from} → ${to}`;
});

function formatAmount(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "0.00";
  return amount.toFixed(2);
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

/* Responsive adjustments */
@media (max-width: 640px) {
  .inline-flex.gap-1 {
    min-width: fit-content;
  }
}

@media (max-width: 480px) {
  .tabular-nums {
    font-size: 0.9rem;
    line-height: 1.25rem;
  }
}
</style>
