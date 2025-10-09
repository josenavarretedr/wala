<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:border-gray-200"
  >
    <!-- Header con información principal -->
    <div class="flex items-center justify-between gap-3 mb-3">
      <!-- Lado izquierdo: Badge y título -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Badge de apertura -->
        <div
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0 bg-green-50 text-green-700 border border-green-200"
        >
          <SafeOpen class="w-3 h-3" />
          <span class="hidden sm:inline">Apertura</span>
        </div>

        <!-- Total inicial -->
        <div class="text-sm text-gray-600 hidden sm:block">
          Total inicial:
          <span class="font-semibold text-gray-800"
            >S/ {{ formatAmount(totalInitial) }}</span
          >
        </div>
      </div>

      <!-- Lado derecho: Botón de detalles y expansión -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Botón de detalles -->
        <router-link
          :to="{
            name: 'CashClosureDetails',
            params: { cashClosureId: record.eventUuid || record.uuid },
          }"
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
          title="Ver detalles"
        >
          <InfoCircle class="w-4 h-4" />
        </router-link>

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
      <span class="truncate">{{ formatedDate(record.createdAt) }}</span>
    </div>

    <!-- Contenido expandible -->
    <Transition name="fade-scale">
      <div v-if="isOpen" class="pt-2 border-t border-gray-100 space-y-3">
        <!-- Resumen en móvil -->
        <div class="sm:hidden">
          <div class="text-sm text-gray-600 mb-2">
            Total inicial:
            <span class="font-semibold text-gray-800"
              >S/ {{ formatAmount(totalInitial) }}</span
            >
          </div>
        </div>

        <!-- Grid de balances -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Efectivo -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div class="flex items-center gap-1 mb-1">
              <Coins class="w-3 h-3 text-emerald-600" />
              <p class="text-xs font-medium text-emerald-800">
                Efectivo inicial
              </p>
            </div>
            <p class="text-lg font-bold text-emerald-700 tabular-nums">
              S/ {{ formatAmount(record.realCashBalance || 0) }}
            </p>
          </div>

          <!-- Banco/Digital -->
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div class="flex items-center gap-1 mb-1">
              <SmartphoneDevice class="w-3 h-3 text-purple-600" />
              <p class="text-xs font-medium text-purple-800">Digital inicial</p>
            </div>
            <p class="text-lg font-bold text-purple-700 tabular-nums">
              S/ {{ formatAmount(record.realBankBalance || 0) }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  SafeOpen,
  ArrowDown,
  InfoCircle,
  Coins,
  SmartphoneDevice,
} from "@iconoir/vue";

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
});

const isOpen = ref(false);
const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

// Computeds para manejar los datos
const totalInitial = computed(() => {
  const cash = props.record.realCashBalance || 0;
  const bank = props.record.realBankBalance || 0;
  return cash + bank;
});

const hasCashDifference = computed(() => {
  return (
    props.record.cashDifference !== undefined &&
    Math.abs(props.record.cashDifference) > 0.01
  );
});

const hasBankDifference = computed(() => {
  return (
    props.record.bankDifference !== undefined &&
    Math.abs(props.record.bankDifference) > 0.01
  );
});

const hasDifferences = computed(() => {
  return hasCashDifference.value || hasBankDifference.value;
});

const cashDifferenceClass = computed(() => {
  if (!hasCashDifference.value) return "";
  return props.record.cashDifference > 0
    ? "text-green-600 font-medium"
    : "text-red-600 font-medium";
});

const bankDifferenceClass = computed(() => {
  if (!hasBankDifference.value) return "";
  return props.record.bankDifference > 0
    ? "text-green-600 font-medium"
    : "text-red-600 font-medium";
});

const cashDifferenceText = computed(() => {
  if (!hasCashDifference.value) return "";
  const diff = props.record.cashDifference;
  const prefix = diff > 0 ? "Sobrante:" : "Faltante:";
  return `${prefix} S/ ${formatAmount(Math.abs(diff))}`;
});

const bankDifferenceText = computed(() => {
  if (!hasBankDifference.value) return "";
  const diff = props.record.bankDifference;
  const prefix = diff > 0 ? "Sobrante:" : "Faltante:";
  return `${prefix} S/ ${formatAmount(Math.abs(diff))}`;
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
  .space-y-3 > * + * {
    margin-top: 0.75rem;
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
