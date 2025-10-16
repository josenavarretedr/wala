<template>
  <!-- Stock History Section -->
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4"
  >
    <!-- Header con toggle -->
    <div
      @click="showRecords = !showRecords"
      class="flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-gray-50 -m-2 p-2 rounded-lg"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center"
        >
          <component
            :is="showRecords ? EyeClosed : Eye"
            class="w-4 h-4 text-indigo-600"
          />
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">
            Historial de Movimientos
          </h3>
          <p class="text-xs sm:text-sm text-gray-500">
            {{
              showRecords
                ? `${sortedStockLogs.length} movimientos registrados`
                : "Mostrar historial completo"
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Contenido expandible -->
    <Transition name="expand">
      <div v-if="showRecords" class="mt-6">
        <!-- No stock logs -->
        <div
          v-if="!sortedStockLogs || sortedStockLogs.length === 0"
          class="bg-gray-50 rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center"
        >
          <div
            class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4"
          >
            <svg
              class="w-6 h-6 text-gray-400"
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
          </div>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">
            No hay movimientos registrados
          </h4>
          <p class="text-sm text-gray-500">
            Los movimientos del producto aparecerán aquí
          </p>
        </div>

        <!-- Stock logs list -->
        <div v-else class="space-y-3 sm:space-y-4">
          <component
            :is="getCardComponent(log)"
            v-for="(log, index) in sortedStockLogs"
            :key="log.uuid || index"
            :log="log"
            :product-unit="productUnit"
            class="transition-all duration-200 hover:shadow-md"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { Eye, EyeClosed } from "@iconoir/vue";
import CardStandarMove from "./CardStandarMove.vue";
import CardInventoryCount from "./CardInventoryCount.vue";

// Estado del toggle
const showRecords = ref(false);

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

// Methods: Determinar qué componente usar según el tipo de log
const getCardComponent = (log) => {
  if (log.type === "count") {
    return CardInventoryCount;
  }
  return CardStandarMove;
};

// Computed: Sorted Stock Logs
const sortedStockLogs = computed(() => {
  if (!props.stockLog) return [];
  return [...props.stockLog].sort((a, b) => {
    const dateA = a.createdAt?.seconds
      ? new Date(a.createdAt.seconds * 1000)
      : a.createdAt instanceof Date
      ? a.createdAt
      : new Date(a.createdAt);
    const dateB = b.createdAt?.seconds
      ? new Date(b.createdAt.seconds * 1000)
      : b.createdAt instanceof Date
      ? b.createdAt
      : new Date(b.createdAt);
    return dateB - dateA; // Más reciente primero
  });
});
</script>

<style scoped>
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
  max-height: 2000px;
  transform: translateY(0);
}

/* Hover suave para el header */
.cursor-pointer:hover {
  transform: translateY(-1px);
}

/* Hover para las cards individuales */
.space-y-3 > *:hover,
.space-y-4 > *:hover {
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .space-y-3 {
    gap: 0.75rem;
  }
}
</style>
