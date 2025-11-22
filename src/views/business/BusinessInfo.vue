<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900 mb-1">
        Datos del negocio
      </h1>
      <p class="text-sm text-gray-500">
        Información y configuración de tu negocio
      </p>
    </div>

    <!-- Contenido -->
    <div class="space-y-4">
      <!-- Card de información básica -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">
            Información básica
          </h2>
          <button
            v-if="!isEditing"
            @click="isEditing = true"
            class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
          >
            Editar
          </button>
        </div>

        <form @submit.prevent="handleSave" class="space-y-6">
          <!-- Nombre del negocio -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Nombre del negocio
            </label>
            <input
              v-model="formData.nombre"
              type="text"
              :disabled="!isEditing"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Ej: Mi Bodega Central"
            />
          </div>

          <!-- Tipo de negocio -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Tipo de negocio
            </label>
            <select
              v-model="formData.tipo"
              :disabled="!isEditing"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="restaurante">Restaurante</option>
              <option value="tienda">Tienda</option>
              <option value="bodega">Bodega</option>
              <option value="farmacia">Farmacia</option>
              <option value="panaderia">Panadería</option>
              <option value="ferreteria">Ferretería</option>
              <option value="salon">Salón de Belleza</option>
              <option value="consultorio">Consultorio</option>
              <option value="cafeteria">Cafetería</option>
              <option value="servicios">Servicios</option>
              <option value="consultoria">Consultoría</option>
              <option value="freelance">Freelance</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Descripción
            </label>
            <textarea
              v-model="formData.descripcion"
              :disabled="!isEditing"
              rows="3"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Describe brevemente tu negocio..."
            ></textarea>
          </div>

          <!-- Botones de acción (solo en modo edición) -->
          <div v-if="isEditing" class="flex gap-3 pt-4">
            <button
              type="button"
              @click="handleCancel"
              class="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              Cancelar
            </button>

            <button
              type="submit"
              :disabled="isSaving"
              class="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
            >
              <span v-if="!isSaving" class="flex items-center justify-center">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Guardar cambios
              </span>
              <span v-else class="flex items-center justify-center">
                <div
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                ></div>
                Guardando...
              </span>
            </button>
          </div>

          <!-- Mensaje de éxito/error -->
          <div
            v-if="message"
            :class="[
              'rounded-lg p-4',
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200',
            ]"
          >
            <div class="flex items-start">
              <svg
                v-if="message.type === 'success'"
                class="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                :class="[
                  'text-sm',
                  message.type === 'success'
                    ? 'text-green-700'
                    : 'text-red-700',
                ]"
              >
                {{ message.text }}
              </span>
            </div>
          </div>
        </form>
      </div>

      <!-- Card de información adicional -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
      >
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Información del sistema
        </h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">ID del negocio</span>
            <span class="font-mono text-gray-900">{{
              businessStore.business?.id || "N/A"
            }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">Fecha de creación</span>
            <span class="text-gray-900">{{ formatDate(createdAt) }}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-600">Estado</span>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              Activo
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useBusinessStore } from "@/stores/businessStore";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import appFirebase from "@/firebaseInit";

const route = useRoute();
const businessStore = useBusinessStore();
const db = getFirestore(appFirebase);

const isEditing = ref(false);
const isSaving = ref(false);
const message = ref(null);

const formData = ref({
  nombre: "",
  tipo: "",
  descripcion: "",
});

const originalData = ref({});

const createdAt = computed(() => {
  const business = businessStore.business;
  return business?.fechaCreacion || business?.createdAt || null;
});

onMounted(() => {
  loadBusinessData();
});

const loadBusinessData = () => {
  const business = businessStore.business;
  if (business) {
    formData.value = {
      nombre: business.nombre || business.name || "",
      tipo: business.tipo || "",
      descripcion: business.descripcion || business.description || "",
    };
    originalData.value = { ...formData.value };
  }
};

const handleSave = async () => {
  isSaving.value = true;
  message.value = null;

  try {
    const businessId = route.params.businessId;
    const businessRef = doc(db, "businesses", businessId);

    await updateDoc(businessRef, {
      nombre: formData.value.nombre,
      tipo: formData.value.tipo,
      descripcion: formData.value.descripcion,
      updatedAt: new Date(),
    });

    // Actualizar el store local
    await businessStore.loadBusiness(businessId);

    message.value = {
      type: "success",
      text: "Los datos del negocio se han actualizado correctamente",
    };
    isEditing.value = false;
    originalData.value = { ...formData.value };

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      message.value = null;
    }, 3000);
  } catch (error) {
    console.error("Error al guardar:", error);
    message.value = {
      type: "error",
      text: "Error al guardar los cambios. Inténtalo de nuevo.",
    };
  } finally {
    isSaving.value = false;
  }
};

const handleCancel = () => {
  formData.value = { ...originalData.value };
  isEditing.value = false;
  message.value = null;
};

const formatDate = (date) => {
  if (!date) return "No disponible";
  try {
    let dateObj;
    if (date && date.seconds) {
      dateObj = new Date(date.seconds * 1000);
    } else if (date) {
      dateObj = new Date(date);
    } else {
      return "No disponible";
    }
    return dateObj.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return "Fecha inválida";
  }
};
</script>
