<template>
  <!-- Indicador de progreso minimalista -->
  <div class="flex items-center gap-2">
    <!-- Contador simple -->
    <div
      :class="[
        'flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium',
        counterBgColor,
        counterTextColor,
      ]"
    >
      {{ currentStep + 1 }}
    </div>

    <!-- Barra de progreso horizontal -->
    <div class="flex items-center gap-1">
      <div
        v-for="(step, index) in steps"
        :key="index"
        :class="[
          'w-2 h-2 rounded-full transition-all duration-300',
          index <= currentStep ? activeColorClass : inactiveColorClass,
        ]"
      ></div>
    </div>

    <!-- Indicador de total -->
    <span class="text-xs text-gray-400 font-medium">
      / {{ steps.length }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

// Props para hacer el componente reutilizable
const props = defineProps({
  currentStep: {
    type: Number,
    required: true,
    default: 0,
  },
  steps: {
    type: Array,
    required: true,
    default: () => [],
  },
  // Props opcionales para personalizar estilos
  activeColor: {
    type: String,
    default: "bg-blue-500",
  },
  inactiveColor: {
    type: String,
    default: "bg-gray-200",
  },
  counterBgColor: {
    type: String,
    default: "bg-gray-100",
  },
  counterTextColor: {
    type: String,
    default: "text-gray-600",
  },
});

// Computed para manejar los colores dinámicos
const activeColorClass = computed(() => props.activeColor);
const inactiveColorClass = computed(() => props.inactiveColor);
</script>
