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
  const businesses = await businessStore.fetchBusinessesForCurrentUser();
  if (businesses.length > 0) {
    console.log("Negocio id: ", businesses[0].id);
    businessStore.setCurrentBusinessId(businesses[0].id);
    router.replace(`/dashboard/${businesses[0].id}`);
  } else {
    console.log("Sin negocios");
    router.replace("/dashboard/createNewBusiness");
  }
}

await checkBusinessOwner();
</script>
