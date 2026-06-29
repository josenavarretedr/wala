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
          <button
            @click="showAddModal = true"
            class="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center gap-2 self-start sm:self-auto"
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
            placeholder="Buscar proveedor por nombre o teléfono..."
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
        <div
          v-for="supplier in filteredSuppliers"
          :key="supplier.supplierId"
          @click="viewDetails(supplier.supplierId)"
          class="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 p-5 cursor-pointer flex flex-col justify-between h-44"
        >
          <div>
            <div class="flex items-start justify-between gap-3">
              <h3 class="font-bold text-gray-900 text-lg truncate flex-1">
                {{ supplier.name }}
              </h3>
              <span
                v-if="supplier.pendingBalance > 0"
                class="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 flex-shrink-0"
              >
                Debe
              </span>
            </div>
            <p v-if="supplier.phone" class="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <span>📞</span> {{ supplier.phone }}
            </p>
          </div>

          <div class="border-t border-gray-50 pt-3 mt-4 flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <div>
              <span class="text-gray-400 block text-[10px] uppercase tracking-wider">Total Comprado</span>
              <span class="font-semibold text-gray-800">S/ {{ (supplier.totalExpenses || 0).toFixed(2) }}</span>
            </div>
            <div class="text-right">
              <span class="text-gray-400 block text-[10px] uppercase tracking-wider">Saldo Pendiente</span>
              <span :class="['font-semibold', supplier.pendingBalance > 0 ? 'text-red-600' : 'text-gray-800']">
                S/ {{ (supplier.pendingBalance || 0).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useSuppliers } from "@/composables/useSuppliers";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "@/composables/useToast";

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

const showAddModal = ref(false);
const isSaving = ref(false);

const newSupplierData = ref({
  name: "",
  phone: "",
});

onMounted(async () => {
  await fetchAllSuppliers();
});

function closeAddModal() {
  showAddModal.value = false;
  newSupplierData.value = { name: "", phone: "" };
}

async function saveSupplier() {
  if (!newSupplierData.value.name.trim()) return;

  isSaving.value = true;
  try {
    await createSupplier({
      name: newSupplierData.value.name,
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
