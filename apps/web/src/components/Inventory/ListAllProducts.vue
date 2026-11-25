<template>
  <div class="list-all-products-container">
    <!-- Header -->
    <div class="header-section mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 mb-1">
          Inventario de Productos
        </h1>
        <p class="text-sm text-gray-600">
          Total de productos: {{ filteredProducts.length }}
        </p>
      </div>
      <button
        type="button"
        @click="openWasteSummaryModal"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rose-600 text-rose-600 bg-white hover:bg-rose-600 hover:text-white text-xs font-semibold transition-all shadow-xs self-start sm:self-auto"
      >
        <span>📉</span>
        <span>Resumen de Mermas (Mes)</span>
      </button>
    </div>

    <!-- Barra de Cobertura de Costeo (Área 3 - Costos) -->
    <div
      v-if="costingStats.total > 0"
      class="mb-4 bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between text-xs mb-1.5">
          <span class="font-semibold text-gray-700">
            Cobertura de costeo: {{ costingStats.complete }} de {{ costingStats.total }} productos completos
          </span>
          <span
            :class="[
              'font-bold tabular-nums',
              costingStats.pct >= 80 ? 'text-emerald-600' : 'text-amber-600',
            ]"
          >
            {{ costingStats.pct }}%
          </span>
        </div>
        <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="costingStats.pct >= 80 ? 'bg-emerald-500' : 'bg-amber-500'"
            :style="{ width: `${costingStats.pct}%` }"
          ></div>
        </div>
      </div>
      <button
        v-if="costingStats.incomplete > 0"
        type="button"
        @click="activeFilter = 'uncosted'"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-600 text-amber-700 bg-amber-50 hover:bg-amber-600 hover:text-white text-xs font-semibold transition-colors shrink-0"
      >
        <span>Completar costeo ({{ costingStats.incomplete }}) →</span>
      </button>
    </div>

    <!-- Filtros rápidos (Mermas, Stock Mínimo, Costeo) -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="pill in quickFilters"
        :key="pill.value"
        type="button"
        @click="activeFilter = pill.value"
        :class="[
          'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
          activeFilter === pill.value
            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600',
        ]"
      >
        {{ pill.label }}
        <span
          v-if="pill.count !== undefined"
          :class="[
            'ml-1 px-1.5 py-0.5 rounded-full text-[10px]',
            activeFilter === pill.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600',
          ]"
        >
          {{ pill.count }}
        </span>
      </button>
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
        <div class="text-blue-500 mb-3">
          <SpinnerIcon size="lg" />
        </div>
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
        <CardProduct
          v-for="product in filteredProducts"
          :key="product.uuid"
          :product="product"
          @click="selectProduct"
        />
      </div>
    </div>

    <!-- Modal Resumen de Mermas del Mes -->
    <Teleport to="body">
      <div
        v-if="showWasteModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        @click.self="showWasteModal = false"
      >
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Resumen de Mermas del Mes</h3>
              <p class="text-xs text-gray-500">
                Pérdidas no monetarias registradas en Inventario y Conteos Físicos.
              </p>
            </div>
            <button
              type="button"
              @click="showWasteModal = false"
              class="text-gray-400 hover:text-gray-600 text-sm font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>

          <div v-if="loadingWaste" class="py-8 text-center text-sm text-gray-500">
            Cargando resumen de mermas...
          </div>
          <div v-else-if="wasteSummary.count === 0" class="py-8 text-center text-sm text-gray-500">
            No se registraron mermas ni bajas de inventario este mes.
          </div>
          <template v-else>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-rose-50 border border-rose-200 rounded-xl p-3">
                <p class="text-[11px] font-semibold text-rose-700 uppercase">Pérdida Total</p>
                <p class="text-xl font-black text-rose-800">S/ {{ wasteSummary.total.toFixed(2) }}</p>
              </div>
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p class="text-[11px] font-semibold text-gray-600 uppercase">Eventos</p>
                <p class="text-xl font-black text-gray-900">{{ wasteSummary.count }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <p class="text-xs font-bold text-gray-700 uppercase">Por Motivo</p>
              <div
                v-for="row in wasteSummary.byReason"
                :key="row.reason"
                class="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded-lg"
              >
                <span class="font-medium text-gray-700">{{ row.label }} ({{ row.count }})</span>
                <span class="font-bold text-rose-700">S/ {{ row.amount.toFixed(2) }}</span>
              </div>
            </div>

            <div class="space-y-1.5">
              <p class="text-xs font-bold text-gray-700 uppercase">Últimos Registros</p>
              <div
                v-for="item in wasteSummary.items.slice(0, 8)"
                :key="item.uuid"
                class="flex items-center justify-between text-xs border-b border-gray-100 py-1.5"
              >
                <span class="text-gray-700 truncate mr-2">{{ item.description }}</span>
                <span class="font-bold text-gray-900 shrink-0">S/ {{ Number(item.amount || 0).toFixed(2) }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useBusinessStore } from "@/stores/businessStore";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import CardProduct from "@/components/Inventory/CardProduct.vue";
import { useSubscription } from "@/composables/useSubscription";
import { useToast } from "@/composables/useToast";
import { WASTE_REASON_LABELS } from "@/utils/nonCashAccounting";

// Suscripción
const { isPremium } = useSubscription();

// Toast
const { premium } = useToast();

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
const activeFilter = ref("all");
const showWasteModal = ref(false);
const loadingWaste = ref(false);
const wasteTransactions = ref([]);

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
    cost: p.cost,
    stock: p.stock,
    unit: p.unit || "uni",
    type: p.type ? p.type : "MERCH",
    trackStock: p.trackStock ? p.trackStock : false,
    minStock: p.minStock ?? null,
    safetyStock: p.safetyStock ?? null,
    costStructure: p.costStructure || null,
    lastSaleAt: p.lastSaleAt || null,
    updatedAt: p.updatedAt || null,
    isPerishable: Boolean(p.isPerishable),
    expirationDate: p.expirationDate || null,
    hasVariants: Boolean(p.hasVariants),
    variantSchema: p.variantSchema || { combineAttributes: false },
    variantCombos: Array.isArray(p.variantCombos) ? p.variantCombos : [],
    stockSummary: p.stockSummary || null,
  }));
}

