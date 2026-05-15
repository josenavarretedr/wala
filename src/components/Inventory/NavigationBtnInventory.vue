<template>
  <!-- Botones de acciones de inventario -->
  <div
    class="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 max-w-4xl mx-auto bg-white p-2 sm:p-4 rounded-xl"
  >
    <!-- Botón Ingreso (Azul) - Solo si trackStock es true -->
    <div
      class="relative group w-full sm:flex-1 max-w-md sm:max-w-sm mx-auto sm:mx-0"
    >
      <button
        @click="handleAddProduct"
        class="w-full py-2 px-3 sm:py-2.5 sm:px-4 bg-white border border-orange-600 text-orange-600 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-sm hover:bg-orange-600 hover:text-white hover:shadow-md hover:shadow-orange-500/20 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <Plus class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span class="font-semibold tracking-wide">AGREGAR PRODUCTO</span>
      </button>
    </div>

    <!-- Botón Producir (Morado) - Solo si tiene capability de producción -->
    <div
      v-if="capabilities.enableProduction"
      class="relative group w-full sm:flex-1 max-w-md sm:max-w-sm mx-auto sm:mx-0"
    >
      <button
        @click="handleProduce"
        class="w-full py-2 px-3 sm:py-2.5 sm:px-4 bg-white border border-purple-600 text-purple-600 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-sm hover:bg-purple-600 hover:text-white hover:shadow-md hover:shadow-purple-500/20 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <BounceRight
          class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-lg flex items-center justify-center"
        ></BounceRight>
        <span class="font-semibold tracking-wide">PRODUCIR LOTE</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { BounceRight, Plus } from "@iconoir/vue";
import { useBusinessStore } from "@/stores/businessStore";
import { getBusinessCapabilities } from "@/utils/businessCapabilities";

const route = useRoute();
const router = useRouter();

const businessStore = useBusinessStore();
const capabilities = computed(() => {
  return getBusinessCapabilities(businessStore.business?.businessType);
});

const handleAddProduct = () => {
  console.log("🔵Agregando producto");

  // Navegar a AddStock con los parámetros actuales
  router.push({
    name: "InventoryAddProduct",
    params: {
      businessId: route.params.businessId,
    },
  });
};

const handleProduce = () => {
  router.push({
    name: "InventoryProductionWizard",
    params: {
      businessId: route.params.businessId,
    },
  });
};
</script>

<style scoped>
/* Animación para los botones */
button {
  position: relative;
  overflow: hidden;
}

button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition:
    width 0.6s,
    height 0.6s;
}

button:active::before {
  width: 300px;
  height: 300px;
}

/* Responsive */
@media (max-width: 640px) {
  button span {
    font-size: 0.875rem;
  }
}
</style>
