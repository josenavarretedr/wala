<template>
  <!-- Product Moves Grouped - Timeline Agrupado Mobile First -->
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4"
    v-if="stockLog && stockLog.length > 0"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <svg
          class="w-5 h-5 text-blue-600"
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
        <h3 class="text-sm font-semibold text-gray-900">
          Historial de Movimientos
        </h3>
      </div>
      <span class="text-xs text-gray-500">
        {{ sortedStockLogs.length }} movimientos
      </span>
    </div>

    <!-- Timeline Agrupado -->
    <div class="space-y-6">
      <div
        v-for="(group, groupKey) in groupedLogs"
        :key="groupKey"
        class="relative"
      >
        <!-- Etiqueta del grupo (Hoy, Ayer, etc.) -->
        <div class="sticky top-0 z-10 mb-3">
          <div
            class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm"
          >
            <svg
              class="w-3.5 h-3.5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span class="text-sm font-semibold text-blue-900">
              {{ groupKey }}
            </span>
            <span class="text-xs text-blue-600">
              ({{ group.length }} mov.)
            </span>
          </div>
        </div>

        <!-- Movimientos del grupo con línea de timeline -->
        <div class="relative pl-6 space-y-3">
          <!-- Línea vertical del timeline -->
          <div
            class="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-transparent"
          ></div>

          <!-- Card de cada movimiento -->
          <div
            v-for="(log, index) in group"
            :key="log.logId || index"
            class="relative"
          >
            <!-- Punto del timeline -->
            <div
              class="absolute -left-[1.125rem] top-3 w-3 h-3 rounded-full border-2 border-white shadow-sm"
              :class="getTimelineDotClass(log.type)"
            ></div>

            <!-- Card del movimiento -->
            <div
              class="bg-white rounded-lg border transition-all duration-200 hover:shadow-md hover:border-gray-300 p-3"
              :class="getMovementBorderClass(log.type)"
            >
              <!-- Header del movimiento -->
              <div class="flex items-start justify-between gap-2 mb-2">
                <!-- Tipo y cantidad -->
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <!-- Badge de tipo -->
                  <div
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium shrink-0"
                    :class="getMovementBadgeClass(log.type)"
                  >
                    <component
                      :is="getMovementIcon(log.type)"
                      class="w-3 h-3"
                    />
                    <span class="hidden sm:inline">{{
                      getMovementTypeLabel(log.type)
                    }}</span>
                  </div>

                  <!-- Cantidad -->
                  <span
                    class="text-base font-bold tabular-nums"
                    :class="getQuantityColorClass(log.type)"
                  >
                    {{ getQuantityPrefix(log.type) }}{{ log.quantity || 0 }}
                    {{ productUnit }}
                  </span>
                </div>

                <!-- Botón de detalles -->
                <router-link
                  v-if="log.transactionId"
                  :to="{
                    name: 'DetailsRecords',
                    params: { registerId: log.transactionId },
                  }"
                  class="shrink-0 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
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

              <!-- Hora del movimiento -->
              <div class="flex items-center gap-1 text-xs text-gray-500 mb-2">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{{ formatTime(log.createdAt) }}</span>
              </div>

              <!-- Información financiera -->
              <div
                v-if="log.cost || log.price"
                class="flex flex-wrap gap-2 mb-2"
              >
                <!-- Costo (compras) -->
                <div
                  v-if="log.cost && log.type === 'buy'"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 rounded text-xs border border-amber-200"
                >
                  <span class="text-amber-600 font-medium">Costo:</span>
                  <span class="text-amber-800 font-bold tabular-nums">
                    S/ {{ log.cost.toFixed(2) }}
                  </span>
                </div>

                <!-- Precio (ventas) -->
                <div
                  v-if="log.price && log.type === 'sell'"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-xs border border-green-200"
                >
                  <span class="text-green-600 font-medium">Precio:</span>
                  <span class="text-green-800 font-bold tabular-nums">
                    S/ {{ log.price.toFixed(2) }}
                  </span>
                </div>

                <!-- Total monetario -->
                <div
                  v-if="getMovementTotal(log) > 0"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 rounded text-xs border border-purple-200"
                >
                  <span class="text-purple-600 font-medium">Total:</span>
                  <span class="text-purple-800 font-bold tabular-nums">
                    S/ {{ getMovementTotal(log).toFixed(2) }}
                  </span>
                </div>
              </div>

              <!-- Saldo restante después del movimiento -->
              <div
                class="flex items-center justify-between pt-2 border-t border-gray-100"
              >
                <span class="text-xs text-gray-600">Saldo después:</span>
                <div class="flex items-center gap-1.5">
                  <svg
                    class="w-3.5 h-3.5 text-indigo-600"
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
                  <span class="text-sm font-bold text-indigo-800 tabular-nums">
                    {{ calculateRemainingStock(log, index, group) }}
                    {{ productUnit }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje si no hay movimientos -->
    <div v-if="sortedStockLogs.length === 0" class="text-center py-8">
      <svg
        class="w-12 h-12 text-gray-300 mx-auto mb-3"
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
      <p class="text-sm font-medium text-gray-600">
        Sin movimientos registrados
      </p>
      <p class="text-xs text-gray-500 mt-1">
        Los movimientos de stock aparecerán aquí
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ArrowDown, ArrowUp, Refresh, List } from "@iconoir/vue";

