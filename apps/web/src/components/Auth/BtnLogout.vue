<template>
  <button
    @click="handleLogout"
    class="flex items-center justify-center gap-2 px-5 py-3 bg-red-500 text-white font-semibold rounded-xl shadow-md hover:bg-red-600 hover:scale-105 transition-all duration-200"
  >
    <LogOut class="w-6 h-6" />
  </button>
</template>

<script setup>
import { useAuthStore } from "@/stores/authStore";
import { LogOut } from "@iconoir/vue";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  try {
    await authStore.logout();
    alert("Sesión cerrada exitosamente.");
    router.push("/login");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
</script>
