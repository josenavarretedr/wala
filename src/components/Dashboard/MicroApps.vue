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
      <!-- Grid de apps móvil: 3 apps + btn "+" -->
      <div data-tour="micro-apps" class="max-w-md mx-auto">
        <div class="grid grid-cols-4 gap-2">
          <!-- 3 apps principales -->
          <div
            v-for="item in mainApps"
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
            <div
              v-else
              :class="['mb-1 transition-all duration-200', 'text-xl sm:text-2xl']"
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
            </div>
          </div>

          <!-- Botón "Más Apps" -->
          <div
            class="group col-span-1 p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-orange-200 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:bg-orange-50 hover:shadow-lg hover:border-orange-400"
            @click="showBottomSheet = true"
          >
            <div class="mb-1 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
              <svg
                class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 transition-all duration-200 group-hover:text-orange-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div class="text-xs text-orange-600 font-medium text-center px-1 group-hover:text-orange-700">
              Más Apps
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid desktop: StreakWidget (2 cols) + 3 apps + btn "+" -->
    <div
      data-tour="micro-apps"
      class="hidden lg:block lg:max-w-7xl xl:max-w-[1600px] lg:mx-auto"
    >
      <div class="grid grid-cols-6 gap-4 xl:gap-5 items-stretch">
        <!-- Widget de racha (2 columnas) -->
        <div
          class="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden min-h-[140px]"
        >
          <StreakWidget :compact="true" />
        </div>

        <!-- 3 apps principales en desktop -->
        <div
          v-for="item in mainApps"
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
          </div>
          <div
            v-if="!getValue(item.available)"
            class="text-xs text-gray-400 mt-1"
          >
            Próximamente
          </div>
        </div>

        <!-- Botón "Más Apps" desktop -->
        <div
          class="group col-span-1 p-4 min-h-[140px] bg-white rounded-lg shadow-sm border border-orange-200 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:bg-orange-50 hover:shadow-lg hover:border-orange-400"
          @click="showBottomSheet = true"
        >
          <div class="mb-2 w-12 h-12 xl:w-14 xl:h-14 flex items-center justify-center">
            <svg
              class="w-8 h-8 xl:w-10 xl:h-10 text-orange-600 transition-all duration-200 group-hover:text-orange-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div class="text-sm xl:text-base text-orange-600 font-medium text-center px-1 group-hover:text-orange-700">
            Más Apps
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Sheet -->
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="showBottomSheet"
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        @click="showBottomSheet = false"
      />
    </Transition>

    <!-- Panel deslizante desde abajo -->
    <Transition name="slide-up">
      <div
        v-if="showBottomSheet"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl"
        style="max-height: 80vh; overflow-y: auto"
      >
        <!-- Handle visual -->
        <div class="flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 rounded-full bg-gray-300"></div>
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Todas las aplicaciones</h2>
            <p class="text-xs text-gray-500 mt-0.5">Selecciona una aplicación</p>
          </div>
          <button
            @click="showBottomSheet = false"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Apps grid dentro del bottom sheet -->
        <div class="px-4 py-4">
          <div class="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 gap-3">
            <div
              v-for="item in allDisplayApps"
              :key="'sheet-' + item.id"
              :class="[
                'group bg-white rounded-xl border flex flex-col items-center justify-center p-3 cursor-pointer transition-all duration-200',
                getValue(item.available)
                  ? [
                      'border-gray-100 shadow-sm',
                      item.color === 'blue' && 'hover:border-blue-300 hover:bg-blue-50 hover:shadow-md',
                      item.color === 'red' && 'hover:border-red-300 hover:bg-red-50 hover:shadow-md',
                      item.color === 'green' && 'hover:border-green-300 hover:bg-green-50 hover:shadow-md',
                      item.color === 'purple' && 'hover:border-purple-300 hover:bg-purple-50 hover:shadow-md',
                      item.color === 'indigo' && 'hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md',
                      item.color === 'orange' && 'hover:border-orange-300 hover:bg-orange-50 hover:shadow-md',
                      item.color === 'teal' && 'hover:border-teal-300 hover:bg-teal-50 hover:shadow-md',
                    ]
                  : 'border-gray-100 opacity-60 cursor-not-allowed',
              ]"
              @click="handleAppClick(item)"
            >
              <!-- Icono componente -->
              <component
                v-if="item.isComponent && typeof item.icon !== 'string'"
                :is="item.icon"
                :class="[
                  'mb-2 transition-all duration-200 w-8 h-8 sm:w-10 sm:h-10',
                  getValue(item.available) ? getIconColor(item.color) : 'text-gray-400',
                  getValue(item.available) && getIconHoverColor(item.color),
                ]"
              />
              <!-- Icono SVG receipt -->
              <svg
                v-else-if="item.icon === 'receipt'"
                :class="[
                  'mb-2 transition-all duration-200 w-8 h-8 sm:w-10 sm:h-10',
                  getValue(item.available) ? getIconColor(item.color) : 'text-gray-400',
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
              <!-- Emoji fallback -->
              <div v-else class="mb-2 text-2xl sm:text-3xl transition-all duration-200">
                {{ item.icon }}
              </div>

              <div
                :class="[
                  'text-center text-xs sm:text-sm font-medium',
                  getValue(item.available) ? 'text-gray-600' : 'text-gray-400',
                ]"
              >
                {{ getValue(item.name) }}
              </div>
              <div v-if="!getValue(item.available)" class="text-xs text-gray-400 mt-0.5">
                Próximamente
              </div>
            </div>
          </div>
        </div>

        <!-- Espacio para el safe area en iOS -->
        <div class="pb-safe pb-4"></div>
      </div>
    </Transition>
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

// Estado del bottom sheet
const showBottomSheet = ref(false);

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
      const programs = userStore.currentBusiness?.programs || [];
      if (programs.length > 0) {
        const latestProgram = programs[programs.length - 1];
        return `/programs/${latestProgram.id}`;
      }
      return "/programs";
    }),
    available: computed(() => true),
    icon: Community,
    isComponent: true,
    color: "teal",
  },
  {
    id: 9,
    name: "Pro",
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

// Solo las 3 primeras apps para el grid principal
const mainApps = computed(() => {
  return allMicroApps.value.slice(0, 3);
});

// Todas las apps para mostrar en el bottom sheet
const allDisplayApps = computed(() => {
  const apps = allMicroApps.value.slice(0, 9);
  if (isPremium.value) {
    return apps.filter((app) => app.id !== 9);
  }
  return apps;
});

// Funciones
const handleAppClick = (app) => {
  const isAvailable = getValue(app.available);
  const appName = getValue(app.name);
  const appRoute = getValue(app.route);

  if (isAvailable) {
    const appData = {
      ...app,
      name: appName,
      route: appRoute,
      available: isAvailable,
    };
    emit("navigateToApp", appData);
    showBottomSheet.value = false;
  } else {
    alert(`${appName} estará disponible próximamente`);
  }
};

// Manejar tecla ESC para cerrar bottom sheet
const handleEscKey = (event) => {
  if (event.key === "Escape" && showBottomSheet.value) {
    showBottomSheet.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener("keydown", handleEscKey);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscKey);
});

// Watch para prevenir scroll cuando el bottom sheet está abierto
watch(showBottomSheet, (newValue) => {
  if (newValue) {
    document.body.style.overflow = "hidden";
  } else {
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
  .col-span-2 {
    min-height: 140px;
    display: flex;
    flex-direction: column;
  }

  .col-span-1 {
    min-height: 140px;
  }
}

/* Transición fade para el overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transición slide-up para el panel */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0%);
}

/* Safe area para iOS */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
</style>
