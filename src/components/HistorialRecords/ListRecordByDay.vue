<template>
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
  >
    <!-- Header con toggle -->
    <div
      @click="showRecords = !showRecords"
      class="flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-gray-50 -m-2 p-2 rounded-lg"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center"
        >
          <component
            :is="showRecords ? EyeClosed : Eye"
            class="w-4 h-4 text-purple-600"
          />
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">
            Últimos movimientos
          </h3>
          <p class="text-xs sm:text-sm text-gray-500">
            {{
              showRecords
                ? "Ocultar movimientos"
                : "Mostrar últimos movimientos"
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Contenido expandible -->
    <Transition name="expand">
      <div v-if="showRecords" class="mt-6">
        <div class="space-y-3 sm:space-y-4">
          <template v-if="transactionStore.transactionsInStore.value.length">
            <component
              v-for="(record, index) in dataOrdenada"
              :is="getRecordComponent(record.type)"
              :key="record.uuid || index"
              :record="record"
              class="transition-all duration-200 hover:shadow-md"
            />
            <CardViewAllRecords v-if="dataOrdenada.length >= 10" />
            <br />
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
                No hay movimientos hoy
              </h4>
              <p class="text-sm text-gray-500">
                Los registros aparecerán aquí cuando realices transacciones
              </p>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Eye, EyeClosed } from "@iconoir/vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import CardClosure from "@/components/HistorialRecords/CardClosure.vue";
import CardOpening from "@/components/HistorialRecords/CardOpening.vue";
import CardTransfer from "@/components/HistorialRecords/CardTransfer.vue";
import CardStandard from "@/components/HistorialRecords/CardStandard.vue";
import CardViewAllRecords from "@/components/HistorialRecords/CardViewAllRecords.vue";

// Props
const props = defineProps({
  dayString: {
    type: String,
    default: null, // Si no se pasa, usa el día de hoy
  },
});

// Estado del toggle
const showRecords = ref(false);

const transactionStore = useTransactionStore();

const dataOrdenada = computed(() => {
  const all = transactionStore.transactionsInStore.value;

  const closure = all.find((tx) => tx.type === "closure");
  const opening = all.find((tx) => tx.type === "opening");

  const middle = all
    .filter(
      (tx) =>
        tx.type !== "closure" &&
        tx.type !== "opening" &&
        tx.category !== "adjustment"
    )
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

  const result = [];

  if (closure) result.push(closure);
  result.push(...middle);
  if (opening) result.push(opening);

  const primerosCuatro = result.slice(0, 10);
  return primerosCuatro;
});

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

// Cargar transacciones según el día
const loadTransactions = async () => {
  if (props.dayString) {
    // Cargar transacciones de un día específico
    await transactionStore.getTransactionsByDayStore(props.dayString);
  } else {
    // Cargar transacciones del día actual
    await transactionStore.getTransactionsToday();
  }
};

// Cargar al montar
loadTransactions();

// Watch para recargar cuando cambie el día
watch(
  () => props.dayString,
  () => {
    loadTransactions();
  }
);
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
  max-height: 1000px;
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
