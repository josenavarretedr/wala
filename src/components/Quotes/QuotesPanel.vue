<template>
  <div class="space-y-6 mb-20 p-2">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Cotizaciones</h1>
        <p class="text-sm text-gray-500 mt-1">
          Gestiona tus cotizaciones y conviértelas en ventas
        </p>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div class="col-span-2 sm:col-span-1 bg-blue-50 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg
            class="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-xs sm:text-sm font-medium text-blue-700"
            >Valor Total</span
          >
        </div>
        <p class="text-xl sm:text-2xl font-semibold text-blue-900">
          S/ {{ totalQuotesValue.toFixed(2) }}
        </p>
      </div>

      <div class="bg-purple-50 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg
            class="w-4 h-4 text-purple-600"
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
          <span class="text-xs sm:text-sm font-medium text-purple-700"
            >Pendientes</span
          >
        </div>
        <p class="text-xl sm:text-2xl font-semibold text-purple-900">
          {{ pendingQuotesCount }}
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg
            class="w-4 h-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-xs sm:text-sm font-medium text-green-700"
            >Convertidas</span
          >
        </div>
        <p class="text-xl sm:text-2xl font-semibold text-green-900">
          {{ convertedQuotes.length }}
        </p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex gap-2 overflow-x-auto pb-2">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="activeFilter = filter.value"
        :class="[
          'px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
          activeFilter === filter.value
            ? 'bg-purple-100 text-purple-700 border border-purple-200'
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent',
        ]"
      >
        {{ filter.label }}
        <span
          v-if="getCountByFilter(filter.value) > 0"
          :class="[
            'ml-1.5 px-1.5 py-0.5 rounded text-xs',
            activeFilter === filter.value
              ? 'bg-purple-200 text-purple-800'
              : 'bg-gray-200 text-gray-700',
          ]"
        >
          {{ getCountByFilter(filter.value) }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"
      ></div>
      <p class="text-gray-500 mt-4">Cargando cotizaciones...</p>
    </div>

    <!-- Sin cotizaciones -->
    <div v-else-if="filteredQuotes.length === 0" class="text-center py-12">
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p class="text-gray-500 mt-4 text-base font-medium">
        No hay cotizaciones {{ getFilterLabel() }}
      </p>
      <p class="text-gray-400 text-sm mt-1">
        Las cotizaciones que crees aparecerán aquí
      </p>
    </div>

    <!-- Lista de cotizaciones -->
    <div v-else class="space-y-3">
      <div
        v-for="quote in filteredQuotes"
        :key="quote.uuid"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- Header de la cotización -->
        <div class="bg-gray-50 p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- <div
              class="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold"
            >
              {{ getClientInitials(quote.clientName) }}
            </div> -->
            <div>
              <div class="flex items-center gap-2">
                <p class="font-semibold text-gray-800">
                  {{ quote.quoteNumber }}
                </p>
              </div>

              <span
                :class="[
                  'inline-flex items-center gap-1 px-2 py-0.5  mt-3 rounded-md text-xs font-medium border',
                  quote.status === 'pending'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : quote.status === 'converted'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : quote.status === 'cancelled'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200',
                ]"
              >
                {{ getStatusLabel(quote.status) }}
              </span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">Total</div>
            <p class="text-xl font-bold text-gray-800">
              S/ {{ quote.total.toFixed(2) }}
            </p>
          </div>
        </div>

        <!-- Detalles -->
        <div class="p-3 sm:p-4">
          <!-- Fechas con badges -->
          <div class="flex items-center gap-2 flex-wrap mb-3">
            <div
              class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-md border border-gray-200"
            >
              <svg
                class="w-3.5 h-3.5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-xs text-gray-600">{{
                formatDate(quote.createdAt)
              }}</span>
            </div>
            <div
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border',
                isExpiringSoon(quote.expiresAt)
                  ? 'bg-orange-50 border-orange-200 text-orange-700'
                  : quote.status === 'expired'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700',
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="text-xs font-medium">
                {{ quote.status === "expired" ? "Expiró" : "Expira" }}
                {{ formatDate(quote.expiresAt) }}
              </span>
            </div>
            <div
              class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-md border border-purple-200"
            >
              <User class="w-3.5 h-3.5 text-purple-700 font-medium" />
              <span class="text-xs text-purple-700 font-medium">{{
                quote.clientName
              }}</span>
            </div>
          </div>

          <!-- Productos -->
          <div class="border-t border-gray-100 pt-3">
            <div class="flex items-center gap-2 mb-2">
              <svg
                class="w-4 h-4 text-purple-600"
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
              <span class="text-xs font-semibold text-gray-700">
                {{ quote.items.length }}
                {{ quote.items.length === 1 ? "producto" : "productos" }}
              </span>
            </div>
            <div class="space-y-1.5">
              <div
                v-for="(item, index) in quote.items.slice(0, 2)"
                :key="index"
                class="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0"
              >
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-800 truncate">
                    {{ item.name || item.description || "Producto sin nombre" }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ item.quantity }} {{ item.unit }} × S/
                    {{ item.price.toFixed(2) }}
                  </p>
                </div>
                <div class="text-right ml-2 shrink-0">
                  <p class="font-semibold text-gray-800">
                    S/ {{ item.totalItemPrice.toFixed(2) }}
                  </p>
                </div>
              </div>
              <p
                v-if="quote.items.length > 2"
                class="text-xs text-gray-400 pt-1"
              >
                +{{ quote.items.length - 2 }} más...
              </p>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex gap-2 pt-3 border-t border-gray-100">
            <!-- Ver detalles -->
            <button
              @click="viewQuoteDetails(quote)"
              class="flex-1 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Ver
            </button>

            <!-- Convertir a venta -->
            <button
              v-if="quote.status === 'pending'"
              @click="confirmConvertToSale(quote)"
              class="flex-1 px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Convertir
            </button>

            <!-- Cancelar -->
            <!-- <button
              v-if="quote.status === 'pending'"
              @click="confirmCancelQuote(quote)"
              class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all duration-200"
              title="Cancelar cotización"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuotes } from "@/composables/useQuotes";
