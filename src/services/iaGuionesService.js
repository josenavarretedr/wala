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
 * Serializa los datos iniciales del usuario según el tipo de input elegido.
 * Tipos: 'completo' | 'proporcion' | 'mixto' | 'minimo'
 * @param {Object} initialData
 * @returns {string}
 */
function serializarDatosIniciales(initialData) {
  const tipo = initialData.tipo_input || 'minimo';

  switch (tipo) {
    case 'completo':
      return `
**Tipo de Input:** Completo
**Tema:** ${initialData.tema}
**Ruta:** ${initialData.ruta}
**Tipo de Contenido:** ${initialData.tipo_contenido}
**Narrativa:** ${initialData.narrativa}
**Sector/Contexto:** ${initialData.sector_contexto || 'No especificado'}
**Cantidad de videos:** ${initialData.cantidad}`;

    case 'proporcion':
      return `
**Tipo de Input:** Con Proporción
**Tema:** ${initialData.tema}
**Ruta:** ${initialData.ruta}
**Videos Educativos:** ${initialData.educativos}
**Videos Prácticos:** ${initialData.practicos}
**Narrativa:** ${initialData.narrativa}
**Sector/Contexto:** ${initialData.sector_contexto || 'No especificado'}
**Cantidad total:** ${initialData.cantidad}`;

    case 'mixto':
      return `
**Tipo de Input:** Mixto (Rutas + Narrativas)
**Tema:** ${initialData.tema}
**Distribución de contenido:**
${JSON.stringify(initialData.contenido, null, 2)}
**Sector/Contexto:** ${initialData.sector_contexto || 'No especificado'}
**Cantidad total:** ${initialData.cantidad}`;

    case 'minimo':
    default:
      return `
**Tipo de Input:** Mínimo (IA decide distribución)
**Tema:** ${initialData.tema}
**Cantidad de videos:** ${initialData.cantidad}
${initialData.sector_contexto ? `**Sector/Contexto:** ${initialData.sector_contexto}` : ''}`;
  }
}

/**
 * PASO 1: Usuario envía tema y configuración inicial
 * PASO 2: IA responde con preguntas de aclaración
 *
 * @param {Object} initialData - Según tipo_input: 'completo' | 'proporcion' | 'mixto' | 'minimo'
 * @returns {Promise<Object>} - { preguntas: string[], contexto_detectado: Object }
 */
export async function generarPreguntasAclaracion(initialData) {
  try {
    const promptMaestro = await getPromptMaestro();
    const datosSerializados = serializarDatosIniciales(initialData);
    const esTipoMinimo = !initialData.tipo_input || initialData.tipo_input === 'minimo';

    const prompt = `${promptMaestro}

---

# INSTRUCCIÓN ACTUAL: PASO 02 - PREGUNTAS DE ACLARACIÓN

El usuario quiere generar guiones con la siguiente información:
${datosSerializados}

${esTipoMinimo
        ? `Como el input es mínimo, pregunta:
  1. ¿Qué ruta prefiere? (técnica / viral / amplia) — o IA decide
  2. ¿Tipo de contenido? (educativo / práctico / mixto) — o IA decide
  3. ¿Narrativa? (directa / estructurada) — o IA decide
  4. ¿Sector/contexto específico para los guiones?`
        : `Con base en el input del usuario, genera entre 2 y 4 preguntas de aclaración para generar guiones de máxima calidad según el promptGuion.md.
  Enfócate en: sector_contexto específico, casos reales a usar, audiencia objetivo, y cualquier restricción o preferencia adicional.`
      }

**RESPONDE SOLO EN FORMATO JSON:**
{
  "preguntas": [
    "¿Pregunta 1?",
    "¿Pregunta 2?"
  ],
  "contexto_detectado": {
    "ruta_sugerida": "tecnica/viral/amplia",
    "narrativa_sugerida": "directa/estructurada",
    "distribucion_voces": "60% A / 40% B"
  }
}`;

    const response = await grokProxyExtended({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
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
 * PASO 3: Usuario responde preguntas
 * PASO 4: IA genera JSON completo con guiones según nueva estructura
 * 
 * Estrategia: genera meta_analisis + generacion en una llamada rápida,
 * luego genera cada video individualmente para evitar timeouts del emulador (~120s).
 *
 * @param {Object} fullContext - { datosIniciales, respuestas }
 * @param {Function} [onProgress] - Callback de progreso: ({ fase, videoActual, totalVideos })
 * @returns {Promise<Object>} - JSON con meta_analisis + generacion + videos[]
 */
export async function generarGuionesCompletos(fullContext, onProgress) {
  try {
    const promptMaestro = await getPromptMaestro();
    const datosSerializados = serializarDatosIniciales(fullContext.datosIniciales);
    const totalVideos = fullContext.datosIniciales.cantidad || 5;

    const respuestasTexto = fullContext.respuestas
      .map((r, i) => `${i + 1}. **${r.pregunta}**\n   Respuesta: ${r.respuesta}`)
      .join('\n\n');

    // ═══════════════════════════════════════════════════
    // FASE 1: Generar meta_analisis + generacion (rápido, ~10s)
    // ═══════════════════════════════════════════════════
    if (onProgress) onProgress({ fase: 'estructura', videoActual: 0, totalVideos });
    console.log('📐 Generando estructura base (meta_analisis + generacion)...');

    const estructuraPrompt = `${promptMaestro}

---

# INSTRUCCIÓN: GENERAR SOLO ESTRUCTURA BASE (meta_analisis + generacion)

## INPUT DEL USUARIO:
${datosSerializados}

## RESPUESTAS A PREGUNTAS DE ACLARACIÓN:
${respuestasTexto}

---

Genera SOLO la estructura base con meta_analisis y generacion. NO generes los videos aún.

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
    "fase_funnel": "atraccion",
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
    const planVideos = estructura.plan_videos || [];

    for (let i = 0; i < totalVideos; i++) {
      const videoNum = i + 1;
      const planVideo = planVideos[i] || {};
      
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
- Tipo: ${planVideo.tipo_contenido || 'educativo'}
- Narrativa: ${planVideo.narrativa || 'directa'}
- Voz: ${planVideo.voz || 'A'}
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
  "duracion_estimada": "60s",
  "sector_contexto": "descripción del sector aplicado a este video",
  "tema": "string",
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

Genera el JSON del video ${videoNum} AHORA.`;

      const videoResp = await grokProxy({
        messages: [{ role: 'user', content: videoPrompt }],
        temperature: 0.6,
        response_format: { type: 'json_object' },
        max_tokens: 3000
      });

      const videoData = JSON.parse(videoResp.data.content || '{}');
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