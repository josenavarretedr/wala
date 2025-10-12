<template>
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
  >
    <!-- Header con filtro -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">
            Todos los registros
          </h3>
          <p class="text-xs sm:text-sm text-gray-500 mt-1">
            Historial completo de transacciones
          </p>
        </div>
        <CloseBtn v-bind="closeBtnConfig" />
      </div>

      <!-- Filtro de período -->
      <div class="relative">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center"
          >
            <component
              :is="selectedFilter !== 'all' ? FilterSolid : Filter"
              class="w-4 h-4 text-purple-600"
            />
          </div>
          <select
            v-model="selectedFilter"
            class="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer hover:bg-gray-100"
          >
            <option value="all">Todos los registros</option>
            <option value="today">Solo hoy</option>
            <option value="7days">Hace 7 días</option>
            <option value="30days">Hace 30 días</option>
            <option value="90days">Hace 90 días</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Contenido -->
    <div class="space-y-3 sm:space-y-4">
      <template v-if="filteredTransactions.length">
        <component
          v-for="(record, index) in filteredTransactions"
          :is="getRecordComponent(record.type)"
          :key="record.uuid || index"
          :record="record"
          class="transition-all duration-200 hover:shadow-md"
        />
      </template>

      <template v-else>
        <div
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
            No hay registros
          </h4>
          <p class="text-sm text-gray-500">
            {{
              selectedFilter !== "all"
                ? "No hay transacciones en el período seleccionado"
                : "Los registros aparecerán aquí cuando realices transacciones"
            }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { Filter, FilterSolid } from "@iconoir/vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import CardClosure from "@/components/HistorialRecords/CardClosure.vue";
import CardOpening from "@/components/HistorialRecords/CardOpening.vue";
import CardTransfer from "@/components/HistorialRecords/CardTransfer.vue";
import CardStandard from "@/components/HistorialRecords/CardStandard.vue";
import CloseBtn from "@/components/ui/CloseBtn.vue";
import { ensureBusinessId } from "@/composables/useBusinessUtils";

const transactionStore = useTransactionStore();
const selectedFilter = ref("all");

// Función para obtener la fecha límite según el filtro
function getDateLimit(filter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "today":
      return today;
    case "7days":
      return new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30days":
      return new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90days":
      return new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return null; // No filtro, mostrar todo
  }
}

const dataOrdenada = computed(() => {
  const all = transactionStore.transactionsInStore.value;

  // Aplicar filtro de fecha si existe
  const dateLimit = getDateLimit(selectedFilter.value);
  const filtered = dateLimit
    ? all.filter((tx) => {
        const txDate = new Date(tx.createdAt.seconds * 1000);
        return txDate >= dateLimit;
      })
    : all;

  // Agrupar transacciones por día
  const groupedByDay = filtered.reduce((acc, tx) => {
    // Obtener la fecha en formato YYYY-MM-DD
    const date = new Date(tx.createdAt.seconds * 1000);
    const dateKey = date.toISOString().split("T")[0];

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(tx);

    return acc;
  }, {});

  // Ordenar días de más reciente a más antiguo
  const sortedDays = Object.keys(groupedByDay).sort((a, b) => {
    return new Date(b) - new Date(a);
  });

  // Para cada día, ordenar: closure, transacciones, opening
  const result = [];

  sortedDays.forEach((day) => {
    const dayTransactions = groupedByDay[day];

    const opening = dayTransactions.find((tx) => tx.type === "opening");
    const closure = dayTransactions.find((tx) => tx.type === "closure");

    const middle = dayTransactions
      .filter(
        (tx) =>
          tx.type !== "closure" &&
          tx.type !== "opening" &&
          tx.category !== "adjustment"
      )
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    // Agregar en el orden correcto para este día:
    // 1. Closure (cierre) - lo último que se hizo, va arriba
    // 2. Transacciones normales (más recientes primero)
    // 3. Opening (apertura) - lo primero que se hizo, va abajo
    if (closure) result.push(closure);
    result.push(...middle);
    if (opening) result.push(opening);
  });

  return result;
});

// Computed para las transacciones filtradas (alias para mayor claridad en el template)
const filteredTransactions = computed(() => dataOrdenada.value);

/**
 * Mapea el tipo de transacción con el componente a renderizar
 */
function getRecordComponent(type) {
  switch (type) {
    case "closure":
      return CardClosure;
    case "opening":
      return CardOpening;
    case "transfer":
      return CardTransfer;
    default:
      return CardStandard; // income, expense, adjustment, etc.
  }
}

// Cargar TODAS las transacciones cuando el componente se monte
onMounted(async () => {
  await transactionStore.getTransactions();
});
</script>

<style scoped>
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
