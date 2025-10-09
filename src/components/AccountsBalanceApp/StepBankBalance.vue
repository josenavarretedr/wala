<template>
  <div>
    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="bg-purple-50 border border-purple-200 rounded-lg p-4"
    >
      <div class="flex items-center justify-center gap-2">
        <div
          class="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"
        ></div>
        <p class="text-sm text-gray-600">Cargando datos...</p>
      </div>
    </div>

    <!-- Sección banco/digital -->
    <div v-else class="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-4">
        <SmartphoneDevice class="w-5 h-5 text-purple-600" />
        <h4 class="text-lg font-semibold text-purple-800">
          {{ isOpeningMode ? "Yape / Plin Inicial" : "Digital Final" }}
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
            {{ (openingData.realBankBalance || 0).toFixed(2) }}
          </div>
          <div>
            • Ventas digital: +S/
            {{ accountsBalanceStore.ingresosBank.toFixed(2) }}
          </div>
          <div>
            • Gastos digital: -S/
            {{ accountsBalanceStore.egresosBank.toFixed(2) }}
          </div>
        </div>

        <p class="text-lg font-bold text-purple-700 tabular-nums">
          S/ {{ expectedBankBalance.toFixed(2) }}
        </p>
      </div>

      <!-- Formulario de selección -->
      <div class="space-y-3">
        <!-- Estado inicial: sin selección -->
        <template v-if="selectedBankOption === null">
          <button
            @click="selectBankOption('expected')"
            :disabled="isDisabled"
            class="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 text-lg font-semibold py-3 px-4 rounded-lg border border-purple-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓ Correcto: S/ {{ expectedBankBalance.toFixed(2) }}
          </button>

          <div class="space-y-2">
            <label
              for="real-bank-input"
              class="block text-sm font-medium text-gray-700"
            >
              Tengo una cantidad diferente:
            </label>
            <input
              id="real-bank-input"
              type="number"
              inputmode="decimal"
              pattern="[0-9]*"
              step="0.01"
              :disabled="isDisabled"
              v-model.number="realBankBalance"
              @blur="onBlurBankInput"
              class="w-full px-4 py-3 text-lg text-center border-2 border-purple-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 tabular-nums"
              placeholder="0.00"
            />
          </div>
        </template>

        <!-- Opción "expected" seleccionada -->
        <template v-else-if="selectedBankOption === 'expected'">
          <div class="relative">
            <button
              class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
              @click="clearBankSelection"
              :disabled="isDisabled"
            >
              <Xmark class="w-4 h-4" />
            </button>
            <div
              class="bg-purple-200 text-purple-800 text-lg font-semibold py-3 px-4 rounded-lg border border-purple-300"
            >
              ✓ Correcto: S/ {{ expectedBankBalance.toFixed(2) }}
            </div>
          </div>
        </template>

        <!-- Opción "custom" seleccionada -->
        <template v-else-if="selectedBankOption === 'custom'">
          <div class="relative space-y-2">
            <button
              class="absolute top-0 right-0 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors z-10"
              @click="clearBankSelection"
              :disabled="isDisabled"
            >
              <Xmark class="w-4 h-4" />
            </button>
            <label
              for="real-bank-input-selected"
              class="block text-sm font-medium text-gray-700"
            >
              {{
                isOpeningMode
                  ? "Cantidad personalizada:"
                  : "Cantidad final real:"
              }}
            </label>
            <input
              id="real-bank-input-selected"
              type="number"
              inputmode="decimal"
              pattern="[0-9]*"
              step="0.01"
              :disabled="isDisabled"
              v-model.number="realBankBalance"
              @blur="onBlurBankInput"
              class="w-full px-4 py-3 text-lg text-center border-2 border-purple-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 tabular-nums"
              placeholder="0.00"
            />
          </div>
        </template>

        <!-- Mostrar diferencia si existe -->
        <div
          v-if="bankDifference !== 0"
          class="text-sm font-medium p-2 rounded-md"
          :class="{
            'text-red-700 bg-red-50 border border-red-200': bankDifference < 0,
            'text-green-700 bg-green-50 border border-green-200':
              bankDifference > 0,
          }"
        >
          {{ bankDifference > 0 ? "Sobrante" : "Faltante" }}: S/
          {{ Math.abs(bankDifference).toFixed(2) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { SmartphoneDevice, Xmark } from "@iconoir/vue";
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
const selectedBankOption = ref(null);
const realBankBalance = ref(0);

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
const expectedBankBalance = computed(() => {
  if (isOpeningMode.value) {
    // Modo opening: usar el balance del último cierre
    return lastClosureData.value?.bankAmount || 0;
  } else {
    // Modo close: usar el balance calculado del store
    return accountsBalanceStore.expectedFinalBank;
  }
});

// Diferencia calculada
const bankDifference = computed(() => {
  if (selectedBankOption.value === null) return 0;
  const real =
    selectedBankOption.value === "expected"
      ? expectedBankBalance.value
      : realBankBalance.value;
  return accountsBalanceStore.calculateDifference(
    real,
    expectedBankBalance.value
  );
});

// Observar cambios y actualizar el flowStore
watch(
  [selectedBankOption, realBankBalance, expectedBankBalance],
  () => {
    flowStore.updateStepData("Bank Balance", {
      selectedBankOption: selectedBankOption.value,
      realBankBalance: realBankBalance.value,
      expectedBankBalance: expectedBankBalance.value,
    });
  },
  { deep: true }
);

// Manejadores
const selectBankOption = (option) => {
  if (isDisabled.value) return;
  selectedBankOption.value = option;
  if (option === "expected") {
    realBankBalance.value = expectedBankBalance.value;
  }
};

const clearBankSelection = () => {
  if (isDisabled.value) return;
  selectedBankOption.value = null;
  realBankBalance.value = 0;
};

const onBlurBankInput = (e) => {
  if (isDisabled.value) return;
  nextTick(() => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      selectedBankOption.value = "custom";
      realBankBalance.value = value;
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
    console.error("Error en inicialización de StepBankBalance:", error);
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
  .hover\:bg-purple-200:hover {
    background-color: rgb(221 214 254);
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
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

input:focus:not(:disabled) {
  border-color: rgb(147 51 234);
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
  outline: 2px solid rgb(147 51 234);
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
