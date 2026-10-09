<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-100 mb-24">
    <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
      <h2 class="text-base sm:text-lg font-bold text-gray-900">
        Registro de Asistencia
      </h2>
      <p class="text-xs sm:text-sm text-gray-600 mt-1">
        Marca la asistencia de los participantes
      </p>
    </div>

    <div class="p-4 sm:p-6">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-8">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"
        ></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!participants.length" class="text-center py-12">
        <p class="text-xs sm:text-sm text-gray-500">
          No hay participantes inscritos en el programa
        </p>
      </div>

      <!-- Lista de Cards de Asistencia -->
      <div v-else class="space-y-3">
        <AttendanceCard
          v-for="participant in participants"
          :key="participant.userId"
          :participant="participant"
          :attendance="
            attendanceMap[participant.userId] || {
              attended: false,
              notes: '',
            }
          "
          @update="$emit('update', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import AttendanceCard from "../AttendanceCard.vue";

defineProps({
  participants: {
    type: Array,
    default: () => [],
  },
  attendanceMap: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update"]);
</script>
