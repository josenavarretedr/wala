<template>
  <div class="max-w-3xl mx-auto p-4 sm:p-6 pb-24">
    <!-- Header con botón de volver -->
    <div class="flex items-center gap-3 mb-6">
      <BackBtn
        :route-name="'InventoryProductCosting'"
        :route-params="{
          businessId: route.params.businessId,
          productId: route.params.productId,
        }"
        tooltip-text="Volver al costeo"
      />
    </div>

    <!-- Título de la sección -->
    <div class="text-center mb-8">
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 mb-4"
      >
        <svg
          class="w-8 h-8 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          ></path>
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Gastos Generales</h1>
      <p class="text-sm text-gray-500 mb-1">
        {{ productName }}
      </p>
      <p class="text-xs text-gray-400">
        Configura los gastos administrativos y de ventas por artículo
      </p>
    </div>

    <!-- Card del formulario -->
    <div
      class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8"
    >
      <!-- Mensaje informativo -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div class="flex gap-3">
          <svg
            class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div class="text-sm text-amber-800">
            <p class="font-medium mb-1">Nota temporal</p>
            <p class="text-amber-700">
              Este es un campo provisional. En el futuro, aquí se implementará
              un flujo completo para calcular y gestionar los gastos generales.
            </p>
          </div>
        </div>
      </div>

      <!-- Input de costo -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <div class="flex items-center gap-2">
            <svg
              class="w-4 h-4 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Gastos Generales (S/)</span>
          </div>
        </label>
        <div class="relative">
          <span
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium"
          >
            S/
          </span>
          <input
            v-model.number="localCost"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-lg font-medium"
            @input="hasChanges = true"
          />
        </div>
        <p class="text-xs text-gray-500 mt-2">
          Ingresa los gastos generales por unidad de producto
        </p>
      </div>

      <!-- Vista previa del valor actual -->
      <div
        v-if="costingStore.hasOverheadCost && !hasChanges"
        class="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Costo actual guardado</span>
          <span class="text-xl font-bold text-amber-600">
            S/ {{ formatNumber(costingStore.costs.overhead) }}
          </span>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="handleSave"
          :disabled="saving || !isValidCost"
          :class="[
            'flex-1 px-6 py-3 rounded-xl font-medium transition-all',
            isValidCost && !saving
              ? 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed',
          ]"
        >
          <span v-if="!saving">Guardar Costo</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Guardando...
          </span>
        </button>

        <button
          @click="goBack"
          class="px-6 py-3 rounded-xl font-medium border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>

    <!-- Mensaje de éxito -->
    <div
      v-if="showSuccess"
      class="fixed bottom-6 right-6 bg-amber-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        ></path>
      </svg>
      <span class="font-medium">Costo guardado exitosamente</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductCostingStore } from "@/stores/productCostingStore";
import BackBtn from "@/components/ui/BackBtn.vue";

// Router
const route = useRoute();
const router = useRouter();

// Stores
const costingStore = useProductCostingStore();

// State
const localCost = ref(null);
const saving = ref(false);
const hasChanges = ref(false);
const showSuccess = ref(false);
const productName = ref("Producto");

// Computed
const isValidCost = computed(() => {
  return (
    localCost.value !== null && localCost.value !== "" && localCost.value >= 0
  );
});

// Methods
const loadCurrentCost = () => {
  const currentCost = costingStore.getCostByType("overhead");
  if (currentCost !== null && currentCost !== undefined) {
    localCost.value = currentCost;
  }
};

const handleSave = async () => {
  if (!isValidCost.value) return;

  saving.value = true;

  try {
    // Actualizar el store
    costingStore.updateOverheadCost(localCost.value);

    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mostrar mensaje de éxito
    showSuccess.value = true;
    hasChanges.value = false;

    // Ocultar mensaje después de 2 segundos
    setTimeout(() => {
      showSuccess.value = false;
    }, 2000);
  } catch (error) {
    console.error("Error al guardar costo:", error);
  } finally {
    saving.value = false;
  }
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "0.00";
  return parseFloat(value).toFixed(2);
};

const goBack = () => {
  router.push({
    name: "InventoryProductCosting",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

// Lifecycle
onMounted(() => {
  // Inicializar el store si es necesario
  if (route.params.productId) {
    costingStore.initializeProduct(route.params.productId);
  }

  loadCurrentCost();

  // TODO: Cargar el nombre del producto
  productName.value = "Cargando...";
});
</script>

<style scoped>
/* Animación para el mensaje de éxito */
@keyframes slide-up {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

/* Animación de spin */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Transiciones suaves */
input,
button {
  transition: all 0.2s ease;
}

/* Mejoras de accesibilidad */
button:focus,
input:focus {
  outline: none;
}
</style>
