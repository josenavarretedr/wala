<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        ¿Qué tipo de movimiento realizaste?
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Selecciona el tipo de transacción que corresponda a tu operación
      </p>
    </div>

    <!-- Opciones de transacción -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <!-- Opción Ingresó -->
      <div class="relative group">
        <button
          @click="handleSelectedType('income')"
          :class="[
            'w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md',
            transactionStore.transactionToAdd.value.type === 'income'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25'
              : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200',
          ]"
        >
          <div
            class="p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-sm shrink-0"
          >
            <GraphUp
              :class="[
                'w-8 h-8 transition-colors duration-200',
                transactionStore.transactionToAdd.value.type === 'income'
                  ? 'text-white'
                  : 'text-blue-500',
              ]"
            />
          </div>
          <div class="text-left sm:text-center flex-1 sm:flex-initial">
            <span class="text-base sm:text-lg font-semibold block">Venta</span>
            <span class="text-xs opacity-80">Dinero que entra</span>
          </div>
        </button>

        <!-- Tooltip de ayuda -->
        <div
          class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
        >
          <div class="text-center">
            <strong>Ejemplos:</strong> Ventas, cobros, ingresos por servicios
          </div>
        </div>
      </div>

      <!-- Opción Salió -->
      <div class="relative group">
        <button
          @click="handleSelectedType('expense')"
          :class="[
            'w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md',
            transactionStore.transactionToAdd.value.type === 'expense'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25'
              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200',
          ]"
        >
          <div
            class="p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-sm shrink-0"
          >
            <DatabaseExport
              :class="[
                'w-8 h-8 transition-colors duration-200',
                transactionStore.transactionToAdd.value.type === 'expense'
                  ? 'text-white'
                  : 'text-red-500',
              ]"
            />
          </div>
          <div class="text-left sm:text-center flex-1 sm:flex-initial">
            <span class="text-base sm:text-lg font-semibold block">Gastos</span>
            <span class="text-xs opacity-80">Dinero que sale</span>
          </div>
        </button>

        <!-- Tooltip de ayuda -->
        <div
          class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
        >
          <div class="text-center">
            <strong>Ejemplos:</strong> Compras, gastos, pagos a proveedores
          </div>
        </div>
      </div>

      <!-- Opción Cambio -->
      <div class="relative group">
        <button
          @click="handleSelectedType('transfer')"
          :class="[
            'w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md',
            transactionStore.transactionToAdd.value.type === 'transfer'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25'
              : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200 hover:border-green-200',
          ]"
        >
          <div
            class="p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-sm shrink-0"
          >
            <CoinsSwap
              :class="[
                'w-8 h-8 transition-colors duration-200',
                transactionStore.transactionToAdd.value.type === 'transfer'
                  ? 'text-white'
                  : 'text-green-500',
              ]"
            />
          </div>
          <div class="text-left sm:text-center flex-1 sm:flex-initial">
            <span class="text-base sm:text-lg font-semibold block"
              >Transferencia</span
            >
            <span class="text-xs opacity-80">Entre cuentas</span>
          </div>
        </button>

        <!-- Tooltip de ayuda -->
        <div
          class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
        >
          <div class="text-center">
            <strong>Ejemplos:</strong> Transferencias entre caja y banco
          </div>
        </div>
      </div>

      <!-- Opción Cambio -->
      <div class="relative group">
        <button
          @click="handleSelectedType('quote')"
          :class="[
            'w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md',
            transactionStore.transactionToAdd.value.type === 'quote'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/25'
              : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-200',
          ]"
        >
          <div
            class="p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-sm shrink-0"
          >
            <Bookmark
              :class="[
                'w-8 h-8 transition-colors duration-200',
                transactionStore.transactionToAdd.value.type === 'quote'
                  ? 'text-white'
                  : 'text-purple-500',
              ]"
            />
          </div>
          <div class="text-left sm:text-center flex-1 sm:flex-initial">
            <span class="text-base sm:text-lg font-semibold block"
              >Cotización</span
            >
            <span class="text-xs opacity-80">Pronto una venta</span>
          </div>
        </button>

        <!-- Tooltip de ayuda -->
        <div
          class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
        >
          <div class="text-center">
            <strong>Nota:</strong> Pronto será una venta.
          </div>
        </div>
      </div>
    </div>

    <!-- Indicador de selección -->
    <div
      v-if="transactionStore.transactionToAdd.value.type"
      class="text-center"
    >
      <div
        class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600"
      >
        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        Tipo seleccionado:
        <span class="font-medium capitalize">
          {{ getTypeLabel(transactionStore.transactionToAdd.value.type) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { GraphUp, DatabaseExport, CoinsSwap, Bookmark } from "@iconoir/vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";

const flow = useTransactionFlowStore();
const transactionStore = useTransactionStore();

const handleSelectedType = (type) => {
  transactionStore.modifyTransactionToAddType(type);
  flow.defineDynamicSteps(type);
  flow.nextStep();
};

const getTypeLabel = (type) => {
  const labels = {
    income: "Venta",
    expense: "Gasto",
    transfer: "Transferencia",
    quote: "Cotización",
  };
  return labels[type] || type;
};
</script>

<style scoped>
/* Puedes agregar estilos adicionales aquí si es necesario */
</style>
