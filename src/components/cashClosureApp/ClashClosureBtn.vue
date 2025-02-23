<template>
  <div>
    <router-link
      :to="
        dayClosure
          ? { name: 'CashClosureDetails', params: { cashClosureId: idClosure } }
          : { name: 'CashClosureApp' }
      "
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      :class="[
        'px-4 py-2 border rounded-lg flex items-center text-xl',
        dayClosure
          ? 'bg-orange-600 text-white'
          : isHovered
          ? 'border-purple-600 text-purple-600'
          : 'border-gray-400 text-gray-400',
      ]"
    >
      <!-- Caso: Existe arqueo para el día -->
      <div v-if="dayClosure" class="flex items-center">
        <FireFlame />
        <span class="ml-2"
          >{{ cashClosureStore.streakCashClosures }} ARQUEOS</span
        >
      </div>

      <!-- Caso: No existe arqueo para el día -->
      <div v-else>
        <template v-if="isHovered">
          <div class="flex items-center">
            <Safe />
            <span class="ml-2">ARQUEAR</span>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center">
            <FireFlame />
            <span class="ml-2"
              >{{ cashClosureStore.streakCashClosures }} ARQUEOS</span
            >
          </div>
        </template>
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
const isHovered = ref(false);

const setupInitBtn = async () => {
  await cashClosureStore.getCashClosureForToday();
  await cashClosureStore.getAllCashClosures();
  if (cashClosureStore.cashClosureForToday.value.length > 0) {
    dayClosure.value = true;
    idClosure.value = cashClosureStore.cashClosureForToday.value[0].uuid;
    return;
  }
};

await setupInitBtn();
</script>
