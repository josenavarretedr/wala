<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
  >
    <button
      @click="$emit('toggle')"
      class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
    >
      <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
      <svg
        :class="[
          'w-5 h-5 text-gray-400 transition-transform',
          open ? 'rotate-180' : '',
        ]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    </button>
    <div v-show="open" class="px-6 pb-6">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  open: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle"]);
</script>
