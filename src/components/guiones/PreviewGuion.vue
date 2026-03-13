<template>
  <div>
    <!-- ═══════════════════════════════════════════ -->
    <!-- MODO BATCH: Tabla de distribución editable -->
    <!-- ═══════════════════════════════════════════ -->
    <template v-if="modo === 'batch'">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Paso 2: Plan de Videos
      </h2>
      <p class="text-sm text-gray-500 mb-6">
        La IA generó esta distribución. Puedes ajustar cada video antes de
        continuar.
      </p>

      <!-- Resumen estrategia -->
      <div
        v-if="metaPrevio"
        class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 mb-6 border border-purple-100"
      >
        <h3 class="text-sm font-bold text-gray-900 mb-2">Estrategia IA</h3>
        <p class="text-sm text-gray-700 mb-2">{{ metaPrevio.estrategia }}</p>
        <p class="text-xs text-gray-500">{{ metaPrevio.razon_distribucion }}</p>
        <div class="flex gap-2 mt-3">
          <span
            class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
          >
            Fase: {{ metaPrevio.fase_inferida }}
          </span>
        </div>
      </div>

      <!-- Tabla editable -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6"
      >
        <!-- Header desktop -->
        <div
          class="hidden md:grid md:grid-cols-7 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase"
        >
          <div>#</div>
          <div>Ruta</div>
          <div>Tipo</div>
          <div>Narrativa</div>
          <div>Voz</div>
          <div>Embudo</div>
          <div>Enfoque</div>
        </div>

        <!-- Filas -->
        <div
          v-for="(video, idx) in editablePlan"
          :key="idx"
          :class="[
            'md:grid md:grid-cols-7 gap-2 px-4 py-3 items-center border-b border-gray-50',
            video.es_huevo_oro ? 'bg-amber-50/50' : '',
          ]"
        >
          <!-- Numero -->
          <div class="flex items-center gap-2 mb-2 md:mb-0">
            <span class="text-sm font-bold text-gray-700">{{
              video.numero
            }}</span>
            <span
              v-if="video.es_huevo_oro"
              class="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium"
              >Huevo Oro</span
            >
          </div>

          <!-- Ruta -->
          <div class="mb-2 md:mb-0">
            <label class="text-xs text-gray-500 md:hidden">Ruta</label>
            <select
              v-model="editablePlan[idx].ruta"
              class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-purple-500"
            >
              <option value="tecnica">Técnica</option>
              <option value="viral">Viral</option>
              <option value="amplia">Amplia</option>
            </select>
          </div>

          <!-- Tipo -->
          <div class="mb-2 md:mb-0">
            <label class="text-xs text-gray-500 md:hidden">Tipo</label>
            <select
              v-model="editablePlan[idx].tipo"
              class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-purple-500"
            >
              <option value="educativo">Educativo</option>
              <option value="practico">Práctico</option>
            </select>
          </div>

          <!-- Narrativa (con validación BoFu/HuevoOro) -->
          <div class="mb-2 md:mb-0 relative">
            <label class="text-xs text-gray-500 md:hidden">Narrativa</label>
            <select
              v-model="editablePlan[idx].narrativa"
              :disabled="video.es_huevo_oro"
              :class="[
                'w-full px-2 py-1.5 border rounded-lg text-xs focus:ring-1 focus:ring-purple-500',
                video.es_huevo_oro
                  ? 'border-amber-300 bg-amber-50 text-amber-700 cursor-not-allowed'
                  : 'border-gray-200',
              ]"
            >
              <option value="directa" :disabled="video.es_huevo_oro">
                Directa
              </option>
              <option value="estructurada">Estructurada</option>
            </select>
            <p
              v-if="video.es_huevo_oro"
              class="text-[10px] text-amber-600 mt-0.5"
            >
              Huevo de Oro requiere Estructurada
            </p>
          </div>

          <!-- Voz -->
          <div class="mb-2 md:mb-0">
            <label class="text-xs text-gray-500 md:hidden">Voz</label>
            <select
              v-model="editablePlan[idx].voz"
              class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-purple-500"
            >
              <option value="A">A (José)</option>
              <option value="B">B (WALA)</option>
            </select>
          </div>

          <!-- Embudo (solo visual) -->
          <div class="mb-2 md:mb-0">
            <label class="text-xs text-gray-500 md:hidden">Embudo</label>
            <span
              :class="[
                'px-2 py-1 rounded text-xs font-medium inline-block',
                faseBadgeClass(video.fase_funnel),
              ]"
              >{{ video.fase_funnel }}</span
            >
          </div>

          <!-- Enfoque -->
          <div class="text-xs text-gray-600 leading-tight">
            <label class="text-xs text-gray-500 md:hidden">Enfoque</label>
            {{ video.enfoque_breve }}
          </div>
        </div>
      </div>

      <!-- Botones batch -->
      <div class="flex justify-between">
        <button
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
          Volver
        </button>
        <button
          @click="handleConfirmPlan"
          class="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
        >
          Confirmar plan y continuar
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
    </template>

    <!-- ═══════════════════════════════════════════ -->
    <!-- MODO GUIONES: Vista de guiones generados   -->
    <!-- ═══════════════════════════════════════════ -->
    <template v-else>
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        Preview de Guiones Generados
      </h2>

      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-12"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"
        ></div>
        <template v-if="progreso">
          <p
            v-if="progreso.fase === 'estructura'"
            class="text-gray-600 font-medium"
          >
            Analizando estrategia y planificando videos...
          </p>
          <p
            v-else-if="progreso.fase === 'video'"
            class="text-gray-600 font-medium"
          >
            Generando guion {{ progreso.videoActual }} de
            {{ progreso.totalVideos }}...
          </p>
          <p
            v-else-if="progreso.fase === 'ensamblando'"
            class="text-gray-600 font-medium"
          >
            Ensamblando resultado final...
          </p>
          <!-- Barra de progreso -->
          <div v-if="progreso.totalVideos" class="w-64 mt-4">
            <div class="bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                :style="{
                  width: `${Math.round(((progreso.fase === 'estructura' ? 0 : progreso.videoActual) / (progreso.totalVideos + 1)) * 100)}%`,
                }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 mt-1 text-center">
              {{
                progreso.fase === "estructura"
                  ? "Paso 1"
                  : `Video ${progreso.videoActual}`
              }}
              / {{ progreso.totalVideos }} videos
            </p>
          </div>
        </template>
        <template v-else>
          <p class="text-gray-600">Generando guiones con IA...</p>
          <p class="text-sm text-gray-500 mt-2">
            Esto puede tomar 30-60 segundos
          </p>
        </template>
      </div>

      <div v-else-if="guionData">
        <!-- Resumen -->
        <div
          class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border border-purple-100"
        >
          <h3 class="text-lg font-bold text-gray-900 mb-3">
            Resumen de Generación
          </h3>
          <div class="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700">Tema:</span>
              <div class="text-gray-900">
                {{ guionData.meta_analisis?.tema }}
              </div>
            </div>
            <div>
              <span class="font-medium text-gray-700">Sector:</span>
              <div class="text-gray-900">
                {{ guionData.meta_analisis?.sector_contexto || "—" }}
              </div>
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
          v-if="guionData.meta_analisis?.estrategia_aplicada"
          class="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100"
        >
          <h3 class="font-bold text-gray-900 mb-2">Estrategia Aplicada</h3>
          <p class="text-sm text-gray-700">
            {{ guionData.meta_analisis.estrategia_aplicada }}
          </p>
        </div>

        <!-- Lista de Videos -->
        <div class="mb-6">
          <h3 class="font-bold text-gray-900 mb-4">Videos Generados</h3>
          <div class="space-y-4">
            <div
              v-for="(video, idx) in guionData.videos"
              :key="idx"
              class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:border-purple-200 transition-colors cursor-pointer"
              @click="selectedVideo = selectedVideo === idx ? null : idx"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- Badges: voz + ruta + tipo + narrativa -->
                  <div class="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      :class="[
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        video.voz === 'A'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700',
                      ]"
                    >
                      Voz {{ video.voz }}
                    </span>
                    <span
                      v-if="video.ruta"
                      class="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 uppercase"
                    >
                      {{ video.ruta }}
                    </span>
                    <span
                      v-if="video.tipo_contenido"
                      class="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700 uppercase"
                    >
                      {{ video.tipo_contenido }}
                    </span>
                    <span
                      v-if="video.narrativa"
                      class="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700 uppercase"
                    >
                      {{ video.narrativa }}
                    </span>
                    <span
                      v-if="video.fase_funnel || video.etapa_funnel"
                      :class="[
                        'px-2 py-0.5 rounded-full text-xs font-medium uppercase',
                        faseBadgeClass(video.fase_funnel || video.etapa_funnel),
                      ]"
                    >
                      {{
                        (
                          video.fase_funnel ||
                          video.etapa_funnel ||
                          ""
                        ).toUpperCase()
                      }}
                    </span>
                    <span
                      class="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700"
                    >
                      🎬 {{ getFormatoVisual(video) }}
                    </span>
                    <span class="text-xs text-gray-400">{{
                      video.duracion_estimada
                    }}</span>
                  </div>

                  <!-- Gancho -->
                  <p class="text-sm font-medium text-gray-900 italic">
                    "{{ video.gancho?.texto || "—" }}"
                  </p>
                </div>

                <svg
                  :class="[
                    'w-5 h-5 text-gray-400 transition-transform ml-3 shrink-0',
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
                <!-- Componentes del gancho -->
                <div
                  v-if="video.gancho?.componentes"
                  class="grid grid-cols-3 gap-3"
                >
                  <div class="bg-purple-50 rounded-lg p-3">
                    <p class="text-xs font-semibold text-purple-700 mb-1">
                      Qué verás
                    </p>
                    <p class="text-xs text-gray-700">
                      {{ video.gancho.componentes.que_veras }}
                    </p>
                  </div>
                  <div class="bg-purple-50 rounded-lg p-3">
                    <p class="text-xs font-semibold text-purple-700 mb-1">
                      Para quién
                    </p>
                    <p class="text-xs text-gray-700">
                      {{ video.gancho.componentes.para_quien }}
                    </p>
                  </div>
                  <div class="bg-purple-50 rounded-lg p-3">
                    <p class="text-xs font-semibold text-purple-700 mb-1">
                      Por qué ahora
                    </p>
                    <p class="text-xs text-gray-700">
                      {{ video.gancho.componentes.por_que_ahora }}
                    </p>
                  </div>
                </div>

                <!-- CTA -->
                <div v-if="video.cta?.texto_completo">
                  <span class="text-xs font-medium text-gray-700">CTA:</span>
                  <p class="text-sm text-gray-900 mt-1">
                    {{ video.cta.texto_completo }}
                  </p>
                </div>

                <!-- Formato visual -->
                <div class="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-xs font-medium text-gray-700"
                      >Formato visual:</span
                    >
                    <p class="text-sm text-gray-900 mt-1">
                      {{ getFormatoVisual(video) }}
                    </p>
                  </div>
                  <div>
                    <span class="text-xs font-medium text-gray-700"
                      >Coherencia formato:</span
                    >
                    <p class="text-sm text-gray-900 mt-1">
                      {{
                        getFormatoCoherente(video) ? "✓ Coherente" : "⚠ Revisar"
                      }}
                    </p>
                  </div>
                </div>

                <!-- Caption preview -->
                <div v-if="video.caption">
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
            Atrás
          </button>

          <button
            @click="$emit('regenerar')"
            class="flex-1 sm:flex-none px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Regenerar
          </button>

          <button
            @click="$emit('confirm')"
            class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Confirmar y Guardar
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  guionData: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  progreso: {
    type: Object,
    default: null,
  },
  modo: {
    type: String,
    default: "guiones",
    validator: (v) => ["batch", "guiones"].includes(v),
  },
  planVideos: {
    type: Array,
    default: () => [],
  },
  metaPrevio: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["confirm", "back", "regenerar", "confirm-plan"]);

