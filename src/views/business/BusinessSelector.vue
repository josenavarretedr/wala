<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header simplificado -->
      <div class="text-center mb-8">
        <div
          class="mx-auto w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4"
        >
          <span class="text-xl font-bold text-blue-600">W</span>
        </div>
        <h1 class="text-2xl font-semibold text-gray-900 mb-1">
          Selecciona tu negocio
        </h1>
        <p class="text-sm text-gray-500">
          {{ userStore.userBusinesses.length }} negocio{{
            userStore.userBusinesses.length !== 1 ? "s" : ""
          }}
          disponible{{ userStore.userBusinesses.length !== 1 ? "s" : "" }}
        </p>
      </div>

      <!-- Grid de negocios - estilo ResumenDay -->
      <div class="space-y-4 mb-6">
        <div
          v-for="business in userStore.userBusinesses"
          :key="business.businessId"
          @click="selectBusiness(business)"
          class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-md group"
        >
          <div class="flex items-center justify-between">
            <!-- Información del negocio -->
            <div class="flex items-center gap-3 flex-1">
              <div
                class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors"
              >
                <span class="text-blue-600 font-semibold text-lg">
                  {{ business.businessName.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="flex-1">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                  {{ business.businessName }}
                </h3>
                <p class="text-xs sm:text-sm text-gray-500">
                  {{ business.departamento || "Sin departamento" }}
                </p>
              </div>
            </div>

            <!-- Indicador de acción -->
            <div
              class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors"
            >
              <svg
                class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones adicionales - estilo simplificado -->
      <div class="space-y-3">
        <!-- Botón para crear nuevo negocio -->
        <button
          @click="createNewBusiness"
          class="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 text-left hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors"
            >
              <svg
                class="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">
                Crear nuevo negocio
              </h3>
              <p class="text-xs text-gray-500">
                Configura un nuevo emprendimiento
              </p>
            </div>
          </div>
        </button>

        <!-- Botón para cerrar sesión -->
        <button
          @click="handleLogout"
          class="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 text-left hover:bg-red-50 hover:border-red-300 transition-all duration-200 group"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors"
            >
              <svg
                class="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">Cerrar sesión</h3>
              <p class="text-xs text-gray-500">Salir de tu cuenta</p>
            </div>
          </div>
        </button>
      </div>

      <!-- Loading state -->
      <div
        v-if="isLoading"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-xl p-6 text-center shadow-xl">
          <div
            class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"
          ></div>
          <p class="text-sm text-gray-600">Cargando negocio...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useBusinessStore } from "@/stores/businessStore";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const businessStore = useBusinessStore();

const isLoading = ref(false);

onMounted(() => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  // Verificar que tiene negocios
  if (userStore.userBusinesses.length === 0) {
    router.push("/onboarding");
    return;
  }

  // Si solo tiene un negocio, redirigir automáticamente
  // if (userStore.userBusinesses.length === 1) {
  //   const business = userStore.userBusinesses[0];
  //   selectBusiness(business);
  // }
});

const selectBusiness = async (business) => {
  isLoading.value = true;

  try {
    console.log(`🔄 Seleccionando negocio: ${business.businessName}`);

    // Cambiar negocio activo en el store
    userStore.switchBusiness(business.businessId);

    // Cargar datos del negocio
    await businessStore.loadBusiness(business.businessId);

    console.log(`✅ Negocio cargado, redirigiendo al dashboard`);

    // Redirigir al dashboard
    router.push(`/business/${business.businessId}/dashboard`);
  } catch (error) {
    console.error("❌ Error al seleccionar negocio:", error);
    // TODO: Mostrar mensaje de error al usuario
  } finally {
    isLoading.value = false;
  }
};

const createNewBusiness = () => {
  console.log("➕ Creando nuevo negocio");
  router.push("/onboarding?mode=create");
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
</script>
