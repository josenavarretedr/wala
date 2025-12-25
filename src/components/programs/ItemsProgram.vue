<template>
  <div class="p-2 sm:p-4 lg:px-8 lg:py-4">
    <!-- Grid móvil: 4 columnas como MicroApps -->
    <div class="grid grid-cols-4 gap-2 max-w-md mx-auto lg:hidden">
      <button
        v-for="item in items"
        :key="item.id"
        :class="[
          'group bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer',
          'col-span-1 p-2 sm:p-3',
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
          :class="['text-center px-1', 'text-gray-600 font-medium', 'text-xs']"
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
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { List, Book, GraphUp, Calendar, Community } from "@iconoir/vue";

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
});

const emit = defineEmits(["update:activeTab", "filter-changed"]);

const router = useRouter();

const items = [
  {
    id: "all",
    name: "Todas",
    icon: List,
    color: "gray",
    type: "filter",
  },
  {
    id: "session",
    name: "Sesiones",
    icon: Book,
    color: "blue",
    type: "filter",
  },
  {
    id: "monitoring",
    name: "Monitoreos",
    icon: GraphUp,
    color: "purple",
    type: "filter",
  },
  {
    id: "event",
    name: "Eventos",
    icon: Calendar,
    color: "orange",
    type: "filter",
  },
  {
    id: "participants",
    name: "Participantes",
    icon: Community,
    color: "green",
    type: "navigation",
  },
];

const isActive = (itemId) => {
  if (
    itemId === "all" ||
    itemId === "session" ||
    itemId === "monitoring" ||
    itemId === "event"
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
  };
  return colors[color] || "group-hover:text-gray-700";
};

const handleClick = (item) => {
  if (item.type === "navigation") {
    // Navegación a otra ruta
    if (item.id === "participants") {
      router.push(`/programs/${props.programId}/participants`);
    }
  } else if (item.type === "filter") {
    // Cambiar filtro y emitir evento
    emit("update:activeTab", item.id);
    emit("filter-changed", {
      type: item.id,
      name: item.name,
    });
  }
};
</script>
