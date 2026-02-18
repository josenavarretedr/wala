<template>
  <div v-if="localGuion" class="space-y-3">
    <!-- Hook Inicial -->
    <div
      class="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="p-4">
        <div class="flex items-baseline gap-3 mb-3">
          <span
            class="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-mono font-semibold"
          >
            {{ extractTimestamp(localGuion.hook) }}
          </span>
          <h4 class="text-base font-semibold text-gray-900">Hook Inicial</h4>
        </div>
        <div class="text-sm leading-relaxed text-gray-700">
          {{ cleanText(localGuion.hook) }}
        </div>
      </div>
    </div>

    <!-- Micro-hook 1 -->
    <div
      class="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="p-4">
        <div class="flex items-baseline gap-3 mb-3">
          <span
            class="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-mono font-semibold"
          >
            {{ extractTimestamp(localGuion.microhook_1) }}
          </span>
          <h4 class="text-sm font-semibold text-gray-900">Micro-hook #1</h4>
        </div>
        <div class="text-sm leading-relaxed text-gray-700">
          {{ cleanText(localGuion.microhook_1) }}
        </div>
      </div>
    </div>

    <!-- Desarrollo 1 -->
    <div
      class="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="p-4">
        <div class="flex items-baseline gap-3 mb-3">
          <span
            class="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono font-semibold"
          >
            {{ extractTimestamp(localGuion.desarrollo_1) }}
          </span>
          <h4 class="text-sm font-semibold text-gray-900">Desarrollo 1</h4>
        </div>
        <div class="text-sm leading-relaxed text-gray-700">
          {{ cleanText(localGuion.desarrollo_1) }}
        </div>
      </div>
    </div>

    <!-- Micro-hook 2 -->
    <div
      class="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="p-4">
        <div class="flex items-baseline gap-3 mb-3">
          <span
            class="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-mono font-semibold"
          >
            {{ extractTimestamp(localGuion.microhook_2) }}
          </span>
          <h4 class="text-sm font-semibold text-gray-900">Micro-hook #2</h4>
        </div>
        <div class="text-sm leading-relaxed text-gray-700">
          {{ cleanText(localGuion.microhook_2) }}
        </div>
      </div>
    </div>

    <!-- Desarrollo 2 -->
    <div
      class="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="p-4">
        <div class="flex items-baseline gap-3 mb-3">
          <span
            class="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono font-semibold"
          >
            {{ extractTimestamp(localGuion.desarrollo_2) }}
          </span>
          <h4 class="text-sm font-semibold text-gray-900">Desarrollo 2</h4>
        </div>
        <div class="text-sm leading-relaxed text-gray-700">
          {{ cleanText(localGuion.desarrollo_2) }}
        </div>
      </div>
    </div>

    <!-- Micro-hook 3 -->
    <div
      class="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="p-4">
        <div class="flex items-baseline gap-3 mb-3">
          <span
            class="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-mono font-semibold"
          >
            {{ extractTimestamp(localGuion.microhook_3) }}
          </span>
          <h4 class="text-sm font-semibold text-gray-900">Micro-hook #3</h4>
        </div>
        <div class="text-sm leading-relaxed text-gray-700">
          {{ cleanText(localGuion.microhook_3) }}
        </div>
      </div>
    </div>

    <!-- Micro Acción -->
    <div
      class="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="p-4">
        <div class="flex items-baseline gap-3 mb-3">
          <span
            class="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-mono font-semibold"
          >
            {{ extractTimestamp(localGuion.micro_accion) }}
          </span>
          <h4 class="text-sm font-semibold text-gray-900">Micro Acción</h4>
        </div>
        <div class="text-sm leading-relaxed text-gray-700">
          {{ cleanText(localGuion.micro_accion) }}
        </div>
      </div>
    </div>

    <!-- Cierre -->
    <div
      class="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="p-4">
        <div class="flex items-baseline gap-3 mb-3">
          <span
            class="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-mono font-semibold"
          >
            {{ extractTimestamp(localGuion.cierre) }}
          </span>
          <h4 class="text-sm font-semibold text-gray-900">Cierre</h4>
        </div>
        <div class="text-sm leading-relaxed text-gray-700">
          {{ cleanText(localGuion.cierre) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  guionCompleto: {
    type: Object,
    default: null,
  },
});

const localGuion = ref(null);

// Extraer timestamp de un texto con formato [0-5s]
const extractTimestamp = (text) => {
  if (!text) return "";
  const match = text.match(/\[([^\]]+)\]/);
  return match ? match[1] : "";
};

// Limpiar texto removiendo el timestamp
const cleanText = (text) => {
  if (!text) return "";
  return text.replace(/\[([^\]]+)\]\s*/, "").trim();
};

// Inicializar con los datos del prop
watch(
  () => props.guionCompleto,
  (newGuion) => {
    if (newGuion) {
      localGuion.value = { ...newGuion };
    }
  },
  { immediate: true, deep: true },
);
</script>
