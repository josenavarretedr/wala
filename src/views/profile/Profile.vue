<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header con botón de volver -->
      <div class="mb-6">
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver
        </button>
        <h1 class="text-2xl font-semibold text-gray-900 mb-1">Mis datos</h1>
        <p class="text-sm text-gray-500">Información personal de tu cuenta</p>
      </div>

      <!-- Contenido -->
      <div class="space-y-4">
        <!-- Card de información personal -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">
              Información personal
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
            <!-- Nombre completo -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">
                Nombre completo
              </label>
              <input
                v-model="formData.name"
                type="text"
                :disabled="!isEditing"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <!-- Email (no editable) -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">
                Correo electrónico
              </label>
              <input
                v-model="formData.email"
                type="email"
                disabled
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p class="mt-1 text-xs text-gray-500">
                El correo electrónico no se puede modificar
              </p>
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

        <!-- Card de información de la cuenta -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
        >
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Información de la cuenta
          </h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-600">ID de usuario</span>
              <span class="font-mono text-gray-900">{{
                authStore.user?.uid || "N/A"
              }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-600">Fecha de registro</span>
              <span class="text-gray-900">{{ formatDate(createdAt) }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-600">Negocios</span>
              <span class="text-gray-900">
                {{ userStore.userBusinesses.length }} negocio{{
                  userStore.userBusinesses.length !== 1 ? "s" : ""
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import appFirebase from "@/firebaseInit";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const db = getFirestore(appFirebase);

const isEditing = ref(false);
const isSaving = ref(false);
const message = ref(null);

const formData = ref({
  name: "",
  email: "",
});

const originalData = ref({});

const createdAt = computed(() => {
  return userStore.userData?.createdAt || null;
});

onMounted(() => {
  loadUserData();
});

const loadUserData = async () => {
  const user = authStore.user;
  if (user) {
    // Cargar datos desde Firestore
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        formData.value = {
          name: userData.name || user.displayName || "",
          email: user.email || "",
        };
      } else {
        formData.value = {
          name: user.displayName || "",
          email: user.email || "",
        };
      }
      originalData.value = { ...formData.value };
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      formData.value = {
        name: user.displayName || "",
        email: user.email || "",
      };
      originalData.value = { ...formData.value };
    }
  }
};

const handleSave = async () => {
  isSaving.value = true;
  message.value = null;

  try {
    const user = authStore.user;
    if (!user) throw new Error("No hay usuario autenticado");

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      name: formData.value.name,
      updatedAt: new Date(),
    });

    message.value = {
      type: "success",
      text: "Tus datos se han actualizado correctamente",
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

const goBack = () => {
  router.back();
};
</script>
