<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:border-gray-200"
  >
    <!-- Header con información principal -->
    <div class="flex items-center justify-between gap-3 mb-3">
      <!-- Lado izquierdo: Badge de tipo -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <div
          :class="[
            'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0',
            getBadgeClass,
          ]"
        >
          <component :is="getIcon" class="w-3 h-3" />
          <span class="hidden sm:inline">{{ getTypeText }}</span>
        </div>
      </div>

      <!-- Lado derecho: Cantidad y botón de detalles -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Cantidad -->
        <div
          :class="[
            'text-base sm:text-lg font-bold tabular-nums',
            getQuantityColorClass,
          ]"
        >
          {{ getQuantityPrefix }}{{ log.quantity || 0 }} {{ productUnit }}
        </div>

        <!-- Botón de detalles -->
        <router-link
          v-if="log.transactionId"
          :to="{
            name: 'DetailsRecords',
            params: { registerId: log.transactionId },
          }"
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
          title="Ver detalles de la transacción"
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
      <span class="truncate">{{ formatedDate(log.createdAt) }}</span>
    </div>

    <!-- Información financiera -->
    <div
      v-if="log.cost || log.price"
      class="pt-2 border-t border-gray-100 space-y-2"
    >
      <!-- Grid de cost y price -->
      <div class="grid grid-cols-2 gap-2">
        <!-- Costo (solo para compras) -->
        <div
          v-if="log.cost && log.type === 'buy'"
          class="flex flex-col gap-0.5 bg-amber-50 rounded-lg px-2 py-1.5 border border-amber-200"
        >
          <span class="text-[10px] text-amber-600 font-medium">Costo</span>
          <div class="flex items-center gap-1">
            <svg
              class="w-3 h-3 shrink-0 text-amber-600"
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
            <span class="text-xs font-bold text-amber-700">
              S/ {{ log.cost.toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Precio (solo para ventas) -->
        <div
          v-if="log.price && log.type === 'sell'"
          class="flex flex-col gap-0.5 bg-green-50 rounded-lg px-2 py-1.5 border border-green-200"
        >
          <span class="text-[10px] text-green-600 font-medium">Precio</span>
          <div class="flex items-center gap-1">
            <svg
              class="w-3 h-3 shrink-0 text-green-600"
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
            <span class="text-xs font-bold text-green-700">
              S/ {{ log.price.toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Margen (solo para ventas con cost y price) -->
        <!-- <div
          v-if="showMargin"
          class="col-span-2 flex items-center justify-between bg-blue-50 rounded-lg px-2 py-1.5 border border-blue-200"
        >
          <div class="flex items-center gap-1.5">
            <svg
              class="w-3 h-3 shrink-0 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span class="text-xs font-medium text-blue-700">Margen:</span>
          </div>
          <span
            :class="[
              'text-xs font-bold',
              getMargin > 0 ? 'text-green-600' : 'text-red-600',
            ]"
          >
            S/ {{ getMargin.toFixed(2) }} ({{ getMarginPercentage }}%)
          </span>
        </div> -->
      </div>
    </div>

    <!-- Información adicional si existe -->
    <div v-if="log.reason || log.notes" class="pt-2 border-t border-gray-100">
      <p class="text-sm text-gray-600 line-clamp-2">
        {{ log.reason || log.notes }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import {
  ShoppingBag,
  Package,
  Refresh,
  Calculator,
  InfoCircle,
} from "@iconoir/vue";

const props = defineProps({
  log: {
    type: Object,
    required: true,
  },
  productUnit: {
    type: String,
    default: "uni",
  },
});

// Debug: Log cuando el componente recibe props
onMounted(() => {
  console.log("🎴 [CardStandarMove] Log recibido:", {
    type: props.log.type,
    quantity: props.log.quantity,
    transactionId: props.log.transactionId,
    hasTransactionId: !!props.log.transactionId,
    fullLog: props.log,
  });
});

// Computed: Badge class
const getBadgeClass = computed(() => {
  switch (props.log.type) {
    case "sell":
      return "bg-red-50 text-red-700 border border-red-200";
    case "waste":
      return "bg-red-50 text-red-700 border border-red-200";
    case "buy":
      return "bg-green-50 text-green-700 border border-green-200";
    case "return":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "adjustment":
    case "inventory":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    default:
      return "bg-gray-50 text-gray-700 border border-gray-200";
  }
});

// Computed: Icon
const getIcon = computed(() => {
  switch (props.log.type) {
    case "sell":
      return ShoppingBag;
    case "buy":
      return Package;
    case "return":
      return Refresh;
    case "adjustment":
    case "inventory":
      return Calculator;
    default:
      return Package;
  }
});

// Computed: Type text
const getTypeText = computed(() => {
  const types = {
    sell: "Salida",
    buy: "Entrada",
    waste: "Merma",
    return: "Devolución",
    adjustment: "Ajuste",
    inventory: "Inventario",
  };
  return types[props.log.type] || "Movimiento";
});

// Computed: Quantity prefix
const getQuantityPrefix = computed(() => {
  return props.log.type === "sell" || props.log.type === "waste" ? "-" : "+";
});

// Computed: Quantity color class
const getQuantityColorClass = computed(() => {
  switch (props.log.type) {
    case "sell":
      return "text-red-600";
    case "waste":
      return "text-red-600";
    case "buy":
    case "return":
      return "text-green-600";
    case "adjustment":
    case "inventory":
      return "text-amber-600";
    default:
      return "text-gray-600";
  }
});

// Computed: Mostrar margen (solo para ventas con cost y price)
const showMargin = computed(() => {
  return (
    props.log.type === "sell" &&
    props.log.cost !== undefined &&
    props.log.price !== undefined &&
    props.log.cost > 0
  );
});

// Computed: Calcular margen de ganancia
const getMargin = computed(() => {
  if (!showMargin.value) return 0;
  return Number(props.log.price) - Number(props.log.cost);
});

// Computed: Calcular porcentaje de margen
const getMarginPercentage = computed(() => {
  if (!showMargin.value || props.log.cost === 0) return 0;
  const percentage = (getMargin.value / Number(props.log.cost)) * 100;
  return percentage.toFixed(1);
});

// Methods
function formatedDate(date) {
  if (!date) return "-";

  let dateObj;
  if (date.seconds) {
    dateObj = new Date(date.seconds * 1000);
  } else if (date.toDate && typeof date.toDate === "function") {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) return "-";

  return dateObj.toLocaleString("es-PE", {
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
}

/* Asegurar que las cifras no se deformen */
@media (max-width: 480px) {
  .tabular-nums {
    font-size: 0.9rem;
    line-height: 1.25rem;
  }
}
</style>
