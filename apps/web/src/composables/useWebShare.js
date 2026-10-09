/**
 * useWebShare.js - Composable para compartir archivos vía Web Share API
 * Incluye detección de plataforma y fallback a descarga directa
 */

import { ref, computed } from 'vue';

export function useWebShare() {
  const isSharing = ref(false);
  const shareError = ref(null);
  const lastShareMethod = ref(null); // 'webshare' | 'download' | null

  /**
   * Detecta si Web Share API está disponible
   */
  const isWebShareSupported = computed(() => {
    return typeof navigator !== 'undefined' &&
      navigator.share !== undefined &&
      navigator.canShare !== undefined;
  });

  /**
   * Detecta si es un dispositivo móvil
   */
  const isMobile = computed(() => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  });

  /**
   * Detecta el sistema operativo
   */
  const getOS = () => {
    if (typeof navigator === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    if (userAgent.includes('mac')) return 'macos';
    if (userAgent.includes('win')) return 'windows';
    if (userAgent.includes('linux')) return 'linux';

    return 'unknown';
  };

  /**
   * Comparte un archivo usando Web Share API o descarga directa
   * @param {Blob} blob - Blob de la imagen a compartir
   * @param {Object} options - Opciones de compartir
   * @returns {Promise<boolean>} true si se compartió exitosamente
   */
  const shareImage = async (blob, options = {}) => {
    const {
      fileName = 'comprobante-wala.png',
      title = 'Comprobante',
      text = 'Powered by wala.lat',
      onSuccess = null,
      onError = null
    } = options;

    isSharing.value = true;
    shareError.value = null;
    lastShareMethod.value = null;

    try {
      // Intentar Web Share API primero (preferido en móvil)
      if (isWebShareSupported.value) {
        const file = new File([blob], fileName, { type: 'image/png' });

        // Verificar si se puede compartir este archivo
        const canShareFile = navigator.canShare({ files: [file] });

        if (canShareFile) {
          console.log('📤 Compartiendo vía Web Share API...');

          // Agregar timeout para evitar bloqueos
          const sharePromise = navigator.share({
            files: [file],
            title: title,
            text: text
          });

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout en Web Share API')), 30000); // 30 segundos
          });

          await Promise.race([sharePromise, timeoutPromise]);

          lastShareMethod.value = 'webshare';
          console.log('✅ Compartido exitosamente vía Web Share API');

          if (onSuccess) onSuccess('webshare');
          return true;
        } else {
          console.log('⚠️ No se puede compartir este archivo, usando descarga directa');
        }
      }

      // Fallback: Descarga directa
      console.log('📥 Usando descarga directa como fallback...');
      downloadImage(blob, fileName);

      lastShareMethod.value = 'download';
      console.log('✅ Descarga iniciada');

      if (onSuccess) onSuccess('download');
      return true;

    } catch (error) {
      console.error('❌ Error compartiendo imagen:', error);

      // Si Web Share falló, intentar descarga directa
      if (error.name === 'AbortError') {
        console.log('ℹ️ Usuario canceló el compartir');
        shareError.value = 'Compartir cancelado';
      } else {
        console.log('📥 Intentando descarga directa después del error...');
        try {
          downloadImage(blob, fileName);
          lastShareMethod.value = 'download';

          if (onSuccess) onSuccess('download');
          return true;
        } catch (downloadError) {
          shareError.value = 'Error al compartir/descargar imagen';
          if (onError) onError(downloadError);
          return false;
        }
      }

      if (onError && error.name !== 'AbortError') {
        onError(error);
      }

      return false;

    } finally {
      isSharing.value = false;
    }
  };

  /**
   * Descarga una imagen directamente
   * @param {Blob} blob - Blob de la imagen
   * @param {string} fileName - Nombre del archivo
   */
  const downloadImage = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Limpiar
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  /**
   * Comparte texto simple (sin archivo)
   * @param {Object} options - Opciones de compartir
   * @returns {Promise<boolean>}
   */
  const shareText = async (options = {}) => {
    const {
      title = '',
      text = '',
      url = '',
      onSuccess = null,
      onError = null
    } = options;

    if (!isWebShareSupported.value) {
      console.warn('⚠️ Web Share API no soportada para texto');
      if (onError) onError(new Error('Web Share no soportado'));
      return false;
    }

    isSharing.value = true;
    shareError.value = null;

    try {
      await navigator.share({ title, text, url });

      lastShareMethod.value = 'webshare';
      console.log('✅ Texto compartido exitosamente');

      if (onSuccess) onSuccess('webshare');
      return true;

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error compartiendo texto:', error);
        shareError.value = error.message;
        if (onError) onError(error);
      }
      return false;

    } finally {
      isSharing.value = false;
    }
  };

  /**
   * Copia imagen al portapapeles (alternativa moderna)
   * @param {Blob} blob - Blob de la imagen
   * @returns {Promise<boolean>}
   */
  const copyImageToClipboard = async (blob) => {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      console.warn('⚠️ Clipboard API no soportada');
      return false;
    }

    try {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);

      console.log('✅ Imagen copiada al portapapeles');
      return true;

    } catch (error) {
      console.error('❌ Error copiando al portapapeles:', error);
      return false;
    }
  };

  /**
   * Obtiene información del método de compartir recomendado
   */
  const getRecommendedShareMethod = computed(() => {
    if (isMobile.value && isWebShareSupported.value) {
      return {
        method: 'webshare',
        label: 'Compartir',
        icon: 'share',
        description: 'Compartir vía apps instaladas'
      };
    }

    return {
      method: 'download',
      label: 'Descargar',
      icon: 'download',
      description: 'Guardar imagen en dispositivo'
    };
  });

  /**
   * Obtiene capacidades del dispositivo
   */
  const getCapabilities = () => {
    return {
      webShare: isWebShareSupported.value,
      clipboard: typeof navigator !== 'undefined' &&
        navigator.clipboard !== undefined,
      download: true, // Siempre disponible
      mobile: isMobile.value,
      os: getOS()
    };
  };

  return {
    // Estado
    isSharing,
    shareError,
    lastShareMethod,

    // Computed
    isWebShareSupported,
    isMobile,
    getRecommendedShareMethod,

    // Métodos principales
    shareImage,
    shareText,
    downloadImage,
    copyImageToClipboard,

    // Utilidades
    getOS,
    getCapabilities
  };
}
