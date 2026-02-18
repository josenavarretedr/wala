import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getVideos,
  getVideo,
  saveVideo,
  saveVideosFromJSON,
  updateVideo,
  deleteVideo,
  getFilterOptions
} from '@/services/guionesService';

export const useGuionesStore = defineStore('guiones', () => {
  // Estado
  const videos = ref([]);
  const currentVideo = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Opciones de filtros (cargadas dinámicamente)
  const filterOptions = ref({
    temas: [],
    sectores: [],
    fases: [],
    estados: ['GRABANDO', 'EDITANDO', 'PUBLICADO']
  });

  // Filtros activos
  const activeFilters = ref({
    tema: null,
    sector: null,
    fase_funnel: null,
    estado: null,
    searchText: ''
  });

  // Computed
  const videosFiltered = computed(() => {
    let filtered = videos.value;

    // Filtrar por tema
    if (activeFilters.value.tema) {
      filtered = filtered.filter(v => v.tema === activeFilters.value.tema);
    }

    // Filtrar por sector
    if (activeFilters.value.sector) {
      filtered = filtered.filter(v => {
        if (v.sectores && Array.isArray(v.sectores)) {
          return v.sectores.includes(activeFilters.value.sector);
        }
        return v.sector_ejemplo === activeFilters.value.sector;
      });
    }

    // Filtrar por fase del funnel
    if (activeFilters.value.fase_funnel) {
      filtered = filtered.filter(v => v.fase_funnel === activeFilters.value.fase_funnel);
    }

    // Filtrar por estado
    if (activeFilters.value.estado) {
      filtered = filtered.filter(v => v.estado === activeFilters.value.estado);
    }

    // Búsqueda de texto (en subtema, tema, caption)
    if (activeFilters.value.searchText) {
      const search = activeFilters.value.searchText.toLowerCase();
      filtered = filtered.filter(v => {
        return (
          v.tema?.toLowerCase().includes(search) ||
          v.subtema?.toLowerCase().includes(search) ||
          v.caption?.toLowerCase().includes(search) ||
          v.sector_ejemplo?.toLowerCase().includes(search)
        );
      });
    }

    return filtered;
  });

  const videosPorVoz = computed(() => {
    return {
      vozA: videos.value.filter(v => v.voz === 'A').length,
      vozB: videos.value.filter(v => v.voz === 'B').length
    };
  });

  const videosPorEstado = computed(() => {
    return {
      grabando: videos.value.filter(v => v.estado === 'GRABANDO').length,
      editando: videos.value.filter(v => v.estado === 'EDITANDO').length,
      publicado: videos.value.filter(v => v.estado === 'PUBLICADO').length
    };
  });

  // Actions

  /**
   * Carga todos los videos desde Firestore
   */
  async function loadVideos(filters = {}) {
    try {
      loading.value = true;
      error.value = null;

      videos.value = await getVideos(filters);

      console.log(`✅ ${videos.value.length} videos cargados en store`);
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error al cargar videos en store:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Carga opciones de filtros desde los videos existentes
   */
  async function loadFilterOptions() {
    try {
      filterOptions.value = await getFilterOptions();
      console.log('✅ Opciones de filtros cargadas:', filterOptions.value);
    } catch (err) {
      console.error('❌ Error al cargar opciones de filtros:', err);
    }
  }

  /**
   * Carga un video específico por ID
   */
  async function loadVideo(videoId) {
    try {
      loading.value = true;
      error.value = null;

      currentVideo.value = await getVideo(videoId);

      console.log('✅ Video cargado:', videoId);
      return currentVideo.value;
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error al cargar video:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Guarda un video individual
   */
  async function saveVideoToStore(videoData) {
    try {
      loading.value = true;
      error.value = null;

      const videoId = await saveVideo(videoData);

      // Recargar la lista
      await loadVideos();

      console.log('✅ Video guardado en store:', videoId);
      return videoId;
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error al guardar video en store:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Guarda múltiples videos desde JSON generado por IA
   */
  async function saveVideosFromIA(jsonData) {
    try {
      loading.value = true;
      error.value = null;

      const savedIds = await saveVideosFromJSON(jsonData);

      // Recargar la lista
      await loadVideos();

      console.log(`✅ ${savedIds.length} videos guardados en store`);
      return savedIds;
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error al guardar videos desde JSON:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Actualiza un video existente
   */
  async function updateVideoInStore(videoId, updates) {
    try {
      loading.value = true;
      error.value = null;

      await updateVideo(videoId, updates);

      // Actualizar en el array local si existe
      const index = videos.value.findIndex(v => v.id === videoId);
      if (index !== -1) {
        videos.value[index] = { ...videos.value[index], ...updates };
      }

      // Si es el video actual, actualizarlo también
      if (currentVideo.value?.id === videoId) {
        currentVideo.value = { ...currentVideo.value, ...updates };
      }

      console.log('✅ Video actualizado en store:', videoId);
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error al actualizar video:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Elimina un video
   */
  async function deleteVideoFromStore(videoId) {
    try {
      loading.value = true;
      error.value = null;

      await deleteVideo(videoId);

      // Eliminar del array local
      videos.value = videos.value.filter(v => v.id !== videoId);

      // Si es el video actual, limpiarlo
      if (currentVideo.value?.id === videoId) {
        currentVideo.value = null;
      }

      console.log('✅ Video eliminado del store:', videoId);
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error al eliminar video:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Establece filtros activos
   */
  function setFilters(filters) {
    activeFilters.value = { ...activeFilters.value, ...filters };
  }

  /**
   * Limpia todos los filtros
   */
  function clearFilters() {
    activeFilters.value = {
      tema: null,
      sector: null,
      fase_funnel: null,
      estado: null,
      searchText: ''
    };
  }

  /**
   * Limpia el estado completo
   */
  function resetStore() {
    videos.value = [];
    currentVideo.value = null;
    loading.value = false;
    error.value = null;
    clearFilters();
  }

  return {
    // Estado
    videos,
    currentVideo,
    loading,
    error,
    filterOptions,
    activeFilters,

    // Computed
    videosFiltered,
    videosPorVoz,
    videosPorEstado,

    // Actions
    loadVideos,
    loadFilterOptions,
    loadVideo,
    saveVideoToStore,
    saveVideosFromIA,
    updateVideoInStore,
    deleteVideoFromStore,
    setFilters,
    clearFilters,
    resetStore
  };
});
