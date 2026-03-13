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

function normalizarFaseFunnel(value) {
  const fase = String(value || '').trim().toLowerCase();
  if (!fase) return '';
  if (fase === 'atraccion') return 'tofu';
  if (fase === 'consideracion') return 'mofu';
  if (fase === 'conversion') return 'bofu';
  return fase;
}

/**
 * Guarda un video individual en Firestore.
 * Espera la estructura del FORMATO JSON OUTPUT del promptGuion.md.
 * @param {Object} videoData
 * @returns {Promise<string>} - ID del video guardado
 */
export async function saveVideo(videoData) {
  try {
    const videoId = generateVideoId(videoData);
    const videoRef = doc(db, COLLECTION_PATH, videoId);

    const dataToSave = {
      ...videoData,
      estado: videoData.estado || 'GRABANDO',
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
 * Guarda múltiples videos desde un JSON generado por IA.
 * Estructura: { meta_analisis, generacion, videos[] }
 * @param {Object} jsonData
 * @returns {Promise<Array>} - Array de IDs guardados
 */
export async function saveVideosFromJSON(jsonData) {
  try {
    const savedIds = [];

    for (const video of jsonData.videos) {
      const faseVideo = normalizarFaseFunnel(
        video.fase_funnel || video.etapa_funnel || jsonData.generacion?.fase_funnel || 'tofu'
      ) || 'tofu';

      const videoWithMeta = {
        ...video,
        // Campos globales del batch extraídos del meta_analisis y generacion
        tema: jsonData.meta_analisis?.tema || video.tema,
        ruta_principal: jsonData.meta_analisis?.ruta_principal,
        fase_funnel: faseVideo,
        etapa_funnel: faseVideo,
        estrategia_aplicada: jsonData.meta_analisis?.estrategia_aplicada,
        propuesta_valor_central: jsonData.meta_analisis?.propuesta_valor_central
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

    return { id: videoSnap.id, ...videoSnap.data() };
  } catch (error) {
    console.error('❌ Error al obtener video:', error);
    throw error;
  }
}

/**
 * Obtiene todos los videos con filtros opcionales.
 * Filtros soportados: tema, ruta, tipo_contenido, narrativa, estado
 * @param {Object} filters
 * @returns {Promise<Array>}
 */
export async function getVideos(filters = {}) {
  try {
    const videosRef = collection(db, COLLECTION_PATH);
    let q = query(videosRef, orderBy('createdAt', 'asc'));

    if (filters.tema) {
      q = query(q, where('tema', '==', filters.tema));
    }
    if (filters.ruta) {
      q = query(q, where('ruta', '==', filters.ruta));
    }
    if (filters.tipo_contenido) {
      q = query(q, where('tipo_contenido', '==', filters.tipo_contenido));
    }
    if (filters.narrativa) {
      q = query(q, where('narrativa', '==', filters.narrativa));
    }
    if (filters.estado) {
      q = query(q, where('estado', '==', filters.estado));
    }

    const snapshot = await getDocs(q);
    const videos = [];

    snapshot.forEach(docSnap => {
      videos.push({ id: docSnap.id, ...docSnap.data() });
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
 * @param {Object} updates
 * @returns {Promise<void>}
 */
export async function updateVideo(videoId, updates) {
  try {
    const videoRef = doc(db, COLLECTION_PATH, videoId);
    await updateDoc(videoRef, { ...updates, updatedAt: Timestamp.now() });
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
 * Genera un ID único para el video usando tema + ruta + numero
 * @param {Object} videoData
 * @returns {string}
 */
function generateVideoId(videoData) {
  const tema = sanitizeForId(videoData.tema || 'sin-tema');
  const ruta = sanitizeForId(videoData.ruta || 'sin-ruta');
  const numero = videoData.numero || Date.now();
  return `${tema}_${ruta}_${numero}`;
}

/**
 * Sanitiza strings para usar en IDs de Firestore
 * @param {string} str
 * @returns {string}
 */
function sanitizeForId(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Obtiene valores únicos para filtros dinámicos desde los videos existentes.
 * Retorna: { temas, rutas, tipos, narrativas, estados, fases, voces }
 * @returns {Promise<Object>}
 */
export async function getFilterOptions() {
  try {
    const videos = await getVideos();

    const temas = [...new Set(videos.map(v => v.tema).filter(Boolean))];
    const rutas = [...new Set(videos.map(v => v.ruta).filter(Boolean))];
    const tipos = [...new Set(videos.map(v => v.tipo_contenido).filter(Boolean))];
    const narrativas = [...new Set(videos.map(v => v.narrativa).filter(Boolean))];
    const fases = [
      ...new Set(
        videos
          .map(v => normalizarFaseFunnel(v.fase_funnel || v.etapa_funnel))
          .filter(Boolean)
      )
    ];
    const voces = [...new Set(videos.map(v => v.voz).filter(Boolean))];
    const estados = ['GRABANDO', 'EDITANDO', 'PUBLICADO'];

    return { temas, rutas, tipos, narrativas, estados, fases, voces };
  } catch (error) {
    console.error('❌ Error al obtener opciones de filtros:', error);
    return {
      temas: [],
      rutas: ['tecnica', 'viral', 'amplia'],
      tipos: ['educativo', 'practico'],
      narrativas: ['directa', 'estructurada'],
      estados: ['GRABANDO', 'EDITANDO', 'PUBLICADO'],
      fases: ['tofu', 'mofu', 'bofu'],
      voces: ['A', 'B']
    };
  }
}
