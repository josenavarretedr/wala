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
  const normalizarFase = (video) => {
    const fase = String(video?.fase_funnel || video?.etapa_funnel || '')
      .trim()
      .toLowerCase();

    if (!fase) return '';
    if (fase === 'tofu') return 'tofu';
    if (fase === 'mofu_a') return 'mofu_a';
    if (fase === 'mofu_b') return 'mofu_b';
    if (fase === 'mofu') return 'mofu_b';
    if (fase === 'bofu') return 'bofu';
    if (fase === 'atraccion') return 'tofu';
    if (fase === 'consideracion') return 'mofu_b';
    if (fase === 'conversion') return 'bofu';
    return fase;
  };

  // Estado
  const videos = ref([]);
  const currentVideo = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Opciones de filtros (cargadas dinámicamente)
  const filterOptions = ref({
    temas: [],
    rutas: ['tecnica', 'viral', 'amplia'],
    tipos: ['educativo', 'practico'],
    narrativas: ['directa', 'estructurada'],
    estados: ['GRABANDO', 'EDITANDO', 'PUBLICADO'],
    fases: ['tofu', 'mofu_a', 'mofu_b', 'bofu'],              // nuevas opciones para fase de funnel
    voces: ['A', 'B']                              // opciones para voz narrativa
  });

  // Filtros activos
  const activeFilters = ref({
    tema: null,
    ruta: null,
    tipo_contenido: null,
    narrativa: null,
    estado: null,
    fase_funnel: null,       // filtro adicional para la etapa del funnel
    voz: null,               // filtro por voz A/B
    es_huevo_oro: null,      // booleano para seleccionar huevos de oro
    searchText: ''
  });

  // Computed
  const videosFiltered = computed(() => {
    let filtered = videos.value;

    if (activeFilters.value.tema) {
      filtered = filtered.filter(v => v.tema === activeFilters.value.tema);
    }

    if (activeFilters.value.ruta) {
      filtered = filtered.filter(v => v.ruta === activeFilters.value.ruta);
    }

    if (activeFilters.value.tipo_contenido) {
      filtered = filtered.filter(v => v.tipo_contenido === activeFilters.value.tipo_contenido);
    }

    if (activeFilters.value.narrativa) {
      filtered = filtered.filter(v => v.narrativa === activeFilters.value.narrativa);
    }

    if (activeFilters.value.estado) {
      filtered = filtered.filter(v => v.estado === activeFilters.value.estado);
    }

    if (activeFilters.value.fase_funnel) {
      const faseFiltro = String(activeFilters.value.fase_funnel).toLowerCase();
      filtered = filtered.filter(v => normalizarFase(v) === faseFiltro);
    }

    if (activeFilters.value.voz) {
      filtered = filtered.filter(v => v.voz === activeFilters.value.voz);
    }

    if (activeFilters.value.es_huevo_oro != null) {
      filtered = filtered.filter(v => !!v.es_huevo_oro === activeFilters.value.es_huevo_oro);
    }

    if (activeFilters.value.searchText) {
      const search = activeFilters.value.searchText.toLowerCase();
      filtered = filtered.filter(v =>
        v.tema?.toLowerCase().includes(search) ||
        v.sector_contexto?.toLowerCase().includes(search) ||
        v.gancho?.texto?.toLowerCase().includes(search) ||
        v.caption?.toLowerCase().includes(search)
      );
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

  const videosPorFase = computed(() => {
    const tofu = videos.value.filter(v => normalizarFase(v) === 'tofu').length;
    const mofu_a = videos.value.filter(v => normalizarFase(v) === 'mofu_a').length;
    const mofu_b = videos.value.filter(v => normalizarFase(v) === 'mofu_b').length;
    const bofu = videos.value.filter(v => normalizarFase(v) === 'bofu').length;

    return {
      tofu,
      mofu_a,
      mofu_b,
      bofu
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

      const rawVideos = await getVideos(filters);
      videos.value = rawVideos.map((video) => {
        const fase = normalizarFase(video);
        return {
          ...video,
          fase_funnel: fase || video.fase_funnel,
          etapa_funnel: fase || video.etapa_funnel,
        };
      });

      console.log(`✅ ${videos.value.length} videos cargados en store`);
      console.log({ videos: videos.value });
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
      ruta: null,
      tipo_contenido: null,
      narrativa: null,
      estado: null,
      fase_funnel: null,
      voz: null,
      es_huevo_oro: null,
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
    videosPorFase,

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
