/**
 * Motor de Clasificación para el Estado de Resultados (P&L)
 * Mapea ingresos y egresos de Wala a líneas del Estado de Resultados automáticamente.
 */

/**
 * Determina a qué línea del Estado de Resultados corresponde una transacción
 * @param {Object} tx - Transacción del store o de base de datos
 * @returns {string} Código de la línea del P&L ('sales_revenue' | 'cogs_materials' | 'cogs_labor' | 'cogs_cif' | 'opex_fixed' | 'opex_sales' | 'depreciation' | 'financial' | 'tax' | 'loan_principal' | 'capex' | 'mixed' | 'other')
 */
export function classifyStatementLine(tx) {
  if (!tx) return 'other';

  // Si ya tiene una línea explícita válida, respetarla
  if (
    tx.statementLine &&
    [
      'sales_revenue',
      'cogs_materials',
      'cogs_labor',
      'cogs_cif',
      'opex_fixed',
      'opex_sales',
      'depreciation',
      'financial',
      'tax',
      'loan_principal',
      'capex',
      'mixed',
    ].includes(tx.statementLine)
  ) {
    return tx.statementLine;
  }

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
      const subcat = (tx.subcategory || '').toLowerCase();
      const subsubcat = (tx.subsubcategory || '').toLowerCase();
      const desc = (tx.description || '').toLowerCase();

      // Préstamos / Deuda: Amortización de Capital (no va a P&L, va a Flujo de Efectivo / Pasivo)
      if (
        subcat.includes('amortizac') || 
        subsubcat.includes('amortizac') || 
        subsubcat.includes('capital') ||
        desc.includes('amortizac')
      ) {
        return 'loan_principal';
      }

      // Activos Fijos / Maquinaria (CAPEX - Inversión, no va a OPEX del P&L)
      if (
        subcat.includes('maquinaria') || 
        subcat.includes('activo') || 
        subsubcat.includes('maquinaria') || 
        subsubcat.includes('equipamiento') || 
        subsubcat.includes('activo') ||
        desc.includes('compra de maquina') ||
        desc.includes('compra de equipo')
      ) {
        return 'capex';
      }

      // Depreciación de Activos Fijos (Gasto no monetario de P&L)
      if (
        subcat === 'depreciacion' || 
        subsubcat === 'depreciacion' || 
        desc.includes('depreciaci')
      ) {
        return 'depreciation';
      }

      // Impuesto a la Renta y Tributos
      if (
        subcat.includes('impuesto') || 
        subcat.includes('tribut') || 
        subsubcat.includes('renta') || 
        subsubcat.includes('sunat') || 
        subsubcat.includes('municipal') ||
        desc.includes('impuesto a la renta') ||
        desc.includes('sunat renta') ||
        desc.includes('pago rus')
      ) {
        return 'tax';
      }

      // Gastos Financieros (Comisiones de bancos, POS, intereses de préstamos)
      if (
        subcat.includes('financiero') || 
        subcat.includes('bancario') || 
        subsubcat.includes('banca') || 
        subsubcat.includes('pos') || 
        subsubcat.includes('interes') ||
        desc.includes('interes') ||
        desc.includes('comision pos') ||
        desc.includes('comisión bancaria') ||
        desc.includes('mantenimiento cuenta') ||
        desc.includes('itf')
      ) {
        return 'financial';
      }

      // Gastos de Ventas (Marketing, Publicidad, Envíos y Comisiones)
      if (
        usage === 'LOGISTICS' || 
        subcat === 'delivery_cost' || 
        subcat === 'platform_commission' || 
        subcat.includes('marketing') ||
        subcat.includes('publicidad') ||
        subsubcat === 'digital' || 
        subsubcat === 'físico' ||
        subsubcat === 'fisico' ||
        subsubcat.includes('influencer') ||
        subsubcat.includes('eventos') ||
        desc.includes('publicidad') ||
        desc.includes('meta ads') ||
        desc.includes('facebook ads') ||
        desc.includes('tiktok ads') ||
        desc.includes('volantes')
      ) {
        return 'opex_sales';
      }

      // Costo Indirecto de Fabricación (CIF - Servicios del área productiva)
      if (usage === 'PRODUCE') {
        return 'cogs_cif';
      }

      // Gastos Prorrateados / Mixtos
      if (usage === 'MIXED') {
        return 'mixed';
      }

      // Por defecto cualquier otro overhead operativo es fijo
      return 'opex_fixed';
    }
  }
  
  return 'other';
}
