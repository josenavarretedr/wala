<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Confirma tu compra
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Revisa los detalles antes de registrar la compra
      </p>
    </div>

    <!-- Información del producto -->
    <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <div
          class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
        >
          <Package class="w-5 h-5 text-white" />
        </div>
        <div>
          <div class="font-semibold text-gray-900">
            {{ flow.addStockData.productData?.description || "Producto" }}
          </div>
          <div class="text-sm text-gray-500">
            Código: {{ flow.addStockData.productData?.code || "N/A" }}
          </div>
        </div>
      </div>

      <!-- Detalles de la compra -->
      <div class="space-y-3 border-t pt-3">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Cantidad comprada:</span>
          <span class="font-semibold text-gray-900">
            {{ flow.addStockData.quantity }}
            {{ flow.addStockData.productData?.unit || "uni" }}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Costo unitario:</span>
          <span class="font-semibold text-gray-900">
            S/ {{ flow.addStockData.cost.toFixed(2) }}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Stock actual:</span>
          <span class="font-semibold text-gray-700">
            {{ flow.addStockData.productData?.stock || 0 }}
            {{ flow.addStockData.productData?.unit || "uni" }}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Stock después:</span>
          <span class="font-semibold text-blue-600">
            {{ getStockAfter() }}
            {{ flow.addStockData.productData?.unit || "uni" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Método de pago -->
    <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <component
            :is="getPaymentIcon()"
            class="w-5 h-5 text-white"
          ></component>
        </div>
        <div class="flex-1">
          <div class="text-sm text-blue-700 font-medium mb-1">
            Método de pago
          </div>
          <div class="text-blue-900 font-semibold">
            {{ getPaymentMethodLabel() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Total de la compra -->
    <div
      class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
    >
      <div class="text-center">
        <div class="text-sm font-medium mb-1 opacity-90">Total de compra</div>
        <div class="text-4xl font-bold">S/ {{ getTotalAmount() }}</div>
        <div class="text-sm mt-2 opacity-80">
          {{ flow.addStockData.quantity }}
          {{ flow.addStockData.productData?.unit || "uni" }} × S/
          {{ flow.addStockData.cost.toFixed(2) }}
        </div>
      </div>
    </div>

    <!-- Tipo de registro -->
    <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span class="text-sm text-gray-600">Tipo de registro:</span>
        </div>
        <span class="font-semibold text-gray-900">Compra de inventario</span>
      </div>
    </div>

    <!-- Advertencia -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
      <div class="flex gap-3">
        <WarningTriangle class="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
        <div class="text-sm text-yellow-800">
          <span class="font-medium">Importante:</span> Esta acción registrará un
          gasto en tu sistema contable y aumentará el inventario del producto.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Package, Cash, Bank, WarningTriangle } from "@iconoir/vue";
import { useAddStockFlowStore } from "@/stores/Inventory/AddStockFlow.js";

const flow = useAddStockFlowStore();

// Calcular stock después de la compra
const getStockAfter = () => {
  const currentStock = Number(flow.addStockData.productData?.stock) || 0;
  const quantity = Number(flow.addStockData.quantity) || 0;
  return currentStock + quantity;
};

// Calcular monto total
const getTotalAmount = () => {
  const quantity = Number(flow.addStockData.quantity) || 0;
  const cost = Number(flow.addStockData.cost) || 0;
  return (quantity * cost).toFixed(2);
};

// Obtener etiqueta del método de pago
const getPaymentMethodLabel = () => {
  const account = flow.addStockData.account;
  if (account === "cash") return "Efectivo";
  if (account === "bank") return "Digital";
  return "No especificado";
};

// Obtener ícono del método de pago
const getPaymentIcon = () => {
  const account = flow.addStockData.account;
  if (account === "cash") return Cash;
  if (account === "bank") return Bank;
  return Package;
};
</script>
