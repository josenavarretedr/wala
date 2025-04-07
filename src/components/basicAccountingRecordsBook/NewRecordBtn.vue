<template>
  <div class="relative group inline-block">
    <template v-if="!isDisabled">
      <router-link
        :to="{ name: 'BasicAccountingRecordsBook' }"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center text-xl"
      >
        <DatabaseScriptPlus />
        <span class="ml-2">REGISTRAR</span>
      </router-link>
    </template>

    <template v-else>
      <!-- Botón deshabilitado con tooltip -->
      <span
        class="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center text-xl opacity-50 cursor-not-allowed"
      >
        <DatabaseScriptPlus />
        <span class="ml-2">REGISTRAR</span>
      </span>

      <!-- Tooltip flotante -->
      <div
        class="absolute z-10 w-64 px-3 py-2 text-sm text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -top-20 left-1/2 transform -translate-x-1/2"
      >
        <!-- Iniciaremos nuestro registro al iniciar el día siguiente. <br /> -->
        <strong class="block mt-2">Tiempo restante:</strong>
        <strong class="block text-center mt-1">{{ countdown }}</strong>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { DatabaseScriptPlus } from "@iconoir/vue";
import { useCashEventStore } from "@/stores/cashEventStore";

const cashEventStore = useCashEventStore();
const dayClosure = cashEventStore.hasClosureForToday;

const isDisabled = computed(() => dayClosure.value);

// 🕒 Contador hasta medianoche
const countdown = ref("");
let interval;

const updateCountdown = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const diff = midnight - now;

  if (diff <= 0) {
    countdown.value = "00:00:00";
    clearInterval(interval);
    return;
  }

  const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, "0");
  const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0");
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

  countdown.value = `${hours}:${minutes}:${seconds}`;
};

onMounted(() => {
  updateCountdown();
  interval = setInterval(updateCountdown, 1000);
});

onBeforeUnmount(() => {
  clearInterval(interval);
});
</script>
