<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p class="text-sm text-gray-500 font-medium mb-1">Total inscritos</p>
      <p class="text-3xl font-bold text-gray-900">{{ totalParticipants }}</p>
      <p class="text-xs text-gray-400 mt-1">participantes del programa</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p class="text-sm text-gray-500 font-medium mb-1">Completados</p>
      <p class="text-3xl font-bold text-green-600">{{ completedCount }}</p>
      <p class="text-xs text-gray-400 mt-1">actividades completas</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p class="text-sm text-gray-500 font-medium mb-1">Pendientes</p>
      <p class="text-3xl font-bold text-yellow-600">{{ pendingCount }}</p>
      <p class="text-xs text-gray-400 mt-1">por completar</p>
    </div>
    <div
      v-if="hasAttendance"
      class="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
    >
      <p class="text-sm text-gray-500 font-medium mb-1">Asistencia</p>
      <p class="text-3xl font-bold text-blue-600">{{ attendancePercent }}%</p>
      <p class="text-xs text-gray-400 mt-1">
        {{ attendedCount }} / {{ totalParticipants }} asistieron
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  matrix: { type: Array, default: () => [] },
  hasAttendance: { type: Boolean, default: false },
});

const matrixRows = computed(() => [...props.matrix]);

const totalParticipants = computed(() => matrixRows.value.length);
const completedCount = computed(
  () => matrixRows.value.filter((r) => r.isComplete).length,
);
const pendingCount = computed(
  () => totalParticipants.value - completedCount.value,
);
const attendedCount = computed(
  () => matrixRows.value.filter((r) => r.hasAttendance).length,
);
const attendancePercent = computed(() => {
  if (!totalParticipants.value) return 0;
  return Math.round((attendedCount.value / totalParticipants.value) * 100);
});
</script>
