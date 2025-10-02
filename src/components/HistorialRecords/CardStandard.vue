<template>
  <div
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
      </div>

      <!-- Lado derecho: Monto y botón -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Monto -->
        <div
          :class="[
            'text-base sm:text-lg font-bold tabular-nums',
            record.type === 'income' ? 'text-blue-600' : 'text-red-600',
          ]"
        >
          {{ record.type === "income" ? "+" : "-" }}S/
          {{ formatAmount(record.total) }}
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
