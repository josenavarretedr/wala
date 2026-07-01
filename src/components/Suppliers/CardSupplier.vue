<template>
  <div
    @click="$emit('click')"
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 transition-all duration-200 hover:shadow-md hover:border-purple-200 cursor-pointer flex flex-col justify-between h-44 relative group"
  >
    <!-- Top Section: Name and Badges -->
    <div>
      <div class="flex items-start justify-between gap-3">
        <h3 class="font-bold text-gray-900 text-base sm:text-lg truncate flex-1 leading-tight group-hover:text-purple-700 transition-colors">
          {{ supplier.name }}
        </h3>
        
        <!-- Action details indicator -->
        <div class="text-gray-300 group-hover:text-purple-400 transition-colors flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <!-- Badges row -->
      <div class="flex flex-wrap items-center gap-1.5 mt-2">
        <span
          v-if="supplier.isPartner"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100 shrink-0"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
          Socio
        </span>
        <span
          v-if="supplier.pendingBalance > 0"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100 shrink-0 animate-pulse"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Debe
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100 shrink-0"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Al día
        </span>
      </div>

      <!-- Contact details -->
      <p v-if="supplier.phone" class="text-xs text-gray-400 mt-2.5 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span class="tabular-nums">{{ supplier.phone }}</span>
      </p>
    </div>

    <!-- Bottom Section: Metrics -->
    <div class="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between text-xs sm:text-sm text-gray-600">
      <div>
        <span class="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Total Comprado</span>
        <span class="font-bold text-gray-800 tabular-nums">S/ {{ (supplier.totalExpenses || 0).toFixed(2) }}</span>
      </div>
      <div class="text-right">
        <span class="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Saldo Pendiente</span>
        <span :class="['font-extrabold tabular-nums', supplier.pendingBalance > 0 ? 'text-red-600' : 'text-gray-800']">
          S/ {{ (supplier.pendingBalance || 0).toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  supplier: {
    type: Object,
    required: true
  }
});
defineEmits(['click']);
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
</style>
