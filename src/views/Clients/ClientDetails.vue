<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <!-- Header principal -->
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Botón volver -->
          <button
            @click="goBack"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors shrink-0"
            title="Volver"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <!-- Loading -->
          <div v-if="loading" class="flex items-center gap-3 flex-1">
            <SpinnerIcon size="sm" class="text-blue-600" />
            <span class="text-sm text-gray-500">Cargando cliente...</span>
          </div>

          <!-- Info del cliente -->
          <div v-else-if="client" class="flex-1 min-w-0">
            <!-- Nombre -->
            <h1
              class="text-xl sm:text-2xl font-bold text-gray-900 truncate mb-2"
            >
              {{ client.name }}
            </h1>

            <!-- Badges e info en la misma fila debajo del nombre -->
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Badge de estado -->
              <div
                v-if="client.pendingBalance > 0"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0 bg-red-50 text-red-700 border border-red-200"
              >
                <svg
                  class="w-3 h-3"
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
                <span>Con Deuda</span>
              </div>
              <div
                v-else
                class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0 bg-green-50 text-green-700 border border-green-200"
              >
                <svg
                  class="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Al día</span>
              </div>

              <!-- WhatsApp -->
              <a
                v-if="client.phone"
                :href="getWhatsAppLink(client.phone, `Hola ${client.name}!`)"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-200"
                @click.stop
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                  />
                </svg>
                <span>{{ formatPhone(client.phone) }}</span>
              </a>

              <!-- DNI -->
              <div
                v-if="client.dni"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-gray-50 text-gray-600 border border-gray-200"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
                <span class="font-medium">{{ client.dni }}</span>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div
            v-if="client && !loading"
            class="flex items-center gap-2 shrink-0"
          >
            <button
              @click="openEditModal"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Editar cliente"
            >
              <IconoirEditPencil class="w-5 h-5" />
            </button>
            <button
              @click="confirmDelete"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Eliminar cliente"
            >
              <IconoirTrash class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-if="!loading && client" class="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      <!-- Tabs -->
      <div class="flex gap-2 mb-4 overflow-x-auto pb-2 hide-scrollbar">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="currentTab = tab.value"
          :class="[
            'inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0',
            currentTab === tab.value
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
          ]"
        >
          <component :is="getTabIcon(tab.icon)" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content-wrapper">
        <!-- Tab: Resumen -->
        <Transition name="fade" mode="out-in">
          <div v-if="currentTab === 'resumen'" class="space-y-4">
            <ClientStats :financial-stats="financialStats" />
          </div>
        </Transition>

        <!-- Tab: Transacciones -->
        <Transition name="fade" mode="out-in">
          <div v-if="currentTab === 'transacciones'">
            <ClientTransactionsList
              :transactions="transactions"
              :loading="loading"
            />
          </div>
        </Transition>

        <!-- Tab: Estadísticas -->
        <Transition name="fade" mode="out-in">
          <div v-if="currentTab === 'estadisticas'" class="space-y-4">
            <!-- Compras por mes -->
            <div
              class="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Compras por Mes
              </h3>

              <div
                v-if="purchasesByMonth.every((m) => m.amount === 0)"
                class="flex flex-col items-center justify-center py-12 text-gray-400"
              >
                <svg
                  class="w-12 h-12 mb-2"
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
                <p class="text-sm">Sin datos para mostrar</p>
              </div>

              <div v-else class="flex items-end justify-between h-64 gap-2">
                <div
                  v-for="(month, index) in purchasesByMonth"
                  :key="index"
                  class="flex-1 flex flex-col items-center gap-2"
                >
                  <div class="w-full flex flex-col items-center flex-1">
                    <div
                      class="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer relative group"
                      :style="{ height: getBarHeight(month.amount) }"
                      :title="`S/ ${month.amount.toFixed(2)}`"
                    >
                      <span
                        class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      >
                        S/ {{ month.amount.toFixed(0) }}
                      </span>
                    </div>
                  </div>
                  <span class="text-xs text-gray-500 text-center">{{
                    month.month
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Top 5 Productos -->
            <div
              class="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Top 5 Productos Más Comprados
              </h3>

              <div
                v-if="topProducts.length === 0"
                class="flex flex-col items-center justify-center py-12 text-gray-400"
              >
                <svg
                  class="w-12 h-12 mb-2"
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
                <p class="text-sm">Sin productos comprados</p>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="(product, index) in topProducts"
                  :key="index"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <!-- Ranking -->
                  <div
                    class="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg font-bold text-sm text-white"
                    :class="getRankingColor(index)"
                  >
                    {{ index + 1 }}
                  </div>

                  <!-- Info del producto -->
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-900 truncate">
                      {{ product.name }}
                    </p>
                    <div
                      class="flex items-center gap-3 text-xs text-gray-500 mt-0.5"
                    >
                      <span>{{ product.quantity }} unidades</span>
                      <span class="font-bold text-green-600">
                        S/ {{ product.totalAmount.toFixed(2) }}
                      </span>
                    </div>
                  </div>

                  <!-- Barra visual -->
                  <div
                    class="hidden sm:block w-24 h-2 bg-gray-200 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                      :style="{
                        width: getProductBarWidth(product.totalAmount),
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-if="error && !loading"
      class="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <div
        class="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center max-w-md"
      >
        <svg
          class="w-16 h-16 text-red-400 mx-auto mb-4"
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
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Error al cargar cliente
        </h3>
        <p class="text-sm text-gray-500 mb-4">{{ error }}</p>
        <button
          @click="goBack"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver
        </button>
      </div>
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
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

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

// Función helper para obtener el componente de icono
function getTabIcon(iconName) {
  // Retorna el nombre del icono para usar con svg inline
  return iconName;
}

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
      router.push(`/business/${route.params.businessId}/clients`);
    } catch (error) {
      console.error("❌ Error al eliminar cliente:", error);
      alert("Error al eliminar el cliente: " + error.message);
    }
  }
}

function handleClientUpdated() {
  console.log("Cliente actualizado, recargando datos...");
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
  return `${Math.max(percentage, 5)}%`;
}

// Calcular ancho de barra para top productos
function getProductBarWidth(amount) {
  if (!topProducts.value || topProducts.value.length === 0) return "0%";
  const maxAmount = Math.max(...topProducts.value.map((p) => p.totalAmount));
  if (maxAmount === 0) return "0%";
  const percentage = (amount / maxAmount) * 100;
  return `${Math.max(percentage, 10)}%`;
}

// Obtener color del ranking
function getRankingColor(index) {
  const colors = [
    "bg-gradient-to-br from-yellow-400 to-yellow-500", // 1st - Oro
    "bg-gradient-to-br from-gray-400 to-gray-500", // 2nd - Plata
    "bg-gradient-to-br from-orange-400 to-orange-500", // 3rd - Bronce
    "bg-gradient-to-br from-blue-400 to-blue-500", // 4th
    "bg-gradient-to-br from-blue-400 to-blue-500", // 5th
  ];
  return colors[index] || colors[4];
}
</script>

<style scoped>
/* Fade transition para tabs */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Ocultar scrollbar pero mantener funcionalidad */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Responsive */
@media (max-width: 640px) {
  .space-y-4 > * + * {
    margin-top: 1rem;
  }
}
</style>
