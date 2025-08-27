<template>
  <div class="space-y-6">
    <!-- Header del dashboard -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-600 mt-1">
            Resumen de {{ business?.businessName || "tu negocio" }}
          </p>
        </div>

        <!-- Acciones rápidas del header -->
        <div class="flex space-x-3">
          <button
            v-if="hasPermission('crearMovimientos')"
            @click="showQuickAddModal = true"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span class="mr-2">➕</span>
            Agregar Movimiento
          </button>

          <button
            v-if="hasPermission('verReportes')"
            @click="$router.push(`/business/${businessId}/reports`)"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span class="mr-2">📊</span>
            Ver Reportes
          </button>
        </div>
      </div>
    </div>

    <!-- Tarjetas de métricas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Ingresos del mes -->
      <MetricCard
        title="Ingresos del Mes"
        :value="metrics.monthlyIncome"
        :change="metrics.incomeChange"
        icon="💵"
        color="green"
        :loading="metricsLoading"
      />

      <!-- Egresos del mes -->
      <MetricCard
        title="Egresos del Mes"
        :value="metrics.monthlyExpenses"
        :change="metrics.expensesChange"
        icon="💸"
        color="red"
        :loading="metricsLoading"
      />

      <!-- Balance neto -->
      <MetricCard
        title="Balance Neto"
        :value="metrics.netBalance"
        :change="metrics.balanceChange"
        icon="⚖️"
        :color="metrics.netBalance >= 0 ? 'green' : 'red'"
        :loading="metricsLoading"
      />

      <!-- Transacciones totales -->
      <MetricCard
        title="Transacciones"
        :value="metrics.totalTransactions"
        :change="metrics.transactionsChange"
        icon="🔄"
        color="blue"
        format="number"
        :loading="metricsLoading"
      />
    </div>

    <!-- Contenido principal del dashboard -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Panel principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Gráfico de resumen -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">
              Resumen Financiero (Últimos 6 meses)
            </h2>
            <select
              v-model="chartPeriod"
              class="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="6m">Últimos 6 meses</option>
              <option value="1y">Último año</option>
              <option value="ytd">Este año</option>
            </select>
          </div>

          <!-- Placeholder del gráfico -->
          <div
            class="h-64 bg-gray-50 rounded-lg flex items-center justify-center"
          >
            <div class="text-center">
              <span class="text-4xl mb-2 block">📈</span>
              <p class="text-gray-500">Gráfico de flujo de caja</p>
              <p class="text-xs text-gray-400">Próximamente disponible</p>
            </div>
          </div>
        </div>

        <!-- Actividad reciente -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              Actividad Reciente
            </h3>
            <router-link
              :to="`/business/${businessId}/transactions`"
              class="text-sm text-blue-600 hover:text-blue-700"
            >
              Ver todas →
            </router-link>
          </div>

          <div class="space-y-3">
            <!-- Simulación de transacciones recientes -->
            <div
              v-for="i in 3"
              :key="i"
              class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div
                class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
              >
                <span class="text-green-600 text-sm">💵</span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">
                  Venta #{{ 1000 + i }}
                </p>
                <p class="text-xs text-gray-500">Hace {{ i }} horas</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-green-600">
                  +S/ {{ (Math.random() * 500 + 100).toFixed(2) }}
                </p>
              </div>
            </div>

            <div class="text-center py-4">
              <span class="text-gray-500 text-sm"
                >Cargando más transacciones...</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Panel lateral -->
      <div class="space-y-6">
        <!-- Accesos rápidos -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Accesos Rápidos
          </h3>

          <div class="space-y-2">
            <QuickActionButton
              v-if="hasPermission('crearMovimientos')"
              icon="💵"
              label="Registrar Ingreso"
              description="Agregar nueva venta o ingreso"
              @click="openQuickAdd('income')"
            />

            <QuickActionButton
              v-if="hasPermission('crearMovimientos')"
              icon="💸"
              label="Registrar Egreso"
              description="Agregar nuevo gasto"
              @click="openQuickAdd('expense')"
            />

            <QuickActionButton
              v-if="hasPermission('verReportes')"
              icon="📊"
              label="Generar Reporte"
              description="Ver análisis financiero"
              @click="$router.push(`/business/${businessId}/reports`)"
            />

            <QuickActionButton
              v-if="isManager"
              icon="👥"
              label="Gestionar Empleados"
              description="Administrar equipo"
              @click="$router.push(`/business/${businessId}/employees`)"
            />
          </div>
        </div>

        <!-- Información del negocio -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Información del Negocio
          </h3>

          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <span class="text-gray-400">🏪</span>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ business?.businessName }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ getBusinessTypeDisplay(business?.tipo) }}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <span class="text-gray-400">👤</span>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ authStore.user?.displayName || authStore.user?.email }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ getRoleDisplay(businessStore.getCurrentUserRole) }}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <span class="text-gray-400">🆔</span>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  ID: {{ businessId }}
                </p>
                <p class="text-xs text-gray-500">Identificador único</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado del sistema -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Estado del Sistema
          </h3>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Conexión</span>
              <span
                class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                >Activa</span
              >
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Sincronización</span>
              <span
                class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                >Al día</span
              >
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Respaldo</span>
              <span
                class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full"
                >Automático</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Quick Add (placeholder) -->
    <div
      v-if="showQuickAddModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showQuickAddModal = false"
    >
      <div
        class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        ></div>

        <div
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Agregar {{ quickAddType === "income" ? "Ingreso" : "Egreso" }}
            </h3>
            <button
              @click="showQuickAddModal = false"
              class="text-gray-400 hover:text-gray-600"
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

          <div class="text-center py-8">
            <span class="text-4xl mb-4 block">🚧</span>
            <p class="text-gray-500">Modal de agregar movimiento</p>
            <p class="text-xs text-gray-400">Próximamente disponible</p>

            <button
              @click="showQuickAddModal = false"
              class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useBusinessStore } from "@/stores/businessStore";

