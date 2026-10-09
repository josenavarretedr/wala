<template>
  <div class="space-y-6">
    <!-- Encabezado con título dinámico y botón de compartir -->
    <div class="text-center space-y-2">
      <div class="flex items-center justify-center gap-3">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
          {{ headerTitle }}
        </h1>
      </div>
      <p class="text-sm text-gray-500">
        {{ formatDate(transactionData.createdAt || transactionData.date) }}
      </p>

      <!-- Botón de Compartir -->
      <div
        class="share-button-container mt-4 pt-4 border-t border-gray-100 flex justify-end no-share-item"
      >
        <ShareButtonCloud
          v-if="targetRef"
          :targetRef="targetRef"
          :fileName="getShareFileName()"
          :shareTitle="headerTitle"
          shareText="Comprobante generado con wala.lat"
          componentType="payment-details"
          variant="card"
          size="sm"
        />
      </div>
    </div>

    <!-- Tarjeta Principal de Transacción de Pago -->
    <div
      class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Hero de Monto Destacado con Gradiente y Badges -->
      <div
        :class="[
          'text-white p-6 sm:p-7 text-center transition-colors',
          heroGradientClasses,
        ]"
      >
        <div class="text-3xl sm:text-4xl font-extrabold mb-1.5 tracking-tight">
          S/ {{ (transactionData.amount || 0).toFixed(2) }}
        </div>
        <div class="text-white/90 text-sm font-medium">
          {{ heroSubtitle }}
        </div>

        <!-- Badges de Estado y Flujo -->
        <div class="flex flex-wrap items-center justify-center gap-2 mt-4">
          <!-- Badge de Flujo de Dinero -->
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/10"
          >
            <component :is="flowIcon" class="w-3.5 h-3.5" />
            {{ isExpenseFlow ? "Egreso de Dinero" : "Ingreso de Dinero" }}
          </span>

          <!-- Badge de Estado de Liquidación -->
          <span
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border',
              isFullySettled
                ? 'bg-emerald-400/30 text-white border-emerald-300/40'
                : 'bg-amber-400/30 text-white border-amber-300/40',
            ]"
          >
            <span
              :class="[
                'w-1.5 h-1.5 rounded-full',
                isFullySettled ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300',
              ]"
            ></span>
            {{ isFullySettled ? "Deuda Liquidada (100%)" : "Abono Parcial" }}
          </span>

          <!-- Badge de Acopio si aplica -->
          <span
            v-if="isAcopio"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-400/30 text-white border border-teal-300/40"
          >
            <span class="text-xs">🌾</span>
            Acopio
          </span>
        </div>
      </div>

      <!-- Sección de Cuenta Afectada (Método de Pago) -->
      <div class="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                isCashAccount
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-purple-100 text-purple-700',
              ]"
            >
              <component :is="accountIcon" class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs font-bold uppercase tracking-wider text-gray-500">
                Cuenta de Dinero Afectada
              </div>
              <div class="text-base font-bold text-gray-800">
                {{ accountLabel }}
              </div>
            </div>
          </div>

          <div class="text-right">
            <span
              :class="[
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold',
                isExpenseFlow
                  ? 'bg-red-100 text-red-700'
                  : 'bg-emerald-100 text-emerald-700',
              ]"
            >
              <component
                :is="isExpenseFlow ? ArrowUpRight : ArrowDownLeft"
                class="w-3.5 h-3.5"
              />
              {{ isExpenseFlow ? "- Débito" : "+ Crédito" }}
            </span>
          </div>
        </div>
      </div>

      <!-- Persona / Entidad Involucrada (Socio, Proveedor o Cliente) -->
      <div
        v-if="entityName && entityName !== 'anonymous-client'"
        class="p-4 sm:p-5 border-b border-gray-100"
      >
        <div class="flex items-start gap-3">
          <div
            :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              isAcopio
                ? 'bg-teal-100 text-teal-700'
                : isExpenseFlow
                ? 'bg-orange-100 text-orange-700'
                : 'bg-blue-100 text-blue-700',
            ]"
          >
            <User class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-bold uppercase tracking-wider text-gray-500">
              {{ entityTitle }}
            </div>
            <div class="text-base font-bold text-gray-900 truncate">
              {{ entityName }}
            </div>
            <div
              v-if="isAcopio"
              class="text-xs text-teal-700 font-medium mt-0.5"
            >
              Socio registrado en el padrón de acopios
            </div>
          </div>
        </div>
      </div>

      <!-- Detalle de Productos / Operación (Reutilizable para Acopio, Compras y Ventas) -->
      <div class="p-4 sm:p-5 border-b border-gray-100 space-y-4">
        <!-- Encabezado de la sección -->
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
            <Package class="w-4 h-4 text-gray-500" />
            {{ isAcopio ? "Detalle del Acopio" : isExpenseFlow ? "Detalle del Gasto / Compra" : "Detalle de la Venta" }}
          </h3>
          <span
            v-if="isRelatedLoading"
            class="text-xs text-gray-400 animate-pulse"
          >
            Cargando detalles...
          </span>
        </div>

        <!-- CASO 1: Es Acopio o Compra de Materiales -->
        <div v-if="materialItems.length > 0" class="space-y-3">
          <div
            v-for="(item, idx) in materialItems"
            :key="idx"
            class="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div class="flex justify-between items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="font-bold text-gray-900 text-sm sm:text-base uppercase tracking-tight">
                  {{ item.description || "Producto acopiado" }}
                </div>
                <div v-if="item.variantLabel" class="mt-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-100 text-violet-700">
                    {{ item.variantLabel }}
                  </span>
                </div>
                
                <!-- Métricas del producto acopiado -->
                <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200/70 text-xs">
                  <div>
                    <span class="text-gray-500 block">Cantidad Acopiada:</span>
                    <span class="font-bold text-gray-800 text-sm">
                      {{ item.quantity }} {{ item.unit || "uni" }}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-500 block">Precio Pactado:</span>
                    <span class="font-bold text-teal-700 text-sm">
                      S/ {{ (item.cost || 0).toFixed(2) }} <span class="text-xs font-normal text-gray-500">/ {{ item.unit || "uni" }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Total por Producto -->
              <div class="text-right shrink-0">
                <div class="text-xs text-gray-400 mb-0.5">Total Original</div>
                <div class="font-extrabold text-gray-900 text-base">
                  S/ {{ ((item.totalCost || (item.quantity * (item.cost || 0))) || 0).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CASO 2: Es Venta con items -->
        <div v-else-if="soldItems.length > 0" class="space-y-2">
          <div
            v-for="(item, idx) in soldItems"
            :key="idx"
            class="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex items-center justify-between"
          >
            <div class="flex-1 min-w-0 pr-3">
              <div class="font-semibold text-gray-900 text-sm truncate">
                {{ item.name || item.description }}
              </div>
              <div class="text-xs text-gray-500 mt-0.5">
                {{ item.quantity }} × S/ {{ (item.unitPrice || item.price || 0).toFixed(2) }}
              </div>
            </div>
            <div class="font-bold text-gray-900 text-sm">
              S/ {{ ((item.subtotal || (item.quantity * (item.unitPrice || item.price || 0))) || 0).toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- CASO 3: Gasto General (Labor, Overhead, Servicios o descripción directa) -->
        <div v-else-if="expenseDescription" class="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
          <div class="text-xs text-gray-500 font-medium">Concepto / Descripción:</div>
          <div class="font-bold text-gray-800 text-sm sm:text-base">
            {{ expenseDescription }}
          </div>
          <div v-if="expenseCategoryLabel" class="pt-2 flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-200/80 text-gray-700">
              Categoría: {{ expenseCategoryLabel }}
            </span>
          </div>
        </div>

        <!-- Estado de respaldo si no hay items detallados -->
        <div v-else class="bg-gray-50 rounded-xl p-4 text-center text-xs text-gray-500">
          Transacción original vinculada por un monto total de
          <span class="font-bold text-gray-700">S/ {{ originalTotalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Impacto en Saldos y Deuda -->
      <div
        v-if="
          transactionData.previousBalance !== undefined ||
          transactionData.newBalance !== undefined
        "
        class="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50"
      >
        <h4 class="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
          Impacto en el Saldo Pendiente
        </h4>
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <!-- Saldo Anterior -->
          <div class="bg-white rounded-xl p-3 text-center border border-gray-200 shadow-sm">
            <div class="text-[11px] font-medium text-gray-500 mb-1">
              Deuda Anterior
            </div>
            <div class="text-base sm:text-lg font-bold text-red-600 tabular-nums">
              S/ {{ (transactionData.previousBalance || 0).toFixed(2) }}
            </div>
          </div>

          <!-- Abono Realizado -->
          <div class="bg-white rounded-xl p-3 text-center border border-emerald-200 shadow-sm">
            <div class="text-[11px] font-medium text-gray-500 mb-1">
              Abono Actual
            </div>
            <div class="text-base sm:text-lg font-bold text-emerald-600 tabular-nums">
              - S/ {{ (transactionData.amount || 0).toFixed(2) }}
            </div>
          </div>

          <!-- Nuevo Saldo Restante -->
          <div
            :class="[
              'rounded-xl p-3 text-center border shadow-sm',
              isFullySettled
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-white border-gray-200',
            ]"
          >
            <div class="text-[11px] font-medium text-gray-500 mb-1">
              Saldo Restante
            </div>
            <div
              :class="[
                'text-base sm:text-lg font-bold tabular-nums',
                isFullySettled ? 'text-emerald-700' : 'text-red-600',
              ]"
            >
              S/ {{ (transactionData.newBalance || 0).toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Badge de Liquidación Completa -->
        <div
          v-if="isFullySettled"
          class="mt-3.5 flex items-center justify-center gap-2 p-2.5 bg-emerald-100/80 rounded-xl text-xs sm:text-sm font-semibold text-emerald-800"
        >
          <CheckCircle class="w-4 h-4 text-emerald-600" />
          <span>Operación completamente saldada / liquidada</span>
        </div>
      </div>

      <!-- Enlace y Botón a la Transacción Original -->
      <div
        v-if="transactionData.relatedTransactionId"
        class="bg-blue-50/70 border-b border-blue-100 p-4 sm:p-5"
      >
        <div class="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
          <div>
            <div class="font-bold text-blue-900 text-sm sm:text-base">
              {{ originalBannerTitle }}
            </div>
            <div class="text-xs text-blue-700 mt-0.5">
              Monto total pactado en la transacción original:
              <span class="font-bold">S/ {{ originalTotalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <router-link
            :to="{
              name: 'DetailsRecords',
              params: { registerId: transactionData.relatedTransactionId },
            }"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all no-share-item shrink-0"
          >
            <Eye class="w-4 h-4" />
            {{ originalButtonLabel }}
          </router-link>
        </div>
      </div>

      <!-- Notas del pago -->
      <div v-if="transactionData.notes" class="p-4 sm:p-5">
        <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
          <Notes class="w-4 h-4 text-gray-400" />
          Notas / Observaciones
        </h4>
        <div class="bg-gray-50 rounded-xl p-3.5 text-xs sm:text-sm text-gray-700 italic border border-gray-200">
          {{ transactionData.notes }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import ShareButtonCloud from "@/components/ShareButtonCloud.vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useBusinessStore } from "@/stores/businessStore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import {
  Coins,
  SmartphoneDevice,
  CreditCard,
  User,
  Package,
  Eye,
  CheckCircle,
  Notes,
  ArrowUpRight,
  ArrowDownLeft,
} from "@iconoir/vue";

const props = defineProps({
  transactionData: {
    type: Object,
    required: true,
  },
  targetRef: {
    type: Object,
    default: null,
  },
});

const transactionStore = useTransactionStore();
const businessStore = useBusinessStore();

const relatedTransaction = ref(null);
const isRelatedLoading = ref(false);

// Cargar la transacción original vinculada
const loadRelatedTransaction = async () => {
  const relId = props.transactionData?.relatedTransactionId;
  if (!relId) {
    relatedTransaction.value = null;
    return;
  }

  // 1. Si ya viene incrustada o en store
  const found = transactionStore.getOneTransactionDataByID(relId);
  if (found && found.length > 0) {
    relatedTransaction.value = found[0];
    return;
  }

  // 2. Si no está en memoria, consultar Firestore
  try {
    isRelatedLoading.value = true;
    const businessId =
      businessStore.getBusinessId || businessStore.business?.id;
    if (businessId) {
      const docRef = doc(db, `businesses/${businessId}/transactions`, relId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        relatedTransaction.value = { id: snap.id, ...snap.data() };
      }
    }
  } catch (error) {
    console.error("Error al cargar transacción original del pago:", error);
  } finally {
    isRelatedLoading.value = false;
  }
};

onMounted(() => {
  loadRelatedTransaction();
});

watch(
  () => props.transactionData?.relatedTransactionId,
  (newId) => {
    if (newId) {
      loadRelatedTransaction();
    }
  }
);

// Detección de tipo de origen
const isAcopio = computed(() => {
  if (props.transactionData.acopioId) return true;
  if (relatedTransaction.value?.acopioId) return true;

  const desc = (
    relatedTransaction.value?.description ||
    props.transactionData.description ||
    ""
  ).toLowerCase();
  if (desc.includes("acopio")) return true;

  if (
    relatedTransaction.value?.materialItems &&
    relatedTransaction.value.materialItems.some((i) => i.isAcopio)
  ) {
    return true;
  }

  return false;
});

const isIncome = computed(() => {
  if (relatedTransaction.value?.type === "income") return true;
  if (
    props.transactionData.clientId &&
    props.transactionData.clientId !== "anonymous-client"
  ) {
    return true;
  }
  return false;
});

const isExpenseFlow = computed(() => {
  if (isIncome.value) return false;
  return true;
});

// Título de la cabecera
const headerTitle = computed(() => {
  if (isAcopio.value) return "Detalle de Abono de Acopio";
  if (isExpenseFlow.value) return "Detalle de Pago a Proveedor";
  return "Detalle de Abono de Venta";
});

// Gradiente del Hero
const heroGradientClasses = computed(() => {
  if (isAcopio.value) {
    return "bg-gradient-to-br from-emerald-600 via-teal-600 to-teal-700";
  }
  if (isExpenseFlow.value) {
    return "bg-gradient-to-br from-rose-500 via-red-500 to-orange-600";
  }
  return "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700";
});

const heroSubtitle = computed(() => {
  if (isAcopio.value) return "Monto abonado por acopio de producto";
  if (isExpenseFlow.value) return "Monto pagado por compra o gasto";
  return "Monto cobrado por venta a crédito";
});

const flowIcon = computed(() => {
  return isExpenseFlow.value ? ArrowUpRight : ArrowDownLeft;
});

const isFullySettled = computed(() => {
  return props.transactionData.newBalance === 0;
});

// Cuenta afectada
const isCashAccount = computed(() => {
  return props.transactionData.account === "cash";
});

const accountLabel = computed(() => {
  const account = props.transactionData.account;
  const labels = {
    cash: "Efectivo / Caja",
    bank: "Banco / Digital (Yape/Plin)",
    yape: "Yape",
    plin: "Plin",
  };
  return labels[account] || "Efectivo / Caja";
});

const accountIcon = computed(() => {
  const account = props.transactionData.account;
  if (account === "cash") return Coins;
  if (account === "yape" || account === "plin") return SmartphoneDevice;
  return CreditCard;
});

// Entidad involucrada
const entityTitle = computed(() => {
  if (isAcopio.value) return "Socio Productor:";
  if (isExpenseFlow.value) return "Proveedor / Beneficiario:";
  return "Cliente:";
});

const entityName = computed(() => {
  if (isExpenseFlow.value) {
    return (
      props.transactionData.supplierName ||
      relatedTransaction.value?.supplierName ||
      null
    );
  }
  return (
    props.transactionData.clientName ||
    relatedTransaction.value?.clientName ||
    null
  );
});

// Items y descripción
const materialItems = computed(() => {
  return (
    relatedTransaction.value?.materialItems ||
    props.transactionData.materialItems ||
    []
  );
});

const soldItems = computed(() => {
  return relatedTransaction.value?.items || props.transactionData.items || [];
});

const expenseDescription = computed(() => {
  return (
    relatedTransaction.value?.description ||
    props.transactionData.description ||
    null
  );
});

const expenseCategoryLabel = computed(() => {
  const cat =
    relatedTransaction.value?.category || props.transactionData.category;
  const labels = {
    materials: "Compra de Materiales",
    labor: "Mano de Obra",
    overhead: "Costos Fijos / Operativos",
  };
  return labels[cat] || cat;
});

const originalTotalAmount = computed(() => {
  return (
    props.transactionData.relatedTransactionTotal ||
    relatedTransaction.value?.total ||
    relatedTransaction.value?.amount ||
    0
  );
});

const originalBannerTitle = computed(() => {
  if (isAcopio.value) return "Vinculado al Acopio Original";
  if (isExpenseFlow.value) return "Vinculado al Gasto / Compra Original";
  return "Vinculado a la Venta Original";
});

const originalButtonLabel = computed(() => {
  if (isAcopio.value) return "Ver acopio original";
  if (isExpenseFlow.value) return "Ver gasto original";
  return "Ver venta original";
});

// Formato de fecha
const formatDate = (date) => {
  if (!date) return "";
  let dateObj = date;

  if (date.toDate && typeof date.toDate === "function") {
    dateObj = date.toDate();
  } else if (date.seconds !== undefined) {
    dateObj = new Date(date.seconds * 1000);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) return "";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};

const getShareFileName = () => {
  const dateStr = formatDate(props.transactionData.createdAt || new Date());
  const typeTag = isAcopio.value ? "acopio" : isExpenseFlow.value ? "pago-gasto" : "abono-venta";
  return `${typeTag}-${dateStr.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.png`;
};
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
