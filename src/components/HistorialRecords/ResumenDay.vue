<template>
  <div
    class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
  >
    <!-- Header integrado con saldo actual prominente -->
    <div
      @click="showResume = !showResume"
      class="cursor-pointer transition-all duration-200 hover:bg-gray-50 -m-2 p-4 rounded-lg"
    >
      <!-- Saldo actual prominente -->
      <div class="text-center mb-4">
        <p class="text-sm text-gray-500 mb-1">Saldo actual</p>
        <p class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          S/ {{ saldoActual.toFixed(2) }}
        </p>
        <p class="text-xs text-gray-400">
          Liquidez real disponible · incluye ajustes
        </p>

        <!-- Chips con desglose por cuenta -->
        <div class="flex items-center justify-center gap-3 mt-3" v-if="opening">
          <div class="bg-gray-100 px-3 py-1 rounded-full">
            <span class="text-xs text-gray-600">
              Efectivo S/
              {{
                (
                  (opening.totalCash || 0) +
                  ingresosCash -
                  egresosCash +
                  ajustesCash
                ).toFixed(2)
              }}
            </span>
          </div>
          <div class="bg-gray-100 px-3 py-1 rounded-full">
            <span class="text-xs text-gray-600">
              Bancos S/
              {{
                (
                  (opening.totalBank || 0) +
                  ingresosBank -
                  egresosBank +
                  ajustesBank
                ).toFixed(2)
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Toggle section -->
      <div
        class="flex items-center justify-center gap-3 pt-2 border-t border-gray-100"
      >
        <div
          class="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center"
        >
          <component
            :is="showResume ? EyeClosed : Eye"
            class="w-3 h-3 text-blue-600"
          />
        </div>
        <div class="text-center">
          <h3 class="text-sm font-medium text-gray-700">
            {{ showResume ? "Ocultar desglose" : "Ver desglose detallado" }}
          </h3>
        </div>
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

        <!-- Resultado operacional -->
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
                  Ingresos – Egresos (no incluye ajustes)
                </h4>
                <p class="text-xs text-gray-500">
                  {{
                    resultadoOperacional >= 0
                      ? "Resultado operacional positivo"
                      : "Resultado operacional negativo"
                  }}
                </p>
              </div>
            </div>

            <div class="text-right">
              <p class="text-xs text-gray-500">Diferencia</p>
              <p
                :class="[
                  'text-xl sm:text-2xl font-bold',
                  resultadoOperacional >= 0 ? 'text-green-600' : 'text-red-600',
                ]"
              >
                {{ resultadoOperacional >= 0 ? "+" : "" }}S/
                {{ resultadoOperacional.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tarjeta de ajustes por arqueo (separada) -->
        <div
          class="bg-amber-50 border border-amber-200 rounded-lg p-4"
          v-if="totalAjustes !== 0"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <h4 class="text-sm font-medium text-amber-900">
                  Correcciones por descuadre
                </h4>
                <p
                  class="text-xs text-amber-700"
                  title="Correcciones por descuadre; no se cuentan como ventas/salidas"
                >
                  No son ventas ni salidas operativas
                </p>
              </div>
            </div>

            <div class="text-right">
              <p class="text-xs text-amber-600">Ajuste neto</p>
              <p class="text-lg font-bold text-amber-800">
                {{ totalAjustes >= 0 ? "+" : "" }}S/
                {{ totalAjustes.toFixed(2) }}
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

// Solo contar ventas reales (category: "sell"), no ajustes de apertura
const totalIngresos = computed(() => {
  return transactions.value
    .filter((tx) => tx.type === "income" && tx.category !== "adjustment")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
});

// Excluir ajustes automáticos de los egresos
const totalEgresos = computed(() => {
  return transactions.value
    .filter((tx) => tx.type === "expense" && tx.category !== "adjustment")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
});

// Desglose por cuenta para chips
const ingresosCash = computed(() => {
  return transactions.value
    .filter(
      (tx) =>
        tx.type === "income" &&
        tx.account === "cash" &&
        tx.subcategory !== "opening_adjustment"
    )
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
});

const ingresosBank = computed(() => {
  return transactions.value
    .filter(
      (tx) =>
        tx.type === "income" &&
        tx.account === "bank" &&
        tx.subcategory !== "opening_adjustment"
    )
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
});

const egresosCash = computed(() => {
  return transactions.value
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.category !== "adjustment" &&
        tx.account === "cash"
    )
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
});

const egresosBank = computed(() => {
  return transactions.value
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.category !== "adjustment" &&
        tx.account === "bank"
    )
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
});

const ajustesCash = computed(() => {
  const ingresosAjuste = transactions.value
    .filter(
      (tx) =>
        tx.type === "income" &&
        tx.subcategory === "closure_adjustment" &&
        tx.account === "cash"
    )
    .reduce((s, tx) => s + (tx.amount || 0), 0);

  const egresosAjuste = transactions.value
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.subcategory === "closure_adjustment" &&
        tx.account === "cash"
    )
    .reduce((s, tx) => s + (tx.amount || 0), 0);

  return ingresosAjuste - egresosAjuste;
});

const ajustesBank = computed(() => {
  const ingresosAjuste = transactions.value
    .filter(
      (tx) =>
        tx.type === "income" &&
        tx.subcategory === "closure_adjustment" &&
        tx.account === "bank"
    )
    .reduce((s, tx) => s + (tx.amount || 0), 0);

  const egresosAjuste = transactions.value
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.subcategory === "closure_adjustment" &&
        tx.account === "bank"
    )
    .reduce((s, tx) => s + (tx.amount || 0), 0);

  return ingresosAjuste - egresosAjuste;
});

// Calcular total de ajustes por arqueo al cierre del día
const totalAjustes = computed(() => {
  const ajustesIngreso = transactions.value
    .filter(
      (tx) => tx.type === "income" && tx.subcategory === "closure_adjustment"
    )
    .reduce((s, tx) => s + (tx.amount || 0), 0);

  const ajustesEgreso = transactions.value
    .filter(
      (tx) => tx.type === "expense" && tx.subcategory === "closure_adjustment"
    )
    .reduce((s, tx) => s + (tx.amount || 0), 0);

  return ajustesIngreso - ajustesEgreso;
});

// Resultado operacional SIN ajustes (para KPI) - SOLO ventas menos egresos
const resultadoOperacional = computed(() => {
  return totalIngresos.value - totalEgresos.value;
});

// Saldo actual SI incluye ajustes (liquidez real)
const saldoActual = computed(() => {
  return (
    saldoInicial.value +
    totalIngresos.value -
    totalEgresos.value +
    totalAjustes.value
  );
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
