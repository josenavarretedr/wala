<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="$router.push('/guiones/dashboard')"
          class="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg
            class="w-4 h-4 mr-1.5"
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
          Dashboard
        </button>

        <div v-if="video">
          <h1 class="text-4xl font-bold text-gray-900 mb-3 leading-tight">
            {{ video.subtema }}
          </h1>

          <div class="flex flex-wrap items-center gap-3 mb-2">
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                video.voz === 'A'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700',
              ]"
            >
              {{ video.voz === "A" ? "José Navarrete" : "WALA" }}
            </span>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                estadoBadgeClass(video.estado),
              ]"
            >
              {{ video.estado }}
            </span>
          </div>

          <p class="text-gray-500 text-sm">
            {{ video.tema }} • {{ video.sector_ejemplo }}
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"
        ></div>
      </div>

      <!-- Contenido principal -->
      <div v-else-if="video" class="space-y-4">
        <!-- 1. Configuración -->
        <CollapsibleSection
          title="Configuración"
          :open="openSections.configuracion"
          @toggle="toggleSection('configuracion')"
        >
          <div class="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide"
                >Estado</label
              >
              <select
                v-model="editableData.estado"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
              >
                <option value="GRABANDO">GRABANDO</option>
                <option value="EDITANDO">EDITANDO</option>
                <option value="PUBLICADO">PUBLICADO</option>
              </select>
            </div>

            <div>
              <label
                class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide"
                >Duración (segundos)</label
              >
              <input
                v-model.number="duracionNumero"
                type="number"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
              />
            </div>

            <div class="md:col-span-2">
              <label
                class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide"
                >Tipo de Contenido</label
              >
              <select
                v-model="editableData.tipo_contenido"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
              >
                <option value="STORYTELLING">STORYTELLING</option>
                <option value="ENTREVISTA">ENTREVISTA</option>
                <option value="EXPLICACION">EXPLICACION</option>
              </select>
            </div>
          </div>

          <div class="mb-4">
            <label
              class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide"
              >Comentarios / Observaciones</label
            >
            <textarea
              v-model="editableData.comentarios"
              rows="3"
              placeholder="Agrega notas o pendientes..."
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm shadow-sm"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              @click="handleSave"
              :disabled="saving"
              class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm disabled:bg-gray-400 shadow-sm transition-all"
            >
              {{ saving ? "Guardando..." : "Guardar Cambios" }}
            </button>
            <button
              @click="handleDelete"
              class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-sm transition-all"
            >
              Eliminar
            </button>
          </div>
        </CollapsibleSection>

        <!-- 2. Información General -->
        <CollapsibleSection
          title="Información General"
          :open="openSections.info"
          @toggle="toggleSection('info')"
        >
          <div class="space-y-4">
            <div>
              <h4
                class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Estructura
              </h4>
              <p class="text-base text-gray-900">
                {{ video.estructura_usada }}
              </p>
            </div>
            <div>
              <h4
                class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Propuesta de Valor
              </h4>
              <p class="text-base text-gray-900">
                {{ video.propuesta_valor_enfocada }}
              </p>
            </div>
            <div>
              <h4
                class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
              >
                Razón de Estructura
              </h4>
              <p class="text-sm text-gray-700 leading-relaxed">
                {{ video.razon_estructura }}
              </p>
            </div>

            <div class="pt-4 border-t border-gray-100">
              <h4
                class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3"
              >
                Hooks
              </h4>
              <div class="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="font-medium text-gray-700">Texto:</span>
                  <p class="text-gray-600 mt-1">
                    "{{ video.hooks?.texto_visible }}"
                  </p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Visual:</span>
                  <p class="text-gray-600 mt-1">{{ video.hooks?.visual }}</p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Audio:</span>
                  <p class="text-gray-600 mt-1">
                    {{ video.hooks?.audio_trending || "N/A" }}
                  </p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Estrategia:</span>
                  <p class="text-gray-600 mt-1">
                    {{ video.hooks?.estrategia_hook }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <!-- 3. Caption -->
        <CollapsibleSection
          title="Caption"
          :open="openSections.caption"
          @toggle="toggleSection('caption')"
        >
          <div
            class="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap"
          >
            {{ video.caption }}
          </div>
        </CollapsibleSection>

        <!-- 4. Guion -->
        <CollapsibleSection
          title="Guion"
          :open="openSections.guion"
          @toggle="toggleSection('guion')"
        >
          <EditorGuion :guion-completo="video.guion_completo" />
        </CollapsibleSection>

        <!-- 5. Notas de Producción -->
        <CollapsibleSection
          title="Notas de Producción"
          :open="openSections.produccion"
          @toggle="toggleSection('produccion')"
        >
          <div class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4
                  class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                >
                  Locación
                </h4>
                <p class="text-gray-900">
                  {{ video.notas_produccion?.locacion_sugerida }}
                </p>
              </div>
              <div>
                <h4
                  class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                >
                  Props
                </h4>
                <p class="text-gray-900">
                  {{ video.notas_produccion?.props_necesarios }}
                </p>
              </div>
              <div>
                <h4
                  class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                >
                  Tono de Voz
                </h4>
                <p class="text-gray-900">
                  {{ video.notas_produccion?.tono_voz }}
                </p>
              </div>
              <div>
                <h4
                  class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                >
                  Momento
                </h4>
                <p class="text-gray-900">
                  {{ video.notas_produccion?.momento_del_dia }}
                </p>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-100">
              <h4
                class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3"
              >
                Métricas Esperadas
              </h4>
              <div class="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="font-medium text-gray-700">Objetivo:</span>
                  <p class="text-gray-600 mt-1">
                    {{ video.metricas_esperadas?.objetivo_principal }}
                  </p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Interacción:</span>
                  <p class="text-gray-600 mt-1">
                    {{ video.metricas_esperadas?.tipo_interaccion }}
                  </p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Audiencia:</span>
                  <p class="text-gray-600 mt-1">
                    {{ video.metricas_esperadas?.audiencia_target }}
                  </p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Retención:</span>
                  <p class="text-gray-600 mt-1">
                    {{ video.metricas_esperadas?.retencion_esperada }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGuionesStore } from "@/stores/guionesStore";
import { useToast } from "@/composables/useToast";

import EditorGuion from "@/components/guiones/EditorGuion.vue";
import CollapsibleSection from "@/components/guiones/CollapsibleSection.vue";

const route = useRoute();
const router = useRouter();
const guionesStore = useGuionesStore();
const toast = useToast();

const videoId = route.params.videoId;
const video = ref(null);
const loading = ref(true);
const saving = ref(false);

const openSections = reactive({
  configuracion: true,
  info: false,
  caption: false,
  guion: false,
  produccion: false,
});

const toggleSection = (section) => {
  openSections[section] = !openSections[section];
};

const editableData = reactive({
  estado: "",
  duracion_estimada: "",
  tipo_contenido: "",
  comentarios: "",
});

// Computed para manejar duración sin la "s"
const duracionNumero = computed({
  get() {
    const val = editableData.duracion_estimada;
    if (typeof val === "string") {
      return parseInt(val.replace("s", "")) || 0;
    }
    return val || 0;
  },
  set(newVal) {
    editableData.duracion_estimada = newVal;
  },
});

const estadoBadgeClass = (estado) => {
  const classes = {
    GRABANDO: "bg-blue-100 text-blue-700",
    EDITANDO: "bg-yellow-100 text-yellow-700",
    PUBLICADO: "bg-green-100 text-green-700",
  };
  return classes[estado] || "bg-gray-100 text-gray-700";
};

const handleSave = async () => {
  try {
    saving.value = true;

    const updates = {
      estado: editableData.estado,
      duracion_estimada: duracionNumero.value,
      tipo_contenido: editableData.tipo_contenido,
      comentarios: editableData.comentarios,
    };

    await guionesStore.updateVideoInStore(videoId, updates);

    // Actualizar el objeto local
    Object.assign(video.value, updates);

    toast.success("Cambios guardados");
  } catch (error) {
    toast.error("Error al guardar: " + error.message);
  } finally {
    saving.value = false;
  }
};

const handleDelete = async () => {
  if (
    !confirm(
      "¿Estás seguro de eliminar este video? Esta acción no se puede deshacer.",
    )
  ) {
    return;
  }

  try {
    await guionesStore.deleteVideoFromStore(videoId);
    toast.success("Video eliminado");
    router.push("/guiones/dashboard");
  } catch (error) {
    toast.error("Error al eliminar: " + error.message);
  }
};

onMounted(async () => {
  try {
    loading.value = true;
    video.value = await guionesStore.loadVideo(videoId);

    // Cargar datos editables
    editableData.estado = video.value.estado || "GRABANDO";
    editableData.duracion_estimada = video.value.duracion_estimada || "";
    editableData.tipo_contenido = video.value.tipo_contenido || "STORYTELLING";
    editableData.comentarios = video.value.comentarios || "";
  } catch (error) {
    toast.error("Error al cargar video: " + error.message);
    router.push("/guiones/dashboard");
  } finally {
    loading.value = false;
  }
});
</script>
