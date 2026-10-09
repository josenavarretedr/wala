// utils/createEnhancedStockLog.js - Sistema avanzado de logging para cambios de stock
import { generateSecureUUID } from './generateUUID.js';
import { authContext } from './authContext.js';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Crea un log detallado de cambios en el stock con máxima trazabilidad
 * Integra contexto de usuario, relaciones y metadatos para IA
 * @param {Object} transaction - Datos de la transacción que causa el cambio
 * @param {Object} context - Contexto adicional del cambio
 * @returns {Object} Log estructurado para persistencia
 */
export const createEnhancedStockLog = (transaction, context) => {
  const userContext = authContext.getCurrentUserContext();
  const timestamp = new Date().toISOString();

  // Validación de datos requeridos
  if (!transaction || !transaction.uuid) {
    throw new Error('Transaction data is required with valid UUID');
  }

  if (!context || typeof context !== 'object') {
    throw new Error('Context object is required');
  }

  const stockLog = {
    // === IDENTIFICADORES ÚNICOS ===
    logId: generateSecureUUID(),
    transactionId: transaction.uuid,
    businessId: transaction.businessId,
    
    // === TRAZABILIDAD DE USUARIO ===
    userId: userContext?.userId || 'anonymous',
    userName: userContext?.userName || 'Usuario Desconocido',
    userEmail: userContext?.userEmail || null,
    sessionId: userContext?.sessionId || 'no-session',
    timestamp: timestamp,
    
    // === CONTEXTO TEMPORAL ===
    timeContext: {
      iso: timestamp,
      unix: Date.now(),
      businessHours: isBusinessHours(new Date()),
      dayOfWeek: new Date().getDay(),
      isWeekend: isWeekend(new Date()),
      hour: new Date().getHours()
    },

    // === CONTEXTO DE LA OPERACIÓN ===
    operation: 'stock_change',
    source: context.source || 'transaction',
    component: context.component || 'unknown',
    route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    
    // === ANÁLISIS DE STOCK DETALLADO ===
    stockAnalysis: createStockAnalysis(transaction, context),
    
    // === RELACIONES AUTOMÁTICAS ===
    relatedEntities: buildRelatedEntities(transaction, context, userContext),
    
    // === METADATOS ENRIQUECIDOS ===
    metadata: {
      reason: context.reason || 'transaction',
      notes: context.notes || null,
      severity: calculateSeverity(transaction, context),
      tags: [...(context.tags || []), ...generateAutoTags(transaction, context)],
      operationComplexity: calculateOperationComplexity(transaction, context)
    },
    
    // === DATOS DE LA TRANSACCIÓN ===
    transactionData: {
      type: transaction.type,
      total: transaction.total || calculateTransactionTotal(transaction.items),
      itemCount: transaction.items?.length || 0,
      currency: transaction.currency || 'USD',
      paymentMethod: transaction.paymentMethod || 'unknown'
    },
    
    // === ITEMS Y CAMBIOS DETALLADOS ===
    itemChanges: mapItemChanges(transaction.items, context),
    
    // === OPTIMIZADO PARA IA ===
    aiMetadata: {
      // Patrones de stock
      stockImpact: calculateStockImpact(transaction.items, context),
      stockRisk: calculateStockRisk(transaction.items, context),
      inventoryHealth: assessInventoryHealth(transaction.items, context),
      
      // Patrones de comportamiento
      transactionPattern: analyzeTransactionPattern(transaction),
      userBehavior: analyzeUserBehavior(userContext),
      businessContext: analyzeBusinessContext(transaction, context),
      
      // Anomalías detectadas
      anomalies: detectAnomalies(transaction, context),
      riskFlags: identifyRiskFlags(transaction, context),
      
      // Métricas calculadas
      metrics: {
        totalValueImpact: calculateTotalValueImpact(transaction.items, context),
        averageItemValue: calculateAverageItemValue(transaction.items),
        stockTurnoverImpact: calculateStockTurnoverImpact(transaction.items, context)
      }
    },

    // === CONTEXTO FUTURO (PREPARADO) ===
    // TODO: Descomentar cuando se implemente geoContext
    /*
    geoContext: {
      ip: 'unknown',
      country: 'unknown',
      countryCode: 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    */
    
    // === METADATOS TÉCNICOS ===
    technical: {
      version: '1.0',
      logVersion: 'enhanced_v1',
      processingTime: null, // Se añadirá al persistir
      dataIntegrity: generateDataIntegrityHash(transaction, context)
    }
  };

  return stockLog;
};

/**
 * Crea análisis detallado de cambios de stock
 */
