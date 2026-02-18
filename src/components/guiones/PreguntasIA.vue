<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-4">
      Paso 2: Preguntas de Aclaración
    </h2>

    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"
      ></div>
      <p class="text-gray-600">
        La IA está generando preguntas personalizadas...
      </p>
    </div>

    <div v-else>
      <p class="text-gray-600 mb-6">
        La IA ha generado estas preguntas para crear guiones más precisos. Por
        favor responde cada una:
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div
          v-for="(pregunta, idx) in preguntas"
          :key="idx"
          class="bg-gray-50 rounded-lg p-6 border border-gray-200"
        >
          <label class="block text-sm font-medium text-gray-900 mb-3">
            {{ idx + 1 }}. {{ pregunta }}
          </label>
          <textarea
            v-model="respuestas[idx]"
            rows="3"
            required
            placeholder="Escribe tu respuesta aquí..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <!-- Botones -->
        <div class="flex justify-between pt-4">
          <button
            type="button"
            @click="$emit('back')"
            class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            <span>Atrás</span>
          </button>

          <button
            type="submit"
            class="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
          >
            <span>Generar Guiones</span>
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              ></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  preguntas: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit", "back"]);

const respuestas = ref([]);

// Inicializar respuestas vacías cuando cambien las preguntas
watch(
  () => props.preguntas,
  (newPreguntas) => {
    if (newPreguntas && newPreguntas.length > 0) {
      respuestas.value = new Array(newPreguntas.length).fill("");
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  // Validar que todas las respuestas están llenas
  const todasRespondidas = respuestas.value.every((r) => r.trim().length > 0);

  if (!todasRespondidas) {
    alert("Por favor responde todas las preguntas");
    return;
  }

  emit("submit", respuestas.value);
};
</script>
