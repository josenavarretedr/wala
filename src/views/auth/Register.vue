<template>
  <div class="w-full max-w-sm mx-auto py-10">
    <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">
      Crear cuenta
    </h2>

    <form
      @submit.prevent="register"
      class="bg-white rounded-2xl shadow-xl px-8 py-10 space-y-6"
    >
      <!-- Selección de Rol (nuevo paso) -->
      <div v-if="!roleSelected" class="space-y-6">
        <div class="text-center space-y-2">
          <h3 class="text-xl font-semibold text-gray-800">
            ¿Cómo vas a usar Wala?
          </h3>
          <p class="text-sm text-gray-500">
            Selecciona la opción que mejor te describe
          </p>
        </div>

        <!-- Opciones de Rol -->
        <div class="grid grid-cols-1 gap-4">
          <!-- Opción: Dueño de Negocio -->
          <button
            @click="selectRole('business_owner')"
            type="button"
            class="group relative p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors"
              >
                <svg
                  class="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="text-lg font-semibold text-gray-900">
                  Soy dueño de mi negocio
                </h4>
                <p class="text-sm text-gray-500 mt-1">
                  Quiero gestionar las finanzas de mi emprendimiento
                </p>
              </div>
            </div>
          </button>

          <!-- Opción: Consultor/Facilitador -->
          <!-- <button
            @click="selectRole('facilitator')"
            type="button"
            class="group relative p-6 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-left"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors"
              >
                <svg
                  class="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="text-lg font-semibold text-gray-900">
                  Soy consultor de una ONG
                </h4>
                <p class="text-sm text-gray-500 mt-1">
                  Acompaño emprendedores en programas de fortalecimiento
                </p>
              </div>
            </div>
          </button> -->
        </div>
      </div>

      <!-- Formulario de Registro (se muestra después de seleccionar rol) -->
      <div v-else class="space-y-6">
        <!-- Banner de Invitación -->
        <div v-if="inviteDetails" class="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 text-white shadow-md mb-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-xl">
              <span class="text-xl">🎟️</span>
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-sm">Invitación Activa</h4>
              <p class="text-xs text-white/80">
                Te registrarás y unirás a <strong>{{ inviteDetails.businessName }}</strong> como <strong>{{ inviteDetails.rolNombre }}</strong>.
              </p>
            </div>
          </div>
        </div>

        <!-- Indicador de rol seleccionado -->
        <div
          v-if="!inviteDetails"
          class="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  userRole === 'business_owner'
                    ? 'bg-blue-100'
                    : 'bg-green-100',
                ]"
              >
                <svg
                  v-if="userRole === 'business_owner'"
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{
                    userRole === "business_owner"
                      ? "Dueño de Negocio"
                      : "Consultor/Facilitador"
                  }}
                </p>
                <p class="text-xs text-gray-500">Rol seleccionado</p>
              </div>
            </div>
            <button
              @click="roleSelected = false"
              type="button"
              class="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Cambiar
            </button>
          </div>
        </div>

        <!-- Nombre -->
        <div class="flex items-center space-x-4 border-b pb-2">
          <ProfileCircle class="w-8 h-8 text-green-500" />
          <input
            v-model="name"
            type="text"
            placeholder="Nombre completo"
            required
            class="w-full text-lg placeholder-gray-400 focus:outline-none"
          />
        </div>

        <!-- Correo -->
        <div class="flex items-center space-x-4 border-b pb-2">
          <Mail class="w-8 h-8 text-green-500" />
          <input
            v-model="email"
            type="email"
            placeholder="Correo electrónico"
            required
            class="w-full text-lg placeholder-gray-400 focus:outline-none"
          />
        </div>

        <!-- Contraseña -->
        <div class="flex items-center space-x-4 border-b pb-2">
          <Lock class="w-8 h-8 text-green-500" />
          <input
            v-model="password"
            type="password"
            placeholder="Contraseña"
            required
            minlength="6"
            class="w-full text-lg placeholder-gray-400 focus:outline-none"
          />
        </div>

        <!-- Botón de registro -->
        <button
          type="submit"
          :disabled="isLoading || !termsAccepted"
          class="w-full flex justify-center items-center bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <UserPlus v-if="!isLoading" class="w-6 h-6 mr-2" />
          <span v-if="!isLoading">Registrarse</span>
          <span v-else>🔄 Creando cuenta...</span>
        </button>

        <!-- Separador -->
        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">O registrarse con</span>
          </div>
        </div>

        <!-- Botón Google -->
        <button
          type="button"
          @click="handleGoogleRegister"
          :disabled="isLoading || !termsAccepted"
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
          <span>Registrarse con Google</span>
        </button>
      </div>

      <!-- Aceptación de términos y condiciones (siempre visible) -->
      <div class="pt-4 border-t border-gray-200">
        <label class="flex items-start gap-3 cursor-pointer group">
          <input
            v-model="termsAccepted"
            type="checkbox"
            class="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
          />
          <span class="text-sm text-gray-700 leading-relaxed">
            He leído y acepto los
            <router-link
              to="/legal/terminos-condiciones"
              target="_blank"
              class="text-green-600 hover:text-green-700 font-semibold underline"
            >
              Términos y Condiciones </router-link
            >, y autorizo expresamente el tratamiento de mis datos personales
            conforme a la
            <router-link
              to="/legal/politica-privacidad"
              target="_blank"
              class="text-green-600 hover:text-green-700 font-semibold underline"
            >
              Política de Privacidad </router-link
            >.
          </span>
        </label>
      </div>

      <!-- Enlace al login (siempre visible) -->
      <div class="text-center pt-2">
        <p class="text-sm text-gray-600">
          ¿Ya tienes una cuenta?
          <router-link
            to="/auth/login"
            class="font-semibold text-green-600 hover:text-green-700 transition-colors duration-200 ml-1"
          >
            Iniciar sesión
          </router-link>
        </p>
      </div>

      <!-- Error message -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <span class="text-red-400 mr-2">⚠️</span>
        <span class="text-sm text-red-700">{{ error }}</span>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useInvitationStore } from "@/stores/invitationStore";
