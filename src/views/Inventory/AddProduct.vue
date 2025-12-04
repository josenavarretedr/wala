<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <!-- Header con navegación -->
    <div class="max-w-4xl mx-auto mb-6">
      <div class="flex items-center gap-3 mb-4">
        <button
          @click="goBack"
          class="p-2 hover:bg-white rounded-lg transition-colors group"
        >
          <svg
            class="w-6 h-6 text-gray-600 group-hover:text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>
        <div class="flex-1">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
            Crear Nuevo Producto
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            {{
              wizardStep === 1
                ? "Paso 1: Buscar o definir producto"
                : "Completa los detalles del producto"
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="max-w-4xl mx-auto">
      <!-- PASO 1: Búsqueda de Producto -->
      <div
        v-if="wizardStep === 1"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div class="text-center mb-6">
          <div
            class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-800">Buscar Producto</h2>
          <p class="text-sm text-gray-500 mt-2">
            Busca si el producto ya existe o crea uno nuevo
          </p>
        </div>

        <!-- Buscador -->
        <Suspense>
          <template #default>
            <SearchProductForCreation
              @productSelected="handleProductSelected"
              @newProductRequested="handleNewProductRequested"
            />
          </template>
          <template #fallback>
            <div class="flex items-center justify-center py-6">
              <div class="text-center">
                <div
                  class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
                ></div>
                <p class="text-gray-500 text-sm">Cargando buscador...</p>
              </div>
            </div>
          </template>
        </Suspense>

        <!-- Mensaje informativo -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start gap-3">
            <svg
              class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
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
            <div class="flex-1">
              <p class="text-sm text-blue-900 font-medium">¿Cómo funciona?</p>
              <ul class="text-xs text-blue-700 mt-2 space-y-1">
                <li>
                  • Si el producto <strong>ya existe</strong>, puedes
                  seleccionarlo para pre-llenar sus datos
                </li>
                <li>
                  • Si <strong>no existe</strong>, escribe su nombre y presiona
                  "Crear" para registrarlo
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- PASO 2: Formulario de Producto (Pasos 1, 2, 3 del ProductForm) -->
      <div
        v-if="wizardStep === 2"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <ProductForm
          :initialData="formData"
          mode="create"
          :saving="saving"
          @submit="handleCreateProduct"
          @cancel="goBack"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useInventoryStore } from "@/stores/inventoryStore";
import SearchProductForCreation from "@/components/Inventory/SearchProductForCreation.vue";
import ProductForm from "@/components/Inventory/ProductForm.vue";

const route = useRoute();
const router = useRouter();
const inventoryStore = useInventoryStore();

// Estado del wizard
const wizardStep = ref(1); // 1: Búsqueda, 2: Formulario
const saving = ref(false);

// Datos del formulario
const formData = ref({
  description: "",
  price: 0,
  cost: null,
  unit: "uni",
  trackStock: true,
  type: "MERCH",
});

/**
 * Maneja cuando se selecciona un producto existente del buscador
 * Redirige directamente a la página de detalles del producto
 */
const handleProductSelected = (product) => {
  console.log("Producto existente seleccionado:", product);

  // Redirigir a los detalles del producto existente
  router.push({
    name: "InventoryProductDetails",
    params: {
      businessId: route.params.businessId,
      productId: product.uuid,
    },
  });
};

/**
 * Maneja cuando se solicita crear un nuevo producto
 */
const handleNewProductRequested = ({ description }) => {
  console.log("Crear nuevo producto:", description);

  // Pre-llenar solo el nombre
  formData.value = {
    description: description.trim().toUpperCase(),
    price: 0,
    cost: null,
    unit: "uni",
    trackStock: true,
    type: "MERCH",
  };

  // Avanzar al paso 2 (formulario completo)
  wizardStep.value = 2;
};

/**
 * Maneja la creación del producto
 */
const handleCreateProduct = async (productData) => {
  try {
    saving.value = true;

    console.log("Creando producto:", productData);

    // Llamar al store para crear el producto
    const newProductId = await inventoryStore.createNewProduct(productData);

    console.log("✅ Producto creado exitosamente:", newProductId);

    // Redirigir a los detalles del producto recién creado
    router.push({
      name: "InventoryProductDetails",
      params: {
        businessId: route.params.businessId,
        productId: newProductId,
      },
    });
  } catch (error) {
    console.error("❌ Error creando producto:", error);
    alert(`Error al crear el producto: ${error.message}`);
  } finally {
    saving.value = false;
  }
};

/**
 * Volver atrás
 */
const goBack = () => {
  if (wizardStep.value === 2) {
    // Si estamos en el formulario, volver a la búsqueda
    wizardStep.value = 1;
    formData.value = {
      description: "",
      price: 0,
      cost: null,
      unit: "uni",
      trackStock: true,
      type: "MERCH",
    };
  } else {
    // Si estamos en la búsqueda, volver al inventario
    router.back();
  }
};
</script>

<style scoped>
/* Animaciones suaves */
input,
select,
button {
  transition: all 0.2s ease;
}

/* Mejoras de accesibilidad */
button:focus,
input:focus,
select:focus {
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

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
