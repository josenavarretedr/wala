<template>
  <div class="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 text-gray-800">
    <!-- Título -->
    <div class="text-center mb-6">
      <div class="flex items-center justify-center gap-3 mb-2">
        <Safe class="w-8 h-8 text-green-600" />
        <h1 class="text-2xl sm:text-3xl font-bold text-green-700">
          Apertura de Caja
        </h1>
      </div>
      <p class="text-sm text-gray-500">
        Configura los balances iniciales del día
      </p>
    </div>

    <!-- Contenedor principal con diseño similar a CardOpening -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-6"
    >
      <!-- Referencia del Cierre Anterior -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                <p class="text-xs font-medium text-purple-800">
                  Digital cerrado
                </p>
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

      <!-- Sección de Balances -->
      <div class="space-y-4">
        <h3
          class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2"
        >
          Configurar Balances Iniciales
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Sección efectivo -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-4">
              <Coins class="w-5 h-5 text-emerald-600" />
              <h4 class="text-lg font-semibold text-emerald-800">Efectivo</h4>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-2">
                Balance esperado (del cierre anterior):
              </p>
              <p class="text-lg font-bold text-emerald-700 tabular-nums">
                S/ {{ expectedCashBalance.toFixed(2) }}
              </p>
            </div>

            <div class="space-y-3">
              <template v-if="selectedCashOption === null">
                <button
                  @click="selectCashOption('expected')"
                  :disabled="openingData"
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
                    :disabled="openingData"
                    v-model.number="realCashBalance"
                    @blur="onBlurCashInput"
                    class="w-full px-4 py-3 text-lg text-center border-2 border-emerald-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 tabular-nums"
                    placeholder="0.00"
                  />
                </div>
              </template>

              <template v-else-if="selectedCashOption === 'expected'">
                <div class="relative">
                  <button
                    class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                    @click="clearCashSelection"
                    :disabled="openingData"
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

              <template v-else-if="selectedCashOption === 'custom'">
                <div class="relative space-y-2">
                  <button
                    class="absolute top-0 right-0 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors z-10"
                    @click="clearCashSelection"
                    :disabled="openingData"
                  >
                    <Xmark class="w-4 h-4" />
                  </button>
                  <label
                    for="real-cash-input-selected"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Cantidad personalizada:
                  </label>
                  <input
                    id="real-cash-input-selected"
                    type="number"
                    inputmode="decimal"
                    pattern="[0-9]*"
                    step="0.01"
                    :disabled="openingData"
                    v-model.number="realCashBalance"
                    @blur="onBlurCashInput"
                    class="w-full px-4 py-3 text-lg text-center border-2 border-emerald-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 tabular-nums"
                    placeholder="0.00"
                  />
                </div>
              </template>

              <div
                v-if="cashDifference !== 0"
                class="text-sm font-medium p-2 rounded-md"
                :class="{
                  'text-red-700 bg-red-50 border border-red-200':
                    cashDifference < 0,
                  'text-green-700 bg-green-50 border border-green-200':
                    cashDifference > 0,
                }"
              >
                {{ cashDifference > 0 ? "Sobrante" : "Faltante" }}: S/
                {{ Math.abs(cashDifference).toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Sección banco -->
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-4">
              <SmartphoneDevice class="w-5 h-5 text-purple-600" />
              <h4 class="text-lg font-semibold text-purple-800">Yape / Plin</h4>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-2">
                Balance esperado (del cierre anterior):
              </p>
              <p class="text-lg font-bold text-purple-700 tabular-nums">
                S/ {{ expectedBankBalance.toFixed(2) }}
              </p>
            </div>

            <div class="space-y-3">
              <template v-if="selectedBankOption === null">
                <button
                  @click="selectBankOption('expected')"
                  :disabled="openingData"
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
                    :disabled="openingData"
                    v-model.number="realBankBalance"
                    @blur="onBlurBankInput"
                    class="w-full px-4 py-3 text-lg text-center border-2 border-purple-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 tabular-nums"
                    placeholder="0.00"
                  />
                </div>
              </template>

              <template v-else-if="selectedBankOption === 'expected'">
                <div class="relative">
                  <button
                    class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                    @click="clearBankSelection"
                    :disabled="openingData"
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

              <template v-else-if="selectedBankOption === 'custom'">
                <div class="relative space-y-2">
                  <button
                    class="absolute top-0 right-0 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors z-10"
                    @click="clearBankSelection"
                    :disabled="openingData"
                  >
                    <Xmark class="w-4 h-4" />
                  </button>
                  <label
                    for="real-bank-input-selected"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Cantidad personalizada:
                  </label>
                  <input
                    id="real-bank-input-selected"
                    type="number"
                    inputmode="decimal"
                    pattern="[0-9]*"
                    step="0.01"
                    :disabled="openingData"
                    v-model.number="realBankBalance"
                    @blur="onBlurBankInput"
                    class="w-full px-4 py-3 text-lg text-center border-2 border-purple-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 tabular-nums"
                    placeholder="0.00"
                  />
                </div>
              </template>

              <div
                v-if="bankDifference !== 0"
                class="text-sm font-medium p-2 rounded-md"
                :class="{
                  'text-red-700 bg-red-50 border border-red-200':
                    bankDifference < 0,
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
      </div>

      <!-- Mensaje de diferencias -->
      <div
        v-if="hasDifferences && !openingData"
        class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
      >
        <div class="flex items-center gap-2 mb-2">
          <svg
            class="w-4 h-4 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p class="text-sm font-medium text-yellow-800">Ajustes automáticos</p>
        </div>
        <p class="text-sm text-yellow-700">
          Se detectaron diferencias. Al realizar la apertura se crearán
          automáticamente transacciones de ajuste para balancear las cuentas.
        </p>
      </div>

      <!-- Botón de acción final -->
      <div class="pt-4 border-t border-gray-200">
        <router-link
          v-if="openingData"
          :to="{
            name: 'BusinessDashboard',
            params: { businessId: currentBusinessId },
          }"
          class="block w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold text-center py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
        >
          ✅ Apertura Completada - Ver Dashboard
        </router-link>

        <button
          v-else
          @click="performOpening"
          :disabled="!canPerformOpening"
          class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-lg font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
        >
          {{
            canPerformOpening
              ? "🚀 Realizar Apertura de Caja"
              : "⏳ Selecciona los balances para continuar"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Coins, SmartphoneDevice, Safe, Xmark, Cash } from "@iconoir/vue";
import { ref, computed, nextTick, onMounted, defineEmits } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { generateUUID } from "@/utils/generateUUID";
import { ensureBusinessId } from "@/composables/useBusinessUtils";

const transactionStore = useTransactionStore();
const emit = defineEmits(["opening-created"]);

// Estados reactivos
const lastClosureData = ref(null);
const openingData = ref(null);
const selectedCashOption = ref(null);
const selectedBankOption = ref(null);
const realCashBalance = ref(0);
const realBankBalance = ref(0);

// Balances esperados (basados en el último cierre)
const expectedCashBalance = computed(() => {
  return lastClosureData.value?.cashAmount || 0;
});

const expectedBankBalance = computed(() => {
  return lastClosureData.value?.bankAmount || 0;
});

// Diferencias calculadas
const cashDifference = computed(() => {
  if (selectedCashOption.value === null) return 0;
  const real =
    selectedCashOption.value === "expected"
      ? expectedCashBalance.value
      : realCashBalance.value;
  return real - expectedCashBalance.value;
});

const bankDifference = computed(() => {
  if (selectedBankOption.value === null) return 0;
  const real =
    selectedBankOption.value === "expected"
      ? expectedBankBalance.value
      : realBankBalance.value;
  return real - expectedBankBalance.value;
});

// Verificar si hay diferencias
const hasDifferences = computed(() => {
  return (
    Math.abs(cashDifference.value) > 0.01 ||
    Math.abs(bankDifference.value) > 0.01
  );
});

// Verificar si se puede realizar la apertura
const canPerformOpening = computed(() => {
  return selectedCashOption.value !== null && selectedBankOption.value !== null;
});

// Business ID para la redirección
const currentBusinessId = computed(() => {
  return ensureBusinessId();
});

// Inicialización
onMounted(async () => {
  // Solo buscar el último cierre, las transacciones ya fueron cargadas por el componente padre
  await findLastClosure();
});

// Buscar el último cierre
const findLastClosure = async () => {
  try {
    // Solo cargar todas las transacciones si no hay transacciones en el store
    if (transactionStore.transactionsInStore.value.length === 0) {
      await transactionStore.getTransactions();
    }

    // Filtrar transacciones de tipo "closure" y ordenar por fecha
    const closureTransactions = transactionStore.transactionsInStore.value
      .filter((t) => t.type === "closure")
      .sort((a, b) => {
        // Ordenar por fecha descendente (más reciente primero)
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

    if (closureTransactions.length > 0) {
      const lastClosure = closureTransactions[0];
      lastClosureData.value = {
        ...lastClosure,
        cashAmount: lastClosure.realCashBalance || 0,
        bankAmount: lastClosure.realBankBalance || 0,
        createdAt: lastClosure.createdAt,
      };
    }

    console.log("📊 Último cierre encontrado:", lastClosureData.value);
  } catch (error) {
    console.error("❌ Error buscando último cierre:", error);
  }
};

// Manejadores de efectivo
const selectCashOption = (option) => {
  if (openingData.value) return;
  selectedCashOption.value = option;
  if (option === "expected") {
    realCashBalance.value = expectedCashBalance.value;
  }
};

const clearCashSelection = () => {
  if (openingData.value) return;
  selectedCashOption.value = null;
  realCashBalance.value = 0;
};

const onBlurCashInput = (e) => {
  if (openingData.value) return;
  nextTick(() => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      selectedCashOption.value = "custom";
      realCashBalance.value = value;
    }
  });
};

// Manejadores de banco
const selectBankOption = (option) => {
  if (openingData.value) return;
  selectedBankOption.value = option;
  if (option === "expected") {
    realBankBalance.value = expectedBankBalance.value;
  }
};

const clearBankSelection = () => {
  if (openingData.value) return;
  selectedBankOption.value = null;
  realBankBalance.value = 0;
};

const onBlurBankInput = (e) => {
  if (openingData.value) return;
  nextTick(() => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      selectedBankOption.value = "custom";
      realBankBalance.value = value;
    }
  });
};

