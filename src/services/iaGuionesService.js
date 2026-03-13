import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebaseInit';

// Proxy Cloud Function para llamadas a Grok (evita CORS)
const grokProxy = httpsCallable(functions, 'grokProxy');

// Instancia con timeout extendido para generaciones largas (5 minutos)
const grokProxyExtended = httpsCallable(functions, 'grokProxy', { timeout: 300000 });

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
 * Serializa los datos iniciales del usuario (flujo híbrido simplificado).
 * @param {Object} initialData - { tema, sector_contexto, cantidad, fase_embudo }
 * @returns {string}
 */
function serializarDatosIniciales(initialData) {
  return `
**Tema:** ${initialData.tema}
**Sector/Contexto:** ${initialData.sector_contexto || 'No especificado'}
**Cantidad de videos:** ${initialData.cantidad}
**Fase de Embudo:** ${initialData.fase_embudo || 'auto'}`;
}

function inferirFormatoVisual({ ruta, narrativa, tipo_contenido, fase_funnel, es_huevo_oro }) {
  if (es_huevo_oro || fase_funnel === 'mofu' || fase_funnel === 'bofu') {
    return 'Cara a cámara + B-roll';
  }

  if (tipo_contenido === 'practico') {
    return 'Tutorial over-shoulder';
  }

  if (narrativa === 'estructurada') {
    const porRuta = {
      tecnica: 'Pizarra / libreta',
      viral: 'Dueto / reacción',
      amplia: 'Metáfora física',
    };
    return porRuta[ruta] || 'Cara a cámara + B-roll';
  }

  const porRutaDirecta = {
    tecnica: 'Cara a cámara + B-roll',
    viral: 'Pantalla dividida (VS / antes-después)',
    amplia: 'Green screen (dashboard/comentarios)',
  };
  return porRutaDirecta[ruta] || 'Cara a cámara + B-roll';
}

/**
 * Mini-IA: Enriquece un tema simple en un hook orientado a retención TikTok.
 * Ej: "costos" → "Cómo saber si tu negocio gana o pierde cada día"
 * @param {string} tema
 * @param {string} [sectorContexto]
 * @returns {Promise<string>} - Tema enriquecido
 */
export async function mejorarTema(tema, sectorContexto) {
  try {
    const prompt = `Eres un experto en contenido viral para TikTok/Reels dirigido a emprendedores latinoamericanos.

Dado este tema simple: "${tema}"
${sectorContexto ? `Sector/contexto: "${sectorContexto}"` : ''}

Transforma el tema en UNA sola oración gancho que:
- Genere curiosidad inmediata
- Sea específica (no genérica)
- Hable a UN emprendedor (no "los emprendedores")
- Máximo 15 palabras
- Español neutro latinoamericano (sin voseo argentino)

Responde SOLO con la oración, sin comillas, sin explicación.`;

    const response = await grokProxy({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 100
    });

    const resultado = (response.data.content || '').trim();
    console.log('✅ Tema mejorado:', resultado);
    return resultado;
  } catch (error) {
    console.error('❌ Error al mejorar tema:', error);
    throw error;
  }
}

/**
 * Analiza tema/sector/fase y genera un plan de distribución de videos.
 * Grok decide: ruta, tipo, narrativa, voz, fase y huevos de oro por cada video.
 *
 * @param {Object} inputs - { tema, sector_contexto, cantidad, fase_embudo }
 * @returns {Promise<Object>} - { meta_previo, plan_videos[] }
 */
