<template>
  <button
    @click="handleShare"
    :disabled="isProcessing || !targetRef"
    :class="buttonClasses"
    :title="buttonTitle"
  >
    <!-- Icono -->
    <SpinnerIcon v-if="isProcessing" size="sm" class="text-gray-500" />
    <ShareAndroid v-else :class="iconClasses" />

    <!-- Texto -->
    <span :class="textClasses">{{ buttonText }}</span>
  </button>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { ShareAndroid } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import { useImageCapture } from "@/composables/useImageCapture";
import { useWebShare } from "@/composables/useWebShare";
import { useShareTracking } from "@/composables/useShareTracking";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  /**
   * Ref del elemento a capturar
   * @type {Object}
   */
  targetRef: {
    type: Object,
    required: true,
    validator: (value) => value !== null,
  },

  /**
   * Nombre del archivo a generar
   * @type {string}
   */
  fileName: {
    type: String,
    default: "comprobante-wala.png",
  },

  /**
   * Título para Web Share API
   * @type {string}
   */
  shareTitle: {
    type: String,
    default: "Comprobante",
  },

  /**
   * Texto para Web Share API
   * @type {string}
   */
  shareText: {
    type: String,
    default: "Powered by wala.lat",
  },

  /**
   * Tipo de componente (para analytics)
   * @type {string}
   */
  componentType: {
    type: String,
    default: "generic",
  },

  /**
   * Posición de la marca de agua
   * @type {string}
   */
  watermarkPosition: {
    type: String,
    default: "bottom",
    validator: (value) => ["top", "bottom"].includes(value),
  },

  /**
   * Modificaciones pre-captura (opcional)
   * @type {Object}
   */
  modifications: {
    type: Object,
    default: () => ({}),
  },

  /**
   * Deshabilitar marca de agua
   * @type {boolean}
   */
  disableWatermark: {
    type: Boolean,
    default: false,
  },

  /**
   * Texto del botón
   * @type {string}
   */
  buttonText: {
    type: String,
    default: "Compartir",
  },

  /**
   * Descripción del botón (subtítulo)
   * @type {string}
   */
  buttonDescription: {
    type: String,
    default: "Descarga o comparte",
  },

  /**
   * Variante del botón
   * @type {string}
   */
  variant: {
    type: String,
    default: "card",
    validator: (value) =>
      ["card", "primary", "secondary", "outline"].includes(value),
  },

  /**
   * Tamaño del botón
   * @type {string}
   */
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
});

// Composables
const { captureElement, isCapturing, captureError } = useImageCapture();
const { shareImage, isSharing, getRecommendedShareMethod } = useWebShare();
const {
  trackShareAttempt,
  trackShareSuccess,
  trackShareError,
  trackSharePerformance,
} = useShareTracking();
const { success, error: showError } = useToast();

// Estado local
const isProcessing = computed(() => isCapturing.value || isSharing.value);
const startTime = ref(0);
const captureTime = ref(0);

// Clases dinámicas del botón
const buttonClasses = computed(() => {
  const base =
    "inline-flex items-center gap-2 transition-opacity duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    card: "text-gray-600 hover:text-gray-700 text-sm font-medium",
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 rounded-lg px-4 py-2 font-semibold",
    secondary:
      "bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 rounded-lg px-4 py-2 font-semibold",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 rounded-lg px-4 py-2 font-semibold",
  };

  return `${base} ${variants[props.variant]}`;
});

// Clases para el texto
const textClasses = computed(() => {
  if (props.variant === "card") {
    return "text-sm font-medium";
  }
  return "";
});

// Clases para el icono
const iconClasses = computed(() => {
  if (props.variant === "card") {
    return "w-5 h-5";
  }
  return "w-5 h-5";
});

// Título del botón (tooltip)
const buttonTitle = computed(() => {
  if (isProcessing.value) return "Procesando...";
  if (!props.targetRef) return "No hay elemento para compartir";

  const method = getRecommendedShareMethod.value;

  if (props.variant === "card") {
    return method.description;
  }

  return method.description;
});

// Emits
const emit = defineEmits([
  "share-start",
  "share-success",
  "share-error",
  "share-complete",
]);

// Observar errores de captura
watch(captureError, (error) => {
  if (error) {
    showError("Error al capturar imagen");

    trackShareError({
      componentType: props.componentType,
      errorType: "capture",
      errorMessage: error,
      stage: "capture",
    });

    emit("share-error", { stage: "capture", error });
  }
});

/**
 * Maneja el proceso completo de compartir
 */
const handleShare = async () => {
  if (!props.targetRef) {
    console.warn("⚠️ No hay referencia al elemento para capturar");
    showError("No se pudo capturar el elemento");
    return;
  }

  startTime.value = Date.now();

  try {
    // Emit: inicio
    emit("share-start");

    // Track: intento de compartir
    await trackShareAttempt({
      componentType: props.componentType,
      fileName: props.fileName,
      hasWatermark: !props.disableWatermark,
    });

    // Paso 1: Capturar elemento
    const captureStartTime = Date.now();

    const blob = await captureElement(props.targetRef, {
      watermarkPosition: props.watermarkPosition,
      addWatermarkFlag: !props.disableWatermark,
      modifications: props.modifications,
      quality: 0.95,
      scale: 2,
    });

    captureTime.value = Date.now() - captureStartTime;

    if (!blob) {
      throw new Error("No se pudo generar la imagen");
    }

    // Paso 2: Compartir/Descargar
    const shareStartTime = Date.now();

    const shared = await shareImage(blob, {
      fileName: props.fileName,
      title: props.shareTitle,
      text: props.shareText,
      onSuccess: (method) => {
        const totalTime = Date.now() - startTime.value;
        const shareTime = Date.now() - shareStartTime;

        // Mensaje de éxito
        if (method === "webshare") {
          success("¡Compartido exitosamente!");
        } else {
          success("¡Descarga completada!");
        }

        // Track: éxito
        trackShareSuccess({
          componentType: props.componentType,
          shareMethod: method,
          fileName: props.fileName,
          fileSize: blob.size,
          captureTime: captureTime.value,
          totalTime: totalTime,
        });

        // Track: performance
        trackSharePerformance({
          componentType: props.componentType,
          captureTime: captureTime.value,
          shareTime: shareTime,
          totalTime: totalTime,
          fileSize: blob.size,
        });

        // Emit: éxito
        emit("share-success", {
          method,
          fileSize: blob.size,
          captureTime: captureTime.value,
          totalTime,
        });
      },
      onError: (error) => {
        trackShareError({
          componentType: props.componentType,
          errorType: "share",
          errorMessage: error.message,
          stage: "share",
        });
      },
    });

    if (!shared) {
      throw new Error("No se pudo compartir la imagen");
    }
  } catch (error) {
    console.error("❌ Error en proceso de compartir:", error);
    showError(error.message || "Error al compartir");

    trackShareError({
      componentType: props.componentType,
      errorType: "general",
      errorMessage: error.message,
      stage: "general",
    });

    emit("share-error", { stage: "general", error: error.message });
  } finally {
    // Emit: completado (siempre se ejecuta)
    emit("share-complete");
  }
};

// Exponer método para uso externo si es necesario
defineExpose({
  handleShare,
  isProcessing,
});
</script>

<style scoped>
/* Transición suave solo para opacity */
button {
  transition: opacity 200ms ease, color 200ms ease;
}

/* Estado disabled */
button:disabled {
  pointer-events: none;
}
</style>
