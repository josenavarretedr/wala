<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Overlay para mobile y desktop cuando sidebar está abierto -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'bg-white shadow-xl border-r border-gray-200',
      ]"
    >
      <!-- Información del negocio actual -->
      <div class="px-6 py-4 border-b border-gray-200 bg-blue-50">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"
          >
            <span class="text-blue-600 font-bold">
              {{ currentBusiness?.businessName?.charAt(0) || "N" }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ currentBusiness?.businessName || "Sin negocio" }}
              <!-- </p>
            <p class="text-xs text-gray-500 truncate">
              {{ currentUserRole === "gerente" ? "👑 Gerente" : "👤 Empleado" }}
            </p> -->
            </p>
          </div>

          <!-- Botón cerrar sidebar (mobile y desktop) -->
          <button
            @click="sidebarOpen = false"
            class="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-200 rounded"
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

        <!-- Selector de negocio (si tiene múltiples) -->
        <button
          v-if="userStore.userBusinesses.length > 0"
          @click="showBusinessSelector = true"
          class="mt-3 w-full text-left px-3 py-2 text-xs text-blue-600 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
        >
          🔄 Cambiar negocio
        </button>
      </div>

      <!-- Navegación principal -->
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <!-- Dashboard -->
        <SidebarSection title="🏠 Principal" :items="mainItems" />

        <!-- Mostrar el menú solo si hay datos cargados -->
        <template v-if="currentBusiness && userStore.userBusinesses.length > 0">
          <!-- Sección: Transacciones -->
          <!-- <SidebarSection
            v-if="filteredTransactionItems.length > 0"
            title="💰 Transacciones"
            :items="filteredTransactionItems"
          /> -->

          <!-- Sección: Reportes -->
          <!-- <SidebarSection
            v-if="filteredReportItems.length > 0"
            title="📊 Reportes"
            :items="filteredReportItems"
          /> -->

          <!-- Sección: Administración (solo gerentes) -->
          <SidebarSection
            v-if="filteredAdminItems.length > 0"
            title="⚙️ Administración"
            :items="filteredAdminItems"
          />
        </template>

        <!-- Loading state -->
        <div v-else-if="userStore.isLoading" class="px-3 py-4 text-center">
          <div class="text-sm text-gray-500">Cargando menú...</div>
        </div>

        <!-- No business state -->
        <div v-else class="px-3 py-4 text-center">
          <div class="text-sm text-gray-500">No hay negocio seleccionado</div>
        </div>

        <!-- Sección: Cuenta -->
        <SidebarSection title="👤Mi Cuenta" :items="accountItems" />
      </nav>

      <!-- Footer del sidebar -->
      <div class="border-t border-gray-200 p-4">
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
          title="Cerrar sesión"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span class="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Contenido principal -->
    <div
      :class="[
        'flex flex-col min-h-screen transition-all duration-300',
        sidebarOpen ? 'lg:ml-64' : 'ml-0',
      ]"
    >
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Área de contenido -->
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>

    <!-- Modal selector de negocio -->
    <BusinessSelectorModal
      v-if="showBusinessSelector"
      @close="showBusinessSelector = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Header from "@/components/LayoutCmpts/Header.vue";

import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useBusinessStore } from "@/stores/businessStore";

// Imports de componentes
import SidebarSection from "@/components/layout/SidebarSection.vue";
import ProfileDropdown from "@/components/layout/ProfileDropdown.vue";
import BusinessSelectorModal from "@/components/business/BusinessSelectorModal.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();
const businessStore = useBusinessStore(); // ✅ BusinessStore para datos completos del negocio

// Estado reactivo
const sidebarOpen = ref(true); // Iniciar abierto por defecto
const showBusinessSelector = ref(false);

// Función para manejar el tamaño de pantalla
const handleResize = () => {
  if (window.innerWidth < 1024) {
    // menor que lg
    sidebarOpen.value = false;
  } else {
    sidebarOpen.value = true;
  }
};

// Inicializar el estado del sidebar basado en el tamaño de pantalla
onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

// ✅ ARQUITECTURA COHERENTE: Computed properties usando la nueva estructura
const currentBusiness = computed(() => userStore.currentBusiness); // UserStore: relación usuario-negocio
const businessData = computed(() => businessStore.business); // BusinessStore: datos completos del negocio
const currentBusinessId = computed(
  () => route.params.businessId || userStore.currentBusiness?.businessId
);

// ✅ Usar UserStore para roles y permisos (fuente única de verdad para el contexto usuario-negocio)
const isManager = computed(() => userStore.isCurrentBusinessManager);
const currentUserRole = computed(() => userStore.getCurrentBusinessRole);