// Realizar apertura
const performOpening = async () => {
  try {
    console.log("🔄 Iniciando apertura de caja...");

    // Crear transacción de apertura principal
    const openingTransaction = {
      uuid: generateUUID(),
      type: "opening",
      description: "Apertura de caja",
      expectedCashBalance: expectedCashBalance.value,
      expectedBankBalance: expectedBankBalance.value,
      realCashBalance:
        selectedCashOption.value === "expected"
          ? expectedCashBalance.value
          : realCashBalance.value,
      realBankBalance:
        selectedBankOption.value === "expected"
          ? expectedBankBalance.value
          : realBankBalance.value,
      // Campos compatibles con CardOpening.vue
      totalCash:
        selectedCashOption.value === "expected"
          ? expectedCashBalance.value
          : realCashBalance.value,
      totalBank:
        selectedBankOption.value === "expected"
          ? expectedBankBalance.value
          : realBankBalance.value,
      cashDifference: cashDifference.value,
      bankDifference: bankDifference.value,
      lastClosureReference: lastClosureData.value?.uuid || null,
      items: [],
      itemsAndStockLogs: [],
      amount: 0,
    };

    // Agregar la transacción de apertura al store y crear en Firebase
    transactionStore.transactionToAdd.value = openingTransaction;
    await transactionStore.addTransaction();

    console.log("✅ Transacción de apertura creada");

    // Crear transacciones de ajuste si hay diferencias
    if (hasDifferences.value) {
      await createAdjustmentTransactions();
    }

    openingData.value = openingTransaction;

    // Emitir evento al componente padre para que actualice su estado
    emit("opening-created");

    console.log("✅ Apertura completada exitosamente");
  } catch (error) {
    console.error("❌ Error en la apertura:", error);
    alert("Error al realizar la apertura. Por favor, intenta nuevamente.");
  }
};

