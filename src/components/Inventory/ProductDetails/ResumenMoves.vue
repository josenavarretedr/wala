<template>
  <!-- Statistics Summary -->
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
    v-if="stockLog && stockLog.length > 0"
  >
    <!-- Header con toggle -->
    <div
      @click="showResume = !showResume"
      class="cursor-pointer transition-all duration-200 hover:bg-gray-50 -m-2 p-2 rounded-lg"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center"
          >
            <component
              :is="showResume ? EyeClosed : Eye"
              class="w-4 h-4 text-teal-600"
            />
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">
              Resumen de Movimientos
            </h3>
            <p class="text-xs sm:text-sm text-gray-500">
              {{
                showResume ? "Ocultar estadísticas" : "Ver estadísticas totales"
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido expandible -->
    <Transition name="expand">
      <div v-if="showResume" class="mt-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <!-- Total Ventas -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div class="flex items-center gap-2 mb-2">
              <div
                class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0"
              >
                <svg
                  class="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  ></path>
                </svg>
              </div>
              <span class="text-xs sm:text-sm font-medium text-red-700"
                >Total Ventas</span
              >
            </div>
            <p
              class="text-base sm:text-lg font-semibold text-red-800 tabular-nums"
            >
              {{ totalSales }} {{ productUnit }}
            </p>
          </div>

          <!-- Total Compras -->
          <div
            class="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4"
          >
            <div class="flex items-center gap-2 mb-2">
              <div
                class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0"
              >
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  ></path>
                </svg>
              </div>
              <span class="text-xs sm:text-sm font-medium text-green-700"
                >Total Compras</span
              >
            </div>
            <p
              class="text-base sm:text-lg font-semibold text-green-800 tabular-nums"
            >
              {{ totalBuys }} {{ productUnit }}
            </p>
          </div>

          <!-- Total Devoluciones -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div class="flex items-center gap-2 mb-2">
              <div
                class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0"
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
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  ></path>
                </svg>
              </div>
              <span class="text-xs sm:text-sm font-medium text-blue-700"
                >Total Devoluciones</span
              >
            </div>
            <p
              class="text-base sm:text-lg font-semibold text-blue-800 tabular-nums"
            >
              {{ totalReturns }} {{ productUnit }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Eye, EyeClosed } from "@iconoir/vue";

// Estado del toggle
const showResume = ref(false);

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
});

// Computed: Statistics
const totalSales = computed(() => {
  if (!props.stockLog) return 0;
  return props.stockLog
    .filter((log) => log.type === "sell")
    .reduce((sum, log) => sum + (log.quantity || 0), 0);
});

const totalBuys = computed(() => {
  if (!props.stockLog) return 0;
  return props.stockLog
    .filter((log) => log.type === "buy")
    .reduce((sum, log) => sum + (log.quantity || 0), 0);
});

const totalReturns = computed(() => {
  if (!props.stockLog) return 0;
  return props.stockLog
    .filter((log) => log.type === "return")
    .reduce((sum, log) => sum + (log.quantity || 0), 0);
});
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

/* Animación de expansión suave */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

/* Hover suave para el header */
.cursor-pointer:hover {
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid {
    gap: 0.75rem;
  }
}
</style>
