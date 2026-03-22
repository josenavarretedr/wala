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
            Editar Información General
          </h1>
          <p class="text-sm text-gray-600 mt-1">
            {{ productData.description || "Cargando..." }}
          </p>
        </div>
      </div>
    </div>

    <!-- Contenido -->
    <div class="max-w-4xl mx-auto">
      <!-- Loading (solo en fallback a BD) -->
      <div
        v-if="loading"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"
      >
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"
        ></div>
        <p class="text-gray-600 mt-4">Cargando producto...</p>
      </div>

      <!-- Componente de Edición -->
      <div
        v-else
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <EditProductGeneralInfoComponent
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
import EditProductGeneralInfoComponent from "@/components/Inventory/EditProductGeneralInfo.vue";

const route = useRoute();
const router = useRouter();
const inventoryStore = useInventoryStore();
const { success, error: showError } = useToast();

const loading = ref(false);
const saving = ref(false);

const productData = ref({
  uuid: "",
  description: "",
  type: "MERCH",
  unit: "uni",
  trackStock: true,
  isPerishable: false,
  expirationDate: null,
  stock: 0,
  hasVariants: false,
  variantSchema: { attributes: [] },
  variantCombos: [],
});

// Cargar datos — desde state de ruta o fallback a BD
const loadProductData = async () => {
  const state = history.state;

  // Si venimos de ProductDetails vía router-link con state, usarlo directamente
  if (state?.description !== undefined && state?.hasVariants !== undefined) {
    productData.value = {
      uuid: route.params.productId,
      description: state.description || "",
      type: state.type || "MERCH",
      unit: state.unit || "uni",
      trackStock: state.trackStock !== undefined ? state.trackStock : true,
      isPerishable: Boolean(state.isPerishable),
      expirationDate: state.expirationDate || null,
      stock: Number(state.stock || 0),
      hasVariants: Boolean(state.hasVariants),
      variantSchema: state.variantSchema || { attributes: [] },
      variantCombos: Array.isArray(state.variantCombos)
        ? state.variantCombos
        : [],
    };
    console.log(
      "⚡ Datos de info general cargados desde route state:",
      productData.value,
    );
    return;
  }

  // Fallback: navegación directa por URL → fetch de BD
  console.log("🔄 Sin state, cargando desde BD...");
  try {
    loading.value = true;
    const productId = route.params.productId;
    const product = await inventoryStore.getProductDetails(productId);

    if (!product) throw new Error("Producto no encontrado");

    productData.value = {
      uuid: product.uuid || route.params.productId,
      description: product.description || "",
      type: product.type || "MERCH",
      unit: product.unit || "uni",
      trackStock: product.trackStock !== undefined ? product.trackStock : true,
      isPerishable: Boolean(product.isPerishable),
      expirationDate: product.expirationDate || null,
      stock: Number(product.stock || 0),
      hasVariants: Boolean(product.hasVariants),
      variantSchema: product.variantSchema || { attributes: [] },
      variantCombos: Array.isArray(product.variantCombos)
        ? product.variantCombos
        : [],
    };
    console.log("✅ Información general cargada desde BD:", productData.value);
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

    const changes = { ...payload.changes };

    const wasWithoutVariants = !productData.value.hasVariants;
    const isEnablingVariants =
      changes.hasVariants === true && wasWithoutVariants;

    if (isEnablingVariants) {
      const hasIncomingCombos =
        Array.isArray(changes.variantCombos) &&
        changes.variantCombos.length > 0;
      const currentStock = Number(productData.value.stock || 0);

      if (!hasIncomingCombos && currentStock > 0) {
        changes.variantSchema = {
          combineAttributes: false,
          attributes: [
            {
              id: "attr_general",
              name: "Presentación",
              options: [{ id: "opt_general", value: "General" }],
            },
          ],
        };

        changes.variantCombos = [
          {
            id: "var_general",
            label: "General",
            sku: `${productId}-GENERAL`,
            optionIds: ["opt_general"],
            stock: currentStock,
            minStock: null,
            isActive: true,
          },
        ];
      }
    }

    await inventoryStore.updateProduct(productId, changes);
    console.log("✅ Información general actualizada:", changes);
    success("Información general actualizada correctamente");
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
