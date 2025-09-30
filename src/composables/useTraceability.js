// composables/useTraceability.js - Composable principal para el sistema de trazabilidad
import { traceability } from '@/utils/traceabilityCore';
import { useUserStore } from '@/stores/useUserStore';
import { useBusinessStore } from '@/stores/businessStore';
import { useRoute } from 'vue-router';
import { onMounted, ref, computed } from 'vue';

/**
 * Composable principal para el sistema de trazabilidad
 * Proporciona métodos sencillos para trackear operaciones
 */
export const useTraceability = () => {
  const userStore = useUserStore();
  const businessStore = useBusinessStore();

  // Manejo seguro del router - puede no estar disponible en todos los contextos
  let route;
  try {
    route = useRoute();
  } catch (error) {
    console.warn('⚠️ Router no disponible en useTraceability:', error.message);
    route = null;
  }

  const isInitialized = ref(false);
  const lastTraceId = ref(null);
  const operationCount = ref(0);

  // Auto-inicialización del contexto
  const initializeContext = () => {
    traceability.setContext({
      userId: userStore.userProfile?.uid,
      userName: userStore.userProfile?.nombre || userStore.userProfile?.email,
      userEmail: userStore.userProfile?.email,
      businessId: getCurrentBusinessId()
    });
    isInitialized.value = true;
    console.log('✅ Traceability context initialized');
  };

  // Obtener businessId actual
  const getCurrentBusinessId = () => {
    return businessStore.business?.id ||
      businessStore.getBusinessId ||
      (route && route.params ? route.params.businessId : null) ||
      userStore.currentBusiness?.businessId ||
      null;
  };

  // Obtener componente actual
  const getCurrentComponent = () => {
    if (!route) return 'no-route-context';
    return route.name || route.path?.split('/').pop() || 'unknown-component';
  };

  // === MÉTODOS PRINCIPALES DE TRAZABILIDAD ===

  /**
   * Método universal para logging de operaciones
   * @param {string} operation - Tipo de operación (create, read, update, delete)
   * @param {string} entityType - Tipo de entidad (transaction, inventory, business, etc.)
   * @param {string} entityId - ID de la entidad
   * @param {Object} data - Datos adicionales de la operación
   * @returns {Promise<string|null>} ID del trace creado
   */
  const log = async (operation, entityType, entityId, data = {}) => {
    try {
      if (!isInitialized.value) {
        initializeContext();
      }

      const traceId = await traceability.logOperation(operation, entityType, entityId, {
        ...data,
        component: data.component || getCurrentComponent(),
        businessId: data.businessId || getCurrentBusinessId(),
        parentTraceId: lastTraceId.value
      });

      if (traceId) {
        lastTraceId.value = traceId;
        operationCount.value++;
      }

      return traceId;
    } catch (error) {
      console.error('❌ Error in useTraceability.log:', error);
      return null;
    }
  };

  /**
   * Registra la creación de una entidad
   * @param {string} entityType - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @param {Object} newState - Estado de la entidad creada
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<string|null>} ID del trace
   */
  const logCreate = async (entityType, entityId, newState, metadata = {}) => {
    return await log('create', entityType, entityId, {
      newState,
      reason: metadata.reason || `${entityType}_creation`,
      severity: metadata.severity || 'medium',
      tags: metadata.tags || [],
      relatedEntities: metadata.relatedEntities || [],
      cascadeOperations: metadata.cascadeOperations || [],
      ...metadata
    });
  };

  /**
   * Registra la lectura de una entidad (opcional, por defecto deshabilitado)
   * @param {string} entityType - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @param {Object} data - Datos leídos
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<string|null>} ID del trace
   */
  const logRead = async (entityType, entityId, data = {}, metadata = {}) => {
    return await log('read', entityType, entityId, {
      newState: data,
      reason: metadata.reason || `${entityType}_access`,
      severity: 'low',
      ...metadata
    });
  };

  /**
   * Registra la actualización de una entidad
   * @param {string} entityType - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @param {Object} previousState - Estado anterior
   * @param {Object} newState - Estado nuevo
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<string|null>} ID del trace
   */
  const logUpdate = async (entityType, entityId, previousState, newState, metadata = {}) => {
    return await log('update', entityType, entityId, {
      previousState,
      newState,
      reason: metadata.reason || `${entityType}_update`,
      severity: metadata.severity || 'medium',
      tags: metadata.tags || [],
      relatedEntities: metadata.relatedEntities || [],
      cascadeOperations: metadata.cascadeOperations || [],
      ...metadata
    });
  };

  /**
   * Registra la eliminación de una entidad
   * @param {string} entityType - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @param {Object} previousState - Estado antes de eliminar
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<string|null>} ID del trace
   */
  const logDelete = async (entityType, entityId, previousState, metadata = {}) => {
    return await log('delete', entityType, entityId, {
      previousState,
      reason: metadata.reason || `${entityType}_deletion`,
      severity: metadata.severity || 'high',
      tags: [...(metadata.tags || []), 'deletion'],
      relatedEntities: metadata.relatedEntities || [],
      cascadeOperations: metadata.cascadeOperations || [],
      ...metadata
    });
  };

  // === MÉTODOS PARA OPERACIONES COMPLEJAS ===

  /**
   * Inicia una cadena de operaciones relacionadas
   * @param {string} operationName - Nombre de la operación compleja
   * @returns {Object} Objeto con métodos para añadir pasos
   */
  const startOperationChain = (operationName) => {
    const chainId = traceability.generateSecureUUID();
    lastTraceId.value = chainId;

    return {
      chainId,
      /**
       * Añade un paso a la cadena de operaciones
       */
      addStep: async (operation, entityType, entityId, data = {}) => {
        return await log(operation, entityType, entityId, {
          ...data,
          parentTraceId: chainId,
          operationChain: operationName,
          tags: [...(data.tags || []), 'chain_operation']
        });
      },
      /**
       * Finaliza la cadena de operaciones
       */
      finish: async (metadata = {}) => {
        return await log('complete', 'operation_chain', chainId, {
          reason: `${operationName}_completed`,
          severity: 'low',
          tags: ['chain_completion'],
          ...metadata
        });
      }
    };
  };

  /**
   * Registra una operación transaccional que afecta múltiples entidades
   * @param {string} transactionName - Nombre de la transacción
   * @param {Array} operations - Array de operaciones a ejecutar
   * @returns {Promise<Object>} Resultado de la transacción
   */
  const logTransaction = async (transactionName, operations = []) => {
    const transactionId = traceability.generateSecureUUID();
    const results = [];

    try {
      // Registrar inicio de transacción
      await log('start', 'transaction_group', transactionId, {
        reason: `${transactionName}_start`,
        severity: 'medium',
        tags: ['transaction_start'],
        metadata: {
          operationCount: operations.length,
          transactionName
        }
      });

      // Ejecutar todas las operaciones
      for (const operation of operations) {
        const result = await log(
          operation.type,
          operation.entityType,
          operation.entityId,
          {
            ...operation.data,
            parentTraceId: transactionId,
            operationChain: transactionName,
            tags: [...(operation.data?.tags || []), 'transaction_operation']
          }
        );
        results.push({ ...operation, traceId: result });
      }

      // Registrar finalización exitosa
      await log('complete', 'transaction_group', transactionId, {
        reason: `${transactionName}_success`,
        severity: 'low',
        tags: ['transaction_success'],
        metadata: {
          operationResults: results,
          totalOperations: operations.length
        }
      });

      return {
        success: true,
        transactionId,
        operationResults: results
      };

    } catch (error) {
      // Registrar error de transacción
      await log('error', 'transaction_group', transactionId, {
        reason: `${transactionName}_failed`,
        severity: 'critical',
        tags: ['transaction_error'],
        metadata: {
          error: error.message,
          partialResults: results
        }
      });

      throw error;
    }
  };

  // === MÉTODOS ESPECÍFICOS PARA DIFERENTES ENTIDADES ===

  /**
   * Registra operaciones específicas de transacciones financieras
   */
  const logTransactionOperation = async (operation, transactionId, transactionData, metadata = {}) => {
    const relatedEntities = [];

    // Detectar entidades relacionadas automáticamente
    if (transactionData.items) {
      relatedEntities.push(...transactionData.items.map(item => ({
        type: 'inventory',
        id: item.id,
        relationship: 'stock_affected'
      })));
    }

    if (transactionData.businessId) {
      relatedEntities.push({
        type: 'business',
        id: transactionData.businessId,
        relationship: 'belongs_to'
      });
    }

    return await log(operation, 'transaction', transactionId, {
      newState: transactionData,
      relatedEntities,
      severity: transactionData.total > 10000 ? 'high' : 'medium',
      tags: [
        `transaction_${transactionData.type}`,
        transactionData.total > 10000 ? 'high_value' : 'standard_value'
      ],
      ...metadata
    });
  };

  /**
   * Registra operaciones específicas de inventario
   */
  const logInventoryOperation = async (operation, itemId, itemData, stockContext = {}, metadata = {}) => {
    const severity = stockContext.newStock < 0 ? 'critical' :
      stockContext.newStock < 5 ? 'high' : 'medium';

    return await log(operation, 'inventory', itemId, {
      previousState: { stock: stockContext.previousStock, ...itemData.previous },
      newState: { stock: stockContext.newStock, ...itemData.current },
      severity,
      tags: [
        `inventory_${operation}`,
        stockContext.newStock < 5 ? 'low_stock' : 'normal_stock',
        ...(metadata.tags || [])
      ],
      ...metadata
    });
  };

  /**
   * Registra operaciones específicas de negocios
   */
  const logBusinessOperation = async (operation, businessId, businessData, metadata = {}) => {
    return await log(operation, 'business', businessId, {
      newState: businessData,
      severity: operation === 'delete' ? 'critical' : 'medium',
      tags: [
        `business_${operation}`,
        ...(metadata.tags || [])
      ],
      ...metadata
    });
  };

  // === MÉTRICAS Y UTILIDADES ===

  /**
   * Obtiene métricas del sistema de trazabilidad
   * @returns {Object} Métricas actuales
   */
  const getMetrics = () => {
    return {
      ...traceability.getMetrics(),
      localOperationCount: operationCount.value,
      lastTraceId: lastTraceId.value,
      isInitialized: isInitialized.value,
      currentBusinessId: getCurrentBusinessId(),
      currentComponent: getCurrentComponent()
    };
  };

  /**
   * Fuerza el flush del buffer (útil antes de navegación)
   */
  const flushBuffer = async () => {
    try {
      await traceability.flushBuffer();
      console.log('✅ Buffer flushed manually');
    } catch (error) {
      console.error('❌ Error flushing buffer:', error);
    }
  };

  /**
   * Renueva el contexto (útil cuando cambia el business activo)
   */
  const refreshContext = () => {
    initializeContext();
    console.log('🔄 Traceability context refreshed');
  };

  // === COMPUTED PROPERTIES ===

  const isTraceabilityHealthy = computed(() => {
    const metrics = traceability.getMetrics();
    return metrics.bufferHealth === 'healthy' && metrics.isOnline;
  });

  const currentBusinessId = computed(() => getCurrentBusinessId());

  // === LIFECYCLE ===

  // Auto-inicializar cuando se monta el composable
  onMounted(() => {
    if (!isInitialized.value) {
      initializeContext();
    }
  });

  return {
    // Estado
    isInitialized,
    lastTraceId,
    operationCount,
    isTraceabilityHealthy,
    currentBusinessId,

    // Configuración
    initializeContext,
    refreshContext,

    // Operaciones básicas
    log,
    logCreate,
    logRead,
    logUpdate,
    logDelete,

    // Operaciones complejas
    startOperationChain,
    logTransaction,

    // Operaciones específicas por entidad
    logTransactionOperation,
    logInventoryOperation,
    logBusinessOperation,

    // Utilidades
    getMetrics,
    flushBuffer,
    getCurrentComponent,
    getCurrentBusinessId
  };
};