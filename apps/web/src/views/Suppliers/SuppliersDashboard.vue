<template>
  <div class="min-h-screen pb-20 bg-gray-50/50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
              Proveedores
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 mt-1">
              Administra la información y el historial de tus proveedores
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              @click="openQuoteModal"
              class="py-2.5 px-4 border border-purple-600 text-purple-600 bg-white hover:bg-purple-600 hover:text-white font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <span>📊 Comparar Cotizaciones</span>
            </button>
            <button
              @click="showAddModal = true"
              class="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nuevo Proveedor
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <!-- Tarjetas de Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Total Proveedores -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p class="text-xs sm:text-sm text-gray-500 mb-1">Proveedores registrados</p>
            <p class="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
              {{ suppliersStats.total }}
            </p>
          </div>
          <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
            </svg>
          </div>
        </div>

        <!-- Con Deuda -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p class="text-xs sm:text-sm text-gray-500 mb-1">Con deuda pendiente</p>
            <p class="text-2xl sm:text-3xl font-extrabold text-red-600 tabular-nums">
              {{ suppliersStats.withDebt }}
            </p>
          </div>
          <div class="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- Total Deuda -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p class="text-xs sm:text-sm text-gray-500 mb-1">Total por pagar</p>
            <p class="text-2xl sm:text-3xl font-extrabold text-red-600 tabular-nums">
              S/ {{ suppliersStats.totalDebt.toFixed(2) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 8h6m-6 2h6m-6 2h6M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Historial de Cotizaciones Comparadas (Área 4 - Operaciones) -->
      <div
        v-if="purchaseQuotes.length > 0"
        class="bg-white rounded-xl shadow-sm border border-purple-100 p-4 space-y-3"
      >
        <div class="flex items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-bold text-gray-900">Últimas Cotizaciones Comparadas</h2>
            <p class="text-xs text-gray-500">Compara al menos 2 proveedores y registra tu compra al mejor precio.</p>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            Ahorro total est.: S/ {{ totalQuoteSavings.toFixed(2) }}
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="q in purchaseQuotes.slice(0, 4)"
            :key="q.uuid"
            class="border border-gray-200 rounded-xl p-3 bg-gray-50/50 flex items-center justify-between gap-3"
          >
            <div class="min-w-0">
              <p class="text-sm font-bold text-gray-900 truncate">{{ q.itemDescription }}</p>
              <p class="text-xs text-purple-700 font-semibold">
                Mejor: {{ q.bestSupplierName }} · S/ {{ Number(q.bestPrice || 0).toFixed(2) }}/{{ q.unit }}
              </p>
              <p class="text-[11px] text-emerald-700 font-medium">
                Ahorro est.: S/ {{ Number(q.estimatedTotalSavings || 0).toFixed(2) }} ({{ q.quantity }} {{ q.unit }})
              </p>
            </div>
            <button
              type="button"
              @click="goBuyFromQuote(q)"
              class="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shrink-0"
            >
              Comprar →
            </button>
          </div>
        </div>
      </div>

      <!-- Buscador -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar proveedor por nombre, RUC/DNI o teléfono..."
            class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-purple-500 focus:outline-none text-sm transition-colors"
          />
        </div>
      </div>

      <!-- Spinner de carga -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
          <p class="text-sm text-gray-500">Cargando proveedores...</p>
        </div>
      </div>

      <!-- Lista de Proveedores -->
      <div v-else-if="filteredSuppliers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardSupplier
          v-for="supplier in filteredSuppliers"
          :key="supplier.supplierId"
          :supplier="supplier"
          @click="viewDetails(supplier.supplierId)"
        />
      </div>

      <!-- Estado Vacío -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center max-w-md mx-auto mt-8">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
        </svg>
        <h3 class="font-bold text-gray-900 text-lg">
          {{ searchQuery ? "No se encontraron resultados" : "No hay proveedores registrados" }}
        </h3>
        <p class="text-sm text-gray-500 mt-2">
          {{ searchQuery ? "Intenta ajustar los filtros de búsqueda." : "Los proveedores te permiten catalogar y gestionar cuentas por pagar." }}
        </p>
        <button
          v-if="!searchQuery"
          @click="showAddModal = true"
          class="mt-5 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          Agregar Proveedor
        </button>
      </div>
    </div>

    <!-- Modal Agregar Proveedor -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
        <h2 class="text-xl font-bold text-gray-900">Registrar Proveedor</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nombre / Razón Social *</label>
            <input
              v-model="newSupplierData.name"
              type="text"
              placeholder="Ej: Distribuidora Central S.A."
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">RUC o DNI</label>
            <input
              v-model="newSupplierData.rucOrDni"
              type="text"
              placeholder="Ej: 20601234567 / 45678901"
              maxlength="11"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Teléfono de contacto</label>
            <input
              v-model="newSupplierData.phone"
              type="tel"
              placeholder="Ej: 987654321"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            @click="closeAddModal"
            class="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            @click="saveSupplier"
            :disabled="!newSupplierData.name.trim() || isSaving"
            class="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {{ isSaving ? "Guardando..." : "Registrar" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Comparador de Cotizaciones -->
    <Teleport to="body">
      <div
        v-if="showQuoteModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs"
        @click.self="showQuoteModal = false"
      >
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Comparar Cotizaciones de Compra</h2>
              <p class="text-xs text-gray-500">Compara 2 o 3 proveedores antes de cerrar una compra importante.</p>
            </div>
            <button type="button" @click="showQuoteModal = false" class="text-gray-400 hover:text-gray-600 px-2 py-1">✕</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Insumo o producto a cotizar *</label>
              <input
                v-model="quoteForm.itemDescription"
                type="text"
                placeholder="Ej: Harina especial saco x 50kg"
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Cantidad estimada</label>
                <input
                  v-model.number="quoteForm.quantity"
                  type="number"
                  min="1"
                  step="1"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Unidad</label>
                <input
                  v-model="quoteForm.unit"
                  type="text"
                  placeholder="uni / kg / saco"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div class="space-y-2 pt-1">
              <p class="text-xs font-bold text-gray-700 uppercase">Cotizaciones por Proveedor (Mín. 2)</p>
              <div class="grid grid-cols-5 gap-2 items-center">
                <input v-model="quoteForm.supplierAName" type="text" placeholder="Proveedor 1 *" class="col-span-3 px-3 py-2 border border-gray-200 rounded-xl text-xs" />
                <input v-model.number="quoteForm.supplierAPrice" type="number" step="0.01" min="0" placeholder="Precio S/" class="col-span-2 px-3 py-2 border border-gray-200 rounded-xl text-xs" />
              </div>
              <div class="grid grid-cols-5 gap-2 items-center">
                <input v-model="quoteForm.supplierBName" type="text" placeholder="Proveedor 2 *" class="col-span-3 px-3 py-2 border border-gray-200 rounded-xl text-xs" />
                <input v-model.number="quoteForm.supplierBPrice" type="number" step="0.01" min="0" placeholder="Precio S/" class="col-span-2 px-3 py-2 border border-gray-200 rounded-xl text-xs" />
              </div>
              <div class="grid grid-cols-5 gap-2 items-center">
                <input v-model="quoteForm.supplierCName" type="text" placeholder="Proveedor 3 (opcional)" class="col-span-3 px-3 py-2 border border-gray-200 rounded-xl text-xs" />
                <input v-model.number="quoteForm.supplierCPrice" type="number" step="0.01" min="0" placeholder="Precio S/" class="col-span-2 px-3 py-2 border border-gray-200 rounded-xl text-xs" />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showQuoteModal = false"
              class="px-4 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              :disabled="!quoteForm.itemDescription.trim() || savingQuote"
              @click="saveQuote"
              class="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50"
            >
              {{ savingQuote ? 'Guardando...' : 'Guardar comparativa' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSuppliers } from "@/composables/useSuppliers";
import { useSupplierManagement } from "@/composables/useSupplierManagement";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "@/composables/useToast";
import CardSupplier from "@/components/Suppliers/CardSupplier.vue";

const router = useRouter();
const route = useRoute();
const { success, error } = useToast();

const {
  loading,
  searchQuery,
  filteredSuppliers,
  suppliersStats,
  fetchAllSuppliers,
  createSupplier,
} = useSuppliers();

const { purchaseQuotes, fetchPurchaseQuotes, createPurchaseQuote } = useSupplierManagement();

const showAddModal = ref(false);
const isSaving = ref(false);
const showQuoteModal = ref(false);
const savingQuote = ref(false);

const newSupplierData = ref({
  name: "",
  rucOrDni: "",
  phone: "",
});

const quoteForm = ref({
  itemDescription: "",
  quantity: 1,
  unit: "uni",
  supplierAName: "",
  supplierAPrice: null,
  supplierBName: "",
  supplierBPrice: null,
  supplierCName: "",
  supplierCPrice: null,
});

const totalQuoteSavings = computed(() =>
  purchaseQuotes.value.reduce((sum, q) => sum + Number(q.estimatedTotalSavings || 0), 0)
);

onMounted(async () => {
  await Promise.all([fetchAllSuppliers(), fetchPurchaseQuotes()]);
});

function openQuoteModal() {
  quoteForm.value = {
    itemDescription: "",
    quantity: 1,
    unit: "uni",
    supplierAName: "",
    supplierAPrice: null,
    supplierBName: "",
    supplierBPrice: null,
    supplierCName: "",
    supplierCPrice: null,
  };
  showQuoteModal.value = true;
}

async function saveQuote() {
  try {
    savingQuote.value = true;
    const saved = await createPurchaseQuote(quoteForm.value);
    success(
      `Mejor opción: ${saved.bestSupplierName} (ahorro est. S/ ${saved.estimatedTotalSavings.toFixed(2)})`
    );
    showQuoteModal.value = false;
  } catch (err) {
    error(err.message || "Error al guardar cotización");
  } finally {
    savingQuote.value = false;
  }
}

function goBuyFromQuote(quote) {
  router.push({
    path: `/business/${route.params.businessId}/basicAccountingRecordsBook`,
    query: {
      type: "expense",
      category: "materials",
      quoteId: quote.uuid,
      prefillName: quote.itemDescription,
      prefillAmount: String(quote.bestPrice || ""),
    },
  });
}

function closeAddModal() {
  showAddModal.value = false;
  newSupplierData.value = { name: "", rucOrDni: "", phone: "" };
}

async function saveSupplier() {
  if (!newSupplierData.value.name.trim()) return;

  isSaving.value = true;
  try {
    await createSupplier({
      name: newSupplierData.value.name,
      rucOrDni: newSupplierData.value.rucOrDni,
      phone: newSupplierData.value.phone,
    });
    success("Proveedor creado con éxito");
    closeAddModal();
  } catch (err) {
    error("Error al crear proveedor: " + err.message);
  } finally {
    isSaving.value = false;
  }
}

function viewDetails(supplierId) {
  router.push({
    name: "SupplierDetails",
    params: {
      businessId: route.params.businessId,
      supplierId: supplierId,
    },
  });
}
</script>
