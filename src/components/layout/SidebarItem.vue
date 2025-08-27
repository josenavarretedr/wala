<template>
  <router-link
    :to="to"
    :class="[
      'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
      active
        ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    ]"
  >
    <span class="text-lg">{{ icon }}</span>
    <span class="truncate">{{ label }}</span>

    <!-- Badge opcional -->
    <span
      v-if="badge"
      class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
    >
      {{ badge }}
    </span>
  </router-link>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  to: String,
  active: Boolean,
  badge: [String, Number],
});
</script>
