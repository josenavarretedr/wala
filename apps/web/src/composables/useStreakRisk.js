import { computed } from 'vue';
import { DateTime } from 'luxon';

/**
 * Composable para calcular el nivel de riesgo de pérdida de racha.
 * 
 * Niveles de riesgo:
 * - 'none': Sin racha activa
 * - 'safe': > 4 días restantes
 * - 'medium': 3-4 días restantes
 * - 'high': 1-2 días restantes
 * - 'critical': 0 días (ya se perdió o último día)
 * 
 * @param {Ref<Object>} streakData - Reactive ref con datos del streak del negocio
 * @returns {Object} - { riskLevel, daysRemaining, message, color, icon }
 * 
 * @example
 * const streakData = ref({ current: 5, lastActiveDay: '2025-01-15', allowedGap: 5 });
 * const { riskLevel, message, color } = useStreakRisk(streakData);
 */
export function useStreakRisk(streakData) {
  const DEFAULT_TZ = 'America/Lima';

  /**
   * Calcula los días entre dos fechas en formato yyyy-LL-dd
   */
  const daysBetween = (dateA, dateB) => {
    const d1 = DateTime.fromFormat(dateA, 'yyyy-LL-dd', { zone: DEFAULT_TZ }).startOf('day');
    const d2 = DateTime.fromFormat(dateB, 'yyyy-LL-dd', { zone: DEFAULT_TZ }).startOf('day');
    return Math.round(d2.diff(d1, 'days').days);
  };

  /**
   * Nivel de riesgo de pérdida de racha
   */
  const riskLevel = computed(() => {
    if (!streakData.value || streakData.value.current === 0) {
      return 'none'; // Sin racha activa
    }

    const lastActiveDay = streakData.value.lastActiveDay;
    const allowedGap = streakData.value.allowedGap || 5;

    if (!lastActiveDay) return 'none';

    // Convertir lastActiveDay a string si es Timestamp de Firestore
    let lastActiveDayStr;
    if (typeof lastActiveDay === 'string') {
      lastActiveDayStr = lastActiveDay;
    } else if (lastActiveDay.toDate) {
      const date = lastActiveDay.toDate();
      lastActiveDayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } else {
      return 'none';
    }

    // Calcular día actual
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const daysSinceActive = daysBetween(lastActiveDayStr, today);
    const daysRemaining = allowedGap - daysSinceActive;

    if (daysRemaining <= 0) return 'critical'; // ⚠️ Ya perdió o último día
    if (daysRemaining <= 2) return 'high';     // 🔴 1-2 días restantes
    if (daysRemaining <= 4) return 'medium';   // 🟡 3-4 días restantes
    return 'safe';                             // ✅ > 4 días
  });

  /**
   * Días restantes antes de perder la racha
   */
  const daysRemaining = computed(() => {
    if (!streakData.value || !streakData.value.lastActiveDay) return null;

    const lastActiveDay = streakData.value.lastActiveDay;
    const allowedGap = streakData.value.allowedGap || 5;

    let lastActiveDayStr;
    if (typeof lastActiveDay === 'string') {
      lastActiveDayStr = lastActiveDay;
    } else if (lastActiveDay.toDate) {
      const date = lastActiveDay.toDate();
      lastActiveDayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } else {
      return null;
    }

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const daysSinceActive = daysBetween(lastActiveDayStr, today);
    return Math.max(0, allowedGap - daysSinceActive);
  });

  /**
   * Mensaje dinámico según el nivel de riesgo
   */
  const message = computed(() => {
    const level = riskLevel.value;
    const days = daysRemaining.value;

    if (level === 'none') return null;
    if (level === 'critical') return '⚠️ Tu racha está en riesgo. ¡Actúa hoy!';
    if (level === 'high') return `🔴 Solo te quedan ${days} ${days === 1 ? 'día' : 'días'} para mantener tu racha`;
    if (level === 'medium') return `🟡 Tienes ${days} días para mantener tu racha`;
    return '✅ Tu racha está segura';
  });

  /**
   * Color asociado al nivel de riesgo
   */
  const color = computed(() => {
    const level = riskLevel.value;
    if (level === 'critical') return 'red';
    if (level === 'high') return 'orange';
    if (level === 'medium') return 'yellow';
    return 'green';
  });

  /**
   * Icono asociado al nivel de riesgo
   */
  const icon = computed(() => {
    const level = riskLevel.value;
    if (level === 'critical') return '⚠️';
    if (level === 'high') return '🔴';
    if (level === 'medium') return '🟡';
    return '✅';
  });

  return {
    riskLevel,
    daysRemaining,
    message,
    color,
    icon
  };
}
