<template>
  <!-- Historial de Ahorros -->
  <div class="w-full max-w-3xl mt-6">
    <h3 class="text-xl font-bold text-gray-700 mb-4">Registros diarios</h3>
    <div class="space-y-4">
      <template v-if="initialDailyData && initialDailyData.length">
        <!-- Itera sobre el historial de ahorros -->
        <div
          v-for="(record, index) in dataOrdenada"
          :key="index"
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
              <p class="text-xl font-bold">
                S/.
                {{
                  new Intl.NumberFormat("es-PE").format(
                    record.items.reduce((sum, item) => sum + item.price, 0)
                  )
                }}.00
              </p>
            </div>
          </div>
          <div
            class="mt-3 text-xs text-gray-500 flex items-center align-middle"
          >
            <p class="text-gray-500 mr-3">
              {{ formatedDate(record.timestamp) }}
            </p>
          </div>
        </div>
      </template>

      <!-- Si dailyData es null o está vacío -->
      <template v-else>
        <div
          class="bg-white shadow-md rounded-lg p-4 flex items-center justify-center"
        >
          <p class="text-lg font-semibold text-gray-800">
            No tienes ahorros todavía.
          </p>
        </div>
      </template>
      <!-- TODO hacer un div para los savings que están pendientes de aprobación -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

import {
  GraphUp,
  DatabaseExport,
  Coins,
  SmartphoneDevice,
  InfoCircle,
} from "@iconoir/vue"; // Importar iconos de Iconoir

const props = defineProps({
  initialDailyData: {
    type: Array,
    default: () => [],
  },
});

const dataOrdenada = computed(() => {
  return props.initialDailyData.sort((a, b) => {
    return b.timestamp.seconds - a.timestamp.seconds;
  });
});

const formatedDate = (timestamp) => {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  return date.toLocaleString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
</script>
