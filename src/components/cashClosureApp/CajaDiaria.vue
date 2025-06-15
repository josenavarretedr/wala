<template>
  <div class="w-full mx-auto px-4 py-8 space-y-8 text-gray-800">
    <!-- Encabezado -->
    <div class="flex items-center justify-center mb-4">
      <safe class="w-8 h-8 text-purple-600 mr-2" />
      <h1 class="text-3xl font-bold text-purple-700">
        {{ type === "opening" ? "Inicio de Caja" : "Cierre de Caja" }}
      </h1>
    </div>

    <div class="space-y-6">
      <!-- SALDO INICIAL (solo para cierre) -->
      <Transition name="fade-scale">
        <div
          v-if="type === 'closure'"
          class="bg-white shadow-md rounded-xl px-5 py-4 space-y-2 animate-in fade-in"
        >
          <div class="flex items-center gap-2 text-blue-600">
            <InfoCircle class="w-6 h-6" />
            <h2 class="text-xl font-semibold">Saldo Inicial del Día</h2>
          </div>
          <div class="flex justify-between text-base text-gray-600">
            <span>Efectivo</span>
            <span class="font-semibold">
              S/ {{ cashEventStore.saldoInicial.value.cash.toFixed(2) }}
            </span>
          </div>
          <div class="flex justify-between text-base text-gray-600">
            <span>Yape / Plin</span>
            <span class="font-semibold">
              S/ {{ cashEventStore.saldoInicial.value.bank.toFixed(2) }}
            </span>
          </div>
          <div
            class="flex justify-between text-lg font-bold text-blue-700 border-t pt-3"
          >
            <span>Total Inicial</span>
            <span>
              S/
              {{
                (
                  cashEventStore.saldoInicial.value.cash +
                  cashEventStore.saldoInicial.value.bank
                ).toFixed(2)
              }}
            </span>
          </div>
        </div>
      </Transition>

      <!-- EFECTIVO -->
      <div class="bg-white shadow-md rounded-xl p-5 relative">
        <div class="flex items-center align-middle text-green-600 mb-4">
          <coins class="w-7 h-7" />
          <h2 class="text-2xl font-bold">Efectivo</h2>
        </div>
        <div class="flex items-center gap-2 text-green-600 mb-4">
          <InfoCircle
            @click="showCashOptions = !showCashOptions"
            id="infoSaldoEsperadoEfectivo"
            class="w-5 h-5 cursor-pointer"
          />
          <p class="text-lg text-gray-600">
            Saldo esperado:
            <strong>S/ {{ cashEventStore.expectedCashBalance }}</strong>
          </p>
        </div>

        <Transition name="fade-scale">
          <div
            v-if="type === 'closure' && showCashOptions"
            class="bg-white rounded-xl p-4 shadow-md space-y-2"
          >
            <h3 class="text-lg font-semibold text-gray-700">
              Detalle del saldo esperado
            </h3>
            <div class="flex justify-between text-base text-gray-600">
              <span>Efectivo inicial</span>
              <span class="font-medium">
                S/ {{ cashEventStore.saldoInicial.value.cash.toFixed(2) }}
              </span>
            </div>
            <div class="flex justify-between text-base text-gray-600">
              <span>Ingresos netos (efectivo)</span>
              <span class="font-medium">
                S/
                {{
                  (
                    cashEventStore.expectedCashBalance.value -
                    cashEventStore.saldoInicial.value.cash
                  ).toFixed(2)
                }}
              </span>
            </div>
            <div
              class="flex justify-between text-lg font-bold text-green-700 border-t pt-2"
            >
              <span>Total esperado</span>
              <span>
                S/ {{ cashEventStore.expectedCashBalance.value.toFixed(2) }}
              </span>
            </div>
          </div>
        </Transition>

        <!-- Opciones para EFECTIVO -->
        <template v-if="selectedCashOption === null">
          <button
            @click="selectCashOption('expected')"
            :disabled="cashEventData"
            class="w-full bg-green-100 text-green-700 text-2xl font-bold py-6 rounded-lg shadow-md mt-5 hover:scale-105 transition-transform duration-200 disabled:opacity-50"
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
          Diferencia: S/ {{ cashEventStore.cashDifference }}
        </p>
      </div>

      <!-- BANK -->

      <div class="bg-white shadow-md rounded-xl p-5 relative">
        <div class="flex items-center gap-2 text-purple-600 mb-4">
          <SmartphoneDevice class="w-7 h-7" />
          <h2 class="text-2xl font-bold">Yape / Plin</h2>
        </div>

        <div class="flex items-center gap-2 text-purple-600 mb-4">
          <InfoCircle
            @click="showBankOptions = !showBankOptions"
            id="infoSaldoEsperadoEfectivo"
            class="w-5 h-5 cursor-pointer"
          />
          <p class="text-lg text-gray-600">
            Saldo esperado:
            <strong>S/ {{ cashEventStore.expectedBankBalance }}</strong>
          </p>
        </div>

        <Transition name="fade-scale">
          <div
            v-if="type === 'closure' && showBankOptions"
            class="bg-white rounded-xl p-4 shadow-md space-y-2"
          >
            <h3 class="text-lg font-semibold text-gray-700">
              Detalle del saldo esperado
            </h3>
            <div class="flex justify-between text-base text-gray-600">
              <span>Saldo inicial</span>
              <span class="font-medium">
                S/ {{ cashEventStore.saldoInicial.value.bank.toFixed(2) }}
              </span>
            </div>
            <div class="flex justify-between text-base text-gray-600">
              <span>Ingresos netos</span>
              <span class="font-medium">
                S/
                {{
                  (
                    cashEventStore.expectedBankBalance.value -
                    cashEventStore.saldoInicial.value.bank
                  ).toFixed(2)
                }}
              </span>
            </div>
            <div
              class="flex justify-between text-lg font-bold text-purple-700 border-t pt-2"
            >
              <span>Total esperado</span>
              <span>
                S/ {{ cashEventStore.expectedBankBalance.value.toFixed(2) }}
              </span>
            </div>
          </div>
        </Transition>

        <!-- Opciones para BANCO -->

        <template v-if="selectedBankOption === null">
          <button
            @click="selectBankOption('expected')"
            :disabled="cashEventData"
            class="w-full bg-purple-100 text-purple-700 text-2xl font-bold py-6 rounded-lg shadow-md mt-5 hover:scale-105 transition-transform duration-200 disabled:opacity-50"
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

      <!-- BOTÓN FINAL -->
      <div class="text-center">
        <router-link
          v-if="cashEventData"
          :to="{
            name: 'CashClosureDetails',
            params: { cashClosureId: cashEventData.uuid },
          }"
          class="block bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold w-full px-6 py-4 rounded-xl shadow-lg transition-all"
        >
          Ver Detalle del Cierre
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
import { Coins, SmartphoneDevice, Safe, Xmark, InfoCircle } from "@iconoir/vue";
import { useCashEventStore } from "@/stores/cashEventStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

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

const showCashOptions = ref(false);
const showBankOptions = ref(false);

onMounted(async () => {
  await cashEventStore.startCashEventProcess(props.type);
  if (props.type === "closure") {
    await cashEventStore.calcularSaldoInicial();
  }
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

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
