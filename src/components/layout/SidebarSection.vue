<template>
  <div class="mb-3 sm:mb-4 md:mb-6">
    <!-- Título de la sección -->
    <h3
      class="px-2 sm:px-3 mb-2 sm:mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
    >
      {{ title }}
    </h3>

    <!-- Items de la sección -->
    <div class="space-y-0.5 sm:space-y-1">
      <template v-for="item in items" :key="item.to">
        <SidebarItem
          :icon="item.icon"
          :label="item.label"
          :to="item.to"
          :active="$route.path === item.to"
          :badge="item.badge"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import SidebarItem from "./SidebarItem.vue";

const props = defineProps({
  title: String,
  items: Array, // Items ya filtrados externamente
});
</script>
