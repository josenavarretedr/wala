<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Agregar Productos
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Selecciona productos y define cantidades para tu transacción
      </p>
    </div>

    <!-- Buscador de productos -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-800">Buscar Producto</h2>
      <Suspense>
        <template #default>
          <SearchProductAsync />
        </template>
        <template #fallback>
          <div class="flex items-center justify-center py-6">
            <div class="text-center">
              <div
                class="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
              ></div>
              <p class="text-gray-500 text-sm">Cargando productos...</p>
            </div>
          </div>
        </template>
      </Suspense>
    </div>

    <!-- Producto seleccionado -->
    <div
      class="space-y-3"
      v-if="transactionStore.itemToAddInTransaction.value.description"
    >
      <label class="text-lg font-semibold text-gray-800"
        >Producto Seleccionado</label
      >
      <div class="relative">
        <!-- Badge de estado con transición -->
        <Transition name="badge">
          <div
            v-if="transactionStore.itemToAddInTransaction.value.oldOrNewProduct"
            class="absolute -top-2 -right-2 px-2 py-1 rounded-lg text-xs font-medium shadow-sm z-10"
            :class="{
              'bg-blue-50 text-blue-700 border border-blue-200':
                transactionStore.itemToAddInTransaction.value
                  .oldOrNewProduct === 'old',
              'bg-green-50 text-green-700 border border-green-200':
                transactionStore.itemToAddInTransaction.value
                  .oldOrNewProduct === 'new',
            }"
          >
            {{
              transactionStore.itemToAddInTransaction.value.oldOrNewProduct ===
              "old"
                ? "Existente"
                : "Nuevo"
            }}
          </div>
        </Transition>

        <input
          v-model="transactionStore.itemToAddInTransaction.value.description"
          type="text"
          disabled
          placeholder="Selecciona un producto arriba"
          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-500 transition-all duration-200"
        />

        <Transition name="fade-scale">
          <button
            v-if="transactionStore.itemToAddInTransaction.value.description"
            @click="handleResetProduct"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
          >
            <Xmark class="w-4 h-4" />
          </button>
        </Transition>
      </div>
    </div>
    <Transition name="slide-fade">
      <div v-if="transactionStore.itemToAddInTransaction.value.description">
        <!-- Cantidad, Unidad y Precio - Layout optimizado -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Cantidad -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Cantidad</label>
            <div class="relative">
              <input
                ref="quantityInput"
                v-model="transactionStore.itemToAddInTransaction.value.quantity"
                type="number"
                placeholder="0"
                min="0"
                @keydown.enter="focusPriceInput"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-medium focus:border-blue-500 focus:outline-none transition-colors"
                :class="{
                  'border-red-300 bg-red-50': hasStockWarning && !proceedAnyway,
                }"
              />
              <div
                class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                :class="{
                  'bg-red-500': hasStockWarning && !proceedAnyway,
                  'bg-blue-500': !hasStockWarning || proceedAnyway,
                }"
              ></div>
            </div>
            <!-- Indicador de stock disponible -->
            <div class="flex flex-col gap-1">
              <p class="text-xs text-gray-500">Ingresa la cantidad a vender</p>
              <p
                v-if="
                  transactionStore.itemToAddInTransaction.value.trackStock &&
                  transactionStore.itemToAddInTransaction.value.stock > 0
                "
                class="text-xs text-blue-600 font-medium"
              >
                📦 Stock disponible:
                {{ transactionStore.itemToAddInTransaction.value.stock }}
                {{
                  transactionStore.itemToAddInTransaction.value.unit || "uni"
                }}
              </p>
              <p
                v-else-if="
                  transactionStore.itemToAddInTransaction.value.trackStock &&
                  transactionStore.itemToAddInTransaction.value.stock <= 0
                "
                class="text-xs text-amber-600 font-medium"
              >
                ⚠️ No hay stock disponible
              </p>
              <p
                v-if="hasStockWarning && !proceedAnyway"
                class="text-xs text-red-600 font-medium"
              >
                ⛔ La cantidad excede el stock disponible ({{
                  transactionStore.itemToAddInTransaction.value.stock
                }}
                {{
                  transactionStore.itemToAddInTransaction.value.unit || "uni"
                }})
              </p>
            </div>
          </div>

          <!-- Unidad -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Unidad</label>
            <select
              v-model="transactionStore.itemToAddInTransaction.value.unit"
              :disabled="
                transactionStore.itemToAddInTransaction.value
                  .oldOrNewProduct === 'old'
              "
              class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50 disabled:bg-gray-50"
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

          <!-- Precio -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Precio (S/)</label>
            <div class="relative">
              <input
                ref="priceInput"
                v-model="transactionStore.itemToAddInTransaction.value.price"
                type="number"
                step="0.01"
                placeholder="0.00"
                @keydown.enter="handleAddProductOnEnter"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-medium focus:border-green-500 focus:outline-none transition-colors"
              />
              <div
                class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full"
              ></div>
            </div>
          </div>
        </div>

        <!-- Checkbox "Proceder de todos modos" - Solo si hay advertencia de stock -->
        <div
          v-if="hasStockWarning"
          class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <label class="flex items-start gap-3 cursor-pointer group">
            <input
              v-model="proceedAnyway"
              type="checkbox"
              class="mt-0.5 w-4 h-4 text-amber-600 bg-white border-amber-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
            />
            <div class="flex-1">
              <span
                class="text-sm font-medium text-amber-900 group-hover:text-amber-950"
              >
                Vender igual
              </span>
              <p class="text-xs text-amber-700 mt-1">
                Te quedan solo
                {{ transactionStore.itemToAddInTransaction.value.stock }}
                {{
                  transactionStore.itemToAddInTransaction.value.unit || "uni"
                }}
                en stock. Si vendes
                {{ transactionStore.itemToAddInTransaction.value.quantity }},
                Wala ajustará automáticamente.
              </p>
            </div>
          </label>
        </div>
      </div>
    </Transition>

    <!-- Botón Agregar -->
    <button
      @click="handleAddProduct"
      :disabled="!canAddProduct"
      class="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
    >
      <KeyframePlus class="w-5 h-5" />
      Agregar Producto
    </button>

    <!-- Lista de productos agregados -->
    <div
      class="space-y-4"
      v-if="transactionStore.transactionToAdd.value.items.length > 0"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">Productos Agregados</h3>
        <Transition name="fade-scale">
          <div
            v-if="transactionStore.transactionToAdd.value.items.length > 0"
            class="text-sm text-gray-500"
          >
            {{ transactionStore.transactionToAdd.value.items.length }}
            producto{{
              transactionStore.transactionToAdd.value.items.length !== 1
                ? "s"
                : ""
            }}
          </div>
        </Transition>
      </div>

      <!-- Lista de items con TransitionGroup -->
      <TransitionGroup name="list" tag="div" class="space-y-3">
        <template
          v-if="transactionStore.transactionToAdd.value.items.length > 0"
        >
          <div
            v-for="item in transactionStore.transactionToAdd.value.items"
            :key="item.uuid"
            class="bg-gray-50 rounded-xl p-4 flex items-center gap-3"
            :class="{
              'border-2 border-amber-300 bg-amber-50':
                item.proceedAnyway &&
                item.requestedQuantity > item.actualQuantity,
            }"
          >
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 truncate mb-1">
                {{ item.description }}
              </div>
              <div class="text-sm text-gray-600">
                {{ item.quantity }} {{ item.unit || "uni" }} × S/
                {{ item.price }}
              </div>
              <!-- Advertencia de stock insuficiente -->
              <!-- <div
                v-if="
                  item.proceedAnyway &&
                  item.requestedQuantity > item.actualQuantity
                "
                class="mt-2 text-xs text-amber-700 font-medium"
              >
                ⚠️ Stock insuficiente: Se vendió {{ item.actualQuantity }} de
                {{ item.requestedQuantity }} solicitadas
              </div> -->
            </div>

            <div class="text-right">
              <div class="text-lg font-bold text-blue-600">
                S/ {{ (item.quantity * item.price).toFixed(2) }}
              </div>
            </div>

            <button
              @click="transactionStore.removeItemToTransaction(item.uuid)"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Xmark class="w-4 h-4" />
            </button>
          </div>

          <!-- Total con key único -->
          <div
            key="total"
            class="bg-blue-50 rounded-xl p-4 border border-blue-200"
          >
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-800">Total</span>
              <span class="text-xl font-bold text-blue-600">
                S/
                {{
                  transactionStore.transactionToAdd.value.items
                    .reduce(
                      (total, item) => total + item.quantity * item.price,
                      0
                    )
                    .toFixed(2)
                }}
              </span>
            </div>
          </div>
        </template>

        <!-- Estado vacío con key único -->
        <div v-else key="empty-state" class="text-center py-8">
          <div
            class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"
          >
            <KeyframePlus class="w-6 h-6 text-gray-400" />
          </div>
          <h3 class="font-semibold text-gray-600 mb-1">
            No hay productos agregados
          </h3>
          <p class="text-sm text-gray-500">
            Empieza buscando un producto arriba.
          </p>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { KeyframePlus, Xmark } from "@iconoir/vue";
