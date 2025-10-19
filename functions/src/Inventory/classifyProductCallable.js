/* eslint-disable */

const functions = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const { classifyAndUpdate } = require("./helpers/classifyAndUpdate");

const XAI_API_KEY = defineSecret("XAI_API_KEY");
const GROK_MODEL = defineSecret("GROK_MODEL");

module.exports = functions
  .runWith({ secrets: [XAI_API_KEY, GROK_MODEL], timeoutSeconds: 120, memory: "256MB" })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Debe estar autenticado para usar esta función");
    }

    const { businessId, productId } = data || {};
    if (!businessId || !productId) {
      throw new functions.https.HttpsError("invalid-argument", "Faltan businessId o productId");
    }

    try {
      // En emulador, los secretos no funcionan igual - usar process.env directamente
      const apiKey = process.env.XAI_API_KEY || XAI_API_KEY.value();
      const model = process.env.GROK_MODEL || GROK_MODEL.value() || "grok-3-mini";

      const res = await classifyAndUpdate({ businessId, productId, apiKey, model, source: "ai:manual" });
      return res;
    } catch (error) {
      console.error("❌ Error en classifyProduct:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  });
