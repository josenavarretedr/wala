<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
      <!-- Header -->
      <div class="bg-white px-6 py-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"
            >
              <IconoirEditPencil class="w-5 h-5 text-blue-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900">Editar Cliente</h3>
          </div>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <IconoirXmark class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Form Body -->
      <div class="p-6 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
        <!-- Nombre (Requerido) -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Nombre Completo <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="Ej: Juan Pérez"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            :class="{
              'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500':
                errors.name,
            }"
            @input="errors.name = ''"
          />
          <p v-if="errors.name" class="mt-1.5 text-sm text-red-600">
            {{ errors.name }}
          </p>
        </div>

        <!-- Teléfono (Opcional) -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Teléfono
          </label>
          <div class="flex items-center gap-2">
            <span
              class="text-gray-600 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"
              >+51</span
            >
            <input
              v-model="formData.phone"
              type="tel"
              placeholder="987654321"
              class="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              maxlength="15"
            />
          </div>
          <p class="mt-1.5 text-xs text-gray-500">
            Formato: 9 dígitos sin espacios
          </p>
        </div>

        <!-- DNI (Opcional) -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            DNI
          </label>
          <input
            v-model="formData.dni"
            type="text"
            placeholder="12345678"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            maxlength="8"
            @input="validateDni"
          />
          <p class="mt-1.5 text-xs text-gray-500">
            Documento de identidad (8 dígitos)
          </p>
        </div>

        <!-- Canal de origen (Área 2 - Marketing) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">
              ¿Cómo nos conoció?
            </label>
            <select
              v-model="formData.originChannel"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sin especificar</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="referral">Recomendación / Boca a boca</option>
              <option value="walk_in">Local / Pasaba por aquí</option>
              <option value="other">Otro canal</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">
              Detalle / Campaña
            </label>
            <input
              v-model="formData.originDetail"
              type="text"
              placeholder="Ej: Promo 2x1 / Vecino"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Notas o Preferencias
          </label>
          <textarea
            v-model="formData.notes"
            rows="2"
            placeholder="Preferencias del cliente"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <label class="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            v-model="formData.isKeyClient"
            type="checkbox"
            class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span class="font-medium">Cliente clave / frecuente ⭐</span>
        </label>

        <!-- Error General -->
        <div
          v-if="errors.general"
          class="bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <p class="text-sm text-red-700">{{ errors.general }}</p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div
        class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3"
      >
        <button
          @click="closeModal"
          :disabled="loading"
          class="px-4 py-2 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          @click="handleSubmit"
          :disabled="loading || !isFormValid || !hasChanges"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Check v-if="!loading" class="w-4 h-4" />
          <div
            v-else
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></div>
          <span>{{ loading ? "Guardando..." : "Guardar Cambios" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  EditPencil as IconoirEditPencil,
  Xmark as IconoirXmark,
  Check as Check,
} from "@iconoir/vue";
import { useClients } from "@/composables/useClients";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  client: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "updated"]);

const { updateClient } = useClients();

const loading = ref(false);
const formData = ref({
  name: "",
  phone: "",
  dni: "",
  originChannel: "",
  originDetail: "",
  notes: "",
  isKeyClient: false,
});

const originalData = ref({
  name: "",
  phone: "",
  dni: "",
  originChannel: "",
  originDetail: "",
  notes: "",
  isKeyClient: false,
});

const errors = ref({
  name: "",
  general: "",
});

/**
 * Inicializar formulario con datos del cliente
 */
watch(
  () => props.client,
  (newClient) => {
    if (newClient) {
      formData.value = {
        name: newClient.name || "",
        phone: newClient.phone || "",
        dni: newClient.dni || "",
        originChannel: newClient.originChannel || "",
        originDetail: newClient.originDetail || "",
        notes: newClient.notes || "",
        isKeyClient: Boolean(newClient.isKeyClient),
      };
      originalData.value = {
        name: newClient.name || "",
        phone: newClient.phone || "",
        dni: newClient.dni || "",
        originChannel: newClient.originChannel || "",
        originDetail: newClient.originDetail || "",
        notes: newClient.notes || "",
        isKeyClient: Boolean(newClient.isKeyClient),
      };
    }
  },
  { immediate: true }
);

/**
 * Validar DNI (solo números, 8 dígitos)
 */
function validateDni() {
  if (formData.value.dni) {
    formData.value.dni = formData.value.dni.replace(/\D/g, "").slice(0, 8);
  }
}

/**
 * Verificar si el formulario es válido
 */
const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0;
});

/**
 * Verificar si hay cambios respecto a los datos originales
 */
const hasChanges = computed(() => {
  return (
    formData.value.name.trim() !== originalData.value.name ||
    (formData.value.phone?.trim() || "") !== (originalData.value.phone || "") ||
    (formData.value.dni?.trim() || "") !== (originalData.value.dni || "") ||
    (formData.value.originChannel || "") !== (originalData.value.originChannel || "") ||
    (formData.value.originDetail?.trim() || "") !== (originalData.value.originDetail || "") ||
    (formData.value.notes?.trim() || "") !== (originalData.value.notes || "") ||
    Boolean(formData.value.isKeyClient) !== Boolean(originalData.value.isKeyClient)
  );
});

/**
 * Validar formulario antes de enviar
 */
function validateForm() {
  errors.value = { name: "", general: "" };
  let isValid = true;

  if (!formData.value.name.trim()) {
    errors.value.name = "El nombre es obligatorio";
    isValid = false;
  }

  if (formData.value.name.trim().length < 2) {
    errors.value.name = "El nombre debe tener al menos 2 caracteres";
    isValid = false;
  }

  return isValid;
}

/**
 * Manejar envío del formulario
 */
async function handleSubmit() {
  if (!validateForm() || !hasChanges.value) {
    return;
  }

  loading.value = true;
  errors.value.general = "";

  try {
    await updateClient(props.client.uuid, {
      name: formData.value.name.trim(),
      phone: formData.value.phone.trim() || null,
      dni: formData.value.dni.trim() || null,
      originChannel: formData.value.originChannel || null,
      originDetail: formData.value.originDetail.trim() || null,
      notes: formData.value.notes.trim() || null,
      isKeyClient: Boolean(formData.value.isKeyClient),
    });

    console.log("✅ Cliente actualizado exitosamente");

    emit("updated", props.client.uuid);
    closeModal();
  } catch (error) {
    console.error("❌ Error al actualizar cliente:", error);
    errors.value.general = error.message || "Error al actualizar el cliente";
  } finally {
    loading.value = false;
  }
}

/**
 * Cerrar modal
 */
function closeModal() {
  if (!loading.value) {
    emit("close");
    errors.value = { name: "", general: "" };
  }
}
</script>
