<template>
  <div class="w-full max-w-sm mx-auto">
    <h1 class="text-2xl font-bold text-center mb-6">Iniciar Sesión</h1>
    <form @submit.prevent="login">
      <input
        v-model="email"
        type="email"
        placeholder="Correo"
        class="input-field"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Contraseña"
        class="input-field"
      />
      <button type="submit" class="btn-primary">Entrar</button>
    </form>

    <RouterLink to="/auth/register">Registrarse</RouterLink>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";

const email = ref("");
const password = ref("");
const authStore = useAuthStore();

async function login() {
  await authStore.login(email.value, password.value);
}
</script>
