<template>
  <div>
    <h1>Register</h1>
    <form @submit.prevent="register">
      <input type="text" v-model="form.email" placeholder="Email" />
      <input type="password" v-model="form.password" placeholder="Password" />
      <button type="submit">Register</button>
    </form>
    <RouterLink to="/auth/login">Login</RouterLink>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";

const form = ref({
  email: "",
  password: "",
});

const authStore = useAuthStore();

async function register() {
  // await authStore.register(form.value.email, form.value.password);
  console.log(form.value.email, form.value.password);
}
</script>
