<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
  >
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Tema
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Sector
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Voz
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Subtema
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Estado
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Duración
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="video in videos"
            :key="video.id"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="$emit('edit', video.id)"
          >
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900 max-w-xs truncate">
                {{ video.tema }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-700">
                {{ video.sector_ejemplo }}
              </div>
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  video.voz === 'A'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800',
                ]"
              >
                {{ video.voz === "A" ? "José" : "WALA" }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900 max-w-xs truncate">
                {{ video.subtema }}
              </div>
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  estadoBadgeClass(video.estado),
                ]"
              >
                {{ video.estado }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-700">
                {{ video.duracion_estimada }}
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <button
                @click.stop="$emit('delete', video.id)"
                class="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  videos: {
    type: Array,
    required: true,
  },
});

defineEmits(["edit", "delete"]);

const estadoBadgeClass = (estado) => {
  const classes = {
    GRABANDO: "bg-blue-100 text-blue-800",
    EDITANDO: "bg-yellow-100 text-yellow-800",
    PUBLICADO: "bg-green-100 text-green-800",
  };
  return classes[estado] || "bg-gray-100 text-gray-800";
};
</script>
