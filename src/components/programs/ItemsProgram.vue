<template>
  <div class="space-y-4">
    <!-- Grid de filtros por tipo -->
    <div class="p-2 sm:p-4 lg:px-8 lg:py-4">
      <!-- Grid móvil: columnas dinámicas según cantidad de filtros visibles -->
      <div
        :class="[
          'grid gap-2 mx-auto lg:hidden',
          mobileGridColsClass,
          items.length <= 3 ? 'max-w-sm' : 'max-w-md',
        ]"
      >
        <button
          v-for="item in items"
          :key="item.id"
          :class="[
            'group bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer',
            'col-span-1 p-2.5 sm:p-3',
            item.color === 'gray' &&
              'hover:shadow-lg hover:border-gray-300 hover:bg-gray-50',
            item.color === 'blue' &&
              'hover:shadow-lg hover:border-blue-300 hover:bg-blue-50',
            item.color === 'purple' &&
              'hover:shadow-lg hover:border-purple-300 hover:bg-purple-50',
            item.color === 'orange' &&
              'hover:shadow-lg hover:border-orange-300 hover:bg-orange-50',
            item.color === 'green' &&
              'hover:shadow-lg hover:border-green-300 hover:bg-green-50',
            item.color === 'indigo' &&
              'hover:shadow-lg hover:border-indigo-300 hover:bg-indigo-50',
            isActive(item.id) && 'ring-2 ring-offset-2',
            isActive(item.id) && item.color === 'blue' && 'ring-blue-500',
            isActive(item.id) && item.color === 'purple' && 'ring-purple-500',
            isActive(item.id) && item.color === 'orange' && 'ring-orange-500',
          ]"
          @click="handleClick(item)"
        >
          <component
            :is="item.icon"
            :class="[
              'mb-1 transition-all duration-200',
              'w-6 h-6 sm:w-8 sm:h-8',
              getIconColor(item.color),
              getIconHoverColor(item.color),
            ]"
          />
          <div
            :class="[
              'text-center px-1',
              'text-gray-600 font-medium',
              'text-xs sm:text-sm',
            ]"
          >
            {{ item.name }}
          </div>
        </button>
      </div>

      <!-- Grid desktop: 5 columnas en una fila -->
      <div
        class="hidden lg:grid lg:grid-cols-5 lg:gap-4 xl:gap-5 lg:max-w-7xl xl:max-w-[1600px] lg:mx-auto lg:items-stretch"
      >
        <button
          v-for="item in items"
          :key="item.id"
          :class="[
            'group bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer',
            'col-span-1',
            'p-4 min-h-[140px]',
            item.color === 'gray' &&
              'hover:shadow-lg hover:border-gray-300 hover:bg-gray-50',
            item.color === 'blue' &&
              'hover:shadow-lg hover:border-blue-300 hover:bg-blue-50',
            item.color === 'purple' &&
              'hover:shadow-lg hover:border-purple-300 hover:bg-purple-50',
            item.color === 'orange' &&
              'hover:shadow-lg hover:border-orange-300 hover:bg-orange-50',
            item.color === 'green' &&
              'hover:shadow-lg hover:border-green-300 hover:bg-green-50',
            item.color === 'indigo' &&
              'hover:shadow-lg hover:border-indigo-300 hover:bg-indigo-50',
            isActive(item.id) && 'ring-2 ring-offset-2',
            isActive(item.id) && item.color === 'blue' && 'ring-blue-500',
            isActive(item.id) && item.color === 'purple' && 'ring-purple-500',
            isActive(item.id) && item.color === 'orange' && 'ring-orange-500',
          ]"
          @click="handleClick(item)"
        >
          <component
            :is="item.icon"
            :class="[
              'mb-2 transition-all duration-200 w-12 h-12 xl:w-14 xl:h-14',
              getIconColor(item.color),
              getIconHoverColor(item.color),
            ]"
          />
          <div
            :class="[
              'text-center px-1',
              'text-gray-600 font-medium',
              'text-sm xl:text-base',
            ]"
          >
            {{ item.name }}
          </div>
        </button>
      </div>

      <!-- Filtro de Estado (Completados/Pendientes/Todos) -->
      <div
        v-if="showStatusFilter"
        class="max-w-7xl mx-auto mt-11 px-4 sm:px-6 lg:px-8"
      >
        <div
          class="flex items-center gap-1.5 bg-white rounded-lg shadow-sm border border-gray-200 p-0.5 min-w-[260px] max-w-sm mx-auto"
        >
          <button
            v-for="status in statusFilters"
            :key="status.id"
            @click="handleStatusFilter(status.id)"
            :class="[
              'flex-1 py-1.5 px-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200',
              activeStatusFilter === status.id
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            {{ status.name }}
          </button>
        </div>
      </div>

      <!-- Filtro de Etapa -->
      <!-- <div
        v-if="stages.length > 0"
        class="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8"
      >
        <div class="max-w-md mx-auto relative">
          <select
            :value="activeStageFilter"
            @change="handleStageFilter($event.target.value)"
            class="w-full py-2 px-3 pr-10 bg-white rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
          >
            <option value="all">Todas las etapas</option>
            <option v-for="stage in stages" :key="stage.id" :value="stage.id">
              {{ stage.name }}
            </option>
            <option value="none">Sin etapa</option>
          </select>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { List, Book, GraphUp, Calendar, Community, Map } from "@iconoir/vue";
