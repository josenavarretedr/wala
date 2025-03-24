<template>
  <div class="w-full max-w-3xl mx-auto px-4 py-8 space-y-8 text-gray-800">
    <!-- Título -->
    <h1 class="text-2xl md:text-3xl font-bold text-center">Cierre de Caja</h1>

    <!-- Botón inicial -->
    <div class="text-center">
      <button
        @click="startClosureProcess"
        class="bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold w-full md:w-auto px-6 py-3 rounded-xl shadow-md transition-all"
      >
        Iniciar Cierre de Caja
      </button>
    </div>

    <!-- Formulario de cierre -->
    <div v-if="showClosureForm" class="space-y-6">
      <!-- Efectivo -->
      <div
        class="bg-white shadow-md rounded-xl p-5 space-y-4 border border-blue-100"
      >
        <div class="flex items-center gap-2 text-blue-700">
          <Cash class="w-6 h-6" />
          <h2 class="text-xl md:text-2xl font-semibold">Efectivo</h2>
        </div>

        <p class="text-base md:text-lg text-gray-600">
          Saldo Esperado:
          <strong>S/ {{ cashClosureStore.expectedCashBalance }}</strong>
        </p>

        <div class="flex items-center gap-3">
          <label
            for="actual-cash"
            class="text-sm md:text-base font-medium text-gray-700"
            >Conteo Real:</label
          >
          <input
            type="number"
            id="actual-cash"
            v-model.number="cashClosureStore.realBalances.cash"
            class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 w-32"
            @input="
              cashClosureStore.setrealBalance('cash', $event.target.value)
            "
          />
        </div>

        <p
          v-if="cashClosureStore.cashDifference !== 0"
          class="text-base md:text-lg font-semibold"
          :class="{
            'text-red-500': cashClosureStore.cashDifference < 0,
            'text-green-500': cashClosureStore.cashDifference > 0,
          }"
        >
          Diferencia: S/ {{ cashClosureStore.cashDifference }}
        </p>
      </div>

      <!-- Banco -->
      <div
        class="bg-white shadow-md rounded-xl p-5 space-y-4 border border-purple-100"
      >
        <div class="flex items-center gap-2 text-purple-700">
          <Bank class="w-6 h-6" />
          <h2 class="text-xl md:text-2xl font-semibold">Banco</h2>
        </div>

        <p class="text-base md:text-lg text-gray-600">
          Saldo Esperado:
          <strong>S/ {{ cashClosureStore.expectedBankBalance }}</strong>
        </p>

        <div class="flex items-center gap-3">
          <label
            for="actual-bank"
            class="text-sm md:text-base font-medium text-gray-700"
            >Saldo Real:</label
          >
          <input
            type="number"
            id="actual-bank"
            v-model.number="cashClosureStore.realBalances.bank"
            class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 w-32"
            @input="
              cashClosureStore.setrealBalance('bank', $event.target.value)
            "
          />
        </div>

        <p
          v-if="cashClosureStore.bankDifference !== 0"
          class="text-base md:text-lg font-semibold"
          :class="{
            'text-red-500': cashClosureStore.bankDifference < 0,
            'text-green-500': cashClosureStore.bankDifference > 0,
          }"
        >
          Diferencia: S/ {{ cashClosureStore.bankDifference }}
        </p>
      </div>

      <!-- Botón Final -->
      <div class="text-center">
        <button
          @click="performClosure"
          class="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold w-full md:w-auto px-6 py-3 rounded-xl shadow-md transition-all"
        >
          Realizar Cierre de Caja
        </button>
      </div>
    </div>

    <!-- Resumen -->
    <div v-if="showClosureSummary" class="space-y-6">
      <h2 class="text-2xl font-bold text-center text-gray-800">
        Resumen del Cierre de Caja
      </h2>

      <div
        v-for="accountInfo in cashClosureData.accounts"
        :key="accountInfo.account"
        class="bg-white border shadow-sm rounded-xl p-5 space-y-2"
      >
        <div class="flex items-center gap-2 text-gray-700">
          <component
            :is="accountInfo.account === 'cash' ? Cash : Bank"
            class="w-5 h-5"
          />
          <h3 class="text-lg font-semibold uppercase">
            {{ accountInfo.account }}
          </h3>
        </div>

        <p class="text-gray-600">
          Saldo Esperado: S/ {{ accountInfo.expectedBalance }}
        </p>
        <p class="text-gray-600">
          Saldo Real: S/ {{ accountInfo.realBalance }}
        </p>
        <p
          class="font-semibold"
          :class="{
            'text-red-500': accountInfo.difference < 0,
            'text-green-500': accountInfo.difference > 0,
          }"
        >
          Diferencia: S/ {{ accountInfo.difference }}
        </p>
        <p class="text-sm text-gray-500">
          {{
            accountInfo.adjustmentTransactionUuid
              ? `Transacción de ajuste: ${accountInfo.adjustmentTransactionUuid}`
              : "No se requirió transacción de ajuste."
          }}
        </p>
      </div>

      <p class="text-center text-lg font-semibold text-gray-700">
        Estado del Cierre:
        <span class="uppercase">{{ cashClosureData.status }}</span>
      </p>

      <div class="text-center">
        <button
          @click="resetFormAndSummary"
          class="bg-gray-500 hover:bg-gray-600 text-white text-lg font-semibold w-full md:w-auto px-6 py-3 rounded-xl shadow-md"
        >
          Realizar Nuevo Cierre
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Cash, Bank } from "@iconoir/vue";
import { useCashClosureStore } from "@/stores/cashClosureStore";
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
