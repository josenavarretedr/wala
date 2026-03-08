/* eslint-disable */

const functions = require("firebase-functions");
const { OpenAI } = require("openai");

/**
 * Cloud Function Callable: Proxy para llamadas a la API de Grok (xAI).
 *
 * Resuelve el problema de CORS al llamar a api.x.ai desde el navegador.
 * El frontend envía los parámetros de la petición y esta función la ejecuta
 * server-side donde no existen restricciones CORS.
 *
 * @param {Object} data
 * @param {Array}  data.messages    - Array de mensajes [{role, content}]
 * @param {string} [data.model]     - Modelo a usar (default: grok-3-mini)
 * @param {number} [data.temperature] - Temperatura (default: 0.7)
 * @param {number} [data.max_tokens]  - Máx tokens (default: 1000)
 * @param {Object} [data.response_format] - Formato de respuesta (e.g. {type:"json_object"})
 */
exports.grokProxy = functions
  .region("southamerica-east1")
  .runWith({ timeoutSeconds: 300, memory: "512MB" })
  .https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Debes estar autenticado para usar esta función."
      );
    }

    const { messages, model, temperature, max_tokens, response_format } = data;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        'Se requiere un array "messages" con al menos un mensaje.'
      );
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      console.error("XAI_API_KEY no está configurada en las variables de entorno.");
      throw new functions.https.HttpsError(
        "failed-precondition",
        "La API key de Grok no está configurada en el servidor."
      );
    }

    try {
      const client = new OpenAI({
        apiKey,
        baseURL: "https://api.x.ai/v1",
      });

      // Opción C: Modelo por entorno
      // En emulador local usa grok-3-mini (rápido), en producción usa grok-3 (mejor calidad)
      const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
      const defaultModel = isEmulator
        ? 'grok-3-mini'
        : (process.env.GROK_MODEL || 'grok-3-mini');

      const selectedModel = model || defaultModel;
      console.log(`🤖 grokProxy: modelo=${selectedModel}, emulador=${isEmulator}, max_tokens=${max_tokens ?? 1000}`);

      const params = {
        model: selectedModel,
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 1000,
      };

      if (response_format) {
        params.response_format = response_format;
      }

      const response = await client.chat.completions.create(params);

      return {
        content: response.choices?.[0]?.message?.content || "",
        usage: response.usage || null,
      };
    } catch (err) {
      console.error("Error en grokProxy:", err.message);
      throw new functions.https.HttpsError(
        "internal",
        "Error al comunicarse con la API de Grok: " + (err.message || "desconocido")
      );
    }
  });
