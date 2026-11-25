<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:py-6">
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
            <div
              class="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"
            ></div>
            <span class="text-sm text-gray-500">Cargando proveedor...</span>
          </div>

          <!-- Info del proveedor -->
          <div v-else-if="supplier" class="flex-1 min-w-0">
            <h1
              class="text-xl sm:text-2xl font-bold text-gray-900 truncate mb-1"
            >
              {{ supplier.name }}
            </h1>
            <div class="flex items-center gap-2 flex-wrap">
              <span
                v-if="supplier.isPartner"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200"
              >
                Socio de Acopio
              </span>
              <span
                v-if="supplier.pendingBalance > 0"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200"
              >
                Con Deuda
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-200"
              >
                Al día
              </span>
              <span v-if="supplier.rucOrDni" class="text-xs text-gray-600 font-medium">
                📄 RUC/DNI: {{ supplier.rucOrDni }}
              </span>
              <span v-if="supplier.phone" class="text-xs text-gray-500">
                📞 {{ supplier.phone }}
              </span>
              <span
                v-if="(supplier.incidentsCount || 0) > 2"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
              >
                ⚠️ Confiabilidad baja ({{ supplier.incidentsCount }} incidencias)
              </span>
              <span
                v-else-if="(supplier.incidentsCount || 0) > 0"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
              >
                {{ supplier.incidentsCount }} incidencia(s)
              </span>
            </div>
          </div>

          <button
            v-if="supplier && !loading"
            type="button"
            @click="openIncidentModal(null)"
            class="px-3 py-2 rounded-xl border border-amber-600 text-amber-700 bg-amber-50 hover:bg-amber-600 hover:text-white text-xs font-semibold transition-colors shrink-0"
          >
            + Registrar Incidencia / Devolución
          </button>
        </div>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div
          class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"
        ></div>
      </div>

      <div v-else-if="supplier" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Columna Izquierda: Tarjetas y Métricas -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Stats de Finanzas -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <!-- Total Comprado -->
            <div
              class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
            >
              <span
                class="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1"
                >Total Comprado</span
              >
              <span class="text-lg font-bold text-gray-800 tabular-nums"
                >S/ {{ financialStats.totalExpenses.toFixed(2) }}</span
              >
            </div>

            <!-- Total Pagado -->
            <div
              class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
            >
              <span
                class="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1"
                >Total Pagado</span
              >
              <span class="text-lg font-bold text-green-600 tabular-nums"
                >S/ {{ financialStats.totalPaid.toFixed(2) }}</span
              >
            </div>

            <!-- Deuda Pendiente -->
            <div
              class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
            >
              <span
                class="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1"
                >Deuda Pendiente</span
              >
              <span class="text-lg font-bold text-red-600 tabular-nums"
                >S/ {{ financialStats.pendingBalance.toFixed(2) }}</span
              >
            </div>

            <!-- Transacciones -->
            <div
              class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
            >
              <span
                class="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1"
                >Transacciones</span
              >
              <span class="text-lg font-bold text-gray-800 tabular-nums">{{
                financialStats.transactionCount
              }}</span>
            </div>
          </div>

          <!-- Historial de compras / Cuentas por pagar -->
          <div
            class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4"
          >
            <h2 class="text-lg font-bold text-gray-800">
              Cuentas Pendientes y Compras
            </h2>
            <div
              v-if="transactions.length > 0"
              class="divide-y divide-gray-100"
            >
              <div
                v-for="transaction in transactions"
                :key="transaction.uuid"
                class="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-900 text-sm">
                      {{ transaction.description || "Gasto registrado" }}
                    </span>
                    <span
                      :class="[
                        'px-2 py-0.5 rounded text-[10px] font-bold border',
                        transaction.paymentStatus === 'completed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : transaction.paymentStatus === 'partial'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-red-50 text-red-700 border-red-200',
                      ]"
                    >
                      {{ getStatusLabel(transaction.paymentStatus) }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-400 mt-1">
                    📅
                    {{
                      formatDate(transaction.createdAt || transaction.date)
                    }}
                    • 💳 {{ getAccountLabel(transaction.account) }}
                  </p>
                  <p
                    class="text-xs text-gray-500 mt-1 font-medium text-purple-600"
                    v-if="
                      transaction.materialItems &&
                      transaction.materialItems.length > 0
                    "
                  >
                    📦
                    {{
                      transaction.materialItems
                        .map(
                          (item) =>
                            `${item.quantity} ${item.unit} de ${item.description}`,
                        )
                        .join(", ")
                    }}
                  </p>
                </div>

                <div
                  class="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2"
                >
                  <div class="text-sm">
                    <span class="text-gray-400 text-xs">Total: </span>
                    <span class="font-bold text-gray-800"
                      >S/ {{ (transaction.amount || 0).toFixed(2) }}</span
                    >
                    <span
                      v-if="transaction.balance > 0"
                      class="text-xs text-red-600 block sm:mt-0.5"
                    >
                      Falta: S/ {{ transaction.balance.toFixed(2) }}
                    </span>
                  </div>
                  <button
                    v-if="transaction.balance > 0"
                    @click="openPaymentModal(transaction)"
                    class="py-1 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                  >
                    Registrar Abono
                  </button>
                  <button
                    type="button"
                    @click="openIncidentModal(transaction)"
                    class="py-1 px-2.5 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded text-[11px] font-semibold transition-colors"
                  >
                    Incidencia / Devolver
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 text-sm">
              No hay compras ni gastos registrados para este proveedor.
            </div>
          </div>

          <!-- Historial de Incidencias / Devoluciones -->
          <div
            v-if="supplierIncidents.length > 0"
            class="bg-white rounded-xl border border-amber-200 shadow-sm p-5 space-y-3"
          >
            <h2 class="text-base font-bold text-gray-800">
              Incidencias y Devoluciones ({{ supplierIncidents.length }})
            </h2>
            <div class="divide-y divide-gray-100">
              <div
                v-for="inc in supplierIncidents"
                :key="inc.uuid"
                class="py-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div class="min-w-0">
                  <p class="font-semibold text-gray-800">{{ inc.reason }}</p>
                  <p class="text-[11px] text-gray-500">
                    {{ formatDate(inc.createdAt) }} ·
                    {{ inc.mode === 'claim' ? 'Reclamo / Reposición' : inc.mode === 'discount' ? 'Descuento / Rebaja' : 'Devolución física' }}
                    <span v-if="inc.productDescription"> · {{ inc.quantityReturned }} unids de {{ inc.productDescription }}</span>
                  </p>
                </div>
                <span v-if="inc.amountAdjustment > 0" class="font-bold text-emerald-700 shrink-0">
                  -S/ {{ Number(inc.amountAdjustment).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Top Productos -->
        <div class="space-y-6">
          <div
            class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4"
          >
            <h2 class="text-lg font-bold text-gray-800">
              Top Insumos Suministrados
            </h2>
            <div v-if="topProducts.length > 0" class="space-y-3">
              <div
                v-for="(prod, i) in topProducts"
                :key="prod.productId || i"
                class="flex items-center justify-between gap-3 text-sm"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span
                    class="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0"
                  >
                    {{ i + 1 }}
                  </span>
                  <span
                    class="font-medium text-gray-800 truncate"
                    :title="prod.name"
                  >
                    {{ prod.name }}
                  </span>
                </div>
                <div class="text-right shrink-0">
                  <span class="font-semibold text-gray-900 block"
                    >S/ {{ prod.totalAmount.toFixed(2) }}</span
                  >
                  <span class="text-xs text-gray-400"
                    >{{ prod.quantity }} unids</span
                  >
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6 text-gray-400 text-sm">
              Aún no hay compras de mercadería.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Registro de Pago (Abono) -->
    <PaymentRegistrationModal
      v-if="showPaymentModal"
      :show="showPaymentModal"
      :transaction="selectedTransaction"
      @close="closePaymentModal"
      @payment-registered="onPaymentRegistered"
    />

    <!-- Modal Incidencia / Devolución Híbrida -->
    <Teleport to="body">
      <div
        v-if="showIncidentModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs"
        @click.self="showIncidentModal = false"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Incidencia / Devolución</h3>
              <p class="text-xs text-gray-500">Registra fallas del proveedor sin afectar ni ensuciar Caja/Banco innecesariamente.</p>
            </div>
            <button type="button" @click="showIncidentModal = false" class="text-gray-400 hover:text-gray-600 px-2 py-1">✕</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Resolución / Tipo</label>
              <select v-model="incidentForm.mode" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="claim">Reclamo / Reposición (solo historial confiabilidad)</option>
                <option value="discount">Descuento / Nota de crédito (rebaja deuda)</option>
                <option value="return">Devolución física de producto/insumo</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Motivo *</label>
              <input
                v-model="incidentForm.reason"
                type="text"
                placeholder="Ej: Lote dañado, faltaron unidades o demora"
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div v-if="incidentForm.mode === 'discount' || incidentForm.mode === 'return'">
              <label class="block text-xs font-semibold text-gray-700 mb-1">Monto de rebaja / nota de crédito (S/)</label>
              <input
                v-model.number="incidentForm.amountAdjustment"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div v-if="incidentForm.mode === 'return'" class="grid grid-cols-3 gap-2">
              <div class="col-span-2">
                <label class="block text-xs font-semibold text-gray-700 mb-1">Producto a devolver</label>
                <select v-model="incidentForm.productId" class="w-full px-2.5 py-2 border border-gray-200 rounded-xl text-xs">
                  <option value="">Selecciona insumo/producto</option>
                  <option v-for="p in inventoryProducts" :key="p.uuid" :value="p.uuid">
                    {{ p.description }} (Stock: {{ p.stock || 0 }})
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Cant.</label>
                <input
                  v-model.number="incidentForm.quantityReturned"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  class="w-full px-2.5 py-2 border border-gray-200 rounded-xl text-xs"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Notas adicionales (opcional)</label>
              <textarea
                v-model="incidentForm.notes"
                rows="2"
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="showIncidentModal = false" class="px-4 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl">
              Cancelar
            </button>
            <button
              type="button"
              :disabled="!incidentForm.reason.trim() || savingIncident"
              @click="saveIncident"
              class="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl disabled:opacity-50"
            >
              {{ savingIncident ? 'Guardando...' : 'Registrar incidencia' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSupplierDetails } from "@/composables/useSuppliers";
import { useSupplierManagement } from "@/composables/useSupplierManagement";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useToast } from "@/composables/useToast";
import { useRoute, useRouter } from "vue-router";
import PaymentRegistrationModal from "@/components/AccountsPayable/PaymentRegistrationModal.vue";

const route = useRoute();
const router = useRouter();
const supplierId = route.params.supplierId;
const inventoryStore = useInventoryStore();
const { success, error } = useToast();

const {
  supplier,
  transactions,
  loading,
  fetchSupplier,
  fetchSupplierTransactions,
  financialStats,
  topProducts,
} = useSupplierDetails(supplierId);

const {
  supplierIncidents,
  fetchSupplierIncidents,
  createSupplierIncident,
} = useSupplierManagement();

const showPaymentModal = ref(false);
const selectedTransaction = ref(null);
const showIncidentModal = ref(false);
const savingIncident = ref(false);
const incidentForm = ref({
  transactionId: null,
  mode: "claim",
  reason: "",
  amountAdjustment: 0,
  productId: "",
  quantityReturned: 0,
  notes: "",
});

const inventoryProducts = computed(() => inventoryStore.allItemsInInventory.value || []);

onMounted(async () => {
  await Promise.all([
    fetchSupplier(),
    fetchSupplierTransactions(),
    fetchSupplierIncidents(supplierId),
    inventoryStore.getItemsInInventory(),
  ]);
});

function openIncidentModal(tx = null) {
  incidentForm.value = {
    transactionId: tx?.uuid || null,
    mode: "claim",
    reason: "",
    amountAdjustment: 0,
    productId: "",
    quantityReturned: 0,
    notes: "",
  };
  showIncidentModal.value = true;
}

async function saveIncident() {
  if (!incidentForm.value.reason.trim()) return;
  savingIncident.value = true;
  try {
    const selectedProd = inventoryProducts.value.find(
      (p) => p.uuid === incidentForm.value.productId
    );
    await createSupplierIncident({
      supplierId,
      supplierName: supplier.value?.name || "",
      transactionId: incidentForm.value.transactionId,
      mode: incidentForm.value.mode,
      reason: incidentForm.value.reason,
      amountAdjustment: incidentForm.value.amountAdjustment,
      productId: incidentForm.value.productId || null,
      productDescription: selectedProd?.description || "",
      quantityReturned: incidentForm.value.quantityReturned,
      notes: incidentForm.value.notes,
    });
    success("Incidencia registrada correctamente");
    showIncidentModal.value = false;
    await Promise.all([fetchSupplier(), fetchSupplierTransactions()]);
  } catch (err) {
    error("No se pudo registrar la incidencia: " + err.message);
  } finally {
    savingIncident.value = false;
  }
}

function goBack() {
  router.push({
    name: "SuppliersDashboard",
    params: {
      businessId: route.params.businessId,
    },
  });
}

function getStatusLabel(status) {
  const labels = {
    completed: "Pagado",
    partial: "Parcial",
    pending: "Pendiente",
  };
  return labels[status] || status;
}

function getAccountLabel(account) {
  const labels = {
    cash: "Efectivo",
    bank: "Banco",
  };
  return labels[account] || account;
}

function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function openPaymentModal(transaction) {
  selectedTransaction.value = transaction;
  showPaymentModal.value = true;
}

function closePaymentModal() {
  showPaymentModal.value = false;
  selectedTransaction.value = null;
}

async function onPaymentRegistered() {
  // Recargar datos tras registrar el pago
  await fetchSupplier();
  await fetchSupplierTransactions();
}
</script>
