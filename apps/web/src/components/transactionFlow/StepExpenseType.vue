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
                >Insumos para vender o producir</span
              >
              <span class="text-xs opacity-80"
                >Ingredientes, mercadería, empaques.</span
              >
            </div>
          </button>
        </div>

        <!-- Sueldo de Personal de Producción -->
        <div class="relative group">
          <button
            @click="selectExpenseCategory('labor')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row items-center gap-3 shadow-sm hover:shadow-md border',
              selectedCategory === 'labor' && !selectedPreset
                ? 'bg-purple-500 text-white shadow-purple-500/25 border-purple-500'
                : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border-gray-200 hover:border-purple-200',
            ]"
          >
            <div
              :class="[
                'p-3 rounded-full transition-colors duration-200 shrink-0',
                selectedCategory === 'labor' && !selectedPreset
                  ? 'bg-white/20'
                  : 'bg-purple-100',
              ]"
            >
              <User
                :class="[
                  'w-8 h-8 transition-colors duration-200',
                  selectedCategory === 'labor' && !selectedPreset
                    ? 'text-white'
                    : 'text-purple-500',
                ]"
              />
            </div>
            <div class="text-left flex-1">
              <span class="text-base font-semibold block"
                >Sueldos del equipo</span
              >
              <span class="text-xs opacity-80"
                >Sueldos, jornales, comisiones, honorarios.</span
              >
            </div>
          </button>
        </div>

        <!-- Gastos Generales (Overhead) -->
        <div class="relative group">
          <button
            @click="selectExpenseCategory('overhead')"
            :class="[
              'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row items-center gap-3 shadow-sm hover:shadow-md border',
              selectedCategory === 'overhead' && !selectedPreset
                ? 'bg-blue-500 text-white shadow-blue-500/25 border-blue-500'
                : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-gray-200 hover:border-blue-200',
            ]"
          >
            <div
              :class="[
                'p-3 rounded-full transition-colors duration-200 shrink-0',
                selectedCategory === 'overhead' && !selectedPreset
                  ? 'bg-white/20'
                  : 'bg-blue-100',
              ]"
            >
              <Settings
                :class="[
                  'w-8 h-8 transition-colors duration-200',
                  selectedCategory === 'overhead' && !selectedPreset
                    ? 'text-white'
                    : 'text-blue-500',
                ]"
              />
            </div>
            <div class="text-left flex-1">
              <span class="text-base font-semibold block"
                >Gastos para que el negocio funcione</span
              >
              <span class="text-xs opacity-80"
                >Alquiler, servicios, internet, mantenimiento, marketing,
                etc</span
              >
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Negocio y Dueño (Método WALA - Área 1, visible para todos los negocios) -->
    <div class="space-y-4 pt-3 border-t border-gray-100">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">
            Negocio y Dueño
          </h3>
          <p class="text-xs text-gray-500">
            Separa el dinero de tu negocio de tus finanzas personales y familiares
          </p>
        </div>
        <span
          class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 mt-1"
        >
          Método WALA
        </span>
      </div>

      <div class="grid grid-cols-1 gap-3">
        <!-- Salario del dueño -->
        <button
          type="button"
          @click="selectOwnerFamilyPreset('owner_salary')"
          :class="[
            'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex flex-row items-center gap-3 shadow-sm hover:shadow-md border',
            selectedPreset === 'owner_salary'
              ? 'bg-emerald-600 text-white shadow-emerald-600/25 border-emerald-600'
              : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border-gray-200 hover:border-emerald-200',
          ]"
        >
          <div
            :class="[
              'p-3 rounded-full transition-colors duration-200 shrink-0',
              selectedPreset === 'owner_salary' ? 'bg-white/20' : 'bg-emerald-100',
            ]"
          >
            <Wallet
              :class="[
                'w-7 h-7 transition-colors duration-200',
                selectedPreset === 'owner_salary' ? 'text-white' : 'text-emerald-600',
              ]"
            />
          </div>
          <div class="text-left flex-1">
            <span class="text-base font-semibold block">Salario del dueño</span>
            <span class="text-xs opacity-80"
              >Tu sueldo fijo asignado como gestor o trabajador (gasto operativo)</span
            >
          </div>
        </button>

        <!-- Salario a familiares -->
        <button
          type="button"
          @click="selectOwnerFamilyPreset('family_salary')"
          :class="[
            'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex flex-row items-center gap-3 shadow-sm hover:shadow-md border',
            selectedPreset === 'family_salary'
              ? 'bg-teal-600 text-white shadow-teal-600/25 border-teal-600'
              : 'bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-700 border-gray-200 hover:border-teal-200',
          ]"
        >
          <div
            :class="[
              'p-3 rounded-full transition-colors duration-200 shrink-0',
              selectedPreset === 'family_salary' ? 'bg-white/20' : 'bg-teal-100',
            ]"
          >
            <Group
              :class="[
                'w-7 h-7 transition-colors duration-200',
                selectedPreset === 'family_salary' ? 'text-white' : 'text-teal-600',
              ]"
            />
          </div>
          <div class="text-left flex-1">
            <span class="text-base font-semibold block">Salario a familiares</span>
            <span class="text-xs opacity-80"
              >Pago por el trabajo real de un familiar en el negocio (gasto laboral)</span
            >
          </div>
        </button>

        <!-- Retiro personal del dueño -->
        <button
          type="button"
          @click="selectOwnerFamilyPreset('owner_draw')"
          :class="[
            'w-full p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex flex-row items-center gap-3 shadow-sm hover:shadow-md border',
            selectedPreset === 'owner_draw'
              ? 'bg-amber-600 text-white shadow-amber-600/25 border-amber-600'
              : 'bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-700 border-gray-200 hover:border-amber-200',
          ]"
        >
          <div
            :class="[
              'p-3 rounded-full transition-colors duration-200 shrink-0',
              selectedPreset === 'owner_draw' ? 'bg-white/20' : 'bg-amber-100',
            ]"
          >
            <CoinsSwap
              :class="[
                'w-7 h-7 transition-colors duration-200',
                selectedPreset === 'owner_draw' ? 'text-white' : 'text-amber-600',
              ]"
            />
          </div>
          <div class="text-left flex-1">
            <span class="text-base font-semibold block"
              >Retiro personal del dueño</span
            >
            <span class="text-xs opacity-80"
              >Dinero que sacas para gastos personales/hogar (descuenta caja, no altera tu ganancia)</span
            >
          </div>
        </button>
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
          <Wallet
            v-if="selectedPreset === 'owner_salary'"
            class="w-5 h-5 text-emerald-600"
          />
          <Group
            v-else-if="selectedPreset === 'family_salary'"
            class="w-5 h-5 text-teal-600"
          />
          <CoinsSwap
            v-else-if="selectedPreset === 'owner_draw' || selectedCategory === 'owner_draw'"
            class="w-5 h-5 text-amber-600"
          />
          <Package
            v-else-if="selectedCategory === 'materials'"
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
import { Package, Settings, User, Wallet, Group, CoinsSwap } from "@iconoir/vue";
import { ref, watch, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Stores
const transactionStore = useTransactionStore();
const businessStore = useBusinessStore();

// Computed
const isCommerceBusiness = computed(() => {
  return businessStore.business?.businessType === "RETAIL";
});

// Variables reactivas
const selectedCategory = ref(
  transactionStore.transactionToAdd.value.category || null,
);
const selectedPreset = ref(
  transactionStore.transactionToAdd.value.expensePreset || null,
);

// Observar cambios y actualizar los stores correspondientes
watch(selectedCategory, (newCategory) => {
  transactionStore.setExpenseCategory(newCategory);
});

// Resetear selección si se cambió a comercio y tenía labor genérico seleccionado
watch(isCommerceBusiness, (isCommerce) => {
  if (isCommerce && selectedCategory.value === "labor" && !selectedPreset.value) {
    selectedCategory.value = null;
  }
});

// Función para seleccionar categoría común
const selectExpenseCategory = (category) => {
  selectedPreset.value = null;
  selectedCategory.value = category;
  transactionStore.setExpenseCategory(category);
  transactionStore.setExpenseSubcategory(null);
  transactionStore.transactionToAdd.value.expensePreset = null;
  transactionStore.transactionToAdd.value.statementLine = null;
};

// Función para seleccionar presets de Negocio y Dueño (Área 1)
const selectOwnerFamilyPreset = (preset) => {
  selectedPreset.value = preset;
  transactionStore.transactionToAdd.value.expensePreset = preset;

  if (preset === "owner_salary") {
    selectedCategory.value = "labor";
    transactionStore.setExpenseCategory("labor");
    transactionStore.setExpenseSubcategory("owner_salary");
    transactionStore.transactionToAdd.value.statementLine = null;
  } else if (preset === "family_salary") {
    selectedCategory.value = "labor";
    transactionStore.setExpenseCategory("labor");
    transactionStore.setExpenseSubcategory("family_salary");
    transactionStore.transactionToAdd.value.statementLine = null;
  } else if (preset === "owner_draw") {
    selectedCategory.value = "owner_draw";
    transactionStore.setExpenseCategory("owner_draw");
    transactionStore.setExpenseSubcategory("personal_withdrawal");
    transactionStore.transactionToAdd.value.statementLine = "owner_draw";
  }
};

onMounted(() => {
  const preset = route.query.preset;
  const category = route.query.category;

  if (preset && ["owner_salary", "family_salary", "owner_draw"].includes(preset)) {
    selectOwnerFamilyPreset(preset);
  } else if (category === "owner_draw") {
    selectOwnerFamilyPreset("owner_draw");
  } else if (category && ["materials", "labor", "overhead"].includes(category)) {
    selectExpenseCategory(category);
  }
});

// Función para obtener la etiqueta de la categoría
const getCategoryLabel = (category) => {
  if (selectedPreset.value === "owner_salary") return "Salario del dueño";
  if (selectedPreset.value === "family_salary") return "Salario a familiares";
  if (selectedPreset.value === "owner_draw" || category === "owner_draw") {
    return "Retiro personal del dueño";
  }

  const labels = {
    materials: "Costos de materiales",
    labor: "Sueldo de Personal de Producción",
    overhead: "Gastos Generales (Overhead)",
  };
  return labels[category] || category;
};

// Función para obtener la descripción de la categoría
const getCategoryDescription = (category) => {
  if (selectedPreset.value === "owner_salary") {
    return "Remuneración fija que el negocio te paga por tu trabajo";
  }
  if (selectedPreset.value === "family_salary") {
    return "Remuneración formal a familiares que trabajan en el negocio";
  }
  if (selectedPreset.value === "owner_draw" || category === "owner_draw") {
    return "Salida de efectivo para uso personal fuera del gasto operativo";
  }

  const descriptions = {
    materials: "Insumos | Mercadería",
    labor: "Chef, cocineros, especialistas",
    overhead: "Todos los demás gastos operativos",
  };
  return descriptions[category] || "";
};

// Función para obtener los ejemplos de la categoría
const getCategoryExamples = (category) => {
  if (selectedPreset.value === "owner_salary") {
    return "Se incluye en el Estado de Resultados como costo/gasto operativo de mano de obra";
  }
  if (selectedPreset.value === "family_salary") {
    return "Ayuda a visibilizar el costo laboral real cuando la familia apoya en el negocio";
  }
  if (selectedPreset.value === "owner_draw" || category === "owner_draw") {
    return "Descuenta tu Caja/Banco pero no distorsiona la Ganancia Neta del negocio";
  }

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
