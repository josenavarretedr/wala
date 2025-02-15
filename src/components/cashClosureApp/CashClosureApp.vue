<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-center">Arqueo de Caja</h1>

    <div class="flex flex-col space-y-6">
      <div>
        <h2 class="text-lg font-semibold">CASH</h2>
        <p>Saldo esperado: {{ totalIngresos }}</p>
        <input
          v-model="realBalances[account]"
          type="number"
          class="px-4 py-2 border rounded-lg shadow-lg text-lg"
          placeholder="Ingrese saldo real"
        />
      </div>

      <button
        @click="finalizeClosure"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg disabled:opacity-50 flex justify-center items-center"
      >
        Finalizar Cierre de Caja
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useCashClosureStore } from "@/stores/cashClosureStore";
import { useTransactionStore } from "@/stores/transactionStore";

const clashClosureStore = useCashClosureStore();
const transactionStore = useTransactionStore();

const accountsToCheck = ["cash", "bank"];
const accountNames = {
  cash: "Efectivo",
  bank: "Cuenta Bancaria",
};

const expectedBalances = ref({ cash: 0, bank: 0 });
const realBalances = ref({ cash: 0, bank: 0 });

const finalizeClosure = async () => {
  try {
    await clashClosureStore.performCashClosure("user123", realBalances.value);
    alert("Cierre de caja realizado con éxito");
  } catch (error) {
    alert("Error en el cierre de caja: " + error.message);
  }
};

const totalIngresos = computed(() => {
  return transactionStore
    .getAllIncomeTransactionsInStore()
    .reduce((sum, record) => sum + record.total, 0)
    .toFixed(2);
});

const totalEgresos = computed(() => {
  return transactionStore
    .getAllExpenseTransactionsInStore()
    .reduce((sum, record) => sum + record.total, 0)
    .toFixed(2);
});

const saldoActual = computed(() => {
  return (
    parseFloat(totalIngresos.value) - parseFloat(totalEgresos.value)
  ).toFixed(2);
});
</script>