export async function analizarDistribucion(inputs) {
  try {
    const promptMaestro = await getPromptMaestro();
    const datosSerializados = serializarDatosIniciales(inputs);

    const faseInstruccion = inputs.fase_embudo === 'auto'
      ? 'Infiere la mejor fase de embudo según el tema y sector. Puedes mezclar fases en el batch.'
      : `El usuario seleccionó fase "${inputs.fase_embudo}". Respeta esta fase como principal.`;

    const prompt = `${promptMaestro}

---

# INSTRUCCIÓN: ANALIZAR Y DISTRIBUIR BATCH DE VIDEOS

${datosSerializados}

## REGLAS DE DISTRIBUCIÓN:
- ${faseInstruccion}
- Mapeo de fases: ToFu → preferir Viral/Directa. MoFu → preferir Técnica/Estructurada. BoFu → incluir Huevo(s) de Oro (narrativa OBLIGATORIAMENTE estructurada, duración 1-1.5min).
- Distribución de voces: ~70% Voz A (José) / ~30% Voz B (WALA).
- Maximizar variedad: no repetir la misma combinación ruta+tipo+narrativa en videos consecutivos.
- Caso obligatorio en Técnica y Amplia (Voz A).
- Gancho Triple W <12 palabras en narrativa Directa.
- BoFu puede incluir 1 o más Huevos de Oro según la cantidad total de videos. Grok decide cuántos.
- PROHIBIDO: narrativa "directa" en Huevo de Oro.
- Buscar máxima retención en cada selección.

**RESPONDE SOLO EN FORMATO JSON:**
{
  "meta_previo": {
    "tema_enriquecido": "versión enriquecida del tema para hooks",
    "fase_inferida": "tofu|mofu|bofu|mixta",
    "estrategia": "oración describiendo la estrategia general del batch",
    "razon_distribucion": "por qué esta distribución maximiza retención y variedad"
  },
  "plan_videos": [
    {
      "numero": 1,
      "ruta": "tecnica|viral|amplia",
      "tipo": "educativo|practico",
      "narrativa": "directa|estructurada",
      "voz": "A|B",
      "fase_funnel": "tofu|mofu|bofu",
      "es_huevo_oro": false,
      "enfoque_breve": "una oración describiendo el ángulo de este video"
    }
  ]
}`;

    const response = await grokProxy({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      response_format: { type: 'json_object' },
      max_tokens: 2000
    });

    const result = JSON.parse(response.data.content || '{}');
    console.log('✅ Distribución analizada:', result);
    return result;
  } catch (error) {
    console.error('❌ Error al analizar distribución:', error);
    throw error;
  }
}

/**
 * Genera preguntas de aclaración usando el plan de distribución como contexto.
 *
 * @param {Object} initialData - { tema, sector_contexto, cantidad, fase_embudo }
 * @param {Array} planVideos - Plan de distribución generado por analizarDistribucion
 * @returns {Promise<Object>} - { preguntas: string[], contexto_detectado: Object }
 */
export async function generarPreguntasAclaracion(initialData, planVideos) {
  try {
    const promptMaestro = await getPromptMaestro();
    const datosSerializados = serializarDatosIniciales(initialData);

    const planTexto = planVideos
      ? `## PLAN DE DISTRIBUCIÓN YA DEFINIDO:
${planVideos.map(v => `- Video ${v.numero}: Ruta=${v.ruta}, Tipo=${v.tipo}, Narrativa=${v.narrativa}, Voz=${v.voz}, Fase=${v.fase_funnel}${v.es_huevo_oro ? ' (Huevo de Oro)' : ''} → ${v.enfoque_breve}`).join('\n')}`
      : '';

    const prompt = `${promptMaestro}

---

# INSTRUCCIÓN ACTUAL: PREGUNTAS DE ACLARACIÓN

El usuario quiere generar guiones con la siguiente información:
${datosSerializados}

${planTexto}

Ya se decidió la distribución de rutas/tipos/narrativas. Genera entre 2 y 4 preguntas de aclaración enfocadas en:
- Casos reales del sector para usar en los guiones
- Audiencia objetivo específica (perfil del emprendedor ideal)
- Restricciones o preferencias de tono/estilo
- Detalles del sector que enriquezcan los ejemplos

NO preguntes sobre ruta, tipo de contenido, narrativa o distribución — eso ya está decidido.

**RESPONDE SOLO EN FORMATO JSON:**
{
  "preguntas": [
    "¿Pregunta 1?",
    "¿Pregunta 2?"
  ],
  "contexto_detectado": {
    "sector_analizado": "descripción del sector detectado",
    "audiencia_inferida": "perfil de audiencia inferido",
    "tono_sugerido": "descripción del tono"
  }
}`;

    const response = await grokProxy({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 1000
    });

    const content = response.data.content || '{}';
    const result = JSON.parse(content);

    console.log('✅ Preguntas de aclaración generadas:', result);
    return result;
  } catch (error) {
    console.error('❌ Error al generar preguntas:', error);
    throw error;
  }
}

