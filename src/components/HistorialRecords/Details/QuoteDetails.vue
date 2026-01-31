<template>
  <div
    class="space-y-4 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-20"
    ref="captureTarget"
  >
    <!-- HEADER -->
    <div class="flex justify-end items-center gap-3 mb-3 no-share-item">
      <CloseBtn v-bind="closeBtnConfig" />
    </div>

    <!-- Content Card - Contenedor con ref para captura -->
    <div>
      <!-- Estado de carga -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-12"
      >
        <SpinnerIcon size="lg" class="text-gray-600 mx-auto mb-4" />
        <p class="text-sm text-gray-500 mt-3">Cargando detalles...</p>
      </div>

      <!-- Error: No se encontró -->
      <div
        v-else-if="!quote"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <div
          class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4"
        >
          <svg
            class="w-8 h-8 text-red-400"
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
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-1">
          Cotización no encontrada
        </h3>
        <p class="text-sm text-gray-500">
          No se pudo cargar la información de esta cotización
        </p>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Título mejorado -->
        <div class="text-center space-y-2 mb-4">
          <!-- <div class="inline-flex items-center justify-center gap-2 mb-2">
            <div
              class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
            >
              <Bookmark class="w-6 h-6 text-purple-600" />
            </div>
          </div> -->
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
            Resumen de Cotización
          </h1>
          <p class="text-sm text-gray-500">
            {{ formatDate(new Date()) }}
          </p>

          <div
            class="share-button-container mt-6 pt-4 border-t border-gray-200 flex justify-end no-share-item"
          >
            <ShareButtonCloud
              :targetRef="captureTarget"
              :fileName="getShareFileName()"
              shareTitle="Comprobante de Venta"
              shareText="Negocio impulsado con wala.lat"
              componentType="income-details"
              variant="card"
              size="sm"
            />
          </div>
        </div>

        <!-- Preview de la cotización -->
        <div
          class="bg-white rounded-xl shadow-sm border-2 border-purple-200 overflow-hidden"
        >
          <!-- Total destacado con badge de cotización -->
          <div
            v-if="quote.items.length > 0"
            class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 text-center"
          >
            <div class="flex items-center justify-center gap-2 mb-2">
              <span
                class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold"
              >
                COTIZACIÓN
              </span>
            </div>
            <div class="text-3xl font-bold mb-1">
              S/ {{ getTotal().toFixed(2) }}
            </div>
          </div>

          <!-- Selector de días de expiración -->
          <div class="p-4 bg-purple-50 border-b border-purple-100">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center gap-2">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Validez de la cotización
              </span>
            </label>
            <select
              v-model="expirationDays"
              disabled=""
              class="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-700 font-medium"
            >
              <option :value="7">7 días (1 semana)</option>
              <option :value="15">15 días (2 semanas)</option>
              <option :value="30">30 días (1 mes)</option>
              <option :value="60">60 días (2 meses)</option>
              <option :value="90">90 días (3 meses)</option>
            </select>
            <p class="text-xs text-gray-500 mt-2">
              Vence el:
              <span class="font-semibold text-purple-600">{{
                formatExpirationDate(expirationDays)
              }}</span>
            </p>
          </div>

          <!-- Información del cliente (si existe) -->
          <div
            v-if="quote.client"
            class="p-4 border-b border-gray-100 bg-blue-50"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold"
              >
                {{ getClientInitials() }}
              </div>
              <div>
                <p class="text-sm text-gray-600">Cliente</p>
                <p class="font-semibold text-gray-800">
                  {{ quote.client.name }}
                </p>
              </div>
            </div>
          </div>

          <!-- Lista de productos -->
          <div v-if="quote.items.length > 0" class="p-4">
            <h3
              class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
            >
              <Package class="w-5 h-5 text-purple-600" />
              Productos cotizados
            </h3>

            <div class="space-y-2">
              <div
                v-for="(item, index) in quote.items"
                :key="index"
                class="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0"
              >
                <div class="flex-1">
                  <p class="font-medium text-gray-800">
                    {{ item.name || item.description || "Producto sin nombre" }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ item.quantity }} {{ item.unit }} × S/
                    {{ item.price.toFixed(2) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-800">
                    S/ {{ (item.price * item.quantity).toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Resumen final -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center text-lg font-bold">
                <span class="text-gray-700">Total Cotización</span>
                <span class="text-purple-600"
                  >S/ {{ getTotal().toFixed(2) }}</span
                >
              </div>
              <p class="text-xs text-gray-500 text-right mt-1">
                {{ quote.items.length }}
                {{ quote.items.length === 1 ? "producto" : "productos" }}
              </p>
            </div>
          </div>

          <!-- Estado vacío -->
          <div v-else class="p-8 text-center">
            <div
              class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <Package class="w-6 h-6 text-gray-400" />
            </div>
            <h3 class="font-semibold text-gray-600 mb-1">No hay productos</h3>
            <p class="text-sm text-gray-500">
              Agrega productos para generar la cotización
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Nota informativa -->
    <div
      v-if="quote && quote.items && quote.items.length > 0"
      class="bg-purple-50 rounded-xl p-4 border border-purple-200 no-share-item"
    >
      <div class="flex items-start gap-3">
        <div
          class="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        >
          <svg
            class="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-purple-900 mb-1">
            Importante sobre las cotizaciones
          </p>
          <ul class="text-xs text-purple-800 space-y-1">
            <li>• Esta cotización NO afectará tu inventario ni cuentas</li>
            <li>
              • Podrás convertirla en venta desde el panel de Cotizaciones
            </li>
            <li>• El cliente recibirá esta información al compartirla</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div
      v-if="quote && quote.status === 'pending'"
      class="flex flex-col sm:flex-row gap-3 no-share-item"
    >
      <!-- Convertir a venta -->
      <button
        @click="confirmConvertToSale"
        :disabled="converting || !quote.items || quote.items.length === 0"
        class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-[1.02] transition-all duration-200"
      >
        <span v-if="!converting" class="flex items-center justify-center gap-2">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Convertir a Venta
        </span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Convirtiendo...
        </span>
      </button>

      <!-- Cancelar cotización -->
      <button
        @click="confirmCancelQuote"
        :disabled="cancelling"
        class="flex-1 sm:flex-none bg-white border-2 border-red-200 text-red-600 px-6 py-4 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
      >
        <span v-if="!cancelling" class="flex items-center justify-center gap-2">
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
          Cancelar
        </span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cancelando...
        </span>
      </button>
    </div>

    <!-- Estado de cotización convertida o cancelada -->
    <div
      v-else-if="quote && quote.status !== 'pending'"
      class="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center no-share-item"
    >
      <p class="text-sm text-gray-600">
        <span
          v-if="quote.status === 'converted'"
          class="text-green-600 font-semibold"
        >
          Esta cotización ya fue convertida en venta
        </span>
        <span
          v-else-if="quote.status === 'cancelled'"
          class="text-red-600 font-semibold"
        >
          Esta cotización fue cancelada
        </span>
        <span
          v-else-if="quote.status === 'expired'"
          class="text-gray-600 font-semibold"
        >
          Esta cotización expiró
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Package, Bookmark } from "@iconoir/vue";
import { useQuotes } from "@/composables/useQuotes";
import { useBusinessStore } from "@/stores/businessStore";
import { useToast } from "@/composables/useToast";
import ShareButtonCloud from "@/components/ShareButtonCloud.vue";
import CloseBtn from "@/components/ui/CloseBtn.vue";

const route = useRoute();
const router = useRouter();
const businessStore = useBusinessStore();
const { success, error: showError } = useToast();

const {
  getQuoteById,
  cancelQuote: cancelQuoteComposable,
  convertQuoteToSale,
} = useQuotes();

// State
const quote = ref(null);
const loading = ref(true);
const error = ref(null);
const converting = ref(false);
const cancelling = ref(false);
const businessId = ref(null);
const expirationDays = ref(30);
const captureTarget = ref(null);

// CloseBtn config
const closeBtnConfig = {
  position: "static",
};

onMounted(async () => {
  businessId.value = businessStore.currentBusinessId || route.params.businessId;
  await loadQuote();
});

async function loadQuote() {
  try {
    loading.value = true;
    error.value = null;
    const quoteId = route.params.quoteId;
    quote.value = await getQuoteById(quoteId);
  } catch (err) {
    console.error("Error cargando cotización:", err);
    error.value = "No se pudo cargar la cotización";
  } finally {
    loading.value = false;
  }
}

const getShareFileName = () => {
  const date = formatDate(new Date());
  return `venta-${date.replace(/\s/g, "-").toLowerCase()}.png`;
};

function getClientInitials() {
  const name = quote.value?.client?.name;
  if (!name) return "?";
  const names = name.split(" ");
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getTotal() {
  if (!quote.value?.items) return 0;
  return quote.value.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

function formatExpirationDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
      badge: "bg-purple-600",
      bg: "bg-purple-50",
    },
    converted: {
      badge: "bg-green-600",
      bg: "bg-green-50",
    },
    cancelled: {
      badge: "bg-red-600",
      bg: "bg-red-50",
    },
    expired: {
      badge: "bg-gray-600",
      bg: "bg-gray-50",
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

async function confirmConvertToSale() {
  if (
    confirm(
      `¿Convertir la cotización ${quote.value.quoteNumber} en una venta?\n\nSe abrirá el flujo de venta con los datos precargados.`,
    )
  ) {
    try {
      converting.value = true;
      await convertQuoteToSale(quote.value.uuid);
      success("Cotización cargada. Completa el método de pago para finalizar.");

      // Navegar al flujo de transacciones
      router.push({
        name: "BasicAccountingRecordsBook",
        params: { businessId: businessId.value },
      });
    } catch (err) {
      console.error("Error convirtiendo cotización:", err);
      showError("Error al convertir la cotización");
    } finally {
      converting.value = false;
    }
  }
}

async function confirmCancelQuote() {
  if (
    confirm(
      `¿Estás seguro de cancelar la cotización ${quote.value.quoteNumber}?\n\nEsta acción no se puede deshacer.`,
    )
  ) {
    try {
      cancelling.value = true;
      await cancelQuoteComposable(quote.value.uuid);
      success("Cotización cancelada exitosamente");

      // Recargar datos
      await loadQuote();
    } catch (err) {
      console.error("Error cancelando cotización:", err);
      showError("Error al cancelar la cotización");
    } finally {
      cancelling.value = false;
    }
  }
}

function goBack() {
  router.back();
}
</script>

<style scoped>
/* Animaciones sutiles */
button {
  transition: all 0.2s ease;
}
</style>
