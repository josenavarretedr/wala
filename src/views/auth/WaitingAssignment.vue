<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div
          class="mx-auto w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mb-6"
        >
          <span class="text-3xl">⏳</span>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Esperando Asignación
        </h2>
        <p class="text-gray-600 text-lg">
          Tu cuenta está pendiente de asignación a un negocio
        </p>
      </div>

      <!-- Estado -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div class="text-center space-y-6">
          <!-- Información del usuario -->
          <div v-if="userProfile" class="space-y-2">
            <h3 class="text-xl font-semibold text-gray-800">
              Hola, {{ userProfile.nombre || "Usuario" }} 👋
            </h3>
            <p class="text-gray-600">{{ userProfile.email }}</p>
            <div
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
            >
              👤 Empleado
            </div>
          </div>

          <!-- Estado de asignación -->
          <div class="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div class="flex items-center justify-center space-x-3 mb-4">
              <span class="text-2xl">📋</span>
              <h4 class="text-lg font-semibold text-orange-800">
                Estado de Asignación
              </h4>
            </div>
            <p class="text-orange-700 text-sm">
              Tu cuenta de empleado ha sido creada exitosamente, pero aún no has
              sido asignado a ningún negocio.
            </p>
          </div>

          <!-- Instrucciones -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-800">
              ¿Qué hacer ahora?
            </h4>
            <div class="space-y-3 text-left">
              <div class="flex items-start space-x-3">
                <span class="text-blue-500 font-semibold">1.</span>
                <p class="text-gray-700">
                  Contacta a tu gerente o administrador del negocio
                </p>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-blue-500 font-semibold">2.</span>
                <p class="text-gray-700">
                  Proporciona tu email:
                  <strong>{{ userProfile?.email }}</strong>
                </p>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-blue-500 font-semibold">3.</span>
                <p class="text-gray-700">
                  Solicita que te asigne al negocio correspondiente
                </p>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="space-y-3">
            <button
              @click="checkAssignment"
              :disabled="isChecking"
              class="w-full flex justify-center items-center py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
            >
              <span v-if="!isChecking" class="flex items-center">
                🔄 Verificar Asignación
              </span>
              <span v-else class="flex items-center"> ⏳ Verificando... </span>
            </button>

            <button
              @click="logout"
              class="w-full flex justify-center items-center py-3 px-4 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              🚪 Cerrar Sesión
            </button>
          </div>

          <!-- Mensaje de estado -->
          <div v-if="statusMessage" class="mt-4">
            <div
              v-if="statusMessage.type === 'success'"
              class="bg-green-50 border border-green-200 rounded-xl p-4"
            >
              <span class="text-green-400 mr-2">✅</span>
              <span class="text-sm text-green-700">{{
                statusMessage.text
              }}</span>
            </div>
            <div
              v-else-if="statusMessage.type === 'error'"
              class="bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <span class="text-red-400 mr-2">⚠️</span>
              <span class="text-sm text-red-700">{{ statusMessage.text }}</span>
            </div>
            <div
              v-else
              class="bg-blue-50 border border-blue-200 rounded-xl p-4"
            >
              <span class="text-blue-400 mr-2">ℹ️</span>
              <span class="text-sm text-blue-700">{{
                statusMessage.text
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Información de contacto -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <h4 class="text-lg font-semibold text-blue-800 mb-2">
          ¿Necesitas ayuda?
        </h4>
        <p class="text-blue-700 text-sm">
          Si tienes problemas para contactar a tu gerente, comunícate con el
          soporte técnico.
        </p>
        <div class="mt-3 text-xs text-blue-600">
          📧 soporte@walla.app | 📞 +51 999 888 777
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useBusinessStore } from "@/stores/businessStore";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const businessStore = useBusinessStore();

const isChecking = ref(false);
const statusMessage = ref(null);

const userProfile = computed(() => userStore.userProfile);

onMounted(() => {
  // Verificar que el usuario está autenticado y es empleado
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  if (userProfile.value?.rol !== "empleado") {
    router.push("/login");
    return;
  }

  // Mensaje inicial
  statusMessage.value = {
    type: "info",
    text: "Esperando asignación a un negocio. Contacta a tu gerente.",
  };
});

const checkAssignment = async () => {
  isChecking.value = true;
  statusMessage.value = null;

  try {
    // Recargar el perfil del usuario para verificar si fue asignado
    await userStore.loadUserProfile(authStore.user.uid);

    if (
      userProfile.value?.businessId &&
      userProfile.value.businessId !== "TEMP"
    ) {
      // ¡El usuario fue asignado!
      statusMessage.value = {
        type: "success",
        text: "¡Excelente! Has sido asignado a un negocio. Redirigiendo...",
      };

      // Cargar el negocio y redirigir
      setTimeout(async () => {
        try {
          await businessStore.loadBusiness(userProfile.value.businessId);
          router.push(`/business/${userProfile.value.businessId}/dashboard`);
        } catch (error) {
          console.error("Error al cargar negocio:", error);
          statusMessage.value = {
            type: "error",
            text: "Error al acceder al negocio. Inténtalo de nuevo.",
          };
        }
      }, 2000);
    } else {
      // Aún no ha sido asignado
      statusMessage.value = {
        type: "info",
        text: "Aún no has sido asignado a ningún negocio. Contacta a tu gerente.",
      };
    }
  } catch (error) {
    console.error("Error al verificar asignación:", error);
    statusMessage.value = {
      type: "error",
      text: "Error al verificar el estado de asignación. Inténtalo de nuevo.",
    };
  } finally {
    isChecking.value = false;
  }
};

const logout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    statusMessage.value = {
      type: "error",
      text: "Error al cerrar sesión. Inténtalo de nuevo.",
    };
  }
};
</script>
