<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Registro</h2>
    <!-- Email/Password -->
    <div class="mb-4">
      <input
        v-model="name"
        type="text"
        placeholder="Nombre"
        class="w-full p-2 border border-gray-300 rounded-md"
      />
      <input
        v-model="email"
        type="email"
        placeholder="Correo electrónico"
        class="w-full p-2 mt-2 border border-gray-300 rounded-md"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Contraseña"
        class="w-full p-2 mt-2 border border-gray-300 rounded-md"
      />
    </div>

    <!-- Google Auth Button -->
    <!-- <button
      @click="loginWithGoogle"
      class="w-full py-2 bg-blue-500 text-white rounded-md"
    >
      Iniciar sesión con Google
    </button> -->

    <div class="mt-4">
      <button
        @click="register"
        class="w-full py-2 bg-green-500 text-white rounded-md"
      >
        Registrate
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";

import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");

const authStore = useAuthStore();

const register = async () => {
  try {
    await authStore.register(email.value, password.value, name.value);
    router.push("/dashboard");
  } catch (error) {
    console.error(error);
  }
};

const loginWithGoogle = async () => {
  try {
    await authStore.loginWithGoogle();
  } catch (error) {
    console.error(error);
  }
};
</script>
