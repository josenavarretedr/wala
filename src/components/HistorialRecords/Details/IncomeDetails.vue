<template>
  <div class="space-y-6">
    <!-- Título mejorado con botón de compartir -->
    <div class="text-center space-y-2">
      <div class="flex items-center justify-center gap-3">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
          Resumen de Venta
        </h1>
      </div>
      <p class="text-sm text-gray-500">
        {{ formatDate(transactionData.createdAt) }}
      </p>
      <!-- Botón de Compartir -->
      <div
        class="share-button-container mt-6 pt-4 border-t border-gray-200 flex justify-end no-share-item"
      >
        <ShareButtonCloud
          v-if="targetRef"
          :targetRef="targetRef"
          :fileName="getShareFileName()"
          shareTitle="Comprobante de Venta"
          shareText="Negocio impulsado con wala.lat"
          componentType="income-details"
          variant="card"
          size="sm"
        />
      </div>
    </div>

    <!-- Preview de la transacción -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Total destacado con estado de pago y canal de venta -->
      <div
        v-if="transactionData.items && transactionData.items.length > 0"
        :class="[
          'text-white p-6 text-center',
          getPaymentStatus() === 'completed'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
            : 'bg-gradient-to-r from-orange-500 to-orange-600',
        ]"
      >
        <div class="text-3xl font-bold mb-1">
          S/ {{ getTotal().toFixed(2) }}
        </div>
        <div
          :class="[
            'text-sm',
            getPaymentStatus() === 'completed'
              ? 'text-blue-100'
              : 'text-orange-100',
          ]"
        >
          Total de la venta
        </div>
        
        <!-- Badges Row (Payment Status + Sales Channel) -->
        <div class="flex flex-wrap items-center justify-center gap-2 mt-4">
          <!-- Badge de Estado de Pago -->
          <span
            :class="[
              'inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/10',
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" v-if="getPaymentStatus() === 'completed'"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-yellow-300" v-else></span>
            {{
              getPaymentStatus() === "completed"
                ? "Pagado"
                : getPaymentStatus() === "partial"
                ? "Pago Parcial"
                : "Sin Pagar"
            }}
          </span>

          <!-- Badge de Canal de Venta -->
          <span
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/10"
          >
            <!-- Icono Local -->
            <svg v-if="transactionData.salesChannel === 'LOCAL'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <!-- Icono Takeaway -->
            <svg v-else-if="transactionData.salesChannel === 'TAKEAWAY'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <!-- Icono Delivery -->
            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            
            {{
              transactionData.salesChannel === "LOCAL" || !transactionData.salesChannel
                ? "En Local"
                : transactionData.salesChannel === "TAKEAWAY"
                ? "Para Llevar"
                : `Delivery - ${transactionData.deliveryPlatformName || transactionData.deliveryPlatform || 'Plataforma'}`
            }}
          </span>
        </div>
      </div>

      <!-- Información de tipo, cuenta y cliente -->
      <div
        v-if="
          transactionData.clientId &&
          transactionData.clientId !== 'anonymous-client'
        "
        class="p-4 border-b border-gray-100"
      >
        <h3
          class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
        >
          <User class="w-5 h-5 text-gray-600" />
          Cliente:
        </h3>
        <div class="grid gap-3 grid-cols-1">
          <!-- Cliente (solo si no es anónimo) -->
          <div
            class="bg-purple-50 rounded-xl p-4 text-center flex flex-row items-center justify-left"
          >
            <div class="font-medium text-purple-700 truncate px-1">
              {{ transactionData.clientName || "Sin nombre" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Datos de Delivery / Envío -->
      <div
        v-if="
          transactionData.salesChannel === 'DELIVERY' &&
          transactionData.deliveryAddress
        "
        class="p-4 border-b border-gray-100"
      >
        <h3
          class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
        >
          <MapPin class="w-5 h-5 text-gray-600" />
          Envío / Delivery:
        </h3>
        <div class="bg-blue-50 rounded-xl p-4 text-left flex flex-col gap-1 border border-blue-100">
          <div class="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Dirección de Entrega</div>
          <div class="text-sm font-semibold text-gray-850 leading-relaxed">
            {{ transactionData.deliveryAddress }}
          </div>
        </div>
      </div>

      <!-- Lista de productos -->
      <div
        v-if="transactionData.items && transactionData.items.length > 0"
        class="p-4"
      >
        <h3
          class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
        >
          <Package class="w-5 h-5 text-gray-600" />
          Productos
        </h3>

        <div class="space-y-3">
          <div
            v-for="item in transactionData.items"
            :key="item.uuid"
            class="bg-gray-50 rounded-xl p-4"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1 min-w-0 pr-3">
                <div class="font-semibold text-gray-900 truncate mb-1">
                  {{ item.description.trim().toUpperCase() }}
                </div>
                <div v-if="item.variantLabel" class="mb-1">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200"
                  >
                    {{ item.variantLabel }}
                  </span>
                </div>
                <div class="text-sm text-gray-600">
                  {{ item.quantity }} {{ item.unit || "uni" }} × S/
                  {{ item.price.toFixed(2) }}
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-gray-900">
                  S/ {{ (item.quantity * item.price).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen final y Desglose Financiero Premium -->
        <div class="mt-6 pt-4 border-t border-gray-200 space-y-3">
          <!-- Si no hay costos extra, mostrar solo el total simple de siempre -->
          <template v-if="!transactionData.packagingCost && !transactionData.platformCommissionAmount && !transactionData.deliveryCost">
            <div class="flex justify-between items-center">
              <div class="text-gray-600 font-medium">
                {{ transactionData.items.length }}
                producto{{ transactionData.items.length !== 1 ? "s" : "" }}
              </div>
              <div class="text-xl font-bold text-blue-600">
                S/ {{ getTotal().toFixed(2) }}
              </div>
            </div>
          </template>
          
          <!-- Si hay envases, comisión o delivery, mostrar desglose premium -->
          <template v-else>
            <div class="space-y-2.5 text-sm text-gray-600">
              <div class="flex justify-between items-center">
                <span>Subtotal Productos ({{ transactionData.items.length }} und)</span>
                <span class="font-medium text-gray-800">S/ {{ getItemsSubtotal().toFixed(2) }}</span>
              </div>
              
              <div v-if="getPackagingCost() > 0" class="flex justify-between items-center text-gray-600">
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  Costo de Envases
                </span>
                <span class="font-medium text-orange-600">+ S/ {{ getPackagingCost().toFixed(2) }}</span>
              </div>
              
              <div v-if="getDeliveryCost() > 0" class="flex justify-between items-center text-gray-600">
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Costo de Envío (WhatsApp Directo)
                </span>
                <span :class="['font-medium', transactionData.isDeliveryFree ? 'text-gray-400 line-through' : 'text-blue-600']">
                  + S/ {{ getDeliveryCost().toFixed(2) }}
                </span>
              </div>

              <!-- Delivery Gratis (Descuento) -->
              <div
                v-if="getDeliveryCost() > 0 && transactionData.isDeliveryFree"
                class="flex justify-between items-center text-orange-600 font-medium"
              >
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  Descuento Delivery Gratis
                </span>
                <span>- S/ {{ getDeliveryCost().toFixed(2) }}</span>
              </div>
              
              <div class="border-t border-dashed border-gray-200 my-2 pt-2 flex justify-between items-center text-base font-semibold text-gray-800">
                <span>Total Bruto Cobrado</span>
                <span class="text-gray-900">S/ {{ getTotal().toFixed(2) }}</span>
              </div>

              <div v-if="getPlatformCommission() > 0" class="flex justify-between items-center text-gray-600">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  Comisión de {{ transactionData.deliveryPlatformName || 'Plataforma' }}
                  <span class="text-[10px] text-gray-400" v-if="transactionData.platformCommissionPct">({{ transactionData.platformCommissionPct }}%)</span>
                </span>
                <span class="font-medium text-red-600">- S/ {{ getPlatformCommission().toFixed(2) }}</span>
              </div>

              <div class="border-t-2 border-double border-gray-200 pt-2.5 mt-2 flex justify-between items-center">
                <div class="font-bold text-gray-900 flex flex-col">
                  <span>Ingreso Neto Estimado</span>
                  <span class="text-[10px] text-gray-400 font-normal">Monto neto real tras deducir la comisión</span>
                </div>
                <div class="text-xl font-black text-emerald-600">
                  S/ {{ getNetIncome().toFixed(2) }}
                </div>
              </div>
            </div>
          </template>
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
          Agrega productos para ver el resumen
        </p>
      </div>
      <!-- Información de pago parcial o historial -->
      <div
        v-if="
          transactionData.items &&
          transactionData.items.length > 0 &&
          transactionData.payments &&
          transactionData.payments.length > 0 &&
          isOnePayment === false
        "
        :class="[
          'border-b p-4',
          getPaymentStatus() !== 'completed'
            ? 'bg-orange-50 border-orange-100'
            : 'bg-gray-50 border-gray-100',
        ]"
      >
        <h3
          class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
        >
          <TaskList class="w-5 h-5 text-gray-600" />
          Historial de Pagos:
        </h3>
        <!-- Resumen de pagos (solo si no está completado) -->
        <div
          v-if="getPaymentStatus() !== 'completed'"
          class="space-y-2 text-sm mb-4 pb-4 border-b border-orange-200"
        >
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Pagado:</span>
            <span class="font-semibold text-green-600">
              S/ {{ getTotalPaid().toFixed(2) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Saldo pendiente:</span>
            <span class="font-semibold text-red-600">
              S/ {{ getBalance().toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Historial de pagos (siempre que exista) -->
        <div>
          <h4 class="text-xs font-semibold text-gray-700 mb-2">Registros</h4>
          <div class="space-y-2">
            <div
              v-for="(payment, index) in transactionData.payments"
              :key="index"
              class="bg-white rounded-lg p-2"
            >
              <div class="flex justify-between items-center text-xs mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500"
                    >Pago {{ index + 1 }}
                    {{ index === 0 ? "(Inicial)" : "" }}</span
                  >
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-xs',
                      payment.method === 'cash'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700',
                    ]"
                  >
                    {{ payment.method === "cash" ? "Efectivo" : "Digital" }}
                  </span>
                </div>
                <span class="font-semibold text-gray-800">
                  S/ {{ payment.amount.toFixed(2) }}
                </span>
              </div>
              <!-- Fecha del pago -->
              <div
                v-if="getPaymentDate(payment, index)"
                class="flex items-center gap-1.5 text-xs text-gray-500"
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
                <span class="truncate">{{
                  getPaymentDate(payment, index)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Nota informativa -->
    <!-- <div
      v-if="transactionData.items && transactionData.items.length > 0"
      class="bg-blue-50 rounded-xl p-4 border border-blue-200"
    >
      <div class="flex items-start gap-3">
        <div
          class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        >
          <ShieldQuestion class="w-3 h-3 text-white" />
        </div>
        <div>
          <div class="font-medium text-blue-800 mb-1">Este registro no represe</div>
          <div class="text-sm text-blue-700">
            Este registro está guardado en tu historial de transacciones
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { computed } from "vue";
import ShareButton from "@/components/ShareButton.vue";
import ShareButtonCloud from "@/components/ShareButtonCloud.vue";
import { TaskList, Package, User, Coins, SmartphoneDevice, MapPin } from "@iconoir/vue";

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

const getTotal = () => {
  if (props.transactionData.amount !== undefined && props.transactionData.amount !== null) {
    return props.transactionData.amount;
  }
  if (
    !props.transactionData.items ||
    !Array.isArray(props.transactionData.items)
  ) {
    return 0;
  }
  return props.transactionData.items.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 0);
  }, 0);
};

const getItemsSubtotal = () => {
  if (
    !props.transactionData.items ||
    !Array.isArray(props.transactionData.items)
  ) {
    return 0;
  }
  return props.transactionData.items.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 0);
  }, 0);
};

const getPackagingCost = () => {
  return props.transactionData.packagingCost || 0;
};

const getPlatformCommission = () => {
  return props.transactionData.platformCommissionAmount || 0;
};

const getDeliveryCost = () => {
  return props.transactionData.deliveryCost || 0;
};

const getNetIncome = () => {
  return getTotal() - getPlatformCommission();
};

const getTypeLabel = computed(() => {
  const type = props.transactionData.type;
  const labels = {
    income: "Ingreso",
    expense: "Egreso",
    change: "Cambio",
  };
  return labels[type] || "Transacción";
});

const getAccountLabel = computed(() => {
  const account = props.transactionData.account;
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
  };
  return labels[account] || "Cuenta";
});

const getAccountIcon = computed(() => {
  const account = props.transactionData.account;
  return account === "cash" ? Coins : SmartphoneDevice;
});

const getPaymentStatus = () => {
  return props.transactionData.paymentStatus || "completed";
};

const getTotalPaid = () => {
  return props.transactionData.totalPaid || 0;
};

const isOnePayment = computed(() => {
  return (
    props.transactionData.payments &&
    props.transactionData.payments.length === 1 &&
    props.transactionData.payments[0].amount === getTotal()
  );
});

const getBalance = () => {
  return props.transactionData.balance || 0;
};

const getShareFileName = () => {
  const date = formatDate(props.transactionData.createdAt);
  return `venta-${date.replace(/\s/g, "-").toLowerCase()}.png`;
};

const getPaymentDate = (payment, index) => {
  console.log(`🔍 Payment ${index}:`, {
    hasDate: !!payment.date,
    date: payment.date,
    isFirstPayment: index === 0,
    hasCreatedAt: !!props.transactionData.createdAt,
    createdAt: props.transactionData.createdAt,
  });

  // Si el pago tiene fecha, usarla
  if (payment.date) {
    const formatted = formatDate(payment.date);
    console.log(`✅ Payment ${index} formatted:`, formatted);
    return formatted;
  }

  // Si es el primer pago y no tiene fecha, usar createdAt de la transacción
  if (index === 0 && props.transactionData.createdAt) {
    const formatted = formatDate(props.transactionData.createdAt);
    console.log(`✅ Payment ${index} usando createdAt:`, formatted);
    return formatted;
  }

  console.log(`❌ Payment ${index} sin fecha`);
  return "";
};

const formatDate = (date) => {
  if (!date) return "";

  console.log("🔍 formatDate input:", date, typeof date);

  // Convertir Timestamp de Firebase a Date si es necesario
  let dateObj = date;

  // Caso 1: Tiene método toDate (Timestamp normal)
  if (date.toDate && typeof date.toDate === "function") {
    dateObj = date.toDate();
  }
  // Caso 2: Tiene seconds (Timestamp serializado o Proxy)
  else if (date.seconds !== undefined) {
    dateObj = new Date(date.seconds * 1000);
  }
  // Caso 3: Ya es Date
  else if (date instanceof Date) {
    dateObj = date;
  }
  // Caso 4: String o número
  else {
    dateObj = new Date(date);
  }

  console.log("📅 dateObj:", dateObj);

  // Validar que sea una fecha válida
  if (isNaN(dateObj.getTime())) {
    console.log("❌ Invalid date");
    return "";
  }

  const formatted = new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);

  console.log("✅ Formatted:", formatted);

  return formatted;
};
</script>
