/**
 * Constantes para el sistema de presentaciones y unidades de inventario
 */

// Unidades que admiten venta fraccionable (con decimales)
export const FRACTIONAL_UNITS = ['kg', 'lt', 'm'];

// Estructura por defecto de una presentación
export const DEFAULT_PRESENTATION_USAGE = ['buy', 'sell'];

// Estructura de política de precios por defecto en negocio
export const DEFAULT_PRICING_POLICY = {
  minMarginPct: 20,
  belowFloorAction: 'warn', // 'warn' | 'require_manager' | 'block'
  allowBelowCost: false,
};
