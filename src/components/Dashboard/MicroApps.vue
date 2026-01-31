<template>
  <!-- Cuadrícula de microaplicaciones y widgets -->
  <div class="p-2 sm:p-4 lg:px-8 lg:py-4">
    <!-- Contenedor para móvil -->
    <div class="lg:hidden">
      <!-- Widget de racha -->
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-2 max-w-md mx-auto"
      >
        <StreakWidget :compact="true" />
      </div>
      <!-- Grid de apps móvil -->
      <div data-tour="micro-apps" class="max-w-md mx-auto">
        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="(item, index) in visibleApps"
            :key="item.id"
            :class="[
              'group bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer',
              'col-span-1 p-2 sm:p-3',
              item.color === 'blue' &&
                'hover:shadow-lg hover:border-blue-300 hover:bg-blue-50',
              item.color === 'red' &&
                'hover:shadow-lg hover:border-red-300 hover:bg-red-50',
              item.color === 'green' &&
                'hover:shadow-lg hover:border-green-300 hover:bg-green-50',
              item.color === 'purple' &&
                'hover:shadow-lg hover:border-purple-300 hover:bg-purple-50',
              item.color === 'indigo' &&
                'hover:shadow-lg hover:border-indigo-300 hover:bg-indigo-50',
              item.color === 'orange' &&
                'hover:shadow-lg hover:border-orange-300 hover:bg-orange-50',
              item.color === 'teal' &&
                'hover:shadow-lg hover:border-teal-300 hover:bg-teal-50',
              !getValue(item.available) && 'opacity-60 hover:shadow-sm',
            ]"
            @click="handleAppClick(item)"
          >
            <!-- Icono como componente -->
            <component
              v-if="item.isComponent && typeof item.icon !== 'string'"
              :is="item.icon"
              :class="[
                'mb-1 transition-all duration-200',
                'w-6 h-6 sm:w-8 sm:h-8',
                getValue(item.available)
                  ? getIconColor(item.color)
                  : 'text-gray-400',
                getValue(item.available) && getIconHoverColor(item.color),
              ]"
            />
            <!-- Icono SVG para 'receipt' -->
            <svg
              v-else-if="item.icon === 'receipt'"
              :class="[
                'mb-1 transition-all duration-200',
                'w-6 h-6 sm:w-8 sm:h-8',
                getValue(item.available)
                  ? getIconColor(item.color)
                  : 'text-gray-400',
                getValue(item.available) && getIconHoverColor(item.color),
              ]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <!-- Emoji/texto fallback -->
            <div
              v-else
              :class="[
                'mb-1 transition-all duration-200',
                'text-xl sm:text-2xl',
              ]"
            >
              {{ item.icon }}
            </div>
            <div
              :class="[
                'text-center px-1',
                getValue(item.available)
                  ? 'text-gray-600 font-medium'
                  : 'text-gray-400',
                'text-xs',
              ]"
            >
              {{ getValue(item.name) }}
              <!-- <span
              v-if="
                item.badge && typeof item.badge === 'function'
                  ? item.badge()
                  : item.badge
              "
              class="ml-1 text-green-500 text-xs font-bold"
            >
              ●
            </span> -->
            </div>
            <div
              v-if="!getValue(item.available)"
              class="text-xs text-gray-400 mt-1"
            >
              Próximamente
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid desktop: 8 columnas, todos en una fila -->
    <div
      data-tour="micro-apps"
      class="hidden lg:block lg:max-w-7xl xl:max-w-[1600px] lg:mx-auto"
    >
      <div class="grid grid-cols-8 gap-4 xl:gap-5 items-stretch">
        <!-- Widget de racha (2 columnas) -->
        <div
          class="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden min-h-[140px]"
        >
          <StreakWidget :compact="true" />
        </div>

        <!-- Apps (1 columna cada una, 6 en total) -->
        <div
          v-for="(item, index) in visibleApps"
          :key="'desktop-' + item.id"
          :class="[
            'group bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer',
            'col-span-1',
            'p-4 min-h-[140px]',
            item.color === 'blue' &&
              'hover:shadow-lg hover:border-blue-300 hover:bg-blue-50',
            item.color === 'red' &&
              'hover:shadow-lg hover:border-red-300 hover:bg-red-50',
            item.color === 'green' &&
              'hover:shadow-lg hover:border-green-300 hover:bg-green-50',
            item.color === 'purple' &&
              'hover:shadow-lg hover:border-purple-300 hover:bg-purple-50',
            item.color === 'indigo' &&
              'hover:shadow-lg hover:border-indigo-300 hover:bg-indigo-50',
            item.color === 'orange' &&
              'hover:shadow-lg hover:border-orange-300 hover:bg-orange-50',
            item.color === 'teal' &&
              'hover:shadow-lg hover:border-teal-300 hover:bg-teal-50',
            !getValue(item.available) && 'opacity-60 hover:shadow-sm',
          ]"
          @click="handleAppClick(item)"
        >
          <!-- Icono como componente -->
          <component
            v-if="item.isComponent && typeof item.icon !== 'string'"
            :is="item.icon"
            :class="[
              'mb-2 transition-all duration-200 w-12 h-12 xl:w-14 xl:h-14',
              getValue(item.available)
                ? getIconColor(item.color)
                : 'text-gray-400',
              getValue(item.available) && getIconHoverColor(item.color),
            ]"
          />
          <!-- Icono SVG para 'receipt' -->
          <svg
            v-else-if="item.icon === 'receipt'"
            :class="[
              'mb-2 transition-all duration-200 w-12 h-12 xl:w-14 xl:h-14',
              getValue(item.available)
                ? getIconColor(item.color)
                : 'text-gray-400',
              getValue(item.available) && getIconHoverColor(item.color),
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <!-- Emoji/texto fallback -->
          <div
            v-else
            class="mb-2 transition-all duration-200 text-3xl xl:text-4xl"
          >
            {{ item.icon }}
          </div>
          <div
            :class="[
              'text-center px-1',
              getValue(item.available)
                ? 'text-gray-600 font-medium'
                : 'text-gray-400',
              'text-sm xl:text-base',
            ]"
          >
            {{ getValue(item.name) }}
            <!-- <span
            v-if="
              item.badge && typeof item.badge === 'function'
                ? item.badge()
                : item.badge
            "
            class="ml-1 text-green-500 text-sm font-bold"
          >
            ●
          </span> -->
          </div>
          <div
            v-if="!getValue(item.available)"
            class="text-xs text-gray-400 mt-1"
          >
            Próximamente
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de pantalla completa -->
  <Teleport to="body">
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 overflow-y-auto bg-white"
      @keydown.esc="showModal = false"
    >
      <!-- Header del modal -->
      <div
        class="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 sm:px-6"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              Todas las aplicaciones
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              Selecciona una aplicación para comenzar
            </p>
          </div>
          <button
            @click="showModal = false"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenido del modal -->
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <!-- Sección de aplicaciones disponibles -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Disponibles</h3>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6"
          >
            <div
              v-for="item in availableApps"
              :key="item.id"
              :class="[
                'group  bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer',
                'hover:shadow-lg hover:-translate-y-1',
                item.color === 'blue' &&
                  'hover:border-blue-300 hover:bg-blue-50',
                item.color === 'red' && 'hover:border-red-300 hover:bg-red-50',
                item.color === 'green' &&
                  'hover:border-green-300 hover:bg-green-50',
                item.color === 'purple' &&
                  'hover:border-purple-300 hover:bg-purple-50',
                item.color === 'indigo' &&
                  'hover:border-indigo-300 hover:bg-indigo-50',
                item.color === 'orange' &&
                  'hover:border-orange-300 hover:bg-orange-50',
                item.color === 'teal' &&
                  'hover:border-teal-300 hover:bg-teal-50',
                item.color === 'gray' &&
                  'hover:border-gray-300 hover:bg-gray-50',
              ]"
              @click="handleAppClick(item)"
            >
              <!-- Icono dinámico: componente o emoji -->
              <component
                v-if="item.isComponent"
                :is="item.icon"
                :class="[
                  'w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mb-2 transition-all duration-200',
                  getIconColor(item.color),
                  getIconHoverColor(item.color),
                ]"
              />
              <div v-else class="text-3xl sm:text-4xl lg:text-5xl mb-2">
                {{ item.icon }}
              </div>
              <div
                class="text-sm sm:text-base text-gray-600 text-center px-2 font-medium"
              >
                {{ item.name }}
                <!-- <span
                  v-if="
                    item.badge && typeof item.badge === 'function'
                      ? item.badge()
                      : item.badge
                  "
                  class="ml-1 text-green-500 font-bold"
                >
                  ●
                </span> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de aplicaciones próximamente -->
        <div v-if="upcomingApps.length > 0">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Próximamente</h3>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6"
          >
            <div
              v-for="item in upcomingApps"
              :key="item.id"
              class="bg-gray-50 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center opacity-60 cursor-not-allowed"
            >
              <div
                class="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-500 mb-2"
              >
                {{ item.id }}
              </div>
              <div
                class="text-sm sm:text-base text-gray-500 text-center px-2 font-medium"
              >
                {{ item.name }}
              </div>
              <div class="text-xs text-gray-400 mt-1">Próximamente</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer del modal -->
      <div
        class="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 sm:px-6"
      >
        <div class="flex justify-end">
          <button
            @click="showModal = false"
            class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import StreakWidget from "./StreakWidget.vue";
