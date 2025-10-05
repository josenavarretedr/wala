<template>
  <div>
    <!-- Contenedor para el componente de autocompletado -->
    <div id="autocomplete" class="my-5"></div>
  </div>
</template>

<script setup>
import { autocomplete } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";

const emit = defineEmits(["update:productToAdd"]);

import { ref, onMounted, onUnmounted } from "vue";

import { useInventoryStore } from "@/stores/inventoryStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
const inventoryStore = useInventoryStore();
const transactionStore = useTransactionStore();

// Función para obtener productos desde Firestore
await inventoryStore.getItemsInInventory();

// Función para obtener datos formateados para Algolia
// Función helper para obtener la unidad del producto
function getProductUnit(productId) {
  const product = inventoryStore.allItemsInInventory.value.find(
    (p) => p.uuid === productId
  );
  return product?.unit || "uni";
}

function getDataForAlgolia() {
  if (inventoryStore.allItemsInInventory.value.length === 0) {
    return [];
  }

  let dataForAlgolia = inventoryStore.allItemsInInventory.value.map(
    (product) => {
      return {
        productId: product.uuid,
        productDescription: product.description,
        productPrice: product.price,
        productUnit: product.unit || "uni",
      };
    }
  );

  return dataForAlgolia;
}

onMounted(() => {
  // Inicializar el componente de autocompletado de Algolia
  autocomplete({
    container: "#autocomplete",
    placeholder: "Buscar producto...",
    getSources({ query }) {
      return [
        {
          sourceId: "products",
          getItems() {
            // Filtrar productos por descripción
            let dataFiltered = getDataForAlgolia().filter(
              ({ productDescription }) =>
                productDescription.toLowerCase().includes(query.toLowerCase())
            );

            return dataFiltered.length > 0
              ? dataFiltered.slice(0, 5)
              : [
                  {
                    productDescription: `Registrar nuevo producto: ${query}`,
                    isNewProduct: true,
                  },
                ];
          },
          templates: {
            item({ item, html }) {
              if (item.isNewProduct) {
                // Plantilla para nuevo producto
                return html`
                  <div
                    class="py-3 px-4 flex items-center border-b border-gray-100 hover:bg-blue-50 transition-all duration-150 cursor-pointer active:bg-blue-100"
                    id="new-product"
                    class="resultsDiv"
                  >
                    <div class="flex flex-col">
                      <span
                        class="font-medium text-gray-900 text-base leading-tight"
                        >${item.productDescription}</span
                      >
                    </div>
                  </div>
                `;
              } else {
                // Plantilla para producto existente
                return html`
                  <div
                    class="py-3 px-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition-all duration-150 cursor-pointer active:bg-gray-100"
                    id="${item.productId}"
                    class="resultsDiv"
                  >
                    <div class="flex items-center justify-between w-full">
                      <div class="min-w-0 flex-1">
                        <span
                          class="font-medium text-gray-900 text-base leading-tight truncate"
                          >${item.productDescription}
                        </span>
                        <span class="text-sm text-gray-600 font-medium">
                          •
                        </span>
                        <span class="text-sm text-gray-600 font-medium">
                          ${item.productUnit || "uni"}</span
                        >
                      </div>
                      <div class="ml-3 text-right flex-shrink-0">
                        <span class="text-base font-semibold text-gray-700"
                          >S/ ${item.productPrice?.toFixed(2) || "0.00"}</span
                        >
                      </div>
                    </div>
                  </div>
                `;
              }
            },
            noResults() {
              return "No results.";
            },
          },
        },
      ];
    },
  });

  // Agregar el event listener para manejar clics en los resultados
  document.addEventListener("click", handleResultClick);
});

// Limpiar el event listener cuando el componente se desmonte
onUnmounted(() => {
  document.removeEventListener("click", handleResultClick);
});

// Función helper para limpiar el input del autocomplete
function clearAutocompleteInput() {
  const autocompleteInput = document.querySelector("#autocomplete input");
  if (autocompleteInput) {
    autocompleteInput.value = "";
    autocompleteInput.dispatchEvent(new Event("input"));
  }
}

// Función para manejar clics en los resultados
function handleResultClick(e) {
  let target = e.target;
  while (target && !target.classList.contains("resultsDiv")) {
    target = target.parentElement;
  }
  if (target) {
    if (target.id === "new-product") {
      // Manejar nuevo producto
      const description = target.textContent
        .trim()
        .replace("Registrar nuevo producto: ", "");

      transactionStore.modifyItemToAddInTransaction({
        description,
        quantity: null,
        price: null,
        oldOrNewProduct: "new",
        selectedProductUuid: null,
        unit: "uni",
      });

      clearAutocompleteInput();
    } else {
      // Manejar producto existente
      const selectedProduct = inventoryStore.allItemsInInventory.value.find(
        (product) => product.uuid === target.id
      );
      if (selectedProduct) {
        transactionStore.modifyItemToAddInTransaction({
          description: selectedProduct.description,
          price: selectedProduct.price,
          oldOrNewProduct: "old",
          selectedProductUuid: selectedProduct.uuid,
          unit: selectedProduct.unit || "uni",
        });

        clearAutocompleteInput();
      } else {
        console.error("Selected product not found");
      }
      console.log("Selected product: ", target.id);
    }
  }
}
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
