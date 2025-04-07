<template>
  <div
    class="bg-white shadow-md rounded-lg p-4 flex flex-col"
    :class="{
      'text-blue-500': record.type === 'income',
      'text-red-500': record.type !== 'income',
    }"
  >
    <!-- Sección de Detalle y cuentas -->
    <div class="flex items-center align-middle justify-between">
      <div class="flex items-baseline align-middle">
        <router-link
          :to="{
            name: 'DetailsRecords',
            params: { registerId: record.uuid },
          }"
          class="ml-auto text-x"
        >
          <InfoCircle class="w-5 h-5 mr-2 cursor-pointer" />
        </router-link>

        <div
          v-if="record.type === 'income'"
          class="flex flex-row bg-white text-blue-500 border border-blue-500 items-center align-middle p-1 rounded-lg mr-2"
        >
          <GraphUp />
          <span>Venta</span>
        </div>

        <div
          v-else
          class="flex flex-row items-center bg-white text-red-500 border border-red-500 align-middle p-1 rounded-lg mr-2"
        >
          <DatabaseExport />
          <span>Salió</span>
        </div>

        <div
          v-if="record.account === 'cash'"
          class="flex flex-row bg-white text-green-500 border border-green-500 items-center align-middle p-1 rounded-lg"
        >
          <Coins />
          <span>Efectivo</span>
        </div>

        <div
          v-else
          class="flex flex-row items-center bg-white text-purple-500 border border-purple-500 align-middle p-1 rounded-lg"
        >
          <SmartphoneDevice />
          <span>Yape/Plin</span>
        </div>
      </div>

      <!-- Sección de Cantidad -->
      <div class="flex flex-col items-end">
        <p class="text-xl font-bold">S/. {{ record.total.toFixed(2) }}</p>
      </div>
    </div>

    <!-- Sección de fecha -->
    <div
      class="mt-3 text-xs text-gray-400 flex items-center align-middle italic"
    >
      {{ formatedDate(record.createdAt) }}
    </div>
  </div>
</template>

<script setup>
import {
  GraphUp,
  DatabaseExport,
  Coins,
  SmartphoneDevice,
  InfoCircle,
} from "@iconoir/vue";

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
});

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