/**
 * Sugiere respuestas para TODAS las preguntas de aclaración en una sola llamada a Grok.
 * El resultado se inyecta directamente en los textareas de PreguntasIA.
 *
 * @param {string[]} preguntas - Array de preguntas generadas
 * @param {{ tema: string, sector_contexto: string }} datosIniciales
 * @param {Array} [planVideos] - Plan de distribución confirmado (con posibles overrides)
 * @returns {Promise<string[]>} - Array de respuestas en el mismo orden que las preguntas
 */
export async function sugerirRespuestas(preguntas, datosIniciales, planVideos) {
  try {
    const planTexto = planVideos?.length
      ? `\n## PLAN DE VIDEOS CONFIRMADO:\n${planVideos.map(v => `- Video ${v.numero}: ${v.ruta}/${v.tipo}/${v.narrativa} (${v.fase_funnel}${v.es_huevo_oro ? ', Huevo de Oro' : ''})`).join('\n')}`
      : '';

    const preguntasTexto = preguntas
      .map((p, i) => `${i + 1}. ${p}`)
      .join('\n');

    const prompt = `Eres un experto en marketing de contenido para TikTok/Reels para emprendedores latinoamericanos.

CONTEXTO DEL PROYECTO:
- Tema: ${datosIniciales.tema}
- Sector: ${datosIniciales.sector_contexto}${planTexto}

TENIENDO EN CUENTA TODAS LAS PREGUNTAS A LA VEZ (para que las respuestas sean coherentes entre sí), responde cada una de forma concisa, práctica y específica para el sector dado. Las respuestas serán usadas para generar guiones de video cortos.

PREGUNTAS:
${preguntasTexto}

RESPONDE SOLO EN FORMATO JSON:
{
  "respuestas": [
    "respuesta a pregunta 1",
    "respuesta a pregunta 2"
  ]
}`;

    const response = await grokProxy({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      response_format: { type: 'json_object' },
      max_tokens: 800
    });

    const content = response.data.content || '{}';
    const result = JSON.parse(content);

    console.log('✅ Respuestas sugeridas por IA:', result);
    return result.respuestas || [];
  } catch (error) {
    console.error('❌ Error al sugerir respuestas:', error);
    throw error;
  }
}

/**
 * Genera los guiones completos usando el plan de distribución (con posibles overrides)
 * y las respuestas de PreguntasIA.
 *
 * @param {Object} fullContext - { datosIniciales, respuestas, planVideos }
 * @param {Function} [onProgress] - Callback de progreso: ({ fase, videoActual, totalVideos })
 * @returns {Promise<Object>} - JSON con meta_analisis + generacion + videos[]
 */
