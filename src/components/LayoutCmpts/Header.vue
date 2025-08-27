<template>
  <header
    class="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between"
  >
    <!-- Logo / Nombre del negocio -->
    <RouterLink
      :to="{ name: 'DashboardRedirect' }"
      class="flex items-center gap-3 group"
    >
      <Folder
        class="w-6 h-6 text-blue-600 group-hover:text-blue-800 transition"
      />
      <h1
        class="text-xl md:text-2xl font-semibold text-gray-800 tracking-wide group-hover:text-blue-700"
      >
        {{ displayName }}
      </h1>
    </RouterLink>

    <!-- Botón de cerrar sesión -->
    <BtnLogout v-if="authStore.user" />
  </header>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import BtnLogout from "@/components/Auth/BtnLogout.vue";
import { Folder } from "@iconoir/vue";

const authStore = useAuthStore();
const businessStore = useBusinessStore();

const displayName = ref("WALA");

const businessName = computed(() => {
  const currentBusiness = businessStore.business;
  return currentBusiness?.nombre || null;
});

// Watch para actualizar el título dinámicamente
watch(
  () => authStore.user,
  (newUser) => {
    if (!newUser) {
      displayName.value = "WALA";
    } else {
      displayName.value = businessName.value || "WALA";
    }
  },
  { immediate: true }
);

// También observar si cambia el negocio seleccionado
watch(
  () => businessStore.business,
  () => {
    if (authStore.user) {
      displayName.value = businessName.value || "WALA";
    }
  }
);
</script>