// Props
const props = defineProps({
  stockLog: {
    type: Array,
    default: () => [],
  },
  productUnit: {
    type: String,
    default: "uni",
  },
  currentStock: {
    type: Number,
    default: 0,
  },
});

// ==========================================
// COMPUTED: Ordenar y agrupar logs
// ==========================================
const sortedStockLogs = computed(() => {
  if (!props.stockLog) return [];
  return [...props.stockLog].sort((a, b) => {
    const dateA = getDateFromLog(a);
    const dateB = getDateFromLog(b);
    return dateB - dateA; // Más reciente primero
  });
});

const groupedLogs = computed(() => {
  const groups = {
    Hoy: [],
    Ayer: [],
    "Esta semana": [],
    "Semana pasada": [],
    "Este mes": [],
    Anteriores: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - today.getDay());
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  sortedStockLogs.value.forEach((log) => {
    const logDate = getDateFromLog(log);
    const logDay = new Date(
      logDate.getFullYear(),
      logDate.getMonth(),
      logDate.getDate()
    );

    if (logDay.getTime() === today.getTime()) {
      groups.Hoy.push(log);
    } else if (logDay.getTime() === yesterday.getTime()) {
      groups.Ayer.push(log);
    } else if (logDate >= thisWeekStart && logDate < today) {
      groups["Esta semana"].push(log);
    } else if (logDate >= lastWeekStart && logDate <= lastWeekEnd) {
      groups["Semana pasada"].push(log);
    } else if (logDate >= thisMonthStart && logDate < thisWeekStart) {
      groups["Este mes"].push(log);
    } else {
      groups.Anteriores.push(log);
    }
  });

  // Filtrar grupos vacíos
  return Object.fromEntries(
    Object.entries(groups).filter(([_, logs]) => logs.length > 0)
  );
});

// ==========================================
// METHODS: Cálculo de saldo restante
// ==========================================
const calculateRemainingStock = (log, indexInGroup, group) => {
  // Comenzar desde el stock actual
  let remaining = props.currentStock;

  // Encontrar el índice global del log
  const allLogs = sortedStockLogs.value;
  const globalIndex = allLogs.findIndex(
    (l) => l.logId === log.logId || l === log
  );

  // Recorrer desde el inicio hasta este log y aplicar movimientos
  for (let i = 0; i < globalIndex; i++) {
    const currentLog = allLogs[i];
    if (currentLog.type === "sell") {
      remaining += currentLog.quantity || 0;
    } else if (currentLog.type === "buy") {
      remaining -= currentLog.quantity || 0;
    }
  }

  return remaining;
};

// ==========================================
// METHODS: Formateo y helpers
// ==========================================
const getDateFromLog = (log) => {
  if (!log.createdAt) return new Date(0);
  if (log.createdAt.seconds) {
    return new Date(log.createdAt.seconds * 1000);
  } else if (log.createdAt instanceof Date) {
    return log.createdAt;
  } else {
    return new Date(log.createdAt);
  }
};

const formatTime = (createdAt) => {
  const date = getDateFromLog({ createdAt });
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMovementTotal = (log) => {
  if (log.type === "sell" && log.price && log.quantity) {
    return log.price * log.quantity;
  }
  if (log.type === "buy" && log.cost && log.quantity) {
    return log.cost * log.quantity;
  }
  return 0;
};

// ==========================================
// METHODS: Estilos por tipo de movimiento
// ==========================================
const getTimelineDotClass = (type) => {
  const classes = {
    sell: "bg-red-500",
    buy: "bg-green-500",
    adjust: "bg-blue-500",
    count: "bg-purple-500",
    return: "bg-yellow-500",
  };
  return classes[type] || "bg-gray-400";
};

const getMovementBorderClass = (type) => {
  const classes = {
    sell: "border-red-100 hover:border-red-200",
    buy: "border-green-100 hover:border-green-200",
    adjust: "border-blue-100 hover:border-blue-200",
    count: "border-purple-100 hover:border-purple-200",
    return: "border-yellow-100 hover:border-yellow-200",
  };
  return classes[type] || "border-gray-100 hover:border-gray-200";
};

const getMovementBadgeClass = (type) => {
  const classes = {
    sell: "bg-red-100 text-red-700 border border-red-200",
    buy: "bg-green-100 text-green-700 border border-green-200",
    adjust: "bg-blue-100 text-blue-700 border border-blue-200",
    count: "bg-purple-100 text-purple-700 border border-purple-200",
    return: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  };
  return classes[type] || "bg-gray-100 text-gray-700 border border-gray-200";
};

const getMovementIcon = (type) => {
  const icons = {
    sell: ArrowDown,
    buy: ArrowUp,
    adjust: Refresh,
    count: List,
    return: ArrowUp,
  };
  return icons[type] || List;
};

const getMovementTypeLabel = (type) => {
  const labels = {
    sell: "Venta",
    buy: "Compra",
    adjust: "Ajuste",
    count: "Conteo",
    return: "Devolución",
  };
  return labels[type] || "Movimiento";
};

const getQuantityPrefix = (type) => {
  return type === "sell" ? "-" : "+";
};

const getQuantityColorClass = (type) => {
  return type === "sell" ? "text-red-700" : "text-green-700";
};
</script>

<style scoped>
/* Números tabulares para mejor alineación */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Sticky positioning para headers de grupo */
.sticky {
  position: sticky;
  backdrop-filter: blur(8px);
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .space-y-3 > :not([hidden]) ~ :not([hidden]) {
    margin-top: 0.75rem;
  }
}
</style>
