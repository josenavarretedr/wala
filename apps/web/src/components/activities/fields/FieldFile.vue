<template>
  <div class="space-y-1.5">
    <label class="block text-sm font-medium text-gray-700">
      {{ field.title }}
      <span v-if="field.required" class="text-red-500 ml-0.5">*</span>
    </label>
    <p v-if="field.description" class="text-xs text-gray-500">
      {{ field.description }}
    </p>

    <!-- Modo edición -->
    <div v-if="!readonly">
      <!-- Ya tiene archivo guardado -->
      <div
        v-if="modelValue && !selectedFile"
        class="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
      >
        <svg
          class="w-5 h-5 text-green-600 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <a
          :href="modelValue"
          target="_blank"
          class="text-sm text-green-700 hover:underline truncate flex-1"
        >
          Archivo subido — ver archivo
        </a>
        <button
          @click="clearFile"
          type="button"
          class="text-xs text-gray-500 hover:text-red-500 shrink-0"
        >
          Cambiar
        </button>
      </div>

      <!-- Selector de archivo -->
      <div v-else>
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 cursor-pointer transition-colors"
          @click="fileInput?.click()"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <svg
            v-if="!uploading"
            class="w-8 h-8 text-gray-400 mx-auto mb-2"
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
          <div
            v-if="uploading"
            class="flex items-center justify-center gap-2 text-sm text-green-600 mb-1"
          >
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            Subiendo... {{ uploadProgress }}%
          </div>
          <p v-else class="text-sm text-gray-500">
            <span v-if="selectedFile" class="font-medium text-gray-700">{{
              selectedFile.name
            }}</span>
            <span v-else>Haz clic o arrastra un archivo aquí</span>
          </p>
          <p class="text-xs text-gray-400 mt-1">PDF, imagen u otro documento</p>
        </div>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          @change="handleFileSelect"
        />
        <button
          v-if="selectedFile && !uploading"
          @click="uploadFile"
          type="button"
          class="mt-2 w-full py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Subir archivo
        </button>
      </div>
    </div>

    <!-- Modo lectura -->
    <div v-else>
      <a
        v-if="modelValue"
        :href="modelValue"
        target="_blank"
        class="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-blue-600 hover:underline"
      >
        <svg
          class="w-4 h-4 shrink-0"
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
        Ver archivo adjunto
      </a>
      <div
        v-else
        class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
      >
        Sin archivo
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { storage } from "@/firebaseInit";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: String, default: "" },
  readonly: { type: Boolean, default: false },
  storagePath: { type: String, default: "programs/uploads" },
});
const emit = defineEmits(["update:modelValue"]);

const fileInput = ref(null);
const selectedFile = ref(null);
const uploading = ref(false);
const uploadProgress = ref(0);

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) selectedFile.value = file;
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0];
  if (file) selectedFile.value = file;
}

function clearFile() {
  selectedFile.value = null;
  emit("update:modelValue", "");
}

async function uploadFile() {
  if (!selectedFile.value) return;

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${selectedFile.value.name}`;
    const fileRef = storageRef(storage, `${props.storagePath}/${fileName}`);

    const uploadTask = uploadBytesResumable(fileRef, selectedFile.value);

    await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          uploadProgress.value = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
        },
        reject,
        resolve,
      );
    });

    const downloadURL = await getDownloadURL(fileRef);
    emit("update:modelValue", downloadURL);
    selectedFile.value = null;
  } catch (err) {
    console.error("❌ Error al subir archivo:", err);
    alert("Error al subir el archivo. Por favor intenta de nuevo.");
  } finally {
    uploading.value = false;
  }
}
</script>
