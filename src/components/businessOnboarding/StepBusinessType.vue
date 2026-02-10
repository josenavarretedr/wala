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
        :class="[
          'w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md',
          localBusinessType === 'FOOD_PRODUCTION'
            ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-yellow-500/25'
            : 'bg-white text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-200',
        ]"
      >
        <div
          class="p-2 sm:p-3 rounded-full backdrop-blur-sm shrink-0"
          :class="
            localBusinessType === 'FOOD_PRODUCTION'
              ? 'bg-white/20'
              : 'bg-yellow-50'
          "
        >
          <!-- Icono Comida (tenedor y cuchillo) -->
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
              d="M7 7v10M11 7v10M5 7c0 1.657 1.343 3 3 3v0c1.657 0 3-1.343 3-3V7M17 6v6a3 3 0 01-3 3h0"
            />
          </svg>
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
        :class="[
          'w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md',
          localBusinessType === 'RETAIL'
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/25'
            : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200',
        ]"
      >
        <div
          class="p-2 sm:p-3 rounded-full backdrop-blur-sm shrink-0"
          :class="
            localBusinessType === 'RETAIL' ? 'bg-white/20' : 'bg-orange-50'
          "
        >
          <!-- Icono Comercio (carrito) -->
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
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 6h12"
            />
          </svg>
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
        :class="[
          'w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md',
          localBusinessType === 'APPOINTMENT_SERVICES'
            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-indigo-500/25'
            : 'bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200',
        ]"
      >
        <div
          class="p-2 sm:p-3 rounded-full backdrop-blur-sm shrink-0"
          :class="
            localBusinessType === 'APPOINTMENT_SERVICES'
              ? 'bg-white/20'
              : 'bg-indigo-50'
          "
        >
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
        :class="[
          'w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md',
          localBusinessType === 'MACHINE_SERVICES'
            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-teal-500/25'
            : 'bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-600 border border-gray-200',
        ]"
      >
        <div
          class="p-2 sm:p-3 rounded-full backdrop-blur-sm shrink-0"
          :class="
            localBusinessType === 'MACHINE_SERVICES'
              ? 'bg-white/20'
              : 'bg-teal-50'
          "
        >
          <!-- Icono Máquina (engranaje) -->
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
              d="M12 8v4l3 3M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06A2 2 0 114.27 19.2l.06-.06A1.65 1.65 0 004.66 17a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.15c.68 0 1.31-.35 1.65-.92.34-.57.28-1.27-.14-1.82L4.5 6.5A2 2 0 116.33 4.67l.06.06c.55.42 1.25.48 1.82.14.57-.34.92-.97.92-1.65V3a2 2 0 114 0v.15c0 .68.35 1.31.92 1.65.57.34 1.27.28 1.82-.14l.06-.06A2 2 0 1119.5 6.33l-.06.06c-.42.55-.48 1.25-.14 1.82.34.57.97.92 1.65.92H21a2 2 0 110 4h-.15c-.68 0-1.31.35-1.65.92-.34.57-.28 1.27.14 1.82l.06.06A2 2 0 1119.4 15z"
            />
          </svg>
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
        :class="[
          'w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md',
          localBusinessType === 'MIXED'
            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-gray-500/25'
            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 border border-gray-200',
        ]"
      >
        <div
          class="p-2 sm:p-3 rounded-full backdrop-blur-sm shrink-0"
          :class="localBusinessType === 'MIXED' ? 'bg-white/20' : 'bg-gray-50'"
        >
          <!-- Icono Mixto (cuadrícula) -->
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
              d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"
            />
          </svg>
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

const flowStore = useBusinessOnboardingFlowStore();

// Estado local
const localBusinessType = ref(flowStore.businessOnboardingData.businessType);

const selectBusinessType = (type) => {
  localBusinessType.value = type;
  flowStore.updateField("businessType", type);
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
