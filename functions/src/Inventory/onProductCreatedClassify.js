/* eslint-disable */


const functions = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { classifyAndUpdate } = require("./helpers/classifyAndUpdate");

const XAI_API_KEY = defineSecret("XAI_API_KEY");
const GROK_MODEL = defineSecret("GROK_MODEL");

if (!admin.apps.length) admin.initializeApp();

module.exports = functions
  .runWith({ secrets: [XAI_API_KEY, GROK_MODEL], timeoutSeconds: 120, memory: "256MB" })
  .firestore.document("businesses/{businessId}/products/{productId}")
  .onCreate(async (snap, context) => {
    try {
      const { businessId, productId } = context.params;
      // En emulador, los secretos no funcionan igual - usar process.env directamente
      const apiKey = process.env.XAI_API_KEY || XAI_API_KEY.value();
      const model = process.env.GROK_MODEL || GROK_MODEL.value() || "grok-3-mini";

      console.log(`🔑 API Key - Longitud: ${apiKey ? apiKey.length : 0}, Primeros 15 chars: ${apiKey && apiKey.substring(0, 15)}, Últimos 10: ${apiKey && apiKey.substring(apiKey.length - 10)}`);
      console.log(`🤖 Modelo: ${model}`);

      await classifyAndUpdate({ businessId, productId, apiKey, model, source: "ai:auto" });
      console.log(`✅ Auto clasificación completada para ${businessId}/${productId}`);
      return null;
    } catch (error) {
      console.error("❌ Error en onProductCreatedClassify:", error);
      return null;
    }
  });
