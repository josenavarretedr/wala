<template>
  <div>
    <router-link
      :to="
        dayClosure
          ? { name: 'CashClosureDetails', params: { cashClosureId: idClosure } }
          : { name: 'CashClosureApp' }
      "
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      :class="[
        'px-4 py-2 border rounded-lg flex items-center text-xl transition-all duration-300 ease-in-out',
        dayClosure
          ? 'bg-orange-600 text-white'
          : isHovered
          ? 'border-purple-600 text-purple-600 scale-105 shadow-md'
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
        <transition name="fade" mode="out-in">
          <div v-if="isHovered" key="hover" class="flex items-center">
            <Safe />
            <span class="ml-2">ARQUEAR</span>
          </div>
          <div v-else key="default" class="flex items-center">
            <FireFlame />
            <span class="ml-2"
              >{{ cashClosureStore.streakCashClosures }} ARQUEOS</span
            >
          </div>
        </transition>
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
let hoverTimeout = null;

const setupInitBtn = async () => {
  await cashClosureStore.getCashClosureForToday();
  await cashClosureStore.getAllCashClosures();
  if (cashClosureStore.cashClosureForToday.value.length > 0) {
    dayClosure.value = true;
    idClosure.value = cashClosureStore.cashClosureForToday.value[0].uuid;
  }
};

const handleMouseEnter = () => {
  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    isHovered.value = true;
  }, 150); // Retraso ligero para evitar cambios bruscos
};

const handleMouseLeave = () => {
  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    isHovered.value = false;
  }, 150);
};

await setupInitBtn();
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
