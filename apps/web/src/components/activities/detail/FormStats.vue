<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p class="text-sm text-gray-500 font-medium mb-1">Participaciones</p>
      <p class="text-3xl font-bold text-gray-900">{{ totalParticipants }}</p>
      <p class="text-xs text-gray-400 mt-1">formularios completados</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p class="text-sm text-gray-500 font-medium mb-1">Campos de asistencia</p>
      <p class="text-3xl font-bold text-green-600">{{ attendanceFields }}</p>
      <p class="text-xs text-gray-400 mt-1">
        {{
          attendanceFields === 1
            ? "campo de asistencia"
            : "campos de asistencia"
        }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalParticipants: { type: Number, default: 0 },
  attendanceFields: { type: Number, default: 0 },
});
</script>
