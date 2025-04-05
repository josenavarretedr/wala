<template>
  <div class="bg-white shadow-md rounded-lg p-4 flex flex-col text-purple-600">
    <!-- Título + Acción -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <Safe class="w-7 h-7" />
        <h3 class="text-xl font-bold">Cierre del día</h3>
      </div>

      <router-link
        :to="{
          name: 'CashClosureDetails',
          params: { cashClosureId: record.eventUuid || record.uuid },
        }"
        class="text-purple-600 hover:text-purple-800"
      >
        <InfoCircle class="w-6 h-6 cursor-pointer" />
      </router-link>
    </div>

    <!-- Contenido principal -->
    <div class="flex flex-col md:flex-row md:justify-between mt-2">
      <!-- Última actualización -->
      <div class="flex flex-col">
        <span class="text-sm text-gray-500">Última actualización</span>
        <span class="text-base font-semibold text-purple-700">
          {{ formatedDate(record.createdAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Safe, InfoCircle } from "@iconoir/vue";

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
});

function formatedDate(timestamp) {
  if (!timestamp) return "-";
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  return date.toLocaleString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
</script>
