/* eslint-disable */

// /functions/src/sharedCompute.js
const { dateRangeForDay } = require('../Helpers/time');

async function getDayAggregates(db, businessId, day, tz = 'America/Lima') {
  const { start, end } = dateRangeForDay(day, tz);

  const txSnap = await db.collection(`businesses/${businessId}/transactions`)
    .where('createdAt', '>=', start)
    .where('createdAt', '<=', end)
    .get();

  let hasOpening = false, hasClosure = false, hasTxn = false;
  let income = 0, expense = 0;

  txSnap.forEach(doc => {
    const t = doc.data() || {};
    if (t.type === 'opening') hasOpening = true;
    if (t.type === 'closure') hasClosure = true;
    if (t.type === 'income') { hasTxn = true; income += Number(t.amount || 0); }
    if (t.type === 'expense') { hasTxn = true; expense += Number(t.amount || 0); }
    if (t.type === 'transfer') { hasTxn = true; }
  });

  return {
    hasOpening, hasClosure, hasTxn,
    totals: { income, expense, net: income - expense }
  };
}

async function upsertDailySummary(db, businessId, day, patch) {
  const ref = db.doc(`businesses/${businessId}/dailySummaries/${day}`);
  await ref.set({ day, ...patch }, { merge: true });
  return ref;
}

module.exports = { getDayAggregates, upsertDailySummary };