function createStockAnalysis(transaction, context) {
  return transaction.items?.map(item => {
    const itemId = item.id;
    const previousStock = context.previousStock?.[itemId] || 0;
    const newStock = context.newStock?.[itemId] || 0;
    const delta = newStock - previousStock;

    return {
      itemId: itemId,
      itemName: item.name,
      itemCategory: item.category || 'uncategorized',
      
      // Cambios de stock
      previousStock: previousStock,
      newStock: newStock,
      stockDelta: delta,
      stockPercentageChange: previousStock > 0 ? ((delta / previousStock) * 100).toFixed(2) : 0,
      
      // Análisis del cambio
      changeType: delta > 0 ? 'increase' : delta < 0 ? 'decrease' : 'no_change',
      changeSignificance: Math.abs(delta) > 50 ? 'major' : Math.abs(delta) > 10 ? 'moderate' : 'minor',
      
      // Información de la transacción
      quantity: item.quantity,
      unitPrice: item.price,
      totalValue: item.quantity * item.price,
      
      // Estado del stock
      stockLevel: categorizeStockLevel(newStock),
      stockStatus: newStock < 0 ? 'negative' : newStock < 5 ? 'critical' : newStock < 20 ? 'low' : 'normal'
    };
  }) || [];
}

/**
 * Construye las relaciones automáticas entre entidades
 */
function buildRelatedEntities(transaction, context, userContext) {
  const relations = [];

  // Relación con business
  if (transaction.businessId) {
    relations.push({ 
      type: 'business', 
      id: transaction.businessId,
      relationship: 'owns_transaction'
    });
  }

  // Relación con usuario
  if (userContext?.userId) {
    relations.push({ 
      type: 'user', 
      id: userContext.userId,
      relationship: 'executed_transaction'
    });
  }

  // Relaciones con items de inventario
  if (transaction.items) {
    relations.push(...transaction.items.map(item => ({ 
      type: 'inventory', 
      id: item.id,
      relationship: 'stock_affected',
      impact: calculateItemImpact(item, context)
    })));
  }

  // Relaciones adicionales del contexto
  if (context.relatedEntities) {
    relations.push(...context.relatedEntities.map(entity => ({
      ...entity,
      relationship: entity.relationship || 'related'
    })));
  }

  return relations;
}

/**
 * Mapea los cambios detallados por item
 */
function mapItemChanges(items, context) {
  return items?.map(item => ({
    itemId: item.id,
    itemName: item.name,
    quantity: item.quantity,
    unitPrice: item.price,
    totalPrice: item.quantity * item.price,
    
    // Cambios de stock específicos
    stockBefore: context.previousStock?.[item.id] || 0,
    stockAfter: context.newStock?.[item.id] || 0,
    stockChange: (context.newStock?.[item.id] || 0) - (context.previousStock?.[item.id] || 0),
    
    // Contexto del item
    category: item.category || 'uncategorized',
    sku: item.sku || null,
    supplier: item.supplier || null
  })) || [];
}

// === FUNCIONES DE ANÁLISIS ===

function calculateStockImpact(items, context) {
  if (!items || !context.previousStock || !context.newStock) return 'unknown';
  
  const totalImpact = items.reduce((sum, item) => {
    const delta = Math.abs((context.newStock[item.id] || 0) - (context.previousStock[item.id] || 0));
    return sum + delta;
  }, 0);
  
  if (totalImpact > 200) return 'critical';
  if (totalImpact > 100) return 'high';
  if (totalImpact > 50) return 'medium';
  return 'low';
}

function calculateStockRisk(items, context) {
  if (!items || !context.newStock) return 'unknown';
  
  const criticalItems = items.filter(item => (context.newStock[item.id] || 0) < 5).length;
  const negativeItems = items.filter(item => (context.newStock[item.id] || 0) < 0).length;
  
  if (negativeItems > 0) return 'critical';
  if (criticalItems > items.length * 0.5) return 'high';
  if (criticalItems > 0) return 'medium';
  return 'low';
}

function assessInventoryHealth(items, context) {
  if (!items || !context.newStock) return 'unknown';
  
  const healthyItems = items.filter(item => (context.newStock[item.id] || 0) >= 20).length;
  const healthPercentage = (healthyItems / items.length) * 100;
  
  if (healthPercentage >= 80) return 'excellent';
  if (healthPercentage >= 60) return 'good';
  if (healthPercentage >= 40) return 'fair';
  return 'poor';
}

function analyzeTransactionPattern(transaction) {
  if (!transaction.items) return 'unknown';
  
  const itemCount = transaction.items.length;
  const totalValue = transaction.total || calculateTransactionTotal(transaction.items);
  const averageValue = totalValue / itemCount;
  
  if (itemCount > 50) return 'bulk_transaction';
  if (totalValue > 10000) return 'high_value';
  if (averageValue > 500) return 'premium_items';
  if (itemCount > 20) return 'multi_item';
  return 'standard';
}

function analyzeUserBehavior(userContext) {
  if (!userContext) return 'anonymous';
  if (userContext.isNewUser) return 'new_user';
  return 'returning_user';
}

function analyzeBusinessContext(transaction, context) {
  const hour = new Date().getHours();
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  
  if (isWeekend) return 'weekend_operation';
  if (hour < 8 || hour > 18) return 'after_hours';
  return 'business_hours';
}