export async function generarGuionesCompletos(fullContext, onProgress) {
  try {
    const promptMaestro = await getPromptMaestro();
    const datosSerializados = serializarDatosIniciales(fullContext.datosIniciales);
    const totalVideos = fullContext.datosIniciales.cantidad || 5;
    const planVideos = fullContext.planVideos || [];

    const respuestasTexto = fullContext.respuestas
      .map((r, i) => `${i + 1}. **${r.pregunta}**\n   Respuesta: ${r.respuesta}`)
      .join('\n\n');

    // ═══════════════════════════════════════════════════
    // FASE 1: Generar meta_analisis + generacion (rápido, ~10s)
    // ═══════════════════════════════════════════════════
    if (onProgress) onProgress({ fase: 'estructura', videoActual: 0, totalVideos });
    console.log('📐 Generando estructura base (meta_analisis + generacion)...');

    const planTexto = planVideos.length > 0
      ? `## PLAN DE DISTRIBUCIÓN CONFIRMADO POR EL USUARIO:
${planVideos.map(v => `- Video ${v.numero}: Ruta=${v.ruta}, Tipo=${v.tipo}, Narrativa=${v.narrativa}, Voz=${v.voz}, Fase=${v.fase_funnel}${v.es_huevo_oro ? ' (Huevo de Oro)' : ''} → ${v.enfoque_breve}`).join('\n')}`
      : '';

    const estructuraPrompt = `${promptMaestro}

---

# INSTRUCCIÓN: GENERAR SOLO ESTRUCTURA BASE (meta_analisis + generacion)

## INPUT DEL USUARIO:
${datosSerializados}

## RESPUESTAS A PREGUNTAS DE ACLARACIÓN:
${respuestasTexto}

${planTexto}

---

Genera SOLO la estructura base con meta_analisis y generacion usando el plan ya definido. NO generes los videos aún.

**RESPONDE SOLO EN FORMATO JSON:**
{
  "meta_analisis": {
    "tema": "string",
    "ruta_principal": "tecnica|viral|amplia",
    "sector_contexto": "descripción detallada del sector",
    "estrategia_aplicada": "oración describiendo la estrategia",
    "propuesta_valor_central": "qué valor entrega esta serie de videos"
  },
  "generacion": {
    "tema": "string",
    "fase_funnel": "tofu|mofu|bofu",
    "total_videos": ${totalVideos},
    "distribucion_rutas": { "tecnicos": 0, "virales": 0, "amplios": 0 },
    "distribucion_tipos": { "educativos": 0, "practicos": 0 },
    "distribucion_narrativas": { "directa": 0, "estructurada": 0 },
    "distribucion_voces": { "voz_a": 0, "voz_b": 0 }
  },
  "plan_videos": [
    {
      "numero": 1,
      "ruta": "tecnica|viral|amplia",
      "tipo_contenido": "educativo|practico",
      "narrativa": "directa|estructurada",
      "voz": "A|B",
      "enfoque_breve": "una oración describiendo el ángulo de este video"
    }
  ]
}`;

    const estructuraResp = await grokProxy({
      messages: [{ role: 'user', content: estructuraPrompt }],
      temperature: 0.4,
      response_format: { type: 'json_object' },
      max_tokens: 2000
    });

    const estructura = JSON.parse(estructuraResp.data.content || '{}');
    console.log('✅ Estructura base generada:', estructura);

    // ═══════════════════════════════════════════════════
    // FASE 2: Generar cada video individualmente (~15-25s c/u)
    // ═══════════════════════════════════════════════════
    const videos = [];
    const planParaVideos = planVideos.length > 0 ? planVideos : (estructura.plan_videos || []);

    for (let i = 0; i < totalVideos; i++) {
      const videoNum = i + 1;
      const planVideo = planParaVideos[i] || {};

      if (onProgress) onProgress({ fase: 'video', videoActual: videoNum, totalVideos });
      console.log(`🎬 Generando video ${videoNum} de ${totalVideos}...`);

      const videoPrompt = `${promptMaestro}

---

# INSTRUCCIÓN: GENERAR VIDEO ${videoNum} DE ${totalVideos}

## CONTEXTO GENERAL:
${datosSerializados}

## RESPUESTAS DEL USUARIO:
${respuestasTexto}

## META-ANÁLISIS (ya generado):
${JSON.stringify(estructura.meta_analisis, null, 2)}

## PLAN PARA ESTE VIDEO:
- Número: ${videoNum}
- Ruta: ${planVideo.ruta || 'tecnica'}
- Tipo: ${planVideo.tipo_contenido || planVideo.tipo || 'educativo'}
- Narrativa: ${planVideo.narrativa || 'directa'}
- Voz: ${planVideo.voz || 'A'}
- Fase: ${planVideo.fase_funnel || 'tofu'}
- Huevo de Oro: ${planVideo.es_huevo_oro ? 'SÍ (1-1.5min, narrativa estructurada obligatoria)' : 'No'}
- Enfoque: ${planVideo.enfoque_breve || 'A definir por IA'}

## VIDEOS YA GENERADOS (para no repetir perfiles de emprendedor):
${videos.map(v => `- Video ${v.numero}: ${v.gancho?.texto || 'N/A'} — perfil: ${v.caso_inicial?.texto?.substring(0, 80) || 'N/A'}`).join('\n') || 'Ninguno aún'}

---

${REGLAS_ESCRITURA}

## ESTRUCTURA JSON PARA ESTE VIDEO:

Genera UN SOLO video con esta estructura JSON exacta:

{
  "numero": ${videoNum},
  "ruta": "${planVideo.ruta || 'tecnica'}",
  "tipo_contenido": "${planVideo.tipo_contenido || 'educativo'}",
  "narrativa": "${planVideo.narrativa || 'directa'}",
  "voz": "${planVideo.voz || 'A'}",
  "fase_funnel": "${planVideo.fase_funnel || 'tofu'}",
  "etapa_funnel": "${planVideo.fase_funnel || 'tofu'}",
  "es_huevo_oro": ${Boolean(planVideo.es_huevo_oro)},
  "duracion_estimada": "60s",
  "sector_contexto": "descripción del sector aplicado a este video",
  "tema": "string",
  "formato_visual_recomendado": "Cara a cámara + B-roll | Pantalla dividida (VS / antes-después) | Pizarra / libreta | Green screen (dashboard/comentarios) | Tutorial over-shoulder | Metáfora física | Lista errores comunes | Dueto / reacción",
  "formato_coherente": true,
  "gancho": {
    "texto": "ORACIÓN COMPLETA de máx 15 palabras que genera curiosidad inmediata",
    "palabras_count": 12,
    "componentes": {
      "que_veras": "Una oración completa sobre qué aprenderá el espectador",
      "para_quien": "Una oración completa describiendo al espectador ideal",
      "por_que_ahora": "Una oración completa con la razón urgente"
    }
  },
  "caso_inicial": {
    "presente": true,
    "texto": "Si narrativa=directa: 2-3 oraciones que interpelan al espectador directamente. Si narrativa=estructurada: 3-4 oraciones con historia + PERO + consecuencia. NUNCA 'zona urbana'."
  },
  "escena_sugerida": {
    "accion_fisica": "Qué hace físicamente el presentador",
    "momento": "Dónde y cuándo filmar",
    "energia": "Tono emocional"
  },
  "guion_completo": {
    "hook": "[0-5s] ORACIÓN COMPLETA del gancho hablado (8-15 palabras).",
    "caso_validacion": "[5-25s] Según narrativa directa o estructurada.",
    "desarrollo": "[25-50s] 4-6 oraciones. Lenguaje cotidiano. OBLIGATORIO mencionar WALA por nombre.",
    "micro_accion": "[50-58s] 2 ORACIONES. Acción ejecutable HOY. Mencionar WALA.",
    "cta": "[58-60s] 2 ORACIONES de cierre dirigidas a usar WALA."
  },
  "micro_hooks": [
    { "numero": 1, "tipo": "pregunta_retencion|afirmacion_curiosidad|dato_sorpresa", "texto": "Pregunta/afirmación COMPLETA 8-12 palabras", "timestamp": "10s" },
    { "numero": 2, "tipo": "string", "texto": "string", "timestamp": "25s" },
    { "numero": 3, "tipo": "string", "texto": "string", "timestamp": "40s" }
  ],
  "cta": {
    "formato": "link_perfil|registro_gratis|seguir_perfil",
    "texto_completo": "Oración completa del CTA",
    "mencion_wala": "directa",
    "beneficio_especifico": "Qué obtiene el espectador"
  },
  "storytelling": {
    "tipo": "directa_cotidiana|estructurada_causal",
    "conectores_usados": [],
    "validacion": "Por qué este storytelling funciona"
  },
  "caption": "Caption completo para redes. Mínimo 3 párrafos con emojis y hashtags.",
  "adaptacion_sector": {
    "contexto_usado": "Cómo se usó el sector",
    "productos_mencionados": ["producto1", "producto2"],
    "temporalidades": "Épocas del sector",
    "problematicas_unicas": "Problemas específicos"
  },
  "notas_produccion": {
    "tono_narrativa": "Descripción del tono",
    "velocidad": "Ritmo del video",
    "props": "Objetos necesarios"
  },
  "metricas_esperadas": {
    "objetivo_ruta": "Resultado esperado",
    "retencion_esperada": "Porcentaje de retención",
    "tipo_interaccion": "Tipo de interacción esperada"
  }
}

REGLAS FINALES PARA ESTE VIDEO:
- TODO en español neutro latinoamericano. PROHIBIDO voseo argentino.
- SIEMPRE mencionar WALA por nombre en desarrollo, micro_accion y CTA.
- El perfil de emprendedor debe ser DIFERENTE a los videos anteriores.
- Cada campo de guion_completo lleva prefijo de tiempo: [0-5s], [5-25s], etc.
- micro_hooks: mínimo 3, TODOS con texto completo (no telegráfico).
- Coherencia interna: mismo emprendedor/situación en todo el video.
- Incluye SIEMPRE formato_visual_recomendado y formato_coherente según la etapa de funnel.

Genera el JSON del video ${videoNum} AHORA.`;

      const videoResp = await grokProxy({
        messages: [{ role: 'user', content: videoPrompt }],
        temperature: 0.6,
        response_format: { type: 'json_object' },
        max_tokens: 3000
      });

      const rawVideoData = JSON.parse(videoResp.data.content || '{}');

      // Grok a veces devuelve la estructura completa del batch en lugar de un solo video.
      // Si detectamos eso, extraemos el video correcto del array interno.
      let videoData = rawVideoData;
      if (rawVideoData.videos && Array.isArray(rawVideoData.videos)) {
        console.warn(`⚠️ Video ${videoNum}: Grok devolvió estructura de batch en lugar de un video individual. Extrayendo...`);
        videoData = rawVideoData.videos.find(v => v.numero === videoNum)
          || rawVideoData.videos[0]
          || rawVideoData;
      }

      const faseNormalizada = (videoData.fase_funnel || videoData.etapa_funnel || planVideo.fase_funnel || 'tofu').toLowerCase();
      videoData.fase_funnel = faseNormalizada;
      videoData.etapa_funnel = faseNormalizada;
      videoData.es_huevo_oro = Boolean(videoData.es_huevo_oro ?? planVideo.es_huevo_oro);

      if (!videoData.formato_visual_recomendado) {
        videoData.formato_visual_recomendado = inferirFormatoVisual({
          ruta: videoData.ruta || planVideo.ruta,
          narrativa: videoData.narrativa || planVideo.narrativa,
          tipo_contenido: videoData.tipo_contenido || planVideo.tipo_contenido || planVideo.tipo,
          fase_funnel: faseNormalizada,
          es_huevo_oro: videoData.es_huevo_oro,
        });
      }

      if (videoData.formato_coherente === undefined) {
        videoData.formato_coherente = true;
      }

      videos.push(videoData);
      console.log(`✅ Video ${videoNum} generado`);
    }

    // ═══════════════════════════════════════════════════
    // FASE 3: Ensamblar resultado final
    // ═══════════════════════════════════════════════════
    if (onProgress) onProgress({ fase: 'ensamblando', videoActual: totalVideos, totalVideos });

    const result = {
      meta_analisis: estructura.meta_analisis,
      generacion: estructura.generacion,
      videos
    };

    console.log('✅ Guiones completos generados:', result);
    return result;
  } catch (error) {
    console.error('❌ Error al generar guiones completos:', error);
    throw error;
  }
}

