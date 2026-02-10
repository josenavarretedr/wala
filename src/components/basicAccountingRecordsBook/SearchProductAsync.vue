<template>
  <div>
    <!-- Contenedor para el componente de autocompletado -->
    <div id="autocomplete" class="my-5"></div>
  </div>
</template>

<script setup>
import { autocomplete } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";

// Props
const props = defineProps({
  mode: {
    type: String,
    default: "transaction", // 'transaction' o 'materials'
    validator: (value) => ["transaction", "materials"].includes(value),
  },
  excludeProductId: {
    type: String,
    default: null,
  },
});

// Emits
const emit = defineEmits(["update:productToAdd", "material-selected"]);

import { ref, onMounted, watch } from "vue";

import { useInventoryStore } from "@/stores/inventoryStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
const inventoryStore = useInventoryStore();
const transactionStore = useTransactionStore();

// ===== TAREA 1: PREINDEXAR INVENTARIO =====
const index = ref([]);

function normalize(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function buildIndex(items) {
  let filteredItems = items;

  // Filtrar según el modo
  if (props.mode === "transaction") {
    // Modo transacción: excluir RAW_MATERIAL
    filteredItems = items.filter((p) => p.type !== "RAW_MATERIAL");
  } else if (props.mode === "materials") {
    // Modo materiales: solo productos con trackStock = true
    filteredItems = items.filter((p) => p.trackStock === true);
  }

  // Excluir el producto específico si se proporciona
  if (props.excludeProductId) {
    filteredItems = filteredItems.filter(
      (p) => p.uuid !== props.excludeProductId,
    );
  }

  index.value = filteredItems.map((p) => ({
    productId: p.uuid,
    productDescription: p.description,
    productDescription_lc: normalize(p.description || ""),
    productPrice: p.price,
    productCost: p.cost,
    productUnit: p.unit || "uni",
    productStock: p.stock ?? 0,
    trackStock: p.trackStock ?? false,
  }));
}

// Cargar inventario y construir índice inicial
await inventoryStore.getItemsInInventory();
buildIndex(inventoryStore.allItemsInInventory.value);

// Reconstruir índice cuando cambie el inventario
watch(
  () => inventoryStore.allItemsInInventory.value,
  (val) => buildIndex(val),
  { deep: true },
);

// Reconstruir índice cuando cambie el modo
watch(
  () => props.mode,
  () => buildIndex(inventoryStore.allItemsInInventory.value),
);

// Reconstruir índice cuando cambie excludeProductId
watch(
  () => props.excludeProductId,
  () => buildIndex(inventoryStore.allItemsInInventory.value),
);

// Función legacy mantenida por compatibilidad (ahora solo retorna el índice)
function getDataForAlgolia() {
  return index.value;
}

// ===== TAREA 3: DEBOUNCE DEL FILTRADO =====
let _debounceTimer;
function getItemsDebounced(query) {
  const q = normalize(query || "");

  return new Promise((resolve) => {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      const dataFiltered = q
        ? index.value.filter((i) => i.productDescription_lc.includes(q))
        : index.value;

      // En modo materials, no mostrar opción de "nuevo producto"
      if (props.mode === "materials") {
        resolve(dataFiltered.length ? dataFiltered.slice(0, 8) : []);
      } else {
        resolve(
          dataFiltered.length
            ? dataFiltered.slice(0, 5)
            : [
                {
                  productDescription: `Registrar nuevo producto: ${query}`,
                  isNewProduct: true,
                },
              ],
        );
      }
    }, 120);
  });
}

// Función helper para limpiar el input del autocomplete
function clearAutocompleteInput() {
  const autocompleteInput = document.querySelector("#autocomplete input");
  if (autocompleteInput) {
    autocompleteInput.value = "";
    autocompleteInput.dispatchEvent(new Event("input"));
  }
}

