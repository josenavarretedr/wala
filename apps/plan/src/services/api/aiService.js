/**
 * Servicio de integración con APIs de IA para formalización de textos de negocio.
 * Soporta prioritariamente Cloud Function grokProxy (Wala Serverless) y como respaldo
 * llamadas directas a xAI (Grok) o Google Gemini.
 * Implementa timeout ampliado de 25 segundos, detección de modo offline, sanitización de respuestas
 * y control robusto de errores adaptado para dispositivos de baja conectividad.
 */
import { httpsCallable } from 'firebase/functions';
import { signInAnonymously } from 'firebase/auth';
import { functions, auth } from '@/services/firebase';

const SYSTEM_INSTRUCTION =
  'Eres un especialista en formulación de planes de negocio para programas de emprendimiento social y comités evaluadores de capital semilla. ' +
  'Tu tarea es recibir textos redactados por microemprendedores en lenguaje coloquial y observaciones del consultor técnico, para convertirlos en una redacción formal, técnica, concisa y profesional. ' +
  'No inventes hechos, no exageres la capacidad operativa ni agregues datos que el usuario no mencionó. Mantén el sentido exacto de la respuesta original. ' +
  'REGLA FUNDAMENTAL: Devuelve ÚNICAMENTE la redacción formal final en un solo bloque o párrafo continuo. NO incluyas introducciones (como "Aquí tienes..."), NO incluyas títulos ni encabezados (como "**Misión:**", "**Propuesta de Valor:**"), NO uses comillas externas ni listas de opciones.';

/**
 * Limpia y normaliza el texto retornado por el modelo de IA.
 * Remueve encabezados residuales (ej: "**Misión:**", "### Resumen:"), comillas envolventes y espacios extra.
 *
 * @param {string} text
 * @returns {string}
 */
