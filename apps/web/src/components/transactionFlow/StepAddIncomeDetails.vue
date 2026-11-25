<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Agregar Productos/Servicios
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Selecciona productos/servicios y define cantidades para tu transacción
      </p>
    </div>

    <!-- Buscador de productos/Servicios -->
    <div
      class="space-y-4"
      v-if="!transactionStore.itemToAddInTransaction.value.description"
    >
      <h2 class="text-lg font-semibold text-gray-800">
        Buscar
        <span v-if="transactionStore.transactionToAdd.value.items.length === 0"
          >producto/servicio</span
        >
        <span v-else>otros productos/servicios</span>
      </h2>
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
      <label class="text-lg font-semibold text-gray-800">Producto Seleccionado</label>
      <div class="relative">
        <Transition name="badge">
          <div
            v-if="transactionStore.itemToAddInTransaction.value.oldOrNewProduct"
            class="absolute -top-2 -right-2 px-2 py-1 rounded-lg text-xs font-medium shadow-sm z-10"
            :class="{
              'bg-blue-50 text-blue-700 border border-blue-200':
                transactionStore.itemToAddInTransaction.value.oldOrNewProduct === 'old',
              'bg-green-50 text-green-700 border border-green-200':
                transactionStore.itemToAddInTransaction.value.oldOrNewProduct === 'new',
            }"
          >
            {{
              transactionStore.itemToAddInTransaction.value.oldOrNewProduct === 'old'
                ? 'Existente'
                : 'Nuevo'
            }}
          </div>
        </Transition>

        <input
          v-model="transactionStore.itemToAddInTransaction.value.description"
          type="text"
          disabled
          placeholder="Selecciona un producto arriba"
          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-500 transition-all duration-200 font-semibold"
        />

        <div
          v-if="transactionStore.itemToAddInTransaction.value.variantLabel"
          class="mt-2"
        >
          <span
            class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200"
          >
            {{ transactionStore.itemToAddInTransaction.value.variantLabel }}
          </span>
        </div>

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

    <!-- Panel de configuración del ítem a agregar -->
    <Transition name="slide-fade">
      <div v-if="transactionStore.itemToAddInTransaction.value.description" class="space-y-4">
        
        <!-- SELECTOR DE PRESENTACIONES (si tiene presentaciones) -->
        <div v-if="sellPresentations.length > 1" class="space-y-1.5 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-700">Presentación a vender:</span>
            <span class="text-gray-400">Selecciona el empaque</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            <button
              v-for="pres in sellPresentations"
              :key="pres.id"
              type="button"
              @click="selectPresentation(pres)"
              class="p-2.5 text-left rounded-xl border-2 transition-all flex flex-col justify-between"
              :class="[
                currentPresentation?.id === pres.id
                  ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-blue-200 text-gray-700'
              ]"
            >
              <div class="font-bold text-xs sm:text-sm text-gray-900">{{ pres.name }}</div>
              <div class="flex items-center justify-between mt-1 text-[11px] text-gray-500">
                <span>x{{ pres.factor }} {{ baseUnit }}</span>
                <span class="font-bold text-blue-700">S/ {{ Number(pres.price || 0).toFixed(2) }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- MODO DE VENTA: Por cantidad vs Por monto (Granel) -->
        <div v-if="isGranelAllowed" class="flex items-center justify-between p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-indigo-900">Modo de venta a granel:</span>
          </div>
          <div class="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-indigo-200">
            <button
              type="button"
              @click="setSellMode('quantity')"
              class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
              :class="sellMode === 'quantity' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'"
            >
              Por {{ baseUnit }}
            </button>
            <button
              type="button"
              @click="setSellMode('amount')"
              class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
              :class="sellMode === 'amount' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'"
            >
              Por dinero (S/)
            </button>
          </div>
        </div>

        <!-- Inputs: Cantidad y Precio -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Campo 1: Cantidad o Monto según sellMode -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">
              {{ sellMode === 'amount' ? 'Monto a vender (S/)' : 'Cantidad' }}
            </label>
            <div class="relative">
              <input
                v-if="sellMode === 'amount'"
                v-model.number="montoTarget"
                @input="onMontoTargetInput"
                type="number"
                step="0.10"
                min="0.10"
                placeholder="5.00"
                class="w-full px-4 py-3 border border-indigo-300 rounded-xl text-center font-bold text-indigo-900 focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <input
                v-else
                ref="quantityInput"
                v-model.number="transactionStore.itemToAddInTransaction.value.quantity"
                type="number"
                :step="quantityStep"
                :min="quantityStep"
                placeholder="0"
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
              <div class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                {{ sellMode === 'amount' ? 'S/' : (currentPresentation?.name || baseUnit) }}
              </div>
            </div>
            <p v-if="sellMode === 'amount' && transactionStore.itemToAddInTransaction.value.quantity > 0" class="text-xs text-indigo-700 font-medium">
              = {{ transactionStore.itemToAddInTransaction.value.quantity }} {{ baseUnit }} a S/ {{ Number(transactionStore.itemToAddInTransaction.value.price || 0).toFixed(2) }}/{{ baseUnit }}
            </p>
          </div>

          <!-- Campo 2: Unidad / Presentación -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Empaque / Unidad</label>
            <div class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-semibold text-center text-sm truncate">
              {{ currentPresentation?.name || baseUnit }} (x{{ currentPresentation?.factor || 1 }})
            </div>
          </div>

          <!-- Campo 3: Precio Neto Cobrado (Inalterable para productos existentes) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <label class="text-sm font-medium text-gray-700 flex items-center gap-1">
                Precio (S/)
              </label>
              <button
                v-if="transactionStore.itemToAddInTransaction.value.oldOrNewProduct !== 'new'"
                type="button"
                @click="showDiscountPanel = !showDiscountPanel"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors border"
                :class="
                  showDiscountPanel || transactionStore.itemToAddInTransaction.value.discount
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-gray-800 hover:bg-gray-100'
                "
              >
                <span>{{ showDiscountPanel ? 'Cerrar' : 'Dscto %' }}</span>
              </button>
            </div>
            <div class="relative">
              <input
                ref="priceInput"
                v-model.number="transactionStore.itemToAddInTransaction.value.price"
                type="number"
                step="0.01"
                placeholder="0.00"
                :readonly="isPriceLocked"
                @keydown.enter="handleAddProductOnEnter"
                class="w-full px-4 py-3 border rounded-xl text-center font-bold transition-colors focus:outline-none"
                :class="[
                  isPriceLocked
                    ? 'bg-gray-50 border-gray-200 text-gray-800 cursor-default select-none'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-green-500',
                ]"
              />
              <div
                class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                :class="transactionStore.itemToAddInTransaction.value.discount ? 'bg-amber-500' : 'bg-green-500'"
              ></div>
              <span
                v-if="isPriceLocked"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                title="Precio oficial de catálogo. Usa Dscto % para aplicar descuento."
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
            </div>
            <div
              v-if="transactionStore.itemToAddInTransaction.value.discount && !showDiscountPanel"
              class="flex items-center justify-between text-[11px] text-amber-700 font-medium px-1"
            >
              <span>
                Dscto aplicado (Lista: S/ {{ Number(currentListPrice).toFixed(2) }})
              </span>
              <button
                type="button"
                @click="clearDiscount"
                class="text-amber-800 hover:text-red-600 underline"
              >
                Quitar
              </button>
            </div>
          </div>
        </div>

        <!-- PANEL DE DESCUENTO Y REGATEO (Plegable) -->
        <Transition name="slide-fade">
          <div v-if="showDiscountPanel" class="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-900 uppercase tracking-wide">Descuento de Línea / Precio Negociado</span>
              <button type="button" @click="clearDiscount" class="text-xs text-amber-700 hover:text-red-600 underline">
                Restablecer a lista (S/ {{ Number(currentListPrice).toFixed(2) }})
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-amber-900 mb-1">Porcentaje (%)</label>
                <input
                  v-model.number="discountPctInput"
                  @input="onDiscountPctInput"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="Ej: 5"
                  class="w-full px-3 py-2 text-sm border border-amber-300 rounded-xl bg-white focus:outline-none text-center font-semibold"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-amber-900 mb-1">Monto de Descuento (S/)</label>
                <input
                  v-model.number="discountAmtInput"
                  @input="onDiscountAmtInput"
                  type="number"
                  min="0"
                  step="0.10"
                  placeholder="Ej: 8.00"
                  class="w-full px-3 py-2 text-sm border border-amber-300 rounded-xl bg-white focus:outline-none text-center font-semibold"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-amber-900 mb-1">Precio Final Negociado (S/)</label>
                <input
                  v-model.number="directNegotiatedPrice"
                  @input="onDirectNegotiatedPriceInput"
                  type="number"
                  min="0"
                  step="0.10"
                  placeholder="Ej: 192.00"
                  class="w-full px-3 py-2 text-sm border border-amber-300 rounded-xl bg-white focus:outline-none text-center font-bold text-gray-900"
                />
              </div>
            </div>
          </div>
        </Transition>

        <!-- PROTECCIÓN DE MARGEN: Componente MarginGuard -->
        <MarginGuard
          :evaluation="marginEvaluation"
          :action="pricingPolicy.belowFloorAction"
          :canBypass="canBypassMargin"
        />

        <!-- Indicador de stock disponible -->
        <div class="space-y-1 text-xs">
          <div
            v-if="
              transactionStore.itemToAddInTransaction.value.oldOrNewProduct !== 'new' &&
              transactionStore.itemToAddInTransaction.value.trackStock &&
              selectedAvailableStock > 0
            "
            class="text-blue-600 font-medium"
          >
            📦 Stock en almacén:
            <strong>{{ selectedAvailableStock }} {{ baseUnit }}</strong>
            <span v-if="currentPresentation?.factor > 1" class="text-blue-800 ml-1">
              (Equivale a ≈ {{ Math.floor(selectedAvailableStock / currentPresentation.factor) }} {{ currentPresentation.name }})
            </span>
          </div>

          <p
            v-else-if="
              transactionStore.itemToAddInTransaction.value.oldOrNewProduct !== 'new' &&
              transactionStore.itemToAddInTransaction.value.trackStock &&
              selectedAvailableStock <= 0
            "
            class="text-amber-600 font-medium"
          >
            ⚠️ No hay stock disponible en almacén
          </p>

          <p v-if="hasStockWarning && !proceedAnyway" class="text-red-600 font-medium">
            ⛔ La cantidad requerida ({{ currentBaseQtyRequired }} {{ baseUnit }}) excede el stock disponible ({{ selectedAvailableStock }} {{ baseUnit }})
          </p>
        </div>

        <!-- Checkbox "Proceder de todos modos" -->
        <div
          v-if="hasStockWarning"
          class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3"
        >
          <label class="flex items-start gap-3 cursor-pointer group">
            <input
              v-model="proceedAnyway"
              type="checkbox"
              class="mt-0.5 w-4 h-4 text-amber-600 bg-white border-amber-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
            />
            <div class="flex-1">
              <span class="text-sm font-medium text-amber-900 group-hover:text-amber-950">
                Vender igual con stock insuficiente
              </span>
              <p class="text-xs text-amber-700 mt-1">
                Se registrará la venta y se descontará el stock hasta agotar las existencias disponibles.
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
      class="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
    >
      <template v-if="isValidatingComposition">
        <div class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
        Validando materiales...
      </template>
      <template v-else>
        <span v-if="isBlockedByPolicy">⛔ Venta bloqueada por margen</span>
        <span v-else>Agregar a la venta</span>
      </template>
    </button>

    <!-- Lista de Items en la Transacción -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-800">
        Items en la venta ({{ transactionStore.transactionToAdd.value.items.length }})
      </h3>

      <TransitionGroup name="list" tag="div" class="space-y-3">
        <template v-if="transactionStore.transactionToAdd.value.items.length > 0">
          <div
            v-for="item in transactionStore.transactionToAdd.value.items"
            :key="item.uuid"
            class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-xs"
          >
            <div class="flex-1 min-w-0 pr-4">
              <div class="font-semibold text-gray-900 truncate">
                {{ item.description }}
              </div>
              <div class="text-sm text-gray-600 flex flex-wrap items-center gap-2 mt-0.5">
                <span>
                  {{ item.quantity }} {{ item.presentationName || item.unit || "uni" }}
                  × S/ {{ Number(item.price || 0).toFixed(2) }}
                </span>
                <span
                  v-if="item.conversionFactor > 1"
                  class="text-[11px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-semibold"
                >
                  (= {{ item.baseQuantity }} {{ item.unit || 'uni' }})
                </span>
                <span
                  v-if="item.discount && item.discount.amountPerUnit > 0"
                  class="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold line-through text-gray-400"
                >
                  S/ {{ Number(item.listPrice || item.price).toFixed(2) }}
                </span>
                <span
                  v-if="item.discount && item.discount.amountPerUnit > 0"
                  class="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold"
                >
                  -{{ item.discount.discountPct }}%
                </span>
              </div>
            </div>

            <div class="text-right">
              <div class="text-lg font-bold text-blue-600">
                S/ {{ (item.quantity * item.price).toFixed(2) }}
              </div>
            </div>

            <button
              @click="transactionStore.removeItemToTransaction(item.uuid)"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
            >
              <Xmark class="w-4 h-4" />
            </button>
          </div>

          <!-- Total de la venta -->
          <div key="total" class="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div class="flex justify-between items-center">
              <div>
                <span class="font-semibold text-gray-800">Total</span>
                <span
                  v-if="totalDiscountAccumulated > 0"
                  class="text-xs text-emerald-700 block font-medium"
                >
                  Ahorro total aplicado: S/ {{ totalDiscountAccumulated.toFixed(2) }}
                </span>
              </div>
              <span class="text-xl font-bold text-blue-600">
                S/
                {{
                  transactionStore.transactionToAdd.value.items
                    .reduce((total, item) => total + (item.quantity * item.price), 0)
                    .toFixed(2)
                }}
              </span>
            </div>
          </div>
        </template>

        <div v-else key="empty-state" class="text-center py-8">
          <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <KeyframePlus class="w-6 h-6 text-gray-400" />
          </div>
          <h3 class="font-semibold text-gray-600 mb-1">No hay productos agregados</h3>
          <p class="text-sm text-gray-500">Empieza buscando un producto arriba.</p>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { KeyframePlus, Xmark } from "@iconoir/vue";
