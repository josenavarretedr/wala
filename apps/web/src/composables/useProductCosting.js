// src/composables/useProductCosting.js
// Composable para gestión de cálculos de costeo de productos

import { getFirestore, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import appFirebase from '@/firebaseInit';
import { ensureBusinessId } from '@/composables/useBusinessUtils';
import { useAuth } from '@/composables/useAuth';
import { round2, addMoney } from '@/utils/mathUtils';

const db = getFirestore(appFirebase);

export function useProductCosting() {
  const { currentUser } = useAuth();

  /**
   * Guarda el cálculo de MOD en la estructura de costeo del producto
   * @param {string} productId - UUID del producto
   * @param {Object} modData - Datos completos del cálculo MOD
   * @returns {Promise<void>}
   */
  const saveModCalculation = async (productId, modData) => {
    try {
      const businessId = ensureBusinessId();
      const productRef = doc(db, `businesses/${businessId}/products`, productId);

      // Obtener el producto actual para acceder al historial y materials
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) {
        throw new Error('Producto no encontrado');
      }

      const productData = productSnap.data();
      const currentCostStructure = productData.costStructure || {};

      // Construir historial de MOD
      const currentHistory = currentCostStructure.modHistory || [];
      const newHistoryEntry = {
        ...modData,
        savedAt: new Date(), // Firebase no permite serverTimestamp() en arrays
      };

      // Agregar nueva entrada al historial (máximo 10 registros)
      const updatedHistory = [newHistoryEntry, ...currentHistory].slice(0, 10);

      // Calcular costo total del producto
      const materialsValue = currentCostStructure.materials || 0;
      const modValue = round2(modData.costPerUnit || 0);
      const totalCost = addMoney(materialsValue, modValue);

      // Actualizar producto con estructura coherente
      await updateDoc(productRef, {
        'costStructure.mod': modValue, // Solo el número (coherente con materials)
        'costStructure.modHistory': updatedHistory, // Historial completo
        'costStructure.updatedAt': serverTimestamp(),
        'cost': totalCost, // Actualizar cost total del producto
      });

      console.log('✅ Cálculo MOD guardado exitosamente:', {
        productId,
        costPerUnit: modData.costPerUnit,
        totalProductCost: totalCost,
      });

      return true;
    } catch (error) {
      console.error('❌ Error guardando cálculo MOD:', error);
      throw error;
    }
  };

  /**
   * Obtiene el cálculo de MOD de un producto
   * @param {string} productId - UUID del producto
   * @returns {Promise<Object|null>} Datos del cálculo MOD o null
   */
  const getModCalculation = async (productId) => {
    try {
      const businessId = ensureBusinessId();
      const productRef = doc(db, `businesses/${businessId}/products`, productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        console.warn('⚠️ Producto no encontrado:', productId);
        return null;
      }

      const data = productSnap.data();
      return data.costStructure?.mod || null;
    } catch (error) {
      console.error('❌ Error obteniendo cálculo MOD:', error);
      return null;
    }
  };

  /**
   * Verifica si un producto tiene cálculo de MOD
   * @param {string} productId - UUID del producto
   * @returns {Promise<boolean>}
   */
  const hasModCalculation = async (productId) => {
    const modData = await getModCalculation(productId);
    return modData !== null && modData.costPerUnit > 0;
  };

  /**
   * Guarda el cálculo de Materials en la estructura de costeo
   * @param {string} productId - UUID del producto
   * @param {Object} materialsData - Datos del cálculo de materiales
   * @returns {Promise<void>}
   */
  const saveMaterialsCalculation = async (productId, materialsData) => {
    try {
      const businessId = ensureBusinessId();
      const productRef = doc(db, `businesses/${businessId}/products`, productId);

      await updateDoc(productRef, {
        'costStructure.materials': materialsData,
        'costStructure.updatedAt': serverTimestamp(),
      });

      console.log('✅ Cálculo Materials guardado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error guardando cálculo Materials:', error);
      throw error;
    }
  };

  /**
   * Obtiene la estructura de costeo completa de un producto
   * @param {string} productId - UUID del producto
   * @returns {Promise<Object>} Estructura de costeo
   */
  const getCostStructure = async (productId) => {
    try {
      const businessId = ensureBusinessId();
      const productRef = doc(db, `businesses/${businessId}/products`, productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        return null;
      }

      const data = productSnap.data();
      return data.costStructure || {};
    } catch (error) {
      console.error('❌ Error obteniendo estructura de costeo:', error);
      return {};
    }
  };

  return {
    saveModCalculation,
    getModCalculation,
    hasModCalculation,
    saveMaterialsCalculation,
    getCostStructure,
  };
}
