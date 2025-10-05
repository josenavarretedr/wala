<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        ¿Cómo se realizó el pago?
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Selecciona el método de pago utilizado en esta transacción
      </p>
    </div>

    <!-- Opciones de cuenta -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-lg mx-auto"
    >
      <!-- Opción Efectivo -->
      <div class="relative group">
        <button
          @click="handleSelectedAccount('cash')"
          :class="[
            'w-full p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-4 shadow-sm hover:shadow-md',
            transactionStore.transactionToAdd.value.account === 'cash'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25'
              : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200 hover:border-green-200',
          ]"
        >
          <div class="p-3 rounded-full bg-white/20 backdrop-blur-sm">
            <Coins
              :class="[
                'w-8 h-8 transition-colors duration-200',
                transactionStore.transactionToAdd.value.account === 'cash'
                  ? 'text-white'
                  : 'text-green-500',
              ]"
            />
          </div>
          <div class="text-center">
            <span class="text-lg font-semibold block">Efectivo</span>
            <span class="text-xs opacity-80">Dinero físico</span>
          </div>
        </button>

        <!-- Tooltip de ayuda -->
        <div
          class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
        >
          <div class="text-center">
            <strong>Incluye:</strong> Billetes, monedas, dinero en caja
          </div>
        </div>
      </div>

      <!-- Opción Digital -->
      <div class="relative group">
        <button
          @click="handleSelectedAccount('bank')"
          :class="[
            'w-full p-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-4 shadow-sm hover:shadow-md',
            transactionStore.transactionToAdd.value.account === 'bank'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/25'
              : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-200',
          ]"
        >
          <div class="p-3 rounded-full bg-white/20 backdrop-blur-sm">
            <SmartphoneDevice
              :class="[
                'w-8 h-8 transition-colors duration-200',
                transactionStore.transactionToAdd.value.account === 'bank'
                  ? 'text-white'
                  : 'text-purple-500',
              ]"
            />
          </div>
          <div class="text-center">
            <span class="text-lg font-semibold block">Yape/Plin</span>
            <span class="text-xs opacity-80">Pago digital</span>
          </div>
        </button>

        <!-- Tooltip de ayuda -->
        <div
          class="absolute z-20 w-48 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
        >
          <div class="text-center">
            <strong>Incluye:</strong> Yape, Plin, transferencias bancarias
          </div>
        </div>
      </div>
    </div>

    <!-- Indicador de selección -->
    <div
      v-if="transactionStore.transactionToAdd.value.account"
      class="text-center"
    >
      <div
        class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600"
      >
        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        Método seleccionado:
        <span class="font-medium">
          {{ getAccountLabel(transactionStore.transactionToAdd.value.account) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Coins, SmartphoneDevice } from "@iconoir/vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";

const flow = useTransactionFlowStore();
const transactionStore = useTransactionStore();

const handleSelectedAccount = (account) => {
  transactionStore.modifyTransactionToAddAccount(account);
  flow.nextStep();
};

const getAccountLabel = (account) => {
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
  };
  return labels[account] || account;
};
</script>
