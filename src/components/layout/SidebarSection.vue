<template>
  <div class="space-y-1">
    <!-- Items de la sección -->
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
</template>

<script setup>
import SidebarItem from "./SidebarItem.vue";

const props = defineProps({
  items: Array, // Items ya filtrados externamente
});
</script>
