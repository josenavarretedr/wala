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
        class="w-full flex justify-center items-center bg-green-500 hover:bg-green-600 text-white text-xl font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        <UserPlus class="w-6 h-6 mr-2" />
        Registrarse
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { Mail, Lock, UserPlus, ProfileCircle } from "@iconoir/vue";

const name = ref("");
const email = ref("");
const password = ref("");

const authStore = useAuthStore();
const router = useRouter();

const register = async () => {
  try {
    await authStore.register(email.value, password.value, name.value);
    router.push("/dashboard/createNewBusiness");
  } catch (error) {
    console.error(error);
  }
};
</script>
