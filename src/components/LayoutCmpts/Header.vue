<template>
  <header class="bg-gray-800 text-white p-4">
    <RouterLink :to="{ name: 'DashboardRedirect' }">
      <h1 class="text-2xl font-bold">SUMMATAP</h1>
    </RouterLink>
    <BtnLogout v-if="authStore.user.value" />
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import BtnLogout from "@/components/Auth/BtnLogout.vue";

const authStore = useAuthStore();

const someOne = computed(() => {
  if (authStore.user.value) {
    return authStore.user.value.uid;
  }
  return "nadie";
});
</script>
