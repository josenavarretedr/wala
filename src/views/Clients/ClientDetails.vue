<template>
  <div class="client-details-wrapper">
    <!-- Header -->
    <div class="header-section">
      <div class="header-content">
        <button @click="goBack" class="back-button">
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div v-if="loading" class="loading-header">
          <div
            class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
          ></div>
          <span class="text-gray-500">Cargando cliente...</span>
        </div>

        <div v-else-if="client" class="client-header-info">
          <div class="flex-1">
            <h1 class="client-name">{{ client.name }}</h1>
            <a
              v-if="client.phone"
              :href="getWhatsAppLink(client.phone, `Hola ${client.name}!`)"
              target="_blank"
              rel="noopener noreferrer"
              class="phone-link"
              @click.stop
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                />
              </svg>
              <span>{{ formatPhone(client.phone) }}</span>
            </a>
            <!-- DNI (nuevo) -->
            <p v-if="client.dni" class="text-sm text-gray-500 mt-1">
              DNI: {{ client.dni }}
            </p>
          </div>

          <div class="flex items-center space-x-3">
            <!-- Botones de acción (nuevo) -->
            <button
              @click="openEditModal"
              class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <IconoirEditPencil class="w-5 h-5" />
              <span>Editar</span>
            </button>
            <button
              @click="confirmDelete"
              class="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              <IconoirTrash class="w-5 h-5" />
              <span>Eliminar</span>
            </button>
            <!-- Badge de deuda -->
            <div v-if="client.pendingBalance > 0" class="debt-badge">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Con deuda</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-if="!loading && client" class="main-content">
      <!-- Tabs -->
      <div class="tabs-container">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="currentTab = tab.value"
          :class="[
            'tab-button',
            currentTab === tab.value ? 'tab-active' : 'tab-inactive',
          ]"
        >
          <svg
            v-if="tab.icon === 'chart-bar'"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <svg
            v-if="tab.icon === 'clipboard'"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <svg
            v-if="tab.icon === 'chart-line'"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Tab: Resumen -->
        <div v-show="currentTab === 'resumen'" class="tab-panel">
          <ClientStats :financial-stats="financialStats" />
        </div>

        <!-- Tab: Transacciones -->
        <div v-show="currentTab === 'transacciones'" class="tab-panel">
          <ClientTransactionsList
            :transactions="transactions"
            :loading="loading"
          />
        </div>

        <!-- Tab: Estadísticas -->
        <div v-show="currentTab === 'estadisticas'" class="tab-panel">
          <div class="stats-grid">
            <!-- Compras por mes -->
            <div class="chart-card">
              <h3 class="chart-title">Compras por Mes (Últimos 12 meses)</h3>
              <div class="chart-container">
                <div
                  v-if="purchasesByMonth.every((m) => m.amount === 0)"
                  class="empty-chart"
                >
                  <svg
                    class="w-12 h-12 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p class="text-sm text-gray-500 mt-2">
                    Sin datos para mostrar
                  </p>
                </div>
                <div v-else class="bar-chart">
                  <div
                    v-for="(month, index) in purchasesByMonth"
                    :key="index"
                    class="bar-item"
                  >
                    <div class="bar-container">
                      <div
                        class="bar"
                        :style="{ height: getBarHeight(month.amount) }"
                        :title="`S/ ${month.amount.toFixed(2)}`"
                      >
                        <span class="bar-value"
                          >S/ {{ month.amount.toFixed(0) }}</span
                        >
                      </div>
                    </div>
                    <div class="bar-label">{{ month.month }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top 5 Productos -->
            <div class="chart-card">
              <h3 class="chart-title">Top 5 Productos Más Comprados</h3>
              <div class="chart-container">
                <div v-if="topProducts.length === 0" class="empty-chart">
                  <svg
                    class="w-12 h-12 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <p class="text-sm text-gray-500 mt-2">
                    Sin productos comprados
                  </p>
                </div>
                <div v-else class="products-list">
                  <div
                    v-for="(product, index) in topProducts"
                    :key="index"
                    class="product-item"
                  >
                    <div class="product-rank">
                      <span class="rank-number">{{ index + 1 }}</span>
                    </div>
                    <div class="product-info">
                      <p class="product-name">{{ product.name }}</p>
                      <div class="product-stats-row">
                        <span class="product-quantity">
                          {{ product.quantity }} unidades
                        </span>
                        <span class="product-amount">
                          S/ {{ product.totalAmount.toFixed(2) }}
                        </span>
                      </div>
                    </div>
                    <div class="product-bar">
                      <div
                        class="product-bar-fill"
                        :style="{
                          width: getProductBarWidth(product.totalAmount),
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error && !loading" class="error-state">
      <svg
        class="w-16 h-16 text-red-400"
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
      <h3 class="text-lg font-semibold text-gray-900 mt-4">
        Error al cargar cliente
      </h3>
      <p class="text-sm text-gray-500 mt-2">{{ error }}</p>
      <button
        @click="goBack"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Volver
      </button>
    </div>

    <!-- Modal de edición -->
    <EditClientModal
      v-if="client"
      :is-open="showEditModal"
      :client="client"
      @close="showEditModal = false"
      @updated="handleClientUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useClientDetails, useClients } from "@/composables/useClients";
import {
  EditPencil as IconoirEditPencil,
  Trash as IconoirTrash,
} from "@iconoir/vue";
import ClientStats from "@/components/Clients/ClientStats.vue";
import ClientTransactionsList from "@/components/Clients/ClientTransactionsList.vue";
import EditClientModal from "@/components/Clients/EditClientModal.vue";

const route = useRoute();
const router = useRouter();

const clientId = computed(() => route.params.clientId);

const {
  client,
  transactions,
  loading,
  error,
  financialStats,
  topProducts,
  purchasesByMonth,
  getWhatsAppLink,
  initialize,
} = useClientDetails(clientId.value);

const { deleteClient } = useClients();

const currentTab = ref("resumen");
const showEditModal = ref(false);

const tabs = [
  {
    value: "resumen",
    label: "Resumen",
    icon: "chart-bar",
  },
  {
    value: "transacciones",
    label: "Transacciones",
    icon: "clipboard",
  },
  {
    value: "estadisticas",
    label: "Estadísticas",
    icon: "chart-line",
  },
];

onMounted(async () => {
  await initialize();
});

function goBack() {
  router.back();
}

function openEditModal() {
  showEditModal.value = true;
}

async function confirmDelete() {
  if (!client.value) return;

  const confirmed = confirm(
    `¿Estás seguro de eliminar a ${client.value.name}?\n\nEsta acción marcará al cliente como inactivo y regresarás al listado.`
  );

  if (confirmed) {
    try {
      await deleteClient(client.value.uuid);
      console.log("✅ Cliente eliminado exitosamente");
      // Regresar al listado
      router.push(`/business/${route.params.businessId}/clients`);
    } catch (error) {
      console.error("❌ Error al eliminar cliente:", error);
      alert("Error al eliminar el cliente: " + error.message);
    }
  }
}

function handleClientUpdated() {
  console.log("Cliente actualizado, recargando datos...");
  // Recargar datos del cliente
  initialize();
}

function formatPhone(phone) {
  if (!phone) return "";
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 9) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  return phone;
}

