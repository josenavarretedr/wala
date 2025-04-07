<template>
  <div
    class="bg-white shadow-md rounded-lg p-4 md:p-6 flex flex-col text-purple-600 hover:shadow-lg transition-shadow"
  >
    <!-- Encabezado -->
    <div
      class="flex items-center justify-between mb-2 cursor-pointer"
      @click="toggleOpen"
    >
      <!-- Izquierda: ícono + texto (texto oculto en móvil) -->
      <div class="flex items-center gap-3">
        <router-link
          :to="{
            name: 'CashClosureDetails',
            params: { cashClosureId: record.eventUuid || record.uuid },
          }"
          class="text-purple-600 hover:text-purple-800 w-6 h-6"
        >
          <InfoCircle class="w-6 h-6 cursor-pointer" />
        </router-link>
        <Safe class="w-6 h-6 md:w-7 md:h-7" />
        <h3 class="hidden md:block text-xl font-bold ml-0">Cierre</h3>
      </div>

      <!-- Derecha: ícono de expansión -->
      <div class="flex items-center gap-2">
        <ArrowDown
          :class="[
            'w-6 h-6 md:w-5 md:h-5 transform transition-transform duration-300',
            isOpen ? 'rotate-180' : 'rotate-0',
          ]"
        />
      </div>
    </div>

    <!-- Contenido expandible -->
    <Transition name="fade-scale">
      <div v-if="isOpen" class="mt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            class="flex flex-col items-start border border-green-500 rounded-lg p-4 bg-green-50 w-full"
          >
            <p class="text-sm text-gray-500 mb-1">Efectivo final</p>
            <p class="text-2xl font-bold text-green-700">
              S/. {{ record.totalCash ?? 0 }}
            </p>
          </div>

          <div
            class="flex flex-col items-start border border-purple-500 rounded-lg p-4 bg-purple-50 w-full"
          >
            <p class="text-sm text-gray-500 mb-1">Banco final</p>
            <p class="text-2xl font-bold text-purple-700">
              S/. {{ record.totalBank ?? 0 }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
    <!-- Fecha -->
    <div class="text-xs text-gray-400 mt-4 italic">
      {{ formatedDate(record.createdAt) }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Safe, ArrowDown, InfoCircle } from "@iconoir/vue";

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
});

const isOpen = ref(false);
const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

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

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
