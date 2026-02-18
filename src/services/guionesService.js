import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';

const db = getFirestore();
const COLLECTION_PATH = 'marketing/guiones/videos';

/**
 * Guarda un video individual en Firestore
 * @param {Object} videoData - Datos del video según estructura ordenRegistro.json
 * @returns {Promise<string>} - ID del video guardado
 */
export async function saveVideo(videoData) {
  try {
    // Generar ID único basado en tema-subtema-numero
    const videoId = generateVideoId(videoData);

    const videoRef = doc(db, COLLECTION_PATH, videoId);

    const dataToSave = {
      ...videoData,
      estado: videoData.estado || 'GRABANDO',
      tipo_contenido: videoData.tipo_contenido || 'STORYTELLING',
      comentarios: videoData.comentarios || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(videoRef, dataToSave);
    console.log('✅ Video guardado:', videoId);

    return videoId;
  } catch (error) {
    console.error('❌ Error al guardar video:', error);
    throw error;
  }
}

/**
 * Guarda múltiples videos desde un JSON generado por IA
 * @param {Object} jsonData - Estructura completa con meta_analisis, generacion y videos[]
 * @returns {Promise<Array>} - Array de IDs guardados
 */
export async function saveVideosFromJSON(jsonData) {
  try {
    const savedIds = [];

    for (const video of jsonData.videos) {
      // Agregar metadata del documento completo a cada video
      const videoWithMeta = {
        ...video,
        tema: jsonData.meta_analisis.tema,
        sectores: jsonData.meta_analisis.sectores || [jsonData.meta_analisis.sector],
        fase_funnel: jsonData.generacion.fase_funnel,
        estrategia_aplicada: jsonData.meta_analisis.estrategia_aplicada,
        propuesta_valor_central: jsonData.meta_analisis.propuesta_valor_central
      };

      const videoId = await saveVideo(videoWithMeta);
      savedIds.push(videoId);
    }

    console.log(`✅ ${savedIds.length} videos guardados`);
    return savedIds;
  } catch (error) {
    console.error('❌ Error al guardar videos desde JSON:', error);
    throw error;
  }
}

/**
 * Obtiene un video por ID
 * @param {string} videoId
 * @returns {Promise<Object>}
 */
export async function getVideo(videoId) {
  try {
    const videoRef = doc(db, COLLECTION_PATH, videoId);
    const videoSnap = await getDoc(videoRef);

    if (!videoSnap.exists()) {
      throw new Error('Video no encontrado');
    }

    return {
      id: videoSnap.id,
      ...videoSnap.data()
    };
  } catch (error) {
    console.error('❌ Error al obtener video:', error);
    throw error;
  }
}

/**
 * Obtiene todos los videos con filtros opcionales
 * @param {Object} filters - { tema, fase_funnel, sector, estado }
 * @returns {Promise<Array>}
 */
export async function getVideos(filters = {}) {
  try {
    const videosRef = collection(db, COLLECTION_PATH);
    let q = query(videosRef, orderBy('createdAt', 'desc'));

    // Aplicar filtros
    if (filters.tema) {
      q = query(q, where('tema', '==', filters.tema));
    }
    if (filters.fase_funnel) {
      q = query(q, where('fase_funnel', '==', filters.fase_funnel));
    }
    if (filters.estado) {
      q = query(q, where('estado', '==', filters.estado));
    }
    // Nota: filtro por sector requiere array-contains
    if (filters.sector) {
      q = query(q, where('sectores', 'array-contains', filters.sector));
    }

    const snapshot = await getDocs(q);
    const videos = [];

    snapshot.forEach(doc => {
      videos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ ${videos.length} videos obtenidos`);
    return videos;
  } catch (error) {
    console.error('❌ Error al obtener videos:', error);
    throw error;
  }
}

/**
 * Actualiza un video
 * @param {string} videoId
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<void>}
 */
export async function updateVideo(videoId, updates) {
  try {
    const videoRef = doc(db, COLLECTION_PATH, videoId);

    await updateDoc(videoRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });

    console.log('✅ Video actualizado:', videoId);
  } catch (error) {
    console.error('❌ Error al actualizar video:', error);
    throw error;
  }
}

/**
 * Elimina un video
 * @param {string} videoId
 * @returns {Promise<void>}
 */
export async function deleteVideo(videoId) {
  try {
    const videoRef = doc(db, COLLECTION_PATH, videoId);
    await deleteDoc(videoRef);

    console.log('✅ Video eliminado:', videoId);
  } catch (error) {
    console.error('❌ Error al eliminar video:', error);
    throw error;
  }
}

/**
 * Genera un ID único para el video
 * @param {Object} videoData
 * @returns {string}
 */
function generateVideoId(videoData) {
  const tema = sanitizeForId(videoData.tema || 'sin-tema');
  const subtema = sanitizeForId(videoData.subtema || 'sin-subtema');
  const numero = videoData.numero || Date.now();

  return `${tema}_${subtema}_${numero}`;
}

/**
 * Sanitiza strings para usar en IDs
 * @param {string} str
 * @returns {string}
 */
function sanitizeForId(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]+/g, '-')      // Reemplazar caracteres especiales por guiones
    .replace(/^-+|-+$/g, '');         // Quitar guiones al inicio/fin
}

/**
 * Obtiene valores únicos para filtros
 * @returns {Promise<Object>} - { temas: [], sectores: [], fases: [], estados: [] }
 */
export async function getFilterOptions() {
  try {
    const videos = await getVideos();

    const temas = [...new Set(videos.map(v => v.tema).filter(Boolean))];
    const sectoresSet = new Set();
    videos.forEach(v => {
      if (v.sectores && Array.isArray(v.sectores)) {
        v.sectores.forEach(s => sectoresSet.add(s));
      }
      if (v.sector_ejemplo) {
        sectoresSet.add(v.sector_ejemplo);
      }
    });
    const sectores = [...sectoresSet];
    const fases = [...new Set(videos.map(v => v.fase_funnel).filter(Boolean))];
    const estados = ['GRABANDO', 'EDITANDO', 'PUBLICADO'];

    return { temas, sectores, fases, estados };
  } catch (error) {
    console.error('❌ Error al obtener opciones de filtros:', error);
    return { temas: [], sectores: [], fases: [], estados: ['GRABANDO', 'EDITANDO', 'PUBLICADO'] };
  }
}
