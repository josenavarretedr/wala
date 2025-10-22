<template>
  <div>
    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="bg-blue-50 border border-blue-200 rounded-lg p-4"
    >
      <div class="flex items-center justify-center gap-2">
        <div
          class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"
        ></div>
        <p class="text-sm text-gray-600">Cargando datos...</p>
      </div>
    </div>

    <!-- Modo Opening: Referencia del Cierre Anterior -->
    <div
      v-else-if="!hasOpeningToday"
      class="bg-blue-50 border border-blue-200 rounded-lg p-4"
    >
      <div class="flex items-center gap-2 mb-3">
        <Cash class="w-4 h-4 text-blue-600" />
        <h2 class="text-lg font-semibold text-blue-800">
          Referencia del Cierre Anterior
        </h2>
      </div>

      <div v-if="lastClosureData" class="space-y-2">
        <div class="text-sm text-gray-600">
          <span class="font-medium">Último cierre:</span>
          <span class="text-blue-700 font-semibold ml-1">{{
            formatDate(lastClosureData.createdAt)
          }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div class="flex items-center gap-1 mb-1">
              <Coins class="w-3 h-3 text-emerald-600" />
              <p class="text-xs font-medium text-emerald-800">
                Efectivo cerrado
              </p>
            </div>
            <p class="text-lg font-bold text-emerald-700 tabular-nums">
              S/ {{ (lastClosureData.cashAmount || 0).toFixed(2) }}
            </p>
          </div>

          <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div class="flex items-center gap-1 mb-1">
              <SmartphoneDevice class="w-3 h-3 text-purple-600" />
              <p class="text-xs font-medium text-purple-800">Digital cerrado</p>
            </div>
            <p class="text-lg font-bold text-purple-700 tabular-nums">
              S/ {{ (lastClosureData.bankAmount || 0).toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="text-gray-500 text-sm italic">
        No se encontró cierre anterior. Iniciando desde cero.
      </div>
    </div>

    <!-- Modo Close: Resumen del Día -->
    <div v-else class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-3">
        <Cash class="w-4 h-4 text-blue-600" />
        <h2 class="text-lg font-semibold text-blue-800">Resumen del Día</h2>
      </div>

      <div v-if="openingData" class="space-y-4">
        <!-- Balance inicial -->
        <div class="text-sm text-gray-600">
          <span class="font-medium">Apertura:</span>
          <span class="text-blue-700 font-semibold ml-1">{{
            formatDate(openingData.createdAt)
          }}</span>
        </div>

        <!-- Grid de resumen -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Inicial Efectivo -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div class="flex items-center gap-1 mb-1">
              <Coins class="w-3 h-3 text-emerald-600" />
              <p class="text-xs font-medium text-emerald-800">
                Efectivo inicial
              </p>
            </div>
            <p class="text-lg font-bold text-emerald-700 tabular-nums">
              S/ {{ (openingData.realCashBalance || 0).toFixed(2) }}
            </p>
          </div>

          <!-- Inicial Digital -->
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div class="flex items-center gap-1 mb-1">
              <SmartphoneDevice class="w-3 h-3 text-purple-600" />
              <p class="text-xs font-medium text-purple-800">Digital inicial</p>
            </div>
            <p class="text-lg font-bold text-purple-700 tabular-nums">
              S/ {{ (openingData.realBankBalance || 0).toFixed(2) }}
            </p>
          </div>

          <!-- Ventas del día -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-3">
            <div class="flex items-center gap-1 mb-1">
              <GraphUp class="w-3 h-3 text-green-600" />
              <p class="text-xs font-medium text-green-800">Ventas del día</p>
            </div>
            <p class="text-lg font-bold text-green-700 tabular-nums">
              S/ {{ totalIngresos.toFixed(2) }}
            </p>
          </div>

          <!-- Gastos del día -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <div class="flex items-center gap-1 mb-1">
              <DatabaseExport class="w-3 h-3 text-red-600" />
              <p class="text-xs font-medium text-red-800">Gastos del día</p>
            </div>
            <p class="text-lg font-bold text-red-700 tabular-nums">
              S/ {{ totalEgresos.toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="text-gray-500 text-sm italic">
        No se encontró apertura del día. No se puede realizar el cierre.
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Cash,
  Coins,
  SmartphoneDevice,
  GraphUp,
  DatabaseExport,
} from "@iconoir/vue";
import { ref, computed, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { useDailySummary } from "@/composables/useDailySummary";
import { useTransaccion } from "@/composables/useTransaction";

const transactionStore = useTransactionStore();
const accountsBalanceStore = useAccountsBalanceStore();
const { getTodayDailySummary } = useDailySummary();
const { getTransactionByID } = useTransaccion();

// Estados reactivos
const isLoading = ref(true);
const lastClosureData = ref(null);
const openingData = ref(null);

const dailySummary = ref(null);

// Determinar si hay apertura hoy (modo close) o no (modo opening)
const hasOpeningToday = computed(() => {
  return dailySummary.value?.hasOpening;
});

// Usar el accountsBalanceStore para cálculos precisos
// Excluye ajustes automáticamente y maneja correctamente las categorías
const totalIngresos = computed(() => {
  return dailySummary.value?.totals.income || 0;
});

const totalEgresos = computed(() => {
  return dailySummary.value?.totals.expense || 0;
});

// Función para formatear fechas
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Buscar el último cierre
const findLastClosure = async () => {
  try {
    // Usar la nueva función para obtener las últimas transacciones de cierre
    const closureTransactions = await transactionStore.getLastClosures(5);

    if (closureTransactions && closureTransactions.length > 0) {
      // Tomar el primer elemento (el más reciente)
      lastClosureData.value = closureTransactions[0];
      console.log("Último cierre encontrado:", lastClosureData.value);
      console.log(
        `Total de cierres encontrados: ${closureTransactions.length}`
      );
    } else {
      console.log("No se encontraron transacciones de cierre.");
      lastClosureData.value = null;
    }
  } catch (error) {
    console.error("Error buscando último cierre:", error);
    lastClosureData.value = null;
  }
};

// Buscar la apertura del día
const findOpeningToday = async () => {
  if (dailySummary.value?.openingData.id) {
    openingData.value = await getTransactionByID(
      dailySummary.value.openingData.id
    );
    console.log("Apertura del día encontrada:", openingData.value);
  } else {
    console.log("No se encontró apertura del día.");
    openingData.value = null;
  }
};

// Inicialización
onMounted(async () => {
  try {
    // Cargar transacciones del día si no están cargadas
    dailySummary.value = await getTodayDailySummary();

    // Buscar apertura del día
    findOpeningToday();

    // Si no hay apertura hoy, buscar el último cierre
    if (!hasOpeningToday.value) {
      await findLastClosure();
    }
  } catch (error) {
    console.error("Error en inicialización de StepLastReference:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>
