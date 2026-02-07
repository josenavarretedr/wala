<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Detalles del Gasto
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        {{
          transactionStore.transactionToAdd.value.category === "materials"
            ? "Registra los materiales o insumos comprados"
            : "Describe qué necesitó el negocio y cuánto costó"
        }}
      </p>
    </div>

    <!-- ========================================== -->
    <!-- FLUJO PARA MATERIALS (Compra de Materiales) -->
    <!-- ========================================== -->
    <div
      v-if="transactionStore.transactionToAdd.value.category === 'materials'"
      class="space-y-6"
    >
      <!-- Buscador de materiales/productos -->
      <div
        class="space-y-4"
        v-if="!transactionStore.itemToAddInExpenseMaterial.value.description"
      >
        <h2 class="text-lg font-semibold text-gray-800">
          Buscar
          <span
            v-if="
              !transactionStore.transactionToAdd.value.materialItems ||
              transactionStore.transactionToAdd.value.materialItems.length === 0
            "
            >material o insumo</span
          >
          <span v-else>otros materiales</span>
        </h2>
        <Suspense>
          <template #default>
            <SearchProductForExpenseAsync />
          </template>
          <template #fallback>
            <div class="flex items-center justify-center py-6">
              <div class="text-center">
                <div
                  class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"
                ></div>
                <p class="text-sm text-gray-500 mt-2">Cargando productos...</p>
              </div>
            </div>
          </template>
        </Suspense>
      </div>

      <!-- Material seleccionado -->
      <div
        class="space-y-3"
        v-if="transactionStore.itemToAddInExpenseMaterial.value.description"
      >
        <label class="text-lg font-semibold text-gray-800"
          >Material Seleccionado</label
        >
        <div class="relative">
          <!-- Badge de estado -->
          <Transition name="badge">
            <div
              v-if="
                transactionStore.itemToAddInExpenseMaterial.value
                  .oldOrNewProduct
              "
              class="absolute -top-2 -right-2 px-2 py-1 rounded-lg text-xs font-medium shadow-sm z-10"
              :class="{
                'bg-blue-50 text-blue-700 border border-blue-200':
                  transactionStore.itemToAddInExpenseMaterial.value
                    .oldOrNewProduct === 'old',
                'bg-green-50 text-green-700 border border-green-200':
                  transactionStore.itemToAddInExpenseMaterial.value
                    .oldOrNewProduct === 'new',
              }"
            >
              {{
                transactionStore.itemToAddInExpenseMaterial.value
                  .oldOrNewProduct === "old"
                  ? "Existente"
                  : "Nuevo"
              }}
            </div>
          </Transition>

          <input
            v-model="
              transactionStore.itemToAddInExpenseMaterial.value.description
            "
            type="text"
            disabled
            placeholder="Selecciona un material arriba"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-500 transition-all duration-200"
          />

          <Transition name="fade-scale">
            <button
              v-if="
                transactionStore.itemToAddInExpenseMaterial.value.description
              "
              @click="handleResetMaterial"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
            >
              <Xmark class="w-4 h-4" />
            </button>
          </Transition>
        </div>
      </div>

      <!-- Formulario: Cantidad, Unidad y Costo -->
      <Transition name="slide-fade">
        <div
          v-if="transactionStore.itemToAddInExpenseMaterial.value.description"
        >
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Cantidad -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Cantidad</label>
              <div class="relative">
                <input
                  ref="quantityInputMaterial"
                  v-model="
                    transactionStore.itemToAddInExpenseMaterial.value.quantity
                  "
                  type="number"
                  placeholder="0"
                  min="0"
                  @keydown.enter="focusCostInput"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-medium focus:border-orange-500 focus:outline-none transition-colors"
                />
                <div
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"
                ></div>
              </div>
              <p class="text-xs text-gray-500">Ingresa la cantidad comprada</p>
            </div>

            <!-- Unidad -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Unidad</label>
              <select
                v-model="transactionStore.itemToAddInExpenseMaterial.value.unit"
                :disabled="
                  transactionStore.itemToAddInExpenseMaterial.value
                    .oldOrNewProduct === 'old'
                "
                class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-50 disabled:bg-gray-50"
              >
                <option value="uni">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="g">Gramo</option>
                <option value="lt">Litro</option>
                <option value="ml">Mililitro</option>
                <option value="m">Metro</option>
                <option value="cm">Porción</option>
                <option value="service">Servicio</option>
              </select>
            </div>

            <!-- Costo por unidad -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700"
                >Costo (S/)</label
              >
              <div class="relative">
                <input
                  ref="costInputMaterial"
                  v-model="
                    transactionStore.itemToAddInExpenseMaterial.value.cost
                  "
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  @keydown.enter="handleAddMaterialOnEnter"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-medium focus:border-orange-500 focus:outline-none transition-colors"
                />
                <div
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"
                ></div>
              </div>
              <p class="text-xs text-gray-500">Costo por unidad</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Botón Agregar Material -->
      <button
        @click="handleAddMaterial"
        :disabled="!canAddMaterial"
        class="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <KeyframePlus class="w-5 h-5" />
        Agregar Material
      </button>

      <!-- Indicador de saldo disponible -->
      <div
        v-if="transactionStore.itemToAddInExpenseMaterial.value.description"
        class="p-4 rounded-xl border"
        :class="{
          'bg-green-50 border-green-200': !wouldExceedBalance,
          'bg-red-50 border-red-200': wouldExceedBalance,
        }"
      >
        <div class="flex items-start gap-3">
          <!-- Icono -->
          <div
            class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            :class="{
              'bg-green-100': !wouldExceedBalance,
              'bg-red-100': wouldExceedBalance,
            }"
          >
            <span
              class="text-xl"
              :class="{
                'text-green-600': !wouldExceedBalance,
                'text-red-600': wouldExceedBalance,
              }"
            >
              {{ wouldExceedBalance ? "⚠️" : "💰" }}
            </span>
          </div>

          <!-- Contenido -->
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-semibold mb-1"
              :class="{
                'text-green-800': !wouldExceedBalance,
                'text-red-800': wouldExceedBalance,
              }"
            >
              {{
                wouldExceedBalance ? "Saldo insuficiente" : "Saldo disponible"
              }}
            </p>

            <div class="space-y-1">
              <!-- Saldo actual -->
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600"
                  >Saldo en {{ selectedAccountLabel }}:</span
                >
                <span class="font-semibold text-gray-900">
                  S/ {{ maxAmount.toFixed(2) }}
                </span>
              </div>

              <!-- Total ya agregado -->
              <div
                v-if="getMaterialsTotal() > 0"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-600">Total agregado:</span>
                <span class="font-semibold text-gray-900">
                  S/ {{ getMaterialsTotal().toFixed(2) }}
                </span>
              </div>

              <!-- Costo del item actual -->
              <div
                v-if="getCurrentItemTotal() > 0"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-600">Este material:</span>
                <span class="font-semibold text-orange-600">
                  S/ {{ getCurrentItemTotal().toFixed(2) }}
                </span>
              </div>

              <!-- Divider -->
              <div
                v-if="getMaterialsTotal() > 0 || getCurrentItemTotal() > 0"
                class="border-t border-gray-200 pt-1 mt-1"
              ></div>

              <!-- Total general -->
              <div class="flex items-center justify-between text-sm">
                <span class="font-semibold text-gray-700">Total después:</span>
                <span
                  class="font-bold text-base"
                  :class="{
                    'text-green-600': !wouldExceedBalance,
                    'text-red-600': wouldExceedBalance,
                  }"
                >
                  S/
                  {{ (getMaterialsTotal() + getCurrentItemTotal()).toFixed(2) }}
                </span>
              </div>

              <!-- Saldo restante -->
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Saldo restante:</span>
                <span
                  class="font-semibold"
                  :class="{
                    'text-green-600': !wouldExceedBalance,
                    'text-red-600': wouldExceedBalance,
                  }"
                >
                  S/
                  {{
                    Math.max(
                      0,
                      maxAmount - getMaterialsTotal() - getCurrentItemTotal(),
                    ).toFixed(2)
                  }}
                </span>
              </div>
            </div>

            <!-- Mensaje de advertencia -->
            <p
              v-if="wouldExceedBalance"
              class="mt-2 text-xs text-red-700 font-medium"
            >
              ⚠️ No tienes saldo suficiente para esta compra. Solo puedes
              agregar hasta S/
              {{ Math.max(0, maxAmount - getMaterialsTotal()).toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Lista de materiales agregados -->
      <div
        class="space-y-4"
        v-if="
          transactionStore.transactionToAdd.value.materialItems &&
          transactionStore.transactionToAdd.value.materialItems.length > 0
        "
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">
            Materiales Agregados
          </h3>
          <Transition name="fade-scale">
            <div
              v-if="
                transactionStore.transactionToAdd.value.materialItems &&
                transactionStore.transactionToAdd.value.materialItems.length > 0
              "
              class="text-sm text-gray-500"
            >
              {{ transactionStore.transactionToAdd.value.materialItems.length }}
              material{{
                transactionStore.transactionToAdd.value.materialItems.length > 1
                  ? "es"
                  : ""
              }}
            </div>
          </Transition>
        </div>

        <!-- Lista de items -->
        <TransitionGroup name="list" tag="div" class="space-y-3">
          <template
            v-if="
              transactionStore.transactionToAdd.value.materialItems &&
              transactionStore.transactionToAdd.value.materialItems.length > 0
            "
          >
            <div
              v-for="material in transactionStore.transactionToAdd.value
                .materialItems"
              :key="material.uuid"
              class="bg-white rounded-xl p-4 border border-gray-200 hover:border-orange-300 transition-all duration-200"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="font-semibold text-gray-900 truncate">
                      {{ material.description }}
                    </h4>
                    <span
                      v-if="material.oldOrNewProduct === 'new'"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex-shrink-0"
                    >
                      Nuevo
                    </span>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span
                      >{{ material.quantity }}
                      {{ material.unit || "uni" }}</span
                    >
                    <span>•</span>
                    <span
                      >S/ {{ material.cost?.toFixed(2) || "0.00" }}/uni</span
                    >
                    <span>•</span>
                    <span class="font-semibold text-gray-900"
                      >Total: S/
                      {{
                        (
                          (material.cost || 0) * (material.quantity || 0)
                        ).toFixed(2)
                      }}</span
                    >
                  </div>
                </div>
                <button
                  @click="
                    transactionStore.removeMaterialItemFromExpense(
                      material.uuid,
                    )
                  "
                  class="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Xmark class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Total -->
            <div
              key="total-materials"
              class="bg-orange-50 rounded-xl p-4 border border-orange-200"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Package class="w-5 h-5 text-orange-600" />
                  <span class="font-semibold text-gray-800">
                    Total de Compra
                  </span>
                </div>
                <span class="text-xl font-bold text-orange-600">
                  S/ {{ getMaterialsTotal().toFixed(2) }}
                </span>
              </div>
              <p class="text-xs text-gray-600 mt-2">
                Saldo disponible: S/ {{ maxAmount.toFixed(2) }}
              </p>
            </div>
          </template>

          <!-- Estado vacío -->
          <div v-else key="empty-state" class="text-center py-8">
            <div
              class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <Package class="w-6 h-6 text-gray-400" />
            </div>
            <h3 class="font-semibold text-gray-600 mb-1">
              No hay materiales agregados
            </h3>
            <p class="text-sm text-gray-500">
              Busca y agrega materiales para registrar la compra
            </p>
          </div>
        </TransitionGroup>
      </div>

      <!-- Campo de notas para materials -->
      <div
        class="space-y-3"
        v-if="
          transactionStore.transactionToAdd.value.materialItems &&
          transactionStore.transactionToAdd.value.materialItems.length > 0
        "
      >
        <label class="text-lg font-semibold text-gray-800"
          >Notas (opcional)</label
        >
        <textarea
          v-model="transactionStore.transactionToAdd.value.notes"
          placeholder="Agregar observaciones sobre esta compra de materiales..."
          rows="3"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors resize-none"
        ></textarea>
        <p class="text-xs text-gray-500">
          Puedes agregar detalles adicionales sobre esta compra
        </p>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- FLUJO PARA LABOR/OVERHEAD (Gastos Simples) -->
    <!-- ========================================== -->
    <div v-else class="space-y-6">
      <!-- Campo de búsqueda de gasto -->
      <div class="space-y-3">
        <label class="text-lg font-semibold text-gray-800">
          Descripción del Gasto
        </label>

        <!-- Componente de búsqueda asíncrona -->
        <SearchExpenseAsync
          :category="transactionStore.transactionToAdd.value.category"
          @update:expenseToAdd="handleExpenseSelected"
        />

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
            Saldo disponible en {{ selectedAccountLabel }}: S/
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

      <!-- Campo de notas -->
      <div class="space-y-3">
        <label class="text-lg font-semibold text-gray-800"
          >Notas (opcional)</label
        >
        <textarea
          v-model="transactionStore.transactionToAdd.value.notes"
          placeholder="Agregar observaciones sobre este gasto..."
          rows="3"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors resize-none"
        ></textarea>
        <p class="text-xs text-gray-500">
          Puedes agregar detalles adicionales sobre este gasto
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useExpensesStore } from "@/stores/expensesStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { Package, Xmark, KeyframePlus } from "@iconoir/vue";
import { ref, computed, watch, onMounted } from "vue";
import SearchExpenseAsync from "./SearchExpenseAsync.vue";
import SearchProductForExpenseAsync from "./SearchProductForExpenseAsync.vue";

// ========================================
// ESTADO LOCAL
// ========================================

// Para labor/overhead (gastos simples)
const description = ref("");
const amount = ref(null);
const selectedCategory = ref(null);
const expenseType = ref(null); // 'new' o 'old'
const selectedExpenseId = ref(null);
const selectedExpenseMetadata = ref(null);

// Referencias para inputs de materials
const quantityInputMaterial = ref(null);
const costInputMaterial = ref(null);

// ========================================
// STORES
// ========================================
const expensesStore = useExpensesStore();
const transactionStore = useTransactionStore();
const flow = useTransactionFlowStore();
const accountsBalanceStore = useAccountsBalanceStore();

// ========================================
// SALDOS ACTUALES DESDE ACCOUNTSBALANCESTORE
// ========================================

// Obtener saldos actuales directamente del store (que usa dailySummary)
const saldoActualCash = computed(() => accountsBalanceStore.saldoActualCash);
const saldoActualBank = computed(() => accountsBalanceStore.saldoActualBank);

// 🔄 Watch para detectar cambios en transacciones y recargar automáticamente
watch(
  () => accountsBalanceStore.transactions,
  async (newTransactions) => {
    if (newTransactions && newTransactions.length > 0) {
      console.log(
        "🔄 StepAddExpenseDetails - Detectados cambios en transacciones, recargando saldos...",
      );
      // Recargar dailySummary para obtener saldos actualizados
      await accountsBalanceStore.loadFromDailySummary();
    }
  },
  { deep: true },
);

// ========================================
// HANDLERS PARA LABOR/OVERHEAD
// ========================================

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

// ========================================
// HANDLERS PARA MATERIALS
// ========================================

/**
 * Computed: Determina si se puede agregar el material
 */
const canAddMaterial = computed(() => {
  const material = transactionStore.itemToAddInExpenseMaterial.value;

  // Validaciones básicas
  if (
    !material.description ||
    !material.quantity ||
    !material.cost ||
    !material.unit
  ) {
    return false;
  }

  // Validar que el total no exceda el saldo disponible
  const currentTotal = getMaterialsTotal();
  const newItemTotal = (material.cost || 0) * (material.quantity || 0);
  const wouldExceedBalance = currentTotal + newItemTotal > maxAmount.value;

  return !wouldExceedBalance;
});

/**
 * Maneja el agregado del material
 */
const handleAddMaterial = () => {
  transactionStore.addMaterialItemToExpense();
};

/**
 * Maneja el reset del material seleccionado
 */
const handleResetMaterial = () => {
  transactionStore.resetItemToAddInExpenseMaterial();
};

/**
 * Enfoca el input de costo cuando se presiona Enter en cantidad
 */
const focusCostInput = () => {
  if (costInputMaterial.value) {
    costInputMaterial.value.focus();
  }
};

/**
 * Maneja el Enter en el input de costo
 */
const handleAddMaterialOnEnter = () => {
  if (canAddMaterial.value) {
    handleAddMaterial();
  }
};

/**
 * Calcula el total de materiales agregados
 */
const getMaterialsTotal = () => {
  if (!transactionStore.transactionToAdd.value.materialItems) {
    return 0;
  }

  return transactionStore.transactionToAdd.value.materialItems.reduce(
    (sum, material) => {
      return sum + (material.cost || 0) * (material.quantity || 0);
    },
    0,
  );
};

/**
 * Calcula el total del material actual (no agregado aún)
 */
const getCurrentItemTotal = () => {
  const material = transactionStore.itemToAddInExpenseMaterial.value;

  if (!material.cost || !material.quantity) {
    return 0;
  }

  return (material.cost || 0) * (material.quantity || 0);
};

/**
 * Computed: Verifica si el total excedería el saldo disponible
 */
const wouldExceedBalance = computed(() => {
  const currentTotal = getMaterialsTotal();
  const newItemTotal = getCurrentItemTotal();
  return currentTotal + newItemTotal > maxAmount.value;
});

// ========================================
// CÁLCULO DE SALDO DISPONIBLE
// ========================================

// Cargar transacciones del día y saldos al montar el componente
onMounted(async () => {
  console.log("🔄 StepAddExpenseDetails - Montando componente...");

  // Cargar transacciones del día en transactionStore
  await transactionStore.getTransactionsToday();

  // Cargar transacciones en accountsBalanceStore y obtener saldos actuales
  const transactions = transactionStore.transactionsInStore.value || [];
  accountsBalanceStore.setTransactions(transactions);

  // Intentar cargar desde dailySummary para obtener saldos pre-calculados
  await accountsBalanceStore.loadFromDailySummary();

  console.log("✅ Saldos cargados:", {
    cash: saldoActualCash.value,
    bank: saldoActualBank.value,
  });
});

// Calcular el monto máximo disponible basado en la cuenta seleccionada
const maxAmount = computed(() => {
  const selectedAccount = transactionStore.transactionToAdd.value.account;

  if (selectedAccount === "cash") {
    return Math.max(0, saldoActualCash.value);
  } else if (selectedAccount === "bank") {
    return Math.max(0, saldoActualBank.value);
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

// ========================================
// VALIDACIONES Y WATCHERS
// ========================================

// Observar cambios y actualizar los stores correspondientes
watch(selectedCategory, (newCategory) => {
  transactionStore.setExpenseCategory(newCategory);
});

// Computed para verificar si todos los campos están completos (labor/overhead)
const isFormValid = computed(() => {
  // Si es materials, validar que haya items agregados
  if (transactionStore.transactionToAdd.value.category === "materials") {
    const hasMaterials =
      transactionStore.transactionToAdd.value.materialItems &&
      transactionStore.transactionToAdd.value.materialItems.length > 0;

    const totalIsValid =
      getMaterialsTotal() <= maxAmount.value && getMaterialsTotal() > 0;

    return hasMaterials && totalIsValid;
  }

  // Si es labor/overhead, validar campos simples
  return (
    description.value &&
    description.value.trim() !== "" &&
    amount.value &&
    amount.value > 0 &&
    amount.value <= maxAmount.value && // No puede exceder el saldo disponible
    selectedCategory.value
  );
});

// Watch para actualizar el amount en transactionToAdd cuando cambia el total de materials
watch(
  () => getMaterialsTotal(),
  (newTotal) => {
    if (transactionStore.transactionToAdd.value.category === "materials") {
      transactionStore.setExpenseAmount(newTotal);
    }
  },
);

// Validar que el monto no exceda el máximo disponible (labor/overhead)
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
    transactionStore.transactionToAdd.value.account,
  );

  flow.nextStep();
};
</script>

<style scoped>
/* Prevent zoom on iOS inputs */
@media screen and (max-width: 480px) {
  input[type="number"],
  input[type="text"],
  select {
    font-size: 16px;
  }
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* ===== TRANSICIONES SUTILES ===== */

/* Transición Badge (aparece/desaparece con escala) */
.badge-enter-active,
.badge-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.badge-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(4px);
}

.badge-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-4px);
}

/* Transición Fade + Scale (botón X, contador) */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* Transición Slide + Fade (sección de cantidad/costo) */
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* TransitionGroup para lista de materiales */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(0.95);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

/* Asegurar que los elementos que salen no afecten el layout */
.list-leave-active {
  position: absolute;
  width: 100%;
}

/* Hover effects mejorados */
button:not(:disabled) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:not(:disabled):hover {
  transform: translateY(-1px);
}

button:not(:disabled):active {
  transform: translateY(0);
}

/* Focus states mejorados */
input:focus,
select:focus {
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}
</style>
