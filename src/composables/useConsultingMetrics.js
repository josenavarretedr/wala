/**
 * Composable para cálculos de métricas de consulting
 * Proporciona lógica compartida para cálculo de niveles de madurez y generación de datos para gráficos
 */

/**
 * Calcula el promedio de un área para un período específico
 * @param {Object} area - Objeto del área con indicadores
 * @param {Object} scores - Objeto de scores indexado por código de indicador
 * @param {string} period - Clave del período (pre, postC1, postC2, postC3)
 * @returns {number|null} Promedio 0-3, o null si todos los indicadores están vacíos
 */
export function calculateAreaAverage(area, scores, period) {
  if (!area || !area.indicators || area.indicators.length === 0) {
    return null;
  }

  const indicatorCodes = area.indicators.map((ind) => ind.code);
  const validScores = indicatorCodes
    .map((code) => scores?.[code]?.[period])
    .filter((score) => typeof score === "number");

  if (validScores.length === 0) {
    return null;
  }

  const sum = validScores.reduce((acc, val) => acc + val, 0);
  return sum / validScores.length;
}

/**
 * Mapea un promedio a un nivel con color e ícono
 * @param {number} average - Promedio 0-3
 * @returns {Object|null} { level, label, color, icon } o null si average es null
 */
export function getLevelFromAverage(average) {
  if (average === null || typeof average !== "number") {
    return null;
  }

  // Usar el promedio real para respetar rangos exactos:
  // 0.0-0.4 Aprendiz, 0.5-1.4 Emprendedor, 1.5-2.4 Gerente, 2.5-3.0 Empresario
  if (average >= 2.5) {
    return {
      level: "Empresario",
      label: "🏆 Empresario",
      color: "#00CCCC",
      icon: "🏆",
    };
  } else if (average >= 1.5) {
    return {
      level: "Gerente",
      label: "📊 Gerente",
      color: "#00CC00",
      icon: "📊",
    };
  } else if (average >= 0.5) {
    return {
      level: "Emprendedor",
      label: "🚀 Emprendedor",
      color: "#FFA500",
      icon: "🚀",
    };
  } else {
    return {
      level: "Aprendiz",
      label: "🌱 Aprendiz",
      color: "#FF4444",
      icon: "🌱",
    };
  }
}

/**
 * Genera datasets para Chart.js a partir de scores por período
 * Cada dataset representa un período (pre, postC1, postC2, postC3)
 * Cada label representa un área (7 áreas totales)
 * IMPORTANTE: Los colores se asignan según el NIVEL DE MADUREZ, no por período
 * @param {Object} scores - Objeto de scores indexado por código de indicador
 * @param {Array} areas - Array de áreas con indicadores
 * @param {Array} periods - Array de períodos con { key, label }
 * @returns {Object} { labels, datasets } compatible con Chart.js
 */
export function getDatasetsByPeriod(scores, areas, periods) {
  // Labels: nombres de las 7 áreas
  const labels = areas.map((area) => area.title);

  // Generar un dataset por cada período
  const datasets = periods.map((period) => {
    // Para cada área, calcular promedio en este período
    const data = areas.map((area) => {
      const avg = calculateAreaAverage(area, scores, period.key);
      return avg !== null ? Math.round(avg * 100) / 100 : 0; // Redondear a 2 decimales
    });

    // Colores basados en NIVEL DE MADUREZ (no por período)
    // Cada barra se colorea según su nivel: Rojo (Aprendiz), Amarillo (Emprendedor), Verde (Gerente), Turquesa (Empresario)
    const backgroundColor = data.map((value) => {
      const levelInfo = getLevelFromAverage(value);
      return levelInfo ? levelInfo.color : "#CCCCCC"; // Gris si no hay nivel definido
    });

    return {
      label: period.label,
      data: data,
      backgroundColor: backgroundColor,
      borderColor: backgroundColor, // Mismo color que fondo para coherencia
      borderWidth: 2,
      borderRadius: 4,
    };
  });

  return {
    labels,
    datasets,
  };
}

/**
 * Genera una matriz de niveles por área y período
 * Útil para visualización textual de niveles
 * @param {Object} scores - Objeto de scores indexado por código de indicador
 * @param {Array} areas - Array de áreas con indicadores
 * @param {Array} periods - Array de períodos
 * @returns {Object} { areaKey: { periodKey: levelObject } }
 */
export function getMatrixLevelsByAreaAndPeriod(scores, areas, periods) {
  const matrix = {};

  areas.forEach((area) => {
    matrix[area.key] = {};

    periods.forEach((period) => {
      const average = calculateAreaAverage(area, scores, period.key);
      matrix[area.key][period.key] = getLevelFromAverage(average);
    });
  });

  return matrix;
}

/**
 * Obtiene el nivel final de un área (último período con dato válido)
 * @param {Object} area - Objeto del área
 * @param {Object} scores - Objeto de scores
 * @param {Array} periods - Array de períodos (en orden)
 * @returns {Object|null} Nivel final o null
 */
export function getFinalLevelForArea(area, scores, periods) {
  // Iterar períodos en reversa para obtener el último con dato válido
  for (let i = periods.length - 1; i >= 0; i--) {
    const period = periods[i];
    const average = calculateAreaAverage(area, scores, period.key);
    if (average !== null) {
      return getLevelFromAverage(average);
    }
  }
  return null;
}