// Imports de componentes
import MetricCard from "@/components/dashboard/MetricCard.vue";
import QuickActionButton from "@/components/dashboard/QuickActionButton.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const businessStore = useBusinessStore(); // ✅ NUEVO: Usar BusinessStore

// Estado reactivo
const metricsLoading = ref(true);
const chartPeriod = ref("6m");
const showQuickAddModal = ref(false);
const quickAddType = ref("income");

const metrics = ref({
  monthlyIncome: 0,
  monthlyExpenses: 0,
  netBalance: 0,
  totalTransactions: 0,
  incomeChange: 0,
  expensesChange: 0,
  balanceChange: 0,
  transactionsChange: 0,
});

// ✅ ARQUITECTURA COHERENTE: Computed properties usando la nueva estructura
const business = computed(() => userStore.currentBusiness); // UserStore: relación usuario-negocio
const businessData = computed(() => businessStore.business); // BusinessStore: datos completos del negocio
const businessId = computed(
  () => route.params.businessId || userStore.currentBusiness?.businessId
);

// ✅ Usar BusinessStore para roles y permisos
const isManager = computed(() => businessStore.isCurrentUserManager);

// ✅ Función helper para verificar permisos usando BusinessStore
const hasPermission = (permission) => {
  return businessStore.hasPermission(permission);
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

const loadDashboardData = async () => {
  try {
    metricsLoading.value = true;

    // Verificar si tenemos un negocio activo
    if (!businessId.value) {
      // Si no hay businessId, redirigir al selector de negocios
      if (userStore.userBusinesses.length === 0) {
        router.push("/onboarding");
      } else if (userStore.userBusinesses.length === 1) {
        router.push(
          `/business/${userStore.userBusinesses[0].businessId}/dashboard`
        );
      } else {
        router.push("/select-business");
      }
      return;
    }

    // Simular carga de métricas
    setTimeout(() => {
      metrics.value = {
        monthlyIncome: 15000,
        monthlyExpenses: 8500,
        netBalance: 6500,
        totalTransactions: 142,
        incomeChange: 12.5,
        expensesChange: -5.2,
        balanceChange: 18.7,
        transactionsChange: 8.3,
      };
      metricsLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error("Error al cargar dashboard:", error);
    metricsLoading.value = false;
  }
};

const openQuickAdd = (type) => {
  quickAddType.value = type;
  showQuickAddModal.value = true;
};

// Ciclo de vida
onMounted(async () => {
  // Cargar negocios del usuario si no están cargados
  if (!userStore.userBusinesses || userStore.userBusinesses.length === 0) {
    await userStore.loadUserBusinesses(authStore.user?.uid);
  }

  loadDashboardData();
});
</script>

<style scoped>
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
