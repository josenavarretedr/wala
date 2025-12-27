<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
    <!-- Participantes -->
    <div
      class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs sm:text-sm text-gray-500 mb-1">Participantes</p>
          <p class="text-2xl sm:text-3xl font-bold text-gray-900">
            {{ totalParticipants }}
          </p>
        </div>
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <Community class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        </div>
      </div>
    </div>

    <!-- Archivos (si existe driveLink) -->
    <div
      v-if="driveLink"
      class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1 mr-4">
          <p class="text-xs sm:text-sm text-gray-500 mb-1">Archivos</p>
          <a
            :href="driveLink"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs sm:text-sm text-green-600 hover:text-green-700 underline break-all"
          >
            Ver en Google Drive
          </a>
        </div>
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <svg
            class="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Community } from "@iconoir/vue";

defineProps({
  totalParticipants: {
    type: Number,
    default: 0,
  },
  driveLink: {
    type: String,
    default: null,
  },
});
</script>
