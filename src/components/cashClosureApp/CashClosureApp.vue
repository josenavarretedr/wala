<template>
  <div class="w-full max-w-3xl mx-auto px-4 py-8 space-y-8 text-gray-800">
    <!-- Título -->
    <div class="flex items-center justify-center mb-4">
      <Safe class="w-8 h-8 text-purple-600 mr-2" />
      <h1 class="text-3xl font-bold text-purple-700">Cierre de Caja</h1>
    </div>

    <!-- Formulario de cierre SIEMPRE visible -->
    <div class="space-y-6">
      <!-- Sección efectivo -->
      <div
        class="bg-white shadow-md rounded-xl p-5 border-l-4 border-green-500 relative"
      >
        <div class="flex items-center gap-2 text-green-600 mb-4">
          <Coins class="w-7 h-7" />
          <h2 class="text-2xl font-bold">Efectivo</h2>
        </div>

        <p class="text-lg text-gray-600 mb-4">
          Saldo esperado:
          <strong>S/ {{ cashClosureStore.expectedCashBalance }}</strong>
        </p>

        <template v-if="selectedCashOption === null">
          <button
            @click="selectCashOption('expected')"
            :disabled="cashClosureData"
            class="w-full bg-green-100 text-green-700 text-2xl font-bold py-6 rounded-lg shadow-md mb-4 hover:scale-105 transition-transform disabled:opacity-50"
          >
            Sí, S/ {{ cashClosureStore.expectedCashBalance }}
          </button>

          <div class="space-y-2">
            <label
              for="real-cash-input"
              class="block text-gray-700 text-base font-semibold"
            >
              No, tengo:
            </label>
            <input
              id="real-cash-input"
              type="number"
              inputmode="decimal"
              pattern="[0-9]*"
              :disabled="cashClosureData"
              v-model.number="cashClosureStore.realBalances.cash"
              @blur="onBlurCashInput"
              class="w-full px-4 py-4 text-2xl text-center border-2 border-green-500 rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50"
              placeholder="Otro monto"
            />
          </div>
        </template>

        <template v-else-if="selectedCashOption === 'expected'">
          <div class="relative">
            <button
              class="absolute top-0 right-0 text-red-600 text-2xl font-bold"
              @click="clearCashSelection"
              :disabled="cashClosureData"
            >
              <Xmark class="w-6 h-6" />
            </button>
            <button
              disabled
              class="w-full bg-green-200 text-green-700 text-2xl font-bold py-6 rounded-lg shadow-md"
            >
              Sí, S/ {{ cashClosureStore.expectedCashBalance }}
            </button>
          </div>
        </template>

        <template v-else-if="selectedCashOption === 'custom'">
          <div class="relative space-y-2">
            <button
              class="absolute top-0 right-0 text-red-600 text-2xl font-bold"
              @click="clearCashSelection"
              :disabled="cashClosureData"
            >
              <Xmark class="w-6 h-6" />
            </button>
            <label
              for="real-cash-input-selected"
              class="block text-gray-700 text-base font-semibold"
            >
              No, tengo:
            </label>
            <input
              id="real-cash-input-selected"
              type="number"
              inputmode="decimal"
              pattern="[0-9]*"
              :disabled="cashClosureData"
              v-model.number="cashClosureStore.realBalances.cash"
              @blur="onBlurCashInput"
              class="w-full px-4 py-4 text-2xl text-center border-2 border-green-500 rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50"
              placeholder="Otro monto"
            />
          </div>
        </template>

        <p
          v-if="cashClosureStore.cashDifference !== 0"
          class="text-lg font-bold mt-4"
          :class="{
            'text-red-500': cashClosureStore.cashDifference < 0,
            'text-green-500': cashClosureStore.cashDifference > 0,
          }"
        >
          Diferencia: S/ {{ cashClosureStore.cashDifference }}
        </p>
      </div>

      <!-- Sección banco -->
      <div
        class="bg-white shadow-md rounded-xl p-5 border-l-4 border-purple-500 relative"
      >
        <div class="flex items-center gap-2 text-purple-600 mb-4">
          <SmartphoneDevice class="w-7 h-7" />
          <h2 class="text-2xl font-bold">Yape / Plin</h2>
        </div>

        <p class="text-lg text-gray-600 mb-4">
          Saldo esperado:
          <strong>S/ {{ cashClosureStore.expectedBankBalance }}</strong>
        </p>

        <template v-if="selectedBankOption === null">
          <button
            @click="selectBankOption('expected')"
            :disabled="cashClosureData"
            class="w-full bg-purple-100 text-purple-700 text-2xl font-bold py-6 rounded-lg shadow-md mb-4 hover:scale-105 transition-transform disabled:opacity-50"
          >
            Sí, S/ {{ cashClosureStore.expectedBankBalance }}
          </button>

          <div class="space-y-2">
            <label
              for="real-bank-input"
              class="block text-gray-700 text-base font-semibold"
            >
              No, tengo:
            </label>
            <input
              id="real-bank-input"
              type="number"
              inputmode="decimal"
              pattern="[0-9]*"
              :disabled="cashClosureData"
              v-model.number="cashClosureStore.realBalances.bank"
              @blur="onBlurBankInput"
              class="w-full px-4 py-4 text-2xl text-center border-2 border-purple-500 rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50"
              placeholder="Otro monto"
            />
          </div>
        </template>

        <template v-else-if="selectedBankOption === 'expected'">
          <div class="relative">
            <button
              class="absolute top-0 right-0 text-red-600 text-2xl font-bold"
              @click="clearBankSelection"
              :disabled="cashClosureData"
            >
              <Xmark class="w-6 h-6" />
            </button>
            <button
              disabled
              class="w-full bg-purple-200 text-purple-700 text-2xl font-bold py-6 rounded-lg shadow-md"
            >
              Sí, S/ {{ cashClosureStore.expectedBankBalance }}
            </button>
          </div>
        </template>

        <template v-else-if="selectedBankOption === 'custom'">
          <div class="relative space-y-2">
            <button
              class="absolute top-0 right-0 text-red-600 text-2xl font-bold"
              @click="clearBankSelection"
              :disabled="cashClosureData"
            >
              <Xmark class="w-6 h-6" />
            </button>
            <label
              for="real-bank-input-selected"
              class="block text-gray-700 text-base font-semibold"
            >
              No, tengo:
            </label>
            <input
              id="real-bank-input-selected"
              type="number"
              inputmode="decimal"
              pattern="[0-9]*"
              :disabled="cashClosureData"
              v-model.number="cashClosureStore.realBalances.bank"
              @blur="onBlurBankInput"
              class="w-full px-4 py-4 text-2xl text-center border-2 border-purple-500 rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50"
              placeholder="Otro monto"
            />
          </div>
        </template>

        <p
          v-if="cashClosureStore.bankDifference !== 0"
          class="text-lg font-bold mt-4"
          :class="{
            'text-red-500': cashClosureStore.bankDifference < 0,
            'text-green-500': cashClosureStore.bankDifference > 0,
          }"
        >
          Diferencia: S/ {{ cashClosureStore.bankDifference }}
        </p>
      </div>

      <!-- Botón de acción final -->
      <div class="text-center">
        <router-link
          v-if="cashClosureData"
          :to="{
            name: 'CashClosureDetails',
            params: { cashClosureId: cashClosureData.uuid },
          }"
          class="block bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold w-full px-6 py-4 rounded-xl shadow-lg transition-all"
        >
          Ver Detalle del Cierres
        </router-link>

        <button
          v-else
          @click="performClosure"
          class="bg-green-500 hover:bg-green-600 text-white text-xl font-bold w-full px-6 py-4 rounded-xl shadow-lg transition-all"
        >
          Realizar Cierre de Caja
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Coins, SmartphoneDevice, Safe, Xmark } from "@iconoir/vue";
import { useCashClosureStore } from "@/stores/cashClosureStore";
import { ref, nextTick } from "vue";