// Calcular altura de barra para gráfico de meses
function getBarHeight(amount) {
  if (!purchasesByMonth.value || purchasesByMonth.value.length === 0)
    return "0%";
  const maxAmount = Math.max(...purchasesByMonth.value.map((m) => m.amount));
  if (maxAmount === 0) return "0%";
  const percentage = (amount / maxAmount) * 100;
  return `${Math.max(percentage, 5)}%`; // Mínimo 5% para visibilidad
}

// Calcular ancho de barra para top productos
function getProductBarWidth(amount) {
  if (!topProducts.value || topProducts.value.length === 0) return "0%";
  const maxAmount = Math.max(...topProducts.value.map((p) => p.totalAmount));
  if (maxAmount === 0) return "0%";
  const percentage = (amount / maxAmount) * 100;
  return `${Math.max(percentage, 10)}%`; // Mínimo 10% para visibilidad
}
</script>

<style scoped>
.client-details-wrapper {
  min-height: 100vh;
  background: #f9fafb;
}

/* Header */
.header-section {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  padding: 0.5rem;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.loading-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.client-header-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.client-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.phone-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: #25d366;
  text-decoration: none;
  background: #dcfce7;
  border-radius: 8px;
  transition: all 0.2s;
}

.phone-link:hover {
  background: #bbf7d0;
  color: #16a34a;
}

.debt-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.tab-inactive {
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.tab-inactive:hover {
  background: #f9fafb;
  color: #1f2937;
}

/* Tab Content */
.tab-content {
  min-height: 400px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.chart-container {
  min-height: 300px;
}

/* Empty Chart */
.empty-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 300px;
  padding: 1rem 0.5rem;
  gap: 0.5rem;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 100%;
  max-width: 50px;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.25rem;
}

.bar:hover {
  background: linear-gradient(to top, #2563eb, #3b82f6);
  transform: scaleY(1.05);
}

.bar-value {
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.bar-label {
  font-size: 0.625rem;
  color: #6b7280;
  text-align: center;
  max-width: 100%;
  word-wrap: break-word;
}

/* Products List */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s;
}

.product-item:hover {
  background: #f3f4f6;
}

.product-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-stats-row {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.product-quantity {
  font-weight: 500;
}

.product-amount {
  font-weight: 700;
  color: #16a34a;
}

.product-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.product-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .bar-chart {
    gap: 0.25rem;
  }

  .bar {
    max-width: 30px;
  }

  .bar-label {
    font-size: 0.5rem;
  }
}

@media (max-width: 640px) {
  .client-name {
    font-size: 1.25rem;
  }

  .tabs-container {
    gap: 0.25rem;
  }

  .tab-button {
    padding: 0.625rem 1rem;
    font-size: 0.8rem;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
