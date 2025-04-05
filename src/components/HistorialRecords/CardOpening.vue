<template>
  <div class="bg-white shadow-md rounded-lg p-4 flex flex-col text-green-600">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <safe class="w-7 h-7" />
        <h3 class="text-xl font-bold">Apertura de caja</h3>
      </div>
      <p class="text-sm text-gray-500">{{ formatedDate(record.createdAt) }}</p>
    </div>
    <div class="flex justify-between mt-2 text-sm">
      <div>
        <p>
          Efectivo inicial: <strong>S/. {{ record.totalCash ?? 0 }}</strong>
        </p>
        <p>
          Banco inicial: <strong>S/. {{ record.totalBank ?? 0 }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Safe } from "@iconoir/vue";
const props = defineProps({ record: Object });

function formatedDate(date) {
  if (!date) return "-";
  const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  return d.toLocaleString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
</script>
