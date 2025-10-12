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
      <!-- Total destacado -->
      <div
        v-if="transactionStore.transactionToAdd.value.items.length > 0"
        class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 text-center"
      >
        <div class="text-3xl font-bold mb-1">
          S/ {{ getTotal().toFixed(2) }}
        </div>
        <div class="text-blue-100 text-sm">Total de la venta</div>
      </div>

      <!-- Información de tipo y cuenta -->
      <div
        v-if="transactionStore.transactionToAdd.value.items.length > 0"
        class="p-4 border-b border-gray-100"
      >
        <div class="grid grid-cols-2 gap-3">
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
