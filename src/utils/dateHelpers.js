// src/utils/dateHelpers.js
// Utilidades para manejo de fechas en cálculos de costeo

/**
 * Calcula el número de días laborables entre dos fechas
 * Excluye domingos (días 0), incluye sábados
 * @param {Date|Timestamp} startDate - Fecha de inicio
 * @param {Date|Timestamp} endDate - Fecha de fin
 * @returns {number} Número de días laborables
 */
export function calculateWorkingDays(startDate, endDate) {
  // Convertir Timestamps de Firebase a Date si es necesario
  const start = startDate?.toDate ? startDate.toDate() : new Date(startDate);
  const end = endDate?.toDate ? endDate.toDate() : new Date(endDate);

  // Validaciones
  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.warn('⚠️ Fechas inválidas en calculateWorkingDays');
    return 0;
  }

  if (start > end) {
    console.warn('⚠️ Fecha de inicio es mayor que fecha de fin');
    return 0;
  }

  let workingDays = 0;
  const currentDate = new Date(start);

  // Iterar día por día
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();

    // Excluir solo domingos (0)
    // Incluye sábados (6) según práctica laboral latinoamericana
    if (dayOfWeek !== 0) {
      workingDays++;
    }

    // Avanzar al siguiente día
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

/**
 * Formatea una fecha a texto legible en español
 * @param {Date|Timestamp} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export function formatDateES(date) {
  const d = date?.toDate ? date.toDate() : new Date(date);

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Calcula el rango de fechas para un período predefinido
 * @param {string} periodType - 'current_month', 'last_3_months', etc.
 * @returns {{ startDate: Date, endDate: Date }}
 */
export function calculatePeriodDates(periodType) {
  const now = new Date();
  let startDate, endDate;

  switch (periodType) {
    case 'current_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'last_3_months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  return { startDate, endDate };
}