// Crear transacciones de ajuste
const createAdjustmentTransactions = async () => {
  try {
    // Ajuste de efectivo
    if (Math.abs(cashDifference.value) > 0.01) {
      const cashAdjustment = {
        uuid: generateUUID(),
        type: cashDifference.value > 0 ? "income" : "expense",
        account: "cash",
        description: `Ajuste de apertura - Efectivo (${
          cashDifference.value > 0 ? "Sobrante" : "Faltante"
        })`,
        amount: Math.abs(cashDifference.value),
        category: "adjustment",
        subcategory: "opening_adjustment",
        isSystemGenerated: true,
        items: [],
        itemsAndStockLogs: [],
      };

      transactionStore.transactionToAdd.value = cashAdjustment;
      await transactionStore.addTransaction();
      console.log("✅ Ajuste de efectivo creado:", cashAdjustment.amount);
    }

    // Ajuste de banco
    if (Math.abs(bankDifference.value) > 0.01) {
      const bankAdjustment = {
        uuid: generateUUID(),
        type: bankDifference.value > 0 ? "income" : "expense",
        account: "bank",
        description: `Ajuste de apertura - Yape/Plin (${
          bankDifference.value > 0 ? "Sobrante" : "Faltante"
        })`,
        amount: Math.abs(bankDifference.value),
        category: "adjustment",
        subcategory: "opening_adjustment",
        isSystemGenerated: true,
        items: [],
        itemsAndStockLogs: [],
      };

      transactionStore.transactionToAdd.value = bankAdjustment;
      await transactionStore.addTransaction();
      transactionStore.resetTransactionToAdd();

      console.log("✅ Ajuste de banco creado:", bankAdjustment.amount);
    }
  } catch (error) {
    console.error("❌ Error creando transacciones de ajuste:", error);
    throw error;
  }
};

