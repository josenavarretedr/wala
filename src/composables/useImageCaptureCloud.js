

/**
 * useImageCaptureCloud.js - Composable para captura de componentes usando Cloud Functions
 * Utiliza Puppeteer server-side para renderizado de alta calidad
 */

import { ref, createApp } from 'vue';
import { getAuth } from 'firebase/auth';
import WatermarkHeader from '@/components/WatermarkHeader.vue';

export function useImageCaptureCloud() {
  const isCapturing = ref(false);
  const captureError = ref(null);
  const progressMessage = ref('');
  const lastCapturedBlob = ref(null);

  /**
   * Captura un elemento del DOM enviando HTML a Cloud Function
   * @param {Ref<HTMLElement>} targetRef - Ref del elemento a capturar
   * @param {Object} options - Opciones de captura
   * @returns {Promise<Blob|null>} Blob de la imagen o null si falla
   */
  const captureElement = async (targetRef, options = {}) => {
    const {
      addWatermarkFlag = true,
      onProgress = null
    } = options;

    isCapturing.value = true;
    captureError.value = null;
    lastCapturedBlob.value = null;
    progressMessage.value = '';

    // 📊 Timing para diagnóstico
    const _t = Date.now();
    const _log = (label) => console.log(`⏱️ [Capture] ${label}: +${Date.now() - _t}ms`);

    let clone = null;
    let watermarkApp = null;

    try {
      // 1. Validar y obtener elemento
      console.log('🔍 Debug targetRef:', {
        targetRef,
        hasValue: !!targetRef?.value,
        value: targetRef?.value,
        isElement: targetRef instanceof HTMLElement
      });

      // Manejar ambos casos: Ref de Vue o elemento DOM directo
      let element;

      if (targetRef instanceof HTMLElement) {
        // Ya es un elemento DOM directo
        element = targetRef;
      } else if (targetRef && 'value' in targetRef) {
        // Es un Ref de Vue
        element = targetRef.value;

        // Esperar un tick si el elemento aún no está montado
        if (!element) {
          await new Promise(resolve => setTimeout(resolve, 100));
          element = targetRef.value;
        }
      } else {
        throw new Error('targetRef debe ser un Ref de Vue o un elemento DOM');
      }

      if (!element) {
        throw new Error('Elemento DOM no encontrado. Asegúrate de que el elemento esté renderizado.');
      }

      // 2. Validar usuario autenticado
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // ⚡ Iniciar obtención del token YA, en paralelo con la preparación del DOM
      //    (getIdToken puede tardar ~200-500ms; lo iniciamos antes de necesitarlo)
      const tokenPromise = currentUser.getIdToken();
      _log('Token iniciado (paralelo)');

      // Progreso: Preparando
      progressMessage.value = 'Preparando imagen...';
      if (onProgress) onProgress('preparing');

      // 3. Clonar elemento
      clone = element.cloneNode(true);

      // 4. Ocultar/eliminar elementos .no-share-item
      const elementsToHide = clone.querySelectorAll('.no-share-item');
      elementsToHide.forEach(el => {
        el.remove(); // Eliminar del clon
      });

      // 5. Montar WatermarkHeader si está habilitado
      if (addWatermarkFlag) {
        const watermarkContainer = document.createElement('div');
        watermarkApp = createApp(WatermarkHeader);
        watermarkApp.mount(watermarkContainer);
        clone.prepend(watermarkContainer.firstChild);
      }

      // 6. Agregar clon al DOM temporal (necesario para calcular dimensiones y estilos)
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '-9999px';
      clone.style.visibility = 'hidden';
      document.body.appendChild(clone);

      // ⚡ Un solo frame para que el layout se recalcule (era setTimeout 100ms)
      await new Promise(resolve => requestAnimationFrame(resolve));

      // 7. Calcular dimensiones con ancho fijo
      // Fijar ancho a 400px para consistencia
      const targetWidth = 400;
      clone.style.width = `${targetWidth}px`;
      clone.style.maxWidth = `${targetWidth}px`;

      // Esperar un frame para que el layout se recalcule
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Ahora medir la altura real del contenido después de aplicar el ancho
      const rect = clone.getBoundingClientRect();
      const width = targetWidth;
      const height = Math.ceil(rect.height);

      console.log('📐 Dimensiones calculadas:', {
        width,
        height,
        contentHeight: rect.height
      });

      // 8. Resetear estilos de posicionamiento temporal
      clone.style.position = 'static';
      clone.style.left = '0';
      clone.style.top = '0';
      clone.style.visibility = 'visible';

      // 9. Convertir imágenes a URLs absolutas
      console.log('🖼️ Convirtiendo imágenes a URLs absolutas...');
      convertImagesToAbsoluteUrls(clone);
      _log('Imágenes convertidas');

      // 10. Extraer HTML (Tailwind se incluirá en Puppeteer)
      const html = clone.outerHTML;

      // Debug: verificar tamaño del HTML
      console.log('📏 HTML Size:', `${(html.length / 1024).toFixed(1)} KB`);
      _log(`HTML extraído (${(html.length / 1024).toFixed(1)} KB)`);

      // 11. Limpiar DOM temporal
      document.body.removeChild(clone);
      if (watermarkApp) {
        watermarkApp.unmount();
      }
      clone = null;
      watermarkApp = null;

      // Progreso: Enviando
      progressMessage.value = 'Enviando al servidor...';
      if (onProgress) onProgress('uploading');

      // 10. Resolver token (ya estaba iniciado en paralelo con la preparación del DOM)
      const idToken = await tokenPromise;
      _log('Token resuelto');

      console.log('🔐 Token obtenido:', {
        hasToken: !!idToken,
        tokenLength: idToken?.length,
        userId: currentUser.uid
      });

      // 11. Llamar a Cloud Function
      const functionUrl = `${import.meta.env.VITE_FUNCTIONS_URL}/renderToImageV2`;

      console.log('🌐 Llamando a Cloud Function:', functionUrl);

      progressMessage.value = 'Dame unos segundos...';
      _log('⏳ Enviando a Cloud Function...');

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          html: html,
          width: width,
          height: height,
          userId: currentUser.uid,
          deviceScaleFactor: 2
        })
      });

      // 12. Validar respuesta
      if (!response.ok) {
        // Manejar errores específicos
        if (response.status === 401) {
          throw new Error('Sesión expirada. Recarga la página.');
        } else if (response.status === 429) {
          throw new Error('Límite diario alcanzado. Intenta mañana.');
        } else if (response.status === 413) {
          throw new Error('La imagen es demasiado grande.');
        } else if (response.status >= 500) {
          throw new Error('Error del servidor. Intenta nuevamente.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al generar la imagen');
      }

      progressMessage.value = 'Afinando detalles...';

      const data = await response.json();
      _log('Respuesta Cloud recibida');

      if (!data.success) {
        throw new Error(data.error || 'Error desconocido al renderizar');
      }

      console.log('✅ Imagen generada:', {
        size: `${(data.fileSize / 1024).toFixed(2)} KB`,
        renderTime: `${data.renderTime}ms`
      });
      _log(`Imagen generada (renderTime server: ${data.renderTime}ms)`);

      // 13. Convertir Data URL a Blob
      progressMessage.value = '¡Listo en breve!';

      const blob = await dataUrlToBlob(data.imageDataUrl);

      if (!blob) {
        throw new Error('Error al convertir imagen');
      }

      lastCapturedBlob.value = blob;

      progressMessage.value = '¡Listo!';
      _log('✅ TOTAL COMPLETO');
      if (onProgress) onProgress('finalizing');

      return blob;

    } catch (error) {
      console.error('❌ Error capturando con Cloud:', error);
      captureError.value = error.message;
      progressMessage.value = '';

      // Manejar errores de red
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        captureError.value = 'Error de conexión. Verifica tu internet.';
      }

      return null;

    } finally {
      // Cleanup
      if (clone && clone.parentNode) {
        document.body.removeChild(clone);
      }
      if (watermarkApp) {
        watermarkApp.unmount();
      }

      isCapturing.value = false;
    }
  };

  /**
   * Convierte Data URL a Blob
   * @param {string} dataUrl - Data URL de la imagen
   * @returns {Promise<Blob|null>}
   */
  const dataUrlToBlob = async (dataUrl) => {
    try {
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error('Error convirtiendo Data URL a Blob:', error);
      return null;
    }
  };

  /**
   * Convierte rutas de imágenes relativas a absolutas
   * @param {HTMLElement} element - Elemento raíz
   */
  const convertImagesToAbsoluteUrls = (element) => {
    const images = element.querySelectorAll('img');
    let imagesProcessed = 0;

    images.forEach(img => {
      const src = img.getAttribute('src');

      // Si ya es absoluta o base64, skip
      if (!src || src.startsWith('data:') || src.startsWith('http')) {
        return;
      }

      // Convertir a URL absoluta
      let absoluteUrl;
      if (src.startsWith('/')) {
        // Ruta relativa desde root
        absoluteUrl = window.location.origin + src;
      } else {
        // Ruta relativa
        absoluteUrl = new URL(src, window.location.href).href;
      }

      img.setAttribute('src', absoluteUrl);
      imagesProcessed++;
    });

    console.log(`✅ ${imagesProcessed} imágenes convertidas a URLs absolutas`);
  };

  /**
   * Convierte todos los estilos computados a inline
   * @param {HTMLElement} element - Elemento raíz
   */
  const inlineStyles = (element) => {
    const allElements = [element, ...element.querySelectorAll('*')];

    let elementsProcessed = 0;

    allElements.forEach(el => {
      const computedStyle = window.getComputedStyle(el);

      // Parsear estilos inline existentes a un objeto
      const existingStyleAttr = el.getAttribute('style') || '';
      const existingStyles = {};

      if (existingStyleAttr) {
        existingStyleAttr.split(';').forEach(rule => {
          const [prop, value] = rule.split(':').map(s => s.trim());
          if (prop && value) {
            existingStyles[prop] = value;
          }
        });
      }

      // Propiedades CSS críticas a capturar
      const criticalProps = [
        // Layout
        'display', 'position', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
        // Espaciado
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        // Borde y fondo
        'border', 'border-width', 'border-style', 'border-color', 'border-radius',
        'border-top', 'border-right', 'border-bottom', 'border-left',
        'background-color', 'background-image', 'background-size', 'background-position',
        // Texto
        'color', 'font-family', 'font-size', 'font-weight', 'line-height',
        'text-align', 'text-decoration', 'text-transform', 'letter-spacing', 'white-space',
        // Flexbox
        'flex', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items',
        'align-self', 'gap', 'flex-grow', 'flex-shrink', 'flex-basis',
        // Grid
        'grid', 'grid-template-columns', 'grid-gap',
        // Otros
        'opacity', 'overflow', 'overflow-x', 'overflow-y', 'box-shadow', 'transform',
        'z-index', 'vertical-align', 'object-fit'
      ];

      // Construir objeto de estilos final
      const finalStyles = { ...existingStyles }; // Empezar con los inline existentes

      criticalProps.forEach(prop => {
        // Si ya existe inline, no sobrescribir
        if (finalStyles[prop]) return;

        const value = computedStyle.getPropertyValue(prop);

        // Filtrar valores por defecto
        const isDefaultValue = !value ||
          value === 'none' ||
          value === 'normal' ||
          value === 'auto' ||
          value === 'rgba(0, 0, 0, 0)' ||
          value === 'transparent' ||
          (value === '0px' && !prop.includes('border') && prop !== 'gap');

        if (!isDefaultValue) {
          finalStyles[prop] = value;
        }
      });

      // Convertir objeto a string CSS
      if (Object.keys(finalStyles).length > 0) {
        const styleString = Object.entries(finalStyles)
          .map(([prop, value]) => `${prop}: ${value}`)
          .join('; ');

        el.setAttribute('style', styleString);
        elementsProcessed++;
      }
    });

    console.log(`✅ Estilos inline aplicados a ${elementsProcessed} elementos`);
  };

  return {
    isCapturing,
    captureError,
    progressMessage,
    lastCapturedBlob,
    captureElement
  };
}
