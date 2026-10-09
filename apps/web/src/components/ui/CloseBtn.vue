<template>
  <!-- Botón cerrar minimalista -->
  <div class="relative group">
    <button
      @click="handleClose"
      class="w-10 h-10 text-gray-400 hover:text-red-500 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 hover:bg-gray-50"
      :disabled="isClosing"
      :class="{ 'opacity-50 cursor-not-allowed': isClosing }"
    >
      <Xmark class="w-5 h-5" />
    </button>

    <!-- Tooltip simple -->
    <div
      class="absolute z-20 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none whitespace-nowrap"
    >
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Xmark } from "@iconoir/vue";
import { useCloseBtn } from "@/composables/useCloseBtn";

// Props para hacer el componente reutilizable
const props = defineProps({
  flowStore: {
    type: Object,
    default: null,
  },
  additionalStores: {
    type: Object,
    default: () => ({}),
  },
  flowType: {
    type: String,
    default: "TRANSACTION",
  },
  autoNavigate: {
    type: Boolean,
    default: true,
  },
  navigationType: {
    type: String,
    default: "back", // 'back' o 'dashboard'
    validator: (value) => ["back", "dashboard"].includes(value),
  },
  tooltipText: {
    type: String,
    default: "Cerrar",
  },
});

// Emits para comunicación con el componente padre
const emit = defineEmits(["beforeClose", "afterClose"]);

const isClosing = ref(false);

// Usar el composable
const { handleClose: executeClose } = useCloseBtn({
  flowStore: props.flowStore,
  additionalStores: props.additionalStores,
  flowType: props.flowType,
  autoNavigate: props.autoNavigate,
  navigationType: props.navigationType,
});

/**
 * Maneja el click del botón close
 */
const handleClose = async () => {
  if (isClosing.value) return;

  // Emit evento antes del cierre
  emit("beforeClose");

  try {
    isClosing.value = true;

    // Ejecutar la lógica de cierre
    executeClose();

    // Emit evento después del cierre
    emit("afterClose");
  } catch (error) {
    console.error("Error al cerrar:", error);
  } finally {
    isClosing.value = false;
  }
};
</script>
