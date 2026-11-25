<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        ¿Cuánto compraste?
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Ingresa la cantidad y el costo de
        {{ flow.addStockData.productData?.description || "producto" }} que compraste
      </p>
    </div>

    <!-- Información de stock actual -->
    <div class="bg-green-50 rounded-xl p-4 border border-green-200">
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
          <Package class="w-4 h-4 text-white" />
        </div>
        <div class="flex-1">
          <div class="font-medium text-green-800 mb-1">Stock actual</div>
          <div class="text-sm text-green-700">
            {{ flow.addStockData.productData?.stock || 0 }}
            {{ baseUnit }} en inventario
            <span v-if="stockDescribed" class="font-semibold text-green-900 block sm:inline sm:ml-2">
              ({{ stockDescribed }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Selector de Presentación (si tiene presentaciones) -->
    <div v-if="availablePresentations.length > 1" class="max-w-md mx-auto space-y-2">
      <label class="block text-sm font-semibold text-gray-700">
        Presentación comprada:
      </label>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          v-for="pres in availablePresentations"
          :key="pres.id"
          type="button"
          @click="selectPresentation(pres)"
          class="p-3 text-left rounded-xl border-2 transition-all flex flex-col justify-between"
          :class="[
            currentPresentation?.id === pres.id
              ? 'border-green-600 bg-green-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/20'
          ]"
        >
          <div class="font-bold text-xs sm:text-sm text-gray-800">{{ pres.name }}</div>
          <div class="text-[11px] text-gray-500 mt-1">
            x{{ pres.factor }} {{ baseUnit }}
          </div>
        </button>
      </div>
    </div>

    <!-- Input de cantidad -->
    <div class="max-w-md mx-auto">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Cantidad comprada (en {{ currentPresentation?.name || baseUnit }})
      </label>
      <div class="relative">
        <input
          v-model.number="quantity"
          type="number"
          :min="isFractionalPresentation ? 0.01 : 1"
          :step="isFractionalPresentation ? 0.01 : 1"
          placeholder="0"
          class="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
          {{ currentPresentation?.name || baseUnit }}
        </div>
      </div>
      <p v-if="currentPresentation?.factor > 1" class="text-xs text-green-700 font-medium mt-1">
        ✓ Equivale a {{ equivalentBaseQuantity }} {{ baseUnit }} en almacén
      </p>
    </div>

    <!-- Input de costo -->
    <div class="max-w-md mx-auto">
      <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div class="mb-3">
          <label class="block text-sm font-medium text-blue-800 mb-2">
            Costo de compra por {{ currentPresentation?.name || baseUnit }} (S/)
          </label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              S/
            </div>
            <input
              v-model.number="cost"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              class="w-full pl-10 pr-4 py-3 text-lg border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <!-- Costo unitario base resultante y CPP -->
        <div class="space-y-1 pt-2 border-t border-blue-200 text-xs text-blue-800">
          <div class="flex justify-between items-center">
            <span>Costo unitario entrante:</span>
            <span class="font-bold">S/ {{ equivalentUnitCost.toFixed(2) }} / {{ baseUnit }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span>Costo promedio actual:</span>
            <span>S/ {{ currentProductCost.toFixed(2) }}</span>
          </div>

          <div v-if="isValid" class="flex justify-between items-center text-blue-900 font-semibold pt-1 border-t border-blue-200/50">
            <span>Nuevo costo promedio (CPP):</span>
            <span class="text-sm text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              S/ {{ previewCPP.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen de la compra -->
    <div
      v-if="isValid"
      class="max-w-md mx-auto bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
    >
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Comprando:</span>
          <span class="font-semibold text-gray-900">
            {{ quantity }} {{ currentPresentation?.name }} (= {{ equivalentBaseQuantity }} {{ baseUnit }})
          </span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Costo por presentación:</span>
          <span class="font-semibold text-gray-900">
            S/ {{ cost.toFixed(2) }}
          </span>
        </div>

        <div class="pt-2 border-t border-gray-300 flex justify-between items-center">
          <span class="text-base font-medium text-gray-700">Total a pagar:</span>
          <span class="text-xl font-bold text-green-600">
            S/ {{ (quantity * cost).toFixed(2) }}
          </span>
        </div>

        <div class="pt-2 border-t border-gray-200 flex justify-between items-center text-sm">
          <span class="text-gray-600">Stock final en almacén:</span>
          <span class="font-bold text-blue-600">
            {{ stockAfter }} {{ baseUnit }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Package } from "@iconoir/vue";
import { useAddStockFlowStore } from "@/stores/Inventory/AddStockFlow.js";
import {
  getPresentations,
  isFractionalUnit,
  toBaseQuantity,
  toBaseUnitCost,
  computeWeightedAverageCost,
  describeStockInPresentations,
} from "@/utils/presentationMath";

const flow = useAddStockFlowStore();

const quantity = ref(0);
const cost = ref(0);

const baseUnit = computed(() => flow.addStockData.productData?.unit || "uni");
const currentProductCost = computed(() => Number(flow.addStockData.productData?.cost) || 0);
const currentProductStock = computed(() => Number(flow.addStockData.productData?.stock) || 0);

const availablePresentations = computed(() => {
  const pData = flow.addStockData.productData;
  if (!pData) return [];
  const pres = getPresentations(pData);
  return pres.filter((p) => !p.usage || p.usage.includes("buy"));
});

const currentPresentation = computed(() => {
  const pId = flow.addStockData.presentationId;
  return (
    availablePresentations.value.find((p) => p.id === pId) ||
    availablePresentations.value[0] || {
      id: "pres_base",
      name: baseUnit.value.toUpperCase(),
      factor: 1,
    }
  );
});

const isFractionalPresentation = computed(() => {
  return currentPresentation.value.factor === 1 && isFractionalUnit(baseUnit.value);
});

const equivalentBaseQuantity = computed(() => {
  return toBaseQuantity(quantity.value, currentPresentation.value.factor);
});

const equivalentUnitCost = computed(() => {
  return toBaseUnitCost(cost.value, currentPresentation.value.factor);
});

const previewCPP = computed(() => {
  return computeWeightedAverageCost({
    currentStock: currentProductStock.value,
    currentCost: currentProductCost.value,
    inQty: equivalentBaseQuantity.value,
    inUnitCost: equivalentUnitCost.value,
  });
});

const stockAfter = computed(() => {
  return currentProductStock.value + equivalentBaseQuantity.value;
});

const stockDescribed = computed(() => {
  if (!availablePresentations.value.length) return null;
  return describeStockInPresentations(
    currentProductStock.value,
    availablePresentations.value,
    baseUnit.value
  );
});

const isValid = computed(() => {
  return quantity.value > 0 && cost.value > 0;
});

const selectPresentation = (pres) => {
  flow.setPresentation(pres);
  // Si la presentación cambia, ajustar costo de referencia
  if (pres.factor > 1 && currentProductCost.value > 0) {
    cost.value = Math.round((currentProductCost.value * pres.factor + Number.EPSILON) * 100) / 100;
  } else if (pres.factor === 1 && currentProductCost.value > 0) {
    cost.value = currentProductCost.value;
  }
};

watch(cost, (newCost) => {
  flow.setCost(newCost);
  flow.setPriceConfirmed(newCost > 0);
});

watch(quantity, (newQuantity) => {
  flow.setQuantity(newQuantity);
});

onMounted(() => {
  const pData = flow.addStockData.productData;
  if (!pData) return;

  const pres = availablePresentations.value;
  const initialPres = pres.find((p) => p.isBase) || pres[0];
  if (initialPres) {
    flow.setPresentation(initialPres);
  }

  const defaultCost = Number(pData.cost) || 0;
  if (defaultCost > 0) {
    const factor = Number(initialPres?.factor || 1);
    const initialCost = Math.round((defaultCost * factor + Number.EPSILON) * 100) / 100;
    cost.value = initialCost;
    flow.setCost(initialCost);
    flow.setPriceConfirmed(true);
  }
});
</script>
