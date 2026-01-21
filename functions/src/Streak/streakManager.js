/* eslint-disable */
const { DateTime } = require('luxon');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const { trackStreakExtended, trackStreakBroken } = require('../Helpers/analyticsHelper');

// ====== CONFIG ======
const DEFAULT_TZ = 'America/Lima';
const DAYS_HISTORY = 90;
const MIN_ALLOWED_GAP = 5;
const MAX_ALLOWED_GAP = 14;

// ====== LOGGING ======
const IS_DEV = process.env.FUNCTIONS_EMULATOR === 'true' || process.env.NODE_ENV === 'development';
const log = IS_DEV ? console.log : () => { };
const logAlways = console.log; // Logs importantes siempre visibles

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
  const ref = db.doc(`businesses/${businessId}`);
  const snap = await ref.get();
  log('🔍 [STREAK] getOrInitStreak - businessId:', businessId);

  if (snap.exists) {
    const businessData = snap.data();
    const streakData = businessData.streak || null;

    if (streakData) {
      return { ref, data: streakData };
    }
  }

  // Inicializar streak
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
  logAlways('⚠️ [STREAK] Inicializando nuevo streak para', businessId);

  await ref.set({ streak: init }, { merge: true });
  return { ref, data: init };
}
async function getActiveDaysHistory(db, businessId, tz = DEFAULT_TZ) {
  const today = DateTime.now().setZone(tz);
  const start = today.minus({ days: DAYS_HISTORY }).toFormat('yyyy-LL-dd');
  log('📊 [STREAK] Consultando historial desde:', start);

  try {
    const snap = await db.collection(`businesses/${businessId}/dailySummaries`)
      .where('hasTxn', '==', true)
      .where('day', '>=', start)
      .orderBy('day', 'asc')
      .get();

    const days = [];
    snap.forEach(d => {
      const v = d.data();
      if (v && typeof v.day === 'string') days.push(v.day);
    });

    log('📊 [STREAK] Días activos encontrados:', days.length);
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

/**
 * Actualiza la racha contextualizada después de cerrar un día (manual o auto).
 * 
 * NUEVA LÓGICA:
 * - Día activo = hasOpening + hasTxn (NO requiere hasClosure)
 * - Actualización ocurre al cerrar día (hasClosure: true)
 * - Política fija: autoClosePolicy = 'lenient' (siempre valorar esfuerzo)
 * - copilotAssistedSessions solo es contador estadístico
 * 
 * @param {Object} params - Parámetros
 * @param {FirebaseFirestore.Firestore} params.db - Instancia de Firestore
 * @param {string} params.businessId - ID del negocio
 * @param {string} params.day - Día a actualizar (yyyy-LL-dd)
 * @param {Object} params.summary - DailySummary (opcional, se obtiene si no se provee)
 * @param {string} params.tz - Timezone (default: 'America/Lima')
 * @param {boolean} params.forceRecalc - Forzar recálculo de ritmo
 * @param {string} params.autoClosePolicy - 'lenient' (default) | 'strict'
 * @returns {Promise<Object>} Resultado de la actualización
 */
async function updateStreakContextualizada({
  db,
  businessId,
  day,
  summary = null,
  tz = DEFAULT_TZ,
  forceRecalc = false,
  autoClosePolicy = 'lenient'
}) {
  logAlways(`� [STREAK] Actualizando racha - Business: ${businessId}, Día: ${day}`);

  if (!db || !businessId || !day) {
    throw new Error('[STREAK] db, businessId y day son requeridos');
  }

  // Obtener o validar dailySummary
  const summaryDoc = summary || await getSummary(db, businessId, day);
  if (!summaryDoc) {
    log('� [STREAK] No existe dailySummary para', day);
    return { updated: false, streak: null, reason: 'no-summary' };
  }

  log('📋 [STREAK] DailySummary:', {
    hasOpening: summaryDoc.hasOpening,
    hasTxn: summaryDoc.hasTxn,
    hasClosure: summaryDoc.hasClosure,
    isAutoClosed: summaryDoc.isAutoClosed
  });

  // Obtener streak actual
  const { ref: streakRef, data: streak } = await getOrInitStreak(db, businessId);

  // Calcular ritmo si es necesario
  let mode = streak.mode || 'auto';
  let medianGap = streak.medianGap || 0;
  let allowedGap = streak.allowedGap || MIN_ALLOWED_GAP;

  if (mode === 'auto' && (forceRecalc || !medianGap || !allowedGap)) {
    log('🟡 [STREAK] Recalculando ritmo automático...');
    const activeDays = await getActiveDaysHistory(db, businessId, tz);
    const md = computeMedianGapFromDays(activeDays, tz);
    const ag = calcAllowedGap(md);
    const autoMode = decideMode(md);

    medianGap = md;
    allowedGap = ag;
    mode = (autoMode === 'weekly') ? 'daily' : autoMode;

    log('🟡 [STREAK] Nuevo ritmo - medianGap:', medianGap, 'allowedGap:', allowedGap, 'mode:', mode);

    await streakRef.set({
      streak: {
        ...streak,
        medianGap,
        allowedGap,
        mode,
        lastUpdated: FieldValue.serverTimestamp()
      }
    }, { merge: true });
  }

  const active = isActiveDay(summaryDoc);
  const copilotClosed = wasCopilotClosed(summaryDoc);

  // ✅ NUEVA LÓGICA: Con 'lenient', siempre cuenta si es activo
  let canCount = active;

  // Log de decisión (solo en dev)
  log('🎯 [STREAK] Decisión:', {
    día: day,
    esActivo: active,
    cerradoPorCopilot: copilotClosed,
    política: autoClosePolicy,
    puedeContar: canCount,
    últimoDíaActivo: streak.lastActiveDay,
    rachaAnterior: streak.current
  });

  const lastActiveDay = streak.lastActiveDay || null;

  // ⚠️ CRÍTICO: Verificar si día ya fue contado PRIMERO
  if (lastActiveDay === day) {
    log('⏭️ [STREAK] Este día ya se había contado - lastActiveDay:', lastActiveDay, 'day:', day);

    // CASO 1: Día ya contado pero ahora es INACTIVO (se eliminó la última transacción)
    if (!canCount) {
      log('🔴 [STREAK] Día ya contado pero ahora inactivo - Revirtiendo racha');

      // Necesitamos encontrar el día activo anterior
      const prevCurrent = Math.max(0, Number(streak.current || 1) - 1);

      // Buscar el último día activo antes de este
      let prevActiveDay = null;
      if (prevCurrent > 0) {
        // Buscar hacia atrás hasta encontrar un día con transacciones
        const db = admin.firestore();
        const businessRef = db.collection('businesses').doc(businessId);

        // Buscar los últimos 30 días para encontrar el día activo anterior
        const daysToCheck = 30;
        for (let i = 1; i <= daysToCheck; i++) {
          const checkDay = DateTime.fromISO(day, { zone: tz })
            .minus({ days: i })
            .toFormat('yyyy-MM-dd');

          const summaryRef = businessRef.collection('dailySummaries').doc(checkDay);
          const summaryDoc = await summaryRef.get();

          if (summaryDoc.exists && isActiveDay(summaryDoc)) {
            prevActiveDay = checkDay;
            log('✅ [STREAK] Encontrado día activo anterior:', prevActiveDay);
            break;
          }
        }
      }

      await streakRef.set({
        streak: {
          ...streak,
          current: prevCurrent,
          lastActiveDay: prevActiveDay,
          lastUpdated: FieldValue.serverTimestamp()
        }
      }, { merge: true });

      logAlways(`🔥 [STREAK] REVERT - Business: ${businessId}, Day: ${day}, Prev: ${streak.current} → New: ${prevCurrent}, LastActiveDay: ${prevActiveDay}`);

      return {
        updated: true,
        streak: { ...streak, current: prevCurrent, lastActiveDay: prevActiveDay, mode, medianGap, allowedGap },
        reason: 'streak-reverted-transaction-deleted'
      };
    }

    // CASO 2: Día sigue activo - Si ya está cerrado, actualizar copilotAssistedSessions
    const hasClosure = summaryDoc.hasClosure === true;
    if (hasClosure && copilotClosed) {
      const updatedCopilotSessions = Number(streak.copilotAssistedSessions || 0) + 1;

      await streakRef.set({
        streak: {
          ...streak,
          copilotAssistedSessions: updatedCopilotSessions,
          lastUpdated: FieldValue.serverTimestamp()
        }
      }, { merge: true });

      log('🤖 [STREAK] Actualizado copilotAssistedSessions:', updatedCopilotSessions);

      return {
        updated: true,
        streak: { ...streak, copilotAssistedSessions: updatedCopilotSessions, mode, medianGap, allowedGap },
        reason: 'copilot-sessions-updated'
      };
    }

    // CASO 3: Día sigue activo y ya se contó - No hacer nada
    await streakRef.set({
      streak: { ...streak, lastUpdated: FieldValue.serverTimestamp() }
    }, { merge: true });

    return {
      updated: false,
      streak: { ...streak, mode, medianGap, allowedGap },
      reason: 'already-counted-today'
    };
  }

  // Si NO puede contar y NO es el día ya contado, simplemente no hacer nada
  if (!canCount) {
    log('🔴 [STREAK] Día no cuenta para racha (día diferente al último activo)');
    await streakRef.set({
      streak: { ...streak, lastUpdated: FieldValue.serverTimestamp() }
    }, { merge: true });
    return {
      updated: false,
      streak: { ...streak, mode, medianGap, allowedGap },
      reason: 'not-counting'
    };
  }

  // 🔥 Calcular nueva racha (el usuario trabajó hoy)
  let newCurrent = 1;
  if (lastActiveDay) {
    const gap = daysBetweenYmd(lastActiveDay, day, tz);
    const streakWasBroken = gap > allowedGap;
    newCurrent = streakWasBroken ? 1 : (Number(streak.current || 0) + 1);

    log('🟢 [STREAK] Gap:', gap, 'días (permitido:', allowedGap + ')');
    log('🟢 [STREAK] Incrementando racha de', streak.current, 'a', newCurrent);
    logAlways(`🔥 [STREAK] INCREMENT - Business: ${businessId}, Day: ${day}, Gap: ${gap}, Prev: ${streak.current} → New: ${newCurrent}`);

    // === ANALYTICS: Trackear ruptura de racha si el gap excedió el permitido ===
    if (streakWasBroken && Number(streak.current || 0) > 0) {
      try {
        await trackStreakBroken({
          businessId,
          previousStreakLength: Number(streak.current || 0),
          daysWithoutTransaction: gap
        });
        logAlways(`❌ [ANALYTICS] Streak broken tracked - Previous: ${streak.current}, Gap: ${gap} días`);
      } catch (analyticsError) {
        console.warn(`⚠️ [ANALYTICS] Error al trackear streak_broken:`, analyticsError.message);
        // No lanzar error, la racha se actualizó correctamente
      }
    }
  } else {
    log('🆕 [STREAK] Primera actividad registrada');
  }

  const newMax = Math.max(Number(streak.max || 0), newCurrent);
  const copilotAssistedSessions = Number(streak.copilotAssistedSessions || 0) + (copilotClosed ? 1 : 0);

  // Guardar en Firestore
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

  logAlways(`✅ [STREAK] RACHA INCREMENTADA - Business: ${businessId}`, {
    current: newCurrent,
    max: newMax,
    lastActiveDay: day,
    copilotAssisted: copilotAssistedSessions
  });

  await streakRef.set(dataToSet, { merge: true });

  // === ANALYTICS: Trackear extensión de racha si aumentó ===
  if (newCurrent > Number(streak.current || 0)) {
    try {
      const daysSinceLastValidTransaction = lastActiveDay ? daysBetweenYmd(lastActiveDay, day, tz) : 1;

      await trackStreakExtended({
        businessId,
        streakLength: newCurrent,
        daysSinceLastValidTransaction
      });

      logAlways(`✅ [ANALYTICS] Streak extended tracked - Length: ${newCurrent}`);
    } catch (analyticsError) {
      console.warn(`⚠️ [ANALYTICS] Error al trackear streak_extended:`, analyticsError.message);
      // No lanzar error, la racha se incrementó correctamente
    }
  }

  return {
    updated: true,
    streak: {
      current: newCurrent,
      max: newMax,
      lastActiveDay: day,
      medianGap,
      allowedGap,
      mode,
      copilotAssistedSessions
    },
    reason: 'counted'
  };
}

/**
 * Recalcula ritmo y modo del streak (cron semanal opcional).
 */
async function recalcRhythmAndMode(db, businessId, tz = DEFAULT_TZ) {
  const streakRef = db.doc(`businesses/${businessId}`);
  const snap = await streakRef.get();
  const businessData = snap.exists ? snap.data() : {};
  const data = businessData.streak || {};

  const activeDays = await getActiveDaysHistory(db, businessId, tz);
  const md = computeMedianGapFromDays(activeDays, tz);
  const ag = calcAllowedGap(md);
  const autoMode = decideMode(md);
  const mode = (data.mode === 'auto' || !data.mode) ? ((autoMode === 'weekly') ? 'daily' : autoMode) : data.mode;

  await streakRef.set({
    streak: {
      ...data,
      medianGap: md,
      allowedGap: ag,
      mode,
      lastUpdated: FieldValue.serverTimestamp()
    }
  }, { merge: true });

  logAlways(`📊 [STREAK] Ritmo recalculado - Business: ${businessId}`, { medianGap: md, allowedGap: ag, mode });

  return { medianGap: md, allowedGap: ag, mode };
}

module.exports = {
  updateStreakContextualizada,
  recalcRhythmAndMode,
  // Exportar helpers para testing
  isActiveDay,
  wasCopilotClosed,
  daysBetweenYmd
};