// ===== TAREA 2: INICIALIZAR ALGOLIA CON onSelect Y SIN MODO DETACHED =====
onMounted(() => {
  autocomplete({
    container: "#autocomplete",
    placeholder:
      props.mode === "materials" ? "Buscar material..." : "Buscar producto...",
    detachedMediaQuery: "none", // 👈 Fuerza inline en móviles
    getSources({ query }) {
      return [
        {
          sourceId: "products",
          getItems() {
            return getItemsDebounced(query);
          },
          onSelect({ item }) {
            // Manejar nuevo producto (solo en modo transaction)
            if (item.isNewProduct && props.mode === "transaction") {
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

              clearAutocompleteInput();
              return;
            }

            // Manejar producto existente
            const selected = inventoryStore.allItemsInInventory.value.find(
              (p) => p.uuid === item.productId,
            );

            if (selected) {
              // Determinar qué emit usar según el modo
              if (props.mode === "materials") {
                // Emit para modo materiales
                emit("material-selected", selected);
                clearAutocompleteInput();
              } else {
                // Emit para modo transacción (legacy)
                transactionStore.modifyItemToAddInTransaction({
                  description: selected.description,
                  price: selected.price,
                  oldOrNewProduct: "old",
                  selectedProductUuid: selected.uuid,
                  unit: selected.unit || "uni",
                  stock: selected.stock ?? 0,
                  trackStock: selected.trackStock ?? false,
                });
                clearAutocompleteInput();
              }
            } else {
              console.error(
                "Producto seleccionado no encontrado:",
                item.productId,
              );
            }
          },
          // ===== TAREA 5: TEMPLATES LIMPIOS SIN IDS/CLASES INNECESARIAS =====
          templates: {
            item({ item, html }) {
              if (item.isNewProduct) {
                // Plantilla para nuevo producto
                return html`
                  <div
                    class="py-3 px-4 flex items-center border-b border-gray-100 hover:bg-blue-50 transition-all duration-150 cursor-pointer active:bg-blue-100"
                  >
                    <div class="flex flex-col">
                      <span
                        class="font-medium text-gray-900 text-base leading-tight"
                      >
                        ${item.productDescription}
                      </span>
                    </div>
                  </div>
                `;
              } else {
                // Plantilla para producto existente
                // Mostrar costo en modo materials, precio en modo transaction
                const displayValue =
                  props.mode === "materials"
                    ? item.productCost
                      ? `S/ ${item.productCost.toFixed(2)}`
                      : "Sin costo"
                    : `S/ ${item.productPrice?.toFixed(2) || "0.00"}`;

                const valueClass =
                  props.mode === "materials" && !item.productCost
                    ? "text-amber-600"
                    : "text-gray-700";

                return html`
                  <div
                    class="py-3 px-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition-all duration-150 cursor-pointer active:bg-gray-100"
                  >
                    <div class="flex items-center justify-between w-full">
                      <div class="min-w-0 flex-1">
                        <span
                          class="font-medium text-gray-900 text-base leading-tight truncate"
                        >
                          ${item.productDescription}
                        </span>
                        <span class="text-sm text-gray-600 font-medium">
                          •
                        </span>
                        <span class="text-sm text-gray-600 font-medium">
                          ${item.productUnit || "uni"}
                        </span>
                        ${props.mode === "materials" &&
                        item.productStock !== undefined
                          ? html`<span class="text-sm text-gray-500">
                              • Stock: ${item.productStock}</span
                            >`
                          : ""}
                      </div>
                      <div class="ml-3 text-right flex-shrink-0">
                        <span class="text-base font-semibold ${valueClass}">
                          ${displayValue}
                        </span>
                      </div>
                    </div>
                  </div>
                `;
              }
            },
            noResults() {
              return props.mode === "materials"
                ? "No se encontraron materiales."
                : "No se encontraron resultados.";
            },
          },
        },
      ];
    },
  });

  // ===== TAREA 4: ENDURECER INPUT MÓVIL =====
  // Ajustes del input de Algolia para mejorar UX móvil
  const autocompleteInput = document.querySelector("#autocomplete input");
  if (autocompleteInput) {
    autocompleteInput.setAttribute("inputmode", "search");
    autocompleteInput.setAttribute("autocomplete", "off");
    autocompleteInput.setAttribute("autocorrect", "off");
    autocompleteInput.setAttribute("autocapitalize", "off");
    autocompleteInput.setAttribute("spellcheck", "false");
  }
});
</script>

<style scoped>
/* Mobile-first autocomplete styling */
:deep(.aa-Autocomplete) {
  width: 100%;
}

:deep(.aa-Form) {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

:deep(.aa-Form:focus-within) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.aa-InputWrapper) {
  position: relative;
}

:deep(.aa-Input) {
  background: transparent;
  border: none;
  color: #111827;
  font-size: 16px;
  font-weight: 500;
  padding: 14px 16px;
  width: 100%;
  outline: none;
}

:deep(.aa-Input::placeholder) {
  color: #9ca3af;
  font-weight: 400;
}

:deep(.aa-Panel) {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-top: 4px;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}

:deep(.aa-List) {
  margin: 0;
  padding: 0;
  list-style: none;
}

:deep(.aa-Item) {
  border-bottom: 1px solid #f3f4f6;
}

:deep(.aa-Item:last-child) {
  border-bottom: none;
}

/* Mobile optimizations */
@media (max-width: 480px) {
  :deep(.aa-Input) {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 12px 14px;
  }

  :deep(.aa-Panel) {
    max-height: 250px;
  }
}

/* Custom scrollbar for dropdown */
:deep(.aa-Panel)::-webkit-scrollbar {
  width: 4px;
}

:deep(.aa-Panel)::-webkit-scrollbar-track {
  background: #f3f4f6;
}

:deep(.aa-Panel)::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

:deep(.aa-Panel)::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Focus styles for accessibility */
:deep(.resultsDiv:focus) {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

/* Enhanced touch targets for mobile */
@media (max-width: 768px) {
  :deep(.resultsDiv) {
    min-height: 48px;
  }
}
</style>
