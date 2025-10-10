<template>
  <router-link
    class="block bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:border-gray-200 hover:bg-gray-50 cursor-pointer"
  >
    <div class="border-gray-100">
      <div class="flex items-center gap-1 text-sm text-blue-500">
        <svg
          class="w-3 h-3 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span>Acceder al historial completo</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { ArrowRight } from "@iconoir/vue";

// Icono de historial usando SVG inline
const HistoryIcon = {
  template: `
    <svg
      class="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  `,
};
</script>

<style scoped>
/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects para touch devices */
@media (hover: hover) {
  .hover\:shadow-md:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
}

/* Estabilidad de layout */
.shrink-0 {
  flex-shrink: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .inline-flex.gap-1 {
    min-width: fit-content;
  }
}
</style>
