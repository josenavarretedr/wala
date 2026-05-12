<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        ¿Qué productos o servicios ofreces?
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Selecciona el rubro que mejor describe tu negocio
      </p>
    </div>

    <!-- Grid de industrias -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      <!-- Ferretería -->
      <button
        type="button"
        @click="selectIndustry('ferreteria')"
        :class="getButtonClasses('ferreteria', 'red')"
      >
        <div :class="getIconContainerClasses('ferreteria', 'red')">
          <Wrench class="w-8 h-8" />
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block"
            >Ferretería</span
          >
          <span class="text-xs opacity-80">Materiales y herramientas</span>
        </div>
      </button>

      <!-- Repostería -->
      <button
        type="button"
        @click="selectIndustry('reposteria')"
        :class="getButtonClasses('reposteria', 'pink')"
      >
        <div :class="getIconContainerClasses('reposteria', 'pink')">
          <Shop class="w-8 h-8" />
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block"
            >Repostería</span
          >
          <span class="text-xs opacity-80">Panadería y pasteles</span>
        </div>
      </button>

      <!-- Librería -->
      <button
        type="button"
        @click="selectIndustry('libreria')"
        :class="getButtonClasses('libreria', 'indigo')"
      >
        <div :class="getIconContainerClasses('libreria', 'indigo')">
          <Book class="w-8 h-8" />
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block">Librería</span>
          <span class="text-xs opacity-80">Papelería y útiles</span>
        </div>
      </button>

      <!-- Restaurante -->
      <button
        type="button"
        @click="selectIndustry('restaurante')"
        :class="getButtonClasses('restaurante', 'yellow')"
      >
        <div :class="getIconContainerClasses('restaurante', 'yellow')">
          <PizzaSlice class="w-8 h-8" />
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block"
            >Restaurante</span
          >
          <span class="text-xs opacity-80">Comida y cafetería</span>
        </div>
      </button>

      <!-- Farmacia -->
      <button
        type="button"
        @click="selectIndustry('farmacia')"
        :class="getButtonClasses('farmacia', 'teal')"
      >
        <div :class="getIconContainerClasses('farmacia', 'teal')">
          <HalfMoon class="w-8 h-8" />
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block">Farmacia</span>
          <span class="text-xs opacity-80">Botica y salud</span>
        </div>
      </button>

      <!-- Otro -->
      <button
        type="button"
        @click="selectIndustry('otro')"
        :class="getButtonClasses('otro', 'purple')"
      >
        <div :class="getIconContainerClasses('otro', 'purple')">
          <Suggestion class="w-8 h-8" />
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block">Otro</span>
          <span class="text-xs opacity-80">IA lo detectará</span>
        </div>
      </button>
    </div>

    <!-- Mensaje de confirmación -->
    <div v-if="localIndustry" class="text-center">
      <div
        class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600"
      >
        <svg
          class="w-4 h-4 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{{ getIndustryLabel(localIndustry) }} seleccionado</span>
      </div>
    </div>

    <!-- Mensaje especial para "Otro" -->
    <div
      v-if="localIndustry === 'otro'"
      class="max-w-lg mx-auto bg-purple-50 border border-purple-100 rounded-lg p-4"
    >
      <p class="text-xs text-purple-700">
        <strong>💡 Detección automática:</strong> La IA analizará los productos
        que agregues para identificar tu rubro y mejorar las sugerencias de
        clasificación.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useBusinessOnboardingFlowStore } from "@/stores/businessOnboardingFlowStore";
import { Wrench, Shop, Book, PizzaSlice, HalfMoon, Suggestion } from "@iconoir/vue";

const flowStore = useBusinessOnboardingFlowStore();

// Estado local
const localIndustry = ref(flowStore.businessOnboardingData.industry);

const selectIndustry = (industry) => {
  localIndustry.value = industry;
  flowStore.updateField("industry", industry);
};

const getButtonClasses = (industry, colorName) => {
  const isSelected = localIndustry.value === industry;

  const baseClasses =
    "w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md";

  if (isSelected) {
    const selectedClasses = {
      ferreteria: "bg-red-50 text-red-600 border-2 border-red-600",
      reposteria: "bg-pink-50 text-pink-600 border-2 border-pink-600",
      libreria: "bg-indigo-50 text-indigo-600 border-2 border-indigo-600",
      restaurante: "bg-yellow-50 text-yellow-600 border-2 border-yellow-600",
      farmacia: "bg-teal-50 text-teal-600 border-2 border-teal-600",
      otro: "bg-purple-50 text-purple-600 border-2 border-purple-600",
    };
    return [baseClasses, selectedClasses[industry]];
  }

  const hoverClasses = {
    ferreteria:
      "bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200",
    reposteria:
      "bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600 border border-gray-200",
    libreria:
      "bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200",
    restaurante:
      "bg-white text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-200",
    farmacia:
      "bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-600 border border-gray-200",
    otro: "bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200",
  };

  return [baseClasses, hoverClasses[industry]];
};

const getIconContainerClasses = (industry, colorName) => {
  const baseClasses = "p-2 sm:p-3 rounded-full backdrop-blur-sm shrink-0";

  const bgClasses = {
    ferreteria: "bg-red-50",
    reposteria: "bg-pink-50",
    libreria: "bg-indigo-50",
    restaurante: "bg-yellow-50",
    farmacia: "bg-teal-50",
    otro: "bg-purple-50",
  };

  return [baseClasses, bgClasses[industry]];
};

const getIndustryLabel = (industry) => {
  const labels = {
    ferreteria: "Ferretería",
    reposteria: "Repostería",
    libreria: "Librería",
    restaurante: "Restaurante",
    farmacia: "Farmacia",
    otro: "Otro",
  };
  return labels[industry] || industry;
};

// Mantener sincronizado con el store
watch(
  () => flowStore.businessOnboardingData.industry,
  (newValue) => {
    if (newValue !== localIndustry.value) {
      localIndustry.value = newValue;
    }
  },
);
</script>
