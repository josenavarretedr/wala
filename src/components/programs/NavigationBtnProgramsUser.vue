<template>
  <!-- Botones de navegación fijos en la parte inferior -->
  <div
    class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg"
  >
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="flex flex-row items-stretch gap-3">
        <!-- Botón Unirme a un Programa (2/5) -->
        <button
          @click="handleJoinProgram"
          class="flex-[2] py-3 px-4 sm:py-4 sm:px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] hover:from-purple-700 hover:to-purple-800 hover:shadow-purple-500/35 flex items-center justify-center gap-2"
        >
          <Community class="w-5 h-5 flex-shrink-0" />
          <span class="hidden sm:inline">Unirme a un Programa</span>
          <span class="sm:hidden">Unirme</span>
        </button>

        <!-- Botón Premium (3/5) -->
        <button
          @click="handleGoToPremium"
          class="flex-[3] py-3 px-4 sm:py-4 sm:px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/35 flex items-center justify-center gap-2"
        >
          <BrightCrown class="w-5 h-5 flex-shrink-0" />
          <span class="hidden sm:inline">Descubre WALA Premium</span>
          <span class="sm:hidden">Premium</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Espaciador para evitar que el contenido quede oculto debajo de los botones -->
  <div class="h-20 sm:h-24"></div>
</template>

<script setup>
import { Community, BrightCrown } from "@iconoir/vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// Emitir evento para abrir el modal desde el componente padre
const emit = defineEmits(["openJoinModal"]);

const handleJoinProgram = () => {
  emit("openJoinModal");
};

const handleGoToPremium = () => {
  const businessId = route.params.businessId;
  if (businessId) {
    router.push(`/business/${businessId}/premium`);
  } else {
    console.error("No businessId found in route params");
  }
};
</script>

<style scoped>
/* Asegura que los botones siempre estén visibles */
.z-40 {
  z-index: 40;
}
</style>
