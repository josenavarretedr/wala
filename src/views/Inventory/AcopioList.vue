<template>
  <div class="min-h-screen pb-20 bg-gray-50/50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>🌾</span> Acopio de Productos
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 mt-1">
              Registro histórico y liquidación de productos acopiados a socios
            </p>
          </div>
          <button
            @click="goToWizard"
            class="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center gap-2 self-start sm:self-auto"
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
            Registrar Acopio
          </button>
        </div>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <!-- Tarjetas de Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Total Operaciones -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p class="text-xs sm:text-sm text-gray-500 mb-1">Acopios registrados</p>
            <p class="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
              {{ totalAcopiosCount }}
            </p>
          </div>
          <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        <!-- Deuda Activa -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p class="text-xs sm:text-sm text-gray-500 mb-1">Deuda Pendiente de Acopios</p>
            <p class="text-2xl sm:text-3xl font-extrabold text-red-600 tabular-nums">
              S/ {{ pendingDebtTotal.toFixed(2) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- Total Historico -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p class="text-xs sm:text-sm text-gray-500 mb-1">Monto Total Acopiado</p>
            <p class="text-2xl sm:text-3xl font-extrabold text-teal-600 tabular-nums">
              S/ {{ totalHistoricalAmount.toFixed(2) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Buscador -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="relative w-full sm:max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por producto o socio..."
            class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Filtrar:</span>
          <select v-model="statusFilter" class="border border-gray-200 rounded-lg p-2 text-xs bg-white focus:outline-none focus:border-teal-500">
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente de Liquidar</option>
            <option value="completed">Liquidado</option>
          </select>
        </div>
      </div>

      <!-- Spinner de carga -->
      <div v-if="acopioStore.loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-4"></div>
          <p class="text-sm text-gray-500">Cargando historial de acopios...</p>
        </div>
      </div>

      <!-- Historial de Acopios -->
      <div v-else-if="filteredAcopios.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100 text-left">
            <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th class="px-6 py-4">Fecha</th>
                <th class="px-6 py-4">Producto</th>
                <th class="px-6 py-4">Cantidad</th>
                <th class="px-6 py-4">Precio Pactado</th>
                <th class="px-6 py-4">Monto Total</th>
                <th class="px-6 py-4">Socio (Proveedor)</th>
                <th class="px-6 py-4">Estado</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
              <tr v-for="acopio in filteredAcopios" :key="acopio.uuid" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                  {{ formatDate(acopio.createdAt) }}
                </td>
                <td class="px-6 py-4 font-bold text-gray-900">
                  {{ acopio.productDescription }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ acopio.quantity.toFixed(2) }} {{ acopio.unit || 'uni' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="acopio.agreedPrice === 0" class="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded">Por definir</span>
                  <span v-else>S/ {{ acopio.agreedPrice.toFixed(2) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-semibold">
                  S/ {{ acopio.totalAmount.toFixed(2) }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-800">
                  {{ acopio.supplierName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
                      acopio.status === 'completed'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    ]"
                  >
                    {{ acopio.status === 'completed' ? 'Liquidado' : 'Deuda Pendiente' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <!-- Editar Precio -->
                  <button
                    v-if="acopio.status !== 'completed'"
                    @click="openEditPriceModal(acopio)"
                    class="text-teal-600 hover:text-teal-800 font-semibold text-xs py-1 px-2 border border-teal-200 bg-teal-50 hover:bg-teal-100 rounded-lg transition-all"
                  >
                    Ajustar Precio
                  </button>
                  <!-- Pagar Deuda -->
                  <button
                    v-if="acopio.status !== 'completed'"
                    @click="goToPayDebt"
                    class="text-purple-600 hover:text-purple-800 font-semibold text-xs py-1 px-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all"
                  >
                    Liquidar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
        <p class="text-lg font-bold mb-2">No se encontraron acopios</p>
        <p class="text-sm">Registra un nuevo acopio para ver el historial aquí.</p>
      </div>
    </div>

    <!-- Modal Ajustar Precio Pactado -->
    <div v-if="showEditPriceModal" class="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100 flex flex-col p-6 space-y-4">
        <h3 class="font-bold text-gray-900 text-lg">Ajustar Precio Pactado</h3>
        
        <p class="text-sm text-gray-500">
          Modifica el precio acordado para el acopio de <strong>{{ selectedAcopio.productDescription }}</strong> a cargo de <strong>{{ selectedAcopio.supplierName }}</strong>.
        </p>

        <div class="bg-teal-50 p-4 rounded-xl border border-teal-100 text-sm space-y-1">
          <div class="flex justify-between text-gray-600">
            <span>Cantidad:</span>
            <span class="font-bold">{{ selectedAcopio.quantity.toFixed(2) }} {{ selectedAcopio.unit }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Precio actual:</span>
            <span class="font-bold">S/ {{ selectedAcopio.agreedPrice.toFixed(2) }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Nuevo Precio Pactado por Unidad</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">S/</span>
            <input
              v-model.number="newPriceInputValue"
              type="number"
              step="0.01"
              min="0"
              class="w-full pl-8 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none text-base font-bold"
              placeholder="0.00"
            />
          </div>
          <div class="flex justify-between text-xs text-gray-500 pt-1">
            <span>Nuevo Monto Total:</span>
            <span class="font-bold text-teal-700">S/ {{ (selectedAcopio.quantity * (newPriceInputValue || 0)).toFixed(2) }}</span>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            @click="closeEditPriceModal"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="saveNewPrice"
            :disabled="isSubmittingPrice || newPriceInputValue === null || newPriceInputValue < 0"
            class="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <span v-if="isSubmittingPrice" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            <span>Guardar Ajuste</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAcopioStore } from '@/stores/acopioStore';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const route = useRoute();
const acopioStore = useAcopioStore();
const { success, error: showError } = useToast();

// State
const searchQuery = ref('');
const statusFilter = ref('all');

const showEditPriceModal = ref(false);
const selectedAcopio = ref(null);
const newPriceInputValue = ref(0);
const isSubmittingPrice = ref(false);

onMounted(() => {
  acopioStore.fetchAcopios();
});

onUnmounted(() => {
  acopioStore.cleanup();
});

// Computed Metrics
const totalAcopiosCount = computed(() => acopioStore.acopios.length);

const pendingDebtTotal = computed(() => {
  return acopioStore.acopios
    .filter(a => a.status !== 'completed')
    .reduce((sum, a) => sum + (a.totalAmount || 0), 0);
});

const totalHistoricalAmount = computed(() => {
  return acopioStore.acopios.reduce((sum, a) => sum + (a.totalAmount || 0), 0);
});

const filteredAcopios = computed(() => {
  let list = acopioStore.acopios;

  // Filtrado por búsqueda
  if (searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(a => 
      a.productDescription.toLowerCase().includes(q) || 
      a.supplierName.toLowerCase().includes(q)
    );
  }

  // Filtrado por estado
  if (statusFilter.value !== 'all') {
    list = list.filter(a => a.status === statusFilter.value);
  }

  return list;
});

// Navigation
const goToWizard = () => {
  router.push({
    name: 'InventoryAcopioWizard',
    params: { businessId: route.params.businessId }
  });
};

const goToPayDebt = () => {
  router.push({
    name: 'AccountsPayable',
    params: { businessId: route.params.businessId }
  });
};

// Date Formatter
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Edit Price Modal functions
const openEditPriceModal = (acopio) => {
  selectedAcopio.value = acopio;
  newPriceInputValue.value = acopio.agreedPrice || 0;
  showEditPriceModal.value = true;
};

const closeEditPriceModal = () => {
  selectedAcopio.value = null;
  newPriceInputValue.value = 0;
  showEditPriceModal.value = false;
};

const saveNewPrice = async () => {
  if (newPriceInputValue.value === null || newPriceInputValue.value < 0) return;
  isSubmittingPrice.value = true;

  try {
    await acopioStore.updateAcopioPrice(selectedAcopio.value.uuid, newPriceInputValue.value);
    success('Precio pactado ajustado con éxito');
    closeEditPriceModal();
  } catch (err) {
    showError('Error al ajustar el precio pactado');
  } finally {
    isSubmittingPrice.value = false;
  }
};
</script>
