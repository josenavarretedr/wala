<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Tipo de Gasto
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Selecciona la categoría del gasto para mejor organización
      </p>
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
            @click="selectExpenseCategory('materials')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3 shadow-sm hover:shadow-md border',
              selectedCategory === 'materials'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/25 border-orange-500'
                : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border-gray-200 hover:border-orange-200',
            ]"
          >
            <div
              :class="[
                'p-3 rounded-full transition-colors duration-200',
                selectedCategory === 'materials'
                  ? 'bg-white/20'
                  : 'bg-orange-100',
              ]"
            >
              <Package
                :class="[
                  'w-6 h-6 transition-colors duration-200',
                  selectedCategory === 'materials'
                    ? 'text-white'
                    : 'text-orange-500',
                ]"
              />
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
            @click="selectExpenseCategory('labor')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3 shadow-sm hover:shadow-md border',
              selectedCategory === 'labor'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25 border-green-500'
                : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border-gray-200 hover:border-green-200',
            ]"
          >
            <div
              :class="[
                'p-3 rounded-full transition-colors duration-200',
                selectedCategory === 'labor' ? 'bg-white/20' : 'bg-green-100',
              ]"
            >
              <User
                :class="[
                  'w-6 h-6 transition-colors duration-200',
                  selectedCategory === 'labor'
                    ? 'text-white'
                    : 'text-green-500',
                ]"
              />
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
            @click="selectExpenseCategory('overhead')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3 shadow-sm hover:shadow-md border',
              selectedCategory === 'overhead'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25 border-blue-500'
                : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-gray-200 hover:border-blue-200',
            ]"
          >
            <div
              :class="[
                'p-3 rounded-full transition-colors duration-200',
                selectedCategory === 'overhead' ? 'bg-white/20' : 'bg-blue-100',
              ]"
            >
              <Settings
                :class="[
                  'w-6 h-6 transition-colors duration-200',
                  selectedCategory === 'overhead'
                    ? 'text-white'
                    : 'text-blue-500',
                ]"
              />
            </div>
            <div class="text-center">
              <span class="text-sm font-semibold block">Gastos indirectos</span>
              <span class="text-xs opacity-80">Servicios y overhead</span>
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

    <!-- Indicador visual de categoría seleccionada -->
    <div
      v-if="selectedCategory"
      class="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
        >
          <Package
            v-if="selectedCategory === 'materials'"
            class="w-5 h-5 text-orange-500"
          />
          <User
            v-else-if="selectedCategory === 'labor'"
            class="w-5 h-5 text-green-500"
          />
          <Settings
            v-else-if="selectedCategory === 'overhead'"
            class="w-5 h-5 text-blue-500"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-600">Categoría seleccionada:</p>
          <p class="text-base font-semibold text-gray-900">
            {{ getCategoryLabel(selectedCategory) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { Package, Settings, User } from "@iconoir/vue";
import { ref, watch } from "vue";

// Stores
const transactionStore = useTransactionStore();

// Variables reactivas
const selectedCategory = ref(
  transactionStore.transactionToAdd.value.category || null
);

// Observar cambios y actualizar los stores correspondientes
watch(selectedCategory, (newCategory) => {
  transactionStore.setExpenseCategory(newCategory);
});

// Función para seleccionar categoría
const selectExpenseCategory = (category) => {
  selectedCategory.value = category;
};

// Función para obtener la etiqueta de la categoría
const getCategoryLabel = (category) => {
  const labels = {
    materials: "Costos de materiales",
    labor: "Costos de personal",
    overhead: "Gastos indirectos",
  };
  return labels[category] || category;
};
</script>

<style scoped>
/* Animaciones suaves para tooltips */
.group:hover .group-hover\:opacity-100 {
  transition-delay: 200ms;
}
</style>
