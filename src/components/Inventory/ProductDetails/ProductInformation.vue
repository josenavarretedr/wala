<template>
  <!-- Product Information Block -->
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
  >
    <!-- Descripción -->
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <div
          class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0"
        >
          <svg
            class="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            ></path>
          </svg>
        </div>
        <span class="text-xs sm:text-sm font-medium text-gray-600"
          >Descripción</span
        >
      </div>
      <p class="text-base sm:text-lg font-semibold text-gray-900 ml-10">
        {{ description || "Sin descripción" }}
      </p>
    </div>

    <!-- Grid de información financiera -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
      <!-- Precio de Venta -->
      <div class="bg-green-50 rounded-lg p-3 sm:p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg
            class="w-4 h-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span class="text-xs sm:text-sm font-medium text-green-700"
            >Precio de Venta</span
          >
        </div>
        <p
          class="text-base sm:text-lg font-semibold text-green-800 tabular-nums"
        >
          S/ {{ formatPrice(price) }}
        </p>
      </div>

      <!-- Costo -->
      <div class="bg-orange-50 rounded-lg p-3 sm:p-4">
        <div class="flex items-center gap-2 mb-2">
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
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
          <span class="text-xs sm:text-sm font-medium text-orange-700"
            >Costo</span
          >
        </div>
        <p
          v-if="cost"
          class="text-base sm:text-lg font-semibold text-orange-800 tabular-nums"
        >
          S/ {{ formatPrice(cost) }}
        </p>
        <p v-else class="text-base sm:text-lg font-semibold text-gray-400">
          No registrado
        </p>
      </div>

      <!-- Margen de Ganancia -->
      <div v-if="cost && price" class="bg-purple-50 rounded-lg p-3 sm:p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg
            class="w-4 h-4 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            ></path>
          </svg>
          <span class="text-xs sm:text-sm font-medium text-purple-700"
            >Margen</span
          >
        </div>
        <p
          class="text-base sm:text-lg font-semibold text-purple-800 tabular-nums"
        >
          {{ calculateMarginPercentage }}%
          <span class="text-xs text-purple-600 ml-1"
            >(S/ {{ calculateMarginAmount }})</span
          >
        </p>
      </div>
    </div>

    <!-- Fecha de Registro -->
    <!-- <div v-if="createdAt" class="border-t border-gray-100 pt-4">
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0"
        >
          <svg
            class="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500">Fecha de Registro</p>
          <p class="text-sm font-medium text-gray-900">
            {{ formatDate(createdAt) }}
          </p>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { computed } from "vue";

// Props
const props = defineProps({
  description: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },
  cost: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: [Object, Date, String],
    default: null,
  },
});

// Computed: Margin calculations
const calculateMarginAmount = computed(() => {
  if (!props.price || !props.cost) return "0.00";
  const margin = props.price - props.cost;
  return margin.toFixed(2);
});

const calculateMarginPercentage = computed(() => {
  if (!props.price || !props.cost) return "0.00";
  const margin = ((props.price - props.cost) / props.cost) * 100;
  return margin.toFixed(2);
});

// Methods
const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  return Number(price).toFixed(2);
};

const formatDate = (date) => {
  if (!date) return "Fecha no disponible";

  let dateObj;
  if (date.toDate && typeof date.toDate === "function") {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) return "Fecha inválida";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return dateObj.toLocaleDateString("es-ES", options);
};
</script>

<style scoped>
/* Números tabulares para mejor alineación */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Estabilidad de layout */
.shrink-0 {
  flex-shrink: 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  /* Mejor espaciado en móvil */
  .grid {
    gap: 0.75rem;
  }
}
</style>