import SearchProductAsync from "@/components/basicAccountingRecordsBook/SearchProductAsync.vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const transactionStore = useTransactionStore();

// Referencias a los inputs
const quantityInput = ref(null);
const priceInput = ref(null);

// Estado local para "proceder de todos modos"
const proceedAnyway = ref(false);

/**
 * Computed: Verifica si hay advertencia de stock
 * Solo aplica si el producto tiene trackStock = true
 */
const hasStockWarning = computed(() => {
  const item = transactionStore.itemToAddInTransaction.value;

  // Si no hay producto o cantidad seleccionada
  if (!item.description || !item.quantity) return false;

  // Si el producto NO tiene seguimiento de stock, no hay advertencia
  if (!item.trackStock) return false;

  // Si la cantidad excede el stock disponible
  const quantity = parseFloat(item.quantity) || 0;
  const stock = parseFloat(item.stock) || 0;

  return quantity > stock;
});

/**
 * Computed: Determina si se puede agregar el producto
 */
const canAddProduct = computed(() => {
  const item = transactionStore.itemToAddInTransaction.value;

  // Validaciones básicas
  if (!item.description || !item.quantity || !item.price || !item.unit) {
    return false;
  }

  // Si hay advertencia de stock y NO se ha marcado "proceder de todos modos"
  if (hasStockWarning.value && !proceedAnyway.value) {
    return false;
  }

  return true;
});

