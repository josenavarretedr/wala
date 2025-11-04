<template>
  <div class="premium-badge-wrapper inline-flex">
    <!-- Badge Premium -->
    <div
      v-if="isPremium"
      class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      @click="handleClick"
      :title="tooltipText"
    >
      <span class="text-base">👑</span>
      <span>Premium</span>
      <span v-if="showDays && daysRemaining" class="text-xs opacity-90">
        ({{ daysRemaining }}d)
      </span>
    </div>

    <!-- Badge Trial -->
    <div
      v-else-if="isTrialActive"
      class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      @click="handleClick"
      :title="tooltipText"
    >
      <span class="text-base">🎁</span>
      <span>Prueba Gratis</span>
      <span v-if="daysRemaining" class="text-xs opacity-90">
        ({{ daysRemaining }}d)
      </span>
    </div>

    <!-- Badge Free -->
    <div
      v-else
      class="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-300 transition-colors cursor-pointer"
      @click="handleClick"
      :title="tooltipText"
    >
      <span class="text-base">🆓</span>
      <span>Plan Gratis</span>
      <span v-if="clickable" class="text-xs opacity-75 ml-1">→</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useSubscription } from "@/composables/useSubscription";

/**
 * 🏷️ Badge que muestra el estado de suscripción del negocio
 *
 * Muestra visualmente si el negocio tiene plan Free, Trial o Premium.
 * Opcionalmente clickeable para navegar a la página de planes.
 *
 * @component
 * @example
 * <!-- Badge simple -->
 * <PremiumBadge />
 *
 * <!-- Badge clickeable que navega a planes -->
 * <PremiumBadge :clickable="true" />
 *
 * <!-- Badge con días restantes -->
 * <PremiumBadge :show-days="true" />
 */

const props = defineProps({
  /**
   * Si el badge es clickeable y navega a planes
   */
  clickable: {
    type: Boolean,
    default: true,
  },

  /**
   * Si debe mostrar días restantes en planes temporales
   */
  showDays: {
    type: Boolean,
    default: false,
  },

  /**
   * Tamaño del badge ('sm' | 'md' | 'lg')
   */
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
});

const emit = defineEmits(["click"]);

const { isPremium, isFree, isTrialActive, daysRemaining, planInfo, goToPlans } =
  useSubscription();

const tooltipText = computed(() => {
  if (isPremium.value) {
    const days = daysRemaining.value;
    return days
      ? `Plan Premium activo - ${days} días restantes`
      : "Plan Premium activo";
  }

  if (isTrialActive.value) {
    return `Período de prueba - ${daysRemaining.value} días restantes`;
  }

  return "Plan gratuito - Actualiza para desbloquear más funciones";
});

const handleClick = () => {
  console.log("🏷️ [PremiumBadge] Click en badge:", planInfo.value.name);

  emit("click", planInfo.value);

  if (props.clickable) {
    goToPlans();
  }
};
</script>

<style scoped>
/* Animación sutil para badge premium */
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.premium-badge-wrapper:hover .bg-gradient-to-r {
  background-size: 200% auto;
  animation: shimmer 2s linear infinite;
}
</style>