/**
 * Reglas de escritura compartidas entre prompts (extraídas para reutilización)
 */
const REGLAS_ESCRITURA = `## ⚠️ REGLAS DE ESCRITURA — OBLIGATORIAS SIN EXCEPCIÓN

### REGLA 1 — TEXTO FLUIDO Y HABLADO (LA MÁS IMPORTANTE)
Cada campo de texto debe ser oraciones completas con sujeto, verbo y predicado, como si una persona lo dijera frente a cámara.
PROHIBIDO fragmentos telegráficos como "Sigue insumos. Marca fechas. Evita mermas."
CORRECTO: "La semana pasada, una repostera me contó que siempre le sobraban ingredientes al final del mes."

### REGLA 2 — DOS NARRATIVAS COMPLETAMENTE DISTINTAS
**DIRECTA:** Sin story arc, sin conectores (PROHIBIDO PERO/ENTONCES/POR ESO). Tono inmediato, frases cortas, interpelación directa.
**ESTRUCTURADA:** Story arc causal, OBLIGATORIO min 2 conectores (PERO/ENTONCES/POR ESO). Historia con inicio, conflicto, resolución.

### REGLA 3 — PROHIBIDO "zona urbana" o "área urbana". Perfiles específicos y variados.

### REGLA 4 — LONGITUD MÍNIMA
- hook: 1 oración (8-15 palabras). caso_validacion: 3-4 oraciones. desarrollo: 4-6 oraciones en lenguaje cotidiano (NO técnico-corporativo). micro_accion: 2 oraciones. cta: 2 oraciones dirigidas a WALA.

### REGLA 5 — MICRO-HOOKS COMPLETOS (no palabras sueltas)

### REGLA 6 — VOZ DIFERENCIADA
Voz A (José): primera persona, coloquial, casos reales. Voz B (WALA): segunda persona, beneficio funcional.

### REGLA 7 — ESPAÑOL NEUTRO LATINOAMERICANO (SIN VOSEO ARGENTINO)
PROHIBIDO: Evitá, Iniciá, Usá, tenés, hacé, sabés. CORRECTO: Evita, Inicia, Usa, tienes, haz, sabes.

### REGLA 8 — SECTOR ULTRA-ESPECÍFICO en todos los ejemplos.

### REGLA 9 — COHERENCIA NARRATIVA INTERNA entre todos los campos del video.

### REGLA CRÍTICA — MENCIÓN EXPLÍCITA DE WALA en desarrollo, micro_accion y CTA. PROHIBIDO "una app", "una herramienta", "un sistema".`;

