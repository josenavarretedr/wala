// config/traceabilityConfig.js - Configuración central del sistema de trazabilidad
export const TRACEABILITY_CONFIG = {
  // === CONFIGURACIÓN GENERAL ===
  version: '1.0.0',
  enabled: true,
  
  // === AUTENTICACIÓN ===
  requireAuth: true,
  allowAnonymous: false,
  
  // === OPERACIONES A TRACKEAR ===
  trackedOperations: ['create', 'update', 'delete'],
  trackReads: false, // Solo cambios críticos por ahora
  trackNavigation: false, // No necesario inicialmente
  
  // === ENTIDADES A TRACKEAR ===
  trackedEntities: [
    'transaction',
    'inventory', 
    'business',
    'user',
    'cash_event',
    'cash_closure'
  ],
  
  // === PERFORMANCE Y BATCHING ===
  batchSize: 20, // Optimizado para alto volumen
  flushInterval: 5000, // 5 segundos para pseudo tiempo-real
  maxBufferSize: 100,
  
  // === SISTEMA DE FALLBACK ===
  useLocalStorage: true,
  maxLocalStorageEntries: 500,
  retryFailedOperations: true,
  maxRetries: 3,
  retryDelay: 2000, // 2 segundos entre reintentos
  
  // === CONTEXTO TÉCNICO ===
  captureContext: {
    ip: false, // Deshabilitado temporalmente (sin geoContext)
    country: false, // Deshabilitado temporalmente
    userAgent: true,
    route: true,
    component: true,
    sessionInfo: true
  },
  
  // === RELACIONES Y DEPENDENCIAS ===
  autoDetectRelations: true,
  cascadeTracking: true,
  maxRelationDepth: 3,
  
  // === SEVERIDAD POR OPERACIÓN ===
  operationSeverity: {
    'create.transaction': 'high',
    'update.inventory': 'high',
    'delete.business': 'critical',
    'update.business': 'medium',
    'create.inventory': 'medium',
    'delete.transaction': 'critical',
    'create.cash_event': 'high',
    'update.cash_event': 'medium'
  },
  
  // === CONFIGURACIÓN PARA IA ===
  aiOptimizations: {
    enabled: true,
    stockAnalysis: true,
    behaviorPatterns: true,
    anomalyDetection: true,
    realTimeProcessing: false, // MVP: usar batch processing
    historicalAnalysis: true
  },
  
  // === ANÁLISIS DE STOCK ===
  stockThresholds: {
    critical: 5,
    low: 20,
    normal: 100,
    negativeStockSeverity: 'critical'
  },
  
  // === ANÁLISIS DE TRANSACCIONES ===
  transactionThresholds: {
    highValue: 10000,
    bulkItemCount: 50,
    extremeValue: 50000,
    extremeBulk: 100
  },
  
  // === CONFIGURACIÓN DE LOGS ===
  logging: {
    console: true,
    firestore: true,
    localStorage: true, // Como fallback
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    includeStackTrace: false
  },
  
  // === MÉTRICAS Y MONITOREO ===
  metrics: {
    trackPerformance: true,
    trackErrors: true,
    trackBufferHealth: true,
    reportInterval: 60000 // 1 minuto
  },
  
  // === CONFIGURACIONES FUTURAS (COMENTADAS) ===
  future: {
    // Cuando se implemente geoContext
    geoTracking: {
      enabled: false,
      service: 'ipapi', // 'ipapi', 'geoip', 'custom'
      cacheTimeout: 3600000, // 1 hora
      fallbackCountry: 'unknown'
    },
    
    // Para análisis avanzado de patrones
    patternAnalysis: {
      enabled: false,
      windowSize: 100, // Últimas 100 operaciones
      anomalyThreshold: 0.95,
      learningEnabled: false
    },
    
    // Para integración con servicios externos
    externalIntegrations: {
      analytics: false,
      monitoring: false,
      alerting: false
    }
  }
};

/**
 * Obtiene la severidad para una operación específica
 * @param {string} operation - Tipo de operación
 * @param {string} entityType - Tipo de entidad
 * @returns {string} Nivel de severidad
 */
export const getOperationSeverity = (operation, entityType) => {
  const key = `${operation}.${entityType}`;
  return TRACEABILITY_CONFIG.operationSeverity[key] || 'medium';
};

/**
 * Verifica si una entidad debe ser trackeada
 * @param {string} entityType - Tipo de entidad
 * @returns {boolean} True si debe ser trackeada
 */
export const shouldTrackEntity = (entityType) => {
  return TRACEABILITY_CONFIG.trackedEntities.includes(entityType);
};

/**
 * Verifica si una operación debe ser trackeada
 * @param {string} operation - Tipo de operación
 * @returns {boolean} True si debe ser trackeada
 */
export const shouldTrackOperation = (operation) => {
  return TRACEABILITY_CONFIG.trackedOperations.includes(operation);
};

/**
 * Obtiene la configuración de umbral para stock
 * @param {number} stock - Cantidad de stock
 * @returns {string} Categoría del stock
 */
export const getStockCategory = (stock) => {
  const thresholds = TRACEABILITY_CONFIG.stockThresholds;
  
  if (stock < 0) return 'negative';
  if (stock < thresholds.critical) return 'critical';
  if (stock < thresholds.low) return 'low';
  if (stock < thresholds.normal) return 'normal';
  return 'high';
};

/**
 * Determina si una transacción es de alto valor
 * @param {number} value - Valor de la transacción
 * @returns {boolean} True si es de alto valor
 */
export const isHighValueTransaction = (value) => {
  return value > TRACEABILITY_CONFIG.transactionThresholds.highValue;
};

/**
 * Configuración de desarrollo vs producción
 */
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    ...TRACEABILITY_CONFIG,
    logging: {
      ...TRACEABILITY_CONFIG.logging,
      console: isDevelopment,
      logLevel: isDevelopment ? 'debug' : 'info'
    },
    batchSize: isDevelopment ? 5 : TRACEABILITY_CONFIG.batchSize,
    flushInterval: isDevelopment ? 2000 : TRACEABILITY_CONFIG.flushInterval
  };
};