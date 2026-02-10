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
  // Estado de Composición de Materiales
  // ==========================================

  const materialsComposition = ref({
    items: [],              // Array de materiales: [{productId, description, quantity, unit, costPerUnit, subtotal}]
    totalCost: 0,          // Suma calculada de todos los subtotales
    hasChanges: false,     // Flag para detectar cambios sin guardar
    loadedFromFirestore: false, // Flag para saber si se cargó data existente
    originalData: []       // Copia de los datos originales para comparación
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

  /**
   * Calcula cuántos materiales tienen costo definido
   */
  const materialsWithCost = computed(() => {
    return materialsComposition.value.items.filter(item => item.costPerUnit !== null && item.costPerUnit > 0).length;
  });

  /**
   * Porcentaje de materiales con costo definido
   */
  const materialsCostProgress = computed(() => {
    const total = materialsComposition.value.items.length;
    if (total === 0) return 0;
    return Math.round((materialsWithCost.value / total) * 100);
  });

  /**
   * Materiales sin costo definido
   */
  const materialsWithoutCost = computed(() => {
    return materialsComposition.value.items.filter(item => !item.costPerUnit || item.costPerUnit <= 0);
  });

  /**
   * Verifica si hay cambios sin guardar en la composición
   */
  const hasUnsavedChanges = computed(() => {
    return materialsComposition.value.hasChanges;
  });

  // ==========================================
  // Métodos
  // ==========================================

  /**
   * Inicializa el store para un producto específico
   * @param {string} productId - ID del producto
   */
  function initializeProduct(productId, product = null) {
    if (currentProductId.value !== productId) {
      currentProductId.value = productId;
      // En el futuro, aquí se cargarían los datos desde Firestore
      // Por ahora solo reseteamos si es un producto diferente
      resetCosts();
    }

    // Si se pasó el producto, cargar costos desde costStructure
    if (product && product.costStructure) {
      costs.value.materials = product.costStructure.materials ?? null;
      costs.value.mod = product.costStructure.mod ?? null;
      costs.value.cif = product.costStructure.cif ?? null;
      costs.value.overhead = product.costStructure.overhead ?? null;

      console.log('📦 Costos cargados desde producto:', {
        materials: costs.value.materials,
        mod: costs.value.mod,
        cif: costs.value.cif,
        overhead: costs.value.overhead
      });
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
  // Métodos de Composición de Materiales
  // ==========================================

  /**
   * Carga la composición de materiales existente
   * @param {Array} composition - Array de materiales del producto
   */
  function loadComposition(composition = []) {
    materialsComposition.value.items = [...composition];
    materialsComposition.value.originalData = JSON.parse(JSON.stringify(composition));
    materialsComposition.value.loadedFromFirestore = true;
    materialsComposition.value.hasChanges = false;
    calculateTotalCost();
    console.log('📦 Composición cargada:', materialsComposition.value.items);
  }

  /**
   * Agrega un material a la composición
   * @param {Object} material - Objeto del material a agregar
   */
  function addMaterialToComposition(material) {
    // Verificar si ya existe
    const existingIndex = materialsComposition.value.items.findIndex(
      item => item.productId === material.productId
    );

    if (existingIndex !== -1) {
      console.warn('⚠️ Material ya existe en la composición');
      return { success: false, reason: 'duplicate' };
    }

    // Agregar el material
    materialsComposition.value.items.push({
      productId: material.productId,
      description: material.description,
      quantity: material.quantity,
      unit: material.unit,
      costPerUnit: material.costPerUnit || null,
      subtotal: material.costPerUnit ? (material.quantity * material.costPerUnit) : null
    });

    materialsComposition.value.hasChanges = true;
    calculateTotalCost();

    console.log('✅ Material agregado:', material.description);
    return { success: true };
  }

  /**
   * Actualiza la cantidad de un material
   * @param {string} productId - ID del producto
   * @param {number} quantity - Nueva cantidad
   */
  function updateMaterialQuantity(productId, quantity) {
    const material = materialsComposition.value.items.find(
      item => item.productId === productId
    );

    if (!material) {
      console.warn('⚠️ Material no encontrado:', productId);
      return;
    }

    material.quantity = parseFloat(quantity);

    // Recalcular subtotal
    if (material.costPerUnit && material.costPerUnit > 0) {
      material.subtotal = material.quantity * material.costPerUnit;
    }

    materialsComposition.value.hasChanges = true;
    calculateTotalCost();

    console.log('📝 Cantidad actualizada:', material.description, quantity);
  }

  /**
   * Elimina un material de la composición
   * @param {string} productId - ID del producto a eliminar
   */
  function removeMaterial(productId) {
    const index = materialsComposition.value.items.findIndex(
      item => item.productId === productId
    );

    if (index === -1) {
      console.warn('⚠️ Material no encontrado:', productId);
      return;
    }

    const removedMaterial = materialsComposition.value.items.splice(index, 1)[0];
    materialsComposition.value.hasChanges = true;
    calculateTotalCost();

    console.log('🗑️ Material eliminado:', removedMaterial.description);
  }

  /**
   * Calcula el costo total de la composición
   */
  function calculateTotalCost() {
    const total = materialsComposition.value.items.reduce((sum, item) => {
      if (item.subtotal && item.subtotal > 0) {
        return sum + item.subtotal;
      }
      return sum;
    }, 0);

    materialsComposition.value.totalCost = parseFloat(total.toFixed(2));

    // Sincronizar con costs.materials
    costs.value.materials = materialsComposition.value.totalCost;

    console.log('💰 Costo total calculado:', materialsComposition.value.totalCost);
    console.log('💰 costs.materials sincronizado:', costs.value.materials);
  }

  /**
   * Resetea la composición de materiales
   */
  function resetComposition() {
    materialsComposition.value = {
      items: [],
      totalCost: 0,
      hasChanges: false,
      loadedFromFirestore: false,
      originalData: []
    };
    console.log('🔄 Composición reseteada');
  }

  /**
   * Verifica si hay materiales sin costo
   * @returns {boolean}
   */
  function hasMaterialsWithoutCost() {
    return materialsWithoutCost.value.length > 0;
  }

  // ==========================================
  // Return
  // ==========================================

  return {
    // Estado
    currentProductId,
    costs,
    materialsComposition,

    // Computed
    hasMaterialsCost,
    hasMODCost,
    hasCIFCost,
    hasOverheadCost,
    totalCost,
    hasAnyCost,
    materialsWithCost,
    materialsCostProgress,
    materialsWithoutCost,
    hasUnsavedChanges,

    // Métodos de costos
    initializeProduct,
    updateMaterialsCost,
    updateMODCost,
    updateCIFCost,
    updateOverheadCost,
    resetCosts,
    saveCosts,
    getCostByType,

    // Métodos de composición
    loadComposition,
    addMaterialToComposition,
    updateMaterialQuantity,
    removeMaterial,
    calculateTotalCost,
    resetComposition,
    hasMaterialsWithoutCost
  };
});
