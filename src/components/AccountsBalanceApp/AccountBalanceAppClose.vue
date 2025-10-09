<template>
  <div class="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 text-gray-800">
    <!-- Título -->
    <div class="text-center mb-6">
      <div class="flex items-center justify-center gap-3 mb-2">
        <Safe class="w-8 h-8 text-purple-600" />
        <h1 class="text-2xl sm:text-3xl font-bold text-purple-700">
          Cierre de Caja
        </h1>
      </div>
      <p class="text-sm text-gray-500">Confirma los balances finales del día</p>
    </div>

    <!-- Contenedor principal con diseño similar a CardOpening -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-6"
    >
      <!-- Resumen del día -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                <p class="text-xs font-medium text-purple-800">
                  Digital inicial
                </p>
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

      <!-- Sección de Balances Finales (solo si hay apertura) -->
      <div v-if="openingData" class="space-y-4">
        <h3
          class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2"
        >
          Confirmar Balances Finales
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Sección efectivo -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-4">
              <Coins class="w-5 h-5 text-emerald-600" />
              <h4 class="text-lg font-semibold text-emerald-800">
                Efectivo Final
              </h4>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-2">
                Balance esperado (calculado):
              </p>
              <div class="text-sm text-gray-600 space-y-1 mb-2">
                <div>
                  • Inicial: S/
                  {{ (openingData.realCashBalance || 0).toFixed(2) }}
                </div>
                <div>• Ventas efectivo: +S/ {{ ingresosCash.toFixed(2) }}</div>
                <div>• Gastos efectivo: -S/ {{ egresosCash.toFixed(2) }}</div>
              </div>
              <p class="text-lg font-bold text-emerald-700 tabular-nums">
                S/ {{ expectedFinalCash.toFixed(2) }}
              </p>
            </div>

            <div class="space-y-3">
              <template v-if="selectedCashOption === null">
                <button
                  @click="selectCashOption('expected')"
                  :disabled="closureData"
                  class="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-lg font-semibold py-3 px-4 rounded-lg border border-emerald-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✓ Correcto: S/ {{ expectedFinalCash.toFixed(2) }}
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
                    :disabled="closureData"
                    v-model.number="realFinalCash"
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
                    :disabled="closureData"
                  >
                    <Xmark class="w-4 h-4" />
                  </button>
                  <div
                    class="bg-emerald-200 text-emerald-800 text-lg font-semibold py-3 px-4 rounded-lg border border-emerald-300"
                  >
                    ✓ Correcto: S/ {{ expectedFinalCash.toFixed(2) }}
                  </div>
                </div>
              </template>

              <template v-else-if="selectedCashOption === 'custom'">
                <div class="relative space-y-2">
                  <button
                    class="absolute top-0 right-0 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors z-10"
                    @click="clearCashSelection"
                    :disabled="closureData"
                  >
                    <Xmark class="w-4 h-4" />
                  </button>
                  <label
                    for="real-cash-input-selected"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Cantidad final real:
                  </label>
                  <input
                    id="real-cash-input-selected"
                    type="number"
                    inputmode="decimal"
                    pattern="[0-9]*"
                    step="0.01"
                    :disabled="closureData"
                    v-model.number="realFinalCash"
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
              <h4 class="text-lg font-semibold text-purple-800">
                Digital Final
              </h4>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-2">
                Balance esperado (calculado):
              </p>
              <div class="text-sm text-gray-600 space-y-1 mb-2">
                <div>
                  • Inicial: S/
                  {{ (openingData.realBankBalance || 0).toFixed(2) }}
                </div>
                <div>• Ventas digital: +S/ {{ ingresosBank.toFixed(2) }}</div>
                <div>• Gastos digital: -S/ {{ egresosBank.toFixed(2) }}</div>
              </div>
              <p class="text-lg font-bold text-purple-700 tabular-nums">
                S/ {{ expectedFinalBank.toFixed(2) }}
              </p>
            </div>

            <div class="space-y-3">
              <template v-if="selectedBankOption === null">
                <button
                  @click="selectBankOption('expected')"
                  :disabled="closureData"
                  class="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 text-lg font-semibold py-3 px-4 rounded-lg border border-purple-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✓ Correcto: S/ {{ expectedFinalBank.toFixed(2) }}
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
                    :disabled="closureData"
                    v-model.number="realFinalBank"
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
                    :disabled="closureData"
                  >
                    <Xmark class="w-4 h-4" />
                  </button>
                  <div
                    class="bg-purple-200 text-purple-800 text-lg font-semibold py-3 px-4 rounded-lg border border-purple-300"
                  >
                    ✓ Correcto: S/ {{ expectedFinalBank.toFixed(2) }}
                  </div>
                </div>
              </template>

              <template v-else-if="selectedBankOption === 'custom'">
                <div class="relative space-y-2">
                  <button
                    class="absolute top-0 right-0 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors z-10"
                    @click="clearBankSelection"
                    :disabled="closureData"
                  >
                    <Xmark class="w-4 h-4" />
                  </button>
                  <label
                    for="real-bank-input-selected"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Cantidad final real:
                  </label>
                  <input
                    id="real-bank-input-selected"
                    type="number"
                    inputmode="decimal"
                    pattern="[0-9]*"
                    step="0.01"
                    :disabled="closureData"
                    v-model.number="realFinalBank"
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
        v-if="hasDifferences && !closureData && openingData"
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
          Se detectaron diferencias. Al realizar el cierre se crearán
          automáticamente transacciones de ajuste para balancear las cuentas.
        </p>
      </div>

      <!-- Botón de acción final -->
      <div v-if="openingData" class="pt-4 border-t border-gray-200">
        <router-link
          v-if="closureData"
          :to="{
            name: 'BusinessDashboard',
            params: { businessId: currentBusinessId },
          }"
          class="block w-full bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold text-center py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
        >
          ✅ Cierre Completado - Ver Dashboard
        </router-link>

        <button
          v-else
          @click="performClosure"
          :disabled="!canPerformClosure"
          class="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white text-lg font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
        >
          {{
            canPerformClosure
              ? "🔒 Realizar Cierre de Caja"
              : "⏳ Selecciona los balances para continuar"
          }}
        </button>
      </div>

      <!-- Mensaje de error si no hay apertura -->
      <div
        v-else
        class="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
      >
        <div class="flex items-center justify-center gap-2 mb-2">
          <svg
            class="w-5 h-5 text-red-600"
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
          <p class="text-lg font-semibold text-red-800">
            No se puede realizar el cierre
          </p>
        </div>
        <p class="text-sm text-red-700 mb-4">
          Primero debes realizar la apertura de caja para poder hacer el cierre.
        </p>
        <router-link
          :to="{
            name: 'BusinessDashboard',
            params: { businessId: currentBusinessId },
          }"
          class="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Volver al Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Coins,
  SmartphoneDevice,
  Safe,
  Xmark,
  Cash,
  GraphUp,
  DatabaseExport,
} from "@iconoir/vue";
import { ref, computed, nextTick, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { generateUUID } from "@/utils/generateUUID";
import { ensureBusinessId } from "@/composables/useBusinessUtils";

const transactionStore = useTransactionStore();
const accountsBalanceStore = useAccountsBalanceStore();

// Estados reactivos
const openingData = ref(null);
const closureData = ref(null);
const selectedCashOption = ref(null);
const selectedBankOption = ref(null);
const realFinalCash = ref(0);
const realFinalBank = ref(0);

// Business ID para la redirección
const currentBusinessId = computed(() => {
  return ensureBusinessId();
});

// Configurar el store de balance cuando tengamos datos
const setupBalanceStore = () => {
  if (!openingData.value) return;

  const openingTime = openingData.value.createdAt?.seconds || 0;

  // Filtrar solo transacciones después de la apertura (excluyendo ajustes automáticos)
  const dayTransactions = transactionStore.transactionsInStore.value.filter(
    (tx) => {
      const txTime = tx.createdAt?.seconds || 0;
      return (
        txTime > openingTime &&
        ["income", "expense"].includes(tx.type) &&
        !tx.isSystemGenerated
      );
    }
  );

  // Configurar el store con las transacciones del día y la apertura
  accountsBalanceStore.setTransactions(dayTransactions);
  accountsBalanceStore.setOpening(openingData.value);
};

// Usar los cálculos del store de balance en lugar de computed locales
const totalIngresos = computed(() => accountsBalanceStore.totalIngresos);
const totalEgresos = computed(() => accountsBalanceStore.totalEgresos);
const ingresosCash = computed(() => accountsBalanceStore.ingresosCash);
const ingresosBank = computed(() => accountsBalanceStore.ingresosBank);
const egresosCash = computed(() => accountsBalanceStore.egresosCash);
const egresosBank = computed(() => accountsBalanceStore.egresosBank);
const expectedFinalCash = computed(
  () => accountsBalanceStore.expectedFinalCash
);
const expectedFinalBank = computed(
  () => accountsBalanceStore.expectedFinalBank
);

// Diferencias calculadas usando las utilidades del store
const cashDifference = computed(() => {
  if (selectedCashOption.value === null) return 0;
  const real =
    selectedCashOption.value === "expected"
      ? expectedFinalCash.value
      : realFinalCash.value;
  return accountsBalanceStore.calculateDifference(
    real,
    expectedFinalCash.value
  );
});

const bankDifference = computed(() => {
  if (selectedBankOption.value === null) return 0;
  const real =
    selectedBankOption.value === "expected"
      ? expectedFinalBank.value
      : realFinalBank.value;
  return accountsBalanceStore.calculateDifference(
    real,
    expectedFinalBank.value
  );
});

// Verificar si hay diferencias usando la utilidad del store
const hasDifferences = computed(() => {
  return (
    accountsBalanceStore.isSignificantDifference(cashDifference.value) ||
    accountsBalanceStore.isSignificantDifference(bankDifference.value)
  );
});

// Verificar si se puede realizar el cierre
const canPerformClosure = computed(() => {
  return selectedCashOption.value !== null && selectedBankOption.value !== null;
});

// Inicialización
onMounted(async () => {
  await findTodayOpening();
});

// Buscar la apertura del día
const findTodayOpening = async () => {
  try {
    // Solo cargar las transacciones del día si no hay transacciones en el store
    if (transactionStore.transactionsInStore.value.length === 0) {
      await transactionStore.getTransactionsToday();
    }

    // Buscar la transacción de apertura del día
    const opening = transactionStore.transactionsInStore.value.find(
      (tx) => tx.type === "opening"
    );

    if (opening) {
      openingData.value = opening;
      console.log("📊 Apertura del día encontrada:", opening);

      // Configurar el store de balance una vez que tenemos la apertura
      setupBalanceStore();
    } else {
      console.warn("⚠️ No se encontró apertura del día");
    }
  } catch (error) {
    console.error("❌ Error buscando apertura del día:", error);
  }
};

// Manejadores de efectivo
const selectCashOption = (option) => {
  if (closureData.value) return;
  selectedCashOption.value = option;
  if (option === "expected") {
    realFinalCash.value = expectedFinalCash.value;
  }
};

const clearCashSelection = () => {
  if (closureData.value) return;
  selectedCashOption.value = null;
  realFinalCash.value = 0;
};

const onBlurCashInput = (e) => {
  if (closureData.value) return;
  nextTick(() => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      selectedCashOption.value = "custom";
      realFinalCash.value = value;
    }
  });
};

