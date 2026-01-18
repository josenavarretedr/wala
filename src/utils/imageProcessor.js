/**
 * imageProcessor.js - Utilidades para procesamiento de imágenes
 * Maneja la manipulación de canvas y adición de marca de agua
 */

/**
 * Agrega marca de agua "Powered by wala.lat" al canvas
 * @param {HTMLCanvasElement} canvas - Canvas original
 * @param {string} position - Posición de la marca de agua ('bottom' | 'top')
 * @returns {Promise<HTMLCanvasElement>} Canvas con marca de agua
 */
export async function addWatermark(canvas, position = 'bottom') {
  try {
    // Crear nuevo canvas con espacio para la marca de agua
    const watermarkHeight = 60; // Altura del footer con marca (reducida para layout horizontal)
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');

    // Establecer dimensiones del canvas final
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height + watermarkHeight;

    // Fondo blanco para todo el canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Dibujar el contenido original
    if (position === 'bottom') {
      ctx.drawImage(canvas, 0, 0);
    } else {
      ctx.drawImage(canvas, 0, watermarkHeight);
    }

    // Calcular posición Y de la marca de agua
    const watermarkY = position === 'bottom' ? canvas.height : 0;

    // Dibujar línea divisoria sutil
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, watermarkY + (position === 'bottom' ? 8 : watermarkHeight - 8));
    ctx.lineTo(finalCanvas.width - 32, watermarkY + (position === 'bottom' ? 8 : watermarkHeight - 8));
    ctx.stroke();

    // Cargar logo
    const logoImg = await loadImage('/logoWala2.png');
    const logoSize = 24;

    // Configurar texto para calcular dimensiones
    ctx.font = '500 14px system-ui, -apple-system, sans-serif';
    const poweredByText = 'Powered by';
    const textWidth = ctx.measureText(poweredByText).width;

    // Calcular posición para centrar todo el bloque (texto + logo)
    const totalWidth = textWidth + 8 + logoSize; // texto + gap + logo
    const startX = 32; // Alineado a la izquierda con padding
    const centerY = watermarkY + (watermarkHeight / 2) + 4;

    // Dibujar texto "Powered by"
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(poweredByText, startX, centerY);

    // Dibujar logo a la derecha del texto
    const logoX = startX + textWidth + 8;
    const logoY = centerY - (logoSize / 2);
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

    return finalCanvas;
  } catch (error) {
    console.error('❌ Error agregando marca de agua:', error);
    // En caso de error, retornar el canvas original
    return canvas;
  }
}

/**
 * Carga una imagen desde una URL
 * @param {string} url - URL de la imagen
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (error) => {
      console.error('❌ Error cargando imagen:', url, error);
      reject(error);
    };

    img.src = url;
  });
}

/**
 * Convierte canvas a blob PNG optimizado
 * @param {HTMLCanvasElement} canvas - Canvas a convertir
 * @param {number} quality - Calidad de compresión (0-1)
 * @returns {Promise<Blob>}
 */
export async function canvasToBlob(canvas, quality = 0.95) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Error convirtiendo canvas a blob'));
        }
      },
      'image/png',
      quality
    );
  });
}

/**
 * Convierte blob a URL de datos
 * @param {Blob} blob - Blob a convertir
 * @returns {Promise<string>}
 */
export async function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Optimiza el tamaño de la imagen si es necesario
 * @param {HTMLCanvasElement} canvas - Canvas a optimizar
 * @param {number} maxWidth - Ancho máximo
 * @param {number} maxHeight - Alto máximo
 * @returns {HTMLCanvasElement}
 */
export function optimizeCanvas(canvas, maxWidth = 1200, maxHeight = 2000) {
  const width = canvas.width;
  const height = canvas.height;

  // Si ya está dentro de los límites, retornar original
  if (width <= maxWidth && height <= maxHeight) {
    return canvas;
  }

  // Calcular nueva escala manteniendo aspect ratio
  const scale = Math.min(maxWidth / width, maxHeight / height);

  const optimizedCanvas = document.createElement('canvas');
  const ctx = optimizedCanvas.getContext('2d');

  optimizedCanvas.width = width * scale;
  optimizedCanvas.height = height * scale;

  // Usar algoritmo de alta calidad para redimensionar
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, optimizedCanvas.width, optimizedCanvas.height);

  return optimizedCanvas;
}

/**
 * Prepara elemento para captura (oculta/muestra elementos)
 * @param {HTMLElement} element - Elemento a preparar
 * @param {Object} modifications - Modificaciones a aplicar
 * @returns {Function} Función para revertir cambios
 */
export function prepareElementForCapture(element, modifications = {}) {
  const {
    hideElements = [],
    showElements = [],
    styleChanges = {}
  } = modifications;

  // Guardar estados originales
  const originalStates = {
    hidden: [],
    shown: [],
    styles: []
  };

  // Ocultar elementos
  hideElements.forEach(selector => {
    const els = element.querySelectorAll(selector);
    els.forEach(el => {
      originalStates.hidden.push({
        element: el,
        display: el.style.display
      });
      el.style.display = 'none';
    });
  });

  // Mostrar elementos
  showElements.forEach(selector => {
    const els = element.querySelectorAll(selector);
    els.forEach(el => {
      originalStates.shown.push({
        element: el,
        display: el.style.display
      });
      el.style.display = 'block';
    });
  });

  // Aplicar cambios de estilo
  Object.entries(styleChanges).forEach(([selector, styles]) => {
    const els = element.querySelectorAll(selector);
    els.forEach(el => {
      const originalStyles = {};
      Object.keys(styles).forEach(prop => {
        originalStyles[prop] = el.style[prop];
        el.style[prop] = styles[prop];
      });
      originalStates.styles.push({
        element: el,
        styles: originalStyles
      });
    });
  });

  // Retornar función para revertir cambios
  return () => {
    originalStates.hidden.forEach(({ element, display }) => {
      element.style.display = display;
    });
    originalStates.shown.forEach(({ element, display }) => {
      element.style.display = display;
    });
    originalStates.styles.forEach(({ element, styles }) => {
      Object.entries(styles).forEach(([prop, value]) => {
        element.style[prop] = value;
      });
    });
  };
}
