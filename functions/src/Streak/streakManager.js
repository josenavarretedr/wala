/* eslint-disable */
const { DateTime } = require('luxon');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

// ====== CONFIG ======
const DEFAULT_TZ = 'America/Lima';
const DAYS_HISTORY = 90;
const MIN_ALLOWED_GAP = 5;
const MAX_ALLOWED_GAP = 14;

// ====== TIME HELPERS ======
const toYmd = (d, tz = DEFAULT_TZ) => DateTime.fromJSDate(d).setZone(tz).toFormat('yyyy-LL-dd');
const daysBetweenYmd = (a, b, tz = DEFAULT_TZ) => {
  const d1 = DateTime.fromFormat(a, 'yyyy-LL-dd', { zone: tz }).startOf('day');
  const d2 = DateTime.fromFormat(b, 'yyyy-LL-dd', { zone: tz }).startOf('day');
  return Math.round(d2.diff(d1, 'days').days);
};

// ====== MATH HELPERS ======
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function median(nums) {
  if (!nums || !nums.length) return 0;
  const arr = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

// ====== MODELLING ======
function calcAllowedGap(medianGap) {
  const raw = Math.round((medianGap || 0) * 1.5);
  return clamp(raw || MIN_ALLOWED_GAP, MIN_ALLOWED_GAP, MAX_ALLOWED_GAP);
}
function decideMode(medianGap) {
  if (medianGap <= 1) return 'daily';
  if (medianGap <= 3) return 'weekly'; // tratamos weekly como daily suavizado
  return 'eventual';
}
/**
 * Determina si un día es activo basándose en el campo hasTxn del dailySummary.
 * 
 * Un día es activo cuando hasTxn === true, lo cual sucede cuando hay:
 * ✅ Transacciones de income (que no sean adjustments)
 * ✅ Transacciones de expense (que no sean adjustments)
 * 
 * NO cuentan como días activos:
 * ❌ Solo transferencias (transfer)
 * ❌ Solo ajustes (adjustment)
 * ❌ Solo apertura/cierre (opening/closure)
 * 
 * @param {Object} summaryDoc - Documento de dailySummary
 * @returns {boolean} - true si el día es activo
 */
function isActiveDay(summaryDoc) {
  return !!(summaryDoc && summaryDoc.hasTxn === true);
}
function wasCopilotClosed(summaryDoc) {
  return !!(summaryDoc && summaryDoc.isAutoClosed === true);
}

// ====== FIRESTORE GETTERS ======
async function getSummary(db, businessId, day) {
  const ref = db.doc(`businesses/${businessId}/dailySummaries/${day}`);
  const snap = await ref.get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}
async function getOrInitStreak(db, businessId) {
  // Guardar streak como campo dentro del documento del negocio
  const ref = db.doc(`businesses/${businessId}`);
  const snap = await ref.get();
  console.log('🔍 [STREAK] getOrInitStreak - businessId:', businessId, 'existe:', snap.exists);

  if (snap.exists) {
    const businessData = snap.data();
    const streakData = businessData.streak || null;
    console.log('🔍 [STREAK] Datos del negocio:', businessData ? 'existe' : 'null');
    console.log('🔍 [STREAK] Streak existente:', streakData);

    if (streakData) {
      return { ref, data: streakData };
    }
  }

  // Inicializar streak como campo dentro del documento business
  const init = {
    mode: 'auto',
    current: 0,
    max: 0,
    lastActiveDay: null,
    medianGap: 0,
    allowedGap: MIN_ALLOWED_GAP,
    copilotAssistedSessions: 0,
    lastUpdated: FieldValue.serverTimestamp()
  };
  console.log('⚠️ [STREAK] Inicializando nuevo streak:', init);

  await ref.set({ streak: init }, { merge: true });
  return { ref, data: init };
}
async function getActiveDaysHistory(db, businessId, tz = DEFAULT_TZ) {
  const today = DateTime.now().setZone(tz);
  const start = today.minus({ days: DAYS_HISTORY }).toFormat('yyyy-LL-dd');
  console.log('📊 [STREAK] Consultando historial de días activos desde:', start);
  try {
    const snap = await db.collection(`businesses/${businessId}/dailySummaries`)
      .where('hasTxn', '==', true)
      .where('day', '>=', start)
      .orderBy('day', 'asc')
      .get();
    const days = [];
    snap.forEach(d => { const v = d.data(); if (v && typeof v.day === 'string') days.push(v.day); });
    console.log('📊 [STREAK] Días activos encontrados:', days.length);
    return days;
  } catch (error) {
    console.error('❌ [STREAK] Error al consultar días activos:', error.message);
    console.error('❌ [STREAK] Si el error menciona "requires an index", despliega los índices con: firebase deploy --only firestore:indexes');
    return [];
  }
}
function computeMedianGapFromDays(days, tz = DEFAULT_TZ) {
  if (!days || days.length < 2) return 0;
  const gaps = [];
  for (let i = 1; i < days.length; i++) gaps.push(daysBetweenYmd(days[i - 1], days[i], tz));
  return median(gaps);
}

// ====== CORE ======
/**
 * Actualiza la racha contextualizada después de cerrar un día (manual o auto).
 * - Suma solo en días activos (hasTxn=true)
 * - En modo 'eventual': auto-cierre con actividad SÍ suma.
 * - En modo 'daily': puedes forzar política 'strict' para NO sumar auto-cierre.
 */
async function updateStreakContextualizada({
  db,
  businessId,
  day,
  summary = null,
  tz = DEFAULT_TZ,
  forceRecalc = false,
  autoClosePolicy = 'lenient' // 'strict' | 'lenient'
}) {
  console.log('🔵 [STREAK] Iniciando updateStreakContextualizada', { businessId, day, forceRecalc, autoClosePolicy });

  if (!db || !businessId || !day) throw new Error('db, businessId y day son requeridos');

  const summaryDoc = summary || await getSummary(db, businessId, day);
  console.log('🔵 [STREAK] SummaryDoc obtenido:', summaryDoc);
  if (!summaryDoc) return { updated: false, streak: null, reason: 'no-summary' };

  const { ref: streakRef, data: streak } = await getOrInitStreak(db, businessId);
  console.log('🔵 [STREAK] Streak actual obtenido:', streak);

  let mode = streak.mode || 'auto';
  let medianGap = streak.medianGap || 0;
  let allowedGap = streak.allowedGap || MIN_ALLOWED_GAP;
  console.log('🔵 [STREAK] Valores iniciales - mode:', mode, 'medianGap:', medianGap, 'allowedGap:', allowedGap);

  if (mode === 'auto' && (forceRecalc || !medianGap || !allowedGap)) {
    console.log('🟡 [STREAK] Recalculando ritmo automático...');
    const activeDays = await getActiveDaysHistory(db, businessId, tz);
    console.log('🟡 [STREAK] Días activos en historial:', activeDays);
    const md = computeMedianGapFromDays(activeDays, tz);
    const ag = calcAllowedGap(md);
    const autoMode = decideMode(md);
    console.log('🟡 [STREAK] Valores calculados - medianGap:', md, 'allowedGap:', ag, 'autoMode:', autoMode);
    medianGap = md;
    allowedGap = ag;
    mode = (autoMode === 'weekly') ? 'daily' : autoMode;
    // Actualizar campo streak dentro del documento business
    await streakRef.set({
      streak: { medianGap, allowedGap, mode, lastUpdated: FieldValue.serverTimestamp() }
    }, { merge: true });
    console.log('🟡 [STREAK] Ritmo actualizado en Firestore');
  }

  const active = isActiveDay(summaryDoc);
  const copilotClosed = wasCopilotClosed(summaryDoc);
  console.log('🔵 [STREAK] Estado del día - active:', active, 'copilotClosed:', copilotClosed);

  let canCount = active;
  if (mode === 'daily' && copilotClosed && autoClosePolicy === 'strict') {
    canCount = false;
  }
  console.log('🔵 [STREAK] ¿Puede contar? canCount:', canCount, '(mode:', mode, 'autoClosePolicy:', autoClosePolicy + ')');

  if (!canCount) {
    console.log('🔴 [STREAK] NO SE CUENTA - Saliendo sin actualizar streak');
    // Actualizar campo streak dentro del documento business
    await streakRef.set({
      streak: { ...streak, lastUpdated: FieldValue.serverTimestamp() }
    }, { merge: true });
    return { updated: false, streak: { ...streak, mode, medianGap, allowedGap }, reason: 'not-counting' };
  }

  const lastActiveDay = streak.lastActiveDay || null;
  console.log('🟢 [STREAK] Calculando nueva racha - lastActiveDay:', lastActiveDay, 'current actual:', streak.current);

  // ⚠️ CRÍTICO: Solo incrementar si es un día DIFERENTE al último día activo
  if (lastActiveDay === day) {
    console.log('⏭️ [STREAK] Ya se contó este día (' + day + '), saltando actualización');
    // Actualizar solo el timestamp sin cambiar valores
    await streakRef.set({
      streak: { ...streak, lastUpdated: FieldValue.serverTimestamp() }
    }, { merge: true });
    return {
      updated: false,
      streak: { ...streak, mode, medianGap, allowedGap },
      reason: 'already-counted-today'
    };
  }

  let newCurrent = 1;
  if (lastActiveDay) {
    const gap = daysBetweenYmd(lastActiveDay, day, tz);
    console.log('🟢 [STREAK] Gap entre días:', gap, '(permitido:', allowedGap + ')');
    newCurrent = (gap <= allowedGap) ? (Number(streak.current || 0) + 1) : 1;
    console.log('🟢 [STREAK] Nueva racha calculada - newCurrent:', newCurrent);
  } else {
    console.log('🟢 [STREAK] Primera actividad - newCurrent:', newCurrent);
  }

  const newMax = Math.max(Number(streak.max || 0), newCurrent);
  const copilotAssistedSessions = Number(streak.copilotAssistedSessions || 0) + (copilotClosed ? 1 : 0);
  console.log('🟢 [STREAK] Valores finales - newCurrent:', newCurrent, 'newMax:', newMax, 'copilotAssistedSessions:', copilotAssistedSessions);

  // Actualizar campo streak dentro del documento business
  const dataToSet = {
    streak: {
      current: newCurrent,
      max: newMax,
      lastActiveDay: day,
      medianGap,
      allowedGap,
      mode,
      copilotAssistedSessions,
      lastUpdated: FieldValue.serverTimestamp()
    }
  };
  console.log('✅ [STREAK] GUARDANDO EN FIRESTORE:', JSON.stringify({
    current: newCurrent,
    max: newMax,
    lastActiveDay: day,
    medianGap,
    allowedGap,
    mode,
    copilotAssistedSessions
  }));

  await streakRef.set(dataToSet, { merge: true });
  console.log('✅ [STREAK] Streak actualizado exitosamente en Firestore');

  return {
    updated: true,
    streak: {
      current: newCurrent, max: newMax, lastActiveDay: day,
      medianGap, allowedGap, mode, copilotAssistedSessions
    },
    reason: 'counted'
  };
}

/** Cron semanal opcional para recalcular ritmo/modo */
async function recalcRhythmAndMode(db, businessId, tz = DEFAULT_TZ) {
  // Acceder al documento business directamente
  const streakRef = db.doc(`businesses/${businessId}`);
  const snap = await streakRef.get();
  const businessData = snap.exists ? snap.data() : {};
  const data = businessData.streak || {};

  const activeDays = await getActiveDaysHistory(db, businessId, tz);
  const md = computeMedianGapFromDays(activeDays, tz);
  const ag = calcAllowedGap(md);
  const autoMode = decideMode(md);
  const mode = (data.mode === 'auto' || !data.mode) ? ((autoMode === 'weekly') ? 'daily' : autoMode) : data.mode;

  // Actualizar campo streak dentro del documento business
  await streakRef.set({
    streak: {
      ...data,
      medianGap: md,
      allowedGap: ag,
      mode,
      lastUpdated: FieldValue.serverTimestamp()
    }
  }, { merge: true });

  return { medianGap: md, allowedGap: ag, mode };
}

module.exports = { updateStreakContextualizada, recalcRhythmAndMode };
