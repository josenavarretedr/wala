<template>
  <!-- Grid de estadísticas -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
    <!-- Total Comprado -->
    <div
      class="bg-blue-50 border border-blue-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-blue-300"
    >
      <div class="flex items-center gap-2 mb-2">
        <svg
          class="w-4 h-4 text-blue-600 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p class="text-xs sm:text-sm font-medium text-blue-800">
          Total Comprado
        </p>
      </div>
      <p class="text-xl sm:text-2xl font-bold text-blue-700 tabular-nums mb-1">
        S/ {{ financialStats.totalPurchases.toFixed(2) }}
      </p>
      <p class="text-xs text-blue-600">
        {{ financialStats.transactionCount }} transacciones
      </p>
    </div>

    <!-- Total Pagado -->
    <div
      class="bg-green-50 border border-green-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-green-300"
    >
      <div class="flex items-center gap-2 mb-2">
        <svg
          class="w-4 h-4 text-green-600 shrink-0"
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
        <p class="text-xs sm:text-sm font-medium text-green-800">
          Total Pagado
        </p>
      </div>
      <p class="text-xl sm:text-2xl font-bold text-green-700 tabular-nums mb-1">
        S/ {{ financialStats.totalPaid.toFixed(2) }}
      </p>
      <p class="text-xs text-green-600">{{ paymentPercentage }}% del total</p>
    </div>

    <!-- Saldo Pendiente -->
    <div
      class="bg-red-50 border border-red-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-red-300"
    >
      <div class="flex items-center gap-2 mb-2">
        <svg
          class="w-4 h-4 text-red-600 shrink-0"
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
        <p class="text-xs sm:text-sm font-medium text-red-800">
          Saldo Pendiente
        </p>
      </div>
      <p class="text-xl sm:text-2xl font-bold text-red-700 tabular-nums mb-1">
        S/ {{ financialStats.pendingBalance.toFixed(2) }}
      </p>
      <p class="text-xs text-red-600">{{ debtPercentage }}% pendiente</p>
    </div>
  </div>

  <!-- Barra de progreso de pagos -->
  <div
    class="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-6 mt-4 transition-all duration-200 hover:shadow-md"
  >
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-base sm:text-lg font-semibold text-gray-900">
        Estado de Pagos
      </h3>
      <span class="text-lg sm:text-xl font-bold text-blue-600 tabular-nums">
        {{ paymentPercentage }}%
      </span>
    </div>

    <div class="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
      <div
        class="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
        :style="{ width: `${paymentPercentage}%` }"
      ></div>
    </div>

    <div class="flex items-center justify-between text-xs text-gray-500">
      <span>S/ {{ financialStats.totalPaid.toFixed(2) }}</span>
      <span class="font-medium">
        S/ {{ financialStats.totalPurchases.toFixed(2) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  financialStats: {
    type: Object,
    required: true,
    default: () => ({
      totalPurchases: 0,
      totalPaid: 0,
      pendingBalance: 0,
      transactionCount: 0,
    }),
  },
});

const paymentPercentage = computed(() => {
  if (props.financialStats.totalPurchases === 0) return 0;
  return Math.round(
    (props.financialStats.totalPaid / props.financialStats.totalPurchases) * 100
  );
});

const debtPercentage = computed(() => {
  if (props.financialStats.totalPurchases === 0) return 0;
  return Math.round(
    (props.financialStats.pendingBalance /
      props.financialStats.totalPurchases) *
      100
  );
});
</script>

<style scoped>
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

/* Responsive adjustments */
@media (max-width: 640px) {
  /* Mejor espaciado en móvil */
  .gap-3 {
    gap: 0.75rem;
  }
}

/* Asegurar que las cifras no se deformen en pantallas pequeñas */
@media (max-width: 480px) {
  .tabular-nums {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}
</style>