import SearchProductAsync from "@/components/basicAccountingRecordsBook/SearchProductAsync.vue";
import MarginGuard from "@/components/transactionFlow/MarginGuard.vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useCompositionStockValidation } from "@/composables/useCompositionStockValidation";
import {
  getPresentations,
  isFractionalUnit,
  quantityFromAmount,
  applyDiscount,
  evaluateMargin,
  resolveMinMargin,
  toBaseQuantity,
} from "@/utils/presentationMath";

const transactionStore = useTransactionStore();
const businessStore = useBusinessStore();
const { validateProductAndCompositionStock } = useCompositionStockValidation();

const quantityInput = ref(null);
const priceInput = ref(null);
const proceedAnyway = ref(false);

const sellMode = ref("quantity"); // 'quantity' | 'amount'
const montoTarget = ref(0);

const showDiscountPanel = ref(false);
const discountPctInput = ref(null);
const discountAmtInput = ref(null);
const directNegotiatedPrice = ref(null);

const compositionValidationResult = ref(null);
const isValidatingComposition = ref(false);

const baseUnit = computed(() => {
  return transactionStore.itemToAddInTransaction.value.unit || "uni";
});

const sellPresentations = computed(() => {
  const item = transactionStore.itemToAddInTransaction.value;
  if (!item.hasPresentations || !Array.isArray(item.presentations)) {
    return [];
  }
  return item.presentations.filter((p) => p && p.isActive !== false && (!p.usage || p.usage.includes("sell")));
});

