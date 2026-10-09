<template>
  <div class="subscription-test p-8 bg-gray-50 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-3xl font-bold mb-2">🧪 Test de Suscripciones</h1>
        <p class="text-gray-600">
          Verifica que el sistema de suscripciones Premium/Free funciona
          correctamente
        </p>
      </div>

      <!-- Estado Actual -->
      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <!-- Plan Actual -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            📊 Estado de Suscripción
            <PremiumBadge :clickable="false" />
          </h2>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Plan:</span>
              <span class="font-semibold">{{ planInfo.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Estado:</span>
              <span class="font-semibold">{{
                subscription.status || "active"
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Es Premium:</span>
              <span
                :class="isPremium ? 'text-green-600' : 'text-red-600'"
                class="font-semibold"
              >
                {{ isPremium ? "✅ Sí" : "❌ No" }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Es Free:</span>
              <span
                :class="isFree ? 'text-green-600' : 'text-red-600'"
                class="font-semibold"
              >
                {{ isFree ? "✅ Sí" : "❌ No" }}
              </span>
            </div>
            <div class="flex justify-between" v-if="daysRemaining">
              <span class="text-gray-600">Días restantes:</span>
              <span class="font-semibold">{{ daysRemaining }}</span>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t">
            <button
              @click="goToPlans"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📋 Ver Planes Disponibles
            </button>
          </div>
        </div>

        <!-- Límites de Uso -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4">📈 Límites de Uso</h2>

          <div class="space-y-4">
            <!-- Empleados -->
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">Empleados</span>
                <span class="font-semibold">
                  {{ limits.employees.current }} / {{ limits.employees.max }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="canAddEmployee ? 'bg-green-500' : 'bg-red-500'"
                  :style="{
                    width: `${
                      (limits.employees.current / limits.employees.max) * 100
                    }%`,
                  }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{
                  canAddEmployee
                    ? `✅ ${limits.employees.available} disponibles`
                    : "❌ Límite alcanzado"
                }}
              </p>
            </div>

            <!-- Productos -->
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">Productos</span>
                <span class="font-semibold">
                  {{ limits.products.current }} / {{ limits.products.max }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="canAddProduct ? 'bg-green-500' : 'bg-red-500'"
                  :style="{
                    width: `${
                      (limits.products.current / limits.products.max) * 100
                    }%`,
                  }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{
                  canAddProduct
                    ? `✅ ${limits.products.available} disponibles`
                    : "❌ Límite alcanzado"
                }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Disponibles -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">🎁 Features Disponibles</h2>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="feature in allFeatures"
            :key="feature.key"
            class="p-4 border rounded-lg"
            :class="
              hasAccess(feature.key)
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 bg-gray-50'
            "
          >
            <div class="flex items-start gap-3">
              <span class="text-2xl">{{
                hasAccess(feature.key) ? "✅" : "🔒"
              }}</span>
              <div class="flex-1">
                <h3 class="font-semibold text-sm mb-1">{{ feature.name }}</h3>
                <p class="text-xs text-gray-600">{{ feature.description }}</p>
                <button
                  v-if="!hasAccess(feature.key)"
                  @click="testFeature(feature.key)"
                  class="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Test bloqueado →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Test de Componentes -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">🎨 Test de Componentes Visuales</h2>

        <!-- PremiumBadge -->
        <div class="mb-6 p-4 bg-gray-50 rounded">
          <h3 class="font-semibold mb-2">PremiumBadge Variants:</h3>
          <div class="flex flex-wrap gap-4">
            <div>
              <p class="text-xs text-gray-600 mb-1">Simple:</p>
              <PremiumBadge :clickable="false" />
            </div>
            <div>
              <p class="text-xs text-gray-600 mb-1">Con días:</p>
              <PremiumBadge :clickable="false" :show-days="true" />
            </div>
            <div>
              <p class="text-xs text-gray-600 mb-1">Clickeable:</p>
              <PremiumBadge />
            </div>
          </div>
        </div>

        <!-- FeatureGate -->
        <div class="space-y-4">
          <h3 class="font-semibold">FeatureGate Examples:</h3>

          <!-- Feature desbloqueada -->
          <div>
            <p class="text-sm text-gray-600 mb-2">
              Feature siempre disponible (test):
            </p>
            <FeatureGate feature="basicFeature">
              <div class="p-4 bg-green-100 border border-green-300 rounded">
                ✅ Este contenido está desbloqueado
              </div>
            </FeatureGate>
          </div>

          <!-- Feature bloqueada -->
          <div>
            <p class="text-sm text-gray-600 mb-2">
              Reportes Avanzados (Premium):
            </p>
            <FeatureGate
              feature="advancedReports"
              title="Reportes Avanzados"
              description="Accede a análisis detallados con gráficos interactivos"
            >
              <div class="p-4 bg-green-100 border border-green-300 rounded">
                ✅ Panel de Reportes Avanzados
              </div>
            </FeatureGate>
          </div>

          <!-- Clasificación AI -->
          <div>
            <p class="text-sm text-gray-600 mb-2">
              Clasificación con IA (Premium):
            </p>
            <FeatureGate feature="aiClassification" size="sm">
              <div class="p-4 bg-blue-100 border border-blue-300 rounded">
                🤖 Panel de Clasificación con IA
              </div>
            </FeatureGate>
          </div>
        </div>
      </div>

      <!-- Acciones de Test -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">🎮 Acciones de Test</h2>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            @click="testFeature('advancedReports')"
            class="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Feature Bloqueada
          </button>

          <button
            @click="testLimit('employee')"
            class="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Test Límite Empleado
          </button>

          <button
            @click="testLimit('product')"
            class="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Test Límite Producto
          </button>

          <button
            @click="
              showUpgradeModal('exportData', 'Test de modal personalizado')
            "
            class="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Test Modal Upgrade
          </button>

          <button
            @click="goToPlans"
            class="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Ir a Planes
          </button>

          <button
            @click="refreshData"
            class="p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ♻️ Refrescar Datos
          </button>
        </div>
      </div>

      <!-- Debug Info -->
      <div
        class="bg-gray-900 text-green-400 rounded-lg shadow-md p-6 mt-6 font-mono text-xs"
      >
        <h2 class="text-lg font-bold mb-2 text-white">🐛 Debug Info</h2>
        <pre class="overflow-auto">{{ debugInfo }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useSubscription } from "@/composables/useSubscription";
import { useBusinessStore } from "@/stores/businessStore";
import PremiumBadge from "@/components/ui/PremiumBadge.vue";
import FeatureGate from "@/components/ui/FeatureGate.vue";

const businessStore = useBusinessStore();

const {
  isPremium,
  isFree,
  planInfo,
  subscription,
  daysRemaining,
  hasAccess,
  limits,
  canAddEmployee,
  canAddProduct,
  requireFeature,
  requireLimit,
  showUpgradeModal,
  goToPlans,
} = useSubscription();

// Lista de todas las features para testing
const allFeatures = [
  {
    key: "advancedReports",
    name: "Reportes Avanzados",
    description: "Análisis detallados y gráficos",
  },
  {
    key: "aiClassification",
    name: "Clasificación con IA",
    description: "Clasificación automática con Grok",
  },
  {
    key: "exportData",
    name: "Exportar Datos",
    description: "Exporta a Excel, PDF, CSV",
  },
  {
    key: "multiLocation",
    name: "Múltiples Ubicaciones",
    description: "Gestiona varias sucursales",
  },
  {
    key: "apiAccess",
    name: "Acceso a API",
    description: "Integración con sistemas externos",
  },
  {
    key: "prioritySupport",
    name: "Soporte Prioritario",
    description: "Atención personalizada y rápida",
  },
  {
    key: "customBranding",
    name: "Marca Personalizada",
    description: "Personaliza reportes y documentos",
  },
];

const testFeature = (featureName) => {
  console.log("🧪 Testing feature:", featureName);
  requireFeature(featureName);
};

const testLimit = (resourceType) => {
  console.log("🧪 Testing limit:", resourceType);
  requireLimit(resourceType);
};

const refreshData = async () => {
  const businessId = businessStore.getBusinessId;
  if (businessId) {
    console.log("♻️ Refrescando datos del negocio...");
    await businessStore.loadBusiness(businessId);
    alert("✅ Datos refrescados");
  }
};

const debugInfo = computed(() => {
  return JSON.stringify(
    {
      business: {
        id: businessStore.business?.id,
        nombre: businessStore.business?.nombre,
      },
      subscription: businessStore.business?.subscription,
      features: businessStore.business?.features,
      usage: businessStore.business?.usage,
      getters: {
        isPremium: isPremium.value,
        isFree: isFree.value,
        canAddEmployee: canAddEmployee.value,
        canAddProduct: canAddProduct.value,
      },
    },
    null,
    2
  );
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
