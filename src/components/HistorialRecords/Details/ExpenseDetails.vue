<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Resumen del Gasto
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
        v-if="props.transactionData.description && props.transactionData.amount"
        class="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 text-center"
      >
        <div class="text-3xl font-bold mb-1">
          S/ {{ props.transactionData.amount.toFixed(2) }}
        </div>
        <div class="text-red-100 text-sm">Total del gasto</div>
      </div>

      <!-- Información de tipo y cuenta -->
      <div
        v-if="props.transactionData.description && props.transactionData.amount"
        class="p-4 border-b border-gray-100"
      >
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-red-50 rounded-xl p-4 text-center">
            <div
              class="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center"
            >
              <DatabaseExport class="w-4 h-4 text-white" />
            </div>
            <div class="text-sm font-medium text-red-700">
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

      <!-- Detalles del gasto -->
      <div
        v-if="props.transactionData.description && props.transactionData.amount"
        class="p-4"
      >
        <h3
          class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
        >
          <DatabaseExport class="w-5 h-5 text-gray-600" />
          Detalles del Gasto
        </h3>

        <!-- Información principal del gasto -->
        <div class="bg-red-50 rounded-xl p-4 mb-4">
          <div class="space-y-3">
            <!-- Descripción -->
            <div>
              <div class="text-sm font-medium text-red-700 mb-1">
                Descripción
              </div>
              <div class="font-semibold text-red-900">
                {{ props.transactionData.description }}
              </div>
            </div>

            <!-- Categoría -->
            <div v-if="props.transactionData.category">
              <div class="text-sm font-medium text-red-700 mb-1">Categoría</div>
              <div class="flex items-center gap-2">
                <component :is="getCategoryIcon" class="w-4 h-4 text-red-600" />
                <span class="font-medium text-red-800">
                  {{ getCategoryLabel(props.transactionData.category) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado sin datos -->
      <div v-else class="p-8 text-center text-gray-500">
        <DatabaseExport class="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p class="text-lg font-medium mb-1">No hay información del gasto</p>
        <p class="text-sm">
          Completa los detalles en el paso anterior para ver el resumen
        </p>
      </div>
    </div>

    <!-- Botones de acción o información adicional -->
    <div
      v-if="props.transactionData.description && props.transactionData.amount"
      class="bg-blue-50 rounded-xl p-4 border border-blue-200"
    >
      <div class="flex items-start gap-3">
        <div
          class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        >
          <ShieldQuestion class="w-4 h-4 text-white" />
        </div>
        <div class="flex-1">
          <div class="font-semibold text-blue-800 mb-1">
            Transacción guardada
          </div>
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
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import {
  DatabaseExport,
  ShieldQuestion,
  Coins,
  CreditCard,
  Package,
  User,
  Settings,
} from "@iconoir/vue";

const transactionStore = useTransactionStore();

const props = defineProps({
  transactionData: {
    type: Object,
    required: true,
  },
});

// Función para formatear fecha
const formatDate = (date) => {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

// Computed para obtener la etiqueta del tipo de transacción
const getTypeLabel = computed(() => {
  const type = transactionStore.transactionToAdd.value.type;
  const labels = {
    income: "Ingreso",
    expense: "Gasto",
    change: "Transferencia",
  };
  return labels[type] || "Transacción";
});

// Computed para obtener la etiqueta de la cuenta
const getAccountLabel = computed(() => {
  const account = transactionStore.transactionToAdd.value.account;
  const labels = {
    cash: "Efectivo",
    bank: "Banco",
  };
  return labels[account] || "No especificado";
});

// Computed para obtener el ícono de la cuenta
const getAccountIcon = computed(() => {
  const account = transactionStore.transactionToAdd.value.account;
  return account === "cash" ? Coins : CreditCard;
});

// Función para obtener la etiqueta de la categoría
const getCategoryLabel = (category) => {
  const labels = {
    materials: "Costos de materiales",
    labor: "Costos de personal",
    overhead: "Gastos indirectos",
  };
  return labels[category] || category;
};

// Computed para obtener el ícono de la categoría
const getCategoryIcon = computed(() => {
  const category = transactionStore.transactionToAdd.value.category;
  const icons = {
    materials: Package,
    labor: User,
    overhead: Settings,
  };
  return icons[category] || Package;
});
</script>
