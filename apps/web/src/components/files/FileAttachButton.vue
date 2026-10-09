<template>
  <div class="file-attach-button">
    <!-- Input oculto -->
    <input
      ref="fileInput"
      type="file"
      :accept="acceptedTypes"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Botón principal -->
    <button
      v-if="!uploading && !fileUrl"
      type="button"
      :disabled="disabled"
      :class="[
        'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200',
        disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-orange-50 text-orange-600 hover:bg-orange-100 active:scale-95 border border-orange-200',
      ]"
      @click="triggerFileInput"
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
          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
        />
      </svg>
      <span>{{ buttonText }}</span>
    </button>

    <!-- Barra de progreso (durante upload) -->
    <div
      v-if="uploading"
      class="bg-white border border-gray-200 rounded-lg p-4"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"
          >
            <svg
              class="w-4 h-4 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ currentFileName }}
            </p>
            <p class="text-xs text-gray-500">
              {{ uploadStatusText }}
            </p>
          </div>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          class="h-full transition-all duration-300 rounded-full"
          :class="
            uploadStatus === 'processing'
              ? 'bg-blue-500 animate-pulse'
              : 'bg-orange-500'
          "
          :style="{ width: `${uploadProgress}%` }"
        />
      </div>
    </div>

    <!-- Preview (cuando está listo) -->
    <div
      v-if="fileUrl && !uploading"
      class="bg-white border border-gray-200 rounded-lg p-3"
    >
      <div class="flex items-center gap-3">
        <!-- Icono según tipo -->
        <div class="flex-shrink-0">
          <div
            v-if="isImage"
            class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100"
          >
            <img
              :src="fileUrl"
              :alt="currentFileName"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-red-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
              />
              <path d="M14 2v6h6M9 13h6M9 17h6" />
            </svg>
          </div>
        </div>

        <!-- Info del archivo -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ currentFileName }}
          </p>
          <p class="text-xs text-gray-500">
            {{ formatFileSize(currentFileSize) }}
          </p>
        </div>

        <!-- Botón eliminar -->
        <button
          v-if="!disabled"
          type="button"
          class="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
          @click="handleDelete"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mensaje de ayuda -->
    <p
      v-if="showHelp && !uploading && !fileUrl"
      class="text-xs text-gray-500 mt-2"
    >
      Máximo {{ constraints.maxSizeMB }}MB. Formatos: JPG, PNG, HEIC, PDF
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useFileUpload } from "@/composables/useFileUpload";
import { useFileStore } from "@/stores/fileStore";

// ═══════════════════════════════════════════════════════════
// PROPS & EMITS
// ═══════════════════════════════════════════════════════════

const props = defineProps({
  /**
   * Texto del botón
   */
  buttonText: {
    type: String,
    default: "Adjuntar archivo",
  },

  /**
   * URL del archivo ya subido (para modo edición)
   */
  modelValue: {
    type: String,
    default: null,
  },

  /**
   * Deshabilitar el botón
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * Mostrar mensaje de ayuda
   */
  showHelp: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "update:modelValue", // v-model
  "uploaded", // { fileId, urls, metadata }
  "deleted", // fileId
  "error", // error message
]);

// ═══════════════════════════════════════════════════════════
// COMPOSABLES
// ═══════════════════════════════════════════════════════════

const { uploadFile, deleteFile, constraints } = useFileUpload();
const fileStore = useFileStore();

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════

const fileInput = ref(null);
const uploading = ref(false);
const currentFileId = ref(null);
const currentFileName = ref("");
const currentFileSize = ref(0);
const fileUrl = ref(props.modelValue);

// ═══════════════════════════════════════════════════════════
// COMPUTED
// ═══════════════════════════════════════════════════════════

const acceptedTypes = computed(() => {
  return constraints.allowedTypes.join(",");
});

const uploadProgress = computed(() => {
  if (!currentFileId.value) return 0;
  const uploadData = fileStore.getUploadStatus(currentFileId.value);
  return uploadData?.progress || 0;
});

const uploadStatus = computed(() => {
  if (!currentFileId.value) return null;
  const uploadData = fileStore.getUploadStatus(currentFileId.value);
  return uploadData?.status || null;
});

const uploadStatusText = computed(() => {
  if (uploadStatus.value === "uploading") {
    return `Subiendo... ${uploadProgress.value}%`;
  }
  if (uploadStatus.value === "processing") {
    return "Procesando imagen...";
  }
  return "";
});

const isImage = computed(() => {
  return currentFileName.value.match(/\.(jpg|jpeg|png|heic|heif|webp)$/i);
});

// ═══════════════════════════════════════════════════════════
// WATCHERS
// ═══════════════════════════════════════════════════════════

watch(
  () => props.modelValue,
  (newValue) => {
    fileUrl.value = newValue;
  },
);

// ═══════════════════════════════════════════════════════════
// METHODS
// ═══════════════════════════════════════════════════════════

function triggerFileInput() {
  fileInput.value?.click();
}

async function handleFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    uploading.value = true;
    currentFileName.value = file.name;
    currentFileSize.value = file.size;

    // Subir archivo
    const result = await uploadFile(file);

    // Actualizar estado
    currentFileId.value = result.fileId;
    fileUrl.value = result.urls.original;

    // Emitir eventos
    emit("update:modelValue", result.urls.original);
    emit("uploaded", result);
  } catch (error) {
    console.error("Error en handleFileSelect:", error);
    emit("error", error.message);
  } finally {
    uploading.value = false;
    // Limpiar input para permitir re-selección del mismo archivo
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
}

async function handleDelete() {
  if (!currentFileId.value) {
    // Si no hay fileId pero sí URL, solo limpiar UI
    fileUrl.value = null;
    currentFileName.value = "";
    currentFileSize.value = 0;
    emit("update:modelValue", null);
    emit("deleted", null);
    return;
  }

  try {
    await deleteFile(currentFileId.value);

    // Limpiar estado
    fileUrl.value = null;
    currentFileName.value = "";
    currentFileSize.value = 0;
    currentFileId.value = null;

    // Emitir eventos
    emit("update:modelValue", null);
    emit("deleted", currentFileId.value);
  } catch (error) {
    console.error("Error eliminando archivo:", error);
    emit("error", error.message);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
</script>

<style scoped>
.hidden {
  display: none;
}
</style>
