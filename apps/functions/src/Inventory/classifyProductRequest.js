/* eslint-disable */


const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { AI_CONFIG } = require('../Helpers/aiConfig');
const {
  sanitizeForLLM,
  searchInTaxonomy,
  detectBrand,
  detectPresentation
} = require('../Helpers/classificationUtils');

// Inicializar admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function Callable: Clasificación manual desde ProductForm.vue
 * El usuario presiona el botón "Clasificar con IA" y esta función retorna la sugerencia
 */
exports.classifyProductRequest = functions
  .region('southamerica-east1')
  .runWith({ timeoutSeconds: 60, memory: '256MB' })
  .https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Debes estar autenticado para usar esta función'
      );
    }

    const { description, type, businessId } = data;

    if (!description || !businessId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Debes proporcionar description y businessId'
      );
    }

    try {
      console.log(`🔍 Solicitud de clasificación manual para: ${description}`);

      // Obtener información del negocio
      const businessDoc = await admin.firestore()
        .collection('businesses')
        .doc(businessId)
        .get();

      if (!businessDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Negocio no encontrado'
        );
      }

      const business = businessDoc.data();
      const industry = business.industry || 'otro';

      // Verificar límites de IA
      const aiUsage = business.aiUsage || {};
      const plan = aiUsage.plan || 'free';
      const llmCallsThisMonth = aiUsage.llmCallsThisMonth || 0;

      const limits = {
        free: { maxLLMCallsPerDay: 50 },
        premium: { maxLLMCallsPerDay: 200 }
      };

      if (llmCallsThisMonth >= limits[plan].maxLLMCallsPerDay) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          `Has alcanzado el límite de clasificaciones con IA para tu plan ${plan}. Actualiza tu plan para continuar.`
        );
      }

      // Cargar taxonomía
      const taxonomyDoc = await admin.firestore()
        .collection('wala_global')
        .doc('taxonomies')
        .collection(industry)
        .doc('main')
        .get();

      if (!taxonomyDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          `No se encontró taxonomía para la industria ${industry}`
        );
      }

      const taxonomy = taxonomyDoc.data();

      // 🎯 PASO 1: Buscar en RULES LOCALES del negocio (más específicas)
      console.log('🏪 Cargando taxonomía LOCAL del negocio...');
      const localTaxonomyDoc = await admin.firestore()
        .collection('businesses')
        .doc(businessId)
        .collection('settings')
        .doc('taxonomies')
        .get();

      if (localTaxonomyDoc.exists) {
        const localTaxonomy = localTaxonomyDoc.data();

        console.log(`🔍 Buscando en RULES LOCALES (${localTaxonomy.rules ? localTaxonomy.rules.length : 0} disponibles)...`);

        if (localTaxonomy.rules && localTaxonomy.rules.length > 0) {
          for (let i = 0; i < localTaxonomy.rules.length; i++) {
            const rule = localTaxonomy.rules[i];
            try {
              const regex = new RegExp(rule.match, 'i');

              if (regex.test(description)) {
                console.log(`✅ RULE LOCAL MATCH: "${rule.match}" → ${rule.category} > ${rule.subcategory}`);

                // Incrementar contador de uso
                rule.timesUsed = (rule.timesUsed || 0) + 1;
                await localTaxonomyDoc.ref.update({ rules: localTaxonomy.rules });

                // Retornar clasificación desde la regla local
                const classification = {
                  category: rule.category,
                  subcategory: rule.subcategory,
                  subsubcategory: rule.subsubcategory || null,
                  brand: rule.brand || null,
                  presentation: rule.presentation || null,
                  tags: [
                    rule.category?.toLowerCase(),
                    rule.subcategory?.toLowerCase()
                  ].filter(Boolean),
                  confidence: rule.confidence || 0.9,
                  source: 'local_rules',
                  matchedRule: rule.match
                };

                console.log(`✅ Clasificación por RULE LOCAL (${(classification.confidence * 100).toFixed(0)}%)`);
                return classification;
              }
            } catch (error) {
              console.error(`⚠️ Error evaluando rule local: ${rule.match}`, error);
            }
          }
          console.log('❌ Sin coincidencias en rules locales');
        }

        // 🎯 PASO 2: Buscar en CATEGORÍAS LOCALES
        console.log('🔍 Buscando en CATEGORÍAS LOCALES...');

        if (localTaxonomy.customCategories && localTaxonomy.customCategories.length > 0) {
          console.log(`📊 Taxonomía local encontrada con ${localTaxonomy.customCategories.length} categorías personalizadas`);

          // Convertir customCategories a formato compatible con searchInTaxonomy
          const localTaxonomyFormatted = {};
          localTaxonomy.customCategories.forEach(cat => {
            if (!localTaxonomyFormatted[cat.category]) {
              localTaxonomyFormatted[cat.category] = {};
            }
            if (cat.subcategory) {
              localTaxonomyFormatted[cat.category][cat.subcategory] = cat.items || [];
            }
          });

          const localMatch = searchInTaxonomy(description, { categories: localTaxonomyFormatted }, 0.75);

          if (localMatch) {
            console.log(`✅ Coincidencia LOCAL encontrada (${(localMatch.confidence * 100).toFixed(0)}%): ${localMatch.matchedTerm}`);

            const classification = {
              ...localMatch,
              brand: null,
              presentation: null,
              tags: [
                localMatch.category.toLowerCase(),
                localMatch.subcategory.toLowerCase()
              ].filter(Boolean)
            };

            console.log(`✅ Clasificación local: ${classification.category} > ${classification.subcategory}`);
            return classification;
          }

          console.log('❌ Sin coincidencias >= 75% en categorías locales');
        }
      }

      // 🎯 PASO 3: Buscar en RULES GLOBALES
      console.log(`🔍 Buscando en RULES GLOBALES (${taxonomy.rules ? taxonomy.rules.length : 0} disponibles)...`);

      if (taxonomy.rules && taxonomy.rules.length > 0) {
        for (let i = 0; i < taxonomy.rules.length; i++) {
          const rule = taxonomy.rules[i];
          try {
            const regex = new RegExp(rule.match, 'i');

            if (regex.test(description)) {
              console.log(`✅ RULE GLOBAL MATCH: "${rule.match}" → ${rule.category} > ${rule.subcategory}`);

              // Incrementar contador de uso
              rule.timesUsed = (rule.timesUsed || 0) + 1;
              await taxonomyDoc.ref.update({ rules: taxonomy.rules });

              // Retornar clasificación desde la regla
              const classification = {
                category: rule.category,
                subcategory: rule.subcategory,
                subsubcategory: rule.subsubcategory || null,
                brand: rule.brand || null,
                presentation: rule.presentation || null,
                tags: [
                  rule.category?.toLowerCase(),
                  rule.subcategory?.toLowerCase()
                ].filter(Boolean),
                confidence: rule.confidence || 0.95,
                source: 'global_rules',
                matchedRule: rule.match
              };

              console.log(`✅ Clasificación por RULE GLOBAL (${(classification.confidence * 100).toFixed(0)}%)`);
              return classification;
            }
          } catch (error) {
            console.error(`⚠️ Error evaluando regla global: ${rule.match}`, error);
          }
        }
        console.log('❌ Sin coincidencias en rules globales');
      }

      // 🎯 PASO 4: Buscar en CATEGORÍAS GLOBALES
      console.log('🔍 Buscando en CATEGORÍAS GLOBALES...');
      const globalMatch = searchInTaxonomy(description, taxonomy, 0.75);

      if (globalMatch) {
        console.log(`✅ Coincidencia GLOBAL encontrada (${(globalMatch.confidence * 100).toFixed(0)}%): ${globalMatch.matchedTerm}`);

        // Detectar marca y presentación
        const brands = (taxonomy.brands || []).map(b => b.name || b);
        const brandDetection = detectBrand(description, brands);
        const presentationDetection = detectPresentation(description);

        const classification = {
          ...globalMatch,
          brand: brandDetection.brand,
          presentation: presentationDetection.presentation,
          tags: [
            globalMatch.category.toLowerCase(),
            globalMatch.subcategory.toLowerCase()
          ].filter(Boolean)
        };

        // Actualizar estadísticas de taxonomía (match global)
        await updateTaxonomyStats(taxonomyDoc.ref, classification, 'local_match');

        console.log(`✅ Clasificación global: ${classification.category} > ${classification.subcategory} (${(classification.confidence * 100).toFixed(0)}%)`);
        return classification;
      }

      console.log('❌ Sin coincidencias >= 75% en categorías globales');
      console.log('⚠️ Sin coincidencia en taxonomías - usando IA...');

      // 🤖 PASO 5: Clasificar con Grok (solo si no hay match)
      const classification = await classifyWithGrok(
        description,
        industry,
        taxonomy,
        business.description || business.descripcion || ''
      );

      // Incrementar contador de uso de LLM (compatible con emuladores)
      const currentLLMCalls = (aiUsage.llmCallsThisMonth || 0) + 1;
      await businessDoc.ref.update({
        'aiUsage.llmCallsThisMonth': currentLLMCalls,
        'aiUsage.lastUsedAt': new Date()
      });

      // Actualizar estadísticas de taxonomía (LLM usado)
      await updateTaxonomyStats(taxonomyDoc.ref, classification, 'llm_used');

      console.log(`✅ Clasificación con IA: ${classification.category} > ${classification.subcategory}`);

      return classification;

    } catch (error) {
      console.error('❌ Error en classifyProductRequest:', error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        `Error clasificando producto: ${error.message}`
      );
    }
  });

