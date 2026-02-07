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

      <div class="grid grid-cols-1 gap-4">
        <!-- Costos de materiales -->
        <div class="relative group">
          <button
            @click="selectExpenseCategory('materials')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row items-center gap-3 shadow-sm hover:shadow-md border',
              selectedCategory === 'materials'
                ? 'bg-orange-500 text-white shadow-orange-500/25 border-orange-500'
                : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border-gray-200 hover:border-orange-200',
            ]"
          >
            <div
              :class="[
                'p-3 rounded-full transition-colors duration-200 shrink-0',
                selectedCategory === 'materials'
                  ? 'bg-white/20'
                  : 'bg-orange-100',
              ]"
            >
              <Package
                :class="[
                  'w-8 h-8 transition-colors duration-200',
                  selectedCategory === 'materials'
                    ? 'text-white'
                    : 'text-orange-500',
                ]"
              />
            </div>
            <div class="text-left flex-1">
              <span class="text-base font-semibold block"
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

        <!-- Sueldo de Personal de Producción -->
        <div v-if="!isCommerceBusiness" class="relative group">
          <button
            @click="selectExpenseCategory('labor')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row items-center gap-3 shadow-sm hover:shadow-md border',
              selectedCategory === 'labor'
                ? 'bg-purple-500 text-white shadow-purple-500/25 border-purple-500'
                : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border-gray-200 hover:border-purple-200',
            ]"
          >
            <div
              :class="[
                'p-3 rounded-full transition-colors duration-200 shrink-0',
                selectedCategory === 'labor' ? 'bg-white/20' : 'bg-purple-100',
              ]"
            >
              <User
                :class="[
                  'w-8 h-8 transition-colors duration-200',
                  selectedCategory === 'labor'
                    ? 'text-white'
                    : 'text-purple-500',
                ]"
              />
            </div>
            <div class="text-left flex-1">
              <span class="text-base font-semibold block"
                >Sueldo de Personal de Producción</span
              >
              <span class="text-xs opacity-80"
                >Chef, cocineros, especialistas</span
              >
            </div>
          </button>

          <!-- Tooltip de ayuda -->
          <div
            class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div class="text-center">
              <strong>Ejemplos:</strong> Personal que participa directamente en
              la producción o prestación del servicio
            </div>
          </div>
        </div>

        <!-- Gastos Generales (Overhead) -->
        <div class="relative group">
          <button
            @click="selectExpenseCategory('overhead')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row items-center gap-3 shadow-sm hover:shadow-md border',
              selectedCategory === 'overhead'
                ? 'bg-blue-500 text-white shadow-blue-500/25 border-blue-500'
                : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-gray-200 hover:border-blue-200',
            ]"
          >
            <div
              :class="[
                'p-3 rounded-full transition-colors duration-200 shrink-0',
                selectedCategory === 'overhead' ? 'bg-white/20' : 'bg-blue-100',
              ]"
            >
              <Settings
                :class="[
                  'w-8 h-8 transition-colors duration-200',
                  selectedCategory === 'overhead'
                    ? 'text-white'
                    : 'text-blue-500',
                ]"
              />
            </div>
            <div class="text-left flex-1">
              <span class="text-base font-semibold block"
                >Gastos Generales (Overhead)</span
              >
              <span class="text-xs opacity-80"
                >Todos los demás gastos operativos</span
              >
            </div>
          </button>

          <!-- Tooltip de ayuda -->
          <div
            class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div class="text-center">
              <strong>Ejemplos:</strong> Alquiler, luz, agua, internet, sueldo
              administrativo, marketing, combustible
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
      <div class="flex items-start gap-3">
        <div
          class="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
        >
          <Package
            v-if="selectedCategory === 'materials'"
            class="w-5 h-5 text-orange-500"
          />
          <User
            v-else-if="selectedCategory === 'labor'"
            class="w-5 h-5 text-purple-500"
          />
          <Settings
            v-else-if="selectedCategory === 'overhead'"
            class="w-5 h-5 text-blue-500"
          />
        </div>
        <div class="flex-1 min-w-0 space-y-1">
          <p class="text-sm text-gray-600">Categoría seleccionada:</p>
          <p class="text-base font-semibold text-gray-900">
            {{ getCategoryLabel(selectedCategory) }}
          </p>
          <p class="text-xs text-gray-500">
            {{ getCategoryDescription(selectedCategory) }}
          </p>
          <p class="text-xs text-gray-400 italic">
            {{ getCategoryExamples(selectedCategory) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useBusinessStore } from "@/stores/businessStore";
import { Package, Settings, User } from "@iconoir/vue";
import { ref, watch, computed } from "vue";

// Stores
const transactionStore = useTransactionStore();
const businessStore = useBusinessStore();

// Computed
const isCommerceBusiness = computed(() => {
  return businessStore.business?.businessType === "comercio";
});

// Variables reactivas
const selectedCategory = ref(
  transactionStore.transactionToAdd.value.category || null,
);

// Observar cambios y actualizar los stores correspondientes
watch(selectedCategory, (newCategory) => {
  transactionStore.setExpenseCategory(newCategory);
});

// Resetear selección si se cambió a comercio y tenía labor seleccionado
watch(isCommerceBusiness, (isCommerce) => {
  if (isCommerce && selectedCategory.value === "labor") {
    selectedCategory.value = null;
  }
});

// Función para seleccionar categoría
const selectExpenseCategory = (category) => {
  selectedCategory.value = category;
};

// Función para obtener la etiqueta de la categoría
const getCategoryLabel = (category) => {
  const labels = {
    materials: "Costos de materiales",
    labor: "Sueldo de Personal de Producción",
    overhead: "Gastos Generales (Overhead)",
  };
  return labels[category] || category;
};

// Función para obtener la descripción de la categoría
const getCategoryDescription = (category) => {
  const descriptions = {
    materials: "Insumos | Mercadería",
    labor: "Chef, cocineros, especialistas",
    overhead: "Todos los demás gastos operativos",
  };
  return descriptions[category] || "";
};

// Función para obtener los ejemplos de la categoría
const getCategoryExamples = (category) => {
  const examples = {
    materials:
      "Ejemplos: Materias primas, productos terminados, insumos directos",
    labor:
      "Ejemplos: Personal que participa directamente en la producción o prestación del servicio",
    overhead:
      "Ejemplos: Alquiler, luz, agua, internet, sueldo administrativo, marketing, combustible",
  };
  return examples[category] || "";
};
</script>

<style scoped>
/* Animaciones suaves para tooltips */
.group:hover .group-hover\:opacity-100 {
  transition-delay: 200ms;
}
</style>
