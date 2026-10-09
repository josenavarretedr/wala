<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Cuéntanos más sobre tu negocio
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Una breve descripción ayudará a personalizar tu experiencia
      </p>
    </div>

    <!-- Textarea de descripción -->
    <div class="max-w-lg mx-auto">
      <label class="block text-sm font-medium text-gray-900 mb-2">
        Descripción del negocio
        <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model="localDescripcion"
        @input="handleInput"
        @keydown.enter.exact.prevent="handleEnter"
        rows="5"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base resize-none"
        placeholder="Describe brevemente tu negocio: qué vendes, qué servicios ofreces, quiénes son tus clientes, qué te hace especial..."
      ></textarea>

      <!-- Contador de caracteres -->
      <div class="mt-2 flex items-center justify-between text-xs">
        <span
          :class="[
            localDescripcion.trim().length >= 10
              ? 'text-green-600 flex items-center gap-1'
              : 'text-gray-400',
          ]"
        >
          <svg
            v-if="localDescripcion.trim().length >= 10"
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          {{
            localDescripcion.trim().length >= 10
              ? "Descripción válida"
              : "Mínimo 10 caracteres"
          }}
        </span>
        <span
          :class="[
            localDescripcion.length > 200
              ? 'text-orange-600 font-medium'
              : 'text-gray-500',
          ]"
        >
          {{ localDescripcion.length }}/300
        </span>
      </div>
    </div>

    <!-- Sugerencias -->
    <div
      class="max-w-lg mx-auto bg-blue-50 border border-blue-100 rounded-lg p-4"
    >
      <p class="text-xs text-blue-700 mb-3 font-medium">
        💡 Incluye información como:
      </p>
      <ul class="space-y-2 text-xs text-gray-700">
        <li class="flex items-start gap-2">
          <svg
            class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Principales productos o servicios que ofreces</span>
        </li>
        <li class="flex items-start gap-2">
          <svg
            class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Tipo de clientes a los que atiendes</span>
        </li>
        <li class="flex items-start gap-2">
          <svg
            class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Lo que hace único a tu negocio</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useBusinessOnboardingFlowStore } from "@/stores/businessOnboardingFlowStore";

const flowStore = useBusinessOnboardingFlowStore();

// Estado local
const localDescripcion = ref(flowStore.businessOnboardingData.descripcion);

// Sincronizar con el store
const handleInput = () => {
  flowStore.updateField("descripcion", localDescripcion.value);
};

// Avanzar al siguiente paso / enviar con Enter
const handleEnter = () => {
  if (flowStore.canGoNext) {
    const btn = document.getElementById("submit-business-btn");
    if (btn) {
      btn.click();
    }
  }
};

// Mantener sincronizado con el store si cambia externamente
watch(
  () => flowStore.businessOnboardingData.descripcion,
  (newValue) => {
    if (newValue !== localDescripcion.value) {
      localDescripcion.value = newValue;
    }
  },
);
</script>
