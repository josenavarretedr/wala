// utils/traceabilityCore.js - Motor central del sistema de trazabilidad

import { generateSecureUUID } from './generateUUID.js';
import { authContext } from './authContext.js';
import { TRACEABILITY_CONFIG, getOperationSeverity, shouldTrackEntity, shouldTrackOperation } from '@/config/traceabilityConfig.js';
import { addDoc, collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Motor principal del sistema de trazabilidad
 * Maneja el registro, persistencia y análisis de todas las operaciones
 */
export class TraceabilityEngine {
  constructor() {
    this.sessionId = generateSecureUUID();
    this.operationChain = [];
    this.config = TRACEABILITY_CONFIG;

    // Sistema de buffering optimizado para alto volumen
    this.operationBuffer = [];
    this.bufferSize = this.config.batchSize;
    this.flushInterval = this.config.flushInterval;

    // Sistema de fallback robusto
    this.failedOperations = [];
    this.isOnline = navigator.onLine;
    this.retryCount = 0;

    // Contexto de usuario
    this.userContext = null;

    // Métricas de rendimiento
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      lastFlushTime: null,
      bufferHealth: 'healthy'
    };

    this.initializeEngine();
  }

  /**
   * Inicializa el motor de trazabilidad
   */
  initializeEngine() {
    console.log('🚀 TraceabilityEngine initializing...', {
      sessionId: this.sessionId,
      config: {
        batchSize: this.config.batchSize,
        flushInterval: this.config.flushInterval,
        requireAuth: this.config.requireAuth
      }
    });

    // Listeners de conectividad
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Connection restored - retrying failed operations');
      this.retryFailedOperations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.warn('🔌 Connection lost - switching to fallback mode');
    });

    // Auto-flush periódico
    this.startAutoFlush();

    // Flush de emergencia antes de cerrar
    window.addEventListener('beforeunload', () => {
      console.log('🔄 Emergency flush on page unload');
      this.emergencyFlush();
    });

    // Recuperar operaciones fallidas al inicializar
    this.recoverFromLocalStorage();

    // Integración con authContext
    this.integrateWithAuthContext();
  }

  /**
   * Establece el contexto de usuario para el motor de trazabilidad
   * @param {Object} context - Contexto del usuario
   * @param {string} context.userId - ID del usuario
   * @param {string} context.userName - Nombre del usuario
   * @param {string} context.userEmail - Email del usuario
   * @param {string} context.businessId - ID del negocio actual
   */
  setContext(context) {
    try {
      this.userContext = {
        userId: context.userId || null,
        userName: context.userName || null,
        userEmail: context.userEmail || null,
        businessId: context.businessId || null,
        updatedAt: new Date().toISOString()
      };

      console.log('✅ Traceability context updated:', {
        userId: this.userContext.userId,
        businessId: this.userContext.businessId,
        userName: this.userContext.userName
      });

      return true;
    } catch (error) {
      console.error('❌ Error setting traceability context:', error);
      return false;
    }
  }

  /**
   * Obtiene el contexto actual del usuario
   */
  getContext() {
    return this.userContext || {
      userId: null,
      userName: null,
      userEmail: null,
      businessId: null,
      updatedAt: null
    };
  }

  /**
   * Integra con el sistema de autenticación
   */
  integrateWithAuthContext() {
    authContext.onAuthChange((user) => {
      if (user) {
        console.log('🔐 User authenticated - tracing enabled');
        this.logAuthenticationEvent('login', user);
      } else {
        console.log('🔐 User logged out - clearing session');
        this.logAuthenticationEvent('logout', null);
        this.renewSessionId();
      }
    });
  }

  /**
   * Registra una operación en el sistema de trazabilidad
   * @param {string} operationType - Tipo de operación (create, read, update, delete)
   * @param {string} entityType - Tipo de entidad (transaction, inventory, etc.)
   * @param {string} entityId - ID único de la entidad
   * @param {Object} operationData - Datos adicionales de la operación
   * @returns {Promise<string|null>} ID del trace creado o null si no se pudo crear
   */
  async logOperation(operationType, entityType, entityId, operationData = {}) {
    try {
      // Validaciones previas
      if (!this.shouldProcessOperation(operationType, entityType)) {
        return null;
      }

      // Verificar autenticación si es requerida
      if (this.config.requireAuth && !authContext.isUserAuthenticated()) {
        console.warn('⚠️ Skipping trace - user not authenticated');
        return null;
      }

      this.metrics.totalOperations++;
      const authUserContext = authContext.getCurrentUserContext();
      const internalContext = this.userContext;

      // Combinar contextos: interno tiene prioridad, authContext como fallback
      const combinedContext = {
        userId: internalContext?.userId || authUserContext?.userId || 'anonymous',
        userName: internalContext?.userName || authUserContext?.userName || 'Usuario Desconocido',
        userEmail: internalContext?.userEmail || authUserContext?.userEmail || null,
        businessId: internalContext?.businessId || null,
        sessionId: authUserContext?.sessionId || this.sessionId,
        sessionStartTime: authUserContext?.sessionStartTime || new Date().toISOString(),
        isNewUser: authUserContext?.isNewUser || false
      };

      const traceEntry = {
        // === IDENTIFICADORES ÚNICOS ===
        traceId: generateSecureUUID(),
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),

        // === CONTEXTO DE USUARIO ===
        userId: combinedContext.userId,
        userName: combinedContext.userName,
        userEmail: combinedContext.userEmail,
        businessId: combinedContext.businessId,
        sessionInfo: {
          sessionId: combinedContext.sessionId,
          sessionStartTime: combinedContext.sessionStartTime,
          isNewUser: combinedContext.isNewUser
        },

        // === OPERACIÓN ===
        operation: operationType,
        entityType,
        entityId,

        // === ESTADOS Y CAMBIOS ===
        previousState: operationData.previousState || null,
        newState: operationData.newState || null,
        changes: this.calculateDetailedChanges(operationData.previousState, operationData.newState),

        // === CONTEXTO TÉCNICO ===
        technicalContext: {
          source: 'webapp',
          component: operationData.component || this.getCurrentComponent(),
          route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
          method: operationData.method || 'unknown',
          userAgent: this.config.captureContext.userAgent ? navigator.userAgent : null
        },

        // === CADENA DE OPERACIONES ===
        operationChain: {
          parentTraceId: operationData.parentTraceId || this.getLastOperationId(),
          chainPosition: this.operationChain.length,
          recentOperations: this.operationChain.slice(-5).map(op => ({
            traceId: op.traceId,
            operation: op.operation,
            entityType: op.entityType,
            timestamp: op.timestamp
          }))
        },

        // === RELACIONES AUTOMÁTICAS ===
        relationships: {
          relatedEntities: this.detectRelations(entityType, entityId, operationData),
          cascadeOperations: operationData.cascadeOperations || [],
          dependencies: operationData.dependencies || []
        },

        // === METADATOS ===
        metadata: {
          reason: operationData.reason || 'operation',
          notes: operationData.notes || null,
          severity: operationData.severity || getOperationSeverity(operationType, entityType),
          tags: [...(operationData.tags || []), ...this.generateAutoTags(operationType, entityType, operationData)],
          businessId: operationData.businessId || null
        },

        // === ANÁLISIS PARA IA ===
        aiAnalysis: this.generateAIAnalysis(operationType, entityType, operationData, combinedContext),

        // === METADATOS TÉCNICOS ===
        technical: {
          version: this.config.version,
          processingStartTime: Date.now(),
          operationComplexity: this.calculateComplexity(operationData),
          dataVolume: this.calculateDataVolume(operationData)
        }
      };

      // Añadir a la cadena de operaciones
      this.addToOperationChain(traceEntry);

      // Persistir con sistema de fallback
      const traceId = await this.persistWithFallback(traceEntry);

      if (traceId) {
        this.metrics.successfulOperations++;
        console.log('✅ Operation traced successfully:', {
          traceId,
          operation: operationType,
          entity: `${entityType}:${entityId}`,
          severity: traceEntry.metadata.severity
        });
      }

      return traceId;

    } catch (error) {
      this.metrics.failedOperations++;
      console.error('❌ Error in logOperation:', error);
      return null;
    }
  }

  /**
   * Determina si una operación debe ser procesada
   * @param {string} operationType - Tipo de operación
   * @param {string} entityType - Tipo de entidad
   * @returns {boolean} True si debe procesarse
   */
  shouldProcessOperation(operationType, entityType) {
    if (!this.config.enabled) return false;
    if (!shouldTrackOperation(operationType)) return false;
    if (!shouldTrackEntity(entityType)) return false;
    return true;
  }

  /**
   * Calcula cambios detallados entre estados
   * @param {Object} previous - Estado anterior
   * @param {Object} current - Estado actual
   * @returns {Object|null} Cambios detallados
   */
  calculateDetailedChanges(previous, current) {
    if (!previous || !current) return null;

    const changes = {};
    const allKeys = new Set([...Object.keys(previous || {}), ...Object.keys(current || {})]);

    for (const key of allKeys) {
      const prevValue = previous?.[key];
      const currValue = current?.[key];

      if (JSON.stringify(prevValue) !== JSON.stringify(currValue)) {
        changes[key] = {
          from: prevValue,
          to: currValue,
          type: typeof currValue,
          action: prevValue === undefined ? 'added' :
            currValue === undefined ? 'removed' : 'modified',
          significance: this.calculateFieldSignificance(key, prevValue, currValue)
        };
      }
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  /**
   * Detecta relaciones automáticamente
   * @param {string} entityType - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @param {Object} operationData - Datos de la operación
   * @returns {Array} Array de relaciones detectadas
   */
  detectRelations(entityType, entityId, operationData) {
    const relations = [];

    // Relación con business (común a todas las entidades)
    if (operationData.businessId) {
      relations.push({
        type: 'business',
        id: operationData.businessId,
        relationship: 'belongs_to'
      });
    }

    // Relaciones específicas por tipo de entidad
    switch (entityType) {
      case 'transaction':
        if (operationData.newState?.items) {
          relations.push(...operationData.newState.items.map(item => ({
            type: 'inventory',
            id: item.id,
            relationship: 'affects_stock',
            impact: this.calculateRelationImpact(item, operationData)
          })));
        }
        break;

      case 'inventory':
        // Buscar transacciones relacionadas en operaciones recientes
        const relatedTransactions = this.operationChain
          .filter(op => op.entityType === 'transaction')
          .slice(-3); // Solo las 3 más recientes
        relations.push(...relatedTransactions.map(t => ({
          type: 'transaction',
          id: t.entityId,
          relationship: 'related_transaction'
        })));
        break;

      case 'cash_event':
        if (operationData.newState?.transactionId) {
          relations.push({
            type: 'transaction',
            id: operationData.newState.transactionId,
            relationship: 'generated_from'
          });
        }
        break;
    }

    // Relaciones definidas explícitamente
    if (operationData.relatedEntities) {
      relations.push(...operationData.relatedEntities.map(entity => ({
        ...entity,
        relationship: entity.relationship || 'related'
      })));
    }

    return relations;
  }

  /**
   * Genera análisis optimizado para IA
   * @param {string} operationType - Tipo de operación
   * @param {string} entityType - Tipo de entidad
   * @param {Object} operationData - Datos de la operación
   * @param {Object} userContext - Contexto del usuario
   * @returns {Object} Análisis para IA
   */
  generateAIAnalysis(operationType, entityType, operationData, userContext) {
    const now = new Date();

    return {
      // Contexto temporal
      temporal: {
        timestamp: now.getTime(),
        businessHours: this.isBusinessHours(now),
        dayOfWeek: now.getDay(),
        hour: now.getHours(),
        isWeekend: this.isWeekend(now),
        quarter: Math.floor(now.getMonth() / 3) + 1
      },

      // Análisis de comportamiento
      behavioral: {
        userPattern: this.analyzeUserBehavior(),
        operationFrequency: this.calculateOperationFrequency(operationType, entityType),
        sessionActivity: this.analyzeSessionActivity()
      },

      // Análisis específico por entidad
      entitySpecific: this.generateEntitySpecificAnalysis(entityType, operationData),

      // Detección de anomalías
      anomalies: this.detectAnomalies(operationType, entityType, operationData),

      // Patrones detectados
      patterns: this.detectPatterns(operationType, entityType, operationData),

      // Métricas de impacto
      impact: {
        businessImpact: this.calculateBusinessImpact(operationType, entityType, operationData),
        dataImpact: this.calculateDataImpact(operationData),
        userImpact: this.calculateUserImpact(userContext, operationType)
      }
    };
  }

  /**
   * Genera análisis específico por tipo de entidad
   * @param {string} entityType - Tipo de entidad
   * @param {Object} operationData - Datos de la operación
   * @returns {Object} Análisis específico
   */
  generateEntitySpecificAnalysis(entityType, operationData) {
    switch (entityType) {
      case 'inventory':
        return this.analyzeInventoryOperation(operationData);
      case 'transaction':
        return this.analyzeTransactionOperation(operationData);
      case 'business':
        return this.analyzeBusinessOperation(operationData);
      default:
        return null;
    }
  }

  /**
   * Analiza operaciones de inventario
   * @param {Object} operationData - Datos de la operación
   * @returns {Object} Análisis de inventario
   */
  analyzeInventoryOperation(operationData) {
    if (!operationData.newState) return null;

    const currentStock = operationData.newState.stock || 0;
    const previousStock = operationData.previousState?.stock || 0;
    const delta = currentStock - previousStock;

    return {
      stockAnalysis: {
        currentStock,
        previousStock,
        stockDelta: delta,
        stockPercentageChange: previousStock > 0 ? ((delta / previousStock) * 100).toFixed(2) : 0,
        stockLevel: this.categorizeStockLevel(currentStock),
        stockRisk: this.calculateStockRisk(currentStock),
        changeSignificance: Math.abs(delta) > 50 ? 'major' : Math.abs(delta) > 10 ? 'moderate' : 'minor'
      },
      predictions: {
        stockoutRisk: currentStock < 10 ? 'high' : currentStock < 30 ? 'medium' : 'low',
        reorderRecommendation: currentStock < 20,
        expectedDepletionDays: this.estimateDepletionDays(currentStock, operationData)
      }
    };
  }

  /**
   * Analiza operaciones de transacción
   * @param {Object} operationData - Datos de la operación
   * @returns {Object} Análisis de transacción
   */
  analyzeTransactionOperation(operationData) {
    if (!operationData.newState) return null;

    const transaction = operationData.newState;
    const itemCount = transaction.items?.length || 0;
    const totalValue = transaction.total || 0;

    return {
      transactionAnalysis: {
        type: transaction.type,
        itemCount,
        totalValue,
        averageItemValue: itemCount > 0 ? totalValue / itemCount : 0,
        transactionSize: itemCount > 20 ? 'large' : itemCount > 10 ? 'medium' : 'small',
        valueCategory: totalValue > 10000 ? 'high_value' : totalValue > 1000 ? 'medium_value' : 'low_value'
      },
      businessImpact: {
        revenueImpact: transaction.type === 'income' ? totalValue : -totalValue,
        inventoryImpact: itemCount,
        cashFlowImpact: this.calculateCashFlowImpact(transaction)
      }
    };
  }

  /**
   * Analiza operaciones de negocio
   * @param {Object} operationData - Datos de la operación
   * @returns {Object} Análisis de negocio
   */
  analyzeBusinessOperation(operationData) {
    if (!operationData.newState) return null;

    const business = operationData.newState;

    return {
      businessAnalysis: {
        operationType: operationData.operation || 'unknown',
        businessId: business.id || 'unknown',
        businessName: business.nombre || business.name || 'Sin nombre',
        businessType: business.tipoNegocio || business.type || 'general',
        hasLogo: !!business.logo,
        hasDescription: !!business.descripcion,
        setupComplete: this.evaluateBusinessSetup(business)
      },
      organizationalImpact: {
        userRole: business.userRole || 'unknown',
        isNewBusiness: operationData.operation === 'create',
        configurationLevel: this.calculateConfigurationLevel(business),
        businessMaturity: this.assessBusinessMaturity(business)
      }
    };
  }

  /**
   * Evalúa el nivel de configuración del negocio
   * @param {Object} business - Datos del negocio
   * @returns {string} Nivel de configuración
   */
  evaluateBusinessSetup(business) {
    const requiredFields = ['nombre', 'tipoNegocio', 'descripcion'];
    const presentFields = requiredFields.filter(field => business[field]);
    const completionRate = presentFields.length / requiredFields.length;

    if (completionRate >= 0.8) return 'complete';
    if (completionRate >= 0.5) return 'partial';
    return 'minimal';
  }

  /**
   * Calcula el nivel de configuración del negocio
   * @param {Object} business - Datos del negocio
   * @returns {number} Porcentaje de configuración (0-100)
   */
  calculateConfigurationLevel(business) {
    const configFields = ['nombre', 'tipoNegocio', 'descripcion', 'logo', 'telefono', 'direccion'];
    const presentFields = configFields.filter(field => business[field]);
    return Math.round((presentFields.length / configFields.length) * 100);
  }

  /**
   * Evalúa la madurez del negocio
   * @param {Object} business - Datos del negocio
   * @returns {string} Nivel de madurez
   */
  assessBusinessMaturity(business) {
    const hasCompleteInfo = business.nombre && business.tipoNegocio && business.descripcion;
    const hasContactInfo = business.telefono || business.direccion;
    const hasBranding = business.logo;

    if (hasCompleteInfo && hasContactInfo && hasBranding) return 'mature';
    if (hasCompleteInfo && (hasContactInfo || hasBranding)) return 'developing';
    if (hasCompleteInfo) return 'basic';
    return 'startup';
  }

  /**
   * Añade operación a la cadena
   * @param {Object} traceEntry - Entrada de trace
   */
  addToOperationChain(traceEntry) {
    this.operationChain.push({
      traceId: traceEntry.traceId,
      operation: traceEntry.operation,
      entityType: traceEntry.entityType,
      entityId: traceEntry.entityId,
      timestamp: traceEntry.timestamp,
      severity: traceEntry.metadata.severity
    });

    // Mantener solo las últimas 50 operaciones en memoria
    if (this.operationChain.length > 50) {
      this.operationChain = this.operationChain.slice(-50);
    }
  }

  /**
   * Sistema de persistencia con fallback robusto
   * @param {Object} traceEntry - Entrada a persistir
   * @returns {Promise<string|null>} ID del trace o null si falla
   */
  async persistWithFallback(traceEntry) {
    try {
      // Completar metadatos técnicos
      traceEntry.technical.processingTime = Date.now() - traceEntry.technical.processingStartTime;

      // Sanitizar datos antes de persistir
      const sanitizedEntry = this.sanitizeForFirestore(traceEntry);

      if (this.isOnline) {
        // Añadir al buffer para batch processing
        this.operationBuffer.push(sanitizedEntry);

        // Flush si buffer está lleno o es operación crítica
        if (this.operationBuffer.length >= this.bufferSize ||
          sanitizedEntry.metadata.severity === 'critical') {
          await this.flushBuffer();
        }
      } else {
        // Guardar en localStorage si está offline
        this.saveToLocalStorage(sanitizedEntry);
      }

      return traceEntry.traceId;

    } catch (error) {
      console.error('❌ Error persisting trace:', error);
      this.saveToLocalStorage(traceEntry);
      return traceEntry.traceId;
    }
  }

  /**
   * Flush del buffer con manejo de errores
   */
  async flushBuffer() {
    if (this.operationBuffer.length === 0) return;

    const startTime = Date.now();
    const batchToProcess = [...this.operationBuffer];

    try {
      const batch = writeBatch(db);

      batchToProcess.forEach(traceEntry => {
        const docRef = doc(collection(db, 'traceability_logs'));
        // Sanitizar datos antes de enviar a Firestore
        const sanitizedEntry = this.sanitizeForFirestore(traceEntry);
        batch.set(docRef, sanitizedEntry);
      });

      await batch.commit();

      // Limpiar buffer solo si el batch fue exitoso
      this.operationBuffer = [];
      this.metrics.lastFlushTime = new Date().toISOString();
      this.metrics.bufferHealth = 'healthy';

      const flushTime = Date.now() - startTime;
      console.log('✅ Buffer flushed successfully:', {
        batchSize: batchToProcess.length,
        flushTimeMs: flushTime,
        bufferHealth: this.metrics.bufferHealth
      });

    } catch (error) {
      console.error('❌ Error flushing batch:', error);

      // Mover a failed operations para retry
      this.failedOperations.push(...this.operationBuffer);
      this.operationBuffer = [];
      this.metrics.bufferHealth = 'unhealthy';

      // Guardar en localStorage como último recurso
      batchToProcess.forEach(entry => this.saveToLocalStorage(entry));

      throw error;
    }
  }

  /**
   * Guarda entrada en localStorage como fallback
   * @param {Object} traceEntry - Entrada a guardar
   */
  saveToLocalStorage(traceEntry) {
    try {
      const key = `trace_fallback_${traceEntry.traceId}`;
      localStorage.setItem(key, JSON.stringify({
        ...traceEntry,
        fallbackTimestamp: new Date().toISOString()
      }));

      // Limpiar entradas antiguas si superamos el límite
      this.cleanupLocalStorage();

    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
    }
  }

  /**
   * Sanitiza un objeto para Firestore removiendo valores undefined
   * @param {Object} obj - Objeto a sanitizar
   * @returns {Object} Objeto sanitizado
   */
  sanitizeForFirestore(obj) {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeForFirestore(item)).filter(item => item !== undefined);
    }

    if (typeof obj === 'object') {
      const sanitized = {};

      for (const [key, value] of Object.entries(obj)) {
        // Eliminar valores undefined
        if (value === undefined) {
          continue;
        }

        // Convertir null a valor por defecto según el tipo esperado
        if (value === null) {
          sanitized[key] = null;
        } else if (typeof value === 'object') {
          // Recursivamente sanitizar objetos anidados
          const sanitizedValue = this.sanitizeForFirestore(value);
          if (sanitizedValue !== undefined) {
            sanitized[key] = sanitizedValue;
          }
        } else {
          sanitized[key] = value;
        }
      }

      return sanitized;
    }

    return obj;
  }

  /**
   * Limpia localStorage de entradas antiguas
   */
  cleanupLocalStorage() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('trace_fallback_'));

      if (keys.length > this.config.maxLocalStorageEntries) {
        // Remover las más antiguas
        const keysToRemove = keys.slice(0, keys.length - this.config.maxLocalStorageEntries);
        keysToRemove.forEach(key => localStorage.removeItem(key));

        console.log(`🧹 Cleaned up ${keysToRemove.length} old localStorage entries`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up localStorage:', error);
    }
  }

  /**
   * Recupera operaciones fallidas de localStorage
   */
  async recoverFromLocalStorage() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('trace_fallback_'));

      if (keys.length === 0) return;

      console.log(`🔄 Recovering ${keys.length} failed operations from localStorage`);

      for (const key of keys) {
        try {
          const entry = JSON.parse(localStorage.getItem(key));
          await addDoc(collection(db, 'traceability_logs'), entry);
          localStorage.removeItem(key);
        } catch (error) {
          console.error(`❌ Failed to recover entry ${key}:`, error);
        }
      }

      console.log('✅ Recovery completed');

    } catch (error) {
      console.error('❌ Error during recovery:', error);
    }
  }

  /**
   * Inicia el sistema de auto-flush
   */
  startAutoFlush() {
    setInterval(async () => {
      if (this.operationBuffer.length > 0) {
        try {
          await this.flushBuffer();
        } catch (error) {
          console.error('❌ Auto-flush error:', error);
        }
      }
    }, this.flushInterval);
  }

  /**
   * Flush de emergencia (síncrono)
   */
  emergencyFlush() {
    if (this.operationBuffer.length > 0) {
      console.log(`⚠️ Emergency flush: saving ${this.operationBuffer.length} entries to localStorage`);
      this.operationBuffer.forEach(entry => this.saveToLocalStorage(entry));
      this.operationBuffer = [];
    }
  }

  /**
   * Registra eventos de autenticación
   * @param {string} eventType - Tipo de evento
   * @param {Object} user - Usuario
   */
  async logAuthenticationEvent(eventType, user) {
    await this.logOperation('auth', 'user', user?.uid || 'anonymous', {
      reason: `user_${eventType}`,
      newState: user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      } : null,
      severity: eventType === 'login' ? 'medium' : 'low'
    });
  }

  /**
   * Renueva el session ID
   */
  renewSessionId() {
    this.sessionId = generateSecureUUID();
    console.log('🔄 Session ID renewed:', this.sessionId);
  }

  /**
   * Obtiene métricas del motor
   * @returns {Object} Métricas actuales
   */
  getMetrics() {
    return {
      ...this.metrics,
      bufferSize: this.operationBuffer.length,
      failedOperationsCount: this.failedOperations.length,
      operationChainLength: this.operationChain.length,
      isOnline: this.isOnline,
      sessionId: this.sessionId
    };
  }

  // === MÉTODOS AUXILIARES ===

  getCurrentComponent() {
    if (typeof window === 'undefined') return 'server';
    return window.location.pathname.split('/').pop() || 'root';
  }

  getLastOperationId() {
    return this.operationChain.length > 0
      ? this.operationChain[this.operationChain.length - 1].traceId
      : null;
  }

  calculateComplexity(operationData) {
    let complexity = 1;

    if (operationData.relatedEntities?.length > 0) complexity += operationData.relatedEntities.length;
    if (operationData.changes && Object.keys(operationData.changes).length > 5) complexity += 2;
    if (operationData.cascadeOperations?.length > 0) complexity += operationData.cascadeOperations.length * 2;

    return complexity > 10 ? 'high' : complexity > 5 ? 'medium' : 'low';
  }

  calculateDataVolume(operationData) {
    const dataSize = JSON.stringify(operationData).length;
    return dataSize > 10000 ? 'large' : dataSize > 1000 ? 'medium' : 'small';
  }

  calculateFieldSignificance(fieldName, oldValue, newValue) {
    const criticalFields = ['stock', 'total', 'businessId', 'userId', 'status'];
    if (criticalFields.includes(fieldName)) return 'high';

    if (typeof oldValue === 'number' && typeof newValue === 'number') {
      const change = Math.abs((newValue - oldValue) / (oldValue || 1));
      if (change > 0.5) return 'high';
      if (change > 0.1) return 'medium';
    }

    return 'low';
  }

  generateAutoTags(operationType, entityType, operationData) {
    const tags = [];

    tags.push(`${operationType}_${entityType}`);

    if (this.isWeekend(new Date())) tags.push('weekend');
    if (!this.isBusinessHours(new Date())) tags.push('after_hours');

    if (operationData.businessId) tags.push(`business_${operationData.businessId}`);

    return tags;
  }

  analyzeUserBehavior() {
    const recentOps = this.operationChain.slice(-10);
    const operations = recentOps.map(op => op.operation);
    const entities = recentOps.map(op => op.entityType);

    if (operations.every(op => op === 'create')) return 'bulk_creation';
    if (operations.every(op => op === 'read')) return 'browsing';
    if (entities.every(e => e === 'inventory')) return 'inventory_focused';
    if (entities.every(e => e === 'transaction')) return 'transaction_focused';

    return 'mixed_activity';
  }

  calculateOperationFrequency(operationType, entityType) {
    const recentOps = this.operationChain.slice(-20);
    const matchingOps = recentOps.filter(op =>
      op.operation === operationType && op.entityType === entityType
    );

    return matchingOps.length / Math.min(recentOps.length, 20);
  }

  analyzeSessionActivity() {
    const now = Date.now();
    const recentOps = this.operationChain.filter(op =>
      now - new Date(op.timestamp).getTime() < 300000 // Últimos 5 minutos
    );

    return {
      recentOperationCount: recentOps.length,
      activityLevel: recentOps.length > 20 ? 'high' : recentOps.length > 5 ? 'medium' : 'low'
    };
  }

  detectAnomalies(operationType, entityType, operationData) {
    const anomalies = [];

    // Anomalías temporales
    if (!this.isBusinessHours(new Date()) && operationType !== 'read') {
      anomalies.push('after_hours_operation');
    }

    // Anomalías específicas por entidad
    if (entityType === 'inventory' && operationData.newState?.stock < 0) {
      anomalies.push('negative_stock');
    }

    if (entityType === 'transaction' && operationData.newState?.total > 50000) {
      anomalies.push('extremely_high_value');
    }

    return anomalies;
  }

  detectPatterns(operationType, entityType, operationData) {
    const patterns = [];

    const recentOps = this.operationChain.slice(-10);
    const sameTypeOps = recentOps.filter(op =>
      op.operation === operationType && op.entityType === entityType
    );

    if (sameTypeOps.length >= 5) {
      patterns.push('repetitive_operation');
    }

    return patterns;
  }

  calculateBusinessImpact(operationType, entityType, operationData) {
    if (entityType === 'transaction' && operationData.newState) {
      const transaction = operationData.newState;
      return {
        financial: transaction.type === 'income' ? transaction.total : -transaction.total,
        operational: transaction.items?.length || 0
      };
    }

    return { financial: 0, operational: 1 };
  }

  calculateDataImpact(operationData) {
    const changesCount = operationData.changes ? Object.keys(operationData.changes).length : 0;
    return changesCount > 10 ? 'high' : changesCount > 3 ? 'medium' : 'low';
  }

  calculateUserImpact(userContext, operationType) {
    if (!userContext) return 'none';
    if (operationType === 'delete') return 'high';
    if (operationType === 'create') return 'medium';
    return 'low';
  }

  calculateRelationImpact(item, operationData) {
    const stockChange = Math.abs((operationData.newState?.stock || 0) - (operationData.previousState?.stock || 0));
    return stockChange > 50 ? 'high' : stockChange > 20 ? 'medium' : 'low';
  }

  categorizeStockLevel(stock) {
    if (stock < 0) return 'negative';
    if (stock < 5) return 'critical';
    if (stock < 20) return 'low';
    if (stock < 100) return 'normal';
    return 'high';
  }

  calculateStockRisk(currentStock) {
    if (currentStock < 0) return 'critical';
    if (currentStock < 5) return 'high';
    if (currentStock < 20) return 'medium';
    return 'low';
  }

  estimateDepletionDays(currentStock, operationData) {
    // Estimación básica basada en el último cambio
    const delta = Math.abs((operationData.newState?.stock || 0) - (operationData.previousState?.stock || 0));
    if (delta === 0) return null;

    return Math.floor(currentStock / delta);
  }

  calculateCashFlowImpact(transaction) {
    return transaction.type === 'income' ? transaction.total : -transaction.total;
  }

  isBusinessHours(date = new Date()) {
    const hour = date.getHours();
    return hour >= 8 && hour <= 18;
  }

  isWeekend(date = new Date()) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }
}

/**
 * Instancia singleton del motor de trazabilidad
 */
export const traceability = new TraceabilityEngine();