// Manejadores de banco
const selectBankOption = (option) => {
  if (closureData.value) return;
  selectedBankOption.value = option;
  if (option === "expected") {
    realFinalBank.value = expectedFinalBank.value;
  }
};

const clearBankSelection = () => {
  if (closureData.value) return;
  selectedBankOption.value = null;
  realFinalBank.value = 0;
};

const onBlurBankInput = (e) => {
  if (closureData.value) return;
  nextTick(() => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      selectedBankOption.value = "custom";
      realFinalBank.value = value;
    }
  });
};

// Realizar cierre
const performClosure = async () => {
  try {
    console.log("🔒 Iniciando cierre de caja...");

    // Usar el resumen financiero del store para crear la transacción de cierre
    const financialSummary = accountsBalanceStore.financialSummary;

    // Crear transacción de cierre principal
    const closureTransaction = {
      uuid: generateUUID(),
      type: "closure",
      description: "Cierre de caja",
      // Datos de apertura de referencia
      openingReference: openingData.value.uuid,
      initialCashBalance: financialSummary.saldoInicialCash,
      initialBankBalance: financialSummary.saldoInicialBank,
      // Movimientos del día (desde el store)
      totalIngresos: financialSummary.totalIngresos,
      totalEgresos: financialSummary.totalEgresos,
      ingresosCash: financialSummary.ingresosCash,
      ingresosBank: financialSummary.ingresosBank,
      egresosCash: financialSummary.egresosCash,
      egresosBank: financialSummary.egresosBank,
      // Balances esperados vs reales
      expectedCashBalance: financialSummary.expectedFinalCash,
      expectedBankBalance: financialSummary.expectedFinalBank,
      realCashBalance:
        selectedCashOption.value === "expected"
          ? financialSummary.expectedFinalCash
          : realFinalCash.value,
      realBankBalance:
        selectedBankOption.value === "expected"
          ? financialSummary.expectedFinalBank
          : realFinalBank.value,
      // Diferencias
      cashDifference: cashDifference.value,
      bankDifference: bankDifference.value,
      // Campos requeridos
      items: [],
      itemsAndStockLogs: [],
      amount: 0,
    };

    // Agregar la transacción de cierre al store y crear en Firebase
    transactionStore.transactionToAdd.value = closureTransaction;
    await transactionStore.addTransaction();

    console.log("✅ Transacción de cierre creada");

    // Crear transacciones de ajuste si hay diferencias
    if (hasDifferences.value) {
      await createClosureAdjustmentTransactions();
    }

    closureData.value = closureTransaction;
    console.log("✅ Cierre completado exitosamente");
  } catch (error) {
    console.error("❌ Error en el cierre:", error);
    alert("Error al realizar el cierre. Por favor, intenta nuevamente.");
  }
};

