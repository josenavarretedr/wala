<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
      <!-- Header -->
      <div
        :class="[
          'px-6 py-4 border-b',
          isRefundNoteMode ? 'bg-rose-50 border-rose-100' : 'bg-red-50 border-red-100',
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center',
                isRefundNoteMode ? 'bg-rose-100' : 'bg-red-100',
              ]"
            >
              <WarningTriangle
                :class="[
                  'w-5 h-5',
                  isRefundNoteMode ? 'text-rose-600' : 'text-red-600',
                ]"
              />
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-bold text-gray-900">
                {{ modalTitle }}
              </h3>
              <p v-if="isIncome && previewData" class="text-xs text-gray-500">
                {{
                  isRefundNoteMode
                    ? `Venta del ${previewData.saleDay} (día cerrado) → Afecta caja de hoy (${previewData.today})`
                    : `Venta del día abierto actual (${previewData.saleDay})`
                }}
              </p>
            </div>
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
      <div class="p-6 space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
        <!-- Estado de carga del preview (dryRun) para ventas -->
        <div
          v-if="isIncome && isLoadingPreview"
          class="py-8 flex flex-col items-center justify-center text-center space-y-3"
        >
          <div
            class="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"
          ></div>
          <p class="text-sm text-gray-600 font-medium">
            Verificando estado de caja y calculando impacto en inventario y cuentas...
          </p>
        </div>

        <!-- Error de red al consultar preview -->
        <div
          v-else-if="isIncome && previewError"
          class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700"
        >
          {{ previewError }}
        </div>

        <template v-else>
          <!-- Alerta de bloqueo cuando la caja de hoy no está abierta o ya cerró -->
          <div
            v-if="isIncome && previewData && !previewData.canExecute"
            class="bg-amber-50 border border-amber-300 rounded-xl p-4 flex gap-3"
          >
            <IconoirWarningCircle
              class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
            />
            <div class="space-y-1">
              <p class="text-sm font-bold text-amber-900">
                {{ blockInfo.title }}
              </p>
              <p class="text-xs sm:text-sm text-amber-800 leading-relaxed">
                {{ blockInfo.message }}
              </p>
            </div>
          </div>

          <!-- Explicación del modo de operación -->
          <div
            v-else-if="isIncome && isRefundNoteMode"
            class="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3"
          >
            <IconoirInfoCircle
              class="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5"
            />
            <div class="space-y-1">
              <p class="text-sm font-semibold text-rose-900">
                Reversión contable mediante Nota de Devolución
              </p>
              <p class="text-xs sm:text-sm text-rose-800 leading-relaxed">
                Como esta venta pertenece a un día ya cerrado ({{ previewData?.saleDay }}),
                su registro histórico no se borrará. Se generará una
                <strong>Nota de Devolución en la caja de hoy</strong> descontando el dinero cobrado y
                reincorporando los productos al inventario.
              </p>
            </div>
          </div>

          <div
            v-else
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
                La transacción será eliminada permanentemente del día actual y se revertirán
                todos los movimientos de caja, inventario y cliente relacionados.
              </p>
            </div>
          </div>

          <!-- Resumen detallado del servidor para ventas (income) -->
          <div v-if="isIncome && previewData?.impact" class="space-y-3">
            <!-- 1. Impacto en Flujo de Caja -->
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <IconoirCoins class="w-4 h-4 text-gray-600" />
                  {{ isRefundNoteMode ? 'Salida de dinero en caja de HOY' : 'Reversión de dinero en caja' }}
                </span>
                <span class="text-sm font-bold text-red-600">
                  -S/ {{ formatAmount(previewData.impact.money.totalPaidOut) }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-200/70">
                <div class="flex justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100">
                  <span class="text-gray-500">Efectivo:</span>
                  <span class="font-semibold text-gray-800">
                    -S/ {{ formatAmount(previewData.impact.money.cashOut) }}
                  </span>
                </div>
                <div class="flex justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100">
                  <span class="text-gray-500">Banco/Digital:</span>
                  <span class="font-semibold text-gray-800">
                    -S/ {{ formatAmount(previewData.impact.money.bankOut) }}
                  </span>
                </div>
              </div>
              <div
                v-if="(previewData.impact.money.detractionOut || 0) > 0"
                class="text-xs text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 flex justify-between"
              >
                <span>Cuenta Detracciones (SPOT):</span>
                <span class="font-bold">-S/ {{ formatAmount(previewData.impact.money.detractionOut) }}</span>
              </div>
              <div
                v-if="previewData.impact.money.cancelledBalance > 0"
                class="text-xs text-amber-700 bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200/60 flex justify-between"
              >
                <span>Saldo pendiente (crédito) que quedará anulado:</span>
                <span class="font-bold">S/ {{ formatAmount(previewData.impact.money.cancelledBalance) }}</span>
              </div>
            </div>

            <!-- 2. Impacto en Inventario y Capital -->
            <div
              v-if="previewData.impact.inventory.itemsCount > 0"
              class="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <IconoirPackage class="w-4 h-4 text-gray-600" />
                  Retorno a Inventario ({{ previewData.impact.inventory.itemsCount }})
                </span>
                <span
                  v-if="previewData.impact.inventory.totalCapitalRestored > 0"
                  class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                >
                  +S/ {{ formatAmount(previewData.impact.inventory.totalCapitalRestored) }} en capital
                </span>
              </div>
              <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                <div
                  v-for="item in previewData.impact.inventory.items"
                  :key="item.productId"
                  class="text-xs bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 flex justify-between items-center"
                >
                  <div class="truncate pr-2">
                    <span class="font-medium text-gray-800">{{ item.description }}</span>
                    <span class="text-gray-400 ml-1">
                      ({{ item.currentStock }} → {{ item.resultingStock }} {{ item.unit }})
                    </span>
                  </div>
                  <span class="font-bold text-emerald-600 shrink-0">
                    +{{ item.quantityToRestore }} {{ item.unit }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 3. Impacto en Cliente -->
            <div
              v-if="previewData.impact.client"
              class="bg-purple-50/70 border border-purple-200 rounded-xl p-3 flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-2 text-purple-900">
                <IconoirUser class="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  Se actualizará el historial de <strong>{{ previewData.impact.client.clientName }}</strong>
                </span>
              </div>
              <span class="font-semibold text-purple-700 shrink-0">
                -S/ {{ formatAmount(previewData.impact.client.purchaseAmountReversed) }}
              </span>
            </div>

            <!-- 4. Campo de motivo (especialmente útil para Nota de Devolución y auditoría) -->
            <div v-if="previewData.canExecute" class="space-y-1.5 pt-1">
              <label class="block text-xs font-semibold text-gray-700">
                {{ isRefundNoteMode ? 'Motivo de la Nota de Devolución (opcional):' : 'Motivo de la eliminación (opcional):' }}
              </label>
              <input
                v-model="reason"
                type="text"
                maxlength="160"
                :placeholder="
                  isRefundNoteMode
                    ? 'Ej. Cliente devolvió el producto / error en pedido'
                    : 'Ej. Registro duplicado o error de digitación'
                "
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          <!-- Impact List (para otros tipos de transacción que no son income) -->
          <div v-else-if="impactMessages.length > 0" class="space-y-3">
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
            class="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex gap-3"
          >
            <IconoirRefreshDouble
              class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            />
            <p class="text-xs sm:text-sm text-blue-900">
              El resumen diario (dailySummary) y los saldos de caja se actualizarán automáticamente.
            </p>
          </div>
        </template>
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
          v-if="!isIncome || (previewData && previewData.canExecute)"
          @click="handleDelete"
          :disabled="loading || (isIncome && isLoadingPreview)"
          :class="[
            'px-4 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
            isRefundNoteMode
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-red-600 hover:bg-red-700',
          ]"
        >
          <div
            v-if="loading"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></div>
          <IconoirTrash v-else class="w-4 h-4" />
          <span>{{ confirmButtonText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  WarningTriangle,
  Xmark as IconoirXmark,
  InfoCircle as IconoirInfoCircle,
  Package as IconoirPackage,
  User as IconoirUser,
  Coins as IconoirCoins,
  RefreshDouble as IconoirRefreshDouble,
  Trash as IconoirTrash,
  WarningCircle as IconoirWarningCircle,
} from "@iconoir/vue";
import { ANONYMOUS_CLIENT_ID } from "@/types/client";
import { useSaleDeletion, mapBlockReason } from "@/composables/useSaleDeletion";

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
const reason = ref("");

const {
  isLoadingPreview,
  error: previewError,
  previewData,
  previewSaleDeletion,
} = useSaleDeletion();

const isIncome = computed(() => props.transaction?.type === "income");

const isRefundNoteMode = computed(
  () => isIncome.value && previewData.value?.mode === "REFUND_NOTE"
);

const blockInfo = computed(() =>
  mapBlockReason(previewData.value?.blockReason)
);

const modalTitle = computed(() => {
  if (isIncome.value) {
    if (isRefundNoteMode.value) {
      return "Anular Venta (Nota de Devolución)";
    }
    return "Eliminar Venta";
  }
  return `Eliminar ${transactionTypeLabel.value}`;
});

const confirmButtonText = computed(() => {
  if (loading.value) {
    return isRefundNoteMode.value ? "Emitiendo Nota..." : "Eliminando...";
  }
  if (isRefundNoteMode.value) {
    return "Emitir Nota de Devolución Hoy";
  }
  return "Eliminar Transacción";
});

// Cargar preview del servidor cada vez que se abre el modal para una venta
watch(
  () => [props.isOpen, props.transaction?.uuid],
  async ([open, saleUuid]) => {
    if (open && isIncome.value && saleUuid) {
      reason.value = "";
      try {
        await previewSaleDeletion({ saleUuid });
      } catch (err) {
        console.warn("⚠️ Error obteniendo preview de eliminación:", err);
      }
    }
  },
  { immediate: true }
);

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
 * Generar mensajes de impacto según el tipo de transacción (fallback o no-income)
 */
const impactMessages = computed(() => {
  if (!props.transaction) return [];

  const messages = [];
  const t = props.transaction;

  switch (t.type) {
    case "income":
      if (t.items && t.items.length > 0) {
        messages.push({
          type: "warning",
          text: `Se revertirá el stock de ${t.items.length} producto${
            t.items.length > 1 ? "s" : ""
          } vendido${t.items.length > 1 ? "s" : ""}`,
        });
      }
      if (t.clientId && t.clientId !== ANONYMOUS_CLIENT_ID) {
        messages.push({
          type: "info",
          text: `Se actualizará la información del cliente: ${t.clientName}`,
        });
      }
      break;

    case "expense":
      if (t.category === "materials") {
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
      messages.push({
        type: "critical",
        text: "Las aperturas son inmutables y no se pueden eliminar",
      });
      break;
  }

  return messages;
});

function getMessageClass(type) {
  const classes = {
    critical: "text-red-700",
    warning: "text-amber-700",
    info: "text-blue-700",
  };
  return classes[type] || "text-gray-700";
}

function getMessageIcon(type) {
  const icons = {
    critical: IconoirWarningCircle,
    warning: IconoirPackage,
    info: IconoirInfoCircle,
  };
  return icons[type] || IconoirInfoCircle;
}

function formatAmount(amount) {
  return Number(amount || 0).toFixed(2);
}

async function handleDelete() {
  loading.value = true;
  try {
    await emit("confirm", {
      reason: reason.value?.trim() || "",
      mode: previewData.value?.mode || null,
    });
  } finally {
    loading.value = false;
  }
}

function closeModal() {
  if (!loading.value) {
    emit("close");
  }
}
</script>
