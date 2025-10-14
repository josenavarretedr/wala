/* eslint-disable */


// /functions/src/onTransactionWrite.js
// Firebase Functions v2
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const { dayFromTimestamp } = require('../Helpers/time');
const { getDayAggregates, upsertDailySummary } = require('./sharedComputed');

const DEFAULT_TZ = 'America/Lima';

module.exports = onDocumentWritten(
  'businesses/{businessId}/transactions/{txId}',
  async (event) => {
    const { businessId } = event.params;

    // Usa after si existe; si se borró, usa before (para recalcular el día)
    const doc = event.data.after.exists ? event.data.after.data() : (event.data.before.exists ? event.data.before.data() : null);
    if (!doc) return null;

    // Resolver tz del negocio (si guardas en doc); default Lima
    const businessDoc = await db.doc(`businesses/${businessId}`).get();
    const tz = (businessDoc.exists && businessDoc.data().timezone) || DEFAULT_TZ;

    const day = dayFromTimestamp(doc.createdAt, tz);

    const agg = await getDayAggregates(db, businessId, day, tz);
    await upsertDailySummary(db, businessId, day, {
      hasOpening: agg.hasOpening,
      hasTxn: agg.hasTxn,
      hasClosure: agg.hasClosure,
      totals: agg.totals
    });
    return null;
  }
);
