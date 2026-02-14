<template>
  <div
    class="w-full bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-xl shadow-md border border-purple-100 p-5 relative overflow-hidden transition-all duration-300 hover:shadow-lg"
  >
    <!-- Patrón decorativo de fondo -->
    <div
      class="absolute inset-0 opacity-[0.04] pointer-events-none"
      style="
        background-image: radial-gradient(
          circle at 1px 1px,
          #9333ea 1px,
          transparent 0
        );
        background-size: 24px 24px;
      "
    ></div>

    <!-- Decoración adicional: círculos de gradiente -->
    <div
      class="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-2xl pointer-events-none"
    ></div>
    <div
      class="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-indigo-200/30 to-transparent rounded-full blur-2xl pointer-events-none"
    ></div>

    <!-- Contenido principal -->
    <div class="relative z-10">
      <!-- Header con icono y texto -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <!-- Icono de Flask (Matraz) dinámico -->
          <div
            :class="[
              'flex-shrink-0 w-10 h-10 rounded-lg shadow-md flex items-center justify-center transform transition-all duration-200 hover:scale-110',
              hasCompositionData
                ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                : 'bg-white border border-gray-200',
            ]"
          >
            <svg
              :class="[
                'w-5 h-5',
                hasCompositionData ? 'text-white' : 'text-purple-600',
              ]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              ></path>
            </svg>
          </div>

          <!-- Texto del título -->
          <div>
            <p class="text-sm font-semibold text-purple-900 leading-tight">
              <span class="hidden sm:inline">
                {{ hasCompositionData ? "Editar" : "Completar" }}
                la composición de este {{ productTypeText }}
              </span>
              <span class="inline sm:hidden">
                {{ hasCompositionData ? "Editar" : "Completar" }} composición
              </span>
            </p>
            <p class="text-xs text-purple-600/80 mt-0.5">
              <span class="hidden sm:inline"
                >Define ingredientes y pasos de preparación</span
              >
              <span class="inline sm:hidden">Ingredientes y pasos</span>
            </p>
          </div>
        </div>

        <!-- Botón de edición -->
        <router-link
          :to="editProductCompositionLink"
          class="p-2 bg-white hover:bg-purple-50 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:scale-105 group"
          :title="
            hasCompositionData ? 'Editar composición' : 'Completar composición'
          "
        >
          <EditPencil
            class="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors"
          />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
import { EditPencil } from "@iconoir/vue";
import { useRoute } from "vue-router";

const route = useRoute();

const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    default: "PRODUCT",
    validator: (value) =>
      ["MERCH", "PRODUCT", "RAW_MATERIAL", "SERVICE"].includes(value),
  },
  composition: {
    type: Object,
    default: () => [],
  },
});

// ==========================================
// COMPUTED: Texto dinámico según tipo
// ==========================================
const productTypeText = computed(() => {
  const texts = {
    MERCH: "producto",
    PRODUCT: "producto",
    RAW_MATERIAL: "insumo",
    SERVICE: "servicio",
  };
  return texts[props.productType] || "producto";
});

// ==========================================
// COMPUTED: Router links para edición
// ==========================================
const editProductCompositionLink = computed(() => {
  return {
    name: "InventoryEditProductComposition",
    params: {
      businessId: route.params.businessId,
      productId: props.productId,
    },
  };
});

const hasCompositionData = computed(() => {
  // Verificar si composition es un objeto con datos válidos
  if (!props.composition) return false;

  // Si es un array, verificar longitud
  if (Array.isArray(props.composition)) {
    return props.composition.length > 0;
  }

  // Si es un objeto, verificar si tiene propiedades con datos
  if (typeof props.composition === "object") {
    // Verificar si tiene ingredients o items con elementos
    const hasIngredients = props.composition.ingredients?.length > 0;
    const hasInstructions = props.composition.instructions?.trim().length > 0;
    const hasItems = props.composition.items?.length > 0;

    return hasIngredients || hasInstructions || hasItems;
  }

  return false;
});
</script>
