// src/components/ProductCosting/constants.js
// Constantes para el módulo de costeo de productos

/**
 * Tiempo adicional de gestión para agregar a los productos (en horas)
 */
export const MANAGEMENT_TIME_EXTRA = 0.5;

/**
 * Valores por defecto para el cálculo de MOD
 */
export const MOD_DEFAULTS = {
  // Horas productivas por día (de una jornada de 8 horas)
  PRODUCTIVE_HOURS_PER_DAY: 6,

  // Jornada laboral completa
  FULL_WORKDAY_HOURS: 8,

  // Warning: cuando las horas productivas superan este valor
  MAX_PRODUCTIVE_HOURS_WARNING: 12,

  // Warning: cuando el tiempo de un producto supera este valor
  MAX_PRODUCT_TIME_WARNING: 24,
};

/**
 * Mensajes de ayuda y tooltips
 */
export const HELP_MESSAGES = {
  PRODUCTIVE_HOURS: (hours, fullDay = 8) =>
    `Jornada normal de ${fullDay}hrs, estas ${hours} hrs son productivas`,

  MANAGEMENT_TIME: 'Tiempo adicional para gestión administrativa y coordinación del producto/servicio',

  NO_EXPENSES: 'No se encontraron gastos de MOD. Crea expenses en la sección de Gastos.',

  SELECT_EXPENSES: 'Selecciona al menos un gasto de mano de obra',
};
