<template>
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <button
        @click="$emit('back')"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
      >
        <NavArrowLeft class="w-4 h-4 sm:w-5 sm:h-5" />
        <span class="text-xs sm:text-sm font-medium">Volver a Programa</span>
      </button>

      <div class="flex items-start justify-between gap-3 sm:gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <span
              :class="[
                'inline-flex items-center px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium',
                getTypeBadgeClass(activity.type),
              ]"
            >
              {{ getTypeLabel(activity.type) }}
            </span>
            <span
              v-if="activity.isRequired"
              class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium bg-red-100 text-red-700"
            >
              Obligatoria
            </span>
          </div>
          <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            {{ activity.title }}
          </h1>
          <p
            v-if="activity.description"
            class="text-xs sm:text-sm text-gray-500 mt-1"
          >
            {{ activity.description }}
          </p>
        </div>

        <!-- Botones de Acción -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            @click="$emit('edit')"
            class="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
          >
            <Edit class="w-4 h-4" />
            <span class="hidden sm:inline">Editar</span>
          </button>
          <button
            @click="$emit('delete')"
            class="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium"
          >
            <Trash class="w-4 h-4" />
            <span class="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NavArrowLeft, Edit, Trash } from "@iconoir/vue";

const props = defineProps({
  activity: {
    type: Object,
    required: true,
  },
});

defineEmits(["back", "edit", "delete"]);

function getTypeBadgeClass(type) {
  const classes = {
    session: "bg-blue-100 text-blue-700",
    consulting: "bg-purple-100 text-purple-700",
    monitoring: "bg-purple-100 text-purple-700", // Backward compatibility
    event: "bg-orange-100 text-orange-700",
  };
  return classes[type] || "bg-gray-100 text-gray-700";
}

function getTypeLabel(type) {
  const labels = {
    session: "Sesión",
    consulting: "Asesoría",
    monitoring: "Asesoría", // Backward compatibility
    event: "Evento",
  };
  return labels[type] || type;
}
</script>
