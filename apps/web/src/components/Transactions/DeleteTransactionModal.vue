<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
      <!-- Header -->
      <div class="bg-red-50 px-6 py-4 border-b border-red-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <WarningTriangle class="w-5 h-5 text-red-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900">
              Eliminar {{ transactionTypeLabel }}
            </h3>
          </div>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-2 transition-colors"
          >
            <IconoirXmark class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
        <!-- Warning Message -->
        <div
          class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3"
        >
          <IconoirInfoCircle
            class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <p class="text-sm font-semibold text-amber-900 mb-1">
              Esta acción no se puede deshacer
            </p>
            <p class="text-sm text-amber-700">
              La transacción será eliminada permanentemente y se revertirán
              todos los cambios relacionados.
            </p>
          </div>
        </div>

        <!-- Transaction Details -->
        <!-- <div v-if="transaction" class="bg-gray-50 rounded-lg p-4 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-600">Tipo:</span>
            <span class="text-sm font-bold text-gray-900">{{
              transactionTypeLabel
            }}</span>
          </div>
          <div
            v-if="transaction.description"
            class="flex justify-between items-center"
          >
            <span class="text-sm font-medium text-gray-600">Descripción:</span>
            <span class="text-sm text-gray-900">{{
              transaction.description
            }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-600">Monto:</span>
            <span class="text-sm font-bold text-gray-900"
              >S/ {{ formatAmount(transaction.amount) }}</span
            >
          </div>
          <div
            v-if="transaction.createdAt"
            class="flex justify-between items-center"
          >
            <span class="text-sm font-medium text-gray-600">Fecha:</span>
            <span class="text-sm text-gray-900">{{
              formatDate(transaction.createdAt)
            }}</span>
          </div>
        </div> -->

        <!-- Impact List -->
        <div v-if="impactMessages.length > 0" class="space-y-3">
          <p class="text-sm font-semibold text-gray-700">
            Consecuencias de esta eliminación:
          </p>
          <div class="space-y-2">
            <div
              v-for="(message, index) in impactMessages"
              :key="index"
              class="flex items-start gap-3 text-sm"
              :class="getMessageClass(message.type)"
            >
              <component
                :is="getMessageIcon(message.type)"
                class="w-5 h-5 flex-shrink-0 mt-0.5"
              />
              <span>{{ message.text }}</span>
            </div>
          </div>
        </div>

        <!-- Recalculation Notice -->
        <div
          class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3"
        >
          <IconoirRefreshDouble
            class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
          />
          <p class="text-sm text-blue-900">
            El resumen diario (dailySummary) se recalculará automáticamente.
          </p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div
        class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3"
      >
        <button
          @click="closeModal"
          :disabled="loading"
          class="px-4 py-2.5 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          @click="handleDelete"
          :disabled="loading"
          class="px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <div
            v-if="loading"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></div>
          <IconoirTrash v-else class="w-4 h-4" />
          <span>{{ loading ? "Eliminando..." : "Eliminar Transacción" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  WarningTriangle as WarningTriangle,
  Xmark as IconoirXmark,
  InfoCircle as IconoirInfoCircle,
  Package as IconoirPackage,
  User as IconoirUser,
  Link as IconoirLink,
  Coins as IconoirCoins,
  RefreshDouble as IconoirRefreshDouble,
  Trash as IconoirTrash,
  WarningCircle as IconoirWarningCircle,
} from "@iconoir/vue";
import { ANONYMOUS_CLIENT_ID } from "@/types/client";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  transaction: {
    type: Object,
    default: null,
  },
  relatedPayments: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "confirm"]);

const loading = ref(false);

/**
 * Obtener etiqueta legible del tipo de transacción
 */
const transactionTypeLabel = computed(() => {
  if (!props.transaction) return "";

  const labels = {
    income: "Venta",
    expense: "Gasto",
    payment: "Pago",
    transfer: "Transferencia",
    opening: "Apertura",
    closure: "Cierre",
  };

  return labels[props.transaction.type] || "Transacción";
});

/**
 * Generar mensajes de impacto según el tipo de transacción
 */
