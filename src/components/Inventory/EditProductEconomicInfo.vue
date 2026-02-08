<template>
  <div class="space-y-6 pb-24">
    <!-- Título de la sección -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Información Económica</h2>
      <p class="text-sm text-gray-500 mt-2">
        Define el
        {{ localFormData.type === "RAW_MATERIAL" ? "costo" : "precio" }} del
        producto
      </p>
    </div>

    <!-- Grid: Precio y Costo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Precio de Venta (No para RAW_MATERIAL) -->
      <div v-if="localFormData.type !== 'RAW_MATERIAL'">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <div class="flex items-center gap-2">
            <svg
              class="w-5 h-5 text-green-600"
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
            Precio de Venta (S/)
            <span
              v-if="localFormData.type !== 'RAW_MATERIAL'"
              class="text-xs text-gray-500"
            >
              (Opcional)
            </span>
          </div>
        </label>
        <input
          v-model.number="localFormData.price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
        <p class="text-xs text-gray-500 mt-1">
          Precio al que vendes este producto
        </p>
      </div>

      <!-- Costo de Compra -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <div class="flex items-center gap-2">
            <svg
              class="w-5 h-5 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
              ></path>
            </svg>
            Costo
            {{
              localFormData.type === "RAW_MATERIAL" ? "de Compra (S/)" : "(S/)"
            }}
            <span
              v-if="localFormData.type !== 'RAW_MATERIAL'"
              class="text-xs text-gray-500"
            >
              (Opcional)
            </span>
          </div>
        </label>
        <input
          v-model.number="localFormData.cost"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
        <p class="text-xs text-gray-500 mt-1">
          {{
            localFormData.type === "RAW_MATERIAL"
              ? "Costo de adquisición del insumo"
              : "Costo de adquisición (opcional)"
          }}
        </p>
      </div>
    </div>

    <!-- Botón de Costeo Asistido Premium -->
    <div class="relative group">
      <!-- Badge Premium flotante -->
      <div class="absolute -top-2 -right-2 z-20">
        <span
          class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg animate-pulse"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            ></path>
          </svg>
          PREMIUM
        </span>
      </div>

      <!-- Contenedor con blur -->
      <div
        class="relative overflow-hidden rounded-xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6"
      >
        <!-- Efecto blur en el contenido -->
        <div
          class="absolute inset-0 backdrop-blur-[2px] bg-white/30 z-10 group-hover:backdrop-blur-[1px] transition-all"
        ></div>

        <button
          @click="navigateToCosting"
          type="button"
          class="relative z-20 w-full flex items-center justify-between p-5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] group"
        >
          <div class="flex items-center gap-4">
            <!-- Icono -->
            <div
              class="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-7 h-7 text-white"
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

            <!-- Texto -->
            <div class="text-left">
              <div class="font-bold text-lg mb-1 flex items-center gap-2">
                Costeo Asistido
                <svg
                  class="w-4 h-4 text-amber-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  ></path>
                </svg>
              </div>
              <p class="text-sm text-purple-100">
                Calcula el costo real de tu producto automáticamente
              </p>
            </div>
          </div>

          <!-- Flecha -->
          <svg
            class="w-6 h-6 text-white transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>

        <!-- Features list con blur -->
        <div class="relative z-20 mt-4 grid grid-cols-2 gap-3 text-xs">
          <div class="flex items-center gap-2 text-purple-700">
            <svg
              class="w-4 h-4 text-green-500"
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
            Materiales
          </div>
          <div class="flex items-center gap-2 text-purple-700">
            <svg
              class="w-4 h-4 text-green-500"
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
            Mano de Obra
          </div>
          <div class="flex items-center gap-2 text-purple-700">
            <svg
              class="w-4 h-4 text-green-500"
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
            Costos Indirectos
          </div>
          <div class="flex items-center gap-2 text-purple-700">
            <svg
              class="w-4 h-4 text-green-500"
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
            Gastos Generales
          </div>
        </div>
      </div>
    </div>

    <!-- Margen de Ganancia (Solo si tiene precio y costo) -->
    <div
      v-if="
        localFormData.cost &&
        localFormData.price &&
        localFormData.type !== 'RAW_MATERIAL'
      "
      class="bg-purple-50 rounded-lg p-4"
    >
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-medium text-gray-700 mb-1">
            Margen de Ganancia
          </div>
          <div class="text-xs text-gray-500">Calculado automáticamente</div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold text-purple-600">
            S/ {{ calculateMarginAmount }}
          </div>
          <div class="text-sm text-purple-500">
            {{ calculateMarginPercentage }}% de ganancia
          </div>
        </div>
      </div>
    </div>

    <!-- Información adicional según tipo -->
    <div
      v-if="localFormData.type === 'RAW_MATERIAL' && !localFormData.cost"
      class="p-4 bg-amber-50 border border-amber-200 rounded-lg"
    >
      <p class="text-sm text-amber-800">
        ℹ️ Las materias primas requieren especificar el
        <strong>costo de compra</strong>.
      </p>
    </div>

    <div
      v-else-if="
        localFormData.type !== 'RAW_MATERIAL' &&
        !localFormData.price &&
        !localFormData.cost
      "
      class="p-4 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <p class="text-sm text-blue-800">
        ℹ️ Puedes especificar el <strong>precio de venta</strong>, el
        <strong>costo</strong>, o ambos.
      </p>
    </div>

    <!-- Navegación para Guardar Cambios -->
    <NavigationBtnEditProduct
      :localData="localFormData"
      :originalData="originalData"
      :saving="saving"
      section="economic"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import NavigationBtnEditProduct from "./NavigationBtnEditProduct.vue";

// Router
const router = useRouter();
const route = useRoute();

// Props
const props = defineProps({
  initialData: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["save"]);

// Estado local
const localFormData = ref({ ...props.initialData });
const originalData = ref({ ...props.initialData });

// Watch para sincronizar con props.initialData cuando cambie externamente
watch(
  () => props.initialData,
  (newData) => {
    localFormData.value = { ...newData };
    originalData.value = { ...newData };
  },
  { deep: true },
);

// Computed: Cálculos de margen
const calculateMarginAmount = computed(() => {
  if (!localFormData.value.price || !localFormData.value.cost) return "0.00";
  const margin = localFormData.value.price - localFormData.value.cost;
  return margin.toFixed(2);
});

const calculateMarginPercentage = computed(() => {
  if (!localFormData.value.price || !localFormData.value.cost) return "0.00";
  const margin =
    ((localFormData.value.price - localFormData.value.cost) /
      localFormData.value.cost) *
    100;
  return margin.toFixed(2);
});

// Método para navegar al costeo asistido
const navigateToCosting = () => {
  router.push({
    name: "InventoryProductCosting",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

// Método para manejar el guardado
const handleSave = (payload) => {
  emit("save", payload);
};
</script>

<style scoped>
/* Animaciones suaves */
input,
button {
  transition: all 0.2s ease;
}

/* Mejoras de accesibilidad */
button:focus,
input:focus {
  outline: none;
}

/* Estados hover mejorados */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* Animación de pulso para badge premium */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Efecto de brillo en el botón premium */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
</style>
