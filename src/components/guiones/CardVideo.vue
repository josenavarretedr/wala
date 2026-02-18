<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <span
          :class="[
            'px-3 py-1 rounded-full text-xs font-semibold',
            video.voz === 'A'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700',
          ]"
        >
          {{ video.voz === "A" ? "José" : "WALA" }}
        </span>
        <span
          :class="[
            'px-3 py-1 rounded-full text-xs font-semibold',
            estadoBadgeClass,
          ]"
        >
          {{ video.estado }}
        </span>
      </div>

      <button
        @click.stop="$emit('delete', video.id)"
        class="text-red-600 hover:text-red-900 text-sm"
      >
        🗑️
      </button>
    </div>

    <!-- Contenido -->
    <h3 class="font-bold text-gray-900 mb-2 line-clamp-2">
      {{ video.subtema }}
    </h3>

    <div class="space-y-1 text-sm text-gray-600 mb-3">
      <div class="flex items-center gap-2">
        <span class="font-medium">Tema:</span>
        <span class="truncate">{{ video.tema }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-medium">Sector:</span>
        <span>{{ video.sector_ejemplo }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-medium">Duración:</span>
        <span>{{ video.duracion_estimada }}</span>
      </div>
    </div>

    <!-- Hook preview -->
    <div class="bg-gray-50 rounded-lg p-3 mb-3">
      <p class="text-xs text-gray-600 font-medium mb-1">Hook:</p>
      <p class="text-sm text-gray-900 line-clamp-2">
        "{{ video.hooks?.texto_visible }}"
      </p>
    </div>

    <!-- Estructura -->
    <div class="text-xs text-gray-500">
      {{ video.estructura_usada }}
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  video: {
    type: Object,
    required: true,
  },
});

defineEmits(["delete"]);

const estadoBadgeClass = computed(() => {
  const classes = {
    GRABANDO: "bg-blue-100 text-blue-700",
    EDITANDO: "bg-yellow-100 text-yellow-700",
    PUBLICADO: "bg-green-100 text-green-700",
  };
  return classes[props.video.estado] || "bg-gray-100 text-gray-700";
});
</script>
