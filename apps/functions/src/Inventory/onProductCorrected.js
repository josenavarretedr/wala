/* eslint-disable */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function Trigger: onUpdate en products
 * Detecta cuando un usuario corrige una clasificación
 */
exports.onProductCorrected = functions
  .region('southamerica-east1')
  .firestore
  .document('businesses/{businessId}/products/{productId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    try {
      // Detectar cambio en classification
      if (!before.classification || !after.classification) {
        return null;
      }

      const classificationChanged =
        before.classification.category !== after.classification.category ||
        before.classification.subcategory !== after.classification.subcategory ||
        before.classification.subsubcategory !== after.classification.subsubcategory;

      if (!classificationChanged) {
        return null;
      }

      console.log(`📝 Clasificación corregida en producto: ${after.description}`);
      console.log(`   Antes: ${before.classification.category} > ${before.classification.subcategory}`);
      console.log(`   Después: ${after.classification.category} > ${after.classification.subcategory}`);

      // Actualizar registro de corrección
      await change.after.ref.update({
        'classification.humanReviewed': true,
        'classification.humanCorrectedAt': admin.firestore.FieldValue.serverTimestamp(),
        'classification.correctedFrom': {
          category: before.classification.category,
          subcategory: before.classification.subcategory,
          subsubcategory: before.classification.subsubcategory,
          source: before.classification.source
        }
      });

      // Si fue una regla, actualizar su successRate
      if (before.classification.source === 'rules' && before.classification.ruleId) {
        const { businessId } = context.params;
        const businessDoc = await admin.firestore()
          .collection('businesses')
          .doc(businessId)
          .get();

        if (businessDoc.exists) {
          const industry = businessDoc.data().industry || 'otro';

          // Actualizar estadísticas de la regla
          const taxonomyRef = admin.firestore()
            .collection('wala_global')
            .doc('taxonomies')
            .collection(industry)
            .doc('main');

          await admin.firestore().runTransaction(async (transaction) => {
            const taxonomyDoc = await transaction.get(taxonomyRef);

            if (taxonomyDoc.exists) {
              const data = taxonomyDoc.data();
              const rules = data.rules || [];

              const ruleIndex = rules.findIndex(r => r.ruleId === before.classification.ruleId);

              if (ruleIndex >= 0) {
                const rule = rules[ruleIndex];
                const corrections = (rule.corrections || 0) + 1;
                const totalUses = rule.usageCount || 1;
                const successRate = Math.max(0, (totalUses - corrections) / totalUses);

                rules[ruleIndex] = {
                  ...rule,
                  corrections,
                  successRate
                };

                transaction.update(taxonomyRef, { rules });
                console.log(`📊 Actualizada regla ${rule.ruleId}: successRate = ${(successRate * 100).toFixed(1)}%`);
              }
            }
          });
        }
      }

      return null;

    } catch (error) {
      console.error('❌ Error en onProductCorrected:', error);
      return null;
    }
  });
