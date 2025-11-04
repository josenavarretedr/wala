<template>
  <div
    class="plans-view min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4"
  >
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Elige el plan perfecto para tu negocio
        </h1>
        <p class="text-xl text-gray-600">
          Potencia tu negocio con las herramientas que necesitas
        </p>

        <!-- Badge del plan actual -->
        <div class="mt-6 flex justify-center items-center gap-3">
          <span class="text-gray-600">Plan actual:</span>
          <PremiumBadge :clickable="false" :show-days="true" />
        </div>
      </div>

      <!-- Grid de planes -->
      <div class="grid md:grid-cols-2 gap-8 mb-12">
        <!-- Plan Free -->
        <div
          class="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:shadow-xl transition-shadow"
        >
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">🆓</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Plan Gratis</h2>
            <div class="text-4xl font-bold text-gray-900 mb-2">
              $0
              <span class="text-lg text-gray-500 font-normal">/mes</span>
            </div>
            <p class="text-gray-600">Para comenzar tu negocio</p>
          </div>

          <!-- Features Free -->
          <ul class="space-y-3 mb-8">
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-0.5">✓</span>
              <span class="text-gray-700"
                >Hasta <strong>3 empleados</strong></span
              >
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-0.5">✓</span>
              <span class="text-gray-700"
                >Hasta <strong>100 productos</strong></span
              >
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-0.5">✓</span>
              <span class="text-gray-700">Gestión básica de inventario</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-0.5">✓</span>
              <span class="text-gray-700">Registro de ventas y gastos</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-0.5">✓</span>
              <span class="text-gray-700">Reportes básicos</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-red-500 mt-0.5">✗</span>
              <span class="text-gray-400">Reportes avanzados</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-red-500 mt-0.5">✗</span>
              <span class="text-gray-400">Clasificación con IA</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-red-500 mt-0.5">✗</span>
              <span class="text-gray-400">Exportación de datos</span>
            </li>
          </ul>

          <!-- Botón Free -->
          <button
            v-if="!isFree"
            @click="handleDowngrade"
            class="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cambiar a Free
          </button>
          <div
            v-else
            class="w-full bg-green-100 text-green-700 py-3 rounded-lg font-medium text-center"
          >
            ✓ Plan Actual
          </div>
        </div>

        <!-- Plan Premium -->
        <div
          class="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-2xl p-8 border-2 border-amber-400 relative overflow-hidden hover:shadow-3xl transition-shadow"
        >
          <!-- Badge "Popular" -->
          <div
            class="absolute top-4 right-4 bg-white text-amber-600 px-3 py-1 rounded-full text-xs font-bold"
          >
            RECOMENDADO
          </div>

          <div class="text-center mb-6 text-white">
            <div class="text-5xl mb-3">👑</div>
            <h2 class="text-2xl font-bold mb-2">Plan Premium</h2>
            <div class="text-4xl font-bold mb-2">
              $29.99
              <span class="text-lg font-normal opacity-90">/mes</span>
            </div>
            <p class="opacity-90">Para hacer crecer tu negocio</p>
          </div>

          <!-- Features Premium -->
          <ul class="space-y-3 mb-8 text-white">
            <li class="flex items-start gap-2">
              <span class="mt-0.5">✓</span>
              <span><strong>Empleados ilimitados</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5">✓</span>
              <span><strong>Productos ilimitados</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5">✓</span>
              <span>Todo lo del plan gratuito</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5">✓</span>
              <span><strong>Reportes avanzados</strong> con gráficos</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5">✓</span>
              <span><strong>Clasificación con IA</strong> (Grok)</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5">✓</span>
              <span><strong>Exportación</strong> a Excel, PDF</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5">✓</span>
              <span><strong>Múltiples ubicaciones</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5">✓</span>
              <span><strong>Acceso a API</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5">✓</span>
              <span><strong>Soporte prioritario</strong></span>
            </li>
          </ul>

          <!-- Botón Premium -->
          <button
            v-if="!isPremium"
            @click="handleUpgrade"
            :disabled="isUpgrading"
            class="w-full bg-white text-amber-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isUpgrading">Procesando...</span>
            <span v-else>✨ Actualizar a Premium</span>
          </button>
          <div
            v-else
            class="w-full bg-white/20 text-white py-3 rounded-lg font-medium text-center backdrop-blur"
          >
            ✓ Plan Actual
          </div>
        </div>
      </div>

      <!-- Comparación de features -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          Comparación de Features
        </h3>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-gray-200">
                <th class="text-left py-3 px-4 text-gray-700 font-semibold">
                  Feature
                </th>
                <th class="text-center py-3 px-4 text-gray-700 font-semibold">
                  Free
                </th>
                <th class="text-center py-3 px-4 text-amber-600 font-semibold">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(feature, index) in comparisonFeatures"
                :key="index"
                class="border-b border-gray-100"
              >
                <td class="py-3 px-4 text-gray-700">{{ feature.name }}</td>
                <td class="text-center py-3 px-4">
                  <span
                    v-if="feature.free === true"
                    class="text-green-500 text-xl"
                    >✓</span
                  >
                  <span
                    v-else-if="feature.free === false"
                    class="text-red-500 text-xl"
                    >✗</span
                  >
                  <span v-else class="text-gray-600 text-sm">{{
                    feature.free
                  }}</span>
                </td>
                <td class="text-center py-3 px-4">
                  <span
                    v-if="feature.premium === true"
                    class="text-green-500 text-xl"
                    >✓</span
                  >
                  <span v-else class="text-gray-600 text-sm">{{
                    feature.premium
                  }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Botón volver -->
      <div class="mt-8 text-center">
        <button
          @click="goBack"
          class="text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Volver al dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useSubscription } from "@/composables/useSubscription";
import { useBusinessStore } from "@/stores/businessStore";
import PremiumBadge from "@/components/ui/PremiumBadge.vue";

const router = useRouter();
const businessStore = useBusinessStore();
const { isPremium, isFree, planInfo } = useSubscription();

const isUpgrading = ref(false);

// Features para comparación
const comparisonFeatures = [
  { name: "Número de empleados", free: "3", premium: "Ilimitado" },
  { name: "Número de productos", free: "100", premium: "Ilimitado" },
  { name: "Gestión de inventario", free: true, premium: true },
  { name: "Registro de transacciones", free: true, premium: true },
  { name: "Reportes básicos", free: true, premium: true },
  { name: "Reportes avanzados", free: false, premium: true },
  { name: "Gráficos y análisis", free: false, premium: true },
  { name: "Clasificación con IA", free: false, premium: true },
  { name: "Exportación de datos", free: false, premium: true },
  { name: "Múltiples ubicaciones", free: false, premium: true },
  { name: "Acceso a API", free: false, premium: true },
  { name: "Soporte prioritario", free: false, premium: true },
  { name: "Marca personalizada", free: false, premium: true },
];

const handleUpgrade = async () => {
  console.log("⬆️ Iniciando upgrade a Premium");

  const confirmed = confirm(
    "¿Deseas actualizar a Premium?\n\n" +
      "✨ Desbloquearás todas las funciones avanzadas.\n" +
      "💰 Precio: $29.99/mes\n\n" +
      "Nota: Este es un demo. En producción se integraría con un sistema de pagos real."
  );

  if (!confirmed) return;

  try {
    isUpgrading.value = true;

    const businessId = businessStore.getBusinessId;
    const userId = businessStore.business?.gerenteId;

    if (!businessId) {
      alert("❌ Error: No hay negocio seleccionado");
      return;
    }

    // Actualizar a plan premium
    await businessStore.updateSubscriptionPlan(businessId, "premium", userId);

    alert(
      "🎉 ¡Felicidades! Tu negocio ahora tiene plan Premium.\n\nTodas las funciones están desbloqueadas."
    );

    // Recargar datos del negocio
    await businessStore.loadBusiness(businessId);
  } catch (error) {
    console.error("❌ Error al actualizar plan:", error);
    alert("Error al actualizar el plan. Por favor intenta nuevamente.");
  } finally {
    isUpgrading.value = false;
  }
};

const handleDowngrade = async () => {
  const confirmed = confirm(
    "¿Deseas cambiar a plan Free?\n\n" +
      "⚠️ Perderás acceso a:\n" +
      "- Reportes avanzados\n" +
      "- Clasificación con IA\n" +
      "- Exportación de datos\n" +
      "- Múltiples ubicaciones\n" +
      "- Acceso a API\n\n" +
      "¿Estás seguro?"
  );

  if (!confirmed) return;

  try {
    const businessId = businessStore.getBusinessId;
    const userId = businessStore.business?.gerenteId;

    await businessStore.updateSubscriptionPlan(businessId, "free", userId);

    alert("✅ Tu plan ha sido cambiado a Free.");

    await businessStore.loadBusiness(businessId);
  } catch (error) {
    console.error("❌ Error al cambiar plan:", error);
    alert("Error al cambiar el plan.");
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
/* Sombras personalizadas */
.shadow-3xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>
