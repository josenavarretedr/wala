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

          <!-- Separador -->
          <div class="relative my-4">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">O continuar con</span>
            </div>
          </div>

          <!-- Botón Google -->
          <button
            type="button"
            @click="handleGoogleLogin"
            :disabled="isLoading"
            class="w-full flex justify-center items-center gap-3 py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Iniciar sesión con Google</span>
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
import { useInvitationStore } from "@/stores/invitationStore";

const email = ref("");
const password = ref("");

const router = useRouter();
const route = useRoute();

// 🏪 Stores (solo estado reactivo)
const authStore = useAuthStore();
const userStore = useUserStore();
const businessStore = useBusinessStore();
const invitationStore = useInvitationStore();

// Estado local del componente
const error = ref(null);
const isLoading = ref(false);
const inviteToken = ref(route.query.invite || null);

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

    // Si viene con invitación, auto-vincular al negocio y redirigir
    if (inviteToken.value) {
      console.log("🔗 Vinculando a negocio mediante invitación tras login...");
      const inv = await invitationStore.useInvitation(inviteToken.value, userStore.userProfile);
      console.log("✅ Negocio vinculado. Recargando negocios...");
      await userStore.loadUserBusinesses(uid);
      userStore.switchBusiness(inv.businessId);
      await businessStore.loadBusiness(inv.businessId);
      return router.push(`/business/${inv.businessId}/dashboard`);
    }

    // 3. Verificar el rol del usuario
    const userRole = userStore.userProfile?.rol;
    console.log("👤 Rol del usuario:", userRole);

    // 4. Si es facilitador, redirigir a /programs
    if (userRole === "facilitator") {
      console.log("🔄 Usuario facilitador, redirigiendo a /programs");
      return router.push("/programs");
    }

    // 5. Para business owners: verificar cantidad de negocios
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

    // Cargar perfil del usuario
    await userStore.loadUserProfile(uid);

    // Si viene con invitación, auto-vincular al negocio y redirigir
    if (inviteToken.value) {
      console.log("🔗 Vinculando a negocio mediante invitación tras Google login...");
      const inv = await invitationStore.useInvitation(inviteToken.value, userStore.userProfile);
      console.log("✅ Negocio vinculado. Recargando negocios...");
      await userStore.loadUserBusinesses(uid);
      userStore.switchBusiness(inv.businessId);
      await businessStore.loadBusiness(inv.businessId);
      return router.push(`/business/${inv.businessId}/dashboard`);
    }

    // Verificar el rol del usuario
    const userRole = userStore.userProfile?.rol;
    console.log("👤 Rol del usuario:", userRole);

    // Si es facilitador, redirigir a /programs
    if (userRole === "facilitator") {
      console.log("🔄 Usuario facilitador, redirigiendo a /programs");
      return router.push("/programs");
    }

    // Para business owners: verificar cantidad de negocios
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
