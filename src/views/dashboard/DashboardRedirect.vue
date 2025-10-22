<template>
  <div class="space-y-6 max-w-2xl mx-auto mb-20">
    <MicroApps
      :business-id="businessId"
      @navigate-to-app="handleNavigateToApp"
    />

    <!-- ¿Cómo va el día? -->
    <Suspense>
      <template #default>
        <ResumenDay :transactions="[]" />
      </template>
      <template #fallback>
        <Loader />
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <ListRecordByDay :transactions="[]" />
      </template>
      <template #fallback>
        <Loader />
      </template>
    </Suspense>

    <div
      class="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white rounded-2xl shadow-xl"
    >
      <MainBtns />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, transformVNodeArgs } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

// Imports de componentes
import MicroApps from "@/components/Dashboard/MicroApps.vue";
import ResumenDay from "@/components/HistorialRecords/ResumenDay.vue";
import Loader from "@/components/ui/Loader.vue";
import MainBtns from "../../components/Dashboard/MainBtns.vue";
import ListRecordByDay from "@/components/HistorialRecords/ListRecordByDay.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const businessStore = useBusinessStore(); // ✅ NUEVO: Usar BusinessStore
const transactionsStore = useTransactionStore();

// ✅ ARQUITECTURA COHERENTE: Computed properties usando la nueva estructura

const metrics = ref(null);
const metricsLoading = ref(false);

// BusinessStore: datos completos del negocio
const businessId = computed(
  () => route.params.businessId || userStore.currentBusiness?.businessId
);

// ✅ Usar BusinessStore para roles y permisos
const isManager = computed(() => businessStore.isCurrentUserManager);

// ✅ Función helper para verificar permisos usando BusinessStore
const hasPermission = (permission) => {
  return businessStore.hasPermission(permission);
};

// Función para manejar navegación de microaplicaciones
const handleNavigateToApp = (app) => {
  if (app.available && businessId.value) {
    const targetRoute = `/business/${businessId.value}${app.route}`;
    router.push(targetRoute);
  } else if (!app.available) {
    // Mostrar notificación de próximamente (puedes reemplazar con tu sistema de notificaciones)
    console.log(`${app.name} estará disponible próximamente`);
  }
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

  // await transactionsStore.getTransactionsToday();

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

/* Transiciones suaves para la cuadrícula */
.grid > div {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Sombras cuidadas para microaplicaciones */
.aspect-square {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.aspect-square:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Responsive breakpoints */
@media (max-width: 375px) {
  .grid {
    gap: 0.5rem;
  }
}
</style>
