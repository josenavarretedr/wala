<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-center">
      ¿Fue en efectivo o te yaperon?
    </h1>
    <div
      class="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0 justify-center"
    >
      <button
        @click="handleSelectedAccount('cash')"
        :class="{
          'bg-green-500 text-white':
            transactionStore.transactionToAdd.value.account === 'cash',
          'bg-white text-green-500 border border-green-500':
            transactionStore.transactionToAdd.value.account !== 'cash',
        }"
        class="flex flex-col items-center align-middle px-10 py-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
      >
        <Coins class="w-12 h-12" />

        <span class="text-2xl mt-4">Efectivo</span>
      </button>
      <button
        @click="handleSelectedAccount('bank')"
        :class="{
          'bg-purple-500 text-white':
            transactionStore.transactionToAdd.value.account === 'bank',
          'bg-white text-purple-500 border border-purple-500':
            transactionStore.transactionToAdd.value.account !== 'bank',
        }"
        class="flex flex-col items-center align-middle px-10 py-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
      >
        <SmartphoneDevice class="w-12 h-12" />

        <span class="text-2xl mt-4">Yape/Plin</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { Coins, SmartphoneDevice } from "@iconoir/vue"; // Importar iconos de Iconoir

import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();

const handleSelectedAccount = (account) => {
  transactionStore.modifyTransactionToAddAccount(account);
  transactionStore.nextStepToAddTransaction();
};
</script>