import {
  GraphUp,
  BoxIso,
  GraphDown,
  Reports,
  Group,
  Community,
  BrightCrown,
  Bookmark,
} from "@iconoir/vue";
import { useProgramStore } from "@/stores/programStore";
import { useUserStore } from "@/stores/useUserStore";
import { useSubscription } from "@/composables/useSubscription";

// Props
const props = defineProps({
  businessId: {
    type: String,
    default: null,
  },
});

// Emits
const emit = defineEmits(["navigateToApp"]);

// Stores
const programStore = useProgramStore();
const userStore = useUserStore();

// Subscription
const { isPremium } = useSubscription();

// Estado del modal
const showModal = ref(false);

// Datos de microaplicaciones
const allMicroApps = ref([
  {
    id: 1,
    name: "Ventas",
    route: "/sales",
    available: true,
    icon: GraphUp,
    isComponent: true,
    color: "blue",
  },
  {
    id: 2,
    name: "Gastos",
    route: "/expenses",
    available: true,
    icon: GraphDown,
    isComponent: true,
    color: "red",
  },
  {
    id: 3,
    name: "Inventario",
    route: "/inventory",
    available: true,
    icon: BoxIso,
    isComponent: true,
    color: "purple",
  },
  {
    id: 4,
    name: "Clientes",
    route: "/clients",
    available: true,
    icon: Group,
    isComponent: true,
    color: "indigo",
  },
  {
    id: 5,
    name: "Reportes",
    route: "/reports",
    available: true,
    icon: Reports,
    isComponent: true,
    color: "green",
  },
  {
    id: 6,
    name: "Cuentas por Cobrar",
    route: "/accounts-receivable",
    available: true,
    icon: "receipt",
    isComponent: true,
    color: "orange",
  },
  {
    id: 7,
    name: "Cotizaciones",
    route: "/quotes",
    available: true,
    icon: Bookmark,
    isComponent: true,
    color: "purple",
  },
  {
    id: 8,
    name: computed(() => userStore.currentBusinessProgramName),
    route: computed(() => {
      // Obtener el programa más reciente
      const programs = userStore.currentBusiness?.programs || [];
      if (programs.length > 0) {
        const latestProgram = programs[programs.length - 1];
        return `/programs/${latestProgram.id}`;
      }
      return "/programs"; // Fallback a ProgramsHub si no hay programas
    }),
    available: computed(() => {
      // Solo disponible si hay al menos un programa
      // return userStore.currentBusiness?.programs?.length > 0;
      return true;
    }),
    icon: Community,
    isComponent: true,
    color: "teal",
  },
  {
    id: 9,
    name: "Premium",
    route: "/premium",
    available: true,
    icon: BrightCrown,
    isComponent: true,
    color: "orange",
  },
]);

