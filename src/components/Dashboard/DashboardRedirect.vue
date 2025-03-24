<!-- src/pages/DashboardRedirect.vue -->
<template>
  <div class="text-center py-20">
    <p class="text-lg text-gray-600">Cargando información del negocio...</p>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { onMounted } from "vue";
import { useBusinessStore } from "@/stores/businessStore";

const router = useRouter();
const businessStore = useBusinessStore();

onMounted(async () => {
  const businesses = await businessStore.fetchBusinessesForCurrentUser();

  if (businesses.length > 0) {
    const businessId = businesses[0].id;
    businessStore.setCurrentBusinessId(businessId);

    console.log("Redirecting to business", businessId);
    router.replace(`/dashboard/${businessId}`);
  } else {
    router.replace("/dashboard/createNewBusiness");
  }
});
</script>
