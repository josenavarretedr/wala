// productCostingStore.js
// Store temporal para gestionar los costos de productos
// Este store será reemplazado en el futuro con lógica completa de cálculo

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useProductCostingStore = defineStore('productCosting', () => {
  // ==========================================
  // Estado
  // ==========================================

  const currentProductId = ref(null);

  // Costos temporales (serán reemplazados con lógica completa)
  const costs = ref({
    materials: null,      // Costos de Materiales por artículo
    mod: null,            // Costo de Mano de Obra Directa por artículo
    cif: null,            // Costos Indirectos de Fabricación por artículo
    overhead: null        // Gastos Generales por artículo
  });

  // ==========================================
  // Computed Properties
  // ==========================================

  /**
   * Verifica si hay algún costo de materiales guardado
   */
  const hasMaterialsCost = computed(() => {
    return costs.value.materials !== null && costs.value.materials !== undefined;
  });

  /**
   * Verifica si hay algún costo MOD guardado
   */
  const hasMODCost = computed(() => {
    return costs.value.mod !== null && costs.value.mod !== undefined;
  });

  /**
   * Verifica si hay algún costo CIF guardado
   */
  const hasCIFCost = computed(() => {
    return costs.value.cif !== null && costs.value.cif !== undefined;
  });

  /**
   * Verifica si hay algún costo de overhead guardado
   */
  const hasOverheadCost = computed(() => {
    return costs.value.overhead !== null && costs.value.overhead !== undefined;
  });

  /**
   * Calcula el costo total sumando todos los costos disponibles
   */
  const totalCost = computed(() => {
    let total = 0;

    if (hasMaterialsCost.value) total += parseFloat(costs.value.materials);
    if (hasMODCost.value) total += parseFloat(costs.value.mod);
    if (hasCIFCost.value) total += parseFloat(costs.value.cif);
    if (hasOverheadCost.value) total += parseFloat(costs.value.overhead);

    return total > 0 ? total : null;
  });

  /**
   * Verifica si hay al menos un costo guardado
   */
  const hasAnyCost = computed(() => {
    return hasMaterialsCost.value || hasMODCost.value || hasCIFCost.value || hasOverheadCost.value;
  });

  // ==========================================
  // Métodos
  // ==========================================

  /**
   * Inicializa el store para un producto específico
   * @param {string} productId - ID del producto
   */
  function initializeProduct(productId) {
    if (currentProductId.value !== productId) {
      currentProductId.value = productId;
      // En el futuro, aquí se cargarían los datos desde Firestore
      // Por ahora solo reseteamos si es un producto diferente
      resetCosts();
    }
  }

  /**
   * Actualiza el costo de materiales
   * @param {number} value - Valor del costo
   */
  function updateMaterialsCost(value) {
    costs.value.materials = value !== null && value !== '' ? parseFloat(value) : null;
    console.log('💰 Costo de Materiales actualizado:', costs.value.materials);
  }

  /**
   * Actualiza el costo de Mano de Obra Directa
   * @param {number} value - Valor del costo
   */
  function updateMODCost(value) {
    costs.value.mod = value !== null && value !== '' ? parseFloat(value) : null;
    console.log('💰 Costo MOD actualizado:', costs.value.mod);
  }

  /**
   * Actualiza el costo de Costos Indirectos de Fabricación
   * @param {number} value - Valor del costo
   */
  function updateCIFCost(value) {
    costs.value.cif = value !== null && value !== '' ? parseFloat(value) : null;
    console.log('💰 Costo CIF actualizado:', costs.value.cif);
  }

  /**
   * Actualiza el costo de Gastos Generales
   * @param {number} value - Valor del costo
   */
  function updateOverheadCost(value) {
    costs.value.overhead = value !== null && value !== '' ? parseFloat(value) : null;
    console.log('💰 Costo Overhead actualizado:', costs.value.overhead);
  }

  /**
   * Resetea todos los costos a null
   */
  function resetCosts() {
    costs.value = {
      materials: null,
      mod: null,
      cif: null,
      overhead: null
    };
    console.log('🔄 Costos reseteados');
  }

  /**
   * Guarda todos los costos (temporal - en el futuro guardará en Firestore)
   * @returns {Promise<boolean>} - true si se guardó exitosamente
   */
  async function saveCosts() {
    try {
      // TODO: Implementar guardado en Firestore
      console.log('💾 Guardando costos:', {
        productId: currentProductId.value,
        costs: costs.value
      });

      // Simulación de guardado exitoso
      return true;
    } catch (error) {
      console.error('❌ Error al guardar costos:', error);
      return false;
    }
  }

  /**
   * Obtiene el costo por tipo
   * @param {string} type - Tipo de costo (materials, mod, cif, overhead)
   * @returns {number|null} - Valor del costo
   */
  function getCostByType(type) {
    return costs.value[type];
  }

  // ==========================================
  // Return
  // ==========================================

  return {
    // Estado
    currentProductId,
    costs,

    // Computed
    hasMaterialsCost,
    hasMODCost,
    hasCIFCost,
    hasOverheadCost,
    totalCost,
    hasAnyCost,

    // Métodos
    initializeProduct,
    updateMaterialsCost,
    updateMODCost,
    updateCIFCost,
    updateOverheadCost,
    resetCosts,
    saveCosts,
    getCostByType
  };
});
