<template>
  <div class="space-y-6 mb-20">
    <!-- 🔧 DEV: Botón temporal para inicializar taxonomías -->
    <!-- <div class="max-w-2xl mx-auto px-4">
      <button
        v-if="!taxonomiesInitialized"
        @click="initTaxonomies"
        :disabled="initializingTaxonomies"
        class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2"
      >
        <span v-if="initializingTaxonomies"
          >⏳ Inicializando taxonomías...</span
        >
        <span v-else>🤖 Inicializar Taxonomías IA (Solo una vez)</span>
      </button>
      <div
        v-if="taxonomyMessage"
        :class="[
          'mt-2 p-3 rounded-lg text-sm',
          taxonomyError
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-green-50 text-green-800 border border-green-200',
        ]"
      >
        {{ taxonomyMessage }}
      </div>
    </div> -->

    <!-- Micro Aplicaciones: ancho completo en desktop, centrado en móvil -->
    <div class="max-w-2xl lg:max-w-none mx-auto">
      <MicroApps
        :business-id="businessId"
        @navigate-to-app="handleNavigateToApp"
      />
    </div>

    <!-- Contenedor con max-w-2xl para el resto del contenido -->
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Contenedor con max-w-2xl para el resto del contenido -->
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- ¿Cómo va el día? -->
        <Suspense>
          <template #default>
            <div data-tour="resumen-day">
              <ResumenDay :transactions="[]" />
            </div>
          </template>
          <template #fallback>
            <Loader />
          </template>
        </Suspense>

        <!-- Historial de transacciones del día -->
        <Suspense>
          <template #default>
            <div data-tour="transactions-list">
              <ListRecordByDay :transactions="[]" />
            </div>
          </template>
          <template #fallback>
            <Loader />
          </template>
        </Suspense>

        <!-- <ClasificationTest /> -->
      </div>

      <!-- Botones principales fijos -->
      <div
        class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-2xl shadow-xl"
      >
        <MainBtns />
      </div>
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
import { useOnboarding } from "@/composables/useOnboarding";
import { getFunctions, httpsCallable } from "firebase/functions";
import appFirebase from "@/firebaseInit";

import ClasificationTest from "@/components/Test/ClasificationTest.vue";

const functions = getFunctions(appFirebase, "southamerica-east1");

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
const { autoStartIfFirstVisit } = useOnboarding(); // ✅ Sistema de onboarding

// ✅ ARQUITECTURA COHERENTE: Computed properties usando la nueva estructura

const metrics = ref(null);
const metricsLoading = ref(false);

// Estados para inicialización de taxonomías
const initializingTaxonomies = ref(false);
const taxonomiesInitialized = ref(false);
const taxonomyMessage = ref("");
const taxonomyError = ref(false);

// BusinessStore: datos completos del negocio
const businessId = computed(
  () => route.params.businessId || userStore.currentBusiness?.businessId,
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
          `/business/${userStore.userBusinesses[0].businessId}/dashboard`,
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

// Función para inicializar taxonomías (solo se ejecuta una vez)
const initTaxonomies = async () => {
  try {
    initializingTaxonomies.value = true;
    taxonomyMessage.value = "";
    taxonomyError.value = false;

    // Detectar si estamos en desarrollo (emuladores) o producción
    const isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const functionUrl = isDev
      ? "http://127.0.0.1:5001/wala-lat/southamerica-east1/initializeTaxonomies"
      : "https://southamerica-east1-wala-lat.cloudfunctions.net/initializeTaxonomies";

    console.log("🔧 Llamando a función:", functionUrl);

    // Llamar como HTTP request en lugar de callable
    const response = await fetch(functionUrl, {
      method: "GET",
    });

    console.log("📡 Response status:", response.status);

    const result = await response.json();

    console.log("📦 Response data:", result);

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || JSON.stringify(result) || "Error desconocido",
      );
    }

    taxonomiesInitialized.value = true;
    taxonomyError.value = false;

    const created = result.results.filter((r) => r.status === "created").length;
    const skipped = result.results.filter((r) => r.status === "skipped").length;

    taxonomyMessage.value = `✅ ${created} taxonomías creadas, ${skipped} ya existían. Total de categorías: ${result.results.reduce((acc, r) => acc + r.categoriesCount, 0)}`;

    console.log("✅ Taxonomías inicializadas:", result);
  } catch (error) {
    taxonomyError.value = true;
    taxonomyMessage.value = `❌ Error: ${error.message}`;
    console.error("❌ Error al inicializar taxonomías:", error);
  } finally {
    initializingTaxonomies.value = false;
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

  // ✅ Auto-iniciar tour de onboarding en primera visita
  await autoStartIfFirstVisit();
});
</script>

<style scoped>
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Transiciones suaves para la cuadrícula */
.grid > div {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Sombras cuidadas para microaplicaciones */
.aspect-square {
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.aspect-square:hover {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Responsive breakpoints */
@media (max-width: 375px) {
  .grid {
    gap: 0.5rem;
  }
}
</style>
