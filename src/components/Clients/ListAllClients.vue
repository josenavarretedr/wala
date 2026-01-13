<template>
  <div class="list-all-clients-container">
    <!-- Header -->
    <div class="header-section">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Clientes</h1>
          <p class="text-sm text-gray-600 mt-1">
            Gestiona tus clientes y consulta su historial
          </p>
        </div>
      </div>

      <ClientsStats :clientsStats="clientsStats" />
    </div>

    <!-- Buscador -->
    <div class="search-section">
      <div class="search-wrapper">
        <svg
          class="search-icon"
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
        <input
          ref="inputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Buscar cliente por nombre o teléfono..."
          class="search-input"
          inputmode="search"
          autocomplete="off"
          @input="handleSearch"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-button">
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

    <!-- Lista de clientes -->
    <div class="clients-list-section">
      <div v-if="loading" class="text-center py-8">
        <div class="text-center">
          <SpinnerIcon size="xl" class="text-blue-600 mx-auto mb-4" />
          <p class="text-sm text-gray-500">Cargando clientes...</p>
        </div>
      </div>

      <div v-else-if="filteredClients.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg
            class="w-16 h-16 mx-auto text-gray-400"
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
        </div>
        <h3 class="empty-title">
          {{
            searchQuery
              ? "No se encontraron clientes"
              : "No hay clientes registrados"
          }}
        </h3>
        <p class="empty-description">
          {{
            searchQuery
              ? "Intenta con otro término de búsqueda"
              : "Los clientes aparecerán aquí cuando realices ventas"
          }}
        </p>
      </div>

      <div v-else class="clients-grid">
        <ClientCard
          v-for="client in filteredClients"
          :key="client.uuid"
          :client="client"
          @click="goToClientDetails(client)"
        />
      </div>
    </div>

    <!-- Modales -->

    <EditClientModal
      :is-open="showEditModal"
      :client="selectedClient"
      @close="showEditModal = false"
      @updated="handleClientUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useClients } from "@/composables/useClients";
import { UserPlus as IconoirUserPlus } from "@iconoir/vue";
import ClientsStats from "@/components/Clients/ClientsStats.vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import ClientCard from "@/components/Clients/ClientCard.vue";
import CreateClientModal from "@/components/Clients/CreateClientModal.vue";
import EditClientModal from "@/components/Clients/EditClientModal.vue";

const router = useRouter();
const {
  clients,
  loading,
  searchQuery,
  filteredClients,
  clientsStats,
  fetchAllClients,
  deleteClient,
} = useClients();

const inputRef = ref(null);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedClient = ref(null);

// Cargar clientes al montar
onMounted(async () => {
  await fetchAllClients();
});

// Handlers
function handleSearch() {
  // La búsqueda es reactiva a través del computed filteredClients
}

function clearSearch() {
  searchQuery.value = "";
}

function openCreateModal() {
  showCreateModal.value = true;
}

function openEditModal(client) {
  selectedClient.value = client;
  showEditModal.value = true;
}

async function confirmDelete(client) {
  const confirmed = confirm(
    `¿Estás seguro de eliminar a ${client.name}?\n\nEsta acción marcará al cliente como inactivo.`
  );

  if (confirmed) {
    try {
      await deleteClient(client.uuid);
      console.log("✅ Cliente eliminado exitosamente");
    } catch (error) {
      console.error("❌ Error al eliminar cliente:", error);
      alert("Error al eliminar el cliente: " + error.message);
    }
  }
}

function handleClientCreated(clientId) {
  console.log("Cliente creado:", clientId);
  // fetchAllClients ya se llamó desde el composable con invalidación de caché
}

function handleClientUpdated(clientId) {
  console.log("Cliente actualizado:", clientId);
  // fetchAllClients ya se llamó desde el composable con invalidación de caché
}

function goToClientDetails(client) {
  router.push({
    name: "ClientDetails",
    params: { clientId: client.uuid },
  });
}
</script>

<style scoped>
.list-all-clients-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.header-section {
  margin-bottom: 2rem;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid;
  border-radius: 12px;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

/* Buscador */
.search-section {
  margin-bottom: 2rem;
}

.search-wrapper {
  position: relative;
  max-width: 600px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 3rem;
  font-size: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-button {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem;
  color: #9ca3af;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-button:hover {
  color: #ef4444;
  background: #fee2e2;
}

/* Lista de clientes */
.clients-list-section {
  min-height: 300px;
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .clients-grid {
    grid-template-columns: 1fr;
  }
}
</style>
