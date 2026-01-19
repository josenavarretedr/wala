/**
 * useImageCapture.js - Composable para captura de componentes como imagen
 * Utiliza html2canvas para generar imágenes de alta calidad
 */

import { ref, createApp } from 'vue';
import html2canvas from 'html2canvas';
import {
  canvasToBlob,
  optimizeCanvas,
  prepareElementForCapture
} from '@/utils/imageProcessor';
import WatermarkFooter from '@/components/WatermarkFooter.vue';
import WatermarkHeader from '@/components/WatermarkHeader.vue';

export function useImageCapture() {
  const isCapturing = ref(false);
  const captureError = ref(null);
  const lastCapturedBlob = ref(null);

  /**
   * Captura un elemento del DOM como imagen
   * @param {HTMLElement} element - Elemento a capturar
   * @param {Object} options - Opciones de captura
   * @returns {Promise<Blob|null>} Blob de la imagen o null si falla
   */
  const captureElement = async (element, options = {}) => {
    const {
      addWatermarkFlag = true,
      quality = 0.95,
      scale = window.devicePixelRatio || 2, // 2x para mejor calidad en móviles
      backgroundColor = '#ffffff',
      modifications = {},
      onProgress = null,
      foreignObjectRendering = true,         // Mejora renderizado
      letterRendering = true                  // Mejora texto
    } = options;

    isCapturing.value = true;
    captureError.value = null;
    lastCapturedBlob.value = null;

    let revertChanges = null;
    let watermarkElement = null;
    let watermarkApp = null;
    let originalDisplayValues = []; // Para restaurar elementos ocultos

    try {
      // Validar elemento
      if (!element) {
        throw new Error('Elemento a capturar no proporcionado');
      }

      // Notificar progreso: Preparando
      if (onProgress) onProgress('preparing');

      // Ocultar elementos con clase .no-share-item
      const elementsToHide = element.querySelectorAll('.no-share-item');

      elementsToHide.forEach((el, index) => {
        originalDisplayValues[index] = el.style.display;
        el.style.display = 'none';
      });

      // Agregar watermark al DOM si está habilitado
      if (addWatermarkFlag) {
        const watermarkContainer = document.createElement('div');
        watermarkApp = createApp(WatermarkHeader);
        watermarkApp.mount(watermarkContainer);
        watermarkElement = watermarkContainer.firstChild;
        element.prepend(watermarkElement); // Agregar al inicio del elemento
      }

      // Preparar elemento para captura (modificaciones pre-captura)
      if (modifications && Object.keys(modifications).length > 0) {
        revertChanges = prepareElementForCapture(element, modifications);
      }

      // Pequeño delay para que el DOM se actualice
      await new Promise(resolve => setTimeout(resolve, 150));

      // Notificar progreso: Capturando
      if (onProgress) onProgress('capturing');

      // Configuración de html2canvas
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: backgroundColor,
        logging: true, // Activar logs para debug
        imageTimeout: 15000,
        removeContainer: true,
        // NO usar dimensiones explícitas, dejar que html2canvas las calcule
        // Optimizaciones para mejor calidad
        letterRendering: true,
        foreignObjectRendering: false, // Usar false para mayor compatibilidad
        onclone: (clonedDoc) => {
          // Asegurar que las fuentes se carguen correctamente
          const clonedElement = clonedDoc.querySelector('[data-html2canvas-clone]');
          if (clonedElement) {
            clonedElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';

            // Forzar estilos de flexbox para badges y elementos con justify-center
            const flexElements = clonedElement.querySelectorAll('.flex, [class*="justify-"]');
            flexElements.forEach(el => {
              // Asegurar que flex se aplique correctamente
              if (el.classList.contains('flex')) {
                el.style.display = 'flex';
              }
              // Forzar justify-center
              if (el.classList.contains('justify-center')) {
                el.style.justifyContent = 'center';
              }
              // Forzar justify-left o justify-start
              if (el.classList.contains('justify-left') || el.classList.contains('justify-start')) {
                el.style.justifyContent = 'flex-start';
              }
              // Forzar items-center
              if (el.classList.contains('items-center')) {
                el.style.alignItems = 'center';
              }
              // Forzar gap
              if (el.classList.contains('gap-1')) el.style.gap = '0.25rem';
              if (el.classList.contains('gap-1.5')) el.style.gap = '0.375rem';
              if (el.classList.contains('gap-2')) el.style.gap = '0.5rem';
              if (el.classList.contains('gap-3')) el.style.gap = '0.75rem';
              if (el.classList.contains('gap-4')) el.style.gap = '1rem';
            });

            // Forzar estilos de badges y elementos redondeados
            const roundedElements = clonedElement.querySelectorAll('[class*="rounded"]');
            roundedElements.forEach(el => {
              if (el.classList.contains('rounded-full')) {
                el.style.borderRadius = '9999px';
              }
              if (el.classList.contains('rounded-xl')) {
                el.style.borderRadius = '0.75rem';
              }
              if (el.classList.contains('rounded-lg')) {
                el.style.borderRadius = '0.5rem';
              }
            });

            // Forzar truncate para textos
            const truncateElements = clonedElement.querySelectorAll('.truncate');
            truncateElements.forEach(el => {
              el.style.overflow = 'hidden';
              el.style.textOverflow = 'ellipsis';
              el.style.whiteSpace = 'nowrap';
            });
          }
        }
      });

      console.log('✅ Captura completada:', {
        width: canvas.width,
        height: canvas.height
      });

      // Notificar progreso: Procesando
      if (onProgress) onProgress('processing');

      // Optimizar tamaño si es necesario
      const processedCanvas = optimizeCanvas(canvas);

      // Notificar progreso: Finalizando
      if (onProgress) onProgress('finalizing');

      // Convertir a blob
      const blob = await canvasToBlob(processedCanvas, quality);

      console.log('✅ Imagen generada:', {
        size: `${(blob.size / 1024).toFixed(2)} KB`,
        type: blob.type
      });

      lastCapturedBlob.value = blob;
      return blob;

    } catch (error) {
      console.error('❌ Error capturando elemento:', error);
      captureError.value = error.message || 'Error desconocido al capturar imagen';
      return null;

    } finally {
      // Restaurar elementos ocultos con .no-share-item
      const elementsToHide = element.querySelectorAll('.no-share-item');
      elementsToHide.forEach((el, index) => {
        if (originalDisplayValues && originalDisplayValues[index] !== undefined) {
          el.style.display = originalDisplayValues[index];
        } else {
          el.style.display = ''; // Restaurar al valor por defecto
        }
      });

      // Remover watermark del DOM y desmontar la app de Vue
      if (watermarkElement && element.contains(watermarkElement)) {
        element.removeChild(watermarkElement);
      }
      if (watermarkApp) {
        watermarkApp.unmount();
      }

      // Revertir modificaciones si existen
      if (revertChanges) {
        await new Promise(resolve => setTimeout(resolve, 100));
        revertChanges();
      }

      isCapturing.value = false;
    }
  };

  /**
   * Captura múltiples elementos y los combina en una imagen
   * @param {HTMLElement[]} elements - Array de elementos a capturar
   * @param {Object} options - Opciones de captura
   * @returns {Promise<Blob|null>}
   */
  const captureMultipleElements = async (elements, options = {}) => {
    isCapturing.value = true;
    captureError.value = null;

    try {
      const canvases = [];

      // Capturar cada elemento
      for (const element of elements) {
        const canvas = await html2canvas(element, {
          scale: options.scale || 2,
          useCORS: true,
          backgroundColor: options.backgroundColor || '#ffffff',
          logging: false
        });
        canvases.push(canvas);
      }

      // Calcular dimensiones totales
      const totalHeight = canvases.reduce((sum, c) => sum + c.height, 0);
      const maxWidth = Math.max(...canvases.map(c => c.width));

      // Crear canvas combinado
      const combinedCanvas = document.createElement('canvas');
      const ctx = combinedCanvas.getContext('2d');
      combinedCanvas.width = maxWidth;
      combinedCanvas.height = totalHeight;

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

      // Dibujar cada canvas
      let currentY = 0;
      canvases.forEach(canvas => {
        ctx.drawImage(canvas, 0, currentY);
        currentY += canvas.height;
      });

      // Agregar marca de agua
      const processedCanvas = await addWatermark(combinedCanvas, options.watermarkPosition);

      // Convertir a blob
      const blob = await canvasToBlob(processedCanvas, options.quality || 0.95);

      lastCapturedBlob.value = blob;
      return blob;

    } catch (error) {
      console.error('❌ Error capturando múltiples elementos:', error);
      captureError.value = error.message;
      return null;

    } finally {
      isCapturing.value = false;
    }
  };

  /**
   * Captura pantalla completa
   * @param {Object} options - Opciones de captura
   * @returns {Promise<Blob|null>}
   */
  const captureFullScreen = async (options = {}) => {
    const element = document.body;
    return captureElement(element, {
      ...options,
      scale: 1 // Escala menor para pantalla completa
    });
  };

  /**
   * Limpia el último blob capturado (libera memoria)
   */
  const clearLastCapture = () => {
    if (lastCapturedBlob.value) {
      URL.revokeObjectURL(lastCapturedBlob.value);
      lastCapturedBlob.value = null;
    }
  };

  /**
   * Obtiene estadísticas de la última captura
   * @returns {Object|null}
   */
  const getLastCaptureStats = () => {
    if (!lastCapturedBlob.value) return null;

    return {
      size: lastCapturedBlob.value.size,
      sizeKB: (lastCapturedBlob.value.size / 1024).toFixed(2),
      sizeMB: (lastCapturedBlob.value.size / 1024 / 1024).toFixed(2),
      type: lastCapturedBlob.value.type,
      timestamp: new Date().toISOString()
    };
  };

  return {
    // Estado
    isCapturing,
    captureError,
    lastCapturedBlob,

    // Métodos principales
    captureElement,
    captureMultipleElements,
    captureFullScreen,

    // Utilidades
    clearLastCapture,
    getLastCaptureStats
  };
}
