<template>
  <router-link
    :to="to"
    :class="[
      'flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200',
      active
        ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    ]"
  >
    <span class="text-sm sm:text-base md:text-lg flex-shrink-0">{{
      icon
    }}</span>
    <span class="truncate">{{ label }}</span>

    <!-- Badge opcional -->
    <span
      v-if="badge"
      class="ml-auto inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 flex-shrink-0"
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
