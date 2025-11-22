<template>
  <div>
    <!-- Contenedor para el componente de autocompletado -->
    <div id="autocomplete-create-product" class="my-5"></div>
  </div>
</template>

<script setup>
import { autocomplete } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";
import { ref, onMounted, watch } from "vue";
import { useInventoryStore } from "@/stores/inventoryStore";

const inventoryStore = useInventoryStore();

// Emits
const emit = defineEmits(["productSelected", "newProductRequested"]);

// ===== PREINDEXAR INVENTARIO =====
const index = ref([]);

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
    productCost: p.cost,
    productUnit: p.unit || "uni",
    productType: p.type || "MERCH",
    productTrackStock: p.trackStock ?? false,
  }));
}

// Cargar inventario y construir índice inicial
await inventoryStore.getItemsInInventory();
buildIndex(inventoryStore.allItemsInInventory.value);

// Reconstruir índice cuando cambie el inventario
watch(
  () => inventoryStore.allItemsInInventory.value,
  (val) => buildIndex(val),
  { deep: true }
);

// ===== DEBOUNCE DEL FILTRADO =====
let _debounceTimer;
function getItemsDebounced(query) {
  const q = normalize(query || "");

  return new Promise((resolve) => {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      const dataFiltered = q
        ? index.value.filter((i) => i.productDescription_lc.includes(q))
        : index.value;

      resolve(
        dataFiltered.length
          ? dataFiltered.slice(0, 5)
          : [
              {
                productDescription: query || "Nuevo producto",
                isNewProduct: true,
                searchQuery: query,
              },
            ]
      );
    }, 120);
  });
}

// Función helper para limpiar el input del autocomplete
function clearAutocompleteInput() {
  const autocompleteInput = document.querySelector(
    "#autocomplete-create-product input"
  );
  if (autocompleteInput) {
    autocompleteInput.value = "";
    autocompleteInput.dispatchEvent(new Event("input"));
  }
}

// ===== INICIALIZAR ALGOLIA =====
onMounted(() => {
  autocomplete({
    container: "#autocomplete-create-product",
    placeholder: "Buscar producto existente o crear nuevo...",
    detachedMediaQuery: "none",
    getSources({ query }) {
      return [
        {
          sourceId: "products",
          getItems() {
            return getItemsDebounced(query);
          },
          onSelect({ item }) {
            // Manejar nuevo producto
            if (item.isNewProduct) {
              const description = (item.searchQuery || "").trim();

              if (description) {
                emit("newProductRequested", { description });
              }

              clearAutocompleteInput();
              return;
            }

            // Manejar producto existente - emitir evento para prellenar formulario
            const selected = inventoryStore.allItemsInInventory.value.find(
              (p) => p.uuid === item.productId
            );

            if (selected) {
              emit("productSelected", selected);
              clearAutocompleteInput();
            } else {
              console.error(
                "Producto seleccionado no encontrado:",
                item.productId
              );
            }
          },
          templates: {
            item({ item, html }) {
              if (item.isNewProduct) {
                // Plantilla para nuevo producto
                return html`
                  <div
                    class="py-3 px-4 flex items-center border-b border-gray-100 hover:bg-green-50 transition-all duration-150 cursor-pointer active:bg-green-100"
                  >
                    <div class="flex items-center gap-3 w-full">
                      <div
                        class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
                      >
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
                            d="M12 4v16m8-8H4"
                          ></path>
                        </svg>
                      </div>
                      <div class="flex flex-col">
                        <span
                          class="font-medium text-green-700 text-base leading-tight"
                        >
                          Crear: "${item.searchQuery || "Nuevo producto"}"
                        </span>
                        <span class="text-xs text-gray-500">
                          Click para registrar como nuevo producto
                        </span>
                      </div>
                    </div>
                  </div>
                `;
              } else {
                // Plantilla para producto existente
                const typeLabels = {
                  MERCH: "Mercadería",
                  PRODUCT: "Producto",
                  RAW_MATERIAL: "Insumo",
                  SERVICE: "Servicio",
                };
                const typeLabel = typeLabels[item.productType] || "Producto";

                return html`
                  <div
                    class="py-3 px-4 flex items-center justify-between border-b border-gray-100 hover:bg-blue-50 transition-all duration-150 cursor-pointer active:bg-blue-100"
                  >
                    <div class="flex items-center justify-between w-full">
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                          <span
                            class="font-medium text-gray-900 text-base leading-tight truncate"
                          >
                            ${item.productDescription}
                          </span>
                          <span
                            class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
                          >
                            ${typeLabel}
                          </span>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                          ${item.productUnit || "uni"} •
                          ${item.productPrice
                            ? `S/ ${item.productPrice.toFixed(2)}`
                            : "Sin precio"}
                        </div>
                      </div>
                      <div class="ml-3 text-right flex-shrink-0">
                        <span
                          class="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded"
                        >
                          Ya existe
                        </span>
                      </div>
                    </div>
                  </div>
                `;
              }
            },
            noResults({ html }) {
              return html`
                <div class="py-4 px-4 text-center text-gray-500">
                  <p class="text-sm">
                    No se encontraron productos. Escribe para crear uno nuevo.
                  </p>
                </div>
              `;
            },
          },
        },
      ];
    },
  });

  // Ajustes del input para mejorar UX móvil
  const autocompleteInput = document.querySelector(
    "#autocomplete-create-product input"
  );
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
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
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
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-top: 4px;
  overflow: hidden;
  max-height: 350px;
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
    font-size: 16px;
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
</style>