const currentPresentation = computed(() => {
  const item = transactionStore.itemToAddInTransaction.value;
  const pId = item.presentationId;
  const pres = sellPresentations.value;
  return pres.find((p) => p.id === pId) || pres[0] || {
    id: "pres_base",
    name: (item.unit || "UNIDAD").toUpperCase(),
    factor: 1,
    price: item.price || 0,
    allowSellByAmount: isFractionalUnit(item.unit),
  };
});

const isGranelAllowed = computed(() => {
  return Boolean(currentPresentation.value?.allowSellByAmount);
});

const quantityStep = computed(() => {
  if (currentPresentation.value?.factor === 1 && isFractionalUnit(baseUnit.value)) {
    return 0.01;
  }
  return 1;
});

const isPriceLocked = computed(() => {
  const item = transactionStore.itemToAddInTransaction.value;
  return item.oldOrNewProduct !== "new" && Number(currentListPrice.value) > 0;
});

const currentListPrice = computed(() => {
  const item = transactionStore.itemToAddInTransaction.value;
  return Number(item.listPrice ?? item.price ?? 0);
});

const selectedAvailableStock = computed(() => {
  const item = transactionStore.itemToAddInTransaction.value;
  if (item.variantId) {
    return parseFloat(item.variantStock) || 0;
  }
  return parseFloat(item.stock) || 0;
});

