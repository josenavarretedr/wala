<template>
  <div class="bg-white shadow-md rounded-lg p-4 flex flex-col text-purple-600">
    <!-- Título + Acción -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <Safe class="w-7 h-7" />
        <h3 class="text-xl font-bold">Cierre del día</h3>
      </div>

      <!-- Acceso al detalle si existe -->
      <router-link
        :to="{
          name: 'CashClosureDetails',
          params: { cashClosureId: idClosure },
        }"
        class="text-purple-600 hover:text-purple-800"
      >
        <InfoCircle class="w-6 h-6 cursor-pointer" />
      </router-link>
    </div>

    <!-- Contenido principal -->
    <div class="flex flex-col md:flex-row md:justify-between mt-2">
      <!-- Estado -->
      <!-- <div class="flex flex-col mb-2 md:mb-0">
        <span class="text-sm text-gray-500">Estado</span>
        <span
          class="inline-block px-2 py-1 text-xs font-semibold border border-purple-600 rounded-full"
          >"Arqueo realizado"
        </span>
      </div> -->

      <!-- Última actualización -->
      <div class="flex flex-col">
        <span class="text-sm text-gray-500">Última actualización</span>
        <span class="text-base font-semibold text-purple-700">
          {{ formatedDate(cashClosure?.date) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Safe, InfoCircle } from "@iconoir/vue";
import { useCashClosureStore } from "@/stores/cashClosureStore";

const cashClosureStore = useCashClosureStore();

const idClosure = ref("");
const cashClosure = ref(null);

// Inicialización al cargar el componente
const setupCard = () => {
  if (cashClosureStore.cashClosureForToday.value.length > 0) {
    const cierre = cashClosureStore.cashClosureForToday.value[0];
    idClosure.value = cierre.uuid;
    cashClosure.value = cierre;
  }
};

setupCard();

const formatedDate = (date) => {
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
};
</script>
