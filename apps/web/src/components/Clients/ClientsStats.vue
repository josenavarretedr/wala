<template>
  <!-- Estadísticas -->
  <div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6"
  >
    <!-- Total Clientes -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:shadow-md hover:border-blue-200"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0"
        >
          <svg
            class="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm text-gray-500 mb-0.5">Total Clientes</p>
          <p class="text-xl sm:text-2xl font-bold text-blue-600 tabular-nums">
            {{ clientsStats.activeClients }}
          </p>
        </div>
      </div>
    </div>

    <!-- Con Deuda -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:shadow-md hover:border-orange-200"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center shrink-0"
        >
          <svg
            class="w-6 h-6 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm text-gray-500 mb-0.5">Con Deuda</p>
          <p class="text-xl sm:text-2xl font-bold text-orange-600 tabular-nums">
            {{ clientsStats.clientsWithDebt }}
          </p>
        </div>
      </div>
    </div>

    <!-- Total Ventas -->
    <!-- <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:shadow-md hover:border-green-200"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center shrink-0"
        >
          <svg
            class="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm text-gray-500 mb-0.5">Total Ventas</p>
          <p class="text-xl sm:text-2xl font-bold text-green-600 tabular-nums">
            S/ {{ clientsStats.totalSales.toFixed(2) }}
          </p>
        </div>
      </div>
    </div> -->

    <!-- Por Cobrar -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:shadow-md hover:border-red-200"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center shrink-0"
        >
          <svg
            class="w-6 h-6 text-red-600"
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
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm text-gray-500 mb-0.5">Por Cobrar</p>
          <p class="text-xl sm:text-2xl font-bold text-red-600 tabular-nums">
            S/ {{ clientsStats.totalReceivable.toFixed(2) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  clientsStats: {
    type: Object,
    required: true,
  },
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

.min-w-0 {
  min-width: 0;
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
