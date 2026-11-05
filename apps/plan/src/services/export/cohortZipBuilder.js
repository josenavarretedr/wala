import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  buildBusinessPlanDocx,
  generatePlanFilename,
  sanitizeFilename
} from './docxBuilder';
import { fetchFullParticipantPlanData } from './participantDataFetcher';

/**
 * Descarga de forma segura un Blob en el navegador
 */
export function saveBlobAs(blob, filename) {
  try {
    if (typeof window !== 'undefined' && window.URL && document.createElement) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      return;
    }
  } catch (err) {
    console.warn('[saveBlobAs] Error usando anchor tag, usando file-saver:', err);
  }
  saveAs(blob, filename);
}

/**
 * Genera y descarga directamente el documento Word de un participante
 *
 * @param {Object} participantData
 * @param {Object} costingData
 * @param {Object} planSections
 * @returns {Promise<string>} Nombre del archivo descargado
 */
export async function downloadBusinessPlanDocx(participantData, costingData, planSections) {
  const blob = await buildBusinessPlanDocx(participantData, costingData, planSections);
  const dni = participantData.dni || 'SINDNI';
  const commercialName = participantData.businessBasicInfo?.commercialName || 'Emprendimiento';
  const filename = generatePlanFilename(dni, commercialName);

  saveBlobAs(blob, filename);
  return filename;
}

/**
 * Compila y empaqueta en un archivo .zip todos los planes de negocio (.docx)
 * de los participantes de una cohorte activa, reportando progreso en tiempo real.
 *
 * @param {Object} options
 * @param {string} options.cohortId - Código de la cohorte
 * @param {Array} options.participants - Lista de participantes
 * @param {Function} [options.onProgress] - Callback: ({ current, total, percent, currentName, status })
 * @returns {Promise<{ success: boolean, totalExported: number, filename: string }>}
 */
export async function exportCohortAsZip({ cohortId, participants = [], ceiling = null, onProgress = () => {} }) {
  if (!cohortId) throw new Error('[cohortZipBuilder] cohortId es obligatorio');
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new Error('La cohorte no tiene participantes para exportar.');
  }

  const zip = new JSZip();
  const total = participants.length;
  let current = 0;
  const processedDnis = new Set();

  onProgress({
    current: 0,
    total,
    percent: 0,
    currentName: 'Iniciando compilación...',
    status: 'starting'
  });

  for (const p of participants) {
    current++;
    const pDni = String(p.dni || '').trim();
    const pName = `${p.personalInfo?.firstName || ''} ${p.personalInfo?.lastName || ''}`.trim() || pDni;

    onProgress({
      current,
      total,
      percent: Math.round(((current - 1) / total) * 100),
      currentName: `Compilando: ${pName} (${pDni})`,
      status: 'compiling'
    });

    try {
      // 1. Obtener datos completos y frescos del participante directamente de Firestore
      const fullData = await fetchFullParticipantPlanData(pDni, {
        ceiling,
        forceServer: true
      });

      // 2. Compilar documento Word (.docx)
      const docxBlob = await buildBusinessPlanDocx(
        fullData.participantData,
        fullData.costingData,
        fullData.planSections
      );

      // 3. Generar nombre de archivo único
      let baseFilename = generatePlanFilename(
        pDni,
        fullData.participantData.businessBasicInfo?.commercialName || p.businessBasicInfo?.commercialName
      );

      // Evitar colisión de nombres de archivo idénticos en el ZIP
      if (processedDnis.has(baseFilename)) {
        baseFilename = baseFilename.replace('.docx', `_${current}.docx`);
      }
      processedDnis.add(baseFilename);

      // 4. Agregar al archivo ZIP
      zip.file(baseFilename, docxBlob);
    } catch (err) {
      console.error(`[cohortZipBuilder] Error compilando plan de ${pDni}:`, err);
      // Agregar un archivo de texto con el error para no abortar el lote completo
      zip.file(`ERROR_COMPILACION_${pDni}.txt`, `No se pudo generar el plan para el DNI ${pDni}.\nError: ${err.message}`);
    }
  }

  // Comprimir el archivo ZIP
  onProgress({
    current: total,
    total,
    percent: 98,
    currentName: 'Comprimiendo archivo ZIP de la cohorte...',
    status: 'compressing'
  });

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const zipFilename = `Cohorte_${sanitizeFilename(cohortId)}_Planes.zip`;
  saveBlobAs(zipBlob, zipFilename);

  onProgress({
    current: total,
    total,
    percent: 100,
    currentName: 'Descarga completada con éxito',
    status: 'completed'
  });

  return {
    success: true,
    totalExported: total,
    filename: zipFilename
  };
}