const currentBaseQtyRequired = computed(() => {
  const item = transactionStore.itemToAddInTransaction.value;
  const factor = Number(item.conversionFactor || 1);
  return toBaseQuantity(item.quantity, factor);
});

// Política de precios del negocio
const pricingPolicy = computed(() => {
  const businessConfig = businessStore.business?.settings?.config?.pricing;
  return {
    minMarginPct: businessConfig?.minMarginPct ?? 20,
    belowFloorAction: businessConfig?.belowFloorAction ?? "warn",
    allowBelowCost: businessConfig?.allowBelowCost ?? false,
  };
});

const canBypassMargin = computed(() => {
  return businessStore.isCurrentUserManager || businessStore.hasPermission("manage_pricing");
});

const marginEvaluation = computed(() => {
  const item = transactionStore.itemToAddInTransaction.value;
  if (!item.description || !item.price || !item.baseUnitCost) return null;

  const minMargin = resolveMinMargin(currentPresentation.value, pricingPolicy.value);
  return evaluateMargin({
    netPrice: item.price,
    baseCost: item.baseUnitCost,
    factor: item.conversionFactor || 1,
    minMarginPct: minMargin,
    allowBelowCost: pricingPolicy.value.allowBelowCost || canBypassMargin.value,
  });
});

const isBlockedByPolicy = computed(() => {
  if (!marginEvaluation.value) return false;
  if (marginEvaluation.value.isBlocked) return true;

  if (
    marginEvaluation.value.status === "below_floor" &&
    pricingPolicy.value.belowFloorAction === "require_manager" &&
    !canBypassMargin.value
  ) {
    return true;
  }

  if (
    marginEvaluation.value.status === "below_floor" &&
    pricingPolicy.value.belowFloorAction === "block"
  ) {
    return true;
  }

  return false;
});

