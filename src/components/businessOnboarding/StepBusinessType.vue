<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Tipo de Actividad Económica
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Selecciona el modelo de negocio que mejor describe tu actividad
        principal
      </p>
    </div>

    <!-- Grid de tipos de negocio -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      <!-- Food Production -->
      <button
        type="button"
        @click="selectBusinessType('FOOD_PRODUCTION')"
        :class="getButtonClasses('FOOD_PRODUCTION')"
      >
        <div :class="getIconContainerClasses('FOOD_PRODUCTION')">
          <!-- Icono Comida (tenedor y cuchillo) -->
          <img
            src="/icons/cubiertos.png"
            alt="Producción de alimentos"
            class="w-8 h-8"
          />
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block"
            >Producción de alimentos</span
          >
          <span class="text-xs opacity-80"
            >Elaboración y transformación de alimentos</span
          >
        </div>
      </button>

      <!-- Retail -->
      <button
        type="button"
        @click="selectBusinessType('RETAIL')"
        :class="getButtonClasses('RETAIL')"
      >
        <div :class="getIconContainerClasses('RETAIL')">
          <!-- Icono Comercio (carrito) -->
          <Cart class="w-8 h-8" fill="none" stroke="currentColor" />
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block"
            >Minorista</span
          >
          <span class="text-xs opacity-80"
            >Venta de productos al por menor</span
          >
        </div>
      </button>

      <!-- Appointment Services -->
      <button
        type="button"
        @click="selectBusinessType('APPOINTMENT_SERVICES')"
        :class="getButtonClasses('APPOINTMENT_SERVICES')"
      >
        <div :class="getIconContainerClasses('APPOINTMENT_SERVICES')">
          <!-- Icono Cita (calendario) -->
          <svg
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block"
            >Servicios con cita</span
          >
          <span class="text-xs opacity-80"
            >Profesionales y turnos programados</span
          >
        </div>
      </button>

      <!-- Machine Services -->
      <button
        type="button"
        @click="selectBusinessType('MACHINE_SERVICES')"
        :class="getButtonClasses('MACHINE_SERVICES')"
      >
        <div :class="getIconContainerClasses('MACHINE_SERVICES')">
          <!-- Icono Máquina (engranaje) -->
          <img
            src="/icons/maquina2.svg"
            alt="Producción de alimentos"
            class="w-8 h-8"
          />
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block"
            >Servicios con maquinaria</span
          >
          <span class="text-xs opacity-80"
            >Operaciones mecánicas o industriales</span
          >
        </div>
      </button>

      <!-- Mixed -->
      <button
        type="button"
        @click="selectBusinessType('MIXED')"
        :class="getButtonClasses('MIXED')"
      >
        <div :class="getIconContainerClasses('MIXED')">
          <!-- Icono Mixto (cuadrícula) -->
          <ViewGrid
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
          </ViewGrid>
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block">Mixto</span>
          <span class="text-xs opacity-80">Combinación de varios modelos</span>
        </div>
      </button>
    </div>

    <!-- Mensaje de confirmación -->
    <div v-if="localBusinessType" class="text-center">
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
        <span>{{ getTypeLabel(localBusinessType) }} seleccionado</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useBusinessOnboardingFlowStore } from "@/stores/businessOnboardingFlowStore";
import { Cart, ViewGrid } from "@iconoir/vue";

const flowStore = useBusinessOnboardingFlowStore();

// Estado local
const localBusinessType = ref(flowStore.businessOnboardingData.businessType);

const selectBusinessType = (type) => {
  localBusinessType.value = type;
  flowStore.updateField("businessType", type);
};

const getButtonClasses = (businessType) => {
  const isSelected = localBusinessType.value === businessType;

  const baseClasses =
    "w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md";

  if (isSelected) {
    const selectedClasses = {
      FOOD_PRODUCTION:
        "bg-yellow-50 text-yellow-600 border-2 border-yellow-600",
      RETAIL: "bg-orange-50 text-orange-600 border-2 border-orange-600",
      APPOINTMENT_SERVICES:
        "bg-indigo-50 text-indigo-600 border-2 border-indigo-600",
      MACHINE_SERVICES: "bg-teal-50 text-teal-600 border-2 border-teal-600",
      MIXED: "bg-gray-50 text-gray-700 border-2 border-gray-600",
    };
    return [baseClasses, selectedClasses[businessType]];
  }

  const hoverClasses = {
    FOOD_PRODUCTION:
      "bg-white text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-200",
    RETAIL:
      "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200",
    APPOINTMENT_SERVICES:
      "bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200",
    MACHINE_SERVICES:
      "bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-600 border border-gray-200",
    MIXED:
      "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 border border-gray-200",
  };

  return [baseClasses, hoverClasses[businessType]];
};

const getIconContainerClasses = (businessType) => {
  const baseClasses = "p-2 sm:p-3 rounded-full shrink-0";

  const bgClasses = {
    FOOD_PRODUCTION: "bg-yellow-50",
    RETAIL: "bg-orange-50",
    APPOINTMENT_SERVICES: "bg-indigo-50",
    MACHINE_SERVICES: "bg-teal-50",
    MIXED: "bg-gray-50",
  };

  return [baseClasses, bgClasses[businessType]];
};

const getTypeLabel = (type) => {
  const labels = {
    FOOD_PRODUCTION: "Producción de alimentos",
    RETAIL: "Minorista",
    APPOINTMENT_SERVICES: "Servicios con cita",
    MACHINE_SERVICES: "Servicios con maquinaria",
    MIXED: "Mixto",
  };
  return labels[type] || type;
};

// Mantener sincronizado con el store
watch(
  () => flowStore.businessOnboardingData.businessType,
  (newValue) => {
    if (newValue !== localBusinessType.value) {
      localBusinessType.value = newValue;
    }
  },
);
</script>
