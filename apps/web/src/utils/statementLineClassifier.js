/**
 * Motor de Clasificación para el Estado de Resultados (P&L)
 * Mapea ingresos y egresos de Wala a líneas del Estado de Resultados automáticamente.
 */

/**
 * Determina a qué línea del Estado de Resultados corresponde una transacción
 * @param {Object} tx - Transacción del store o de base de datos
 * @returns {string} Código de la línea del P&L ('sales_revenue' | 'cogs_materials' | 'cogs_labor' | 'cogs_cif' | 'opex_fixed' | 'opex_sales' | 'depreciation' | 'financial' | 'tax' | 'mixed' | 'other')
 */
export function classifyStatementLine(tx) {
  if (!tx) return 'other';

  // 1. Ingresos
  if (tx.type === 'income') {
    return 'sales_revenue';
  }
  
  // 2. Egresos
  if (tx.type === 'expense') {
    const category = tx.category;
    
    // Costo de Ventas - Materiales e Insumos
    if (category === 'materials') {
      return 'cogs_materials';
    }
    
    // Costo de Ventas - Mano de Obra Directa
    if (category === 'labor') {
      if (tx.paylabor === 'DIRECT_SERVICE' || tx.paylabor === 'PRODUCTION_SUPPORT') {
        return 'cogs_labor';
      }
      return 'opex_fixed'; // Sueldos de vendedoras, cajeros o administración son fijos
    }
    
    // Gastos Generales (Overhead)
    if (category === 'overhead') {
      const usage = tx.overheadUsage;
      const subcat = tx.subcategory;
      
      // Gastos de Ventas (Marketing, Publicidad, Envíos y Comisiones)
      if (
        usage === 'LOGISTICS' || 
        subcat === 'delivery_cost' || 
        subcat === 'platform_commission' || 
        subcat === 'Digital' || 
        subcat === 'Físico'
      ) {
        return 'opex_sales';
      }
      
      // Gastos Financieros (Comisiones de bancos, POS, intereses)
      if (subcat === 'Banca y Cuentas' || subcat === 'POS') {
        return 'financial';
      }
      
      // Costo Indirecto de Fabricación (CIF - Servicios del área productiva)
      if (usage === 'PRODUCE') {
        return 'cogs_cif';
      }
      
      // Gastos Prorrateados / Mixtos
      if (usage === 'MIXED') {
        return 'mixed';
      }
      
      // Impuesto a la Renta
      if (subcat === 'impuesto_renta') {
        return 'tax';
      }
      
      // Depreciación
      if (subcat === 'depreciacion') {
        return 'depreciation';
      }
      
      // Por defecto cualquier otro overhead operativo es fijo
      return 'opex_fixed';
    }
  }
  
  return 'other';
}
