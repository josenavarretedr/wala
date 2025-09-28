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
      </div>
    </div>
    <HistorialRecords />

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
import HistorialRecords from "@/components/HistorialRecords/HistorialRecords.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const businessStore = useBusinessStore(); // ✅ NUEVO: Usar BusinessStore

// Estado reactivo
const metricsLoading = ref(true);
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
