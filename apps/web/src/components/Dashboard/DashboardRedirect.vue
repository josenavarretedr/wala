<!-- src/pages/DashboardRedirect.vue -->
<template>
  <div class="text-center py-20">
    <div
      class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
    ></div>
    <p class="text-lg text-gray-600">{{ loadingMessage }}</p>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { useBusinessStore } from "@/stores/businessStore";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const businessStore = useBusinessStore();
const userStore = useUserStore();
const authStore = useAuthStore();

const loadingMessage = ref("Cargando información...");

onMounted(async () => {
  try {
    // 1. Verificar autenticación
    if (!authStore.user?.uid) {
      console.log("❌ Usuario no autenticado, redirigiendo a login");
      router.replace("/auth/login");
      return;
    }

    // 2. Cargar perfil del usuario si no está cargado
    if (!userStore.userProfile) {
      loadingMessage.value = "Cargando perfil de usuario...";
      await userStore.loadUserProfile(authStore.user.uid);
    }

    const userRole = userStore.userProfile?.rol;
    console.log("👤 Rol del usuario:", userRole);

    // 3. Redirigir según el rol
    if (userRole === "facilitator") {
      // Facilitadores van al hub de programas
      console.log("🔄 Redirigiendo facilitador a /programs");
      loadingMessage.value = "Redirigiendo a tus programas...";
      router.replace("/programs");
      return;
    }

    // 4. Business owners: cargar negocios
    loadingMessage.value = "Cargando información del negocio...";
    const businesses = await businessStore.fetchBusinessesForCurrentUser();

    if (businesses.length > 0) {
      const businessId = businesses[0].id;
      businessStore.setCurrentBusinessId(businessId);

      console.log("✅ Redirigiendo a business:", businessId);
      router.replace(`/dashboard/${businessId}`);
    } else {
      // Usuario sin negocios → onboarding
      console.log("ℹ️ Usuario sin negocios, redirigiendo a onboarding");
      router.replace("/onboarding");
    }
  } catch (error) {
    console.error("❌ Error en DashboardRedirect:", error);
    // En caso de error, intentar redirección básica
    router.replace("/select-business");
  }
});
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
