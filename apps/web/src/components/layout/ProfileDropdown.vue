<template>
  <div class="relative">
    <!-- Botón del perfil -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <div
        class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"
      >
        <span class="text-gray-600 text-sm font-medium">
          {{ userInitials }}
        </span>
      </div>
      <svg
        class="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div
      v-show="isOpen"
      @click.away="isOpen = false"
      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
    >
      <!-- Información del usuario -->
      <div class="px-4 py-2 border-b border-gray-200">
        <p class="text-sm font-medium text-gray-900">
          {{ userStore.userProfile?.nombre }}
          {{ userStore.userProfile?.apellidos }}
        </p>
        <p class="text-xs text-gray-500">
          {{ userStore.userProfile?.email }}
        </p>
      </div>

      <!-- Opciones del menú -->
      <router-link
        to="/profile"
        @click="isOpen = false"
        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <span class="mr-3">👤</span>
        Mi Perfil
      </router-link>

      <router-link
        to="/notifications"
        @click="isOpen = false"
        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <span class="mr-3">🔔</span>
        Notificaciones
      </router-link>

      <router-link
        to="/security"
        @click="isOpen = false"
        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <span class="mr-3">🔒</span>
        Seguridad
      </router-link>

      <div class="border-t border-gray-200">
        <button
          @click="handleLogout"
          class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <span class="mr-3">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const isOpen = ref(false);

const userInitials = computed(() => {
  const nombre = userStore.userProfile?.nombre?.charAt(0) || "";
  const apellido = userStore.userProfile?.apellidos?.charAt(0) || "";
  return (nombre + apellido).toUpperCase();
});

const handleLogout = async () => {
  isOpen.value = false;
  await authStore.logout();
  router.push("/auth/login");
};

// Cerrar dropdown al hacer clic fuera
const clickAwayDirective = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function (event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};
</script>

<style scoped>
/* Añadir animación al dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