const userInitials = computed(() => {
  if (authStore.user?.displayName) {
    const names = authStore.user.displayName.split(" ");
    return names
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase();
  }
  return authStore.user?.email?.charAt(0).toUpperCase() || "U";
});

const currentPageTitle = computed(() => {
  return route.meta?.title || "Dashboard";
});

// Configuración de elementos del menú
const mainItems = computed(() => [
  {
    icon: "📊",
    label: "Dashboard",
    to: `/business/${currentBusinessId.value}/dashboard`,
    permission: null,
  },
]);

const transactionItems = computed(() => [
  {
    icon: "💵",
    label: "Ingresos",
    to: `/business/${currentBusinessId.value}/income`,
    permission: "verIngresos",
  },
  {
    icon: "💸",
    label: "Egresos",
    to: `/business/${currentBusinessId.value}/expenses`,
    permission: "verEgresos",
  },
  {
    icon: "🔄",
    label: "Transferencias",
    to: `/business/${currentBusinessId.value}/transfers`,
    permission: "verTransferencias",
  },
]);

const reportItems = computed(() => [
  {
    icon: "📈",
    label: "Resumen General",
    to: `/business/${currentBusinessId.value}/reports`,
    permission: "verReportes",
  },
  {
    icon: "💰",
    label: "Estado Financiero",
    to: `/business/${currentBusinessId.value}/reports/financial`,
    permission: "verReportes",
  },
  {
    icon: "📊",
    label: "Análisis de Flujo",
    to: `/business/${currentBusinessId.value}/reports/cash-flow`,
    permission: "verReportes",
  },
  {
    icon: "📅",
    label: "Resumen Mensual",
    to: `/business/${currentBusinessId.value}/reports/monthly`,
    permission: "verReportes",
  },
]);

const adminItems = computed(() => [
  {
    icon: "👥",
    label: "Empleados",
    to: `/business/${currentBusinessId.value}/employees`,
    permission: "gestionarEmpleados",
    role: "gerente",
  },
  {
    icon: "⚙️",
    label: "Configuración",
    to: `/business/${currentBusinessId.value}/settings`,
    permission: "configurarNegocio",
    role: "gerente",
  },
  {
    icon: "🏪",
    label: "Datos del Negocio",
    to: `/business/${currentBusinessId.value}/business-info`,
    permission: "configurarNegocio",
    role: "gerente",
  },
]);

const accountItems = computed(() => [
  {
    icon: "👤",
    label: "Mis datos",
    to: "/profile",
    permission: null,
  },
  // {
  //   icon: "🔔",
  //   label: "Notificaciones",
  //   to: "/notifications",
  //   permission: null,
  // },
  // {
  //   icon: "🔒",
  //   label: "Seguridad",
  //   to: "/security",
  //   permission: null,
  // },
]);

// ✅ Computed properties para items filtrados que se revalúan automáticamente
const filteredTransactionItems = computed(() => {
  if (!currentBusiness.value) return [];
  return transactionItems.value.filter(hasAccess);
});

const filteredReportItems = computed(() => {
  if (!currentBusiness.value) return [];
  return reportItems.value.filter(hasAccess);
});

const filteredAdminItems = computed(() => {
  if (!currentBusiness.value || !isManager.value) return [];
  return adminItems.value.filter(hasAccess);
});

// Métodos
const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

const hasAccess = (item) => {
  // ✅ ARQUITECTURA COHERENTE: Usar UserStore para verificar acceso basado en currentBusiness

  // Si no hay negocio actual, solo mostrar items sin permisos
  if (!currentBusiness.value) {
    return !item.permission && !item.role;
  }

  // Verificar rol específico si se requiere
  if (
    item.role &&
    currentUserRole.value !== item.role &&
    currentUserRole.value !== "gerente"
  ) {
    return false;
  }

  // Verificar permisos específicos usando UserStore.currentPermissions
  if (item.permission) {
    // Los gerentes tienen todos los permisos
    if (currentUserRole.value === "gerente") {
      return true;
    }

    // Verificar que currentPermissions exista y sea un objeto válido
    const permissions = userStore.currentPermissions;
    if (!permissions || typeof permissions !== "object") {
      return false;
    }

    // Para otros roles, verificar permiso específico
    return permissions[item.permission] === true;
  }

  return true;
};

// Cerrar sidebar en cambio de ruta (mobile)
router.afterEach(() => {
  sidebarOpen.value = false;
});
</script>
