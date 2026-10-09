<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        {{ flow.isSaleType ? "Resumen de Venta" : "Resumen de Merma" }}
      </h1>
      <p class="text-sm text-gray-500">
        {{ formatDate(new Date()) }}
      </p>
    </div>

    <!-- Preview de la salida -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Total destacado (solo para ventas) -->
      <div
        v-if="flow.isSaleType"
        class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 text-center"
      >
        <div class="text-3xl font-bold mb-1">
          S/ {{ getTotal().toFixed(2) }}
        </div>
        <div class="text-green-100 text-sm">Total de la venta</div>
      </div>

      <!-- Banner de merma -->
      <div
        v-else
        class="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 text-center"
      >
        <div class="text-2xl font-bold mb-1">
          <WarningTriangle class="w-8 h-8 inline-block mb-2" />
        </div>
        <div class="text-red-100 text-sm">Merma de inventario</div>
      </div>

      <!-- Información de tipo y cuenta -->
      <div class="p-4 border-b border-gray-100">
        <div class="grid grid-cols-2 gap-3">
          <!-- Tipo de salida -->
          <div
            :class="[
              'rounded-xl p-4 text-center',
              flow.isSaleType ? 'bg-green-50' : 'bg-red-50',
            ]"
          >
            <div
              :class="[
                'w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center',
                flow.isSaleType ? 'bg-green-500' : 'bg-red-500',
              ]"
            >
              <component
                :is="flow.isSaleType ? DollarCircle : WarningTriangle"
                class="w-4 h-4 text-white"
              />
            </div>
            <div
              :class="[
                'text-sm font-medium',
                flow.isSaleType ? 'text-green-700' : 'text-red-700',
              ]"
            >
              {{ getTypeLabel }}
            </div>
          </div>

          <!-- Método de pago (solo para ventas) -->
          <div
            v-if="flow.isSaleType"
            :class="[
              'rounded-xl p-4 text-center',
              flow.removeStockData.account === 'cash'
                ? 'bg-green-50'
                : 'bg-purple-50',
            ]"
          >
            <div
              :class="[
                'w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center',
                flow.removeStockData.account === 'cash'
                  ? 'bg-green-500'
                  : 'bg-purple-500',
              ]"
            >
              <component :is="getAccountIcon" class="w-4 h-4 text-white" />
            </div>
            <div
              :class="[
                'text-sm font-medium',
                flow.removeStockData.account === 'cash'
                  ? 'text-green-700'
                  : 'text-purple-700',
              ]"
            >
              {{ getAccountLabel }}
            </div>
          </div>

          <!-- Placeholder para mermas -->
          <div v-else class="bg-gray-50 rounded-xl p-4 text-center">
            <div
              class="w-8 h-8 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center"
            >
              <MinusCircle class="w-4 h-4 text-white" />
            </div>
            <div class="text-sm font-medium text-gray-700">Sin ingreso</div>
          </div>
        </div>
      </div>

      <!-- Detalles del producto -->
      <div class="p-4">
        <h3
          class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
        >
          <Package class="w-5 h-5 text-gray-600" />
          Detalles del producto
        </h3>

        <div class="bg-gray-50 rounded-xl p-4">
          <div class="space-y-3">
            <!-- Nombre del producto -->
            <div class="flex justify-between items-start">
              <div class="flex-1 min-w-0 pr-3">
                <div class="font-semibold text-gray-900 mb-1">
                  {{ flow.removeStockData.productData?.description }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ flow.removeStockData.quantity }}
                  {{ flow.removeStockData.productData?.unit || "uni" }}
                  <span v-if="flow.isSaleType">
                    × S/ {{ flow.removeStockData.price.toFixed(2) }}
                  </span>
                </div>
              </div>
              <div v-if="flow.isSaleType" class="text-right">
                <div class="font-bold text-gray-900">
                  S/ {{ getTotal().toFixed(2) }}
                </div>
              </div>
            </div>

            <!-- Stock resultante -->
            <div class="pt-3 border-t border-gray-200">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">Stock actual:</span>
                <span class="font-medium text-gray-900">
                  {{ flow.removeStockData.productData?.stock }}
                  {{ flow.removeStockData.productData?.unit || "uni" }}
                </span>
              </div>
              <div class="flex justify-between items-center text-sm mt-1">
                <span class="text-gray-600">Stock después de la salida:</span>
                <span class="font-semibold text-blue-600">
                  {{ getStockAfter() }}
                  {{ flow.removeStockData.productData?.unit || "uni" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Nota informativa -->
    <div
      :class="[
        'rounded-xl p-4 border',
        flow.isSaleType
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200',
      ]"
    >
      <div class="flex items-start gap-3">
        <div
          :class="[
            'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
            flow.isSaleType ? 'bg-green-500' : 'bg-red-500',
          ]"
        >
          <ShieldQuestion class="w-3 h-3 text-white" />
        </div>
        <div>
          <div
            :class="[
              'font-medium mb-1',
              flow.isSaleType ? 'text-green-800' : 'text-red-800',
            ]"
          >
            Confirma los datos
          </div>
          <div
            :class="[
              'text-sm',
              flow.isSaleType ? 'text-green-700' : 'text-red-700',
            ]"
          >
            {{
              flow.isSaleType
                ? "Esta acción registrará la venta y actualizará el inventario"
                : "Esta acción registrará la merma y reducirá el stock disponible"
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  DollarCircle,
  WarningTriangle,
  Package,
  ShieldQuestion,
  Coins,
  SmartphoneDevice,
  MinusCircle,
} from "@iconoir/vue";
import { useRemoveStockFlowStore } from "@/stores/Inventory/RemoveStockFlow.js";

const flow = useRemoveStockFlowStore();

const getTotal = () => {
  const quantity = Number(flow.removeStockData.quantity) || 0;
  const price = Number(flow.removeStockData.price) || 0;
  return quantity * price;
};

const getStockAfter = () => {
  const currentStock = Number(flow.removeStockData.productData?.stock) || 0;
  const quantity = Number(flow.removeStockData.quantity) || 0;

  console.log("🔍 Calculando stock después:", {
    currentStock,
    quantity,
    result: Math.max(currentStock - quantity, 0),
  });

  return Math.max(currentStock - quantity, 0);
};

const getTypeLabel = computed(() => {
  return flow.isSaleType ? "Venta" : "Merma";
});

const getAccountLabel = computed(() => {
  const account = flow.removeStockData.account;
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
  };
  return labels[account] || "Cuenta";
});

const getAccountIcon = computed(() => {
  const account = flow.removeStockData.account;
  return account === "cash" ? Coins : SmartphoneDevice;
});

const formatDate = (date) => {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
</script>