import { Bookmark, User } from "@iconoir/vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "@/composables/useToast";
import { useBusinessStore } from "@/stores/businessStore";

const router = useRouter();
const route = useRoute();
const businessStore = useBusinessStore();
const { success, error: showError } = useToast();

const {
  quotes,
  loading,
  pendingQuotes,
  convertedQuotes,
  totalQuotesValue,
  pendingQuotesCount,
  fetchQuotes,
  cancelQuote,
  convertQuoteToSale,
} = useQuotes();

// Estado local
const activeFilter = ref("all");

const filters = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Convertidas", value: "converted" },
  { label: "Canceladas", value: "cancelled" },
  { label: "Expiradas", value: "expired" },
];

// Computed
const filteredQuotes = computed(() => {
  if (activeFilter.value === "all") {
    return quotes.value;
  }
  return quotes.value.filter((q) => q.status === activeFilter.value);
});

// Functions
function getCountByFilter(filter) {
  if (filter === "all") return quotes.value.length;
  return quotes.value.filter((q) => q.status === filter).length;
}

function getFilterLabel() {
  const filter = filters.find((f) => f.value === activeFilter.value);
  return filter ? filter.label.toLowerCase() : "";
}

function formatDate(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getClientInitials(name) {
  if (!name) return "?";
  const names = name.split(" ");
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getStatusLabel(status) {
  const labels = {
    pending: "Pendiente",
    converted: "Convertida",
    cancelled: "Cancelada",
    expired: "Expirada",
  };
  return labels[status] || status;
}

function getStatusColor(status) {
  const colors = {
    pending: {
      bg: "bg-purple-50",
      badge: "bg-purple-600",
    },
    converted: {
      bg: "bg-green-50",
      badge: "bg-green-600",
    },
    cancelled: {
      bg: "bg-red-50",
      badge: "bg-red-600",
    },
    expired: {
      bg: "bg-gray-50",
      badge: "bg-gray-600",
    },
  };
  return colors[status] || colors.pending;
}

function isExpiringSoon(expiresAt) {
  if (!expiresAt) return false;
  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  const now = new Date();
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays > 0;
}

function viewQuoteDetails(quote) {
  const businessId = route.params.businessId || businessStore.getBusinessId;
  router.push({
    name: "QuoteDetails",
    params: { businessId, quoteId: quote.uuid },
  });
}

async function confirmCancelQuote(quote) {
  if (
    confirm(
      `¿Estás seguro de cancelar la cotización ${quote.quoteNumber}? Esta acción no se puede deshacer.`,
    )
  ) {
    try {
      await cancelQuote(quote.uuid);
      success("Cotización cancelada exitosamente");
      await fetchQuotes(); // Recargar lista
    } catch (err) {
      console.error("Error cancelando cotización:", err);
      showError("Error al cancelar la cotización");
    }
  }
}

async function confirmConvertToSale(quote) {
  if (
    confirm(
      `¿Convertir la cotización ${quote.quoteNumber} en una venta?\n\nSe abrirá el flujo de venta con los datos precargados.`,
    )
  ) {
    try {
      await convertQuoteToSale(quote.uuid);
      success("Cotización cargada. Completa el método de pago para finalizar.");

      // Obtener businessId de la ruta actual o del store
      const businessId = route.params.businessId || businessStore.getBusinessId;

      // Cerrar el panel y redirigir al flujo de transacciones
      router.push({
        name: "BasicAccountingRecordsBook",
        params: { businessId },
      });
    } catch (err) {
      console.error("Error convirtiendo cotización:", err);
      showError("Error al convertir la cotización");
    }
  }
}

// Lifecycle
onMounted(async () => {
  await fetchQuotes();
});
</script>

<style scoped>
/* Animaciones sutiles */
.hover\:shadow-lg {
  transition: box-shadow 0.2s ease-in-out;
}
</style>
