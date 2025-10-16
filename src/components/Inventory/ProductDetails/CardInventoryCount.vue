<template>
  <div
    class="bg-white rounded-xl shadow-sm border-2 p-3 sm:p-4 transition-all duration-200 hover:shadow-md"
    :class="borderColorClass"
  >
    <!-- Header con información principal -->
    <div class="flex items-center justify-between gap-3 mb-3">
      <!-- Lado izquierdo: Badge de conteo -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <div
          :class="[
            'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0',
            badgeClass,
          ]"
        >
          <Calculator class="w-3 h-3" />
          <span class="hidden sm:inline">Conteo de Inventario</span>
          <span class="sm:hidden">Conteo</span>
        </div>
      </div>

      <!-- Lado derecho: Ajuste -->
      <div class="flex items-center gap-2 shrink-0">
        <div
          :class="[
            'text-base sm:text-lg font-bold tabular-nums flex items-center gap-1',
            adjustmentColorClass,
          ]"
        >
          <component :is="adjustmentIcon" class="w-4 h-4" />
          {{ adjustmentPrefix }}{{ Math.abs(log.difference || 0) }}
          {{ productUnit }}
        </div>
        <!-- Botón de expansión -->
        <button
          @click="toggleOpen"
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
          title="Ver detalles"
        >
          <ArrowDown
            :class="[
              'w-4 h-4 transform transition-transform duration-300',
              isOpen ? 'rotate-180' : 'rotate-0',
            ]"
          />
        </button>
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

    <!-- Contenido expandible -->
    <Transition name="fade-scale">
      <!-- Grid de información de stocks -->
      <div v-if="isOpen" class="pt-2 border-t border-gray-200 space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <!-- Stock Digital (antes del ajuste) -->
          <div
            class="flex flex-col gap-0.5 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200"
          >
            <span class="text-[10px] text-gray-500 font-medium"
              >Stock Digital</span
            >
            <div class="flex items-center gap-1">
              <svg
                class="w-3 h-3 shrink-0 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span class="text-xs font-bold text-gray-700">
                {{ (log.digitalStock || 0).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Stock Físico (contado) -->
          <div
            :class="[
              'flex flex-col gap-0.5 rounded-lg px-2 py-1.5 border',
              physicalStockBgClass,
            ]"
          >
            <span
              class="text-[10px] font-medium"
              :class="physicalStockTextClass"
            >
              Stock Físico
            </span>
            <div class="flex items-center gap-1">
              <svg
                class="w-3 h-3 shrink-0"
                :class="physicalStockTextClass"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span class="text-xs font-bold" :class="physicalStockTextClass">
                {{ (log.physicalStock || 0).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Resumen del ajuste -->
        <div :class="['rounded-lg px-3 py-2 border-2', adjustmentSummaryClass]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <component :is="adjustmentSummaryIcon" class="w-4 h-4" />
              <span class="text-xs font-semibold">
                {{ adjustmentTypeText }}
              </span>
            </div>
            <span class="text-sm font-bold tabular-nums">
              {{ adjustmentPrefix }}{{ Math.abs(log.difference || 0) }}
              {{ productUnit }}
            </span>
          </div>

          <!-- Descripción del ajuste -->
          <p class="text-[10px] mt-1 opacity-80">
            {{ adjustmentDescription }}
          </p>
        </div>
      </div>
    </Transition>

    <!-- Información adicional si existe -->
    <div
      v-if="log.reason || log.notes"
      class="pt-2 border-t border-gray-100 mt-2"
    >
      <p class="text-xs text-gray-600 line-clamp-2">
        {{ log.reason || log.notes }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import {
  Calculator,
  GraphUp,
  GraphDown,
  CheckCircle,
  ArrowDown,
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
const isOpen = ref(false);
const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

// Computed: Tipo de ajuste
const adjustmentType = computed(() => props.log.adjustmentType || "equal");

const isSurplus = computed(() => (props.log.difference || 0) > 0);
const isShortage = computed(() => (props.log.difference || 0) < 0);
const isEqual = computed(() => (props.log.difference || 0) === 0);

// Computed: Clases de color para el borde
const borderColorClass = computed(() => {
  if (isSurplus.value) return "border-green-200";
  if (isShortage.value) return "border-red-200";
  return "border-emerald-200";
});

// Computed: Badge class
const badgeClass = computed(() => {
  if (isSurplus.value)
    return "bg-green-50 text-green-700 border border-green-200";
  if (isShortage.value) return "bg-red-50 text-red-700 border border-red-200";
  return "bg-emerald-50 text-emerald-700 border border-emerald-200";
});

// Computed: Adjustment color class
const adjustmentColorClass = computed(() => {
  if (isSurplus.value) return "text-green-600";
  if (isShortage.value) return "text-red-600";
  return "text-emerald-600";
});

// Computed: Adjustment icon
const adjustmentIcon = computed(() => {
  if (isSurplus.value) return GraphUp;
  if (isShortage.value) return GraphDown;
  return CheckCircle;
});

// Computed: Adjustment prefix
const adjustmentPrefix = computed(() => {
  if (isSurplus.value) return "+";
  if (isShortage.value) return "-";
  return "";
});

// Computed: Physical stock background class
const physicalStockBgClass = computed(() => {
  if (isSurplus.value) return "bg-green-50 border-green-200";
  if (isShortage.value) return "bg-red-50 border-red-200";
  return "bg-emerald-50 border-emerald-200";
});

// Computed: Physical stock text class
const physicalStockTextClass = computed(() => {
  if (isSurplus.value) return "text-green-700";
  if (isShortage.value) return "text-red-700";
  return "text-emerald-700";
});

// Computed: Adjustment summary class
const adjustmentSummaryClass = computed(() => {
  if (isSurplus.value) return "bg-green-50 border-green-300 text-green-800";
  if (isShortage.value) return "bg-red-50 border-red-300 text-red-800";
  return "bg-emerald-50 border-emerald-300 text-emerald-800";
});

// Computed: Adjustment summary icon
const adjustmentSummaryIcon = computed(() => {
  if (isSurplus.value) return GraphUp;
  if (isShortage.value) return GraphDown;
  return CheckCircle;
});

// Computed: Adjustment type text
const adjustmentTypeText = computed(() => {
  if (isSurplus.value) return "Excedente detectado";
  if (isShortage.value) return "Faltante detectado";
  return "Inventario cuadrado";
});

// Computed: Adjustment description
const adjustmentDescription = computed(() => {
  if (isSurplus.value) {
    return "Se encontró más stock del registrado en el sistema";
  }
  if (isShortage.value) {
    return "Se encontró menos stock del registrado en el sistema";
  }
  return "El stock físico coincide con el registro digital";
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
/* Animación de expansión */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
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
