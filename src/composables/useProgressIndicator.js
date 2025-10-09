import { computed } from 'vue';

/**
 * Composable genérico para el indicador de progreso
 * Funciona con cualquier store que tenga currentStep y steps
 * @param {Object} flowStore - Store que contenga currentStep y steps
 * @returns {Object} - Propiedades reactivas para el ProgressIndicator
 */
export function useProgressIndicator(flowStore) {
  const currentStep = computed(() => flowStore.currentStep || 0);
  const steps = computed(() => flowStore.steps || []);
  const totalSteps = computed(() => steps.value.length);
  const progress = computed(() => {
    if (totalSteps.value === 0) return 0;
    return Math.round(((currentStep.value + 1) / totalSteps.value) * 100);
  });

  const isFirstStep = computed(() => currentStep.value === 0);
  const isLastStep = computed(() => currentStep.value === totalSteps.value - 1);

  return {
    currentStep,
    steps,
    totalSteps,
    progress,
    isFirstStep,
    isLastStep
  };
}

/**
 * Hook para diferentes tipos de flows
 */
export const FLOW_TYPES = {
  TRANSACTION: 'transaction',
  CASH: 'cash',
  INVENTORY: 'inventory',
  BUSINESS: 'business',
  ACCOUNT_BALANCE: 'account_balance'
};

/**
 * Configuraciones de colores para diferentes tipos de flows
 */
export const FLOW_COLORS = {
  [FLOW_TYPES.TRANSACTION]: {
    activeColor: 'bg-blue-500',
    inactiveColor: 'bg-gray-200',
    counterBgColor: 'bg-blue-50',
    counterTextColor: 'text-blue-600'
  },
  [FLOW_TYPES.CASH]: {
    activeColor: 'bg-green-500',
    inactiveColor: 'bg-gray-200',
    counterBgColor: 'bg-green-50',
    counterTextColor: 'text-green-600'
  },
  [FLOW_TYPES.INVENTORY]: {
    activeColor: 'bg-purple-500',
    inactiveColor: 'bg-gray-200',
    counterBgColor: 'bg-purple-50',
    counterTextColor: 'text-purple-600'
  },
  [FLOW_TYPES.BUSINESS]: {
    activeColor: 'bg-orange-500',
    inactiveColor: 'bg-gray-200',
    counterBgColor: 'bg-orange-50',
    counterTextColor: 'text-orange-600'
  },
  [FLOW_TYPES.ACCOUNT_BALANCE]: {
    activeColor: 'bg-teal-500',
    inactiveColor: 'bg-gray-200',
    counterBgColor: 'bg-teal-50',
    counterTextColor: 'text-teal-600'
  }
};

/**
 * Función helper para obtener las props del ProgressIndicator para un tipo de flow específico
 * @param {Object} flowStore - Store del flow
 * @param {string} flowType - Tipo de flow (usar FLOW_TYPES)
 * @returns {Object} - Props completas para el componente ProgressIndicator
 */
export function getProgressIndicatorProps(flowStore, flowType = FLOW_TYPES.TRANSACTION) {
  const { currentStep, steps } = useProgressIndicator(flowStore);
  const colors = FLOW_COLORS[flowType] || FLOW_COLORS[FLOW_TYPES.TRANSACTION];

  return {
    currentStep: currentStep.value,
    steps: steps.value,
    ...colors
  };
}