<template>
  <!-- Modal de Feedback con estilo coherente -->
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      @click.self="$emit('update:modelValue', false)"
    >
      <div
        class="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transform transition-all"
      >
        <!-- Header del modal -->
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center"
          >
            <Megaphone class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Reportar un problema
            </h3>
            <p class="text-xs text-gray-500">
              Cuéntanos qué ha pasado o envía tu feedback
            </p>
          </div>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre (opcional)
            </label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
              placeholder="Tu nombre"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Email (opcional)
            </label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
              placeholder="tu@email.com"
            />
          </div>

          <!-- Mensaje -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Mensaje <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.message"
              rows="4"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm resize-none"
              placeholder="Describe el problema o envía tu feedback..."
              required
            ></textarea>
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="$emit('update:modelValue', false)"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="!form.message || isSubmitting"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? "Enviando..." : "Enviar" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { Megaphone } from "@iconoir/vue";
import { useAuthStore } from "@/stores/authStore";
import * as Sentry from "@sentry/vue";

const authStore = useAuthStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const isSubmitting = ref(false);

const form = reactive({
  name: "",
  email: "",
  message: "",
});

// Pre-llenar datos del usuario cuando se abre el modal
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && authStore.user) {
      form.name = authStore.user.displayName || "";
      form.email = authStore.user.email || "";
    }
  }
);

const handleSubmit = async () => {
  if (!form.message) return;

  isSubmitting.value = true;

  try {
    const feedbackData = {
      message: form.message,
    };

    if (form.name) {
      feedbackData.name = form.name;
    }
    if (form.email) {
      feedbackData.email = form.email;
    }

    await Sentry.captureFeedback(feedbackData);

    // Solo limpiar el mensaje
    form.message = "";

    // Cerrar modal
    emit("update:modelValue", false);

    // Notificación de éxito
    alert("¡Gracias por tu feedback! Lo hemos recibido correctamente.");
  } catch (error) {
    console.error("Error al enviar feedback:", error);
    alert("Hubo un error al enviar el feedback. Por favor, intenta de nuevo.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Transición para el modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active > div,
.fade-leave-active > div {
  transition: transform 0.3s ease;
}

.fade-enter-from > div,
.fade-leave-to > div {
  transform: scale(0.95);
}
</style>
