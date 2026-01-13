<template>
  <Transition name="fade">
    <div v-if="isVisible" class="full-screen-loader">
      <div class="loader-content">
        <!-- Icono principal -->
        <div class="loader-icon-wrapper">
          <div class="loader-icon-bg">
            <DatabaseRestore class="loader-icon" />
          </div>
        </div>

        <!-- Título -->
        <h2 class="loader-title">Cargando tu negocio</h2>
        <p class="loader-subtitle">Preparando todo para ti</p>

        <!-- Pasos de carga minimalistas -->
        <div class="loading-steps">
          <div
            v-for="(step, index) in loadingSteps"
            :key="index"
            class="step-item"
            :class="{
              'step-completed': step.completed,
              'step-loading': step.loading,
            }"
          >
            <div class="step-icon-wrapper">
              <!-- Spinner mientras carga -->
              <div v-if="step.loading" class="mini-spinner"></div>
              <!-- Check cuando completa -->
              <Check v-else-if="step.completed" class="check-icon" />
              <!-- Dot gris cuando está pendiente -->
              <div v-else class="pending-dot"></div>
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useAppLoader } from "@/composables/useAppLoader";
import { Check, DatabaseRestore } from "@iconoir/vue";

const { isVisible, isLoading } = useAppLoader();

// Solo 3 pasos simples
const loadingSteps = ref([
  {
    label: "Conectando con tu información",
    loading: false,
    completed: false,
  },
  {
    label: "Sincronizando transacciones",
    loading: false,
    completed: false,
  },
  {
    label: "Finalizando carga",
    loading: false,
    completed: false,
  },
]);

let stepInterval = null;
let currentStep = 0;

// Función para iniciar la secuencia
function initializeLoader() {
  console.log("👁️ Loader visible, iniciando secuencia...");
  // Reset
  currentStep = 0;
  loadingSteps.value.forEach((step) => {
    step.loading = false;
    step.completed = false;
  });
  startLoadingSequence();
}

// Al montar el componente, verificar si ya está visible
onMounted(() => {
  console.log("🎬 FullScreenLoader montado, isVisible:", isVisible.value);
  if (isVisible.value) {
    initializeLoader();
  }
});

// Cuando el loader se hace visible, iniciar la animación
watch(isVisible, (newValue) => {
  console.log("👀 watch(isVisible) disparado con valor:", newValue);
  if (newValue) {
    initializeLoader();
  } else {
    console.log("🚫 Loader oculto, limpiando intervalo...");
    // Limpiar intervalo si se oculta
    if (stepInterval) {
      clearInterval(stepInterval);
      stepInterval = null;
    }
  }
});

// Observar cuando isLoading cambia a false
watch(isLoading, (newValue) => {
  console.log("🔄 isLoading cambió a:", newValue);
  if (!newValue && isVisible.value) {
    console.log("✅ Completando todos los pasos...");
    // Cuando loading termina, completar todos los pasos inmediatamente
    completeAllSteps();
  }
});

function startLoadingSequence() {
  // Iniciar el primer paso
  if (loadingSteps.value[0]) {
    loadingSteps.value[0].loading = true;
    console.log("🔵 Paso 1 iniciado (spinner visible)");
  }

  // Ir avanzando los pasos cada 1.2 segundos
  // PERO sin completarlos, solo mostrando el spinner
  stepInterval = setInterval(() => {
    // Solo avanzar al siguiente paso sin completar el anterior
    // Mantener todos los pasos anteriores como "loading"
    if (currentStep < loadingSteps.value.length - 1) {
      currentStep++;
      if (loadingSteps.value[currentStep]) {
        loadingSteps.value[currentStep].loading = true;
        console.log(`🔵 Paso ${currentStep + 1} iniciado (spinner visible)`);
      }
    }
    // Cuando llegamos al último paso, detener el intervalo
    // pero mantener todos los pasos en loading
    if (currentStep >= loadingSteps.value.length - 1) {
      console.log("⏸️ Todos los pasos iniciados, esperando hide()...");
      clearInterval(stepInterval);
      stepInterval = null;
    }
  }, 1200);
}

function completeAllSteps() {
  // Detener el intervalo
  if (stepInterval) {
    clearInterval(stepInterval);
    stepInterval = null;
  }

  console.log("🎯 Completando pasos con stagger...");
  // Completar todos los pasos que estaban loading
  loadingSteps.value.forEach((step, index) => {
    if (step.loading || !step.completed) {
      setTimeout(() => {
        step.loading = false;
        step.completed = true;
        console.log(`✅ Paso ${index + 1} completado (check verde)`);
      }, index * 100); // Reducido a 100ms - máxima velocidad
    }
  });
}
</script>

<style scoped>
.full-screen-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.loader-content {
  text-align: center;
  max-width: 480px;
  padding: 48px 32px;
}

/* Icono principal animado */
.loader-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.loader-icon-bg {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-scale 2s ease-in-out infinite;
}

.loader-icon {
  width: 40px;
  height: 40px;
  color: #6366f1;
  stroke-width: 1.5;
}

@keyframes pulse-scale {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15),
      0 0 0 1px rgba(99, 102, 241, 0.1);
  }
}

/* Título */
.loader-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #111827;
  letter-spacing: -0.02em;
}

.loader-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 40px;
  font-weight: 400;
}

/* Pasos de carga */
.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-icon-wrapper {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #f3f4f6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-item.step-loading .step-icon-wrapper {
  background: #e0e7ff;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.step-item.step-completed .step-icon-wrapper {
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

/* Dot pendiente */
.pending-dot {
  width: 8px;
  height: 8px;
  background: #d1d5db;
  border-radius: 50%;
  transition: all 0.3s ease;
}

/* Spinner minimalista */
.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e0e7ff;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Icono Check */
.check-icon {
  width: 18px;
  height: 18px;
  color: white;
  stroke-width: 2.5;
  animation: check-pop 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes check-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Label del paso */
.step-label {
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  flex: 1;
}

.step-item.step-loading .step-label {
  color: #6366f1;
  font-weight: 600;
}

.step-item.step-completed .step-label {
  color: #10b981;
  font-weight: 600;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .loader-content {
    max-width: 90%;
    padding: 32px 20px;
  }

  .loader-icon-bg {
    width: 64px;
    height: 64px;
    border-radius: 16px;
  }

  .loader-icon {
    width: 32px;
    height: 32px;
  }

  .loader-title {
    font-size: 20px;
    margin-bottom: 6px;
  }

  .loader-subtitle {
    font-size: 13px;
    margin-bottom: 32px;
  }

  .loading-steps {
    gap: 12px;
    padding: 20px 16px;
    border-radius: 12px;
  }

  .step-item {
    gap: 10px;
    padding: 6px 0;
  }

  .step-icon-wrapper {
    width: 24px;
    height: 24px;
  }

  .mini-spinner {
    width: 14px;
    height: 14px;
  }

  .check-icon {
    width: 16px;
    height: 16px;
  }

  .step-label {
    font-size: 13px;
  }
}
</style>
