<template>
  <div class="autocomplete-local-wrapper my-5">
    <!-- Input de búsqueda -->
    <div class="autocomplete-input-container">
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
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

    <!-- Dropdown de resultados -->
    <Transition name="dropdown">
      <div
        v-if="showDropdown && filteredItems.length > 0"
        class="autocomplete-dropdown"
      >
        <div
          v-for="(item, idx) in filteredItems"
          :key="item.isNewProduct ? 'new' : item.productId"
          class="autocomplete-item"
          :class="{ 'is-new-product': item.isNewProduct }"
          @mousedown.prevent="selectItem(item)"
        >
          <!-- Nuevo producto -->
          <template v-if="item.isNewProduct">
            <div class="flex flex-col">
              <span class="font-medium text-gray-900 text-base leading-tight">
                {{ item.productDescription }}
              </span>
            </div>
          </template>

          <!-- Producto existente -->
          <template v-else>
            <div class="flex items-center justify-between w-full">
              <div class="min-w-0 flex-1">
                <span
                  class="font-medium text-gray-900 text-base leading-tight truncate"
                >
                  {{ item.productDescription }}
                </span>
                <span class="text-sm text-gray-600 font-medium"> • </span>
                <span class="text-sm text-gray-600 font-medium">
                  {{ item.productUnit || "uni" }}
                </span>
              </div>
              <div class="ml-3 text-right flex-shrink-0">
                <span class="text-base font-semibold text-gray-700">
                  S/ {{ item.productPrice?.toFixed(2) || "0.00" }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

// Props
const props = defineProps({
  placeholder: {
    type: String,
    default: "Buscar producto...",
  },
  maxItems: {
    type: Number,
    default: 5,
  },
  debounceMs: {
    type: Number,
    default: 120,
  },
});

// Stores
const inventoryStore = useInventoryStore();
const transactionStore = useTransactionStore();

// State
const inputRef = ref(null);
const searchQuery = ref("");
const showDropdown = ref(false);
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
    productId: p.uuid,
    productDescription: p.description,
    productDescription_lc: normalize(p.description || ""),
    productPrice: p.price,
    productUnit: p.unit || "uni",
  }));
}

// Cargar inventario inicial
onMounted(async () => {
  await inventoryStore.getItemsInInventory();
  buildIndex(inventoryStore.allItemsInInventory.value);
});

// Reconstruir índice cuando cambie el inventario
watch(
  () => inventoryStore.allItemsInInventory.value,
  (val) => buildIndex(val),
  { deep: true }
);

// ===== FILTRADO CON DEBOUNCE =====
let debounceTimer;
const debouncedQuery = ref("");

function handleInput() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = searchQuery.value;
  }, props.debounceMs);
}

// Filtrar items según la query con debounce
const filteredItems = computed(() => {
  const q = normalize(debouncedQuery.value || "");

  if (!q) {
    // Sin query, mostrar top N items
    return index.value.slice(0, props.maxItems);
  }

  const filtered = index.value.filter((i) =>
    i.productDescription_lc.includes(q)
  );

  if (filtered.length > 0) {
    return filtered.slice(0, props.maxItems);
  }

  // Sin resultados, ofrecer crear nuevo producto
  return [
    {
      productDescription: `Registrar nuevo producto: ${searchQuery.value}`,
      isNewProduct: true,
    },
  ];
});

// ===== MANEJO DE SELECCIÓN =====
function selectItem(item) {
  if (item.isNewProduct) {
    // Nuevo producto
    const description = (item.productDescription || "")
      .replace("Registrar nuevo producto: ", "")
      .trim();

    transactionStore.modifyItemToAddInTransaction({
      description,
      quantity: null,
      price: null,
      oldOrNewProduct: "new",
      selectedProductUuid: null,
      unit: "uni",
    });
  } else {
    // Producto existente
    const selected = inventoryStore.allItemsInInventory.value.find(
      (p) => p.uuid === item.productId
    );

    if (selected) {
      transactionStore.modifyItemToAddInTransaction({
        description: selected.description,
        price: selected.price,
        oldOrNewProduct: "old",
        selectedProductUuid: selected.uuid,
        unit: selected.unit || "uni",
      });
    } else {
      console.error("Producto seleccionado no encontrado:", item.productId);
    }
  }

  // Limpiar input y cerrar dropdown
  searchQuery.value = "";
  debouncedQuery.value = "";
  showDropdown.value = false;
}

function handleBlur() {
  // Pequeño delay para permitir que mousedown se ejecute primero
  setTimeout(() => {
    showDropdown.value = false;
  }, 150);
}
</script>

<style scoped>
/* Contenedor principal */
.autocomplete-local-wrapper {
  position: relative;
  width: 100%;
}

/* Input container */
.autocomplete-input-container {
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

/* Item styling */
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

.autocomplete-item.is-new-product:hover {
  background-color: #eff6ff;
}

.autocomplete-item.is-new-product:active {
  background-color: #dbeafe;
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
@media (max-width: 480px) {
  .autocomplete-input {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 12px 14px;
  }

  .autocomplete-dropdown {
    max-height: 250px;
  }

  .autocomplete-item {
    min-height: 48px; /* Enhanced touch target */
  }
}

/* Focus styles for accessibility */
.autocomplete-item:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

/* Utility classes */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
