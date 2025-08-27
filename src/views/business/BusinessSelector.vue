<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4"
        >
          <span class="text-2xl font-bold text-white">W</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Selecciona tu negocio
        </h1>
        <p class="text-gray-600">
          Tienes acceso a {{ userStore.userBusinesses.length }} negocio{{
            userStore.userBusinesses.length !== 1 ? "s" : ""
          }}
        </p>
      </div>

      <!-- Grid de negocios -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div
          v-for="business in userStore.userBusinesses"
          :key="business.businessId"
          @click="selectBusiness(business)"
          class="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 group"
        >
          <!-- Header del negocio -->
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors"
            >
              <span class="text-white font-bold text-lg">
                {{ business.businessName.charAt(0).toUpperCase() }}
              </span>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                business.rol === 'gerente'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800',
              ]"
            >
              {{ business.rol === "gerente" ? "👑 Gerente" : "👤 Empleado" }}
            </span>
          </div>

          <!-- Nombre del negocio -->
          <h3
            class="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"
          >
            {{ business.businessName }}
          </h3>

          <!-- Departamento -->
          <p class="text-sm text-gray-600 mb-4">
            <span class="inline-flex items-center">
              <span class="mr-1">🏢</span>
              {{ business.departamento || "Sin departamento específico" }}
            </span>
          </p>

          <!-- Footer -->
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">
              📅 Desde {{ formatDate(business.fechaIngreso) }}
            </span>
            <div class="flex items-center space-x-2">
              <span
                v-if="business.esPrincipal"
                class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"
              >
                ⭐ Principal
              </span>
              <span class="text-lg">→</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones adicionales -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <!-- Botón para crear nuevo negocio -->
        <button
          @click="createNewBusiness"
          class="inline-flex items-center justify-center px-6 py-3 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
        >
          <span class="mr-2 text-lg">➕</span>
          Crear nuevo negocio
        </button>

        <!-- Botón para cerrar sesión -->
        <button
          @click="handleLogout"
          class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <span class="mr-2 text-lg">🚪</span>
          Cerrar sesión
        </button>
      </div>

      <!-- Loading state -->
      <div
        v-if="isLoading"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-xl p-6 text-center">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
          ></div>
          <p class="text-gray-600">Cargando negocio...</p>
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
  if (userStore.userBusinesses.length === 1) {
    const business = userStore.userBusinesses[0];
    selectBusiness(business);
  }
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

const formatDate = (date) => {
  try {
    // Manejar diferentes tipos de fecha
    let dateObj;
    if (date && date.seconds) {
      // Timestamp de Firestore
      dateObj = new Date(date.seconds * 1000);
    } else if (date) {
      // Fecha normal
      dateObj = new Date(date);
    } else {
      return "Fecha no disponible";
    }

    return dateObj.toLocaleDateString("es-ES", {
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "Fecha inválida";
  }
};
</script>
