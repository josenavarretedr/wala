<template>
  <button
    @click="handleShare"
    :disabled="isProcessing || !targetRef"
    :class="buttonClasses"
    :title="buttonTitle"
  >
    <!-- Loader -->
    <SpinnerIcon v-if="isProcessing" size="sm" class="text-gray-500" />

    <!-- Icono de compartir -->
    <ShareAndroid v-else :class="iconClasses" />

    <!-- Texto -->
    <span :class="textClasses">{{
      isProcessing ? progressMessage || "Procesando..." : buttonText
    }}</span>
  </button>

  <!-- Modal de Preview -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showPreview"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click="closePreview"
      >
        <div
          class="bg-white rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col"
          @click.stop
        >
          <!-- Header - fijo -->
          <div
            class="flex items-center justify-between p-4 sm:p-6 pb-3 border-b border-gray-100 flex-shrink-0"
          >
            <h3 class="text-lg font-semibold text-gray-900">
              {{ shareTitle }}
            </h3>
            <button
              @click="closePreview"
              class="text-gray-400 hover:text-gray-600 -mr-2"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Preview de la imagen - con scroll -->
          <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            <div
              class="bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center min-h-[200px]"
            >
              <img
                v-if="previewUrl"
                :src="previewUrl"
                alt="Preview"
                class="max-w-full h-auto object-contain"
              />
            </div>
          </div>

          <!-- Botones de acción - fijos en la parte inferior -->
          <div
            class="flex gap-3 p-4 sm:p-6 pt-3 border-t border-gray-100 flex-shrink-0"
          >
            <button
              @click="shareFromPreview"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 active:bg-blue-800 transition-colors"
            >
              <ShareAndroid class="w-5 h-5" />
              Compartir
            </button>
            <button
              @click="downloadFromPreview"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 active:bg-gray-300 transition-colors"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Descargar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Mensaje de límite -->
  <div
    v-if="showLimitWarning && remainingShares <= 2 && remainingShares > 0"
    class="text-xs text-amber-600 mt-1 text-center"
  >
    ⚠️ Te quedan {{ remainingShares }} shares hoy
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { ShareAndroid } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import { useImageCaptureCloud } from "@/composables/useImageCaptureCloud";
import { useWebShare } from "@/composables/useWebShare";
import { useRateLimit } from "@/composables/useRateLimit";
import { useShareTracking } from "@/composables/useShareTracking";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  /**
   * Ref del elemento a capturar
   */
  targetRef: {
    type: Object,
    required: true,
    validator: (value) => value && "value" in value,
  },

  /**
   * Nombre del archivo
   */
  fileName: {
    type: String,
    default: "comprobante.png",
  },

  /**
   * Título para compartir
   */
  shareTitle: {
    type: String,
    default: "Comprobante",
  },

  /**
   * Texto para compartir
   */
  shareText: {
    type: String,
    default: "Powered by wala.lat",
  },

  /**
   * Tipo de componente (para analytics)
   */
  componentType: {
    type: String,
    default: "generic",
    validator: (value) =>
      ["receipt", "sale-summary", "resumen-dia", "generic"].includes(value),
  },

  /**
   * Texto del botón
   */
  buttonText: {
    type: String,
    default: "Compartir",
  },

  /**
   * Variante del botón
   */
  variant: {
    type: String,
    default: "card",
    validator: (value) =>
      ["card", "primary", "secondary", "ghost"].includes(value),
  },

  /**
   * Tamaño del botón
   */
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },

  /**
   * Deshabilitar watermark
   */
  disableWatermark: {
    type: Boolean,
    default: false,
  },

  /**
   * Mostrar advertencia de límite
   */
  showLimitWarning: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["share-start", "share-complete", "share-error"]);

// Composables
const { captureElement, isCapturing, progressMessage } = useImageCaptureCloud();
const { shareImage, downloadImage } = useWebShare();
const {
  checkLimit,
  remainingShares,
  canShare,
  error: limitError,
} = useRateLimit();
const { trackShareSuccess, trackShareError } = useShareTracking();
const { success, error: showError } = useToast();