const totalDiscountAccumulated = computed(() => {
  return (transactionStore.transactionToAdd.value.items || []).reduce((sum, it) => {
    return sum + (it.discount?.total || 0);
  }, 0);
});

// Selección de presentación
const selectPresentation = (pres) => {
  const item = transactionStore.itemToAddInTransaction.value;
  item.presentationId = pres.id;
  item.presentationName = pres.name;
  item.conversionFactor = Number(pres.factor || 1);
  const newPrice = Number(pres.price || item.price || 0);
  item.price = newPrice;
  item.listPrice = newPrice;

  // Limpiar descuentos previos
  clearDiscount();
};

const setSellMode = (mode) => {
  sellMode.value = mode;
  if (mode === "amount") {
    montoTarget.value = 5.0;
    onMontoTargetInput();
  }
};

const onMontoTargetInput = () => {
  const item = transactionStore.itemToAddInTransaction.value;
  const unitP = Number(item.listPrice || item.price || 1);
  const result = quantityFromAmount({ amount: montoTarget.value, unitPrice: unitP });
  item.quantity = result.quantity;
  item.price = result.adjustedPrice;
  item.soldByAmount = result.targetAmount;
};

// Manejo de descuentos
const onDiscountPctInput = () => {
  const item = transactionStore.itemToAddInTransaction.value;
  const listP = currentListPrice.value;
  const res = applyDiscount({ listPrice: listP, type: "percent", value: discountPctInput.value });
  item.price = res.netPrice;
  discountAmtInput.value = res.amountPerUnit;
  directNegotiatedPrice.value = res.netPrice;
  item.discount = {
    type: "percent",
    value: discountPctInput.value,
    amountPerUnit: res.amountPerUnit,
    discountPct: res.discountPct,
  };
};

