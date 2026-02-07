/* eslint-disable */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { AI_CONFIG } = require('../Helpers/aiConfig');
const { sanitizeForLLM } = require('../Helpers/classificationUtils');

// Inicializar admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function Trigger: onCreate en businesses/{businessId}
 * Detecta industria automáticamente si industry === "otro"
 */
exports.onBusinessCreated = functions
  .region('southamerica-east1')
  .firestore
  .document('businesses/{businessId}')
  .onCreate(async (snap, context) => {
    const business = snap.data();
    const { businessId } = context.params;

    console.log(`🆕 Nuevo negocio creado: ${business.nombre || businessId}`);
    console.log(`📋 Industria inicial: ${business.industry}`);
    console.log(`📊 Tipo de negocio: ${business.businessType || 'no especificado'}`);

    try {
      // Si industry !== "otro", solo actualizar industryDetectedBy
      if (business.industry && business.industry !== 'otro') {
        await snap.ref.update({
          industryDetectedBy: 'manual',
          industryConfidence: 1.0
        });
        console.log(`✓ Industria manual confirmada: ${business.industry}`);
        return null;
      }

      // Si industry === "otro", esperar productos para detectar automáticamente
      console.log('⏳ Industria "otro" - esperando productos para detección automática...');

      // Esperar 30 segundos para que el usuario cree algunos productos
      await new Promise(resolve => setTimeout(resolve, 30000));

      // Obtener primeros productos del negocio
      const productsSnapshot = await admin.firestore()
        .collection(`businesses/${businessId}/products`)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      if (productsSnapshot.empty) {
        console.log('⚠️ No hay productos aún - industria quedará como "otro"');
        return null;
      }

      const products = productsSnapshot.docs.map(doc => doc.data().description);
      console.log(`📦 Productos encontrados: ${products.length}`);

      // Detectar industria con IA
      const detectedIndustry = await detectIndustryWithGrok(
        business.nombre || '',
        business.description || business.descripcion || '',
        products
      );

      if (detectedIndustry.industry !== 'otro') {
        await snap.ref.update({
          industry: detectedIndustry.industry,
          industryDetectedBy: 'ai',
          industryConfidence: detectedIndustry.confidence
        });

        console.log(`✅ Industria detectada por IA: ${detectedIndustry.industry} (${(detectedIndustry.confidence * 100).toFixed(0)}%)`);
      } else {
        console.log('⚠️ No se pudo detectar industria con confianza suficiente');
      }

      return null;

    } catch (error) {
      console.error('❌ Error en onBusinessCreated:', error);
      // No lanzar error para no bloquear la creación del negocio
      return null;
    }
  });

/**
 * Detecta industria usando Grok
 */
async function detectIndustryWithGrok(businessName, businessDescription, products) {
  const fetch = (await import('node-fetch')).default;

  const sanitizedName = sanitizeForLLM(businessName);
  const sanitizedDescription = sanitizeForLLM(businessDescription);
  const productList = products.slice(0, 20).map(p => sanitizeForLLM(p)).join('\n');

  const systemPrompt = `Eres un experto en clasificación de negocios en Perú.

Industrias disponibles:
- ferreteria: Ferreterías, materiales de construcción, herramientas
- reposteria: Reposterías, panaderías, pastelerías, insumos de repostería
- libreria: Librerías, papelerías, útiles escolares
- restaurante: Restaurantes, cafeterías, comida, delivery
- farmacia: Farmacias, boticas, productos de salud
- otro: Si no encaja en ninguna categoría anterior

TAREA:
Analiza el negocio y sus productos para determinar a qué industria pertenece.

Responde SOLO con JSON:
{
  "industry": "ferreteria" | "reposteria" | "libreria" | "restaurante" | "farmacia" | "otro",
  "confidence": 0.0-1.0,
  "reasoning": "breve explicación"
}`;

  const userPrompt = `Negocio: ${sanitizedName}
Descripción: ${sanitizedDescription}

Productos:
${productList}`;

  const payload = {
    model: AI_CONFIG.grok.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1,
    max_tokens: 200
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
    throw new Error(`Grok API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;

  // Extraer JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { industry: 'otro', confidence: 0, reasoning: 'No se pudo parsear respuesta' };
  }

  const detection = JSON.parse(jsonMatch[0]);

  // Validar que la industria sea válida
  const validIndustries = ['ferreteria', 'reposteria', 'libreria', 'restaurante', 'farmacia', 'otro'];
  if (!validIndustries.includes(detection.industry)) {
    detection.industry = 'otro';
    detection.confidence = 0;
  }

  return detection;
}
