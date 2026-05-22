<template>
  <div class="space-y-4">
    <!-- Grid de filtros por tipo -->
    <div class="p-2 sm:p-4 lg:px-8 lg:py-4">
      <!-- Grid móvil: 4 columnas -->
      <div class="grid grid-cols-4 gap-2 mx-auto lg:hidden max-w-md">
        <button
          v-for="item in items"
          :key="item.id"
          :class="[
            'group bg-white rounded-xl shadow-sm border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer p-2.5 sm:p-3',
            isActive(item.id)
              ? 'border-[#E35336] ring-2 ring-[#E35336]/20 bg-[#E35336]/10'
              : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50',
          ]"
          @click="handleClick(item.id)"
        >
          <component
            :is="item.icon"
            :class="[
              'mb-1.5 transition-all duration-200 w-6 h-6 sm:w-7 sm:h-7',
              isActive(item.id) ? 'text-[#E35336]' : 'text-gray-400 group-hover:text-gray-600',
            ]"
          />
          <div
            :class="[
              'text-center px-0.5 text-xs font-semibold leading-tight line-clamp-2',
              isActive(item.id) ? 'text-[#c2412b] font-bold' : 'text-gray-500 group-hover:text-gray-700',
            ]"
          >
            {{ item.shortName }}
          </div>
        </button>
      </div>

      <!-- Grid desktop: 4 columnas en una fila -->
      <div class="hidden lg:grid lg:grid-cols-4 lg:gap-4 xl:gap-5 lg:max-w-5xl lg:mx-auto lg:items-stretch">
        <button
          v-for="item in items"
          :key="item.id"
          :class="[
            'group bg-white rounded-2xl shadow-sm border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer p-5 min-h-[130px]',
            isActive(item.id)
              ? 'border-[#E35336] ring-4 ring-[#E35336]/10 bg-[#E35336]/10 scale-[1.02]'
              : 'border-gray-100 hover:border-[#E35336]/20 hover:bg-[#E35336]/5 hover:shadow-md hover:-translate-y-0.5',
          ]"
          @click="handleClick(item.id)"
        >
          <div
            :class="[
              'mb-3 p-3 rounded-xl transition-all duration-200',
              isActive(item.id) ? 'bg-[#E35336]/10 text-[#E35336]' : 'bg-gray-50 text-gray-400 group-hover:bg-[#E35336]/10 group-hover:text-[#E35336]',
            ]"
          >
            <component
              :is="item.icon"
              class="w-8 h-8 xl:w-9 xl:h-9 transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div
            :class="[
              'text-center px-1 text-sm font-semibold tracking-wide uppercase',
              isActive(item.id) ? 'text-[#8b2413] font-bold' : 'text-gray-500 group-hover:text-[#c2412b]',
            ]"
          >
            {{ item.name }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Reports, GraphUp, WarningTriangle, Calendar } from "@iconoir/vue";

const router = useRouter();
const route = useRoute();

const activeTab = computed(() => route.query.tab || "resumen");

const items = [
  {
    id: "resumen",
    name: "Resumen",
    shortName: "Resumen",
    icon: Reports,
  },
  {
    id: "madurez",
    name: "Niveles de Madurez",
    shortName: "Madurez",
    icon: GraphUp,
  },
  {
    id: "areas-criticas",
    name: "Áreas Críticas",
    shortName: "Críticas",
    icon: WarningTriangle,
  },
  {
    id: "plan-accion",
    name: "Plan de Acción",
    shortName: "Plan",
    icon: Calendar,
  },
];

const isActive = (itemId) => {
  return activeTab.value === itemId;
};

const handleClick = (itemId) => {
  router.push({
    query: {
      ...route.query,
      tab: itemId,
    },
  });
};
</script>

<style scoped>
button {
  outline: none;
}
</style>
