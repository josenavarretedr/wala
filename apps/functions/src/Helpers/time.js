/* eslint-disable */
// /functions/src/time.js
const { DateTime } = require("luxon");

const DEFAULT_TZ = "America/Lima";

/**
 * Devuelve un DateTime "ahora" en la zona indicada (default Lima).
 * @param {string} tz IANA timezone (ej. 'America/Lima')
 */
function nowIn(tz = DEFAULT_TZ) {
  return DateTime.now().setZone(tz || DEFAULT_TZ);
}

/**
 * Convierte un day string 'yyyy-LL-dd' a Date (inicio/fin) en zona tz.
 */
function startOfDay(dayStr, tz = DEFAULT_TZ) {
  return DateTime.fromFormat(dayStr, "yyyy-LL-dd", { zone: tz || DEFAULT_TZ })
    .startOf("day")
    .toJSDate();
}

function endOfDay(dayStr, tz = DEFAULT_TZ) {
  return DateTime.fromFormat(dayStr, "yyyy-LL-dd", { zone: tz || DEFAULT_TZ })
    .endOf("day")
    .toJSDate();
}

/**
 * Devuelve 'yyyy-LL-dd' de HOY / AYER en tz.
 */
function todayStr(tz = DEFAULT_TZ) {
  return nowIn(tz || DEFAULT_TZ).toFormat("yyyy-LL-dd");
}

/**
 * Convierte un timestamp específico a 'yyyy-LL-dd' en tz.
 * Útil para usar el timestamp del scheduler en lugar de DateTime.now().
 * @param {Date|string} timestamp - JS Date o ISO string
 * @param {string} tz - IANA timezone
 */
function dayFromDate(timestamp, tz = DEFAULT_TZ) {
  const dt = timestamp instanceof Date
    ? DateTime.fromJSDate(timestamp)
    : DateTime.fromISO(timestamp);
  return dt.setZone(tz || DEFAULT_TZ).toFormat("yyyy-LL-dd");
}


function yesterdayStr(tz = DEFAULT_TZ) {
  return nowIn(tz || DEFAULT_TZ).minus({ days: 1 }).toFormat("yyyy-LL-dd");
}

/**
 * Resta n días a un 'yyyy-LL-dd' en tz y devuelve string.
 */
function dayMinus(dayStr, n = 1, tz = DEFAULT_TZ) {
  return DateTime.fromFormat(dayStr, "yyyy-LL-dd", { zone: tz || DEFAULT_TZ })
    .minus({ days: n })
    .toFormat("yyyy-LL-dd");
}

/**
 * A partir de un Timestamp Firestore o JS Date, devuelve el 'yyyy-LL-dd' en tz.
 * Acepta: admin.firestore.Timestamp | { toDate():Date } | { seconds: number } | { _seconds: number } | Date | string | number
 */
function dayFromTimestamp(tsLike, tz = DEFAULT_TZ) {
  let jsDate = null;
  if (!tsLike) {
    jsDate = new Date();
  } else if (typeof tsLike.toDate === "function") {
    jsDate = tsLike.toDate();
  } else if (tsLike instanceof Date) {
    jsDate = tsLike;
  } else if (typeof tsLike === "object" && typeof tsLike.seconds === "number") {
    jsDate = new Date(tsLike.seconds * 1000);
  } else if (typeof tsLike === "object" && typeof tsLike._seconds === "number") {
    jsDate = new Date(tsLike._seconds * 1000);
  } else {
    jsDate = new Date(tsLike);
  }

  if (!jsDate || Number.isNaN(jsDate.getTime())) {
    jsDate = new Date();
  }

  return DateTime.fromJSDate(jsDate).setZone(tz || DEFAULT_TZ).toFormat("yyyy-LL-dd");
}

/**
 * Azúcar: devuelve {start, end} Date para un dayStr en tz (rango Firestore).
 */
function dateRangeForDay(dayStr, tz = DEFAULT_TZ) {
  return {
    start: startOfDay(dayStr, tz || DEFAULT_TZ),
    end: endOfDay(dayStr, tz || DEFAULT_TZ),
  };
}

module.exports = {
  DEFAULT_TZ,
  nowIn,
  startOfDay,
  endOfDay,
  todayStr,
  yesterdayStr,
  dayMinus,
  dayFromTimestamp,
  dateRangeForDay,
  dayFromDate,
};
