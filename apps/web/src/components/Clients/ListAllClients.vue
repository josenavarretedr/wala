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

      <!-- Rentabilidad por Canal de Origen y Promociones (Área 2 - Marketing) -->
      <div class="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-bold text-gray-900">Rentabilidad por Canal de Origen</h2>
            <p class="text-xs text-gray-500">
              Ventas acumuladas según cómo llegaron tus clientes y tus campañas activas.
            </p>
          </div>
          <button
            type="button"
            @click="openPromoModal"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <span>+ Registrar Promoción</span>
          </button>
        </div>

        <div v-if="originChannelBreakdown.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <div
            v-for="row in originChannelBreakdown"
            :key="row.channel"
            class="bg-gray-50 border border-gray-200 rounded-xl p-2.5"
          >
            <p class="text-[11px] font-bold text-indigo-700 truncate">{{ row.label }}</p>
            <p class="text-sm font-black text-gray-900 tabular-nums mt-0.5">S/ {{ row.totalSales.toFixed(2) }}</p>
            <p class="text-[10px] text-gray-500">{{ row.count }} cliente(s)</p>
          </div>
        </div>
        <p v-else class="text-xs text-gray-400 italic">
          Asigna el canal de origen al crear o editar clientes para medir qué canal trae mejores ventas.
        </p>

        <div v-if="promoMilestones.length > 0" class="pt-2 border-t border-gray-100">
          <p class="text-[11px] font-bold text-gray-500 uppercase mb-1.5">Últimas Promociones / Campañas</p>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="promo in promoMilestones.slice(0, 5)"
              :key="promo.id"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-800"
            >
              <span class="font-semibold">{{ promo.title }}</span>
              <span class="text-[10px] text-indigo-600">({{ formatOriginChannel(promo.channel) }} · {{ Number(promo.cost || 0) > 0 ? `S/ ${Number(promo.cost).toFixed(2)}` : 'Orgánica S/ 0' }})</span>
            </div>
          </div>
        </div>
      </div>
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

    <!-- Modal Registrar Promoción / Campaña -->
    <Teleport to="body">
      <div
        v-if="showPromoModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        @click.self="showPromoModal = false"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Registrar Promoción</h3>
              <p class="text-xs text-gray-500">Guarda tus campañas orgánicas (S/ 0) o registra su gasto en caja.</p>
            </div>
            <button type="button" @click="showPromoModal = false" class="text-gray-400 hover:text-gray-600 px-2 py-1">✕</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Nombre de la campaña / promoción *</label>
              <input
                v-model="promoForm.title"
                type="text"
                placeholder="Ej: Promo 2x1 Fin de Semana"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Canal</label>
              <select
                v-model="promoForm.channel"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="referral">Recomendación / Boca a boca</option>
                <option value="walk_in">Local / Cartelera</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1.5">Tipo de campaña</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="promoForm.isPaid = false"
                  :class="[
                    'px-3 py-2 rounded-xl border text-xs font-semibold transition-all',
                    !promoForm.isPaid ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600',
                  ]"
                >
                  Orgánica (S/ 0)
                </button>
                <button
                  type="button"
                  @click="promoForm.isPaid = true"
                  :class="[
                    'px-3 py-2 rounded-xl border text-xs font-semibold transition-all',
                    promoForm.isPaid ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-gray-200 text-gray-600',
                  ]"
                >
                  Con inversión en dinero
                </button>
              </div>
            </div>

            <div v-if="promoForm.isPaid">
              <label class="block text-xs font-semibold text-gray-700 mb-1">Presupuesto / Gasto estimado (S/)</label>
              <input
                v-model.number="promoForm.cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
              <p class="text-[11px] text-amber-700 mt-1">
                Se abrirá el Libro Contable pre-llenado para descontarlo de Caja o Banco.
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showPromoModal = false"
              class="px-4 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              :disabled="!promoForm.title.trim() || savingPromo"
              @click="submitPromo"
              class="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50"
            >
              {{ promoForm.isPaid ? 'Ir a registrar gasto →' : (savingPromo ? 'Guardando...' : 'Guardar campaña') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useClients } from "@/composables/useClients";
import { useBusinessStore } from "@/stores/businessStore";
import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { useToast } from "@/composables/useToast";
import { UserPlus as IconoirUserPlus } from "@iconoir/vue";
import ClientsStats from "@/components/Clients/ClientsStats.vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import ClientCard from "@/components/Clients/ClientCard.vue";
import CreateClientModal from "@/components/Clients/CreateClientModal.vue";
import EditClientModal from "@/components/Clients/EditClientModal.vue";

const router = useRouter();
const route = useRoute();
const businessStore = useBusinessStore();
const accountsBalanceStore = useAccountsBalanceStore();
const { success, warning } = useToast();
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
const showPromoModal = ref(false);
const savingPromo = ref(false);
const promoMilestones = ref([]);
const promoForm = ref({ title: "", channel: "whatsapp", isPaid: false, cost: null });

const CHANNEL_LABELS = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  tiktok: "TikTok",
  referral: "Recomendación",
  walk_in: "Local",
  other: "Otro canal",
  unassigned: "Sin asignar",
};

