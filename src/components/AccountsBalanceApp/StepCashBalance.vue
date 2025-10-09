<template>
  <div>
    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="bg-emerald-50 border border-emerald-200 rounded-lg p-4"
    >
      <div class="flex items-center justify-center gap-2">
        <div
          class="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"
        ></div>
        <p class="text-sm text-gray-600">Cargando datos...</p>
      </div>
    </div>

    <!-- Sección efectivo -->
    <div v-else class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-4">
        <Coins class="w-5 h-5 text-emerald-600" />
        <h4 class="text-lg font-semibold text-emerald-800">
          {{ isOpeningMode ? "Efectivo Inicial" : "Efectivo Final" }}
        </h4>
      </div>

      <!-- Información del balance esperado -->
      <div class="mb-4">
        <p class="text-sm text-gray-600 mb-2">
          {{
            isOpeningMode
              ? "Balance esperado (del cierre anterior):"
              : "Balance esperado (calculado):"
          }}
        </p>

        <!-- Desglose para modo cierre -->
        <div
          v-if="!isOpeningMode && openingData"
          class="text-sm text-gray-600 space-y-1 mb-2"
        >
          <div>
            • Inicial: S/
            {{ (openingData.realCashBalance || 0).toFixed(2) }}
          </div>
          <div>
            • Ventas efectivo: +S/
            {{ accountsBalanceStore.ingresosCash.toFixed(2) }}
          </div>
          <div>
            • Gastos efectivo: -S/
            {{ accountsBalanceStore.egresosCash.toFixed(2) }}
          </div>
        </div>

        <p class="text-lg font-bold text-emerald-700 tabular-nums">
          S/ {{ expectedCashBalance.toFixed(2) }}
        </p>
      </div>

      <!-- Formulario de selección -->
      <div class="space-y-3">
        <!-- Estado inicial: sin selección -->
        <template v-if="selectedCashOption === null">
          <button
            @click="selectCashOption('expected')"
            :disabled="isDisabled"
            class="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-lg font-semibold py-3 px-4 rounded-lg border border-emerald-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓ Correcto: S/ {{ expectedCashBalance.toFixed(2) }}
          </button>

          <div class="space-y-2">
            <label
              for="real-cash-input"
              class="block text-sm font-medium text-gray-700"
            >
              Tengo una cantidad diferente:
            </label>
            <input
              id="real-cash-input"
              type="number"
              inputmode="decimal"
              pattern="[0-9]*"
              step="0.01"
              :disabled="isDisabled"
              v-model.number="realCashBalance"
              @blur="onBlurCashInput"
              class="w-full px-4 py-3 text-lg text-center border-2 border-emerald-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 tabular-nums"
              placeholder="0.00"
            />
          </div>
        </template>

        <!-- Opción "expected" seleccionada -->
        <template v-else-if="selectedCashOption === 'expected'">
          <div class="relative">
            <button
              class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
              @click="clearCashSelection"
              :disabled="isDisabled"
            >
              <Xmark class="w-4 h-4" />
            </button>
            <div
              class="bg-emerald-200 text-emerald-800 text-lg font-semibold py-3 px-4 rounded-lg border border-emerald-300"
            >
              ✓ Correcto: S/ {{ expectedCashBalance.toFixed(2) }}
            </div>
          </div>
        </template>

        <!-- Opción "custom" seleccionada -->
        <template v-else-if="selectedCashOption === 'custom'">
          <div class="relative space-y-2">
            <button
              class="absolute top-0 right-0 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors z-10"
              @click="clearCashSelection"
              :disabled="isDisabled"
            >
              <Xmark class="w-4 h-4" />
            </button>
            <label
              for="real-cash-input-selected"
              class="block text-sm font-medium text-gray-700"
            >
              {{
                isOpeningMode
                  ? "Cantidad personalizada:"
                  : "Cantidad final real:"
              }}
            </label>
            <input
              id="real-cash-input-selected"
              type="number"
              inputmode="decimal"
              pattern="[0-9]*"
              step="0.01"
              :disabled="isDisabled"
              v-model.number="realCashBalance"
              @blur="onBlurCashInput"
              class="w-full px-4 py-3 text-lg text-center border-2 border-emerald-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 tabular-nums"
              placeholder="0.00"
            />
          </div>
        </template>

        <!-- Mostrar diferencia si existe -->
        <div
          v-if="cashDifference !== 0"
          class="text-sm font-medium p-2 rounded-md"
          :class="{
            'text-red-700 bg-red-50 border border-red-200': cashDifference < 0,
            'text-green-700 bg-green-50 border border-green-200':
              cashDifference > 0,
          }"
        >
          {{ cashDifference > 0 ? "Sobrante" : "Faltante" }}: S/
          {{ Math.abs(cashDifference).toFixed(2) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Coins, Xmark } from "@iconoir/vue";
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { useAccountsBalanceFlowStore } from "@/stores/AccountsBalanceApp/accountsBalanceFlowStore";

const transactionStore = useTransactionStore();
const accountsBalanceStore = useAccountsBalanceStore();
const flowStore = useAccountsBalanceFlowStore();

// Estados reactivos
const isLoading = ref(true);
const lastClosureData = ref(null);
const openingData = ref(null);
const selectedCashOption = ref(null);
const realCashBalance = ref(0);

// Determinar el modo (opening o close)
const isOpeningMode = computed(() => {
  return !transactionStore.transactionsInStore.value.some(
    (transaction) => transaction.type === "opening"
  );
});

// Verificar si está deshabilitado
const isDisabled = computed(() => {
  // En modo opening: deshabilitar si ya existe openingData
  if (isOpeningMode.value) {
    const hasOpening = transactionStore.transactionsInStore.value.some(
      (t) => t.type === "opening"
    );
    return hasOpening;
  }
  // En modo close: deshabilitar si ya existe closureData
  return transactionStore.transactionsInStore.value.some(
    (t) => t.type === "closure"
  );
});

// Balance esperado según el modo
const expectedCashBalance = computed(() => {
  if (isOpeningMode.value) {
    // Modo opening: usar el balance del último cierre
    return lastClosureData.value?.cashAmount || 0;
  } else {
    // Modo close: usar el balance calculado del store
    return accountsBalanceStore.expectedFinalCash;
  }
});

// Diferencia calculada
const cashDifference = computed(() => {
  if (selectedCashOption.value === null) return 0;
  const real =
    selectedCashOption.value === "expected"
      ? expectedCashBalance.value
      : realCashBalance.value;
  return accountsBalanceStore.calculateDifference(
    real,
    expectedCashBalance.value
  );
});

// Observar cambios y actualizar el flowStore
watch(
  [selectedCashOption, realCashBalance, expectedCashBalance],
  () => {
    flowStore.updateStepData("Cash Balance", {
      selectedCashOption: selectedCashOption.value,
      realCashBalance: realCashBalance.value,
      expectedCashBalance: expectedCashBalance.value,
      lastClosureData: lastClosureData.value,
      openingData: openingData.value,
    });
  },
  { deep: true }
);

// Manejadores
const selectCashOption = (option) => {
  if (isDisabled.value) return;
  selectedCashOption.value = option;
  if (option === "expected") {
    realCashBalance.value = expectedCashBalance.value;
  }
};

const clearCashSelection = () => {
  if (isDisabled.value) return;
  selectedCashOption.value = null;
  realCashBalance.value = 0;
};

const onBlurCashInput = (e) => {
  if (isDisabled.value) return;
  nextTick(() => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      selectedCashOption.value = "custom";
      realCashBalance.value = value;
    }
  });
};

