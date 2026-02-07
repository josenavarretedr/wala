<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        ¿Cómo se llama tu negocio?
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Ingresa el nombre con el que tus clientes conocen tu negocio
      </p>
    </div>

    <!-- Input de nombre -->
    <div class="max-w-lg mx-auto">
      <label class="block text-sm font-medium text-gray-900 mb-2">
        Nombre del negocio
        <span class="text-red-500">*</span>
      </label>
      <input
        v-model="localNombre"
        @input="handleInput"
        type="text"
        required
        autofocus
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
        placeholder="Ej: Mi Bodega Central"
      />

      <!-- Contador de caracteres -->
      <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span
          v-if="localNombre.trim().length > 0"
          class="flex items-center gap-1 text-green-600"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          Nombre válido
        </span>
        <span v-else class="text-gray-400">Mínimo 1 carácter</span>
        <span
          :class="localNombre.length > 50 ? 'text-orange-600 font-medium' : ''"
        >
          {{ localNombre.length }}/80
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useBusinessOnboardingFlowStore } from "@/stores/businessOnboardingFlowStore";

const flowStore = useBusinessOnboardingFlowStore();

// Estado local
const localNombre = ref(flowStore.businessOnboardingData.nombre);

// Ejemplos de nombres
const examples = [
  "La Esquina Feliz",
  "Bodega San José",
  "Panadería El Sol",
  "Ferretería Central",
];

// Sincronizar con el store y convertir a mayúsculas
const handleInput = () => {
  localNombre.value = localNombre.value.toUpperCase();
  flowStore.updateField("nombre", localNombre.value);
};

// Mantener sincronizado con el store si cambia externamente
watch(
  () => flowStore.businessOnboardingData.nombre,
  (newValue) => {
    if (newValue !== localNombre.value) {
      localNombre.value = newValue;
    }
  },
);
</script>
