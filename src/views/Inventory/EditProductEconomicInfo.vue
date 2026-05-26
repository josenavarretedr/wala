<template>
  <div class="min-h-screen p-4 sm:p-6 md:p-8">
    <!-- Header con navegación -->
    <div class="max-w-6xl mx-auto mb-8">
      <div class="flex items-center gap-3">
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
          <h1
            class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight"
          >
            Editar Información Económica
          </h1>
          <p
            class="text-sm text-gray-500 mt-1 uppercase font-semibold tracking-wider"
          >
            {{ productData.description || "Cargando..." }}
          </p>
        </div>
      </div>
    </div>

    <!-- Contenido -->
    <div class="max-w-6xl mx-auto">
      <!-- Loading (solo en fallback a BD) -->
      <div
        v-if="loading"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
      >
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"
        ></div>
        <p class="text-gray-600 mt-4 font-medium">Cargando producto...</p>
      </div>

      <!-- Componente de Edición (renderizado directo sobre bg-gray-50) -->
      <div v-else class="w-full">
        <EditProductEconomicInfoComponent
          :initialData="productData"
          :saving="saving"
          @save="handleSave"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useToast } from "@/composables/useToast";
import EditProductEconomicInfoComponent from "@/components/Inventory/EditProductEconomicInfo.vue";

const route = useRoute();
const router = useRouter();
const inventoryStore = useInventoryStore();
const { success, error: showError } = useToast();

const loading = ref(false);
const saving = ref(false);

const productData = ref({
  description: "",
  type: "MERCH",
  price: 0,
  cost: null,
});

const loadProductData = async () => {
  // Cargar siempre desde la BD para garantizar datos frescos de costeo tras volver de sub-vistas
  try {
    loading.value = true;
    const productId = route.params.productId;
    const product = await inventoryStore.getProductDetails(productId);

    if (!product) throw new Error("Producto no encontrado");

    productData.value = {
      description: product.description || "",
      type: product.type || "MERCH",
      price: product.price || 0,
      cost: product.cost || null,
      costStructure: product.costStructure ?? null,
      deliveryConfig: product.deliveryConfig ?? null,
      deliveryEnabled: product.deliveryEnabled ?? false,
    };
    console.log(
      "✅ Información económica cargada desde BD:",
      productData.value,
    );
  } catch (err) {
    console.error("❌ Error cargando producto:", err);
    showError("Error al cargar el producto");
    goBack();
  } finally {
    loading.value = false;
  }
};

// Guardar cambios
const handleSave = async (payload) => {
  try {
    saving.value = true;
    const productId = route.params.productId;
    await inventoryStore.updateProduct(productId, payload.changes);
    console.log("✅ Información económica actualizada:", payload.changes);
    success("Información económica actualizada correctamente");
    setTimeout(() => {
      router.push({
        name: "InventoryProductDetails",
        params: { businessId: route.params.businessId, productId },
      });
    }, 1000);
  } catch (err) {
    console.error("❌ Error actualizando producto:", err);
    showError("Error al actualizar el producto");
  } finally {
    saving.value = false;
  }
};

// Volver atrás
const goBack = () => {
  router.push({
    name: "InventoryProductDetails",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

onMounted(() => {
  loadProductData();
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
