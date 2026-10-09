/* eslint-disable */
// /functions/src/time.js
const { DateTime } = require("luxon");

/**
 * Devuelve un DateTime "ahora" en la zona indicada (default Lima).
 * @param {string} tz IANA timezone (ej. 'America/Lima')
 */
function nowIn(tz = "America/Lima") {
  return DateTime.now().setZone(tz);
}

/**
 * Convierte un day string 'yyyy-LL-dd' a Date (inicio/fin) en zona tz.
 */
function startOfDay(dayStr, tz = "America/Lima") {
  return DateTime.fromFormat(dayStr, "yyyy-LL-dd", { zone: tz })
    .startOf("day")
    .toJSDate();
}

function endOfDay(dayStr, tz = "America/Lima") {
  return DateTime.fromFormat(dayStr, "yyyy-LL-dd", { zone: tz })
    .endOf("day")
    .toJSDate();
}

/**
 * Devuelve 'yyyy-LL-dd' de HOY / AYER en tz.
 */
function todayStr(tz = "America/Lima") {
  return nowIn(tz).toFormat("yyyy-LL-dd");
}

/**
 * Convierte un timestamp específico a 'yyyy-LL-dd' en tz.
 * Útil para usar el timestamp del scheduler en lugar de DateTime.now().
 * @param {Date|string} timestamp - JS Date o ISO string
 * @param {string} tz - IANA timezone
 */
function dayFromDate(timestamp, tz = "America/Lima") {
  const dt = timestamp instanceof Date
    ? DateTime.fromJSDate(timestamp)
    : DateTime.fromISO(timestamp);
  return dt.setZone(tz).toFormat("yyyy-LL-dd");
}


function yesterdayStr(tz = "America/Lima") {
  return nowIn(tz).minus({ days: 1 }).toFormat("yyyy-LL-dd");
}

/**
 * Resta n días a un 'yyyy-LL-dd' en tz y devuelve string.
 */
function dayMinus(dayStr, n = 1, tz = "America/Lima") {
  return DateTime.fromFormat(dayStr, "yyyy-LL-dd", { zone: tz })
    .minus({ days: n })
    .toFormat("yyyy-LL-dd");
}

/**
 * A partir de un Timestamp Firestore o JS Date, devuelve el 'yyyy-LL-dd' en tz.
 * Acepta: admin.firestore.Timestamp | { toDate():Date } | Date
 */
function dayFromTimestamp(tsLike, tz = "America/Lima") {
  let jsDate = null;
  if (!tsLike) jsDate = new Date();
  else if (typeof tsLike.toDate === "function") jsDate = tsLike.toDate();
  else if (tsLike instanceof Date) jsDate = tsLike;
  else jsDate = new Date(tsLike);

  return DateTime.fromJSDate(jsDate).setZone(tz).toFormat("yyyy-LL-dd");
}

/**
 * Azúcar: devuelve {start, end} Date para un dayStr en tz (rango Firestore).
 */
function dateRangeForDay(dayStr, tz = "America/Lima") {
  return {
    start: startOfDay(dayStr, tz),
    end: endOfDay(dayStr, tz),
  };
}

module.exports = {
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