// Crear transacciones de ajuste para el cierre usando las utilidades del store
const createClosureAdjustmentTransactions = async () => {
  try {
    // Ajuste de efectivo
    if (accountsBalanceStore.isSignificantDifference(cashDifference.value)) {
      const cashAdjustment = {
        uuid: generateUUID(),
        type: cashDifference.value > 0 ? "income" : "expense",
        account: "cash",
        description: `Ajuste de cierre - Efectivo (${
          cashDifference.value > 0 ? "Sobrante" : "Faltante"
        })`,
        amount: Math.abs(cashDifference.value),
        category: "adjustment",
        subcategory: "closure_adjustment",
        isSystemGenerated: true,
        items: [],
        itemsAndStockLogs: [],
      };

      transactionStore.transactionToAdd.value = cashAdjustment;
      await transactionStore.addTransaction();
      console.log(
        "✅ Ajuste de efectivo (cierre) creado:",
        cashAdjustment.amount
      );
    }

    // Ajuste de banco
    if (accountsBalanceStore.isSignificantDifference(bankDifference.value)) {
      const bankAdjustment = {
        uuid: generateUUID(),
        type: bankDifference.value > 0 ? "income" : "expense",
        account: "bank",
        description: `Ajuste de cierre - Digital (${
          bankDifference.value > 0 ? "Sobrante" : "Faltante"
        })`,
        amount: Math.abs(bankDifference.value),
        category: "adjustment",
        subcategory: "closure_adjustment",
        isSystemGenerated: true,
        items: [],
        itemsAndStockLogs: [],
      };

      transactionStore.transactionToAdd.value = bankAdjustment;
      await transactionStore.addTransaction();
      console.log("✅ Ajuste de banco (cierre) creado:", bankAdjustment.amount);
    }
  } catch (error) {
    console.error("❌ Error creando transacciones de ajuste de cierre:", error);
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

  .hover\:bg-purple-600:hover {
    background-color: rgb(147 51 234);
  }

  .hover\:bg-purple-700:hover {
    background-color: rgb(126 34 206);
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

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid.lg\:grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .grid.lg\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
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

  .grid.lg\:grid-cols-4 {
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

/* Smooth transform para botones */
.transform {
  transition: transform 0.2s ease-in-out;
}

.hover\:scale-\[1\.02\]:hover {
  transform: scale(1.02);
}
</style>