function isLowStockItem(item) {
  if (!item.trackStock) return false;
  const threshold = item.safetyStock ?? item.minStock;
  if (threshold === null || threshold === undefined || threshold === "") return false;
  return Number(item.stock || 0) <= Number(threshold);
}

function isStagnantItem(item) {
  if (!item.trackStock || Number(item.stock || 0) <= 0) return false;
  const refTs = item.lastSaleAt || item.updatedAt;
  if (!refTs) return false;
  const ms = refTs.toMillis ? refTs.toMillis() : new Date(refTs).getTime();
  if (!Number.isFinite(ms)) return false;
  return (Date.now() - ms) > 14 * 24 * 60 * 60 * 1000;
}

function hasCompleteCosting(item) {
  if (Number(item.cost || 0) > 0) return true;
  const cs = item.costStructure;
  if (!cs) return false;
  return (
    Number(cs.materials || 0) > 0 ||
    Number(cs.mod || 0) > 0 ||
    Number(cs.labor || 0) > 0 ||
    Number(cs.cif || 0) > 0 ||
    Number(cs.total || 0) > 0
  );
}

const costingStats = computed(() => {
  const costables = index.value.filter((i) => i.type !== "RAW_MATERIAL");
  const complete = costables.filter(hasCompleteCosting).length;
  const total = costables.length;
  return {
    total,
    complete,
    incomplete: Math.max(0, total - complete),
    pct: total > 0 ? Math.round((complete / total) * 100) : 0,
  };
});

const quickFilters = computed(() => [
  { value: "all", label: "Todos", count: index.value.length },
  { value: "low_stock", label: "Bajo stock mínimo", count: index.value.filter(isLowStockItem).length },
  { value: "stagnant_14d", label: "Sin movimiento >14d", count: index.value.filter(isStagnantItem).length },
  { value: "uncosted", label: "Costeo incompleto", count: costingStats.value.incomplete },
  { value: "costed", label: "Costeo completo", count: costingStats.value.complete },
]);

const wasteSummary = computed(() => {
  const map = {};
  let total = 0;
  wasteTransactions.value.forEach((tx) => {
    const amt = Number(tx.amount || 0);
    total += amt;
    const reason = tx.subcategory || "other";
    if (!map[reason]) {
      map[reason] = {
        reason,
        label: WASTE_REASON_LABELS[reason] || reason,
        count: 0,
        amount: 0,
      };
    }
    map[reason].count += 1;
    map[reason].amount += amt;
  });
  return {
    total,
    count: wasteTransactions.value.length,
    byReason: Object.values(map).sort((a, b) => b.amount - a.amount),
    items: wasteTransactions.value,
  };
});

async function openWasteSummaryModal() {
  showWasteModal.value = true;
  const businessId = route.params.businessId || businessStore.business?.id;
  if (!businessId) return;
  loadingWaste.value = true;
  try {
    const q = query(
      collection(db, "businesses", businessId, "transactions"),
      where("category", "==", "inventory_loss")
    );
    const snap = await getDocs(q);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const items = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const ts = data.createdAt?.toMillis ? data.createdAt.toMillis() : new Date(data.createdAt || 0).getTime();
      if (ts >= startOfMonth) {
        items.push({ uuid: docSnap.id, ...data });
      }
    });
    wasteTransactions.value = items;
  } catch (err) {
    console.warn("⚠️ Error cargando resumen de mermas:", err);
  } finally {
    loadingWaste.value = false;
  }
}

// Cargar inventario inicial
onMounted(async () => {
  if (route.query.filter && ["all", "low_stock", "stagnant_14d", "uncosted", "costed"].includes(String(route.query.filter))) {
    activeFilter.value = String(route.query.filter);
  }
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
  { deep: true },
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

  if (activeFilter.value === "low_stock") {
    filtered = filtered.filter(isLowStockItem);
  } else if (activeFilter.value === "stagnant_14d") {
    filtered = filtered.filter(isStagnantItem);
  } else if (activeFilter.value === "uncosted") {
    filtered = filtered.filter((i) => i.type !== "RAW_MATERIAL" && !hasCompleteCosting(i));
  } else if (activeFilter.value === "costed") {
    filtered = filtered.filter((i) => i.type !== "RAW_MATERIAL" && hasCompleteCosting(i));
  }

  // Ordenar alfabéticamente por descripción
  return [...filtered].sort((a, b) =>
    a.description.localeCompare(b.description, "es", { sensitivity: "base" }),
  );
});

// ===== MANEJO DE SELECCIÓN =====
function selectProduct(product) {
  const businessId = route.params.businessId || businessStore.business?.id;

  if (!businessId) {
    console.error("No se encontró businessId");
    return;
  }

  // if (!isPremium.value) {
  //   premium(
  //     "Encuentra, ordena y mejora tu inventario y más con Wala Pro. Actualiza tu plan, controla tu inventario"
  //   );
  //   return;
  // }

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
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
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
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
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

/* Empty state */
.empty-state {
  background: white;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
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
}

@media (max-width: 480px) {
  .header-section h1 {
    font-size: 1.5rem;
  }
}

/* Utility classes */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