const cashClosureStore = useCashClosureStore();
const cashClosureData = ref(null);

const selectedCashOption = ref(null); // null | 'expected' | 'custom'
const selectedBankOption = ref(null);

const selectCashOption = (option) => {
  if (cashClosureData.value) return; // No editable si ya está cerrado
  selectedCashOption.value = option;
  if (option === "expected") {
    cashClosureStore.setrealBalance(
      "cash",
      cashClosureStore.expectedCashBalance.value
    );
  }
};
const clearCashSelection = () => {
  if (cashClosureData.value) return;
  selectedCashOption.value = null;
  cashClosureStore.setrealBalance("cash", null);
};

const onBlurCashInput = (e) => {
  if (cashClosureData.value) return;
  nextTick(() => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      selectedCashOption.value = "custom";
      cashClosureStore.setrealBalance("cash", value);
    }
  });
};

const selectBankOption = (option) => {
  if (cashClosureData.value) return;
  selectedBankOption.value = option;
  if (option === "expected") {
    cashClosureStore.setrealBalance(
      "bank",
      cashClosureStore.expectedBankBalance.value
    );
  }
};
const clearBankSelection = () => {
  if (cashClosureData.value) return;
  selectedBankOption.value = null;
  cashClosureStore.setrealBalance("bank", null);
};

const onBlurBankInput = (e) => {
  if (cashClosureData.value) return;
  nextTick(() => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      selectedBankOption.value = "custom";
      cashClosureStore.setrealBalance("bank", value);
    }
  });
};

await cashClosureStore.startCashClosureProcess();

const performClosure = async () => {
  cashClosureData.value = await cashClosureStore.performCashClosure();
};
</script>
