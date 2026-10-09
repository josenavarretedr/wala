// examples/traceabilityUsage.js - Ejemplos de uso del sistema de trazabilidad integrado

/**
 * EJEMPLOS DE USO DEL SISTEMA DE TRAZABILIDAD
 * 
 * Este archivo muestra cómo usar el sistema de trazabilidad integrado
 * en los stores y composables actualizados.
 */

import { useTraceability } from '@/composables/useTraceability'
import { useTransactionStore } from '@/stores/transaction/transactionStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useBusinessStore } from '@/stores/businessStore'

// === EJEMPLO 1: Usar el sistema directamente ===
export const exampleDirectUsage = async () => {
  const { logCreate, logUpdate, startOperationChain } = useTraceability()

  // Ejemplo: Crear una transacción con trazabilidad manual
  const transactionData = {
    uuid: 'txn-123',
    type: 'income',
    total: 1500,
    items: [{ id: 'item-456', name: 'Producto A', quantity: 5, price: 300 }]
  }

  await logCreate('transaction', 'txn-123', transactionData, {
    reason: 'manual_transaction_creation',
    tags: ['example', 'direct_usage'],
    relatedEntities: [
      { type: 'inventory', id: 'item-456', relationship: 'stock_affected' }
    ]
  })

  console.log('✅ Transacción registrada con trazabilidad manual')
}

// === EJEMPLO 2: Usar stores con trazabilidad automática ===
export const exampleStoreUsage = async () => {
  const transactionStore = useTransactionStore()
  
  // El store ahora automáticamente registra la trazabilidad
  transactionStore.transactionToAdd.value = {
    type: 'income',
    account: 'cash',
    items: [
      {
        uuid: 'item-789',
        selectedProductUuid: 'item-789',
        description: 'Producto B',
        quantity: 3,
        price: 250,
        currentStock: 10
      }
    ]
  }

  // Esta llamada automáticamente generará logs de trazabilidad
  await transactionStore.addTransaction()
  
  console.log('✅ Transacción creada con trazabilidad automática del store')
}

// === EJEMPLO 3: Operación compleja con múltiples entidades ===
export const exampleComplexOperation = async () => {
  const { logTransaction } = useTraceability()
  
  // Definir una operación que afecta múltiples entidades
  const complexOperation = [
    {
      type: 'create',
      entityType: 'transaction',
      entityId: 'txn-complex-001',
      data: {
        newState: {
          type: 'income',
          total: 5000,
          items: [{ id: 'item-001', quantity: 10 }]
        },
        tags: ['complex_operation', 'high_value']
      }
    },
    {
      type: 'update',
      entityType: 'inventory',
      entityId: 'item-001',
      data: {
        previousState: { stock: 50 },
        newState: { stock: 60 },
        tags: ['stock_increase', 'complex_operation']
      }
    }
  ]

  const result = await logTransaction('complex_sales_operation', complexOperation)
  
  console.log('✅ Operación compleja registrada:', result.transactionId)
}

// === EJEMPLO 4: Monitoreo y métricas ===
export const exampleMetrics = () => {
  const { getMetrics, isTraceabilityHealthy } = useTraceability()
  
  const metrics = getMetrics()
  const isHealthy = isTraceabilityHealthy.value

  console.log('📊 Métricas del sistema de trazabilidad:')
  console.log('- Total de operaciones:', metrics.totalOperations)
  console.log('- Operaciones exitosas:', metrics.successfulOperations)
  console.log('- Buffer size:', metrics.bufferSize)
  console.log('- Estado del sistema:', isHealthy ? '✅ Saludable' : '⚠️ Con problemas')
  console.log('- Última sincronización:', metrics.lastFlushTime)
  
  return { metrics, isHealthy }
}

// === EJEMPLO 5: Manejo de errores con trazabilidad ===
export const exampleErrorHandling = async () => {
  const { log } = useTraceability()
  
  try {
    // Simular una operación que falla
    throw new Error('Operación simulada fallida')
    
  } catch (error) {
    // Registrar el error con trazabilidad
    await log('error', 'example_operation', 'demo-001', {
      newState: { 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      reason: 'operation_failed',
      severity: 'high',
      tags: ['error_example', 'demo']
    })
    
    console.log('❌ Error registrado con trazabilidad:', error.message)
  }
}

// === EJEMPLO 6: Cadena de operaciones relacionadas ===
export const exampleOperationChain = async () => {
  const { startOperationChain } = useTraceability()
  
  const chain = startOperationChain('complete_sales_workflow')
  
  try {
    // Paso 1: Crear transacción
    await chain.addStep('create', 'transaction', 'txn-workflow-001', {
      newState: { type: 'income', total: 2000 },
      reason: 'sales_transaction_creation'
    })
    
    // Paso 2: Actualizar inventario
    await chain.addStep('update', 'inventory', 'item-workflow-001', {
      previousState: { stock: 25 },
      newState: { stock: 20 },
      reason: 'stock_reduction_from_sale'
    })
    
    // Paso 3: Crear evento de caja
    await chain.addStep('create', 'cash_event', 'cash-workflow-001', {
      newState: { amount: 2000, type: 'income' },
      reason: 'cash_receipt_from_sale'
    })
    
    // Finalizar cadena
    await chain.finish({
      reason: 'sales_workflow_completed',
      metadata: { totalAmount: 2000, itemsSold: 5 }
    })
    
    console.log('✅ Cadena de operaciones completada:', chain.chainId)
    
  } catch (error) {
    console.error('❌ Error en cadena de operaciones:', error)
    
    // La cadena automáticamente registrará el error
    await chain.addStep('error', 'workflow', chain.chainId, {
      newState: { error: error.message },
      reason: 'workflow_failed'
    })
  }
}

// === EJEMPLO 7: Análisis específico de inventario ===
export const exampleInventoryAnalysis = async () => {
  const { logInventoryOperation } = useTraceability()
  
  // Ejemplo de análisis detallado de cambio de stock
  await logInventoryOperation(
    'update',
    'item-analysis-001',
    {
      current: { 
        name: 'Producto Premium', 
        category: 'electronics',
        stock: 15,
        price: 899.99
      },
      previous: {
        name: 'Producto Premium',
        category: 'electronics', 
        stock: 25,
        price: 899.99
      }
    },
    {
      previousStock: 25,
      newStock: 15,
      stockDelta: -10
    },
    {
      reason: 'significant_stock_reduction',
      severity: 'medium',
      tags: ['stock_analysis', 'premium_product', 'inventory_alert'],
      component: 'InventoryAnalysisExample'
    }
  )
  
  console.log('✅ Análisis de inventario registrado con detalles completos')
}

// === FUNCIÓN PRINCIPAL DE DEMO ===
export const runTraceabilityDemo = async () => {
  console.log('🚀 Iniciando demo del sistema de trazabilidad...\n')
  
  try {
    await exampleDirectUsage()
    await exampleComplexOperation()
    await exampleErrorHandling()
    await exampleOperationChain()
    await exampleInventoryAnalysis()
    
    const { metrics } = exampleMetrics()
    
    console.log('\n✅ Demo completado exitosamente')
    console.log('📊 Operaciones totales registradas:', metrics.localOperationCount)
    
  } catch (error) {
    console.error('❌ Error en demo:', error)
  }
}

// === EXPORT PARA USO EN COMPONENTES ===
export default {
  exampleDirectUsage,
  exampleStoreUsage,
  exampleComplexOperation,
  exampleMetrics,
  exampleErrorHandling,
  exampleOperationChain,
  exampleInventoryAnalysis,
  runTraceabilityDemo
}