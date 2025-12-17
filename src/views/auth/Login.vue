<template>
  <div
    class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="flex justify-center mb-6">
          <img src="@/assets/logoWala2.png" alt="WALA" class="h-16 w-auto" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Bienvenido a WALA</h2>
        <p class="text-base text-gray-600">
          Ingresa a tu cuenta para entender tu negocio
        </p>
      </div>

      <!-- Formulario -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="tu.email@empresa.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Tu contraseña"
            />
          </div>

          <!-- Botón de login -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <template v-if="!isLoading"> Iniciar sesión </template>
            <template v-else>
              <svg
                class="animate-spin h-5 w-5 text-white"
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
              <span>Ingresando...</span>
            </template>
          </button>

          <!-- Enlace al registro -->
          <div class="text-center pt-2">
            <p class="text-sm text-gray-600">
              ¿No tienes una cuenta?
              <router-link
                to="/auth/register"
                class="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 ml-1"
              >
                Crear cuenta
              </router-link>
            </p>
          </div>

          <!-- Error message -->
          <div
            v-if="error"
            class="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useBusinessStore } from "@/stores/businessStore";

const email = ref("");
const password = ref("");

const router = useRouter();
const route = useRoute();

// 🏪 Stores (solo estado reactivo)
const authStore = useAuthStore();
const userStore = useUserStore();
const businessStore = useBusinessStore();

// Estado local del componente
const error = ref(null);
const isLoading = ref(false);

// Autocompletar demo
onMounted(() => {
  if (route.query.demo === "1") {
    email.value = "demo@walla.app";
    password.value = "Demo123!";
  }
});

// Manejar login (solo lógica de flujo, Firebase via store)
const handleLogin = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    console.log("🔄 Iniciando proceso de login en componente");

    // 1. ✅ Login via store (que usa composable)
    const userData = await authStore.login(email.value, password.value);
    const uid = userData.uid;

    console.log("✅ Login exitoso, iniciando flujo post-login");

    // 2. Cargar perfil y negocios del usuario
    await userStore.loadUserProfile(uid);

    // 3. Verificar cantidad de negocios
    const userBusinesses = userStore.userBusinesses;

    console.log(`📊 Usuario tiene ${userBusinesses.length} negocios`);

    if (userBusinesses.length === 0) {
      // Usuario sin negocios - Redirigir a onboarding
      console.log("Usuario sin negocios. Redirigiendo a onboarding...");
      return router.push("/onboarding");
    } else if (userBusinesses.length === 1) {
      // Usuario con un solo negocio - Ir directo
      const business = userBusinesses[0];
      console.log(`Usuario con un negocio: ${business.businessName}`);
      console.log(
        `🔍 Intentando cargar negocio con ID: ${business.businessId}`
      );

      // Establecer como negocio actual
      const switched = userStore.switchBusiness(business.businessId);
      if (!switched) {
        console.error("❌ No se pudo establecer el negocio actual");
        return router.push("/onboarding");
      }

      try {
        // Cargar datos del negocio
        await businessStore.loadBusiness(business.businessId);
        return router.push(`/business/${business.businessId}/dashboard`);
      } catch (loadError) {
        console.error("❌ Error al cargar datos del negocio:", loadError);
        // Si el negocio no existe en la DB, redirigir a onboarding
        console.log(
          "🔄 Redirigiendo a onboarding debido a negocio inconsistente"
        );
        return router.push("/onboarding");
      }
    } else {
      // Usuario con múltiples negocios - Mostrar selector
      console.log(
        `Usuario con ${userBusinesses.length} negocios. Mostrando selector...`
      );
      return router.push("/select-business");
    }
  } catch (e) {
    error.value = e.message || "Error al iniciar sesión.";
    console.error("❌ Error en login:", e);
  } finally {
    isLoading.value = false;
  }
};

// Login con Google (agregado para completar)
const handleGoogleLogin = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    console.log("🔄 Iniciando Google login en componente");

    // Login via store (que usa composable)
    const userData = await authStore.loginWithGoogle();
    const uid = userData.uid;

    console.log("✅ Google login exitoso, iniciando flujo post-login");

    // Mismo flujo que login normal
    await userStore.loadUserProfile(uid);
    const userBusinesses = userStore.userBusinesses;

    if (userBusinesses.length === 0) {
      return router.push("/onboarding");
    } else if (userBusinesses.length === 1) {
      const business = userBusinesses[0];
      userStore.switchBusiness(business.businessId);
      await businessStore.loadBusiness(business.businessId);
      return router.push(`/business/${business.businessId}/dashboard`);
    } else {
      return router.push("/select-business");
    }
  } catch (e) {
    error.value = e.message || "Error al iniciar sesión con Google.";
    console.error("❌ Error en Google login:", e);
  } finally {
    isLoading.value = false;
  }
};
</script>
