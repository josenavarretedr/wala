// src/stores/businessOnboardingFlowStore.js
import { defineStore } from 'pinia';
import { ref, computed, markRaw } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Importar componentes de steps
import StepBusinessName from '@/components/businessOnboarding/StepBusinessName.vue';
import StepIndustry from '@/components/businessOnboarding/StepIndustry.vue';
import StepBusinessType from '@/components/businessOnboarding/StepBusinessType.vue';
import StepBusinessDescription from '@/components/businessOnboarding/StepBusinessDescription.vue';

export const useBusinessOnboardingFlowStore = defineStore('businessOnboardingFlow', () => {
  const router = useRouter();
  const route = useRoute();

  // ===== ESTADO DEL FLOW =====
  const currentStepIndex = ref(0);
  const isFlowActive = ref(false);

  // ===== DATOS DEL FORMULARIO =====
  const businessOnboardingData = ref({
    nombre: '',
    industry: '',
    businessType: '',
    descripcion: ''
  });

  // ===== CONFIGURACIÓN DE STEPS =====
  const steps = [
    {
      id: 'business-name',
      component: markRaw(StepBusinessName),
      label: 'Nombre del negocio',
      isValid: () => businessOnboardingData.value.nombre.trim().length > 0
    },
    {
      id: 'industry',
      component: markRaw(StepIndustry),
      label: 'Rubro/Industria',
      isValid: () => businessOnboardingData.value.industry !== ''
    },
    {
      id: 'business-type',
      component: markRaw(StepBusinessType),
      label: 'Tipo de actividad',
      isValid: () => businessOnboardingData.value.businessType !== ''
    },
    {
      id: 'description',
      component: markRaw(StepBusinessDescription),
      label: 'Descripción',
      isValid: () => businessOnboardingData.value.descripcion.trim().length >= 10
    }
  ];

  // ===== COMPUTED =====
  const currentStepConfig = computed(() => steps[currentStepIndex.value]);
  const totalSteps = computed(() => steps.length);
  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(() => currentStepIndex.value === totalSteps.value - 1);

  const canGoNext = computed(() => {
    return currentStepConfig.value.isValid();
  });

  const isCreateMode = computed(() => route.query.mode === 'create');

  // ===== ACCIONES =====

  /**
   * Iniciar el flow
   */
  function startFlow() {
    isFlowActive.value = true;
    currentStepIndex.value = 0;
    resetFormData();
  }

  /**
   * Avanzar al siguiente paso
   */
  function nextStep() {
    if (!canGoNext.value) {
      return false;
    }

    if (isLastStep.value) {
      return false; // El submit se maneja desde NavigationBtn
    }

    currentStepIndex.value++;
    return true;
  }

  /**
   * Retroceder al paso anterior
   */
  function previousStep() {
    if (isFirstStep.value) {
      return false;
    }

    currentStepIndex.value--;
    return true;
  }

  /**
   * Ir a un paso específico
   */
  function goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < totalSteps.value) {
      currentStepIndex.value = stepIndex;
      return true;
    }
    return false;
  }

  /**
   * Cancelar el flow
   */
  function cancelFlow() {
    isFlowActive.value = false;
    resetFormData();
    currentStepIndex.value = 0;
  }

  /**
   * Resetear datos del formulario
   */
  function resetFormData() {
    businessOnboardingData.value = {
      nombre: '',
      industry: '',
      businessType: '',
      descripcion: ''
    };
  }

  /**
   * Actualizar un campo del formulario
   */
  function updateField(field, value) {
    if (field in businessOnboardingData.value) {
      businessOnboardingData.value[field] = value;
    }
  }

  /**
   * Obtener mensaje de error de validación
   */
  function getValidationError() {
    const step = currentStepConfig.value;

    switch (step.id) {
      case 'business-name':
        return 'El nombre del negocio es obligatorio';
      case 'industry':
        return 'Debe seleccionar el rubro de tu negocio';
      case 'business-type':
        return 'Debe seleccionar el tipo de actividad económica';
      case 'description':
        return 'La descripción debe tener al menos 10 caracteres';
      default:
        return 'Por favor completa este campo';
    }
  }

  return {
    // Estado
    currentStepIndex,
    isFlowActive,
    businessOnboardingData,
    steps,

    // Computed
    currentStepConfig,
    totalSteps,
    isFirstStep,
    isLastStep,
    canGoNext,
    isCreateMode,

    // Acciones
    startFlow,
    nextStep,
    previousStep,
    goToStep,
    cancelFlow,
    resetFormData,
    updateField,
    getValidationError
  };
});
