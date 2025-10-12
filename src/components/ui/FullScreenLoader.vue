<template>
  <Transition name="fade">
    <div v-if="isVisible" class="full-screen-loader">
      <div class="loader-content">
        <!-- Título -->
        <h2 class="loader-title">Cargando tu negocio… 🚀</h2>

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
              <!-- Circle gris cuando está pendiente -->
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
import { Check } from "@iconoir/vue";

const { isVisible, isLoading } = useAppLoader();

// Solo 3 pasos simples
const loadingSteps = ref([
  {
    label: "Conectando con tu información principal",
    loading: false,
    completed: false,
  },
  {
    label: "Sincronizando tus transacciones recientes",
    loading: false,
    completed: false,
  },
  { label: "¡Todo listo para despegar!", loading: false, completed: false },
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
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.loader-content {
  text-align: center;
  max-width: 600px;
  padding: 48px 32px;
}

/* Título */
.loader-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 48px;
  color: #1f2937;
  letter-spacing: -0.02em;
}

/* Pasos de carga */
.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #f3f4f6;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-item.step-loading .step-icon-wrapper {
  background: #e0e7ff;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
}

.step-item.step-completed .step-icon-wrapper {
  background: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
}

/* Dot pendiente */
.pending-dot {
  width: 10px;
  height: 10px;
  background: #d1d5db;
  border-radius: 50%;
  transition: all 0.3s ease;
}

/* Spinner minimalista */
.mini-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid #e0e7ff;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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
  width: 20px;
  height: 20px;
  color: white;
  stroke-width: 3;
}

/* Label del paso */
.step-label {
  font-size: 16px;
  font-weight: 500;
  color: #9ca3af;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  flex: 1;
}

.step-item.step-loading .step-label {
  color: #6366f1;
}

.step-item.step-completed .step-label {
  color: #10b981;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .loader-content {
    max-width: 90%;
    padding: 40px 24px;
  }

  .loader-title {
    font-size: 24px;
    margin-bottom: 40px;
  }

  .loading-steps {
    gap: 20px;
  }

  .step-label {
    font-size: 15px;
  }
}
</style>
