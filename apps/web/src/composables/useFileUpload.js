import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore'
import { storage, db } from '@/firebaseInit'
import { useAuthStore } from '@/stores/authStore'
import { useBusinessStore } from '@/stores/businessStore'
import { useFileStore } from '@/stores/fileStore'
import { useToast } from '@/composables/useToast'
import { v4 as uuidv4 } from 'uuid'

/**
 * 📎 useFileUpload
 * 
 * Composable para gestionar la subida de archivos a Firebase Storage
 * con tracking en Firestore y notificaciones al usuario
 * 
 * Flujo:
 * 1. Validar archivo (tipo, tamaño)
 * 2. Subir a Storage (path temporal)
 * 3. Crear documento en Firestore
 * 4. Esperar a que Cloud Function procese (resize, preview)
 * 5. Retornar URLs
 */

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════

const FILE_CONSTRAINTS = {
  maxSizeMB: 5,
  allowedTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/heif',
    'image/webp',
    'application/pdf'
  ],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'pdf']
}

export function useFileUpload() {
  const authStore = useAuthStore()
  const businessStore = useBusinessStore()
  const fileStore = useFileStore()
  const toast = useToast()

  // ═══════════════════════════════════════════════════════════
  // VALIDACIÓN
  // ═══════════════════════════════════════════════════════════

  /**
   * Valida un archivo antes de subirlo
   */
  function validateFile(file) {
    // 1. Verificar que existe
    if (!file) {
      return { valid: false, error: 'No se seleccionó ningún archivo' }
    }

    // 2. Verificar tamaño
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > FILE_CONSTRAINTS.maxSizeMB) {
      return {
        valid: false,
        error: `El archivo es muy grande (${sizeMB.toFixed(1)}MB). Máximo ${FILE_CONSTRAINTS.maxSizeMB}MB`
      }
    }

    // 3. Verificar tipo de archivo
    const fileType = file.type.toLowerCase()
    const fileName = file.name.toLowerCase()
    const extension = fileName.split('.').pop()

    const isValidType = FILE_CONSTRAINTS.allowedTypes.includes(fileType)
    const isValidExtension = FILE_CONSTRAINTS.allowedExtensions.includes(extension)

    if (!isValidType && !isValidExtension) {
      return {
        valid: false,
        error: 'Formato no permitido. Solo imágenes (JPG, PNG, HEIC) y PDF'
      }
    }

    return { valid: true, error: null }
  }

  // ═══════════════════════════════════════════════════════════
  // UPLOAD
  // ═══════════════════════════════════════════════════════════

  /**
   * Sube un archivo a Firebase Storage (modo temporal)
   * 
   * @param {File} file - Archivo a subir
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - { fileId, urls: { original, preview } }
   */
  async function uploadFile(file, options = {}) {
    // 1. Validar contexto
    if (!authStore.user?.uid) {
      toast.error('Debes iniciar sesión para subir archivos')
      throw new Error('Usuario no autenticado')
    }

    const tenantId = businessStore.getBusinessId
    if (!tenantId) {
      toast.error('No hay negocio seleccionado')
      throw new Error('No hay negocio seleccionado')
    }

    // 2. Validar archivo
    const validation = validateFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      throw new Error(validation.error)
    }

    const fileId = uuidv4()
    const uid = authStore.user.uid
    const timestamp = Date.now()

    try {
      // 3. Iniciar tracking en el store
      fileStore.startUpload(fileId, {
        fileName: file.name,
        contentType: file.type,
        size: file.size
      })

      // 4. Definir path en Storage (temporal)
      const storagePath = `uploads/tmp/${tenantId}/${uid}/${timestamp}-${fileId}/original`
      const fileRef = storageRef(storage, storagePath)

      // 5. Crear documento en Firestore (antes de subir)
      const fileDoc = {
        fileId,
        ownerUid: uid,
        tenantId,
        entity: null, // Sin entity aún (temporal)
        contentType: file.type,
        fileName: file.name,
        size: file.size,
        status: 'uploading',
        storage: {
          originalPath: storagePath,
          previewPath: null
        },
        urls: {
          original: null,
          preview: null
        },
        meta: {
          uploadedAt: serverTimestamp(),
          processedAt: null
        },
        error: null
      }

      await setDoc(doc(db, 'files', fileId), fileDoc)

      // 6. Subir archivo con progreso
      const uploadTask = uploadBytesResumable(fileRef, file, {
        contentType: file.type
      })

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          // Progress
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            fileStore.updateProgress(fileId, progress)
          },
          // Error
          async (error) => {
            console.error('❌ Error subiendo archivo:', error)

            // Actualizar Firestore
            await updateDoc(doc(db, 'files', fileId), {
              status: 'error',
              error: {
                code: error.code,
                messageUser: 'Error al subir el archivo. Intenta de nuevo.'
              }
            })

            fileStore.markAsError(fileId, 'Error al subir el archivo')
            toast.error('Error al subir el archivo. Intenta de nuevo.')
            reject(error)
          },
          // Success
          async () => {
            try {
              // 7. Obtener URL de descarga
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

              // 8. Actualizar Firestore (marcar como "processing")
              await updateDoc(doc(db, 'files', fileId), {
                status: 'processing',
                'urls.original': downloadURL,
                'meta.uploadedAt': serverTimestamp()
              })

              fileStore.markAsProcessing(fileId)

              // 9. Esperar a que Cloud Function procese (genera preview)
              // Listener en tiempo real para detectar cuando status = 'ready'
              const result = await waitForProcessing(fileId)

              // 10. Actualizar store local
              fileStore.markAsReady(fileId, result.urls)

              toast.success('Archivo subido correctamente')

              resolve({
                fileId,
                urls: result.urls,
                metadata: result.meta
              })
            } catch (error) {
              console.error('❌ Error post-upload:', error)
              fileStore.markAsError(fileId, 'Error procesando el archivo')
              toast.error('Error procesando el archivo')
              reject(error)
            }
          }
        )
      })
    } catch (error) {
      console.error('❌ Error en uploadFile:', error)
      fileStore.markAsError(fileId, error.message)
      throw error
    }
  }

  /**
   * Espera a que Cloud Function procese el archivo
   * (detecta cuando status cambia a 'ready')
   */
  async function waitForProcessing(fileId, maxWaitMs = 30000) {
    const startTime = Date.now()
    const checkInterval = 1000 // Revisar cada 1 segundo

    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        try {
          // Verificar timeout
          if (Date.now() - startTime > maxWaitMs) {
            clearInterval(intervalId)
            reject(new Error('Timeout esperando procesamiento'))
            return
          }

          // Leer documento de Firestore
          const fileDocSnap = await getDoc(doc(db, 'files', fileId))

          if (!fileDocSnap.exists()) {
            clearInterval(intervalId)
            reject(new Error('Documento de archivo no encontrado'))
            return
          }

          const fileData = fileDocSnap.data()

          // Si está listo, resolver
          if (fileData.status === 'ready') {
            clearInterval(intervalId)
            resolve({
              urls: fileData.urls,
              meta: fileData.meta
            })
            return
          }

          // Si falló, rechazar
          if (fileData.status === 'error') {
            clearInterval(intervalId)
            reject(new Error(fileData.error?.messageUser || 'Error procesando archivo'))
            return
          }

          // Continuar esperando
        } catch (error) {
          clearInterval(intervalId)
          reject(error)
        }
      }, checkInterval)
    })
  }

  // ═══════════════════════════════════════════════════════════
  // DELETE
  // ═══════════════════════════════════════════════════════════

  /**
   * Elimina un archivo (Storage + Firestore)
   */
  async function deleteFile(fileId) {
    try {
      // 1. Obtener documento
      const fileDocSnap = await getDoc(doc(db, 'files', fileId))

      if (!fileDocSnap.exists()) {
        toast.error('Archivo no encontrado')
        return
      }

      const fileData = fileDocSnap.data()

      // 2. Verificar permisos (solo el dueño puede eliminar)
      if (fileData.ownerUid !== authStore.user?.uid) {
        toast.error('No tienes permiso para eliminar este archivo')
        return
      }

      // 3. Eliminar de Storage
      try {
        if (fileData.storage?.originalPath) {
          const originalRef = storageRef(storage, fileData.storage.originalPath)
          await deleteObject(originalRef)
        }

        if (fileData.storage?.previewPath) {
          const previewRef = storageRef(storage, fileData.storage.previewPath)
          await deleteObject(previewRef)
        }
      } catch (storageError) {
        console.warn('⚠️ Error eliminando de Storage:', storageError)
        // Continuar aunque falle el borrado de Storage
      }

      // 4. Marcar como eliminado en Firestore (no borrar, auditoria)
      await updateDoc(doc(db, 'files', fileId), {
        status: 'deleted',
        'meta.deletedAt': serverTimestamp()
      })

      // 5. Remover del store local
      fileStore.removeUpload(fileId)

      toast.success('Archivo eliminado correctamente')
    } catch (error) {
      console.error('❌ Error eliminando archivo:', error)
      toast.error('Error al eliminar el archivo')
      throw error
    }
  }

  // ═══════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════

  return {
    // Métodos principales
    uploadFile,
    deleteFile,
    validateFile,

    // Constraints (para mostrar en UI)
    constraints: FILE_CONSTRAINTS
  }
}
