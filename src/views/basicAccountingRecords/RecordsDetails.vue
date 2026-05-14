<template>
  <div
    class="space-y-4 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-20"
    ref="captureTarget"
  >
    <!-- HEADER -->
    <div class="flex justify-end items-center gap-3 mb-3 no-share-item">
      <CloseBtn v-bind="closeBtnConfig" />
    </div>

    <!-- Content Card - Contenedor con ref para captura -->
    <div>
      <!-- Estado de carga -->
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center py-12"
      >
        <SpinnerIcon size="lg" class="text-gray-600 mx-auto mb-4" />
        <p class="text-sm text-gray-500 mt-3">Cargando detalles...</p>
      </div>

      <!-- Error: No se encontró -->
      <div
        v-else-if="!transactionData"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <div
          class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4"
        >
          <svg
            class="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-1">
          Transacción no encontrada
        </h3>
        <p class="text-sm text-gray-500">
          No se pudo cargar la información de esta transacción
        </p>
      </div>

      <!-- Contenido cargado -->
      <component
        v-else
        :is="dynamicComponent"
        :transactionData="transactionData"
        :targetRef="captureTarget"
      />
    </div>

    <!-- Actions -->
    <div
      v-if="transactionData && !isLoading"
      class="flex gap-4 mt-6 no-share-item"
    >
      <button
        @click="openDeleteModal()"
        :disabled="isDisabled"
        class="flex-1 py-3 border-2 border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <Trash class="w-4 h-4" />
        {{ deleteButtonLabel }}
      </button>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <DeleteTransactionModal
      :is-open="showDeleteModal"
      :transaction="transactionData"
      :related-payments="relatedPayments"
      @close="showDeleteModal = false"
      @confirm="handleDeleteConfirm"
      class="no-share-item"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useCashClosureStore } from "@/stores/cashClosureStore";
import { Edit, Trash, Xmark } from "@iconoir/vue";
import { useRoute, useRouter } from "vue-router";
import { useFlowClose } from "@/composables/useCloseBtn";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useBusinessStore } from "@/stores/businessStore";

// Importación dinámica de componentes
import IncomeDetails from "@/components/HistorialRecords/Details/IncomeDetails.vue";
import ExpenseDetails from "@/components/HistorialRecords/Details/ExpenseDetails.vue";
import TransferDetails from "@/components/HistorialRecords/Details/TransferDetails.vue";
import AccountsBalanceDetails from "@/components/HistorialRecords/Details/AccountsBalanceDetails.vue";
import PaymentDetails from "@/components/HistorialRecords/Details/PaymentDetails.vue";

import CloseBtn from "@/components/ui/CloseBtn.vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import DeleteTransactionModal from "@/components/Transactions/DeleteTransactionModal.vue";

import { useCashEventStore } from "@/stores/cashEventStore";
import { useToast } from "@/composables/useToast";

const cashEventStore = useCashEventStore();
const businessStore = useBusinessStore();
const { success } = useToast();

const isLoading = ref(true);
const showDeleteModal = ref(false);
const relatedPayments = ref([]);

const hasClosureToday = computed(() => {
  return transactionStore.hasClosureToday();
});

const isDisabled = computed(() => {
  if (!transactionData.value) return true;

  // Opening SIEMPRE bloqueado (inmutable)
  if (transactionData.value.type === "opening") {
    return true;
  }

  // Closure solo se puede eliminar si es del día actual
  if (transactionData.value.type === "closure") {
    return !transactionStore.isTransactionFromToday(transactionData.value);
  }

  // Payments pueden eliminarse siempre (no están restringidos por cierre)
  if (transactionData.value.type === "payment") {
    return false;
  }

  // Otras transacciones: deshabilitar si ya hay cierre hoy
  return hasClosureToday.value;
});

const deleteButtonLabel = computed(() => {
  if (!transactionData.value) return "Eliminar";

  switch (transactionData.value.type) {
    case "payment":
      return "Eliminar Pago";
    case "opening":
      return "Apertura Inmutable";
    case "closure":
      return transactionStore.isTransactionFromToday(transactionData.value)
        ? "Eliminar Cierre"
        : "Cierre Protegido";
    default:
      return "Eliminar";
  }
});

const route = useRoute();
const { navigateToDashboard } = useFlowClose();

const transactionStore = useTransactionStore();
const transactionData = ref(null);
const dynamicComponent = ref(null);

// Ref para captura de imagen
const captureTarget = ref(null);

// Mapeo de tipos de transacción a componentes
const componentMap = {
  income: IncomeDetails,
  expense: ExpenseDetails,
  transfer: TransferDetails,
  opening: AccountsBalanceDetails,
  closure: AccountsBalanceDetails,
  payment: PaymentDetails,
};

// Configuración del botón cerrar
const closeBtnConfig = computed(() => {
  if (transactionData.value?.type === "opening" || transactionData.value?.type === "closure") {
    return { navigationType: "dashboard" };
  }
  return { navigationType: "back" };
});

