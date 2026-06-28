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

      <!-- Componente de Edición y Danger Zone -->
      <div v-else class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <EditProductGeneralInfoComponent
            :initialData="productData"
            :saving="saving || deleting"
            @save="handleSave"
          />
        </div>

        <!-- Zona de Peligro -->
        <div class="bg-red-50 rounded-xl shadow-sm border border-red-100 p-6 mb-24">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-red-800 flex items-center gap-2">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Zona de Peligro
              </h3>
              <p class="text-xs text-red-600 mt-1">
                Al eliminar este producto se borrará permanentemente de tu inventario junto con todo su historial. Esta acción es irreversible y no se puede deshacer.
              </p>
            </div>
            <div class="flex-shrink-0">
              <button
                type="button"
                @click="handleDelete"
                :disabled="saving || deleting"
                :class="[
                  'w-full sm:w-auto px-5 py-3 font-semibold rounded-xl text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2 border',
                  saving || deleting
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 border-red-700 hover:bg-red-700 hover:text-white text-white hover:shadow-md hover:shadow-red-500/20 active:scale-[0.98]'
                ]"
              >
                <div v-if="deleting" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {{ deleting ? 'Eliminando...' : 'Eliminar Producto' }}
              </button>
            </div>
          </div>
        </div>
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
const deleting = ref(false);

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
  defaultYieldFactor: null,
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
      defaultYieldFactor: state.defaultYieldFactor ? Number(state.defaultYieldFactor) : null,
      deliveryEnabled: Boolean(state.deliveryEnabled),
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
      defaultYieldFactor: product.defaultYieldFactor ? Number(product.defaultYieldFactor) : null,
      deliveryEnabled: Boolean(product.deliveryEnabled),
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

// Eliminar producto
const handleDelete = async () => {
  const isConfirmed = window.confirm(
    `¿Estás seguro de que deseas eliminar permanentemente el producto "${productData.value.description || 'este producto'}"? Esta acción no se puede deshacer y borrará también su historial de movimientos.`
  );

  if (!isConfirmed) return;

  try {
    deleting.value = true;
    const productId = route.params.productId;
    await inventoryStore.deleteProduct(productId);
    success("Producto eliminado correctamente");
    setTimeout(() => {
      router.push({
        name: "InventoryDashboard",
        params: { businessId: route.params.businessId },
      });
    }, 1000);
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
    showError(err.message || "Error al eliminar el producto");
  } finally {
    deleting.value = false;
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
