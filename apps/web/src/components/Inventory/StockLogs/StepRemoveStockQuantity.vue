<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        ¿Cuánto salió?
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Ingresa la cantidad de
        {{ flow.removeStockData.productData?.description || "producto" }} que
        salió
      </p>
    </div>

    <!-- Advertencia de stock disponible -->
    <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
      <div class="flex items-start gap-3">
        <div
          class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0"
        >
          <Package class="w-4 h-4 text-white" />
        </div>
        <div class="flex-1">
          <div class="font-medium text-blue-800 mb-1">Stock disponible</div>
          <div class="text-sm text-blue-700">
            {{ flow.removeStockData.productData?.stock || 0 }}
            {{ flow.removeStockData.productData?.unit || "uni" }} disponibles
          </div>
        </div>
      </div>
    </div>

    <!-- Input de cantidad -->
    <div class="max-w-md mx-auto">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Cantidad que salió
      </label>
      <div class="relative">
        <input
          v-model.number="quantity"
          type="number"
          min="0.01"
          step="0.01"
          :max="flow.removeStockData.productData?.stock || 0"
          placeholder="0.00"
          class="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          @input="validateQuantity"
        />
        <div
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium"
        >
          {{ flow.removeStockData.productData?.unit || "uni" }}
        </div>
      </div>

      <!-- Error de cantidad excedida -->
      <div
        v-if="quantityExceeded"
        class="mt-2 text-sm text-red-600 flex items-center gap-2"
      >
        <WarningCircle class="w-4 h-4" />
        La cantidad no puede ser mayor al stock disponible
      </div>
    </div>

    <!-- Confirmación de precio (solo para ventas) -->
    <div v-if="flow.isSaleType" class="max-w-md mx-auto">
      <div class="bg-green-50 rounded-xl p-4 border border-green-200">
        <div class="mb-3">
          <label class="block text-sm font-medium text-green-800 mb-2">
            Precio de venta
          </label>
          <div class="relative">
            <div
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium"
            >
              S/
            </div>
            <input
              v-model.number="price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              class="w-full pl-10 pr-4 py-3 text-lg border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <!-- Precio sugerido -->
        <div class="text-sm text-green-700">
          <span class="font-medium">Precio registrado:</span> S/
          {{ (flow.removeStockData.productData?.price || 0).toFixed(2) }}
        </div>
      </div>
    </div>

    <!-- Resumen de la salida -->
    <div
      v-if="isValid"
      class="max-w-md mx-auto bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200"
    >
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Cantidad:</span>
          <span class="font-semibold text-gray-900">
            {{ quantity }} {{ flow.removeStockData.productData?.unit || "uni" }}
          </span>
        </div>

        <div v-if="flow.isSaleType" class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Precio unitario:</span>
          <span class="font-semibold text-gray-900">
            S/ {{ price.toFixed(2) }}
          </span>
        </div>

        <div
          v-if="flow.isSaleType"
          class="pt-2 border-t border-gray-300 flex justify-between items-center"
        >
          <span class="text-base font-medium text-gray-700">Total:</span>
          <span class="text-xl font-bold text-green-600">
            S/ {{ (quantity * price).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Package, WarningCircle } from "@iconoir/vue";
import { useRemoveStockFlowStore } from "@/stores/Inventory/RemoveStockFlow.js";

const flow = useRemoveStockFlowStore();

// State
const quantity = ref(0);
const price = ref(flow.removeStockData.productData?.price || 0);
const quantityExceeded = ref(false);

// Inicializar el precio en el store al montar el componente
onMounted(() => {
  const initialPrice = flow.removeStockData.productData?.price || 0;

  if (flow.isSaleType && initialPrice > 0) {
    price.value = initialPrice;
    flow.setPrice(initialPrice);
    flow.setPriceConfirmed(true);
    console.log("✅ Precio inicial establecido:", initialPrice);
  }

  // Para mermas, marcar como confirmado desde el inicio
  if (flow.isWasteType) {
    flow.setPriceConfirmed(true);
    console.log("✅ Merma: precio confirmado automáticamente");
  }
});

// Computed
const isValid = computed(() => {
  const validQuantity =
    quantity.value > 0 &&
    quantity.value <= (flow.removeStockData.productData?.stock || 0);

  if (flow.isSaleType) {
    return validQuantity && price.value > 0;
  }

  return validQuantity;
});

// Validar cantidad
const validateQuantity = () => {
  const maxStock = flow.removeStockData.productData?.stock || 0;

  if (quantity.value > maxStock) {
    quantityExceeded.value = true;
    quantity.value = maxStock;
  } else {
    quantityExceeded.value = false;
  }

  // Guardar la cantidad automáticamente en el store
  flow.setQuantity(quantity.value);
};

// Watch para actualizar el precio en el store cuando cambia
watch(price, (newPrice) => {
  if (flow.isSaleType) {
    flow.setPrice(newPrice);
    flow.setPriceConfirmed(newPrice > 0);
    console.log(
      "💰 Precio actualizado:",
      newPrice,
      "Confirmado:",
      newPrice > 0
    );
  }
});

// Watch para actualizar la cantidad en el store cuando cambia
watch(quantity, (newQuantity) => {
  flow.setQuantity(newQuantity);
  console.log("📊 Cantidad actualizada:", newQuantity);

  // Si es merma y la cantidad es válida, asegurar que esté confirmado
  if (flow.isWasteType && newQuantity > 0) {
    flow.setPriceConfirmed(true);
  }
});
</script>
