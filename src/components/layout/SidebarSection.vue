<template>
  <div class="mb-6">
    <!-- Título de la sección -->
    <h3
      class="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
    >
      {{ title }}
    </h3>

    <!-- Items de la sección -->
    <div class="space-y-1">
      <template v-for="item in filteredItems" :key="item.to">
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
import { computed } from "vue";
import SidebarItem from "./SidebarItem.vue";

const props = defineProps({
  title: String,
  items: Array,
  permissions: Object,
});

// Filtrar items según permisos
const filteredItems = computed(() => {
  return props.items.filter((item) => {
    // Si no requiere permiso, mostrar siempre
    if (!item.permission) return true;

    // Verificar si el usuario tiene el permiso requerido
    return props.permissions[item.permission] === true;
  });
});
</script>
