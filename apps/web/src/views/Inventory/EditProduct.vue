<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <!-- Header con navegación -->
    <div class="max-w-4xl mx-auto mb-6">
      <div class="flex items-center gap-3 mb-4">
        <button
          @click="goBack"
          class="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <svg
            class="w-5 h-5 text-gray-600"
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
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
            Editar Producto
          </h1>
          <p class="text-sm text-gray-600 mt-1">
            {{ formData.description || "Cargando..." }}
          </p>
        </div>
      </div>
    </div>

    <!-- Formulario de Edición -->
    <div class="max-w-4xl mx-auto">
      <div
        v-if="loading"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"
      >
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"
        ></div>
        <p class="text-gray-600 mt-4">Cargando producto...</p>
      </div>

      <div
        v-else
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <ProductForm
          :initialData="formData"
          mode="edit"
          :saving="saving"
          @submit="handleSubmit"
          @cancel="goBack"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useInventoryStore } from "@/stores/inventoryStore";
import ProductForm from "@/components/Inventory/ProductForm.vue";

const route = useRoute();
const router = useRouter();
const inventoryStore = useInventoryStore();

const loading = ref(true);
const saving = ref(false);

const formData = ref({
  description: "",
  price: 0,
  cost: null,
  unit: "uni",
  trackStock: false,
  type: "MERCH",
});

// Cargar datos del producto
const loadProductData = async () => {
  try {
    loading.value = true;

    const productId = route.params.productId;
    const product = await inventoryStore.getProductDetails(productId);

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    // Cargar datos en el formulario
    formData.value = {
      description: product.description || "",
      price: product.price || 0,
      cost: product.cost || null,
      unit: product.unit || "uni",
      trackStock: product.trackStock || false,
      type: product.type || "MERCH",
    };

    console.log("✅ Producto cargado:", formData.value);
  } catch (error) {
    console.error("❌ Error cargando producto:", error);
    alert("Error al cargar el producto");
    goBack();
  } finally {
    loading.value = false;
  }
};

// Guardar cambios
const handleSubmit = async (updatedData) => {
  try {
    saving.value = true;

    const productId = route.params.productId;

    await inventoryStore.updateProduct(productId, updatedData);

    console.log("✅ Producto actualizado exitosamente");

    // Redirigir de vuelta a los detalles del producto
    router.push({
      name: "InventoryProductDetails",
      params: {
        businessId: route.params.businessId,
        productId: productId,
      },
    });
  } catch (error) {
    console.error("❌ Error actualizando producto:", error);
    alert("Error al actualizar el producto");
  } finally {
    saving.value = false;
  }
};

// Volver atrás
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadProductData();
});
</script>

<style scoped>
/* Animaciones suaves */
button {
  transition: all 0.2s ease;
}

/* Mejoras de accesibilidad */
button:focus {
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
</style>
