/**
 * @file useProductCache.js
 * @description Composable para caché local de productos
 * 
 * Reduce llamadas a Firestore manteniendo productos frecuentemente usados
 * en memoria con TTL (Time To Live) de 5 minutos.
 * 
 * @module composables/useProductCache
 */

import { ref } from 'vue'

// Caché global compartido entre todas las instancias
const productCache = ref(new Map())
const cacheTimestamps = ref(new Map())
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos en milisegundos

export function useProductCache() {
  /**
   * Obtener producto del caché o Firestore
   * @param {string} productId - UUID del producto
   * @param {Function} fetchFunction - Función async para obtener de Firestore si no está en caché
   * @returns {Promise<Object|null>} Producto o null si no existe
   */
  const getProductCached = async (productId, fetchFunction) => {
    const now = Date.now()
    const cached = productCache.value.get(productId)
    const timestamp = cacheTimestamps.value.get(productId)

    // Si está en caché y no expiró, retornar inmediatamente
    if (cached && timestamp && (now - timestamp) < CACHE_TTL) {
      console.log('📦 [CACHE] Hit:', productId)
      return cached
    }

    // Si no está en caché o expiró, obtener de Firestore
    console.log('🌐 [CACHE] Miss, fetching:', productId)

    if (!fetchFunction) {
      console.warn('⚠️ [CACHE] No fetch function provided for:', productId)
      return null
    }

    try {
      const product = await fetchFunction(productId)

      if (product) {
        // Guardar en caché
        productCache.value.set(productId, product)
        cacheTimestamps.value.set(productId, now)
        console.log('✅ [CACHE] Cached:', productId)
      } else {
        console.warn('⚠️ [CACHE] Product not found:', productId)
      }

      return product

    } catch (error) {
      console.error('❌ [CACHE] Error fetching product:', productId, error)
      throw error
    }
  }

  /**
   * Obtener producto del caché solamente (síncrono, sin fetch)
   * @param {string} productId - UUID del producto
   * @returns {Object|null} Producto del caché o null si no está
   */
  const getFromCacheOnly = (productId) => {
    const now = Date.now()
    const cached = productCache.value.get(productId)
    const timestamp = cacheTimestamps.value.get(productId)

    // Verificar si existe y no expiró
    if (cached && timestamp && (now - timestamp) < CACHE_TTL) {
      return cached
    }

    return null
  }

  /**
   * Actualizar producto en caché (optimistic update)
   * @param {string} productId - UUID del producto
   * @param {Object} updates - Campos a actualizar
   * @param {boolean} merge - Si es true, hace merge con datos existentes
   * @returns {Object|null} Producto actualizado o null si no estaba en caché
   */
  const updateProductCache = (productId, updates, merge = true) => {
    const cached = productCache.value.get(productId)

    if (!cached && !merge) {
      console.warn('⚠️ [CACHE] Cannot update non-existent product:', productId)
      return null
    }

    const updated = merge && cached
      ? { ...cached, ...updates }
      : updates

    productCache.value.set(productId, updated)
    cacheTimestamps.value.set(productId, Date.now())

    console.log('✅ [CACHE] Updated:', productId, updates)

    return updated
  }

  /**
   * Eliminar producto del caché
   * @param {string} productId - UUID del producto
   */
  const removeFromCache = (productId) => {
    const existed = productCache.value.has(productId)

    productCache.value.delete(productId)
    cacheTimestamps.value.delete(productId)

    if (existed) {
      console.log('🗑️ [CACHE] Removed:', productId)
    }
  }

  /**
   * Pre-cargar múltiples productos en caché
   * @param {Array<string>} productIds - Array de UUIDs de productos
   * @param {Function} fetchFunction - Función async para obtener productos
   * @returns {Promise<Object>} Resumen de carga (loaded, failed)
   */
  const preloadProducts = async (productIds, fetchFunction) => {
    if (!productIds || productIds.length === 0) {
      console.log('ℹ️ [CACHE] No products to preload')
      return { loaded: 0, failed: 0 }
    }

    console.log(`📦 [CACHE] Pre-loading ${productIds.length} products...`)

    const promises = productIds.map(id =>
      getProductCached(id, fetchFunction)
        .then(() => ({ success: true, productId: id }))
        .catch(err => ({ success: false, productId: id, error: err.message }))
    )

    const results = await Promise.allSettled(promises)

    const loaded = results.filter(r => r.status === 'fulfilled' && r.value?.success).length
    const failed = results.length - loaded

    console.log(`✅ [CACHE] Pre-load completed: ${loaded} loaded, ${failed} failed`)

    return { loaded, failed }
  }

  /**
   * Limpiar caché expirado
   * @returns {number} Cantidad de entradas eliminadas
   */
  const clearExpiredCache = () => {
    const now = Date.now()
    let cleared = 0

    // Iterar sobre timestamps y verificar cuáles expiraron
    cacheTimestamps.value.forEach((timestamp, productId) => {
      if ((now - timestamp) >= CACHE_TTL) {
        productCache.value.delete(productId)
        cacheTimestamps.value.delete(productId)
        cleared++
      }
    })

    if (cleared > 0) {
      console.log(`🧹 [CACHE] Cleared ${cleared} expired entries`)
    }

    return cleared
  }

  /**
   * Limpiar todo el caché
   * @returns {number} Cantidad de entradas eliminadas
   */
  const clearAllCache = () => {
    const count = productCache.value.size

    productCache.value.clear()
    cacheTimestamps.value.clear()

    if (count > 0) {
      console.log(`🧹 [CACHE] Cleared all cache (${count} entries)`)
    }

    return count
  }

  /**
   * Obtener estadísticas del caché
   * @returns {Object} Estadísticas del caché
   */
  const getCacheStats = () => {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0

    cacheTimestamps.value.forEach((timestamp) => {
      if ((now - timestamp) < CACHE_TTL) {
        validEntries++
      } else {
        expiredEntries++
      }
    })

    return {
      totalEntries: productCache.value.size,
      validEntries,
      expiredEntries,
      cacheTTL: CACHE_TTL,
      cacheTTLMinutes: CACHE_TTL / (60 * 1000)
    }
  }

  /**
   * Verificar si un producto está en caché y es válido
   * @param {string} productId - UUID del producto
   * @returns {boolean} true si está en caché y no expiró
   */
  const isCached = (productId) => {
    const now = Date.now()
    const timestamp = cacheTimestamps.value.get(productId)

    return timestamp && ((now - timestamp) < CACHE_TTL)
  }

  return {
    // Métodos principales
    getProductCached,
    getFromCacheOnly,
    updateProductCache,
    removeFromCache,
    preloadProducts,

    // Utilidades de limpieza
    clearExpiredCache,
    clearAllCache,

    // Información
    getCacheStats,
    isCached,

    // Estado (solo lectura recomendado)
    productCache,
    cacheTimestamps,
    CACHE_TTL
  }
}