function formatOriginChannel(channel) {
  return CHANNEL_LABELS[channel] || channel || "Sin asignar";
}

const originChannelBreakdown = computed(() => {
  const map = {};
  (clients.value || []).forEach((c) => {
    const ch = c.originChannel || "unassigned";
    if (!map[ch]) {
      map[ch] = {
        channel: ch,
        label: formatOriginChannel(ch),
        count: 0,
        totalSales: 0,
      };
    }
    map[ch].count += 1;
    map[ch].totalSales += Number(c.totalPurchases || 0);
  });
  return Object.values(map)
    .filter((row) => row.channel !== "unassigned" || row.count > 0)
    .sort((a, b) => b.totalSales - a.totalSales);
});

async function fetchPromoMilestones() {
  const businessId = route.params.businessId || businessStore.business?.id;
  if (!businessId) return;
  try {
    const q = query(
      collection(db, "businesses", businessId, "promoMilestones"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    promoMilestones.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("⚠️ Error cargando promociones:", err);
  }
}

function openPromoModal() {
  promoForm.value = { title: "", channel: "whatsapp", isPaid: false, cost: null };
  showPromoModal.value = true;
}

async function submitPromo() {
  const businessId = route.params.businessId || businessStore.business?.id;
  if (!businessId || !promoForm.value.title.trim()) return;

  if (promoForm.value.isPaid) {
    await accountsBalanceStore.loadFromDailySummary().catch(() => {});
    if (!accountsBalanceStore.openingTransaction) {
      warning("Debes aperturar la caja del día antes de registrar un gasto de promoción.");
      return;
    }
    showPromoModal.value = false;
    router.push({
      path: `/business/${businessId}/basicAccountingRecordsBook`,
      query: {
        type: "expense",
        category: "overhead",
        prefillName: `Promoción (${formatOriginChannel(promoForm.value.channel)}): ${promoForm.value.title.trim()}`,
        prefillAmount: promoForm.value.cost ? String(promoForm.value.cost) : "",
      },
    });
    return;
  }

  savingPromo.value = true;
  try {
    await addDoc(collection(db, "businesses", businessId, "promoMilestones"), {
      title: promoForm.value.title.trim(),
      channel: promoForm.value.channel,
      cost: 0,
      createdAt: serverTimestamp(),
    });
    success("Promoción orgánica registrada correctamente");
    showPromoModal.value = false;
    await fetchPromoMilestones();
  } catch (err) {
    warning("Error al guardar promoción: " + err.message);
  } finally {
    savingPromo.value = false;
  }
}

// Cargar clientes al montar
onMounted(async () => {
  await Promise.all([fetchAllClients(), fetchPromoMilestones()]);
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
