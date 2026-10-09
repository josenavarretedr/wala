<template>
  <button
    @click="$emit('click')"
    :disabled="disabled"
    :class="[
      'w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 pulse-hover',
      disabled
        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 hover:shadow-md',
    ]"
  >
    <!-- Icono -->
    <div
      :class="[
        'w-10 h-10 rounded-lg flex items-center justify-center',
        disabled ? 'bg-gray-200' : 'bg-white shadow-sm',
      ]"
    >
      <span class="text-lg">{{ icon }}</span>
    </div>

    <!-- Contenido -->
    <div class="flex-1 min-w-0">
      <p
        :class="[
          'text-sm font-medium truncate',
          disabled ? 'text-gray-400' : 'text-gray-900',
        ]"
      >
        {{ label }}
      </p>
      <p
        v-if="description"
        :class="[
          'text-xs truncate',
          disabled ? 'text-gray-300' : 'text-gray-500',
        ]"
      >
        {{ description }}
      </p>
    </div>

    <!-- Flecha (opcional) -->
    <div
      v-if="showArrow"
      :class="[
        'transition-transform duration-200',
        disabled ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-600',
      ]"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>

    <!-- Badge opcional -->
    <span
      v-if="badge"
      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
    >
      {{ badge }}
    </span>
  </button>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  description: String,
  disabled: Boolean,
  showArrow: {
    type: Boolean,
    default: false,
  },
  badge: [String, Number],
});

defineEmits(["click"]);
</script>

<style scoped>
.pulse-hover:hover:not(:disabled) {
  animation: pulse 0.3s ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.group:hover .group-hover\:text-gray-600 {
  color: #4b5563;
}
</style>
