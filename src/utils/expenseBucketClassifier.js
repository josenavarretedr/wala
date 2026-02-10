// src/utils/expenseBucketClassifier.js
// Clasificación automática de gastos en buckets contables

// ========================================
// ENUMS
// ========================================

export const Bucket = {
  DIRECT_MATERIAL: 'DIRECT_MATERIAL',   // Material directo de producción
  COGS_RESALE: 'COGS_RESALE',           // Mercadería para reventa (retail)
  DIRECT_LABOR: 'DIRECT_LABOR',         // Mano de obra directa
  MANUFACTURING_OH: 'MANUFACTURING_OH', // CIF: costos indirectos de fabricación
  OVERHEAD: 'OVERHEAD',                 // Gastos generales: admin/ventas/soporte
};

export const PayLaborRole = {
  DIRECT_SERVICE: 'DIRECT_SERVICE',         // Atención directa / servicio profesional
  PRODUCTION_SUPPORT: 'PRODUCTION_SUPPORT', // Producción general (cocina, taller, fábrica)
  ADMIN_SUPPORT: 'ADMIN_SUPPORT',           // Administración / apoyo
};

export const OverheadUsage = {
  PRODUCE: 'PRODUCE', // Producción / prestación de servicio
  ADMIN: 'ADMIN',     // Atención / gestión
  MIXED: 'MIXED',     // Uso general (ambos) => se prorratea
};

export const BusinessType = {
  FOOD_PRODUCTION: 'FOOD_PRODUCTION',
  RETAIL: 'RETAIL',
  APPOINTMENT_SERVICES: 'APPOINTMENT_SERVICES',
  MACHINE_SERVICES: 'MACHINE_SERVICES',
  MIXED: 'MIXED',
};

// ========================================
// DEFAULTS POR TIPO DE NEGOCIO
// ========================================

/**
 * Retorna los defaults de split y labor según el tipo de negocio
 * @param {string} businessType
 * @returns {{ defaultSplit: { produce: number, admin: number }, laborDefault: string }}
 */
export function getIndustryDefaults(businessType) {
  switch (businessType) {
    case BusinessType.FOOD_PRODUCTION:
      return {
        defaultSplit: { produce: 0.60, admin: 0.40 },
        laborDefault: Bucket.MANUFACTURING_OH,
      };
    case BusinessType.RETAIL:
      return {
        defaultSplit: { produce: 0.00, admin: 1.00 },
        laborDefault: Bucket.OVERHEAD,
      };
    case BusinessType.APPOINTMENT_SERVICES:
      return {
        defaultSplit: { produce: 0.90, admin: 0.10 },
        laborDefault: Bucket.DIRECT_LABOR,
      };
    case BusinessType.MACHINE_SERVICES:
      return {
        defaultSplit: { produce: 0.80, admin: 0.20 },
        laborDefault: Bucket.MANUFACTURING_OH,
      };
    case BusinessType.MIXED:
      return {
        defaultSplit: { produce: 0.50, admin: 0.50 },
        laborDefault: Bucket.MANUFACTURING_OH,
      };
    default:
      // Fallback conservador
      return {
        defaultSplit: { produce: 0.50, admin: 0.50 },
        laborDefault: Bucket.OVERHEAD,
      };
  }
}

// ========================================
// CLASIFICACIÓN DE MATERIALS
// ========================================

/**
 * Clasifica un gasto de materiales en su bucket correspondiente
 * @param {string} businessType
 * @returns {string} Bucket
 */
export function classifyMaterials(businessType) {
  if (businessType === BusinessType.RETAIL) {
    return Bucket.COGS_RESALE;
  }
  return Bucket.DIRECT_MATERIAL;
}

// ========================================
// CLASIFICACIÓN DE PAYLABOR (Nómina)
// ========================================

/**
 * Clasifica un gasto de nómina en su bucket correspondiente
 * @param {string} businessType
 * @param {string} paylaborRole - DIRECT_SERVICE | PRODUCTION_SUPPORT | ADMIN_SUPPORT
 * @returns {string} Bucket
 */
export function classifyPayroll(businessType, paylaborRole) {
  if (paylaborRole === PayLaborRole.DIRECT_SERVICE) {
    return Bucket.DIRECT_LABOR;
  }
  if (paylaborRole === PayLaborRole.PRODUCTION_SUPPORT) {
    return Bucket.MANUFACTURING_OH;
  }
  if (paylaborRole === PayLaborRole.ADMIN_SUPPORT) {
    return Bucket.OVERHEAD;
  }
  // Fallback por industria
  return getIndustryDefaults(businessType).laborDefault;
}

