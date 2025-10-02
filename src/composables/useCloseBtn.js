import { useRouter } from 'vue-router';
import { useBusinessStore } from '@/stores/businessStore';
import { FLOW_TYPES } from './useProgressIndicator';

/**
 * Composable para manejar el cierre y reset de flows
 */
export function useFlowClose() {
  const router = useRouter();
  const businessStore = useBusinessStore();

  /**
   * Navega al dashboard del negocio actual
   */
  const navigateToDashboard = () => {
    const currentBusinessId = businessStore.getBusinessId;
    if (currentBusinessId) {
      router.push({
        name: 'BusinessDashboard',
        params: { businessId: currentBusinessId }
      });
    }
  };

  return {
    navigateToDashboard
  };
}

// Re-exportamos para conveniencia
export { FLOW_TYPES };

/**
 * Configuraciones de reset para diferentes tipos de flows
 * Usando las mismas constantes que FLOW_TYPES para consistencia
 */
export const FLOW_RESET_CONFIGS = {
  [FLOW_TYPES.TRANSACTION]: {
    flowResets: ['resetFlow'],
    storeResets: ['resetTransactionToAdd'],
    description: 'Resetea el flow de transacciones y limpia la transacción en progreso'
  },
  [FLOW_TYPES.CASH]: {
    flowResets: ['resetFlow'], // Si el cashClosureStore tiene resetFlow
    storeResets: ['resetCashClosureState', 'resetCashEventState'],
    description: 'Resetea el flow de efectivo (cierre de caja y eventos)'
  },
  [FLOW_TYPES.INVENTORY]: {
    flowResets: ['resetFlow'], // Para futuro inventoryFlowStore
    storeResets: ['resetInventoryState'], // Para futuro
    description: 'Resetea el flow de inventario'
  },
  [FLOW_TYPES.BUSINESS]: {
    flowResets: ['resetFlow'], // Para futuro businessFlowStore
    storeResets: ['resetBusinessState'], // Para futuro
    description: 'Resetea el flow de negocio'
  },
  // Tipos adicionales específicos
  CASH_CLOSURE: {
    flowResets: ['resetFlow'],
    storeResets: ['resetCashClosureState'],
    description: 'Resetea el flow de cierre de caja'
  },
  CASH_EVENT: {
    flowResets: ['resetFlow'],
    storeResets: ['resetCashEventState'],
    description: 'Resetea el flow de eventos de caja'
  },
  EXPENSES: {
    flowResets: [],
    storeResets: ['resetExpenseToAdd'],
    description: 'Resetea el flow de gastos'
  },
  SAVINGS: {
    flowResets: [],
    storeResets: ['resetStore', 'resetSavingRequestsDetails'],
    description: 'Resetea el flow de ahorros'
  }
};

/**
 * Función helper para ejecutar resets basados en configuración
 * @param {Object} flowStore - Store del flow (opcional)
 * @param {Object} additionalStores - Objeto con stores adicionales
 * @param {string} flowType - Tipo de flow (usar claves de FLOW_RESET_CONFIGS)
 */
export function executeFlowResets(flowStore, additionalStores = {}, flowType) {
  const config = FLOW_RESET_CONFIGS[flowType];

  if (!config) {
    console.warn(`No se encontró configuración de reset para el tipo: ${flowType}`);
    return;
  }

  try {
    // Ejecutar resets del flow store
    if (flowStore && config.flowResets.length > 0) {
      config.flowResets.forEach(resetMethod => {
        if (typeof flowStore[resetMethod] === 'function') {
          flowStore[resetMethod]();
          console.log(`✅ Ejecutado: ${resetMethod} en flowStore`);
        } else {
          console.warn(`⚠️ Método ${resetMethod} no encontrado en flowStore`);
        }
      });
    }

    // Ejecutar resets de stores adicionales
    if (config.storeResets.length > 0) {
      config.storeResets.forEach(resetMethod => {
        // Buscar el método en todos los stores adicionales
        let executed = false;
        Object.entries(additionalStores).forEach(([storeName, store]) => {
          if (store && typeof store[resetMethod] === 'function') {
            store[resetMethod]();
            console.log(`✅ Ejecutado: ${resetMethod} en ${storeName}`);
            executed = true;
          }
        });

        if (!executed) {
          console.warn(`⚠️ Método ${resetMethod} no encontrado en ningún store adicional`);
        }
      });
    }

    console.log(`🔄 Reset completado para ${flowType}: ${config.description}`);
  } catch (error) {
    console.error(`❌ Error ejecutando resets para ${flowType}:`, error);
  }
}

/**
 * Composable principal para el CloseBtn
 * @param {Object} options - Configuración del close button
 * @param {Object} options.flowStore - Store del flow principal
 * @param {Object} options.additionalStores - Stores adicionales que necesitan reset
 * @param {string} options.flowType - Tipo de flow
 * @param {boolean} options.autoNavigate - Si debe navegar automáticamente al dashboard
 */
export function useCloseBtn(options = {}) {
  const {
    flowStore = null,
    additionalStores = {},
    flowType = 'TRANSACTION',
    autoNavigate = true
  } = options;

  const { navigateToDashboard } = useFlowClose();

  /**
   * Función principal de cierre
   */
  const handleClose = () => {
    // Ejecutar resets
    executeFlowResets(flowStore, additionalStores, flowType);

    // Navegar al dashboard si está habilitado
    if (autoNavigate) {
      navigateToDashboard();
    }
  };

  return {
    handleClose,
    navigateToDashboard
  };
}