/**
 * Clasificar usando Grok
 */
async function classifyWithGrok(description, industry, taxonomy, businessContext) {
  const fetch = (await import('node-fetch')).default;

  const sanitized = sanitizeForLLM(description);
  const brands = (taxonomy.brands || []).map(b => b.name || b).join(', ');

  const systemPrompt = `Eres un clasificador de productos para ${industry} en Perú.

TAXONOMÍA DISPONIBLE:
${JSON.stringify(taxonomy.categories, null, 2)}

MARCAS COMUNES:
${brands || 'No disponible'}

INSTRUCCIONES:
1. Clasifica el producto en category > subcategory > subsubcategory
2. Detecta la marca si existe (o null si es genérico)
3. Detecta presentación (ej: "x3", "4 GL") o null
4. Genera 3-5 tags descriptivos en minúsculas
5. Asigna confidence (0-1):
   - 0.9-1.0: Muy seguro
   - 0.7-0.89: Probable
   - <0.7: Inseguro

REGLAS:
- SOLO usa categorías que existen en la taxonomía
- Si no estás seguro, devuelve confidence < 0.7
- Respeta la estructura jerárquica

Responde SOLO con JSON válido:
{
  "category": "...",
  "subcategory": "...",
  "subsubcategory": "..." | null,
  "brand": "..." | null,
  "presentation": "..." | null,
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.0-1.0
}`;

  const userPrompt = `Producto: ${sanitized}
${businessContext ? `\nContexto del negocio: ${businessContext}` : ''}`;

  const payload = {
    model: AI_CONFIG.grok.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2,
    max_tokens: 500
  };

  const response = await fetch(AI_CONFIG.grok.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.grok.apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No se pudo extraer JSON de la respuesta de Grok');
  }

  const classification = JSON.parse(jsonMatch[0]);

  return {
    category: classification.category || 'Sin Clasificar',
    subcategory: classification.subcategory || 'Pendiente de Revisión',
    subsubcategory: classification.subsubcategory || null,
    brand: classification.brand || null,
    presentation: classification.presentation || null,
    tags: classification.tags || [],
    confidence: classification.confidence || 0.0,
    source: 'llm',
    model: AI_CONFIG.grok.model
  };
}

