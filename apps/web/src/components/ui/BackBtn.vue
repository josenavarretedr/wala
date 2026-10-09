<template>
  <!-- Botón volver minimalista -->
  <div class="relative group">
    <button
      @click="handleBack"
      class="w-10 h-10 text-gray-400 hover:text-gray-700 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 hover:bg-gray-50"
      :disabled="isNavigating"
      :class="{ 'opacity-50 cursor-not-allowed': isNavigating }"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        ></path>
      </svg>
    </button>

    <!-- Tooltip simple -->
    <div
      v-if="showTooltip"
      class="absolute z-20 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none whitespace-nowrap"
    >
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";

// Props para hacer el componente reutilizable
const props = defineProps({
  // Ruta específica a la que navegar
  to: {
    type: [String, Object],
    default: null,
  },
  // Nombre de la ruta de destino
  routeName: {
    type: String,
    default: null,
  },
  // Parámetros para la ruta
  routeParams: {
    type: Object,
    default: null,
  },
  // Query params para la ruta
  routeQuery: {
    type: Object,
    default: null,
  },
  // Si true, usa router.back() en lugar de navegar a una ruta específica
  useBack: {
    type: Boolean,
    default: false,
  },
  // Texto del tooltip
  tooltipText: {
    type: String,
    default: "Volver",
  },
  // Mostrar tooltip
  showTooltip: {
    type: Boolean,
    default: true,
  },
  // Callback antes de navegar
  beforeNavigate: {
    type: Function,
    default: null,
  },
});

// Emits para comunicación con el componente padre
const emit = defineEmits(["beforeBack", "afterBack", "navigationError"]);

const router = useRouter();
const route = useRoute();
const isNavigating = ref(false);

/**
 * Maneja el click del botón back
 */
const handleBack = async () => {
  if (isNavigating.value) return;

  try {
    isNavigating.value = true;

    // Emit evento antes de navegar
    emit("beforeBack");

    // Ejecutar callback si existe
    if (props.beforeNavigate && typeof props.beforeNavigate === "function") {
      const shouldContinue = await props.beforeNavigate();
      if (shouldContinue === false) {
        isNavigating.value = false;
        return;
      }
    }

    // Determinar la navegación
    if (props.useBack) {
      // Usar router.back()
      router.back();
    } else if (props.to) {
      // Navegar a una ruta específica (string u objeto)
      await router.push(props.to);
    } else if (props.routeName) {
      // Navegar por nombre de ruta
      const routeConfig = {
        name: props.routeName,
      };

      if (props.routeParams) {
        routeConfig.params = props.routeParams;
      }

      if (props.routeQuery) {
        routeConfig.query = props.routeQuery;
      }

      await router.push(routeConfig);
    } else {
      // Por defecto, usar router.back()
      router.back();
    }

    // Emit evento después de navegar
    emit("afterBack");
  } catch (error) {
    console.error("Error al navegar:", error);
    emit("navigationError", error);
  } finally {
    isNavigating.value = false;
  }
};
</script>

<style scoped>
/* Sin estilos adicionales necesarios - todo en Tailwind */
</style>
