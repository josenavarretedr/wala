/* eslint-disable */

// /functions/src/lazyCloseIfNeeded.js
// Firebase Functions v2
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const { yesterdayStr } = require('../Helpers/time');
const { getDayAggregates, upsertDailySummary } = require('./sharedComputed');
const { breakStreak } = require('./sharedStreak');

const DEFAULT_TZ = 'America/Lima';

module.exports = onCall(async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'Auth requerido');
  }
  const businessId = request.data && request.data.businessId;
  if (!businessId) {
    throw new HttpsError('invalid-argument', 'businessId requerido');
  }

  const businessDoc = await db.doc(`businesses/${businessId}`).get();
  const tz = (businessDoc.exists && businessDoc.data().timezone) || DEFAULT_TZ;

  const day = yesterdayStr(tz);
  const agg = await getDayAggregates(db, businessId, day, tz);

  if (agg.hasOpening && !agg.hasClosure) {
    const txRef = db.collection(`businesses/${businessId}/transactions`).doc();
    await txRef.set({
      uuid: txRef.id,
      type: 'closure',
      description: 'Cierre automático (lazy-open)',
      source: 'copilot',
      copilotMode: 'lazyOpen',
      amount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await upsertDailySummary(db, businessId, day, {
      hasClosure: true,
      isAutoClosed: true,
      closureId: txRef.id,
      totals: agg.totals,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await breakStreak(db, businessId);
    return { closed: true, mode: 'lazyOpen', day };
  }

  return { closed: false, reason: 'no_missing_closure', day };
});