// Función helper para obtener la clase de color del icono
const getIconColor = (color) => {
  const colorMap = {
    blue: "text-blue-300",
    red: "text-red-300",
    green: "text-green-300",
    purple: "text-purple-300",
    orange: "text-orange-300",
    indigo: "text-indigo-300",
    teal: "text-teal-300",
    gray: "text-gray-300",
  };
  return colorMap[color] || "text-gray-700";
};

// Función helper para obtener la clase de color del icono en hover
const getIconHoverColor = (color) => {
  const colorMap = {
    blue: "group-hover:text-blue-500",
    red: "group-hover:text-red-500",
    green: "group-hover:text-green-500",
    purple: "group-hover:text-purple-500",
    orange: "group-hover:text-orange-500",
    indigo: "group-hover:text-indigo-500",
    teal: "group-hover:text-teal-500",
    gray: "group-hover:text-gray-500",
  };
  return colorMap[color] || "group-hover:text-gray-700";
};

// Función helper para evaluar propiedades que pueden ser computed
const getValue = (value) => {
  return typeof value === "function" ? value.value : value;
};

// Computed properties
const visibleApps = computed(() => {
  // Obtener las apps principales
  const apps = allMicroApps.value.slice(0, 9);
  // Si el usuario ya es premium, filtrar el menú de Premium (id: 9)
  if (isPremium.value) {
    return apps.filter((app) => app.id !== 9);
  }
  return apps;
});

