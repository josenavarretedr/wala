<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        ¿Cuánto compraste?
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Ingresa la cantidad de
        {{ flow.addStockData.productData?.description || "producto" }} que
        compraste
      </p>
    </div>

    <!-- Información de stock actual -->
    <div class="bg-green-50 rounded-xl p-4 border border-green-200">
      <div class="flex items-start gap-3">
        <div
          class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0"
        >
          <Package class="w-4 h-4 text-white" />
        </div>
        <div class="flex-1">
          <div class="font-medium text-green-800 mb-1">Stock actual</div>
          <div class="text-sm text-green-700">
            {{ flow.addStockData.productData?.stock || 0 }}
            {{ flow.addStockData.productData?.unit || "uni" }} en inventario
          </div>
        </div>
      </div>
    </div>

    <!-- Input de cantidad -->
    <div class="max-w-md mx-auto">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Cantidad comprada
      </label>
      <div class="relative">
        <input
          v-model.number="quantity"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          class="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          @input="validateQuantity"
        />
        <div
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium"
        >
          {{ flow.addStockData.productData?.unit || "uni" }}
        </div>
      </div>
    </div>

    <!-- Input de costo -->
    <div class="max-w-md mx-auto">
      <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div class="mb-3">
          <label class="block text-sm font-medium text-blue-800 mb-2">
            Costo de compra (precio unitario)
          </label>
          <div class="relative">
            <div
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium"
            >
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

        <!-- Costo de compra actual (referencia) -->
        <div class="text-sm text-blue-700">
          <span class="font-medium">Costo de compra actual:</span> S/
          {{ (flow.addStockData.productData?.cost || 0).toFixed(2) }}
        </div>

        <!-- Indicador de cambio de costo -->
        <div
          v-if="costHasChanged"
          class="mt-3 pt-3 border-t border-blue-300 text-sm text-blue-800 bg-blue-100 rounded-lg p-2"
        >
          <span class="font-medium">ℹ️ El costo será actualizado</span>
          <div class="text-xs mt-1 text-blue-600">
            De S/ {{ (flow.addStockData.productData?.cost || 0).toFixed(2) }} a
            S/ {{ cost.toFixed(2) }}
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
          <span class="text-sm text-gray-600">Cantidad:</span>
          <span class="font-semibold text-gray-900">
            {{ quantity }} {{ flow.addStockData.productData?.unit || "uni" }}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Costo unitario:</span>
          <span class="font-semibold text-gray-900">
            S/ {{ cost.toFixed(2) }}
          </span>
        </div>

        <div
          class="pt-2 border-t border-gray-300 flex justify-between items-center"
        >
          <span class="text-base font-medium text-gray-700"
            >Total de compra:</span
          >
          <span class="text-xl font-bold text-green-600">
            S/ {{ (quantity * cost).toFixed(2) }}
          </span>
        </div>

        <!-- Stock resultante -->
        <div class="pt-2 border-t border-gray-200">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-600">Stock resultante:</span>
            <span class="font-semibold text-blue-600">
              {{ getStockAfter() }}
              {{ flow.addStockData.productData?.unit || "uni" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Package } from "@iconoir/vue";
import { useAddStockFlowStore } from "@/stores/Inventory/AddStockFlow.js";

const flow = useAddStockFlowStore();

// State
const quantity = ref(0);
const cost = ref(0);

// Computed
const isValid = computed(() => {
  return quantity.value > 0 && cost.value > 0;
});

// Detectar si el costo ha cambiado
const costHasChanged = computed(() => {
  const originalCost = Number(flow.addStockData.productData?.cost) || 0;
  const newCost = Number(cost.value) || 0;
  return newCost > 0 && Math.abs(originalCost - newCost) > 0.01; // Tolerancia de 0.01
});

// Validar cantidad
const validateQuantity = () => {
  // Guardar la cantidad automáticamente en el store
  flow.setQuantity(quantity.value);
};

// Calcular stock después de la compra
const getStockAfter = () => {
  const currentStock = Number(flow.addStockData.productData?.stock) || 0;
  const newQuantity = Number(quantity.value) || 0;
  return currentStock + newQuantity;
};

// Watch para actualizar el costo en el store cuando cambia
watch(cost, (newCost) => {
  flow.setCost(newCost);
  flow.setPriceConfirmed(newCost > 0);
  console.log("💰 Costo actualizado:", newCost, "Confirmado:", newCost > 0);
});

// Watch para actualizar la cantidad en el store cuando cambia
watch(quantity, (newQuantity) => {
  flow.setQuantity(newQuantity);
  console.log("📊 Cantidad actualizada:", newQuantity);
});

// Inicializar el costo con el Costo de compra del producto
onMounted(() => {
  const defaultCost = flow.addStockData.productData?.cost || 0;
  if (defaultCost > 0) {
    cost.value = defaultCost;
    flow.setCost(defaultCost);
    flow.setPriceConfirmed(true);
    console.log("✅ Costo inicializado con Costo de compra:", defaultCost);
  }
});
</script>
