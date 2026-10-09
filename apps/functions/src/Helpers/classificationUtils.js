/* eslint-disable */

const crypto = require('crypto');

/**
 * Normaliza una descripción para matching consistente
 * @param {string} description - Descripción a normalizar
 * @returns {string} Descripción normalizada
 */
function normalizeDescription(description) {
  if (!description) return '';

  return description
    .toString()
    .toUpperCase()
    .trim()
    // Remover tildes
    .replace(/[ÁÀÄÂ]/g, 'A')
    .replace(/[ÉÈËÊ]/g, 'E')
    .replace(/[ÍÌÏÎ]/g, 'I')
    .replace(/[ÓÒÖÔ]/g, 'O')
    .replace(/[ÚÙÜÛ]/g, 'U')
    .replace(/Ñ/g, 'N')
    // Remover caracteres especiales excepto espacios y números
    .replace(/[^A-Z0-9\s]/g, ' ')
    // Normalizar espacios múltiples
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Genera un hash único para caché de clasificaciones
 * @param {string} industry - Industria del negocio
 * @param {string} description - Descripción del producto
 * @returns {string} Hash SHA256
 */
function generateCacheKey(industry, description) {
  const normalized = normalizeDescription(description);
  const input = `${industry}:${normalized}`;
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Sanitiza una descripción antes de enviarla a LLM
 * Remueve información sensible
 * @param {string} description - Descripción a sanitizar
 * @returns {string} Descripción sanitizada
 */
function sanitizeForLLM(description) {
  if (!description) return '';

  let sanitized = description.toString().trim();

  // Remover patrones de información sensible
  sanitized = sanitized
    // Nombres de clientes/proveedores
    .replace(/cliente:\s*\w+/gi, '')
    .replace(/proveedor:\s*\w+/gi, '')
    .replace(/para\s+\w+\s+\w+/gi, '') // "para Juan Pérez"

    // Números de teléfono (Perú: 9 dígitos)
    .replace(/\d{9}/g, '')
    .replace(/\+51\s*\d{9}/g, '')

    // Correos electrónicos
    .replace(/[\w.-]+@[\w.-]+\.\w+/gi, '')

    // Direcciones (patrones comunes)
    .replace(/av\.\s+\w+/gi, '')
    .replace(/jr\.\s+\w+/gi, '')
    .replace(/calle\s+\w+/gi, '')

    // Normalizar espacios
    .replace(/\s+/g, ' ')
    .trim();

  return sanitized;
}

/**
 * Detecta marca en la descripción del producto
 * @param {string} description - Descripción del producto
 * @param {Array<string>} knownBrands - Lista de marcas conocidas
 * @returns {Object} { brand: string|null, confidence: number }
 */
function detectBrand(description, knownBrands = []) {
  if (!description || !knownBrands.length) {
    return { brand: null, confidence: 0 };
  }

  const normalized = normalizeDescription(description);

  for (const brand of knownBrands) {
    const brandNormalized = normalizeDescription(brand);
    if (normalized.includes(brandNormalized)) {
      return { brand: brand.toUpperCase(), confidence: 0.95 };
    }
  }

  return { brand: null, confidence: 0 };
}

/**
 * Detecta presentación en la descripción (ej: "x3", "4 GL")
 * @param {string} description - Descripción del producto
 * @returns {Object} { presentation: string|null, confidence: number }
 */
function detectPresentation(description) {
  if (!description) {
    return { presentation: null, confidence: 0 };
  }

  const patterns = [
    /X\s*(\d+)/i,                    // "X3", "x 3"
    /(\d+)\s*X/i,                    // "3X", "3 x"
    /(\d+)\s*(GL|L|LT|KG|GR|MT|M)/i  // "4 GL", "2KG", "1 MT"
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return {
        presentation: match[0].trim().toUpperCase(),
        confidence: 0.9
      };
    }
  }

  return { presentation: null, confidence: 0 };
}

/**
 * Valida que la clasificación tenga la estructura correcta
 * @param {Object} classification - Clasificación a validar
 * @returns {boolean} true si es válida
 */
function isValidClassification(classification) {
  if (!classification || typeof classification !== 'object') {
    return false;
  }

  // Al menos debe tener category
  if (!classification.category || classification.category.trim() === '') {
    return false;
  }

  // Confidence debe ser un número entre 0 y 1
  if (typeof classification.confidence !== 'number' ||
    classification.confidence < 0 ||
    classification.confidence > 1) {
    return false;
  }

  // Source debe ser válido
  const validSources = ['rules', 'embeddings', 'llm', 'manual'];
  if (!validSources.includes(classification.source)) {
    return false;
  }

  return true;
}

/**
 * Calcula similitud entre dos strings con soporte para plurales/singulares
 * @param {string} str1 - Primer string (descripción del producto)
 * @param {string} str2 - Segundo string (término de taxonomía)
 * @returns {number} Similitud de 0 a 1
 */
function calculateSimilarity(str1, str2) {
  const s1 = normalizeDescription(str1);
  const s2 = normalizeDescription(str2);

  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0;

  // 🎯 PASO 1: Coincidencia exacta de substring (PRIORITARIO)
  // Si uno contiene al otro completamente, es una coincidencia fuerte
  if (s1.includes(s2)) {
    // Cuánto del string total representa el match
    const coverage = s2.length / s1.length;
    // Si el término de taxonomía cubre al menos 60% de la descripción, es muy fuerte
    return Math.max(0.85, coverage);
  }

  if (s2.includes(s1)) {
    const coverage = s1.length / s2.length;
    return Math.max(0.85, coverage);
  }

  // 🎯 PASO 2: Coincidencia de todas las palabras importantes
  // Filtrar palabras comunes y cortas (stopwords)
  const stopwords = ['DE', 'DEL', 'LA', 'EL', 'LOS', 'LAS', 'Y', 'O', 'UN', 'UNA'];
  const words1 = s1.split(/\s+/).filter(w => w.length > 2 && !stopwords.includes(w));
  const words2 = s2.split(/\s+/).filter(w => w.length > 2 && !stopwords.includes(w));

  if (words1.length === 0 || words2.length === 0) return 0;

  // Contar cuántas palabras importantes coinciden
  let matchedWords = 0;
  const totalWords = Math.min(words1.length, words2.length);

  for (const word1 of words1) {
    for (const word2 of words2) {
      let wordScore = 0;

      // Coincidencia exacta
      if (word1 === word2) {
        wordScore = 1.0;
      }
      // Coincidencia de substring (ej: "CLAVO" en "CLAVOS")
      else if (word1.includes(word2) || word2.includes(word1)) {
        const longer = word1.length > word2.length ? word1 : word2;
        const shorter = word1.length > word2.length ? word2 : word1;
        wordScore = shorter.length / longer.length;
      }
      // Detectar singular/plural (español: -S, -ES)
      else {
        const stem1 = word1.replace(/ES$|S$/, '');
        const stem2 = word2.replace(/ES$|S$/, '');

        if (stem1 === stem2 && stem1.length >= 3) {
          wordScore = 0.95; // Alta similitud para singular/plural
        }
        // Raíces muy similares (al menos 4 caracteres en común)
        else if (stem1.length >= 4 && stem2.length >= 4) {
          if (stem1.startsWith(stem2.substring(0, 4)) ||
            stem2.startsWith(stem1.substring(0, 4))) {
            wordScore = 0.8;
          }
        }
      }

      if (wordScore >= 0.8) {
        matchedWords++;
        break; // Ya encontramos match para esta palabra, pasar a la siguiente
      }
    }
  }

  // Porcentaje de palabras que coinciden
  const matchRatio = matchedWords / totalWords;

  // Si todas las palabras importantes coinciden, es un match muy fuerte
  if (matchRatio === 1.0) return 0.95;

  // Si al menos 2/3 de las palabras coinciden, es un buen match
  if (matchRatio >= 0.67) return 0.8;

  // Si al menos la mitad coincide, es aceptable
  if (matchRatio >= 0.5) return 0.7;

  // Retornar el ratio ajustado
  return matchRatio * 0.7;
}

/**
 * Busca coincidencias en la taxonomía local con matching flexible
 * @param {string} description - Descripción del producto
 * @param {Object} taxonomy - Taxonomía del negocio
 * @param {number} threshold - Umbral de similitud (por defecto 0.75)
 * @returns {Object|null} Clasificación encontrada o null
 */
function searchInTaxonomy(description, taxonomy, threshold = 0.75) {
  if (!description || !taxonomy || !taxonomy.categories) {
    return null;
  }

  const normalized = normalizeDescription(description);

  let bestMatch = null;
  let bestScore = 0;

  console.log(`🔍 Buscando "${description}" (normalizado: "${normalized}") en taxonomía...`);
  console.log(`📊 Umbral de similitud: ${(threshold * 100).toFixed(0)}%`);

  // Buscar en categorías, subcategorías y subsubcategorías
  for (const [category, subcategories] of Object.entries(taxonomy.categories)) {
    if (!subcategories) continue;

    // Buscar en subcategorías
    for (const [subcategory, subsubcategories] of Object.entries(subcategories)) {
      // Coincidencia en subcategoría
      const subcatScore = calculateSimilarity(description, subcategory);

      if (subcatScore >= 0.5) { // Log todas las coincidencias mayores al 50%
        const normalizedSubcat = normalizeDescription(subcategory);
        console.log(`   🔎 "${subcategory}" (norm: "${normalizedSubcat}") → ${(subcatScore * 100).toFixed(1)}%`);
      }

      if (subcatScore > bestScore && subcatScore >= threshold) {
        bestScore = subcatScore;
        bestMatch = {
          category,
          subcategory,
          subsubcategory: null,
          confidence: subcatScore,
          source: 'local_match',
          matchedTerm: subcategory
        };
      }

      // Buscar en subsubcategorías si existen
      if (Array.isArray(subsubcategories)) {
        for (const subsubcategory of subsubcategories) {
          const subsubScore = calculateSimilarity(description, subsubcategory);

          if (subsubScore >= 0.5) { // Log todas las coincidencias mayores al 50%
            const normalizedSubsubcat = normalizeDescription(subsubcategory);
            console.log(`      🔎 "${subsubcategory}" (norm: "${normalizedSubsubcat}") → ${(subsubScore * 100).toFixed(1)}%`);
          }

          if (subsubScore > bestScore && subsubScore >= threshold) {
            bestScore = subsubScore;
            bestMatch = {
              category,
              subcategory,
              subsubcategory,
              confidence: subsubScore,
              source: 'local_match',
              matchedTerm: subsubcategory
            };
          }
        }
      }
    }
  }

  if (bestMatch) {
    console.log(`✅ MATCH ENCONTRADO: "${bestMatch.matchedTerm}" en ${bestMatch.category} › ${bestMatch.subcategory}${bestMatch.subsubcategory ? ' › ' + bestMatch.subsubcategory : ''} (${(bestScore * 100).toFixed(1)}%)`);
  } else {
    console.log(`❌ Sin coincidencias >= ${(threshold * 100).toFixed(0)}%`);
  }

  return bestMatch;
}

module.exports = {
  normalizeDescription,
  generateCacheKey,
  sanitizeForLLM,
  detectBrand,
  detectPresentation,
  isValidClassification,
  calculateSimilarity,
  searchInTaxonomy
};
