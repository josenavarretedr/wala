// src/utils/businessCapabilities.js

import { BusinessType } from './expenseBucketClassifier';

/**
 * Deriva las capabilities (módulos habilitados) según el tipo de negocio
 * @param {string} businessType - El tipo de negocio (FOOD_PRODUCTION, RETAIL, etc.)
 * @returns {Object} Mapa de capabilities
 */
export function getBusinessCapabilities(businessType) {
  switch (businessType) {
    case BusinessType.FOOD_PRODUCTION:
      return {
        enableProduction: true,       // Puede crear PRODUCT con composición
        enableRawMaterials: true,     // Puede crear RAW_MATERIAL
        enableWasteManagement: true,  // Puede configurar merma/rendimiento
        enableMOD: true,              // Puede configurar Mano de Obra Directa
        enableCIF: true,              // Puede configurar CIF
      };
    case BusinessType.MACHINE_SERVICES:
      return {
        enableProduction: true,
        enableRawMaterials: true,
        enableWasteManagement: true,
        enableMOD: true,
        enableCIF: true,
      };
    case BusinessType.MIXED:
      return {
        enableProduction: true,
        enableRawMaterials: true,
        enableWasteManagement: true,
        enableMOD: true,
        enableCIF: true,
      };
    case BusinessType.RETAIL:
      return {
        enableProduction: false,
        enableRawMaterials: false,
        enableWasteManagement: false,
        enableMOD: false,
        enableCIF: false,
      };
    case BusinessType.APPOINTMENT_SERVICES:
      return {
        enableProduction: true,       // Puede tener "recetas" de servicio
        enableRawMaterials: true,     // Puede tener insumos
        enableWasteManagement: false, // No suele tener merma
        enableMOD: true,
        enableCIF: false,
      };
    default:
      // Fallback permisivo si no hay businessType definido o es desconocido
      return {
        enableProduction: true,
        enableRawMaterials: true,
        enableWasteManagement: true,
        enableMOD: true,
        enableCIF: true,
      };
  }
}