import { useUserStore } from "@/stores/useUserStore";

const props = defineProps({
  programId: {
    type: String,
    required: true,
  },
  activeTab: {
    type: String,
    default: "all",
  },
  activities: {
    type: Array,
    default: () => [],
  },
  stages: {
    type: Array,
    default: () => [],
  },
  showStatusFilter: {
    type: Boolean,
    default: false,
  },
  hideNavigationItems: {
    type: Boolean,
    default: false,
  },
  userParticipations: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "update:activeTab",
  "filter-changed",
  "status-filter-changed",
  "stage-filter-changed",
]);

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const activeStatusFilter = ref("all");
const activeStageFilter = ref("all");

const statusFilters = [
  { id: "all", name: "Todos" },
  { id: "completed", name: "Completados" },
  { id: "pending", name: "Pendientes" },
];

const mobileGridColsClass = computed(() => {
  if (items.value.length <= 2) return "grid-cols-2";
  if (items.value.length === 3) return "grid-cols-3";
  return "grid-cols-4";
});

const items = computed(() => {
  const baseItems = [
    {
      id: "all",
      name: "Todas",
      icon: List,
      color: "gray",
      type: "filter",
    },
    {
      id: "form",
      name: "Actividades",
      icon: Book,
      color: "blue",
      type: "filter",
    },
    {
      id: "consulting",
      name: "Asesorías",
      icon: GraphUp,
      color: "purple",
      type:
        !props.hideNavigationItems && !props.showStatusFilter
          ? "navigation"
          : "filter",
    },
    // Backward compatibility
    {
      id: "monitoring",
      name: "Asesorías",
      icon: GraphUp,
      color: "purple",
      type: "filter",
      hidden: true, // Oculto, solo para compatibility
    },
  ];

  // Agregar "Etapas" si hay stages configuradas
  if (props.stages.length > 0) {
    baseItems.push({
      id: "stages",
      name: "Etapas",
      icon: Map,
      color: "indigo",
      type: "navigation",
    });
  }

  // Solo mostrar "Participantes" en vistas de gestión/facilitador
  if (!props.hideNavigationItems && !props.showStatusFilter) {
    baseItems.push({
      id: "participants",
      name: "Participantes",
      icon: Community,
      color: "green",
      type: "navigation",
    });
  }

  // Filtrar items ocultos
  return baseItems.filter((item) => !item.hidden);
});

const isActive = (itemId) => {
  if (
    itemId === "consulting" &&
    !props.hideNavigationItems &&
    !props.showStatusFilter
  ) {
    return (
      route.name === "ProgramConsultings" &&
      route.params.programId === props.programId
    );
  }

  if (
    itemId === "all" ||
    itemId === "form" ||
    itemId === "consulting" ||
    itemId === "monitoring" // Backward compatibility
  ) {
    return props.activeTab === itemId;
  }
  return false;
};

const getIconColor = (color) => {
  const colors = {
    gray: "text-gray-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    green: "text-green-600",
    indigo: "text-indigo-600",
  };
  return colors[color] || "text-gray-600";
};

const getIconHoverColor = (color) => {
  const colors = {
    gray: "group-hover:text-gray-700",
    blue: "group-hover:text-blue-700",
    purple: "group-hover:text-purple-700",
    orange: "group-hover:text-orange-700",
    green: "group-hover:text-green-700",
    indigo: "group-hover:text-indigo-700",
  };
  return colors[color] || "group-hover:text-gray-700";
};

const handleClick = (item) => {
  if (item.type === "navigation") {
    // Navegación a otra ruta
    if (item.id === "consulting") {
      router.push(`/programs/${props.programId}/consultings`);
    } else if (item.id === "participants") {
      router.push(`/programs/${props.programId}/participants`);
    } else if (item.id === "stages") {
      const role = userStore.userProfile?.rol;
      if (role === "facilitator") {
        router.push(`/programs/${props.programId}/stages`);
      } else {
        // Participante: usar ruta de negocio
        const businessId =
          userStore.currentBusiness?.businessId ||
          userStore.currentBusiness?.id;
        if (businessId) {
          router.push(
            `/business/${businessId}/programs/${props.programId}/stages`,
          );
        }
      }
    }
  } else if (item.type === "filter") {
    // Cambiar filtro y emitir evento
    emit("update:activeTab", item.id);
    // Reset del filtro de estado cuando cambia el tipo
    activeStatusFilter.value = "all";
    emit("filter-changed", {
      type: item.id,
      name: item.name,
    });
  }
};

const handleStatusFilter = (statusId) => {
  activeStatusFilter.value = statusId;
  emit("status-filter-changed", statusId);
};

const handleStageFilter = (stageId) => {
  activeStageFilter.value = stageId;
  emit("stage-filter-changed", stageId);
};
</script>
