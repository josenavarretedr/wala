import { OpenAI } from 'openai';

// Configuración de Grok (usando OpenAI SDK con base URL personalizada)
const GROK_CONFIG = {
  apiKey: import.meta.env.VITE_XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
  model: import.meta.env.VITE_GROK_MODEL || 'grok-3-mini'
};

/**
 * Lee el prompt maestro desde el archivo
 * @returns {Promise<string>}
 */
async function getPromptMaestro() {
  try {
    const response = await fetch('/src/assets/guiones/promptGuion.md');
    return await response.text();
  } catch (error) {
    console.error('❌ Error al cargar prompt maestro:', error);
    throw new Error('No se pudo cargar el prompt maestro');
  }
}

/**
 * PASO 1: Usuario envía tema y configuración inicial
 * PASO 2: IA responde con preguntas de aclaración
 * 
 * @param {Object} initialData - { tema, sectores, total_videos, distribucion }
 * @returns {Promise<Object>} - { preguntas: string[], contexto: Object }
 */
export async function generarPreguntasAclaracion(initialData) {
  try {
    const promptMaestro = await getPromptMaestro();

    const client = new OpenAI({
      apiKey: GROK_CONFIG.apiKey,
      baseURL: GROK_CONFIG.baseURL,
      dangerouslyAllowBrowser: true // Solo para desarrollo, en producción usar Cloud Function
    });

    const prompt = `${promptMaestro}

# INSTRUCCIÓN ACTUAL: PASO 02 - GENERAR PREGUNTAS DE ACLARACIÓN

El usuario quiere generar guiones con esta información inicial:

**Tema:** ${initialData.tema}
**Sectores:** ${Array.isArray(initialData.sectores) ? initialData.sectores.join(', ') : initialData.sectores}
**Total de videos:** ${initialData.total_videos}
**Distribución Voz A/Voz B:** ${initialData.distribucion?.voz_a || 'automático'} / ${initialData.distribucion?.voz_b || 'automático'}

Según el PASO 02 del proceso (líneas 1007-1077 del prompt maestro), genera las preguntas de aclaración necesarias para generar guiones de calidad.

**RESPONDE EN FORMATO JSON:**
{
  "preguntas": [
    "¿Pregunta 1?",
    "¿Pregunta 2?",
    "..."
  ],
  "contexto_detectado": {
    "subtemas_sugeridos": ["subtema1", "subtema2"],
    "estructuras_recomendadas": ["Estructura 1", "Estructura 2"]
  }
}`;

    const response = await client.chat.completions.create({
      model: GROK_CONFIG.model,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const content = response.choices?.[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    console.log('✅ Preguntas de aclaración generadas:', result);
    return result;
  } catch (error) {
    console.error('❌ Error al generar preguntas:', error);
    throw error;
  }
}

/**
 * PASO 3: Usuario responde preguntas
 * PASO 4: IA genera JSON completo con guiones
 * 
 * @param {Object} fullContext - { datosIniciales, respuestas }
 * @returns {Promise<Object>} - JSON completo estilo ordenRegistro.json
 */
export async function generarGuionesCompletos(fullContext) {
  try {
    const promptMaestro = await getPromptMaestro();

    const client = new OpenAI({
      apiKey: GROK_CONFIG.apiKey,
      baseURL: GROK_CONFIG.baseURL,
      dangerouslyAllowBrowser: true
    });

    // Construir el prompt con toda la información
    const prompt = `${promptMaestro}

# INSTRUCCIÓN ACTUAL: PASO 04 - GENERAR GUIONES COMPLETOS

## INFORMACIÓN INICIAL DEL USUARIO:
**Tema:** ${fullContext.datosIniciales.tema}
**Sectores:** ${Array.isArray(fullContext.datosIniciales.sectores) ? fullContext.datosIniciales.sectores.join(', ') : fullContext.datosIniciales.sectores}
**Total de videos:** ${fullContext.datosIniciales.total_videos}
**Distribución Voz A/Voz B:** ${fullContext.datosIniciales.distribucion?.voz_a || 'automático'} / ${fullContext.datosIniciales.distribucion?.voz_b || 'automático'}

## RESPUESTAS A PREGUNTAS DE ACLARACIÓN:
${fullContext.respuestas.map((r, i) => `${i + 1}. ${r.pregunta}\n   Respuesta: ${r.respuesta}`).join('\n\n')}

---

Ahora genera el JSON COMPLETO siguiendo EXACTAMENTE la estructura de los ejemplos proporcionados (ordenRegistro.json, guiones_flujo_caja.json, comprasRegistros.json).

**REQUISITOS CRÍTICOS:**
1. Incluir "meta_analisis" con tema, sector/sectores, estrategia_aplicada, propuesta_valor_central
2. Incluir "generacion" con tema, fase_funnel, total_videos, distribucion, estrategia_storytelling
3. Array "videos" con TODOS los videos solicitados (${fullContext.datosIniciales.total_videos} videos)
4. Cada video DEBE tener:
   - numero, voz, estructura_usada, razon_estructura
   - propuesta_valor_enfocada, duracion_estimada, subtema, sector_ejemplo
   - hooks (con texto_visible, visual, audio_trending, estrategia_hook)
   - micro_hooks (array con numero, timestamp, categoria, texto, objetivo)
   - storytelling_causal (validacion, palabras_causales_usadas, flujo)
   - guion_completo (con hook, microhook_1, desarrollo_1, microhook_2, desarrollo_2, microhook_3, micro_accion, cierre)
   - micro_accion (descripcion, tiempo_estimado, nivel_esfuerzo, objetivo_psicologico, mencion_wala, funcionalidad_wala_relacionada, validacion)
   - caption
   - notas_produccion (locacion_sugerida, props_necesarios, tono_voz, momento_del_dia)
   - metricas_esperadas (objetivo_principal, tipo_interaccion, audiencia_target, retencion_esperada)

**IMPORTANTE:** 
- Usa storytelling causal (PERO, POR LO TANTO, ENTONCES, POR ESO)
- Micro-hooks cada 10-15 segundos
- CTAs indirectos para Voz A, directos pero suaves para Voz B
- Menciona WALA de forma natural en Voz A, directo en Voz B

Genera el JSON completo ahora.`;

    const response = await client.chat.completions.create({
      model: GROK_CONFIG.model,
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 8000 // Guiones completos requieren más tokens
    });

    const content = response.choices?.[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    console.log('✅ Guiones completos generados:', result);
    return result;
  } catch (error) {
    console.error('❌ Error al generar guiones completos:', error);
    throw error;
  }
}

/**
 * Valida que el JSON generado tenga la estructura correcta
 * @param {Object} json
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validarEstructuraGuion(json) {
  const errors = [];

  if (!json.meta_analisis) errors.push('Falta "meta_analisis"');
  if (!json.generacion) errors.push('Falta "generacion"');
  if (!json.videos || !Array.isArray(json.videos)) {
    errors.push('Falta "videos" o no es un array');
  } else {
    json.videos.forEach((video, idx) => {
      if (!video.hooks) errors.push(`Video ${idx + 1}: falta "hooks"`);
      if (!video.guion_completo) errors.push(`Video ${idx + 1}: falta "guion_completo"`);
      if (!video.caption) errors.push(`Video ${idx + 1}: falta "caption"`);
      if (!video.notas_produccion) errors.push(`Video ${idx + 1}: falta "notas_produccion"`);
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
