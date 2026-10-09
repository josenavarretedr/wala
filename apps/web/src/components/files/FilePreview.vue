<template>
  <div class="file-preview">
    <!-- Preview de Imagen -->
    <div v-if="isImage" class="image-preview">
      <div class="relative group">
        <img
          :src="previewUrl || fileUrl"
          :alt="fileName || 'Vista previa'"
          class="w-full h-auto rounded-lg shadow-md"
          @click="openFullscreen"
        />

        <!-- Overlay con acciones -->
        <div
          class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center gap-3"
        >
          <button
            type="button"
            class="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-full shadow-lg hover:scale-110 transform"
            @click="openFullscreen"
          >
            <svg
              class="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>

          <button
            v-if="showDelete"
            type="button"
            class="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-full shadow-lg hover:scale-110 transform hover:bg-red-50"
            @click="handleDelete"
          >
            <svg
              class="w-5 h-5 text-red-600"
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

      <!-- Info del archivo -->
      <div v-if="showInfo" class="mt-2 text-sm text-gray-600">
        <p class="font-medium truncate">{{ fileName }}</p>
        <p class="text-xs text-gray-500">{{ formatFileSize(fileSize) }}</p>
      </div>
    </div>

    <!-- Preview de PDF -->
    <div v-else-if="isPdf" class="pdf-preview">
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50"
      >
        <div class="flex items-center gap-4">
          <!-- Icono PDF -->
          <div
            class="flex-shrink-0 w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-red-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
              />
              <path d="M14 2v6h6M9 13h6M9 17h6" />
            </svg>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ fileName }}
            </p>
            <p class="text-xs text-gray-500">{{ formatFileSize(fileSize) }}</p>
            <a
              :href="fileUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 mt-2 text-xs font-medium text-orange-600 hover:text-orange-700"
            >
              Abrir PDF
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>

          <!-- Botón eliminar -->
          <button
            v-if="showDelete"
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
    </div>

    <!-- Modal fullscreen (para imágenes) -->
    <Teleport to="body">
      <div
        v-if="fullscreenOpen"
        class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
        @click="closeFullscreen"
      >
        <button
          class="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:scale-110 transform transition-transform"
          @click="closeFullscreen"
        >
          <svg
            class="w-6 h-6 text-gray-700"
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

        <img
          :src="fileUrl"
          :alt="fileName"
          class="max-w-full max-h-full object-contain"
          @click.stop
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// ═══════════════════════════════════════════════════════════
// PROPS & EMITS
// ═══════════════════════════════════════════════════════════

const props = defineProps({
  /**
   * URL del archivo original
   */
  fileUrl: {
    type: String,
    required: true,
  },

  /**
   * URL del preview (optimizada, más ligera)
   */
  previewUrl: {
    type: String,
    default: null,
  },

  /**
   * Nombre del archivo
   */
  fileName: {
    type: String,
    default: "archivo",
  },

  /**
   * Tamaño del archivo en bytes
   */
  fileSize: {
    type: Number,
    default: 0,
  },

  /**
   * Tipo de archivo (image/jpeg, application/pdf, etc)
   */
  contentType: {
    type: String,
    default: "",
  },

  /**
   * Mostrar botón de eliminar
   */
  showDelete: {
    type: Boolean,
    default: true,
  },

  /**
   * Mostrar información del archivo
   */
  showInfo: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["delete"]);

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════

const fullscreenOpen = ref(false);

// ═══════════════════════════════════════════════════════════
// COMPUTED
// ═══════════════════════════════════════════════════════════

const isImage = computed(() => {
  if (props.contentType) {
    return props.contentType.startsWith("image/");
  }
  // Fallback: detectar por extensión
  return /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(props.fileName);
});

const isPdf = computed(() => {
  if (props.contentType) {
    return props.contentType === "application/pdf";
  }
  return /\.pdf$/i.test(props.fileName);
});

// ═══════════════════════════════════════════════════════════
// METHODS
// ═══════════════════════════════════════════════════════════

function openFullscreen() {
  if (isImage.value) {
    fullscreenOpen.value = true;
  }
}

function closeFullscreen() {
  fullscreenOpen.value = false;
}

function handleDelete() {
  emit("delete");
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
</script>
