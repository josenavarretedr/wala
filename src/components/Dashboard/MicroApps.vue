<template>
  <!-- Cuadrícula de microaplicaciones -->
  <div class="rounded-xl shadow-sm p-4 sm:p-6">
    <!-- Cuadrícula responsive: 3x2 móvil/tablet, 4x1 desktop -->
    <div
      :class="[
        'grid gap-2 sm:gap-3 mx-auto transition-all duration-300',
        // Móvil y tablet: 3 columnas (3x2 = 6 elementos)
        'grid-cols-3 max-w-xs sm:max-w-md',
        // Desktop: 4 columnas en UNA sola fila (4x1 = 4 elementos)
        'lg:grid-cols-4 lg:grid-rows-1 lg:max-w-4xl lg:gap-6',
      ]"
    >
      <!-- Elementos principales (5 para móvil/tablet, 3 para desktop) -->
      <div
        v-for="(item, index) in visibleApps"
        :key="item.id"
        :class="[
          'bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer',
          // Móvil/Tablet: aspecto cuadrado
          'aspect-square',
          // Desktop: más compacto, rectangular
          'lg:aspect-[4/3] lg:py-4',
          // Ocultar elementos 4 y 5 en desktop (solo mostrar 3)
          index >= 3 && 'lg:hidden',
          // Indicar si no está disponible
          !item.available && 'opacity-60',
        ]"
        @click="handleAppClick(item)"
      >
        <div
          :class="[
            'font-semibold mb-1',
            item.available ? 'text-gray-700' : 'text-gray-500',
            // Tamaños responsive: grande en móvil, pequeño en desktop
            'text-xl sm:text-2xl',
            'lg:text-lg',
          ]"
        >
          {{ item.icon }}
        </div>
        <div
          :class="[
            'text-center px-1 sm:px-2',
            item.available ? 'text-gray-500' : 'text-gray-400',
            // Texto responsive
            'text-xs',
            'lg:text-xs lg:px-1',
          ]"
        >
          {{ item.name }}
        </div>
        <!-- Indicador de no disponible -->
        <div v-if="!item.available" class="text-xs text-gray-400 mt-1">
          Próximamente
        </div>
      </div>

      <!-- Botón "Ver más" -->
      <div
        :class="[
          'bg-blue-50 rounded-lg shadow-sm border border-blue-100 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer hover:bg-blue-100',
          // Móvil/Tablet: aspecto cuadrado
          'aspect-square',
          // Desktop: más compacto
          'lg:aspect-[4/3] lg:py-4',
        ]"
        @click="showModal = true"
      >
        <div
          :class="[
            'font-semibold text-blue-600 mb-1',
            'text-xl sm:text-2xl',
            'lg:text-lg',
          ]"
        >
          +
        </div>
        <div
          :class="[
            'text-blue-600 text-center px-1 sm:px-2',
            'text-xs',
            'lg:text-xs lg:px-1',
          ]"
        >
          Ver más
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
              class="aspect-square bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer hover:shadow-md hover:border-blue-300 hover:bg-blue-50"
              @click="handleAppClick(item)"
            >
              <div
                class="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-700 mb-2"
              >
                {{ item.icon }}
              </div>
              <div
                class="text-sm sm:text-base text-gray-600 text-center px-2 font-medium"
              >
                {{ item.name }}
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
              class="aspect-square bg-gray-50 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center opacity-60 cursor-not-allowed"
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
import { ref, computed, onMounted, onUnmounted } from "vue";

// Props
const props = defineProps({
  businessId: {
    type: String,
    default: null,
  },
});

// Emits
const emit = defineEmits(["navigateToApp"]);

// Estado del modal
const showModal = ref(false);

// Datos de microaplicaciones
const allMicroApps = ref([
  { id: 1, name: "Ventas", route: "/sales", available: true, icon: "💰" },
  {
    id: 2,
    name: "Inventario",
    route: "/inventory",
    available: true,
    icon: "📦",
  },
  { id: 3, name: "Gastos", route: "/expenses", available: true, icon: "💸" },
  { id: 4, name: "Reportes", route: "/reports", available: true, icon: "📊" },
  {
    id: 5,
    name: "Clientes",
    route: "/customers",
    available: false,
    icon: "👥",
  },
  {
    id: 6,
    name: "Proveedores",
    route: "/suppliers",
    available: false,
    icon: "🏢",
  },
  { id: 7, name: "Nómina", route: "/payroll", available: false, icon: "💵" },
  {
    id: 8,
    name: "Contabilidad",
    route: "/accounting",
    available: true,
    icon: "🧮",
  },
  {
    id: 9,
    name: "Configuración",
    route: "/settings",
    available: true,
    icon: "⚙️",
  },
  { id: 10, name: "Usuarios", route: "/users", available: false, icon: "👤" },
  {
    id: 11,
    name: "Respaldos",
    route: "/backups",
    available: false,
    icon: "💾",
  },
  {
    id: 12,
    name: "Integración",
    route: "/integrations",
    available: false,
    icon: "🔗",
  },
]);

// Computed properties
const visibleApps = computed(() => {
  return allMicroApps.value.slice(0, 5);
});

const availableApps = computed(() => {
  return allMicroApps.value.filter((app) => app.available);
});

const upcomingApps = computed(() => {
  return allMicroApps.value.filter((app) => !app.available);
});

// Funciones
const handleAppClick = (app) => {
  if (app.available) {
    emit("navigateToApp", app);
    showModal.value = false;
  } else {
    // Mostrar mensaje de próximamente
    alert(`${app.name} estará disponible próximamente`);
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
import { watch } from "vue";

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
.grid > div {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.grid > div:active {
  transform: scale(0.98);
}

/* Responsive específico para el nuevo diseño */
@media (max-width: 374px) {
  .grid {
    gap: 0.375rem !important;
    max-width: 16rem !important;
  }
}

/* Desktop: optimizado para UNA sola fila horizontal */
@media (min-width: 1024px) {
  .grid {
    /* Solo 4 elementos en una fila: 3 apps + 1 botón "+" */
    max-width: 60rem; /* Espacio para 4 elementos con buen spacing */
    justify-content: center;
  }

  /* Elementos más compactos en desktop para una sola fila */
  .grid > div {
    min-height: 4rem; /* Altura mínima reducida */
    max-height: 5rem; /* Altura máxima controlada */
    min-width: 8rem; /* Ancho mínimo para legibilidad */
    max-width: 12rem; /* Ancho máximo controlado */
  }
}

/* Para pantallas extra grandes, mantener el diseño centrado */
@media (min-width: 1280px) {
  .grid {
    max-width: 64rem;
  }
} /* Asegurar que el botón + no crezca demasiado */
.grid > div:last-child {
  flex-shrink: 0;
}
</style>
