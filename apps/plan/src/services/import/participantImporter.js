import { read, utils, write } from 'xlsx';
import { batchSaveParticipants } from '@/services/db/firestore';

/**
 * Normaliza nombres de encabezados para soportar variaciones comunes
 */
function normalizeHeader(header) {
  if (!header) return '';
  return String(header)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '_');
}

/**
 * Normaliza la naturaleza del negocio al enum válido
 */
function normalizeNature(val) {
  if (!val) return 'produccion';
  const clean = String(val).toLowerCase().trim();
  if (clean.includes('serv')) return 'servicio';
  if (clean.includes('comerc') || clean.includes('vent')) return 'comercio';
  return 'produccion';
}

/**
 * Parsea y valida el contenido de una hoja de cálculo (Excel o CSV)
 * @param {File|ArrayBuffer} fileData
 * @returns {Promise<{ validRows: Array, invalidRows: Array, totalRows: number }>}
 */
export async function parseParticipantsSpreadsheet(fileData) {
  let buffer;
  if (fileData instanceof File || fileData instanceof Blob) {
    buffer = await fileData.arrayBuffer();
  } else {
    buffer = fileData;
  }

  const workbook = read(buffer, { type: 'array', cellText: true, raw: false });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convertir hoja a JSON con encabezados de la primera fila respetando formato texto
  const rawRows = utils.sheet_to_json(worksheet, { defval: '', raw: false });

  const validRows = [];
  const invalidRows = [];
  const seenDnis = new Set();

  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // Considerando fila 1 como cabecera

    // Mapear campos normalizados
    const normalizedRow = {};
    for (const [key, value] of Object.entries(row)) {
      const normKey = normalizeHeader(key);
      normalizedRow[normKey] = String(value || '').trim();
    }

    // Identificar columnas clave por coincidencias
    const rawDni =
      normalizedRow.dni ||
      normalizedRow.documento ||
      normalizedRow.cedula ||
      normalizedRow.identificacion ||
      '';

    // Normalización de DNI:
    // 1. Limpiar comillas simples/dobles, apóstrofes o espacios envolventes (ej. '007701587' o "007701587")
    let dni = String(rawDni)
      .trim()
      .replace(/^['"`\s]+|['"`\s]+$/g, '');

    // 2. Si es puramente numérico y tiene entre 1 y 7 dígitos (ej. Excel eliminó el 0 inicial de un DNI de 8 dígitos)
    // se autocompleta con ceros a la izquierda hasta 8 caracteres
    if (/^\d{1,7}$/.test(dni)) {
      dni = dni.padStart(8, '0');
    }

    const nombres =
      normalizedRow.nombres ||
      normalizedRow.nombre ||
      normalizedRow.primer_nombre ||
      '';

    const apellidos =
      normalizedRow.apellidos ||
      normalizedRow.apellido ||
      normalizedRow.primer_apellido ||
      '';

    const rawTelefono =
      normalizedRow.telefono ||
      normalizedRow.celular ||
      normalizedRow.movil ||
      '';
    const telefono = String(rawTelefono)
      .trim()
      .replace(/^['"`\s]+|['"`\s]+$/g, '');

    const nombreNegocio =
      normalizedRow.nombre_negocio ||
      normalizedRow.negocio ||
      normalizedRow.emprendimiento ||
      normalizedRow.nombre_comercial ||
      (nombres ? `Emprendimiento de ${nombres}` : '');

    const rubro =
      normalizedRow.rubro ||
      normalizedRow.sector ||
      normalizedRow.giro ||
      'General';

    const naturalezaRaw =
      normalizedRow.naturaleza ||
      normalizedRow.tipo_negocio ||
      normalizedRow.actividad ||
      'produccion';

    const errors = [];

    // Validar DNI
    if (!dni) {
      errors.push('DNI / Cédula vacío');
    } else {
      const dniRegex = /^[a-zA-Z0-9]{8,12}$/;
      if (!dniRegex.test(dni)) {
        errors.push(`DNI debe tener 8 a 12 caracteres alfanuméricos (DNI: ${dni})`);
      }
      if (seenDnis.has(dni)) {
        errors.push('DNI duplicado en el mismo archivo');
      }
    }

    // Validar Nombres
    if (!nombres) {
      errors.push('El campo Nombres es requerido');
    }

    const parsedItem = {
      dni,
      nombres,
      apellidos,
      telefono,
      nombre_negocio: nombreNegocio,
      rubro,
      naturaleza: normalizeNature(naturalezaRaw)
    };

    if (errors.length > 0) {
      invalidRows.push({
        rowNumber: rowNum,
        data: parsedItem,
        errors
      });
    } else {
      seenDnis.add(dni);
      validRows.push({
        rowNumber: rowNum,
        ...parsedItem
      });
    }
  });

  return {
    validRows,
    invalidRows,
    totalRows: rawRows.length
  };
}

/**
 * Importa en lote los participantes válidos directamente a Firestore
 * @param {Array} validParticipants
 * @param {string} cohortId
 * @returns {Promise<{ total: number, batchesCount: number }>}
 */
export async function commitParticipantsImport(validParticipants, cohortId) {
  if (!cohortId) {
    throw new Error('Debe especificar una cohorte válida para la importación.');
  }

  if (!Array.isArray(validParticipants) || validParticipants.length === 0) {
    return { total: 0, batchesCount: 0 };
  }

  return await batchSaveParticipants(validParticipants, cohortId);
}

/**
 * Genera y descarga una plantilla modelo en Excel (.xlsx) para el consultor
 */
export function downloadParticipantsTemplate() {
  const sampleData = [
    {
      dni: '00770158',
      nombres: 'María Elena',
      apellidos: 'Flores Quispe',
      telefono: '987654321',
      nombre_negocio: 'Panadería y Pastelería Doña María',
      rubro: 'Alimentos y Panadería',
      naturaleza: 'produccion'
    },
    {
      dni: '72345678',
      nombres: 'Carlos Alberto',
      apellidos: 'García Pérez',
      telefono: '912345678',
      nombre_negocio: 'Barbería y Estilo Urbano',
      rubro: 'Cuidado Personal',
      naturaleza: 'servicio'
    },
    {
      dni: '10987654',
      nombres: 'Rosa Luz',
      apellidos: 'Mendoza Castillo',
      telefono: '998877665',
      nombre_negocio: 'Boutique y Confecciones Rosa',
      rubro: 'Comercio Textil',
      naturaleza: 'comercio'
    }
  ];

  const worksheet = utils.json_to_sheet(sampleData);

  // Asegurar tipo string y formato texto (@) en celdas de DNI y teléfono
  const range = utils.decode_range(worksheet['!ref'] || 'A1:G4');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const dniCell = worksheet[utils.encode_cell({ r: R, c: 0 })];
    if (dniCell) {
      dniCell.t = 's';
      dniCell.z = '@';
    }
    const telCell = worksheet[utils.encode_cell({ r: R, c: 3 })];
    if (telCell) {
      telCell.t = 's';
      telCell.z = '@';
    }
  }

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Participantes');

  // Ajustar anchos de columnas sugeridos
  worksheet['!cols'] = [
    { wch: 14 }, // dni
    { wch: 20 }, // nombres
    { wch: 22 }, // apellidos
    { wch: 14 }, // telefono
    { wch: 34 }, // nombre_negocio
    { wch: 24 }, // rubro
    { wch: 16 }  // naturaleza
  ];

  const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_importacion_participantes.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
