<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        {{ isPartialPayment ? "Asignar Cliente" : "Cliente (Opcional)" }}
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        {{
          isPartialPayment
            ? "Para pagos parciales es necesario registrar el cliente"
            : "Puedes vincular esta venta a un cliente específico"
        }}
      </p>
    </div>

    <!-- Cliente Anónimo (solo si no es pago parcial) -->
    <div v-if="!isPartialPayment" class="max-w-lg mx-auto">
      <button
        @click="selectAnonymousClient"
        :class="[
          'w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between',
          isAnonymousSelected
            ? 'border-gray-400 bg-gray-50'
            : 'border-gray-200 bg-white hover:border-gray-300',
        ]"
      >
        <div class="flex items-center gap-3">
          <div
            :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              isAnonymousSelected ? 'border-gray-500' : 'border-gray-300',
            ]"
          >
            <div
              v-if="isAnonymousSelected"
              class="w-3 h-3 rounded-full bg-gray-500"
            ></div>
          </div>
          <div class="text-left">
            <div class="font-medium text-gray-800">Cliente Anónimo</div>
            <div class="text-xs text-gray-500">
              Venta sin cliente registrado
            </div>
          </div>
        </div>
        <svg
          class="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </button>
    </div>

    <!-- Búsqueda de Cliente -->
    <div
      v-if="!selectedClient || isAnonymousSelected"
      class="max-w-lg mx-auto space-y-4"
    >
      <div class="relative">
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar cliente por nombre o teléfono..."
          class="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
          @input="handleSearch"
        />
        <div
          v-if="searchQuery"
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <button
            @click="clearSearch"
            class="text-gray-400 hover:text-gray-600"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-4">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
        <p class="text-sm text-gray-500 mt-2">Buscando clientes...</p>
      </div>

      <!-- Resultados de búsqueda -->
      <div
        v-else-if="searchQuery && filteredClients.length > 0"
        class="space-y-2 max-h-64 overflow-y-auto"
      >
        <button
          v-for="client in filteredClients"
          :key="client.uuid"
          @click="selectClient(client)"
          :class="[
            'w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between',
            selectedClient?.uuid === client.uuid
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50',
          ]"
        >
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                selectedClient?.uuid === client.uuid
                  ? 'border-blue-500'
                  : 'border-gray-300',
              ]"
            >
              <div
                v-if="selectedClient?.uuid === client.uuid"
                class="w-3 h-3 rounded-full bg-blue-500"
              ></div>
            </div>
            <div class="text-left">
              <div class="font-medium text-gray-800">{{ client.name }}</div>
              <div v-if="client.phone" class="text-xs text-gray-500">
                {{ client.phone }}
              </div>
              <div
                v-if="client.pendingBalance > 0"
                class="text-xs text-orange-600 font-medium mt-1"
              >
                Deuda: S/ {{ client.pendingBalance.toFixed(2) }}
              </div>
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

      <!-- Sin resultados -->
      <div
        v-else-if="searchQuery && filteredClients.length === 0 && !loading"
        class="text-center py-8"
      >
        <svg
          class="w-16 h-16 mx-auto text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p class="text-gray-500 mt-4">No se encontraron clientes</p>
        <p class="text-sm text-gray-400 mt-1">
          Intenta con otro término o crea uno nuevo
        </p>
      </div>

      <!-- Botón crear nuevo cliente -->
      <button
        @click="openCreateClientModal"
        class="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
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
        <span class="font-medium">Crear Nuevo Cliente</span>
      </button>
    </div>

    <!-- Cliente seleccionado -->
    <div v-if="selectedClient && !isAnonymousSelected" class="max-w-lg mx-auto">
      <div class="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold"
            >
              {{ selectedClient.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-semibold text-gray-800">
                {{ selectedClient.name }}
              </div>
              <div v-if="selectedClient.phone" class="text-sm text-gray-600">
                {{ selectedClient.phone }}
              </div>
              <div
                v-if="selectedClient.pendingBalance > 0"
                class="text-sm text-orange-600 font-medium mt-1"
              >
                Deuda actual: S/ {{ selectedClient.pendingBalance.toFixed(2) }}
              </div>
            </div>
          </div>
          <button
            @click="clearSelectedClient"
            class="text-gray-400 hover:text-gray-600"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Validación para pago parcial -->
    <div v-if="isPartialPayment && !selectedClient" class="max-w-lg mx-auto">
      <div class="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
        <div class="flex items-center gap-3">
          <svg
            class="w-5 h-5 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p class="text-sm text-orange-700">
            <span class="font-medium">Atención:</span> Debes seleccionar un
            cliente para continuar con un pago parcial.
          </p>
        </div>
      </div>
    </div>

    <!-- Modal Crear Cliente -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="closeCreateClientModal"
      >
        <div
          class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-800">Nuevo Cliente</h2>
            <button
              @click="closeCreateClientModal"
              class="text-gray-400 hover:text-gray-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo <span class="text-red-500">*</span>
              </label>
              <input
                ref="nameInputRef"
                v-model="newClient.name"
                type="text"
                placeholder="Ej: Juan Pérez"
                class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                @keydown.enter.prevent="handleEnterInName"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Teléfono (opcional)
              </label>
              <input
                ref="phoneInputRef"
                v-model="newClient.phone"
                type="tel"
                placeholder="Ej: 999888777"
                class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                @keydown.enter.prevent="handleEnterInPhone"
              />
            </div>
          </div>

          <div v-if="createError" class="text-sm text-red-600">
            {{ createError }}
          </div>

          <div class="flex gap-3 pt-4">
            <button
              @click="closeCreateClientModal"
              class="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="createNewClient"
              :disabled="!newClient.name || creatingClient"
              class="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ creatingClient ? "Creando..." : "Crear Cliente" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useClientStore } from "@/stores/clientStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useBusinessStore } from "@/stores/businessStore";
import { ANONYMOUS_CLIENT_ID } from "@/types/client";

const clientStore = useClientStore();
const transactionStore = useTransactionStore();
const businessStore = useBusinessStore();

// Estado local
const searchQuery = ref("");
const selectedClient = ref(null);
const loading = ref(false);
const showCreateModal = ref(false);
const creatingClient = ref(false);
const createError = ref("");

const newClient = ref({
  name: "",
  phone: "",
});

const nameInputRef = ref(null);
const phoneInputRef = ref(null);

// Computed
const isPartialPayment = computed(() => {
  const status = transactionStore.transactionToAdd.value.paymentStatus;
  const isPartial = status !== "completed";

  console.log("🔍 Debug isPartialPayment:", {
    paymentStatus: status,
    isPartial,
    payments: transactionStore.transactionToAdd.value.payments,
    balance: transactionStore.transactionToAdd.value.balance,
    totalPaid: transactionStore.transactionToAdd.value.totalPaid,
  });

  return isPartial;
});

const isAnonymousSelected = computed(() => {
  return (
    !selectedClient.value || selectedClient.value.uuid === ANONYMOUS_CLIENT_ID
  );
});

const filteredClients = computed(() => {
  if (!searchQuery.value) {
    return clientStore.activeClients;
  }
  return clientStore.searchClients(searchQuery.value);
});

// Functions
async function handleSearch() {
  loading.value = true;
  // Debounce implementado en el store
  await new Promise((resolve) => setTimeout(resolve, 300));
  loading.value = false;
}

function selectAnonymousClient() {
  selectedClient.value = {
    uuid: ANONYMOUS_CLIENT_ID,
    name: "Cliente Anónimo",
  };
  searchQuery.value = "";
  transactionStore.setClientInfo(ANONYMOUS_CLIENT_ID, "Cliente Anónimo");
}

function selectClient(client) {
  selectedClient.value = client;
  transactionStore.setClientInfo(client.uuid, client.name);
  searchQuery.value = "";
}

function clearSelectedClient() {
  selectedClient.value = null;

  if (isPartialPayment.value) {
    // Si es pago parcial, limpiar el cliente del store para forzar selección
    transactionStore.setClientInfo(null, null);
  } else {
    // Si es pago completo, volver a cliente anónimo
    selectAnonymousClient();
  }
}

function clearSearch() {
  searchQuery.value = "";
}

function openCreateClientModal() {
  showCreateModal.value = true;
  createError.value = "";
  // Autofocus en el siguiente tick
  setTimeout(() => {
    nameInputRef.value?.focus();
  }, 100);
}

function handleEnterInName() {
  // Mover al campo de teléfono
  phoneInputRef.value?.focus();
}

function handleEnterInPhone() {
  // Crear cliente si el nombre no está vacío
  if (newClient.value.name && !creatingClient.value) {
    createNewClient();
  }
}

function closeCreateClientModal() {
  showCreateModal.value = false;
  newClient.value = { name: "", phone: "" };
  createError.value = "";
}

async function createNewClient() {
  if (!newClient.value.name) {
    createError.value = "El nombre es requerido";
    return;
  }

  creatingClient.value = true;
  createError.value = "";

  try {
    console.log("🔍 Debug antes de crear cliente:", {
      hasBusinessStore: !!businessStore,
      business: businessStore.business,
      businessId: businessStore.getBusinessId,
    });

    const client = await clientStore.createClient(newClient.value);

    // Seleccionar automáticamente el cliente recién creado
    selectClient(client);

    closeCreateClientModal();
  } catch (error) {
    console.error("Error creando cliente:", error);
    createError.value = "Error al crear el cliente. Inténtalo de nuevo.";
  } finally {
    creatingClient.value = false;
  }
}

// Lifecycle
onMounted(async () => {
  loading.value = true;

  // Cargar clientes del negocio
  const businessId = businessStore.getBusinessId;
  if (businessId) {
    await clientStore.fetchClients(businessId);
  }

  // Si no es pago parcial, seleccionar anónimo por defecto
  if (!isPartialPayment.value) {
    selectAnonymousClient();
  }

  loading.value = false;
});

// Validar que si es pago parcial, DEBE tener un cliente
watch(isPartialPayment, (isPartial) => {
  if (isPartial && isAnonymousSelected.value) {
    selectedClient.value = null;
  }
});
</script>

<style scoped>
/* Scrollbar personalizado */
.max-h-64::-webkit-scrollbar {
  width: 6px;
}

.max-h-64::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.max-h-64::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.max-h-64::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
