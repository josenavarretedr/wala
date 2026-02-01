/* eslint-disable */


const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { AI_CONFIG } = require('../Helpers/aiConfig');

/**
 * Cloud Function Callable para generar taxonomías base desde registroContable.json
 * Uso: Una sola vez para inicializar el sistema
 */
exports.generateInitialTaxonomies = functions
  .region('southamerica-east1')
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onCall(async (data, context) => {
    // Verificar autenticación (solo admins pueden ejecutar esto)
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Solo usuarios autenticados pueden ejecutar esta función'
      );
    }

    const { industry, sampleProducts } = data;

    if (!industry || !sampleProducts || !Array.isArray(sampleProducts)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Debes proporcionar industry y sampleProducts'
      );
    }

    try {
      console.log(`🚀 Generando taxonomía para industria: ${industry}`);
      console.log(`📊 Productos de muestra: ${sampleProducts.length}`);

      // Generar taxonomía usando Grok
      const taxonomy = await generateTaxonomyWithGrok(industry, sampleProducts);

      // Detectar marcas comunes
      const brands = detectCommonBrands(sampleProducts);

      // Guardar en Firestore
      const taxonomyRef = admin.firestore()
        .collection('wala_global')
        .doc('taxonomies')
        .collection(industry)
        .doc('main');

      await taxonomyRef.set({
        industry,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        version: '1.0',
        rules: [],
        brands,
        categories: taxonomy.categories,
        stats: {
          totalProducts: 0,
          totalBusinesses: 0,
          avgConfidence: 0,
          lastTrainingAt: null
        }
      });

      console.log(`✅ Taxonomía generada y guardada para ${industry}`);

      return {
        success: true,
        industry,
        categoriesCount: Object.keys(taxonomy.categories).length,
        brandsCount: brands.length,
        taxonomy
      };

    } catch (error) {
      console.error('❌ Error generando taxonomía:', error);
      throw new functions.https.HttpsError(
        'internal',
        `Error generando taxonomía: ${error.message}`
      );
    }
  });

/**
 * Genera taxonomía usando Grok
 */
async function generateTaxonomyWithGrok(industry, sampleProducts) {
  const fetch = (await import('node-fetch')).default;

  // Limitar productos para no exceder tokens
  const productsToAnalyze = sampleProducts.slice(0, 100);

  const systemPrompt = `Eres un experto en clasificación de productos de ${industry} en Perú.

Analiza esta lista de ${productsToAnalyze.length} productos:
${productsToAnalyze.join('\n')}

TAREA:
1. Identifica 5-10 categorías principales para ${industry}
2. Para cada categoría, identifica 2-5 subcategorías
3. Para cada subcategoría, identifica 0-3 sub-subcategorías (solo si es realmente necesario)
4. Usa nombres claros en español

FORMATO DE RESPUESTA (JSON):
{
  "categories": {
    "Categoría 1": {
      "Subcategoría 1A": ["Sub-sub 1", "Sub-sub 2"],
      "Subcategoría 1B": null
    },
    "Categoría 2": {
      "Subcategoría 2A": null
    }
  }
}

REGLAS:
- No más de 10 categorías principales
- Sub-subcategorías solo cuando sea realmente necesario
- Nombres descriptivos pero concisos
- null cuando no hay tercer nivel`;

  const payload = {
    model: AI_CONFIG.grok.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Genera la taxonomía en JSON' }
    ],
    temperature: 0.3,
    max_tokens: 2000
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
    throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;

  // Extraer JSON del contenido
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No se pudo extraer JSON de la respuesta de Grok');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Detecta marcas comunes en los productos
 */
function detectCommonBrands(products) {
  const brandCandidates = {};

  // Palabras comunes que no son marcas
  const stopWords = ['DE', 'LA', 'EL', 'LOS', 'LAS', 'DEL', 'CON', 'SIN', 'PARA', 'POR'];

  products.forEach(product => {
    const words = product.toUpperCase().split(/\s+/);
    words.forEach(word => {
      // Filtrar palabras muy cortas, números y stopwords
      if (word.length >= 3 && !/^\d+$/.test(word) && !stopWords.includes(word)) {
        brandCandidates[word] = (brandCandidates[word] || 0) + 1;
      }
    });
  });

  // Marcas son palabras que aparecen en al menos 5% de productos
  const threshold = Math.max(3, Math.floor(products.length * 0.05));

  const brands = Object.entries(brandCandidates)
    .filter(([_, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)  // Top 20 marcas
    .map(([brand, count]) => ({
      name: brand,
      occurrences: count
    }));

  return brands;
}
