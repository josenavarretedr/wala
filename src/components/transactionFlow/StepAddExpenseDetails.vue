<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Detalles del Gasto
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Describe qué necesitó el negocio y cuánto costó
      </p>
    </div>

    <!-- Formulario de gasto -->
    <div class="space-y-6">
      <!-- Campo de búsqueda de gasto -->
      <div class="space-y-3">
        <label class="text-lg font-semibold text-gray-800">
          Descripción del Gasto
        </label>

        <!-- Componente de búsqueda asíncrona -->
        <SearchExpenseAsync @update:expenseToAdd="handleExpenseSelected" />

        <!-- Mostrar gasto seleccionado -->
        <div
          v-if="description"
          class="p-4 bg-gray-50 border border-gray-200 rounded-xl"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-semibold text-gray-900 truncate">
                  {{ description }}
                </span>
                <span
                  v-if="expenseType === 'new'"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  Nuevo
                </span>
                <span
                  v-else-if="selectedExpenseMetadata"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                >
                  Recurrente
                </span>
              </div>

              <!-- Metadata para gastos existentes -->
              <!-- <div
                v-if="selectedExpenseMetadata && expenseType === 'old'"
                class="text-xs text-gray-600 space-y-0.5"
              >
                <p>
                  💰 Total gastado: S/
                  {{ selectedExpenseMetadata.totalSpent?.toFixed(2) || "0.00" }}
                </p>
                <p>
                  📊 Usado {{ selectedExpenseMetadata.occurrences || 0 }}
                  {{
                    selectedExpenseMetadata.occurrences === 1 ? "vez" : "veces"
                  }}
                </p>
              </div> -->
            </div>

            <!-- Botón para limpiar selección -->
            <button
              @click="clearExpenseSelection"
              class="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              title="Cambiar gasto"
            >
              <Xmark class="w-4 h-4" />
            </button>
          </div>
        </div>

        <p class="text-xs text-gray-500">
          Busca gastos anteriores o registra uno nuevo
        </p>
      </div>

      <!-- Campo de costo -->
      <div class="space-y-3">
        <label class="text-lg font-semibold text-gray-800">Monto (S/)</label>
        <div class="relative">
          <input
            v-model.number="amount"
            @keyup.enter="addExpenseHandler"
            type="number"
            step="0.01"
            :max="maxAmount"
            placeholder="0.00"
            class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-center font-medium text-gray-700 focus:border-red-500 focus:outline-none transition-colors"
          />
          <div
            class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"
          ></div>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-xs text-gray-500">Ingresa el monto total del gasto</p>
          <p v-if="maxAmount > 0" class="text-xs text-blue-600 font-medium">
            💰 Saldo disponible en {{ selectedAccountLabel }}: S/
            {{ maxAmount.toFixed(2) }}
          </p>
          <p
            v-else-if="transactionStore.transactionToAdd.value.account"
            class="text-xs text-amber-600 font-medium"
          >
            ⚠️ No hay saldo suficiente en {{ selectedAccountLabel }}
          </p>
        </div>
      </div>
    </div>

    <!-- Categorías de gastos -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-800">
        Categorías de Gastos Comunes
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Costos de materiales -->
        <div class="relative group">
          <button
            @click="selectExpenseCategory('materials')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3 shadow-sm hover:shadow-md border',
              selectedCategory === 'materials'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/25 border-orange-500'
                : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border-gray-200 hover:border-orange-200',
            ]"
          >
            <div
              :class="[
                'p-3 rounded-full transition-colors duration-200',
                selectedCategory === 'materials'
                  ? 'bg-white/20'
                  : 'bg-orange-100',
              ]"
            >
              <Package
                :class="[
                  'w-6 h-6 transition-colors duration-200',
                  selectedCategory === 'materials'
                    ? 'text-white'
                    : 'text-orange-500',
                ]"
              />
            </div>
            <div class="text-center">
              <span class="text-sm font-semibold block"
                >Costos de materiales</span
              >
              <span class="text-xs opacity-80">Insumos | Mercadería</span>
            </div>
          </button>

          <!-- Tooltip de ayuda -->
          <div
            class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div class="text-center">
              <strong>Ejemplos:</strong> Materias primas, productos terminados,
              insumos directos
            </div>
          </div>
        </div>

        <!-- Costos de personal -->
        <div class="relative group">
          <button
            @click="selectExpenseCategory('labor')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3 shadow-sm hover:shadow-md border',
              selectedCategory === 'labor'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25 border-green-500'
                : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border-gray-200 hover:border-green-200',
            ]"
          >
            <div
              :class="[
                'p-3 rounded-full transition-colors duration-200',
                selectedCategory === 'labor' ? 'bg-white/20' : 'bg-green-100',
              ]"
            >
              <User
                :class="[
                  'w-6 h-6 transition-colors duration-200',
                  selectedCategory === 'labor'
                    ? 'text-white'
                    : 'text-green-500',
                ]"
              />
            </div>
            <div class="text-center">
              <span class="text-sm font-semibold block"
                >Costos de personal</span
              >
              <span class="text-xs opacity-80">Sueldos y beneficios</span>
            </div>
          </button>

          <!-- Tooltip de ayuda -->
          <div
            class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div class="text-center">
              <strong>Ejemplos:</strong> Sueldos, jornal, día
            </div>
          </div>
        </div>

        <!-- Gastos indirectos -->
        <div class="relative group">
          <button
            @click="selectExpenseCategory('overhead')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3 shadow-sm hover:shadow-md border',
              selectedCategory === 'overhead'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25 border-blue-500'
                : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-gray-200 hover:border-blue-200',
            ]"
          >
            <div
              :class="[
                'p-3 rounded-full transition-colors duration-200',
                selectedCategory === 'overhead' ? 'bg-white/20' : 'bg-blue-100',
              ]"
            >
              <Settings
                :class="[
                  'w-6 h-6 transition-colors duration-200',
                  selectedCategory === 'overhead'
                    ? 'text-white'
                    : 'text-blue-500',
                ]"
              />
            </div>
            <div class="text-center">
              <span class="text-sm font-semibold block">Gastos indirectos</span>
              <span class="text-xs opacity-80">Servicios y overhead</span>
            </div>
          </button>

          <!-- Tooltip de ayuda -->
          <div
            class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div class="text-center">
              <strong>Ejemplos:</strong> Luz, agua, internet, alquiler,
              combustible
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Indicador de progreso del formulario -->
    <div v-if="description || amount || selectedCategory" class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-600">
        Progreso del formulario:
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Descripción -->
        <div
          :class="[
            'p-3 rounded-lg border flex items-center gap-2 text-sm',
            description && description.trim() !== ''
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-gray-50 border-gray-200 text-gray-500',
          ]"
        >
          <div
            :class="[
              'w-2 h-2 rounded-full',
              description && description.trim() !== ''
                ? 'bg-green-500'
                : 'bg-gray-300',
            ]"
          ></div>
          <span>Descripción</span>
        </div>

        <!-- Monto -->
        <div
          :class="[
            'p-3 rounded-lg border flex items-center gap-2 text-sm',
            amount && amount > 0
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-gray-50 border-gray-200 text-gray-500',
          ]"
        >
          <div
            :class="[
              'w-2 h-2 rounded-full',
              amount && amount > 0 ? 'bg-green-500' : 'bg-gray-300',
            ]"
          ></div>
          <span>Monto</span>
        </div>

        <!-- Categoría -->
        <div
          :class="[
            'p-3 rounded-lg border flex items-center gap-2 text-sm',
            selectedCategory
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-gray-50 border-gray-200 text-gray-500',
          ]"
        >
          <div
            :class="[
              'w-2 h-2 rounded-full',
              selectedCategory ? 'bg-green-500' : 'bg-gray-300',
            ]"
          ></div>
          <span>Categoría</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useExpensesStore } from "@/stores/expensesStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { Package, Settings, User, Xmark } from "@iconoir/vue";