function cleanGeneratedText(text) {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text.trim();
  // Remueve comillas envolventes
  cleaned = cleaned.replace(/^["'«»“”]+|["'«»“”]+$/g, '').trim();
  // Remueve encabezados Markdown iniciales como "**Campo:**", "### Misión", etc.
  cleaned = cleaned.replace(/^(?:#+\s*|\*\*[^*]+(?::\*\*|\*\*:\s*|\*\*)\s*|[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+:\s*\n+)/i, '').trim();
  // Remueve comillas envolventes si quedaron tras remover el título
  cleaned = cleaned.replace(/^["'«»“”]+|["'«»“”]+$/g, '').trim();
  return cleaned;
}

/**
 * Refina y formaliza el texto de un campo de negocio sintetizando lo expresado
 * por el microemprendedor con las notas y precisiones técnicas del consultor.
 *
 * @param {Object} params
 * @param {string} params.rawInput - Redacción original libre del emprendedor
 * @param {string} [params.consultantNotes] - Observaciones o contexto técnico aportado por el consultor
 * @param {string} params.fieldKey - Clave identificadora del campo (ej. 'mision', 'vision', 'valueProposition')
 * @param {string} [params.businessName] - Nombre comercial del negocio
 * @param {string} [params.sector] - Rubro o sector productivo
 * @param {string} [params.businessNature] - Naturaleza del negocio (produccion, servicio, comercio)
 * @returns {Promise<{ success?: boolean, refinedText?: string, model?: string, provider?: string, generatedAt?: string, error?: string, message?: string }>}
 */
export async function refineBusinessText({
  rawInput = '',
  consultantNotes = '',
  fieldKey,
  businessName = '',
  sector = '',
  businessNature = ''
}) {
  // 1. Detección estricta de conectividad
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return {
      error: 'OFFLINE',
      message: 'Se requiere conexión a internet para formalizar con el asistente.'
    };
  }

  const cleanRaw = String(rawInput || '').trim();
  const cleanNotes = String(consultantNotes || '').trim();

  // 2. Validación de contenido mínimo: al menos el texto del emprendedor o notas del consultor
  if (!cleanRaw && !cleanNotes) {
    return {
      error: 'INVALID_INPUT',
      message: 'Se requiere al menos la respuesta del participante o notas del facilitador para formalizar.'
    };
  }

function getEnv(key) {
  if (typeof import.meta !== 'undefined' && import.meta?.env?.[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process?.env?.[key]) {
    return process.env[key];
  }
  return '';
}

  // 3. Configuración de Timeout preventivo de 25 segundos (suficiente para redes móviles y modelos LLM)
  const TIMEOUT_MS = 25000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const cleanBusiness = businessName || 'Emprendimiento';
  const cleanSector = sector || 'General';
  const cleanNature = businessNature || 'General';

  const userPrompt = [
    `Actúa como especialista en formulación de proyectos para comités de financiamiento y capital semilla.`,
    `Tienes dos fuentes de información sobre un negocio:`,
    `- Lo que dice el microemprendedor: '${cleanRaw || '(Sin texto previo)'}'`,
    `- Observaciones técnicas del consultor: '${cleanNotes || '(Sin observaciones adicionales)'}'`,
    `Tu tarea es redactar una declaración formal, técnica y concisa para el campo '${fieldKey}' (Nombre del negocio: ${cleanBusiness}, Rubro: ${cleanSector}, Naturaleza: ${cleanNature}).`,
    `Integra la esencia de lo expresado por el emprendedor con las precisiones técnicas del consultor. No inventes cifras no mencionadas. Devuelve ÚNICAMENTE la redacción formal final sin encabezados ni introducciones.`
  ].join('\n');

  try {
    // 4. FLUJO PREFERENTE: Cloud Function grokProxy (Wala Serverless Seguro)
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth).catch(() => {});
      }
      if (auth.currentUser && functions) {
        const grokProxyFn = httpsCallable(functions, 'grokProxy');
        const proxyRes = await grokProxyFn({
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: userPrompt }
          ],
          model: 'grok-3-mini',
          temperature: 0.2,
          max_tokens: 1024
        });
        const rawContent = proxyRes?.data?.choices?.[0]?.message?.content || '';
        const refinedText = cleanGeneratedText(rawContent);
        if (refinedText) {
          return {
            success: true,
            refinedText,
            model: 'grok-3-mini (Cloud Function)',
            provider: 'xAI Grok / Wala Serverless',
            generatedAt: new Date().toISOString()
          };
        }
      }
    } catch (proxyErr) {
      console.warn('[AI Service] grokProxy Cloud Function no disponible, probando fallback directo:', proxyErr?.message || proxyErr);
    }

    // 5. FLUJO DE RESPALDO: Claves de API directas en frontend
    const xaiApiKey = getEnv('VITE_XAI_API_KEY') || getEnv('XAI_API_KEY');
    const geminiApiKey = getEnv('VITE_GEMINI_API_KEY');

    if (!xaiApiKey && !geminiApiKey) {
      return {
        error: 'CONFIG_ERROR',
        message: 'No se pudo conectar con el servicio de IA de Wala ni se encontró una clave de API configurada.'
      };
    }

    // 5.1 xAI (Grok API directo)
    if (xaiApiKey) {
      const model = getEnv('VITE_XAI_MODEL') || getEnv('XAI_MODEL') || 'grok-4.20-non-reasoning';
      const endpoint = 'https://api.x.ai/v1/chat/completions';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${xaiApiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: SYSTEM_INSTRUCTION
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        let errorMsg =
          errorJson.error?.message ||
          errorJson.error ||
          errorJson.message ||
          `Error al consultar Grok (${response.status}: ${response.statusText})`;

        if (response.status === 401) {
          errorMsg = 'Clave de API de Grok (xAI) inválida o expirada. Verifica tu configuración.';
        } else if (response.status === 429) {
          errorMsg = 'Límite de solicitudes o cuota agotada en la API de Grok (xAI).';
        }

        return {
          error: 'API_ERROR',
          message: errorMsg
        };
      }

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content || '';
      const refinedText = cleanGeneratedText(rawText);

      if (!refinedText) {
        return {
          error: 'EMPTY_RESPONSE',
          message: 'No se obtuvo una respuesta válida del asistente Grok.'
        };
      }

      return {
        success: true,
        refinedText,
        model,
        provider: 'Grok',
        generatedAt: new Date().toISOString()
      };
    }

    // 6. FLUJO DE RESPALDO: Google Gemini
    const geminiModel = getEnv('VITE_GEMINI_MODEL') || 'gemini-1.5-flash';
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: [
          {
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorJson = await geminiResponse.json().catch(() => ({}));
      const errorMsg =
        errorJson.error?.message ||
        `Error al consultar Gemini (${geminiResponse.status}: ${geminiResponse.statusText})`;
      return {
        error: 'API_ERROR',
        message: errorMsg
      };
    }

    const geminiData = await geminiResponse.json();
    const candidate = geminiData?.candidates?.[0];
    const rawRefined = candidate?.content?.parts?.[0]?.text || '';
    const refinedText = cleanGeneratedText(rawRefined);

    if (!refinedText) {
      return {
        error: 'EMPTY_RESPONSE',
        message: 'No se obtuvo una respuesta válida del asistente Gemini.'
      };
    }

    return {
      success: true,
      refinedText,
      model: geminiModel,
      provider: 'Gemini',
      generatedAt: new Date().toISOString()
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        error: 'TIMEOUT',
        message: `El asistente tardó demasiado en responder (tiempo límite de ${TIMEOUT_MS / 1000}s agotado). Inténtalo nuevamente.`
      };
    }
    return {
      error: 'NETWORK_ERROR',
      message: err.message || 'Error de conexión con el servicio de IA.'
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
