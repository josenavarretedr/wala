// useCompositionStockValidation.js
// Validación de stock de materiales en composición de productos

import { ref } from 'vue';
import { useInventory } from '@/composables/useInventory';

// Caché temporal para evitar queries repetidas
const stockCache = new Map();
const CACHE_TTL = 30000; // 30 segundos

export function useCompositionStockValidation() {
  const { getProductById } = useInventory();

  /**
   * Limpia la caché de stock
   */
  const clearCache = () => {
    stockCache.clear();
  };

  /**
   * Obtiene stock de un producto desde caché o Firestore
   * @param {string} productId - UUID del producto
   * @returns {Promise<Object|null>} Datos del producto con stock
   */
  const getProductStock = async (productId) => {
    // Verificar caché
    const cached = stockCache.get(productId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Consultar Firestore
    try {
      const product = await getProductById(productId);

      if (product) {
        const data = {
          productId,
          description: product.description,
          stock: product.stock ?? 0,
          trackStock: product.trackStock ?? false,
          unit: product.unit || 'uni',
        };

        // Guardar en caché
        stockCache.set(productId, {
          data,
          timestamp: Date.now(),
        });

        return data;
      }

      return null;
    } catch (error) {
      console.error('❌ Error obteniendo stock del producto:', error);
      return null;
    }
  };

  /**
   * Valida si hay stock suficiente de materiales en la composición
   * @param {string} productId - UUID del producto a validar
   * @param {number} requestedQuantity - Cantidad solicitada del producto final
   * @returns {Promise<Object>} Resultado de validación con detalles
   */
  const validateCompositionStock = async (productId, requestedQuantity) => {
    try {
      // Validaciones básicas
      if (!productId || !requestedQuantity || requestedQuantity <= 0) {
        return {
          valid: true,
          hasComposition: false,
          insufficientMaterials: [],
          warnings: [],
        };
      }

      // Obtener el producto
      const product = await getProductById(productId);

      if (!product) {
        console.warn('⚠️ Producto no encontrado:', productId);
        return {
          valid: true,
          hasComposition: false,
          insufficientMaterials: [],
          warnings: ['Producto no encontrado'],
        };
      }

      // Verificar si tiene composición
      if (!product.composition || !Array.isArray(product.composition) || product.composition.length === 0) {
        return {
          valid: true,
          hasComposition: false,
          insufficientMaterials: [],
          warnings: [],
          productType: product.type,
        };
      }

      console.log('🔍 Validando stock de composición:', {
        productId,
        productName: product.description,
        requestedQuantity,
        compositionItems: product.composition.length,
      });

      const insufficientMaterials = [];
      const warnings = [];

      // Validar cada material en la composición
      for (const material of product.composition) {
        const materialProductId = material.productId;
        const quantityPerUnit = parseFloat(material.quantity) || 0;
        const yieldRatio = material.yieldFactor ? material.yieldFactor / 100 : 1;
        const grossQuantityPerUnit = quantityPerUnit / yieldRatio;
        const neededQuantity = grossQuantityPerUnit * requestedQuantity;

        // Obtener stock del material
        const materialProduct = await getProductStock(materialProductId);

        if (!materialProduct) {
          warnings.push(`Material ${material.description || materialProductId} no encontrado`);
          continue;
        }

        // Solo validar si el material tiene seguimiento de stock
        if (!materialProduct.trackStock) {
          continue;
        }

        const availableStock = materialProduct.stock ?? 0;

        // Redondear a 2 decimales para evitar problemas de precisión de punto flotante
        const neededRounded = Math.round(neededQuantity * 100) / 100;
        const availableRounded = Math.round(availableStock * 100) / 100;

        // Si no hay stock suficiente, agregarlo a la lista (solo cuando realmente falta)
        if (availableRounded < neededRounded) {
          const missingQuantity = Math.round((neededRounded - availableRounded) * 100) / 100;

          insufficientMaterials.push({
            productId: materialProductId,
            description: materialProduct.description || material.description || 'Material sin nombre',
            needed: neededRounded,
            available: availableRounded,
            missing: missingQuantity,
            unit: materialProduct.unit || material.unit || 'uni',
            quantityPerUnit,
          });

          console.warn('⚠️ Stock insuficiente:', {
            material: materialProduct.description,
            needed: neededRounded,
            available: availableRounded,
            missing: missingQuantity,
          });
        }
      }

      const valid = insufficientMaterials.length === 0;

      return {
        valid,
        hasComposition: true,
        insufficientMaterials,
        warnings,
        productType: product.type,
        compositionItemsCount: product.composition.length,
      };

    } catch (error) {
      console.error('❌ Error validando stock de composición:', error);
      return {
        valid: false,
        hasComposition: false,
        insufficientMaterials: [],
        warnings: ['Error al validar composición: ' + error.message],
      };
    }
  };

  /**
   * Valida stock de un producto considerando tanto su stock directo como su composición
   * @param {Object} product - Objeto del producto con toda su información
   * @param {number} requestedQuantity - Cantidad solicitada
   * @returns {Promise<Object>} Validación completa con ambos niveles
   */
  const validateProductAndCompositionStock = async (product, requestedQuantity) => {
    if (!product || !requestedQuantity) {
      return {
        hasProductStockIssue: false,
        hasCompositionStockIssue: false,
        compositionValidation: null,
        canProceed: true,
      };
    }

    // Nivel 1: Validar stock del producto final (si tiene trackStock)
    let hasProductStockIssue = false;
    if (product.trackStock) {
      const productStock = product.stock ?? 0;
      hasProductStockIssue = requestedQuantity > productStock;
    }

    // Nivel 2: Validar stock de materiales en composición
    const compositionValidation = await validateCompositionStock(product.uuid || product.productId, requestedQuantity);
    const hasCompositionStockIssue = compositionValidation.hasComposition && !compositionValidation.valid;

    return {
      hasProductStockIssue,
      hasCompositionStockIssue,
      compositionValidation,
      canProceed: !hasProductStockIssue && !hasCompositionStockIssue,
      warningType: hasProductStockIssue && hasCompositionStockIssue ? 'both' :
        hasProductStockIssue ? 'product' :
          hasCompositionStockIssue ? 'materials' : null,
    };
  };

  return {
    validateCompositionStock,
    validateProductAndCompositionStock,
    clearCache,
    getProductStock,
  };
}
