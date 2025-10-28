<template>
  <div>
    <!-- Contenedor para el componente de autocompletado -->
    <div id="autocomplete-expense" class="my-5"></div>
  </div>
</template>

<script setup>
import { autocomplete } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";

const emit = defineEmits(["update:expenseToAdd"]);

import { ref, onMounted, watch } from "vue";
import { useExpenses } from "@/composables/useExpenses";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const { getAllExpensesWithMetadata } = useExpenses();
const transactionStore = useTransactionStore();

// ===== PREINDEXAR EXPENSES =====
const index = ref([]);

function normalize(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function buildIndex(expenses) {
  index.value = expenses.map((e) => ({
    expenseId: e.uuid,
    expenseDescription: e.description,
    expenseDescription_lc: normalize(e.description || ""),
    expenseCategory: e.category,
    expenseSubcategory: e.subcategory,
    lastUsedAt: e.metadata?.lastUsedAt,
    totalSpent: e.metadata?.totalSpent || 0,
    occurrences: e.metadata?.occurrences || 0,
  }));
}

// Cargar expenses y construir índice inicial
const loadExpenses = async () => {
  try {
    const expenses = await getAllExpensesWithMetadata();
    buildIndex(expenses);
    console.log("✅ Expenses cargados para búsqueda:", expenses.length);
  } catch (error) {
    console.error("❌ Error loading expenses:", error);
    index.value = [];
  }
};

// ===== DEBOUNCE DEL FILTRADO =====
let _debounceTimer;
function getExpensesDebounced(query) {
  const q = normalize(query || "");

  return new Promise((resolve) => {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      const dataFiltered = q
        ? index.value.filter((i) => i.expenseDescription_lc.includes(q))
        : index.value;

      resolve(
        dataFiltered.length
          ? dataFiltered.slice(0, 5)
          : [
              {
                expenseDescription: `Registrar nuevo gasto: ${query}`,
                isNewExpense: true,
              },
            ]
      );
    }, 120);
  });
}

// Función helper para limpiar el input del autocomplete
function clearAutocompleteInput() {
  const autocompleteInput = document.querySelector(
    "#autocomplete-expense input"
  );
  if (autocompleteInput) {
    autocompleteInput.value = "";
    autocompleteInput.dispatchEvent(new Event("input"));
  }
}

// Función helper para formatear fecha relativa
function formatRelativeTime(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} años`;
}

// ===== INICIALIZAR ALGOLIA CON onSelect =====
onMounted(async () => {
  // Cargar expenses primero
  await loadExpenses();

  autocomplete({
    container: "#autocomplete-expense",
    placeholder: "Buscar gasto...",
    detachedMediaQuery: "none", // Fuerza inline en móviles
    getSources({ query }) {
      return [
        {
          sourceId: "expenses",
          getItems() {
            return getExpensesDebounced(query);
          },
          onSelect({ item }) {
            // Manejar nuevo gasto
            if (item.isNewExpense) {
              const description = (item.expenseDescription || "")
                .replace("Registrar nuevo gasto: ", "")
                .trim();

              // Emitir evento con datos para nuevo gasto
              emit("update:expenseToAdd", {
                description,
                oldOrNewExpense: "new",
                selectedExpenseId: null,
                category: null,
                subcategory: null,
              });

              clearAutocompleteInput();
              return;
            }

            // Manejar gasto existente
            emit("update:expenseToAdd", {
              description: item.expenseDescription,
              oldOrNewExpense: "old",
              selectedExpenseId: item.expenseId,
              category: item.expenseCategory,
              subcategory: item.expenseSubcategory,
              metadata: {
                lastUsedAt: item.lastUsedAt,
                totalSpent: item.totalSpent,
                occurrences: item.occurrences,
              },
            });

            clearAutocompleteInput();
          },
          // ===== TEMPLATES =====
          templates: {
            item({ item, html }) {
              if (item.isNewExpense) {
                // Plantilla para nuevo gasto
                return html`
                  <div
                    class="py-3 px-4 flex items-center border-b border-gray-100 hover:bg-blue-50 transition-all duration-150 cursor-pointer active:bg-blue-100"
                  >
                    <div class="flex flex-col">
                      <span
                        class="font-medium text-gray-900 text-base leading-tight"
                      >
                        ${item.expenseDescription}
                      </span>
                    </div>
                  </div>
                `;
              } else {
                // Plantilla para gasto existente
                const relativeTime = formatRelativeTime(item.lastUsedAt);

                return html`
                  <div
                    class="py-3 px-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition-all duration-150 cursor-pointer active:bg-gray-100"
                  >
                    <div class="flex flex-col gap-1 min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <span
                          class="font-medium text-gray-900 text-base leading-tight truncate"
                        >
                          ${item.expenseDescription}
                        </span>
                        ${item.expenseCategory &&
                        html`<span
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          ${item.expenseCategory}
                        </span>`}
                      </div>
                      <span class="text-xs text-gray-500">
                        ${relativeTime} • ${item.occurrences}
                        ${item.occurrences === 1 ? "vez" : "veces"}
                      </span>
                    </div>
                  </div>
                `;
              }
            },
            noResults() {
              return "No se encontraron gastos.";
            },
          },
        },
      ];
    },
  });

  // ===== AJUSTES DEL INPUT MÓVIL =====
  const autocompleteInput = document.querySelector(
    "#autocomplete-expense input"
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

/* Enhanced touch targets for mobile */
@media (max-width: 768px) {
  :deep(.resultsDiv) {
    min-height: 48px;
  }
}
</style>