// Función para cargar la transacción
async function loadTransaction(transactionId) {
  isLoading.value = true;
  transactionData.value = null;
  dynamicComponent.value = null;

  try {
    console.log("🔍 [RecordsDetails] Buscando transacción:", transactionId);

    // Primero intentar obtener del store
    let transaccionAConsulta =
      transactionStore.getOneTransactionDataByID(transactionId);

    // Si no está en el store, consultar Firestore directamente
    if (!transaccionAConsulta || transaccionAConsulta.length === 0) {
      console.log(
        "⚠️ [RecordsDetails] No encontrada en store, consultando Firestore..."
      );

      const businessId = businessStore.business?.id;
      if (!businessId) {
        console.error("❌ No hay businessId disponible");
        isLoading.value = false;
        return;
      }

      const transactionRef = doc(
        db,
        `businesses/${businessId}/transactions`,
        transactionId
      );
      const transactionSnap = await getDoc(transactionRef);

      if (transactionSnap.exists()) {
        const firestoreData = {
          id: transactionSnap.id,
          ...transactionSnap.data(),
        };
        console.log(
          "✅ [RecordsDetails] Transacción encontrada en Firestore:",
          firestoreData
        );
        transaccionAConsulta = [firestoreData]; // Envolver en array para mantener compatibilidad
      } else {
        console.error("❌ [RecordsDetails] Transacción no existe en Firestore");
        isLoading.value = false;
        return;
      }
    } else {
      console.log("✅ [RecordsDetails] Transacción encontrada en store");
    }

    if (transaccionAConsulta && transaccionAConsulta.length > 0) {
      transactionData.value = transaccionAConsulta[0]; // getOneTransactionDataByID retorna un array

      // Determinar el componente dinámico basado en el tipo de transacción
      if (
        transactionData.value.type &&
        componentMap[transactionData.value.type]
      ) {
        console.log(
          `Cargando componente para tipo: ${transactionData.value.type}`
        );
        dynamicComponent.value = componentMap[transactionData.value.type];
      } else {
        console.warn(
          `Tipo de transacción no reconocido: ${transactionData.value.type}`
        );
        // Componente por defecto si el tipo no es reconocido
        dynamicComponent.value = IncomeDetails;
      }
    } else {
      console.error("No se encontró la transacción con ID:", transactionId);
    }
  } catch (error) {
    console.error("Error al obtener la transacción:", error);
  } finally {
    isLoading.value = false;
  }
}

// Cargar la transacción inicial
onMounted(() => {
  const transactionId = route.params.registerId;
  loadTransaction(transactionId);
});

// Observar cambios en el parámetro de la ruta para recargar cuando cambie
watch(
  () => route.params.registerId,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      console.log("🔄 [RecordsDetails] Parámetro cambió, recargando:", newId);
      loadTransaction(newId);
    }
  }
);

function openDeleteModal() {
  // Buscar payments relacionados si es una transacción income
  if (transactionData.value?.type === "income") {
    // Asegurarse de que transactionsInStore sea un array antes de filtrar
    const transactions = Array.isArray(transactionStore.transactionsInStore)
      ? transactionStore.transactionsInStore
      : [];

    relatedPayments.value = transactions.filter(
      (t) =>
        t.type === "payment" &&
        t.relatedTransactionId === transactionData.value.uuid
    );
  } else {
    relatedPayments.value = [];
  }

  showDeleteModal.value = true;
}

async function handleDeleteConfirm() {
  try {
    // Si es un payment (transacción tipo 'payment'), eliminarlo del array de la venta original
    if (transactionData.value?.type === "payment") {
      console.log("🗑️ Eliminando payment:", {
        paymentUuid: transactionData.value.uuid,
        relatedTransactionId: transactionData.value.relatedTransactionId,
      });

      // Usar la función específica para eliminar del array payments[]
      const result = await transactionStore.deletePaymentFromIncomeTransaction(
        transactionData.value.uuid,
        transactionData.value.relatedTransactionId
      );

      if (result.success) {
        console.log("✅ Payment eliminado del array exitosamente");
        showDeleteModal.value = false;
        success(
          `Pago de S/ ${transactionData.value.amount?.toFixed(2)} eliminado`
        );
        success(`Se actualizó la cuenta del cliente.`);
        navigateToDashboard();
      }
    } else {
      // Para otros tipos de transacciones, usar el flujo normal
      const result = await transactionStore.deleteOneTransactionByID(
        route.params.registerId,
        // Callback que se resuelve inmediatamente porque ya confirmamos con el modal
        () => Promise.resolve(true)
      );

      if (result.success) {
        showDeleteModal.value = false;
        const typeLabels = {
          income: "Venta",
          expense: "Gasto",
          transfer: "Transferencia",
          closure: "Cierre",
        };
        const label = typeLabels[transactionData.value?.type] || "Transacción";
        success(`${label} eliminada correctamente`);
        navigateToDashboard();
      }
    }
  } catch (error) {
    console.error("Error eliminando transacción: ", error);
    alert("Error al eliminar la transacción: " + error.message);
  }
}

function saludar() {
  console.log("Saludar function called");
}
</script>

<style scoped>
.transition-colors {
  transition: all 0.2s ease;
}

button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Button press effect */
button:active {
  transform: translateY(1px);
}
</style>
