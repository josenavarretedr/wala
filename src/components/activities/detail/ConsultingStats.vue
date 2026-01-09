<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
    <!-- Total Asesorías -->
    <div
      class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs sm:text-sm text-gray-500 mb-1">Total Asesorías</p>
          <p class="text-2xl sm:text-3xl font-bold text-gray-900">
            {{ totalMonitoreos }}
          </p>
        </div>
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <GraphUp class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
        </div>
      </div>
    </div>

    <!-- Promedio Score -->
    <div
      v-if="averageScore !== null"
      class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs sm:text-sm text-gray-500 mb-1">Score Promedio</p>
          <p class="text-2xl sm:text-3xl font-bold text-purple-600">
            {{ averageScore.toFixed(1) }}
          </p>
        </div>
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <svg
            class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { GraphUp } from "@iconoir/vue";

defineProps({
  totalMonitoreos: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: null,
  },
});
</script>
