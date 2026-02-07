/* eslint-disable */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {
  normalizeDescription,
  generateCacheKey,
  sanitizeForLLM
} = require('../Helpers/classificationUtils');
const { AI_CONFIG, CONFIDENCE_THRESHOLDS } = require('../Helpers/aiConfig');

// Inicializar admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function Trigger: onCreate en businesses/{businessId}/expenses/{expenseId}
 * Clasificar solo gastos tipo "overhead"
 */
exports.classifyExpenseOnCreate = functions
  .region('southamerica-east1')
  .firestore
  .document('businesses/{businessId}/expenses/{expenseId}')
  .onCreate(async (snap, context) => {
    const expense = snap.data();
    const { businessId, expenseId } = context.params;

    console.log(`🆕 Nuevo gasto creado: ${expense.description}`);
    console.log(`📋 Categoría: ${expense.category}`);

    try {
      // Solo clasificar gastos de tipo "overhead"
      if (expense.category !== 'overhead') {
        console.log(`⏭️ Gasto tipo "${expense.category}" - no requiere clasificación IA`);
        return null;
      }

      // ========================================
      // SKIP SI YA FUE CLASIFICADO LOCALMENTE
      // ========================================
      if (expense.classificationSource === 'local_rules') {
        console.log(`✅ Gasto ya clasificado localmente (source: local_rules)`);
        console.log(`   Subcategoría: ${expense.subcategory}`);
        console.log(`   Subsubcategoría: ${expense.subsubcategory || 'N/A'}`);
        console.log(`   Confianza: ${expense.classificationConfidence}`);
        return null;
      }

      // Solo procesar si está marcado para clasificación IA
      if (expense.classificationSource !== 'pending_ai' && !expense.subcategory) {
        console.log(`⏭️ Gasto no marcado para clasificación IA, esperando...`);
        return null;
      }

      // Verificar si ya tiene clasificación antigua
      if (expense.classification && expense.classification.category) {
        console.log(`✓ Gasto ya clasificado (formato antiguo)`);
        return null;
      }

      console.log(`🤖 Procediendo con clasificación IA para overhead...`);

      // Obtener información del negocio
      const businessDoc = await admin.firestore()
        .collection('businesses')
        .doc(businessId)
        .get();

      if (!businessDoc.exists) {
        console.error('❌ Negocio no encontrado');
        return null;
      }

      const business = businessDoc.data();
      const aiUsage = business.aiUsage || {};

      // Taxonomía de overhead (específica para gastos)
      const overheadTaxonomy = {
        categories: {
          "Servicios": {
            "Básicos": ["Agua", "Luz", "Internet", "Gas"],
            "Telecomunicaciones": ["Teléfono", "Cable", "Datos Móviles"]
          },
          "Administrativo": {
            "Transportes": ["Flete", "Delivery", "Taxi", "Combustible"],
            "Suministros": ["Papelería", "Limpieza", "Oficina"]
          },
          "Mantenimiento": {
            "Infraestructura": ["Reparaciones", "Pintura", "Electricidad"],
            "Equipos": ["Mantenimiento de Equipos", "Calibración"]
          },
          "Otros": {
            "Varios": null
          }
        }
      };

      // Clasificar con LLM
      const classification = await classifyOverheadWithLLM(
        expense.description,
        overheadTaxonomy,
        business.description || ''
      );

      if (classification && classification.confidence >= CONFIDENCE_THRESHOLDS.SUGGEST) {
        console.log(`✅ Gasto clasificado con IA: ${classification.category} > ${classification.subcategory}`);

        // Actualizar con estructura nueva (subcategory y subsubcategory directos)
        await snap.ref.update({
          subcategory: classification.category,
          subsubcategory: classification.subcategory || null,
          classificationSource: 'ai',
          classificationConfidence: classification.confidence,
          classificationModel: 'grok',
          classifiedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Incrementar contador de uso de LLM (compatible con emuladores)
        const currentLLMCalls = (aiUsage.llmCallsThisMonth || 0) + 1;
        await businessDoc.ref.update({
          'aiUsage.llmCallsThisMonth': currentLLMCalls,
          'aiUsage.lastUsedAt': new Date()
        });
      } else {
        console.log('⚠️ Confianza baja - marcando para revisión');

        await snap.ref.update({
          classification: {
            category: 'Sin Clasificar',
            subcategory: 'Pendiente de Revisión',
            subsubcategory: null,
            confidence: 0.0,
            source: 'manual_required',
            classifiedAt: admin.firestore.FieldValue.serverTimestamp(),
            needsReview: true
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return null;

    } catch (error) {
      console.error('❌ Error clasificando gasto:', error);
      return null;
    }
  });

/**
 * Clasificar overhead con LLM
 */
async function classifyOverheadWithLLM(description, taxonomy, businessContext) {
  const fetch = (await import('node-fetch')).default;

  const sanitized = sanitizeForLLM(description);

  const systemPrompt = `Eres un clasificador de gastos administrativos (overhead) para negocios en Perú.

TAXONOMÍA DE OVERHEAD:
${JSON.stringify(taxonomy.categories, null, 2)}

INSTRUCCIONES:
1. Clasifica el gasto en category > subcategory > subsubcategory (si aplica)
2. Asigna confidence (0-1)

Responde SOLO con JSON:
{
  "category": "...",
  "subcategory": "...",
  "subsubcategory": "..." | null,
  "confidence": 0.0-1.0
}`;

  const userPrompt = `Gasto: ${sanitized}
${businessContext ? `\nContexto del negocio: ${businessContext}` : ''}`;

  const payload = {
    model: AI_CONFIG.grok.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2,
    max_tokens: 300
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

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return null;
  }

  const classification = JSON.parse(jsonMatch[0]);

  return {
    category: classification.category,
    subcategory: classification.subcategory,
    subsubcategory: classification.subsubcategory,
    confidence: classification.confidence,
    source: 'llm'
  };
}
