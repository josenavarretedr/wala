<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-4">
      Paso 3: Preview de Guiones Generados
    </h2>

    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"
      ></div>
      <p class="text-gray-600">Generando guiones con IA...</p>
      <p class="text-sm text-gray-500 mt-2">Esto puede tomar 30-60 segundos</p>
    </div>

    <div v-else-if="guionData">
      <!-- Resumen -->
      <div
        class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border border-purple-100"
      >
        <h3 class="text-lg font-bold text-gray-900 mb-3">
          📊 Resumen de Generación
        </h3>
        <div class="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-700">Tema:</span>
            <div class="text-gray-900">{{ guionData.meta_analisis?.tema }}</div>
          </div>
          <div>
            <span class="font-medium text-gray-700">Sectores:</span>
            <div class="text-gray-900">{{ sectoresText }}</div>
          </div>
          <div>
            <span class="font-medium text-gray-700">Videos Generados:</span>
            <div class="text-gray-900 font-bold">
              {{ guionData.videos?.length || 0 }}
            </div>
          </div>
        </div>
      </div>

      <!-- Estrategia -->
      <div
        class="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100"
      >
        <h3 class="font-bold text-gray-900 mb-2">🎯 Estrategia Aplicada</h3>
        <p class="text-sm text-gray-700">
          {{ guionData.meta_analisis?.estrategia_aplicada }}
        </p>
      </div>

      <!-- Lista de Videos -->
      <div class="mb-6">
        <h3 class="font-bold text-gray-900 mb-4">🎬 Videos Generados</h3>
        <div class="space-y-4">
          <div
            v-for="(video, idx) in guionData.videos"
            :key="idx"
            class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:border-purple-200 transition-colors cursor-pointer"
            @click="selectedVideo = selectedVideo === idx ? null : idx"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium',
                      video.voz === 'A'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700',
                    ]"
                  >
                    Voz {{ video.voz }}
                  </span>
                  <span class="text-sm text-gray-500">{{
                    video.duracion_estimada
                  }}</span>
                </div>
                <h4 class="font-bold text-gray-900">{{ video.subtema }}</h4>
                <p class="text-sm text-gray-600 mt-1">
                  {{ video.estructura_usada }}
                </p>
              </div>

              <svg
                :class="[
                  'w-5 h-5 text-gray-400 transition-transform',
                  selectedVideo === idx && 'rotate-180',
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
            </div>

            <!-- Detalle expandible -->
            <div
              v-if="selectedVideo === idx"
              class="mt-4 pt-4 border-t border-gray-100 space-y-3"
            >
              <div>
                <span class="text-xs font-medium text-gray-700">Hook:</span>
                <p class="text-sm text-gray-900 mt-1">
                  "{{ video.hooks?.texto_visible }}"
                </p>
              </div>
              <div>
                <span class="text-xs font-medium text-gray-700"
                  >Caption (preview):</span
                >
                <p class="text-sm text-gray-700 mt-1 line-clamp-3">
                  {{ video.caption }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="$emit('back')"
          class="flex-1 sm:flex-none px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          ← Atrás
        </button>

        <button
          @click="$emit('regenerar')"
          class="flex-1 sm:flex-none px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          🔄 Regenerar
        </button>

        <button
          @click="$emit('confirm')"
          class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          ✓ Confirmar y Guardar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  guionData: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["confirm", "back", "regenerar"]);

const selectedVideo = ref(null);

const sectoresText = computed(() => {
  if (!props.guionData?.meta_analisis) return "";

  const sectores = props.guionData.meta_analisis.sectores || [
    props.guionData.meta_analisis.sector,
  ];
  return Array.isArray(sectores) ? sectores.join(", ") : sectores;
});
</script>
