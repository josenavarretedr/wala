<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-center">
      ¿Fue en efectivo o te yaperon?
    </h1>
    <div
      class="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0 justify-center"
    >
      <button
        @click="emitSelectAccount('cash')"
        :class="{
          'bg-green-500 text-white': selectedAccount === 'cash',
          'bg-white text-green-500 border border-green-500':
            selectedAccount !== 'cash',
        }"
        class="flex flex-col items-center align-middle px-10 py-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
      >
        <Coins class="w-12 h-12" />

        <span class="text-2xl mt-4">Efectivo</span>
      </button>
      <button
        @click="emitSelectAccount('bank')"
        :class="{
          'bg-purple-500 text-white': selectedAccount === 'bank',
          'bg-white text-purple-500 border border-purple-500':
            selectedAccount !== 'bank',
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
import { ref, watch } from "vue";
import { Coins, SmartphoneDevice } from "@iconoir/vue"; // Importar iconos de Iconoir

const selectedAccount = ref(null);
const emit = defineEmits(["update:selectedAccount"]);

const props = defineProps({
  selectedAccount: {
    type: String,
    default: null,
  },
});

watch(
  () => props.selectedAccount,
  (newVal) => {
    selectedAccount.value = newVal;
  },
  { immediate: true }
);

const emitSelectAccount = (type) => {
  selectedAccount.value = type;
  emit("update:selectedAccount", type);
};
</script>

<style scoped>
/* Puedes agregar estilos adicionales aquí si es necesario */
</style>
