<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Detalle del Pago
      </h1>
      <p class="text-sm text-gray-500">
        {{ formatDate(transactionData.createdAt) }}
      </p>
    </div>

    <!-- Preview de la transacción de pago -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Total destacado -->
      <div
        class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 text-center"
      >
        <div class="text-3xl font-bold mb-1">
          S/ {{ transactionData.amount?.toFixed(2) || "0.00" }}
        </div>
        <div class="text-green-100 text-sm">Monto del pago registrado</div>
      </div>

      <!-- Enlace a la venta original -->
      <div
        v-if="transactionData.relatedTransactionId"
        class="bg-blue-50 border-b border-blue-200 p-4"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div class="flex-1">
            <div class="font-semibold text-blue-800 mb-1">
              Pago asociado a una venta
            </div>
            <div class="text-sm text-blue-700 mb-2">
              Este pago está vinculado a la venta con total de S/
              {{
                transactionData.relatedTransactionTotal?.toFixed(2) || "0.00"
              }}
            </div>
            <router-link
              :to="{
                name: 'DetailsRecords',
                params: { registerId: transactionData.relatedTransactionId },
              }"
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
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
              Ver venta original
            </router-link>
          </div>
        </div>
      </div>

      <!-- Información de saldos -->
      <div
        v-if="
          transactionData.previousBalance !== undefined ||
          transactionData.newBalance !== undefined
        "
        class="bg-gray-50 border-b border-gray-100 p-4"
      >
        <h4 class="text-sm font-semibold text-gray-700 mb-3">
          Impacto en saldo
        </h4>
        <div class="grid grid-cols-3 gap-3">
          <!-- Saldo anterior -->
          <div
            class="bg-white rounded-lg p-3 text-center border border-gray-200"
          >
            <div class="text-xs text-gray-500 mb-1">Saldo anterior</div>
            <div class="text-lg font-bold text-red-600">
              S/ {{ transactionData.previousBalance?.toFixed(2) || "0.00" }}
            </div>
          </div>

          <!-- Pago realizado -->
          <div
            class="bg-white rounded-lg p-3 text-center border border-green-200"
          >
            <div class="text-xs text-gray-500 mb-1">Pago realizado</div>
            <div class="text-lg font-bold text-green-600">
              - S/ {{ transactionData.amount?.toFixed(2) || "0.00" }}
            </div>
          </div>

          <!-- Nuevo saldo -->
          <div
            :class="[
              'rounded-lg p-3 text-center border',
              transactionData.newBalance === 0
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200',
            ]"
          >
            <div class="text-xs text-gray-500 mb-1">Nuevo saldo</div>
            <div
              :class="[
                'text-lg font-bold',
                transactionData.newBalance === 0
                  ? 'text-green-600'
                  : 'text-red-600',
              ]"
            >
              S/ {{ transactionData.newBalance?.toFixed(2) || "0.00" }}
            </div>
          </div>
        </div>

        <!-- Badge de pago completado -->
        <div
          v-if="transactionData.newBalance === 0"
          class="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-green-700"
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Venta completamente pagada</span>
        </div>
      </div>

      <!-- Información de método de pago y cliente -->
      <div class="p-4 border-b border-gray-100">
        <div
          :class="[
            'grid gap-3',
            transactionData.clientId &&
            transactionData.clientId !== 'anonymous-client'
              ? 'grid-cols-2'
              : 'grid-cols-1',
          ]"
        >
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

      <!-- Notas del pago -->
      <div v-if="transactionData.notes" class="p-4">
        <h3
          class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
        >
          <svg
            class="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          Notas
        </h3>
        <div
          class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic border border-gray-200"
        >
          {{ transactionData.notes }}
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="!transactionData.amount" class="p-8 text-center">
        <div
          class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-6 h-6 text-gray-400"
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
        </div>
        <h3 class="font-semibold text-gray-600 mb-1">
          No hay información del pago
        </h3>
        <p class="text-sm text-gray-500">
          Los detalles del pago no están disponibles
        </p>
      </div>
    </div>

    <!-- Nota informativa -->
    <div class="bg-amber-50 rounded-xl p-4 border border-amber-200">
      <div class="flex items-start gap-3">
        <div
          class="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        >
          <ShieldQuestion class="w-4 h-4 text-white" />
        </div>
        <div class="flex-1">
          <div class="font-semibold text-amber-800 mb-1">
            Transacción de pago
          </div>
          <div class="text-sm text-amber-700 mb-3">
            Este pago fue registrado como abono a una venta anterior. Si
            eliminas esta transacción, el saldo pendiente de la venta aumentará
            nuevamente.
          </div>
          <div class="text-xs text-amber-600 italic">
            ⚠️ La eliminación solo afecta este pago, no la venta original
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ShieldQuestion, Coins, SmartphoneDevice } from "@iconoir/vue";

const props = defineProps({
  transactionData: {
    type: Object,
    required: true,
  },
});

// Computed para obtener la etiqueta de la cuenta
const getAccountLabel = computed(() => {
  const account = props.transactionData.account;
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
    yape: "Yape",
    plin: "Plin",
  };
  return labels[account] || "Método no especificado";
});

// Computed para obtener el ícono de la cuenta
const getAccountIcon = computed(() => {
  const account = props.transactionData.account;
  return account === "cash" ? Coins : SmartphoneDevice;
});

// Función para formatear fecha
const formatDate = (date) => {
  if (!date) return "";

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

  // Validar que sea una fecha válida
  if (isNaN(dateObj.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};
</script>
