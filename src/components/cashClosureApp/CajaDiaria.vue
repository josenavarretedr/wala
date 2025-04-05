<template>
  <div class="w-full mx-auto px-4 py-8 space-y-8 text-gray-800">
    <div class="flex items-center justify-center mb-4">
      <safe class="w-8 h-8 text-purple-600 mr-2" />
      <h1 class="text-3xl font-bold text-purple-700">
        {{ type === "opening" ? "Inicio de Caja" : "Cierre de Caja" }}
      </h1>
    </div>

    <div class="space-y-6">
      <!-- EFECTIVO -->
      <div class="bg-white shadow-md rounded-xl p-5 relative">
        <div class="flex items-center gap-2 text-green-600 mb-4">
          <coins class="w-7 h-7" />
          <h2 class="text-2xl font-bold">Efectivo</h2>
        </div>

        <p class="text-lg text-gray-600 mb-4">
          Saldo esperado:
          <strong>S/ {{ cashEventStore.expectedCashBalance }}</strong>
        </p>

        <!-- Opciones para EFECTIVO -->
        <template v-if="selectedCashOption === null">
          <button
            @click="selectCashOption('expected')"
            :disabled="cashEventData"
            class="w-full bg-green-100 text-green-700 text-2xl font-bold py-6 rounded-lg shadow-md mb-4 hover:scale-105 transition-transform disabled:opacity-50"
          >
            Sí, S/ {{ cashEventStore.expectedCashBalance }}
          </button>

          <div class="space-y-2">
            <label
              for="real-cash-input"
              class="block text-gray-700 text-base font-semibold"
              >Tengo:</label
            >
            <input
              id="real-cash-input"
              type="number"
              inputmode="decimal"
              pattern="[0-9]*"
              :disabled="cashEventData"
              v-model.number="cashEventStore.realBalances.cash"
              @blur="onBlurCashInput"
              class="w-full px-4 py-4 text-2xl text-center border-2 border-green-500 rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50"
              placeholder="Monto actual"
            />
          </div>
        </template>

        <template v-else-if="selectedCashOption === 'expected'">
          <div class="relative">
            <button
              class="absolute top-0 right-0 text-red-600 text-2xl font-bold"
              @click="clearCashSelection"
              :disabled="cashEventData"
            >
              <xmark class="w-6 h-6" />
            </button>
            <button
              disabled
              class="w-full bg-green-200 text-green-700 text-2xl font-bold py-6 rounded-lg shadow-md"
            >
              Sí, S/ {{ cashEventStore.expectedCashBalance }}
            </button>
          </div>
        </template>

        <template v-else-if="selectedCashOption === 'custom'">
          <div class="relative space-y-2">
            <button
              class="absolute top-0 right-0 text-red-600 text-2xl font-bold"
              @click="clearCashSelection"
              :disabled="cashEventData"
            >
              <xmark class="w-6 h-6" />
            </button>
            <label
              for="real-cash-input-selected"
              class="block text-gray-700 text-base font-semibold"
              >Tengo:</label
            >
            <input
              id="real-cash-input-selected"
              type="number"
              inputmode="decimal"
              pattern="[0-9]*"
              :disabled="cashEventData"
              v-model.number="cashEventStore.realBalances.cash"
              @blur="onBlurCashInput"
              class="w-full px-4 py-4 text-2xl text-center border-2 border-green-500 rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50"
              placeholder="Monto actual"
            />
          </div>
        </template>

        <p
          v-if="cashEventStore.cashDifference !== 0"
          class="text-lg font-bold mt-4"
          :class="{
            'text-red-500': cashEventStore.cashDifference < 0,
            'text-green-500': cashEventStore.cashDifference > 0,
          }"
        >
          Diferencia: S/ {{ cashEventStore.cashDifference.value }}
        </p>
      </div>

      <!-- BANCO -->
      <div
        class="bg-white shadow-md rounded-xl p-5 border-l-4 border-purple-500 relative"
      >
        <div class="flex items-center gap-2 text-purple-600 mb-4">
          <smartphonedevice class="w-7 h-7" />
          <h2 class="text-2xl font-bold">Yape / Plin</h2>
        </div>

        <p class="text-lg text-gray-600 mb-4">
          Saldo esperado:
          <strong>S/ {{ cashEventStore.expectedBankBalance }}</strong>
        </p>

        <!-- Opciones para BANCO -->
        <template v-if="selectedBankOption === null">
          <button
            @click="selectBankOption('expected')"
            :disabled="cashEventData"
            class="w-full bg-purple-100 text-purple-700 text-2xl font-bold py-6 rounded-lg shadow-md mb-4 hover:scale-105 transition-transform disabled:opacity-50"
          >
            Sí, S/ {{ cashEventStore.expectedBankBalance }}
          </button>

          <div class="space-y-2">
            <label
              for="real-bank-input"
              class="block text-gray-700 text-base font-semibold"
              >Tengo:</label
            >
            <input
              id="real-bank-input"
              type="number"
              inputmode="decimal"
              pattern="[0-9]*"
              :disabled="cashEventData"
              v-model.number="cashEventStore.realBalances.bank"
              @blur="onBlurBankInput"
              class="w-full px-4 py-4 text-2xl text-center border-2 border-purple-500 rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50"
              placeholder="Monto actual"
            />
          </div>
        </template>

        <template v-else-if="selectedBankOption === 'expected'">
          <div class="relative">
            <button
              class="absolute top-0 right-0 text-red-600 text-2xl font-bold"
              @click="clearBankSelection"
              :disabled="cashEventData"
            >
              <xmark class="w-6 h-6" />
            </button>
            <button
              disabled
              class="w-full bg-purple-200 text-purple-700 text-2xl font-bold py-6 rounded-lg shadow-md"
            >
              Sí, S/ {{ cashEventStore.expectedBankBalance }}
            </button>
          </div>
        </template>

        <template v-else-if="selectedBankOption === 'custom'">
          <div class="relative space-y-2">
            <button
              class="absolute top-0 right-0 text-red-600 text-2xl font-bold"
              @click="clearBankSelection"
              :disabled="cashEventData"
            >
              <xmark class="w-6 h-6" />
            </button>
            <label
              for="real-bank-input-selected"
              class="block text-gray-700 text-base font-semibold"
              >Tengo:</label
            >
            <input
              id="real-bank-input-selected"
              type="number"
              inputmode="decimal"
              pattern="[0-9]*"
              :disabled="cashEventData"
              v-model.number="cashEventStore.realBalances.bank"
              @blur="onBlurBankInput"
              class="w-full px-4 py-4 text-2xl text-center border-2 border-purple-500 rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50"
              placeholder="Monto actual"
            />
          </div>
        </template>

        <p
          v-if="cashEventStore.bankDifference !== 0"
          class="text-lg font-bold mt-4"
          :class="{
            'text-red-500': cashEventStore.bankDifference < 0,
            'text-green-500': cashEventStore.bankDifference > 0,
          }"
        >
          Diferencia: S/ {{ cashEventStore.bankDifference }}
        </p>
      </div>

      <!-- BOTÓN -->
      <div class="text-center">
        <router-link
          v-if="cashEventData"
          :to="{
            name: 'CashClosureDetails',
            params: { cashClosureId: cashEventData.uuid },
          }"
          class="block bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold w-full px-6 py-4 rounded-xl shadow-lg transition-all"
        >
          Ver Detalle del Cierres
        </router-link>

        <button
          v-else
          @click="performCashEvent"
          class="bg-green-500 hover:bg-green-600 text-white text-xl font-bold w-full px-6 py-4 rounded-xl shadow-lg transition-all"
        >
          {{
            type === "opening"
              ? "Registrar Inicio de Caja"
              : "Realizar Cierre de Caja"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { Coins, SmartphoneDevice, Safe, Xmark } from "@iconoir/vue";
import { useCashEventStore } from "@/stores/cashEventStore";
import { useTransactionStore } from "@/stores/transactionStore";

const props = defineProps({
  type: {
    type: String,
    default: "closure", // o 'opening'
  },
});

const transactionStore = useTransactionStore();
const cashEventStore = useCashEventStore();
const cashEventData = ref(null);

const selectedCashOption = ref(null);
const selectedBankOption = ref(null);

onMounted(async () => {
  await cashEventStore.startCashEventProcess(props.type);
});

const selectCashOption = (option) => {
  if (cashEventData.value) return;
  selectedCashOption.value = option;
  if (option === "expected") {
    cashEventStore.setRealBalance(
      "cash",
      cashEventStore.expectedCashBalance.value
    );
  }
};
const clearCashSelection = () => {
  if (cashEventData.value) return;
  selectedCashOption.value = null;
  cashEventStore.setRealBalance("cash", null);
};
const onBlurCashInput = (e) => {
  if (cashEventData.value) return;
  nextTick(() => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      selectedCashOption.value = "custom";
      cashEventStore.setRealBalance("cash", value);
    }
  });
};

const selectBankOption = (option) => {
  if (cashEventData.value) return;
  selectedBankOption.value = option;
  if (option === "expected") {
    cashEventStore.setRealBalance(
      "bank",
      cashEventStore.expectedBankBalance.value
    );
  }
};
const clearBankSelection = () => {
  if (cashEventData.value) return;
  selectedBankOption.value = null;
  cashEventStore.setRealBalance("bank", null);
};
const onBlurBankInput = (e) => {
  if (cashEventData.value) return;
  nextTick(() => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      selectedBankOption.value = "custom";
      cashEventStore.setRealBalance("bank", value);
    }
  });
};

const performCashEvent = async () => {
  cashEventData.value = await cashEventStore.performCashEvent(props.type);
  if (props.type === "opening") {
    transactionStore.nextStepToAddTransaction();
  }
};
</script>