import { useRouter, useRoute } from "vue-router";
import { Mail, Lock, UserPlus, ProfileCircle } from "@iconoir/vue";

// Estado local del componente
const name = ref("");
const email = ref("");
const password = ref("");
const error = ref(null);
const isLoading = ref(false);
const roleSelected = ref(false);
const userRole = ref(""); // "business_owner" o "facilitator"
const termsAccepted = ref(false);

// Invitación
const route = useRoute();
const invitationStore = useInvitationStore();
const inviteToken = ref(route.query.invite || null);
const inviteDetails = ref(null);

onMounted(async () => {
  if (inviteToken.value) {
    try {
      const inv = await invitationStore.getInvitationByToken(inviteToken.value);
      if (inv) {
        inviteDetails.value = inv;
        userRole.value = "business_owner";
        roleSelected.value = true;
        console.log("🎟️ Registro por invitación del negocio:", inv.businessName);
      } else {
        console.warn("⚠️ Token de invitación inválido o expirado");
        inviteToken.value = null;
      }
    } catch (err) {
      console.error("Error al verificar invitación en registro:", err);
      inviteToken.value = null;
    }
  }
});

// 🏪 Stores (solo estado reactivo)
const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

// Seleccionar rol
function selectRole(role) {
  userRole.value = role;
  roleSelected.value = true;
  console.log("✅ Rol seleccionado:", role);
}

