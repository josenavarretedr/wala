/* eslint-disable */

// /functions/src/sharedStreak.js
const { dayMinus } = require('../Helpers/time');

async function breakStreak(db, businessId) {
  const ref = db.doc(`businesses/${businessId}/metadata/streak`);
  const snap = await ref.get();
  const prev = snap.exists ? snap.data() : { current: 0, max: 0, lastCompletedDay: null, copilotDays: 0 };
  await ref.set({
    ...prev,
    current: 0,
    copilotDays: (prev.copilotDays || 0) + 1
  }, { merge: false });
}

async function incStreakIfConsecutive(db, businessId, day, tz = 'America/Lima') {
  const ref = db.doc(`businesses/${businessId}/metadata/streak`);
  const snap = await ref.get();
  const prev = snap.exists ? snap.data() : { current: 0, max: 0, lastCompletedDay: null, copilotDays: 0 };

  const prevDay = dayMinus(day, 1, tz);
  const current = (prev.lastCompletedDay === prevDay) ? (prev.current + 1) : 1;

  await ref.set({
    current,
    max: Math.max(prev.max || 0, current),
    lastCompletedDay: day,
    copilotDays: prev.copilotDays || 0
  }, { merge: false });
}

module.exports = { breakStreak, incStreakIfConsecutive };
