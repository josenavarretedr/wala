/* eslint-disable */
// sharedStreak.js

/**
 * @file sharedStreak.js
 * @description Funciones para manejar las rachas de días consecutivos.
 * Trackea la consistencia en el uso del sistema.
 * 
 * Infraestructura consistente con:
 * - businessStore.js (datos del negocio)
 * - Sistema de gamificación/engagement
 * 
 * ESTRUCTURA DE DATOS:
 * El streak se guarda directamente como campo en el documento del negocio:
 * 
 * businesses/{businessId}
 * └── streak: {
 *       current: number,          // Racha actual de días consecutivos
 *       max: number,              // Racha máxima alcanzada
 *       lastCompletedDay: string, // Último día completado (yyyy-LL-dd)
 *       copilotDays: number,      // Días cerrados automáticamente
 *       updatedAt: string         // ISO timestamp
 *     }
 * 
 * @module AccountsBalance/sharedStreak
 */

const { dayMinus } = require('../Helpers/time');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * Obtiene el streak actual del negocio desde el documento principal.
 * 
 * @param {FirebaseFirestore.Firestore} db - Instancia de Firestore
 * @param {string} businessId - ID del negocio
 * @returns {Promise<Object>} Objeto con datos del streak
 */
async function getStreak(db, businessId) {
  const businessRef = db.doc(`businesses/${businessId}`);
  const businessSnap = await businessRef.get();

  if (!businessSnap.exists) {
    console.warn(`⚠️ Business ${businessId} not found`);
    return {
      current: 0,
      max: 0,
      lastCompletedDay: null,
      copilotDays: 0
    };
  }

  const businessData = businessSnap.data();

  // Retornar streak existente o valores por defecto
  return businessData.streak || {
    current: 0,
    max: 0,
    lastCompletedDay: null,
    copilotDays: 0
  };
}

/**
 * Rompe la racha de días consecutivos.
 * Se ejecuta cuando se cierra automáticamente un día (no manualmente).
 * 
 * @param {FirebaseFirestore.Firestore} db - Instancia de Firestore
 * @param {string} businessId - ID del negocio
 * 
 * Flujo:
 * 1. Obtiene el streak actual del documento del negocio
 * 2. Resetea current a 0
 * 3. Mantiene el max
 * 4. Incrementa copilotDays
 * 5. Actualiza el campo streak en el documento del negocio
 * 
 * Estructura del campo streak:
 * - current: number - Racha actual de días consecutivos
 * - max: number - Racha máxima alcanzada
 * - lastCompletedDay: string - Último día completado (yyyy-LL-dd)
 * - copilotDays: number - Días cerrados automáticamente por copilot
 * - brokenAt: string - ISO timestamp cuando se rompió
 * - updatedAt: string - ISO timestamp de última actualización
 */
async function breakStreak(db, businessId) {
  console.log(`📉 Breaking streak for business ${businessId}`);

  const businessRef = db.doc(`businesses/${businessId}`);
  const prev = await getStreak(db, businessId);

  // Construir el objeto newStreak base
  const newStreak = {
    current: 0, // Resetear racha actual
    max: prev.max || 0, // Mantener máxima
    copilotDays: (prev.copilotDays || 0) + 1, // Incrementar días de copilot
    brokenAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Solo incluir lastCompletedDay si existe
  if (prev.lastCompletedDay != null) {
    newStreak.lastCompletedDay = prev.lastCompletedDay;
  }
  // Si no existe, simplemente no lo incluimos (no usamos FieldValue.delete en objeto anidado)

  // Actualizar solo el campo streak en el documento del negocio
  await businessRef.update({
    streak: newStreak
  });

  console.log(`✅ Streak broken and saved in business document`);
  console.log(`   Previous streak: ${prev.current} days`);
  console.log(`   Copilot days: ${newStreak.copilotDays}`);
  console.log(`   Max streak maintained: ${newStreak.max} days`);
}

/**
 * Incrementa la racha si el día es consecutivo al anterior.
 * Se ejecuta cuando un día se completa manualmente (apertura + transacciones + cierre).
 * 
 * @param {FirebaseFirestore.Firestore} db - Instancia de Firestore
 * @param {string} businessId - ID del negocio
 * @param {string} day - Día completado (yyyy-LL-dd)
 * @param {string} tz - Timezone (default: 'America/Lima')
 * 
 * Lógica:
 * - Si el día anterior es consecutivo: incrementa racha
 * - Si no es consecutivo: reinicia racha a 1
 * - Siempre actualiza el máximo si se supera
 * - NO incrementa copilotDays (es cierre manual)
 */
async function incStreakIfConsecutive(db, businessId, day, tz = 'America/Lima') {
  console.log(`📈 Checking streak for business ${businessId}, day ${day}`);

  const businessRef = db.doc(`businesses/${businessId}`);
  const prev = await getStreak(db, businessId);

  // Calcular día anterior
  const prevDay = dayMinus(day, 1, tz);

  // Determinar nueva racha
  const isConsecutive = prev.lastCompletedDay === prevDay;
  const current = isConsecutive ? (prev.current + 1) : 1;

  console.log(`  📅 Previous day: ${prevDay}`);
  console.log(`  📅 Last completed: ${prev.lastCompletedDay}`);
  console.log(`  ${isConsecutive ? '✅' : '❌'} Is consecutive: ${isConsecutive}`);
  console.log(`  📊 New streak: ${current} days`);

  const newStreak = {
    current,
    max: Math.max(prev.max || 0, current), // Actualizar máximo si es necesario
    lastCompletedDay: day,
    copilotDays: prev.copilotDays || 0, // Mantener copilotDays (no incrementar en cierre manual)
    updatedAt: new Date().toISOString()
  };

  // Actualizar solo el campo streak en el documento del negocio
  await businessRef.update({
    streak: newStreak
  });

  console.log(`✅ Streak updated and saved in business document`);
  console.log(`   Current streak: ${current} days`);
  console.log(`   Max streak: ${newStreak.max} days`);
  console.log(`   ${isConsecutive ? '🔥 Streak continued!' : '🆕 New streak started'}`);
}

module.exports = {
  getStreak,
  breakStreak,
  incStreakIfConsecutive
};
