import { signInAnonymously } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../config/firebase';

const GEMINI_TIMEOUT_MS = 45000;
const GEMINI_RETRY_DELAY_MS = 1500;
const GROK_PROXY_TIMEOUT_MS = 300000;
const TRANSIENT_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Limpia posibles bloques Markdown alrededor de un JSON y lo parsea.
 */
function parseJsonResponse(rawText, providerLabel) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error(`${providerLabel} devolvió una respuesta vacía.`);
  }

  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`${providerLabel} no devolvió un JSON válido. Respuesta cruda: ${rawText}`);
  }
}

function isTransientGeminiError(err) {
  if (!err) return false;
  if (TRANSIENT_STATUS_CODES.has(err.status)) return true;
  if (err.name === 'AbortError' || err.name === 'TypeError') return true;
  const msg = String(err.message || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('resource_exhausted')
  );
}

function getGeminiModelCandidates() {
  const primary = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
  const fallbacksRaw = import.meta.env.VITE_GEMINI_FALLBACK_MODELS || 'gemini-2.5-flash-lite,gemini-2.0-flash';
  const fallbacks = fallbacksRaw
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

  return Array.from(new Set([primary, ...fallbacks]));
}

async function callGeminiModel({ model, apiKey, system, context, user }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: user }]
          }
        ],
        systemInstruction: {
          parts: [
            {
              text: system + '\n\n---\n\n## RUTAS MAESTRAS (referencia):\n' + context
            }
          ]
        },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 8000
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      const err = new Error(`Error en API de Gemini (${model}): ${response.status} ${response.statusText} - ${errorBody}`);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      throw new Error(`La API de Gemini (${model}) no devolvió ningún candidato de respuesta válido.`);
    }

    return parseJsonResponse(raw, `Gemini (${model})`);
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`Tiempo de espera agotado (${GEMINI_TIMEOUT_MS / 1000}s) con Gemini (${model}).`);
      timeoutErr.name = 'AbortError';
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGrokFallback({ system, context, user, onStatus }) {
  const grokModel = import.meta.env.VITE_GROK_MODEL || 'grok-3';
  onStatus?.(`Gemini no disponible. Generando guión con respaldo Grok (${grokModel})...`);

  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (authErr) {
      throw new Error(
        `No se pudo autenticar sesión anónima en Firebase para usar el respaldo Grok: ${authErr?.message || authErr}`
      );
    }
  }

  const grokProxyFn = httpsCallable(functions, 'grokProxy', {
    timeout: GROK_PROXY_TIMEOUT_MS
  });

  const proxyRes = await grokProxyFn({
    messages: [
      {
        role: 'system',
        content: system + '\n\n---\n\n## RUTAS MAESTRAS (referencia):\n' + context
      },
      {
        role: 'user',
        content: user
      }
    ],
    model: grokModel,
    temperature: 0.7,
    max_tokens: 8000,
    response_format: { type: 'json_object' }
  });

  const raw = proxyRes?.data?.content;
  if (!raw) {
    throw new Error(`La Cloud Function grokProxy (${grokModel}) no devolvió contenido.`);
  }

  return parseJsonResponse(raw, `Grok (${grokModel})`);
}

/**
 * Genera un guión usando Gemini (con reintentos y modelos alternativos)
 * y hace fallback automático a Grok (xAI) vía Cloud Function grokProxy.
 */
export async function generateScript(promptData, options = {}) {
  const { system, context, user } = promptData;
  const { onStatus } = options;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const geminiErrors = [];

  if (apiKey) {
    const models = getGeminiModelCandidates();

    for (let i = 0; i < models.length; i += 1) {
      const model = models[i];
      if (i > 0) {
        onStatus?.(`Reintentando con modelo Gemini alternativo (${model})...`);
      }

      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          return await callGeminiModel({ model, apiKey, system, context, user });
        } catch (err) {
          console.warn(`[llmService] Fallo en ${model} (intento ${attempt}):`, err?.message || err);
          geminiErrors.push(`${model}: ${err?.message || err}`);

          if (attempt === 1 && isTransientGeminiError(err)) {
            await sleep(GEMINI_RETRY_DELAY_MS);
            continue;
          }
          break;
        }
      }
    }
  } else {
    geminiErrors.push('No se encontró VITE_GEMINI_API_KEY en las variables de entorno.');
  }

  try {
    return await callGrokFallback({ system, context, user, onStatus });
  } catch (grokErr) {
    const lastGeminiError = geminiErrors[geminiErrors.length - 1] || 'Sin detalle';
    throw new Error(
      `No se pudo generar el guión en Gemini ni en el respaldo Grok. ` +
      `Último error Gemini: ${lastGeminiError} | Error Grok: ${grokErr?.message || grokErr}`
    );
  }
}