/**
 * Actualiza estadísticas de la taxonomía
 * @param {Object} taxonomyRef - Referencia al documento de taxonomía
 * @param {Object} classification - Clasificación aplicada
 * @param {string} method - Método usado: 'local_match' o 'llm_used'
 */
async function updateTaxonomyStats(taxonomyRef, classification, method) {
  try {
    const taxonomyDoc = await taxonomyRef.get();
    const taxonomy = taxonomyDoc.data();
    const stats = taxonomy.stats || {};

    // Actualizar contadores
    const updatedStats = {
      totalProducts: (stats.totalProducts || 0) + 1,
      localMatches: (stats.localMatches || 0) + (method === 'local_match' ? 1 : 0),
      llmCalls: (stats.llmCalls || 0) + (method === 'llm_used' ? 1 : 0),
      avgConfidence: calculateRunningAverage(
        stats.avgConfidence || 0,
        stats.totalProducts || 0,
        classification.confidence
      ),
      lastUsedAt: new Date()
    };

    await taxonomyRef.update({
      stats: updatedStats
    });

    console.log(`📊 Stats actualizadas - Método: ${method}, Total productos: ${updatedStats.totalProducts}`);
  } catch (error) {
    console.error('⚠️ Error actualizando stats de taxonomía:', error.message);
    // No lanzar error - es solo logging
  }
}

/**
 * Calcula promedio móvil
 */
function calculateRunningAverage(currentAvg, count, newValue) {
  if (count === 0) return newValue;
  return ((currentAvg * count) + newValue) / (count + 1);
}
