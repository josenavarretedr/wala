<template>
  <div class="bg-white shadow-md rounded-lg p-4 flex flex-col text-indigo-600">
    <div class="flex justify-between items-center mb-2">
      <div class="flex items-center gap-2">
        <repeat class="w-6 h-6" />
        <h3 class="text-md font-bold">Transferencia</h3>
      </div>
      <p class="text-sm text-gray-500">{{ formatedDate(record.createdAt) }}</p>
    </div>
    <p class="text-sm">
      De <strong>{{ record.originAccount }}</strong> a
      <strong>{{ record.destinationAccount }}</strong>
    </p>
    <p class="text-base font-semibold mt-1">
      S/. {{ record.total?.toFixed(2) }}
    </p>
  </div>
</template>

<script setup>
import { Repeat } from "@iconoir/vue";
const props = defineProps({ record: Object });

function formatedDate(date) {
  if (!date) return "-";
  const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  return d.toLocaleString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
</script>