const availableApps = computed(() => {
  return allMicroApps.value.filter((app) => getValue(app.available));
});

const upcomingApps = computed(() => {
  return allMicroApps.value.filter((app) => !getValue(app.available));
});

// Funciones
const handleAppClick = (app) => {
  const isAvailable = getValue(app.available);
  const appName = getValue(app.name);
  const appRoute = getValue(app.route);

  if (isAvailable) {
    // Crear objeto con valores evaluados para emit
    const appData = {
      ...app,
      name: appName,
      route: appRoute,
      available: isAvailable,
    };
    emit("navigateToApp", appData);
    showModal.value = false;
  } else {
    // Mostrar mensaje de próximamente
    alert(`${appName} estará disponible próximamente`);
  }
};

// Manejar tecla ESC para cerrar modal
const handleEscKey = (event) => {
  if (event.key === "Escape" && showModal.value) {
    showModal.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener("keydown", handleEscKey);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscKey);
});

// Watch para prevenir scroll cuando el modal está abierto
watch(showModal, (newValue) => {
  if (newValue) {
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = "hidden";
  } else {
    // Restaurar scroll
    document.body.style.overflow = "";
  }
});
</script>

<style scoped>
/* Transiciones suaves y minimalistas */
.group {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.group:hover {
  transform: translateY(-2px);
}

.group:active {
  transform: scale(0.98) translateY(0);
}

/* Desktop: asegurar misma altura para todos los elementos */
@media (min-width: 1024px) {
  /* Hacer que el widget de racha tenga altura completa */
  .col-span-2 {
    min-height: 140px;
    display: flex;
    flex-direction: column;
  }

  /* Apps cuadradas con altura mínima */
  .col-span-1 {
    min-height: 140px;
  }

  /* Asegurar que todo esté en una sola fila visible */
  .lg\:grid-cols-6 {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
</style>
