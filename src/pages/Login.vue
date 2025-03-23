<template>
  <div class="w-full max-w-sm mx-auto py-10">
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
      Iniciar Sesión
    </h1>

    <form
      @submit.prevent="handleLogin"
      class="bg-white rounded-2xl shadow-xl px-8 py-10 space-y-6"
    >
      <div class="flex items-center space-x-4 border-b pb-2">
        <Mail class="w-8 h-8 text-blue-500" />
        <input
          v-model="email"
          type="email"
          placeholder="Correo"
          class="w-full text-lg placeholder-gray-400 focus:outline-none"
        />
      </div>

      <div class="flex items-center space-x-4 border-b pb-2">
        <Lock class="w-8 h-8 text-blue-500" />
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          class="w-full text-lg placeholder-gray-400 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        class="w-full flex justify-center items-center bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        :disabled="loading"
      >
        <NavArrowRight class="w-6 h-6 mr-2" />
        {{ loading ? "Cargando..." : "Entrar" }}
      </button>

      <p v-if="error" class="text-red-500 text-center">{{ error }}</p>

      <RouterLink
        to="/auth/register"
        class="block text-center text-blue-500 hover:underline mt-4 text-lg"
      >
        Registrarse
      </RouterLink>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { Mail, Lock, NavArrowRight } from "@iconoir/vue"; // ← reemplaza Login

const email = ref("");
const password = ref("");
const authStore = useAuthStore();
const router = useRouter();

const { login, loading, error, user } = authStore;

async function handleLogin() {
  await login(email.value, password.value);
}

watch(user, (newUser) => {
  if (newUser) {
    router.push("/dashboard");
  }
});
</script>