function detectAnomalies(transaction, context) {
  const anomalies = [];
  
  // Anomalías de stock
  if (context.newStock) {
    Object.entries(context.newStock).forEach(([itemId, stock]) => {
      if (stock < 0) anomalies.push(`negative_stock_${itemId}`);
    });
  }
  
  // Anomalías de transacción
  if (transaction.total > 50000) anomalies.push('extremely_high_value');
  if (transaction.items && transaction.items.length > 100) anomalies.push('extremely_large_transaction');
  
  return anomalies;
}

function identifyRiskFlags(transaction, context) {
  const flags = [];
  
  if (!isBusinessHours(new Date())) flags.push('after_hours_transaction');
  if (context.newStock && Object.values(context.newStock).some(stock => stock < 0)) flags.push('stock_deficit');
  if (transaction.total > 20000) flags.push('high_value_transaction');
  
  return flags;
}

// === FUNCIONES AUXILIARES ===

function calculateSeverity(transaction, context) {
  if (context.newStock && Object.values(context.newStock).some(stock => stock < 0)) return 'critical';
  if (transaction.total > 10000) return 'high';
  if (transaction.items && transaction.items.length > 50) return 'high';
  return 'medium';
}

function generateAutoTags(transaction, context) {
  const tags = [];
  
  tags.push(`transaction_${transaction.type}`);
  if (transaction.items && transaction.items.length > 10) tags.push('bulk_operation');
  if (isWeekend(new Date())) tags.push('weekend');
  if (!isBusinessHours(new Date())) tags.push('after_hours');
  
  return tags;
}

function calculateOperationComplexity(transaction, context) {
  let complexity = 1;
  
  if (transaction.items) complexity += transaction.items.length / 10;
  if (context.relatedEntities) complexity += context.relatedEntities.length;
  if (context.cascadeOperations) complexity += context.cascadeOperations.length * 2;
  
  return complexity > 10 ? 'high' : complexity > 5 ? 'medium' : 'low';
}

function calculateTransactionTotal(items) {
  return items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
}

function calculateItemImpact(item, context) {
  const stockChange = Math.abs((context.newStock?.[item.id] || 0) - (context.previousStock?.[item.id] || 0));
  return stockChange > 50 ? 'high' : stockChange > 20 ? 'medium' : 'low';
}

function calculateTotalValueImpact(items, context) {
  return items?.reduce((sum, item) => {
    const stockChange = Math.abs((context.newStock?.[item.id] || 0) - (context.previousStock?.[item.id] || 0));
    return sum + (stockChange * item.price);
  }, 0) || 0;
}

function calculateAverageItemValue(items) {
  if (!items || items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  return total / items.length;
}

function calculateStockTurnoverImpact(items, context) {
  // Análisis básico de rotación de inventario
  if (!items || !context.previousStock) return 0;
  
  return items.reduce((impact, item) => {
    const previousStock = context.previousStock[item.id] || 0;
    const consumed = item.quantity;
    return impact + (previousStock > 0 ? (consumed / previousStock) : 0);
  }, 0);
}

function categorizeStockLevel(stock) {
  if (stock < 0) return 'negative';
  if (stock < 5) return 'critical';
  if (stock < 20) return 'low';
  if (stock < 100) return 'normal';
  return 'high';
}

function generateDataIntegrityHash(transaction, context) {
  // Hash simple para verificar integridad de datos
  const dataString = JSON.stringify({ 
    transactionId: transaction.uuid, 
    itemCount: transaction.items?.length || 0,
    timestamp: Date.now() 
  });
  return btoa(dataString).substring(0, 16);
}

function isBusinessHours(date = new Date()) {
  const hour = date.getHours();
  return hour >= 8 && hour <= 18;
}

function isWeekend(date = new Date()) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Persiste el stock log en Firestore
 * @param {Object} stockLog - Log a persistir
 * @returns {Promise<string>} ID del documento creado
 */
export const persistStockLog = async (stockLog) => {
  const startTime = Date.now();
  
  try {
    // Añadir tiempo de procesamiento
    stockLog.technical.processingTime = Date.now() - startTime;
    
    const docRef = await addDoc(collection(db, 'stock_logs'), stockLog);
    
    console.log('✅ Stock log persisted:', {
      logId: stockLog.logId,
      docId: docRef.id,
      transactionId: stockLog.transactionId,
      processingTime: stockLog.technical.processingTime
    });
    
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Error persisting stock log:', error);
    
    // Fallback a localStorage
    try {
      const fallbackKey = `stocklog_fallback_${stockLog.logId}`;
      localStorage.setItem(fallbackKey, JSON.stringify(stockLog));
      console.warn('⚠️ Stock log saved to localStorage as fallback');
    } catch (storageError) {
      console.error('❌ Failed to save to localStorage:', storageError);
    }
    
    throw error;
  }
};