import { ref, computed, watch, onMounted } from "vue";
import SearchExpenseAsync from "./SearchExpenseAsync.vue";

// Variables reactivas locales
const description = ref("");
const amount = ref(null);
const selectedCategory = ref(null);
const expenseType = ref(null); // 'new' o 'old'
const selectedExpenseId = ref(null);
const selectedExpenseMetadata = ref(null);

const expensesStore = useExpensesStore();
const transactionStore = useTransactionStore();
const flow = useTransactionFlowStore();

// Handler para cuando se selecciona un gasto
const handleExpenseSelected = (expenseData) => {
  description.value = expenseData.description;
  expenseType.value = expenseData.oldOrNewExpense;
  selectedExpenseId.value = expenseData.selectedExpenseId;

  if (expenseData.oldOrNewExpense === "old") {
    // Gasto existente
    selectedCategory.value = expenseData.category;
    selectedExpenseMetadata.value = expenseData.metadata;
  } else {
    // Gasto nuevo: resetear metadata y categoría
    selectedExpenseMetadata.value = null;
    selectedCategory.value = null;
  }

  // Actualizar stores
  transactionStore.setExpenseDescription(expenseData.description);
  transactionStore.transactionToAdd.value.expenseId =
    expenseData.selectedExpenseId;
  transactionStore.transactionToAdd.value.oldOrNewExpense =
    expenseData.oldOrNewExpense;

  if (expenseData.category) {
    transactionStore.setExpenseCategory(expenseData.category);
  }
};