const selectedVideo = ref(null);

// Copia editable del plan para modo batch
const editablePlan = ref([]);

watch(
  () => props.planVideos,
  (plan) => {
    if (plan?.length) {
      editablePlan.value = plan.map((v) => ({
        ...v,
        narrativa: v.es_huevo_oro ? "estructurada" : v.narrativa,
      }));
    }
  },
  { immediate: true },
);

// Forzar estructurada cuando se marca Huevo de Oro
watch(
  editablePlan,
  (plan) => {
    plan.forEach((v) => {
      if (v.es_huevo_oro && v.narrativa === "directa") {
        v.narrativa = "estructurada";
      }
    });
  },
  { deep: true },
);

function faseBadgeClass(fase) {
  const map = {
    tofu: "bg-green-100 text-green-700",
    mofu: "bg-yellow-100 text-yellow-700",
    bofu: "bg-red-100 text-red-700",
  };
  return map[fase?.toLowerCase()] || "bg-gray-100 text-gray-700";
}

function inferirFormatoVisual(video) {
  const fase = (
    video.fase_funnel ||
    video.etapa_funnel ||
    "tofu"
  ).toLowerCase();
  if (video.es_huevo_oro || fase === "mofu" || fase === "bofu") {
    return "Cara a cámara + B-roll";
  }
  if (video.tipo_contenido === "practico") {
    return "Tutorial over-shoulder";
  }
  if (video.narrativa === "estructurada") {
    const porRuta = {
      tecnica: "Pizarra / libreta",
      viral: "Dueto / reacción",
      amplia: "Metáfora física",
    };
    return porRuta[video.ruta] || "Cara a cámara + B-roll";
  }
  const porRutaDirecta = {
    tecnica: "Cara a cámara + B-roll",
    viral: "Pantalla dividida (VS / antes-después)",
    amplia: "Green screen (dashboard/comentarios)",
  };
  return porRutaDirecta[video.ruta] || "Cara a cámara + B-roll";
}

function getFormatoVisual(video) {
  return video.formato_visual_recomendado || inferirFormatoVisual(video);
}

function getFormatoCoherente(video) {
  if (video.formato_coherente !== undefined)
    return Boolean(video.formato_coherente);
  return true;
}

function handleConfirmPlan() {
  emit("confirm-plan", [...editablePlan.value]);
}
</script>
