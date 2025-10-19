<template>
  <!-- Botones de acciones de inventario -->
  <div
    class="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 max-w-4xl mx-auto bg-white p-2 sm:p-4 rounded-xl"
  >
    <!-- Botón Inventario (Naranja) - Solo si trackStock es true -->
    <div
      v-if="trackStock"
      class="relative group w-full sm:flex-1 max-w-md sm:max-w-sm mx-auto sm:mx-0"
    >
      <button
        @click="handleInventoryAction"
        class="w-full py-2 px-3 sm:py-2.5 sm:px-4 bg-white border border-orange-600 text-orange-600 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-sm hover:bg-orange-600 hover:text-white hover:shadow-md hover:shadow-orange-500/20 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <ClipboardCheck class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span class="font-semibold tracking-wide">INVENTARIO</span>
      </button>
    </div>

    <!-- Botón Ingreso (Azul) - Solo si trackStock es true -->
    <div
      v-if="trackStock"
      class="relative group w-full sm:flex-1 max-w-md sm:max-w-sm mx-auto sm:mx-0"
    >
      <button
        @click="handleIngresoAction"
        class="w-full py-2 px-3 sm:py-2.5 sm:px-4 bg-white border border-blue-600 text-blue-600 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-sm hover:bg-blue-600 hover:text-white hover:shadow-md hover:shadow-blue-500/20 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <Plus class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span class="font-semibold tracking-wide">INGRESO</span>
      </button>
    </div>

    <!-- Botón Egreso (Rojo) - Siempre visible -->
    <div
      class="relative group w-full sm:flex-1 max-w-md sm:max-w-sm mx-auto sm:mx-0"
    >
      <button
        @click="handleEgresoAction"
        :disabled="trackStock && stock <= 0"
        :class="[
          'w-full py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-sm transition-all duration-200 transform flex items-center justify-center gap-2',
          trackStock && stock <= 0
            ? 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-red-600 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-500/20 hover:scale-[1.01] active:scale-[0.99]',
        ]"
      >
        <Minus class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span class="font-semibold tracking-wide">EGRESO</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { Plus, Minus, ClipboardCheck } from "@iconoir/vue";

// Props
const props = defineProps({
  trackStock: {
    type: Boolean,
    default: false,
  },
  stock: {
    type: Number,
    default: 0,
  },
});

const route = useRoute();
const router = useRouter();

/**
 * Maneja la acción de inventario
 * Para hacer conteo físico de inventario
 */
const handleInventoryAction = () => {
  console.log("🔶 INVENTARIO: Iniciando conteo de inventario físico");
  // Navegar a InventoryCount con los parámetros actuales
  router.push({
    name: "InventoryCount",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

/**
 * Maneja la acción de ingreso
 * Para registrar entradas/compras de productos
 */
const handleIngresoAction = () => {
  console.log("🔵 INGRESO: Registrando entrada de producto");

  // Navegar a AddStock con los parámetros actuales
  router.push({
    name: "AddStock",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

/**
 * Maneja la acción de egreso
 * Para registrar salidas/ventas de productos
 */
const handleEgresoAction = () => {
  console.log("🔴 EGRESO: Registrando salida de producto");

  // Navegar a RemoveStock con los parámetros actuales
  router.push({
    name: "RemoveStock",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
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
  transition: width 0.6s, height 0.6s;
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
