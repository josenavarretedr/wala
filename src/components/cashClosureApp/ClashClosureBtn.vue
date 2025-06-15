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
      <div v-if="dayClosure" class="flex items-center">
        <FireFlame />
        <span class="ml-2">{{ streak }} ARQUEO</span>
      </div>

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
            <span class="ml-2">{{ streak }} ARQUEOS</span>
          </div>
        </template>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Safe, FireFlame } from "@iconoir/vue";
import { useCashEventStore } from "@/stores/cashEventStore";

const cashEventStore = useCashEventStore();
const isHovered = ref(false);
const dayClosure = cashEventStore.hasClosureForToday;
const streak = cashEventStore.streakCashEvents;

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

await cashEventStore.getAllCashEvents();
await cashEventStore.getCashEventForToday("closure");
</script>
