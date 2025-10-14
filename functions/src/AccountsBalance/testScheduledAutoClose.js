/* eslint-disable */

const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore'); // ✅ Importación directa

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const { yesterdayStr } = require('../Helpers/time');
const { getDayAggregates, upsertDailySummary } = require('./sharedComputed');
const { breakStreak, incStreakIfConsecutive } = require('./sharedStreak');

const DEFAULT_TZ = 'America/Lima';

module.exports = onRequest(async (request, response) => {
  try {
    console.log('🧪 TEST: scheduledAutoClose');

    // Permite pasar un businessId específico para testing
    const testBusinessId = request.query.businessId;

    let businesses;
    if (testBusinessId) {
      const doc = await db.doc(`businesses/${testBusinessId}`).get();
      if (!doc.exists) {
        return response.status(404).json({
          success: false,
          error: `Negocio ${testBusinessId} no encontrado`
        });
      }
      businesses = { docs: [doc], size: 1 };
      console.log(`🎯 Probando solo negocio: ${testBusinessId}`);
    } else {
      businesses = await db.collection('businesses').get(); // ✅ Removido .select()
      console.log(`📊 Probando ${businesses.size} negocios`);
    }

    const results = [];

    for (const b of businesses.docs) {
      if (!b.exists) {
        console.log('⚠️ Documento no existe, saltando...');
        continue;
      }

      const businessId = b.id;
      const businessData = b.data();
      const tz = (businessData && businessData.timezone) || DEFAULT_TZ;

      console.log(`\n🏪 Negocio: ${businessId}`);

      const day = yesterdayStr(tz);
      console.log(`📅 Día: ${day}`);

      const agg = await getDayAggregates(db, businessId, day, tz);
      console.log(`📊 Agregados:`, JSON.stringify(agg, null, 2));

      await upsertDailySummary(db, businessId, day, {
        hasOpening: agg.hasOpening,
        hasTxn: agg.hasTxn,
        hasClosure: agg.hasClosure,
        totals: agg.totals
      });

      let action = 'none';

      if (agg.hasOpening && !agg.hasClosure) {
        console.log(`⚠️  ABIERTO sin cierre - Creando cierre automático`);

        const txRef = db.collection(`businesses/${businessId}/transactions`).doc();
        await txRef.set({
          uuid: txRef.id,
          type: 'closure',
          description: 'Cierre automático (copiloto TEST)',
          source: 'copilot',
          copilotMode: 'test',
          amount: 0,
          createdAt: FieldValue.serverTimestamp() // ✅ Usando FieldValue
        });

        await upsertDailySummary(db, businessId, day, {
          hasClosure: true,
          isAutoClosed: true,
          closureId: txRef.id,
          completedAt: FieldValue.serverTimestamp() // ✅ Usando FieldValue
        });

        await breakStreak(db, businessId);
        action = 'auto-closed';
        console.log(`✅ Cierre creado: ${txRef.id}`);

      } else if (agg.hasOpening && agg.hasTxn && agg.hasClosure) {
        console.log(`✨ Día completo - Incrementando racha`);
        await incStreakIfConsecutive(db, businessId, day, tz);
        action = 'streak-increased';
      } else {
        console.log(`ℹ️  Sin acción necesaria`);
      }

      results.push({
        businessId,
        day,
        action,
        aggregates: agg
      });
    }

    console.log('\n✅ TEST completado');
    response.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error:', error);
    response.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});