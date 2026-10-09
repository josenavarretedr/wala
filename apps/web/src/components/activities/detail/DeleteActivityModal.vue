<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6">
      <div class="flex items-center gap-3 mb-3 sm:mb-4">
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <WarningTriangle class="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
        </div>
        <h3 class="text-base sm:text-lg font-bold text-gray-900">
          Eliminar Actividad
        </h3>
      </div>
      <p class="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
        ¿Estás seguro de que deseas eliminar la actividad "{{ activityTitle }}"?
        Esta acción no se puede deshacer.
      </p>
      <div class="flex gap-3">
        <button
          @click="$emit('cancel')"
          :disabled="deleting"
          class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          @click="$emit('confirm')"
          :disabled="deleting"
          class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="deleting">Eliminando...</span>
          <span v-else>Eliminar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { WarningTriangle } from "@iconoir/vue";

defineProps({
  activityTitle: {
    type: String,
    required: true,
  },
  deleting: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["cancel", "confirm"]);
</script>
