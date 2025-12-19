<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Overlay para todos los tamaños de pantalla -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 z-50 bg-black/50 transition-opacity"
      style="z-index: 9998"
    ></div>

    <!-- ASIDE: drawer/overlay para todos los tamaños -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-full max-w-[18rem] sm:max-w-[20rem] bg-white shadow-2xl transform transition-transform duration-300 overflow-y-auto"
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
        @toggle-business-selector="
          () => {
            showBusinessSelector = true;
            sidebarOpen = false;
          }
        "
      />
    </aside>

    <!-- CONTENIDO -->
    <div class="min-h-screen flex flex-col">
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

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Header from "@/components/LayoutCmpts/Header.vue";
import SidebarContent from "@/components/layout/SidebarContent.vue";

import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useProgramStore } from "@/stores/programStore";

// Imports de componentes
import SidebarSection from "@/components/layout/SidebarSection.vue";
import ProfileDropdown from "@/components/layout/ProfileDropdown.vue";
import BusinessSelectorModal from "@/components/business/BusinessSelectorModal.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();
const businessStore = useBusinessStore(); // ✅ BusinessStore para datos completos del negocio
const programStore = useProgramStore(); // ✨ ProgramStore para módulo Juntos

// Estado reactivo
const sidebarOpen = ref(false);
const showBusinessSelector = ref(false);

// Sidebar siempre empieza cerrado
onMounted(async () => {
  sidebarOpen.value = false;

  // ✨ NUEVO: Cargar programas activos si hay business seleccionado
  if (currentBusinessId.value) {
    try {
      await programStore.loadActivePrograms();
    } catch (err) {
      console.error("Error cargando programas:", err);
    }
  }
});

// Cerrar sidebar después de navegar (en todos los tamaños de pantalla)
router.afterEach(() => {
  sidebarOpen.value = false;
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

// Configuración de elementos del menú - ✅ Mostrar items básicos cuando no hay businessId
const mainItems = computed(() => {
  const businessId = currentBusinessId.value;

  // Si no hay businessId, mostrar opciones de configuración inicial
  if (!businessId) {
    const items = [];

    // Si el usuario no tiene negocios, mostrar opción de crear uno
    if (userStore.userBusinesses.length === 0) {
      items.push({
        icon: "add_business",
        label: "Crear Negocio",
        to: "/onboarding",
        permission: null,
      });
    } else {
      // Si tiene negocios, mostrar opción de seleccionar uno
      items.push({
        icon: "business",
        label: "Seleccionar Negocio",
        to: "/select-business",
        permission: null,
      });
    }

    return items;
  }

  return [
    {
      icon: "dashboard",
      label: "Dashboard",
      to: `/business/${businessId}/dashboard`,
      permission: null,
    },
    {
      icon: "groups",
      label: "Juntos",
      to: `/business/${businessId}/programs`,
      badge: programStore.hasActiveProgram ? "●" : null,
      badgeColor: "text-green-500",
      permission: null,
    },
  ];
});

const adminItems = computed(() => {
  const businessId = currentBusinessId.value;
  if (!businessId) return [];

  return [
    {
      icon: "business",
      label: "Datos del negocio",
      to: `/business/${businessId}/business-info`,
      permission: null,
      role: "gerente",
    },
  ];
});

const accountItems = computed(() => [
  {
    icon: "user",
    label: "Mis datos",
    to: "/profile",
    permission: null,
  },
]);

// ✅ Computed properties para items filtrados que se revalúan automáticamente
const filteredAdminItems = computed(() => {
  // No mostrar items de admin si no hay businessId o negocio actual
  if (!currentBusinessId.value || !currentBusiness.value || !isManager.value)
    return [];
  return adminItems.value.filter(hasAccess);
});

// Métodos
const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/auth/login");
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
