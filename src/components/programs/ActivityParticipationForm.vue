<template>
  <div class="activity-participation-form max-w-2xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ activity?.title }}</h2>
      <p class="text-sm text-gray-500 mt-1">{{ activity?.description }}</p>
    </div>

    <!-- Formulario de respuestas -->
    <form @submit.prevent="submitParticipation" class="space-y-6">
      <!-- Preguntas dinámicas -->
      <div
        v-for="(question, index) in activity?.questions"
        :key="index"
        class="space-y-2"
      >
        <label class="block text-sm font-medium text-gray-700">
          {{ question.text }}
          <span v-if="question.required" class="text-red-500">*</span>
        </label>

        <!-- Respuesta de texto -->
        <input
          v-if="question.type === 'text'"
          v-model="responses[`question${index}`]"
          type="text"
          :required="question.required"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          :placeholder="`Escribe tu respuesta...`"
        />

        <!-- Respuesta de número -->
        <input
          v-else-if="question.type === 'number'"
          v-model.number="responses[`question${index}`]"
          type="number"
          :required="question.required"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <!-- 📎 ADJUNTAR FOTO DE EVIDENCIA -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Foto de evidencia
          <span v-if="requiresPhoto" class="text-red-500">*</span>
        </label>
        <p class="text-xs text-gray-500 mb-2">
          Sube una foto que demuestre tu participación en esta actividad
        </p>

        <!-- Componente de File Attachment -->
        <FileAttachButton
          v-model="responses.photoEvidence"
          button-text="📷 Subir foto de evidencia"
          :disabled="submitting"
          @uploaded="handlePhotoUploaded"
          @deleted="handlePhotoDeleted"
          @error="handleUploadError"
        />
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-3 pt-4">
        <button
          type="button"
          @click="$emit('cancel')"
          :disabled="submitting"
          class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="submitting || !canSubmit"
          class="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <svg
            v-if="submitting"
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{{ submitting ? "Enviando..." : "Enviar participación" }}</span>
        </button>
      </div>
    </form>

    <!-- Debug info (solo para desarrollo) -->
    <div v-if="isDev" class="mt-8 p-4 bg-gray-100 rounded-lg">
      <p class="text-xs font-mono text-gray-600">DEBUG - Responses:</p>
      <pre class="text-xs mt-2 overflow-auto">{{
        JSON.stringify(responses, null, 2)
      }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebaseInit";
import FileAttachButton from "@/components/files/FileAttachButton.vue";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useToast } from "@/composables/useToast";

// ═══════════════════════════════════════════════════════════
// PROPS & EMITS
// ═══════════════════════════════════════════════════════════

const props = defineProps({
  programId: {
    type: String,
    required: true,
  },
  activityId: {
    type: String,
    required: true,
  },
  activity: {
    type: Object,
    required: true,
  },
  requiresPhoto: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["success", "cancel"]);

// ═══════════════════════════════════════════════════════════
// COMPOSABLES
// ═══════════════════════════════════════════════════════════

const authStore = useAuthStore();
const businessStore = useBusinessStore();
const toast = useToast();

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════

const responses = ref({
  // Respuestas dinámicas se agregarán como question0, question1, etc.
  photoEvidence: null, // URL de la foto (se actualiza automáticamente con v-model)
});

const submitting = ref(false);
const isDev = ref(import.meta.env.DEV);

// ═══════════════════════════════════════════════════════════
// COMPUTED
// ═══════════════════════════════════════════════════════════

const canSubmit = computed(() => {
  // Validar que se respondieron las preguntas requeridas
  const hasRequiredAnswers = props.activity.questions?.every((q, index) => {
    if (!q.required) return true;
    return (
      responses.value[`question${index}`] !== undefined &&
      responses.value[`question${index}`] !== ""
    );
  });

  // Validar foto si es requerida
  const hasPhoto = props.requiresPhoto ? !!responses.value.photoEvidence : true;

  return hasRequiredAnswers && hasPhoto;
});

// ═══════════════════════════════════════════════════════════
// METHODS
// ═══════════════════════════════════════════════════════════

function handlePhotoUploaded(result) {
  console.log("✅ Foto subida correctamente:", result);
  toast.success("Foto subida correctamente");

  // El v-model ya guardó la URL en responses.photoEvidence
  // Pero puedes hacer algo adicional aquí si necesitas
}

function handlePhotoDeleted() {
  console.log("🗑️ Foto eliminada");
  toast.info("Foto eliminada");
}

function handleUploadError(errorMessage) {
  console.error("❌ Error subiendo foto:", errorMessage);
  // El toast ya se muestra en el composable
}

async function submitParticipation() {
  if (!canSubmit.value) {
    toast.warning("Por favor completa todos los campos requeridos");
    return;
  }

  submitting.value = true;

  try {
    const participationData = {
      programId: props.programId,
      activityId: props.activityId,
      userId: authStore.user.uid,
      businessId: businessStore.getBusinessId,

      // Respuestas (incluye la URL de la foto si existe)
      responses: responses.value,

      // Metadata
      submittedAt: serverTimestamp(),
      status: "submitted",
    };

    // Guardar en Firestore
    const participationRef = doc(
      db,
      "programs",
      props.programId,
      "participations",
      authStore.user.uid,
    );

    await setDoc(participationRef, participationData);

    console.log("✅ Participación guardada:", participationData);
    toast.success("¡Participación enviada correctamente!");

    // Emitir evento de éxito
    emit("success", participationData);

    // Limpiar formulario (opcional)
    resetForm();
  } catch (error) {
    console.error("❌ Error guardando participación:", error);
    toast.error("Error al enviar la participación. Intenta de nuevo.");
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  // Resetear respuestas
  const questionCount = props.activity.questions?.length || 0;
  const newResponses = { photoEvidence: null };

  for (let i = 0; i < questionCount; i++) {
    newResponses[`question${i}`] = "";
  }

  responses.value = newResponses;
}
</script>
