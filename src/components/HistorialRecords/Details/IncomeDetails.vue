<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Resumen de Venta
      </h1>
      <p class="text-sm text-gray-500">
        {{ formatDate(transactionData.createdAt) }}
      </p>
    </div>

    <!-- Preview de la transacción -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Total destacado con estado de pago -->
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
        <!-- Badge de estado de pago -->
        <div v-if="getPaymentStatus() !== 'completed'" class="mt-3">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm"
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{
              getPaymentStatus() === "partial" ? "Pago Parcial" : "Sin Pagar"
            }}
          </span>
        </div>
      </div>

      <!-- Información de pago parcial o historial -->
      <div
        v-if="
          transactionData.items &&
          transactionData.items.length > 0 &&
          transactionData.payments &&
          transactionData.payments.length > 0
        "
        :class="[
          'border-b p-4',
          getPaymentStatus() !== 'completed'
            ? 'bg-orange-50 border-orange-100'
            : 'bg-gray-50 border-gray-100',
        ]"
      >
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
          <h4 class="text-xs font-semibold text-gray-700 mb-2">
            Historial de pagos
          </h4>
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

      <!-- Información de tipo, cuenta y cliente -->
      <div
        v-if="transactionData.items && transactionData.items.length > 0"
        class="p-4 border-b border-gray-100"
      >
        <div
          :class="[
            'grid gap-3',
            transactionData.clientId &&
            transactionData.clientId !== 'anonymous-client'
              ? 'grid-cols-3'
              : 'grid-cols-2',
          ]"
        >
          <div class="bg-blue-50 rounded-xl p-4 text-center">
            <div
              class="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center"
            >
              <GraphUp class="w-4 h-4 text-white" />
            </div>
            <div class="text-sm font-medium text-blue-700">
              {{ getTypeLabel }}
            </div>
          </div>

          <div class="bg-green-50 rounded-xl p-4 text-center">
            <div
              class="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center"
            >
              <component :is="getAccountIcon" class="w-4 h-4 text-white" />
            </div>
            <div class="text-sm font-medium text-green-700">
              {{ getAccountLabel }}
            </div>
          </div>

          <!-- Cliente (solo si no es anónimo) -->
          <div
            v-if="
              transactionData.clientId &&
              transactionData.clientId !== 'anonymous-client'
            "
            class="bg-purple-50 rounded-xl p-4 text-center"
          >
            <div
              class="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-white"
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
            <div class="text-sm font-medium text-purple-700 truncate px-1">
              {{ transactionData.clientName || "Sin nombre" }}
            </div>
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

        <!-- Resumen final -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <div class="text-gray-600">
              {{ transactionData.items.length }}
              producto{{ transactionData.items.length !== 1 ? "s" : "" }}
            </div>
            <div class="text-xl font-bold text-blue-600">
              S/ {{ getTotal().toFixed(2) }}
            </div>
          </div>
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
    </div>

    <!-- Nota informativa -->
    <div
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
          <div class="font-medium text-blue-800 mb-1">Registro de ventas</div>
          <div class="text-sm text-blue-700">
            Este registro está guardado en tu historial de transacciones
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  GraphUp,
  Package,
  ShieldQuestion,
  Coins,
  SmartphoneDevice,
} from "@iconoir/vue";

const props = defineProps({
  transactionData: {
    type: Object,
    required: true,
  },
});

const getTotal = () => {
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

const getBalance = () => {
  return props.transactionData.balance || 0;
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