// Buscar el último cierre (solo para modo opening)
const findLastClosure = async () => {
  try {
    if (transactionStore.transactionsInStore.value.length === 0) {
      await transactionStore.getTransactions();
    }

    const closureTransactions = transactionStore.transactionsInStore.value
      .filter((t) => t.type === "closure")
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

    if (closureTransactions.length > 0) {
      lastClosureData.value = closureTransactions[0];
    }
  } catch (error) {
    console.error("Error buscando último cierre:", error);
  }
};

// Buscar la apertura del día (solo para modo close)
const findOpeningToday = () => {
  const opening = transactionStore.transactionsInStore.value.find(
    (t) => t.type === "opening"
  );
  if (opening) {
    openingData.value = opening;
  }
};

// Configurar el accountsBalanceStore
const setupBalanceStore = () => {
  if (isOpeningMode.value) {
    // En modo opening, no hay transacciones del día todavía
    accountsBalanceStore.setTransactions([]);
  } else {
    // En modo close, configurar con transacciones del día
    if (openingData.value) {
      const openingTime = openingData.value.createdAt?.seconds || 0;
      const dayTransactions = transactionStore.transactionsInStore.value.filter(
        (tx) => {
          const txTime = tx.createdAt?.seconds || 0;
          return txTime >= openingTime;
        }
      );
      accountsBalanceStore.setTransactions(dayTransactions);
      accountsBalanceStore.setOpening(openingData.value);
    }
  }
};

// Inicialización
onMounted(async () => {
  try {
    // Cargar transacciones
    if (transactionStore.transactionsInStore.value.length === 0) {
      await transactionStore.getTransactionsToday();
    }

    if (isOpeningMode.value) {
      // Modo opening: buscar último cierre
      await findLastClosure();
    } else {
      // Modo close: buscar apertura del día
      findOpeningToday();
    }

    // Configurar el store de balance
    setupBalanceStore();
  } catch (error) {
    console.error("Error en inicialización de StepCashBalance:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
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

/* Hover effects */
@media (hover: hover) {
  .hover\:bg-emerald-200:hover {
    background-color: rgb(167 243 208);
  }

  .hover\:bg-red-50:hover {
    background-color: rgb(254 242 242);
  }

  .hover\:text-red-700:hover {
    color: rgb(185 28 28);
  }
}

/* Focus states */
input:focus {
  transform: none;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

input:focus:not(:disabled) {
  border-color: rgb(34 197 94);
  outline: none;
}

/* Estados disabled */
input:disabled {
  background-color: rgb(249 250 251);
  cursor: not-allowed;
}

button:disabled {
  transform: none !important;
  cursor: not-allowed;
}

/* Mejora de accesibilidad */
button:focus-visible,
input:focus-visible {
  outline: 2px solid rgb(34 197 94);
  outline-offset: 2px;
}

/* Estilos para badges de diferencia */
.bg-red-50 {
  background-color: rgb(254 242 242);
}

.bg-green-50 {
  background-color: rgb(240 253 244);
}

.border-red-200 {
  border-color: rgb(254 202 202);
}

.border-green-200 {
  border-color: rgb(187 247 208);
}

.text-red-700 {
  color: rgb(185 28 28);
}

.text-green-700 {
  color: rgb(21 128 61);
}
</style>
