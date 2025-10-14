/* eslint-disable */

// /functions/src/scheduledAutoClose.js
// Firebase Functions v2
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const {
  yesterdayStr,
  dateRangeForDay,
} = require('../Helpers/time');

// helpers de negocio (agregados, summary y racha)
const { getDayAggregates, upsertDailySummary } = require('./sharedComputed');
const { breakStreak, incStreakIfConsecutive } = require('./sharedStreak');

// OPCIONAL: resolver tz por negocio (si guardas timezone en doc business)
// de momento usar default 'America/Lima'
const DEFAULT_TZ = 'America/Lima';

module.exports = onSchedule(
  {
    schedule: '5 0 * * *', // 00:05 Lima
    timeZone: 'America/Lima',
  },
  async (event) => {
    const businesses = await db.collection('businesses').select().get();

    for (const b of businesses.docs) {
      const businessId = b.id;
      const tz = (b.data() && b.data().timezone) || DEFAULT_TZ;

      const day = yesterdayStr(tz);
      const agg = await getDayAggregates(db, businessId, day, tz);

      // Actualiza summary base
      await upsertDailySummary(db, businessId, day, {
        hasOpening: agg.hasOpening,
        hasTxn: agg.hasTxn,
        hasClosure: agg.hasClosure,
        totals: agg.totals
      });

      // Si hubo apertura y NO cierre => autocierre + romper racha
      if (agg.hasOpening && !agg.hasClosure) {
        const txRef = db.collection(`businesses/${businessId}/transactions`).doc();
        await txRef.set({
          uuid: txRef.id,
          type: 'closure',
          description: 'Cierre automático (copiloto)',
          source: 'copilot',
          copilotMode: 'cron',
          amount: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await upsertDailySummary(db, businessId, day, {
          hasClosure: true,
          isAutoClosed: true,
          closureId: txRef.id,
          completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await breakStreak(db, businessId);
      } else if (agg.hasOpening && agg.hasTxn && agg.hasClosure) {
        // Suma racha (opcional: verificar que el cierre sea source:'user')
        await incStreakIfConsecutive(db, businessId, day, tz);
      }
    }
    return null;
  }
);