const onDiscountAmtInput = () => {
  const item = transactionStore.itemToAddInTransaction.value;
  const listP = currentListPrice.value;
  const res = applyDiscount({ listPrice: listP, type: "amount", value: discountAmtInput.value });
  item.price = res.netPrice;
  discountPctInput.value = res.discountPct;
  directNegotiatedPrice.value = res.netPrice;
  item.discount = {
    type: "amount",
    value: discountAmtInput.value,
    amountPerUnit: res.amountPerUnit,
    discountPct: res.discountPct,
  };
};

const onDirectNegotiatedPriceInput = () => {
  const item = transactionStore.itemToAddInTransaction.value;
  const listP = currentListPrice.value;
  const targetP = Math.max(0, Number(directNegotiatedPrice.value) || 0);
  const diff = Math.max(0, listP - targetP);
  discountAmtInput.value = diff;
  onDiscountAmtInput();
};

const clearDiscount = () => {
  const item = transactionStore.itemToAddInTransaction.value;
  item.price = currentListPrice.value;
  discountPctInput.value = null;
  discountAmtInput.value = null;
  directNegotiatedPrice.value = null;
  item.discount = null;
};

// Validación de stock
const hasProductStockWarning = computed(() => {
  const item = transactionStore.itemToAddInTransaction.value;
  if (item.oldOrNewProduct === "new" || !item.trackStock || !item.quantity) return false;
  return currentBaseQtyRequired.value > selectedAvailableStock.value;
});

const hasCompositionStockWarning = computed(() => {
  return Boolean(compositionValidationResult.value?.hasCompositionStockIssue);
});

const hasStockWarning = computed(() => {
  return hasProductStockWarning.value || hasCompositionStockWarning.value;
});

const canAddProduct = computed(() => {
  const item = transactionStore.itemToAddInTransaction.value;
  if (!item.description || !item.quantity || Number(item.quantity) <= 0) return false;
  if (!item.price && !item.cost) return false;
  if (isBlockedByPolicy.value) return false;
  if (hasStockWarning.value && !proceedAnyway.value) return false;
  return true;
});

// Watch: Composición
watch(
  () => [
    transactionStore.itemToAddInTransaction.value.quantity,
    transactionStore.itemToAddInTransaction.value.conversionFactor,
    transactionStore.itemToAddInTransaction.value.selectedProductUuid,
  ],
  async ([quantity, factor, productId]) => {
    const item = transactionStore.itemToAddInTransaction.value;
    if (!item.composition || !quantity || !productId || item.oldOrNewProduct === "new") {
      compositionValidationResult.value = null;
      return;
    }
    isValidatingComposition.value = true;
    try {
      const baseQty = toBaseQuantity(quantity, factor || 1);
      const result = await validateProductAndCompositionStock(
        {
          uuid: productId,
          trackStock: item.trackStock,
          stock: selectedAvailableStock.value,
          composition: item.composition,
        },
        baseQty
      );
      compositionValidationResult.value = result;
    } catch (e) {
      console.error("Error validando composición:", e);
      compositionValidationResult.value = null;
    } finally {
      isValidatingComposition.value = false;
    }
  }
);

const handleAddProduct = () => {
  if (!canAddProduct.value) return;

  const item = transactionStore.itemToAddInTransaction.value;
  item.proceedAnyway = proceedAnyway.value;

  if (marginEvaluation.value) {
    item.marginCheck = {
      floorPrice: marginEvaluation.value.floorPrice,
      minMarginPct: resolveMinMargin(currentPresentation.value, pricingPolicy.value),
      status: marginEvaluation.value.status,
      authorizedBy: canBypassMargin.value ? (businessStore.currentUser?.uid || "gerente") : null,
    };
  }

  transactionStore.addItemToTransaction();
  transactionStore.resetItemToAddInTransaction();
  proceedAnyway.value = false;
  showDiscountPanel.value = false;
  clearDiscount();
};

const handleResetProduct = () => {
  transactionStore.resetItemToAddInTransaction();
  proceedAnyway.value = false;
  showDiscountPanel.value = false;
  clearDiscount();
};

const focusPriceInput = () => {
  priceInput.value?.focus();
};

const handleAddProductOnEnter = () => {
  if (canAddProduct.value) {
    handleAddProduct();
  }
};
</script>
