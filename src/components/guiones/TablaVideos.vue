<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
  >
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th
              class="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              #
            </th>
            <th
              class="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Tema / Gancho
            </th>
            <th
              class="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Voz
            </th>
            <th
              class="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Fase
            </th>
            <th
              class="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Ruta
            </th>
            <th
              class="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Huevo
            </th>
            <th
              class="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Tipo
            </th>
            <th
              class="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Narrativa
            </th>
            <th
              class="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Estado
            </th>
            <th
              class="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Dur.
            </th>
            <th
              class="px-5 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr
            v-for="(video, idx) in videos"
            :key="video.id"
            class="hover:bg-purple-50 transition-colors cursor-pointer"
            @click="$emit('edit', video.id)"
          >
            <!-- Número -->
            <td class="px-5 py-3 text-sm text-gray-500">{{ idx + 1 }}</td>

            <!-- Tema / Gancho -->
            <td class="px-5 py-3 max-w-xs">
              <div class="text-sm font-medium text-gray-900 truncate">
                {{ video.tema }}
              </div>
              <div class="text-xs text-gray-500 truncate">
                "{{ video.gancho?.texto }}"
              </div>
            </td>

            <!-- Voz -->
            <td class="px-5 py-3">
              <span
                :class="[
                  'px-2 py-1 inline-flex text-xs font-semibold rounded-full',
                  video.voz === 'A'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800',
                ]"
              >
                {{ video.voz === "A" ? "José" : "WALA" }}
              </span>
            </td>

            <!-- Fase de funnel -->
            <td class="px-5 py-3">
              <span
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
                {{ video.fase_funnel?.toUpperCase() }}
              </span>
            </td>

            <!-- Ruta -->
            <td class="px-5 py-3">
              <span
                :class="[
                  'px-2 py-0.5 rounded text-xs font-medium',
                  rutaBadgeClass(video.ruta),
                ]"
              >
                {{ rutaLabel(video.ruta) }}
              </span>
            </td>

            <!-- Huevo de oro -->
            <td class="px-5 py-3">
              <span
                v-if="video.es_huevo_oro"
                class="text-xs text-yellow-700 font-semibold"
              >
                ⭐
              </span>
            </td>

            <!-- Tipo -->
            <td class="px-5 py-3">
              <span
                :class="[
                  'px-2 py-0.5 rounded text-xs font-medium',
                  tipoBadgeClass(video.tipo_contenido),
                ]"
              >
                {{ tipoLabel(video.tipo_contenido) }}
              </span>
            </td>

            <!-- Narrativa -->
            <td class="px-5 py-3">
              <span
                :class="[
                  'px-2 py-0.5 rounded text-xs font-medium',
                  narrativaBadgeClass(video.narrativa),
                ]"
              >
                {{ narrativaLabel(video.narrativa) }}
              </span>
            </td>

            <!-- Estado -->
            <td class="px-5 py-3">
              <span
                :class="[
                  'px-2 py-1 inline-flex text-xs font-semibold rounded-full',
                  estadoBadgeClass(video.estado),
                ]"
              >
                {{ video.estado }}
              </span>
            </td>

            <!-- Duración -->
            <td class="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ video.duracion_estimada }}
            </td>

            <!-- Acciones -->
            <td class="px-5 py-3 text-right">
              <button
                @click.stop="$emit('delete', video.id)"
                class="text-red-500 hover:text-red-700 text-sm font-medium"
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
defineProps({ videos: { type: Array, required: true } });
defineEmits(["edit", "delete"]);

const rutaLabel = (v) =>
  ({ tecnica: "Técnica", viral: "Viral", amplia: "Amplia" })[v] || v || "—";
const tipoLabel = (v) =>
  ({ educativo: "Educativo", practico: "Práctico" })[v] || v || "—";
const narrativaLabel = (v) =>
  ({ directa: "Directa", estructurada: "Estructurada" })[v] || v || "—";

const rutaBadgeClass = (v) =>
  ({
    tecnica: "bg-indigo-100 text-indigo-700",
    viral: "bg-pink-100 text-pink-700",
    amplia: "bg-amber-100 text-amber-700",
  })[v] || "bg-gray-100 text-gray-600";

const tipoBadgeClass = (v) =>
  ({
    educativo: "bg-purple-100 text-purple-700",
    practico: "bg-teal-100 text-teal-700",
  })[v] || "bg-gray-100 text-gray-600";

const narrativaBadgeClass = (v) =>
  ({
    directa: "bg-green-100 text-green-700",
    estructurada: "bg-blue-100 text-blue-700",
  })[v] || "bg-gray-100 text-gray-600";

const estadoBadgeClass = (v) =>
  ({
    GRABANDO: "bg-blue-100 text-blue-800",
    EDITANDO: "bg-yellow-100 text-yellow-800",
    PUBLICADO: "bg-green-100 text-green-800",
  })[v] || "bg-gray-100 text-gray-800";
</script>
