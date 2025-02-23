<template>
  <div>
    <router-link
      :to="
        dayClosure
          ? {
              name: 'CashClosureDetails',
              params: {
                cashClosureId: idClosure,
              },
            }
          : { name: 'CashClosureApp' }
      "
      :class="[
        'px-4 py-2 border rounded-lg flex items-center text-xl',
        dayClosure
          ? 'bg-orange-600 text-white'
          : 'border-purple-600 text-purple-600',
      ]"
    >
      <div v-if="dayClosure" class="flex items-center">
        <FireFlame />
        <span class="ml-2"
          >{{ cashClosureStore.streakCashClosures }} ARQUEOS</span
        >
      </div>
      <div v-else class="flex items-center">
        <Safe /> <span class="ml-2">ARQUEAR</span>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Safe, FireFlame } from "@iconoir/vue";
import { useCashClosureStore } from "@/stores/cashClosureStore";
const cashClosureStore = useCashClosureStore();

const dayClosure = ref(false);
const idClosure = ref("");

const closeDay = async () => {
  await cashClosureStore.getCashClosureForToday();
  await cashClosureStore.getAllCashClosures();
  if (cashClosureStore.cashClosureForToday.value.length > 0) {
    dayClosure.value = true;
    idClosure.value = cashClosureStore.cashClosureForToday.value[0].uuid;
    return;
  }
};

await closeDay();
</script>
