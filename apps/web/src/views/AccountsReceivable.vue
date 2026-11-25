<template>
  <div class="min-h-screen pb-20">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
              Cuentas por Cobrar
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 mt-1">
              Gestiona los pagos pendientes de tus clientes
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Spinner de carga -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <SpinnerIcon size="xl" class="text-orange-600 mx-auto mb-4" />
        <p class="text-sm text-gray-500">Cargando cuentas por cobrar...</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-else>
      <!-- Resumen total -->
      <div class="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-4">
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all duration-200 hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-xs sm:text-sm text-gray-500 mb-1">
                Total por cobrar
              </p>
              <p
                class="text-3xl font-extrabold text-orange-600 mb-2 tabular-nums"
              >
                S/ {{ totalReceivable.toFixed(2) }}
              </p>
              <p class="text-xs sm:text-sm text-gray-600">
                {{ pendingTransactions.length }} venta(s) pendiente(s)
              </p>
            </div>
            <div
              class="w-12 h-12 sm:w-16 sm:h-16 bg-orange-50 rounded-xl flex items-center justify-center shrink-0"
            >
              <svg
                class="w-6 h-6 sm:w-8 sm:h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Filtros de antigüedad y estado -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="f in filters"
            :key="f.value"
            type="button"
            @click="currentFilter = f.value"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all inline-flex items-center gap-1.5',
              currentFilter === f.value
                ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600',
            ]"
          >
            <span>{{ f.label }}</span>
            <span
              :class="[
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                currentFilter === f.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600',
              ]"
            >
              {{ filterCounts[f.value] ?? 0 }}
            </span>
          </button>
        </div>
      </div>

      <!-- Vista de Cuentas Castigadas -->
      <div
        v-if="currentFilter === 'written_off'"
        class="max-w-7xl mx-auto px-4 space-y-3"
      >
        <div
          v-if="writtenOffTransactions.length === 0"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-sm text-gray-500"
        >
          No hay cuentas castigadas como incobrables.
        </div>
        <div
          v-for="tx in writtenOffTransactions"
          :key="tx.uuid"
          class="bg-white rounded-xl border border-rose-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div class="space-y-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                Castigado (No monetario)
              </span>
              <span class="text-sm font-bold text-gray-900 truncate">{{ tx.clientName || 'Cliente Anónimo' }}</span>
              <span class="text-xs text-gray-400">{{ formatDate(tx.createdAt) }}</span>
            </div>
            <p class="text-xs text-gray-600">{{ tx.writtenOffReason || tx.description || 'Cuenta incobrable' }}</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="text-base font-extrabold text-rose-700 tabular-nums">
              S/ {{ Number(tx.writtenOffAmount || tx.balance || 0).toFixed(2) }}
            </span>
            <router-link
              :to="{ name: 'DetailsRecords', params: { registerId: tx.uuid } }"
              class="px-2.5 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              Ver venta
            </router-link>
          </div>
        </div>
      </div>

      <!-- Lista agrupada por cliente -->
      <div v-else class="max-w-7xl mx-auto px-4 space-y-3 sm:space-y-4">
        <div
          v-for="group in filteredReceivablesByClient"
          :key="group.clientId"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <!-- Header del cliente -->
          <div
            class="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <div
                    class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0"
                  >
                    <svg
                      class="w-4 h-4 text-orange-600"
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
                  </div>
                  <h3
                    class="text-base sm:text-lg font-semibold text-gray-900 truncate"
                  >
                    {{ group.clientName }}
                  </h3>
                </div>
                <p class="text-xs sm:text-sm text-gray-500 ml-10">
                  {{ group.transactions.length }} venta(s) pendiente(s)
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs text-gray-500 mb-0.5">Total pendiente</p>
                <p
                  class="text-lg sm:text-2xl font-bold text-orange-600 tabular-nums"
                >
                  S/ {{ group.totalPending.toFixed(2) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Lista de transacciones -->
          <div class="divide-y divide-gray-100">
            <div
              v-for="transaction in group.transactions"
              :key="transaction.uuid"
              class="p-3 sm:p-4 transition-all duration-200 hover:bg-gray-50"
            >
              <!-- Header de la transacción -->
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                  <!-- Badge de estado -->
                  <div
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border shrink-0',
                      transaction.paymentStatus === 'pending'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200',
                    ]"
                  >
                    <svg
                      class="w-3 h-3 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{{
                      transaction.paymentStatus === "pending"
                        ? "Pendiente"
                        : "Parcial"
                    }}</span>
                  </div>

                  <!-- Fecha y antigüedad -->
                  <span class="text-xs text-gray-500 truncate">
                    {{ formatDate(transaction.createdAt) }}
                  </span>
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-md text-[10px] font-bold border',
                      transaction.agingBucket === 'overdue_over_30'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : transaction.agingBucket === 'overdue_under_30'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    ]"
                  >
                    {{
                      transaction.agingBucket === 'overdue_over_30'
                        ? `Moroso ${transaction.daysOverdue}d`
                        : transaction.agingBucket === 'overdue_under_30'
                          ? `Vencido ${transaction.daysOverdue}d`
                          : 'Al día'
                    }}
                  </span>
                </div>

                <!-- Botón de ver detalles, WhatsApp, castigar y registrar pago -->
                <div class="flex items-center gap-1.5 flex-wrap shrink-0">
                  <button
                    type="button"
                    @click="openMetaEditor(transaction)"
                    class="px-2 py-1 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                    title="Editar fecha prometida y nota"
                  >
                    {{ transaction.promisedPaymentDate ? `📅 ${formatDate(transaction.promisedPaymentDate)}` : '📅 Promesa' }}
                  </button>
                  <button
                    type="button"
                    @click="sendWhatsAppReminder(transaction, group)"
                    class="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                    title="Recordar por WhatsApp"
                  >
                    WhatsApp
                  </button>
                  <button
                    v-if="transaction.agingBucket === 'overdue_over_30'"
                    type="button"
                    @click="openWriteOffModal(transaction)"
                    class="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-600 hover:text-white transition-colors"
                  >
                    Castigar incobrable
                  </button>
                  <router-link
                    :to="{
                      name: 'DetailsRecords',
                      params: { registerId: transaction.uuid },
                    }"
                    class="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Ver detalles de la venta"
                  >
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </router-link>
                  <button
                    @click="openPaymentModal(transaction)"
                    :class="[
                      'px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium inline-flex items-center gap-1.5 shadow-sm',
                      !opening
                        ? 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow',
                    ]"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span class="hidden sm:inline">Registrar Pago</span>
                    <span class="sm:hidden">Pagar</span>
                  </button>
                </div>
              </div>

              <!-- Nota de seguimiento / Editor inline -->
              <p
                v-if="transaction.receivableNote && editingMetaTxId !== transaction.uuid"
                class="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mb-2"
              >
                📝 {{ transaction.receivableNote }}
              </p>
              <div
                v-if="editingMetaTxId === transaction.uuid"
                class="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 mb-2 space-y-2"
              >
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label class="block text-[10px] font-bold text-amber-900 uppercase mb-1">Fecha prometida</label>
                    <input
                      v-model="metaForm.promisedPaymentDate"
                      type="date"
                      class="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-amber-900 uppercase mb-1">Nota de seguimiento</label>
                    <input
                      v-model="metaForm.receivableNote"
                      type="text"
                      placeholder="Ej: Prometió transferir el viernes"
                      class="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-200 rounded-lg"
                    />
                  </div>
                </div>
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    @click="editingMetaTxId = null"
                    class="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    @click="saveMetaEditor(transaction.uuid)"
                    class="px-3 py-1 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    Guardar seguimiento
                  </button>
                </div>
              </div>

              <!-- Descripción (si existe) -->
              <p
                v-if="transaction.description"
                class="text-xs text-gray-600 mb-3 line-clamp-2"
              >
                {{ transaction.description }}
              </p>

              <!-- Grid de montos -->
              <div
                class="grid grid-cols-3 gap-2 sm:gap-3 bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-100"
              >
                <div class="text-center">
                  <div class="text-xs text-gray-500 mb-0.5">Total</div>
                  <div
                    class="text-sm sm:text-base font-semibold text-gray-900 tabular-nums"
                  >
                    S/ {{ getTransactionTotal(transaction).toFixed(2) }}
                  </div>
                </div>
                <div class="text-center border-x border-gray-200">
                  <div class="text-xs text-gray-500 mb-0.5">Pagado</div>
                  <div
                    class="text-sm sm:text-base font-semibold text-green-600 tabular-nums"
                  >
                    S/ {{ transaction.totalPaid.toFixed(2) }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-gray-500 mb-0.5">Pendiente</div>
                  <div
                    class="text-sm sm:text-base font-semibold text-red-600 tabular-nums"
                  >
                    S/ {{ transaction.balance.toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="filteredReceivablesByClient.length === 0"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center"
        >
          <div
            class="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-xl mb-4"
          >
            <svg
              class="w-8 h-8 text-green-600"
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
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            ¡Todo al día!
          </h3>
          <p class="text-sm text-gray-500">
            No tienes ventas con pagos pendientes{{
              currentFilter !== "all" ? " en este filtro" : ""
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Modal de registro de pago -->
    <PaymentRegistrationModal
      :is-open="showPaymentModal"
      :transaction="selectedTransaction"
      @close="showPaymentModal = false"
      @success="handlePaymentSuccess"
    />

    <!-- Modal Confirmar Castigo de Incobrable -->
    <Teleport to="body">
      <div
        v-if="showWriteOffModal && writeOffTarget"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        @click.self="closeWriteOffModal"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">
              Ajuste Contable No Monetario
            </span>
            <h3 class="text-lg font-bold text-gray-900 mt-1">Castigar cuenta como incobrable</h3>
            <p class="text-xs text-gray-600 mt-1">
              Se dará de baja el saldo de <strong class="text-rose-700">S/ {{ Number(writeOffTarget.balance || 0).toFixed(2) }}</strong> de
              <strong>{{ writeOffTarget.clientName || 'Cliente' }}</strong> y se registrará en tu Estado de Resultados sin afectar tu Caja ni Banco.
            </p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Motivo del castigo (Opcional)</label>
            <input
              v-model="writeOffReason"
              type="text"
              placeholder="Ej: Deuda > 30 días sin respuesta"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-rose-500"
            />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="closeWriteOffModal"
              class="px-4 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              :disabled="isWritingOff"
              @click="confirmWriteOff"
              class="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl disabled:opacity-50"
            >
              {{ isWritingOff ? 'Registrando...' : 'Confirmar castigo' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast de notificación -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAccountsReceivable } from "@/composables/useAccountsReceivable";
import PaymentRegistrationModal from "@/components/AccountsReceivable/PaymentRegistrationModal.vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import { useToast } from "@/composables/useToast";
import { useRoute } from "vue-router";

import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
const accountsBalanceStore = useAccountsBalanceStore();
const opening = computed(() => accountsBalanceStore.openingTransaction);
import { useSubscription } from "@/composables/useSubscription";

const route = useRoute();
// Suscripción
const { isPremium } = useSubscription();

// Toast
const { warning, premium, success } = useToast();

const {
  pendingTransactions,
  writtenOffTransactions,
  totalReceivable,
  receivablesByClient,
  updateReceivableMeta,
  writeOffReceivable,
} = useAccountsReceivable();
import { useClientStore } from "@/stores/clientStore";
const clientStore = useClientStore();

const transactionStore = useTransactionStore();
const showPaymentModal = ref(false);
const selectedTransaction = ref(null);
const currentFilter = ref("all");
const isLoading = ref(true);

const editingMetaTxId = ref(null);
const metaForm = ref({ promisedPaymentDate: "", receivableNote: "" });
const showWriteOffModal = ref(false);
const writeOffTarget = ref(null);
const writeOffReason = ref("");
const isWritingOff = ref(false);

const filters = [
  { label: "Todas", value: "all" },
  { label: "Al día", value: "current" },
  { label: "Vencido <30d", value: "overdue_under_30" },
  { label: "Moroso >30d", value: "overdue_over_30" },
  { label: "Pendientes", value: "pending" },
  { label: "Parciales", value: "partial" },
  { label: "Castigados", value: "written_off" },
];

const filterCounts = computed(() => {
  const list = pendingTransactions.value;
  return {
    all: list.length,
    current: list.filter((t) => t.agingBucket === "current").length,
    overdue_under_30: list.filter((t) => t.agingBucket === "overdue_under_30").length,
    overdue_over_30: list.filter((t) => t.agingBucket === "overdue_over_30").length,
    pending: list.filter((t) => t.paymentStatus === "pending").length,
    partial: list.filter((t) => t.paymentStatus === "partial").length,
    written_off: writtenOffTransactions.value.length,
  };
});

// Cargar transacciones con balance pendiente al montar el componente
onMounted(async () => {
  try {
    console.log("🔄 Cargando cuentas por cobrar...");
    isLoading.value = true;
    await transactionStore.fetchPendingTransactions();
    if (!clientStore.clients?.length && route.params.businessId) {
      await clientStore.fetchClients(route.params.businessId);
    }
    console.log("✅ Cuentas por cobrar cargadas");
  } catch (error) {
    console.error("❌ Error cargando cuentas por cobrar:", error);
  } finally {
    isLoading.value = false;
  }
});

// Computed
const filteredReceivablesByClient = computed(() => {
  if (currentFilter.value === "all") {
    return receivablesByClient.value;
  }

  const matchTx = (t) => {
    if (["current", "overdue_under_30", "overdue_over_30"].includes(currentFilter.value)) {
      return t.agingBucket === currentFilter.value;
    }
    return t.paymentStatus === currentFilter.value;
  };

  return receivablesByClient.value
    .map((group) => ({
      ...group,
      transactions: group.transactions.filter(matchTx),
      totalPending: group.transactions
        .filter(matchTx)
        .reduce((sum, t) => sum + (t.balance || 0), 0),
    }))
    .filter((group) => group.transactions.length > 0);
});

function openMetaEditor(transaction) {
  editingMetaTxId.value = transaction.uuid;
  let dateVal = "";
  if (transaction.promisedPaymentDate) {
    const d = transaction.promisedPaymentDate.toDate
      ? transaction.promisedPaymentDate.toDate()
      : new Date(transaction.promisedPaymentDate);
    if (!Number.isNaN(d.getTime())) {
      dateVal = d.toISOString().split("T")[0];
    }
  }
  metaForm.value = {
    promisedPaymentDate: dateVal,
    receivableNote: transaction.receivableNote || "",
  };
}

async function saveMetaEditor(txId) {
  try {
    await updateReceivableMeta(txId, {
      promisedPaymentDate: metaForm.value.promisedPaymentDate || null,
      receivableNote: metaForm.value.receivableNote || null,
    });
    editingMetaTxId.value = null;
    success("Seguimiento de cobranza guardado");
  } catch (err) {
    warning("No se pudo guardar el seguimiento: " + err.message);
  }
}

function sendWhatsAppReminder(transaction, group) {
  const client = (clientStore.clients || []).find((c) => c.uuid === group.clientId);
  const rawPhone = String(client?.phone || "").replace(/\D/g, "");
  const phone = rawPhone ? (rawPhone.startsWith("51") ? rawPhone : `51${rawPhone}`) : "";
  const msg = encodeURIComponent(
    `Hola ${group.clientName}, te recordamos amablemente el saldo pendiente de S/ ${Number(transaction.balance || 0).toFixed(2)} correspondiente a la compra del ${formatDate(transaction.createdAt)}. ¡Gracias!`
  );
  const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function openWriteOffModal(transaction) {
  writeOffTarget.value = transaction;
  writeOffReason.value = "";
  showWriteOffModal.value = true;
}

function closeWriteOffModal() {
  showWriteOffModal.value = false;
  writeOffTarget.value = null;
  writeOffReason.value = "";
}

async function confirmWriteOff() {
  if (!writeOffTarget.value) return;
  isWritingOff.value = true;
  try {
    const { amountToWriteOff } = await writeOffReceivable(
      writeOffTarget.value,
      writeOffReason.value
    );
    closeWriteOffModal();
    warning(
      `Se castigó S/ ${amountToWriteOff.toFixed(2)} como incobrable. Ver Estado de Resultados`,
      {
        duration: 4500,
        actionLink: {
          text: "Ver Estado de Resultados",
          route: `/business/${route.params.businessId}/income-statement`,
        },
      }
    );
  } catch (err) {
    warning("No se pudo castigar la cuenta: " + err.message);
  } finally {
    isWritingOff.value = false;
  }
}

// Methods
function openPaymentModal(transaction) {
  // Validar que exista apertura
  if (!opening.value) {
    warning(
      "Debes aperturar antes de registrar transacciones en cuentas por cobrar",
    );
    return;
  }
  if (!isPremium.value) {
    premium(
      "Registra pagos parciales y gestiona mejor tus cuentas por cobrar.",
      {
        actionLink: {
          text: "Actualiza a Wala Pro",
          route: `/business/${route.params.businessId}/pro`,
        },
      },
    );
    return;
  }
  selectedTransaction.value = transaction;
  showPaymentModal.value = true;
}

function handlePaymentSuccess() {
  showPaymentModal.value = false;
  selectedTransaction.value = null;
  success("Pago registrado exitosamente en la cuenta del cliente");
  // La lista se actualiza automáticamente por reactividad
}

function formatDate(timestamp) {
  if (!timestamp) return "-";
  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTransactionTotal(transaction) {
  return transaction.total || transaction.amount || 0;
}
</script>

<style scoped>
/* Truncate text para descripciones largas */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Números tabulares para mejor alineación de montos */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects para dispositivos con soporte */
@media (hover: hover) {
  .hover\:shadow-md:hover {
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
}

/* Estabilidad de layout */
.shrink-0 {
  flex-shrink: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  /* Asegurar que los badges no se compriman demasiado */
  .inline-flex.gap-1 {
    min-width: fit-content;
  }

  /* Mejor espaciado en móvil */
  .space-y-3 > * + * {
    margin-top: 0.75rem;
  }
}

/* Asegurar que las cifras no se deformen en pantallas pequeñas */
@media (max-width: 480px) {
  .tabular-nums {
    font-size: 0.9rem;
    line-height: 1.25rem;
  }
}
</style>