// State
const showPreview = ref(false);
const previewUrl = ref(null);
const capturedBlob = ref(null);

const isProcessing = computed(() => isCapturing.value);

// Computed classes
const buttonClasses = computed(() => {
  const base =
    "inline-flex items-center gap-2 transition-opacity duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  // Variantes
  const variants = {
    card: "text-gray-600 hover:text-gray-700 text-sm font-medium",
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md rounded-lg px-4 py-2 font-semibold",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg px-4 py-2 font-medium",
    ghost:
      "bg-transparent hover:bg-gray-100 text-gray-700 rounded-lg px-3 py-2",
  };

  return `${base} ${variants[props.variant]}`;
});

const iconClasses = computed(() => {
  if (props.variant === "card") {
    return "w-5 h-5";
  }
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  return sizes[props.size];
});

const iconSize = computed(() => {
  const sizeMap = {
    sm: "sm",
    md: "md",
    lg: "lg",
  };

  return sizeMap[props.size];
});

const textClasses = computed(() => {
  if (props.variant === "card") {
    return "text-sm font-medium";
  }
  return props.size === "sm" ? "text-xs" : "";
});

const buttonTitle = computed(() => {
  if (isProcessing.value) return progressMessage.value || "Procesando...";
  if (!props.targetRef) return "Selecciona un elemento";
  return props.buttonText || "Compartir";
});

// Handlers
const handleShare = async () => {
  emit("share-start");

  try {
    // 1. Verificar rate limit
    const allowed = await checkLimit();

    if (!allowed) {
      showError(limitError.value || "Límite diario alcanzado");
      emit("share-error", { error: "RATE_LIMIT_EXCEEDED" });

      trackShareError({
        componentType: props.componentType,
        errorType: "rate_limit",
        errorMessage: limitError.value,
      });

      return;
    }

    // 2. Capturar imagen con Cloud Function
    const blob = await captureElement(props.targetRef, {
      addWatermarkFlag: !props.disableWatermark,
    });

    if (!blob) {
      throw new Error("No se pudo generar la imagen");
    }

    // 3. Guardar blob y mostrar preview
    capturedBlob.value = blob;
    previewUrl.value = URL.createObjectURL(blob);
    showPreview.value = true;
  } catch (error) {
    console.error("❌ Error al capturar:", error);

    const errorMessage = error.message || "Error al capturar la imagen";
    showError(errorMessage);

    trackShareError({
      componentType: props.componentType,
      errorType: "capture_failed",
      errorMessage: errorMessage,
    });

    emit("share-error", { error: errorMessage });
  }
};

const shareFromPreview = async () => {
  if (!capturedBlob.value) return;

  try {
    await shareImage(capturedBlob.value, {
      fileName: props.fileName,
      title: props.shareTitle,
      text: props.shareText,
      onSuccess: (method) => {
        success("¡Compartido exitosamente!");

        trackShareSuccess({
          componentType: props.componentType,
          shareMethod: method,
          fileSize: capturedBlob.value.size,
          renderMethod: "cloud",
        });

        emit("share-complete", { method, blob: capturedBlob.value });
        closePreview();
      },
      onError: (error) => {
        throw error;
      },
    });
  } catch (error) {
    console.error("❌ Error al compartir:", error);
    showError("No se pudo compartir. Intenta descargar.");
  }
};

const downloadFromPreview = () => {
  if (!capturedBlob.value) return;

  downloadImage(capturedBlob.value, props.fileName);

  success("¡Imagen descargada!");

  trackShareSuccess({
    componentType: props.componentType,
    shareMethod: "download",
    fileSize: capturedBlob.value.size,
    renderMethod: "cloud",
  });

  emit("share-complete", { method: "download", blob: capturedBlob.value });
  closePreview();
};

const closePreview = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  showPreview.value = false;
  previewUrl.value = null;
  capturedBlob.value = null;
};

// Lifecycle
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
