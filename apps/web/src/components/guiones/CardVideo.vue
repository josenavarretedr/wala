<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('click')"
  >
    <!-- Header: Voz + Estado + Acciones -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex flex-wrap items-center gap-2">
        <span
          :class="['px-3 py-1 rounded-full text-xs font-semibold', vozClass]"
        >
          {{ video.voz === "A" ? "José" : "WALA" }}
        </span>
        <!-- fase badge -->
        <span
          v-if="video.fase_funnel"
          :class="[
            'px-2 py-0.5 rounded text-xs font-medium',
            {
              tofu: 'bg-amber-100 text-amber-700',
              mofu_a: 'bg-indigo-100 text-indigo-700',
              mofu_b: 'bg-blue-100 text-blue-700',
              bofu: 'bg-red-100 text-red-700',
            }[video.fase_funnel] || 'bg-gray-100 text-gray-600',
          ]"
        >
          {{ video.fase_funnel.toUpperCase() }}
        </span>
        <span
          :class="['px-2 py-0.5 rounded text-xs font-medium', rutaBadgeClass]"
        >
          {{ rutaLabel }}
        </span>
        <span
          :class="['px-2 py-0.5 rounded text-xs font-medium', estadoBadgeClass]"
        >
          {{ video.estado }}
        </span>
        <span v-if="video.es_huevo_oro" class="text-yellow-500">⭐</span>
      </div>

      <button
        @click.stop="$emit('delete', video.id)"
        class="text-red-500 hover:text-red-700 text-sm"
      >
        🗑️
      </button>
    </div>

    <!-- Tema -->
    <h3 class="font-bold text-gray-900 mb-1 line-clamp-1">{{ video.tema }}</h3>

    <!-- Gancho -->
    <div class="bg-gray-50 rounded-lg p-3 mb-3">
      <p class="text-xs text-gray-500 font-medium mb-1">Gancho:</p>
      <p class="text-sm text-gray-900 line-clamp-2 italic">
        "{{ video.gancho?.texto }}"
      </p>
    </div>

    <!-- Metadatos: tipo + narrativa + duración -->
    <div class="flex flex-wrap items-center gap-2 text-xs">
      <span :class="['px-2 py-0.5 rounded font-medium', tipoBadgeClass]">{{
        tipoLabel
      }}</span>
      <span :class="['px-2 py-0.5 rounded font-medium', narrativaBadgeClass]">{{
        narrativaLabel
      }}</span>
      <span class="text-gray-400 ml-auto">{{ video.duracion_estimada }}</span>
    </div>

    <!-- Sector contexto -->
    <p v-if="video.sector_contexto" class="text-xs text-gray-500 mt-2 truncate">
      📍 {{ video.sector_contexto }}
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({ video: { type: Object, required: true } });
defineEmits(["delete", "click"]);

const vozClass = computed(() =>
  props.video.voz === "A"
    ? "bg-purple-100 text-purple-700"
    : "bg-blue-100 text-blue-700",
);

const rutaLabel = computed(
  () =>
    ({ tecnica: "Técnica", viral: "Viral", amplia: "Amplia" })[
      props.video.ruta
    ] ||
    props.video.ruta ||
    "—",
);
const tipoLabel = computed(
  () =>
    ({ educativo: "Educativo", practico: "Práctico" })[
      props.video.tipo_contenido
    ] ||
    props.video.tipo_contenido ||
    "—",
);
const narrativaLabel = computed(
  () =>
    ({ directa: "Directa", estructurada: "Estructurada" })[
      props.video.narrativa
    ] ||
    props.video.narrativa ||
    "—",
);

const rutaBadgeClass = computed(
  () =>
    ({
      tecnica: "bg-indigo-100 text-indigo-700",
      viral: "bg-pink-100 text-pink-700",
      amplia: "bg-amber-100 text-amber-700",
    })[props.video.ruta] || "bg-gray-100 text-gray-600",
);

const tipoBadgeClass = computed(
  () =>
    ({
      educativo: "bg-purple-100 text-purple-700",
      practico: "bg-teal-100 text-teal-700",
    })[props.video.tipo_contenido] || "bg-gray-100 text-gray-600",
);

const narrativaBadgeClass = computed(
  () =>
    ({
      directa: "bg-green-100 text-green-700",
      estructurada: "bg-blue-100 text-blue-700",
    })[props.video.narrativa] || "bg-gray-100 text-gray-600",
);

const estadoBadgeClass = computed(
  () =>
    ({
      GRABANDO: "bg-blue-100 text-blue-700",
      EDITANDO: "bg-yellow-100 text-yellow-700",
      PUBLICADO: "bg-green-100 text-green-700",
    })[props.video.estado] || "bg-gray-100 text-gray-700",
);
</script>
