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
        v-if="hasValidData"
        class="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 text-center"
      >
        <div class="text-3xl font-bold mb-1">
          S/ {{ getTotalAmount().toFixed(2) }}
        </div>
        <div class="text-red-100 text-sm">Total del gasto</div>
      </div>

      <!-- Información de tipo y cuenta -->
      <div v-if="hasValidData" class="p-4 border-b border-gray-100">
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
      <div v-if="hasValidData" class="p-4">
        <!-- ========================================== -->
        <!-- VISTA PARA MATERIALS (Compra de Materiales) -->
        <!-- ========================================== -->
        <div v-if="isMaterialsExpense">
          <h3
            class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
          >
            <Package class="w-5 h-5 text-gray-600" />
            Materiales
          </h3>

          <div class="space-y-3">
            <!-- Lista de materiales -->
            <div
              v-for="material in props.transactionData.materialItems"
              :key="material.uuid"
              class="bg-gray-50 rounded-xl p-4"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0 pr-3">
                  <div class="font-semibold text-gray-900 truncate mb-1">
                    {{ material.description.trim().toUpperCase() }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ material.quantity }} {{ material.unit || "uni" }} × S/
                    {{ material.cost.toFixed(2) }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-gray-900">
                    S/ {{ (material.quantity * material.cost).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen final de materials -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex justify-between items-center">
              <div class="text-gray-600">
                {{ props.transactionData.materialItems.length }}
                material{{
                  props.transactionData.materialItems.length !== 1 ? "es" : ""
                }}
              </div>
              <div class="text-xl font-bold text-red-600">
                S/ {{ getTotalAmount().toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Notas para materials -->
          <div
            v-if="props.transactionData.notes"
            class="mt-4 pt-4 border-t border-gray-200"
          >
            <div class="text-sm font-medium text-gray-700 mb-1">Notas</div>
            <div class="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
              {{ props.transactionData.notes }}
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- VISTA PARA LABOR/OVERHEAD (Gastos Simples) -->
        <!-- ========================================== -->
        <div v-else>
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
                <div class="text-sm font-medium text-red-700 mb-1">
                  Categoría
                </div>
                <div class="flex items-center gap-2">
                  <component
                    :is="getCategoryIcon"
                    class="w-4 h-4 text-red-600"
                  />
                  <span class="font-medium text-red-800">
                    {{ getCategoryLabel(props.transactionData.category) }}
                  </span>
                </div>
              </div>

              <!-- Notas -->
              <div v-if="props.transactionData.notes">
                <div class="text-sm font-medium text-red-700 mb-1">Notas</div>
                <div class="text-sm text-red-800 italic">
                  {{ props.transactionData.notes }}
                </div>
              </div>
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
        <h3 class="font-semibold text-gray-600 mb-1">
          No hay información del gasto
        </h3>
        <p class="text-sm text-gray-500">
          Los detalles del gasto no están disponibles
        </p>
      </div>
    </div>

    <!-- Botones de acción o información adicional -->
    <div
      v-if="hasValidData"
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
            Registro de gasto{{ isMaterialsExpense ? " de materiales" : "" }}
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
import {
  DatabaseExport,
  ShieldQuestion,
  Coins,
  CreditCard,
  Package,
  User,
  Settings,
  SmartphoneDevice,
} from "@iconoir/vue";

const props = defineProps({
  transactionData: {
    type: Object,
    required: true,
  },
});

// ========================================
// COMPUTED PROPERTIES
// ========================================

/**
 * Verifica si es un expense de tipo materials
 */
const isMaterialsExpense = computed(() => {
  return props.transactionData.category === "materials";
});

/**
 * Verifica si hay datos válidos para mostrar
 */
const hasValidData = computed(() => {
  // Para materials: validar que haya materialItems
  if (isMaterialsExpense.value) {
    return (
      props.transactionData.materialItems &&
      Array.isArray(props.transactionData.materialItems) &&
      props.transactionData.materialItems.length > 0
    );
  }

  // Para labor/overhead: validar description y amount
  return props.transactionData.description && props.transactionData.amount;
});

/**
 * Calcula el total del gasto
 */
const getTotalAmount = () => {
  // Para materials: sumar todos los items
  if (isMaterialsExpense.value && props.transactionData.materialItems) {
    return props.transactionData.materialItems.reduce((sum, material) => {
      return sum + (material.cost || 0) * (material.quantity || 0);
    }, 0);
  }

  // Para labor/overhead: usar el amount directo
  return props.transactionData.amount || 0;
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Función para formatear fecha
const formatDate = (date) => {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Computed para obtener la etiqueta del tipo de transacción
const getTypeLabel = computed(() => {
  const type = props.transactionData.type;
  const labels = {
    income: "Ingreso",
    expense: "Gasto",
    change: "Transferencia",
  };
  return labels[type] || "Transacción";
});

// Computed para obtener la etiqueta de la cuenta
const getAccountLabel = computed(() => {
  const account = props.transactionData.account;
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
  };
  return labels[account] || "No especificado";
});

// Computed para obtener el ícono de la cuenta
const getAccountIcon = computed(() => {
  const account = props.transactionData.account;
  return account === "cash" ? Coins : SmartphoneDevice;
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
  const category = props.transactionData.category;
  const icons = {
    materials: Package,
    labor: User,
    overhead: Settings,
  };
  return icons[category] || Package;
});
</script>
