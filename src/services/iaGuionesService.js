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

    const client = new OpenAI({
      apiKey: GROK_CONFIG.apiKey,
      baseURL: GROK_CONFIG.baseURL,
      dangerouslyAllowBrowser: true
    });

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
 * PASO 4: IA genera JSON completo con guiones según nueva estructura
 *
 * @param {Object} fullContext - { datosIniciales, respuestas }
 * @returns {Promise<Object>} - JSON con meta_analisis + generacion + videos[]
 */
export async function generarGuionesCompletos(fullContext) {
  try {
    const promptMaestro = await getPromptMaestro();

    const client = new OpenAI({
      apiKey: GROK_CONFIG.apiKey,
      baseURL: GROK_CONFIG.baseURL,
      dangerouslyAllowBrowser: true
    });

    const datosSerializados = serializarDatosIniciales(fullContext.datosIniciales);

    const prompt = `${promptMaestro}

---

# INSTRUCCIÓN ACTUAL: PASO 04 - GENERAR GUIONES COMPLETOS

## INPUT DEL USUARIO:
${datosSerializados}

## RESPUESTAS A PREGUNTAS DE ACLARACIÓN:
${fullContext.respuestas.map((r, i) => `${i + 1}. **${r.pregunta}**\n   Respuesta: ${r.respuesta}`).join('\n\n')}

---

## ⚠️ REGLAS DE ESCRITURA — OBLIGATORIAS SIN EXCEPCIÓN

Estas reglas aplican a TODOS los campos de texto del guion. Violarlas invalida el output.

### REGLA 1 — TEXTO FLUIDO Y HABLADO (LA MÁS IMPORTANTE)
Cada campo de texto debe ser una o varias oraciones completas con sujeto, verbo y predicado, como si una persona real lo estuviera diciendo frente a una cámara.

PROHIBIDO — fragmentos telegráficos:
✗ "Sigue insumos. Marca fechas. Evita mermas."
✗ "Repostero principiante: entiende inventario para reducir costos ahora."
✗ "WALA automatiza conteo. Evita retrasos. Sin esfuerzo."
✗ "Revisa lista hoy."

CORRECTO — texto hablado natural:
✓ "La semana pasada, una repostera me contó que siempre le sobraban ingredientes al final del mes y no sabía cuánto había perdido. Ese es el problema que hoy te voy a ayudar a resolver."
✓ "Si tienes un negocio de repostería y nunca sabes exactamente qué te queda en stock, este video es para ti."
✓ "Abre WALA ahora mismo y registra tu primer ingrediente. En menos de dos minutos vas a tener claridad sobre tu inventario."

### REGLA 2 — DOS NARRATIVAS COMPLETAMENTE DISTINTAS (CRÍTICO)

La narrativa define el TONO Y ESTRUCTURA COMPLETA del guion. Son estilos opuestos.

**NARRATIVA DIRECTA — sin story arc, sin conectores, tono inmediato y personal:**
- Habla directo al espectador desde la primera palabra, sin construir historia
- Sin conectores narrativos: PROHIBIDO usar PERO, ENTONCES, POR ESO, SIN EMBARGO
- Frases cortas, ritmo rápido, como hablar con un amigo
- El "caso" no es una historia: es una observación o pregunta que interpela al espectador
- Ejemplo de hook directa: "¿Cuánto gastaste esta semana en ingredientes? Si no lo sabes con exactitud, te estás perdiendo plata."
- Ejemplo de caso directa: "La mayoría de los reposteros que conozco no saben cuánto les cuesta cada torta. Y así es imposible ponerle precio sin perder."
- Ejemplo de desarrollo directa: "Lo primero que tienes que hacer es listar todos tus ingredientes con precio y cantidad actual. Después calculas el costo de cada receta. No lleva más de 20 minutos y te cambia el negocio."

**NARRATIVA ESTRUCTURADA — story arc causal, conectores explícitos, narración progresiva:**
- Construye una historia de 3 actos: problema → consecuencia → solución
- OBLIGATORIO usar conectores causales: PERO, ENTONCES, POR ESO, POR LO TANTO, SIN EMBARGO
- El caso es una historia real narrada con inicio, conflicto y resolución
- Ejemplo de caso estructurada: "La semana pasada trabajé con una repostera que compraba harina de más cada semana. PERO no sabía cuánto le quedaba realmente después de cada pedido. ENTONCES, al final del mes, tiraba ingredientes vencidos. POR ESO le propuse un sistema simple de control."
- Ejemplo de desarrollo estructurado: "Primero registramos todo el inventario actual. PERO no bastaba con tenerlo anotado... ENTONCES implementamos alertas semanales. POR ESO ahora puede planificar compras con precisión."

### REGLA 3 — CASOS SIN "ZONA URBANA" — DESCRIPCIONES ESPECÍFICAS Y VARIADAS
PROHIBIDO usar la frase "zona urbana" o "área urbana". Cada caso debe describir al emprendedor de forma específica y diferente entre videos:
✗ "un repostero en una zona urbana" / "una emprendedora en área urbana"
✓ "una repostera que vende por WhatsApp en su barrio"
✓ "un pastelero que hace pedidos custom para cumpleaños"
✓ "una emprendedora que vende en ferias de fin de semana"
✓ "un repostero que trabaja desde su casa y reparte a domicilio"
✓ "una confitería familiar que empezó a recibir pedidos por Instagram"
Cada video debe tener un perfil de emprendedor DIFERENTE y ESPECÍFICO.

### REGLA 4 — LONGITUD MÍNIMA Y CALIDAD POR SECCIÓN
- guion_completo.hook: 1 oración completa (8-15 palabras). Impactante, no telegráfica.
- guion_completo.caso_validacion: 3-4 oraciones según narrativa (ver REGLA 2).
- guion_completo.desarrollo: 4-6 oraciones. Explicación del proceso en lenguaje cotidiano del dueño de un negocio familiar. PROHIBIDO lenguaje técnico-corporativo.
  PROHIBIDO: "configura un monitoreo completo", "integra análisis de patrones", "operación fluida y escalable", "discrepancias en el stock", "optimización de recursos"
  CORRECTO: "anota cada herramienta que entra y sale", "marca los productos que más se agotan", "revisa qué se pierde cada semana", "lleva un registro simple de lo que vendes"
  El dueño de una ferretería de barrio no habla de 'monitoreo de inventario', habla de 'saber qué me queda y qué necesito pedir'.
- guion_completo.micro_accion: 2 oraciones. Acción ejecutable HOY con detalle concreto.
- guion_completo.cta: 2 oraciones. SIEMPRE debe invitar a usar WALA como herramienta para resolver el problema del video. Formato: '[Acción concreta con Wala] para que [beneficio específico del sector]'.
  CORRECTO: "Usa el link en mi perfil para probar WALA gratis y gestionar tu inventario desde hoy. Así dejas de perder dinero sin darte cuenta."
  CORRECTO: "Entra a WALA ahora y registra tu primer producto en menos de 2 minutos. Es la herramienta que va a ordenar las finanzas de tu ferretería."
  PROHIBIDO: guías genéricas, ebooks, "tips gratis" desvinculados de WALA.

### REGLA 5 — MICRO-HOOKS COMPLETOS
NO son palabras sueltas. Son preguntas o afirmaciones cortas pero completas:
✗ "Revisa lista hoy" / "Activa WALA" / "Mira esto"
✓ "¿Sabés exactamente cuánto perdiste este mes por no controlar tu stock?"
✓ "Lo que te voy a mostrar ahora cambia completamente cómo manejás tu negocio."

### REGLA 6 — VOZ DIFERENCIADA
Voz A (José): primera persona, coloquial, narra casos reales desde experiencia propia.
Ejemplo: "Ayer me escribió una repostera que hace pedidos custom desesperada porque no llegaba a fin de mes..."

Voz B (WALA): segunda persona, directo al beneficio funcional de la herramienta.
Ejemplo: "Con WALA puedes ver en tiempo real cuánto inventario te queda y cuánto estás perdiendo cada semana."

### REGLA 7 — ESPAÑOL NEUTRO LATINOAMERICANO (SIN VOSEO ARGENTINO)
TODO el texto hablado debe estar en español neutro latinoamericano o castellano estándar.
PROHIBIDO el voseo argentino: Evitá, Iniciá, Usá, Abrí, Registrá, tenés, hacé, sabés, querés, podés, vas a.
CORRECTO equivalente neutro: Evita, Inicia, Usa, Abre, Registra, tienes, haz, sabes, quieres, puedes, vas a.
Esta regla aplica a TODOS los campos de texto sin excepción — guion, gancho, caso, CTA, caption, micro-hooks.
✗ "Abrí WALA y registrá tu inventario hoy mismo."
✓ "Abre WALA y registra tu inventario hoy mismo."
✗ "Si no sabés cuánto te cuesta cada producto, estás perdiendo plata."
✓ "Si no sabes cuánto te cuesta cada producto, estás perdiendo dinero."

### REGLA 8 — SECTOR ULTRA-ESPECÍFICO
Usar el sector_contexto en TODOS los ejemplos. Si es repostería: hablar de tortas, ingredientes, pedidos custom, mermas de harina, manteca, azúcar. NUNCA ejemplos genéricos.

### REGLA 9 — COHERENCIA NARRATIVA INTERNA
El caso mencionado en caso_validacion debe ser EL MISMO que aparece en el desarrollo. El gancho, el caso y la solución deben referirse a la misma situación durante todo el video.

---

## ESTRUCTURA JSON OBLIGATORIA

Genera el JSON COMPLETO con esta estructura:

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
    "total_videos": ${fullContext.datosIniciales.cantidad || 5},
    "distribucion_rutas": { "tecnicos": 0, "virales": 0, "amplios": 0 },
    "distribucion_tipos": { "educativos": 0, "practicos": 0 },
    "distribucion_narrativas": { "directa": 0, "estructurada": 0 },
    "distribucion_voces": { "voz_a": 0, "voz_b": 0 }
  },
  "videos": [
    {
      "numero": 1,
      "ruta": "tecnica|viral|amplia",
      "tipo_contenido": "educativo|practico",
      "narrativa": "directa|estructurada",
      "voz": "A|B",
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
        "texto": "Si narrativa=directa: 2-3 oraciones que interpelan al espectador directamente desde la observación ('La mayoría de los reposteros que conozco...'). Si narrativa=estructurada: 3-4 oraciones con historia [Nombre específico] + [Problema] + PERO + [Consecuencia]. NUNCA usar 'zona urbana' — describir al emprendedor con su perfil concreto (repostera que vende por WhatsApp, pastelero de pedidos custom, etc.)."
      },
      "escena_sugerida": {
        "accion_fisica": "Qué hace físicamente el presentador durante la grabación",
        "momento": "Dónde y cuándo filmar",
        "energia": "Tono emocional del video"
      },
      "guion_completo": {
        "hook": "[0-5s] ORACIÓN COMPLETA del gancho hablado (8-15 palabras). Si directa: interpela de frente ('¿Cuánto te costó cada torta esta semana?'). Si estructurada: presenta el problema con urgencia ('Hay un error que cometen casi todos los reposteros y les cuesta plata cada mes').",
        "caso_validacion": "[5-25s] Si narrativa=DIRECTA: 2-3 oraciones que describen la situación de forma general sin historia ('La mayoría de los reposteros no saben cuánto les cuesta realmente cada pedido. Y así es imposible saber si estás ganando o perdiendo.'). Si narrativa=ESTRUCTURADA: 3-4 oraciones con story arc usando PERO/ENTONCES/POR ESO: historia real de emprendedor específico (NO 'zona urbana') con inicio, conflicto y consecuencia.",
        "desarrollo": "[25-50s] Si narrativa=DIRECTA: 4-5 oraciones cortas y directas, sin conectores causales. Si narrativa=ESTRUCTURADA: 4-6 oraciones con conectores (PERO/ENTONCES/POR ESO) mostrando antes y después. EN AMBOS CASOS: lenguaje cotidiano del dueño del negocio, sin tecnicismos corporativos. Hablar de 'lo que entra y sale', 'lo que se pierde', 'lo que se acaba' — no de 'monitoreo', 'análisis de patrones' ni 'discrepancias'. OBLIGATORIO: Al describir la solución o proceso, mencionar WALA por nombre como la herramienta concreta que resuelve el problema. NUNCA decir 'una app', 'una herramienta', 'un sistema' de forma genérica — siempre 'WALA'. Ejemplo correcto: 'Abre WALA y registra cada producto que entra y sale. WALA te muestra al instante cuánto te queda y qué necesitas pedir.' Ejemplo incorrecto: 'Descarga una app de control y registra tus productos.'",
        "micro_accion": "[50-58s] 2 ORACIONES COMPLETAS indicando una acción ejecutable ahora mismo, con detalle concreto. OBLIGATORIO mencionar WALA por nombre como la herramienta para ejecutar la acción. NUNCA decir 'una app' ni 'una herramienta' — siempre 'WALA'. Ejemplo correcto: 'Entra a WALA ahora y registra los 5 productos que más vendes. En menos de 3 minutos vas a tener claridad sobre tu inventario.' Ejemplo incorrecto: 'Descarga una app de control hoy y registra tus productos.'",
        "cta": "[58-60s] 2 ORACIONES COMPLETAS de cierre. SIEMPRE dirigido a usar WALA. Primera oración: frase de enganche o problema resuelto. Segunda oración: 'Usa el link en mi perfil para usar WALA [acción concreta] gratis. Para que [beneficio específico del sector del video].' El CTA nunca es una guía, un ebook ni un recurso genérico — siempre es probar/usar WALA."
      },
      "micro_hooks": [
        {
          "numero": 1,
          "tipo": "pregunta_retencion|afirmacion_curiosidad|dato_sorpresa",
          "texto": "Pregunta o afirmación COMPLETA de 8-12 palabras que genera curiosidad",
          "timestamp": "10s"
        }
      ],
      "cta": {
        "formato": "link_perfil|registro_gratis|seguir_perfil",
        "texto_completo": "Oración completa del CTA tal como se dice en voz alta",
        "mencion_wala": "directa|indirecta|ninguna",
        "beneficio_especifico": "Qué obtiene el espectador de forma concreta"
      },
      "storytelling": {
        "tipo": "directa_cotidiana|estructurada_causal",
        "conectores_usados": "Si directa: [] (array vacío, NO usa conectores). Si estructurada: [\"PERO\", \"ENTONCES\", \"POR ESO\"]",
        "validacion": "Oración explicando por qué este storytelling funciona para este video específico"
      },
      "caption": "Caption completo para redes. Mínimo 3 párrafos. Con gancho inicial, desarrollo del valor, y CTA escrito. Incluye emojis y hashtags relevantes.",
      "adaptacion_sector": {
        "contexto_usado": "Cómo se usó el sector en los ejemplos de este video",
        "productos_mencionados": ["producto1", "producto2"],
        "temporalidades": "Épocas o momentos del sector mencionados",
        "problematicas_unicas": "Problemas específicos del sector abordados"
      },
      "notas_produccion": {
        "tono_narrativa": "Descripción del tono emocional y narrativo",
        "velocidad": "Ritmo del video con detalles de pausas y énfasis",
        "props": "Objetos o materiales necesarios para filmar"
      },
      "metricas_esperadas": {
        "objetivo_ruta": "Resultado concreto esperado de esta ruta",
        "retencion_esperada": "Porcentaje o descripción de retención esperada",
        "tipo_interaccion": "Comentarios, guardados o compartidos — cuál se espera más y por qué"
      }
    }
  ]
}

REGLAS FINALES:
- TODO el texto en español neutro latinoamericano. PROHIBIDO el voseo argentino (Evitá→Evita, tenés→tienes, hacé→haz, etc.)
- TODOS los CTAs deben invitar a usar WALA como solución concreta, nunca guías ni recursos genéricos
- REGLA CRÍTICA — MENCIÓN EXPLÍCITA DE WALA: En el desarrollo, micro_accion y CTA, SIEMPRE mencionar WALA por nombre. PROHIBIDO usar frases genéricas como 'una app', 'una herramienta de control', 'un sistema' o 'herramientas accesibles'. La solución SIEMPRE es WALA. Cada video debe posicionar WALA como la herramienta específica que resuelve el problema planteado.
- El desarrollo nunca debe sonar técnico-corporativo: si el texto parece de una presentación ejecutiva, está mal
- Distribución voces: 60-70% Voz A, 30-40% Voz B
- Voz A en ruta técnica o amplia: caso_inicial.presente = true SIEMPRE
- Ruta viral: caso_inicial.presente puede ser false
- micro_hooks: mínimo 3 por video, TODOS con texto completo
- CADA campo de guion_completo debe tener el prefijo de tiempo: [0-5s], [5-25s], etc.
- TODO el texto del guion_completo debe sonar completamente natural al leerlo en voz alta
- El guion de cada video debe tener coherencia interna: el mismo emprendedor/situación en todos los campos
- PROHIBIDO usar "zona urbana" o "área urbana" en cualquier campo — usar perfiles específicos y variados
- narrativa=DIRECTA: CERO conectores narrativos (PERO/ENTONCES/POR ESO) — tono rápido, interpelación directa
- narrativa=ESTRUCTURADA: OBLIGATORIO min 2 conectores causales por video — construir story arc completo
- CADA video debe tener un tipo de emprendedor DIFERENTE — no repetir el mismo perfil entre videos

Genera el JSON completo AHORA con ${fullContext.datosIniciales.cantidad || 5} videos.`;

    const response = await client.chat.completions.create({
      model: GROK_CONFIG.model,
      temperature: 0.6,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 12000
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