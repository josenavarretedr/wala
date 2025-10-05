<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Detalles del Gasto
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Describe qué necesitó el negocio y cuánto costó
      </p>
    </div>

    <!-- Formulario de gasto -->
    <div class="space-y-6">
      <!-- Campo de descripción -->
      <div class="space-y-3">
        <label class="text-lg font-semibold text-gray-800">
          Descripción del Gasto
        </label>
        <div class="relative">
          <input
            v-model="description"
            type="text"
            placeholder="Ej: Compra de materiales, servicios básicos, etc."
            class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
          />
          <div
            class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"
          ></div>
        </div>
        <p p class="text-xs text-gray-500">
          Sé específico en la descripción para facilitar el seguimiento de tus
          gastos
        </p>
      </div>

      <!-- Campo de costo -->
      <div class="space-y-3">
        <label class="text-lg font-semibold text-gray-800">Costo (S/)</label>
        <div class="relative">
          <input
            v-model.number="cost"
            @keyup.enter="addExpenseHandler"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-center font-medium text-gray-700 focus:border-red-500 focus:outline-none transition-colors"
          />
          <div
            class="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"
          ></div>
        </div>
        <p class="text-xs text-gray-500">Ingresa el monto total del gasto</p>
      </div>
    </div>

    <!-- Categorías de gastos -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-800">
        Categorías de Gastos Comunes
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Costos de materiales -->
        <div class="relative group">
          <button
            @click="selectExpenseCategory('Costos de materiales')"
            class="w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3 shadow-sm hover:shadow-md bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200"
          >
            <div class="p-3 rounded-full bg-orange-100">
              <Package class="w-6 h-6 text-orange-500" />
            </div>
            <div class="text-center">
              <span class="text-sm font-semibold block"
                >Costos de materiales</span
              >
              <span class="text-xs opacity-80">Insumos | Mercadería</span>
            </div>
          </button>

          <!-- Tooltip de ayuda -->
          <div
            class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div class="text-center">
              <strong>Ejemplos:</strong> Materias primas, productos terminados,
              insumos directos
            </div>
          </div>
        </div>

        <!-- Costos de personal -->
        <div class="relative group">
          <button
            @click="selectExpenseCategory('Costos de personal')"
            class="w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3 shadow-sm hover:shadow-md bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200 hover:border-green-200"
          >
            <div class="p-3 rounded-full bg-green-100">
              <User class="w-6 h-6 text-green-500" />
            </div>
            <div class="text-center">
              <span class="text-sm font-semibold block"
                >Costos de personal</span
              >
              <span class="text-xs opacity-80">Sueldos y beneficios</span>
            </div>
          </button>

          <!-- Tooltip de ayuda -->
          <div
            class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div class="text-center">
              <strong>Ejemplos:</strong> Sueldos, jornal, día
            </div>
          </div>
        </div>

        <!-- Gastos indirectos -->
        <div class="relative group">
          <button
            @click="selectExpenseCategory('Gastos indirectos')"
            class="w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3 shadow-sm hover:shadow-md bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200"
          >
            <div class="p-3 rounded-full bg-blue-100">
              <Settings class="w-6 h-6 text-blue-500" />
            </div>
            <div class="text-center">
              <span class="text-sm font-semibold block">Gastos indirectos</span>
              <span class="text-xs opacity-80">Servicios y </span>
            </div>
          </button>

          <!-- Tooltip de ayuda -->
          <div
            class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div class="text-center">
              <strong>Ejemplos:</strong> Luz, agua, internet, alquiler,
              combustible
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón de continuar -->
    <!-- <button
      @click="addExpenseHandler"
      :disabled="!description || !cost || cost <= 0"
      class="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
    >
      <FastArrowRight class="w-5 h-5" />
      Continuar
    </button> -->

    <!-- Preview del gasto -->
    <!-- <div
      v-if="description && cost > 0"
      class="bg-red-50 rounded-xl p-4 border border-red-200"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center"
        >
          <DatabaseExport class="w-5 h-5 text-white" />
        </div>
        <div class="flex-1">
          <div class="font-semibold text-red-800 mb-1">
            {{ description }}
          </div>
          <div class="text-sm text-red-700">
            Gasto: S/ {{ cost.toFixed(2) }}
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { useExpensesStore } from "@/stores/expensesStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import {
  FastArrowRight,
  DatabaseExport,
  ShieldQuestion,
  Package,
  Settings,
  User,
} from "@iconoir/vue";
import { ref } from "vue";

const description = ref("");
const cost = ref(null);

const expensesStore = useExpensesStore();
const transactionStore = useTransactionStore();
const flow = useTransactionFlowStore();

const selectExpenseCategory = (category) => {
  description.value = category;
};

const addExpenseHandler = async () => {
  if (!description.value || !cost.value || cost.value <= 0) {
    return;
  }

  transactionStore.modifyTransactionExpenseDescriptionAndCost(
    description.value,
    cost.value
  );

  expensesStore.modifyExpenseToAddDescription(description.value);
  expensesStore.modifyExpenseToAddCost(cost.value);
  expensesStore.modifyExpenseToAddAccount(
    transactionStore.transactionToAdd.value.account
  );

  flow.nextStep();
};
</script>

<style scoped>
/* Prevent zoom on iOS inputs */
@media screen and (max-width: 480px) {
  input[type="number"],
  input[type="text"] {
    font-size: 16px;
  }
}
</style>
