/**
 * @file useOptimisticSync.js
 * @description Composable para manejar sincronización optimista de operaciones
 * 
 * Permite actualizar la UI inmediatamente mientras las operaciones se ejecutan
 * en background, con soporte para rollback automático en caso de errores.
 * 
 * @module composables/useOptimisticSync
 */

import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'

// Estado global compartido entre todas las instancias
const syncQueue = ref([])
const isSyncing = ref(false)
const failedOperations = ref([])

// Sistema de notificaciones
const { error: showError } = useToast()

export function useOptimisticSync() {
  /**
   * Ejecuta una operación de forma optimista
   * @param {Function} localUpdate - Actualización local inmediata (síncrona)
   * @param {Function} remoteUpdate - Actualización remota en Firestore (asíncrona)
   * @param {Function} rollback - Función para revertir cambios si falla
   * @param {Object} metadata - Metadata para debugging y tracking
   * @returns {Promise<Object>} Resultado con success y operationId
   */
  const executeOptimistically = async (localUpdate, remoteUpdate, rollback, metadata = {}) => {
    const operationId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      // 1️⃣ ACTUALIZAR UI INMEDIATAMENTE (no await)
      console.log('⚡ [OPTIMISTIC] Actualización local:', metadata.type)
      await localUpdate()

      // 2️⃣ AGREGAR A COLA DE SINCRONIZACIÓN
      let resolveRemote, rejectRemote
      const remotePromise = new Promise((resolve, reject) => {
        resolveRemote = resolve
        rejectRemote = reject
      })

      const operation = {
        id: operationId,
        remoteUpdate,
        rollback,
        metadata,
        status: 'pending',
        attempts: 0,
        createdAt: new Date(),
        lastAttemptAt: null,
        error: null,
        resolveRemote,
        rejectRemote
      }

      syncQueue.value.push(operation)
      console.log(`📋 [OPTIMISTIC] Operación agregada a cola (total: ${syncQueue.value.length})`)

      // 3️⃣ PROCESAR EN BACKGROUND (o esperar si awaitRemote es true)
      processSyncQueue().catch(err => {
        console.error('❌ [OPTIMISTIC] Error en processSyncQueue:', err)
      })

      if (metadata?.awaitRemote) {
        await remotePromise
      }

      return { success: true, operationId }

    } catch (error) {
      console.error('❌ [OPTIMISTIC] Error en actualización local:', error)

      // Si falla la actualización local, no agregar a la cola
      try {
        await rollback()
      } catch (rollbackError) {
        console.error('❌ [OPTIMISTIC] Error en rollback inmediato:', rollbackError)
      }

      throw error
    }
  }

  /**
   * Procesa la cola de sincronización en background
   */
  const processSyncQueue = async () => {
    // Solo permitir una ejecución a la vez
    if (isSyncing.value) {
      console.log('⏸️ [OPTIMISTIC] Ya hay un procesamiento en curso')
      return
    }

    if (syncQueue.value.length === 0) {
      console.log('✅ [OPTIMISTIC] Cola vacía, nada que procesar')
      return
    }

    isSyncing.value = true
    console.log(`🔄 [OPTIMISTIC] Iniciando procesamiento de ${syncQueue.value.length} operaciones`)

    // Procesar operaciones en orden FIFO
    while (syncQueue.value.length > 0) {
      const operation = syncQueue.value[0]

      try {
        console.log(`🔄 [OPTIMISTIC] Sincronizando: ${operation.metadata.type} (intento ${operation.attempts + 1}/3)`)

        operation.lastAttemptAt = new Date()

        // Ejecutar operación remota
        await operation.remoteUpdate()

        // Marcar como completada y remover de la cola
        operation.status = 'completed'
        syncQueue.value.shift()
        operation.resolveRemote?.({ success: true })

        console.log(`✅ [OPTIMISTIC] Operación sincronizada: ${operation.metadata.type}`)

      } catch (error) {
        console.error(`❌ [OPTIMISTIC] Error sincronizando ${operation.metadata.type}:`, error)

        operation.attempts++
        operation.error = error.message

        // Si alcanzó el máximo de intentos (3), hacer rollback
        if (operation.attempts >= 3) {
          console.error(`❌ [OPTIMISTIC] Máximo de intentos alcanzado para ${operation.metadata.type}, ejecutando rollback...`)

          try {
            await operation.rollback()
            console.log(`↩️ [OPTIMISTIC] Rollback ejecutado para ${operation.metadata.type}`)
          } catch (rollbackError) {
            console.error(`❌ [OPTIMISTIC] Error en rollback de ${operation.metadata.type}:`, rollbackError)
            operation.rollbackError = rollbackError.message
          }

          // ⚡ Mostrar toast de error
          showError(
            `Error al sincronizar: ${operation.metadata.description || 'Operación desconocida'}`,
            { duration: 5000 }
          )

          // Marcar como fallida y mover a lista de fallidos
          operation.status = 'failed'
          failedOperations.value.push(operation)
          syncQueue.value.shift()
          operation.rejectRemote?.(error)

          console.log(`📊 [OPTIMISTIC] Operaciones fallidas: ${failedOperations.value.length}`)

        } else {
          // Reintentar después de un delay exponencial: 2s, 4s, 8s
          const delay = Math.pow(2, operation.attempts) * 1000
          console.log(`⏳ [OPTIMISTIC] Reintentando ${operation.metadata.type} en ${delay}ms...`)

          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    isSyncing.value = false
    console.log('✅ [OPTIMISTIC] Procesamiento de cola completado')
  }

  /**
   * Reintentar operaciones fallidas manualmente
   */
  const retryFailedOperations = async () => {
    if (failedOperations.value.length === 0) {
      console.log('ℹ️ [OPTIMISTIC] No hay operaciones fallidas para reintentar')
      return
    }

    console.log(`🔄 [OPTIMISTIC] Reintentando ${failedOperations.value.length} operaciones fallidas...`)

    const toRetry = [...failedOperations.value]
    failedOperations.value = []

    // Restablecer estado y agregar a la cola
    toRetry.forEach(op => {
      op.attempts = 0
      op.status = 'pending'
      op.error = null
      op.rollbackError = null
      syncQueue.value.push(op)
    })

    console.log(`📋 [OPTIMISTIC] ${toRetry.length} operaciones agregadas a la cola para reintento`)

    await processSyncQueue()
  }

  /**
   * Limpiar operaciones completadas (normalmente no es necesario ya que se remueven automáticamente)
   */
  const clearCompletedOperations = () => {
    const beforeCount = syncQueue.value.length
    syncQueue.value = syncQueue.value.filter(op => op.status !== 'completed')
    const clearedCount = beforeCount - syncQueue.value.length

    if (clearedCount > 0) {
      console.log(`🧹 [OPTIMISTIC] ${clearedCount} operaciones completadas eliminadas de la cola`)
    }
  }

  /**
   * Limpiar operaciones fallidas de la lista
   */
  const clearFailedOperations = () => {
    const count = failedOperations.value.length
    failedOperations.value = []

    if (count > 0) {
      console.log(`🧹 [OPTIMISTIC] ${count} operaciones fallidas eliminadas`)
    }
  }

  /**
   * Obtener información de una operación específica
   */
  const getOperationStatus = (operationId) => {
    const inQueue = syncQueue.value.find(op => op.id === operationId)
    if (inQueue) return inQueue

    const failed = failedOperations.value.find(op => op.id === operationId)
    if (failed) return failed

    return null
  }

  // Computed properties
  const hasPendingOperations = computed(() => syncQueue.value.length > 0)
  const pendingOperationsCount = computed(() => syncQueue.value.length)
  const failedOperationsCount = computed(() => failedOperations.value.length)
  const hasFailedOperations = computed(() => failedOperations.value.length > 0)

  return {
    // Métodos principales
    executeOptimistically,
    processSyncQueue,
    retryFailedOperations,

    // Utilidades
    clearCompletedOperations,
    clearFailedOperations,
    getOperationStatus,

    // Estado
    syncQueue,
    isSyncing,
    failedOperations,

    // Computed
    hasPendingOperations,
    pendingOperationsCount,
    failedOperationsCount,
    hasFailedOperations
  }
}
