<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 card-hover"
  >
    <!-- Header de la métrica -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium text-gray-600">
        {{ title }}
      </h3>
      <div
        :class="[
          'w-10 h-10 rounded-xl flex items-center justify-center',
          colorClasses.background,
        ]"
      >
        <span class="text-xl">{{ icon }}</span>
      </div>
    </div>

    <!-- Valor principal -->
    <div class="space-y-2">
      <div v-if="loading" class="space-y-2">
        <div class="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>

      <template v-else>
        <!-- Valor -->
        <p :class="['text-2xl font-bold', colorClasses.text]">
          {{ formattedValue }}
        </p>

        <!-- Cambio porcentual -->
        <div v-if="change !== undefined" class="flex items-center space-x-1">
          <span
            :class="[
              'inline-flex items-center text-xs font-medium',
              change >= 0 ? 'text-green-600' : 'text-red-600',
            ]"
          >
            <svg
              :class="[
                'w-3 h-3 mr-1',
                change >= 0 ? 'transform rotate-0' : 'transform rotate-180',
              ]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            {{ Math.abs(change) }}%
          </span>
          <span class="text-xs text-gray-500"> vs mes anterior </span>
        </div>
      </template>
    </div>

    <!-- Descripción adicional -->
    <div v-if="description" class="mt-4 pt-4 border-t border-gray-100">
      <p class="text-xs text-gray-500">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: String,
  value: [Number, String],
  change: Number,
  icon: String,
  color: {
    type: String,
    default: "blue",
    validator: (value) =>
      ["blue", "green", "red", "yellow", "purple"].includes(value),
  },
  format: {
    type: String,
    default: "currency",
    validator: (value) => ["currency", "number", "percentage"].includes(value),
  },
  loading: Boolean,
  description: String,
});

// Computed para formatear el valor
const formattedValue = computed(() => {
  if (props.loading || props.value === undefined) return "--";

  const value = Number(props.value);

  switch (props.format) {
    case "currency":
      return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);

    case "number":
      return new Intl.NumberFormat("es-PE").format(value);

    case "percentage":
      return `${value.toFixed(1)}%`;

    default:
      return value.toString();
  }
});

// Computed para las clases de color
const colorClasses = computed(() => {
  const colors = {
    blue: {
      background: "bg-blue-100",
      text: "text-blue-800",
    },
    green: {
      background: "bg-green-100",
      text: "text-green-800",
    },
    red: {
      background: "bg-red-100",
      text: "text-red-800",
    },
    yellow: {
      background: "bg-yellow-100",
      text: "text-yellow-800",
    },
    purple: {
      background: "bg-purple-100",
      text: "text-purple-800",
    },
  };

  return colors[props.color] || colors.blue;
});
</script>

<style scoped>
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
