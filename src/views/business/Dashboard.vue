<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header/Navbar -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo y nombre del negocio -->
          <div class="flex items-center space-x-4">
            <div
              class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"
            >
              <span class="text-lg font-bold text-white">W</span>
            </div>
            <div>
              <h1 class="text-xl font-semibold text-gray-900">
                {{ business?.nombre || "Cargando..." }}
              </h1>
              <p class="text-sm text-gray-500">
                {{ getBusinessTypeDisplay(business?.tipo) }}
              </p>
            </div>
          </div>

          <!-- Usuario y acciones -->
          <div class="flex items-center space-x-4">
            <!-- Información del usuario -->
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">
                {{ userProfile?.nombre || "Usuario" }}
                {{ userProfile?.apellidos || "" }}
              </p>
              <p class="text-xs text-gray-500">
                {{ getRoleDisplay(currentBusiness?.rol) }}
              </p>
            </div>

            <!-- Menú de usuario -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <div
                  class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"
                >
                  <span class="text-sm font-medium">
                    {{
                      getUserInitials(
                        userProfile?.nombre,
                        userProfile?.apellidos
                      )
                    }}
                  </span>
                </div>
                <span class="text-sm">▼</span>
              </button>

              <!-- Dropdown del usuario -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
              >
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <span>🚪</span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-sm h-screen sticky top-0">
        <nav class="mt-8 px-4">
          <div class="space-y-2">
            <!-- Dashboard Principal -->
            <router-link
              :to="`/business/${businessId}/dashboard`"
              class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
              :class="{
                'bg-blue-50 text-blue-600': $route.path.endsWith('/dashboard'),
              }"
            >
              <span class="text-xl">📊</span>
              <span class="font-medium">Dashboard</span>
            </router-link>

            <!-- Sección de Movimientos -->
            <div class="pt-4">
              <h3
                class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                Movimientos
              </h3>
              <div class="mt-2 space-y-1">
                <!-- Ingresos -->
                <router-link
                  v-if="hasPermission('verIngresos')"
                  :to="`/business/${businessId}/income`"
                  class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-green-50 hover:text-green-600 transition-colors"
                  :class="{
                    'bg-green-50 text-green-600':
                      $route.path.includes('/income'),
                  }"
                >
                  <span class="text-xl">💰</span>
                  <span class="font-medium">Ingresos</span>
                </router-link>

                <!-- Egresos -->
                <router-link
                  v-if="hasPermission('verEgresos')"
                  :to="`/business/${businessId}/expenses`"
                  class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                  :class="{
                    'bg-red-50 text-red-600': $route.path.includes('/expenses'),
                  }"
                >
                  <span class="text-xl">💸</span>
                  <span class="font-medium">Egresos</span>
                </router-link>
              </div>
            </div>

            <!-- Sección de Reportes -->
            <div class="pt-4">
              <h3
                class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                Análisis
              </h3>
              <div class="mt-2 space-y-1">
                <!-- Reportes -->
                <router-link
                  v-if="hasPermission('verReportes')"
                  :to="`/business/${businessId}/reports`"
                  class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  :class="{
                    'bg-purple-50 text-purple-600':
                      $route.path.includes('/reports'),
                  }"
                >
                  <span class="text-xl">📈</span>
                  <span class="font-medium">Reportes</span>
                </router-link>
              </div>
            </div>

            <!-- Sección de Administración (Solo Gerentes) -->
            <div v-if="isManager" class="pt-4">
              <h3
                class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                Administración
              </h3>
              <div class="mt-2 space-y-1">
                <!-- Empleados -->
                <router-link
                  :to="`/business/${businessId}/employees`"
                  class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  :class="{
                    'bg-indigo-50 text-indigo-600':
                      $route.path.includes('/employees'),
                  }"
                >
                  <span class="text-xl">👥</span>
                  <span class="font-medium">Empleados</span>
                  <span
                    v-if="employeeCount > 0"
                    class="ml-auto bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full"
                  >
                    {{ employeeCount }}
                  </span>
                </router-link>

                <!-- Configuración -->
                <router-link
                  :to="`/business/${businessId}/settings`"
                  class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-600 transition-colors"
                  :class="{
                    'bg-gray-50 text-gray-600':
                      $route.path.includes('/settings'),
                  }"
                >
                  <span class="text-xl">⚙️</span>
                  <span class="font-medium">Configuración</span>
                </router-link>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      <!-- Contenido principal -->
      <main class="flex-1 p-8">
        <!-- Breadcrumb -->
        <nav class="mb-6">
          <ol class="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <router-link
                :to="`/business/${businessId}/dashboard`"
                class="hover:text-gray-700"
              >
                {{ business?.nombre }}
              </router-link>
            </li>
            <li v-if="!$route.path.endsWith('/dashboard')">
              <span>/</span>
            </li>
            <li
              v-if="!$route.path.endsWith('/dashboard')"
              class="text-gray-700"
            >
              {{ getCurrentPageTitle() }}
            </li>
          </ol>
        </nav>

        <!-- Vista del router -->
        <router-view v-if="business" />

        <!-- Loading state -->
        <div v-else class="flex items-center justify-center h-64">
          <div class="text-center">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
            ></div>
            <p class="text-gray-600">Cargando negocio...</p>
          </div>
        </div>
      </main>
    </div>

    <!-- Click outside para cerrar menús -->
    <div
      v-if="showUserMenu"
      @click="showUserMenu = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useBusinessStore } from "@/stores/businessStore";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();
