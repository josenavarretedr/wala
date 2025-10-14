<template>
  <div class="list-all-products-container">
    <!-- Header -->
    <div class="header-section mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Inventario de Productos
      </h1>
      <p class="text-sm text-gray-600">
        Total de productos: {{ filteredProducts.length }}
      </p>
    </div>

    <!-- Autocomplete Search -->
    <div class="search-section mb-6">
      <div class="autocomplete-wrapper">
        <input
          ref="inputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Buscar producto por descripción..."
          class="autocomplete-input"
          inputmode="search"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          @input="handleInput"
          @focus="showDropdown = true"
          @blur="handleBlur"
        />
      </div>

      <!-- Dropdown de sugerencias -->
      <!-- <Transition name="dropdown">
        <div
          v-if="showDropdown && searchQuery && filteredProducts.length > 0"
          class="autocomplete-dropdown"
        >
          <div
            v-for="product in filteredProducts.slice(0, 5)"
            :key="product.uuid"
            class="autocomplete-item"
            @mousedown.prevent="selectProduct(product)"
          >
            <div class="flex items-center justify-between w-full">
              <div class="min-w-0 flex-1">
                <p
                  class="font-medium text-gray-900 text-base leading-tight truncate"
                >
                  {{ product.description }}
                </p>
                <p class="text-sm text-gray-500 mt-1">
                  Stock: {{ product.quantity || 0 }} {{ product.unit || "uni" }}
                </p>
              </div>
              <div class="ml-4 flex-shrink-0">
                <p class="text-base font-semibold text-blue-600">
                  ${{ formatPrice(product.price) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition> -->
    </div>

    <!-- Lista de productos -->
    <div class="products-list-section">
      <div v-if="loading" class="text-center py-8">
        <div
          class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3 animate-spin"
        ></div>
        <p class="text-sm text-gray-500">Cargando productos...</p>
      </div>

      <div
        v-else-if="filteredProducts.length === 0"
        class="empty-state py-12 text-center"
      >
        <div class="text-gray-400 mb-4">
          <svg
            class="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            ></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{
            searchQuery
              ? "No se encontraron productos"
              : "No hay productos en el inventario"
          }}
        </h3>
        <p class="text-sm text-gray-500">
          {{
            searchQuery
              ? "Intenta con otro término de búsqueda"
              : "Agrega productos para comenzar"
          }}
        </p>
      </div>

      <div v-else class="products-grid">
        <div
          v-for="product in filteredProducts"
          :key="product.uuid"
          class="product-card"
          @click="selectProduct(product)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0 pr-4">
              <h3 class="product-title">
                {{ product.description }}
              </h3>
              <div class="product-meta mt-2">
                <span class="meta-item">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    ></path>
                  </svg>
                  Stock: {{ product.quantity || 0 }} {{ product.unit || "uni" }}
                </span>
              </div>
            </div>
            <div class="flex-shrink-0">
              <p class="product-price">S/{{ formatPrice(product.price) }}</p>
            </div>
          </div>

          <!-- Indicador visual de clic -->
          <div class="product-arrow">
            <svg
              class="w-5 h-5"
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useBusinessStore } from "@/stores/businessStore";

// Router
const router = useRouter();
const route = useRoute();

// Stores
const inventoryStore = useInventoryStore();
const businessStore = useBusinessStore();

// State
const inputRef = ref(null);
const searchQuery = ref("");
const showDropdown = ref(false);
const loading = ref(true);
const index = ref([]);

// ===== NORMALIZACIÓN Y INDEXADO =====
function normalize(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function buildIndex(items) {
  index.value = items.map((p) => ({
    uuid: p.uuid,
    description: p.description,
    description_lc: normalize(p.description || ""),
    price: p.price,
    quantity: p.quantity,
    unit: p.unit || "uni",
  }));
}

// Cargar inventario inicial
onMounted(async () => {
  loading.value = true;
  try {
    await inventoryStore.getItemsInInventory();
    buildIndex(inventoryStore.allItemsInInventory.value);
  } catch (error) {
    console.error("Error cargando inventario:", error);
  } finally {
    loading.value = false;
  }
});

// Reconstruir índice cuando cambie el inventario
watch(
  () => inventoryStore.allItemsInInventory.value,
  (val) => {
    buildIndex(val);
  },
  { deep: true }
);

// ===== FILTRADO CON DEBOUNCE =====
let debounceTimer;
const debouncedQuery = ref("");

function handleInput() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = searchQuery.value;
  }, 150);
}

// Filtrar y ordenar productos alfabéticamente
const filteredProducts = computed(() => {
  const q = normalize(debouncedQuery.value || "");

  let filtered = q
    ? index.value.filter((i) => i.description_lc.includes(q))
    : index.value;

  // Ordenar alfabéticamente por descripción
  return filtered.sort((a, b) =>
    a.description.localeCompare(b.description, "es", { sensitivity: "base" })
  );
});

// ===== MANEJO DE SELECCIÓN =====
function selectProduct(product) {
  const businessId = route.params.businessId || businessStore.business?.id;

  if (!businessId) {
    console.error("No se encontró businessId");
    return;
  }

  // Navegar a los detalles del producto
  router.push({
    name: "InventoryProductDetails",
    params: {
      businessId: businessId,
      productId: product.uuid,
    },
  });

  // Limpiar búsqueda y cerrar dropdown
  searchQuery.value = "";
  debouncedQuery.value = "";
  showDropdown.value = false;
}

function handleBlur() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 150);
}

// ===== UTILIDADES =====
function formatPrice(price) {
  if (!price && price !== 0) return "0.00";
  return Number(price).toFixed(2);
}
</script>

<style scoped>
/* Contenedor principal */
.list-all-products-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

/* Header section */
.header-section {
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

/* Search section */
.search-section {
  position: relative;
}

.autocomplete-wrapper {
  position: relative;
}

/* Input styling */
.autocomplete-input {
  width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  color: #111827;
  font-size: 16px;
  font-weight: 500;
  padding: 14px 16px;
  outline: none;
  transition: all 0.2s ease;
}

.autocomplete-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.autocomplete-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Dropdown container */
.autocomplete-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 300px;
  overflow-y: auto;
}

/* Dropdown item */
.autocomplete-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.15s ease;
  min-height: 48px;
  display: flex;
  align-items: center;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item:hover {
  background-color: #f9fafb;
}

.autocomplete-item:active {
  background-color: #f3f4f6;
}

/* Products list */
.products-list-section {
  margin-top: 1.5rem;
}

.products-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

/* Product card */
.product-card {
  position: relative;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.product-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.product-card:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.product-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-item svg {
  flex-shrink: 0;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
  white-space: nowrap;
}

.product-arrow {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: #9ca3af;
  transition: all 0.2s ease;
}

.product-card:hover .product-arrow {
  color: #3b82f6;
  transform: translateY(-50%) translateX(4px);
}

/* Empty state */
.empty-state {
  background: white;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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

/* Custom scrollbar */
.autocomplete-dropdown::-webkit-scrollbar {
  width: 4px;
}

.autocomplete-dropdown::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.autocomplete-dropdown::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.autocomplete-dropdown::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .list-all-products-container {
    padding: 0.75rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .autocomplete-input {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 12px 14px;
  }

  .product-card {
    padding: 0.875rem;
  }
}

@media (max-width: 480px) {
  .header-section h1 {
    font-size: 1.5rem;
  }

  .product-title {
    font-size: 0.9375rem;
  }

  .product-price {
    font-size: 1.125rem;
  }
}

/* Utility classes */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
