<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Wrapper del Flow -->
      <div
        class="space-y-4 bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-4 sm:p-6 mb-20"
      >
        <!-- HEADER con indicador de progreso -->
        <div class="flex justify-end items-center gap-3 mb-6 mr-4">
          <ProgressIndicator v-bind="progressProps" />
        </div>

        <!-- Paso actual con animación -->
        <Transition name="fade" mode="out-in">
          <component
            :is="CurrentStepComponent"
            :key="flowStore.currentStepIndex"
          />
        </Transition>
      </div>

      <!-- Navegación fija inferior -->
      <div
        class="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-xl border-t border-gray-100"
      >
        <NavigationBtnBusinessOnboarding />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useBusinessOnboardingFlowStore } from "@/stores/businessOnboardingFlowStore";
import {
  getProgressIndicatorProps,
  FLOW_TYPES,
} from "@/composables/useProgressIndicator";
import ProgressIndicator from "@/components/ui/ProgressIndicator.vue";
import NavigationBtnBusinessOnboarding from "@/components/businessOnboarding/NavigationBtnBusinessOnboarding.vue";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const flowStore = useBusinessOnboardingFlowStore();

const CurrentStepComponent = computed(
  () => flowStore.currentStepConfig.component,
);

// Props para el ProgressIndicator
const progressProps = computed(() => ({
  currentStep: flowStore.currentStepIndex,
  steps: flowStore.steps,
  currentStepLabel: flowStore.currentStepConfig.label,
  flowType: "business-onboarding",
}));

onMounted(() => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  // Si ya tiene negocios y NO está en modo create, redirigir al selector
  if (userStore.userBusinesses.length > 0 && !flowStore.isCreateMode) {
    router.push("/select-business");
    return;
  }

  // Iniciar el flow
  flowStore.startFlow();
});

const goBack = () => {
  flowStore.cancelFlow();

  if (userStore.userBusinesses.length > 0) {
    router.push("/select-business");
  } else {
    router.push("/login");
  }
};
</script>

<style scoped>
/* Animaciones de transición */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
