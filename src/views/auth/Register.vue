<template>
  <div class="w-full max-w-sm mx-auto py-10">
    <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">
      Crear cuenta
    </h2>

    <form
      @submit.prevent="register"
      class="bg-white rounded-2xl shadow-xl px-8 py-10 space-y-6"
    >
      <!-- Nombre -->
      <div class="flex items-center space-x-4 border-b pb-2">
        <ProfileCircle class="w-8 h-8 text-green-500" />
        <input
          v-model="name"
          type="text"
          placeholder="Nombre completo"
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
          class="w-full text-lg placeholder-gray-400 focus:outline-none"
        />
      </div>

      <!-- Botón de registro -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full flex justify-center items-center bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        <UserPlus v-if="!isLoading" class="w-6 h-6 mr-2" />
        <span v-if="!isLoading">Registrarse</span>
        <span v-else>🔄 Creando cuenta...</span>
      </button>

      <!-- Error message -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <span class="text-red-400 mr-2">⚠️</span>
        <span class="text-sm text-red-700">{{ error }}</span>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useRouter } from "vue-router";
import { Mail, Lock, UserPlus, ProfileCircle } from "@iconoir/vue";

const name = ref("");
const email = ref("");
const password = ref("");
const error = ref(null);
const isLoading = ref(false);

const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

const register = async () => {
  error.value = null;
  isLoading.value = true;

  try {
    console.log("🔄 Iniciando proceso de registro...");

    // 1. Registrar usuario en Firebase Auth
    const user = await authStore.register(
      email.value,
      password.value,
      name.value
    );
    console.log("✅ Usuario registrado en Firebase Auth:", user.email);

    // 2. Crear perfil de usuario en Firestore
    const userProfileData = {
      uid: user.uid,
      email: user.email,
      nombre: name.value.trim().split(" ")[0] || name.value.trim(), // Primer nombre
      apellidos: name.value.trim().split(" ").slice(1).join(" ") || "", // Resto como apellidos
      fechaRegistro: new Date(),
      activo: true,
      configuracion: {
        theme: "light",
        notifications: true,
      },
    };

    await userStore.createUserProfile(userProfileData);
    console.log("✅ Perfil de usuario creado en Firestore");

    // 3. Redirigir a onboarding para crear su primer negocio
    console.log("🔄 Redirigiendo a onboarding para crear primer negocio...");
    router.push("/onboarding");
  } catch (err) {
    console.error("❌ Error en registro:", err);
    error.value = err.message || "Error al crear la cuenta";
  } finally {
    isLoading.value = false;
  }
};
</script>
