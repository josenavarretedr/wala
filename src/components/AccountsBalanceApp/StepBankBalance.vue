<template>
  <div>
    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="bg-purple-50 border border-purple-200 rounded-lg p-6"
    >
      <div class="flex items-center justify-center gap-2">
        <div
          class="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"
        ></div>
        <p class="text-sm text-gray-600">Cargando datos...</p>
      </div>
    </div>

    <!-- Sección banco/digital -->
    <div
      v-else
      class="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-sm"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"
        >
          <SmartphoneDevice class="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h4 class="text-lg font-bold text-gray-900">
            {{
              isOpeningMode
                ? "Digital Inicial (Yape/Plin)"
                : "Digital Final (Yape/Plin)"
            }}
          </h4>
          <p class="text-xs text-gray-500">
            {{
              isOpeningMode
                ? "Saldo en billeteras digitales"
                : "Conteo de cierre digital"
            }}
          </p>
        </div>
      </div>

      <!-- Información contextual colapsable -->
      <div
        v-if="!isOpeningMode && openingData"
        class="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3"
      >
        <button
          @click="showBreakdown = !showBreakdown"
          class="w-full flex items-center justify-between text-left"
        >
          <span class="text-xs font-medium text-purple-800">
            Ver desglose del cálculo
          </span>
          <component
            :is="showBreakdown ? 'svg' : 'svg'"
            class="w-4 h-4 text-purple-600 transition-transform"
            :class="{ 'rotate-180': showBreakdown }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </component>
        </button>

        <Transition name="expand">
          <div
            v-if="showBreakdown"
            class="mt-3 space-y-2 text-xs text-gray-700"
          >
            <div class="flex justify-between">
              <span>Digital inicial:</span>
              <span class="font-semibold tabular-nums">
                S/ {{ (openingData.realBankBalance || 0).toFixed(2) }}
              </span>
            </div>
            <div class="flex justify-between text-green-700">
              <span>+ Ventas digitales:</span>
              <span class="font-semibold tabular-nums">
                S/ {{ accountsBalanceStore.ingresosBank.toFixed(2) }}
              </span>
            </div>
            <div class="flex justify-between text-red-700">
              <span>- Gastos digitales:</span>
              <span class="font-semibold tabular-nums">
                S/ {{ accountsBalanceStore.egresosBank.toFixed(2) }}
              </span>
            </div>
            <div
              class="pt-2 border-t border-purple-300 flex justify-between font-bold"
            >
              <span>Balance esperado:</span>
              <span class="tabular-nums text-purple-700">
                S/ {{ expectedBankBalance.toFixed(2) }}
              </span>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Información para modo apertura -->
      <div
        v-if="isOpeningMode"
        class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3"
      >
        <p class="text-xs text-blue-800">
          <span class="font-semibold">Balance del cierre anterior:</span>
          <span class="ml-1 tabular-nums"
            >S/ {{ expectedBankBalance.toFixed(2) }}</span
          >
        </p>
      </div>

      <!-- Input principal -->
      <div class="space-y-3">
        <label for="bank-balance-input" class="block">
          <span class="text-sm font-semibold text-gray-700 mb-2 block">
            {{
              isOpeningMode
                ? "¿Cuánto tienes en Yape/Plin ahora?"
                : "¿Cuánto digital cuentas?"
            }}
          </span>

          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400"
            >
              S/
            </span>
            <input
              id="bank-balance-input"
              ref="bankInput"
              type="number"
              inputmode="decimal"
              step="0.01"
              :disabled="isDisabled"
              v-model.number="realBankBalance"
              @input="handleInputChange"
              @focus="handleFocus"
              class="w-full pl-14 pr-4 py-4 text-3xl font-bold text-center border-2 rounded-xl shadow-sm transition-all duration-200 tabular-nums"
              :class="inputClasses"
              placeholder="0.00"
            />
          </div>
        </label>

        <!-- Indicador de estado -->
        <div class="flex items-center justify-center gap-2 min-h-[2rem]">
          <Transition name="fade" mode="out-in">
            <!-- Valor correcto - sin diferencia -->
            <div
              v-if="bankDifference === 0"
              class="flex items-center gap-2 text-sm font-medium text-purple-600"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Todo cuadra</span>
            </div>

            <!-- Hay diferencia -->
            <div
              v-else-if="hasUserInput && bankDifference !== 0"
              class="flex items-center gap-2 text-sm font-medium"
              :class="bankDifference > 0 ? 'text-green-700' : 'text-red-700'"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>
                {{ bankDifference > 0 ? "Sobrante" : "Faltante" }}: S/
                {{ Math.abs(bankDifference).toFixed(2) }}
              </span>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { SmartphoneDevice } from "@iconoir/vue";
import { ref, computed, onMounted, watch } from "vue";
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
const realBankBalance = ref(0);
const hasUserInput = ref(false);
const showBreakdown = ref(false);
const bankInput = ref(null);

// Determinar el modo (opening o close)
const isOpeningMode = computed(() => {
  return !transactionStore.transactionsInStore.value.some(
    (transaction) => transaction.type === "opening"
  );
});

// Verificar si está deshabilitado
const isDisabled = computed(() => {
  if (isOpeningMode.value) {
    const hasOpening = transactionStore.transactionsInStore.value.some(
      (t) => t.type === "opening"
    );
    return hasOpening;
  }
  return transactionStore.transactionsInStore.value.some(
    (t) => t.type === "closure"
  );
});

// Balance esperado según el modo
const expectedBankBalance = computed(() => {
  if (isOpeningMode.value) {
    return lastClosureData.value?.bankAmount || 0;
  } else {
    return accountsBalanceStore.expectedFinalBank;
  }
});

// Diferencia calculada
const bankDifference = computed(() => {
  if (!hasUserInput.value) return 0;
  return accountsBalanceStore.calculateDifference(
    realBankBalance.value,
    expectedBankBalance.value
  );
});

// Clases dinámicas para el input
const inputClasses = computed(() => {
  if (isDisabled.value) {
    return "border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed";
  }

  if (!hasUserInput.value) {
    return "border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200";
  }

  if (bankDifference.value === 0) {
    return "border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200";
  }

  if (bankDifference.value > 0) {
    return "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200";
  }

  return "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200";
});

// Determinar la opción seleccionada para compatibilidad con el flujo existente
const selectedBankOption = computed(() => {
  if (!hasUserInput.value) return null;
  if (bankDifference.value === 0) return "expected";
  return "custom";
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
const handleInputChange = () => {
  hasUserInput.value = true;
};

const handleFocus = (e) => {
  // Seleccionar todo el texto al hacer foco para facilitar la edición
  e.target.select();
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
    accountsBalanceStore.setTransactions([]);
  } else {
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
      await findLastClosure();
    } else {
      findOpeningToday();
    }

    setupBalanceStore();

    // Establecer el valor esperado como valor inicial
    realBankBalance.value = expectedBankBalance.value;
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
  transition-duration: 200ms;
}

/* Animación de expansión para desglose y diferencias */
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

/* Animación fade para indicadores de estado */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* Rotación para el icono de expansión */
.rotate-180 {
  transform: rotate(180deg);
}

/* Estilos del input */
input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Focus states mejorados */
input:focus {
  outline: none;
}

input:focus:not(:disabled) {
  box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.1);
}

/* Estados disabled */
input:disabled {
  cursor: not-allowed;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Mejora de accesibilidad */
button:focus-visible,
input:focus-visible {
  outline: 2px solid rgb(147 51 234);
  outline-offset: 2px;
}

/* Animación de spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  input[type="number"] {
    font-size: 1.875rem; /* 30px */
  }
}
</style>