// Utilidad para formatear fechas
const formatDate = (timestamp) => {
  if (!timestamp) return "Fecha no disponible";

  let date;
  if (timestamp.seconds) {
    // Firebase Timestamp
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }

  return date.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
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

/* Hover effects para touch devices */
@media (hover: hover) {
  .hover\:bg-emerald-200:hover {
    background-color: rgb(167 243 208);
  }

  .hover\:bg-purple-200:hover {
    background-color: rgb(221 214 254);
  }

  .hover\:bg-green-600:hover {
    background-color: rgb(22 163 74);
  }

  .hover\:bg-green-700:hover {
    background-color: rgb(21 128 61);
  }

  .hover\:bg-red-50:hover {
    background-color: rgb(254 242 242);
  }

  .hover\:text-red-700:hover {
    color: rgb(185 28 28);
  }
}

/* Focus states mejorados */
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

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid.lg\:grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .text-2xl.sm\:text-3xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .p-4.sm\:p-6 {
    padding: 1rem;
  }

  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .py-6 {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .grid.sm\:grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

/* Animaciones de entrada */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-6 > * {
  animation: fadeIn 0.3s ease-out;
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

/* Smooth transform para botones */
.transform {
  transition: transform 0.2s ease-in-out;
}

.hover\:scale-\[1\.02\]:hover {
  transform: scale(1.02);
}
</style>
