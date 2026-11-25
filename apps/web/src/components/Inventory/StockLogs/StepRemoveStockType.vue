<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        ¿Qué tipo de salida es?
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Selecciona el motivo por el que sale este producto del inventario
      </p>
    </div>

    <!-- Opciones de tipo de salida -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-lg mx-auto"
    >
      <!-- Opción Venta -->
      <div class="relative group">
        <button
          @click="handleSelectType('sell')"
          :class="[
            'w-full p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-4 shadow-sm hover:shadow-md',
            flow.removeStockData.stockLogType === 'sell'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25'
              : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200 hover:border-green-200',
          ]"
        >
          <div class="p-3 rounded-full bg-white/20 backdrop-blur-sm">
            <DollarCircle
              :class="[
                'w-8 h-8 transition-colors duration-200',
                flow.removeStockData.stockLogType === 'sell'
                  ? 'text-white'
                  : 'text-green-500',
              ]"
            />
          </div>
          <div class="text-center">
            <span class="text-lg font-semibold block">Venta</span>
            <span class="text-xs opacity-80">Se vendió el producto</span>
          </div>
        </button>

        <!-- Tooltip de ayuda -->
        <div
          class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
        >
          <div class="text-center">
            <strong>Incluye:</strong> Productos vendidos a clientes
          </div>
        </div>
      </div>

      <!-- Opción Merma/Desperdicio -->
      <div class="relative group">
        <button
          @click="handleSelectType('waste')"
          :class="[
            'w-full p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-4 shadow-sm hover:shadow-md',
            flow.removeStockData.stockLogType === 'waste'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25'
              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200',
          ]"
        >
          <div class="p-3 rounded-full bg-white/20 backdrop-blur-sm">
            <WarningTriangle
              :class="[
                'w-8 h-8 transition-colors duration-200',
                flow.removeStockData.stockLogType === 'waste'
                  ? 'text-white'
                  : 'text-red-500',
              ]"
            />
          </div>
          <div class="text-center">
            <span class="text-lg font-semibold block">Merma</span>
            <span class="text-xs opacity-80">Producto dañado/perdido</span>
          </div>
        </button>

        <!-- Tooltip de ayuda -->
        <div
          class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
        >
          <div class="text-center">
            <strong>Incluye:</strong> Productos dañados, vencidos o perdidos
          </div>
        </div>
      </div>
    </div>

    <!-- Sub-motivo obligatorio cuando es Merma (BA Área 4.3) -->
    <div
      v-if="flow.removeStockData.stockLogType === 'waste'"
      class="max-w-lg mx-auto bg-red-50/70 border border-red-200 rounded-2xl p-4 sm:p-5 space-y-4"
    >
      <div>
        <h3 class="text-sm font-bold text-red-900">
          ¿Cuál es el motivo de la merma? *
        </h3>
        <p class="text-xs text-red-700 mt-0.5">
          Esta baja se registrará en tu Estado de Resultados sin afectar Caja/Banco.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <button
          v-for="reason in wasteReasons"
          :key="reason.value"
          type="button"
          @click="flow.setWasteReason(reason.value)"
          :class="[
            'p-3 rounded-xl border text-left transition-all cursor-pointer',
            flow.removeStockData.wasteReason === reason.value
              ? 'bg-red-600 text-white border-red-600 shadow-sm'
              : 'bg-white text-gray-700 border-red-200 hover:border-red-400 hover:bg-red-50',
          ]"
        >
          <span class="text-xs sm:text-sm font-bold block">{{ reason.label }}</span>
          <span class="text-[11px] opacity-80 block mt-0.5">{{ reason.hint }}</span>
        </button>
      </div>

      <div>
        <label class="block text-xs font-semibold text-red-900 mb-1">
          ¿Qué decisión o acción tomaste? (opcional)
        </label>
        <input
          v-model="wasteResolutionModel"
          type="text"
          placeholder="Ej: Descartado del almacén, liquidado al 50%, reclamo interno"
          class="w-full px-3.5 py-2.5 rounded-xl border border-red-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none"
        />
      </div>
    </div>

    <!-- Indicador de selección -->
    <div v-if="flow.removeStockData.stockLogType" class="text-center">
      <div
        class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600"
      >
        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        Tipo seleccionado:
        <span class="font-medium">
          {{ getTypeLabel(flow.removeStockData.stockLogType) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { DollarCircle, WarningTriangle } from "@iconoir/vue";
import { useRemoveStockFlowStore } from "@/stores/Inventory/RemoveStockFlow.js";

const flow = useRemoveStockFlowStore();

const wasteReasons = [
  { value: "damaged", label: "Producto dañado", hint: "Rotura, golpe o falla" },
  { value: "expired", label: "Vencido / Malogrado", hint: "Caducidad o deterioro" },
  { value: "obsolete", label: "Sin rotación", hint: "Liquidado o descontinuado" },
  { value: "loss", label: "Pérdida / Robo", hint: "Extravío o merma oculta" },
];

const wasteResolutionModel = computed({
  get: () => flow.removeStockData.wasteResolution || "",
  set: (val) => flow.setWasteResolution(val),
});

const handleSelectType = (type) => {
  flow.setStockLogType(type);
  if (type === "sell") {
    flow.nextStep();
  }
};

const getTypeLabel = (type) => {
  const labels = {
    sell: "Venta",
    waste: "Merma/Desperdicio",
  };
  return labels[type] || type;
};
</script>
