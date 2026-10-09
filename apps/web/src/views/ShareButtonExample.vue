<template>
  <div class="max-w-2xl mx-auto p-6 space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Ejemplo de ShareButton</h1>

    <!-- Ejemplo 1: Comprobante Simple -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-700">1. Comprobante Simple</h2>

      <div
        ref="comprobanteRef"
        class="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg"
      >
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900">Comprobante de Venta</h3>
          <p class="text-gray-500">#{{ ticketNumber }}</p>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Fecha:</span>
            <span class="font-semibold">{{ currentDate }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Cliente:</span>
            <span class="font-semibold">Juan Pérez</span>
          </div>
          <div class="flex justify-between border-t pt-3">
            <span class="text-gray-600">Total:</span>
            <span class="text-2xl font-bold text-green-600">
              ${{ totalAmount.toFixed(2) }}
            </span>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t flex justify-center">
          <ShareButton
            :target-ref="comprobanteRef"
            file-name="comprobante-venta.png"
            share-title="Comprobante de Venta"
            component-type="comprobante-venta-ejemplo"
            variant="primary"
            size="md"
            @share-success="onShareSuccess"
            @share-error="onShareError"
          />
        </div>
      </div>
    </div>

    <!-- Ejemplo 2: Ticket con Modificaciones -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-700">
        2. Ticket con Modificaciones
      </h2>

      <div
        ref="ticketRef"
        class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6"
      >
        <h3 class="text-xl font-bold text-blue-900 mb-4">Ticket de Cobro</h3>

        <!-- Este botón se ocultará en la captura -->
        <button
          class="edit-button mb-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          ✏️ Editar (no aparece en imagen)
        </button>

        <!-- Este mensaje se mostrará solo en la captura -->
        <div
          class="share-message bg-green-100 border border-green-300 rounded-lg p-4 mb-4"
          style="display: none"
        >
          <p class="text-green-800 font-semibold">✅ ¡Gracias por tu pago!</p>
        </div>

        <div class="space-y-2 mb-6">
          <p class="text-gray-700"><strong>Concepto:</strong> Mensualidad</p>
          <p class="text-gray-700"><strong>Monto:</strong> $500.00</p>
          <p class="text-gray-700">
            <strong>Estado:</strong>
            <span class="text-green-600 font-bold">Pagado</span>
          </p>
        </div>

        <div class="flex justify-center">
          <ShareButton
            :target-ref="ticketRef"
            file-name="ticket-cobro.png"
            component-type="ticket-cobro-ejemplo"
            :modifications="ticketModifications"
            variant="outline"
            size="lg"
            button-text="Compartir Recibo"
          />
        </div>
      </div>
    </div>

    <!-- Ejemplo 3: Card Estadísticas -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-700">3. Resumen de Ventas</h2>

      <div
        ref="statsRef"
        class="bg-white border-2 border-purple-200 rounded-xl p-6"
      >
        <h3 class="text-xl font-bold text-purple-900 mb-6 text-center">
          📊 Resumen del Día
        </h3>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <p class="text-gray-600 text-sm">Ventas</p>
            <p class="text-3xl font-bold text-blue-600">{{ salesCount }}</p>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <p class="text-gray-600 text-sm">Total</p>
            <p class="text-3xl font-bold text-green-600">
              ${{ salesTotal.toFixed(2) }}
            </p>
          </div>
        </div>

        <div class="flex justify-center gap-3">
          <ShareButton
            :target-ref="statsRef"
            file-name="resumen-ventas.png"
            component-type="resumen-ventas-ejemplo"
            variant="secondary"
            size="md"
          />

          <ShareButton
            :target-ref="statsRef"
            file-name="resumen-sin-marca.png"
            component-type="resumen-ventas-sin-marca"
            :disable-watermark="true"
            variant="outline"
            size="md"
            button-text="Sin Marca"
          />
        </div>
      </div>
    </div>

    <!-- Log de Eventos -->
    <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        📝 Log de Eventos
      </h3>

      <div class="space-y-2 max-h-60 overflow-y-auto">
        <div
          v-for="(log, index) in eventLogs"
          :key="index"
          class="text-sm p-2 rounded"
          :class="getLogClass(log.type)"
        >
          <span class="font-mono">{{ log.time }}</span> -
          <span class="font-semibold">{{ log.message }}</span>
        </div>

        <p v-if="eventLogs.length === 0" class="text-gray-500 text-center py-4">
          No hay eventos registrados aún
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import ShareButton from "@/components/ShareButton.vue";

// Referencias a elementos
const comprobanteRef = ref(null);
const ticketRef = ref(null);
const statsRef = ref(null);

// Datos de ejemplo
const ticketNumber = ref("VTA-2026-001");
const totalAmount = ref(1250.5);
const salesCount = ref(42);
const salesTotal = ref(8750.0);

const currentDate = computed(() => {
  return new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
});

// Modificaciones para el ticket
const ticketModifications = {
  hideElements: [".edit-button"],
  showElements: [".share-message"],
};

// Log de eventos
const eventLogs = ref([]);

const addLog = (type, message) => {
  const time = new Date().toLocaleTimeString("es-ES");
  eventLogs.value.unshift({ type, message, time });

  // Mantener solo los últimos 20 logs
  if (eventLogs.value.length > 20) {
    eventLogs.value = eventLogs.value.slice(0, 20);
  }
};

const getLogClass = (type) => {
  const classes = {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
  };
  return classes[type] || "bg-gray-100 text-gray-800";
};

// Event Handlers
const onShareSuccess = ({ method, fileSize, captureTime, totalTime }) => {
  addLog(
    "success",
    `✅ Compartido vía ${method} - ${(fileSize / 1024).toFixed(
      2
    )} KB - ${totalTime}ms`
  );
};

const onShareError = ({ stage, error }) => {
  addLog("error", `❌ Error en ${stage}: ${error}`);
};
</script>

<style scoped>
/* Asegurar que los elementos tengan fondo blanco para captura */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, #eff6ff, #eef2ff);
}
</style>