/**
 * Valida que el JSON generado tenga la estructura correcta (nueva V6)
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
      const n = idx + 1;
      if (!video.gancho) errors.push(`Video ${n}: falta "gancho"`);
      if (!video.guion_completo) errors.push(`Video ${n}: falta "guion_completo"`);
      if (!video.cta) errors.push(`Video ${n}: falta "cta"`);
      if (!video.micro_hooks || !Array.isArray(video.micro_hooks)) errors.push(`Video ${n}: falta "micro_hooks"`);
      if (!video.caption) errors.push(`Video ${n}: falta "caption"`);
      if (!video.notas_produccion) errors.push(`Video ${n}: falta "notas_produccion"`);
      if (!video.ruta) errors.push(`Video ${n}: falta "ruta"`);
      if (!video.tipo_contenido) errors.push(`Video ${n}: falta "tipo_contenido"`);
      if (!video.narrativa) errors.push(`Video ${n}: falta "narrativa"`);

      // Detectar texto telegráfico en guion_completo
      if (video.guion_completo) {
        const gc = video.guion_completo;
        const camposGuion = ['hook', 'caso_validacion', 'desarrollo', 'micro_accion', 'cta'];
        camposGuion.forEach(campo => {
          const raw = gc[campo];
          if (!raw) return;
          const texto = raw.replace(/\[.*?\]\s*/, '').trim();
          const palabras = texto.split(/\s+/).filter(Boolean).length;
          const oraciones = texto.split(/[.!?]+/).filter(s => s.trim().length > 3).length;
          if (palabras < 8 || oraciones < 1) {
            errors.push(`Video ${n}: guion_completo.${campo} es demasiado corto o telegráfico ("${texto.substring(0, 60)}...")`)
          }
        });
      }

      // Detectar micro-hooks telegráficos
      if (video.micro_hooks && Array.isArray(video.micro_hooks)) {
        video.micro_hooks.forEach((mh, mhIdx) => {
          if (mh.texto && mh.texto.split(/\s+/).length < 5) {
            errors.push(`Video ${n}: micro_hook ${mhIdx + 1} es telegráfico ("${mh.texto}") — debe ser pregunta o afirmación completa`);
          }
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}