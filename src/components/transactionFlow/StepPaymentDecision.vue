<template>
  <div class="space-y-6">
    <!-- Título y Subtítulo elegantes -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        ¿Ya cobraste este pedido?
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Elige cómo deseas procesar este registro en tu sistema
      </p>
    </div>

    <!-- Opciones de Decisión -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
      <!-- Opción Sí, ya cobré -->
      <div class="relative group">
        <button
          @click="selectDecision('paid')"
          :class="[
            'w-full p-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-4 text-center border-2 shadow-sm hover:shadow-lg',
            selectedDecision === 'paid'
              ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-500 text-blue-900 shadow-blue-500/10'
              : 'bg-white border-gray-150 text-gray-600 hover:border-blue-300 hover:text-blue-600',
          ]"
        >
          <div
            :class="[
              'p-4 rounded-full transition-colors duration-300',
              selectedDecision === 'paid'
                ? 'bg-blue-500 text-white'
                : 'bg-blue-50 text-blue-500 group-hover:bg-blue-100',
            ]"
          >
            <Coins class="w-10 h-10" />
          </div>
          <div>
            <span class="text-lg font-bold block mb-1">Sí, ya cobré</span>
            <span class="text-xs opacity-80 leading-relaxed block max-w-xs">
              Registra el pago de inmediato. Esto afectará tus cuentas, cajas e inventario de inmediato.
            </span>
          </div>
        </button>
      </div>

      <!-- Opción Solo registrar pedido -->
      <div class="relative group">
        <button
          @click="selectDecision('order_only')"
          :class="[
            'w-full p-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-4 text-center border-2 shadow-sm hover:shadow-lg',
            selectedDecision === 'order_only'
              ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-500 text-orange-900 shadow-orange-500/10'
              : 'bg-white border-gray-150 text-gray-600 hover:border-orange-300 hover:text-orange-600',
          ]"
        >
          <div
            :class="[
              'p-4 rounded-full transition-colors duration-300',
              selectedDecision === 'order_only'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-50 text-orange-500 group-hover:bg-orange-100',
            ]"
          >
            <ClipboardCheck class="w-10 h-10" />
          </div>
          <div>
            <span class="text-lg font-bold block mb-1">Solo registrar pedido</span>
            <span class="text-xs opacity-80 leading-relaxed block max-w-xs">
              Guárdalo como un pedido pendiente. Podrás hacer seguimiento, cambiar su estado y cobrarlo después en el Kanban.
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Indicador de selección -->
    <div
      v-if="selectedDecision"
      class="text-center animate-fade-in"
    >
      <div
        class="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-xs text-gray-500 border border-gray-100"
      >
        <div
          :class="[
            'w-2 h-2 rounded-full',
            selectedDecision === 'paid' ? 'bg-blue-500' : 'bg-orange-500',
          ]"
        ></div>
        Opción activa:
        <span class="font-semibold text-gray-700">
          {{ selectedDecision === 'paid' ? 'Cobro directo' : 'Guardar en Kanban de Órdenes' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Coins, ClipboardCheck } from "@iconoir/vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";

const flow = useTransactionFlowStore();
const transactionStore = useTransactionStore();

const selectedDecision = computed(() => {
  return transactionStore.transactionToAdd.value.paymentDecision || null;
});

const selectDecision = (decision) => {
  // Guardar en store
  transactionStore.transactionToAdd.value.paymentDecision = decision;
  
  if (decision === 'order_only') {
    transactionStore.transactionToAdd.value.type = 'order';
  } else {
    transactionStore.transactionToAdd.value.type = 'income';
  }

  // Modificar dinámicamente los siguientes pasos del flujo
  flow.insertPaymentSteps(decision);
  
  // Avanzar automáticamente al siguiente paso
  setTimeout(() => {
    flow.nextStep();
  }, 150);
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
