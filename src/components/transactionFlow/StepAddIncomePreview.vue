<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Resumen de Venta
      </h1>
      <p class="text-sm text-gray-500">
        {{ formatDate(new Date()) }}
      </p>
    </div>

    <!-- Preview de la transacción -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Total destacado con estado de pago -->
      <div
        v-if="transactionStore.transactionToAdd.value.items.length > 0"
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
            Pago Parcial
          </span>
        </div>
      </div>

      <!-- Información de pago parcial o historial -->
      <div
        v-if="
          transactionStore.transactionToAdd.value.items.length > 0 &&
          transactionStore.transactionToAdd.value.payments &&
          transactionStore.transactionToAdd.value.payments.length > 0
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
            <span class="text-gray-600">Abono inicial:</span>
            <span class="font-semibold text-orange-600">
              S/ {{ getInitialPayment().toFixed(2) }}
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
            {{
              getPaymentStatus() === "completed"
                ? "Resumen de pagos"
                : "Pagos registrados"
            }}
          </h4>
          <div class="space-y-2">
            <div
              v-for="(payment, index) in transactionStore.transactionToAdd.value
                .payments"
              :key="index"
              class="flex justify-between items-center text-xs bg-white rounded-lg p-2"
            >
              <div class="flex items-center gap-2">
                <span class="text-gray-500"
                  >Pago {{ index + 1 }}
                  {{ index === 0 ? "(Inicial)" : "" }}</span
                >
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-xs',
                    payment.account === 'cash'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700',
                  ]"
                >
                  {{ payment.account === "cash" ? "Efectivo" : "Digital" }}
                </span>
              </div>
              <span class="font-semibold text-gray-800">
                S/ {{ payment.amount.toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Información de tipo, cuenta y cliente -->
      <div
        v-if="transactionStore.transactionToAdd.value.items.length > 0"
        class="p-4 border-b border-gray-100"
      >
        <div
          :class="[
            'grid gap-3',
            transactionStore.transactionToAdd.value.clientId &&
            transactionStore.transactionToAdd.value.clientId !==
              'anonymous-client'
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
              transactionStore.transactionToAdd.value.clientId &&
              transactionStore.transactionToAdd.value.clientId !==
                'anonymous-client'
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
              {{
                transactionStore.transactionToAdd.value.clientName ||
                "Sin nombre"
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de productos -->
      <div
        v-if="transactionStore.transactionToAdd.value.items.length > 0"
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
            v-for="item in transactionStore.transactionToAdd.value.items"
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
              {{ transactionStore.transactionToAdd.value.items.length }}
              producto{{
                transactionStore.transactionToAdd.value.items.length !== 1
                  ? "s"
                  : ""
              }}
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
      v-if="transactionStore.transactionToAdd.value.items.length > 0"
      class="bg-blue-50 rounded-xl p-4 border border-blue-200"
    >
      <div class="flex items-start gap-3">
        <div
          class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        >
          <ShieldQuestion class="w-3 h-3 text-white" />
        </div>
        <div>
          <div class="font-medium text-blue-800 mb-1">Confirma los datos</div>
          <div class="text-sm text-blue-700">
            Revisa que toda la información sea correcta antes de continuar
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
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const transactionStore = useTransactionStore();

const getTotal = () => {
  return transactionStore.transactionToAdd.value.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
};

const getTypeLabel = computed(() => {
  const type = transactionStore.transactionToAdd.value.type;
  const labels = {
    income: "Ingreso",
    expense: "Egreso",
    change: "Cambio",
  };
  return labels[type] || "Transacción";
});

const getAccountLabel = computed(() => {
  const account = transactionStore.transactionToAdd.value.account;
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
  };
  return labels[account] || "Cuenta";
});

const getAccountIcon = computed(() => {
  const account = transactionStore.transactionToAdd.value.account;
  return account === "cash" ? Coins : SmartphoneDevice;
});

const getPaymentStatus = () => {
  return transactionStore.transactionToAdd.value.paymentStatus || "completed";
};

const getInitialPayment = () => {
  const payments = transactionStore.transactionToAdd.value.payments;
  if (payments && payments.length > 0) {
    return payments[0].amount || 0;
  }
  return 0;
};

const getBalance = () => {
  return transactionStore.transactionToAdd.value.balance || 0;
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
</script>

<style scoped>
/* Prevent zoom on iOS */
@media screen and (max-width: 480px) {
  input,
  select,
  textarea {
    font-size: 16px;
  }
}
</style>
