/**
 * Motor de Clasificación Local para Gastos Overhead
 * Clasifica gastos indirectos usando regex matching basado en reglas predefinidas
 */

import { OVERHEAD_TAXONOMY } from '@/constants/overheadTaxonomy';

/**
 * Normaliza texto para matching:
 * - Convierte a minúsculas
 * - Remueve acentos
 * - Trim de espacios
 * 
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .trim();
};

/**
 * Intenta inferir subsubcategoría basándose en keywords adicionales
 * 
 * @param {string} normalizedDescription - Descripción normalizada
 * @param {string} category - Categoría asignada
 * @param {string} subcategory - Subcategoría asignada
 * @returns {string|null} Subsubcategoría inferida o null
 */
const inferSubsubcategory = (normalizedDescription, category, subcategory) => {
  try {
    const categoryData = OVERHEAD_TAXONOMY.categories[category];
    if (!categoryData || !categoryData[subcategory]) return null;

    const subsubcategories = categoryData[subcategory];
    if (!Array.isArray(subsubcategories)) return null;

    // Buscar la subsubcategoría que mejor coincida con la descripción
    for (const subsubcat of subsubcategories) {
      const normalizedSubsubcat = normalizeText(subsubcat);

      // Si la descripción contiene la subsubcategoría completa o palabras clave
      const keywords = normalizedSubsubcat.split(/[\s\/\-]+/);
      const matchCount = keywords.filter(keyword =>
        keyword.length > 3 && normalizedDescription.includes(keyword)
      ).length;

      // Si hay match de al menos 1 keyword significativo
      if (matchCount > 0) {
        return subsubcat;
      }
    }

    return null;
  } catch (error) {
    console.warn('⚠️ Error inferring subsubcategory:', error);
    return null;
  }
};

/**
 * Clasifica un gasto overhead usando el motor de reglas local
 * 
 * @param {string} description - Descripción del gasto
 * @returns {Object|null} Objeto de clasificación o null si no hay match
 * 
 * @example
 * const result = classifyOverhead("Pago de internet Movistar");
 * // Returns:
 * // {
 * //   category: "overhead",
 * //   subcategory: "Servicios Básicos",
 * //   subsubcategory: "Internet",
 * //   confidence: 0.85,
 * //   source: "local_rules",
 * //   matchedRule: "internet|teléfono|..."
 * // }
 */
export const classifyOverhead = (description) => {
  try {
    if (!description || typeof description !== 'string') {
      console.warn('⚠️ Invalid description for classification');
      return null;
    }

    const normalizedDescription = normalizeText(description);
    console.log('🔍 Clasificando overhead:', normalizedDescription);

    // Iterar sobre las reglas en orden
    for (const rule of OVERHEAD_TAXONOMY.rules) {
      try {
        // Crear RegExp con la regla (case insensitive)
        const regex = new RegExp(rule.match, 'i');

        // Ejecutar regex contra descripción normalizada
        if (regex.test(normalizedDescription)) {
          console.log(`✅ Match encontrado con regla: ${rule.match}`);

          // Asignar subcategoría directamente desde la regla
          // rule.category → expense.subcategory (ej: "Servicios Básicos")
          // rule.subcategory → expense.subsubcategory (ej: "Servicios Públicos")
          const classification = {
            category: "overhead",
            subcategory: rule.category,
            subsubcategory: rule.subcategory, // Usar directamente de la regla
            confidence: 0.85, // Confidence estándar para matches locales
            source: "local_rules",
            matchedRule: rule.match,
            classifiedAt: new Date().toISOString()
          };

          console.log('📊 Clasificación generada:', {
            subcategory: classification.subcategory,
            subsubcategory: classification.subsubcategory,
            confidence: classification.confidence
          });

          return classification;
        }
      } catch (regexError) {
        console.warn(`⚠️ Error en regex de regla "${rule.match}":`, regexError);
        continue; // Continuar con la siguiente regla
      }
    }

    // No se encontró match
    console.log('❌ No se encontró match en reglas locales');
    return null;

  } catch (error) {
    console.error('❌ Error en classifyOverhead:', error);
    return null;
  }
};

/**
 * Verifica si una descripción matchea con alguna regla
 * Útil para validaciones rápidas
 * 
 * @param {string} description - Descripción a verificar
 * @returns {boolean} true si hay match, false si no
 */
export const hasOverheadMatch = (description) => {
  const result = classifyOverhead(description);
  return result !== null;
};

/**
 * Obtiene todas las posibles matches para una descripción
 * Útil para debugging o sugerencias múltiples
 * 
 * @param {string} description - Descripción del gasto
 * @returns {Array} Array de clasificaciones posibles
 */
export const getAllPossibleMatches = (description) => {
  try {
    if (!description || typeof description !== 'string') return [];

    const normalizedDescription = normalizeText(description);
    const matches = [];

    for (const rule of OVERHEAD_TAXONOMY.rules) {
      try {
        const regex = new RegExp(rule.match, 'i');

        if (regex.test(normalizedDescription)) {
          const subsubcategory = inferSubsubcategory(
            normalizedDescription,
            rule.category,
            rule.subcategory
          );

          matches.push({
            category: "overhead",
            subcategory: rule.category,
            subsubcategory: subsubcategory,
            confidence: 0.85,
            source: "local_rules",
            matchedRule: rule.match
          });
        }
      } catch (error) {
        continue;
      }
    }

    return matches;
  } catch (error) {
    console.error('❌ Error getting all matches:', error);
    return [];
  }
};

/**
 * Obtiene estadísticas de la taxonomía
 * 
 * @returns {Object} Estadísticas
 */
export const getClassifierStats = () => {
  return {
    totalRules: OVERHEAD_TAXONOMY.rules.length,
    totalCategories: Object.keys(OVERHEAD_TAXONOMY.categories).length,
    totalBrands: OVERHEAD_TAXONOMY.brands.length,
    version: OVERHEAD_TAXONOMY.version
  };
};