const businessStore = useBusinessStore();

const showUserMenu = ref(false);

// Computed properties
const userProfile = computed(() => userStore.userProfile);
const currentBusiness = computed(() => userStore.currentBusiness);
const business = computed(() => businessStore.business);
const businessId = computed(() => route.params.businessId);
const isManager = computed(() => userStore.isCurrentBusinessManager);
const employeeCount = computed(() => businessStore.employees.length);

onMounted(async () => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  // Verificar que el usuario tiene negocios
  if (!userStore.hasBusinesses) {
    router.push("/onboarding");
    return;
  }

  // Verificar que el negocio solicitado está en la lista del usuario
  const hasAccessToBusiness = userStore.userBusinesses.some(
    (b) => b.businessId === businessId.value
  );

  if (!hasAccessToBusiness) {
    console.error("Usuario no tiene acceso a este negocio");
    router.push("/select-business");
    return;
  }

  // Establecer negocio actual si no está establecido
  if (
    !userStore.currentBusiness ||
    userStore.currentBusiness.businessId !== businessId.value
  ) {
    userStore.switchBusiness(businessId.value);
  }

  // Cargar el negocio si no está cargado
  if (!business.value || business.value.id !== businessId.value) {
    try {
      console.log(`🔍 Cargando datos del negocio: ${businessId.value}`);
      await businessStore.loadBusiness(businessId.value);
      console.log(`✅ Negocio cargado exitosamente: ${business.value?.nombre}`);
    } catch (error) {
      console.error("❌ Error al cargar negocio:", error);

      // Si es un negocio recién creado, intentar una vez más después de un pequeño delay
      if (error.message.includes("no existe")) {
        console.log("🔄 Reintentando carga de negocio recién creado...");
        setTimeout(async () => {
          try {
            await businessStore.loadBusiness(businessId.value);
            console.log(
              `✅ Negocio cargado en segundo intento: ${business.value?.nombre}`
            );
          } catch (retryError) {
            console.error("❌ Error en segundo intento:", retryError);
            router.push("/select-business");
          }
        }, 1000);
      } else {
        router.push("/select-business");
      }
    }
  }
});

// Métodos
const hasPermission = (permission) => {
  if (isManager.value) return true; // Los gerentes tienen todos los permisos
  return userStore.currentPermissions?.[permission] || false;
};

const getRoleDisplay = (role) => {
  const roles = {
    gerente: "👨‍💼 Gerente",
    empleado: "👤 Empleado",
  };
  return roles[role] || "👤 Usuario";
};

const getBusinessTypeDisplay = (type) => {
  const types = {
    restaurante: "🍽️ Restaurante",
    tienda: "🛍️ Tienda",
    farmacia: "💊 Farmacia",
    panaderia: "🥖 Panadería",
    ferreteria: "🔧 Ferretería",
    salon: "💄 Salón",
    consultorio: "🏥 Consultorio",
    taller: "🔧 Taller",
    otro: "📦 Negocio",
  };
  return types[type] || "📦 Negocio";
};

const getUserInitials = (nombre, apellidos) => {
  const n = nombre?.charAt(0)?.toUpperCase() || "U";
  const a = apellidos?.charAt(0)?.toUpperCase() || "";
  return n + a;
};

const getCurrentPageTitle = () => {
  const path = route.path;
  if (path.includes("/income")) return "Ingresos";
  if (path.includes("/expenses")) return "Egresos";
  if (path.includes("/reports")) return "Reportes";
  if (path.includes("/employees")) return "Empleados";
  if (path.includes("/settings")) return "Configuración";
  return "Dashboard";
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
</script>
