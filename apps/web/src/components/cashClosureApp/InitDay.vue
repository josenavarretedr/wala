<template>
  <div class="w-full max-w-3xl mx-auto px-4 py-8 space-y-8 text-gray-800">
    <div class="flex items-center justify-center mb-4">
      <Safe class="w-8 h-8 text-purple-600 mr-2" />
      <h1 class="text-3xl font-bold text-purple-700">Inicio del Día</h1>
    </div>

    <div class="space-y-6">
      <!-- Efectivo -->
      <BalanceInput
        title="Efectivo"
        icon="Coins"
        color="green"
        v-model="initialBalances.cash"
      />

      <!-- Banco -->
      <BalanceInput
        title="Yape / Plin"
        icon="SmartphoneDevice"
        color="purple"
        v-model="initialBalances.bank"
      />
    </div>

    <div class="text-center mt-10">
      <button
        @click="saveBalances"
        class="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold w-full px-6 py-4 rounded-xl shadow-lg transition-all"
      >
        Guardar Saldos Iniciales
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Safe, Coins, SmartphoneDevice } from "@iconoir/vue";
import BalanceInput from "@/components/cashClosureApp/BalanceInput.vue"; // Componente reusable por tipo de cuenta
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const transactionStore = useTransactionStore();

const initialBalances = ref({
  cash: null,
  bank: null,
});

const saveBalances = async () => {
  try {
    // Guardar en Firestore o localmente según diseño
    await transactionStore.saveInitialBalances(initialBalances.value);

    // Ir al siguiente paso del flujo
    transactionStore.nextStepToAddTransaction();
  } catch (e) {
    console.error("Error al guardar los saldos iniciales", e);
  }
};
</script>
