<template>
  <router-link
    :to="to"
    :class="[
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
      active
        ? 'bg-blue-50 text-blue-600 border border-blue-200'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    ]"
  >
    <!-- Ícono SVG -->
    <div class="w-5 h-5 flex-shrink-0">
      <component :is="getIcon(icon)" class="w-full h-full" />
    </div>

    <!-- Label -->
    <span class="truncate flex-1">{{ label }}</span>

    <!-- Badge opcional -->
    <span
      v-if="badge"
      class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 flex-shrink-0"
    >
      {{ badge }}
    </span>
  </router-link>
</template>

<script setup>
import { h } from "vue";

defineProps({
  icon: String,
  label: String,
  to: String,
  active: Boolean,
  badge: [String, Number],
});

const getIcon = (iconName) => {
  const icons = {
    dashboard: () =>
      h(
        "svg",
        {
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
          }),
        ],
      ),

    business: () =>
      h(
        "svg",
        {
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
          }),
        ],
      ),

    user: () =>
      h(
        "svg",
        {
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
          }),
        ],
      ),
  };

  return icons[iconName] || icons.dashboard;
};
</script>
