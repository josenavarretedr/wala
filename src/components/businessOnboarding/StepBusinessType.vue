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
      <!-- Producción -->
      <button
        type="button"
        @click="selectBusinessType('produccion')"
        :class="[
          'w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md',
          localBusinessType === 'produccion'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25'
            : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200',
        ]"
      >
        <div
          class="p-2 sm:p-3 rounded-full backdrop-blur-sm shrink-0"
          :class="
            localBusinessType === 'produccion' ? 'bg-white/20' : 'bg-blue-50'
          "
        >
          <!-- Icono Fábrica/Producción -->
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
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block"
            >Producción</span
          >
          <span class="text-xs opacity-80"
            >Transformamos materiales en productos</span
          >
        </div>
      </button>

      <!-- Servicios -->
      <button
        type="button"
        @click="selectBusinessType('servicios')"
        :class="[
          'w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md',
          localBusinessType === 'servicios'
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25'
            : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200',
        ]"
      >
        <div
          class="p-2 sm:p-3 rounded-full backdrop-blur-sm shrink-0"
          :class="
            localBusinessType === 'servicios' ? 'bg-white/20' : 'bg-green-50'
          "
        >
          <!-- Icono Servicios -->
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
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block"
            >Servicios</span
          >
          <span class="text-xs opacity-80"
            >Ofrecemos servicios especializados</span
          >
        </div>
      </button>

      <!-- Comercio -->
      <button
        type="button"
        @click="selectBusinessType('comercio')"
        :class="[
          'w-full p-4 sm:p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-row sm:flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md',
          localBusinessType === 'comercio'
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/25'
            : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200',
        ]"
      >
        <div
          class="p-2 sm:p-3 rounded-full backdrop-blur-sm shrink-0"
          :class="
            localBusinessType === 'comercio' ? 'bg-white/20' : 'bg-orange-50'
          "
        >
          <!-- Icono Comercio -->
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
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <div class="text-left sm:text-center flex-1 sm:flex-initial">
          <span class="text-base sm:text-lg font-semibold block">Comercio</span>
          <span class="text-xs opacity-80">Compramos y vendemos productos</span>
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
    produccion: "Producción",
    servicios: "Servicios",
    comercio: "Comercio",
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
