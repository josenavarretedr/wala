<template>
  <div>
    <!-- Contenedor para el componente de autocompletado -->
    <div id="autocomplete-expense-material" class="my-5"></div>
  </div>
</template>

<script setup>
import { autocomplete } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";

const emit = defineEmits(["update:materialToAdd"]);

import { ref, onMounted, watch } from "vue";

import { useInventoryStore } from "@/stores/inventoryStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
const inventoryStore = useInventoryStore();
const transactionStore = useTransactionStore();

// ===== PREINDEXAR INVENTARIO =====
const index = ref([]);

function normalize(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchTokens(query = "") {
  return normalize(query)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function buildIndex(items) {
  const filteredItems = items.filter((p) => p.trackStock === true);
  const flatIndex = [];

  filteredItems.forEach((p) => {
    const productDescription_lc = normalize(p.description || "");
    const baseItem = {
      productId: p.uuid,
      productDescription: p.description,
      productDescription_lc,
      productPrice: p.price,
      productCost: p.cost,
      productUnit: p.unit || "uni",
      productStock: p.stock ?? 0,
      productTrackStock: p.trackStock ?? false,
      hasVariants: Boolean(p.hasVariants),
    };

    const variants = Array.isArray(p.variantCombos)
      ? p.variantCombos.filter((variant) => variant?.isActive !== false)
      : [];

    if (baseItem.hasVariants && variants.length) {
      variants.forEach((variant) => {
        const variantLabel = String(variant?.label || "").trim();

        flatIndex.push({
          ...baseItem,
          searchText_lc: normalize(
            `${baseItem.productDescription} ${variantLabel}`,
          ),
          variantId: variant?.id || null,
          variantLabel,
          variantSku: variant?.sku || null,
          variantStock: Number(variant?.stock || 0),
        });
      });
      return;
    }

    flatIndex.push({
      ...baseItem,
      searchText_lc: productDescription_lc,
      variantId: null,
      variantLabel: null,
      variantSku: null,
      variantStock: null,
    });
  });

  index.value = flatIndex;
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

// ===== DEBOUNCE DEL FILTRADO =====
let _debounceTimer;
function getItemsDebounced(query) {
  const q = normalize(query || "");
  const tokens = buildSearchTokens(query || "");

  return new Promise((resolve) => {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      const dataFiltered = q
        ? index.value.filter((entry) => {
            if (!tokens.length) return true;
            return tokens.every((token) =>
              (entry.searchText_lc || "").includes(token),
            );
          })
        : index.value;

      resolve(
        dataFiltered.length
          ? dataFiltered.slice(0, 5)
          : [
              {
                productDescription: `Registrar nuevo material/insumo: ${query}`,
                isNewProduct: true,
              },
            ],
      );
    }, 120);
  });
}

// Función helper para limpiar el input del autocomplete
function clearAutocompleteInput() {
  const autocompleteInput = document.querySelector(
    "#autocomplete-expense-material input",
  );
  if (autocompleteInput) {
    autocompleteInput.value = "";
    autocompleteInput.dispatchEvent(new Event("input"));
  }
}

// ===== INICIALIZAR ALGOLIA CON onSelect =====
onMounted(() => {
  autocomplete({
    container: "#autocomplete-expense-material",
    placeholder: "Buscar material o insumo...",
    detachedMediaQuery: "none", // Fuerza inline en móviles
    getSources({ query }) {
      return [
        {
          sourceId: "materials",
          getItems() {
            return getItemsDebounced(query);
          },
          onSelect({ item }) {
            // Manejar nuevo material/insumo
            if (item.isNewProduct) {
              const description = (item.productDescription || "")
                .replace("Registrar nuevo material/insumo: ", "")
                .trim();

              transactionStore.modifyItemToAddInExpenseMaterial({
                description,
                quantity: null,
                cost: null, // Para gastos usamos 'cost' en lugar de 'price'
                oldOrNewProduct: "new",
                selectedProductUuid: null,
                unit: "uni",
                stock: 0,
                trackStock: true, // Por defecto los materiales tienen seguimiento
                hasVariants: false,
                variantId: null,
                variantLabel: null,
                variantSku: null,
                variantStock: null,
              });

              clearAutocompleteInput();
              return;
            }

            // Manejar material/insumo existente
            const selected = inventoryStore.allItemsInInventory.value.find(
              (p) => p.uuid === item.productId,
            );
            if (selected) {
              transactionStore.modifyItemToAddInExpenseMaterial({
                description: selected.description,
                cost: selected.cost || null, // Usar el costo de compra, no el precio de venta
                oldOrNewProduct: "old",
                selectedProductUuid: selected.uuid,
                unit: selected.unit || "uni",
                stock: item.variantId
                  ? Number(item.variantStock || 0)
                  : (selected.stock ?? 0),
                trackStock: selected.trackStock ?? false,
                hasVariants: Boolean(selected.hasVariants),
                variantId: item.variantId || null,
                variantLabel: item.variantLabel || null,
                variantSku: item.variantSku || null,
                variantStock:
                  item.variantStock !== undefined && item.variantStock !== null
                    ? Number(item.variantStock)
                    : null,
              });
              clearAutocompleteInput();
            } else {
              console.error(
                "Material seleccionado no encontrado:",
                item.productId,
              );
            }
          },
          templates: {
            item({ item, html }) {
              if (item.isNewProduct) {
                // Plantilla para nuevo material/insumo
                return html`
                  <div
                    class="py-3 px-4 flex items-center border-b border-gray-100 hover:bg-orange-50 transition-all duration-150 cursor-pointer active:bg-orange-100"
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
                // Plantilla para material/insumo existente
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
                        ${item.variantLabel
                          ? html`<span
                              class="inline-flex items-center ml-2 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200"
                            >
                              ${item.variantLabel}
                            </span>`
                          : ""}
                        ${item.productTrackStock
                          ? html`<span
                              class="ml-2 text-xs text-blue-600 font-medium"
                            >
                              📦 Stock:
                              ${item.variantId
                                ? (item.variantStock ?? 0)
                                : item.productStock}
                            </span>`
                          : ""}
                      </div>
                      <div class="ml-3 text-right flex-shrink-0">
                        <div class="flex flex-col items-end">
                          ${item.productCost !== null &&
                          item.productCost !== undefined
                            ? html`<span
                                class="text-base font-semibold text-orange-700"
                              >
                                Costo: S/
                                ${item.productCost?.toFixed(2) || "0.00"}
                              </span>`
                            : ""}
                          <span class="text-xs text-gray-500">
                            Venta: S/ ${item.productPrice?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }
            },
            noResults() {
              return "No se encontraron materiales/insumos.";
            },
          },
        },
      ];
    },
  });
});
</script>

<style scoped>
/* Estilos personalizados para el autocomplete de materiales */
:deep(.aa-Form) {
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

:deep(.aa-Form:focus-within) {
  border-color: #f97316; /* Orange-500 para materials */
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

:deep(.aa-Input) {
  font-size: 16px !important;
  padding: 0.75rem 1rem;
}

:deep(.aa-Panel) {
  border-radius: 0.75rem;
  margin-top: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  max-height: 320px;
  overflow-y: auto;
}

:deep(.aa-List) {
  list-style: none;
  padding: 0;
  margin: 0;
}

:deep(.aa-Item[aria-selected="true"]) {
  background-color: #fef3c7 !important; /* Amber-100 */
}

/* Responsive */
@media (max-width: 640px) {
  :deep(.aa-Input) {
    font-size: 16px !important;
  }
}
</style>
