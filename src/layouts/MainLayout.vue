<template>
  <div
    class="min-h-screen bg-gray-50 lg:flex"
    :class="{ 'sidebar-open': sidebarOpen }"
  >
    <!-- Overlay solo < lg -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden"
      style="z-index: 9998"
    ></div>

    <!-- ASIDE < lg: drawer fullscreen -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-full max-w-[18rem] sm:max-w-[20rem] bg-white shadow-2xl transform transition-transform duration-300 overflow-y-auto lg:hidden"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      style="z-index: 9999"
      role="dialog"
      aria-modal="true"
    >
      <SidebarContent
        :current-business="currentBusiness"
        :main-items="mainItems"
        :admin-items="filteredAdminItems"
        :account-items="accountItems"
        :show-business-selector="userStore.userBusinesses.length > 0"
        @close="sidebarOpen = false"
        @logout="handleLogout"
        @toggle-business-selector="showBusinessSelector = true"
      />
    </aside>

    <!-- ASIDE ≥ lg: columna izquierda que empuja el contenido -->
    <aside
      class="hidden lg:flex lg:flex-col lg:relative bg-white border-r border-gray-200 transition-[width] duration-300 overflow-hidden"
      :class="sidebarOpen ? 'lg:w-72' : 'lg:w-0'"
    >
      <SidebarContent
        :current-business="currentBusiness"
        :main-items="mainItems"
        :admin-items="filteredAdminItems"
        :account-items="accountItems"
        :show-business-selector="userStore.userBusinesses.length > 0"
        @logout="handleLogout"
        @toggle-business-selector="showBusinessSelector = true"
      />
    </aside>
    <!-- CONTENIDO -->
    <div class="min-h-screen flex-1 flex flex-col">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="flex-1 p-4 md:p-6">
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

<style scoped>
/* Ajustar elementos fijos cuando el sidebar está abierto en desktop */
:global(.sidebar-open .fixed) {
  @screen lg {
    left: 18rem;
    transition: left 0.3s ease-in-out;
  }
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Header from "@/components/LayoutCmpts/Header.vue";
import SidebarContent from "@/components/layout/SidebarContent.vue";

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
const sidebarOpen = ref(true);
const showBusinessSelector = ref(false);

// Regla: < 1024 (lg) => cerrado; ≥ 1024 => abierto
const handleResize = () => {
  if (window.innerWidth < 1024) sidebarOpen.value = false;
  else sidebarOpen.value = true;
};

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => window.removeEventListener("resize", handleResize));

router.afterEach(() => {
  if (window.innerWidth < 1024) sidebarOpen.value = false;
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
</script>