/**
 * Maneja el agregado del producto y resetea el estado
 */
const handleAddProduct = () => {
  // Pasar el flag proceedAnyway al item antes de agregarlo
  transactionStore.itemToAddInTransaction.value.proceedAnyway =
    proceedAnyway.value;

  transactionStore.addItemToTransaction();

  // Resetear el checkbox
  proceedAnyway.value = false;
};

/**
 * Maneja el reset del producto seleccionado
 */
const handleResetProduct = () => {
  transactionStore.resetItemToAddInTransaction();
  // Resetear el checkbox
  proceedAnyway.value = false;
};

/**
 * Enfoca el input de precio cuando se presiona Enter en cantidad
 */
const focusPriceInput = () => {
  if (priceInput.value) {
    priceInput.value.focus();
  }
};

/**
 * Maneja el Enter en el input de precio
 */
const handleAddProductOnEnter = () => {
  if (canAddProduct.value) {
    handleAddProduct();
  }
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

/* Transición Slide + Fade (sección de cantidad/precio) */
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

/* TransitionGroup para lista de productos */
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

/* Animación suave para el total cuando cambia */
.text-xl {
  transition: all 0.2s ease;
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
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Animación sutil de los indicadores de color */
.bg-blue-500,
.bg-green-500 {
  animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-soft {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Transición suave para inputs disabled */
input:disabled,
select:disabled {
  transition: all 0.3s ease;
}

/* Mejora visual al agregar producto (feedback) */
@keyframes success-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

/* Aplicar animación al agregar (opcional, requiere clase dinámica) */
.item-added {
  animation: success-pulse 0.6s ease-out;
}
</style>
