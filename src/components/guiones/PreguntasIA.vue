<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-4">
      Preguntas de Aclaración
    </h2>

    <!-- Resumen del plan (collapsible) -->
    <div
      v-if="planResumen"
      class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6 border border-purple-100"
    >
      <button
        type="button"
        class="flex items-center justify-between w-full text-left"
        @click="planAbierto = !planAbierto"
      >
        <span class="text-sm font-bold text-gray-900"
          >Plan de videos confirmado</span
        >
        <svg
          :class="[
            'w-4 h-4 text-gray-500 transition-transform',
            planAbierto && 'rotate-180',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
      <div v-if="planAbierto" class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="(video, idx) in planResumen"
          :key="idx"
          :class="[
            'px-2 py-1 rounded text-xs font-medium',
            video.es_huevo_oro
              ? 'bg-amber-100 text-amber-700'
              : video.fase_funnel?.toLowerCase() === 'tofu'
                ? 'bg-green-100 text-green-700'
                : video.fase_funnel?.toLowerCase() === 'mofu'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700',
          ]"
        >
          #{{ video.numero }} {{ video.ruta }}/{{ video.narrativa }}
          <template v-if="video.es_huevo_oro"> (Huevo Oro)</template>
        </span>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"
      ></div>
      <p class="text-gray-600">
        La IA está generando preguntas personalizadas...
      </p>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <p class="text-gray-600">
          Responde cada pregunta o pide sugerencias a la IA:
        </p>
        <button
          type="button"
          :disabled="loadingIA"
          @click="handleSugerirTodas"
          class="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            v-if="loadingIA"
            class="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <svg
            v-else
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 3l3.057-3 11.943 12-11.943 12L5 21l9-9-9-9z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M19 3l1 2M21 7l-2 1M17 3l-1 2"
            />
          </svg>
          {{ loadingIA ? "Generando..." : "Sugerir todas con IA" }}
        </button>
      </div>

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
          <!-- Botón sparkles individual -->
          <div class="flex justify-end mt-2">
            <button
              type="button"
              :disabled="loadingIA"
              @click="handleSugerirTodas(idx)"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                v-if="loadingIA && idxActivo === idx"
                class="w-3.5 h-3.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              <svg
                v-else
                class="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM5 15l.75 2.25L8 18l-2.25.75L5 21l-.75-2.25L2 18l2.25-.75L5 15zM19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z"
                />
              </svg>
              Sugerir con IA
            </button>
          </div>
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
import { ref, watch } from "vue";
import { sugerirRespuestas } from "@/services/iaGuionesService";

const props = defineProps({
  preguntas: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  planResumen: {
    type: Array,
    default: null,
  },
  datosIniciales: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["submit", "back"]);

const respuestas = ref([]);
const planAbierto = ref(false);
const loadingIA = ref(false);
const idxActivo = ref(null);

const handleSugerirTodas = async (idx = null) => {
  if (loadingIA.value) return;
  try {
    loadingIA.value = true;
    idxActivo.value = idx;
    const sugeridas = await sugerirRespuestas(
      props.preguntas,
      props.datosIniciales || {},
      props.planResumen || [],
    );
    sugeridas.forEach((resp, i) => {
      if (resp) respuestas.value[i] = resp;
    });
  } catch (e) {
    console.error("Error al sugerir respuestas:", e);
  } finally {
    loadingIA.value = false;
    idxActivo.value = null;
  }
};

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