// ========================================
// CLASIFICACIÓN DE OVERHEAD (Operaciones)
// ========================================

/**
 * Clasifica un gasto overhead en su bucket o genera splits
 * @param {string} businessType
 * @param {string} overheadUsage - PRODUCE | ADMIN | MIXED
 * @param {number} amount
 * @param {string} [expenseName='']
 * @returns {{ bucket: string|null, splits: Array|null }}
 */
export function classifyOperations(businessType, overheadUsage, amount, expenseName = '') {
  // Retail: casi todo es overhead
  if (businessType === BusinessType.RETAIL) {
    return { bucket: Bucket.OVERHEAD, splits: null };
  }

  if (overheadUsage === OverheadUsage.PRODUCE) {
    return { bucket: Bucket.MANUFACTURING_OH, splits: null };
  }

  if (overheadUsage === OverheadUsage.ADMIN) {
    return { bucket: Bucket.OVERHEAD, splits: null };
  }

  if (overheadUsage === OverheadUsage.MIXED) {
    const suggested = suggestSplit(businessType, expenseName);
    const produceAmount = Math.round(amount * suggested.produce * 100) / 100;
    const adminAmount = Math.round((amount - produceAmount) * 100) / 100;

    return {
      bucket: null, // No hay bucket único
      splits: [
        { bucket: Bucket.MANUFACTURING_OH, amount: produceAmount, percentage: suggested.produce },
        { bucket: Bucket.OVERHEAD, amount: adminAmount, percentage: suggested.admin },
      ],
    };
  }

  return { bucket: Bucket.OVERHEAD, splits: null };
}

// ========================================
// SUGERENCIA DE SPLIT
// ========================================

/**
 * Sugiere porcentajes de split según el tipo de negocio y el nombre del gasto
 * @param {string} businessType
 * @param {string} [expenseName='']
 * @returns {{ produce: number, admin: number }}
 */
export function suggestSplit(businessType, expenseName = '') {
  const defaults = getIndustryDefaults(businessType);
  const name = (expenseName || '').toLowerCase();

  // Heurísticas por nombre de gasto
  if (name.includes('alquiler') || name.includes('renta')) {
    return defaults.defaultSplit;
  }

  if (name.includes('luz') || name.includes('electricidad') || name.includes('gas') || name.includes('agua')) {
    if ([BusinessType.FOOD_PRODUCTION, BusinessType.MACHINE_SERVICES, BusinessType.MIXED].includes(businessType)) {
      return { produce: 0.70, admin: 0.30 };
    }
    if (businessType === BusinessType.APPOINTMENT_SERVICES) {
      return { produce: 0.80, admin: 0.20 };
    }
    return defaults.defaultSplit;
  }

  if (name.includes('internet') || name.includes('celular') || name.includes('telefono') || name.includes('teléfono')) {
    return { produce: 0.20, admin: 0.80 };
  }

  // Fallback
  return defaults.defaultSplit;
}

// ========================================
// HELPERS DE VISIBILIDAD DE ROLES
// ========================================

/**
 * Retorna qué roles de paylabor deben mostrarse según el tipo de negocio
 * @param {string} businessType
 * @returns {{ DIRECT_SERVICE: boolean, PRODUCTION_SUPPORT: boolean, ADMIN_SUPPORT: boolean }}
 */
export function getVisiblePayLaborRoles(businessType) {
  switch (businessType) {
    case BusinessType.FOOD_PRODUCTION:
    case BusinessType.MACHINE_SERVICES:
    case BusinessType.MIXED:
      return {
        DIRECT_SERVICE: true,
        PRODUCTION_SUPPORT: true,
        ADMIN_SUPPORT: true,
      };
    case BusinessType.APPOINTMENT_SERVICES:
      return {
        DIRECT_SERVICE: true,
        PRODUCTION_SUPPORT: false,
        ADMIN_SUPPORT: true,
      };
    case BusinessType.RETAIL:
      return {
        DIRECT_SERVICE: false,
        PRODUCTION_SUPPORT: false,
        ADMIN_SUPPORT: true,
      };
    default:
      return {
        DIRECT_SERVICE: true,
        PRODUCTION_SUPPORT: true,
        ADMIN_SUPPORT: true,
      };
  }
}
