/**
 * Índice de configuraciones de onboarding
 * 
 * Exporta todas las configuraciones de tours disponibles
 * para las diferentes vistas de la aplicación
 */

import { dashboardConfig } from './dashboard.config';
// Importar más configuraciones según se vayan creando
// import { transactionsConfig } from './transactions.config';
// import { inventoryConfig } from './inventory.config';
// import { accountsConfig } from './accounts.config';

/**
 * Objeto con todas las configuraciones de onboarding
 * La key debe ser descriptiva del área/vista
 */
export const onboardingConfigs = {
  dashboard: dashboardConfig,
  // transactions: transactionsConfig,
  // inventory: inventoryConfig,
  // accounts: accountsConfig,
};

/**
 * Obtener lista de todos los tours disponibles
 * @returns {Array} Array de configuraciones
 */
export const getAllTours = () => {
  return Object.values(onboardingConfigs);
};

/**
 * Obtener configuración por ID
 * @param {string} tourId - ID del tour
 * @returns {Object|null}
 */
export const getTourById = (tourId) => {
  return Object.values(onboardingConfigs).find(config => config.id === tourId) || null;
};