// Función para limpiar la selección
const clearExpenseSelection = () => {
  description.value = "";
  amount.value = null;
  selectedCategory.value = null;
  expenseType.value = null;
  selectedExpenseId.value = null;
  selectedExpenseMetadata.value = null;

  transactionStore.setExpenseDescription("");
  transactionStore.setExpenseAmount(0);
  transactionStore.setExpenseCategory(null);
  transactionStore.transactionToAdd.value.expenseId = null;
  transactionStore.transactionToAdd.value.oldOrNewExpense = null;
};

// Cargar transacciones del día al montar el componente
onMounted(async () => {
  await transactionStore.getTransactionsToday();
});

// Computed para obtener las transacciones del día
const transactions = computed(
  () => transactionStore.transactionsInStore.value || []
);

// Buscar la apertura del día
const opening = computed(() =>
  transactions.value.find((tx) => tx.type === "opening")
);

// Calcular saldo inicial por cuenta
const saldoInicialCash = computed(() => {
  if (!opening.value) return 0;
  return opening.value.realCashBalance || 0;
});

const saldoInicialBank = computed(() => {
  if (!opening.value) return 0;
  return opening.value.realBankBalance || 0;
});

// Calcular movimientos del día por cuenta
const movimientosCash = computed(() => {
  const ingresos = transactions.value
    .filter(
      (tx) =>
        tx.type === "income" &&
        tx.account === "cash" &&
        tx.category !== "adjustment"
    )
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const egresos = transactions.value
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.account === "cash" &&
        tx.category !== "adjustment"
    )
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return ingresos - egresos;
});

const movimientosBank = computed(() => {
  const ingresos = transactions.value
    .filter(
      (tx) =>
        tx.type === "income" &&
        tx.account === "bank" &&
        tx.category !== "adjustment"
    )
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const egresos = transactions.value
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.account === "bank" &&
        tx.category !== "adjustment"
    )
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return ingresos - egresos;
});

// Calcular balance esperado por cuenta
const expectedFinalCash = computed(() => {
  return saldoInicialCash.value + movimientosCash.value;
});

const expectedFinalBank = computed(() => {
  return saldoInicialBank.value + movimientosBank.value;
});

// Calcular el monto máximo disponible basado en la cuenta seleccionada
const maxAmount = computed(() => {
  const selectedAccount = transactionStore.transactionToAdd.value.account;

  if (selectedAccount === "cash") {
    return Math.max(0, expectedFinalCash.value);
  } else if (selectedAccount === "bank") {
    return Math.max(0, expectedFinalBank.value);
  }

  return 0; // Si no hay cuenta seleccionada
});

// Etiqueta de la cuenta seleccionada
const selectedAccountLabel = computed(() => {
  const selectedAccount = transactionStore.transactionToAdd.value.account;
  const labels = {
    cash: "efectivo",
    bank: "digital/banco",
  };
  return labels[selectedAccount] || "cuenta";
});

// Observar cambios y actualizar los stores correspondientes
watch(selectedCategory, (newCategory) => {
  transactionStore.setExpenseCategory(newCategory);
});

//   Función para seleccionar categoría
const selectExpenseCategory = (category) => {
  selectedCategory.value = category;
};

// Función para obtener la etiqueta de la categoría
const getCategoryLabel = (category) => {
  const labels = {
    materials: "Costos de materiales",
    labor: "Costos de personal",
    overhead: "Gastos indirectos",
  };
  return labels[category] || category;
};

// Computed para verificar si todos los campos están completos
const isFormValid = computed(() => {
  return (
    description.value &&
    description.value.trim() !== "" &&
    amount.value &&
    amount.value > 0 &&
    amount.value <= maxAmount.value && // No puede exceder el saldo disponible
    selectedCategory.value
  );
});

// Validar que el monto no exceda el máximo disponible
watch(amount, (newAmount) => {
  if (newAmount && newAmount > maxAmount.value) {
    // Limitar automáticamente al máximo disponible
    amount.value = maxAmount.value;
  }
  transactionStore.setExpenseAmount(amount.value);
  expensesStore.modifyExpenseToAddCost(amount.value);
});

// Handler para procesar el gasto (ya no es necesario pues se maneja desde NavigationBtnBARB)
const addExpenseHandler = async () => {
  if (!isFormValid.value) {
    return;
  }

  // Configurar la cuenta en el expensesStore
  expensesStore.modifyExpenseToAddAccount(
    transactionStore.transactionToAdd.value.account
  );

  flow.nextStep();
};
</script>

<style scoped>
/* Prevent zoom on iOS inputs */
@media screen and (max-width: 480px) {
  input[type="number"],
  input[type="text"] {
    font-size: 16px;
  }
}
</style>
