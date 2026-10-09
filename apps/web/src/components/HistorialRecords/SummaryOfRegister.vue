<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        {{ getTransactionTitle }}
      </h1>
      <p class="text-sm text-gray-500">
        {{ formatDate }}
      </p>
    </div>

    <!-- Detalle de la transacción -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Total destacado -->
      <div
        class="p-6 text-center"
        :class="
          oneTransactionData.type === 'income'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
            : 'bg-gradient-to-r from-red-500 to-red-600'
        "
      >
        <div class="text-3xl font-bold mb-1 text-white">
          S/ {{ oneTransactionData.total }}
        </div>
        <div class="text-sm opacity-90 text-white">
          {{ getTransactionSubtitle }}
        </div>
      </div>

      <!-- Información de tipo y cuenta -->
      <div class="p-4 border-b border-gray-100">
        <div class="grid grid-cols-2 gap-3">
          <!-- Tipo de transacción -->
          <div :class="getTypeCardClass">
            <div
              class="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
              :class="getTypeIconBgClass"
            >
              <component :is="getTypeIcon" class="w-4 h-4 text-white" />
            </div>
            <div class="text-sm font-medium" :class="getTypeTextClass">
              {{ getTypeLabel }}
            </div>
          </div>

          <!-- Método de pago -->
          <div :class="getAccountCardClass">
            <div
              class="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
              :class="getAccountIconBgClass"
            >
              <component :is="getAccountIcon" class="w-4 h-4 text-white" />
            </div>
            <div class="text-sm font-medium" :class="getAccountTextClass">
              {{ getAccountLabel }}
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido según tipo de transacción -->
      <div class="p-4">
        <!-- Lista de productos para ingresos -->
        <div
          v-if="
            oneTransactionData.type === 'income' &&
            oneTransactionData.items &&
            oneTransactionData.items.length > 0
          "
        >
          <h3
            class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
          >
            <Package class="w-5 h-5 text-gray-600" />
            Productos
          </h3>

          <div class="space-y-3">
            <div
              v-for="item in oneTransactionData.items"
              :key="item.uuid"
              class="bg-gray-50 rounded-xl p-4"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0 pr-3">
                  <div class="font-semibold text-gray-900 truncate mb-1">
                    {{ item.description }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ item.quantity }} {{ item.unit || "uni" }} × S/
                    {{ item.price.toFixed(2) }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-gray-900">
                    S/ {{ (item.price * item.quantity).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen final -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex justify-between items-center">
              <div class="text-gray-600">
                {{ oneTransactionData.items.length }} producto{{
                  oneTransactionData.items.length !== 1 ? "s" : ""
                }}
              </div>
              <div class="text-xl font-bold text-green-600">
                S/ {{ oneTransactionData.total }}
              </div>
            </div>
          </div>
        </div>

        <!-- Descripción para otros tipos o ventas sin productos -->
        <div v-else>
          <h3
            class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
          >
            <Page class="w-5 h-5 text-gray-600" />
            Descripción
          </h3>

          <div class="bg-gray-50 rounded-xl p-4">
            <div class="text-gray-900 font-medium">
              {{
                oneTransactionData.description || "Sin descripción disponible"
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import {
  GraphUp,
  DatabaseExport,
  Coins,
  SmartphoneDevice,
  Package,
  Page,
  ShieldQuestion,
} from "@iconoir/vue";
import { useRoute } from "vue-router";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const route = useRoute();
const transactionStore = useTransactionStore();

const oneTransactionData = ref({});

// Computed properties para labels y estilos
const getTransactionTitle = computed(() => {
  return oneTransactionData.value.type === "income"
    ? "Detalle de Venta"
    : "Detalle de Gasto";
});

const getTransactionSubtitle = computed(() => {
  return oneTransactionData.value.type === "income"
    ? "Total de la venta"
    : "Total del gasto";
});

const getTypeLabel = computed(() => {
  const type = oneTransactionData.value.type;
  const labels = {
    income: "Ingreso",
    expense: "Egreso",
    change: "Cambio",
  };
  return labels[type] || "Transacción";
});

const getAccountLabel = computed(() => {
  const account = oneTransactionData.value.account;
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
  };
  return labels[account] || "Cuenta";
});

const getTypeIcon = computed(() => {
  return oneTransactionData.value.type === "income" ? GraphUp : DatabaseExport;
});

const getAccountIcon = computed(() => {
  return oneTransactionData.value.account === "cash" ? Coins : SmartphoneDevice;
});

const getTypeCardClass = computed(() => {
  return oneTransactionData.value.type === "income"
    ? "bg-green-50 rounded-xl p-4 text-center"
    : "bg-red-50 rounded-xl p-4 text-center";
});

const getAccountCardClass = computed(() => {
  return oneTransactionData.value.account === "cash"
    ? "bg-blue-50 rounded-xl p-4 text-center"
    : "bg-purple-50 rounded-xl p-4 text-center";
});

const getTypeIconBgClass = computed(() => {
  return oneTransactionData.value.type === "income"
    ? "bg-green-500"
    : "bg-red-500";
});

const getAccountIconBgClass = computed(() => {
  return oneTransactionData.value.account === "cash"
    ? "bg-blue-500"
    : "bg-purple-500";
});

const getTypeTextClass = computed(() => {
  return oneTransactionData.value.type === "income"
    ? "text-green-700"
    : "text-red-700";
});

const getAccountTextClass = computed(() => {
  return oneTransactionData.value.account === "cash"
    ? "text-blue-700"
    : "text-purple-700";
});

const formatDate = computed(() => {
  const date = oneTransactionData.value.createdAt;
  if (!date) return "Fecha no disponible";

  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return "Fecha no válida";
    }

    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  } catch (error) {
    console.warn("Error formateando fecha:", error);
    return "Fecha no disponible";
  }
});

async function getOneTransactionDataByIDCmp() {
  oneTransactionData.value = transactionStore.getOneTransactionDataByID(
    route.params.registerId
  )[0];
}

await getOneTransactionDataByIDCmp();
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
