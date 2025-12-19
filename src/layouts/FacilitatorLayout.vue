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
        :current-business="facilitatorContext"
        :main-items="mainItems"
        :admin-items="[]"
        :account-items="accountItems"
        :show-business-selector="false"
        @close="sidebarOpen = false"
        @logout="handleLogout"
      />
    </aside>

    <!-- CONTENIDO -->
    <div class="min-h-screen flex flex-col">
      <Header
        :context-name="headerTitle"
        :facilitator-mode="true"
        facilitator-home-route="/programs"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />
      <main class="flex-1 p-4 md:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import Header from "@/components/LayoutCmpts/Header.vue";
import SidebarContent from "@/components/layout/SidebarContent.vue";

import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useProgramStore } from "@/stores/programStore";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();
const programStore = useProgramStore();

// Estado reactivo
const sidebarOpen = ref(false);

// Sidebar siempre empieza cerrado
onMounted(async () => {
  sidebarOpen.value = false;

  // Cargar programas activos del facilitador
  try {
    await programStore.loadFacilitatorPrograms();
  } catch (err) {
    console.error("Error cargando programas del facilitador:", err);
  }

  // Si hay un programId en la ruta, cargar el programa actual
  if (route.params.programId) {
    try {
      await programStore.loadCurrentProgram(route.params.programId);
    } catch (err) {
      console.error("Error cargando programa actual:", err);
    }
  }
});

// Observar cambios en el programId de la ruta
watch(
  () => route.params.programId,
  async (newProgramId) => {
    if (newProgramId) {
      try {
        await programStore.loadCurrentProgram(newProgramId);
      } catch (err) {
        console.error("Error cargando programa:", err);
      }
    } else {
      programStore.currentProgram = null;
    }
  }
);

// Cerrar sidebar después de navegar
router.afterEach(() => {
  sidebarOpen.value = false;
});

// ══════════════════════════════════════════════════════════════
// COMPUTED PROPERTIES
// ══════════════════════════════════════════════════════════════

// Título del header
const headerTitle = computed(() => {
  // Si estamos dentro de un programa, mostrar su nombre u organización
  if (programStore.currentProgram) {
    return (
      programStore.currentProgram.organizationName ||
      programStore.currentProgram.name ||
      "WALA"
    );
  }
  // Si no hay programa seleccionado, mostrar "Wala"
  return "WALA";
});

// Contexto del facilitador (simulando estructura de currentBusiness para reutilizar SidebarContent)
const facilitatorContext = computed(() => {
  if (!programStore.currentProgram) {
    return {
      businessName: "Wala",
      departamento: "Facilitador",
      activo: true,
    };
  }

  return {
    businessName:
      programStore.currentProgram.organizationName ||
      programStore.currentProgram.name ||
      "Programa",
    departamento: `Código: ${programStore.currentProgram.codTeam || "N/A"}`,
    activo: true,
  };
});

// Elementos del menú principal para facilitadores
const mainItems = computed(() => {
  const items = [
    {
      icon: "groups",
      label: "Mis Programas",
      to: "/programs",
      permission: null,
    },
  ];

  // Si estamos dentro de un programa específico, agregar subitems
  const programId = route.params.programId;
  if (programId) {
    items.push(
      {
        icon: "dashboard",
        label: "Dashboard",
        to: `/programs/${programId}`,
        permission: null,
      },
      {
        icon: "group",
        label: "Participantes",
        to: `/programs/${programId}/participants`,
        permission: null,
      },
      {
        icon: "assignment",
        label: "Evaluaciones",
        to: `/programs/${programId}/assessments`,
        permission: null,
      },
      {
        icon: "assessment",
        label: "Reportes",
        to: `/programs/${programId}/reports`,
        permission: null,
      }
    );
  }

  return items;
});

// Elementos de cuenta
const accountItems = computed(() => [
  {
    icon: "user",
    label: "Mis datos",
    to: "/profile",
    permission: null,
  },
]);

// ══════════════════════════════════════════════════════════════
// MÉTODOS
// ══════════════════════════════════════════════════════════════

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/auth/login");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
</script>
