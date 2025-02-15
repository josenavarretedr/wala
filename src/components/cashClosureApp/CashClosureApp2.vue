<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-center">Cierre de Caja</h1>

    <!-- <div v-if="cashClosureStore.isClosing" class="mb-4 text-center">
      <p>Calculando saldos esperados...</p>
      <p>Por favor espere.</p>
    </div> -->

    <div>
      <button
        @click="startClosureProcess"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Iniciar Cierre de Caja
      </button>
    </div>

    <div v-if="showClosureForm" class="space-y-4">
      <div class="border p-4 rounded shadow-md">
        <h2 class="text-xl font-semibold mb-2">Efectivo (Cash)</h2>
        <p>Saldo Esperado: ${{ cashClosureStore.expectedCashBalance }}</p>
        <div class="flex items-center space-x-2">
          <label for="actual-cash" class="font-medium">Conteo Real:</label>
          <input
            type="number"
            id="actual-cash"
            v-model.number="cashClosureStore.realBalances.cash"
            class="border p-2 rounded w-32"
            @input="
              cashClosureStore.setrealBalance('cash', $event.target.value)
            "
          />
        </div>
        <p
          v-if="cashClosureStore.cashDifference !== 0"
          class="mt-2 font-semibold"
          :class="{
            'text-red-500': cashClosureStore.cashDifference.value < 0,
            'text-green-500': cashClosureStore.cashDifference.value > 0,
          }"
        >
          Diferencia: ${{ cashClosureStore.cashDifference }}
        </p>
      </div>

      <div class="border p-4 rounded shadow-md">
        <h2 class="text-xl font-semibold mb-2">Banco</h2>
        <p>Saldo Esperado: ${{ cashClosureStore.expectedBankBalance }}</p>
        <div class="flex items-center space-x-2">
          <label for="actual-bank" class="font-medium"
            >Saldo Real (Estado de Cuenta):</label
          >
          <input
            type="number"
            id="actual-bank"
            v-model.number="cashClosureStore.realBalances.bank"
            class="border p-2 rounded w-32"
            @input="
              cashClosureStore.setrealBalance('bank', $event.target.value)
            "
          />
        </div>
        <p
          v-if="cashClosureStore.bankDifference !== 0"
          class="mt-2 font-semibold"
          :class="{
            'text-red-500': cashClosureStore.bankDifference.value < 0,
            'text-green-500': cashClosureStore.bankDifference.value > 0,
          }"
        >
          Diferencia: ${{ cashClosureStore.bankDifference }}
        </p>
      </div>

      <button
        @click="performClosure"
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-6"
      >
        Realizar Cierre de Caja
      </button>
    </div>
    <div v-if="showClosureSummary">
      <h2 class="text-2xl font-bold mt-8 mb-4 text-center">
        Resumen del Cierre de Caja
      </h2>
      <div
        v-for="accountInfo in cashClosureData.accounts"
        :key="accountInfo.account"
        class="border p-4 rounded shadow-md mb-4"
      >
        <h3 class="text-lg font-semibold">
          {{ accountInfo.account.toUpperCase() }}
        </h3>
        <p>Saldo Esperado: ${{ accountInfo.expectedBalance }}</p>
        <p>Saldo Real: ${{ accountInfo.realBalance }}</p>
        <p
          class="font-semibold"
          :class="{
            'text-red-500': accountInfo.difference < 0,
            'text-green-500': accountInfo.difference > 0,
          }"
        >
          Diferencia: ${{ accountInfo.difference }}
        </p>
        <p v-if="accountInfo.adjustmentTransactionUuid">
          Transacción de Ajuste Creada (UUID):
          {{ accountInfo.adjustmentTransactionUuid }}
        </p>
        <p v-else>No se requirió transacción de ajuste.</p>
      </div>
      <p class="mt-4 font-semibold">
        Estado del Cierre: {{ cashClosureData.status.toUpperCase() }}
      </p>
      <button
        @click="resetFormAndSummary"
        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Realizar Nuevo Cierre
      </button>
    </div>
  </div>
</template>

<script setup>
import { useCashClosureStore } from "@/stores/cashClosureStore2";
import { ref } from "vue";

const cashClosureStore = useCashClosureStore();

const showClosureForm = ref(false); // Controla la visibilidad del formulario de cierre
const showClosureSummary = ref(false); // Controla la visibilidad del resumen
const cashClosureData = ref(null); // Para almacenar los datos del cierre y mostrar el resumen

const startClosureProcess = async () => {
  await cashClosureStore.startCashClosureProcess(); // Inicia el proceso y calcula saldos esperados
  showClosureForm.value = true; // Muestra el formulario después de calcular los saldos
};

const performClosure = async () => {
  cashClosureData.value = await cashClosureStore.performCashClosure(); // Realiza el cierre y guarda en Firestore
  showClosureForm.value = false; // Oculta el formulario
  showClosureSummary.value = true; // Muestra el resumen
  console.log("Realizar cierre de caja");
};

const resetFormAndSummary = () => {
  showClosureForm.value = true; // Oculta el formulario
  showClosureSummary.value = false; // Oculta el resumen
  cashClosureData.value = null; // Limpia los datos del cierre
  cashClosureStore.resetCashClosureState(); // Resetea el estado del store
};
</script>
