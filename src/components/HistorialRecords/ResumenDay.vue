<template>
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
  >
    <!-- Header con toggle -->
    <div
      @click="showResume = !showResume"
      class="flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-gray-50 -m-2 p-2 rounded-lg"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"
        >
          <component
            :is="showResume ? EyeClosed : Eye"
            class="w-4 h-4 text-blue-600"
          />
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">
            Resumen del día
          </h3>
          <p class="text-xs sm:text-sm text-gray-500">
            {{ showResume ? "Ocultar detalles" : "Ver detalles financieros" }}
          </p>
        </div>
      </div>

      <!-- Saldo actual visible -->
      <div class="text-right" v-if="showResume">
        <p class="text-xs text-gray-500">Saldo actual</p>
        <p class="text-lg sm:text-xl font-bold text-gray-900">
          S/ {{ saldoActual.toFixed(2) }}
        </p>
      </div>
    </div>

    <!-- Contenido expandible -->
    <Transition name="expand">
      <div v-if="showResume" class="mt-6 space-y-4">
        <!-- Grid de métricas -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <!-- Saldo inicial -->
          <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div class="flex items-center gap-2 mb-2">
              <Cash class="w-4 h-4 text-gray-600" />
              <span class="text-xs sm:text-sm font-medium text-gray-600"
                >Saldo inicial</span
              >
            </div>
            <p class="text-base sm:text-lg font-semibold text-gray-900">
              S/ {{ saldoInicial.toFixed(2) }}
            </p>
          </div>

          <!-- Ingresos -->
          <div class="bg-green-50 rounded-lg p-3 sm:p-4">
            <div class="flex items-center gap-2 mb-2">
              <GraphUp class="w-4 h-4 text-green-600" />
              <span class="text-xs sm:text-sm font-medium text-green-700"
                >Ventas hoy</span
              >
            </div>
            <p class="text-base sm:text-lg font-semibold text-green-800">
              S/ {{ totalIngresos.toFixed(2) }}
            </p>
          </div>

          <!-- Egresos -->
          <div class="bg-red-50 rounded-lg p-3 sm:p-4">
            <div class="flex items-center gap-2 mb-2">
              <DatabaseExport class="w-4 h-4 text-red-600" />
              <span class="text-xs sm:text-sm font-medium text-red-700"
                >Salidas hoy</span
              >
            </div>
            <p class="text-base sm:text-lg font-semibold text-red-800">
              S/ {{ totalEgresos.toFixed(2) }}
            </p>
          </div>
        </div>

        <!-- Resumen consolidado -->
        <div class="border-t border-gray-200 pt-4">
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
              >
                <Cash class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-900">
                  Balance del día
                </h4>
                <p class="text-xs text-gray-500">
                  {{
                    totalIngresos >= totalEgresos
                      ? "Resultado positivo"
                      : "Resultado negativo"
                  }}
                </p>
              </div>
            </div>

            <div class="text-right">
              <p class="text-xs text-gray-500">Diferencia</p>
              <p
                :class="[
                  'text-xl sm:text-2xl font-bold',
                  totalIngresos >= totalEgresos
                    ? 'text-green-600'
                    : 'text-red-600',
                ]"
              >
                {{ totalIngresos >= totalEgresos ? "+" : "" }}S/
                {{ (totalIngresos - totalEgresos).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { GraphUp, DatabaseExport, Cash, Eye, EyeClosed } from "@iconoir/vue";
import { ref, computed } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const showResume = ref(false);

const transactionStore = useTransactionStore();

// Usar transactionsInStore en lugar del prop
const transactions = computed(
  () => transactionStore.transactionsInStore.value || []
);

const opening = computed(() =>
  transactions.value.find((tx) => tx.type === "opening")
);

const saldoInicial = computed(() => {
  if (!opening.value) return 0;
  return (opening.value.totalCash || 0) + (opening.value.totalBank || 0);
});

const totalIngresos = computed(() => {
  return transactions.value
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + (tx.total || 0), 0);
});

const totalEgresos = computed(() => {
  return transactions.value
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + (tx.total || 0), 0);
});

const saldoActual = computed(() => {
  return saldoInicial.value + totalIngresos.value - totalEgresos.value;
});

// Cargar las transacciones de hoy cuando se monte el componente
await transactionStore.getTransactionsToday();
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
  max-height: 500px;
  transform: translateY(0);
}

/* Hover suave para el header */
.cursor-pointer:hover {
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid-cols-1 {
    gap: 0.75rem;
  }
}
</style>
