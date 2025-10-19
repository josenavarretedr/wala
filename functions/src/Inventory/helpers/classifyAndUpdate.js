/* eslint-disable */


const admin = require('firebase-admin');
const { callGrok } = require('../../Helpers/callAI');
const { buildPrompt } = require('./buildPrompt');

const db = admin.firestore();

async function classifyAndUpdate({ businessId, productId, apiKey, model, source }) {
  const businessRef = db.doc(`businesses/${businessId}`);
  const productRef = db.doc(`businesses/${businessId}/products/${productId}`);
  const [businessSnap, productSnap] = await Promise.all([businessRef.get(), productRef.get()]);

  if (!productSnap.exists) throw new Error('Producto no encontrado');
  const business = businessSnap.data() || {};
  const product = productSnap.data() || {};

  console.log(`🔍 classifyAndUpdate - API key longitud: ${apiKey ? apiKey.length : 0}, primeros 15: ${apiKey ? apiKey.substring(0, 15) : 'undefined'}`);

  const prompt = buildPrompt({ business, product });
  const parsed = await callGrok({ apiKey, model, prompt });

  const classification = {
    ...parsed,
    model,
    source,
    taxonomyVersion: 'inv-1.0',
    lastClassifiedAt: admin.firestore.Timestamp.now(),
  };

  await productRef.set({ classification }, { merge: true });
  return classification;
}

module.exports = { classifyAndUpdate };
