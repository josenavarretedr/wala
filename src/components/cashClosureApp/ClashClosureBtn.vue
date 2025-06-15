<template>
  <div>
    <router-link
      :to="linkTo"
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
      <div class="flex items-center">
        <component :is="currentIcon" />
        <span class="ml-2">{{ currentText }}</span>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Safe, FireFlame } from "@iconoir/vue";
import { useCashEventStore } from "@/stores/cashEventStore";

// Store
const cashEventStore = useCashEventStore();

// Estado local
const isHovered = ref(false);

// Datos del store
const dayClosure = cashEventStore.hasClosureForToday;
const streak = cashEventStore.streakCashEvents;

// Computados para el link
const uuidTodayClosure = computed(() => {
  return cashEventStore.cashEventsForToday.value[0]?.uuid || null;
});

const linkTo = computed(() => {
  if (dayClosure.value && uuidTodayClosure.value) {
    return {
      name: "CashClosureAll",
    };
  } else {
    return {
      name: "CashClosureApp",
    };
  }
});

// Computados para icono y texto
const currentIcon = computed(() => {
  if (dayClosure.value) return FireFlame;
  return isHovered.value ? Safe : FireFlame;
});

const currentText = computed(() => {
  if (dayClosure.value) return `${streak.value} ARQUEO`;
  return isHovered.value ? "ARQUEAR" : `${streak.value} ARQUEOS`;
});

// Inicializa datos
await cashEventStore.getAllCashEvents();
await cashEventStore.getCashEventForToday("closure");
</script>
