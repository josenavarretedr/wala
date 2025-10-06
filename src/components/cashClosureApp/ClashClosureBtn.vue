<template>
  <div class="relative group w-full">
    <router-link
      :to="linkTo"
      :class="[
        'w-full py-3 px-4 sm:py-4 sm:px-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm',
        dayClosure.value
          ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-orange-500/25 hover:from-orange-700 hover:to-orange-800 hover:shadow-orange-500/35'
          : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/25 hover:from-purple-700 hover:to-purple-800 hover:shadow-purple-500/35',
      ]"
    >
      <component
        :is="currentIcon"
        class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
      />
      <span class="font-bold tracking-wide text-sm sm:text-base truncate">{{
        currentText
      }}</span>

      <!-- Indicador de streak cuando está activo -->
      <div
        v-if="dayClosure.value && streak > 1"
        class="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center"
      >
        <span class="text-xs font-bold text-white">{{ streak }}</span>
      </div>
    </router-link>

    <!-- Tooltip informativo -->
    <!-- <div
      class="absolute z-20 w-56 sm:w-64 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-white bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-xl shadow-gray-900/25 opacity-0 group-hover:opacity-100 transition-all duration-300 -top-16 sm:-top-20 left-1/2 transform -translate-x-1/2 border border-gray-700/50 backdrop-blur-sm pointer-events-none"
    > -->
    <!-- Flecha del tooltip -->
    <!-- <div
        class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"
      ></div>

      <div class="text-center">
        <div class="flex items-center justify-center gap-2 mb-2">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              dayClosure.value
                ? 'bg-orange-400 animate-pulse'
                : 'bg-purple-400',
            ]"
          ></div>
          <span
            class="font-medium"
            :class="dayClosure.value ? 'text-orange-200' : 'text-purple-200'"
          >
            {{ dayClosure.value ? "Día cerrado" : "Día activo" }}
          </span>
        </div>
        <p class="text-gray-300 text-xs mb-2">
          {{
            dayClosure.value
              ? "Consulta el arqueo realizado para hoy"
              : "Realiza el arqueo de caja para cerrar el día"
          }}
        </p>
        <div
          v-if="streak > 0"
          class="bg-gray-700/50 rounded-lg p-2 border border-gray-600/30"
        >
          <span class="text-xs text-gray-400">Racha actual:</span>
          <div class="font-bold text-blue-300">
            {{ streak }} día{{ streak !== 1 ? "s" : "" }}
          </div>
        </div>
      </div> -->
    <!-- </div> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Safe, FireFlame } from "@iconoir/vue";
import { useCashEventStore } from "@/stores/cashEventStore";

// Store
const cashEventStore = useCashEventStore();

// Computed properties para datos del store
const dayClosure = computed(() => cashEventStore.hasClosureForToday);
const streak = computed(() => cashEventStore.streakCashEvents?.value || 0);

// Computados para el link
const uuidTodayClosure = computed(() => {
  return cashEventStore.cashEventsForToday?.value?.[0]?.uuid || null;
});

const linkTo = computed(() => {
  if (dayClosure.value?.value && uuidTodayClosure.value) {
    return { name: "CashClosureAll" };
  } else {
    return { name: "CashClosureApp" };
  }
});

// Computados para icono y texto
const currentIcon = computed(() => {
  return dayClosure.value?.value ? FireFlame : Safe;
});

const currentText = computed(() => {
  const streakValue = streak.value || 0;
  if (dayClosure.value?.value) {
    return `ARQUEO ${streakValue > 0 ? `(${streakValue})` : ""}`;
  }
  return `ARQUEAR`;
});

// Función para inicializar datos
const initializeData = async () => {
  try {
    await Promise.all([
      cashEventStore.getAllCashEvents(),
      cashEventStore.getCashEventForToday("closure"),
    ]);
  } catch (error) {
    console.error("Error al cargar datos de cash events:", error);
  }
};

// Lifecycle
onMounted(() => {
  initializeData();
});

// Exponer funciones si se necesitan desde el componente padre
defineExpose({
  initializeData,
});
</script>