// Manejar registro (solo lógica de flujo, Firebase via store)
const register = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    console.log("🔄 Iniciando proceso de registro en componente...");

    // 1. ✅ Registro via store (que usa composable)
    const userData = await authStore.register(
      email.value,
      password.value,
      name.value,
    );
    console.log("✅ Usuario registrado en Firebase Auth:", userData.email);

    // 2. Crear perfil de usuario en Firestore con rol
    const userProfileData = {
      uid: userData.uid,
      email: userData.email,
      nombre: name.value.trim().split(" ")[0] || name.value.trim(), // Primer nombre
      apellidos: name.value.trim().split(" ").slice(1).join(" ") || "", // Resto como apellidos
      rol: userRole.value, // ← NUEVO: Guardar rol
      fechaRegistro: new Date(),
      activo: true,
      configuracion: {
        theme: "light",
        notifications: true,
      },
      // Campo 'profile' requerido por Cloud Function joinProgramByCode (línea 322 de la CF)
      // La CF lee userData.profile como objeto anidado y lanza failed-precondition si está vacío
      profile: {
        name: name.value.trim(),
        nombre: name.value.trim().split(" ")[0] || name.value.trim(),
        apellidos: name.value.trim().split(" ").slice(1).join(" ") || "",
        email: userData.email,
      },
    };

    await userStore.createUserProfile(userProfileData);
    console.log(
      "✅ Perfil de usuario creado en Firestore con rol:",
      userRole.value,
    );

    // Si tiene invitación, auto-vincular al negocio
    if (inviteToken.value) {
      console.log("🔗 Vinculando a negocio por invitación...");
      await invitationStore.useInvitation(inviteToken.value, userProfileData);
      console.log("✅ Vinculación completada");
      router.push(`/business/${inviteDetails.value.businessId}/dashboard`);
      return;
    }

    // 3. Redirigir según el rol
    if (userRole.value === "facilitator") {
      // Facilitadores van directamente al hub de programas
      console.log("🔄 Redirigiendo a hub de facilitadores...");
      router.push("/programs");
    } else {
      // Business owners van a onboarding para crear su primer negocio
      console.log("🔄 Redirigiendo a onboarding para crear primer negocio...");
      router.push("/onboarding");
    }
  } catch (err) {
    console.error("❌ Error en registro:", err);
    error.value = err.message || "Error al crear la cuenta";
  } finally {
    isLoading.value = false;
  }
};

// Registrarse con Google (agregado para completar)
const handleGoogleRegister = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    console.log("🔄 Iniciando registro con Google en componente...");

    // 1. ✅ Registro/Login con Google via store (que usa composable)
    const userData = await authStore.loginWithGoogle();
    console.log(
      "✅ Usuario registrado/logeado en Firebase Auth con Google:",
      userData.email,
    );

    // 2. Crear perfil de usuario en Firestore con el rol preseleccionado
    const googleName = userData.displayName || "";
    const userProfileData = {
      uid: userData.uid,
      email: userData.email,
      nombre: googleName.trim().split(" ")[0] || googleName.trim(), // Primer nombre
      apellidos: googleName.trim().split(" ").slice(1).join(" ") || "", // Resto como apellidos
      rol: userRole.value, // Usar el rol seleccionado por el usuario
      fechaRegistro: new Date(),
      activo: true,
      configuracion: {
        theme: "light",
        notifications: true,
      },
      profile: {
        name: googleName.trim(),
        nombre: googleName.trim().split(" ")[0] || googleName.trim(),
        apellidos: googleName.trim().split(" ").slice(1).join(" ") || "",
        email: userData.email,
      },
    };

    await userStore.createUserProfile(userProfileData);
    console.log(
      "✅ Perfil de usuario creado en Firestore con rol:",
      userRole.value,
    );

    // Si tiene invitación, auto-vincular al negocio
    if (inviteToken.value) {
      console.log("🔗 Vinculando a negocio por invitación (Google)...");
      await invitationStore.useInvitation(inviteToken.value, userProfileData);
      console.log("✅ Vinculación completada");
      router.push(`/business/${inviteDetails.value.businessId}/dashboard`);
      return;
    }

    // 3. Redirigir según el rol
    if (userRole.value === "facilitator") {
      // Facilitadores van directamente al hub de programas
      console.log("🔄 Redirigiendo a hub de facilitadores...");
      router.push("/programs");
    } else {
      // Business owners van a onboarding para crear su primer negocio
      console.log("🔄 Redirigiendo a onboarding para crear primer negocio...");
      router.push("/onboarding");
    }
  } catch (err) {
    console.error("❌ Error en registro con Google:", err);
    error.value = err.message || "Error al crear la cuenta con Google";
  } finally {
    isLoading.value = false;
  }
};
</script>