const impactMessages = computed(() => {
  if (!props.transaction) return [];

  const messages = [];
  const t = props.transaction;

  switch (t.type) {
    case "income":
      // Stock
      if (t.items && t.items.length > 0) {
        messages.push({
          type: "warning",
          text: `Se revertirá el stock de ${t.items.length} producto${
            t.items.length > 1 ? "s" : ""
          } vendido${t.items.length > 1 ? "s" : ""}`,
        });
      }

      // Pagos múltiples
      if (t.payments && t.payments.length > 1) {
        messages.push({
          type: "info",
          text: `Esta venta tiene ${t.payments.length} pagos registrados`,
        });
      }

      // Cliente
      if (t.clientId && t.clientId !== ANONYMOUS_CLIENT_ID) {
        messages.push({
          type: "info",
          text: `Se actualizará la información del cliente: ${t.clientName}`,
        });
      }

      // Payments relacionados
      if (props.relatedPayments.length > 0) {
        messages.push({
          type: "critical",
          text: `Se eliminarán ${props.relatedPayments.length} pago${
            props.relatedPayments.length > 1 ? "s" : ""
          } asociado${props.relatedPayments.length > 1 ? "s" : ""}`,
        });
      }
      break;

    case "expense":
      if (t.category === "materials") {
        // Materiales
        if (t.materialItems && t.materialItems.length > 0) {
          messages.push({
            type: "warning",
            text: `Se revertirá el stock de ${t.materialItems.length} material${
              t.materialItems.length > 1 ? "es" : ""
            } comprado${t.materialItems.length > 1 ? "s" : ""}`,
          });
        }
      }
      messages.push({
        type: "info",
        text: `Se eliminará el registro del gasto: ${
          t.description || "Sin descripción"
        }`,
      });
      break;

    case "payment":
      messages.push({
        type: "warning",
        text: `El monto de S/ ${t.amount?.toFixed(
          2
        )} se devolverá al saldo pendiente`,
      });
      messages.push({
        type: "info",
        text: "Se actualizará el estado de pago de la venta original",
      });
      if (t.relatedTransactionTotal) {
        const newBalance =
          t.relatedTransactionTotal -
          (t.relatedTransactionTotalPaid || 0) +
          t.amount;
        messages.push({
          type: "info",
          text: `Nuevo saldo pendiente: S/ ${newBalance.toFixed(2)}`,
        });
      }
      break;

    case "transfer":
      messages.push({
        type: "info",
        text: "Se eliminará el registro de transferencia entre cuentas",
      });
      break;

    case "closure":
      messages.push({
        type: "critical",
        text: "Se eliminará el cierre del día actual",
      });
      messages.push({
        type: "warning",
        text: "El día quedará abierto para nuevas transacciones",
      });
      messages.push({
        type: "info",
        text: "Podrás realizar un nuevo cierre cuando lo necesites",
      });
      break;

    case "opening":
      // Este caso no debería ocurrir por validación previa
      messages.push({
        type: "critical",
        text: "Las aperturas son inmutables y no se pueden eliminar",
      });
      break;
  }

  return messages;
});

/**
 * Obtener clase CSS según el tipo de mensaje
 */
function getMessageClass(type) {
  const classes = {
    critical: "text-red-700",
    warning: "text-amber-700",
    info: "text-blue-700",
  };
  return classes[type] || "text-gray-700";
}

/**
 * Obtener ícono según el tipo de mensaje
 */
function getMessageIcon(type) {
  const icons = {
    critical: IconoirWarningCircle,
    warning: IconoirPackage,
    info: IconoirInfoCircle,
  };
  return icons[type] || IconoirInfoCircle;
}

/**
 * Formatear monto
 */
function formatAmount(amount) {
  return (amount || 0).toFixed(2);
}

/**
 * Formatear fecha
 */
function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Manejar confirmación de eliminación
 */
async function handleDelete() {
  loading.value = true;
  try {
    await emit("confirm");
  } finally {
    loading.value = false;
  }
}

/**
 * Cerrar modal
 */
function closeModal() {
  if (!loading.value) {
    emit("close");
  }
}
</script>
