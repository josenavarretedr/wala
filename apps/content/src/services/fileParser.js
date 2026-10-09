// Carga todos los bancos de acciones en build time
const bancoFiles = import.meta.glob('/src/assets/bancos/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
});

// Carga los prompts base
const promptFiles = import.meta.glob('/src/assets/prompts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
});

// Mapa de nombres a número de área para mayor robustez
const AREA_MAP = {
  'Negocios y Familia': 1,
  'Marketing': 2,
  'Compras': 3,
  'Control de Stock': 4,
  'Control de stock': 4,
  'Stock': 4,
  'Costeo': 5,
  'Mantenimiento de Registros': 6,
  'Mantenimiento de registros': 6,
  'Registros': 6,
  'Planificacion': 7,
  'Planificación': 7
};

// Parsea un banco de acciones y extrae:
// - Nombre del área
// - Lista de indicadores
// - Por cada indicador: niveles y acciones
export function parseBanco(rawMarkdown, fileName = '') {
  const lines = rawMarkdown.split('\n');
  const result = {
    area: '',
    areaNumber: null,
    indicadores: []
  };

  // Intentar determinar número y nombre del área a partir de las cabeceras
  // Ejemplo: "# BA — Negocios y Familia"
  // Ejemplo: "**Método WALA — Banco de Acciones | Área 1**"
  for (const line of lines.slice(0, 10)) {
    const titleMatch = line.match(/^# BA\s*—\s*(.+)/i);
    if (titleMatch) {
      result.area = titleMatch[1].trim();
    }
    const areaNumMatch = line.match(/Área\s*(\d+)/i);
    if (areaNumMatch) {
      result.areaNumber = parseInt(areaNumMatch[1]);
    }
  }

  // Fallback si no se detectó el número de área
  if (!result.areaNumber && fileName) {
    for (const [key, val] of Object.entries(AREA_MAP)) {
      if (fileName.toLowerCase().includes(key.toLowerCase())) {
        result.areaNumber = val;
        if (!result.area) result.area = key;
        break;
      }
    }
  }

  let currentIndicador = null;
  let currentLevel = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detecta: "## Indicador 1.1 — Se paga un salario"
    const indicadorMatch = trimmed.match(/^## Indicador (\d+\.\d+) — (.+)/);
    if (indicadorMatch) {
      currentIndicador = {
        id: indicadorMatch[1],
        nombre: indicadorMatch[2].trim(),
        niveles: {}
      };
      result.indicadores.push(currentIndicador);
      currentLevel = null;
      continue;
    }

    // Detecta: "### Nivel 0 → 1"
    const nivelMatch = trimmed.match(/^### Nivel (\d+)\s*→\s*(\d+)/);
    if (nivelMatch && currentIndicador) {
      const key = `${nivelMatch[1]}_${nivelMatch[2]}`;
      currentIndicador.niveles[key] = {
        desde: parseInt(nivelMatch[1]),
        hasta: parseInt(nivelMatch[2]),
        descripcion: '',
        acciones: []
      };
      currentLevel = currentIndicador.niveles[key];
      continue;
    }

    // Detecta descripción de nivel (línea en cursiva después del header)
    if (currentLevel && trimmed.startsWith('*') && !trimmed.startsWith('**')) {
      currentLevel.descripcion = trimmed.replace(/\*/g, '').trim();
      continue;
    }

    // Detecta filas de tabla con acciones (| # | Acción | Frecuencia | Dónde se registra en WALA |)
    // Ej: | 1 | Anota en WALA todo el dinero... | Semanal | Módulo de gastos... |
    const cells = trimmed.split('|').map(c => c.trim());
    if (cells.length >= 5 && currentLevel) {
      const num = cells[1];
      const accion = cells[2];
      const frecuencia = cells[3];
      const registro = cells[4];

      if (num && !isNaN(num) && accion && accion !== 'Acción' && !accion.startsWith('---')) {
        currentLevel.acciones.push({
          texto: accion,
          frecuencia: frecuencia || '',
          registro_wala: registro || ''
        });
      }
    }
  }

  return result;
}

// Función principal que devuelve todos los datos estructurados
export function getAllBancos() {
  const bancos = {};
  for (const [path, raw] of Object.entries(bancoFiles)) {
    const fileName = path.split('/').pop() || '';
    const parsed = parseBanco(raw, fileName);
    if (parsed.areaNumber) {
      bancos[parsed.areaNumber] = parsed;
    }
  }
  return bancos;
}

// Devuelve los archivos de prompt crudos (se pasan completos al LLM)
export function getPromptMaestro() {
  return promptFiles['/src/assets/prompts/PromptMaestro_V10.md'] || '';
}

export function getRutasMaestras() {
  return promptFiles['/src/assets/prompts/RutasWala_v3.md'] || '';
}
