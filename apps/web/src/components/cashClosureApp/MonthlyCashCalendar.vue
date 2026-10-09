<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useCashEventStore } from "@/stores/cashEventStore";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subMonths,
  addMonths,
  isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { RouterLink } from "vue-router";

const cashEventStore = useCashEventStore();
const { allCashEvents, getAllCashEvents } = cashEventStore;

const currentMonth = ref(new Date());

const daysInMonth = computed(() => {
  const start = startOfMonth(currentMonth.value);
  const end = endOfMonth(currentMonth.value);
  return eachDayOfInterval({ start, end });
});

const getWeekdayOffset = computed(() =>
  getDay(startOfMonth(currentMonth.value))
);

const goToPreviousMonth = () => {
  currentMonth.value = subMonths(currentMonth.value, 1);
};

const goToNextMonth = () => {
  currentMonth.value = addMonths(currentMonth.value, 1);
};

const getClosureEventForDay = (date) => {
  return allCashEvents.value.find(
    (event) =>
      event.type === "closure" &&
      event.createdAt?.seconds &&
      isSameDay(new Date(event.createdAt.seconds * 1000), date)
  );
};

onMounted(async () => {
  await getAllCashEvents();
});

watch(currentMonth, async () => {
  await getAllCashEvents();
});
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <button
        @click="goToPreviousMonth"
        class="text-lg font-bold text-gray-700"
      >
        &lt;
      </button>
      <h2 class="text-xl font-bold text-gray-800 tracking-wide">
        {{ format(currentMonth, "MMMM yyyy", { locale: es }) }}
      </h2>
      <button @click="goToNextMonth" class="text-lg font-bold text-gray-700">
        &gt;
      </button>
    </div>

    <div class="grid grid-cols-7 gap-2 text-center text-sm text-gray-500 mb-2">
      <div v-for="day in ['D', 'L', 'M', 'M', 'J', 'V', 'S']" :key="day">
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-2 text-center">
      <div v-for="n in getWeekdayOffset" :key="'empty-' + n" class="h-10"></div>

      <div
        v-for="day in daysInMonth"
        :key="day.toISOString()"
        :class="[
          'h-10 flex items-center justify-center rounded-lg shadow-md text-lg font-semibold transition-all duration-150',
          getClosureEventForDay(day)
            ? 'bg-orange-500 text-white shadow-lg'
            : 'bg-white text-gray-700',
        ]"
      >
        <template v-if="getClosureEventForDay(day)">
          <RouterLink
            :to="{
              name: 'CashClosureDetails',
              params: { cashClosureId: getClosureEventForDay(day).uuid },
            }"
            class="w-full h-full flex items-center justify-center"
          >
            {{ format(day, "d") }}
          </RouterLink>
        </template>
        <template v-else>
          {{ format(day, "d") }}
        </template>
      </div>
    </div>
  </div>
</template>
