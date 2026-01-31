import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 📎 File Store
 * 
 * Gestiona el estado global de uploads de archivos
 * - Progreso de subida
 * - Estado de procesamiento
 * - Errores
 */
export const useFileStore = defineStore('file', () => {
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════

  /**
   * Map de uploads activos: fileId -> { progress, status, error, url }
   * @type {Ref<Object>}
   */
  const uploads = ref({})

  /**
   * Historial de archivos subidos (últimos 20)
   * @type {Ref<Array>}
   */
  const uploadHistory = ref([])

  // ═══════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Inicia el seguimiento de un nuevo upload
   */
  function startUpload(fileId, metadata = {}) {
    uploads.value[fileId] = {
      fileId,
      progress: 0,
      status: 'uploading', // uploading | processing | ready | error
      error: null,
      url: null,
      previewUrl: null,
      metadata: {
        fileName: metadata.fileName || 'unknown',
        contentType: metadata.contentType || 'unknown',
        size: metadata.size || 0,
        startedAt: Date.now(),
      }
    }
  }

  /**
   * Actualiza el progreso de un upload
   */
  function updateProgress(fileId, progress) {
    if (uploads.value[fileId]) {
      uploads.value[fileId].progress = Math.round(progress)
    }
  }

  /**
   * Marca un upload como "procesando" (backend está generando preview)
   */
  function markAsProcessing(fileId) {
    if (uploads.value[fileId]) {
      uploads.value[fileId].status = 'processing'
      uploads.value[fileId].progress = 100
    }
  }

  /**
   * Marca un upload como completado con URLs
   */
  function markAsReady(fileId, urls) {
    if (uploads.value[fileId]) {
      uploads.value[fileId].status = 'ready'
      uploads.value[fileId].url = urls.original
      uploads.value[fileId].previewUrl = urls.preview
      uploads.value[fileId].metadata.completedAt = Date.now()

      // Agregar al historial
      addToHistory({
        fileId,
        ...uploads.value[fileId]
      })
    }
  }

  /**
   * Marca un upload como fallido
   */
  function markAsError(fileId, errorMessage) {
    if (uploads.value[fileId]) {
      uploads.value[fileId].status = 'error'
      uploads.value[fileId].error = errorMessage
      uploads.value[fileId].metadata.failedAt = Date.now()
    }
  }

  /**
   * Remueve un upload del tracking
   */
  function removeUpload(fileId) {
    delete uploads.value[fileId]
  }

  /**
   * Limpia todos los uploads completados/errores
   */
  function clearCompleted() {
    Object.keys(uploads.value).forEach(fileId => {
      if (['ready', 'error'].includes(uploads.value[fileId].status)) {
        delete uploads.value[fileId]
      }
    })
  }

  /**
   * Agrega al historial (máx 20)
   */
  function addToHistory(uploadData) {
    uploadHistory.value.unshift(uploadData)
    if (uploadHistory.value.length > 20) {
      uploadHistory.value = uploadHistory.value.slice(0, 20)
    }
  }

  /**
   * Obtiene el estado de un upload
   */
  function getUploadStatus(fileId) {
    return uploads.value[fileId] || null
  }

  /**
   * Resetea todo el store
   */
  function $reset() {
    uploads.value = {}
    uploadHistory.value = []
  }

  // ═══════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════
  return {
    // State
    uploads,
    uploadHistory,

    // Actions
    startUpload,
    updateProgress,
    markAsProcessing,
    markAsReady,
    markAsError,
    removeUpload,
    clearCompleted,
    getUploadStatus,
    $reset
  }
})
