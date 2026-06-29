<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Asignar Proveedor
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Todo egreso o compra de mercadería requiere identificar un proveedor
      </p>
    </div>

    <!-- Proveedor Seleccionado -->
    <div v-if="selectedSupplier" class="max-w-lg mx-auto">
      <div
        class="p-4 rounded-xl border-2 border-green-500 bg-green-50 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5"
              />
            </svg>
          </div>
          <div class="text-left">
            <div class="font-semibold text-gray-800">
              {{ selectedSupplier.name }}
            </div>
            <div v-if="selectedSupplier.phone" class="text-xs text-gray-500">
              📞 {{ selectedSupplier.phone }}
            </div>
            <div
              v-if="selectedSupplier.pendingBalance > 0"
              class="text-xs text-red-600 font-medium mt-0.5"
            >
              Saldo pendiente: S/ {{ selectedSupplier.pendingBalance.toFixed(2) }}
            </div>
          </div>
        </div>
        <button
          @click="clearSelection"
          class="text-gray-400 hover:text-gray-600 p-2"
        >
          Cambiar
        </button>
      </div>
    </div>

    <!-- Búsqueda / Registro de Proveedor -->
    <div v-else class="max-w-lg mx-auto space-y-4">
      <div v-if="!showCreateForm" class="space-y-4">
        <!-- Input de búsqueda -->
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar proveedor por nombre o teléfono..."
            class="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <!-- Lista de proveedores filtrados -->
        <div v-if="filteredSuppliers.length > 0" class="space-y-2 max-h-64 overflow-y-auto pr-1">
          <button
            v-for="supplier in filteredSuppliers"
            :key="supplier.supplierId"
            @click="selectSupplier(supplier)"
            class="w-full p-4 rounded-lg border border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 transition-all flex items-center justify-between text-left"
          >
            <div>
              <div class="font-medium text-gray-800">{{ supplier.name }}</div>
              <div v-if="supplier.phone" class="text-xs text-gray-500 mt-0.5">
                📞 {{ supplier.phone }}
              </div>
            </div>
            <svg
              class="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div v-else class="text-center py-6 text-gray-500 text-sm">
          No se encontraron proveedores.
        </div>

        <!-- Botón para mostrar formulario de registro -->
        <button
          @click="showCreateForm = true"
          class="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-semibold border border-dashed border-purple-300 transition-colors flex items-center justify-center gap-2"
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
          Registrar nuevo proveedor
        </button>
      </div>

      <!-- Formulario para crear nuevo proveedor -->
      <div v-else class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 class="text-lg font-bold text-gray-800">Registrar Proveedor</h2>
        
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
              >Nombre / Razón Social *</label
            >
            <input
              v-model="newSupplier.name"
              type="text"
              placeholder="Ej: Distribuidora Central S.A."
              class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
              >Teléfono de contacto</label
            >
            <input
              v-model="newSupplier.phone"
              type="tel"
              placeholder="Ej: 987654321"
              class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="showCreateForm = false"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="registerNewSupplier"
            :disabled="!newSupplier.name.trim() || isSubmitting"
            class="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ isSubmitting ? "Registrando..." : "Guardar" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useSupplierStore } from "@/stores/supplierStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useAddStockFlowStore } from "@/stores/Inventory/AddStockFlow";
import { useBusinessStore } from "@/stores/businessStore";
import { useToast } from "@/composables/useToast";
import { useRoute } from "vue-router";

const route = useRoute();
const supplierStore = useSupplierStore();
const transactionStore = useTransactionStore();
const addStockFlow = useAddStockFlowStore();
const businessStore = useBusinessStore();
const { success, error } = useToast();

const isAddStockFlow = computed(() => route.name === "AddStock");

// Estado
const searchQuery = ref("");
const showCreateForm = ref(false);
const isSubmitting = ref(false);
const selectedSupplier = ref(null);

const newSupplier = ref({
  name: "",
  phone: "",
});

// Cargar proveedores al montar
onMounted(async () => {
  const businessId = businessStore.getBusinessId;
  if (businessId) {
    await supplierStore.fetchSuppliers(businessId);
    
    // Si ya existe selección previa
    let prevSupplierId = null;
    if (isAddStockFlow.value) {
      prevSupplierId = addStockFlow.addStockData.supplierId;
    } else {
      prevSupplierId = transactionStore.transactionToAdd.value.supplierId;
    }

    if (prevSupplierId) {
      const found = supplierStore.suppliers.find(s => s.supplierId === prevSupplierId);
      if (found) {
        selectedSupplier.value = found;
      }
    }
  }
});

const filteredSuppliers = computed(() => {
  return supplierStore.searchSuppliers(searchQuery.value);
});

// Selección
function selectSupplier(supplier) {
  selectedSupplier.value = supplier;
  searchQuery.value = "";
}

function clearSelection() {
  selectedSupplier.value = null;
}

// Registro
async function registerNewSupplier() {
  if (!newSupplier.value.name.trim()) return;
  
  isSubmitting.value = true;
  try {
    const created = await supplierStore.createSupplier({
      name: newSupplier.value.name,
      phone: newSupplier.value.phone,
    });
    
    success("Proveedor registrado con éxito");
    selectedSupplier.value = created;
    showCreateForm.value = false;
    newSupplier.value = { name: "", phone: "" };
  } catch (err) {
    error("Error al registrar proveedor: " + err.message);
  } finally {
    isSubmitting.value = false;
  }
}

// Sincronizar selección con los stores correspondientes
watch(selectedSupplier, (supplier) => {
  if (isAddStockFlow.value) {
    if (supplier) {
      addStockFlow.addStockData.supplierId = supplier.supplierId;
      addStockFlow.addStockData.supplierName = supplier.name;
      addStockFlow.addStockData.supplierPhone = supplier.phone;
    } else {
      addStockFlow.addStockData.supplierId = null;
      addStockFlow.addStockData.supplierName = null;
      addStockFlow.addStockData.supplierPhone = null;
    }
  } else {
    if (supplier) {
      transactionStore.transactionToAdd.value.supplierId = supplier.supplierId;
      transactionStore.transactionToAdd.value.supplierName = supplier.name;
      transactionStore.transactionToAdd.value.supplierPhone = supplier.phone;
    } else {
      transactionStore.transactionToAdd.value.supplierId = null;
      transactionStore.transactionToAdd.value.supplierName = null;
      transactionStore.transactionToAdd.value.supplierPhone = null;
    }
  }
  
  console.log("🏢 [StepAttachSupplier] Proveedor sincronizado:", supplier?.name);
});
</script>
