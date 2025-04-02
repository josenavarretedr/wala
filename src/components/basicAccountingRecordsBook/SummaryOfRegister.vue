<template>
  <div class="w-full max-w-3xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-center mb-8 text-purple-700">
      Detalle de registro
    </h1>

    <!-- Monto principal -->
    <div
      class="text-white text-5xl font-extrabold px-6 py-6 rounded-2xl shadow-xl text-center mb-6"
      :class="
        transactionStore.transactionToAdd.value.type === 'income'
          ? 'bg-cyan-600'
          : 'bg-orange-500'
      "
    >
      S/. {{ transactionStore.transactionToAdd.value.total }}
    </div>

    <!-- Tipo y cuenta -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div
        :class="
          transactionStore.transactionToAdd.value.type === 'income'
            ? 'border-blue-500 text-blue-500'
            : 'border-red-500 text-red-500'
        "
        class="bg-white border rounded-xl p-5 shadow flex flex-col items-center gap-2"
      >
        <component
          :is="
            transactionStore.transactionToAdd.value.type === 'income'
              ? GraphUp
              : DatabaseExport
          "
          class="w-8 h-8"
        />
        <span class="text-xl font-semibold">
          {{
            transactionStore.transactionToAdd.value.type === "income"
              ? "Venta"
              : "Salió"
          }}
        </span>
      </div>

      <div
        :class="
          transactionStore.transactionToAdd.value.account === 'cash'
            ? 'border-green-500 text-green-500'
            : 'border-purple-500 text-purple-500'
        "
        class="bg-white border rounded-xl p-5 shadow flex flex-col items-center gap-2"
      >
        <component
          :is="
            transactionStore.transactionToAdd.value.account === 'cash'
              ? Coins
              : SmartphoneDevice
          "
          class="w-8 h-8"
        />
        <span class="text-xl font-semibold">
          {{
            transactionStore.transactionToAdd.value.account === "cash"
              ? "Efectivo"
              : "Yape/Plin"
          }}
        </span>
      </div>
    </div>

    <!-- Lista de productos (si es income) -->
    <div
      v-if="transactionStore.transactionToAdd.value.type === 'income'"
      class="mt-8"
    >
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Productos agregados</h2>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="item in transactionStore.transactionToAdd.value.items"
          :key="item.uuid"
          class="bg-white border rounded-xl shadow-md px-4 py-3 flex flex-col justify-between"
        >
          <div class="text-lg font-bold text-gray-700 mb-1 truncate">
            {{ item.description }}
          </div>

          <div class="text-gray-600 flex justify-between text-sm">
            <span>{{ item.quantity }} uni × S/ {{ item.price }}</span>
            <span class="text-green-600 font-bold">
              S/ {{ (item.quantity * item.price).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Descripción libre (si es expense) -->
    <div
      v-else
      class="bg-white border rounded-xl shadow p-6 text-xl text-center mt-6"
      :class="
        transactionStore.transactionToAdd.value.type === 'income'
          ? 'text-cyan-600 border-cyan-600'
          : 'text-orange-500 border-orange-500'
      "
    >
      {{ transactionStore.transactionToAdd.value.description }}
    </div>
  </div>
</template>

<script setup>
import { GraphUp, DatabaseExport, Coins, SmartphoneDevice } from "@iconoir/vue";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();
</script>

<style scoped>
.summary-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  .summary-container {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
