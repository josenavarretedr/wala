<template>
  <div class="text-center py-20">
    <p class="text-lg text-gray-600">Cargando información del negocio...</p>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useBusinessStore } from "@/stores/businessStore";

const router = useRouter();
const businessStore = useBusinessStore();

async function checkBusinessOwner() {
  // await businessStore.resetStore();
  const businesses = await businessStore.fetchBusinessesForCurrentUser();
  if (businesses.length > 0) {
    const businessId = businesses[0].id;
    businessStore.setCurrentBusinessId(businessId);
    router.replace(`/dashboard/${businessId}`);
  } else {
    console.log("Sin negocios");
    router.replace("/dashboard/createNewBusiness");
  }
}

await checkBusinessOwner();
</script>
